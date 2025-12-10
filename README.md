# SuperCore - Universal Entity Management Platform

[![Backend CI](https://github.com/lbpay/supercore/workflows/Backend%20CI/badge.svg?branch=main)](https://github.com/lbpay/supercore/actions/workflows/backend-ci.yml)
[![Code Quality](https://github.com/lbpay/supercore/workflows/Code%20Quality/badge.svg?branch=main)](https://github.com/lbpay/supercore/actions/workflows/code-quality.yml)
[![codecov](https://codecov.io/gh/lbpay/supercore/branch/main/graph/badge.svg)](https://codecov.io/gh/lbpay/supercore)
[![Go Version](https://img.shields.io/badge/Go-1.23-blue.svg)](https://golang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **A meta-platform for creating Core Banking systems in days, not months.**

SuperCore is not a Core Banking implementation - it's a **platform creator** that enables Product and Compliance teams to build complete Core Banking solutions through natural language and visual interfaces, without writing code.

## 🎯 Core Philosophy

**First, the platform must know who it is.**

The **Oracle** is SuperCore's consciousness - it knows its identity (CNPJ, licenses, capabilities) before processing any transactions. This self-awareness enables dynamic compliance and intelligent decision-making.

Then, everything becomes an object:
- **Identity** (corporate identity, licenses) = Oracle Objects
- **Data** (accounts, customers, transactions) = Objects
- **Rules** (BACEN regulations) = Objects
- **Policies** (risk policies) = Objects
- **Integrations** (TigerBeetle, PIX, anti-fraud) = Objects
- **Logic** (custom algorithms) = Objects

## 🏗️ Architecture

SuperCore implements a **Universal Entity Management Machine** with 4 core tables:

1. **object_definitions** - The DNA (blueprints for all objects)
2. **instances** - The Cells (living entities from blueprints)
3. **relationships** - The Synapses (connections between instances)
4. **validation_rules** - The Rule Library (reusable validations)

### The Body Analogy

- `Oracle` = Self-awareness / Consciousness
- `object_definitions` = DNA encoding
- `instances` = Living cells
- `relationships` = Neural connections
- `validation_rules` = Immune system
- `RAG system` = Nervous system

## 🔄 CI/CD Pipeline

This project includes comprehensive automated testing, quality checks, and deployment pipelines:

### Workflows Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Backend CI** | Push/PR to `main`, `develop` | Lint, test, build verification |
| **Backend CD - Dev** | Push to `develop` | Deploy to Dev environment |
| **Backend CD - Prod** | Push to `main` | Production deployment with approval gates |
| **Code Quality** | Daily + on demand | SonarQube, complexity, coverage analysis |
| **Documentation** | Changes to docs/backend | API docs, GoDoc, changelog generation |
| **Maintenance** | Weekly/Monthly | Dependency updates, vulnerability scans |

### Backend CI Workflow
- ✅ **Lint & Format**: golangci-lint, go fmt, go vet
- ✅ **Security**: gosec vulnerability scanning
- ✅ **Tests**: Unit tests with race detection and coverage
- ✅ **Coverage**: HTML reports uploaded to Codecov
- ✅ **Cross-platform Build**: Linux, macOS, Windows verification
- ✅ **Integration Tests**: Full stack tests with PostgreSQL
- ✅ **Performance**: Benchmark comparisons on PRs

### Deployment Pipelines
- **Dev Deployment**: Automatic push to develop
- **QA Deployment**: Triggered with `[deploy-qa]` commit message
- **Production Deployment**: Blue-Green with canary testing
  - Approval gate before production
  - Automated rollback on failure
  - Gradual traffic shifting (10% → 50% → 100%)

### Code Quality Checks
- SonarQube static analysis
- Cyclomatic complexity checks
- Test coverage trending
- Dependency vulnerability scanning
- License compliance verification

### Local CI/CD

Run checks locally before pushing:

```bash
# Lint
cd backend && golangci-lint run ./...

# Format check
go fmt ./...
go vet ./...

# Test with coverage
go test -v -race -covermode=atomic -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Security scan
gosec ./...

# Build verification
go build -v ./cmd/api
```

See [.github/workflows](.github/workflows) for detailed workflow configurations.

## 🚀 Phase 1: Foundation (Current)

### What's Included

✅ **Complete Database Schema**
- PostgreSQL 15+ with JSONB support
- Full-text search with `tsvector`
- Audit trail for compliance
- 30+ BACEN-compliant validation rules seeded

✅ **Go REST API (1.21+)**
- Oracle consciousness API (identity, licenses, status, whoami)
- Full CRUD for object_definitions
- Full CRUD for instances with state machine
- Relationships management
- Validation rules management
- Health checks and observability

✅ **State Machine Engine**
- Finite State Machine (FSM) for all instances
- Configurable states and transitions
- State history tracking

✅ **JSON Schema Validation**
- Draft 7 compliance
- Custom validation rules
- Extensible rule engine

### Tech Stack

**Backend:**
- Go 1.21+
- Gin framework
- pgx (PostgreSQL driver)
- gojsonschema

**Database:**
- PostgreSQL 15+
- pgvector (for future RAG)

**Frontend:** (Coming in next phase)
- Next.js 14+
- React 18+
- shadcn/ui
- React Flow

## 📦 Project Structure

```
supercore/
├── backend/
│   ├── cmd/
│   │   └── api/
│   │       └── main.go              # Application entry point
│   ├── internal/
│   │   ├── database/
│   │   │   └── db.go                # Database connection pool
│   │   ├── handlers/
│   │   │   ├── oracle.go            # Oracle consciousness API
│   │   │   ├── object_definition.go # Object definitions CRUD
│   │   │   ├── instance.go          # Instances CRUD + FSM
│   │   │   ├── relationship.go      # Relationships CRUD
│   │   │   ├── validation_rule.go   # Validation rules CRUD
│   │   │   └── nl_assistant.go      # Natural Language Assistant
│   │   ├── middleware/
│   │   │   └── middleware.go        # CORS, logging, errors
│   │   ├── models/
│   │   │   ├── object_definition.go # Data models
│   │   │   ├── instance.go
│   │   │   ├── relationship.go
│   │   │   └── validation_rule.go
│   │   └── services/
│   │       ├── statemachine/
│   │       │   └── statemachine.go  # FSM engine
│   │       └── validator/
│   │           └── validator.go     # Validation engine
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── database/
│   ├── migrations/
│   │   └── 001_initial_schema.sql   # Complete schema
│   └── seeds/
│       ├── 002_validation_rules_seed.sql  # BACEN rules
│       └── 003_oraculo_seed.sql     # Oracle consciousness
├── frontend/                         # (Next phase)
├── docs/
│   ├── CLAUDE.md                    # Implementation bible
│   ├── fase1/
│   │   ├── FASE_1_ESCOPO_TECNICO_COMPLETO.md
│   │   ├── IMPLEMENTATION_STATUS.md
│   │   └── ORACULO_CONSCIENCIA_DA_PLATAFORMA.md
│   └── api/examples/
│       ├── 00-oracle-whoami.md      # Oracle usage examples
│       ├── 01-create-conta-corrente-definition.json
│       └── ...
├── docker-compose.yml
├── .env.example
└── README.md (this file)
```

## 🚦 Getting Started

### Prerequisites

- Docker & Docker Compose
- Go 1.21+ (for local development)
- PostgreSQL 15+ (if not using Docker)

### Quick Start with Docker

1. **Clone the repository**
```bash
git clone <repository-url>
cd supercore
```

2. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your API keys (CLAUDE_API_KEY, OPENAI_API_KEY)
```

3. **Start all services**
```bash
docker-compose up -d
```

4. **Verify services are running**
```bash
# Check backend health
curl http://localhost:8080/health

# Ask the Oracle "Who am I?" to verify full initialization
curl http://localhost:8080/api/v1/oracle/whoami

# Check database
docker-compose logs postgres
```

5. **Access the API**
- API: http://localhost:8080
- Health: http://localhost:8080/health
- Oracle: http://localhost:8080/api/v1/oracle/whoami
- Swagger docs: http://localhost:8080/swagger (coming soon)

### Local Development (without Docker)

1. **Set up PostgreSQL**
```bash
# Install PostgreSQL 15+
# Create database
createdb supercore

# Run migrations
psql supercore < database/migrations/001_initial_schema.sql
psql supercore < database/seeds/002_validation_rules_seed.sql
psql supercore < database/seeds/003_oraculo_seed.sql
```

2. **Run the backend**
```bash
cd backend
go mod download
go run cmd/api/main.go
```

## 📚 API Documentation

### 🧠 Oracle - Platform Consciousness

The Oracle is SuperCore's self-awareness system. It knows the platform's identity, licenses, and capabilities.

```bash
# Ask the platform "Who am I?"
curl http://localhost:8080/api/v1/oracle/whoami
# Response: "Eu sou LBPAY (CNPJ: 12.345.678/0001-90), uma instituição financeira..."

# Get corporate identity
curl http://localhost:8080/api/v1/oracle/identity

# Get active BACEN licenses
curl http://localhost:8080/api/v1/oracle/licenses

# Get complete platform status
curl http://localhost:8080/api/v1/oracle/status
```

**Why Oracle?** Instead of hardcoding company information, the platform **knows who it is**. This enables:
- Dynamic compliance checks based on actual licenses
- Multi-tenancy (each tenant has their own Oracle)
- AI assistants that accurately represent platform capabilities
- Single source of truth for all business logic

See [Oracle API Examples](docs/api/examples/00-oracle-whoami.md) for detailed usage.

---

### Object Definitions

```bash
# Create an object definition
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "conta_corrente",
    "display_name": "Conta Corrente PF",
    "category": "BUSINESS_ENTITY",
    "schema": {
      "type": "object",
      "required": ["cpf", "nome", "saldo"],
      "properties": {
        "cpf": {"type": "string"},
        "nome": {"type": "string"},
        "saldo": {"type": "number"}
      }
    }
  }'

# List all object definitions
curl http://localhost:8080/api/v1/object-definitions

# Get single object definition
curl http://localhost:8080/api/v1/object-definitions/{id}
```

### Instances

```bash
# Create an instance
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "{uuid}",
    "data": {
      "cpf": "12345678901",
      "nome": "João Silva",
      "saldo": 1000.00
    }
  }'

# List instances
curl http://localhost:8080/api/v1/instances?object_definition_id={uuid}

# Transition state
curl -X POST http://localhost:8080/api/v1/instances/{id}/transition \
  -H "Content-Type: application/json" \
  -d '{
    "to_state": "ACTIVE",
    "reason": "Completed KYC verification"
  }'
```

### Relationships

```bash
# Create a relationship
curl -X POST http://localhost:8080/api/v1/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "relationship_type": "OWNS",
    "source_instance_id": "{customer_uuid}",
    "target_instance_id": "{account_uuid}",
    "properties": {
      "ownership_percentage": 100
    }
  }'

# Get relationships for an instance
curl http://localhost:8080/api/v1/instances/{id}/relationships
```

## 🎓 Core Concepts

### 1. Object Definitions (The DNA)

Object definitions are blueprints that define:
- **Schema**: JSON Schema Draft 7 for data structure
- **States**: FSM configuration (states + transitions)
- **Rules**: Validation rules to enforce
- **UI Hints**: How to render forms
- **Relationships**: Allowed connections to other objects

Example:
```json
{
  "name": "conta_corrente",
  "schema": { ... JSON Schema ... },
  "states": {
    "initial": "DRAFT",
    "states": ["DRAFT", "ACTIVE", "SUSPENDED", "CLOSED"],
    "transitions": [
      {"from": "DRAFT", "to": "ACTIVE"},
      {"from": "ACTIVE", "to": "SUSPENDED"},
      {"from": "SUSPENDED", "to": "ACTIVE"},
      {"from": "ACTIVE", "to": "CLOSED"}
    ]
  }
}
```

### 2. Instances (The Living Cells)

Instances are actual data entities created from object definitions:
- Data validated against the schema
- Current state tracked by FSM
- Complete audit trail in state_history
- Soft delete support

### 3. Meta-Objects (The Game Changer)

SuperCore treats **everything** as objects:

**Type 1: Business Rules (BACEN)**
```json
{
  "object_definition": "regra_bacen",
  "instance": {
    "nome": "Circular 3.978 - PLD/FT",
    "url_manual": "https://...",
    "regras_extraidas": [ ... ]
  }
}
```

**Type 2: Internal Policies**
```json
{
  "object_definition": "politica_risco",
  "instance": {
    "nome": "Limite de Crédito PF",
    "algoritmo": "score_based",
    "parametros": { ... }
  }
}
```

**Type 3: External Integrations**
```json
{
  "object_definition": "integracao_externa",
  "instance": {
    "nome_servico": "TigerBeetle Ledger",
    "tipo": "TCP_SOCKET",
    "endpoints": [ ... ],
    "auth": { ... }
  }
}
```

**Type 4: Custom Business Logic**
```json
{
  "object_definition": "logica_customizada",
  "instance": {
    "nome": "Cálculo de IOF",
    "linguagem": "javascript",
    "codigo": "function calcularIOF(valor, dias) { ... }"
  }
}
```

## 🛡️ Security & Compliance

- **Audit Trail**: Every change logged in `audit_log` table
- **Soft Deletes**: Data never truly deleted, only marked
- **BACEN Validations**: 30+ pre-seeded validation rules
- **PLD/FT Checks**: PEP, sanctions lists, transaction limits
- **Role-Based Access**: (Coming in Phase 2)

## 📊 Database Schema Highlights

### Key Features

1. **JSONB Storage**: Flexible schema-less data with schema validation
2. **Full-Text Search**: Portuguese-optimized tsvector indexes
3. **GIN Indexes**: Fast JSONB queries
4. **Triggers**: Automatic updated_at timestamps, audit logging
5. **Constraints**: Referential integrity, no self-loops

### Sample Queries

```sql
-- Find all active checking accounts
SELECT * FROM instances
WHERE object_definition_id = (
  SELECT id FROM object_definitions WHERE name = 'conta_corrente'
)
AND current_state = 'ACTIVE'
AND is_deleted = false;

-- Full-text search in instance data
SELECT * FROM instances
WHERE search_vector @@ to_tsquery('portuguese', 'joão & silva');

-- Get all relationships for a customer
SELECT * FROM relationships
WHERE source_instance_id = '{customer_uuid}'
   OR target_instance_id = '{customer_uuid}';
```

## 🎨 UI/UX Vision (Phase 2)

### 3-Layer Complexity Model

**Layer 1 (80% of users) - Visual Templates**
- Pre-built templates with checkboxes
- "Create Checking Account" wizard
- No technical knowledge required

**Layer 2 (15% of users) - Drag & Drop**
- Visual schema builder (like Retool)
- FSM designer with React Flow
- Point-and-click rule creation

**Layer 3 (5% of users) - Code Editor**
- Monaco editor with syntax highlighting
- Direct JSON Schema editing
- Advanced users and edge cases

## 🔮 Roadmap

### ✅ Phase 1: Foundation (Q1 2025) - IN PROGRESS
- Database schema
- Go REST API
- State machine engine
- Basic validation

### 📅 Phase 2: Backoffice UI (Q2 2025)
- Next.js frontend
- Natural Language Assistant (7 questions to create objects)
- Dynamic form generation
- Graph visualization (React Flow)

### 📅 Phase 3: RAG & Intelligence (Q3 2025)
- Vector store (pgvector)
- Trimodal RAG (SQL + Graph + Vector)
- Document ingestion (BACEN manuals)
- Intelligent query answering

### 📅 Phase 4: Production Hardening (Q4 2025)
- Multi-tenancy
- Role-based access control
- Performance optimization
- Compliance reports

## 🤝 Contributing

This project is developed using **AI-driven development** with Claude Code. The squad consists of specialized AI agents:

- **Scrum Master** (tdd-orchestrator)
- **Backend Architect** (backend-architect)
- **Golang Pro** (golang-pro)
- **Database Architect** (database-architect)
- **Frontend Developer** (frontend-developer)
- **AI Engineer** (ai-engineer)
- **Test Automator** (test-automator)

See [FASE_1_ESCOPO_TECNICO_COMPLETO.md](FASE_1_ESCOPO_TECNICO_COMPLETO.md) for the complete technical specification.

## 📖 Documentation

- [CLAUDE.md](CLAUDE.md) - The implementation bible
- [CI/CD Pipeline](docs/CI_CD_PIPELINE.md) - GitHub Actions workflow documentation
- [FASE_1_ESCOPO_TECNICO_COMPLETO.md](FASE_1_ESCOPO_TECNICO_COMPLETO.md) - Phase 1 complete scope
- [OBJETIVO_FUNCIONAL_DA_PLATAFORMA.md](VisaoEscopo/OBJETIVO_FUNCIONAL_DA_PLATAFORMA.md) - Functional objectives

## 📜 License

[Add your license here]

## 🙏 Acknowledgments

Built with:
- [Go](https://golang.org/)
- [Gin](https://gin-gonic.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Claude AI](https://www.anthropic.com/claude)
- [Next.js](https://nextjs.org/) (coming soon)

---

**Made with ❤️ by the SuperCore AI Squad**

*Creating Core Banking systems in days, not months.*
