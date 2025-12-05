/**
 * GraphQL Cache Interceptor
 * Sprint 15 - US-073: Performance Optimization
 *
 * Automatically caches GraphQL query responses.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable, of, tap } from 'rxjs';
import { CacheService } from '../cache.service';

export interface CacheableOptions {
  ttl?: number;
  keyPrefix?: string;
  tags?: string[];
}

/**
 * Decorator to mark a resolver as cacheable
 */
export const CACHEABLE_KEY = 'cacheable';
export const Cacheable = (options?: CacheableOptions) =>
  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(CACHEABLE_KEY, options || {}, descriptor.value);
    return descriptor;
  };

@Injectable()
export class GraphQLCacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const gqlContext = GqlExecutionContext.create(context);
    const info = gqlContext.getInfo();

    // Only cache queries, not mutations
    if (info.parentType.name !== 'Query') {
      return next.handle();
    }

    // Check for @Cacheable decorator
    const handler = context.getHandler();
    const cacheOptions = Reflect.getMetadata(CACHEABLE_KEY, handler) as CacheableOptions | undefined;

    if (!cacheOptions) {
      return next.handle();
    }

    // Build cache key from operation and variables
    const args = gqlContext.getArgs();
    const cacheKey = this.buildCacheKey(
      cacheOptions.keyPrefix || info.fieldName,
      args,
    );

    // Try to get from cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached !== undefined) {
      return of(cached);
    }

    // Execute and cache result
    return next.handle().pipe(
      tap(async (result) => {
        await this.cacheService.set(cacheKey, result, {
          ttl: cacheOptions.ttl || 300,
          tags: cacheOptions.tags || [info.fieldName],
        });
      }),
    );
  }

  private buildCacheKey(prefix: string, args: any): string {
    const argsHash = this.hashArgs(args);
    return `gql:${prefix}:${argsHash}`;
  }

  private hashArgs(args: any): string {
    const sorted = JSON.stringify(args, Object.keys(args).sort());
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < sorted.length; i++) {
      const char = sorted.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}
