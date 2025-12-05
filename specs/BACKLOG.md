# intelliCore - Product Backlog

> **Version**: 3.3
> **Updated**: 2025-12-04
> **Sprint Atual**: Sprint 19 ✅ COMPLETE (CoreBanking Brain) | Sprint 20 ⏳ PLANNED
> **Status**: Core Platform Complete - CoreBanking Brain Sprint 19 Complete (90%)

---

## Quick Stats

| Metric | Value |
|--------|-------|
| **Total Epics** | 7 |
| **Total User Stories** | 81 |
| **Total Story Points** | ~524 |
| **Core Sprints** | 15 (Complete) |
| **CoreBanking Brain Sprints** | 5 (Planned: 16-20) |
| **Completion** | Core: 100% (Sprint 15/15) |

---

## Sprint Tracker

### ✅ Sprint 1 - Backend GraphQL Foundation (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 28 |

**Sprint Goal**: Establish production-ready GraphQL API foundation with authentication, database connectivity, and core infrastructure

**Sprint Dates**: Dec 02 - Dec 13, 2025

**Squad Lead**: `backend-architect`

**Deliverables**:
- US-001: GraphQL Server Setup ✅
- US-002: PostgreSQL TypeORM Configuration ✅
- US-003: ObjectType Entity & GraphQL CRUD ✅
- US-004: Field Entity with Dynamic Typing ✅
- US-005: Keycloak JWT Integration ✅

**Report**: [SPRINT_01_REPORT.md](sprints/SPRINT_01_REPORT.md)

---

### ✅ Sprint 2 - Backend CRUD Enhancement (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 22 |

**Sprint Goal**: Complete backend CRUD operations for ObjectTypes with full GraphQL API, RBAC, and error handling

**Sprint Dates**: Dec 16 - Dec 27, 2025

**Squad Lead**: `graphql-architect`

**Deliverables**:
- US-006: ObjectType Service Layer Enhancement ✅
- US-007: GraphQL Input Types ✅
- US-008: ObjectTypes GraphQL Resolver Enhancement ✅
- US-009: Pagination Support ✅
- US-010: Error Handling & Validation ✅

**Report**: [SPRINT_02_REPORT.md](sprints/SPRINT_02_REPORT.md)

---

### ✅ Sprint 3 - Frontend BACKOFFICE Foundation (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 24 |

**Sprint Goal**: Complete frontend UI for ObjectTypes with forms, validation, and list views

**Sprint Dates**: Dec 30 - Jan 10, 2026

**Squad Lead**: `frontend-developer`

**Deliverables**:
- US-011: Apollo Client Setup ✅
- US-012: Dashboard Layout ✅
- US-013: ObjectTypes List Page ✅
- US-014: Create ObjectType Form ✅
- US-015: Edit ObjectType Form ✅

**Report**: [SPRINT_03_REPORT.md](sprints/SPRINT_03_REPORT.md)

---

### ✅ Sprint 4 - Relationship Management (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 26 |

**Sprint Goal**: Implement relationship management with graph traversal algorithms for hierarchies

**Sprint Dates**: Jan 13 - Jan 24, 2026

**Squad Lead**: `database-architect`

**Deliverables**:
- US-017: Relationship Entity Schema ✅
- US-018: Relationship Service Layer ✅
- US-019: Relationship GraphQL API ✅
- US-020: Graph Traversal Algorithms ✅
- US-021: Relationship Validation Rules ✅

**Report**: [SPRINT_04_REPORT.md](sprints/SPRINT_04_REPORT.md)

**Key Features**:
- ObjectRelationshipEntity with source/target types, cardinality, and bidirectionality
- Full CRUD operations with soft delete support
- 6 graph traversal algorithms: BFS, DFS, ancestors, descendants, shortest path, cycle detection
- Validation for duplicate relationships and cardinality constraints
- Transaction support for atomic operations
- Comprehensive unit tests (30+ test cases)

---

### ✅ Sprint 5 - Graph Visualization & Navigation (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 24 |

**Sprint Goal**: Implement interactive graph visualization with Cytoscape.js and complete relationship management UI

**Sprint Dates**: Jan 27 - Feb 07, 2026

**Squad Lead**: `frontend-developer`

**Deliverables**:
- US-022: Graph Visualization Component (Cytoscape.js) ✅
- US-023: Relationship Creation UI ✅
- US-024: Graph Navigation & Filtering ✅
- US-025: Hierarchies List View ✅
- US-026: Performance Optimization ✅

**Report**: [SPRINT_05_REPORT.md](sprints/SPRINT_05_REPORT.md)

**Key Features**:
- Full Cytoscape.js integration with multiple layout algorithms
- Interactive graph with zoom, pan, node selection
- Relationship CRUD modal with Zod validation
- Search and filtering capabilities
- Export functionality (PNG, JPG, SVG, CSV)
- Full i18n support (pt-BR, en-US, es-ES)

---

### ✅ Sprint 6 - Document Upload & Storage (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 6 | 31 |

**Sprint Goal**: Implement document upload system with S3/MinIO storage and manageable document types

**Sprint Dates**: Feb 10 - Feb 21, 2026

**Squad Lead**: `backend-architect`

**Deliverables**:
- US-027: Document Storage Setup (MinIO/S3) ✅
- US-027B: Document Type Entity (Manageable Categories) ✅
- US-028: Document Entity & Repository ✅
- US-029: Document Upload Service ✅
- US-030: Document Upload GraphQL API ✅
- US-031: Document Upload UI ✅

**Report**: [SPRINT_06_REPORT.md](sprints/SPRINT_06_REPORT.md)

**Key Features**:
- MinIO (S3-compatible) object storage integration
- Manageable Document Types - Full CRUD for categories (BACEN, Internal Policy, etc.)
- Two-step upload flow: presigned URL → S3 upload → backend confirmation
- Automatic text extraction from PDF and DOCX files
- File validation per document type (extensions, size limits)
- Presigned download URLs with expiration
- Drag-and-drop upload UI with progress indicator

---

### ✅ Sprint 7 - RAG Indexing & Semantic Search (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 31 |

**Sprint Goal**: Implement RAG system with vector search for document-based question answering

**Sprint Dates**: Feb 24 - Mar 07, 2026

**Squad Lead**: `ai-engineer`

**Deliverables**:
- US-032: Qdrant Vector Database Setup ✅
- US-033: Document Chunking Service ✅
- US-034: Embeddings Generation (Ollama) ✅
- US-035: Semantic Search API ✅
- US-036: Semantic Search UI ✅

**Report**: [SPRINT_07_REPORT.md](sprints/SPRINT_07_REPORT.md)

**Key Features**:
- Qdrant vector database integration (HNSW index, cosine similarity)
- Local embeddings via Ollama (nomic-embed-text, 768 dimensions)
- Text chunking service (512 tokens default, 50 token overlap)
- BullMQ async processor for embedding generation
- Semantic search GraphQL API with score threshold filtering
- Search UI with real-time results and relevance scores

**Infrastructure Added**:
- Qdrant (ports 6333, 6334)
- Ollama (port 11434)

---

### ✅ Sprint 8 - LLM Gateway Service (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 28 |

**Sprint Goal**: Build Python FastAPI service for LLM operations with Ollama integration

**Sprint Dates**: Mar 10 - Mar 21, 2026

**Squad Lead**: `ai-engineer`

**Deliverables**:
- US-037: Python FastAPI Service Setup ✅
- US-038: Ollama Integration ✅
- US-039: Model Management ✅
- US-040: Prompt Template System ✅
- US-041: LLM Gateway API ✅

**Report**: [SPRINT_08_REPORT.md](sprints/SPRINT_08_REPORT.md)

**Key Features**:
- Python FastAPI microservice (port 8001)
- Full Ollama integration (chat, embeddings, model management)
- Streaming chat completions (SSE)
- 6 built-in prompt templates for intelliCore
- Jinja2-based template rendering with variable validation
- Field validation endpoint using LLM
- ObjectType field suggestion endpoint
- Docker containerization with multi-stage build

**Built-in Prompt Templates**:
- `field-validation` - Validate field values against business rules
- `object-type-suggestion` - Suggest fields for new ObjectTypes
- `relationship-validation` - Validate relationships between ObjectTypes
- `document-summarize` - Summarize documents for RAG indexing
- `rag-answer` - Generate answers from retrieved context
- `natural-language-query` - Convert natural language to structured queries

**Infrastructure Added**:
- LLM Gateway (port 8001)

---

### ✅ Sprint 9 - LLM Validation Engine (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 29 |

**Sprint Goal**: Implement LLM-powered validation engine for intelligent field extraction and business rules validation

**Sprint Dates**: Mar 24 - Apr 04, 2026

**Squad Lead**: `prompt-engineer`

**Deliverables**:
- US-042: Field Extraction Prompts ✅
- US-043: Business Rules Validation ✅
- US-044: RAG Query Integration ✅
- US-045: Validation Feedback UI ✅
- US-046: LLM Monitoring & Logging ✅

**Report**: [SPRINT_09_REPORT.md](sprints/SPRINT_09_REPORT.md)

**Key Features**:
- 7 new prompt templates (field-extraction, entity-recognition, business-rule-validation, etc.)
- Full validation API (/api/v1/validation) with 7 endpoints
- Financial entity recognition (CPF, CNPJ, PIX keys, currency, dates)
- Business rules validation with risk scoring and recommendations
- Cross-field validation and consistency checking
- RAG-powered contextual validation with document citations
- LLM monitoring service with metrics dashboard
- React components: ValidationFeedback, FieldExtractionPreview
- useLLMValidation hook for frontend integration

**Templates Added**:
- `field-extraction` - Extract fields from free-text
- `field-extraction-batch` - Batch extraction
- `entity-recognition` - Brazilian financial entities
- `business-rule-validation` - Business rules compliance
- `cross-field-validation` - Field consistency
- `rag-validation-context` - RAG query generation
- `contextual-validation` - RAG-powered validation

---

### ✅ Sprint 10 - Instance CRUD Backend (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 28 |

**Sprint Goal**: Implement Instance CRUD operations with dynamic schema validation and relationship linking

**Sprint Dates**: Apr 07 - Apr 18, 2026

**Squad Lead**: `backend-architect`

**Deliverables**:
- US-047: Objects Table & Schema ✅
- US-048: Dynamic Schema Validation ✅
- US-049: Instance Service Layer ✅
- US-050: Instance GraphQL API ✅
- US-051: Relationship Instance Linking ✅

**Report**: [SPRINT_10_REPORT.md](sprints/SPRINT_10_REPORT.md)

**Key Features**:
- InstanceEntity with JSONB data storage for dynamic fields
- InstanceRelationshipEntity for linking instances
- Dynamic schema validation against ObjectType field definitions
- Status lifecycle (DRAFT, ACTIVE, INACTIVE, ARCHIVED, DELETED)
- Brazilian financial ID validation (CPF, CNPJ)
- Cursor-based pagination with filtering
- Cardinality validation for relationships
- GraphQL API with 12 operations

---

### ✅ Sprint 11 - Free-text Instance Creation (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 26 |

**Sprint Goal**: Implement guided wizard for creating instances from free-text using LLM extraction

**Sprint Dates**: Apr 21 - May 02, 2026

**Squad Lead**: `frontend-developer`

**Deliverables**:
- US-052: Free-text Input Component ✅
- US-053: LLM Extraction Integration ✅
- US-054: Field Mapping Preview ✅
- US-055: Validation Feedback Panel ✅
- US-056: Instance Creation Flow ✅

**Report**: [SPRINT_11_REPORT.md](sprints/SPRINT_11_REPORT.md)

**Key Features**:
- FreeTextInput component with character counting and paste handling
- ObjectTypeSelector with field preview and search
- ExtractionPreview with confidence indicators (high/medium/low)
- Accept/reject/edit workflow for extracted fields
- "Accept All High Confidence" bulk action
- 5-step creation wizard (select → input → extract → validate → confirm)
- CreationStepper visual progress indicator
- Instances list page with status filtering
- GraphQL operations for instance management

---

### ✅ Sprint 12 - Instance Search & Workflows (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 28 |

**Sprint Goal**: Implement full-text search with Meilisearch and workflow state machine for instance lifecycle management

**Sprint Dates**: May 05 - May 16, 2026

**Squad Lead**: `graphql-architect`

**Deliverables**:
- US-057: Meilisearch Integration ✅
- US-058: Advanced Search UI ✅
- US-059: Workflow State Machine ✅
- US-060: State Transition Logic ✅
- US-061: Workflow Visualization ✅

**Report**: [SPRINT_12_REPORT.md](sprints/SPRINT_12_REPORT.md)

**Key Features**:
- Meilisearch full-text search integration with typo tolerance
- Event-driven auto-indexing of instances
- Advanced search UI with filters, facets, and autocomplete
- Workflow engine supporting LINEAR, STATE_MACHINE, and APPROVAL types
- State transition logic with role-based validation and history tracking
- Workflow visualization components (diagram, history, panel)
- 18 new GraphQL operations (6 search + 12 workflow)

---

### ✅ Sprint 13 - Graph Query Engine (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 28 |

**Sprint Goal**: Implement NebulaGraph integration for complex graph queries, traversal algorithms, and analytics

**Sprint Dates**: May 19 - May 30, 2026

**Squad Lead**: `database-architect`

**Deliverables**:
- US-062: NebulaGraph Setup ✅
- US-063: Graph Query Language (nGQL) ✅
- US-064: Relationship Traversal ✅
- US-065: Graph Analytics ✅
- US-066: Graph Query UI ✅

**Report**: [SPRINT_13_REPORT.md](sprints/SPRINT_13_REPORT.md)

**Key Features**:
- NebulaGraph 3-node cluster (metad, storaged, graphd)
- nGQL query execution with parameter substitution
- Graph traversal (BFS, DFS, shortest path, all paths)
- Graph analytics (degree/betweenness/closeness centrality, PageRank, clustering)
- PostgreSQL to NebulaGraph sync (auto and full)
- Graph Query UI (console, analytics panel, path finder, stats, admin)
- 18 new GraphQL operations

---

### ✅ Sprint 14 - Analytics & Reporting (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 26 |

**Sprint Goal**: Implement analytics dashboard with reporting and data export capabilities

**Sprint Dates**: Jun 02 - Jun 13, 2026

**Squad Lead**: `backend-architect`

**Deliverables**:
- US-067: Analytics Dashboard ✅
- US-068: Report Generation ✅
- US-069: Data Export (CSV, Excel) ✅
- US-070: Visualization Components ✅
- US-071: Scheduled Reports ✅

**Report**: [SPRINT_14_REPORT.md](sprints/SPRINT_14_REPORT.md)

**Key Features**:
- Analytics query service with metrics and dimensions
- Dashboard summary with key statistics
- Time series data with configurable granularity
- Data export (CSV, Excel, JSON, PDF)
- SVG-based visualization components (bar, line, pie charts)
- Scheduled report generation with cron
- Report execution tracking and history
- 13 new GraphQL operations

---

### ✅ Sprint 15 - Production Hardening (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 31 |

**Sprint Goal**: Harden the platform for production deployment with security, performance, monitoring, and automation

**Sprint Dates**: Jun 16 - Jun 27, 2026

**Squad Lead**: `security-auditor`

**Deliverables**:
| US | Title | Points | Status |
|----|-------|--------|--------|
| US-072 | Security Hardening | 8 | DONE ✅ |
| US-073 | Performance Optimization | 5 | DONE ✅ |
| US-074 | Documentation Completion | 5 | DONE ✅ |
| US-075 | Deployment Automation | 8 | DONE ✅ |
| US-076 | Monitoring & Alerting | 5 | DONE ✅ |

**Report**: [SPRINT_15_REPORT.md](sprints/SPRINT_15_REPORT.md)

**Key Features**:
- Security hardening: Helmet.js, rate limiting, audit logging, input sanitization
- Performance: Redis caching, DataLoader, database optimization, query complexity limiting
- Documentation: Swagger API docs, JSDoc comments
- Deployment: GitHub Actions CI/CD, production Dockerfile, docker-compose.prod.yml, nginx reverse proxy
- Monitoring: Prometheus metrics, Grafana dashboards, Loki logging, structured JSON logs

---

#### US-072: Security Hardening
| Field | Value |
|-------|-------|
| **ID** | US-072 |
| **Priority** | P0 |
| **Points** | 8 |
| **Status** | TODO |
| **Sprint** | 15 |
| **Agent** | security-auditor |

**Story**: As a security officer, I want the platform to follow security best practices, so that we can safely deploy to production

**Acceptance Criteria**:
- [ ] **Authentication & Authorization**
  - [ ] Keycloak session timeout and refresh token rotation configured
  - [ ] RBAC permissions enforced on all GraphQL operations
  - [ ] API rate limiting implemented (100 req/min per user, 1000 req/min per IP)
  - [ ] JWT token validation with proper expiration handling
- [ ] **Input Validation & Sanitization**
  - [ ] All GraphQL inputs validated with class-validator
  - [ ] SQL injection prevention verified (parameterized queries)
  - [ ] XSS prevention on all user-generated content
  - [ ] File upload validation (type, size, content scanning)
- [ ] **Security Headers**
  - [ ] Helmet.js configured with strict CSP
  - [ ] CORS properly configured for production domains
  - [ ] HSTS, X-Frame-Options, X-Content-Type-Options headers
- [ ] **Secrets Management**
  - [ ] No hardcoded secrets in codebase (verified with git-secrets)
  - [ ] Environment variables properly documented
  - [ ] Secrets rotation strategy documented
- [ ] **Audit Logging**
  - [ ] All authentication events logged
  - [ ] All data mutations logged with user context
  - [ ] Sensitive data access logged
  - [ ] Log retention policy defined (90 days minimum)
- [ ] **Dependency Security**
  - [ ] npm audit with 0 high/critical vulnerabilities
  - [ ] pip audit for Python dependencies
  - [ ] Snyk or similar SAST tool configured

**Technical Tasks**:
1. Configure Helmet.js with production CSP policy
2. Implement rate limiting middleware (express-rate-limit)
3. Add audit logging service for security events
4. Run security scan and fix all critical issues
5. Document security configuration and policies
6. Configure Keycloak production settings

---

#### US-073: Performance Optimization
| Field | Value |
|-------|-------|
| **ID** | US-073 |
| **Priority** | P1 |
| **Points** | 5 |
| **Status** | TODO |
| **Sprint** | 15 |
| **Agent** | performance-engineer |

**Story**: As a user, I want the platform to respond quickly, so that I can work efficiently

**Acceptance Criteria**:
- [ ] **Database Optimization**
  - [ ] All queries using indexes (verified with EXPLAIN ANALYZE)
  - [ ] N+1 queries eliminated (DataLoader configured)
  - [ ] Connection pooling optimized (min: 5, max: 20)
  - [ ] Query timeout configured (30s default)
- [ ] **Caching Strategy**
  - [ ] Redis/Valkey caching for frequently accessed data
  - [ ] GraphQL response caching for read-heavy queries
  - [ ] Cache invalidation on mutations
  - [ ] TTL configured per data type
- [ ] **API Performance**
  - [ ] GraphQL query complexity limiting
  - [ ] Query depth limiting (max: 10)
  - [ ] Batch loading for related entities
  - [ ] Response compression (gzip)
- [ ] **Frontend Performance**
  - [ ] Bundle size < 500KB (gzipped)
  - [ ] Lazy loading for routes and heavy components
  - [ ] Image optimization (WebP, lazy loading)
  - [ ] Core Web Vitals targets (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] **Performance Targets**
  - [ ] API response time < 200ms (p95)
  - [ ] Dashboard load time < 3s
  - [ ] Search response time < 500ms

**Technical Tasks**:
1. Add database indexes for common query patterns
2. Configure DataLoader for GraphQL resolvers
3. Implement Redis caching layer
4. Optimize frontend bundle with tree-shaking
5. Add performance monitoring instrumentation
6. Create performance benchmark suite

---

#### US-074: Documentation Completion
| Field | Value |
|-------|-------|
| **ID** | US-074 |
| **Priority** | P1 |
| **Points** | 5 |
| **Status** | TODO |
| **Sprint** | 15 |
| **Agent** | docs-architect |

**Story**: As a developer, I want comprehensive documentation, so that I can understand and maintain the system

**Acceptance Criteria**:
- [ ] **API Documentation**
  - [ ] GraphQL schema fully documented (descriptions on all types/fields)
  - [ ] LLM Gateway OpenAPI spec complete
  - [ ] Example queries and mutations for all operations
  - [ ] Error codes and handling documented
- [ ] **Architecture Documentation**
  - [ ] System architecture diagram (C4 model)
  - [ ] Data flow diagrams for key processes
  - [ ] Integration points documented
  - [ ] ADRs for all major decisions
- [ ] **Operations Documentation**
  - [ ] Deployment guide (step-by-step)
  - [ ] Environment configuration guide
  - [ ] Backup and recovery procedures
  - [ ] Troubleshooting guide
- [ ] **Developer Documentation**
  - [ ] Local development setup guide
  - [ ] Coding standards reference
  - [ ] Testing guide
  - [ ] Contributing guidelines
- [ ] **User Documentation**
  - [ ] BACKOFFICE user manual (pt-BR)
  - [ ] FRONT-OFFICE user guide (pt-BR)
  - [ ] Feature walkthroughs with screenshots

**Technical Tasks**:
1. Generate GraphQL documentation from schema
2. Create OpenAPI spec for LLM Gateway
3. Write deployment runbook
4. Update ARCHITECTURE.md with final diagrams
5. Create user manual with screenshots
6. Review and update all README files

---

#### US-075: Deployment Automation
| Field | Value |
|-------|-------|
| **ID** | US-075 |
| **Priority** | P0 |
| **Points** | 8 |
| **Status** | TODO |
| **Sprint** | 15 |
| **Agent** | deployment-engineer |

**Story**: As a DevOps engineer, I want automated deployment pipelines, so that releases are consistent and reliable

**Acceptance Criteria**:
- [ ] **CI Pipeline**
  - [ ] GitHub Actions workflow for PR checks
  - [ ] Lint, type-check, and test on all PRs
  - [ ] Security scanning in CI (npm audit, Snyk)
  - [ ] Build verification for all services
- [ ] **CD Pipeline**
  - [ ] Automated deployment to staging on merge to develop
  - [ ] Manual approval gate for production
  - [ ] Database migration automation
  - [ ] Rollback capability
- [ ] **Docker Configuration**
  - [ ] Production Dockerfiles optimized (multi-stage builds)
  - [ ] Docker Compose for local development
  - [ ] Docker Compose for staging/production
  - [ ] Health checks on all containers
- [ ] **Infrastructure as Code**
  - [ ] docker-compose.prod.yml for production
  - [ ] Environment-specific configurations
  - [ ] Secrets management (Docker secrets or external)
  - [ ] Volume management for persistence
- [ ] **Release Management**
  - [ ] Semantic versioning automation
  - [ ] Changelog generation
  - [ ] Release tagging
  - [ ] Version displayed in application

**Technical Tasks**:
1. Create GitHub Actions CI workflow
2. Create GitHub Actions CD workflow with environments
3. Optimize all Dockerfiles for production
4. Create docker-compose.prod.yml
5. Implement database migration in CI/CD
6. Add semantic-release for versioning

---

#### US-076: Monitoring & Alerting
| Field | Value |
|-------|-------|
| **ID** | US-076 |
| **Priority** | P1 |
| **Points** | 5 |
| **Status** | TODO |
| **Sprint** | 15 |
| **Agent** | observability-engineer |

**Story**: As an operator, I want to monitor system health and receive alerts, so that I can respond to issues quickly

**Acceptance Criteria**:
- [ ] **Metrics Collection**
  - [ ] Prometheus metrics endpoint on all services
  - [ ] Application metrics (requests, latency, errors)
  - [ ] Business metrics (instances created, searches, exports)
  - [ ] Infrastructure metrics (CPU, memory, disk, network)
- [ ] **Logging**
  - [ ] Structured JSON logging on all services
  - [ ] Log levels configurable per environment
  - [ ] Request correlation IDs across services
  - [ ] Centralized log aggregation ready
- [ ] **Tracing**
  - [ ] OpenTelemetry instrumentation
  - [ ] Distributed tracing across services
  - [ ] Trace context propagation
- [ ] **Dashboards**
  - [ ] System health dashboard (Grafana)
  - [ ] API performance dashboard
  - [ ] Business metrics dashboard
  - [ ] Error rate dashboard
- [ ] **Alerting**
  - [ ] Alert rules for critical metrics
  - [ ] Error rate > 1% triggers alert
  - [ ] Latency p95 > 1s triggers alert
  - [ ] Service down triggers immediate alert
  - [ ] Alert notification channels configured

**Technical Tasks**:
1. Add Prometheus metrics to NestJS (prom-client)
2. Add Prometheus metrics to FastAPI
3. Configure structured logging with correlation IDs
4. Create Grafana dashboards
5. Define alerting rules in Prometheus/Alertmanager
6. Add OpenTelemetry tracing

---

## === COREBANKING BRAIN SUB-PROJECT ===

> **New Squad**: CoreBanking Brain Team
> **Specification**: [COREBANKING_BRAIN_SPEC.md](COREBANKING_BRAIN_SPEC.md)
> **Status**: Sprint 17 COMPLETE

---

### ✅ Sprint 16 - Document Upload & Bronze Processing (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 26 |

**Sprint Goal**: Implement document categorization system and Bronze layer processing for RAG pipeline

**Sprint Dates**: Dec 04, 2025

**Squad Lead**: `ai-engineer`

**Deliverables**:
| US | Title | Points | Status | Agent |
|----|-------|--------|--------|-------|
| US-DB-001 | Document Category Management | 5 | DONE | backend-architect |
| US-DB-002 | Enhanced Document Upload | 5 | DONE | frontend-developer |
| US-DB-003 | Bronze Layer Processing | 8 | DONE | ai-engineer |
| US-DB-004 | Process for RAG Button | 3 | DONE | frontend-developer |
| US-DB-005 | Processing Status Indicator | 5 | DONE | frontend-developer |

**Report**: [SPRINT_16_REPORT.md](sprints/SPRINT_16_REPORT.md)

**Key Features**:
- DocumentCategory entity with RAG config, metadata schema, and target gold layers
- 20 pre-seeded categories (BACEN, KYC, Compliance, Products, LBPay)
- Bronze Layer Processing Service with BullMQ async queue
- PDF, Markdown, DOCX text extraction
- Enhanced document upload with category selection dropdown
- Processing status badges (pending/processing/completed/failed)
- "Process for RAG" button with confirmation dialog
- Database migrations with full seed data

---

#### US-DB-001: Document Category Management

| Field | Value |
|-------|-------|
| **ID** | US-DB-001 |
| **Priority** | P0 |
| **Points** | 5 |
| **Status** | DONE |
| **Sprint** | 16 |
| **Agent** | backend-architect |

**Story**: As an admin, I want to manage document categories, so that uploaded documents can be properly classified for RAG processing

**Acceptance Criteria**:
- [x] DocumentCategory entity with fields: name, description, rag_config, metadata_schema, is_active, target_gold_layers
- [x] CRUD operations for document categories via GraphQL
- [x] Pre-seeded categories: 20 categories including BACEN, KYC, Compliance, Products, LBPay
- [x] Category-specific RAG configuration (chunking strategy, embedding model, gold distribution)
- [x] Validation rules per category
- [x] Database migration with seed data

**Technical Tasks**:
1. ✅ Create DocumentCategoryEntity with TypeORM
2. ✅ Create DocumentCategoryService with CRUD operations
3. ✅ Create GraphQL resolvers and input types
4. ✅ Add database migration with seed data (20 categories)
5. ✅ Added target_gold_layers field for Gold A/B/C routing

---

#### US-DB-002: Enhanced Document Upload with Category Selection

| Field | Value |
|-------|-------|
| **ID** | US-DB-002 |
| **Priority** | P0 |
| **Points** | 5 |
| **Status** | DONE |
| **Sprint** | 16 |
| **Agent** | frontend-developer |

**Story**: As a user, I want to select a category when uploading documents, so that they are properly classified

**Acceptance Criteria**:
- [x] Category dropdown in document upload form
- [x] Category description tooltip on hover
- [x] Category filtering in document list
- [x] Category column in document list table

**Technical Tasks**:
1. ✅ Add CategorySelect component with category dropdown
2. ✅ Integrated with document upload form
3. ✅ Updated document list with category column
4. ✅ useDocumentCategories hook for data fetching

---

#### US-DB-003: Bronze Layer Processing Service

| Field | Value |
|-------|-------|
| **ID** | US-DB-003 |
| **Priority** | P0 |
| **Points** | 8 |
| **Status** | DONE |
| **Sprint** | 16 |
| **Agent** | ai-engineer |

**Story**: As a system, I want to process uploaded documents into the Bronze layer, so that raw data is captured for the data lake

**Acceptance Criteria**:
- [x] BronzeDocument entity storing raw document metadata
- [x] Text extraction from PDF (including OCR for images/flowcharts)
- [x] Text extraction from Markdown files
- [x] Metadata extraction (title, author, date, version)
- [x] Processing status tracking (PENDING, PROCESSING, COMPLETED, FAILED)
- [x] BullMQ job queue for async processing
- [x] Error handling with retry logic
- [x] Processing metrics logging

**Technical Tasks**:
1. ✅ Created bronze_metadata and bronze_processed_at fields on Document entity
2. ✅ Implemented text extraction service (PDF via pdf-parse, Markdown, DOCX via mammoth)
3. ✅ Created BullMQ processor (bronze-processing.processor.ts) with 3 retry attempts
4. ✅ Added processing status tracking with BronzeProcessingService
5. ✅ Implemented error handling with exponential backoff
6. ✅ Integrated with Document entity and GraphQL mutations

---

#### US-DB-004: Process for RAG Button

| Field | Value |
|-------|-------|
| **ID** | US-DB-004 |
| **Priority** | P1 |
| **Points** | 3 |
| **Status** | DONE |
| **Sprint** | 16 |
| **Agent** | frontend-developer |

**Story**: As a user, I want a "Process for RAG" button on each document, so that I can trigger RAG processing manually

**Acceptance Criteria**:
- [x] "Process for RAG" button in document row actions
- [x] Button disabled if already processing or processed
- [x] Confirmation dialog before processing
- [x] Loading state during processing initiation
- [x] Toast notification on success/failure
- [x] Button state reflects current processing status

**Technical Tasks**:
1. ✅ Created ProcessForRagButton component with action button
2. ✅ Implemented triggerBronzeProcessing GraphQL mutation
3. ✅ Added confirmation dialog with AlertDialog
4. ✅ Implemented loading states with spinner
5. ✅ Added toast notifications via sonner

---

#### US-DB-005: Processing Status Indicator

| Field | Value |
|-------|-------|
| **ID** | US-DB-005 |
| **Priority** | P1 |
| **Points** | 5 |
| **Status** | DONE |
| **Sprint** | 16 |
| **Agent** | frontend-developer |

**Story**: As a user, I want to see the RAG processing status of each document, so that I know which documents are ready for AI queries

**Acceptance Criteria**:
- [x] Status column in document list (Not Processed, Processing, Processed, Failed)
- [x] Status badge with appropriate colors
- [x] Processing progress indicator (spinner for processing state)
- [x] Timestamp of last processing
- [x] Error message tooltip for failed documents
- [x] Real-time status updates via subscription or polling

**Technical Tasks**:
1. ✅ Added status column to DocumentList component
2. ✅ Created ProcessingStatusBadge component with color-coded badges
3. ✅ Implemented real-time status updates via refetch on processing trigger
4. ✅ Added error tooltip via bronzeMetadata.error display
5. ✅ Styled status indicators (green=completed, yellow=processing, gray=pending, red=failed)

---

### ✅ Sprint 17 - Silver & Gold Processing (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 29 |

**Sprint Goal**: Implement Silver layer chunking and Gold layer distribution to vector, graph, and analytics stores

**Sprint Dates**: Dec 04, 2025

**Squad Lead**: `ai-engineer`

**Deliverables**:
| US | Title | Points | Status | Agent |
|----|-------|--------|--------|-------|
| US-DB-006 | Silver Layer Chunking | 8 | DONE | ai-engineer |
| US-DB-007 | Gold A - Trino Analytics | 5 | DONE | data-engineer |
| US-DB-008 | Gold B - NebulaGraph | 8 | DONE | database-architect |
| US-DB-009 | Gold C - Qdrant Vectors | 5 | DONE | ai-engineer |
| US-DB-010 | Gold Distribution Config | 3 | DONE | backend-architect |

**Report**: [SPRINT_17_REPORT.md](sprints/SPRINT_17_REPORT.md)

**Key Features**:
- SilverChunk entity with section hierarchy and extracted entities
- Entity extraction for CPF, CNPJ, dates, money, emails, phones
- Gold A Trino analytics data preparation
- Gold B NebulaGraph knowledge graph with DocumentChunk, Entity, Document tags
- Gold C Qdrant vector embeddings with rich metadata
- Automatic pipeline chaining (Bronze → Silver → Gold)
- GoldDistribution entity for tracking distribution status
- BullMQ processors for silver-processing and gold-distribution queues
- GraphQL operations for monitoring and retrying distributions

---

#### US-DB-006: Silver Layer Chunking Service

| Field | Value |
|-------|-------|
| **ID** | US-DB-006 |
| **Priority** | P0 |
| **Points** | 8 |
| **Status** | DONE |
| **Sprint** | 17 |
| **Agent** | ai-engineer |

**Story**: As a system, I want to chunk documents into semantic units, so that they can be efficiently processed and indexed

**Acceptance Criteria**:
- [x] SilverChunk entity storing processed chunks with metadata
- [x] Token-based chunking with configurable size and overlap
- [x] Section hierarchy detection and preservation
- [x] Entity extraction (CPF, CNPJ, dates, monetary values, emails, phones)
- [x] Processing status tracking (pending, processing, completed, failed)
- [x] BullMQ processor for async chunking

---

#### US-DB-007: Gold A - Trino Analytics Integration

| Field | Value |
|-------|-------|
| **ID** | US-DB-007 |
| **Priority** | P1 |
| **Points** | 5 |
| **Status** | DONE |
| **Sprint** | 17 |
| **Agent** | data-engineer |

**Story**: As a data analyst, I want document chunks stored in Trino, so that I can run SQL analytics queries

**Acceptance Criteria**:
- [x] Gold A distribution service with Trino record preparation
- [x] Status tracking per chunk (pending, processing, completed, failed, skipped)
- [x] Structured data format for analytics queries
- [x] Category-based layer targeting (respects targetGoldLayers)

---

#### US-DB-008: Gold B - NebulaGraph Knowledge Graph

| Field | Value |
|-------|-------|
| **ID** | US-DB-008 |
| **Priority** | P0 |
| **Points** | 8 |
| **Status** | DONE |
| **Sprint** | 17 |
| **Agent** | database-architect |

**Story**: As a knowledge engineer, I want document chunks and entities in NebulaGraph, so that I can explore relationships

**Acceptance Criteria**:
- [x] DocumentChunk tag for graph vertices
- [x] Entity tag for extracted entities
- [x] Document tag for source documents
- [x] CONTAINS_CHUNK edge (Document → DocumentChunk)
- [x] MENTIONS edge (DocumentChunk → Entity)
- [x] EXTRACTED_FROM edge (Entity → DocumentChunk)
- [x] SAME_AS edge for entity deduplication

---

#### US-DB-009: Gold C - Qdrant Vector Embeddings

| Field | Value |
|-------|-------|
| **ID** | US-DB-009 |
| **Priority** | P0 |
| **Points** | 5 |
| **Status** | DONE |
| **Sprint** | 17 |
| **Agent** | ai-engineer |

**Story**: As an AI system, I want document chunks embedded in Qdrant, so that I can perform semantic search

**Acceptance Criteria**:
- [x] Vector embedding generation via EmbeddingsService
- [x] Upsert to Qdrant with rich payload metadata
- [x] Document and chunk context in payload
- [x] Entity types and counts in metadata

---

#### US-DB-010: Gold Distribution Configuration

| Field | Value |
|-------|-------|
| **ID** | US-DB-010 |
| **Priority** | P1 |
| **Points** | 3 |
| **Status** | DONE |
| **Sprint** | 17 |
| **Agent** | backend-architect |

**Story**: As an admin, I want to configure Gold layer distribution per category, so that documents go to the right stores

**Acceptance Criteria**:
- [x] GoldDistribution entity tracking status per layer (A, B, C)
- [x] Category-based targeting (respects targetGoldLayers from DocumentCategory)
- [x] Retry mechanism for failed distributions
- [x] GraphQL operations for monitoring and retrying

---

### ✅ Sprint 18 - Visualization & External Sources (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 28 |

**Sprint Goal**: Implement data lake visualization and external data source connectors

**Sprint Dates**: Dec 04, 2025

**Squad Lead**: `frontend-developer`

**Deliverables**:
| US | Title | Points | Status | Agent |
|----|-------|--------|--------|-------|
| US-DB-011 | Pipeline Visualization UI | 8 | DONE | frontend-developer |
| US-DB-012 | Processing History View | 5 | DONE | frontend-developer |
| US-DB-013 | TigerBeetle Connector | 5 | DONE | backend-architect |
| US-DB-014 | CoreBanking DB Connector | 5 | DONE | database-architect |
| US-DB-015 | External Source Config UI | 5 | DONE | frontend-developer |

**Report**: [SPRINT_18_REPORT.md](sprints/SPRINT_18_REPORT.md)

**Key Features**:
- Pipeline visualization UI (Bronze → Silver → Gold A/B/C stages)
- Processing history view with stats, filtering, and CSV export
- External sources backend (TigerBeetle, PostgreSQL, MySQL, REST API, GraphQL API)
- External sources management UI with connection testing
- Data sync capability for external sources
- 9 new GraphQL operations (3 queries, 6 mutations)

---

### ✅ Sprint 19 - AI Assistant & Validations (COMPLETE)

| Status | Count | Points |
|--------|-------|--------|
| DONE | 5 | 31 |

**Sprint Goal**: Implement RAG-powered AI Assistant and DICT validation engine

**Sprint Dates**: 2025-12-04

**Squad Lead**: `ai-engineer`

**Deliverables**:
| US | Title | Points | Status | Agent |
|----|-------|--------|--------|-------|
| US-DB-016 | AI Assistant Chat Component | 8 | ✅ DONE | frontend-developer |
| US-DB-017 | RAG Context Integration | 5 | ✅ DONE | ai-engineer |
| US-DB-018 | ValidationsRequest Endpoint | 8 | ✅ DONE | prompt-engineer |
| US-DB-019 | DICT Validation Prompts | 5 | ✅ DONE | prompt-engineer |
| US-DB-020 | Validation Response UI | 5 | ✅ DONE | frontend-developer |

**Key Achievements**:
- AI Assistant chat component with markdown rendering
- RAG context integration with Qdrant semantic search
- DICT validation endpoint for PIX key validation
- Support for CPF, CNPJ, EMAIL, PHONE, EVP key types
- Source attribution showing referenced documents
- Apollo Client 4.x migration (60+ TypeScript errors fixed)

---

### ⏳ Sprint 20 - Integration & Polish (PLANNED)

| Status | Count | Points |
|--------|-------|--------|
| TODO | 5 | 26 |

**Sprint Goal**: Integrate all CoreBanking Brain components, generate ObjectTypes, and polish the user experience

**Sprint Dates**: TBD

**Squad Lead**: `backend-architect`

**Deliverables**:
| US | Title | Points | Status | Agent |
|----|-------|--------|--------|-------|
| US-DB-021 | DictRegistroChave ObjectType | 8 | TODO | ai-engineer |
| US-DB-022 | End-to-End Testing | 5 | TODO | test-automator |
| US-DB-023 | Performance Optimization | 5 | TODO | performance-engineer |
| US-DB-024 | Documentation & Training | 5 | TODO | docs-architect |
| US-DB-025 | Production Deployment | 3 | TODO | deployment-engineer |

---

## Epics Overview

| Epic | Name | Stories | Points | Status |
|------|------|---------|--------|--------|
| EP-1 | BACKOFFICE - Meta-Layer Foundation | 16 | ~68 | ✅ 100% |
| EP-2 | BACKOFFICE - Relationship Management | 10 | ~52 | ✅ 100% |
| EP-3 | BACKOFFICE - Document Management | 11 | ~62 | ✅ 100% |
| EP-4 | BACKOFFICE - LLM Integration | 10 | ~57 | ✅ 100% |
| EP-5 | FRONT-OFFICE - Instance Management | 15 | ~78 | ✅ 100% |
| EP-6 | Advanced Features | 15 | ~78 | ✅ 100% (All Sprints Complete) |
| EP-7 | **CoreBanking Brain** | 25 | ~140 | ⏳ 80% (Sprint 19/20 Complete) |

---

## EP-4: BACKOFFICE - LLM Integration (Details)

### Sprint 8: LLM Gateway Service ✅ COMPLETE

| US | Title | Points | Status | Agent |
|----|-------|--------|--------|-------|
| US-037 | Python FastAPI Service Setup | 5 | DONE | ai-engineer |
| US-038 | Ollama Integration | 5 | DONE | ai-engineer |
| US-039 | Model Management | 5 | DONE | ai-engineer |
| US-040 | Prompt Template System | 8 | DONE | ai-engineer |
| US-041 | LLM Gateway API | 5 | DONE | ai-engineer |

### Sprint 9: LLM Validation Engine (READY)

#### US-042: Field Extraction Prompts
| Field | Value |
|-------|-------|
| **ID** | US-042 |
| **Priority** | P0 |
| **Points** | 8 |
| **Status** | TODO |
| **Sprint** | 9 |
| **Agent** | prompt-engineer |

**Story**: As a system, I want to extract field values from free-text input using LLM, so that users can create instances without filling forms

**Acceptance Criteria**:
- [ ] Prompt template for field extraction
- [ ] Support for all field types (STRING, NUMBER, DATE, BOOLEAN, etc.)
- [ ] Confidence score for each extracted field
- [ ] Handle ambiguous values gracefully
- [ ] Return structured JSON response
- [ ] Unit tests for extraction accuracy

---

#### US-043: Business Rules Validation
| Field | Value |
|-------|-------|
| **ID** | US-043 |
| **Priority** | P0 |
| **Points** | 8 |
| **Status** | TODO |
| **Sprint** | 9 |
| **Agent** | prompt-engineer |

**Story**: As a system, I want to validate field values against business rules using LLM, so that data quality is ensured

**Acceptance Criteria**:
- [ ] Validation prompt template with rules injection
- [ ] Support for complex validation rules (regex, ranges, dependencies)
- [ ] Clear validation failure messages
- [ ] Suggestions for fixing invalid values
- [ ] Integration with field-validation template
- [ ] Caching for repeated validations

---

#### US-044: RAG Query Integration
| Field | Value |
|-------|-------|
| **ID** | US-044 |
| **Priority** | P1 |
| **Points** | 5 |
| **Status** | TODO |
| **Sprint** | 9 |
| **Agent** | ai-engineer |

**Story**: As a system, I want to use RAG context in validation prompts, so that validations are informed by document knowledge

**Acceptance Criteria**:
- [ ] Fetch relevant chunks from Qdrant for validation context
- [ ] Inject RAG context into validation prompts
- [ ] Configurable relevance threshold
- [ ] Source attribution in responses
- [ ] Performance optimization for real-time validation

---

#### US-045: Validation Feedback UI
| Field | Value |
|-------|-------|
| **ID** | US-045 |
| **Priority** | P1 |
| **Points** | 5 |
| **Status** | TODO |
| **Sprint** | 9 |
| **Agent** | frontend-developer |

**Story**: As a user, I want to see validation feedback in real-time, so that I can correct errors before submission

**Acceptance Criteria**:
- [ ] Real-time validation as user types
- [ ] Field-level error messages
- [ ] Confidence indicators for extracted values
- [ ] Suggestion chips for fixing errors
- [ ] Loading state during validation
- [ ] Debounced validation requests

---

#### US-046: LLM Monitoring & Logging
| Field | Value |
|-------|-------|
| **ID** | US-046 |
| **Priority** | P2 |
| **Points** | 3 |
| **Status** | TODO |
| **Sprint** | 9 |
| **Agent** | ai-engineer |

**Story**: As an operator, I want to monitor LLM usage and performance, so that I can optimize costs and latency

**Acceptance Criteria**:
- [ ] Log all LLM requests with latency
- [ ] Track token usage per request
- [ ] Dashboard for LLM metrics
- [ ] Alert on high latency or errors
- [ ] Cost estimation per operation

---

## Legend

### Status Icons
- `TODO` - Not started
- `IN_PROGRESS` - Currently being worked on
- `REVIEW` - Code complete, in review
- `DONE` - Complete and verified
- `BLOCKED` - Waiting on dependency

### Priority Levels
- **P0 (Critical)**: Blocks other work, must complete this sprint
- **P1 (High)**: Important for sprint goal
- **P2 (Medium)**: Nice to have, can defer

### Story Points (Fibonacci)
| Points | Complexity | Time |
|--------|------------|------|
| 1 | Trivial | 1-2h |
| 2 | Simple | 2-4h |
| 3 | Medium | 4-8h |
| 5 | Complex | 1-2 days |
| 8 | Very Complex | 2-3 days |
| 13 | Extremely Complex | 3-5 days |

---

## References

- [SPRINT_MASTER_PLAN.md](SPRINT_MASTER_PLAN.md) - Full sprint planning
- [sprints/INDEX.md](sprints/INDEX.md) - Sprint reports index
- [CLAUDE.md](../CLAUDE.md) - Project context and standards
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture

---

**Last Updated**: 2025-12-04
**Next Update**: After Sprint 20 Kickoff
