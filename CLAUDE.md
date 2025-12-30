# 🤖 CLAUDE.md - SuperCore v2.0 Implementation Guide

**Versão**: 1.0.0 - SuperCore Direct Implementation
**Data**: 2025-12-28
**Status**: 🟢 ATIVO - Manual Step-by-Step Implementation

> **Este é o documento de referência central para implementação manual do SuperCore v2.0.**
> **Implementação será feita passo a passo usando Claude Code (este chat).**

---

## 🌟 SuperCore v2.0 - Universal Enterprise Solution Platform

**SuperCore v2.0** é uma **plataforma universal** que permite criar soluções empresariais completas através de IA.

### O Que é SuperCore?

**NÃO É**: Um Core Banking, CRM, ERP ou qualquer solução específica de domínio.

**O QUE É**: Uma máquina universal que permite criar QUALQUER tipo de aplicação através de:

- **Oráculos**: Repositórios multimodais de conhecimento configuráveis por domínio
- **Abstrações dinâmicas**: Object definitions genéricos interpretados em runtime
- **Linguagem natural**: Conversas com IA para especificação e geração
- **Geração automatizada**: IA gera middlewares, agentes, fluxos, UIs sem código manual

### Arquitetura Fundamental

```
SuperCore (Plataforma Universal)
    ↓
Oráculo A (Banking)  |  Oráculo B (CRM)  |  Oráculo C (Healthcare)
    ↓
Solução A (Core Banking)
Solução B (CRM System)
Solução C (Health Management)
```

**Cada Oráculo é uma instância independente com**:
- Conhecimento específico do domínio (documentações, regulações, políticas)
- Object definitions específicas (Conta, Cliente, Transação vs Lead, Contact, Deal)
- Agentes especializados gerados por IA
- Fluxos customizados
- UI dinâmica gerada

---

## 📚 Documentação Base (LEITURA OBRIGATÓRIA)

### Localização
Toda documentação fundamental está em: **`documentation-base/`**

### Documentos Base

#### 1️⃣ [requisitos_funcionais_v2.0.md](documentation-base/requisitos_funcionais_v2.0.md)
**O QUE construir**
- 63 Requisitos Funcionais (RF001-RF063)
- 4 Casos de Uso com ROI quantificado
- Matriz de Rastreabilidade Completa

**Principais Seções**:
- RF001-006: Super Portal + Oráculos
- RF010-019: Biblioteca de Objetos
- RF020-024: Biblioteca de Agentes (CrewAI)
- RF030-034: MCPs - Interface Universal
- RF040-046: AI-Driven Generator (6 fases)
- RF050-053: Dynamic UI Generation
- RF060-063: Abstração Total + Deploy

**Quando consultar**:
- Antes de criar qualquer feature
- Ao definir escopo de implementação
- Para validar conformidade com requisitos

#### 2️⃣ [arquitetura_supercore_v2.0.md](documentation-base/arquitetura_supercore_v2.0.md)
**COMO construir - Arquitetura**
- 6 Camadas: Dados, Oráculo, Objetos, Agentes, MCPs, Interfaces
- 7 ADRs (Decisões Arquiteturais)
- 5 Diagramas Mermaid
- 4 Pilares: Oráculo, Objetos, Agentes, MCPs

**Camadas Principais**:
- **Camada 0 (Dados)**: PostgreSQL, NebulaGraph, pgvector, Redis
- **Camada 1 (Oráculo)**: RAG Trimodal, Knowledge Management
- **Camada 2 (Objetos)**: Object Definitions, Validações, FSM
- **Camada 3 (Agentes)**: CrewAI, LangGraph, Workflows
- **Camada 4 (MCPs)**: MCP Servers, Conectividade
- **Camada 5 (UI)**: Next.js, Dynamic Forms, Portals

**Quando consultar**:
- Antes de propor designs técnicos
- Ao decidir em qual camada implementar
- Ao criar novos ADRs

#### 3️⃣ [stack_supercore_v2.0.md](documentation-base/stack_supercore_v2.0.md)
**COM O QUE construir - Tecnologias**
- 50+ Tecnologias catalogadas
- Stack: Go, Python, TypeScript, PostgreSQL, Redis, NebulaGraph
- LangFlow e CrewAI detalhados
- 50+ Exemplos de código

**Stack Principal**:
- **Backend**: Go (Gin), Python (FastAPI)
- **Workflows**: Temporal Workflow v1.23+ (substitui Celery)
- **Frontend**: Next.js 14+, React 18+, TypeScript, Tailwind CSS, shadcn/ui
- **Data**: PostgreSQL 16+, Redis 7+, NebulaGraph 3.8+
- **AI**: LangChain, CrewAI, LangFlow, LangGraph
- **MCP**: Model Context Protocol implementation

**Quando consultar**:
- Antes de escolher bibliotecas/frameworks
- Ao escrever código (padrões)
- Ao fazer setup de ambiente

#### 4️⃣ [RAG_PIPELINE_ARCHITECTURE.md](documentation-base/RAG_PIPELINE_ARCHITECTURE.md)
**RAG Pipeline - Orquestração**
- Pipeline RAG completo (5 etapas)
- Orquestração LangFlow + LangGraph
- RAG Trimodal (SQL + Graph + Vector)
- Performance e escalabilidade

**Pipeline RAG**:
1. Ingestão Multimodal (30+ formatos)
2. Processamento e Chunking
3. Embedding (vetorização)
4. Storage Trimodal (PostgreSQL + NebulaGraph + Qdrant)
5. Retrieval (consulta)

**Quando consultar**:
- Ao implementar RF002-005 (RAG)
- Para entender orquestração LangFlow
- Para otimizar performance RAG

---

## 📂 Estrutura de Diretórios

```
supercore/
├── CLAUDE.md                                    ← VOCÊ ESTÁ AQUI
│
├── documentation-base/                          ← DOCUMENTAÇÃO BASE (READ-ONLY)
│   ├── requisitos_funcionais_v2.0.md
│   ├── arquitetura_supercore_v2.0.md
│   ├── stack_supercore_v2.0.md
│   └── RAG_PIPELINE_ARCHITECTURE.md
│
├── backend/                                     ← BACKEND (A SER CRIADO)
│   ├── go/                                      ← Go (Gin) - Middleware
│   │   ├── cmd/
│   │   │   └── server/
│   │   │       └── main.go
│   │   ├── internal/
│   │   │   ├── oracle/                          ← Gerenciamento de Oráculos
│   │   │   ├── objects/                         ← Object Definitions
│   │   │   ├── agents/                          ← Agentes (interface Go)
│   │   │   ├── mcp/                             ← MCP Server
│   │   │   └── api/                             ← APIs REST
│   │   ├── pkg/
│   │   ├── go.mod
│   │   └── go.sum
│   │
│   └── python/                                  ← Python (FastAPI) - AI Services
│       ├── src/
│       │   ├── rag/                             ← RAG Pipeline
│       │   ├── agents/                          ← CrewAI Agents
│       │   ├── workflows/                       ← LangGraph Workflows
│       │   ├── mcp/                             ← MCP Tools
│       │   └── api/                             ← FastAPI endpoints
│       ├── requirements.txt
│       └── pyproject.toml
│
├── frontend/                                    ← FRONTEND (A SER CRIADO)
│   ├── backoffice/                              ← Portal SuperCore (Next.js)
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── oracles/                     ← Gerenciamento de Oráculos
│   │   │   │   ├── objects/                     ← Object Definitions
│   │   │   │   ├── agents/                      ← Agentes
│   │   │   │   ├── workflows/                   ← Workflows LangFlow
│   │   │   │   └── deploy/                      ← Deploy Management
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/                              ← shadcn/ui components
│   │   │   ├── forms/                           ← Dynamic forms
│   │   │   └── workflow/                        ← React Flow diagrams
│   │   ├── lib/
│   │   ├── package.json
│   │   └── next.config.js
│   │
│   └── frontoffice/                             ← Portal Dinâmico (Next.js)
│       ├── app/
│       ├── components/
│       ├── package.json
│       └── next.config.js
│
├── database/                                    ← DATABASE MIGRATIONS
│   ├── postgresql/
│   │   ├── migrations/
│   │   │   ├── 001_create_oracles.sql
│   │   │   ├── 002_create_object_definitions.sql
│   │   │   ├── 003_create_validation_rules.sql
│   │   │   ├── 004_create_ai_agents.sql
│   │   │   └── 005_create_workflows.sql
│   │   └── seeds/
│   │
│   ├── nebulagraph/
│   │   └── schemas/
│   │       └── supercore_graph_schema.ngsql
│   │
│   └── qdrant/
│       └── collections/
│           └── setup_collections.py
│
├── infrastructure/                              ← INFRASTRUCTURE (Terraform/K8s)
│   ├── terraform/
│   │   ├── modules/
│   │   │   ├── postgresql/
│   │   │   ├── redis/
│   │   │   ├── nebulagraph/
│   │   │   └── qdrant/
│   │   └── environments/
│   │       ├── dev/
│   │       ├── staging/
│   │       └── prod/
│   │
│   └── kubernetes/
│       ├── backend-go/
│       ├── backend-python/
│       ├── frontend-backoffice/
│       └── frontend-frontoffice/
│
├── docs/                                        ← DOCUMENTAÇÃO ADICIONAL
│   ├── api/                                     ← OpenAPI specs
│   ├── architecture/                            ← ADRs, diagramas
│   └── guides/                                  ← Guias de implementação
│
├── tests/                                       ← TESTES
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/                                     ← SCRIPTS UTILITÁRIOS
│   ├── setup-dev.sh
│   ├── migrate-db.sh
│   └── deploy.sh
│
├── .github/                                     ← CI/CD
│   └── workflows/
│       ├── backend-go.yml
│       ├── backend-python.yml
│       └── frontend.yml
│
├── docker-compose.yml                           ← Dev environment
├── Makefile                                     ← Comandos úteis
└── README.md                                    ← Overview do projeto
```

---

## 🎯 Fases de Implementação

### Fase 1: Fundação (RF001-RF017)
**Período**: Q1 2025
**Foco**: Oráculo + Objetos + RAG

**Requisitos**:
- RF001: Super Portal + Gerenciamento de Oráculos
- RF002-005: RAG Trimodal (Ingestão, Processamento, Knowledge Graph, Consulta)
- RF006: Identidade e Configuração do Oráculo
- RF010-012: Gerenciamento de Object Definitions
- RF013-015: Validações, FSM, Relacionamentos
- RF016-017: Integrações Externas, Componentes UI

**Stack Principal**: PostgreSQL, FastAPI, Go (Gin), Next.js, Redis, NebulaGraph, Qdrant

**Deliverables**:
- ✅ Super Portal funcionando (backoffice)
- ✅ CRUD de Oráculos
- ✅ Pipeline RAG completo (30+ formatos)
- ✅ Object Definitions dinâmicos
- ✅ Validações centralizadas
- ✅ UI dinâmica básica

---

### Fase 2: IA-Driven + Multi-Agente (RF018-024, RF011, RF021)
**Período**: Q2 2025
**Foco**: Agentes + Workflows + Auto-geração

**Requisitos**:
- RF011: Geração Automática de Object Definitions via IA
- RF018-019: Workflows LangFlow + Geração Automática
- RF020-024: Agentes CrewAI (Gerenciamento, Auto-geração, Orquestração, Execução)

**Stack Adicional**: CrewAI, LangFlow, LangGraph, Apache Pulsar

**Deliverables**:
- ✅ CrewAI agents funcionando
- ✅ Workflows LangFlow visuais
- ✅ Auto-geração de Objects via IA
- ✅ Auto-geração de Agents via IA
- ✅ Auto-geração de Workflows via IA
- ✅ Orquestração multi-agente

---

### Fase 3: Escalabilidade (RF030-034, RF040-046)
**Período**: Q3 2025
**Foco**: MCPs + AI-Driven Generator completo

**Requisitos**:
- RF030-034: MCP Server completo (Recursos, Ferramentas, Prompts, Async)
- RF040-046: AI-Driven Generator (6 fases: Setup, Upload, Spec, Modelo, Preview, Play)

**Stack Adicional**: MCP Protocol, OpenTelemetry

**Deliverables**:
- ✅ MCP Server nativo por Oráculo
- ✅ Conectividade entre Oráculos via MCP
- ✅ 6 fases do AI-Driven Generator
- ✅ "Play" gerando solução completa
- ✅ Versionamento de modelos

---

### Fase 4: Produção HA (RF050-053, RF060-063)
**Período**: Q4 2025
**Foco**: Dynamic UI + Deploy Management + Production-Grade

**Requisitos**:
- RF050-053: Dynamic UI Generation (3 pilares)
- RF060-062: Abstração Total, Zero Código Manual, Production-Grade
- RF063: Deploy Management (Kubernetes 1-click)

**Stack Adicional**: Kubernetes, ArgoCD, cert-manager, Trivy

**Deliverables**:
- ✅ UI 100% dinâmica (Forms, ProcessFlow, Validations)
- ✅ Deploy 1-click para Kubernetes
- ✅ Rollback automático
- ✅ Multi-cluster support
- ✅ Production-ready (99.9% uptime)

---

## 🚫 Zero-Tolerance Policy

**TODOS os requisitos** devem seguir rigorosamente:

### ❌ PROIBIDO (Auto-reject):
1. **Mock implementations** em código de produção
2. **TODO/FIXME/HACK** comments não resolvidos
3. **Hardcoded credentials** ou configurações sensíveis
4. **Missing error handling** (sem tratamento de erros)
5. **Cobertura de testes <80%**
6. **Vulnerabilidades HIGH/CRITICAL** em scans de segurança
7. **Código fora da stack** definida em `stack_supercore_v2.0.md`
8. **Placeholder data** ou dados fake em produção

### ✅ OBRIGATÓRIO:
1. **Real database integration** (não mocks)
2. **Comprehensive error handling** (try/catch, error boundaries)
3. **Production-grade security** (encryption, auth, HTTPS)
4. **Complete testing** (unit + integration + E2E ≥80%)
5. **Full documentation** (código comentado + README + API docs)
6. **Observability** (logs estruturados, métricas, traces)
7. **Conformidade com stack** definida

---

## 📊 Métricas de Qualidade

### Código:
- **Cobertura de Testes**: ≥80% (target: 90%)
- **Code Review**: 100% dos PRs revisados

### Segurança:
- **Vulnerabilidades HIGH/CRITICAL**: 0
- **Secrets Expostos**: 0
- **Security Scans**: Trivy, TruffleHog (obrigatórios)

### Performance:
- **API Response Time (p95)**: <500ms
- **Frontend Load Time**: <2s
- **Database Queries**: <100ms (p95)
- **RAG Query**: <2s end-to-end

### Disponibilidade:
- **Fase 1-2**: 99% (29min downtime/mês)
- **Fase 3-4**: 99.9% (43sec downtime/mês)

---

## 🔄 Workflow de Implementação Manual

### 1. Setup Inicial
```bash
# Clonar e estruturar projeto
mkdir -p backend/{go,python}
mkdir -p frontend/{backoffice,frontoffice}
mkdir -p database/{postgresql,nebulagraph,qdrant}
mkdir -p infrastructure/{terraform,kubernetes}
mkdir -p docs/{api,architecture,guides}
mkdir -p tests/{unit,integration,e2e}
mkdir -p scripts
```

### 2. Database Setup
```bash
# PostgreSQL (Docker)
docker run -d \
  --name supercore-postgres \
  -e POSTGRES_USER=supercore \
  -e POSTGRES_PASSWORD=supercore_dev \
  -e POSTGRES_DB=supercore \
  -p 5432:5432 \
  postgres:15

# Redis
docker run -d \
  --name supercore-redis \
  -p 6379:6379 \
  redis:7-alpine

# NebulaGraph
docker-compose -f infrastructure/nebulagraph/docker-compose.yml up -d

# Qdrant
docker run -d \
  --name supercore-qdrant \
  -p 6333:6333 \
  qdrant/qdrant:latest
```

### 3. Backend Setup (Go)
```bash
cd backend/go
go mod init github.com/lbpay/supercore
go get -u github.com/gin-gonic/gin
go get -u gorm.io/gorm
go get -u gorm.io/driver/postgres
# ... outras dependências
```

### 4. Backend Setup (Python)
```bash
cd backend/python
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy langchain crewai
# ... outras dependências
```

### 5. Frontend Setup (Next.js)
```bash
cd frontend/backoffice
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge
# ... shadcn/ui components
```

### 6. Executar Migrations
```bash
cd database/postgresql/migrations
for f in *.sql; do
  psql -U supercore -d supercore -f "$f"
done
```

### 7. Desenvolvimento
```bash
# Terminal 1: Backend Go
cd backend/go && go run cmd/server/main.go

# Terminal 2: Backend Python
cd backend/python && uvicorn src.api.main:app --reload

# Terminal 3: Frontend
cd frontend/backoffice && npm run dev
```

---

## 🔗 Links Rápidos

### Documentação Base:
- [Requisitos Funcionais](documentation-base/requisitos_funcionais_v2.0.md)
- [Arquitetura](documentation-base/arquitetura_supercore_v2.0.md)
- [Stack Tecnológica](documentation-base/stack_supercore_v2.0.md)
- [RAG Pipeline](documentation-base/RAG_PIPELINE_ARCHITECTURE.md)

### Tecnologias Principais:
- [PostgreSQL 15](https://www.postgresql.org/docs/15/)
- [Go 1.21+](https://go.dev/doc/)
- [Python 3.11+](https://docs.python.org/3.11/)
- [Next.js 14](https://nextjs.org/docs)
- [LangChain](https://python.langchain.com/docs/get_started/introduction)
- [CrewAI](https://docs.crewai.com/)
- [NebulaGraph](https://docs.nebula-graph.io/)

---

## 📞 Próximos Passos

### Implementação Imediata (Fase 1 - Sprint 1)

**Objetivo**: Criar fundação do SuperCore com Super Portal + CRUD de Oráculos

**Tarefas**:
1. ✅ Limpar documentação (CONCLUÍDO)
2. ✅ Criar CLAUDE.md focado em SuperCore (CONCLUÍDO)
3. ✅ Setup inicial do projeto (estrutura de diretórios) (CONCLUÍDO)
4. ⏳ Database migrations (PostgreSQL schemas)
5. ⏳ Backend Go: API básica de Oráculos
6. ⏳ Backend Python: RAG pipeline básico
7. ⏳ Frontend: Super Portal (Next.js + shadcn/ui)

**Entregáveis Sprint 1**:
- Projeto estruturado
- Databases rodando (PostgreSQL, Redis, NebulaGraph, Qdrant)
- API REST para Oráculos (Go)
- Portal SuperCore (Next.js) com CRUD de Oráculos
- RAG pipeline básico (Python)

---

## 🔄 Histórico de Mudanças

### 2025-12-29 - v1.1.0 (Temporal Workflow Integration)
- 🚀 **Temporal Workflow**: Substitui Celery para orquestração de workflows
  - **stack_supercore_v2.0.md**: Adicionada seção completa Temporal Workflow v1.23+ (500+ linhas)
    - Arquitetura Temporal Server (Frontend, History, Matching, Worker Services)
    - Comparação Temporal vs Celery (8 vantagens)
    - 3 workflows de exemplo (CreateSolution, ProcessDocument, AgentExecution)
    - Multi-tenancy via task queues (solution-{id}, global-crud, global-ai)
    - Worker deployment polyglot (Go + Python)
    - Docker Compose + Kubernetes production setup
    - Performance metrics (10k+ workflows/sec, <100ms p95)
  - **ANALISE_REQUISITOS_FASE_1.md**: Atualizados workflows com Temporal
    - RF001-F (CreateSolution): SAGA pattern com compensação automática
    - RF003 (ProcessDocument): Long-running workflow (30 min timeout, heartbeats)
    - Go Workflow + Activities implementation completas
    - Python Workflow + Activities para RAG pipeline
  - **USER_FLOWS.md**: Atualizados fluxos com Temporal
    - Flow 0: Backend com Temporal Workflow (SAGA pattern)
    - Flow 2: Processamento de documentos com durable execution
    - Cascade delete com Temporal Workflow
  - **CLAUDE.md**: Stack atualizada
    - Workflows: Temporal Workflow v1.23+ (substitui Celery)
- ✅ **Benefícios**:
  - Durable execution (sobrevive crashes via event sourcing)
  - SAGA pattern built-in (rollback automático)
  - Long-running tasks (horas/dias sem bloquear workers)
  - Observabilidade superior (Temporal UI, workflow replay)
  - Human-in-the-loop (signals, queries)
  - Multi-tenancy (isolamento por task queue)
  - Polyglot (Go + Python SDKs)

### 2025-12-28 - v1.0.1 (Setup Completo da Estrutura)
- ✅ **Estrutura Criada**: Todos os diretórios do projeto criados
  - `backend/go/` - Go backend structure (cmd/server, internal, pkg)
  - `backend/python/` - Python backend structure (src with rag, agents, workflows, mcp, api)
  - `frontend/backoffice/` - Next.js backoffice structure (app, components, lib)
  - `frontend/frontoffice/` - Next.js frontoffice structure
  - `database/` - PostgreSQL, NebulaGraph, Qdrant schemas
  - `infrastructure/` - Terraform modules & Kubernetes manifests
  - `docs/`, `tests/`, `scripts/`, `.github/workflows/`
- ✅ **README Files**: Criados READMEs detalhados para cada módulo
  - `backend/README.md` - Go + Python backend documentation
  - `frontend/README.md` - Next.js frontoffice + backoffice
  - `database/README.md` - RAG Trimodal architecture
  - `infrastructure/README.md` - Terraform + Kubernetes
  - `README.md` - Root project documentation
- ✅ **Sprint 1 Task 3**: Concluído - Projeto totalmente estruturado
- ✅ **Próximo Passo**: Task 4 - Database migrations (PostgreSQL schemas)

### 2025-12-28 - v1.0.0 (Criação - SuperCore Direct Implementation)
- 🚀 **Decisão**: Abandonar SquadOS meta-framework, implementar SuperCore diretamente
- ✅ **Limpeza**: Removidos todos documentos SquadOS de `documentation-base/`
- ✅ **Documentação**: Mantidos apenas 4 docs core (requisitos, arquitetura, stack, RAG)
- ✅ **CLAUDE.md**: Recriado com foco exclusivo em SuperCore v2.0
- ✅ **Approach**: Manual step-by-step implementation usando Claude Code
- ✅ **Estrutura**: Definida estrutura de diretórios completa
- ✅ **Fases**: 4 fases de implementação (Q1-Q4 2025)
- ✅ **Zero-Tolerance**: Políticas de qualidade definidas
- ✅ **Workflow**: Setup inicial e desenvolvimento documentados

---

**Este documento é a fonte única da verdade para implementação do SuperCore v2.0.**
**Implementação será manual, passo a passo, usando Claude Code (este chat).**

---

**Versão**: 1.1.0 - SuperCore + Temporal Workflow
**Última Atualização**: 2025-12-29
**Próximo Passo**: Database migrations (PostgreSQL schemas para Oráculos)
