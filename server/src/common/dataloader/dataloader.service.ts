/**
 * DataLoader Service
 * Sprint 15 - US-073: Performance Optimization
 *
 * Creates and manages DataLoaders for batching database queries.
 * Prevents N+1 query problems in GraphQL resolvers.
 */

import { Injectable, Logger } from '@nestjs/common';
import DataLoader from 'dataloader';
import { Repository, In, ObjectLiteral } from 'typeorm';

export interface DataLoaderOptions<K, V> {
  /** Batch function to load multiple items */
  batchFn: (keys: readonly K[]) => Promise<(V | Error)[]>;
  /** Maximum batch size (default: 100) */
  maxBatchSize?: number;
  /** Enable caching (default: true) */
  cache?: boolean;
}

@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);
  private readonly loaders = new Map<string, DataLoader<any, any>>();

  /**
   * Create a new DataLoader with the given options
   */
  createLoader<K, V>(
    name: string,
    options: DataLoaderOptions<K, V>,
  ): DataLoader<K, V> {
    const loader = new DataLoader<K, V>(options.batchFn, {
      maxBatchSize: options.maxBatchSize ?? 100,
      cache: options.cache ?? true,
    });

    this.loaders.set(name, loader);
    return loader;
  }

  /**
   * Get an existing loader by name
   */
  getLoader<K, V>(name: string): DataLoader<K, V> | undefined {
    return this.loaders.get(name);
  }

  /**
   * Create a DataLoader for a TypeORM repository
   * Automatically handles batching by ID
   */
  createRepositoryLoader<T extends { id: string }>(
    name: string,
    repository: Repository<T>,
    options?: {
      maxBatchSize?: number;
      relations?: string[];
    },
  ): DataLoader<string, T | null> {
    return this.createLoader<string, T | null>(name, {
      batchFn: async (ids: readonly string[]) => {
        this.logger.debug(`Batch loading ${ids.length} items for ${name}`);

        const items = await repository.find({
          where: { id: In([...ids]) } as any,
          relations: options?.relations,
        });

        // Map items back to the order of requested IDs
        const itemMap = new Map(items.map((item) => [item.id, item]));
        return ids.map((id) => itemMap.get(id) ?? null);
      },
      maxBatchSize: options?.maxBatchSize ?? 100,
    });
  }

  /**
   * Create a DataLoader for loading related entities
   * Useful for one-to-many relationships
   */
  createRelationLoader<T extends ObjectLiteral>(
    name: string,
    repository: Repository<T>,
    foreignKey: keyof T,
    options?: {
      maxBatchSize?: number;
      relations?: string[];
      orderBy?: { field: keyof T; direction: 'ASC' | 'DESC' };
    },
  ): DataLoader<string, T[]> {
    return this.createLoader<string, T[]>(name, {
      batchFn: async (parentIds: readonly string[]) => {
        this.logger.debug(
          `Batch loading relations for ${parentIds.length} parents in ${name}`,
        );

        const queryBuilder = repository
          .createQueryBuilder('entity')
          .where(`entity.${String(foreignKey)} IN (:...parentIds)`, {
            parentIds: [...parentIds],
          });

        if (options?.relations) {
          options.relations.forEach((relation) => {
            queryBuilder.leftJoinAndSelect(`entity.${relation}`, relation);
          });
        }

        if (options?.orderBy) {
          queryBuilder.orderBy(
            `entity.${String(options.orderBy.field)}`,
            options.orderBy.direction,
          );
        }

        const items = await queryBuilder.getMany();

        // Group items by parent ID
        const grouped = new Map<string, T[]>();
        parentIds.forEach((id) => grouped.set(id, []));

        items.forEach((item) => {
          const parentId = String(item[foreignKey]);
          const group = grouped.get(parentId);
          if (group) {
            group.push(item);
          }
        });

        return parentIds.map((id) => grouped.get(id) ?? []);
      },
      maxBatchSize: options?.maxBatchSize ?? 50,
    });
  }

  /**
   * Clear all cached data from all loaders
   */
  clearAll(): void {
    for (const loader of this.loaders.values()) {
      loader.clearAll();
    }
    this.logger.debug('Cleared all DataLoader caches');
  }

  /**
   * Clear a specific loader's cache
   */
  clearLoader(name: string): void {
    const loader = this.loaders.get(name);
    if (loader) {
      loader.clearAll();
      this.logger.debug(`Cleared DataLoader cache: ${name}`);
    }
  }

  /**
   * Prime a loader with data (useful for warming cache)
   */
  primeLoader<K, V>(name: string, key: K, value: V): void {
    const loader = this.loaders.get(name);
    if (loader) {
      loader.prime(key, value);
    }
  }
}
