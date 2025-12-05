/**
 * Metrics Service
 * Sprint 15 - US-076: Monitoring & Alerting
 *
 * Provides methods to record application metrics.
 */

import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('graphql_queries_total')
    private readonly graphqlQueriesTotal: Counter<string>,
    @InjectMetric('graphql_query_duration_seconds')
    private readonly graphqlQueryDuration: Histogram<string>,
    @InjectMetric('database_query_duration_seconds')
    private readonly databaseQueryDuration: Histogram<string>,
    @InjectMetric('database_connections_active')
    private readonly databaseConnectionsActive: Gauge<string>,
    @InjectMetric('cache_hits_total')
    private readonly cacheHitsTotal: Counter<string>,
    @InjectMetric('cache_misses_total')
    private readonly cacheMissesTotal: Counter<string>,
    @InjectMetric('queue_jobs_waiting')
    private readonly queueJobsWaiting: Gauge<string>,
    @InjectMetric('queue_jobs_active')
    private readonly queueJobsActive: Gauge<string>,
    @InjectMetric('documents_uploaded_total')
    private readonly documentsUploadedTotal: Counter<string>,
    @InjectMetric('search_queries_total')
    private readonly searchQueriesTotal: Counter<string>,
  ) {}

  // HTTP Metrics
  recordHttpRequest(method: string, path: string, status: number): void {
    this.httpRequestsTotal.inc({ method, path, status: String(status) });
  }

  recordHttpDuration(
    method: string,
    path: string,
    status: number,
    duration: number,
  ): void {
    this.httpRequestDuration.observe(
      { method, path, status: String(status) },
      duration,
    );
  }

  // GraphQL Metrics
  recordGraphQLQuery(operation: string, status: 'success' | 'error'): void {
    this.graphqlQueriesTotal.inc({ operation, status });
  }

  recordGraphQLDuration(operation: string, duration: number): void {
    this.graphqlQueryDuration.observe({ operation }, duration);
  }

  // Database Metrics
  recordDatabaseQuery(operation: string, table: string, duration: number): void {
    this.databaseQueryDuration.observe({ operation, table }, duration);
  }

  setDatabaseConnections(count: number): void {
    this.databaseConnectionsActive.set(count);
  }

  // Cache Metrics
  recordCacheHit(cache: string): void {
    this.cacheHitsTotal.inc({ cache });
  }

  recordCacheMiss(cache: string): void {
    this.cacheMissesTotal.inc({ cache });
  }

  // Queue Metrics
  setQueueWaiting(queue: string, count: number): void {
    this.queueJobsWaiting.set({ queue }, count);
  }

  setQueueActive(queue: string, count: number): void {
    this.queueJobsActive.set({ queue }, count);
  }

  // Business Metrics
  recordDocumentUpload(type: string): void {
    this.documentsUploadedTotal.inc({ type });
  }

  recordSearchQuery(type: string): void {
    this.searchQueriesTotal.inc({ type });
  }
}
