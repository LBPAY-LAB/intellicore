# SuperCore v2.0 - Development Infrastructure Guide

**Version**: 1.0.0
**Status**: Production Ready for Fase 1
**Last Updated**: 2025-12-31

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Service Details](#service-details)
5. [Database Management](#database-management)
6. [NebulaGraph Setup](#nebulagraph-setup)
7. [MinIO Setup](#minio-setup)
8. [Temporal Workflow Orchestration](#temporal-workflow-orchestration)
9. [Monitoring & Observability](#monitoring--observability)
10. [Troubleshooting](#troubleshooting)
11. [Production Considerations](#production-considerations)

---

## Overview

This infrastructure provides a **complete, production-ready development environment** for SuperCore v2.0 featuring:

- **PostgreSQL 16** with pgvector for embeddings
- **Redis 7** for caching (NOT task queue - Temporal replaces Celery)
- **Temporal Server 1.23** for workflow orchestration
- **NebulaGraph 3.8** for knowledge graph management
- **Qdrant** for vector database (RAG embeddings)
- **MinIO** for S3-compatible object storage

All services are containerized with Docker Compose and can be managed via a comprehensive Makefile.

---

## Prerequisites

### Required

- **Docker** 20.10+ ([Install](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ ([Install](https://docs.docker.com/compose/install/))
- **Make** (usually pre-installed on macOS/Linux)

### Optional (for advanced operations)

- **goose** for database migrations: `go install github.com/pressly/goose/v3/cmd/goose@latest`
- **tctl** for Temporal CLI: `brew install temporal-cli`
- **mc** for MinIO CLI: `brew install minio/stable/mc`
- **PostgreSQL Client**: `brew install postgresql`

### System Requirements

- **Minimum**: 8GB RAM, 2 CPU cores, 20GB disk space
- **Recommended**: 16GB RAM, 4 CPU cores, 50GB disk space

---

## Quick Start

### 1. Clone and Setup

```bash
cd fases/fase-1/artefactos/infrastructure

# Copy environment file
cp .env.example .env

# Create .env if needed and update sensitive values
# (For dev, defaults are fine)
```

### 2. Start All Services

```bash
# Start all services with auto-migrations and bucket creation
make dev-up

# This will:
# 1. Start all Docker containers
# 2. Wait for services to be healthy
# 3. Run database migrations automatically
# 4. Create MinIO buckets
# 5. Initialize NebulaGraph spaces
```

### 3. Verify Services

```bash
# Check all services are healthy
make health

# Expected output:
# PostgreSQL (5432)... OK
# Redis (6379)......... OK
# Temporal (7233)..... OK
# NebulaGraph (9669).. OK
# Qdrant (6333)....... OK
# MinIO (9000)........ OK
```

### 4. Access Services

| Service | URL/Address | Credentials |
|---------|------------|-------------|
| PostgreSQL | `localhost:5432` | `supercore` / `supercore_dev_password` |
| Redis | `localhost:6379` | None (dev mode) |
| Temporal | `localhost:7233` (gRPC) | - |
| **Temporal UI** | `http://localhost:8088` | - |
| NebulaGraph | `localhost:9669` | `root` / `nebula` |
| Qdrant | `http://localhost:6333` | - |
| **MinIO Console** | `http://localhost:9001` | `minio_admin` / `minio_password_change_me` |

---

## Service Details

### PostgreSQL (Primary Data Store)

**Port**: 5432
**Database**: supercore_dev
**User**: supercore
**Password**: supercore_dev_password

#### Key Features

- pgvector extension for vector storage (optional, Qdrant is primary)
- UUID generation with uuid-ossp extension
- Cryptographic functions via pgcrypto
- Trigram similarity for fuzzy search (pg_trgm)

#### Useful Commands

```bash
# Access PostgreSQL console
make db-console

# Backup database
make db-dump
# Creates: backup_YYYYMMDD_HHMMSS.sql

# Restore database
make db-restore FILE=backup_20251231_120000.sql

# Run migrations
make migrate-up

# Rollback last migration
make migrate-down

# Check migration status
make migrate-status
```

### Redis (Cache Layer)

**Port**: 6379
**Purpose**: Caching only (task queue handled by Temporal)
**Max Memory**: 512MB (LRU eviction policy)

#### Key Features

- Persistent storage with AOF (Append-Only File)
- Automatic memory eviction (LRU policy)
- Session storage
- Cache for frequently accessed data

#### Useful Commands

```bash
# Access Redis CLI
docker-compose -f docker/docker-compose.yml exec redis redis-cli

# Common Redis commands:
# PING                 - Test connection
# DBSIZE               - Show number of keys
# FLUSHDB              - Clear current database
# FLUSHALL             - Clear all databases
```

### Temporal Server (Workflow Orchestration)

**Ports**:
- 7233 (gRPC)
- 7234 (Metrics)
- 8088 (Web UI)

**Replaces**: Celery for background jobs and complex workflows

#### Key Features

- Event-driven workflow execution
- Automatic retries and error handling
- Temporal state machine
- Built-in observability
- Workflow history

#### Useful Commands

```bash
# Open Temporal Web UI
make temporal-ui
# Opens: http://localhost:8088

# List workflows
docker-compose -f docker/docker-compose.yml exec temporal \
  tctl workflow list -a default

# Describe a specific workflow
docker-compose -f docker/docker-compose.yml exec temporal \
  tctl workflow describe -w <workflow-id>

# Access Temporal CLI
make temporal-cli
```

#### Example Workflow Integration

```python
from temporalio import workflow
from temporalio.client import Client

@workflow.defn
class ProcessDocumentWorkflow:
    @workflow.run
    async def run(self, document_id: str) -> str:
        # Workflow definition
        result = await workflow.execute_activity(
            upload_document_activity,
            document_id,
            start_to_close_timeout=timedelta(minutes=10)
        )
        return result

# Execute from application
client = await Client.connect("localhost:7233")
handle = await client.start_workflow(
    ProcessDocumentWorkflow.run,
    document_id="doc123",
    id="process-doc-123",
    task_queue="document-processing"
)
```

### NebulaGraph (Knowledge Graph)

**Port**: 9669
**Admin User**: root
**Admin Password**: nebula

#### Key Features

- Distributed graph database
- Multi-space support (knowledge_graph, conversation_graph, audit_graph)
- Full-text search on graph data
- MATCH queries for complex traversals

#### Spaces Created

1. **knowledge_graph**: Oracle, ObjectDefinition, Agent, Workflow relationships
2. **conversation_graph**: Message threads and conversation flows
3. **audit_graph**: Compliance and audit trail

#### Useful Commands

```bash
# Initialize NebulaGraph spaces (if not done by make dev-up)
make nebula-init

# Access NebulaGraph console
make nebula-console

# Common nGQL commands:
# SHOW SPACES;                    - List all spaces
# USE knowledge_graph;            - Select space
# SHOW TAGS;                      - List node types
# SHOW EDGES;                     - List relationship types
# MATCH (v:Oracle) RETURN v;     - Query nodes
```

#### Example Graph Query

```nql
USE knowledge_graph;

-- Find all objects defined by an Oracle
MATCH (oracle:Oracle)-[edge:oracle_has_objects]->(obj:ObjectDefinition)
WHERE oracle.name == "PaymentOracle"
RETURN oracle, obj;

-- Find agents and their workflows
MATCH (agent:Agent)-[exec:agent_executes_workflow]->(workflow:Workflow)
RETURN agent.name, workflow.name, exec.status;
```

### Qdrant (Vector Database)

**HTTP Port**: 6333
**gRPC Port**: 6334

#### Key Features

- Vector similarity search
- Hybrid search (vector + filters)
- Batch operations
- HNSW indexing (efficient approximate nearest neighbor)

#### Useful Commands

```bash
# Health check
curl http://localhost:6333/health

# List collections
curl http://localhost:6333/collections

# Create collection for embeddings
curl -X POST http://localhost:6333/collections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "documents",
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'

# Search vectors
curl -X POST http://localhost:6333/collections/documents/points/search \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, ...],
    "limit": 5
  }'
```

### MinIO (Object Storage)

**S3 API Port**: 9000
**Console Port**: 9001

#### Credentials

- **Access Key**: minio_admin
- **Secret Key**: minio_password_change_me

#### Buckets Created

- `documents` - Original documents (PDFs, images)
- `document-chunks` - Processed chunks for RAG
- `embeddings` - Vector embeddings backup
- `conversations` - Conversation logs
- `exports` - Data exports and reports
- `backups` - Database and system backups
- `ai-models` - Cached AI models
- `workflows` - Temporal workflow artifacts

#### Useful Commands

```bash
# Open MinIO web console
make minio-console
# Opens: http://localhost:9001

# Initialize buckets (if not done by make dev-up)
make minio-init

# Use MinIO CLI
mc alias set supercore http://localhost:9000 minio_admin minio_password_change_me
mc ls supercore
mc cp local-file.pdf supercore/documents/
```

---

## Database Management

### Migration Strategy

Migrations use **goose** for SQL schema versioning:

```
migrations/
├── 001_create_extensions_and_functions.sql
├── 002_create_solutions.sql
├── 003_create_oracles.sql
├── 004_create_documents.sql
├── 005_create_document_chunks.sql
├── 006_create_conversations.sql
├── 007_create_messages.sql
├── 008_create_temporal_workflows.sql
└── 009_create_rls_policies.sql
```

### Run Migrations

```bash
# Automatic (via make dev-up)
make dev-up

# Manual - Run pending migrations
make migrate-up

# Rollback - Revert last migration
make migrate-down

# Status - Check migration history
make migrate-status
```

### Manual SQL Execution

```bash
# Connect directly to PostgreSQL
make db-console

# In psql:
supercore_dev=# SELECT * FROM solutions;
supercore_dev=# SELECT current_schema();
supercore_dev=# \dt+  -- List tables
```

### Backup and Restore

```bash
# Backup
make db-dump
# Creates: backup_YYYYMMDD_HHMMSS.sql

# Restore from backup
make db-restore FILE=backup_20251231_120000.sql

# Restore from specific SQL file
make db-restore FILE=/path/to/custom/backup.sql
```

### Database Performance

```bash
# Check query performance in PostgreSQL
make db-console
supercore_dev=# EXPLAIN ANALYZE SELECT * FROM documents;

# Enable query logging (in PostgreSQL)
ALTER DATABASE supercore_dev SET log_statement = 'all';
```

---

## NebulaGraph Setup

### Automatic Initialization

```bash
make nebula-init
```

This creates:

**Spaces**:
- knowledge_graph
- conversation_graph
- audit_graph

**Tags** (Node Types):
- Oracle
- ObjectDefinition
- Agent
- Workflow
- Conversation
- Message
- AuditEvent

**Edges** (Relationships):
- oracle_has_objects
- oracle_has_agents
- agent_executes_workflow
- object_depends_on
- message_in_conversation
- message_references

### Manual Setup

```bash
# Connect to NebulaGraph
make nebula-console

# Create a space
CREATE SPACE IF NOT EXISTS knowledge_graph (
    partition_num = 1,
    replica_factor = 1,
    vid_type = INT64
);

# Use the space
USE knowledge_graph;

# Create a tag (node type)
CREATE TAG Oracle (
    id STRING,
    name STRING,
    description STRING
);

# Create an edge (relationship type)
CREATE EDGE oracle_has_objects ();

# Insert data
INSERT VERTEX Oracle(id, name) VALUES "oracle1":("oracle1", "Payment Oracle");
```

### Backup and Restore

```bash
# Backup NebulaGraph
docker-compose -f docker/docker-compose.yml exec nebula-graphd \
  nebula-storaged-manager backup full

# Restore
docker-compose -f docker/docker-compose.yml exec nebula-graphd \
  nebula-storaged-manager restore <backup_name>
```

---

## MinIO Setup

### Automatic Initialization

```bash
make minio-init
```

Creates all required buckets with appropriate policies.

### Manual Bucket Creation

```bash
# Configure MinIO CLI alias
mc alias set supercore http://localhost:9000 minio_admin minio_password_change_me

# Create bucket
mc mb supercore/documents

# Set bucket policy
mc policy set private supercore/documents

# Enable versioning
mc version enable supercore/backups

# Upload file
mc cp myfile.pdf supercore/documents/
```

### Bucket Lifecycle Policies

```bash
# View lifecycle configuration
mc ilm list supercore/backups

# Set expiration (delete objects after 30 days)
mc ilm import supercore/backups <<EOF
{
    "Rules": [
        {
            "ID": "DeleteOldVersions",
            "Filter": {},
            "NoncurrentVersionExpiration": {
                "NoncurrentDays": 30
            },
            "Status": "Enabled"
        }
    ]
}
EOF
```

---

## Temporal Workflow Orchestration

### Why Temporal (Not Celery)?

| Feature | Temporal | Celery |
|---------|----------|--------|
| **Durability** | Built-in persistence | Requires Redis/RabbitMQ |
| **Retries** | Native exponential backoff | Manual configuration |
| **Monitoring** | Web UI included | Need external tools |
| **Workflow State** | Automatic | Manual tracking |
| **Scalability** | Distributed by design | Can be complex |
| **Cost** | Open source + low infra | Multiple services needed |

### Workflow Patterns

#### 1. Document Processing Workflow

```python
from temporalio import workflow, activity
from datetime import timedelta

@activity.defn
async def upload_to_storage(doc_id: str, content: bytes) -> str:
    # Upload to MinIO
    return f"s3://documents/{doc_id}"

@activity.defn
async def chunk_document(doc_id: str) -> list[str]:
    # Split into chunks
    return ["chunk1", "chunk2", ...]

@activity.defn
async def generate_embeddings(chunks: list[str]) -> list[list[float]]:
    # Call OpenAI API
    return [[...embeddings...], ...]

@activity.defn
async def store_embeddings(embeddings: list[list[float]]) -> None:
    # Store in Qdrant
    pass

@workflow.defn
class ProcessDocumentWorkflow:
    @workflow.run
    async def run(self, document_id: str, content: bytes) -> str:
        # 1. Upload
        storage_path = await workflow.execute_activity(
            upload_to_storage,
            document_id,
            content,
            start_to_close_timeout=timedelta(minutes=5)
        )

        # 2. Chunk
        chunks = await workflow.execute_activity(
            chunk_document,
            document_id,
            start_to_close_timeout=timedelta(minutes=10)
        )

        # 3. Generate embeddings
        embeddings = await workflow.execute_activity(
            generate_embeddings,
            chunks,
            start_to_close_timeout=timedelta(minutes=15)
        )

        # 4. Store embeddings
        await workflow.execute_activity(
            store_embeddings,
            embeddings,
            start_to_close_timeout=timedelta(minutes=5)
        )

        return f"Processed {len(chunks)} chunks"
```

#### 2. Conversation Processing Workflow

```python
@workflow.defn
class ProcessConversationWorkflow:
    @workflow.run
    async def run(self, conversation_id: str) -> None:
        # Process messages, store in NebulaGraph, etc.
        await workflow.execute_activity(
            store_conversation_graph,
            conversation_id,
            start_to_close_timeout=timedelta(minutes=5)
        )
```

### Monitoring Workflows

```bash
# View all workflows
docker-compose -f docker/docker-compose.yml exec temporal \
  tctl workflow list -a default

# Describe specific workflow
docker-compose -f docker/docker-compose.yml exec temporal \
  tctl workflow describe -w process-doc-123

# Stream workflow execution
docker-compose -f docker/docker-compose.yml exec temporal \
  tctl workflow show -w process-doc-123 --show-detail

# List task queues
docker-compose -f docker/docker-compose.yml exec temporal \
  tctl taskqueue list
```

---

## Monitoring & Observability

### Health Checks

```bash
# Check all services
make health

# Individual service checks
curl http://localhost:5432 || echo "PostgreSQL down"
redis-cli -p 6379 PING
curl http://localhost:8088/health  # Temporal UI
curl http://localhost:6333/health  # Qdrant
curl http://localhost:9000/minio/health/live  # MinIO
```

### Logs

```bash
# View all logs
make dev-logs

# View specific service logs
docker-compose -f docker/docker-compose.yml logs postgres
docker-compose -f docker/docker-compose.yml logs temporal

# Follow logs in real-time
docker-compose -f docker/docker-compose.yml logs -f redis

# Clear logs
make logs-clear
```

### Prometheus Metrics

Temporal exports Prometheus metrics on port 9090:

```bash
# View metrics endpoint
curl http://localhost:9090/metrics

# Common metrics
temporal_workflow_execution_count
temporal_activity_execution_count
temporal_workflow_execution_latency
temporal_activity_execution_latency
```

---

## Troubleshooting

### Common Issues

#### 1. PostgreSQL Won't Start

```bash
# Check logs
docker-compose -f docker/docker-compose.yml logs postgres

# Possible causes:
# - Port 5432 already in use: lsof -i :5432
# - Volume permission issue: docker volume ls

# Solution:
make clean  # Remove all containers and volumes
make dev-up  # Start fresh
```

#### 2. Temporal Server Unhealthy

```bash
# Check if database is ready
docker-compose -f docker/docker-compose.yml exec temporal-postgres \
  psql -U temporal -d temporal -c "SELECT 1;"

# Check Elasticsearch
docker-compose -f docker/docker-compose.yml exec temporal-elasticsearch \
  curl -s http://localhost:9200/_cluster/health

# Restart Temporal
docker-compose -f docker/docker-compose.yml restart temporal
```

#### 3. NebulaGraph Connection Issues

```bash
# Check if graphd is responding
nc -zv localhost 9669

# Check logs
docker-compose -f docker/docker-compose.yml logs nebula-graphd

# Restart NebulaGraph services
docker-compose -f docker/docker-compose.yml restart nebula-metad nebula-storaged nebula-graphd
```

#### 4. MinIO Bucket Creation Fails

```bash
# Check MinIO logs
docker-compose -f docker/docker-compose.yml logs minio

# Test connection
curl http://localhost:9000/minio/health/live

# Recreate buckets
make minio-init
```

#### 5. Migrations Not Running

```bash
# Check if goose is installed
which goose

# Install goose
go install github.com/pressly/goose/v3/cmd/goose@latest

# Check migration files
ls -la ../database/migrations/

# Run migrations manually
make migrate-up

# Check status
make migrate-status
```

### Debug Commands

```bash
# Check Docker container status
docker ps
docker ps -a

# Check volumes
docker volume ls

# Check networks
docker network ls

# Inspect container
docker inspect supercore-postgres

# View resource usage
docker stats

# Remove all dangling containers/volumes
docker system prune -a
docker volume prune
```

---

## Production Considerations

### Before Going to Production

1. **Environment Variables**: Update `.env` with production values
2. **Secrets Management**: Use secret management tools (Vault, AWS Secrets Manager)
3. **Backups**: Configure automated backups
4. **Monitoring**: Set up comprehensive monitoring and alerting
5. **Security**: Enable authentication, HTTPS, and firewall rules
6. **Performance Tuning**: Adjust PostgreSQL and Redis configuration
7. **High Availability**: Use replication and failover

### Production Setup

```bash
# Production environment file
cp .env.example .env.production
# Edit with production values

# Production compose file (not included in this template)
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Backup Strategy

```bash
# Daily backups
make db-dump  # Runs daily via cron

# Archive backups
tar -czf backups_$(date +%Y%m%d).tar.gz backup_*.sql

# Upload to cloud storage
aws s3 cp backups_*.tar.gz s3://my-backups/supercore/
```

### Monitoring

```bash
# Set up alerts for:
# - Service downtime
# - Database replication lag
# - Cache hit rate < 80%
# - Qdrant search latency > 100ms
# - MinIO disk usage > 80%
```

### Scaling

- **PostgreSQL**: Use streaming replication and connection pooling (pgBouncer)
- **Redis**: Use clustering or Sentinel for HA
- **Temporal**: Scale with multiple workers and multiple servers
- **NebulaGraph**: Use multiple partition replicas
- **Qdrant**: Use sharding for large datasets

---

## Support & References

- **Docker**: https://docs.docker.com
- **PostgreSQL**: https://www.postgresql.org/docs
- **Redis**: https://redis.io/documentation
- **Temporal**: https://docs.temporal.io
- **NebulaGraph**: https://docs.nebula-graph.io
- **Qdrant**: https://qdrant.tech/documentation
- **MinIO**: https://docs.min.io

---

**Last Updated**: 2025-12-31
**Maintained By**: DevOps Engineer / Squad Fase 1
**Status**: Production Ready
