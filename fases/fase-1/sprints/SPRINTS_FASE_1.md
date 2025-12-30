# 🏃 SPRINTS FASE 1 - SuperCore v2.0

**Versão**: 1.0.0
**Data**: 2025-12-28
**Fase**: Fase 1 - Camada Oráculo - Knowledge Foundation + IA Assistant
**Duração Total**: 6 semanas (6 sprints de 1 semana)
**Baseado em**: [PROPOSTA_FASES.md](../../../PROPOSTA_FASES.md), [SQUAD_FASE_1.md](../squad/SQUAD_FASE_1.md)

---

## 📋 Visão Geral

A Fase 1 está dividida em **6 sprints de 1 semana** cada, seguindo uma sequência lógica de dependências:

1. **Sprint 1**: Fundação (Infraestrutura + Database + Mockups)
2. **Sprint 2**: Backend Go (API REST CRUD Oráculos + Auth)
3. **Sprint 3**: Backend Python - RAG Pipeline
4. **Sprint 4**: Backend Python - IA Assistant Service
5. **Sprint 5**: Frontend (Super Portal + Chat Component)
6. **Sprint 6**: Integração, Testes e Deploy

**Metodologia**: Scrum com entregas incrementais

---

## 🎯 Sprint 1 - Fundação (Semana 1)

**Objetivo**: Criar base técnica sólida + Mockups UX/UI aprovados + Schemas de banco

**Duração**: 5 dias úteis (40 horas)

### Participantes Ativos
- Scrum Master (Sonnet 4.5)
- UX/UI Designer (Opus 4.5)
- Database Architect (Opus 4.5)
- DevOps Engineer (Opus 4.5)
- Orchestrator (coordenação)

---

### 📝 Backlog do Sprint 1

#### 1.1 Planejamento e Documentação (Scrum Master) - 8h
**Owner**: Scrum Master (Sonnet 4.5)
**Prioridade**: P0 (Bloqueador)

**Tarefas**:
- [ ] 1.1.1 Criar `BACKLOG_FASE_1.md` exaustivo (4h)
  - Detalhar TODAS as tarefas da Fase 1
  - Mapear requisitos RF001-RF006 → user stories → tasks
  - Critérios de aceitação por tarefa
  - Estimativas (horas/story points)
  - Dependências entre tarefas
- [ ] 1.1.2 Detalhar 6 sprints completos (2h)
  - Este documento (`SPRINTS_FASE_1.md`)
  - Distribuição de tarefas por sprint
  - Milestones e gates de aprovação
- [ ] 1.1.3 Criar template de user stories (1h)
  - Formato: "Como [ator], eu quero [ação], para que [benefício]"
  - Critérios de aceitação template
  - Definition of Done (DoD)
- [ ] 1.1.4 Setup de tracking (1h)
  - GitHub Projects ou Jira
  - Kanban board configurado
  - Sprint burndown chart

**Acceptance Criteria**:
- ✅ BACKLOG_FASE_1.md criado com ≥100 tarefas detalhadas
- ✅ SPRINTS_FASE_1.md criado com 6 sprints planejados
- ✅ Tracking system configurado e acessível

**Outputs**:
- `fases/fase-1/backlog/BACKLOG_FASE_1.md`
- `fases/fase-1/sprints/SPRINTS_FASE_1.md` (este arquivo)
- `fases/fase-1/sprints/USER_STORY_TEMPLATE.md`

---

#### 1.2 UX/UI Mockups (UX/UI Designer) - 16h
**Owner**: UX/UI Designer (Opus 4.5)
**Prioridade**: P0 (Bloqueador para Sprint 5)

**Tarefas**:
- [ ] 1.2.1 Design System (4h)
  - Color palette (theme tokens): primary, secondary, accent, neutral, error, success, warning
  - Typography scale (font-family, sizes, weights, line-heights)
  - Spacing system (4px base grid)
  - Component variants (shadcn/ui customization)
  - Accessibility guidelines (WCAG 2.1 AA)
- [ ] 1.2.2 Mockup: `/oracles` - Listagem (2h)
  - shadcn/ui Table component
  - Pagination (10 items/page)
  - Search bar (name, type, domain)
  - Filters (type, created_at)
  - Actions: New, Edit, Delete, Clone
- [ ] 1.2.3 Mockup: `/oracles/new` - Criar Oráculo (2h)
  - Form fields: name, type (dropdown), domain, description
  - shadcn/ui Form + Input + Select + Textarea
  - Validation messages
  - Submit + Cancel buttons
- [ ] 1.2.4 Mockup: `/oracles/{id}` - Detalhes (1h)
  - Card layout (shadcn/ui Card)
  - Oracle info display
  - Tabs: Details, Knowledge, Graph, Chat
  - Actions: Edit, Delete, Clone
- [ ] 1.2.5 Mockup: `/oracles/{id}/edit` - Editar (1h)
  - Same form as create (pre-filled)
  - shadcn/ui Form
- [ ] 1.2.6 Mockup: `/oracles/{id}/knowledge` - Upload (2h)
  - Drag-and-drop area (shadcn/ui)
  - File list (uploaded files)
  - Progress bar (upload status)
  - Supported formats badge (PDF, DOCX, etc)
- [ ] 1.2.7 Mockup: `/oracles/{id}/graph` - Grafo (2h)
  - React Flow canvas
  - Node types: Oracle, Document, Entity, Concept
  - Edge styles: contains, references, related_to
  - Controls: zoom, pan, fit view
- [ ] 1.2.8 Mockup: `/oracles/{id}/chat` - **IA Assistant** (2h) 🔥 **CRÍTICO**
  - Chat interface (shadcn/ui inspired)
  - Left sidebar: Session history
  - Main area: Messages (user/assistant)
  - Input area: Textarea + Send button
  - RAG sources tooltips (hover on message)
  - Streaming indicator (typing animation)
  - Markdown rendering (code blocks, lists, tables)

**Acceptance Criteria**:
- ✅ 7 mockups PNG/SVG de alta fidelidade criados
- ✅ Design System documentado (tokens, components, accessibility)
- ✅ User flows Mermaid diagrams criados
- ✅ Mockups APROVADOS pelo usuário (GATE)

**Outputs**:
- `fases/fase-1/mocks/01_oracles_listagem.png`
- `fases/fase-1/mocks/02_oracles_criar.png`
- `fases/fase-1/mocks/03_oracles_detalhes.png`
- `fases/fase-1/mocks/04_oracles_editar.png`
- `fases/fase-1/mocks/05_oracles_knowledge_upload.png`
- `fases/fase-1/mocks/06_oracles_graph_visualizacao.png`
- **`fases/fase-1/mocks/07_oracles_chat_ia_assistant.png`** 🔥
- `fases/fase-1/mocks/DESIGN_SYSTEM.md`
- `fases/fase-1/mocks/USER_FLOWS.md`

**🚨 GATE**: Mockups devem ser aprovados pelo usuário antes de prosseguir para Sprint 5

---

#### 1.3 Database Schemas (Database Architect) - 12h
**Owner**: Database Architect (Opus 4.5)
**Prioridade**: P0 (Bloqueador para Sprints 2-4)

**Tarefas**:
- [ ] 1.3.1 PostgreSQL Schema Design (4h)
  - Table: `oracles` (id UUID, name TEXT, type VARCHAR(50), domain TEXT, config JSONB, created_at, updated_at, created_by, updated_by)
  - Table: `documents` (id UUID, oracle_id UUID FK, filename TEXT, content_type VARCHAR(100), size BIGINT, processed_at TIMESTAMP)
  - Table: `chat_sessions` (id UUID, oracle_id UUID FK, user_id UUID, created_at TIMESTAMP)
  - Table: `chat_messages` (id UUID, session_id UUID FK, role VARCHAR(20), content TEXT, sources JSONB, created_at TIMESTAMP)
  - Table: `embeddings` (id UUID, document_id UUID FK, chunk_id INTEGER, embedding vector(1536), metadata JSONB)
  - Indexes: oracle_id, document_id, session_id, created_at
  - Multi-tenancy: oracle_id em todas as queries (ADR-007)
- [ ] 1.3.2 pgvector Extension Setup (2h)
  - CREATE EXTENSION vector;
  - Embeddings table com HNSW index
  - Cosine similarity queries (vector <=> vector)
  - Performance tuning (maintenance_work_mem, max_parallel_workers)
- [ ] 1.3.3 NebulaGraph Schema Design (3h)
  - Space: `supercore`
  - Tags: Oracle(id, name, type, domain), Document(id, filename, type), Entity(id, name, type), Concept(id, name, description)
  - Edges: contains(from Oracle to Document), references(between Documents), related_to(between Entities/Concepts)
  - Indexes: Oracle.id, Document.id, Entity.id
- [ ] 1.3.4 Migration Scripts (3h)
  - `001_create_oracles.sql`
  - `002_create_documents.sql`
  - `003_create_knowledge_graph_sync.sql`
  - `004_create_chat_sessions.sql`
  - `005_create_chat_messages.sql`
  - `006_setup_pgvector.sql`
  - Rollback scripts (down migrations)

**Acceptance Criteria**:
- ✅ ERD diagrams criados (Mermaid)
- ✅ 6 migration files SQL criados
- ✅ NebulaGraph space + schemas criados
- ✅ Migrations testadas em ambiente local

**Outputs**:
- `database/migrations/001_create_oracles.sql`
- `database/migrations/002_create_documents.sql`
- `database/migrations/003_create_knowledge_graph_sync.sql`
- `database/migrations/004_create_chat_sessions.sql`
- `database/migrations/005_create_chat_messages.sql`
- `database/migrations/006_setup_pgvector.sql`
- `database/schemas/ERD_FASE_1.md` (Mermaid diagram)
- `database/README.md`

---

#### 1.4 Infraestrutura (DevOps Engineer) - 16h
**Owner**: DevOps Engineer (Opus 4.5)
**Prioridade**: P0 (Bloqueador para todos os sprints)

**Tarefas**:
- [ ] 1.4.1 Terraform - PostgreSQL (3h)
  - Module: `infrastructure/terraform/modules/postgresql/`
  - AWS RDS PostgreSQL 16 ou local (Docker)
  - pgvector extension habilitada
  - Security groups, subnets, backup policy
- [ ] 1.4.2 Terraform - NebulaGraph (4h)
  - Module: `infrastructure/terraform/modules/nebula/`
  - Kubernetes deployment (Meta, Storage, Graph services)
  - Persistent volumes
  - Service discovery
- [ ] 1.4.3 Terraform - Redis (2h)
  - Module: `infrastructure/terraform/modules/redis/`
  - AWS ElastiCache ou local (Docker)
  - Cluster mode (multi-AZ)
- [ ] 1.4.4 Terraform - Pulsar (3h)
  - Module: `infrastructure/terraform/modules/pulsar/`
  - Kubernetes deployment
  - Topics: oracle-events, document-events
  - Retention policies
- [ ] 1.4.5 Kubernetes Base Setup (4h)
  - Namespaces: dev, staging, prod
  - RBAC: service accounts, roles, rolebindings
  - NetworkPolicies: default-deny + allow-rules
  - ConfigMaps + Secrets structure
  - Ingress controller (NGINX)

**Acceptance Criteria**:
- ✅ `terraform apply` bem-sucedido para dev environment
- ✅ PostgreSQL rodando com pgvector
- ✅ NebulaGraph acessível via nebula-console
- ✅ Redis pingável
- ✅ Pulsar topics criados
- ✅ Kubernetes namespaces + RBAC configurados

**Outputs**:
- `infrastructure/terraform/modules/postgresql/`
- `infrastructure/terraform/modules/nebula/`
- `infrastructure/terraform/modules/redis/`
- `infrastructure/terraform/modules/pulsar/`
- `infrastructure/terraform/environments/dev/main.tf`
- `infrastructure/kubernetes/namespaces.yaml`
- `infrastructure/kubernetes/rbac.yaml`
- `infrastructure/README.md`

---

### 📊 Métricas Sprint 1

**Story Points**: 52 SP (52 horas planejadas)
**Velocity Esperada**: 40-45 SP (primeira sprint)
**Burndown**: Diário (tracking manual)

**Definition of Done (DoD)**:
- ✅ BACKLOG_FASE_1.md completo (≥100 tarefas)
- ✅ 7 mockups UX/UI criados e APROVADOS
- ✅ Database schemas + 6 migrations criadas
- ✅ Infraestrutura rodando (PostgreSQL + NebulaGraph + Redis + Pulsar)
- ✅ Kubernetes base configurado (namespaces + RBAC)
- ✅ Documentação completa (README.md em cada módulo)

**Riscos**:
- 🚨 Aprovação de mockups pode atrasar (mitigação: review incremental)
- 🚨 NebulaGraph setup complexo (mitigação: Docker Compose local para dev)

---

## 🔧 Sprint 2 - Backend Go (Semana 2)

**Objetivo**: Implementar API REST CRUD Oráculos + JWT authentication

**Duração**: 5 dias úteis (40 horas)

### Participantes Ativos
- Backend Go Developer (Opus 4.5)
- QA Engineer (Opus 4.5)
- Database Architect (suporte)

---

### 📝 Backlog do Sprint 2

#### 2.1 Setup Projeto Go (Backend Go) - 4h
**Owner**: Backend Go Developer (Opus 4.5)

**Tarefas**:
- [ ] 2.1.1 Estrutura de diretórios Go (1h)
  - `backend/go/cmd/server/` - main.go
  - `backend/go/internal/api/` - handlers
  - `backend/go/internal/middleware/` - auth, logging, CORS
  - `backend/go/internal/models/` - domain models
  - `backend/go/internal/repository/` - database layer
  - `backend/go/internal/service/` - business logic
  - `backend/go/pkg/` - utilities
- [ ] 2.1.2 Dependências (1h)
  - Gin framework (github.com/gin-gonic/gin)
  - pgx (PostgreSQL driver)
  - golang-jwt (JWT tokens)
  - validator (input validation)
  - zerolog (structured logging)
- [ ] 2.1.3 Config management (1h)
  - Viper para environment variables
  - config.yaml (database, JWT secret, server port)
  - Environment-specific configs (dev, staging, prod)
- [ ] 2.1.4 Database connection (1h)
  - pgx connection pool
  - Health check endpoint
  - Connection retry logic

**Outputs**: Projeto Go estruturado com dependências

---

#### 2.2 API REST CRUD Oráculos (Backend Go) - 16h
**Owner**: Backend Go Developer (Opus 4.5)

**Tarefas**:
- [ ] 2.2.1 Models (2h)
  - `Oracle` struct (id, name, type, domain, config, timestamps, audit)
  - JSON tags, validation tags
  - DTO (Data Transfer Objects) para API
- [ ] 2.2.2 Repository Layer (4h)
  - `OracleRepository` interface
  - Implementations: CreateOracle, GetOracle, ListOracles, UpdateOracle, DeleteOracle, CloneOracle
  - SQL queries com pgx
  - Transaction handling
  - Multi-tenancy enforcement (oracle_id filter)
- [ ] 2.2.3 Service Layer (3h)
  - `OracleService` interface
  - Business logic validation
  - Error handling
  - Audit trail (created_by, updated_by)
- [ ] 2.2.4 API Handlers (4h)
  - `POST /api/v1/oracles` - Create
  - `GET /api/v1/oracles` - List (pagination, filters)
  - `GET /api/v1/oracles/{id}` - Get by ID
  - `PUT /api/v1/oracles/{id}` - Update
  - `DELETE /api/v1/oracles/{id}` - Delete (soft delete)
  - `POST /api/v1/oracles/{id}/clone` - Clone
- [ ] 2.2.5 Input Validation (2h)
  - Validator rules (name required, type enum, domain format)
  - Error responses (standardized JSON)
  - HTTP status codes (201, 200, 404, 400, 500)
- [ ] 2.2.6 Swagger Documentation (1h)
  - Annotations para OpenAPI
  - Generate swagger.yaml
  - Swagger UI endpoint `/docs`

**Outputs**: API REST CRUD Oráculos completa

---

#### 2.3 JWT Authentication (Backend Go) - 8h
**Owner**: Backend Go Developer (Opus 4.5)

**Tarefas**:
- [ ] 2.3.1 JWT Token Generation (2h)
  - Login endpoint: `POST /api/v1/auth/login`
  - User authentication (mock user for now)
  - Generate access token (15 min expiry)
  - Generate refresh token (7 days expiry)
  - Token claims: user_id, email, role
- [ ] 2.3.2 JWT Middleware (3h)
  - Validate token from Authorization header
  - Parse claims
  - Inject user context into request
  - Handle expired tokens (401 Unauthorized)
- [ ] 2.3.3 Protected Routes (1h)
  - Apply JWT middleware to /api/v1/oracles/* routes
  - Public routes: /auth/login, /health
- [ ] 2.3.4 Refresh Token Endpoint (2h)
  - `POST /api/v1/auth/refresh`
  - Validate refresh token
  - Generate new access token

**Outputs**: JWT authentication funcionando

---

#### 2.4 Testes Backend Go (QA Engineer + Backend Go) - 12h
**Owner**: QA Engineer (Opus 4.5)

**Tarefas**:
- [ ] 2.4.1 Unit Tests - Repository (3h)
  - Mock database com pgxmock
  - Test CreateOracle, GetOracle, UpdateOracle, DeleteOracle
  - Edge cases (duplicates, not found, invalid IDs)
- [ ] 2.4.2 Unit Tests - Service (2h)
  - Mock repository
  - Test business logic validation
  - Test error handling
- [ ] 2.4.3 Integration Tests - API (5h)
  - Test database (PostgreSQL testcontainer)
  - Test all CRUD endpoints
  - Test JWT authentication flow
  - Test pagination and filters
- [ ] 2.4.4 Coverage Analysis (2h)
  - Generate coverage report (go test -cover)
  - Ensure ≥80% coverage
  - Identify untested code paths

**Outputs**: Test suite com coverage ≥80%

---

### 📊 Métricas Sprint 2

**Story Points**: 40 SP
**Coverage Target**: ≥80%
**API Endpoints**: 7 endpoints funcionais

**Definition of Done (DoD)**:
- ✅ API REST CRUD Oráculos completa (7 endpoints)
- ✅ JWT authentication funcionando
- ✅ Testes: unit + integration ≥80% coverage
- ✅ Swagger documentation gerada
- ✅ Code review aprovado (Architect Reviewer)

---

## 🐍 Sprint 3 - Backend Python RAG Pipeline (Semana 3)

**Objetivo**: Implementar RAG Trimodal Pipeline (Ingest + Process + Storage + Retrieval)

**Duração**: 5 dias úteis (40 horas)

### Participantes Ativos
- Backend Python Developer (Opus 4.5)
- QA Engineer (Opus 4.5)

---

### 📝 Backlog do Sprint 3

#### 3.1 Setup Projeto FastAPI (Backend Python) - 4h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 3.1.1 Estrutura de diretórios Python (1h)
  - `backend/python/app/` - FastAPI app
  - `backend/python/app/api/` - routers
  - `backend/python/app/rag/` - RAG pipeline
  - `backend/python/app/models/` - Pydantic models
  - `backend/python/app/db/` - database clients
  - `backend/python/app/core/` - config, dependencies
- [ ] 3.1.2 Dependências (1h)
  - fastapi, uvicorn
  - langchain, langchain-community
  - openai (embeddings + LLM)
  - sqlalchemy, asyncpg
  - pgvector (SQLAlchemy extension)
  - nebula3-python (NebulaGraph client)
  - celery, redis
  - PyMuPDF, pytesseract, whisper, beautifulsoup4
- [ ] 3.1.3 Config management (1h)
  - Pydantic Settings
  - Environment variables (.env)
  - Database URLs (PostgreSQL, Redis, NebulaGraph)
  - OpenAI API key
- [ ] 3.1.4 Database clients (1h)
  - AsyncEngine (SQLAlchemy)
  - NebulaGraph connection pool
  - Redis client

**Outputs**: Projeto FastAPI estruturado

---

#### 3.2 Ingestão Multimodal (Backend Python) - 10h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 3.2.1 PDF Processing (2h)
  - PyMuPDF para extração de texto
  - pytesseract OCR para PDFs scanned
  - Metadata extraction (title, author, pages)
- [ ] 3.2.2 Office Documents (2h)
  - python-docx para DOCX
  - openpyxl para XLSX
  - Text extraction + metadata
- [ ] 3.2.3 Audio/Video (2h)
  - Whisper transcrição (local ou API)
  - Timestamp extraction
  - Speaker diarization (opcional)
- [ ] 3.2.4 HTML/Web (1h)
  - BeautifulSoup para scraping
  - Clean HTML (remove scripts, styles)
  - Extract main content
- [ ] 3.2.5 Images (1h)
  - pytesseract OCR
  - Image metadata (EXIF)
- [ ] 3.2.6 Upload API (2h)
  - `POST /api/v1/oracles/{id}/documents` - Upload file
  - File validation (type, size <50MB)
  - Store in S3/MinIO or local filesystem
  - Queue for async processing (Celery)

**Outputs**: Ingestão de 5+ formatos funcionando

---

#### 3.3 Processamento e Chunking (Backend Python) - 8h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 3.3.1 Semantic Chunking (3h)
  - LangChain RecursiveCharacterTextSplitter
  - Chunk size: 512 tokens
  - Overlap: 50 tokens
  - Preserve sentence boundaries
- [ ] 3.3.2 Embedding Generation (3h)
  - OpenAI ada-002 (1536 dimensions)
  - Batch processing (100 chunks/request)
  - Rate limiting handling
  - Cache embeddings (Redis)
- [ ] 3.3.3 NLP Entity Extraction (2h)
  - spaCy en_core_web_sm
  - Extract: PERSON, ORG, DATE, MONEY, etc
  - Store entities in metadata

**Outputs**: Chunking + embedding pipeline funcionando

---

#### 3.4 Storage Trimodal (Backend Python) - 10h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 3.4.1 PostgreSQL Storage (3h)
  - Table: documents (metadata)
  - Table: embeddings (vector(1536))
  - SQLAlchemy models
  - Async insert/update operations
- [ ] 3.4.2 pgvector Integration (3h)
  - HNSW index creation
  - Cosine similarity queries (vector <=> vector)
  - Top-K retrieval (k=10)
  - Metadata filtering (oracle_id)
- [ ] 3.4.3 NebulaGraph Sync (4h)
  - Create vertices: Oracle, Document, Entity
  - Create edges: contains, references, related_to
  - Entity linking (co-occurrence within chunks)
  - Async graph mutations

**Outputs**: Storage em 3 modalidades funcionando

---

#### 3.5 Retrieval e Síntese (Backend Python) - 6h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 3.5.1 SQL Queries (1h)
  - Filter documents by oracle_id
  - Metadata search (filename, type, date)
- [ ] 3.5.2 Graph Traversal (2h)
  - NebulaGraph nGQL queries
  - Find related documents (MATCH paths)
  - Entity-based retrieval (find docs mentioning entity)
- [ ] 3.5.3 Vector Search (2h)
  - pgvector cosine similarity
  - Top-K relevant chunks
  - Reranking (opcional)
- [ ] 3.5.4 LLM Synthesis (1h)
  - GPT-4 Turbo prompt engineering
  - Combine contexts from 3 modalities
  - Generate answer with sources
  - System prompt per Oracle

**Outputs**: Retrieval RAG funcionando end-to-end

---

#### 3.6 Testes Backend Python (QA Engineer + Backend Python) - 12h
**Owner**: QA Engineer (Opus 4.5)

**Tarefas**:
- [ ] 3.6.1 Unit Tests - Chunking (2h)
  - Test RecursiveCharacterTextSplitter
  - Test edge cases (empty, large files)
- [ ] 3.6.2 Unit Tests - Embeddings (2h)
  - Mock OpenAI API
  - Test batch processing
  - Test caching
- [ ] 3.6.3 Integration Tests - RAG Pipeline (6h)
  - Upload PDF → Process → Store → Retrieve
  - Test all 3 modalities (SQL, Graph, Vector)
  - Test synthesis (GPT-4 response)
- [ ] 3.6.4 Coverage Analysis (2h)
  - pytest coverage ≥80%

**Outputs**: Test suite com coverage ≥80%

---

### 📊 Métricas Sprint 3

**Story Points**: 50 SP
**Coverage Target**: ≥80%
**Formats Supported**: ≥5 (PDF, DOCX, audio, video, HTML)

**Definition of Done (DoD)**:
- ✅ Ingestão de 5+ formatos funcionando
- ✅ Chunking + embedding pipeline completo
- ✅ Storage em 3 modalidades (PostgreSQL + pgvector + NebulaGraph)
- ✅ Retrieval RAG funcionando end-to-end
- ✅ Testes: unit + integration ≥80% coverage

---

## 💬 Sprint 4 - Backend Python IA Assistant (Semana 4)

**Objetivo**: Implementar IA Assistant conversacional com RAG + Streaming

**Duração**: 5 dias úteis (40 horas)

### Participantes Ativos
- Backend Python Developer (Opus 4.5)
- QA Engineer (Opus 4.5)

---

### 📝 Backlog do Sprint 4

#### 4.1 Chat API Endpoints (Backend Python) - 12h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 4.1.1 Models (2h)
  - `ChatSession` model (id, oracle_id, user_id, created_at)
  - `ChatMessage` model (id, session_id, role, content, sources JSONB, created_at)
  - Pydantic schemas (request/response)
- [ ] 4.1.2 POST /api/v1/oracles/{id}/chat (5h)
  - Create or resume session
  - Save user message to DB
  - Call RAG retrieval (SQL + Graph + Vector)
  - Call GPT-4 Turbo (with RAG context)
  - Save assistant message with sources
  - Return response (non-streaming for MVP)
- [ ] 4.1.3 GET /api/v1/oracles/{id}/chat/sessions (2h)
  - List user's chat sessions for Oracle
  - Pagination support
  - Sort by created_at DESC
- [ ] 4.1.4 GET /api/v1/oracles/{id}/chat/sessions/{sessionId} (3h)
  - Get full conversation history
  - Include message sources (SQL/Graph/Vector metadata)
  - Format for frontend display

**Outputs**: 3 chat endpoints funcionando

---

#### 4.2 Streaming Responses (Backend Python) - 10h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 4.2.1 SSE Endpoint (4h)
  - `POST /api/v1/oracles/{id}/chat/stream` (Server-Sent Events)
  - OpenAI streaming API integration
  - Yield tokens as they arrive
  - Send [DONE] event when complete
- [ ] 4.2.2 Frontend SSE Client (mock test) (2h)
  - JavaScript EventSource example
  - Handle message events
  - Handle error/close events
- [ ] 4.2.3 Sources Tracking (2h)
  - Include RAG sources in first event
  - Format: `{sql: [...], graph: [...], vector: [...]}`
  - Frontend can display sources before streaming starts
- [ ] 4.2.4 Error Handling (2h)
  - Handle OpenAI API errors
  - Handle network errors
  - Graceful degradation (fallback to non-streaming)

**Outputs**: Streaming responses funcionando

---

#### 4.3 Prompt Engineering (Backend Python) - 6h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 4.3.1 System Prompt Template (2h)
  - Include Oracle context (name, type, domain)
  - Instruction: "You are an AI Assistant for the '{oracle.name}' Oracle..."
  - Behavior guidelines (helpful, precise, cite sources)
- [ ] 4.3.2 RAG Context Injection (2h)
  - Format retrieved chunks
  - Include metadata (document filename, page, section)
  - Max context tokens: 8k (for GPT-4 Turbo)
- [ ] 4.3.3 Few-Shot Examples (1h)
  - Add 2-3 example Q&A per Oracle type
  - Improve response quality
- [ ] 4.3.4 Source Citation (1h)
  - Instruct LLM to cite sources inline
  - Format: "According to [Document Name, p.5], ..."

**Outputs**: Prompt engineering completo

---

#### 4.4 Background Jobs (Backend Python) - 6h
**Owner**: Backend Python Developer (Opus 4.5)

**Tarefas**:
- [ ] 4.4.1 Celery Setup (2h)
  - Redis as message broker
  - Worker configuration
  - Task routing
- [ ] 4.4.2 Document Processing Task (2h)
  - Async task: process_document(document_id)
  - Call ingest → chunk → embed → store
  - Update document status (processing → completed/failed)
- [ ] 4.4.3 Chat History Cleanup Task (2h)
  - Periodic task: cleanup old sessions (>90 days)
  - Archive to S3/MinIO (opcional)
  - Delete from PostgreSQL

**Outputs**: Celery workers rodando

---

#### 4.5 Testes Backend Python IA Assistant (QA Engineer + Backend Python) - 12h
**Owner**: QA Engineer (Opus 4.5)

**Tarefas**:
- [ ] 4.5.1 Unit Tests - Chat Logic (3h)
  - Mock RAG retrieval
  - Mock GPT-4 API
  - Test message creation/retrieval
- [ ] 4.5.2 Integration Tests - Chat API (5h)
  - Test POST /chat (full flow)
  - Test GET /sessions
  - Test GET /sessions/{id}
  - Test streaming endpoint
- [ ] 4.5.3 E2E Test - Conversational Flow (3h)
  - Upload document → Ask question → Get answer with sources
  - Ask follow-up question (context preserved)
  - Verify sources accuracy
- [ ] 4.5.4 Coverage Analysis (1h)
  - pytest coverage ≥80%

**Outputs**: Test suite com coverage ≥80%

---

### 📊 Métricas Sprint 4

**Story Points**: 46 SP
**Coverage Target**: ≥80%
**Features**: Chat conversacional + Streaming + RAG sources

**Definition of Done (DoD)**:
- ✅ 3 chat endpoints funcionando (POST /chat, GET /sessions, GET /sessions/{id})
- ✅ Streaming responses (SSE) funcionando
- ✅ RAG sources tracking completo
- ✅ Celery background jobs rodando
- ✅ Testes: unit + integration + E2E ≥80% coverage

---

## ⚛️ Sprint 5 - Frontend Super Portal (Semana 5)

**Objetivo**: Implementar Super Portal (Next.js 14) + Chat Component

**Duração**: 5 dias úteis (40 horas)

### Participantes Ativos
- Frontend Developer (Opus 4.5)
- QA Engineer (Opus 4.5)
- UX/UI Designer (suporte para dúvidas de design)

---

### 📝 Backlog do Sprint 5

#### 5.1 Setup Projeto Next.js (Frontend Developer) - 4h
**Owner**: Frontend Developer (Opus 4.5)

**Tarefas**:
- [ ] 5.1.1 Estrutura de diretórios Next.js (1h)
  - `frontend/app/` - App Router pages
  - `frontend/components/` - shadcn/ui components
  - `frontend/lib/` - utilities, API clients
  - `frontend/hooks/` - custom React hooks
  - `frontend/types/` - TypeScript types
- [ ] 5.1.2 Dependências (1h)
  - next, react, react-dom
  - @shadcn/ui (install CLI)
  - tailwindcss
  - react-flow-renderer (graph viz)
  - next-auth (authentication)
  - axios ou fetch wrapper
- [ ] 5.1.3 Tailwind Config (1h)
  - Import Design System tokens (colors, fonts, spacing)
  - Configure theme
  - Setup dark mode (opcional)
- [ ] 5.1.4 API Client Setup (1h)
  - Axios instance with baseURL
  - JWT token interceptor
  - Error handling interceptor

**Outputs**: Projeto Next.js estruturado

---

#### 5.2 Páginas CRUD Oráculos (Frontend Developer) - 14h
**Owner**: Frontend Developer (Opus 4.5)

**Tarefas**:
- [ ] 5.2.1 `/oracles` - Listagem (3h)
  - shadcn/ui Table component
  - Fetch oracles from API
  - Pagination (10 items/page)
  - Search bar (client-side filter)
  - Actions: New, Edit, Delete, Clone buttons
- [ ] 5.2.2 `/oracles/new` - Criar (3h)
  - shadcn/ui Form + Input + Select + Textarea
  - Validation (react-hook-form + zod)
  - Submit to POST /api/v1/oracles
  - Success/error toast notifications
- [ ] 5.2.3 `/oracles/{id}` - Detalhes (2h)
  - Fetch oracle by ID
  - shadcn/ui Card layout
  - Tabs: Details, Knowledge, Graph, Chat
  - Actions: Edit, Delete, Clone
- [ ] 5.2.4 `/oracles/{id}/edit` - Editar (2h)
  - Reuse form from /oracles/new
  - Pre-fill with oracle data
  - Submit to PUT /api/v1/oracles/{id}
- [ ] 5.2.5 `/oracles/{id}/knowledge` - Upload (2h)
  - Drag-and-drop area (react-dropzone)
  - File list (uploaded files)
  - Upload progress bar
  - Supported formats badge
- [ ] 5.2.6 `/oracles/{id}/graph` - Grafo (2h)
  - React Flow canvas
  - Fetch graph data from API (NebulaGraph)
  - Render nodes (Oracle, Document, Entity, Concept)
  - Render edges (contains, references, related_to)
  - Controls: zoom, pan, fit view

**Outputs**: 6 páginas funcionando

---

#### 5.3 Chat Component (Frontend Developer) - 12h 🔥 **CRÍTICO**
**Owner**: Frontend Developer (Opus 4.5)

**Tarefas**:
- [ ] 5.3.1 `/oracles/{id}/chat` - Page (2h)
  - Layout: sidebar (sessions) + main (chat)
  - Fetch chat sessions from API
  - Select session or create new
- [ ] 5.3.2 Chat Interface (4h)
  - Message list (user/assistant messages)
  - shadcn/ui inspired design (bubbles)
  - Scroll to bottom on new message
  - Markdown rendering (react-markdown)
  - Code blocks syntax highlighting (prismjs)
- [ ] 5.3.3 Streaming Integration (3h)
  - EventSource for SSE
  - Handle message events (token-by-token)
  - Display typing indicator
  - Append tokens to assistant message
  - Handle [DONE] event
- [ ] 5.3.4 RAG Sources Display (2h)
  - Tooltip on assistant message (shadcn/ui Tooltip)
  - Show sources: SQL, Graph, Vector
  - Format: "Document: filename.pdf, Page: 5"
  - Link to source document (opcional)
- [ ] 5.3.5 Input Area (1h)
  - Textarea auto-resize
  - Send button
  - Disable during streaming
  - Enter to send (Shift+Enter for new line)

**Outputs**: Chat component completo e funcional 🔥

---

#### 5.4 Authentication (Frontend Developer) - 4h
**Owner**: Frontend Developer (Opus 4.5)

**Tarefas**:
- [ ] 5.4.1 NextAuth.js Setup (2h)
  - JWT provider
  - Login page
  - Callbacks (jwt, session)
- [ ] 5.4.2 Protected Routes (1h)
  - Middleware to check auth
  - Redirect to /login if unauthenticated
- [ ] 5.4.3 User Context (1h)
  - Create user context (React Context API)
  - Provide user info to components

**Outputs**: Authentication funcionando

---

#### 5.5 Testes Frontend (QA Engineer + Frontend Developer) - 12h
**Owner**: QA Engineer (Opus 4.5)

**Tarefas**:
- [ ] 5.5.1 Unit Tests - Components (4h)
  - Jest + React Testing Library
  - Test shadcn/ui components
  - Test custom hooks
- [ ] 5.5.2 Integration Tests - Pages (4h)
  - Test CRUD flows (create, edit, delete)
  - Test navigation
  - Mock API calls (MSW)
- [ ] 5.5.3 E2E Tests - Playwright (4h)
  - Test full user flow: Login → Create Oracle → Upload Doc → Chat
  - Test streaming chat
  - Test RAG sources display
- [ ] 5.5.4 Coverage Analysis (opcional) (0h)
  - Jest coverage report

**Outputs**: Test suite completo

---

### 📊 Métricas Sprint 5

**Story Points**: 46 SP
**Pages**: 7 páginas completas
**Components**: Chat component + CRUD forms + Graph viz

**Definition of Done (DoD)**:
- ✅ 7 páginas implementadas conforme mockups
- ✅ Chat component com streaming funcionando
- ✅ RAG sources display completo
- ✅ Authentication funcionando
- ✅ Testes: unit + integration + E2E
- ✅ Code review aprovado (Architect Reviewer)

---

## 🚀 Sprint 6 - Integração, Testes e Deploy (Semana 6)

**Objetivo**: Integração completa + QA + Security + Deploy staging/production

**Duração**: 5 dias úteis (40 horas)

### Participantes Ativos
- QA Engineer (Opus 4.5)
- DevOps Engineer (Opus 4.5)
- Architect Reviewer (Opus 4.5)
- TODOS os desenvolvedores (suporte para correções)

---

### 📝 Backlog do Sprint 6

#### 6.1 Integração E2E (QA Engineer) - 10h
**Owner**: QA Engineer (Opus 4.5)

**Tarefas**:
- [ ] 6.1.1 Test Environment Setup (2h)
  - Docker Compose com todos os serviços
  - PostgreSQL, NebulaGraph, Redis, Pulsar
  - Backend Go, Backend Python, Frontend
- [ ] 6.1.2 E2E Test - Full User Flow (6h)
  - Login → Dashboard
  - Create Oracle (Banking Compliance)
  - Upload documento (PDF regulação BACEN)
  - Wait for processing (background job)
  - Open Chat
  - Ask: "Quais são os requisitos KYC para abertura de conta?"
  - Verify: Assistant responds with RAG sources
  - Ask follow-up: "E para pessoa jurídica?"
  - Verify: Context preserved, correct answer
  - Visualize Knowledge Graph
  - Verify: Nodes and edges rendered
- [ ] 6.1.3 Performance Tests (2h)
  - Locust script
  - 100 concurrent users
  - API response time <200ms p95
  - Chat latency <500ms p95

**Outputs**: E2E tests passing + performance report

---

#### 6.2 Security Audit (QA Engineer) - 8h
**Owner**: QA Engineer (Opus 4.5)

**Tarefas**:
- [ ] 6.2.1 OWASP Top 10 (4h)
  - SQL Injection: Test with malicious inputs
  - XSS: Test frontend inputs
  - CSRF: Verify tokens
  - Authentication bypass attempts
  - Insecure dependencies (Snyk scan)
- [ ] 6.2.2 Dependency Scanning (2h)
  - Trivy scan Docker images
  - Snyk scan Python/Go/Node dependencies
  - Fix or accept vulnerabilities
- [ ] 6.2.3 Secrets Scanning (2h)
  - TruffleHog scan codebase
  - Verify no hardcoded secrets
  - Verify .env.example (no secrets)

**Outputs**: Security audit report (0 HIGH/CRITICAL vulnerabilities)

---

#### 6.3 Architecture Review (Architect Reviewer) - 8h
**Owner**: Architect Reviewer (Opus 4.5)

**Tarefas**:
- [ ] 6.3.1 ADR Conformance (3h)
  - Verify ADR-002 (Apache Pulsar) - messaging used
  - Verify ADR-003 (PostgreSQL + NebulaGraph + pgvector) - correct stack
  - Verify ADR-005 (Next.js 14 App Router) - correct routing
  - Verify ADR-006 (Go for Backend Core) - CRUD in Go
  - Verify ADR-007 (Multi-Tenancy via oracle_id) - all queries filtered
  - Verify ADR-009 (Super Portal) - portal implemented
  - Verify ADR-010 (React Flow) - graph viz correct
- [ ] 6.3.2 Code Review - Architecture (3h)
  - Layering (6 camadas SuperCore)
  - Separation of concerns
  - Dependency injection
  - Interface segregation
  - Code coupling analysis
- [ ] 6.3.3 Validation Report (2h)
  - Document conformance or violations
  - Approve or request changes

**Outputs**: `ARCHITECTURE_REVIEW.md` + `ADR_CONFORMANCE_REPORT.md`

---

#### 6.4 CI/CD Pipelines (DevOps Engineer) - 10h
**Owner**: DevOps Engineer (Opus 4.5)

**Tarefas**:
- [ ] 6.4.1 GitHub Actions - Backend Go (2h)
  - Trigger: push to main, PR
  - Steps: lint, test, build Docker image, push to registry
  - Security: Trivy scan
- [ ] 6.4.2 GitHub Actions - Backend Python (2h)
  - Trigger: push to main, PR
  - Steps: lint (ruff), test (pytest), build Docker image, push
  - Security: Snyk scan
- [ ] 6.4.3 GitHub Actions - Frontend (2h)
  - Trigger: push to main, PR
  - Steps: lint (eslint), test (jest + playwright), build, push
- [ ] 6.4.4 GitHub Actions - Deploy (4h)
  - Trigger: tag (v1.0.0)
  - Steps:
    - Build all images
    - Push to registry
    - Run migrations
    - Deploy to Kubernetes (dev → staging → prod)
    - Health checks
    - Rollback on failure

**Outputs**: CI/CD pipelines funcionando

---

#### 6.5 Deploy Staging (DevOps Engineer) - 6h
**Owner**: DevOps Engineer (Opus 4.5)

**Tarefas**:
- [ ] 6.5.1 Staging Environment (2h)
  - Terraform apply (staging)
  - Kubernetes namespace: staging
  - ConfigMaps + Secrets
- [ ] 6.5.2 Deploy Application (2h)
  - Helm install supercore (staging)
  - Verify pods running
  - Verify services accessible
- [ ] 6.5.3 Smoke Tests (1h)
  - Test /health endpoints
  - Test login
  - Test create Oracle
  - Test chat
- [ ] 6.5.4 Monitoring Setup (1h)
  - Grafana dashboard (staging)
  - Prometheus metrics
  - Alerts configured

**Outputs**: Staging deployment completo

---

#### 6.6 Deploy Production (DevOps Engineer) - 4h 🚨 **GATE**
**Owner**: DevOps Engineer (Opus 4.5)

**Tarefas**:
- [ ] 6.6.1 Production Readiness Checklist (1h)
  - ✅ All tests passing
  - ✅ Security audit clean
  - ✅ Architecture review approved
  - ✅ Performance benchmarks met
  - ✅ Runbooks created
  - ✅ Monitoring configured
  - ✅ Backup strategy validated
- [ ] 6.6.2 Production Deploy (2h)
  - Terraform apply (prod)
  - Helm install supercore (prod)
  - Blue-green deployment
  - Verify health checks
- [ ] 6.6.3 Post-Deploy Validation (1h)
  - Smoke tests (prod)
  - Monitor metrics (10 min)
  - Verify no errors in logs

**Outputs**: Production deployment completo 🎉

**🚨 GATE**: Requer aprovação PO + Tech Lead antes de deploy production

---

### 📊 Métricas Sprint 6

**Story Points**: 46 SP
**Environments**: dev + staging + prod
**Tests**: E2E + Security + Performance

**Definition of Done (DoD)**:
- ✅ E2E tests passing (full user flow)
- ✅ Security audit: 0 HIGH/CRITICAL vulnerabilities
- ✅ Architecture review: conformidade 100% ADRs
- ✅ CI/CD pipelines funcionando
- ✅ Staging deploy bem-sucedido
- ✅ Production deploy bem-sucedido (após aprovação)
- ✅ Monitoring + alerting configurados
- ✅ Runbooks criados (troubleshooting, deploy, rollback)

---

## 📊 Resumo Geral dos Sprints

| Sprint | Duração | Story Points | Foco Principal | Entrega-Chave |
|--------|---------|--------------|----------------|---------------|
| Sprint 1 | 1 semana | 52 SP | Fundação | Backlog + Mockups + Infra + DB Schemas |
| Sprint 2 | 1 semana | 40 SP | Backend Go | API REST CRUD Oráculos + JWT Auth |
| Sprint 3 | 1 semana | 50 SP | Backend Python RAG | RAG Trimodal Pipeline (Ingest + Process + Storage + Retrieval) |
| Sprint 4 | 1 semana | 46 SP | Backend Python IA | IA Assistant Service (Chat + Streaming + RAG sources) |
| Sprint 5 | 1 semana | 46 SP | Frontend | Super Portal (7 páginas + Chat Component) 🔥 |
| Sprint 6 | 1 semana | 46 SP | Integração + Deploy | E2E Tests + Security + CI/CD + Staging + **PROD** 🚀 |
| **TOTAL** | **6 semanas** | **280 SP** | **Fase 1 Completa** | **SuperCore v2.0 - Fase 1 em Produção** ✅ |

---

## 🎯 Gates de Aprovação

### 🚨 Gate 1 - Sprint 1 (Mockups UX/UI)
**Quando**: Final do Sprint 1
**Aprovador**: Usuário (Product Owner)
**Critério**: 7 mockups de alta fidelidade aprovados
**Bloqueio**: Sprint 5 não inicia sem aprovação

### 🚨 Gate 2 - Sprint 6 (Production Deploy)
**Quando**: Final do Sprint 6
**Aprovadores**: PO + Tech Lead
**Critério**:
- ✅ E2E tests passing
- ✅ Security audit clean
- ✅ Architecture review approved
- ✅ Staging deployment validado
**Bloqueio**: Production deploy aguarda aprovação

---

## 📈 Métricas de Progresso

### Velocity Tracking
- **Planejado**: 280 SP em 6 semanas (média 46.7 SP/semana)
- **Real**: Atualizar após cada sprint
- **Burndown**: Chart atualizado diariamente

### Coverage Tracking
- **Target**: ≥80% (unit + integration)
- **Atual**: Atualizar após cada sprint

### Performance Tracking
- **API Response Time (p95)**: Target <200ms
- **RAG Pipeline Latency (p95)**: Target <500ms
- **Chat Streaming**: Target <100ms first token

---

## 🛠️ Ferramentas e Processos

### Daily Standups
- **Quando**: Diário, 9:00 AM (15 min)
- **Formato**: What did I do? What will I do? Any blockers?
- **Owner**: Scrum Master (facilitação)

### Sprint Planning
- **Quando**: Segunda-feira de cada sprint (2h)
- **Participantes**: Toda a Squad
- **Output**: Sprint backlog definido

### Sprint Review
- **Quando**: Sexta-feira de cada sprint (1h)
- **Participantes**: Squad + Stakeholders (PO, Tech Lead)
- **Output**: Demo + feedback

### Sprint Retrospective
- **Quando**: Sexta-feira de cada sprint (1h)
- **Formato**: What went well? What can improve? Action items
- **Owner**: Scrum Master

---

## 📝 Próximos Passos

1. ✅ **Scrum Master**: Criar `BACKLOG_FASE_1.md` (este documento)
2. ✅ **Squad**: Revisar e aprovar sprints
3. 🚧 **Sprint 1 Start**: Segunda-feira próxima (kick-off)
4. 🚧 **Daily Standups**: Iniciar no primeiro dia do Sprint 1

---

**Última Atualização**: 2025-12-28
**Próxima Revisão**: Após cada sprint (retrospectiva)
**Squad Lead**: Orchestrator Agent (context-manager)
**Scrum Master**: Business Analyst + Technical Writer (Sonnet 4.5)
