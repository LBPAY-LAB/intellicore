# RAG SQL Layer - Implementation

This package implements the **SQL Layer** of the trimodal RAG system for SuperCore.

## Components

### 1. SQL Query Builder (`sql_query_builder.go`)
Dynamically builds SQL queries based on natural language context extraction.

**Features:**
- Dynamic WHERE clause generation
- JSONB field filtering (`$gt`, `$lt`, `$eq`, `$contains`)
- Aggregations (count, sum, avg, min, max)
- Time range filtering
- Ordering and limiting

**Example:**
```go
queryCtx := QueryContext{
    ObjectType: "cliente_pf",
    State: "ATIVO",
    Aggregation: "count",
}

result, err := builder.Execute(ctx, queryCtx)
// Returns: {"total": 1247}
```

### 2. Entity Extractor (`entity_extractor.go`)
Extracts structured entities from natural language questions using LLM.

**Features:**
- NLP-based entity extraction
- Object type identification
- Filter extraction
- Time range parsing (TODAY, YESTERDAY, LAST_7_DAYS, etc.)
- Aggregation detection

**Example:**
```go
question := "Quantos clientes ativos temos?"
queryCtx, err := extractor.Extract(ctx, question)
// Returns: QueryContext{ObjectType: "cliente_pf", State: "ATIVO", Aggregation: "count"}
```

### 3. RAG SQL Service (`sql_service.go`)
Orchestrates the complete RAG SQL pipeline.

**Pipeline:**
1. Extract entities from question
2. Build and execute SQL query
3. Format results for LLM
4. Generate natural language answer

**Example:**
```go
answer, err := ragSQLService.Answer(ctx, "Quantos clientes cadastrados ontem?")
// Returns: "Foram cadastrados 47 clientes ontem."
```

## API Endpoint

### POST `/api/v1/rag/query/sql`

**Request:**
```json
{
  "question": "Quantos clientes ativos temos?"
}
```

**Response:**
```json
{
  "question": "Quantos clientes ativos temos?",
  "answer": "Atualmente temos 1.247 clientes ativos no sistema.",
  "layer": "sql"
}
```

## Environment Variables

The SQL Layer requires an LLM API key for entity extraction:

```bash
# OpenAI (default)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini

# OR Claude
LLM_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
LLM_MODEL=claude-3-5-sonnet-20241022
```

## Testing

### Manual Testing

1. Start the backend:
```bash
cd backend
go run cmd/api/main.go
```

2. Create an object definition (example: cliente_pf):
```bash
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "schema": {
      "type": "object",
      "properties": {
        "cpf": {"type": "string"},
        "nome_completo": {"type": "string"}
      },
      "required": ["cpf", "nome_completo"]
    },
    "states": {
      "initial": "ATIVO",
      "states": ["ATIVO", "BLOQUEADO"]
    }
  }'
```

3. Create some instances:
```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "<UUID_FROM_STEP_2>",
    "data": {
      "cpf": "12345678901",
      "nome_completo": "Maria Silva"
    }
  }'
```

4. Test RAG SQL queries:

**Test 1: Count query**
```bash
curl -X POST http://localhost:8080/api/v1/rag/query/sql \
  -H "Content-Type: application/json" \
  -d '{"question": "Quantos clientes ativos temos?"}'
```

**Test 2: Time range query**
```bash
curl -X POST http://localhost:8080/api/v1/rag/query/sql \
  -H "Content-Type: application/json" \
  -d '{"question": "Quantos clientes cadastrados nos últimos 7 dias?"}'
```

**Test 3: List query**
```bash
curl -X POST http://localhost:8080/api/v1/rag/query/sql \
  -H "Content-Type: application/json" \
  -d '{"question": "Liste os últimos 10 clientes cadastrados"}'
```

### Unit Tests

```bash
cd backend/internal/rag
go test -v
```

## Integration with Other Layers

The SQL Layer is part of the **trimodal RAG system**:

1. **SQL Layer** (this package) - Tabular data queries
2. **Vector Layer** - Semantic search (already implemented)
3. **Graph Layer** - Relationship traversal (next sprint)

### Future: Unified RAG

```go
// Future implementation
answer, err := ragService.Answer(ctx, RAGRequest{
    Question: "Quais contas Maria Silva possui com saldo acima de 1000?",
    Layers: []string{"sql", "graph"}, // Use both SQL and Graph layers
})
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Natural Language                      │
│          "Quantos clientes ativos temos?"                │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Entity Extractor (LLM)                      │
│  Extracts: {object_type: "cliente_pf", state: "ATIVO",  │
│             aggregation: "count"}                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              SQL Query Builder                           │
│  Builds: SELECT COUNT(*) FROM instances                 │
│          WHERE object_definition_id = ...                │
│          AND current_state = 'ATIVO'                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              Execute Query                               │
│  Returns: {total: 1247}                                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│              LLM Answer Generation                       │
│  Generates: "Atualmente temos 1.247 clientes ativos."   │
└─────────────────────────────────────────────────────────┘
```

## Error Handling

The system handles various error scenarios:

- **No LLM API key**: Service won't initialize, endpoints return 503
- **Invalid JSON from LLM**: Returns parsing error
- **No object definitions**: Returns "no objects found" error
- **SQL execution failure**: Returns database error
- **Empty results**: LLM generates appropriate "no results" response

## Performance Considerations

- **LLM caching**: Enabled by default (15 min TTL)
- **Rate limiting**: 10 requests/second
- **Query optimization**: Uses PostgreSQL JSONB indexes
- **Result limiting**: Maximum 10 rows shown in context to avoid token bloat

## Next Steps

1. **Add route to main.go** (see `main_routes_patch.go`)
2. **Test with real data**
3. **Implement Graph Layer** (Sprint 6)
4. **Unified RAG orchestrator** (Sprint 7)
