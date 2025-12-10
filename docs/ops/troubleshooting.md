# SuperCore Troubleshooting Guide

Quick solutions to common issues.

## Table of Contents

- [Backend Issues](#backend-issues)
- [Database Issues](#database-issues)
- [Docker Issues](#docker-issues)
- [API Errors](#api-errors)
- [Performance Issues](#performance-issues)
- [LLM/RAG Issues](#llmrag-issues)
- [Deployment Issues](#deployment-issues)

---

## Backend Issues

### Backend Won't Start

**Symptom**: `docker-compose up` fails, backend container exits immediately

**Diagnosis**:
```bash
# Check logs
docker-compose logs backend

# Common errors:
# 1. Database connection failed
# 2. Missing environment variables
# 3. Port already in use
```

**Solutions**:

#### 1. Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Should show "Up (healthy)"
# If not:
docker-compose up -d postgres
docker-compose logs postgres

# Test connection manually
docker-compose exec postgres psql -U supercore -d supercore -c "SELECT 1;"
```

#### 2. Missing Environment Variables
```bash
# Check .env file exists
ls -la .env

# If missing:
cp .env.example .env
nano .env  # Add your API keys

# Verify DATABASE_URL is correct
grep DATABASE_URL .env
```

#### 3. Port Already in Use
```bash
# Check what's using port 8080
lsof -i :8080
# or
netstat -an | grep 8080

# Kill the process or change PORT in .env
```

### Backend Returns 500 Errors

**Diagnosis**:
```bash
# Check backend logs
docker-compose logs -f backend | grep ERROR

# Check database connectivity
curl http://localhost:8080/health
```

**Solutions**:

#### Database Query Errors
```bash
# Check database health
docker-compose exec postgres pg_isready

# Check for missing tables
docker-compose exec postgres psql -U supercore -d supercore -c "\dt"

# Re-run migrations if tables missing
docker-compose exec postgres psql -U supercore -d supercore < /docker-entrypoint-initdb.d/migrations/001_initial_schema.sql
```

#### Out of Memory
```bash
# Check container memory
docker stats backend

# Increase memory limit in docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 2G  # Increase this
```

---

## Database Issues

### PostgreSQL Won't Start

**Diagnosis**:
```bash
docker-compose logs postgres

# Common errors:
# 1. Data directory initialization failed
# 2. Port 5432 already in use
# 3. Disk space full
```

**Solutions**:

#### Data Directory Corrupted
```bash
# Stop services
docker-compose down

# Backup and remove volume (WARNING: This deletes data!)
docker volume rm supercore_postgres-data

# Start fresh
docker-compose up -d postgres

# Re-run migrations
docker-compose exec postgres psql -U supercore -d supercore < database/migrations/001_initial_schema.sql
```

#### Port Already in Use
```bash
# Check what's using port 5432
sudo lsof -i :5432

# Option 1: Stop conflicting PostgreSQL
brew services stop postgresql  # macOS
sudo systemctl stop postgresql  # Linux

# Option 2: Change port in docker-compose.yml:
# ports:
#   - "5433:5432"  # Use different external port
```

### Slow Queries

**Diagnosis**:
```bash
# Enable slow query logging
docker-compose exec postgres psql -U supercore -d supercore -c "
  ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1s
  SELECT pg_reload_conf();
"

# Check logs
docker-compose logs postgres | grep "duration:"
```

**Solutions**:

#### Missing Indexes
```sql
-- Connect to database
docker-compose exec postgres psql -U supercore -d supercore

-- Check if indexes exist
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('instances', 'relationships', 'object_definitions');

-- Add missing indexes (if needed)
CREATE INDEX CONCURRENTLY idx_instances_object_def
  ON instances(object_definition_id) WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY idx_instances_data_gin
  ON instances USING GIN (data jsonb_path_ops);
```

#### Connection Pool Exhausted
```bash
# Check active connections
docker-compose exec postgres psql -U supercore -d supercore -c "
  SELECT count(*) FROM pg_stat_activity;
"

# Increase max_connections if needed (requires restart)
# Edit postgresql.conf or docker-compose command:
# command:
#   - "postgres"
#   - "-c"
#   - "max_connections=200"
```

---

## Docker Issues

### "No Space Left on Device"

**Diagnosis**:
```bash
df -h  # Check disk space
docker system df  # Check Docker disk usage
```

**Solutions**:
```bash
# Clean up unused images
docker image prune -a

# Clean up volumes (WARNING: This can delete data!)
docker volume prune

# Clean up everything
docker system prune -a --volumes

# Free up space on host
# macOS: Increase Docker Desktop disk size in Preferences
# Linux: Clean up /var/lib/docker
```

### Container Keeps Restarting

**Diagnosis**:
```bash
# Check restart count
docker-compose ps

# Check logs for error
docker-compose logs --tail=50 backend

# Check events
docker events --filter container=supercore_backend
```

**Solutions**:
```bash
# Stop the restart loop
docker-compose stop backend

# Fix the issue (check logs for root cause)

# Start manually to see error
docker-compose run --rm backend /app/main
```

---

## API Errors

### 400 Bad Request: "Validation Failed"

**Symptom**: Creating instance fails with validation error

**Example Error**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": "cpf",
      "issue": "CPF must have 11 digits"
    }
  }
}
```

**Solutions**:

#### Fix Input Data
```bash
# Ensure CPF has exactly 11 digits (no formatting)
# WRONG: "123.456.789-01"
# CORRECT: "12345678901"

# Check object definition schema
curl http://localhost:8080/api/v1/object-definitions/{id}/schema

# Validate your data against the schema
```

#### Check Validation Rules
```bash
# List validation rules
curl http://localhost:8080/api/v1/validation-rules

# Test specific validation
curl -X POST http://localhost:8080/api/v1/validation-rules/{id}/test \
  -d '{"value": "12345678901"}'
```

### 404 Not Found: Resource Doesn't Exist

**Solutions**:
```bash
# Verify UUID is correct (check for typos)
# UUIDs must be in format: 550e8400-e29b-41d4-a716-446655440000

# List available resources
curl http://localhost:8080/api/v1/object-definitions
curl http://localhost:8080/api/v1/instances

# Check if resource was soft-deleted
curl "http://localhost:8080/api/v1/instances/{id}" | jq '.is_deleted'
```

### 422 Unprocessable Entity: State Transition Error

**Example Error**:
```json
{
  "error": {
    "code": "STATE_TRANSITION_ERROR",
    "message": "Cannot transition from DRAFT to CLOSED",
    "details": {
      "current_state": "DRAFT",
      "allowed_transitions": ["ACTIVE"]
    }
  }
}
```

**Solutions**:
```bash
# Check current state
curl http://localhost:8080/api/v1/instances/{id} | jq '.current_state'

# Check allowed transitions
curl http://localhost:8080/api/v1/object-definitions/{def_id} | jq '.states.transitions'

# Perform correct transition sequence
# Example: DRAFT → ACTIVE → CLOSED (not DRAFT → CLOSED directly)
```

### 429 Rate Limit Exceeded

**Solutions**:
```bash
# Wait for rate limit to reset (check X-RateLimit-Reset header)

# For production: Increase rate limits in .env:
# RATE_LIMIT_REQUESTS_PER_MINUTE=120

# Or implement exponential backoff in your client
```

---

## Performance Issues

### API Responses Slow (>1s)

**Diagnosis**:
```bash
# Time API calls
time curl http://localhost:8080/api/v1/instances

# Check backend logs for slow queries
docker-compose logs backend | grep "duration"

# Monitor database
docker-compose exec postgres psql -U supercore -d supercore -c "
  SELECT pid, now() - pg_stat_activity.query_start AS duration, query
  FROM pg_stat_activity
  WHERE state != 'idle'
  ORDER BY duration DESC;
"
```

**Solutions**:

#### Database Optimization
```sql
-- Vacuum and analyze
VACUUM ANALYZE instances;
VACUUM ANALYZE relationships;

-- Check for bloat
SELECT schemaname, tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### Add Caching (Redis)
```yaml
# Add to docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

### High Memory Usage

**Diagnosis**:
```bash
# Check container memory
docker stats

# Check Go memory profile
curl http://localhost:8080/debug/pprof/heap > heap.prof
go tool pprof heap.prof
```

**Solutions**:
```bash
# Increase container memory
# Edit docker-compose.yml:
# deploy:
#   resources:
#     limits:
#       memory: 4G

# Restart
docker-compose up -d backend
```

---

## LLM/RAG Issues

### "Embedding Service Not Initialized"

**Symptom**: Semantic search returns error

**Solutions**:
```bash
# Check if API key is set
docker-compose exec backend env | grep OPENAI_API_KEY

# If missing, add to .env:
echo "OPENAI_API_KEY=sk-proj-xxxxx" >> .env

# Restart
docker-compose restart backend

# Verify initialization
docker-compose logs backend | grep "Embedding service initialized"
```

### LLM Requests Timing Out

**Solutions**:
```bash
# Increase timeout in .env:
LLM_TIMEOUT_SECONDS=60

# Check rate limiting:
LLM_RATE_LIMIT_RPS=5  # Reduce if hitting provider limits

# Enable caching:
LLM_ENABLE_CACHE=true
LLM_CACHE_TTL=3600
```

### Poor Search Results

**Solutions**:
```bash
# Reindex all embeddings
curl -X POST http://localhost:8080/api/v1/embeddings/reindex-all

# Check embedding stats
curl http://localhost:8080/api/v1/embeddings/stats

# Verify pgvector extension
docker-compose exec postgres psql -U supercore -d supercore -c "\dx"
# Should show "vector" extension
```

---

## Deployment Issues

### Health Check Failing in Production

**Diagnosis**:
```bash
# Check health endpoint
curl -v http://your-domain.com/health

# Check SSL
curl -v https://your-domain.com/health

# Check from inside network
kubectl exec -it pod-name -- curl http://localhost:8080/health
```

**Solutions**:
```bash
# Verify environment variables are set
kubectl get secret supercore-secrets -o yaml

# Check database connectivity from pod
kubectl exec -it pod-name -- psql $DATABASE_URL -c "SELECT 1;"

# Check logs
kubectl logs -f deployment/supercore-backend
```

### Cannot Connect to Database in Production

**Solutions**:
```bash
# Check DATABASE_URL format
# Must be: postgres://user:password@host:port/database?sslmode=require

# Verify SSL mode
# Production should use: sslmode=require

# Test connection from pod
kubectl run -it --rm debug --image=postgres:15 --restart=Never -- \
  psql "postgres://user:password@db-host:5432/database?sslmode=require"
```

---

## Quick Diagnostic Commands

### Check Everything
```bash
# Docker Compose
docker-compose ps
docker-compose logs --tail=50

# Kubernetes
kubectl get pods -n supercore-prod
kubectl describe pod <pod-name> -n supercore-prod
kubectl logs -f deployment/supercore-backend -n supercore-prod

# Database
docker-compose exec postgres pg_isready -U supercore
docker-compose exec postgres psql -U supercore -d supercore -c "SELECT version();"

# API
curl http://localhost:8080/health
curl http://localhost:8080/api/v1/oracle/whoami
```

### Performance Check
```bash
# Response time
time curl http://localhost:8080/api/v1/object-definitions

# Database connections
docker-compose exec postgres psql -U supercore -d supercore -c "
  SELECT count(*), state FROM pg_stat_activity GROUP BY state;
"

# Memory usage
docker stats --no-stream

# Disk usage
df -h
docker system df
```

---

## Still Having Issues?

1. **Check logs** carefully - they usually contain the answer
2. **Search GitHub Issues**: [SuperCore Issues](https://github.com/lbpay/supercore/issues)
3. **Ask for help**: [GitHub Discussions](https://github.com/lbpay/supercore/discussions)
4. **Email support**: dev@lbpay.com.br

When asking for help, include:
- SuperCore version (`git describe --tags`)
- Docker version (`docker --version`)
- OS/Platform
- Complete error message
- Steps to reproduce
- Relevant logs (`docker-compose logs backend`)

---

**Last Updated**: 2024-12-10
