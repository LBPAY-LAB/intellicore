/**
 * Rate Limiting Guard
 * Sprint 20 - US-DB-023: Performance Optimization
 *
 * Implements rate limiting based on performance configuration.
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { getPerformanceConfig } from '../../config/performance.config';

const config = getPerformanceConfig();

// In-memory rate limit tracking (use Redis in production for distributed systems)
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  limit?: number; // Max requests per window
  windowMs?: number; // Time window in milliseconds
  key?: 'ip' | 'user' | 'custom'; // What to rate limit by
}

/**
 * Decorator to set rate limit options on a handler
 */
export function RateLimit(options: RateLimitOptions) {
  return (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(private readonly reflector: Reflector) {
    // Clean up expired entries periodically
    setInterval(() => this.cleanupExpiredEntries(), 60000);
  }

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    // If no rate limit decorator, use default config
    const limit = options?.limit ?? config.rateLimit.maxRequests;
    const windowMs = options?.windowMs ?? config.rateLimit.windowMs;

    // Get client identifier
    const key = this.getClientKey(context, options?.key);
    const now = Date.now();

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      // New window
      entry = { count: 1, windowStart: now };
      rateLimitStore.set(key, entry);
      return true;
    }

    // Check if limit exceeded
    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);

      this.logger.warn(
        `Rate limit exceeded for ${key}: ${entry.count}/${limit} requests`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Increment count
    entry.count++;
    return true;
  }

  private getClientKey(
    context: ExecutionContext,
    keyType?: 'ip' | 'user' | 'custom',
  ): string {
    const contextType = context.getType<'http' | 'graphql'>();

    let request: any;
    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    // Default to IP-based rate limiting
    if (keyType === 'user' && request?.user?.sub) {
      return `user:${request.user.sub}`;
    }

    // Get IP from various headers (for proxied requests)
    const ip =
      request?.headers?.['x-forwarded-for']?.split(',')[0] ||
      request?.headers?.['x-real-ip'] ||
      request?.ip ||
      request?.connection?.remoteAddress ||
      'unknown';

    return `ip:${ip}`;
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const maxAge = config.rateLimit.windowMs * 2; // Keep entries for 2 windows

    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.windowStart > maxAge) {
        rateLimitStore.delete(key);
      }
    }
  }
}

/**
 * AI Assistant specific rate limiter
 */
@Injectable()
export class AIAssistantRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(AIAssistantRateLimitGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const limit = config.rateLimit.aiAssistantMaxPerMinute;
    const windowMs = 60000; // 1 minute

    const key = this.getClientKey(context);
    const now = Date.now();

    let entry = rateLimitStore.get(`ai:${key}`);

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 1, windowStart: now };
      rateLimitStore.set(`ai:${key}`, entry);
      return true;
    }

    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);

      this.logger.warn(
        `AI Assistant rate limit exceeded for ${key}: ${entry.count}/${limit} requests/min`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'AI Assistant rate limit exceeded. Please wait before sending more messages.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    return true;
  }

  private getClientKey(context: ExecutionContext): string {
    const contextType = context.getType<'http' | 'graphql'>();

    let request: any;
    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    return (
      request?.user?.sub ||
      request?.headers?.['x-forwarded-for']?.split(',')[0] ||
      request?.ip ||
      'unknown'
    );
  }
}

/**
 * DICT Validation specific rate limiter
 */
@Injectable()
export class DictValidationRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(DictValidationRateLimitGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const limit = config.rateLimit.dictValidationMaxPerMinute;
    const windowMs = 60000; // 1 minute

    const key = this.getClientKey(context);
    const now = Date.now();

    let entry = rateLimitStore.get(`dict:${key}`);

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 1, windowStart: now };
      rateLimitStore.set(`dict:${key}`, entry);
      return true;
    }

    if (entry.count >= limit) {
      const retryAfter = Math.ceil((entry.windowStart + windowMs - now) / 1000);

      this.logger.warn(
        `DICT Validation rate limit exceeded for ${key}: ${entry.count}/${limit} requests/min`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'DICT Validation rate limit exceeded. Please wait before validating more keys.',
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    return true;
  }

  private getClientKey(context: ExecutionContext): string {
    const contextType = context.getType<'http' | 'graphql'>();

    let request: any;
    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      request = gqlContext.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    return (
      request?.user?.sub ||
      request?.headers?.['x-forwarded-for']?.split(',')[0] ||
      request?.ip ||
      'unknown'
    );
  }
}
