# RAG Vector Layer Setup Guide

## Overview

The SuperCore RAG (Retrieval Augmented Generation) Vector Layer uses **pgvector** for semantic search capabilities. This allows the platform to:

1. **Index** object_definitions and instances as vector embeddings
2. **Search** for similar objects using natural language queries
3. **Power** the trimodal RAG system (SQL + Graph + Vector)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RAG Vector Layer                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Text Content → Embedding Service → Vector (1536 dims)       │
│                                                              │
│  ┌──────────────┐      ┌──────────────┐                     │
│  │   OpenAI     │      │   Cohere     │                     │
│  │  ada-002     │  or  │  multilingual│                     │
│  │ (1536 dims)  │      │  (4096 dims) │                     │
│  └──────────────┘      └──────────────┘                     │
│                                                              │
│  ↓                                                           │
│                                                              │
│  PostgreSQL + pgvector                                       │
│  ┌────────────────────────────────────┐                     │
│  │ document_embeddings                 │                     │
│  ├────────────────────────────────────┤                     │
│  │ id                    UUID          │                     │
│  │ content               TEXT          │                     │
│  │ content_type          VARCHAR       │                     │
│  │ embedding             vector(1536)  │                     │
│  │ metadata              JSONB         │                     │
│  │ object_definition_id  UUID (FK)     │                     │
│  │ instance_id           UUID (FK)     │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  HNSW Index for fast cosine similarity search               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Prerequisites

### 1. PostgreSQL with pgvector Extension

**Option A: Docker (Recommended for Development)**

```bash
# Use the official pgvector Docker image
docker run -d \
  --name supercore-postgres \
  -e POSTGRES_PASSWORD=supercore_dev_2024 \
  -e POSTGRES_USER=supercore \
  -e POSTGRES_DB=supercore \
  -p 5432:5432 \
  pgvector/pgvector:pg15
```

**Option B: Install pgvector on Existing PostgreSQL**

```bash
# macOS (with Homebrew)
brew install pgvector

# Ubuntu/Debian
sudo apt install postgresql-15-pgvector

# Then enable in your database:
psql -U supercore -d supercore -c "CREATE EXTENSION vector;"
```

### 2. Embedding Provider API Key

Choose one:

- **OpenAI** (Recommended): Get API key from https://platform.openai.com/api-keys
- **Cohere**: Get API key from https://dashboard.cohere.com/api-keys

## Setup Instructions

### Step 1: Configure Environment Variables

Add to your `.env` file:

```bash
# Embedding Configuration
EMBEDDING_PROVIDER=openai                    # or "cohere"
EMBEDDING_MODEL=text-embedding-ada-002       # or "embed-multilingual-v3.0" for Cohere

# OpenAI API Key (if using OpenAI)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Cohere API Key (if using Cohere)
COHERE_API_KEY=your-cohere-api-key-here
```

### Step 2: Run Database Migration

The migration creates the `document_embeddings` table and pgvector indexes.

```bash
cd /Users/jose.silva.lb/LBPay/supercore/database

# Run migration
psql $DATABASE_URL -f migrations/005_enable_pgvector.sql
```

**Verify migration:**

```sql
-- Check extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check table
\d document_embeddings

-- Check indexes
\di document_embeddings*
```

You should see:
- `vector` extension enabled
- `document_embeddings` table with `embedding vector(1536)` column
- HNSW index `idx_document_embeddings_vector`

### Step 3: Start Backend Server

```bash
cd /Users/jose.silva.lb/LBPay/supercore/backend

# Ensure dependencies are installed
go mod download

# Start server
go run cmd/api/main.go
```

You should see:
```
Embedding service initialized with provider: openai, model: text-embedding-ada-002
Starting server on port 8080...
```

## API Endpoints

### Semantic Search

**POST** `/api/v1/search/semantic`

Search for documents by natural language query.

```bash
curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "objetos relacionados a clientes e contas",
    "content_type": "object_definition",
    "limit": 5
  }'
```

**Response:**
```json
{
  "query": "objetos relacionados a clientes e contas",
  "results": [
    {
      "id": "uuid-1",
      "content": "Object Definition: Cliente Pessoa Física...",
      "content_type": "object_definition",
      "similarity": 0.92,
      "metadata": {
        "name": "cliente_pf",
        "display_name": "Cliente Pessoa Física"
      }
    }
  ],
  "count": 1
}
```

### Indexing Operations

**Index a Single Object Definition**

```bash
curl -X POST http://localhost:8080/api/v1/embeddings/index/object-definition/{id}
```

**Index a Single Instance**

```bash
curl -X POST http://localhost:8080/api/v1/embeddings/index/instance/{id}
```

**Index All Object Definitions**

```bash
curl -X POST http://localhost:8080/api/v1/embeddings/index/object-definitions
```

**Response:**
```json
{
  "message": "object_definitions indexed successfully",
  "count": 5
}
```

**Index All Instances**

```bash
curl -X POST http://localhost:8080/api/v1/embeddings/index/instances
```

**Full Reindex (Everything)**

```bash
curl -X POST http://localhost:8080/api/v1/embeddings/reindex-all
```

### Statistics

**GET** `/api/v1/embeddings/stats`

Get embedding statistics.

```bash
curl http://localhost:8080/api/v1/embeddings/stats
```

**Response:**
```json
{
  "total_embeddings": 47,
  "object_definitions": 5,
  "instances": 42,
  "documentation": 0,
  "regulations": 0
}
```

### Search by Metadata

**GET** `/api/v1/search/metadata?content_type=instance&metadata_key=cpf&metadata_value=12345678901`

Search embeddings by metadata filters.

### Delete Embedding

**DELETE** `/api/v1/embeddings/{id}`

Delete a specific embedding.

## Testing

### Test 1: Verify pgvector Extension

```bash
psql $DATABASE_URL -c "SELECT extversion FROM pg_extension WHERE extname = 'vector';"
```

Expected output:
```
 extversion
------------
 0.5.1
```

### Test 2: Create and Index an Object Definition

```bash
# 1. Create object_definition
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "description": "Representa uma pessoa física que é cliente do banco",
    "schema": {
      "type": "object",
      "properties": {
        "cpf": {"type": "string"},
        "nome_completo": {"type": "string"}
      },
      "required": ["cpf", "nome_completo"]
    }
  }' | jq '.id' -r > /tmp/objdef_id.txt

OBJDEF_ID=$(cat /tmp/objdef_id.txt)

# 2. Index it
curl -X POST "http://localhost:8080/api/v1/embeddings/index/object-definition/$OBJDEF_ID"

# 3. Search for it
curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "pessoa física cliente",
    "content_type": "object_definition",
    "limit": 3
  }' | jq
```

### Test 3: Semantic Search Quality

```bash
# Create multiple object definitions with different purposes
# Then search with various queries

# Query 1: Financial
curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "transações financeiras e pagamentos", "limit": 5}' | jq

# Query 2: Customer data
curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "dados cadastrais de pessoas", "limit": 5}' | jq

# Query 3: Compliance
curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "regras do banco central", "limit": 5}' | jq
```

### Test 4: Performance Benchmark

```bash
# Index 100 instances and measure search time
time curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "limit": 10}'
```

Expected: < 100ms for searches with HNSW index

## Automatic Indexing (Optional)

To automatically index object_definitions and instances when they are created/updated:

### Option 1: Database Triggers (Recommended)

Create PostgreSQL triggers that call the indexing API:

```sql
-- Trigger function (example)
CREATE OR REPLACE FUNCTION auto_index_object_definition()
RETURNS TRIGGER AS $$
BEGIN
  -- Call webhook or use pg_cron to trigger indexing
  PERFORM pg_notify('index_object_definition', NEW.id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_index_object_definition
  AFTER INSERT OR UPDATE ON object_definitions
  FOR EACH ROW
  EXECUTE FUNCTION auto_index_object_definition();
```

### Option 2: Application-Level Hook

Modify handlers to call indexer after successful create/update:

```go
// In object_definition.go Create() method
// After successful insert:
if embeddingIndexer != nil {
    go func() {
        ctx := context.Background()
        if err := embeddingIndexer.IndexObjectDefinition(ctx, od.ID); err != nil {
            log.Printf("Failed to auto-index object_definition %s: %v", od.ID, err)
        }
    }()
}
```

## Troubleshooting

### Issue: "extension vector does not exist"

**Solution:**
```bash
psql $DATABASE_URL -c "CREATE EXTENSION vector;"
```

### Issue: "OPENAI_API_KEY not set"

**Solution:** Add to `.env`:
```
OPENAI_API_KEY=sk-your-key-here
```

Restart the backend.

### Issue: "embedding dimension mismatch"

If you change embedding models (e.g., OpenAI → Cohere), you need to update the vector dimension:

```sql
-- Drop and recreate table with new dimension
DROP TABLE document_embeddings CASCADE;

-- Update migration to use vector(4096) for Cohere
-- Then re-run migration
```

### Issue: Slow searches

**Solutions:**
1. Ensure HNSW index exists: `\di document_embeddings_vector`
2. Increase `m` and `ef_construction` parameters for better recall
3. Use `ORDER BY embedding <=> $1 LIMIT N` (not `ORDER BY similarity DESC`)

## Cost Considerations

### OpenAI Pricing (text-embedding-ada-002)

- **Cost:** $0.0001 per 1K tokens
- **Average:** ~500 tokens per object_definition
- **Example:** 1000 object_definitions = ~$0.05

### Cohere Pricing (embed-multilingual-v3.0)

- **Cost:** $0.0001 per 1K tokens (similar to OpenAI)
- **Larger dimensions:** 4096 vs 1536 (more storage, potentially better recall)

### Optimization Tips

1. **Batch indexing:** Use `IndexAllObjectDefinitions()` instead of individual calls
2. **Incremental updates:** Only reindex when schema/description changes significantly
3. **Content deduplication:** Check if embedding already exists before generating new one

## Next Steps

1. **Integrate with RAG Pipeline:** Use vector search as part of trimodal RAG (SQL + Graph + Vector)
2. **Add Documentation Embeddings:** Index BACEN regulations, internal policies
3. **Hybrid Search:** Combine keyword search (full-text) + semantic search
4. **Reranking:** Use LLM to rerank top-k results for better precision

## References

- pgvector Documentation: https://github.com/pgvector/pgvector
- OpenAI Embeddings: https://platform.openai.com/docs/guides/embeddings
- Cohere Embeddings: https://docs.cohere.com/docs/embeddings
- HNSW Algorithm: https://arxiv.org/abs/1603.09320
