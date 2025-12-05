/**
 * Performance Monitoring Interceptor
 * Sprint 15 - US-073: Performance Optimization
 * Sprint 20 - US-DB-023: Enhanced with performance config
 *
 * Measures and logs request/response times for performance analysis.
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GqlExecutionContext } from '@nestjs/graphql';
import {
  getPerformanceConfig,
  PerformanceThresholds,
} from '../../config/performance.config';

export interface PerformanceMetrics {
  operationType: string;
  operationName: string;
  duration: number;
  timestamp: Date;
  slow: boolean;
  verySlow: boolean;
  memoryUsageMB?: number;
}

const config = getPerformanceConfig();

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const contextType = context.getType<'http' | 'graphql'>();

    let operationType = 'unknown';
    let operationName = 'unknown';

    if (contextType === 'graphql') {
      const gqlContext = GqlExecutionContext.create(context);
      const info = gqlContext.getInfo();
      operationType = info.parentType?.name ?? 'GraphQL';
      operationName = info.fieldName ?? 'unknown';
    } else {
      const request = context.switchToHttp().getRequest();
      operationType = request?.method ?? 'HTTP';
      operationName = request?.url ?? 'unknown';
    }

    return next.handle().pipe(
      tap({
        next: () => {
          this.logMetrics(operationType, operationName, startTime);
        },
        error: () => {
          this.logMetrics(operationType, operationName, startTime, true);
        },
      }),
    );
  }

  private logMetrics(
    operationType: string,
    operationName: string,
    startTime: number,
    isError = false,
  ): void {
    const duration = Date.now() - startTime;
    const isSlow = duration > PerformanceThresholds.SLOW_QUERY;
    const isVerySlow = duration > PerformanceThresholds.VERY_SLOW_QUERY;

    // Get memory usage
    const memUsage = process.memoryUsage();
    const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);

    const metrics: PerformanceMetrics = {
      operationType,
      operationName,
      duration,
      timestamp: new Date(),
      slow: isSlow,
      verySlow: isVerySlow,
      memoryUsageMB,
    };

    // Check for high memory usage
    if (memoryUsageMB > PerformanceThresholds.HIGH_MEMORY_USAGE_MB) {
      this.logger.warn(
        `HIGH MEMORY: ${memoryUsageMB}MB during ${operationType}.${operationName}`,
      );
    }

    if (isVerySlow) {
      this.logger.error(
        `VERY SLOW ${operationType}.${operationName}: ${duration}ms (threshold: ${PerformanceThresholds.VERY_SLOW_QUERY}ms)`,
        metrics,
      );
    } else if (isSlow) {
      this.logger.warn(
        `SLOW ${operationType}.${operationName}: ${duration}ms (threshold: ${PerformanceThresholds.SLOW_QUERY}ms)`,
        metrics,
      );
    } else if (isError) {
      this.logger.debug(
        `ERROR ${operationType}.${operationName}: ${duration}ms`,
        metrics,
      );
    } else if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(
        `${operationType}.${operationName}: ${duration}ms`,
        metrics,
      );
    }
  }
}
