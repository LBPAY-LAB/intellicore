# SuperCore - Universal Entity Management Platform

[![Backend CI](https://github.com/lbpay/supercore/workflows/Backend%20CI/badge.svg?branch=main)](https://github.com/lbpay/supercore/actions/workflows/backend-ci.yml)
[![Code Quality](https://github.com/lbpay/supercore/workflows/Code%20Quality/badge.svg?branch=main)](https://github.com/lbpay/supercore/actions/workflows/code-quality.yml)
[![codecov](https://codecov.io/gh/lbpay/supercore/branch/main/graph/badge.svg)](https://codecov.io/gh/lbpay/supercore)
[![Go Version](https://img.shields.io/badge/Go-1.23-blue.svg)](https://golang.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **"Creating Core Banking systems in days, not months."**

SuperCore is a revolutionary **meta-platform** that enables Product and Compliance teams to build complete Core Banking solutions through natural language and visual interfaces, without writing code.

## Table of Contents

- [What Is SuperCore?](#what-is-supercore)
- [Core Philosophy](#core-philosophy)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [Core Concepts](#core-concepts)
- [API Examples](#api-examples)
- [CI/CD Pipeline](#cicd-pipeline)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## What Is SuperCore?

SuperCore is not a Core Banking implementation - it's a **Universal Entity Management Machine** that creates Core Banking systems:

```
Traditional Approach:               SuperCore Approach:
6-12 months of coding      →       3-7 days of configuration
Developers writing code    →       Product teams using natural language
Rigid database schema      →       Dynamic object definitions
Business logic in code     →       Rules as data
```

### The Revolutionary Concept

We're building a machine that:

1. **Receives**: Natural language descriptions of business objects
2. **Generates**: Abstract definitions with schemas, validations, and state machines
3. **Creates**: Living instances that respect their definitions
4. **Relates**: Connects entities through a semantic graph
5. **Reasons**: RAG trimodal system (SQL + Graph + Vector) that understands everything

### The Body Analogy

```
object_definitions = DNA/Genoma
    ↓
instances = Living Cells
    ↓
relationships = Neural Synapses
    ↓
RAG = Nervous System
    ↓
Oracle = Self-Awareness/Consciousness
```

## Core Philosophy

**First, the platform must know who it is.**

The **Oracle** is SuperCore's consciousness - it knows its identity (CNPJ, licenses, capabilities) before processing any transactions. This self-awareness enables:

- Dynamic compliance based on actual licenses
- Multi-tenancy support (each tenant has their own Oracle)
- AI assistants that accurately represent platform capabilities
- Single source of truth for all business logic

Then, **everything becomes an object**:

- **Identity** (corporate identity, licenses) = Oracle Objects
- **Data** (accounts, customers, transactions) = Business Objects
- **Rules** (BACEN regulations) = Rule Objects
- **Policies** (risk policies) = Policy Objects
- **Integrations** (TigerBeetle, PIX, anti-fraud) = Integration Objects
- **Logic** (custom algorithms) = Logic Objects

## Key Features

### Core Capabilities

- **Oracle Consciousness**: Self-aware platform identity system
- **Object Definitions**: Create entity types via natural language
- **Dynamic UI**: Forms 100% generated from JSON Schema
- **State Machine**: Configurable lifecycle for each object
- **Relationship Graph**: Semantic navigation with validation
- **Natural Language Assistant**: Create objects through conversation
- **RAG Trimodal**: SQL + Graph + Vector for intelligent queries
- **BACEN Validation Library**: 30+ pre-seeded compliance rules
- **Audit Trail**: Complete change history for compliance
- **Multi-tenant Ready**: Oracle-based isolation

### Technical Features

- **JSON Schema Validation**: Draft 7 compliance
- **PostgreSQL 15+**: JSONB, full-text search, pgvector
- **Go 1.23+**: High-performance REST API
- **State Machine Engine**: FSM with conditions and history
- **Relationship Validation**: Cardinality and type checking
- **Soft Deletes**: Data preservation for audit
- **Graceful Shutdown**: Zero-downtime deployments
- **Observability**: Health checks, metrics, logging

## Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────┐
│                  FRONTEND (Next.js 14)                     │
│  - Natural Language Assistant  - Dynamic Forms             │
│  - Graph Visualization  - Backoffice CRUD                  │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   BACKEND (Go 1.23 / Gin)                  │
│  - Oracle API  - Object Definitions  - Instances           │
│  - Relationships  - State Machine  - Validation            │
│  - RAG Orchestrator  - Embedding Service                   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                        DATA LAYER                          │
│  PostgreSQL 15   |   Redis Cache   |   pgvector            │
│  Nebula Graph (future)  |  TigerBeetle Ledger (future)    │
└────────────────────────────────────────────────────────────┘
```

### 4-Table Foundation

SuperCore's power comes from just 4 core tables:

1. **object_definitions** - The DNA (blueprints for all objects)
2. **instances** - The Living Cells (entities from blueprints)
3. **relationships** - The Synapses (connections between instances)
4. **validation_rules** - The Rule Library (reusable validations)

Everything else is data, not code.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Go 1.23+ (for local development)
- PostgreSQL 15+ (if not using Docker)
- OpenAI or Claude API key (for AI features)

### Installation (Docker)

```bash
# 1. Clone the repository
git clone <repository-url>
cd supercore

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your API keys:
# - OPENAI_API_KEY or CLAUDE_API_KEY
# - DATABASE_URL (default works for Docker)

# 3. Start all services
docker-compose up -d

# 4. Wait for services to be healthy (30-60 seconds)
docker-compose ps

# 5. Verify backend health
curl http://localhost:8080/health

# 6. Ask the Oracle "Who am I?"
curl http://localhost:8080/api/v1/oracle/whoami
```

Expected Oracle response:
```json
{
  "message": "Eu sou LBPAY (CNPJ: 12.345.678/0001-90), uma instituição de pagamento licenciada pelo Banco Central do Brasil...",
  "identity": {...},
  "licenses": [...],
  "integrations": [...],
  "timestamp": "2024-12-10T00:00:00Z"
}
```

### Installation (Local Development)

```bash
# 1. Set up PostgreSQL
createdb supercore

# 2. Run migrations
psql supercore < database/migrations/001_initial_schema.sql
psql supercore < database/seeds/002_validation_rules_seed.sql
psql supercore < database/seeds/003_oraculo_seed.sql

# 3. Set up environment
cp .env.example .env
# Edit DATABASE_URL and API keys

# 4. Run backend
cd backend
go mod download
go run cmd/api/main.go

# 5. Verify
curl http://localhost:8080/health
```

### First Steps

1. **Explore the Oracle**: See what the platform knows about itself
   ```bash
   curl http://localhost:8080/api/v1/oracle/identity
   curl http://localhost:8080/api/v1/oracle/licenses
   curl http://localhost:8080/api/v1/oracle/status
   ```

2. **List Pre-configured Objects**: See example object definitions
   ```bash
   curl http://localhost:8080/api/v1/object-definitions
   ```

3. **Create Your First Instance**: Use an existing definition
   ```bash
   # Get object definition ID first
   curl http://localhost:8080/api/v1/object-definitions | jq

   # Create instance
   curl -X POST http://localhost:8080/api/v1/instances \
     -H "Content-Type: application/json" \
     -d '{
       "object_definition_id": "<uuid-from-above>",
       "data": {
         "name": "Test Instance",
         "description": "My first instance"
       }
     }'
   ```

4. **Use Natural Language Assistant**: Create new objects via conversation
   ```bash
   curl -X POST http://localhost:8080/api/v1/assistant/chat \
     -H "Content-Type: application/json" \
     -d '{
       "message": "I want to create a Customer object with CPF, name, and email"
     }'
   ```

## Documentation

### For Users

- **[Getting Started Guide](Docs/user-guide/01-getting-started.md)** - Your first steps with SuperCore
- **[Creating Object Definitions](Docs/user-guide/02-object-definitions.md)** - How to create entity types
- **[Managing Instances](Docs/user-guide/03-instances.md)** - Working with data
- **[Understanding Relationships](Docs/user-guide/04-relationships.md)** - Connecting entities
- **[State Machines](Docs/user-guide/05-state-machines.md)** - Lifecycle management
- **[Using RAG Search](Docs/user-guide/06-rag-search.md)** - Natural language queries

### For Developers

- **[API Reference](Docs/api/README.md)** - Complete API documentation
- **[Development Guide](Docs/dev-guide/development.md)** - Local development setup
- **[Architecture Overview](Docs/architecture/overview.md)** - System design
- **[Database Schema](Docs/architecture/database.md)** - Data model details
- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute

### For Operations

- **[Deployment Guide](Docs/ops/deployment.md)** - Production deployment
- **[Troubleshooting](Docs/ops/troubleshooting.md)** - Common issues and solutions
- **[Monitoring](Docs/ops/monitoring.md)** - Observability setup
- **[Backup & Recovery](Docs/ops/backup.md)** - Data protection

### Project Documentation

> **⭐⭐⭐ START HERE**: Before diving into any documentation, read the **[VISÃO FINAL CONSOLIDADA](docs/architecture/VISAO_FINAL_CONSOLIDADA.md)** - this is the master architecture document that consolidates everything: AI-Driven Context Generator (6 phases), RAG Trimodal Híbrido, 3 Pilares da Dynamic UI, integration with external gateways, and the complete 33-week roadmap.

**Core Documentation**:
- **[VISAO_FINAL_CONSOLIDADA.md](docs/architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ **Master architecture document** (read this first!)
- **[CLAUDE.md](CLAUDE.md)** - Implementation guide for AI agents
- **[Visão de Arquitetura](docs/architecture/visao_arquitetura.md)** - Strategic architecture overview
- **[Stack Tecnológico](docs/architecture/stack_tecnologico_fases.md)** - Technology stack by phase
- **[Backlog Geral](docs/backlog/backlog_geral.md)** - Project roadmap and status

**Phase-Specific Documentation**:
- **[Phase 1 Specifications](docs/fases/fase1/01_especificacoes.md)** - Foundation phase specifications
- **[Squad & Agents](docs/fases/fase1/06_squad_agents.md)** - Team composition and agent roles
- **[Sprint 1 Complete](docs/fases/fase1/SPRINT_1_COMPLETE.md)** - Backend API implementation status

## Project Structure

```
supercore/
├── backend/                        # Go REST API
│   ├── cmd/
│   │   └── api/
│   │       └── main.go             # Application entry point
│   ├── internal/
│   │   ├── config/                 # Configuration management
│   │   ├── database/               # Database connection pool
│   │   ├── handlers/               # HTTP request handlers
│   │   │   ├── oracle.go           # Oracle consciousness API
│   │   │   ├── object_definition.go
│   │   │   ├── instance.go
│   │   │   ├── relationship.go
│   │   │   ├── validation_rule.go
│   │   │   ├── nl_assistant.go
│   │   │   └── search_handler.go
│   │   ├── middleware/             # HTTP middleware
│   │   ├── models/                 # Data models
│   │   ├── services/               # Business logic
│   │   │   ├── statemachine/       # FSM engine
│   │   │   ├── validator/          # Validation engine
│   │   │   ├── llm/                # LLM client (OpenAI/Claude)
│   │   │   ├── embeddings/         # Embedding service
│   │   │   └── rag/                # RAG orchestrator
│   │   └── validation/             # Validation rule executors
│   ├── go.mod
│   └── Dockerfile
├── database/                       # Database schemas and seeds
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Complete schema
│   └── seeds/
│       ├── 002_validation_rules_seed.sql
│       └── 003_oraculo_seed.sql
├── frontend/                       # Next.js 14 (Phase 2)
├── monitoring/                     # Grafana + Prometheus
├── scripts/                        # Utility scripts
├── Docs/                           # Documentation
│   ├── api/                        # API documentation
│   ├── user-guide/                 # End-user guides
│   ├── dev-guide/                  # Developer guides
│   ├── ops/                        # Operations guides
│   ├── architecture/               # Architecture docs
│   └── fase1/                      # Phase 1 project docs
├── .github/workflows/              # CI/CD pipelines
├── docker-compose.yml
├── .env.example
├── CLAUDE.md                       # Implementation bible
├── CONTRIBUTING.md
└── README.md
```

## Core Concepts

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
  "display_name": "Conta Corrente PF",
  "category": "BUSINESS_ENTITY",
  "schema": {
    "type": "object",
    "required": ["account_number", "cpf", "balance"],
    "properties": {
      "account_number": {
        "type": "string",
        "pattern": "^[0-9]{5}-[0-9]$"
      },
      "cpf": {
        "type": "string",
        "pattern": "^[0-9]{11}$"
      },
      "balance": {
        "type": "number",
        "minimum": 0
      }
    }
  },
  "states": {
    "initial": "DRAFT",
    "states": ["DRAFT", "ACTIVE", "SUSPENDED", "CLOSED"],
    "transitions": [
      {
        "from": "DRAFT",
        "to": "ACTIVE",
        "conditions": ["kyc_approved"]
      },
      {
        "from": "ACTIVE",
        "to": "SUSPENDED",
        "conditions": []
      },
      {
        "from": "ACTIVE",
        "to": "CLOSED",
        "conditions": ["balance_zero"]
      }
    ]
  }
}
```

### 2. Instances (The Living Cells)

Instances are real data entities created from object definitions:

- Data validated against the schema
- Current state tracked by FSM
- Complete audit trail in state_history
- Soft delete support
- Full-text search enabled

Example:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "object_definition_id": "660e8400-e29b-41d4-a716-446655440000",
  "data": {
    "account_number": "12345-6",
    "cpf": "12345678901",
    "balance": 1000.00
  },
  "current_state": "ACTIVE",
  "state_history": [
    {
      "state": "DRAFT",
      "timestamp": "2024-01-01T10:00:00Z",
      "reason": "Account created"
    },
    {
      "state": "ACTIVE",
      "timestamp": "2024-01-02T14:30:00Z",
      "reason": "KYC approved"
    }
  ]
}
```

### 3. Relationships (The Synapses)

Relationships connect instances with typed, validated connections:

- **Type validation**: Only allowed relationship types
- **Cardinality validation**: ONE_TO_ONE, ONE_TO_MANY, MANY_TO_MANY
- **Properties**: Additional metadata on relationships
- **Temporal support**: valid_from and valid_until

Example:
```json
{
  "relationship_type": "OWNS",
  "source_instance_id": "customer-uuid",
  "target_instance_id": "account-uuid",
  "properties": {
    "ownership_percentage": 100,
    "since": "2024-01-01"
  },
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": null
}
```

### 4. Meta-Objects (The Game Changer)

SuperCore treats **everything** as objects, not just business data:

**Type 1: BACEN Rules**
```json
{
  "object_definition": "regra_bacen",
  "instance": {
    "codigo_normativo": "Circular 3.978",
    "titulo": "PLD/FT - Limites Transacionais",
    "dominio": "PIX",
    "regras_executaveis": [...]
  }
}
```

**Type 2: Risk Policies**
```json
{
  "object_definition": "politica_risco",
  "instance": {
    "nome": "Aprovação Automática Premium",
    "criterios": [...],
    "score_minimo": 750
  }
}
```

**Type 3: External Integrations**
```json
{
  "object_definition": "integracao_externa",
  "instance": {
    "nome_servico": "TigerBeetle Ledger",
    "tipo_integracao": "TCP_SOCKET",
    "endpoints": [...],
    "circuit_breaker": {...}
  }
}
```

**Type 4: Custom Business Logic**
```json
{
  "object_definition": "logica_customizada",
  "instance": {
    "nome": "Cálculo Tarifas Dinâmico",
    "linguagem": "javascript",
    "codigo": "function calcular(valor, tipo) {...}"
  }
}
```

### 5. Oracle (The Consciousness)

The Oracle is SuperCore's self-awareness system:

```
Eu sou LBPAY
├── CNPJ: 12.345.678/0001-90
├── Instituição de Pagamento (Licença BACEN: 12345678)
├── Participante Direto PIX (ISPB: 12345678)
├── Operando sob:
│   ├── Circular BACEN 3.978 (PLD/FT)
│   ├── Resolução BACEN 80 (IPs)
│   └── Regulamento PIX
├── Integrado com:
│   ├── BACEN SPI (PIX)
│   ├── TigerBeetle (Ledger)
│   └── Data Rudder (Anti-Fraude)
└── Capabilities:
    ├── PIX: Enviar/Receber
    ├── TED: Sim
    ├── Boleto: Sim
    └── Cartão: Não
```

## API Examples

### Oracle - Platform Consciousness

```bash
# Ask "Who am I?"
curl http://localhost:8080/api/v1/oracle/whoami

# Get corporate identity
curl http://localhost:8080/api/v1/oracle/identity

# Get BACEN licenses
curl http://localhost:8080/api/v1/oracle/licenses

# Get complete status
curl http://localhost:8080/api/v1/oracle/status
```

### Object Definitions

```bash
# List all definitions
curl http://localhost:8080/api/v1/object-definitions

# Get specific definition
curl http://localhost:8080/api/v1/object-definitions/{id}

# Create new definition
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d @examples/conta-corrente-definition.json

# Get schema only
curl http://localhost:8080/api/v1/object-definitions/{id}/schema
```

### Instances

```bash
# List instances
curl "http://localhost:8080/api/v1/instances?object_definition_id={uuid}"

# Create instance
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "{uuid}",
    "data": {
      "account_number": "12345-6",
      "cpf": "12345678901",
      "balance": 1000.00
    }
  }'

# Transition state
curl -X POST http://localhost:8080/api/v1/instances/{id}/transition \
  -H "Content-Type: application/json" \
  -d '{
    "to_state": "ACTIVE",
    "reason": "KYC approved"
  }'

# Get state history
curl http://localhost:8080/api/v1/instances/{id}/history
```

### Relationships

```bash
# Create relationship
curl -X POST http://localhost:8080/api/v1/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "relationship_type": "OWNS",
    "source_instance_id": "{customer-uuid}",
    "target_instance_id": "{account-uuid}",
    "properties": {
      "ownership_percentage": 100
    }
  }'

# Get relationships for instance
curl http://localhost:8080/api/v1/instances/{id}/relationships
```

### Natural Language Assistant

```bash
# Chat with assistant
curl -X POST http://localhost:8080/api/v1/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a Customer object with CPF, name, email, and phone"
  }'

# Generate object definition
curl -X POST http://localhost:8080/api/v1/assistant/generate-object-definition \
  -H "Content-Type: application/json" \
  -d '{
    "description": "A customer account with personal information",
    "fields": ["cpf", "name", "email", "phone", "address"]
  }'
```

### Semantic Search (RAG)

```bash
# Semantic search
curl -X POST http://localhost:8080/api/v1/search/semantic \
  -H "Content-Type: application/json" \
  -d '{
    "query": "customer accounts with balance over 10000",
    "limit": 10
  }'

# Reindex all objects
curl -X POST http://localhost:8080/api/v1/embeddings/reindex-all

# Get embedding stats
curl http://localhost:8080/api/v1/embeddings/stats
```

For more detailed examples, see [API Examples](Docs/api/examples/).

## CI/CD Pipeline

SuperCore includes comprehensive GitHub Actions workflows:

### Workflows Overview

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| **Backend CI** | Push/PR to `main`, `develop` | Lint, test, build verification |
| **Backend CD - Dev** | Push to `develop` | Deploy to Dev environment |
| **Backend CD - Prod** | Push to `main` | Production deployment with approval gates |
| **Code Quality** | Daily + on demand | SonarQube, complexity, coverage analysis |
| **Documentation** | Changes to docs/backend | API docs, GoDoc, changelog generation |
| **Maintenance** | Weekly/Monthly | Dependency updates, vulnerability scans |

### Backend CI Features

- Lint & Format: golangci-lint, go fmt, go vet
- Security: gosec vulnerability scanning
- Tests: Unit tests with race detection and coverage
- Coverage: HTML reports uploaded to Codecov
- Cross-platform Build: Linux, macOS, Windows verification
- Integration Tests: Full stack tests with PostgreSQL
- Performance: Benchmark comparisons on PRs

### Local CI Commands

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

See [CI/CD Documentation](Docs/CI_CD_PIPELINE.md) for details.

## Roadmap

### Phase 1: Foundation (Current - Q1 2025)

**Status**: IN PROGRESS

- [x] Database schema (4 core tables)
- [x] Go REST API with Gin
- [x] Oracle consciousness system
- [x] State machine engine
- [x] Validation rule engine
- [x] Relationship validation
- [x] Natural Language Assistant (basic)
- [x] Semantic search with embeddings
- [x] CI/CD pipeline
- [ ] Frontend (Next.js 14) - Starting
- [ ] Dynamic form generation - Starting
- [ ] Graph visualization - Starting

**Completion**: ~85%

### Phase 2: Backoffice UI (Q2 2025)

- [ ] Next.js 14 frontend complete
- [ ] Natural Language Assistant (7-question wizard)
- [ ] Dynamic form generation from JSON Schema
- [ ] FSM visual designer (React Flow)
- [ ] Graph relationship visualization
- [ ] Object definition templates
- [ ] Bulk import/export
- [ ] Advanced search filters

### Phase 3: RAG & Intelligence (Q3 2025)

- [ ] Vector store optimization (pgvector tuning)
- [ ] Trimodal RAG (SQL + Graph + Vector)
- [ ] Document ingestion (BACEN manuals PDF)
- [ ] Intelligent query answering
- [ ] Recommendation engine
- [ ] Automated compliance checking
- [ ] Nebula Graph integration
- [ ] Knowledge base management

### Phase 4: Production Hardening (Q4 2025)

- [ ] Multi-tenancy support
- [ ] Role-based access control (RBAC)
- [ ] Keycloak integration
- [ ] Performance optimization (10k+ req/s)
- [ ] Horizontal scaling
- [ ] Compliance audit reports
- [ ] TigerBeetle Ledger integration
- [ ] PIX integration (BACEN SPI)
- [ ] Real customer onboarding
- [ ] Production monitoring & alerting

## Contributing

SuperCore is developed using **AI-driven development** with Claude Code. The squad consists of specialized AI agents:

- **Scrum Master** (tdd-orchestrator)
- **Backend Architect** (backend-architect)
- **Golang Pro** (golang-pro)
- **Database Architect** (database-architect)
- **Frontend Developer** (frontend-developer)
- **AI Engineer** (ai-engineer)
- **Test Automator** (test-automator)
- **Documentation Architect** (documentation-architect)

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd supercore

# Backend setup
cd backend
go mod download
go run cmd/api/main.go

# Run tests
go test ./...

# Run with hot reload (using air)
air
```

## License

[MIT License](LICENSE)

## Acknowledgments

Built with:

- [Go](https://golang.org/) - Backend language
- [Gin](https://gin-gonic.com/) - HTTP framework
- [PostgreSQL](https://www.postgresql.org/) - Primary database
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search
- [Claude AI](https://www.anthropic.com/claude) - Natural language processing
- [OpenAI](https://openai.com/) - Embeddings and chat
- [Next.js](https://nextjs.org/) - Frontend framework (Phase 2)
- [React Flow](https://reactflow.dev/) - Graph visualization
- [shadcn/ui](https://ui.shadcn.com/) - UI components

## Support

- **Documentation**: [Docs/](Docs/)
- **API Examples**: [Docs/api/examples/](Docs/api/examples/)
- **Issues**: [GitHub Issues](https://github.com/lbpay/supercore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lbpay/supercore/discussions)

---

**Made with precision by the SuperCore AI Squad**

*Creating Core Banking systems in days, not months.*
