# SuperCore Monitoring Stack

Comprehensive observability setup for the SuperCore platform using Prometheus, Grafana, and structured logging.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SuperCore Application                     │
├─────────────────────────────────────────────────────────────┤
│  Backend (Go)                                               │
│  ├─ Prometheus metrics endpoint (/metrics)                  │
│  ├─ Structured logging (JSON via zap)                       │
│  └─ Business metrics collection                             │
└────────────────┬────────────────────────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────┐  ┌──────────┐  ┌────────────┐
│Prometheus│  │PostgreSQL│  │   Node     │
│         │  │ Exporter │  │  Exporter  │
│ :9090   │  │  :9187   │  │   :9100    │
└────┬────┘  └────┬─────┘  └─────┬──────┘
     │            │              │
     └────────────┼──────────────┘
                  ▼
            ┌───────────┐
            │  Grafana  │
            │   :3001   │
            └───────────┘
                  │
                  ▼
            ┌─────────────┐
            │AlertManager │
            │    :9093    │
            └─────────────┘
```

## Components

### 1. Prometheus (Port 9090)
- **Purpose**: Metrics collection and storage
- **Scrape Interval**: 15s
- **Retention**: 30 days
- **Config**: `/monitoring/prometheus/prometheus.yml`

### 2. Grafana (Port 3001)
- **Purpose**: Metrics visualization and dashboards
- **Credentials**: admin / admin (change in production!)
- **Dashboards**:
  - SuperCore Overview
  - Business Metrics
- **Config**: `/monitoring/grafana/`

### 3. AlertManager (Port 9093)
- **Purpose**: Alert routing and notification
- **Config**: `/monitoring/alertmanager/alertmanager.yml`
- **Notifications**: Slack (configured per environment)

### 4. PostgreSQL Exporter (Port 9187)
- **Purpose**: Database metrics
- **Custom Queries**: `/monitoring/postgres-exporter/queries.yml`

### 5. Node Exporter (Port 9100)
- **Purpose**: System-level metrics (CPU, memory, disk)

## Quick Start

### 1. Start Monitoring Stack

```bash
# Start all monitoring services
docker-compose up -d prometheus grafana alertmanager postgres-exporter node-exporter

# Check status
docker-compose ps

# View logs
docker-compose logs -f grafana
```

### 2. Access Dashboards

- **Grafana**: http://localhost:3001
  - Username: `admin`
  - Password: `admin`

- **Prometheus**: http://localhost:9090
  - Query interface and targets

- **AlertManager**: http://localhost:9093
  - Active alerts and silences

### 3. Install Go Dependencies

```bash
cd backend
go get github.com/prometheus/client_golang/prometheus
go get github.com/prometheus/client_golang/prometheus/promauto
go get github.com/prometheus/client_golang/prometheus/promhttp
go get go.uber.org/zap
```

### 4. Start Backend with Metrics

```bash
cd backend
go run cmd/api/main.go
```

Metrics will be available at: http://localhost:8080/metrics

## Available Metrics

### HTTP Metrics
- `http_requests_total` - Total HTTP requests (by method, endpoint, status)
- `http_request_duration_seconds` - Request latency histogram
- `http_requests_in_flight` - Current active requests

### Database Metrics
- `db_queries_total` - Total database queries (by table, operation)
- `db_query_duration_seconds` - Query duration histogram
- `db_connections_total` - Connection pool stats (idle, in_use, max_open)

### Business Metrics
- `object_definitions_total` - Total object definitions
- `instances_total` - Total instances (by object_type, state)
- `relationships_total` - Total relationships (by type)

### RAG Metrics
- `rag_queries_total` - RAG queries (by layer: sql/graph/vector)
- `rag_query_duration_seconds` - RAG query duration
- `rag_tokens_used_total` - Tokens consumed

### LLM Metrics
- `llm_requests_total` - LLM API requests (by provider, model, status)
- `llm_request_duration_seconds` - LLM request latency
- `llm_tokens_used_total` - Token consumption (by type: prompt/completion)

### Validation Metrics
- `validation_total` - Validations performed (by type, result)
- `validation_duration_seconds` - Validation duration

### State Machine Metrics
- `state_transitions_total` - State transitions (by object_type, from/to state)

### Cache Metrics
- `cache_hits_total` - Cache hits (by key prefix)
- `cache_misses_total` - Cache misses
- `cache_operation_duration_seconds` - Cache operation duration

### Error Metrics
- `errors_total` - Error occurrences (by type, component)

## Custom Dashboards

### SuperCore Overview Dashboard
Located at: `/monitoring/grafana/dashboards/supercore-overview.json`

**Panels**:
1. HTTP Requests per Second
2. HTTP Request Duration (p95)
3. Error Rate (4xx, 5xx)
4. Database Query Duration (p99)
5. Cache Hit Rate
6. Object Definitions Count
7. Total Instances
8. Requests In Flight
9. Instances by Object Type
10. RAG Query Duration by Layer
11. Database Connection Pool
12. LLM Token Usage

### Business Metrics Dashboard
Located at: `/monitoring/grafana/dashboards/business-metrics.json`

**Panels**:
1. Instances by State (pie chart)
2. Relationships by Type (bar gauge)
3. State Transitions per Minute
4. Validation Success Rate
5. Validations per Second
6. Average Validation Duration
7. RAG Queries by Layer
8. LLM Request Success Rate
9. Top 10 Most Active Object Types

## Alert Rules

### Critical Alerts (immediate action required)
- **APIDown**: Backend API not responding
- **DatabaseDown**: PostgreSQL not accessible
- **HighErrorRate**: Error rate > 5% for 5 minutes
- **DatabaseConnectionPoolExhausted**: > 80% connections used
- **DiskSpaceRunningOut**: < 20% disk space available

### Warning Alerts (attention needed)
- **APIHighLatency**: p95 latency > 500ms for 10 minutes
- **DatabaseSlowQueries**: Average query duration > 1s
- **LowCacheHitRate**: Cache hit rate < 50%
- **HighCPUUsage**: CPU usage > 80% for 10 minutes
- **HighMemoryUsage**: Memory usage > 85%

### SLO Alerts (business impact)
- **ErrorBudgetBurnRateFast**: Fast error budget burn (99.9% SLO at risk)
- **ErrorBudgetBurnRateSlow**: Slow error budget burn

### Cost Alerts
- **HighLLMTokenUsage**: High token consumption (cost monitoring)

## AlertManager Configuration

### Slack Integration

Edit `/monitoring/alertmanager/alertmanager.yml`:

```yaml
global:
  slack_api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
```

### PagerDuty Integration

Add to receivers in `alertmanager.yml`:

```yaml
receivers:
  - name: 'critical-alerts'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'
```

## Structured Logging

### Log Levels
- **DEBUG**: Detailed debugging information
- **INFO**: General informational messages
- **WARN**: Warning messages (degraded functionality)
- **ERROR**: Error messages (operation failed)
- **FATAL**: Critical errors (application cannot continue)

### Log Format (JSON)

```json
{
  "timestamp": "2024-12-10T10:30:45.123Z",
  "level": "info",
  "message": "Request completed",
  "method": "GET",
  "path": "/api/v1/instances",
  "status": 200,
  "duration": "0.123s",
  "client_ip": "192.168.1.100"
}
```

### Using Logger in Code

```go
import (
    "github.com/lbpay/supercore/internal/logger"
    "go.uber.org/zap"
)

// Info
logger.Info("Operation completed",
    zap.String("operation", "create_instance"),
    zap.String("object_type", "cliente_pf"))

// Error
logger.Error("Failed to connect to database",
    zap.Error(err),
    zap.String("host", dbHost))

// With component context
componentLogger := logger.WithComponent("rag-service")
componentLogger.Info("Query executed", zap.Duration("duration", duration))
```

## Recording Custom Metrics

### In Handlers

```go
import (
    "github.com/lbpay/supercore/internal/metrics"
)

// Record database query
start := time.Now()
// ... execute query ...
metrics.RecordDBQuery("instances", "SELECT", time.Since(start))

// Record cache operation
if cached {
    metrics.RecordCacheHit("object_definition")
} else {
    metrics.RecordCacheMiss("object_definition")
}

// Record RAG query
start := time.Now()
// ... execute RAG query ...
metrics.RecordRAGQuery("sql", "success", time.Since(start))

// Record validation
start := time.Now()
// ... perform validation ...
metrics.RecordValidation("schema", "success", time.Since(start))

// Record state transition
metrics.RecordStateTransition("cliente_pf", "PENDING", "ACTIVE", "success")

// Record error
metrics.RecordError("validation_failed", "instance_handler")
```

## PostgreSQL Custom Queries

Located at: `/monitoring/postgres-exporter/queries.yml`

Custom business metrics collected from PostgreSQL:
- Object definitions (active/inactive counts)
- Instances by type and state
- Relationships by type
- Table sizes and index usage
- Instance creation rates (hourly, daily, weekly)
- Validation rules usage
- Long-running queries
- Database locks

## Monitoring Best Practices

### 1. Dashboard Design
- ✅ Group related metrics
- ✅ Use appropriate visualization types
- ✅ Set meaningful thresholds
- ✅ Include time ranges and filters
- ❌ Don't overcrowd dashboards

### 2. Alert Configuration
- ✅ Alert on symptoms, not causes
- ✅ Set appropriate thresholds
- ✅ Avoid alert fatigue
- ✅ Include runbook links
- ❌ Don't alert on temporary spikes

### 3. Metric Naming
- ✅ Use snake_case
- ✅ Include units in name (`_seconds`, `_bytes`, `_total`)
- ✅ Use consistent suffixes (`_total`, `_count`, `_duration`)
- ❌ Don't use high-cardinality labels

### 4. Logging
- ✅ Use structured logging (JSON)
- ✅ Include context (request_id, user_id)
- ✅ Log at appropriate levels
- ✅ Sanitize sensitive data
- ❌ Don't log passwords or tokens

## Troubleshooting

### Prometheus Not Scraping Targets

```bash
# Check Prometheus targets
open http://localhost:9090/targets

# Check backend metrics endpoint
curl http://localhost:8080/metrics

# Check Prometheus logs
docker-compose logs prometheus
```

### Grafana Dashboards Not Loading

```bash
# Check Grafana logs
docker-compose logs grafana

# Verify datasource
curl http://localhost:3001/api/datasources

# Restart Grafana
docker-compose restart grafana
```

### High Memory Usage

```bash
# Check Prometheus storage
docker exec supercore-prometheus du -sh /prometheus

# Reduce retention period
# Edit prometheus.yml: --storage.tsdb.retention.time=15d

# Restart Prometheus
docker-compose restart prometheus
```

### Missing Metrics

```bash
# Verify metric is registered
curl http://localhost:8080/metrics | grep metric_name

# Check for errors in logs
docker-compose logs backend | grep ERROR

# Verify metric is scraped
# Prometheus UI: http://localhost:9090/graph
# Query: metric_name
```

## Production Considerations

### 1. Security
- [ ] Change default Grafana credentials
- [ ] Enable HTTPS for Grafana
- [ ] Secure Prometheus with authentication
- [ ] Use secrets management for API keys
- [ ] Restrict network access (firewall rules)

### 2. High Availability
- [ ] Run multiple Prometheus instances
- [ ] Use Thanos for long-term storage
- [ ] Configure Grafana HA
- [ ] Setup AlertManager clustering

### 3. Performance
- [ ] Tune scrape intervals
- [ ] Optimize query performance
- [ ] Use recording rules for expensive queries
- [ ] Archive old metrics

### 4. Compliance
- [ ] Log retention policies
- [ ] PII data handling
- [ ] Audit trail requirements
- [ ] Data residency rules

## Cost Optimization

### Reduce Metrics Storage
```yaml
# Shorter retention
--storage.tsdb.retention.time=15d

# Drop unnecessary metrics
metric_relabel_configs:
  - source_labels: [__name__]
    regex: 'go_gc_.*'
    action: drop
```

### Reduce Scrape Frequency
```yaml
# Less frequent scraping for non-critical metrics
scrape_configs:
  - job_name: 'node-exporter'
    scrape_interval: 60s  # Instead of 15s
```

### Use Recording Rules
```yaml
# Pre-aggregate expensive queries
groups:
  - name: aggregated_metrics
    interval: 30s
    rules:
      - record: job:http_requests:rate5m
        expr: rate(http_requests_total[5m])
```

## Useful PromQL Queries

```promql
# Request rate by endpoint
rate(http_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate percentage
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) * 100

# Top 5 slowest endpoints
topk(5, histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m])))

# Cache hit ratio
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))

# Database connection pool usage
db_connections_total{state="in_use"} / db_connections_total{state="max_open"} * 100

# LLM cost estimation (tokens per hour)
rate(llm_tokens_used_total[1h]) * 3600
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs <service>`
2. Review documentation: `/docs/`
3. Open GitHub issue

## License

Internal use only - SuperCore Platform
