# RAG Graph Layer - Nebula Graph Implementation

## Overview

The RAG Graph Layer provides **relationship-based querying** using Nebula Graph, enabling the system to answer questions about how objects and instances are connected. This is the third layer of the SuperCore trimodal RAG system:

1. **SQL Layer** - Structured queries on object definitions and instances
2. **Vector Layer** - Semantic search using embeddings
3. **Graph Layer** - Relationship traversal and impact analysis (THIS LAYER)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   RAG Graph Layer Architecture              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐        ┌──────────────┐                  │
│  │ PostgreSQL   │───────▶│ NebulaSyncSvc│                  │
│  │ (Source DB)  │ sync   │              │                  │
│  └──────────────┘        └──────┬───────┘                  │
│                                 │                           │
│                                 ▼                           │
│                         ┌──────────────┐                    │
│                         │ Nebula Graph │                    │
│   User Question         │  Graph DB    │                    │
│         │               └──────┬───────┘                    │
│         ▼                      │                            │
│  ┌──────────────┐             │                            │
│  │ RAGGraphSvc  │◀────────────┘                            │
│  │              │                                           │
│  │ - Extract    │                                           │
│  │   entities   │                                           │
│  │ - Query      │                                           │
│  │   graph      │         ┌────────────┐                   │
│  │ - Generate   │────────▶│ LLM Client │                   │
│  │   answer     │         │ (Claude)   │                   │
│  └──────────────┘         └────────────┘                   │
│         │                                                   │
│         ▼                                                   │
│    Natural Language Answer                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. GraphLayer (`internal/services/rag/graph_layer.go`)

Low-level Nebula Graph operations:
- Connect to Nebula Graph cluster
- Sync vertices (ObjectDefinitions, Instances)
- Sync edges (Relationships)
- Execute nGQL queries
- Find related instances
- Analyze impact of deletions
- Find shortest paths

### 2. NebulaSyncService (`internal/services/nebula_sync_service.go`)

Synchronizes PostgreSQL data to Nebula Graph:
- `SyncInstance(instanceID)` - Sync single instance
- `SyncRelationship(relationshipID)` - Sync single relationship
- `SyncObjectDefinition(objectDefID)` - Sync single object definition
- `SyncAll()` - Full sync of all data

### 3. RAGGraphService (`internal/services/rag_graph_service.go`)

High-level RAG operations using the graph:
- `Answer(question)` - Answer natural language questions
- `FindRelatedInstances(instanceID, depth)` - Traverse relationships
- `AnalyzeImpact(instanceID)` - Impact analysis for deletions
- `FindPath(fromID, toID)` - Shortest path between instances

### 4. RAGGraphHandler (`internal/handlers/rag_graph_handler.go`)

HTTP API endpoints for graph RAG operations.

## API Endpoints

### Graph-Based Question Answering

#### POST `/api/v1/rag/query/graph`

Answer questions about relationships using the graph.

**Request:**
```json
{
  "question": "Quais contas Maria Silva possui?"
}
```

**Response:**
```json
{
  "question": "Quais contas Maria Silva possui?",
  "answer": "Maria Silva (CPF 123.456.789-01) possui 2 contas:\n1. Conta Corrente 12345-6 - Saldo: R$ 5.000,00\n2. Conta Poupança 98765-4 - Saldo: R$ 15.000,00"
}
```

### Graph Operations

#### GET `/api/v1/rag/graph/instances/:id/related?depth=1`

Find all instances related to a given instance.

**Parameters:**
- `depth` (query param) - Traversal depth (1-3, default: 1)

**Response:**
```json
{
  "instance_id": "uuid-here",
  "depth": 1,
  "count": 3,
  "instances": [
    {
      "id": "uuid-conta-1",
      "object_definition_name": "conta_corrente",
      "current_state": "ATIVA",
      "data": {...}
    }
  ]
}
```

#### GET `/api/v1/rag/graph/instances/:id/impact`

Analyze the impact of deleting an instance.

**Response:**
```json
{
  "target_instance_id": "uuid-here",
  "direct_dependents": [...],
  "indirect_dependents": [...],
  "total_affected_count": 5,
  "max_dependency_depth": 2,
  "affected_object_types": {
    "conta_corrente": 2,
    "transacao_pix": 3
  }
}
```

#### GET `/api/v1/rag/graph/path?from=uuid1&to=uuid2`

Find the shortest path between two instances.

**Response:**
```json
{
  "from": "uuid1",
  "to": "uuid2",
  "path_count": 1,
  "paths": [
    {
      "path": ["uuid1", "uuid-mid", "uuid2"],
      "path_length": 3
    }
  ]
}
```

### Graph Synchronization

#### POST `/api/v1/rag/graph/sync`

Full synchronization of PostgreSQL to Nebula Graph.

**Response:**
```json
{
  "message": "Sync completed successfully",
  "duration_seconds": 12.5,
  "object_definitions": {
    "synced": 15,
    "failed": 0
  },
  "instances": {
    "synced": 1247,
    "failed": 3
  },
  "relationships": {
    "synced": 892,
    "failed": 1
  }
}
```

#### POST `/api/v1/rag/graph/sync/instance/:id`

Sync a single instance to the graph.

#### POST `/api/v1/rag/graph/sync/relationship/:id`

Sync a single relationship to the graph.

#### POST `/api/v1/rag/graph/sync/object-definition/:id`

Sync a single object definition to the graph.

## Nebula Graph Schema

The graph uses the following schema:

### Tags (Vertex Types)

#### ObjectDefinition
```ngql
CREATE TAG ObjectDefinition (
  name STRING,
  category STRING,
  version INT,
  description STRING,
  created_at DATETIME,
  updated_at DATETIME
)
```

#### Instance
```ngql
CREATE TAG Instance (
  object_definition_id STRING,
  object_definition_name STRING,
  current_state STRING,
  data TEXT,
  created_at DATETIME,
  updated_at DATETIME,
  created_by STRING
)
```

### Edge Types

#### DEFINES
Links ObjectDefinition → Instance

#### RELATES_TO
Links Instance → Instance (any relationship type)

Properties:
- `relationship_type` - Type of relationship (TITULAR_DE, PAI_DE, etc.)
- `metadata` - Additional properties as JSON
- `created_at` - Timestamp
- `created_by` - User ID

#### INHERITS_FROM
Links ObjectDefinition → ObjectDefinition (for inheritance)

## Environment Variables

```bash
# Nebula Graph connection
NEBULA_ADDRESS=127.0.0.1:9669      # Nebula graphd address
NEBULA_USER=root                    # Nebula username
NEBULA_PASSWORD=nebula              # Nebula password
NEBULA_SPACE=supercore_graph        # Graph space name

# LLM for entity extraction and answer generation
LLM_PROVIDER=openai                 # or "claude"
LLM_MODEL=gpt-4o-mini              # or "claude-3-5-sonnet-20241022"
OPENAI_API_KEY=sk-...              # OpenAI API key
ANTHROPIC_API_KEY=sk-ant-...       # Claude API key
```

## Usage Examples

### 1. Initial Setup

```bash
# Start Nebula Graph (via docker-compose)
docker-compose up -d nebula-metad nebula-storaged nebula-graphd

# Wait for Nebula to be ready (check logs)
docker-compose logs -f nebula-graphd

# Create graph space and schema
docker-compose exec nebula-graphd nebula-console -addr nebula-graphd -port 9669 -u root -p nebula -f /path/to/nebula_schema.ngql

# Full sync from PostgreSQL to Nebula
curl -X POST http://localhost:8080/api/v1/rag/graph/sync
```

### 2. Question Answering

```bash
# Ask about relationships
curl -X POST http://localhost:8080/api/v1/rag/query/graph \
  -H "Content-Type: application/json" \
  -d '{"question": "Quais contas Maria Silva possui?"}'

# Ask about reverse relationships
curl -X POST http://localhost:8080/api/v1/rag/query/graph \
  -H "Content-Type: application/json" \
  -d '{"question": "Quem é o titular da conta 12345-6?"}'

# Ask about dependencies
curl -X POST http://localhost:8080/api/v1/rag/query/graph \
  -H "Content-Type: application/json" \
  -d '{"question": "Quais são os dependentes de João Pedro?"}'
```

### 3. Graph Traversal

```bash
# Find related instances (1 level deep)
curl http://localhost:8080/api/v1/rag/graph/instances/uuid-here/related?depth=1

# Find related instances (2 levels deep)
curl http://localhost:8080/api/v1/rag/graph/instances/uuid-here/related?depth=2

# Analyze deletion impact
curl http://localhost:8080/api/v1/rag/graph/instances/uuid-here/impact

# Find path between two instances
curl "http://localhost:8080/api/v1/rag/graph/path?from=uuid1&to=uuid2"
```

### 4. Incremental Sync

```bash
# Sync single instance after creation/update
curl -X POST http://localhost:8080/api/v1/rag/graph/sync/instance/uuid-here

# Sync single relationship after creation
curl -X POST http://localhost:8080/api/v1/rag/graph/sync/relationship/uuid-here

# Sync object definition after creation/update
curl -X POST http://localhost:8080/api/v1/rag/graph/sync/object-definition/uuid-here
```

## How Entity Extraction Works

The RAG Graph Service uses an LLM to extract entities from natural language questions:

```
Question: "Quais contas Maria Silva possui?"

LLM extracts:
{
  "source_name": "Maria Silva",
  "source_type": "cliente_pf",
  "relationship_type": "TITULAR_DE",
  "target_type": "conta_corrente",
  "direction": "outbound",
  "depth": 1
}

Builds nGQL query:
MATCH (source:Instance)-[:RELATES_TO]->(target:Instance)
WHERE source.object_definition_name == "cliente_pf"
  AND source.data CONTAINS "Maria Silva"
  AND target.object_definition_name == "conta_corrente"
RETURN source, target

Executes query → Gets results → Formats with LLM → Returns answer
```

## Performance Considerations

1. **Graph Sync**:
   - Full sync can take time for large datasets
   - Use incremental sync after CRUD operations
   - Schedule periodic full syncs (e.g., nightly)

2. **Query Performance**:
   - Limit depth parameter (max 3 levels)
   - Use indexes on frequently queried properties
   - Monitor query latency with Prometheus

3. **Connection Pooling**:
   - GraphLayer uses Nebula SessionPool
   - Configure pool size based on load
   - Reuse connections efficiently

## Monitoring

The Graph Layer logs important operations:

```
2024-12-10 10:00:00 INFO Nebula Graph connected: 127.0.0.1:9669 (space: supercore_graph)
2024-12-10 10:00:05 INFO RAG Graph Service initialized successfully
2024-12-10 10:05:12 INFO Synced instance uuid-123 (cliente_pf) to Nebula Graph
2024-12-10 10:05:13 INFO Synced relationship uuid-456: uuid-123 -> uuid-789 (TITULAR_DE)
2024-12-10 10:10:00 INFO RAG Graph Query: Quais contas Maria Silva possui?
2024-12-10 10:10:01 INFO Found 2 related instances
```

## Troubleshooting

### "Failed to initialize Nebula Graph"

**Cause**: Nebula Graph is not running or not accessible.

**Solution**:
```bash
# Check Nebula containers
docker-compose ps | grep nebula

# Check Nebula logs
docker-compose logs nebula-graphd

# Restart Nebula services
docker-compose restart nebula-metad nebula-storaged nebula-graphd
```

### "Space not found: supercore_graph"

**Cause**: Graph space hasn't been created.

**Solution**:
```bash
# Connect to Nebula console
docker-compose exec nebula-graphd nebula-console -addr nebula-graphd -port 9669 -u root -p nebula

# Create space
CREATE SPACE IF NOT EXISTS supercore_graph (partition_num=10, replica_factor=1, vid_type=FIXED_STRING(36));
USE supercore_graph;
# ... create tags and edges from schema file
```

### "No related instances found"

**Cause**: Data not synced to graph yet.

**Solution**:
```bash
# Run full sync
curl -X POST http://localhost:8080/api/v1/rag/graph/sync
```

## Future Enhancements

1. **Real-time Sync**:
   - Automatic sync on instance/relationship creation
   - Event-driven architecture with message queue
   - PostgreSQL triggers → Kafka → Nebula

2. **Advanced Graph Algorithms**:
   - PageRank for instance importance
   - Community detection for grouping
   - Centrality metrics

3. **Graph Visualization**:
   - Frontend component to visualize relationships
   - Interactive graph exploration
   - Subgraph extraction

4. **Query Optimization**:
   - Query plan caching
   - Materialized subgraphs
   - Index tuning based on access patterns

## Related Documentation

- [Nebula Graph Schema](../../database/graph/nebula_schema.ngql)
- [RAG SQL Layer](./RAG_SQL_LAYER.md)
- [RAG Vector Layer](./RAG_VECTOR_LAYER.md)
- [Trimodal RAG Architecture](./RAG_ARCHITECTURE.md)
