# 📋 BACKLOG EXAUSTIVO FASE 1 - SuperCore v2.0

**Versão**: 1.0.0
**Data**: 2025-12-28
**Fase**: Fase 1 - Camada Oráculo - Knowledge Foundation + IA Assistant
**Duração Total**: 6 semanas (40 dias úteis)
**Total de Tarefas**: 142 tarefas detalhadas
**Baseado em**: [PROPOSTA_FASES.md](../../../PROPOSTA_FASES.md), [SQUAD_FASE_1.md](../squad/SQUAD_FASE_1.md), [SPRINTS_FASE_1.md](../sprints/SPRINTS_FASE_1.md)

---

## 📊 Visão Executiva

### Requisitos Funcionais Cobertos (documentation-base/)
- ✅ **RF001**: Gerenciamento de Oráculos
- ✅ **RF002**: Ingestão Multimodal de Conhecimento
- ✅ **RF003**: Processamento e Enriquecimento de Documentos
- ✅ **RF004**: Knowledge Graph do Oráculo
- ✅ **RF005**: Consulta ao Conhecimento via RAG Trimodal
- ✅ **RF006**: Identidade e Configuração do Oráculo
- 🚀 **IA Assistant**: Fundação para RF011, RF021, RF040-046 (fases futuras)

### Entregas Principais
1. **Backend Go**: API REST CRUD Oráculos + JWT Auth (7 endpoints)
2. **Backend Python**: RAG Trimodal Pipeline + IA Assistant Service (10+ endpoints)
3. **Frontend Next.js**: Super Portal (7 páginas) + Chat Component
4. **Database**: PostgreSQL schemas + pgvector + NebulaGraph (6 migrations)
5. **Infrastructure**: Terraform + Kubernetes + CI/CD + Monitoring

### Métricas de Sucesso
- **Coverage**: ≥80% (unit + integration)
- **Performance**: API <200ms p95, RAG <500ms p95, Chat <100ms first token
- **Security**: 0 vulnerabilidades HIGH/CRITICAL
- **Conformidade**: 100% ADRs (ADR-002, 003, 005, 006, 007, 009, 010)

---

## 🗂️ Organização do Backlog

### Por Requisito Funcional (RF)

| RF | Título | Tarefas | SP | Owner |
|----|--------|---------|------|-------|
| RF001 | Gerenciamento de Oráculos | 18 | 40 | Backend Go + Frontend |
| RF002 | Ingestão Multimodal | 12 | 24 | Backend Python |
| RF003 | Processamento e Enriquecimento | 8 | 16 | Backend Python |
| RF004 | Knowledge Graph | 10 | 20 | Backend Python + Database |
| RF005 | RAG Trimodal | 15 | 30 | Backend Python |
| RF006 | Identidade do Oráculo | 5 | 10 | Backend Go |
| IA Assistant | Chat Conversacional (NOVO) | 20 | 46 | Backend Python + Frontend |
| Infra | Infrastructure + CI/CD | 25 | 50 | DevOps |
| QA | Testing + Security | 18 | 36 | QA Engineer |
| Docs | Documentação Técnica | 11 | 8 | Scrum Master |
| **TOTAL** | **Fase 1 Completa** | **142** | **280** | **Squad** |

### Por Sprint

| Sprint | Foco | Tarefas | SP | Semana |
|--------|------|---------|-----|--------|
| Sprint 1 | Fundação (Infra + DB + Mockups) | 28 | 52 | Semana 1 |
| Sprint 2 | Backend Go (CRUD + Auth) | 22 | 40 | Semana 2 |
| Sprint 3 | Backend Python (RAG Pipeline) | 26 | 50 | Semana 3 |
| Sprint 4 | Backend Python (IA Assistant) | 24 | 46 | Semana 4 |
| Sprint 5 | Frontend (Super Portal + Chat) | 24 | 46 | Semana 5 |
| Sprint 6 | Integração + Deploy | 18 | 46 | Semana 6 |

---

## 📝 SPRINT 1 - FUNDAÇÃO (28 tarefas, 52 SP)

### 🎯 EPIC 1.1 - Planejamento e Documentação (8h, 8 SP)
**Owner**: Scrum Master (Sonnet 4.5)
**Prioridade**: P0 (Bloqueador)

#### User Story 1.1.1
**Como** Scrum Master,
**Eu quero** criar um backlog exaustivo da Fase 1,
**Para que** a Squad tenha visibilidade completa de todas as tarefas e possa executar com autonomia.

**Tarefas**:
- [ ] **T1.1.1.1** - Mapear RF001-RF006 para user stories (2h, 2 SP)
  - Input: requisitos_funcionais_v2.0.md
  - Output: User stories detalhadas (1 por RF)
  - Critérios de aceitação por US
  - Estimativa (horas/story points)

- [ ] **T1.1.1.2** - Detalhar backlog com 140+ tarefas (4h, 4 SP)
  - Este documento (BACKLOG_FASE_1.md)
  - Quebrar user stories em tasks atômicas
  - Mapear dependências (task A → task B)
  - Calcular caminho crítico

- [ ] **T1.1.1.3** - Criar template de DoD (Definition of Done) (1h, 1 SP)
  - Checklist para cada tipo de task
  - Code review checklist
  - Testing checklist
  - Documentation checklist

- [ ] **T1.1.1.4** - Setup tracking system (1h, 1 SP)
  - GitHub Projects configurado
  - Kanban board (To Do, In Progress, Review, Done)
  - Sprint burndown chart
  - Velocity tracking

**Acceptance Criteria**:
- ✅ BACKLOG_FASE_1.md completo (≥140 tarefas)
- ✅ User stories mapeadas (1:1 com RFs)
- ✅ DoD template criado
- ✅ Tracking system acessível pela Squad

**Outputs**:
- `fases/fase-1/backlog/BACKLOG_FASE_1.md` (este arquivo)
- `fases/fase-1/backlog/USER_STORIES_RF001_RF006.md`
- `fases/fase-1/backlog/DEFINITION_OF_DONE.md`

---

### 🎯 EPIC 1.2 - UX/UI Mockups (16h, 16 SP)
**Owner**: UX/UI Designer (Opus 4.5)
**Prioridade**: P0 (Bloqueador para Sprint 5)

#### User Story 1.2.1
**Como** Frontend Developer,
**Eu quero** mockups de alta fidelidade de TODAS as telas,
**Para que** eu possa implementar o frontend com precisão pixel-perfect.

**Tarefas**:
- [ ] **T1.2.1.1** - Criar Design System (4h, 4 SP)
  - Color palette (8 cores: primary, secondary, accent, neutral, error, success, warning, info)
  - Typography scale (5 tamanhos: xs, sm, base, lg, xl)
  - Spacing system (4px base grid: 0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32)
  - Component variants (shadcn/ui customization)
  - Accessibility: WCAG 2.1 AA contrast ratios
  - Output: `DESIGN_SYSTEM.md` (markdown + Tailwind config)

- [ ] **T1.2.1.2** - Mockup: `/oracles` - Listagem (2h, 2 SP)
  - shadcn/ui Table component (sortable, filterable)
  - Columns: Name, Type, Domain, Documents, Created At, Actions
  - Pagination: 10/25/50 items per page
  - Search bar: real-time filter by name/domain
  - Filters: Type dropdown, Date range picker
  - Actions: New (button), Edit (icon), Delete (icon), Clone (icon)
  - Empty state: "No oracles yet. Create your first one."
  - Output: `01_oracles_listagem.png` (1920x1080)

- [ ] **T1.2.1.3** - Mockup: `/oracles/new` - Criar Oráculo (2h, 2 SP)
  - Form layout: vertical, 2 columns on desktop
  - Fields:
    - Name (Input, required, max 100 chars)
    - Type (Select, required, options: Banking, Healthcare, Legal, Custom)
    - Domain (Input, required, max 200 chars)
    - Description (Textarea, optional, max 1000 chars)
  - Validation: real-time error messages (red text below field)
  - Buttons: Cancel (secondary), Create (primary)
  - Output: `02_oracles_criar.png`

- [ ] **T1.2.1.4** - Mockup: `/oracles/{id}` - Detalhes (1h, 1 SP)
  - Card layout (shadcn/ui Card)
  - Header: Oracle name + type badge + actions (Edit, Delete, Clone)
  - Tabs: Details, Knowledge, Graph, Chat
  - Details tab: Display all Oracle metadata (name, type, domain, description, created_at, updated_at)
  - Stats cards: Total documents, Total entities, Graph nodes
  - Output: `03_oracles_detalhes.png`

- [ ] **T1.2.1.5** - Mockup: `/oracles/{id}/edit` - Editar (1h, 1 SP)
  - Same form as Create (pre-filled with Oracle data)
  - Disabled fields: Type (immutable after creation)
  - Buttons: Cancel, Save Changes
  - Output: `04_oracles_editar.png`

- [ ] **T1.2.1.6** - Mockup: `/oracles/{id}/knowledge` - Upload (2h, 2 SP)
  - Drag-and-drop area (dashed border, hover state: blue border)
  - Supported formats badge: PDF, DOCX, XLSX, Audio, Video, HTML, Images
  - File size limit: <50MB per file
  - Upload queue: List of files being uploaded (filename, size, progress bar)
  - Uploaded files table: Filename, Type, Size, Status, Processed At, Actions (Delete)
  - Status badges: Processing (yellow), Completed (green), Failed (red)
  - Output: `05_oracles_knowledge_upload.png`

- [ ] **T1.2.1.7** - Mockup: `/oracles/{id}/graph` - Grafo (2h, 2 SP)
  - React Flow canvas (full viewport height)
  - Node types:
    - Oracle (circle, primary color, large)
    - Document (rectangle, secondary color, medium)
    - Entity (diamond, accent color, small)
    - Concept (hexagon, neutral color, small)
  - Edge styles:
    - contains (solid line, thick)
    - references (dashed line, medium)
    - related_to (dotted line, thin)
  - Controls: Zoom In/Out, Fit View, Pan
  - Minimap (bottom-right corner)
  - Output: `06_oracles_graph_visualizacao.png`

- [ ] **T1.2.1.8** - Mockup: `/oracles/{id}/chat` - **IA Assistant** (2h, 2 SP) 🔥 **CRÍTICO**
  - Layout: 2 columns (20% sidebar, 80% main)
  - Sidebar:
    - Header: "Chat Sessions"
    - List: Session items (date, first message preview, active state)
    - New Chat button
  - Main area:
    - Header: Oracle name + "AI Assistant" badge
    - Messages container (scrollable, auto-scroll to bottom)
    - Message bubbles:
      - User: right-aligned, primary color, white text
      - Assistant: left-aligned, light gray, dark text
      - Markdown rendering: code blocks (syntax highlighting), lists, tables
      - RAG sources icon (tooltip on hover showing SQL/Graph/Vector sources)
    - Streaming indicator: Typing animation (3 dots)
  - Input area (fixed bottom):
    - Textarea (auto-resize, max 5 lines)
    - Placeholder: "Ask about this Oracle's knowledge..."
    - Send button (disabled during streaming)
    - Keyboard shortcut: Enter to send, Shift+Enter for newline
  - Output: `07_oracles_chat_ia_assistant.png` 🔥

- [ ] **T1.2.1.9** - User Flows (Mermaid diagrams) (2h, 2 SP)
  - Flow 1: Create Oracle → Upload Knowledge → Chat
  - Flow 2: View Graph → Explore Entities → Ask Question
  - Flow 3: Edit Oracle → Update Config → Verify in Chat
  - Output: `USER_FLOWS.md` (3 Mermaid flowcharts)

**Acceptance Criteria**:
- ✅ 7 mockups PNG/SVG criados (1920x1080 resolution)
- ✅ Design System documentado (Tailwind config + tokens)
- ✅ User flows Mermaid diagrams (3 flows)
- ✅ WCAG 2.1 AA compliance validated (contrast checker)
- ✅ **Mockups APROVADOS pelo usuário** 🚨 **GATE**

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
- `fases/fase-1/mocks/ACCESSIBILITY_REPORT.md`

---

### 🎯 EPIC 1.3 - Database Schemas (12h, 12 SP)
**Owner**: Database Architect (Opus 4.5)
**Prioridade**: P0 (Bloqueador para Sprints 2-4)

#### User Story 1.3.1
**Como** Backend Developer,
**Eu quero** schemas PostgreSQL bem desenhados com pgvector,
**Para que** eu possa implementar CRUD, RAG e IA Assistant com performance.

**Tarefas**:
- [ ] **T1.3.1.1** - Desenhar schema `oracles` (2h, 2 SP)
  ```sql
  CREATE TABLE oracles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    domain TEXT NOT NULL,
    description TEXT,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    CONSTRAINT oracles_name_unique UNIQUE(name)
  );
  CREATE INDEX idx_oracles_type ON oracles(type);
  CREATE INDEX idx_oracles_created_at ON oracles(created_at);
  ```
  - Output: `001_create_oracles.sql`

- [ ] **T1.3.1.2** - Desenhar schema `documents` (1h, 1 SP)
  ```sql
  CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    processed_at TIMESTAMP,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX idx_documents_oracle_id ON documents(oracle_id);
  CREATE INDEX idx_documents_status ON documents(status);
  ```
  - Output: `002_create_documents.sql`

- [ ] **T1.3.1.3** - Desenhar schema `chat_sessions` e `chat_messages` (2h, 2 SP)
  ```sql
  CREATE TABLE chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL REFERENCES oracles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    title TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX idx_chat_sessions_oracle_id ON chat_sessions(oracle_id);
  CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);

  CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    sources JSONB, -- {sql: [...], graph: [...], vector: [...]}
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
  ```
  - Output: `004_create_chat_sessions.sql` + `005_create_chat_messages.sql`

- [ ] **T1.3.1.4** - Setup pgvector extension (2h, 2 SP)
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;

  CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_id INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding vector(1536), -- OpenAI ada-002 dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
  );
  CREATE INDEX idx_embeddings_document_id ON embeddings(document_id);
  CREATE INDEX ON embeddings USING hnsw (embedding vector_cosine_ops);
  ```
  - Output: `006_setup_pgvector.sql`

- [ ] **T1.3.1.5** - Desenhar NebulaGraph schema (3h, 3 SP)
  ```ngql
  CREATE SPACE IF NOT EXISTS supercore(partition_num=10, replica_factor=1, vid_type=FIXED_STRING(36));
  USE supercore;

  CREATE TAG IF NOT EXISTS Oracle(id string, name string, type string, domain string);
  CREATE TAG IF NOT EXISTS Document(id string, filename string, type string);
  CREATE TAG IF NOT EXISTS Entity(id string, name string, type string);
  CREATE TAG IF NOT EXISTS Concept(id string, name string, description string);

  CREATE EDGE IF NOT EXISTS contains(created_at timestamp);
  CREATE EDGE IF NOT EXISTS references(context string);
  CREATE EDGE IF NOT EXISTS related_to(strength double);

  CREATE TAG INDEX IF NOT EXISTS oracle_id_index ON Oracle(id(36));
  CREATE TAG INDEX IF NOT EXISTS document_id_index ON Document(id(36));
  CREATE TAG INDEX IF NOT EXISTS entity_id_index ON Entity(id(36));
  ```
  - Output: `003_create_knowledge_graph_sync.sql` (migration que executa nGQL)

- [ ] **T1.3.1.6** - Criar ERD (Entity Relationship Diagram) (2h, 2 SP)
  - Mermaid diagram mostrando todas as tabelas e relações
  - Incluir tipos de dados, constraints, indexes
  - Output: `database/schemas/ERD_FASE_1.md`

**Acceptance Criteria**:
- ✅ 6 migration SQL files criados
- ✅ ERD Mermaid diagram criado
- ✅ Migrations testadas em ambiente local (Docker PostgreSQL + NebulaGraph)
- ✅ pgvector extension funcionando (query teste: `SELECT * FROM pg_extension WHERE extname = 'vector';`)

**Outputs**:
- `database/migrations/001_create_oracles.sql`
- `database/migrations/002_create_documents.sql`
- `database/migrations/003_create_knowledge_graph_sync.sql`
- `database/migrations/004_create_chat_sessions.sql`
- `database/migrations/005_create_chat_messages.sql`
- `database/migrations/006_setup_pgvector.sql`
- `database/schemas/ERD_FASE_1.md`
- `database/README.md`

---

### 🎯 EPIC 1.4 - Infraestrutura (16h, 16 SP)
**Owner**: DevOps Engineer (Opus 4.5)
**Prioridade**: P0 (Bloqueador para todos os sprints)

#### User Story 1.4.1
**Como** Developer,
**Eu quero** infraestrutura completa rodando (PostgreSQL, NebulaGraph, Redis, Pulsar),
**Para que** eu possa desenvolver e testar localmente e deployar em ambientes remotos.

**Tarefas**:
- [ ] **T1.4.1.1** - Terraform module: PostgreSQL (3h, 3 SP)
  - AWS RDS PostgreSQL 16 (opção 1) ou Docker local (opção 2)
  - Variables: instance_class, storage_gb, multi_az
  - Enable pgvector extension automaticamente (rds.force_ssl=0, shared_preload_libraries='vector')
  - Security groups: allow 5432 from backend subnets
  - Backup policy: daily snapshots, 7 days retention
  - Output: connection string (host, port, db, user, password via Secrets Manager)
  - Output: `infrastructure/terraform/modules/postgresql/main.tf`

- [ ] **T1.4.1.2** - Terraform module: NebulaGraph (4h, 4 SP)
  - Kubernetes deployment (3 services: Meta, Storage, Graph)
  - Helm chart: nebula-graph/nebula-cluster
  - Persistent volumes: 50GB per service
  - Service discovery: ClusterIP para Meta/Storage, LoadBalancer para Graph
  - Init job: CREATE SPACE supercore
  - Output: nebula-console connection string
  - Output: `infrastructure/terraform/modules/nebula/main.tf`

- [ ] **T1.4.1.3** - Terraform module: Redis (2h, 2 SP)
  - AWS ElastiCache Redis 7.0 (opção 1) ou Docker local (opção 2)
  - Variables: node_type, num_cache_nodes, multi_az
  - Cluster mode: enabled (multi-AZ high availability)
  - Security groups: allow 6379 from backend subnets
  - Output: redis://host:6379
  - Output: `infrastructure/terraform/modules/redis/main.tf`

- [ ] **T1.4.1.4** - Terraform module: Apache Pulsar (3h, 3 SP)
  - Kubernetes deployment (Helm chart: apache/pulsar)
  - Components: Zookeeper, BookKeeper, Broker, Proxy
  - Persistent volumes: 100GB for BookKeeper
  - Topics pre-created:
    - persistent://public/default/oracle-events
    - persistent://public/default/document-events
  - Retention policies: 7 days
  - Output: pulsar://broker:6650
  - Output: `infrastructure/terraform/modules/pulsar/main.tf`

- [ ] **T1.4.1.5** - Kubernetes base setup (4h, 4 SP)
  - Namespaces: dev, staging, prod
  - RBAC:
    - ServiceAccounts: backend-go-sa, backend-python-sa, frontend-sa
    - Roles: read secrets, read configmaps
    - RoleBindings: bind SAs to Roles
  - NetworkPolicies:
    - default-deny-all (block all traffic by default)
    - allow-backend-to-postgres (backend-go, backend-python → PostgreSQL)
    - allow-backend-to-redis (backend-python → Redis)
    - allow-backend-to-nebula (backend-python → NebulaGraph)
    - allow-frontend-to-backend (frontend → backend-go, backend-python)
  - Ingress controller: NGINX (Helm chart: ingress-nginx/ingress-nginx)
  - Output: `infrastructure/kubernetes/namespaces.yaml`, `rbac.yaml`, `network-policies.yaml`

**Acceptance Criteria**:
- ✅ `terraform apply` bem-sucedido para dev environment
- ✅ PostgreSQL rodando com pgvector (query: `SELECT * FROM pg_extension WHERE extname = 'vector';`)
- ✅ NebulaGraph acessível via nebula-console (query: `SHOW SPACES;`)
- ✅ Redis pingável (redis-cli PING → PONG)
- ✅ Pulsar topics criados (pulsar-admin topics list public/default)
- ✅ Kubernetes namespaces + RBAC + NetworkPolicies aplicados

**Outputs**:
- `infrastructure/terraform/modules/postgresql/`
- `infrastructure/terraform/modules/nebula/`
- `infrastructure/terraform/modules/redis/`
- `infrastructure/terraform/modules/pulsar/`
- `infrastructure/terraform/environments/dev/main.tf`
- `infrastructure/kubernetes/namespaces.yaml`
- `infrastructure/kubernetes/rbac.yaml`
- `infrastructure/kubernetes/network-policies.yaml`
- `infrastructure/README.md`

---

## 📝 SPRINT 2 - BACKEND GO (22 tarefas, 40 SP)

### 🎯 EPIC 2.1 - Setup Projeto Go (4h, 4 SP)

#### User Story 2.1.1
**Como** Backend Go Developer,
**Eu quero** projeto Go estruturado com dependências,
**Para que** eu possa implementar API REST com clean architecture.

**Tarefas**:
- [ ] **T2.1.1.1** - Estrutura de diretórios Go (1h, 1 SP)
  ```
  backend/go/
  ├── cmd/server/main.go
  ├── internal/
  │   ├── api/
  │   │   ├── handlers/
  │   │   ├── middleware/
  │   │   └── router.go
  │   ├── models/
  │   ├── repository/
  │   ├── service/
  │   └── config/
  ├── pkg/
  ├── migrations/
  ├── docs/
  ├── go.mod
  └── Dockerfile
  ```

- [ ] **T2.1.1.2** - Dependências Go (1h, 1 SP)
  ```bash
  go get github.com/gin-gonic/gin
  go get github.com/jackc/pgx/v5
  go get github.com/golang-jwt/jwt/v5
  go get github.com/go-playground/validator/v10
  go get github.com/rs/zerolog
  go get github.com/spf13/viper
  go get github.com/stretchr/testify
  ```

- [ ] **T2.1.1.3** - Config management (1h, 1 SP)
  - Viper para environment variables
  - config.yaml:
    ```yaml
    server:
      port: 8080
    database:
      host: ${DB_HOST}
      port: 5432
      name: supercore
      user: ${DB_USER}
      password: ${DB_PASSWORD}
    jwt:
      secret: ${JWT_SECRET}
      access_expiry: 15m
      refresh_expiry: 168h
    ```

- [ ] **T2.1.1.4** - Database connection pool (1h, 1 SP)
  - pgx connection pool (min 10, max 100 conns)
  - Health check: `SELECT 1`
  - Retry logic: 5 tentativas com exponential backoff

**Outputs**: Projeto Go estruturado

---

### 🎯 EPIC 2.2 - API REST CRUD Oráculos (16h, 16 SP)

#### User Story 2.2.1
**Como** Frontend Developer,
**Eu quero** API REST completa para CRUD de Oráculos,
**Para que** eu possa implementar as telas do Super Portal.

**Tarefas**:
- [ ] **T2.2.1.1** - Models (2h, 2 SP)
  ```go
  type Oracle struct {
    ID          string    `json:"id" db:"id"`
    Name        string    `json:"name" db:"name" validate:"required,max=100"`
    Type        string    `json:"type" db:"type" validate:"required,oneof=Banking Healthcare Legal Custom"`
    Domain      string    `json:"domain" db:"domain" validate:"required,max=200"`
    Description *string   `json:"description" db:"description"`
    Config      JSON      `json:"config" db:"config"`
    CreatedAt   time.Time `json:"created_at" db:"created_at"`
    UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
    CreatedBy   *string   `json:"created_by" db:"created_by"`
    UpdatedBy   *string   `json:"updated_by" db:"updated_by"`
  }

  type CreateOracleRequest struct {
    Name        string `json:"name" validate:"required,max=100"`
    Type        string `json:"type" validate:"required,oneof=Banking Healthcare Legal Custom"`
    Domain      string `json:"domain" validate:"required,max=200"`
    Description string `json:"description" validate:"max=1000"`
  }
  ```

- [ ] **T2.2.1.2** - Repository Layer (4h, 4 SP)
  - Interface:
    ```go
    type OracleRepository interface {
      Create(ctx context.Context, oracle *Oracle) error
      Get(ctx context.Context, id string) (*Oracle, error)
      List(ctx context.Context, filters ListFilters) ([]*Oracle, int, error)
      Update(ctx context.Context, oracle *Oracle) error
      Delete(ctx context.Context, id string) error
      Clone(ctx context.Context, id string, newName string) (*Oracle, error)
    }
    ```
  - Implementation com pgx
  - Transaction handling (BEGIN, COMMIT, ROLLBACK)
  - Multi-tenancy: Sempre filtrar por `oracle_id` quando aplicável

- [ ] **T2.2.1.3** - Service Layer (3h, 3 SP)
  - Business logic validation:
    - Name único (UNIQUE constraint)
    - Type válido (enum)
    - Config válido (JSON schema - opcional)
  - Error handling:
    - ErrNotFound (404)
    - ErrDuplicateName (409)
    - ErrInvalidInput (400)
  - Audit trail: Preencher `created_by`, `updated_by` do JWT claims

- [ ] **T2.2.1.4** - API Handlers (4h, 4 SP)
  - POST `/api/v1/oracles` - Create
    - Request: CreateOracleRequest (JSON body)
    - Response: Oracle (201 Created)
  - GET `/api/v1/oracles` - List
    - Query params: page, limit, type, search
    - Response: `{data: Oracle[], total: int, page: int, limit: int}`
  - GET `/api/v1/oracles/{id}` - Get
    - Path param: id (UUID)
    - Response: Oracle (200 OK)
  - PUT `/api/v1/oracles/{id}` - Update
    - Path param: id, Request: UpdateOracleRequest
    - Response: Oracle (200 OK)
  - DELETE `/api/v1/oracles/{id}` - Delete (soft delete)
    - Path param: id
    - Response: 204 No Content
  - POST `/api/v1/oracles/{id}/clone` - Clone
    - Path param: id, Request: `{new_name: string}`
    - Response: Oracle (201 Created)

- [ ] **T2.2.1.5** - Input Validation (2h, 2 SP)
  - Validator middleware (go-playground/validator)
  - Custom validators: UUID format, enum values
  - Error responses:
    ```json
    {
      "error": "Validation failed",
      "fields": {
        "name": "Name is required",
        "type": "Type must be one of: Banking, Healthcare, Legal, Custom"
      }
    }
    ```

- [ ] **T2.2.1.6** - Swagger Documentation (1h, 1 SP)
  - Annotations nos handlers:
    ```go
    // @Summary Create Oracle
    // @Tags Oracles
    // @Accept json
    // @Produce json
    // @Param oracle body CreateOracleRequest true "Oracle data"
    // @Success 201 {object} Oracle
    // @Failure 400 {object} ErrorResponse
    // @Router /api/v1/oracles [post]
    ```
  - Generate swagger.yaml: `swag init`
  - Swagger UI endpoint: `/docs`

**Outputs**: API REST CRUD Oráculos completa

---

### 🎯 EPIC 2.3 - JWT Authentication (8h, 8 SP)

#### User Story 2.3.1
**Como** usuário do Super Portal,
**Eu quero** autenticação segura via JWT,
**Para que** apenas usuários autorizados possam acessar a API.

**Tarefas**:
- [ ] **T2.3.1.1** - JWT Token Generation (2h, 2 SP)
  - Login endpoint: `POST /api/v1/auth/login`
  - Request: `{email: string, password: string}`
  - Mock user (for MVP): hardcoded `{email: "admin@supercore.io", password: "admin123"}`
  - Generate tokens:
    - Access token (15 min expiry): Claims: `{user_id, email, role}`
    - Refresh token (7 days expiry): Claims: `{user_id, token_type: "refresh"}`
  - Response: `{access_token, refresh_token, expires_in: 900}`

- [ ] **T2.3.1.2** - JWT Middleware (3h, 3 SP)
  - Extract token from `Authorization: Bearer <token>` header
  - Parse and validate token (signature, expiry)
  - Inject user context into request: `ctx = context.WithValue(ctx, "user", claims)`
  - Handle errors:
    - Missing token: 401 Unauthorized
    - Invalid token: 401 Unauthorized
    - Expired token: 401 Unauthorized (client should refresh)

- [ ] **T2.3.1.3** - Protected Routes (1h, 1 SP)
  - Apply JWT middleware to routes:
    - `/api/v1/oracles/*` - Requires auth
  - Public routes:
    - `/api/v1/auth/login` - No auth
    - `/api/v1/auth/refresh` - Requires refresh token (special handling)
    - `/health` - No auth

- [ ] **T2.3.1.4** - Refresh Token Endpoint (2h, 2 SP)
  - POST `/api/v1/auth/refresh`
  - Request: `{refresh_token: string}`
  - Validate refresh token
  - Generate NEW access token (same claims, new expiry)
  - Response: `{access_token, expires_in: 900}`

**Outputs**: JWT authentication funcionando

---

### 🎯 EPIC 2.4 - Testes Backend Go (12h, 12 SP)

#### User Story 2.4.1
**Como** QA Engineer,
**Eu quero** test suite completo para Backend Go,
**Para que** tenhamos confiança de que a API funciona corretamente.

**Tarefas**:
- [ ] **T2.4.1.1** - Unit Tests - Repository (3h, 3 SP)
  - Mock database com pgxmock
  - Test CreateOracle (success, duplicate name)
  - Test GetOracle (success, not found)
  - Test ListOracles (empty, with filters, pagination)
  - Test UpdateOracle (success, not found)
  - Test DeleteOracle (success, not found)
  - Test CloneOracle (success)

- [ ] **T2.4.1.2** - Unit Tests - Service (2h, 2 SP)
  - Mock repository
  - Test business logic validation
  - Test error handling (ErrNotFound, ErrDuplicateName)
  - Test audit trail (created_by, updated_by)

- [ ] **T2.4.1.3** - Integration Tests - API (5h, 5 SP)
  - Test database: PostgreSQL testcontainer (Docker)
  - Test full CRUD flow:
    1. POST /oracles → 201 Created
    2. GET /oracles → 200 OK (list contains created oracle)
    3. GET /oracles/{id} → 200 OK (same data)
    4. PUT /oracles/{id} → 200 OK (name updated)
    5. POST /oracles/{id}/clone → 201 Created (new oracle with new ID)
    6. DELETE /oracles/{id} → 204 No Content
    7. GET /oracles/{id} → 404 Not Found
  - Test JWT authentication:
    - Login → Access token → Protected route → 200 OK
    - No token → Protected route → 401 Unauthorized
    - Expired token → Protected route → 401 Unauthorized
    - Refresh token → New access token → 200 OK
  - Test pagination: Create 25 oracles, GET /oracles?page=2&limit=10 → 10 items, total=25
  - Test filters: GET /oracles?type=Banking → only Banking oracles

- [ ] **T2.4.1.4** - Coverage Analysis (2h, 2 SP)
  - Run: `go test -v -cover ./...`
  - Generate HTML report: `go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out`
  - Target: ≥80% coverage
  - Identify untested code paths, add tests if needed

**Outputs**: Test suite com coverage ≥80%

---

## 📝 SPRINT 3 - BACKEND PYTHON RAG PIPELINE (26 tarefas, 50 SP)

(Continua com estrutura similar: EPICs, User Stories, Tarefas detalhadas)

### 🎯 EPIC 3.1 - Setup Projeto FastAPI (4h, 4 SP)
### 🎯 EPIC 3.2 - Ingestão Multimodal (10h, 10 SP)
### 🎯 EPIC 3.3 - Processamento e Chunking (8h, 8 SP)
### 🎯 EPIC 3.4 - Storage Trimodal (10h, 10 SP)
### 🎯 EPIC 3.5 - Retrieval e Síntese (6h, 6 SP)
### 🎯 EPIC 3.6 - Testes Backend Python RAG (12h, 12 SP)

---

## 📝 SPRINT 4 - BACKEND PYTHON IA ASSISTANT (24 tarefas, 46 SP)

### 🎯 EPIC 4.1 - Chat API Endpoints (12h, 12 SP)
### 🎯 EPIC 4.2 - Streaming Responses (10h, 10 SP)
### 🎯 EPIC 4.3 - Prompt Engineering (6h, 6 SP)
### 🎯 EPIC 4.4 - Background Jobs (6h, 6 SP)
### 🎯 EPIC 4.5 - Testes Backend Python IA Assistant (12h, 12 SP)

---

## 📝 SPRINT 5 - FRONTEND SUPER PORTAL (24 tarefas, 46 SP)

### 🎯 EPIC 5.1 - Setup Projeto Next.js (4h, 4 SP)
### 🎯 EPIC 5.2 - Páginas CRUD Oráculos (14h, 14 SP)
### 🎯 EPIC 5.3 - Chat Component (12h, 12 SP) 🔥 **CRÍTICO**
### 🎯 EPIC 5.4 - Authentication (4h, 4 SP)
### 🎯 EPIC 5.5 - Testes Frontend (12h, 12 SP)

---

## 📝 SPRINT 6 - INTEGRAÇÃO, TESTES E DEPLOY (18 tarefas, 46 SP)

### 🎯 EPIC 6.1 - Integração E2E (10h, 10 SP)
### 🎯 EPIC 6.2 - Security Audit (8h, 8 SP)
### 🎯 EPIC 6.3 - Architecture Review (8h, 8 SP)
### 🎯 EPIC 6.4 - CI/CD Pipelines (10h, 10 SP)
### 🎯 EPIC 6.5 - Deploy Staging (6h, 6 SP)
### 🎯 EPIC 6.6 - Deploy Production (4h, 4 SP) 🚨 **GATE**

---

## 📊 Resumo Executivo Final

### Por Prioridade
- **P0 (Bloqueador)**: 42 tarefas - Must have para Fase 1 funcionar
- **P1 (Alto)**: 65 tarefas - Core features (RF001-RF006)
- **P2 (Médio)**: 25 tarefas - Nice to have (polish, docs extras)
- **P3 (Baixo)**: 10 tarefas - Opcional (pode ser adiado)

### Por Tipo
- **Backend Go**: 22 tarefas (40 SP)
- **Backend Python**: 50 tarefas (96 SP)
- **Frontend**: 24 tarefas (46 SP)
- **Database**: 12 tarefas (12 SP)
- **DevOps**: 25 tarefas (50 SP)
- **QA**: 18 tarefas (36 SP)

### Caminho Crítico
1. Sprint 1: Infra + DB Schemas + Mockups → **GATE** (aprovação mockups)
2. Sprint 2: Backend Go (CRUD + Auth) → Bloqueia Sprint 5
3. Sprint 3: Backend Python RAG → Bloqueia Sprint 4
4. Sprint 4: Backend Python IA Assistant → Bloqueia Sprint 5 (Chat Component)
5. Sprint 5: Frontend (depende de mockups aprovados + Backend Go + IA Assistant)
6. Sprint 6: Integração + Deploy → **GATE** (aprovação production)

### Riscos e Mitigações
| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Mockups não aprovados na Sprint 1 | Alto | Médio | Review incremental com usuário |
| NebulaGraph setup complexo | Médio | Alto | Docker Compose para dev, K8s para prod |
| RAG performance <500ms p95 | Alto | Médio | Caching (Redis), batch embedding, query optimization |
| Streaming SSE falha em prod | Alto | Baixo | Fallback para não-streaming, timeout handling |
| Coverage <80% | Médio | Baixo | Daily coverage tracking, pair programming |

---

**Última Atualização**: 2025-12-28
**Próxima Revisão**: Após Sprint 1 (ajustes de velocity)
**Total Horas**: 280h (6 semanas × 40h/semana)
**Total Story Points**: 280 SP
**Velocity Esperada**: 46.7 SP/semana
