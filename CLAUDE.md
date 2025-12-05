# intelliCore - Universal Meta-Modeling Platform

> **CLAUDE.md** - Primary context file for AI development agents
> **Version**: 3.0
> **Last Updated**: 2025-12-04
> **Project Codename**: intelliCore (formerly LBPay v2)

---

## MISSION STATEMENT

**intelliCore** is a revolutionary **AI-native meta-modeling platform** that enables the creation of any business object (Customer, Account, Product, Transaction) **without programming**, using only **natural language** and **intelligent LLM validation**.

This platform will power a **complete core banking system** that can be deployed and configured in **days, not months**, by defining business rules, workflows, and policies in plain Portuguese.

---

## ⚠️ IMPLEMENTATION PREMISES (CRITICAL)

> **THESE RULES ARE NON-NEGOTIABLE. READ BEFORE ANY IMPLEMENTATION.**

### 🚫 PROHIBITED PRACTICES

| Practice | Why It's Forbidden |
|----------|-------------------|
| **Mock implementations** | This is a production product, not a demo. Every feature must be fully functional. |
| **Simplified "demo" versions** | No shortcuts. Implement the complete specification as designed. |
| **Stubbed services** | All services must have real implementations with proper error handling. |
| **Hardcoded test data** | Use proper data sources, migrations, and seed files. |
| **Placeholder components** | Every UI component must be fully functional and styled. |
| **Skipped validations** | All business rules must be implemented and tested. |
| **Incomplete error handling** | Every error path must be handled gracefully. |
| **Missing edge cases** | All edge cases documented in specs must be covered. |

### ✅ REQUIRED STANDARDS

```yaml
Code Quality:
  - Production-grade code ONLY
  - Full TypeScript strict mode compliance
  - Comprehensive error handling
  - Complete input validation
  - Proper logging and observability

Testing:
  - Unit tests for all business logic (>80% coverage)
  - Integration tests for all APIs
  - Edge cases and error scenarios covered
  - No skipped or pending tests in final delivery

Documentation:
  - JSDoc/TSDoc for all public APIs
  - README for each module
  - GraphQL schema documentation
  - Architecture Decision Records (ADRs) for major decisions

Security:
  - Authentication on all protected routes
  - Authorization checks (RBAC) enforced
  - Input sanitization
  - SQL injection prevention
  - XSS prevention

Performance:
  - Database queries optimized with proper indexes
  - Pagination for all list endpoints
  - Caching strategy implemented
  - No N+1 query problems
```

### 🎯 PRODUCT MINDSET

This project is being built as a **commercial product** that will:
- Be deployed in production environments
- Handle real financial data
- Be subject to regulatory compliance (BACEN)
- Be maintained and extended for years

**Every line of code must reflect this reality.**

### 📋 BEFORE STARTING ANY IMPLEMENTATION

1. ✅ Read the relevant user stories in [specs/BACKLOG.md](specs/BACKLOG.md)
2. ✅ Verify all acceptance criteria are understood
3. ✅ Plan the complete implementation (not a partial version)
4. ✅ Identify ALL edge cases and error scenarios
5. ✅ Write tests BEFORE or alongside implementation (TDD preferred)
6. ✅ Implement with production quality from the start

**When in doubt, ask. Never simplify without explicit approval.**

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Agent Ecosystem](#agent-ecosystem)
5. [Development Guidelines](#development-guidelines)
6. [Coding Standards](#coding-standards)
7. [Testing Requirements](#testing-requirements)
8. [Autonomous Development Framework](#autonomous-development-framework)
9. [Domain Context](#domain-context)
10. [Quick Reference](#quick-reference)

---

## PROJECT MEMORY - SPECS FOLDER

> **CRITICAL**: All project planning, sprints, and backlog documentation lives in the `specs/` folder.
> **ALWAYS read these files before starting any development work.**

| Document | Purpose | Read Before |
|----------|---------|-------------|
| [specs/SPRINT_MASTER_PLAN.md](specs/SPRINT_MASTER_PLAN.md) | Complete 15-sprint roadmap with agent squads | Starting any sprint |
| [specs/BACKLOG.md](specs/BACKLOG.md) | Trackable user stories and sprint status | Any implementation work |
| [specs/sprints/INDEX.md](specs/sprints/INDEX.md) | Sprint completion reports index | Reviewing sprint progress |
| [specs/ARCHITECTURE.md](specs/ARCHITECTURE.md) | Technical architecture decisions | Major feature development |
| [specs/FINAL_TECH_STACK.md](specs/FINAL_TECH_STACK.md) | Complete technology stack reference | Choosing libraries/tools |
| [specs/COREBANKING_BRAIN_SPEC.md](specs/COREBANKING_BRAIN_SPEC.md) | **CoreBanking Brain** - RAG document ingestion & AI system for all business domains | All feature development |
| [specs/todo.md](specs/todo.md) | Legacy project roadmap | Historical context |

### Sprint Reports

All sprint completion reports are located in `specs/sprints/`:

| Sprint | Report |
|--------|--------|
| Sprint 1 | [SPRINT_01_REPORT.md](specs/sprints/SPRINT_01_REPORT.md) |
| Sprint 2 | [SPRINT_02_REPORT.md](specs/sprints/SPRINT_02_REPORT.md) |
| Sprint 3 | [SPRINT_03_REPORT.md](specs/sprints/SPRINT_03_REPORT.md) |
| Sprint 4 | [SPRINT_04_REPORT.md](specs/sprints/SPRINT_04_REPORT.md) |
| Sprint 5 | [SPRINT_05_REPORT.md](specs/sprints/SPRINT_05_REPORT.md) |
| Sprint 6 | [SPRINT_06_REPORT.md](specs/sprints/SPRINT_06_REPORT.md) |
| Sprint 7 | [SPRINT_07_REPORT.md](specs/sprints/SPRINT_07_REPORT.md) |
| Sprint 8 | [SPRINT_08_REPORT.md](specs/sprints/SPRINT_08_REPORT.md) |
| Sprint 9 | [SPRINT_09_REPORT.md](specs/sprints/SPRINT_09_REPORT.md) |
| Sprint 10 | [SPRINT_10_REPORT.md](specs/sprints/SPRINT_10_REPORT.md) |
| Sprint 11 | [SPRINT_11_REPORT.md](specs/sprints/SPRINT_11_REPORT.md) |
| Sprint 12 | [SPRINT_12_REPORT.md](specs/sprints/SPRINT_12_REPORT.md) |
| Sprint 13 | [SPRINT_13_REPORT.md](specs/sprints/SPRINT_13_REPORT.md) |
| Sprint 14 | [SPRINT_14_REPORT.md](specs/sprints/SPRINT_14_REPORT.md) |

### Current Project Status

```
Sprint 1: Backend GraphQL Foundation  ✅ COMPLETE (Dec 03, 2025)
Sprint 2: Backend CRUD Enhancement    ✅ COMPLETE (Dec 03, 2025)
Sprint 3: Frontend BACKOFFICE         ✅ COMPLETE (Dec 03, 2025)
Sprint 4: Relationship Management     ✅ COMPLETE (Dec 03, 2025)
Sprint 5: Graph Visualization         ✅ COMPLETE (Dec 03, 2025)
Sprint 6: Document Management         ✅ COMPLETE (Dec 03, 2025)
Sprint 7: RAG Indexing & Search       ✅ COMPLETE (Dec 03, 2025)
Sprint 8: LLM Gateway Service         ✅ COMPLETE (Dec 03, 2025)
Sprint 9: LLM Validation Engine       ✅ COMPLETE (Dec 03, 2025)
Sprint 10: Instance CRUD Backend      ✅ COMPLETE (Dec 03, 2025)
Sprint 11: Free-text Instance Creation✅ COMPLETE (Dec 03, 2025)
Sprint 12: Instance Search & Workflows✅ COMPLETE (Dec 03, 2025)
Sprint 13: Graph Query Engine         ✅ COMPLETE (Dec 03, 2025)
Sprint 14: Analytics & Reporting      ✅ COMPLETE (Dec 03, 2025)
Sprint 15: Production Hardening       ✅ COMPLETE (Dec 03, 2025)
Progress: 100% (15/15 sprints) - Core Platform Complete

=== COREBANKING BRAIN SUB-PROJECT ===
Sprint 16: Document Upload & Bronze    ✅ COMPLETE (Dec 04, 2025)
Sprint 17: Silver & Gold Processing    ✅ COMPLETE (Dec 04, 2025)
Sprint 18: Visualization & Sources     ✅ COMPLETE (Dec 04, 2025)
Sprint 19: AI Assistant & Validations  ✅ COMPLETE (Dec 04, 2025)
Sprint 20: Integration & Polish        ⏳ PLANNED
Progress: 90% (19/20 sprints) - CoreBanking Brain 80% Complete
Specification: specs/COREBANKING_BRAIN_SPEC.md
```

### Sprint 1 Deliverables (Completed)
- US-001: GraphQL Server Setup ✅
- US-002: PostgreSQL TypeORM Configuration ✅
- US-003: ObjectType Entity & GraphQL CRUD ✅
- US-004: Field Entity with Dynamic Typing ✅
- US-005: Keycloak JWT Integration ✅

### Sprint 2 Deliverables (Completed)
- US-006: ObjectType Service Layer Enhancement ✅
- US-007: GraphQL Input Types ✅
- US-008: ObjectTypes GraphQL Resolver Enhancement ✅
- US-009: Pagination Support ✅
- US-010: Error Handling & Validation ✅

### Sprint 3 Deliverables (Completed)
- US-011: Apollo Client Setup ✅
- US-012: Dashboard Layout ✅
- US-013: ObjectTypes List Page ✅
- US-014: Create ObjectType Form ✅
- US-015: Edit ObjectType Form ✅

**Frontend Features:**
- Next.js 15 with App Router
- Apollo Client with SSR support
- Responsive sidebar navigation
- i18n (pt-BR, en-US, es-ES)
- Complete ObjectTypes CRUD UI

### Sprint 4 Deliverables (Completed)
- US-017: Relationship Entity Schema ✅
- US-018: Relationship Service Layer ✅
- US-019: Relationship GraphQL API ✅
- US-020: Graph Traversal Algorithms ✅
- US-021: Relationship Validation Rules ✅

**Relationship Features:**
- ObjectRelationshipEntity with source/target, cardinality, bidirectionality
- Full CRUD with soft delete and transaction support
- 6 graph algorithms: BFS, DFS, ancestors, descendants, shortest path, cycle detection
- Validation for duplicates and cardinality constraints
- Comprehensive unit tests (30+ test cases)

### Sprint 5 Deliverables (Completed)
- US-022: Graph Visualization Component (Cytoscape.js) ✅
- US-023: Relationship Creation UI ✅
- US-024: Graph Navigation & Filtering ✅
- US-025: Hierarchies List View ✅
- US-026: Performance Optimization ✅

**Graph Visualization Features:**
- Full Cytoscape.js integration with dagre, circle, grid, concentric layouts
- Interactive graph: zoom, pan, node selection, edge highlighting
- GraphQL integration for real-time relationship data
- Relationship CRUD modal with Zod validation
- Search and filtering by node/relationship type
- Interactive minimap for large graphs
- Export: PNG, JPG, SVG
- Dual view: Graph visualization + sortable table with CSV export
- Performance: debouncing, memoization, virtualization
- Full i18n support (pt-BR, en-US, es-ES)

### Sprint 6 Deliverables (Completed)
- US-027: Document Storage Setup (MinIO/S3) ✅
- US-027B: Document Type Entity (Manageable Categories) ✅
- US-028: Document Entity & Repository ✅
- US-029: Document Upload Service ✅
- US-030: Document Upload GraphQL API ✅
- US-031: Document Upload UI ✅

**Document Management Features:**
- MinIO (S3-compatible) object storage integration
- **Manageable Document Types** - CRUD for categories (BACEN, Internal Policy, etc.)
- Two-step upload: presigned URL → S3 → backend confirmation
- Automatic text extraction from PDF and DOCX
- File validation per document type (extensions, size limits)
- Presigned download URLs with expiration
- Drag-and-drop upload UI with progress indicator
- Full i18n support (pt-BR, en-US, es-ES)

### Sprint 7 Deliverables (Completed)
- US-032: Qdrant Vector Database Setup ✅
- US-033: Document Chunking Service ✅
- US-034: Embeddings Generation (Ollama) ✅
- US-035: Semantic Search API ✅
- US-036: Semantic Search UI ✅

**RAG & Semantic Search Features:**
- Qdrant vector database integration (HNSW index, cosine similarity)
- Local embeddings via Ollama (nomic-embed-text, 768 dimensions)
- Text chunking service (512 tokens default, 50 token overlap)
- BullMQ async processor for embedding generation
- Semantic search GraphQL API with score threshold filtering
- Document chunk retrieval with context highlighting
- Search UI with real-time results and relevance scores
- Embedding status tracking per document

### Sprint 8 Deliverables (Completed)
- US-037: Python FastAPI Service Setup ✅
- US-038: Ollama Integration ✅
- US-039: Model Management ✅
- US-040: Prompt Template System ✅
- US-041: LLM Gateway API ✅

**LLM Gateway Features:**
- Python FastAPI microservice (port 8001)
- Full Ollama integration (chat, embeddings, model management)
- Streaming chat completions (SSE)
- 6 built-in prompt templates for intelliCore
- Jinja2-based template rendering with variable validation
- Field validation endpoint using LLM
- ObjectType field suggestion endpoint
- Model whitelist and management
- Docker containerization with multi-stage build

**Built-in Prompt Templates:**
- `field-validation` - Validate field values against business rules
- `object-type-suggestion` - Suggest fields for new ObjectTypes
- `relationship-validation` - Validate relationships between ObjectTypes
- `document-summarize` - Summarize documents for RAG indexing
- `rag-answer` - Generate answers from retrieved context
- `natural-language-query` - Convert natural language to structured queries

### Sprint 9 Deliverables (Completed)
- US-042: Field Extraction Prompt Template ✅
- US-043: Business Rules Validation Prompts ✅
- US-044: RAG Query Prompt Template ✅
- US-045: Entity Recognition Prompts ✅
- US-046: LLM Response Monitoring ✅

**LLM Validation Engine Features:**
- 7 new prompt templates (extraction, validation, RAG)
- Field extraction from free-text input
- Business rules validation via LLM
- Entity recognition (CPF, CNPJ, PIX)
- LLM monitoring & metrics
- Validation feedback UI components

### Sprint 10 Deliverables (Completed)
- US-047: Instance Entity Schema ✅
- US-048: Instance Service Layer ✅
- US-049: Instance GraphQL API ✅
- US-050: Dynamic Schema Validation ✅
- US-051: Instance Relationships ✅

**Instance CRUD Backend Features:**
- InstanceEntity with JSONB data storage
- InstanceRelationshipEntity for linking instances
- Dynamic schema validation against ObjectType fields
- Status lifecycle management (draft, pending_validation, validated, active, suspended, archived)
- Brazilian financial ID validation (CPF, CNPJ)
- GraphQL API with 12 operations (queries + mutations)

### Sprint 11 Deliverables (Completed)
- US-052: Free-text Input Component ✅
- US-053: LLM Extraction Integration ✅
- US-054: Field Mapping Preview ✅
- US-055: Validation Feedback Panel ✅
- US-056: Instance Creation Flow ✅

**Free-text Instance Creation Features:**
- FreeTextInput and ObjectTypeSelector components
- LLM extraction integration via useLLMValidation hook
- ExtractionPreview with confidence indicators (high/medium/low)
- Accept/reject/edit workflow for extracted fields
- 5-step creation wizard with CreationStepper
- Instances list page with filtering

### Sprint 12 Deliverables (Completed)
- US-057: Meilisearch Integration ✅
- US-058: Advanced Search UI ✅
- US-059: Workflow State Machine ✅
- US-060: State Transition Logic ✅
- US-061: Workflow Visualization ✅

**Instance Search & Workflows Features:**
- Meilisearch full-text search integration with typo tolerance
- Event-driven auto-indexing of instances
- Advanced search UI with filters, facets, and autocomplete
- Workflow state machine engine (LINEAR, STATE_MACHINE, APPROVAL types)
- State transition logic with role-based validation
- Workflow history tracking with audit trail
- Workflow visualization components (StateIndicator, TransitionButtons, Diagram, History, Panel)

### Sprint 14 Deliverables (Completed)
- US-067: Analytics Dashboard ✅
- US-068: Report Generation ✅
- US-069: Data Export (CSV, Excel, JSON, PDF) ✅
- US-070: Visualization Components ✅
- US-071: Scheduled Reports ✅

**Analytics & Reporting Features:**
- Analytics query service with metrics (COUNT, SUM, AVG, MIN, MAX, DISTINCT_COUNT)
- Dashboard summary with key statistics (total instances, by status, by type)
- Time series data with configurable granularity (HOUR, DAY, WEEK, MONTH, QUARTER, YEAR)
- Data export in multiple formats (CSV, Excel, JSON, PDF)
- Pure SVG-based chart components (BarChart, LineChart, PieChart)
- Scheduled reports with cron expressions
- Report execution tracking and history

**Implementation**:
- Backend: [server/src/](server/src/)
- Frontend: [client/app/](client/app/)
- Relationships: [server/src/modules/relationships/](server/src/modules/relationships/)
- Graph UI: [client/app/[locale]/backoffice/hierarchies/](client/app/[locale]/backoffice/hierarchies/)
- Documents: [server/src/modules/documents/](server/src/modules/documents/)
- Storage: [server/src/storage/](server/src/storage/)
- Vector: [server/src/vector/](server/src/vector/)
- RAG: [server/src/modules/rag/](server/src/modules/rag/)
- Semantic Search UI: [client/components/search/](client/components/search/)
- LLM Gateway: [llm-gateway/](llm-gateway/)
- Instances Backend: [server/src/modules/instances/](server/src/modules/instances/)
- Instance Creation UI: [client/app/[locale]/backoffice/instances/create/](client/app/[locale]/backoffice/instances/create/)
- Instance Search UI: [client/app/[locale]/backoffice/instances/search/](client/app/[locale]/backoffice/instances/search/)
- Search Module: [server/src/modules/search/](server/src/modules/search/)
- Workflows Backend: [server/src/modules/workflows/](server/src/modules/workflows/)
- Workflow UI: [client/components/workflow/](client/components/workflow/)
- Analytics Backend: [server/src/modules/analytics/](server/src/modules/analytics/)
- Analytics UI: [client/app/[locale]/backoffice/analytics/](client/app/[locale]/backoffice/analytics/)
- Charts Components: [client/components/analytics/](client/components/analytics/)

---

## ARCHITECTURE OVERVIEW

### Core Paradigm: Meta-Modeling + LLM

```
┌─────────────────────────────────────────────────────────────────────┐
│                    intelliCore Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Layer 0: KNOWLEDGE BASE (Brain of the System)                  │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │ │
│  │  │   LLM Core      │  │   RAG Engine    │  │  Policy Store  │  │ │
│  │  │  (Llama 3.3)    │  │  (LlamaIndex)   │  │  (Qdrant)      │  │ │
│  │  └────────┬────────┘  └────────┬────────┘  └───────┬────────┘  │ │
│  │           └────────────────────┼───────────────────┘            │ │
│  └────────────────────────────────┼────────────────────────────────┘ │
│                                   ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Layer 1: META-MODEL (BACKOFFICE)                               │ │
│  │  • Define Object Types (Cliente PF, PJ, Conta, Produto)        │ │
│  │  • Define Fields, Rules, Policies in Natural Language           │ │
│  │  • Define Workflows (States + Transitions)                      │ │
│  │  • Define RBAC Permissions                                      │ │
│  │  • Upload Normative Documents (BACEN, Internal Policies)        │ │
│  └────────────────────────────────┬────────────────────────────────┘ │
│                                   ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Layer 2: OPERATIONAL (FRONT-OFFICE)                            │ │
│  │  • Create Instances (free-text → LLM validates)                 │ │
│  │  • List, Search, Edit Instances                                 │ │
│  │  • Navigate Relationships (Graph)                               │ │
│  │  • Semantic Search (Vector)                                     │ │
│  │  • Workflow Transitions                                         │ │
│  └────────────────────────────────┬────────────────────────────────┘ │
│                                   ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  Layer 3: TRIPLE GOLD (Data Persistence)                        │ │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │ │
│  │  │  Gold SQL     │  │  Gold Graph   │  │  Gold Vector  │       │ │
│  │  │  PostgreSQL   │  │  NebulaGraph  │  │  Qdrant       │       │ │
│  │  │  (ACID/OLTP)  │  │  (Relations)  │  │  (Semantic)   │       │ │
│  │  └───────────────┘  └───────────────┘  └───────────────┘       │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Frontend** | Next.js 15 (App Router) | Server Components, streaming, best DX |
| **Backend** | NestJS + GraphQL | Type-safe, modular, enterprise-grade |
| **Database** | PostgreSQL 16 | ACID, JSONB, temporal tables, mature |
| **Auth** | Keycloak | OIDC, RBAC, enterprise SSO ready |
| **LLM** | Self-hosted Llama 3.3 70B | Privacy, cost control, no API limits |
| **Graph DB** | NebulaGraph | Distributed, Cypher-like nGQL |
| **Vector DB** | Qdrant | High performance, Rust-based |
| **Cache** | Valkey (Redis fork) | Sessions, caching, queues |
| **Search** | Meilisearch | Typo-tolerant, instant search |
| **Orchestration** | LangGraph + CrewAI | Agent workflows, tool calling |
| **Workflow** | Temporal | Durable execution, long-running |
| **Data Pipeline** | Dagster | Asset-based, observable, testable |

---

## TECHNOLOGY STACK

### Frontend Stack

```yaml
Framework: Next.js 15.0.3
Runtime: React 19.0.0
Language: TypeScript 5.6+ (strict mode)
Styling: Tailwind CSS 4.0
Components: shadcn/ui
State: Zustand
Forms: React Hook Form + Zod
GraphQL: Apollo Client
i18n: next-intl (pt-BR, en-US, es-ES)
Graph Viz: Cytoscape.js
Charts: Recharts
```

### Backend Stack

```yaml
Framework: NestJS 10.x
Language: TypeScript 5.6+ (strict mode)
API: GraphQL (Apollo Server)
ORM: TypeORM
Validation: class-validator + class-transformer
Auth: Keycloak Connect
Queue: Bull (Redis-backed)
Logging: Pino
Testing: Jest
```

### Infrastructure Stack

```yaml
Container: Docker + Docker Compose
Database: PostgreSQL 16 (with extensions: pg_trgm, uuid-ossp, hstore)
Cache: Valkey 8.0 (Redis fork)
Search: Meilisearch 1.11
Identity: Keycloak 26
Message Queue: Apache Pulsar (future)
Workflow: Temporal (future)
Data Pipeline: Dagster (future)
```

### AI/ML Stack

```yaml
LLM Runtime: Ollama / vLLM
Model: Llama 3.3 70B (primary), CodeLlama 34B (code)
Embeddings: Nomic-embed-text / BGE-M3
Vector DB: Qdrant
RAG Framework: LlamaIndex
Agent Framework: LangGraph + CrewAI
Orchestration: LangSmith (observability)
```

### Future Services (Go)

```yaml
API Gateway: Custom Go service
PIX/DICT: BACEN integration service
High-throughput: Transaction processing
Compliance: Real-time validation
```

---

## PROJECT STRUCTURE

```
intelliCore/
├── .claude/                      # Claude Code configuration
│   ├── agents/                   # Agent plugins ecosystem
│   │   ├── docs/                 # Agent documentation
│   │   │   ├── agents.md         # Complete agent catalog
│   │   │   ├── architecture.md   # Agent architecture
│   │   │   ├── agent-skills.md   # 55 specialized skills
│   │   │   └── plugins.md        # 63 plugin reference
│   │   └── plugins/              # Plugin implementations
│   │       ├── backend-development/
│   │       ├── frontend-mobile-development/
│   │       ├── database-design/
│   │       ├── security-compliance/
│   │       ├── llm-application-dev/
│   │       └── ... (63 plugins)
│   ├── project-config.json       # Autonomous mode config
│   ├── AUTONOMOUS_MODE_GUIDE.md  # Permissions framework
│   └── AUTONOMOUS_DEVELOPMENT_FRAMEWORK.md
│
├── specs/                        # Technical specifications
│   ├── ARCHITECTURE.md           # Complete architecture
│   ├── FINAL_TECH_STACK.md       # Technology decisions
│   ├── LLM_ORCHESTRATION.md      # AI/ML infrastructure
│   ├── SETUP_GUIDE.md            # Installation guide
│   └── todo.md                   # Detailed roadmap
│
├── frontend/                     # Next.js 15 application
│   ├── app/
│   │   └── [locale]/             # i18n routing
│   │       ├── page.tsx          # Landing
│   │       ├── backoffice/       # Meta-layer UI
│   │       │   ├── object-types/ # Type definitions
│   │       │   ├── hierarchies/  # Graph visualization
│   │       │   ├── documents/    # Document management
│   │       │   └── agents/       # AI agent config
│   │       └── frontoffice/      # Operational UI
│   │           ├── instances/    # Object instances
│   │           ├── search/       # Semantic search
│   │           └── workflows/    # Workflow management
│   ├── components/
│   │   ├── ui/                   # shadcn components
│   │   ├── layouts/              # Layout components
│   │   └── features/             # Feature components
│   ├── lib/                      # Utilities
│   │   ├── apollo-client.ts      # GraphQL client
│   │   └── utils.ts              # Helpers
│   ├── i18n/                     # Internationalization
│   └── messages/                 # Translation files
│       ├── pt-BR.json
│       ├── en-US.json
│       └── es-ES.json
│
├── backend/                      # NestJS application
│   ├── src/
│   │   ├── main.ts               # Entry point
│   │   ├── app.module.ts         # Root module
│   │   ├── config/               # Configuration
│   │   ├── auth/                 # Keycloak integration
│   │   │   ├── guards/           # Auth guards
│   │   │   └── decorators/       # Custom decorators
│   │   └── modules/
│   │       ├── object-types/     # Meta-model CRUD
│   │       ├── objects/          # Instance management
│   │       ├── relationships/    # Graph relationships
│   │       ├── documents/        # Document indexing
│   │       ├── validation/       # LLM validation
│   │       └── workflows/        # State management
│   ├── migrations/               # TypeORM migrations
│   └── test/                     # E2E tests
│
├── services/                     # Microservices (future)
│   ├── llm-gateway/              # Python: LLM orchestration
│   ├── pix-dict/                 # Go: BACEN integration
│   └── analytics/                # Python: ML/Analytics
│
├── docker-compose.yml            # Local infrastructure
├── database-schema.sql           # Complete SQL schema
├── start.sh                      # Quick start script
├── CLAUDE.md                     # This file
└── README.md                     # Project overview
```

---

## AGENT ECOSYSTEM

### Available Agents (63 Plugins, 55 Skills)

The `.claude/agents/` directory contains a comprehensive ecosystem of specialized agents organized by domain. Use these agents proactively when their expertise matches the task.

#### Core Development Agents

| Agent | Use When | Plugin |
|-------|----------|--------|
| **backend-architect** | Designing APIs, services, architecture | `backend-development` |
| **graphql-architect** | GraphQL schema design, federation | `api-scaffolding` |
| **frontend-developer** | React/Next.js components, UI logic | `frontend-mobile-development` |
| **tdd-orchestrator** | Test-driven development, test strategy | `tdd-workflows` |
| **code-reviewer** | Code review, quality analysis | `code-review-ai` |

#### Database & Data Agents

| Agent | Use When | Plugin |
|-------|----------|--------|
| **database-architect** | Schema design, data modeling | `database-design` |
| **sql-pro** | Query optimization, SQL writing | `database-design` |
| **database-optimizer** | Performance tuning, indexing | `database-cloud-optimization` |
| **data-engineer** | ETL pipelines, data warehousing | `data-engineering` |

#### AI/ML Agents

| Agent | Use When | Plugin |
|-------|----------|--------|
| **ai-engineer** | LLM applications, RAG systems | `llm-application-dev` |
| **prompt-engineer** | Prompt optimization, templates | `llm-application-dev` |
| **context-manager** | Context engineering, memory | `agent-orchestration` |
| **ml-engineer** | Model deployment, ML systems | `machine-learning-ops` |

#### Infrastructure Agents

| Agent | Use When | Plugin |
|-------|----------|--------|
| **cloud-architect** | AWS/Azure/GCP architecture | `cloud-infrastructure` |
| **kubernetes-architect** | K8s, GitOps, container orchestration | `kubernetes-operations` |
| **deployment-engineer** | CI/CD, pipelines, automation | `cicd-automation` |
| **terraform-specialist** | IaC, Terraform modules | `cloud-infrastructure` |

#### Security & Compliance Agents

| Agent | Use When | Plugin |
|-------|----------|--------|
| **security-auditor** | Security review, vulnerability scanning | `security-compliance` |
| **backend-security-coder** | Secure coding, auth implementation | `backend-api-security` |
| **incident-responder** | Production issues, debugging | `incident-response` |

#### Documentation Agents

| Agent | Use When | Plugin |
|-------|----------|--------|
| **docs-architect** | Technical documentation, manuals | `code-documentation` |
| **tutorial-engineer** | Tutorials, educational content | `code-documentation` |
| **api-documenter** | OpenAPI specs, API docs | `api-testing-observability` |
| **mermaid-expert** | Diagrams, visual documentation | `documentation-generation` |

### Skills Reference (55 Skills)

Skills provide specialized domain knowledge that agents can invoke:

```
LLM Development (4):        Backend Development (3):
├── rag-implementation      ├── api-design-principles
├── langchain-architecture  ├── architecture-patterns
├── prompt-engineering      └── microservices-patterns
└── llm-evaluation

Kubernetes (4):             CI/CD (4):
├── k8s-manifest-generator  ├── github-actions-templates
├── helm-chart-scaffolding  ├── gitlab-ci-patterns
├── gitops-workflow         ├── deployment-pipeline-design
└── k8s-security-policies   └── secrets-management

Cloud Infrastructure (4):   Database (4):
├── terraform-module-library├── sql-optimization-patterns
├── multi-cloud-architecture├── database-migration
├── hybrid-cloud-networking └── ...
└── cost-optimization

Python (5):                 JavaScript/TypeScript (4):
├── async-python-patterns   ├── typescript-advanced-types
├── python-testing-patterns ├── nodejs-backend-patterns
├── python-packaging        ├── javascript-testing-patterns
├── python-performance      └── modern-javascript-patterns
└── uv-package-manager

Developer Essentials (8):   Blockchain (4):
├── git-advanced-workflows  ├── solidity-security
├── error-handling-patterns ├── defi-protocol-templates
├── debugging-strategies    ├── nft-standards
├── code-review-excellence  └── web3-testing
├── e2e-testing-patterns
├── auth-implementation
├── monorepo-management
└── sql-optimization

Observability (4):          Payments (4):
├── prometheus-configuration├── stripe-integration
├── grafana-dashboards      ├── paypal-integration
├── distributed-tracing     ├── pci-compliance
└── slo-implementation      └── billing-automation

Framework Migration (4):    ML Ops (1):
├── react-modernization     └── ml-pipeline-workflow
├── angular-migration
├── database-migration      Security (1):
└── dependency-upgrade      └── sast-configuration
```

### Agent Invocation Pattern

Use the Task tool with appropriate subagent_type:

```typescript
// Example: Use backend-architect for API design
Task(subagent_type: "backend-architect", prompt: "Design the ObjectTypes GraphQL API...")

// Example: Use database-architect for schema design
Task(subagent_type: "database-architect", prompt: "Design the meta-model schema...")

// Example: Use ai-engineer for LLM integration
Task(subagent_type: "ai-engineer", prompt: "Implement LLM validation service...")
```

---

## DEVELOPMENT GUIDELINES

### Language & Locale

- **Primary Language**: Portuguese (pt-BR) for all user-facing text
- **Code Comments**: English
- **Variable Names**: English (camelCase for TS/JS, snake_case for Python)
- **Documentation**: Portuguese for user docs, English for technical docs
- **Git Commits**: English, conventional commits format

### Commit Convention

```
feat(scope): Add feature description
fix(scope): Fix bug description
docs(scope): Update documentation
refactor(scope): Refactor code
test(scope): Add tests
chore(scope): Maintenance tasks
perf(scope): Performance improvement
style(scope): Code style changes
ci(scope): CI/CD changes
```

Examples:
```
feat(object-types): Add GraphQL mutations for CRUD operations
fix(auth): Resolve Keycloak token refresh issue
docs(api): Add OpenAPI documentation for object-types endpoint
test(validation): Add unit tests for LLM validation service
```

### Branch Strategy

```
main                    # Production-ready
├── develop             # Integration branch
├── feature/US-XXX-*    # Feature branches
├── bugfix/issue-*      # Bug fixes
├── docs/*              # Documentation
└── release/v*          # Release candidates
```

### File Naming Conventions

```typescript
// TypeScript/JavaScript
components/ObjectTypeCard.tsx       // PascalCase for components
hooks/useObjectTypes.ts             // camelCase with prefix
lib/apollo-client.ts                // kebab-case for utilities
types/object-type.types.ts          // kebab-case with suffix

// NestJS Backend
object-types.module.ts              // kebab-case
object-types.service.ts
object-types.resolver.ts
object-type.entity.ts               // Singular for entities
create-object-type.input.ts         // Action prefix for DTOs
```

---

## CODING STANDARDS

### TypeScript Standards

```typescript
// ALWAYS use strict mode
// tsconfig.json: "strict": true

// ALWAYS use explicit types (no implicit any)
function processObjectType(input: CreateObjectTypeInput): Promise<ObjectType> {
  // ...
}

// ALWAYS use readonly for immutable data
interface ObjectTypeConfig {
  readonly name: string;
  readonly fields: readonly FieldDefinition[];
}

// ALWAYS use discriminated unions for state
type ValidationResult =
  | { status: 'success'; data: ValidatedData }
  | { status: 'error'; errors: ValidationError[] };

// PREFER const assertions for literals
const OBJECT_STATES = ['draft', 'validating', 'approved', 'active'] as const;
type ObjectState = typeof OBJECT_STATES[number];

// USE Zod for runtime validation
const createObjectTypeSchema = z.object({
  name: z.string().min(1).max(100),
  fieldsDefinition: z.string().min(10),
  validationRules: z.string().optional(),
});
```

### React/Next.js Standards

```tsx
// PREFER Server Components by default
// app/backoffice/object-types/page.tsx (Server Component)
export default async function ObjectTypesPage() {
  const objectTypes = await getObjectTypes(); // Server-side fetch
  return <ObjectTypesList objectTypes={objectTypes} />;
}

// USE 'use client' only when necessary
'use client';

// ALWAYS use named exports for components
export function ObjectTypeCard({ objectType }: ObjectTypeCardProps) {
  // ...
}

// PREFER composition over inheritance
export function ObjectTypesPage() {
  return (
    <DashboardLayout>
      <PageHeader title="Tipos de Objetos" />
      <ObjectTypesList />
    </DashboardLayout>
  );
}

// USE React Hook Form + Zod for forms
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { name: '', description: '' },
});
```

### NestJS Standards

```typescript
// USE dependency injection
@Injectable()
export class ObjectTypesService {
  constructor(
    @InjectRepository(ObjectType)
    private readonly objectTypesRepository: Repository<ObjectType>,
    private readonly llmService: LlmValidationService,
  ) {}
}

// USE DTOs with validation decorators
@InputType()
export class CreateObjectTypeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}

// USE guards for authorization
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin', 'backoffice_operator')
@Resolver(() => ObjectType)
export class ObjectTypesResolver {
  // ...
}

// USE proper error handling
async findOne(id: string): Promise<ObjectType> {
  const objectType = await this.repository.findOne({ where: { id } });
  if (!objectType) {
    throw new NotFoundException(`ObjectType with ID ${id} not found`);
  }
  return objectType;
}
```

### SQL Standards

```sql
-- USE snake_case for identifiers
CREATE TABLE object_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  fields_definition TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- USE JSONB for flexible metadata
ALTER TABLE objects ADD COLUMN metadata JSONB NOT NULL DEFAULT '{}';

-- CREATE proper indexes
CREATE INDEX idx_objects_type_state ON objects(object_type_id, current_state);
CREATE INDEX idx_objects_metadata ON objects USING GIN(metadata);

-- USE soft deletes
ALTER TABLE object_types ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE object_types ADD COLUMN deleted_at TIMESTAMP;
```

### GraphQL Standards

```graphql
# USE PascalCase for types
type ObjectType {
  id: ID!
  name: String!
  description: String
  fieldsDefinition: String!
  createdAt: DateTime!
}

# USE camelCase for fields and arguments
type Query {
  objectTypes(limit: Int, offset: Int): [ObjectType!]!
  objectType(id: ID!): ObjectType
}

# USE Input suffix for input types
input CreateObjectTypeInput {
  name: String!
  description: String
  fieldsDefinition: String!
}

# USE meaningful mutation names
type Mutation {
  createObjectType(input: CreateObjectTypeInput!): ObjectType!
  updateObjectType(input: UpdateObjectTypeInput!): ObjectType!
  deleteObjectType(id: ID!): Boolean!
}
```

---

## TESTING REQUIREMENTS

### Test Coverage Targets

| Category | Target | Rationale |
|----------|--------|-----------|
| Unit Tests | >80% | Core business logic |
| Integration Tests | >60% | API endpoints, DB operations |
| E2E Tests | Critical paths | User workflows |

### Testing Strategy

```typescript
// UNIT TESTS: Test business logic in isolation
describe('ObjectTypesService', () => {
  it('should create object type with valid input', async () => {
    const result = await service.create(validInput, userId);
    expect(result.name).toBe(validInput.name);
  });

  it('should throw ConflictException for duplicate name', async () => {
    await expect(service.create(duplicateInput, userId))
      .rejects.toThrow(ConflictException);
  });
});

// INTEGRATION TESTS: Test with real database
describe('ObjectTypesResolver (e2e)', () => {
  it('should create object type via GraphQL', async () => {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `mutation { createObjectType(input: {...}) { id name } }`,
      });
    expect(response.body.data.createObjectType.name).toBe('Cliente PF');
  });
});

// E2E TESTS: Test user workflows
describe('Object Type Creation Flow', () => {
  it('should create and list object types', async () => {
    await page.goto('/backoffice/object-types');
    await page.click('button:has-text("Novo Tipo")');
    await page.fill('[name="name"]', 'Cliente PF');
    await page.click('button:has-text("Salvar")');
    await expect(page.locator('text=Cliente PF')).toBeVisible();
  });
});
```

### Quality Gates

```yaml
Pre-commit:
  - TypeScript compilation (no errors)
  - ESLint (no warnings)
  - Prettier formatting
  - Unit tests (affected files)

Pre-push:
  - Full test suite
  - Coverage check (>80%)
  - Type checking (mypy for Python)

CI Pipeline:
  - All tests
  - Security scanning (npm audit, pip audit)
  - Build validation
  - E2E tests (critical paths)
```

---

## AUTONOMOUS DEVELOPMENT FRAMEWORK

### Autonomous Permissions

The project is configured for **autonomous development** mode. Agents can execute the following without user approval:

```yaml
GRANTED (Auto-approved):
  File Operations:
    ✅ Create/Edit/Delete files within project directory
    ✅ Generate code (TypeScript, Python, SQL, etc.)
    ✅ Write configuration files
    ✅ Update documentation

  Package Management:
    ✅ npm/pnpm/yarn install
    ✅ pip install (project dependencies)
    ✅ Docker pull/build

  Infrastructure:
    ✅ docker-compose up/down/restart
    ✅ Run migrations
    ✅ Execute tests

  Git Operations:
    ✅ Create branches (feature/*, bugfix/*, docs/*)
    ✅ Commit with conventional messages
    ✅ Push to remote

RESTRICTED (Ask first):
  ❌ Force push to main/develop
  ❌ Rewrite published history
  ❌ Cloud resource provisioning
  ❌ Production deployments
  ❌ Security-sensitive changes
```

### Sprint Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│  SPRINT EXECUTION (Autonomous)                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Read backlog from specs/todo.md                              │
│  2. Break user stories into technical tasks                      │
│  3. Create feature branch: feature/sprint-X-US-YYY               │
│  4. Implement features following CLAUDE.md guidelines            │
│  5. Write comprehensive tests (unit, integration)                │
│  6. Execute all quality gates                                    │
│  7. Generate documentation                                       │
│  8. Commit with conventional messages                            │
│  9. Update backlog status                                        │
│ 10. Create Sprint Completion Summary                             │
│                                                                   │
│  User Involvement: NONE (unless blockers)                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  SPRINT REVIEW (User Review)                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User reviews:                                                   │
│  • Sprint Completion Summary                                     │
│  • Demo execution results                                        │
│  • Test coverage metrics                                         │
│  • Known issues                                                  │
│  • Backlog burndown                                              │
│                                                                   │
│  Approve/Reject deliverables                                     │
│  Discuss Sprint N+1 scope                                        │
│                                                                   │
│  Time: ~30 minutes per sprint                                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Escalation Rules

**ALWAYS ASK USER** when:

1. **Architecture Changes**: Modifying approved ADRs, changing core stack
2. **Security Concerns**: Auth logic, secrets, production security
3. **Cost Impact**: Cloud provisioning, paid services
4. **Blockers**: External dependencies unavailable, requirements unclear
5. **Scope Changes**: New requirements, cross-sprint dependencies

---

## DOMAIN CONTEXT

### Business Domain: Core Banking

intelliCore is designed to power a complete **core banking platform** for financial institutions regulated by BACEN (Banco Central do Brasil).

### Core Entities

```
┌─────────────────────────────────────────────────────────────────┐
│  Meta-Layer (Defined in BACKOFFICE)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ObjectType: "Cliente PF"                                        │
│  ├── Fields: nome, cpf, data_nascimento, renda, etc.            │
│  ├── Validations: CPF válido, idade >= 18, renda >= 1000        │
│  ├── Policies: BACEN KYC, PEP check, lista restritiva           │
│  ├── Workflow: rascunho → em_análise → aprovado → ativo         │
│  └── RBAC: operator can create, compliance can approve          │
│                                                                   │
│  ObjectType: "Cliente PJ"                                        │
│  ├── Fields: razao_social, cnpj, socios[], etc.                 │
│  ├── Relations: tem_sócio → Cliente PF (N:N)                    │
│  └── ...                                                         │
│                                                                   │
│  ObjectType: "Conta de Pagamento"                                │
│  ├── Fields: numero, agencia, tipo, limite, etc.                │
│  ├── Relations: pertence_a → (Cliente PF | Cliente PJ)          │
│  └── ...                                                         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Operational Layer (Created in FRONT-OFFICE)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Instance: Cliente PF #12345                                     │
│  ├── nome: "João Silva"                                         │
│  ├── cpf: "123.456.789-00"                                      │
│  ├── status: "ativo"                                            │
│  └── relations: [Conta #1001, Conta #1002]                      │
│                                                                   │
│  Instance: Conta #1001                                           │
│  ├── numero: "12345-6"                                          │
│  ├── tipo: "corrente"                                           │
│  ├── saldo: 15000.00                                            │
│  └── titular: Cliente PF #12345                                 │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Key Business Rules

1. **KYC (Know Your Customer)**: All clients must pass identity verification
2. **PEP (Politically Exposed Persons)**: Enhanced due diligence for PEPs
3. **BACEN Compliance**: Follow all BACEN regulations (PIX, DICT, etc.)
4. **Audit Trail**: Every operation must be logged with user, timestamp, action
5. **Soft Deletes**: Never physically delete data (regulatory requirement)

### Validation Flow

```
User Input (Free Text) → LLM Extraction → Schema Validation →
Business Rules → Policy Check → RAG Query (BACEN docs) →
Final Decision (Allow/Deny with explanation)
```

---

## QUICK REFERENCE

### Essential Commands

```bash
# Start all services
./start.sh
# OR manually:
docker compose up -d && cd backend && npm run start:dev

# Frontend development
cd frontend && npm run dev

# Backend development
cd backend && npm run start:dev

# Run tests
cd backend && npm test
cd frontend && npm test

# Database migrations
cd backend && npm run migration:run

# Generate GraphQL types
cd backend && npm run generate:types

# Lint and format
npm run lint && npm run format
```

### Key URLs (Development)

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend GraphQL | http://localhost:4000/graphql |
| Keycloak | http://localhost:8080 (admin/admin) |
| Meilisearch | http://localhost:7700 |
| PostgreSQL | localhost:5432 (lbpay/lbpay_dev_password) |
| Valkey/Redis | localhost:6379 |

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL="postgresql://lbpay:lbpay_dev_password@localhost:5432/lbpay"
KEYCLOAK_URL="http://localhost:8080"
KEYCLOAK_REALM="lbpay"
KEYCLOAK_CLIENT_ID="nestjs-backend"
KEYCLOAK_CLIENT_SECRET="<from-keycloak>"
REDIS_URL="redis://localhost:6379"
MEILI_HOST="http://localhost:7700"
MEILI_MASTER_KEY="lbpay_dev_master_key"

# Frontend (.env.local)
NEXT_PUBLIC_GRAPHQL_URL="http://localhost:4000/graphql"
NEXT_PUBLIC_KEYCLOAK_URL="http://localhost:8080"
NEXT_PUBLIC_KEYCLOAK_REALM="lbpay"
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID="nextjs-frontend"
```

### Project Status

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ 100% | Setup (Next.js, NestJS, Docker, Schema) |
| Phase 2 | ✅ 100% | BACKOFFICE - Object Types CRUD |
| Phase 3 | ✅ 100% | BACKOFFICE - Hierarchies (Graph) |
| Phase 4 | ✅ 100% | BACKOFFICE - Documents (RAG) |
| Phase 5 | ✅ 100% | BACKOFFICE - Agents (LLM Gateway) |
| Phase 6 | ✅ 100% | FRONT-OFFICE - Instances (Create, Search, Workflows) |
| Phase 7 | ✅ 100% | Graph Query Engine (NebulaGraph) |
| Phase 8 | ✅ 100% | Analytics & Reporting |
| Phase 9 | 🔮 Planned | Production Hardening |

---

## ADDITIONAL RESOURCES

### Documentation

- [specs/ARCHITECTURE.md](specs/ARCHITECTURE.md) - Complete architecture
- [specs/FINAL_TECH_STACK.md](specs/FINAL_TECH_STACK.md) - Technology decisions
- [specs/LLM_ORCHESTRATION.md](specs/LLM_ORCHESTRATION.md) - AI/ML infrastructure
- [specs/SETUP_GUIDE.md](specs/SETUP_GUIDE.md) - Installation guide
- [specs/todo.md](specs/todo.md) - Detailed roadmap

### Agent Documentation

- [.claude/agents/docs/agents.md](.claude/agents/docs/agents.md) - Complete agent catalog
- [.claude/agents/docs/agent-skills.md](.claude/agents/docs/agent-skills.md) - 55 specialized skills
- [.claude/agents/docs/plugins.md](.claude/agents/docs/plugins.md) - 63 plugin reference

### Autonomous Mode

- [.claude/AUTONOMOUS_MODE_GUIDE.md](.claude/AUTONOMOUS_MODE_GUIDE.md) - Permissions framework
- [.claude/AUTONOMOUS_DEVELOPMENT_FRAMEWORK.md](.claude/AUTONOMOUS_DEVELOPMENT_FRAMEWORK.md) - Sprint workflow

---

**Document Version**: 3.0
**Last Updated**: 2025-12-04
**Maintained By**: intelliCore Development Squad
**Next Review**: After Sprint 16 Completion (CoreBanking Brain - Document Upload & Bronze)

---

*This CLAUDE.md serves as the primary context for all AI development agents working on the intelliCore platform. Keep it updated as the project evolves.*
