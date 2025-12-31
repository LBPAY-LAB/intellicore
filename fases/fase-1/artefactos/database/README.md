# SuperCore v2.0 - Database Schema

## Overview

This directory contains the complete PostgreSQL database schema for SuperCore v2.0's Fase 1 (Foundation). The schema implements a multi-tenant Solution Layer architecture with Row-Level Security (RLS) for complete data isolation between tenants.

## Version Information

| Attribute | Value |
|-----------|-------|
| Version | 1.0.0 |
| Database | PostgreSQL 16+ |
| Migration Tool | Goose |
| Tables | 7 |
| Indexes | 70+ |
| Author | Backend Architect (Database Specialist) |
| Date | 2025-12-30 |

---

## Directory Structure

```
database/
├── README.md                    # This file
├── ERD.md                       # Entity Relationship Diagram (Mermaid)
├── schemas/                     # Pure DDL reference files
│   ├── 01_solutions.sql         # Solutions table (foundation layer)
│   ├── 02_oracles.sql           # Oracles table (knowledge domains)
│   ├── 03_documents.sql         # Documents table (RAG sources)
│   ├── 04_document_chunks.sql   # Document chunks (RAG retrieval)
│   ├── 05_conversations.sql     # Conversations (chat sessions)
│   ├── 06_messages.sql          # Messages (chat messages)
│   └── 07_temporal_workflows.sql # Temporal workflows (job tracking)
├── migrations/                  # Goose migration files
│   ├── 001_create_extensions_and_functions.sql
│   ├── 002_create_solutions.sql
│   ├── 003_create_oracles.sql
│   ├── 004_create_documents.sql
│   ├── 005_create_document_chunks.sql
│   ├── 006_create_conversations.sql
│   ├── 007_create_messages.sql
│   ├── 008_create_temporal_workflows.sql
│   └── 009_create_rls_policies.sql
└── indexes/                     # Index documentation
    ├── performance_indexes.sql  # Summary of all indexes
    └── rls_policies.sql         # RLS architecture documentation
```

---

## Prerequisites

### Required Software

1. **PostgreSQL 16+** (required for advanced features)
   ```bash
   # macOS with Homebrew
   brew install postgresql@16

   # Ubuntu/Debian
   sudo apt-get install postgresql-16

   # Docker
   docker pull postgres:16
   ```

2. **Goose Migration Tool**
   ```bash
   # Go install
   go install github.com/pressly/goose/v3/cmd/goose@latest

   # macOS with Homebrew
   brew install goose

   # Verify installation
   goose --version
   ```

3. **PostgreSQL Extensions** (installed automatically by migration 001)
   - `uuid-ossp` - UUID generation
   - `pgcrypto` - Cryptographic functions
   - `pg_trgm` - Trigram similarity search
   - `vector` - pgvector for embeddings (optional, for future use)

---

## Quick Start

### 1. Create Database

```bash
# Create database and user
createdb supercore_dev
createuser -P supercore_user  # Enter password when prompted

# Grant privileges
psql -d supercore_dev -c "GRANT ALL PRIVILEGES ON DATABASE supercore_dev TO supercore_user;"
psql -d supercore_dev -c "GRANT ALL ON SCHEMA public TO supercore_user;"
```

### 2. Configure Environment

```bash
# Set environment variable
export GOOSE_DRIVER=postgres
export GOOSE_DBSTRING="postgres://supercore_user:password@localhost:5432/supercore_dev?sslmode=disable"

# Or create .env file
echo 'GOOSE_DRIVER=postgres' > .env
echo 'GOOSE_DBSTRING=postgres://supercore_user:password@localhost:5432/supercore_dev?sslmode=disable' >> .env
```

### 3. Run Migrations

```bash
# Navigate to migrations directory
cd fases/fase-1/artefactos/database/migrations

# Run all migrations
goose up

# Check current status
goose status

# Expected output:
#     Applied At                  Migration
#     =======================================
#     Mon Dec 30 10:00:00 2025 -- 001_create_extensions_and_functions.sql
#     Mon Dec 30 10:00:01 2025 -- 002_create_solutions.sql
#     Mon Dec 30 10:00:02 2025 -- 003_create_oracles.sql
#     Mon Dec 30 10:00:03 2025 -- 004_create_documents.sql
#     Mon Dec 30 10:00:04 2025 -- 005_create_document_chunks.sql
#     Mon Dec 30 10:00:05 2025 -- 006_create_conversations.sql
#     Mon Dec 30 10:00:06 2025 -- 007_create_messages.sql
#     Mon Dec 30 10:00:07 2025 -- 008_create_temporal_workflows.sql
#     Mon Dec 30 10:00:08 2025 -- 009_create_rls_policies.sql
```

### 4. Verify Installation

```bash
# Connect to database
psql -d supercore_dev

# List tables
\dt

# Expected tables:
#  Schema |       Name        | Type  |     Owner
# --------+-------------------+-------+---------------
#  public | goose_db_version  | table | supercore_user
#  public | solutions         | table | supercore_user
#  public | oracles           | table | supercore_user
#  public | documents         | table | supercore_user
#  public | document_chunks   | table | supercore_user
#  public | conversations     | table | supercore_user
#  public | messages          | table | supercore_user
#  public | temporal_workflows| table | supercore_user

# List indexes
\di

# Check RLS status
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## Migration Commands

### Standard Operations

```bash
# Apply all pending migrations
goose up

# Apply single migration
goose up-by-one

# Rollback last migration
goose down

# Rollback all migrations
goose reset

# Check migration status
goose status

# Show current version
goose version
```

### Advanced Operations

```bash
# Create new migration
goose create add_new_table sql

# Apply migrations to specific version
goose up-to 005

# Rollback to specific version
goose down-to 003

# Redo last migration (down + up)
goose redo
```

---

## Using Row-Level Security (RLS)

### Setting Solution Context

RLS requires setting the current solution context before executing queries:

```sql
-- At the start of each request, set the solution context
SELECT set_current_solution('123e4567-e89b-12d3-a456-426614174000');

-- Now all queries are automatically filtered to this solution
SELECT * FROM oracles;  -- Only returns oracles for this solution
SELECT * FROM documents;  -- Only returns documents for this solution

-- At the end of the request, optionally clear context
SELECT clear_current_solution();
```

### Application Integration (Go)

```go
package database

import (
    "context"
    "database/sql"
    "github.com/google/uuid"
)

// SetSolutionContext sets the current solution for RLS filtering
func SetSolutionContext(ctx context.Context, db *sql.DB, solutionID uuid.UUID) error {
    _, err := db.ExecContext(ctx, "SELECT set_current_solution($1)", solutionID)
    return err
}

// ClearSolutionContext clears the current solution context
func ClearSolutionContext(ctx context.Context, db *sql.DB) error {
    _, err := db.ExecContext(ctx, "SELECT clear_current_solution()")
    return err
}

// Middleware example
func SolutionMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        solutionID := r.Header.Get("X-Solution-ID")
        if solutionID != "" {
            if err := SetSolutionContext(r.Context(), db, uuid.MustParse(solutionID)); err != nil {
                http.Error(w, "Invalid solution context", 500)
                return
            }
            defer ClearSolutionContext(r.Context(), db)
        }
        next.ServeHTTP(w, r)
    })
}
```

### Application Integration (Python/FastAPI)

```python
from contextlib import asynccontextmanager
from uuid import UUID
import asyncpg

@asynccontextmanager
async def solution_context(conn: asyncpg.Connection, solution_id: UUID):
    """Context manager for RLS solution context."""
    try:
        await conn.execute("SELECT set_current_solution($1)", solution_id)
        yield conn
    finally:
        await conn.execute("SELECT clear_current_solution()")

# Usage in FastAPI
from fastapi import Depends, Header

async def get_solution_context(
    x_solution_id: UUID = Header(...),
    db: asyncpg.Connection = Depends(get_db)
):
    async with solution_context(db, x_solution_id):
        yield db
```

### Superuser Mode (Admin Operations)

```sql
-- Enable superuser mode to bypass RLS (use with caution!)
SELECT enable_superuser_mode();

-- Now all queries see all data across solutions
SELECT COUNT(*) FROM oracles;  -- Returns count from ALL solutions

-- Always disable when done
SELECT disable_superuser_mode();
```

---

## Common Queries

### Creating a Solution with RAG Global Oracle

```sql
-- Create a new solution
INSERT INTO solutions (slug, name, industry, status)
VALUES ('acme-corp', 'ACME Corporation', 'fintech', 'active')
RETURNING id;

-- Automatically create RAG Global Oracle
SELECT create_rag_global_oracle('returned-solution-uuid');
```

### Creating an Oracle

```sql
-- Set solution context first
SELECT set_current_solution('solution-uuid');

-- Create oracle
INSERT INTO oracles (
    solution_id,
    oracle_name,
    oracle_type,
    system_prompt,
    llm_provider,
    llm_model
) VALUES (
    'solution-uuid',
    'financial-advisor',
    'domain',
    'You are a financial advisor specializing in investment strategies.',
    'anthropic',
    'claude-3-5-sonnet-20241022'
) RETURNING id;
```

### Uploading a Document

```sql
-- Set solution context
SELECT set_current_solution('solution-uuid');

-- Insert document
INSERT INTO documents (
    oracle_id,
    solution_id,
    filename,
    file_type,
    file_size_bytes,
    storage_path,
    mime_type
) VALUES (
    'oracle-uuid',
    'solution-uuid',
    'investment-guide.pdf',
    'pdf',
    1048576,
    '/storage/solutions/acme-corp/documents/investment-guide.pdf',
    'application/pdf'
) RETURNING id;
```

### Creating Conversation and Messages

```sql
-- Set solution context
SELECT set_current_solution('solution-uuid');

-- Get or create conversation
SELECT get_or_create_conversation(
    'oracle-uuid',
    'solution-uuid',
    'session-12345'
);

-- Add user message
INSERT INTO messages (
    conversation_id,
    oracle_id,
    solution_id,
    role,
    content,
    sequence_number
) VALUES (
    'conversation-uuid',
    'oracle-uuid',
    'solution-uuid',
    'user',
    'What are the best investment strategies for 2025?',
    (SELECT get_next_message_sequence('conversation-uuid'))
);

-- Add assistant response with sources
INSERT INTO messages (
    conversation_id,
    oracle_id,
    solution_id,
    role,
    content,
    sequence_number,
    sources,
    input_tokens,
    output_tokens,
    total_tokens,
    model_used
) VALUES (
    'conversation-uuid',
    'oracle-uuid',
    'solution-uuid',
    'assistant',
    'Based on the current market analysis...',
    (SELECT get_next_message_sequence('conversation-uuid')),
    '[{"chunk_id": "chunk-uuid", "document_id": "doc-uuid", "relevance_score": 0.95}]'::jsonb,
    150,
    350,
    500,
    'claude-3-5-sonnet-20241022'
);
```

### Tracking Workflows

```sql
-- Create workflow tracking entry
SELECT create_workflow_tracking(
    'process-doc-001',           -- workflow_id
    'ProcessDocumentWorkflow',   -- workflow_type
    '{"document_id": "doc-uuid"}'::jsonb,  -- input_data
    'solution-uuid',             -- solution_id
    'oracle-uuid',               -- oracle_id
    'document-uuid'              -- document_id
);

-- Update progress
SELECT update_workflow_progress(
    'process-doc-001',
    'Generating embeddings',
    3,
    5
);

-- Complete workflow
SELECT complete_workflow(
    'process-doc-001',
    '{"chunks_created": 42, "embeddings_generated": 42}'::jsonb
);
```

---

## Performance Optimization

### Index Usage

The schema includes 70+ indexes optimized for common access patterns:

```sql
-- Check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Query Analysis

```sql
-- Analyze query performance
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM documents
WHERE oracle_id = 'oracle-uuid'
AND status = 'completed';
```

### Statistics Update

```sql
-- Update statistics after bulk operations
ANALYZE solutions;
ANALYZE oracles;
ANALYZE documents;
ANALYZE document_chunks;
ANALYZE conversations;
ANALYZE messages;
ANALYZE temporal_workflows;
```

### Vacuum Operations

```sql
-- Regular maintenance
VACUUM ANALYZE;

-- Full vacuum (requires exclusive lock)
VACUUM FULL ANALYZE;
```

---

## Backup and Recovery

### Logical Backup (pg_dump)

```bash
# Full backup
pg_dump -Fc -f supercore_backup.dump supercore_dev

# Schema only
pg_dump -Fc --schema-only -f supercore_schema.dump supercore_dev

# Data only
pg_dump -Fc --data-only -f supercore_data.dump supercore_dev

# Specific tables
pg_dump -Fc -t solutions -t oracles -f supercore_partial.dump supercore_dev
```

### Restore

```bash
# Restore full backup
pg_restore -d supercore_dev supercore_backup.dump

# Restore with clean (drop existing)
pg_restore -c -d supercore_dev supercore_backup.dump
```

### Point-in-Time Recovery

For production, configure continuous archiving and point-in-time recovery (PITR) in `postgresql.conf`:

```ini
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/%f'
```

---

## Troubleshooting

### Common Issues

#### 1. RLS Returning Empty Results

```sql
-- Check current solution context
SELECT current_solution_id();

-- If NULL, set the context
SELECT set_current_solution('your-solution-uuid');

-- Check if superuser mode is enabled
SELECT current_user_is_superuser();
```

#### 2. Migration Failures

```bash
# Check migration status
goose status

# View specific migration
cat migrations/00X_migration_name.sql

# Manually fix and retry
goose up-by-one
```

#### 3. Index Bloat

```sql
-- Check index bloat
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- Rebuild specific index
REINDEX INDEX idx_documents_oracle_id;

-- Rebuild all indexes on table
REINDEX TABLE documents;
```

#### 4. Connection Issues

```sql
-- Check active connections
SELECT * FROM pg_stat_activity
WHERE datname = 'supercore_dev';

-- Terminate stuck connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'supercore_dev'
AND state = 'idle'
AND query_start < NOW() - INTERVAL '1 hour';
```

#### 5. Lock Contention

```sql
-- View current locks
SELECT
    pg_locks.pid,
    pg_class.relname,
    pg_locks.mode,
    pg_locks.granted
FROM pg_locks
JOIN pg_class ON pg_locks.relation = pg_class.oid
WHERE pg_class.relnamespace = 'public'::regnamespace;
```

---

## Security Considerations

### 1. Connection Security

- Always use SSL/TLS in production (`sslmode=require`)
- Use strong passwords for database users
- Limit network access via `pg_hba.conf`

### 2. RLS Best Practices

- Never disable RLS in application code
- Use superuser mode only for admin/migration tasks
- Audit superuser mode usage

### 3. Sensitive Data

- Encrypt sensitive fields at application level
- Use `pgcrypto` for database-level encryption
- Never store plaintext credentials

### 4. Audit Logging

Consider enabling audit logging:

```sql
-- Enable pgaudit extension
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Configure in postgresql.conf
-- pgaudit.log = 'write, ddl'
```

---

## Environment-Specific Configuration

### Development

```bash
GOOSE_DBSTRING="postgres://dev_user:dev_pass@localhost:5432/supercore_dev?sslmode=disable"
```

### Staging

```bash
GOOSE_DBSTRING="postgres://stg_user:stg_pass@staging-db.internal:5432/supercore_stg?sslmode=require"
```

### Production

```bash
GOOSE_DBSTRING="postgres://prod_user:${DB_PASSWORD}@prod-db.internal:5432/supercore_prod?sslmode=require"
```

---

## References

- [PostgreSQL 16 Documentation](https://www.postgresql.org/docs/16/)
- [Goose Migration Tool](https://github.com/pressly/goose)
- [Row-Level Security](https://www.postgresql.org/docs/16/ddl-rowsecurity.html)
- [JSONB Indexing](https://www.postgresql.org/docs/16/datatype-json.html#JSON-INDEXING)
- [pgvector Extension](https://github.com/pgvector/pgvector)

---

## Support

For issues or questions:

1. Check the [ERD.md](./ERD.md) for schema visualization
2. Review migration files in `migrations/`
3. Consult the [SuperCore Documentation](../../../documentation-base/)
4. Contact the Backend Architecture team

---

**Version**: 1.0.0
**Last Updated**: 2025-12-30
**Maintained by**: Backend Architect (Database Specialist)
