/**
 * GraphQL-aware Throttler Guard
 * Sprint 15 - US-072: Security Hardening
 *
 * Custom throttler guard that properly handles GraphQL contexts
 * and gracefully handles missing request objects.
 */

import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  /**
   * Get the request object from the execution context.
   * Handles both REST and GraphQL contexts.
   */
  getRequestResponse(context: ExecutionContext) {
    const contextType = context.getType<string>();

    if (contextType === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      const ctx = gqlCtx.getContext();
      return { req: ctx.req, res: ctx.res };
    }

    // Fallback for HTTP context
    const httpContext = context.switchToHttp();
    return {
      req: httpContext.getRequest(),
      res: httpContext.getResponse(),
    };
  }

  /**
   * Get the tracker (usually client IP) for rate limiting.
   * Handles cases where req might be undefined or ip is missing.
   */
  async getTracker(req: Record<string, any>): Promise<string> {
    if (!req) {
      return 'unknown';
    }

    // Try various ways to get the client IP
    return (
      req.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers?.['x-real-ip'] ||
      req.ip ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Determine if the request should skip throttling.
   * Skip if there's no proper request context.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const { req } = this.getRequestResponse(context);

      // Skip throttling if no request context
      if (!req) {
        return true;
      }

      return super.canActivate(context);
    } catch {
      // If anything goes wrong with throttle check, allow the request
      return true;
    }
  }
}
