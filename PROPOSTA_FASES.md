# 📋 PROPOSTA DE FASES - SuperCore v2.0

**Versão**: 1.1.0
**Data**: 2025-12-28
**Baseado em**: `documentation-base/` (requisitos_funcionais_v2.0.md, arquitetura_supercore_v2.0.md, stack_supercore_v2.0.md)

---

## 🆕 Atualizações v1.1.0

### ✅ Fase 1 - IA Assistant Conversacional Adicionado
- **Cada Oráculo terá um IA Assistant conversacional** integrado ao RAG Trimodal
- Interface de chat no Super Portal (`/oracles/{id}/chat`)
- Responde perguntas sobre conhecimento do Oráculo (RAG conversational)
- Exibe fontes (SQL, Graph, Vector) com tooltips
- Histórico de conversas persistido (PostgreSQL)
- **Fundação** para geração automática (RF011, RF021, RF040-046) nas fases seguintes
- **Agentic RAG** conceituado: IA Assistant que ANALISA e SINTETIZA (não apenas busca)

### ✅ Fase 5 - Foco em Ferramentas Abstratas (NÃO Soluções)
- **IMPORTANTE**: Fase 5 agora cria **ENGINES abstratas**, não soluções de negócio
- **FormGenerator Engine**: Aceita qualquer JSON Schema → gera formulário React
- **ProcessFlowVisualization Engine**: Aceita qualquer workflow JSON → gera visualizador React Flow
- **ValidationEngine**: Plugin system (não validadores hardcoded como CPF/CNPJ)
- **Screen Type Conductor**: Widget registry extensível (MaskedInput configurável, não CPFInput hardcoded)
- **Zero lógica de negócio hardcoded** (agnóstico total)
- Soluções concretas (Banking, CRM, Healthcare) são geradas pela **Fase 4** usando essas engines

### 📊 Conceitos Clarificados
- **RAG 3D** = **RAG Trimodal** (3 modalidades: SQL + Graph + Vector)
- **Agentic RAG** = RAG usado por agentes autônomos que AGEM (não apenas buscam)
- **IA Assistant** (Fase 1) = Chat conversacional com RAG (fundação)
- **Agents** (Fase 3) = CrewAI multi-agent system (Agentic RAG em ação)

---

## 🎯 Estratégia de Implementação

### Modelo de Agentes

**Scrum Master (Sonnet 4.5)**:
- Gestão de backlog, sprints, planning
- User stories, critérios de aceitação
- Documentação técnica (ADRs, RFCs, runbooks)
- Validação requisitos vs entregas
- Relatórios de progresso

**Code Orchestrator (Opus 4.5)**:
- Implementação de TODA infraestrutura e código
- Backend: Go (Gin), Python (FastAPI)
- Frontend: TypeScript/React (Next.js 14)
- Databases: PostgreSQL (pgvector), NebulaGraph, Redis
- Infrastructure: Terraform, Kubernetes, Docker
- Testes: unit, integration, e2e

---

## 📊 Stack Tecnológica (Conforme documentation-base)

### Backend
- **Go 1.21+**: Gin framework (CRUD, middleware, performance-critical)
- **Python 3.11+**: FastAPI (AI services, RAG, agents)

### Frontend
- **Next.js 14+**: App Router
- **React 18+**: TypeScript
- **Tailwind CSS**: Styling
- **shadcn/ui**: Component library

### Databases
- **PostgreSQL 16+**: Dados estruturados + **pgvector 0.5.1+** (embeddings até 2000 dim)
- **NebulaGraph 3.7+**: Knowledge graph
- **Redis 7+**: Cache e pub/sub

### AI/ML
- **LangChain**: LLM orchestration
- **CrewAI**: Multi-agent framework
- **LangFlow**: Visual pipeline designer
- **LangGraph**: Workflow execution

### Message Broker
- **Apache Pulsar**: Streaming, pub/sub, multi-tenancy (ADR-002)

### Infrastructure
- **Kubernetes 1.28+**: Container orchestration
- **Terraform 1.6+**: Infrastructure as Code
- **Docker**: Containerization

---

## 🚀 FASES DE IMPLEMENTAÇÃO

---

### **FASE 0: Fundação & Infraestrutura**
**Duração**: 2-3 semanas
**Agente Principal**: Opus 4.5

#### Objetivo
Criar base técnica sólida, ambientes e setup de desenvolvimento

#### Entregas
- ✅ **PostgreSQL 16+** com pgvector 0.5.1+ instalado
- ✅ **NebulaGraph 3.7+** (Meta, Storage, Graph services)
- ✅ **Redis 7+** (cache layer)
- ✅ **Apache Pulsar** (message broker - ADR-002)
- ✅ **Terraform modules**: PostgreSQL, Redis, NebulaGraph, Pulsar
- ✅ **Kubernetes base**: Namespaces, RBAC, NetworkPolicies
- ✅ **CI/CD pipelines**: GitHub Actions (build, test, deploy)
- ✅ **Ambientes**: dev, staging, prod
- ✅ **Monitoring**: Prometheus, Grafana, Jaeger (OpenTelemetry)
- ✅ **Logging**: ELK Stack ou Loki

#### Requisitos Funcionais Cobertos
Nenhum (infraestrutura base)

#### ADRs Implementados
- ADR-002: Apache Pulsar sobre RabbitMQ/Kafka
- ADR-003: PostgreSQL + NebulaGraph Híbrido (setup)
- ADR-006: Go para Backend Core (setup)
- ADR-007: Multi-Tenancy via oracle_id (database design)

#### Validação
- PostgreSQL com pgvector rodando (query: `SELECT * FROM pg_extension WHERE extname = 'vector';`)
- NebulaGraph acessível via nebula-console
- Redis pingável
- Pulsar topics criados
- Terraform apply bem-sucedido
- Pipeline CI/CD executando testes

#### Scrum Master (Sonnet 4.5)
- Criar backlog da Fase 0
- Documentar ADRs de infraestrutura
- Setup scripts documentados
- Runbooks de troubleshooting

---

### **FASE 1: Camada Oráculo - Knowledge Foundation + IA Assistant**
**Duração**: 3-4 semanas
**Agente Principal**: Opus 4.5

#### Objetivo
Implementar sistema de Oráculos com RAG Trimodal completo, Super Portal e **IA Assistant conversacional** por Oráculo

#### Entregas

**Backend Go (Gin)**:
- ✅ API REST CRUD de Oráculos (RF001)
  - `POST /api/v1/oracles` - Criar Oráculo
  - `GET /api/v1/oracles` - Listar Oráculos
  - `GET /api/v1/oracles/{id}` - Obter Oráculo
  - `PUT /api/v1/oracles/{id}` - Atualizar Oráculo
  - `DELETE /api/v1/oracles/{id}` - Deletar Oráculo
  - `POST /api/v1/oracles/{id}/clone` - Clonar Oráculo
- ✅ Schemas PostgreSQL:
  - `oracles` table (id, name, type, domain, config, created_at, etc)
  - `chat_sessions` table (id, oracle_id, user_id, created_at)
  - `chat_messages` table (id, session_id, role, content, sources, created_at)
  - Multi-tenancy via `oracle_id` (ADR-007)
- ✅ Autenticação JWT
- ✅ Auditoria (created_by, updated_by, timestamps)
- ✅ Testes: unit + integration (≥80% coverage)

**Backend Python (FastAPI)**:
- ✅ **RAG Trimodal Pipeline** (RF002-RF005):
  - **Ingestão Multimodal** (RF002): 30+ formatos
    - PDFs (OCR com pytesseract)
    - DOCX/XLSX (python-docx, openpyxl)
    - Áudio/Vídeo (Whisper transcrição)
    - HTML (BeautifulSoup scraping)
    - Imagens (OCR)
  - **Processamento** (RF003):
    - Chunking semântico (LangChain RecursiveCharacterTextSplitter)
    - Embedding generation (OpenAI ada-002 ou multilingual models)
    - NLP entity extraction (spaCy)
  - **Storage Trimodal**:
    - PostgreSQL: metadata + structured data
    - **pgvector**: embeddings (RF005 - vector search)
    - NebulaGraph: knowledge graph (RF004)
  - **Retrieval** (RF005):
    - SQL queries (PostgreSQL)
    - Graph traversal (NebulaGraph nGQL)
    - Semantic search (pgvector cosine similarity)
    - LLM synthesis (combina 3 modalidades)
- ✅ **IA Assistant Service** (NOVO - Fundação para RF011, RF021, RF040-046) 🔥:
  - **Interface conversacional** com RAG Trimodal
  - Endpoints:
    - `POST /api/v1/oracles/{id}/chat` - Enviar mensagem ao assistente
    - `GET /api/v1/oracles/{id}/chat/sessions` - Listar sessões de chat
    - `GET /api/v1/oracles/{id}/chat/sessions/{sessionId}` - Histórico de conversa
  - Funcionalidades Fase 1:
    - ✅ Responder perguntas sobre conhecimento do Oráculo (RAG conversational)
    - ✅ Fornecer contexto relevante com fontes (SQL + Graph + Vector sources)
    - ✅ Histórico de conversas persistido
    - ✅ Streaming de respostas (SSE - Server-Sent Events)
  - Funcionalidades Futuras (Fase 2+):
    - ❌ Geração de Object Definitions (RF011 - Fase 2)
    - ❌ Geração de Agents (RF021 - Fase 3)
    - ❌ Geração de soluções completas (RF040-046 - Fase 4)
  - LLM: GPT-4 Turbo ou Claude Opus 4.5
  - Prompt engineering: System prompt com contexto do Oráculo
- ✅ API endpoints RAG:
  - `POST /api/v1/oracles/{id}/documents` - Upload documento
  - `GET /api/v1/oracles/{id}/knowledge` - Query RAG (búsqueda direta sem chat)
- ✅ Background jobs (Celery + Redis)
- ✅ Testes: unit + integration (≥80% coverage)

**Frontend (Next.js 14 App Router)**:
- ✅ **Super Portal** (ADR-009):
  - `/oracles` - Listagem de Oráculos (tabela, busca, filtros)
  - `/oracles/new` - Criar novo Oráculo
  - `/oracles/{id}` - Detalhes do Oráculo
  - `/oracles/{id}/edit` - Editar Oráculo
  - `/oracles/{id}/knowledge` - Upload de documentos
  - `/oracles/{id}/graph` - Visualização do grafo (React Flow - ADR-010)
  - **`/oracles/{id}/chat`** - **Chat com IA Assistant** (NOVO) 🔥
- ✅ **Chat Component** (shadcn/ui):
  - Interface conversacional (mensagens user/assistant)
  - Histórico de sessões (sidebar)
  - Fontes RAG exibidas (tooltips com SQL/Graph/Vector sources)
  - Streaming de respostas (real-time typing effect)
  - Markdown rendering (code blocks, lists, tables)
- ✅ shadcn/ui components (Button, Form, Table, Dialog, Chat, etc)
- ✅ Tailwind CSS
- ✅ Autenticação (NextAuth.js)
- ✅ Testes: Jest + React Testing Library (≥80%)

**Database Migrations**:
- ✅ `001_create_oracles.sql`
- ✅ `002_create_documents.sql`
- ✅ `003_create_knowledge_graph_sync.sql`
- ✅ `004_create_chat_sessions.sql` (NOVO)
- ✅ `005_create_chat_messages.sql` (NOVO)
- ✅ pgvector extension setup

#### Requisitos Funcionais Cobertos
- RF001: Gerenciamento de Oráculos
- RF002: Ingestão Multimodal de Conhecimento
- RF003: Processamento e Enriquecimento de Documentos
- RF004: Knowledge Graph do Oráculo
- RF005: Consulta ao Conhecimento via RAG Trimodal
- RF006: Identidade e Configuração do Oráculo
- **IA Assistant** (fundação para RF011, RF021, RF040-046 nas fases seguintes)

#### ADRs Implementados
- ADR-003: PostgreSQL + NebulaGraph Híbrido (RAG Trimodal com pgvector)
- ADR-005: Next.js 14 App Router
- ADR-006: Go para Backend Core
- ADR-007: Multi-Tenancy via oracle_id
- ADR-009: Super Portal de Backoffice
- ADR-010: Oráculos como Grafo Interconectado
- ADR-011: Frontend-Backend Communication Pattern

#### Validação
- Criar Oráculo "Banking Demo" via Portal
- Upload de PDF regulatório (ex: Resolução BACEN 4.966)
- Processar documento (chunking + embedding + graph)
- **Chat com IA Assistant** (NOVO):
  - User: "Quais são os requisitos de compliance para abertura de conta?"
  - Assistant: Resposta combinando PostgreSQL + NebulaGraph + pgvector
  - Exibir fontes (documento, página, seção)
  - User: "E para pessoa jurídica?"
  - Assistant: Continua conversa com contexto (RAG conversational)
- Visualizar grafo de conhecimento no Portal
- **Agentic RAG** (conceito validado):
  - RAG Trimodal fornece contexto
  - IA Assistant analisa e sintetiza (não apenas busca)
  - Fundação para agentes autônomos (Fase 3)

#### Scrum Master (Sonnet 4.5)
- User stories para RF001-RF006 + IA Assistant
- Critérios de aceitação detalhados
- Documentação de APIs (OpenAPI/Swagger)
- Guia de uso do Portal + Chat
- Prompt engineering guide (system prompts para IA Assistant)

---

### **FASE 2: Camada Objetos - Dynamic Abstractions**
**Duração**: 4-5 semanas
**Agente Principal**: Opus 4.5

#### Objetivo
Biblioteca de Object Definitions dinâmicos com geração automática via IA

#### Entregas

**Backend Go (Gin)**:
- ✅ CRUD de Object Definitions (RF010)
  - `POST /api/v1/oracles/{id}/objects` - Criar Object Definition
  - `GET /api/v1/oracles/{id}/objects` - Listar Objects
  - `GET /api/v1/oracles/{id}/objects/{objId}` - Obter Object
  - `PUT /api/v1/oracles/{id}/objects/{objId}` - Atualizar Object
  - `DELETE /api/v1/oracles/{id}/objects/{objId}` - Deletar Object
- ✅ CRUD de Instâncias (RF012)
  - `POST /api/v1/oracles/{id}/objects/{objId}/instances` - Criar instância
  - `GET /api/v1/oracles/{id}/objects/{objId}/instances` - Listar instâncias
  - Validação runtime baseada em JSON Schema (RF013)
- ✅ Relacionamentos (RF015)
  - `POST /api/v1/oracles/{id}/relationships` - Criar relacionamento
  - Sync com NebulaGraph (graph edges)
- ✅ Schemas PostgreSQL:
  - `object_definitions` table (id, oracle_id, name, schema_json, validations, etc)
  - `object_instances` table (id, oracle_id, object_id, data_jsonb, state, etc)
  - `object_relationships` table
- ✅ Validação Engine (RF013)
  - JSON Schema validation (go-playground/validator)
  - Custom validators (regex, business rules)
- ✅ FSM Engine (RF014)
  - State machine per object type
  - Transitions, guards, actions
- ✅ Testes: unit + integration (≥80%)

**Backend Python (FastAPI)**:
- ✅ **IA Generator de Object Definitions** (RF011) 🔥
  - Endpoint: `POST /api/v1/oracles/{id}/objects/generate`
  - Input: conversa em linguagem natural (ex: "Preciso de um objeto Conta Corrente com saldo, titular, agência")
  - Output: Object Definition completo (JSON Schema + validations + FSM)
  - LLM: GPT-4 ou Claude Opus
  - Prompt engineering: usa RAG do Oráculo para contexto
- ✅ **IA Generator de Workflows** (RF019) 🔥
  - Endpoint: `POST /api/v1/oracles/{id}/workflows/generate`
  - LangFlow integration (visual pipeline)
  - LangGraph state machine
- ✅ Integrações Externas (RF016)
  - MCP Tools registry
  - API connectors (HTTP, GraphQL, SOAP)
- ✅ Testes: unit + integration (≥80%)

**Frontend (Next.js 14)**:
- ✅ Portal de Object Definitions:
  - `/oracles/{id}/objects` - Listagem
  - `/oracles/{id}/objects/new` - Criar (manual ou via IA)
  - `/oracles/{id}/objects/{objId}` - Detalhes + Schema visualizer
  - `/oracles/{id}/objects/{objId}/instances` - Instâncias (CRUD)
- ✅ **Chat IA para geração** (RF011):
  - Interface conversacional (shadcn/ui Chat)
  - Preview do Object Definition gerado
  - Refinamento iterativo
- ✅ Components UI reutilizáveis (RF017):
  - Dynamic Form Generator (baseado em JSON Schema)
  - Table Generator
  - FSM Visualizer (React Flow)
- ✅ Workflows Designer (RF018):
  - LangFlow visual editor integrado
  - Process Flow Visualization (RF051)
- ✅ Testes: Jest + Playwright (≥80%)

#### Requisitos Funcionais Cobertos
- RF010: Gerenciamento de Object Definitions
- RF011: Geração Automática de Object Definitions via IA 🔥
- RF012: Criação Dinâmica de Instâncias
- RF013: Biblioteca Central de Validações
- RF014: Máquina de Estados (FSM) por Objeto
- RF015: Relacionamentos Semânticos Entre Objetos
- RF016: Integrações Externas Configuráveis
- RF017: Componentes de UI Reutilizáveis
- RF018: Workflows/Processos de Negócio por Oráculo
- RF019: Geração Automática de Workflows LangFlow pela IA 🔥

#### ADRs Implementados
- ADR-001: Metadata-Driven Architecture
- ADR-004: CrewAI + LangGraph sobre LangChain Agents (workflows)
- ADR-008: Geração 100% Automática por IA (object definitions + workflows)
- ADR-013: Code Generation Strategy (LLM-based)

#### Validação
- No Oráculo "Banking Demo":
  - Chat IA: "Preciso de objeto Conta Corrente com saldo, titular CPF, agência, status (ativa/bloqueada/encerrada)"
  - Sistema gera Object Definition completo com:
    - JSON Schema (campos + tipos + constraints)
    - Validações (CPF válido, saldo >= 0)
    - FSM (ativa → bloqueada → encerrada)
  - Criar instância: Conta #12345 (saldo: R$ 1000, titular: 123.456.789-00)
  - Testar transição FSM: ativa → bloqueada (sucesso)
  - Validar constraint: saldo negativo (falha)
- Gerar workflow "Abertura de Conta" via LangFlow

#### Scrum Master (Sonnet 4.5)
- User stories para RF010-RF019
- Documentação de JSON Schema patterns
- Guia de uso do IA Generator
- Exemplos de Object Definitions

---

### **FASE 3: Camada Agentes - AI Multi-Agent**
**Duração**: 3-4 semanas
**Agente Principal**: Opus 4.5

#### Objetivo
Sistema de agentes CrewAI orquestrados com MCP integration

#### Entregas

**Backend Python (FastAPI)**:
- ✅ **CrewAI Multi-Agent System** (RF020-RF023):
  - Agent registry (`ai_agents` table PostgreSQL)
  - CRUD de Agentes (RF020)
  - **IA Generator de Agentes** (RF021) 🔥
    - Input: "Preciso de agente KYC que valida CPF na Receita Federal"
    - Output: Agent definition (role, goal, tools, backstory)
  - Orquestração (RF022):
    - CrewAI Crew (sequential, hierarchical, consensual)
    - Task delegation
    - Inter-agent communication
  - Execução (RF023):
    - Async execution (Celery + Redis)
    - Progress tracking
    - Result streaming
- ✅ **MCP Integration** (RF030-RF034):
  - MCP Server do SuperCore (RF030):
    - MCP protocol implementation
    - Tools registry
  - MCP Resources (RF031):
    - Structured data access (object instances, knowledge)
  - MCP Tools (RF032):
    - Executable operations (create_account, validate_cpf, query_bacen, etc)
  - MCP Prompts (RF033):
    - Reusable prompt templates
  - **Apache Pulsar** (RF034 - ADR-002):
    - Async messaging between agents
    - Topics: agent-tasks, agent-results, agent-events
    - Multi-tenancy (oracle_id partitioning)
- ✅ LangGraph Workflows:
  - State machines para processos complexos
  - Integration com CrewAI agents
- ✅ Testes: unit + integration (≥80%)

**Backend Go (Gin)**:
- ✅ MCP Gateway:
  - Proxy para MCP servers (Go performance)
  - Load balancing
  - Rate limiting
- ✅ Agent execution API:
  - `POST /api/v1/oracles/{id}/agents/{agentId}/execute`
  - WebSocket para streaming de resultados

**Frontend (Next.js 14)**:
- ✅ Portal de Agentes:
  - `/oracles/{id}/agents` - Listagem
  - `/oracles/{id}/agents/new` - Criar (manual ou via IA)
  - `/oracles/{id}/agents/{agentId}` - Detalhes
  - `/oracles/{id}/agents/{agentId}/execute` - Executar + logs em tempo real
- ✅ **Chat IA para geração de agentes** (RF021)
- ✅ Agent Visualizer:
  - Crew structure (React Flow)
  - Task dependencies
  - Execution timeline
- ✅ MCP Tools Explorer:
  - Listar tools disponíveis
  - Test playground
- ✅ Testes: Jest + Playwright (≥80%)

#### Requisitos Funcionais Cobertos
- RF020: Gerenciamento de Agentes por Oráculo
- RF021: Geração Automática de Agentes via IA 🔥
- RF022: Orquestração de Agentes (CrewAI)
- RF023: Execução de Agentes
- RF030: MCP Server do SuperCore
- RF031: Recursos MCP - Dados Estruturados
- RF032: Ferramentas MCP - Operações Executáveis
- RF033: Prompts MCP Reutilizáveis
- RF034: Comunicação Assíncrona via MCP e Pulsar

#### ADRs Implementados
- ADR-002: Apache Pulsar (messaging entre agentes)
- ADR-004: CrewAI + LangGraph
- ADR-008: Geração 100% Automática por IA (agents)
- ADR-010: Oráculos via MCP (interconectividade)

#### Validação
- No Oráculo "Banking Demo":
  - Chat IA: "Crie agente KYC que valida CPF na Receita Federal via API Serpro"
  - Sistema gera Agent:
    - Role: "KYC Analyst"
    - Goal: "Validate customer identity"
    - Tools: [query_serpro_cpf, validate_biometrics, check_pep_list]
  - Criar Crew "Onboarding":
    - Agent 1: KYC Analyst (valida CPF)
    - Agent 2: Risk Analyst (calcula score)
    - Agent 3: Compliance Officer (aprova/rejeita)
  - Executar Crew com input: CPF 123.456.789-00
  - Ver logs em tempo real (WebSocket)
  - Resultado: "Aprovado" com justificativa
- MCP Tools funcionando (query_cpf, create_account, etc)
- Pulsar topics com mensagens (agent-tasks, agent-results)

#### Scrum Master (Sonnet 4.5)
- User stories para RF020-RF034
- Documentação de MCP protocol
- Agent Design Patterns guide
- CrewAI orchestration examples

---

### **FASE 4: AI-Driven Generator - "The Magic"**
**Duração**: 5-6 semanas
**Agente Principal**: Opus 4.5

#### Objetivo
As 6 fases de geração automática de soluções completas (RF040-RF046)

#### Entregas

**Backend Python (FastAPI)**:
- ✅ **Architect Agent** (LLM GPT-4/Claude Opus):
  - Analisa contexto do Oráculo (RAG Trimodal)
  - Gera especificação técnica completa
  - Output: design de arquitetura, APIs, data models, workflows
- ✅ **Code Generator Agent**:
  - Gera código Python/Go/TypeScript
  - Templates + AST manipulation + LLM (ADR-013)
  - Middleware (FastAPI routers, Gin handlers)
  - Frontend (Next.js pages, components)
- ✅ **Fase 0: Setup do Oráculo** (RF040):
  - Wizard de configuração
  - Selecionar domínio, idiomas, integrações
- ✅ **Fase 1: Upload de Contexto** (RF041):
  - Mesma ingestão multimodal (RF002)
  - Documentos específicos do use case
- ✅ **Fase 2: Especificação Gerada** (RF042) 🔥:
  - LLM lê contexto (RAG)
  - Gera especificação:
    - Object Definitions necessários
    - Agents necessários
    - Workflows necessários
    - UI screens necessários
  - Refinamento iterativo com usuário (chat)
- ✅ **Fase 3: Geração de Modelo Executável** (RF043) 🔥:
  - Code Generator cria:
    - Backend Go: APIs REST (CRUD)
    - Backend Python: Agents CrewAI
    - Frontend Next.js: Pages + Components
    - Migrations PostgreSQL
    - NebulaGraph schemas
  - Tudo versionado em Git
- ✅ **Fase 4: Preview, Teste, Aprovação** (RF044):
  - Deploy em ambiente de preview (Kubernetes namespace isolado)
  - Usuário testa solução gerada
  - Feedback loop → volta para Fase 2 ou 3
- ✅ **Fase 5: "PLAY" - Ativação** (RF045) 🔥🔥🔥:
  - Deploy em produção (Kubernetes)
  - DNS apontado (subdomínio por Oráculo)
  - Solução COMPLETA ativa:
    - Middleware rodando (APIs REST/GraphQL)
    - Agentes executáveis (CrewAI)
    - Workflows ativos (LangFlow)
    - Frontend acessível (Next.js)
    - Data layer migrado (PostgreSQL + NebulaGraph + pgvector)
- ✅ **Versionamento e Evolução** (RF046):
  - Git tagging (v1.0.0, v1.1.0)
  - Rollback capability
  - Blue-Green deployment
  - Evolutionary updates (rerun Fase 2-5 para novas features)

**Backend Go (Gin)**:
- ✅ Deployment Orchestrator (ADR-009):
  - `POST /api/v1/oracles/{id}/play` - Trigger "Play"
  - Status tracking (`deployment_status` table)
  - Rollback API
- ✅ Template engine para código Go

**Frontend (Next.js 14)**:
- ✅ **Wizard de 6 Fases** (RF040-RF045):
  - `/oracles/{id}/wizard/step0` - Setup
  - `/oracles/{id}/wizard/step1` - Upload
  - `/oracles/{id}/wizard/step2` - Especificação (chat IA + preview)
  - `/oracles/{id}/wizard/step3` - Geração (loading + código gerado)
  - `/oracles/{id}/wizard/step4` - Preview (iframe + teste)
  - `/oracles/{id}/wizard/step5` - Deploy (botão "Play")
- ✅ Code Viewer (syntax highlighting)
- ✅ Deployment status dashboard
- ✅ Testes: Playwright E2E (fluxo completo 6 fases)

**Infrastructure (Terraform + Kubernetes)**:
- ✅ Deployment Orchestrator:
  - Cria namespace por Oráculo (`oracle-{id}`)
  - Deploy de pods (backend, frontend, agents)
  - Ingress + DNS (oracle-{id}.supercore.com)
  - Secrets management
- ✅ CI/CD para soluções geradas:
  - GitHub repo criado automaticamente
  - GitHub Actions configurado
  - Auto-deploy on push

#### Requisitos Funcionais Cobertos
- RF040: Fase 0 - Setup do Oráculo
- RF041: Fase 1 - Upload de Contexto Multimodal
- RF042: Fase 2 - Especificação Gerada e Refinamento Iterativo 🔥
- RF043: Fase 3 - Geração Automática de Modelo Executável 🔥
- RF044: Fase 4 - Preview, Teste e Aprovação
- RF045: Fase 5 - "Play" - Ativação e Geração de Solução Completa 🔥🔥🔥
- RF046: Versionamento e Evolução de Modelos

#### ADRs Implementados
- ADR-008: Geração 100% Automática por IA (CRÍTICO)
- ADR-009: Super Portal + Deployment Orchestrator
- ADR-013: Code Generation Strategy (LLM + Templates + AST)
- ADR-012: Multi-Tenancy Strategy (namespace por Oráculo)

#### Validação (End-to-End)
**Cenário**: Criar solução Core Banking completa

1. **Fase 0**: Setup Oráculo "Banco XYZ" (domínio: Banking, idioma: pt-BR)
2. **Fase 1**: Upload de PDFs:
   - Resolução 4.966 BACEN (abertura de contas)
   - Política interna de KYC do banco
   - Regulação PLD/FT
3. **Fase 2**: Chat IA:
   - User: "Preciso de sistema para abertura de conta corrente com KYC completo"
   - IA: Gera especificação:
     - Objects: Cliente, Conta, Transação, Documento
     - Agents: KYC Agent, Risk Agent, Compliance Agent
     - Workflows: Onboarding, Abertura de Conta
     - Screens: Cadastro Cliente, Dashboard Contas
   - User: Refina → "Adicionar validação biométrica facial"
   - IA: Atualiza especificação
4. **Fase 3**: Code Generator cria:
   - Backend Go: 15 APIs REST (CRUD Cliente, Conta, etc)
   - Backend Python: 3 Agents CrewAI + Whisper biometria
   - Frontend Next.js: 8 pages + 20 components
   - Migrations: 10 tabelas PostgreSQL
   - 500+ linhas de código gerado automaticamente
5. **Fase 4**: Preview em `preview-oracle-123.supercore.com`
   - User testa fluxo de abertura de conta
   - Feedback: "Falta validação de CPF duplicado"
   - Volta para Fase 2 → IA adiciona validação → Fase 3 regenera código
6. **Fase 5**: User clica "PLAY"
   - Deploy em `banco-xyz.supercore.com`
   - Solução Core Banking COMPLETA rodando:
     - APIs REST (8080)
     - Frontend (3000)
     - Agents (background workers)
     - Database migrado
   - **ZERO CÓDIGO MANUAL** 🔥🔥🔥

#### Scrum Master (Sonnet 4.5)
- User stories para RF040-RF046
- Documentação do Wizard de 6 Fases
- Architect Agent prompt engineering guide
- Code Generator templates documentation
- Deployment runbook

---

### **FASE 5: Ferramentas de Geração de UI Abstrata & Production Readiness**
**Duração**: 3-4 semanas
**Agente Principal**: Opus 4.5

#### Objetivo
Criar **ferramentas ABSTRATAS** para geração automática de UI (não soluções de negócio concretas), production-grade deployment, abstração total

**IMPORTANTE**: Esta fase NÃO gera soluções de negócio (Banking, CRM, Healthcare). Gera apenas as **ferramentas e engines** que PERMITIRÃO gerar qualquer UI no futuro.

#### Entregas

**Frontend (Next.js 14) - Ferramentas Abstratas de Geração de UI**:
- ✅ **FormGenerator Engine** (RF050) - Ferramenta Abstrata:
  - **Input**: JSON Schema (agnóstico de domínio)
  - **Output**: Formulário React completo
  - Funcionalidades:
    - Dynamic form rendering (qualquer schema)
    - Auto-validation (client-side + server-side)
    - Multi-step forms (wizard steps)
    - File uploads (drag-drop, progress)
    - Conditional fields (show/hide based on values)
    - Nested objects/arrays (infinito)
  - **NÃO GERA**: Formulários específicos (ex: "Form de Cadastro de Cliente Banking")
  - **GERA**: Engine que PODE gerar qualquer formulário dado um schema

- ✅ **ProcessFlowVisualization Engine** (RF051) - Ferramenta Abstrata:
  - **Input**: Workflow definition JSON (agnóstico de domínio)
  - **Output**: Visualizador React Flow interativo
  - Funcionalidades:
    - Workflow visualizer (nodes, edges, layouts)
    - Real-time execution status (running, completed, failed)
    - Interactive nodes (click → detalhes, logs)
    - Zoom, pan, minimap
    - Export to SVG/PNG
  - **NÃO GERA**: Workflows específicos (ex: "Fluxo de Abertura de Conta")
  - **GERA**: Engine que PODE visualizar qualquer workflow

- ✅ **ValidationEngine** (RF052) - Ferramenta Abstrata:
  - **Input**: Validation rules JSON (agnóstico de domínio)
  - **Output**: Validador executável (client + server)
  - Funcionalidades:
    - Agnóstico de domínio (não sabe o que é CPF, Email, etc)
    - Extensível (custom validators via plugins)
    - Client-side + server-side sync (mesmas regras)
    - Async validation (API calls)
    - Error messages i18n
  - **NÃO CONTÉM**: Validadores específicos hardcoded (CPF, CNPJ, etc)
  - **CONTÉM**: Framework para REGISTRAR validadores (plugin system)

- ✅ **Screen Type Conductor - Widget Selection Engine** (RF053) 🔥 - Ferramenta Abstrata:
  - **Input**: Field metadata (type, constraints, context)
  - **Output**: Melhor widget component para o field
  - Funcionalidades:
    - IA analisa field e escolhe widget (via regras + LLM fallback)
    - Widget registry (extensível):
      - TextInput, NumberInput, DateInput, SelectInput, etc
      - MaskedInput (generic), AutocompleteInput (generic)
    - Learning loop (user feedback → melhora escolhas)
    - Context-aware (locale, device, accessibility needs)
  - **NÃO CONTÉM**: Widgets específicos hardcoded (CPFInput, CNPJInput, etc)
  - **CONTÉM**:
    - Registry de widgets GENÉRICOS (MaskedInput pode ser configurado para CPF/CNPJ/Phone)
    - Engine de decisão (regras + LLM) para escolher melhor widget
    - Plugin system para adicionar novos widgets

- ✅ **UI Component Library Abstrata**:
  - shadcn/ui base components (Button, Input, Select, Dialog, etc)
  - Composable patterns (Form + Table + Modal + Tabs)
  - Theme system (light/dark modes, colors, fonts)
  - Responsive utilities (mobile-first)
  - Accessibility built-in (WCAG 2.1 AA)

- ✅ **i18n Engine** (Internacionalização):
  - Multi-idioma (pt-BR, en-US, es-ES, etc)
  - Dynamic locale switching
  - Date/number/currency formatting por locale
  - RTL support (árabe, hebraico)

- ✅ **Performance Optimization**:
  - Code splitting (dynamic imports)
  - Image optimization (Next.js Image)
  - Lazy loading (components, routes)
  - Lighthouse score 90+ (Performance, Accessibility, Best Practices, SEO)

**Backend (Go + Python)**:
- ✅ Production-grade features (RF062):
  - Rate limiting
  - Circuit breakers
  - Health checks (`/health`, `/ready`)
  - Graceful shutdown
  - Distributed tracing (OpenTelemetry)
  - Structured logging (JSON)
- ✅ Security:
  - OWASP Top 10 mitigations
  - SQL injection prevention (prepared statements)
  - XSS prevention (CSP headers)
  - CSRF tokens
  - Secret rotation

**Infrastructure**:
- ✅ **Production Kubernetes** (RF062):
  - Multi-AZ deployment
  - Auto-scaling (HPA, VPA)
  - Rolling updates
  - Blue-Green deployment
  - Disaster recovery (backups automatizados)
- ✅ **Monitoring & Observability**:
  - Prometheus metrics
  - Grafana dashboards
  - Jaeger distributed tracing
  - ELK logging
  - Alerting (PagerDuty/Slack)
- ✅ **CI/CD Production-Grade**:
  - Smoke tests
  - Load tests (k6)
  - Security scans (Trivy, OWASP Dependency Check)
  - E2E tests (Playwright)
  - Approval gates (staging → prod)

**Abstração Total - Ferramentas, NÃO Soluções** (RF060-RF061):
- ✅ **FormGenerator Engine** testado com 10+ schemas diferentes (genérico, não específico)
- ✅ **ProcessFlowVisualization Engine** testado com 5+ workflows diferentes
- ✅ **ValidationEngine** com plugin system (não validadores hardcoded)
- ✅ **Screen Type Conductor** com widget registry extensível
- ✅ Agnósticismo completo de domínio (RF060):
  - Zero lógica de negócio hardcoded nas engines
  - Todas as engines são CONFIGURÁVEIS via JSON/schemas
  - Plugin system para extensão SEM modificar código core
- ✅ Zero código manual após SuperCore implementado (RF061):
  - Engines abstratas PRONTAS
  - Fase 4 (AI-Driven Generator) USA essas engines para gerar UIs específicas
  - Exemplo: AI-Driven Generator (Fase 4) + FormGenerator Engine (Fase 5) = Formulário Banking gerado automaticamente

**IMPORTANTE - Validação de FERRAMENTAS, não de SOLUÇÕES**:
- ❌ NÃO criar Banking, CRM, Healthcare nesta fase
- ✅ Criar ENGINES que PODEM gerar Banking, CRM, Healthcare (quando acionadas pela Fase 4)

#### Requisitos Funcionais Cobertos
- RF050: FormGenerator Engine (Abstrata)
- RF051: ProcessFlowVisualization Engine (Abstrata)
- RF052: ValidationEngine (Abstrata com plugin system)
- RF053: Screen Type Conductor - Widget Selection Engine 🔥
- RF060: Agnósticismo Completo de Domínio (Engines, não soluções)
- RF061: Zero Código Manual Após SuperCore Implementado (Fundação)
- RF062: Production-Grade desde o Dia 1

#### ADRs Implementados
- ADR-005: Next.js 14 App Router (UI dinâmica)
- ADR-008: Geração 100% Automática (ferramentas abstratas)
- ADR-012: Multi-Tenancy Strategy (prod-grade)
- ADR-013: Code Generation Strategy (engines usadas por Fase 4)

#### Validação - Testes de FERRAMENTAS ABSTRATAS

**1. FormGenerator Engine**:
- ✅ Input: JSON Schema simples (name: string, age: number, email: email)
- ✅ Output: Form React com 3 fields + validation
- ✅ Input: JSON Schema complexo (nested objects, arrays, conditional fields)
- ✅ Output: Form React multi-step wizard
- ✅ Input: JSON Schema com 50+ fields
- ✅ Output: Form performante (<100ms render)
- **Validação**: Engine FUNCIONA para qualquer schema (não sabe o que é "Cliente" ou "Conta")

**2. ProcessFlowVisualization Engine**:
- ✅ Input: Workflow linear (A → B → C)
- ✅ Output: React Flow diagram linear
- ✅ Input: Workflow complexo (condicionais, loops, paralelos)
- ✅ Output: React Flow diagram com branches/merges
- ✅ Input: Workflow com 100+ nodes
- ✅ Output: Visualizador performante (zoom, pan, search)
- **Validação**: Engine FUNCIONA para qualquer workflow (não sabe o que é "Onboarding" ou "KYC")

**3. ValidationEngine**:
- ✅ Register validator plugin: `emailValidator`
- ✅ Use validator: campo email validado (client + server)
- ✅ Register validator plugin: `minLengthValidator`
- ✅ Compose validators: `required + email + minLength(5)`
- ✅ Async validator: API call (ex: check username availability)
- **Validação**: Engine FUNCIONA com qualquer validator (não contém CPF/CNPJ hardcoded)

**4. Screen Type Conductor**:
- ✅ Input: field `{type: "string", format: "email"}`
- ✅ Output: EmailInput widget selecionado
- ✅ Input: field `{type: "string", pattern: "^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$"}` + context `{locale: "pt-BR"}`
- ✅ Output: MaskedInput(mask="999.999.999-99") selecionado (via regras, não hardcoded)
- ✅ Register widget plugin: CustomAutocompleteWidget
- ✅ Engine usa novo widget quando aplicável
- **Validação**: Engine FUNCIONA com widget registry extensível (não sabe o que é CPF)

**Production Metrics** (Infraestrutura):
- Uptime: 99.9%
- API response time (p95): <500ms
- Frontend load time: <2s
- Test coverage: ≥80%
- Security vulnerabilities: 0 HIGH/CRITICAL
- Lighthouse score: 90+

**NÃO VALIDA** (isso é Fase 4):
- ❌ Geração de soluções Banking, CRM, Healthcare
- ❌ Formulários específicos (Cadastro de Cliente, etc)
- ❌ Workflows específicos (Abertura de Conta, etc)

#### Scrum Master (Sonnet 4.5)
- Documentation de Engines Abstratas:
  - **FormGenerator Engine Guide**: Como usar, schemas suportados, exemplos
  - **ProcessFlowVisualization Engine Guide**: Como usar, workflow formats, customização
  - **ValidationEngine Guide**: Plugin system, criar custom validators, best practices
  - **Screen Type Conductor Guide**: Widget registry, regras de seleção, learning loop
  - **Plugin Development Guide**: Como criar plugins para cada engine
- Production readiness checklist
- Runbooks (troubleshooting engines)
- Performance benchmarks (engines com 1000+ fields/nodes)

---

## 📊 Resumo Executivo

| Fase | Duração | RFs Cobertos | Stack Principal | Entrega-Chave |
|------|---------|--------------|-----------------|---------------|
| **Fase 0** | 2-3 sem | Infra | PostgreSQL+pgvector, NebulaGraph, Redis, Pulsar, Terraform, K8s | Infraestrutura completa |
| **Fase 1** | 3-4 sem | RF001-006 + IA Assistant | Go (Gin), Python (FastAPI), Next.js 14, pgvector | Super Portal + RAG Trimodal + **IA Assistant Chat** 🔥 |
| **Fase 2** | 4-5 sem | RF010-019 | Go, Python (LLM), Next.js, LangFlow | Objetos + Workflows (IA gerados) |
| **Fase 3** | 3-4 sem | RF020-034 | Python (CrewAI), Pulsar, Go (MCP Gateway) | Agentes + MCP + **Agentic RAG** 🔥 |
| **Fase 4** | 5-6 sem | RF040-046 | Python (LLM), Go, Next.js, Terraform, K8s | **"PLAY" - Geração Completa** 🔥🔥🔥 |
| **Fase 5** | 3-4 sem | RF050-062 | Next.js (Engines Abstratas), K8s (Prod), Observability | **Ferramentas de Geração de UI** (não soluções) 🔥 |
| **TOTAL** | **20-26 semanas** | **63 RFs** | | **SuperCore v2.0 Completo** |

---

## 🎯 Critérios de Sucesso Globais

### Fase 1 (FUNDAÇÃO)
- ✅ RAG Trimodal funcionando (SQL + Graph + Vector)
- ✅ **IA Assistant conversacional** respondendo perguntas sobre Oráculo
- ✅ Chat exibe fontes (SQL, Graph, Vector sources)
- ✅ Histórico de conversas persistido
- ✅ Fundação para Agentic RAG (Fase 3) e geração automática (Fase 4)

### Fase 4 (CRÍTICO - GERAÇÃO COMPLETA)
- ✅ Clicar "PLAY" em Oráculo Banking → obter Core Banking COMPLETO
- ✅ Middleware (APIs REST)
- ✅ Agentes (CrewAI)
- ✅ Workflows (LangFlow)
- ✅ Frontend (Next.js) - **USANDO engines da Fase 5**
- ✅ Data layer (PostgreSQL + NebulaGraph + pgvector)
- ✅ **ZERO código manual**

### Fase 5 (FERRAMENTAS ABSTRATAS)
- ✅ **FormGenerator Engine** testado com 10+ schemas diferentes
- ✅ **ProcessFlowVisualization Engine** testado com 5+ workflows diferentes
- ✅ **ValidationEngine** com plugin system funcionando
- ✅ **Screen Type Conductor** escolhendo widgets corretamente
- ✅ Zero lógica de negócio hardcoded (agnóstico de domínio)
- ✅ Plugin system funcionando (criar custom validators/widgets)
- ❌ NÃO criar soluções concretas (Banking, CRM, Healthcare) - isso é Fase 4

### Validação Final (Fase 4 + Fase 5 juntas)
- ✅ 3 Oráculos diferentes (Banking, CRM, Healthcare) gerados pela Fase 4
- ✅ Cada solução USA as engines abstratas da Fase 5
- ✅ **FormGenerator Engine** gera forms específicos (ex: Cadastro de Cliente)
- ✅ **ProcessFlowVisualization Engine** exibe workflows específicos (ex: Onboarding)
- ✅ Todas rodando em produção (99.9% uptime)
- ✅ **ZERO código manual** em todas as 3 soluções
- ✅ Agnósticismo total comprovado

---

## 🤖 Próximos Passos

1. **Aprovação desta proposta** pelo usuário
2. **Scrum Master (Sonnet 4.5)** cria backlog detalhado da Fase 0
3. **Code Orchestrator (Opus 4.5)** inicia implementação da Fase 0
4. **Weekly reviews** com demos e validações
5. **Iterações** conforme feedback

---

**Versão**: 1.0.0
**Data**: 2025-12-28
**Status**: Aguardando aprovação
**Baseado 100% em**: `documentation-base/` (requisitos, arquitetura, stack)
