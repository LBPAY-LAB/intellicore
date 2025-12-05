/**
 * Cache Service
 * Sprint 15 - US-073: Performance Optimization
 *
 * High-level caching utilities with pattern-based invalidation.
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[]; // Tags for grouped invalidation
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  // Track tags -> keys mapping for pattern invalidation
  private tagKeys = new Map<string, Set<string>>();

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | undefined> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.warn(`Cache get error for key ${key}: ${error.message}`);
      return undefined;
    }
  }

  /**
   * Set value in cache with optional TTL
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl ?? 300; // Default 5 minutes
      await this.cacheManager.set(key, value, ttl * 1000);

      // Track tags
      if (options?.tags) {
        for (const tag of options.tags) {
          if (!this.tagKeys.has(tag)) {
            this.tagKeys.set(tag, new Set());
          }
          this.tagKeys.get(tag)!.add(key);
        }
      }
    } catch (error) {
      this.logger.warn(`Cache set error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Delete a specific key from cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);

      // Remove from tag tracking
      for (const keys of this.tagKeys.values()) {
        keys.delete(key);
      }
    } catch (error) {
      this.logger.warn(`Cache del error for key ${key}: ${error.message}`);
    }
  }

  /**
   * Invalidate all keys with a specific tag
   */
  async invalidateByTag(tag: string): Promise<number> {
    const keys = this.tagKeys.get(tag);
    if (!keys || keys.size === 0) return 0;

    let invalidated = 0;
    for (const key of keys) {
      try {
        await this.cacheManager.del(key);
        invalidated++;
      } catch (error) {
        this.logger.warn(`Failed to invalidate key ${key}: ${error.message}`);
      }
    }

    this.tagKeys.delete(tag);
    this.logger.debug(`Invalidated ${invalidated} keys for tag: ${tag}`);
    return invalidated;
  }

  /**
   * Get or set pattern - fetch from cache or compute if missing
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Generate cache key with prefix
   */
  buildKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  /**
   * Clear all cache (use with caution)
   * Note: Uses store.reset() for cache-manager v5 compatibility
   */
  async reset(): Promise<void> {
    try {
      // cache-manager v5 uses store.reset() instead of cache.reset()
      const store = (this.cacheManager as any).store;
      if (store?.reset) {
        await store.reset();
      } else if ((this.cacheManager as any).reset) {
        await (this.cacheManager as any).reset();
      }
      this.tagKeys.clear();
      this.logger.log('Cache reset complete');
    } catch (error) {
      this.logger.error(`Cache reset failed: ${error.message}`);
    }
  }

  /**
   * Get cache stats (if available)
   */
  async getStats(): Promise<{ keys: number; tags: number }> {
    return {
      keys: Array.from(this.tagKeys.values()).reduce((sum, set) => sum + set.size, 0),
      tags: this.tagKeys.size,
    };
  }
}
