# SuperCore Monitoring - Quick Reference Card

## 🚀 Quick Start

```bash
# Start everything
cd monitoring && ./setup.sh

# Or manually
docker-compose up -d prometheus grafana alertmanager postgres-exporter node-exporter

# Start backend
cd backend && go run cmd/api/main.go
```

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | http://localhost:3001 | admin / admin |
| Prometheus | http://localhost:9090 | - |
| AlertManager | http://localhost:9093 | - |
| Backend Metrics | http://localhost:8080/metrics | - |
| Backend Health | http://localhost:8080/health | - |

## 📊 Key Metrics

### HTTP
```promql
# Request rate
rate(http_requests_total[5m])

# P95 latency
histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))

# Error rate
rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m])
```

### Database
```promql
# Query rate
rate(db_queries_total[5m])

# Slow queries (p99)
histogram_quantile(0.99, rate(db_query_duration_seconds_bucket[5m]))

# Connection pool usage
db_connections_total{state="in_use"} / db_connections_total{state="max_open"}
```

### Business
```promql
# Total instances
sum(instances_total)

# Instances by type
sum by (object_type) (instances_total)

# State transitions per minute
rate(state_transitions_total[5m]) * 60
```

### Cache
```promql
# Hit rate
rate(cache_hits_total[5m]) / (rate(cache_hits_total[5m]) + rate(cache_misses_total[5m]))
```

## 🔔 Alert Categories

| Severity | Examples | Response Time |
|----------|----------|---------------|
| **Critical** | APIDown, DatabaseDown | Immediate |
| **Warning** | HighLatency, SlowQueries | 15 minutes |
| **SLO** | ErrorBudgetBurn | 1 hour |
| **Cost** | HighLLMTokenUsage | 4 hours |

## 💻 Code Examples

### Record Metrics
```go
import "github.com/lbpay/supercore/internal/metrics"

// Database query
metrics.RecordDBQuery("instances", "SELECT", duration)

// Cache operation
metrics.RecordCacheHit("object_definition")

// RAG query
metrics.RecordRAGQuery("sql", "success", duration)

// State transition
metrics.RecordStateTransition("cliente_pf", "PENDING", "ACTIVE", "success")
```

### Structured Logging
```go
import (
    "github.com/lbpay/supercore/internal/logger"
    "go.uber.org/zap"
)

logger.Info("Operation completed",
    zap.String("operation", "create_instance"),
    zap.Duration("duration", duration))

logger.Error("Operation failed",
    zap.Error(err),
    zap.String("component", "handler"))
```

## 🛠️ Common Commands

### Docker
```bash
# View logs
docker-compose logs -f grafana
docker-compose logs -f prometheus

# Restart service
docker-compose restart grafana

# Stop all
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Prometheus
```bash
# Reload config (without restart)
curl -X POST http://localhost:9090/-/reload

# Check config
docker exec supercore-prometheus promtool check config /etc/prometheus/prometheus.yml

# Query API
curl 'http://localhost:9090/api/v1/query?query=up'
```

### Grafana
```bash
# Backup dashboards
curl -H "Authorization: Bearer YOUR_API_KEY" \
     http://localhost:3001/api/dashboards/db/supercore-overview

# Create API key (in Grafana UI)
# Settings → API Keys → New API Key
```

## 🐛 Troubleshooting

### Metrics Not Appearing
```bash
# 1. Check targets
curl http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health: .health}'

# 2. Check backend endpoint
curl http://localhost:8080/metrics | head -20

# 3. Check Prometheus logs
docker-compose logs prometheus | grep error
```

### Dashboard Not Loading
```bash
# 1. Check datasource
curl http://localhost:3001/api/datasources

# 2. Restart Grafana
docker-compose restart grafana

# 3. Check Grafana logs
docker-compose logs grafana | tail -50
```

### High Memory
```bash
# Check Prometheus storage
docker exec supercore-prometheus du -sh /prometheus

# Clean old data
docker exec supercore-prometheus \
    sh -c 'find /prometheus -name "*.db" -mtime +15 -delete'
```

## 📈 Dashboard Panels

### SuperCore Overview
1. HTTP Requests/sec
2. HTTP Duration (p95)
3. Error Rate
4. DB Query Duration (p99)
5. Cache Hit Rate
6. Object Definitions
7. Total Instances
8. Requests In Flight
9. Instances by Type
10. RAG Query Duration
11. DB Connection Pool
12. LLM Token Usage

### Business Metrics
1. Instances by State
2. Relationships by Type
3. State Transitions
4. Validation Success Rate
5. Validations/sec
6. Avg Validation Duration
7. RAG Queries by Layer
8. LLM Success Rate
9. Top 10 Object Types

## 🔐 Security Checklist

- [ ] Change Grafana admin password
- [ ] Configure Slack webhook URL
- [ ] Set up firewall rules
- [ ] Enable HTTPS
- [ ] Use secrets management
- [ ] Restrict metrics endpoint
- [ ] Enable audit logging
- [ ] Set up access controls

## 📚 Quick Links

- **Full Docs**: `monitoring/README.md`
- **Implementation**: `MONITORING_IMPLEMENTATION_COMPLETE.md`
- **Prometheus Docs**: https://prometheus.io/docs/
- **Grafana Docs**: https://grafana.com/docs/
- **PromQL Tutorial**: https://prometheus.io/docs/prometheus/latest/querying/basics/

## 🎯 SLO Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Availability | 99.9% | < 99.8% |
| Latency (p95) | < 500ms | > 1s |
| Error Rate | < 0.1% | > 1% |
| Cache Hit Rate | > 80% | < 50% |

## 💰 Cost Monitoring

```promql
# LLM tokens per hour
rate(llm_tokens_used_total[1h]) * 3600

# Estimated cost (assuming $0.002 per 1K tokens)
(rate(llm_tokens_used_total[1h]) * 3600 / 1000) * 0.002
```

## 🔄 Regular Tasks

### Daily
- [ ] Check critical alerts
- [ ] Review error rates
- [ ] Monitor disk space

### Weekly
- [ ] Review dashboard metrics
- [ ] Check alert effectiveness
- [ ] Clean up old data

### Monthly
- [ ] Review retention policies
- [ ] Update alert thresholds
- [ ] Analyze cost trends
- [ ] Update documentation

---

**Last Updated**: December 2024
