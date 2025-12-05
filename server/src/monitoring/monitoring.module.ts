/**
 * Monitoring Module
 * Sprint 15 - US-076: Monitoring & Alerting
 *
 * Prometheus metrics, logging, and observability.
 */

import { Module } from '@nestjs/common';
import { PrometheusModule, makeCounterProvider, makeHistogramProvider, makeGaugeProvider } from '@willsoto/nestjs-prometheus';
import { MetricsService } from './metrics.service';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',
      defaultMetrics: {
        enabled: true,
        config: {
          prefix: 'supercore_',
        },
      },
    }),
  ],
  providers: [
    MetricsService,
    // HTTP request metrics
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    }),
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    }),
    // GraphQL metrics
    makeCounterProvider({
      name: 'graphql_queries_total',
      help: 'Total number of GraphQL queries',
      labelNames: ['operation', 'status'],
    }),
    makeHistogramProvider({
      name: 'graphql_query_duration_seconds',
      help: 'GraphQL query duration in seconds',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    }),
    // Database metrics
    makeHistogramProvider({
      name: 'database_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['operation', 'table'],
      buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
    }),
    makeGaugeProvider({
      name: 'database_connections_active',
      help: 'Number of active database connections',
    }),
    // Cache metrics
    makeCounterProvider({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      labelNames: ['cache'],
    }),
    makeCounterProvider({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      labelNames: ['cache'],
    }),
    // Queue metrics
    makeGaugeProvider({
      name: 'queue_jobs_waiting',
      help: 'Number of jobs waiting in queue',
      labelNames: ['queue'],
    }),
    makeGaugeProvider({
      name: 'queue_jobs_active',
      help: 'Number of active jobs in queue',
      labelNames: ['queue'],
    }),
    // Business metrics
    makeCounterProvider({
      name: 'documents_uploaded_total',
      help: 'Total number of documents uploaded',
      labelNames: ['type'],
    }),
    makeCounterProvider({
      name: 'search_queries_total',
      help: 'Total number of search queries',
      labelNames: ['type'],
    }),
  ],
  exports: [MetricsService],
})
export class MonitoringModule {}
