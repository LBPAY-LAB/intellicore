# LLM Gateway Service

> FastAPI-based LLM Gateway for intelliCore - AI-native meta-modeling platform

## Overview

The LLM Gateway provides a unified API for interacting with Large Language Models (LLMs) via Ollama. It supports:

- **Chat Completions**: Streaming and non-streaming chat with LLMs
- **Model Management**: List, pull, and delete models
- **Prompt Templates**: Jinja2-based template system with built-in templates for intelliCore
- **Embeddings**: Text embedding generation for RAG
- **Field Validation**: LLM-powered field validation for ObjectTypes

## Quick Start

### Development

```bash
# Install dependencies with uv
uv pip install -e ".[dev]"

# Copy environment file
cp .env.example .env

# Run development server
uvicorn app.main:app --reload --port 8000
```

### Docker

```bash
# Build and run with docker-compose (from project root)
docker-compose up llm-gateway
```

## API Endpoints

### Health

- `GET /health` - Service health check
- `GET /ready` - Kubernetes readiness probe

### Models (`/api/v1/models`)

- `GET /` - List available models
- `GET /{model_name}` - Get model details
- `POST /pull` - Pull model from registry (streaming)
- `DELETE /{model_name}` - Delete model
- `GET /allowed/list` - List allowed models

### Templates (`/api/v1/templates`)

- `GET /` - List all templates
- `GET /tags` - List template tags
- `GET /{template_id}` - Get template by ID
- `POST /render` - Render template with variables
- `POST /render-and-chat` - Render and send to LLM
- `POST /` - Create custom template
- `PUT /{template_id}` - Update template
- `DELETE /{template_id}` - Delete custom template

### Chat (`/api/v1/chat`)

- `POST /completions` - Chat completion (streaming supported)
- `POST /generate` - Simple text generation
- `POST /embeddings` - Generate embedding
- `POST /embeddings/batch` - Batch embeddings
- `POST /validate` - Validate field value with LLM
- `POST /suggest-fields` - Suggest fields for ObjectType

### Validation (`/api/v1/validation`) - Sprint 9

- `POST /extract-fields` - Extract field values from free-text
- `POST /extract-fields/batch` - Batch extraction from multiple records
- `POST /recognize-entities` - Recognize financial entities (CPF, CNPJ, PIX, etc.)
- `POST /validate-business-rules` - Validate data against business rules
- `POST /validate-cross-fields` - Cross-field validation and consistency
- `POST /validate-contextual` - RAG-powered contextual validation
- `POST /generate-validation-queries` - Generate RAG search queries

### Monitoring (`/api/v1/monitoring`) - Sprint 9

- `GET /metrics` - Get comprehensive LLM metrics summary
- `GET /metrics/models` - Get per-model statistics
- `GET /calls` - Get recent LLM call history
- `GET /errors` - Get error summary and recent errors
- `POST /reset` - Reset all metrics
- `GET /health` - Monitoring service health

## Built-in Prompt Templates

| Template ID | Purpose |
|-------------|---------|
| `field-validation` | Validate field values against business rules |
| `object-type-suggestion` | Suggest fields for new ObjectTypes |
| `relationship-validation` | Validate relationships between ObjectTypes |
| `document-summarize` | Summarize documents for RAG indexing |
| `rag-answer` | Generate answers from retrieved context |
| `natural-language-query` | Convert natural language to structured queries |

### Sprint 9 Templates

| Template ID | Purpose |
|-------------|---------|
| `field-extraction` | Extract field values from free-text input |
| `field-extraction-batch` | Batch extraction from multiple records |
| `entity-recognition` | Recognize financial entities (CPF, CNPJ, PIX keys) |
| `business-rule-validation` | Validate data against business rules |
| `cross-field-validation` | Validate cross-field dependencies |
| `rag-validation-context` | Generate RAG queries for validation context |
| `contextual-validation` | Validate using RAG document context |

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API URL |
| `OLLAMA_DEFAULT_MODEL` | `llama3.2` | Default chat model |
| `OLLAMA_EMBEDDING_MODEL` | `nomic-embed-text` | Embedding model |
| `OLLAMA_TIMEOUT` | `120` | Request timeout (seconds) |
| `VALKEY_URL` | `redis://localhost:6379` | Valkey/Redis URL |
| `LOG_LEVEL` | `INFO` | Logging level |

## Architecture

```
llm-gateway/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration with Pydantic Settings
│   ├── api/                  # API routers
│   │   ├── health.py        # Health checks
│   │   ├── models.py        # Model management
│   │   ├── templates.py     # Prompt templates
│   │   └── chat.py          # Chat completions
│   ├── models/               # Pydantic models
│   │   ├── chat.py          # Chat request/response
│   │   ├── model.py         # Model info
│   │   └── template.py      # Template definitions
│   ├── services/             # Business logic
│   │   ├── ollama.py        # Ollama client
│   │   └── prompt_manager.py # Template management
│   └── templates/
│       └── prompts/         # Custom templates (JSON)
├── tests/                    # Unit tests
├── Dockerfile               # Production Docker image
├── pyproject.toml           # Project configuration
└── README.md
```

## Usage Examples

### Chat Completion

```bash
curl -X POST http://localhost:8001/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "What is BACEN?"}
    ],
    "temperature": 0.7
  }'
```

### Validate Field

```bash
curl -X POST "http://localhost:8001/api/v1/chat/validate?field_name=cpf&field_type=cpf&value=123.456.789-00"
```

### Render Template

```bash
curl -X POST http://localhost:8001/api/v1/templates/render \
  -H "Content-Type: application/json" \
  -d '{
    "template_id": "field-validation",
    "variables": {
      "field_name": "email",
      "field_type": "email",
      "value": "test@example.com",
      "rules": "Must be corporate email"
    }
  }'
```

### Suggest Fields for ObjectType

```bash
curl -X POST "http://localhost:8001/api/v1/chat/suggest-fields?object_type_name=Customer&description=Bank%20customer%20entity&domain=Banking"
```

## Development

### Running Tests

```bash
pytest tests/ -v --cov=app
```

### Linting

```bash
ruff check app/
ruff format app/
```

### Type Checking

```bash
mypy app/
```

## Sprint 8 Deliverables

This service was implemented as part of Sprint 8 (LLM Gateway Service):

- US-037: Python FastAPI Service Setup ✅
- US-038: Ollama Integration ✅
- US-039: Model Management ✅
- US-040: Prompt Template System ✅
- US-041: LLM Gateway API ✅

## Sprint 9 Deliverables

LLM Validation Engine features added in Sprint 9:

- US-042: Field Extraction Prompts ✅
- US-043: Business Rules Validation ✅
- US-044: RAG Query Integration ✅
- US-045: Validation Feedback UI ✅
- US-046: LLM Monitoring & Logging ✅

### Sprint 9 Usage Examples

#### Extract Fields from Free-Text

```bash
curl -X POST http://localhost:8001/api/v1/validation/extract-fields \
  -H "Content-Type: application/json" \
  -d '{
    "object_type_name": "Customer",
    "object_type_description": "Bank customer entity",
    "fields": [
      {"name": "cpf", "type": "cpf", "description": "Customer CPF", "required": true},
      {"name": "name", "type": "text", "description": "Full name", "required": true},
      {"name": "email", "type": "email", "description": "Email address", "required": false}
    ],
    "input_text": "O cliente Joao Silva, CPF 123.456.789-00, email joao@example.com"
  }'
```

#### Validate Business Rules

```bash
curl -X POST http://localhost:8001/api/v1/validation/validate-business-rules \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "cpf": "123.456.789-00",
      "transaction_amount": 50000,
      "pix_key_type": "cpf"
    },
    "object_type": "PixTransaction",
    "operation": "create"
  }'
```

#### Recognize Financial Entities

```bash
curl -X POST http://localhost:8001/api/v1/validation/recognize-entities \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Transferir R$ 1.500,00 para o CPF 123.456.789-00 via PIX"
  }'
```

#### Get LLM Metrics

```bash
curl http://localhost:8001/api/v1/monitoring/metrics
```

## License

Proprietary - intelliCore Platform
