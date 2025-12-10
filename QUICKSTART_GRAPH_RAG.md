# Quick Start - RAG Graph Layer

## Prerequisites

- Docker and Docker Compose installed
- Go 1.23+ installed
- PostgreSQL running (via docker-compose)
- Nebula Graph running (via docker-compose)
- OpenAI API key or Anthropic API key

## Step-by-Step Setup

### 1. Install Go Dependencies

```bash
cd /Users/jose.silva.lb/LBPay/supercore/backend

# Install Nebula Graph Go client
go get github.com/vesoft-inc/nebula-go/v3

# Tidy dependencies
go mod tidy
```

### 2. Configure Environment

```bash
# Edit .env file (or set environment variables)
export NEBULA_ADDRESS="nebula-graphd:9669"
export NEBULA_USER="root"
export NEBULA_PASSWORD="nebula"
export NEBULA_SPACE="supercore_graph"

# LLM for entity extraction
export LLM_PROVIDER="openai"  # or "claude"
export OPENAI_API_KEY="sk-..."  # Your API key
```

### 3. Start Services

```bash
# Start all services (including Nebula Graph)
cd /Users/jose.silva.lb/LBPay/supercore
docker-compose up -d

# Wait for Nebula Graph to be ready (30-60 seconds)
docker-compose logs -f nebula-graphd

# You should see: "nebula-graphd entered RUNNING state"
```

### 4. Initialize Nebula Graph Schema

```bash
# Option A: Using nebula-console (recommended)
docker-compose exec nebula-graphd /bin/bash
nebula-console -addr nebula-graphd -port 9669 -u root -p nebula

# Inside console, run:
:play /path/to/nebula_schema.ngql

# Option B: Manual commands
CREATE SPACE IF NOT EXISTS supercore_graph (partition_num=10, replica_factor=1, vid_type=FIXED_STRING(36));
USE supercore_graph;

# Create tags
CREATE TAG IF NOT EXISTS ObjectDefinition (name STRING, category STRING, version INT, description STRING, created_at DATETIME, updated_at DATETIME);
CREATE TAG IF NOT EXISTS Instance (object_definition_id STRING, object_definition_name STRING, current_state STRING, data TEXT, created_at DATETIME, updated_at DATETIME, created_by STRING);

# Create edges
CREATE EDGE IF NOT EXISTS DEFINES (created_at DATETIME);
CREATE EDGE IF NOT EXISTS RELATES_TO (relationship_type STRING, metadata TEXT, created_at DATETIME, created_by STRING);
CREATE EDGE IF NOT EXISTS INHERITS_FROM (created_at DATETIME);

# Create indexes
CREATE TAG INDEX IF NOT EXISTS idx_objectdef_name ON ObjectDefinition(name(20));
CREATE TAG INDEX IF NOT EXISTS idx_instance_objdef_id ON Instance(object_definition_id(36));
CREATE TAG INDEX IF NOT EXISTS idx_instance_state ON Instance(current_state(20));
CREATE EDGE INDEX IF NOT EXISTS idx_relates_type ON RELATES_TO(relationship_type(30));

# Exit
:exit
```

### 5. Build and Run Backend

```bash
cd /Users/jose.silva.lb/LBPay/supercore/backend

# Build
go build -o api cmd/api/main.go

# Run
./api

# Or use make
make run
```

You should see:
```
2024-12-10 10:00:00 INFO Nebula Graph connected: nebula-graphd:9669 (space: supercore_graph)
2024-12-10 10:00:05 INFO RAG Graph Service initialized successfully
2024-12-10 10:00:10 INFO Starting server on port 8080...
```

### 6. Verify Installation

```bash
# Health check
curl http://localhost:8080/health

# Expected: {"status":"healthy","timestamp":...,"service":"supercore-api"}
```

### 7. Sync Data to Graph

```bash
# Full synchronization
curl -X POST http://localhost:8080/api/v1/rag/graph/sync

# Expected response:
{
  "message": "Sync completed successfully",
  "duration_seconds": 2.5,
  "object_definitions": {"synced": 5, "failed": 0},
  "instances": {"synced": 10, "failed": 0},
  "relationships": {"synced": 8, "failed": 0}
}
```

## Testing

### Run Automated Tests

```bash
cd /Users/jose.silva.lb/LBPay/supercore/backend

# Make script executable
chmod +x scripts/test_graph_rag.sh

# Run tests
./scripts/test_graph_rag.sh
```

### Manual Testing

#### Test 1: Natural Language Query

```bash
curl -X POST http://localhost:8080/api/v1/rag/query/graph \
  -H "Content-Type: application/json" \
  -d '{"question": "Quais contas Maria Silva possui?"}'
```

#### Test 2: Find Related Instances

```bash
# Get an instance ID first
INSTANCE_ID=$(curl -s "http://localhost:8080/api/v1/instances?limit=1" | jq -r '.data[0].id')

# Find related instances
curl "http://localhost:8080/api/v1/rag/graph/instances/${INSTANCE_ID}/related?depth=1" | jq '.'
```

#### Test 3: Analyze Impact

```bash
curl "http://localhost:8080/api/v1/rag/graph/instances/${INSTANCE_ID}/impact" | jq '.'
```

#### Test 4: Find Path

```bash
INSTANCE_1=$(curl -s "http://localhost:8080/api/v1/instances?limit=1&offset=0" | jq -r '.data[0].id')
INSTANCE_2=$(curl -s "http://localhost:8080/api/v1/instances?limit=1&offset=1" | jq -r '.data[0].id')

curl "http://localhost:8080/api/v1/rag/graph/path?from=${INSTANCE_1}&to=${INSTANCE_2}" | jq '.'
```

## Creating Test Data

To see the graph in action, create some test instances with relationships:

### 1. Create Object Definitions

```bash
# Create "Cliente PF" object
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "description": "Cliente pessoa física",
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

# Create "Conta Corrente" object
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "conta_corrente",
    "display_name": "Conta Corrente",
    "description": "Conta corrente bancária",
    "schema": {
      "type": "object",
      "properties": {
        "numero": {"type": "string"},
        "saldo": {"type": "number"}
      },
      "required": ["numero"]
    },
    "states": {
      "initial": "ATIVA",
      "states": ["ATIVA", "BLOQUEADA"]
    }
  }'
```

### 2. Create Instances

```bash
# Save object definition IDs
CLIENTE_OBJ_ID="..." # From previous response
CONTA_OBJ_ID="..."   # From previous response

# Create Maria Silva
MARIA_ID=$(curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d "{
    \"object_definition_id\": \"${CLIENTE_OBJ_ID}\",
    \"data\": {
      \"cpf\": \"12345678901\",
      \"nome_completo\": \"Maria Silva\"
    }
  }" | jq -r '.id')

# Create Conta 12345-6
CONTA1_ID=$(curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d "{
    \"object_definition_id\": \"${CONTA_OBJ_ID}\",
    \"data\": {
      \"numero\": \"12345-6\",
      \"saldo\": 5000.00
    }
  }" | jq -r '.id')

# Create Conta 98765-4
CONTA2_ID=$(curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d "{
    \"object_definition_id\": \"${CONTA_OBJ_ID}\",
    \"data\": {
      \"numero\": \"98765-4\",
      \"saldo\": 15000.00
    }
  }" | jq -r '.id')
```

### 3. Create Relationships

```bash
# Maria TITULAR_DE Conta 12345-6
curl -X POST http://localhost:8080/api/v1/relationships \
  -H "Content-Type: application/json" \
  -d "{
    \"relationship_type\": \"TITULAR_DE\",
    \"source_instance_id\": \"${MARIA_ID}\",
    \"target_instance_id\": \"${CONTA1_ID}\",
    \"properties\": {}
  }"

# Maria TITULAR_DE Conta 98765-4
curl -X POST http://localhost:8080/api/v1/relationships \
  -H "Content-Type: application/json" \
  -d "{
    \"relationship_type\": \"TITULAR_DE\",
    \"source_instance_id\": \"${MARIA_ID}\",
    \"target_instance_id\": \"${CONTA2_ID}\",
    \"properties\": {}
  }"
```

### 4. Sync to Graph

```bash
# Sync all new data
curl -X POST http://localhost:8080/api/v1/rag/graph/sync
```

### 5. Query the Graph!

```bash
# Now ask questions
curl -X POST http://localhost:8080/api/v1/rag/query/graph \
  -H "Content-Type: application/json" \
  -d '{"question": "Quais contas Maria Silva possui?"}'

# Expected answer:
# "Maria Silva (CPF 12345678901) possui 2 contas:
#  1. Conta Corrente 12345-6 - Saldo: R$ 5.000,00
#  2. Conta Poupança 98765-4 - Saldo: R$ 15.000,00"
```

## Troubleshooting

### "Failed to initialize Nebula Graph"

**Solution**: Check if Nebula Graph containers are running
```bash
docker-compose ps | grep nebula
docker-compose logs nebula-graphd
docker-compose restart nebula-metad nebula-storaged nebula-graphd
```

### "Space not found: supercore_graph"

**Solution**: Create the graph space (see Step 4 above)

### "No related instances found"

**Solution**: Sync data to graph
```bash
curl -X POST http://localhost:8080/api/v1/rag/graph/sync
```

### Connection errors

**Solution**: Update NEBULA_ADDRESS based on your setup
```bash
# If running backend locally (outside Docker)
export NEBULA_ADDRESS="127.0.0.1:9669"

# If running backend in Docker
export NEBULA_ADDRESS="nebula-graphd:9669"
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Start services
3. ✅ Initialize schema
4. ✅ Run backend
5. ✅ Sync data
6. ✅ Run tests
7. ✅ Create sample data
8. 📝 Integrate with frontend
9. 📝 Add real-time sync
10. 📝 Build graph visualization

## Additional Resources

- **Full Documentation**: [backend/docs/RAG_GRAPH_LAYER.md](backend/docs/RAG_GRAPH_LAYER.md)
- **Implementation Details**: [RAG_GRAPH_IMPLEMENTATION_COMPLETE.md](RAG_GRAPH_IMPLEMENTATION_COMPLETE.md)
- **Schema**: [database/graph/nebula_schema.ngql](database/graph/nebula_schema.ngql)
- **Platform Guide**: [CLAUDE.md](CLAUDE.md)

## Support

For issues or questions:
1. Check logs: `docker-compose logs -f backend nebula-graphd`
2. Verify services: `docker-compose ps`
3. Run health check: `curl http://localhost:8080/health`
4. Review documentation in `backend/docs/`

---

**Status**: 🚀 Ready to use!

**Estimated Setup Time**: 10-15 minutes
