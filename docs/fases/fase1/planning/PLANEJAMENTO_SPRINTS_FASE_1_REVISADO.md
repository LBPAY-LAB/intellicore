# Planejamento de Sprints - Fase 1: AI-Driven Context Generator (REVISADO)

**Status**: 🟢 Pronto para Implementação
**Versão**: 2.0.0 (Revisado conforme VISAO_FINAL_CONSOLIDADA.md)
**Data**: 2025-12-11
**Duração Total**: 4 semanas (4 sprints de 1 semana)

---

## 🔗 Referências Obrigatórias

> **⚠️ LEITURA ESSENCIAL**: Este planejamento está baseado em:
>
> **[docs/architecture/VISAO_FINAL_CONSOLIDADA.md](../../architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ **Arquitetura consolidada**
>
> Seção relevante: **"Fase 1: AI-Driven Context Generator (4 semanas)"**

---

## 📋 Visão Geral da Fase 1 REVISADA

### ❌ O QUE NÃO É MAIS (Abordagem Antiga - Foundation)
- ~~15 REST endpoints CRUD (Object Definitions, Instances, Relationships)~~
- ~~Assistente de criação manual de objetos~~
- ~~Dynamic UI generation básica~~

### ✅ O QUE É AGORA (Nova Visão - AI-Driven Context Generator)

**Objetivo**: Criar interface de upload multi-modal e orquestrador que processa documentação para geração automática de modelos.

**Entregas Principais**:
1. **Página "Novo Contexto"** - Interface de upload
2. **Upload multi-modal**: PDFs BACEN, Mermaid files, Whimsical images, super prompt
3. **Backend**: object_definition `context_inputs`
4. **Vision API integration** (Anthropic Claude para diagramas)
5. **PDF parsing** (PyMuPDF)
6. **Botão "Processar"** que aciona ContextProcessorOrchestrator
7. **Orquestrador**: coordena extração de texto, análise de fluxos, consulta RAG
8. **Testes**: upload e processamento de contextos reais

---

## 🎯 Objetivos de Negócio da Fase 1

1. **Time de Produto pode fazer upload de documentação** (PDFs BACEN, diagramas, prompts)
2. **Sistema processa multi-modal inputs** (texto + imagens + diagramas)
3. **IA extrai contexto estruturado** para uso em fases seguintes
4. **Fundação para geração automática de especificações** (Fase 2)

---

## 🏗️ Arquitetura da Fase 1

```
┌────────────────────────────────────────────────────────────┐
│  FRONTEND (Next.js 14)                                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Página: "Novo Contexto"                             │  │
│  │  - Upload de arquivos (PDF, Mermaid, Whimsical, TXT)│  │
│  │  - Campo de super prompt (textarea)                  │  │
│  │  - Botão "Processar Contexto"                        │  │
│  │  - Preview de arquivos uploaded                      │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          ↓ POST /api/v1/context/upload
┌────────────────────────────────────────────────────────────┐
│  BACKEND (Go 1.21+)                                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API REST                                            │  │
│  │  - POST /api/v1/context/upload                       │  │
│  │  - GET  /api/v1/context/:id                          │  │
│  │  - POST /api/v1/context/:id/process                  │  │
│  │  - GET  /api/v1/context/:id/status                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  ContextProcessorOrchestrator                        │  │
│  │  - Coordena processamento de contextos               │  │
│  │  - Chama Vision API (imagens/diagramas)              │  │
│  │  - Chama PDF Parser (textos)                         │  │
│  │  - Armazena contexto estruturado                     │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          ↓ chama
┌────────────────────────────────────────────────────────────┐
│  AI SERVICES (Python 3.11+)                                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vision API Client (Anthropic Claude)                │  │
│  │  - Processa imagens de diagramas                     │  │
│  │  - Extrai fluxos, entidades, relacionamentos         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PDF Parser (PyMuPDF)                                │  │
│  │  - Extrai texto de PDFs                              │  │
│  │  - Identifica seções, tabelas, listas                │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          ↓ armazena
┌────────────────────────────────────────────────────────────┐
│  DATABASE (PostgreSQL 15+)                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Table: context_inputs                               │  │
│  │  - id, files_metadata, super_prompt                  │  │
│  │  - processed_data (JSONB)                            │  │
│  │  - status, created_at, updated_at                    │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

---

## 📅 Breakdown de Sprints (4 semanas)

### Sprint 1: Infraestrutura Base + Upload Interface (Semana 1)

**Objetivo**: Criar infraestrutura básica e interface de upload de arquivos.

#### 🎯 Entregas

**Backend** (Go):
- [ ] Database schema (migrations):
  - Tabela `context_inputs` (id, files_metadata JSONB, super_prompt TEXT, processed_data JSONB, status VARCHAR, created_at, updated_at)
  - Tabela `uploaded_files` (id, context_id UUID FK, file_type VARCHAR, file_path VARCHAR, file_size INT, mime_type VARCHAR, created_at)
- [ ] API endpoints:
  - `POST /api/v1/context/upload` - Upload de arquivos (multipart/form-data)
  - `GET /api/v1/context/:id` - Buscar contexto por ID
  - `GET /api/v1/context` - Listar contextos (com paginação)
- [ ] File storage service:
  - Armazenamento local em `/data/uploads` (Fase 1)
  - Suporte a PDF, PNG, JPG, SVG, TXT, MD
  - Validação de tipo de arquivo e tamanho (max 50MB por arquivo)

**Frontend** (Next.js 14):
- [ ] Página `/novo-contexto`:
  - Layout com header + main content
  - Seção de upload de arquivos (drag & drop + file picker)
  - Lista de arquivos uploaded (com preview, nome, tamanho, botão remover)
  - Campo de super prompt (textarea com contador de caracteres)
  - Botão "Salvar Rascunho" (salva sem processar)
- [ ] Componente `FileUploader`:
  - Drag & drop zone
  - File type validation (client-side)
  - Progress bar durante upload
  - Preview de arquivos (imagem, PDF, texto)
- [ ] Página `/contextos` (lista):
  - Tabela com contextos criados (ID, Data, Status, Arquivos, Ações)
  - Filtro por status
  - Link para cada contexto

**DevOps**:
- [ ] Docker Compose atualizado:
  - PostgreSQL 15 com migrations automáticas
  - Volume para `/data/uploads`
  - Backend Go (porta 8080)
  - Frontend Next.js (porta 3000)

#### 📝 Kanban Cards (Sprint 1)

| Card | Responsável | Estimativa | Status |
|------|-------------|------------|--------|
| **Backend: Database migrations (context_inputs, uploaded_files)** | Backend Architect Agent | 4h | ⏸️ To Do |
| **Backend: File storage service (upload, validação, armazenamento)** | Backend Architect Agent | 6h | ⏸️ To Do |
| **Backend: API POST /context/upload** | Backend Developer Agent | 4h | ⏸️ To Do |
| **Backend: API GET /context/:id e GET /context** | Backend Developer Agent | 3h | ⏸️ To Do |
| **Frontend: Página /novo-contexto (layout base)** | Frontend Developer Agent | 4h | ⏸️ To Do |
| **Frontend: Componente FileUploader (drag & drop)** | Frontend Developer Agent | 6h | ⏸️ To Do |
| **Frontend: Preview de arquivos (PDF, imagem, texto)** | Frontend Developer Agent | 4h | ⏸️ To Do |
| **Frontend: Página /contextos (lista)** | Frontend Developer Agent | 3h | ⏸️ To Do |
| **DevOps: Docker Compose atualizado** | DevOps Agent | 2h | ⏸️ To Do |
| **TDD: Testes de upload de arquivos** | TDD Orchestrator Agent | 4h | ⏸️ To Do |

**Total Sprint 1**: ~40 horas (~1 semana para squad de 8 agents)

---

### Sprint 2: PDF Parser + Vision API Integration (Semana 2)

**Objetivo**: Integrar serviços de IA para processar PDFs e imagens/diagramas.

#### 🎯 Entregas

**AI Services** (Python 3.11+):
- [ ] Serviço `pdf-parser`:
  - FastAPI service (porta 8081)
  - Endpoint `POST /parse-pdf` (recebe file_path, retorna JSON estruturado)
  - PyMuPDF integration (extração de texto, seções, tabelas)
  - Identificação de estrutura de documento (títulos, listas, parágrafos)
  - Output: `{ "sections": [...], "tables": [...], "metadata": {...} }`
- [ ] Serviço `vision-api`:
  - FastAPI service (porta 8082)
  - Endpoint `POST /analyze-diagram` (recebe image_path, retorna análise)
  - Anthropic Claude Vision API integration
  - Prompt: "Analise este diagrama e extraia: entidades, relacionamentos, fluxos, estados"
  - Output: `{ "entities": [...], "relationships": [...], "flows": [...] }`

**Backend** (Go):
- [ ] Clients para AI services:
  - `PDFParserClient` (HTTP client para pdf-parser:8081)
  - `VisionAPIClient` (HTTP client para vision-api:8082)
- [ ] API endpoint:
  - `POST /api/v1/context/:id/process` - Aciona processamento

**Frontend**:
- [ ] Botão "Processar Contexto" na página `/novo-contexto`
- [ ] Loading state durante processamento
- [ ] Exibição de status (Processando PDF 1/3, Analisando Diagrama 1/2, etc)

**DevOps**:
- [ ] Docker Compose adicionar serviços Python:
  - `pdf-parser` service
  - `vision-api` service
  - Secrets: `ANTHROPIC_API_KEY`

#### 📝 Kanban Cards (Sprint 2)

| Card | Responsável | Estimativa | Status |
|------|-------------|------------|--------|
| **AI: PDF Parser service (FastAPI + PyMuPDF)** | AI Engineer Agent | 8h | ⏸️ To Do |
| **AI: Vision API service (FastAPI + Anthropic)** | AI Engineer Agent | 8h | ⏸️ To Do |
| **Backend: PDFParserClient (HTTP client)** | Backend Developer Agent | 3h | ⏸️ To Do |
| **Backend: VisionAPIClient (HTTP client)** | Backend Developer Agent | 3h | ⏸️ To Do |
| **Backend: API POST /context/:id/process** | Backend Architect Agent | 4h | ⏸️ To Do |
| **Frontend: Botão "Processar" + loading state** | Frontend Developer Agent | 3h | ⏸️ To Do |
| **Frontend: Status de processamento (real-time updates)** | Frontend Developer Agent | 4h | ⏸️ To Do |
| **DevOps: Docker services Python (pdf-parser, vision-api)** | DevOps Agent | 3h | ⏸️ To Do |
| **TDD: Testes de integração AI services** | TDD Orchestrator Agent | 4h | ⏸️ To Do |

**Total Sprint 2**: ~40 horas

---

### Sprint 3: ContextProcessorOrchestrator + Background Jobs (Semana 3)

**Objetivo**: Implementar orquestrador que coordena processamento assíncrono.

#### 🎯 Entregas

**Backend** (Go):
- [ ] `ContextProcessorOrchestrator` service:
  - Orquestra processamento de todos os arquivos de um contexto
  - Para cada PDF: chama PDFParserClient
  - Para cada imagem/diagrama: chama VisionAPIClient
  - Para super prompt: armazena como texto estruturado
  - Consolida resultados em `context_inputs.processed_data` (JSONB)
  - Atualiza status: `PENDING` → `PROCESSING` → `COMPLETED` / `FAILED`
- [ ] Background job system:
  - Task queue (Redis + Celery OU Go channels simples)
  - Worker que processa contextos em background
  - Retry logic (max 3 tentativas)
  - Timeout (10 min por contexto)
- [ ] API endpoints:
  - `GET /api/v1/context/:id/status` - Status de processamento (polling)
  - `GET /api/v1/context/:id/result` - Resultado processado

**AI Services** (Python):
- [ ] Melhorias no PDF Parser:
  - Detecção de idioma (pt-BR priority)
  - Extração de listas numeradas/bullet points
  - Identificação de seções BACEN (Circular X, Resolução Y)
- [ ] Melhorias no Vision API:
  - Prompt otimizado para diagramas financeiros/BACEN
  - Extração de textos dentro de diagramas (OCR)
  - Detecção de tipos de diagrama (fluxograma, ER, sequência, etc)

**Frontend**:
- [ ] Polling de status (atualização a cada 2s)
- [ ] Exibição de resultado processado:
  - Seções extraídas de PDFs
  - Entidades/relacionamentos de diagramas
  - Super prompt estruturado
- [ ] Botão "Reprocessar" (caso falhe)

**Database**:
- [ ] Adicionar coluna `processing_log` JSONB em `context_inputs` (histórico de steps)

#### 📝 Kanban Cards (Sprint 3)

| Card | Responsável | Estimativa | Status |
|------|-------------|------------|--------|
| **Backend: ContextProcessorOrchestrator service** | Backend Architect Agent | 8h | ⏸️ To Do |
| **Backend: Background job system (task queue)** | Backend Architect Agent | 6h | ⏸️ To Do |
| **Backend: API GET /context/:id/status e /result** | Backend Developer Agent | 3h | ⏸️ To Do |
| **Backend: Retry logic + timeout** | Backend Developer Agent | 3h | ⏸️ To Do |
| **AI: PDF Parser melhorias (idioma, listas, seções)** | AI Engineer Agent | 4h | ⏸️ To Do |
| **AI: Vision API melhorias (prompt, OCR, tipos)** | AI Engineer Agent | 4h | ⏸️ To Do |
| **Database: Migration adicionar processing_log** | Database Architect Agent | 1h | ⏸️ To Do |
| **Frontend: Polling de status (real-time)** | Frontend Developer Agent | 3h | ⏸️ To Do |
| **Frontend: Exibição de resultado processado** | Frontend Developer Agent | 5h | ⏸️ To Do |
| **TDD: Testes de orquestração end-to-end** | TDD Orchestrator Agent | 4h | ⏸️ To Do |

**Total Sprint 3**: ~41 horas

---

### Sprint 4: Polimento + Testes End-to-End + Documentação (Semana 4)

**Objetivo**: Finalizar funcionalidades, testes completos, documentação.

#### 🎯 Entregas

**Backend**:
- [ ] Error handling completo:
  - Mensagens de erro claras (pt-BR)
  - Validações robustas (tipo de arquivo, tamanho, formato)
  - Logging estruturado (Winston/Zap)
- [ ] Otimizações de performance:
  - Compressão de arquivos grandes
  - Streaming de uploads (chunked)
  - Cache de resultados processados (Redis)

**Frontend**:
- [ ] Polimento de UI:
  - Loading skeletons
  - Empty states (nenhum contexto criado)
  - Error states (upload falhou, processamento falhou)
  - Success toasts/notifications
- [ ] Responsividade:
  - Mobile-friendly (layout adaptativo)
  - Tablet support
- [ ] Acessibilidade:
  - ARIA labels
  - Keyboard navigation
  - Screen reader support

**Testes**:
- [ ] Testes unitários (coverage > 80%):
  - Backend: todos os services e handlers
  - Frontend: todos os componentes React
  - AI Services: parsers e API clients
- [ ] Testes de integração:
  - Upload → Processamento → Resultado (fluxo completo)
  - Retry logic
  - Error handling
- [ ] Testes E2E (Playwright):
  - Cenário 1: Upload 3 PDFs + 1 diagrama + super prompt → Processar → Ver resultado
  - Cenário 2: Upload arquivo inválido → Ver erro
  - Cenário 3: Processamento falha → Ver erro → Reprocessar

**Documentação**:
- [ ] API Documentation (OpenAPI/Swagger):
  - Todos os endpoints documentados
  - Request/response schemas
  - Exemplos de uso
- [ ] README atualizado:
  - Como rodar localmente (Docker Compose)
  - Como fazer upload de contexto
  - Como processar contexto
- [ ] Documento de arquitetura:
  - Diagrama de componentes
  - Fluxo de dados
  - Decisões técnicas (ADRs)

**DevOps**:
- [ ] CI/CD pipeline (GitHub Actions):
  - Build e testes automáticos
  - Linting (Go, TypeScript, Python)
  - Code coverage reports
- [ ] Healthchecks:
  - `/health` endpoints em todos os serviços
  - Monitoramento básico (logs)

#### 📝 Kanban Cards (Sprint 4)

| Card | Responsável | Estimativa | Status |
|------|-------------|------------|--------|
| **Backend: Error handling completo** | Backend Developer Agent | 4h | ⏸️ To Do |
| **Backend: Otimizações (compressão, streaming, cache)** | Backend Architect Agent | 5h | ⏸️ To Do |
| **Frontend: Polimento UI (loading, empty, error states)** | Frontend Developer Agent | 4h | ⏸️ To Do |
| **Frontend: Responsividade (mobile, tablet)** | Frontend Developer Agent | 4h | ⏸️ To Do |
| **Frontend: Acessibilidade (ARIA, keyboard, screen reader)** | Frontend Developer Agent | 3h | ⏸️ To Do |
| **TDD: Testes unitários (backend, frontend, AI)** | TDD Orchestrator Agent | 8h | ⏸️ To Do |
| **TDD: Testes de integração (fluxo completo)** | TDD Orchestrator Agent | 5h | ⏸️ To Do |
| **TDD: Testes E2E (Playwright - 3 cenários)** | TDD Orchestrator Agent | 6h | ⏸️ To Do |
| **Docs: API Documentation (Swagger)** | Documentation Agent | 3h | ⏸️ To Do |
| **Docs: README atualizado** | Documentation Agent | 2h | ⏸️ To Do |
| **Docs: Documento de arquitetura (ADRs)** | Documentation Agent | 3h | ⏸️ To Do |
| **DevOps: CI/CD pipeline (GitHub Actions)** | DevOps Agent | 4h | ⏸️ To Do |
| **DevOps: Healthchecks + monitoring** | DevOps Agent | 2h | ⏸️ To Do |

**Total Sprint 4**: ~53 horas

---

## 📊 Resumo da Fase 1

### Duração Total
- **4 sprints de 1 semana** = 4 semanas
- **Horas totais estimadas**: ~174 horas
- **Squad de 8 agents**: ~22 horas/agent (distribuído ao longo de 4 semanas)

### Entregas Finais

✅ **Interface de upload multi-modal** (PDFs, imagens, diagramas, super prompt)
✅ **Backend API REST** (4 endpoints principais)
✅ **AI Services** (PDF Parser + Vision API)
✅ **ContextProcessorOrchestrator** (orquestração assíncrona)
✅ **Background job system** (task queue com retry)
✅ **Database schema** (context_inputs, uploaded_files)
✅ **Testes completos** (unitários, integração, E2E > 80% coverage)
✅ **Documentação** (API docs, README, ADRs)
✅ **CI/CD pipeline** (GitHub Actions)

### Critérios de Sucesso

| Critério | Métrica | Status |
|----------|---------|--------|
| Upload de arquivos funciona | 100% dos tipos suportados (PDF, PNG, JPG, SVG, TXT, MD) | ⏸️ Pendente |
| Processamento de PDFs funciona | > 90% de textos extraídos corretamente | ⏸️ Pendente |
| Análise de diagramas funciona | > 80% de entidades/relacionamentos identificados | ⏸️ Pendente |
| Performance | Processamento de 3 PDFs + 1 diagrama em < 2 min | ⏸️ Pendente |
| Confiabilidade | Retry em caso de falha (max 3 tentativas) | ⏸️ Pendente |
| Testes | Coverage > 80% (backend, frontend, AI) | ⏸️ Pendente |

---

## 🛠️ Stack Tecnológico (Fase 1)

### Backend
- **Go 1.21+** (Gin framework v1.10.0)
- **PostgreSQL 15+** (JSONB storage)
- **Redis** (task queue - opcional Sprint 3)

### Frontend
- **Next.js 14+** (App Router)
- **React 18+**
- **shadcn/ui** (componentes)
- **Tailwind CSS**

### AI Services
- **Python 3.11+**
- **FastAPI v0.110+**
- **PyMuPDF v1.23+** (PDF parsing)
- **Anthropic Claude Vision API** (diagram analysis)

### DevOps
- **Docker + Docker Compose**
- **GitHub Actions** (CI/CD)

---

## 🚦 Dependências Entre Sprints

```
Sprint 1 (Infraestrutura + Upload)
    ↓ (precisa database schema + file storage)
Sprint 2 (AI Services Integration)
    ↓ (precisa AI services prontos)
Sprint 3 (Orquestrador)
    ↓ (precisa orquestrador funcional)
Sprint 4 (Polimento + Testes)
```

**Bloqueadores Identificados**: Nenhum (todas as dependências são internas)

---

## 📋 Checklist de Aprovação

### Time de Produto
- [ ] Entendeu a mudança de escopo (Foundation → AI Context Generator)
- [ ] Aprovou a interface de upload multi-modal
- [ ] Aprovou o fluxo de processamento assíncrono
- [ ] Entendeu que Fase 1 é preparação para Fase 2 (Specification Generation)

### Time Técnico
- [ ] Revisou stack tecnológico (Go, Python, Next.js)
- [ ] Validou viabilidade das AI integrations (Anthropic Claude Vision)
- [ ] Aprovou arquitetura (orquestrador + background jobs)
- [ ] Confirmou estimativas de tempo (4 semanas)

### Squad de Agents
- [ ] Todos os agents leram VISAO_FINAL_CONSOLIDADA.md
- [ ] Todos os agents leram 06_squad_agents.md (composição da squad)
- [ ] Scrum Master entendeu breakdown de sprints
- [ ] Orchestrator Agent validou dependências entre cards

---

## 🎯 Próximos Passos

### Após Aprovação Deste Planejamento

1. ✅ **Criar branch**: `feat/fase1-ai-context-generator`
2. ✅ **Sprint 1 Planning**: Orchestrator Agent distribui cards para agents
3. ✅ **Daily standups**: 15 min/dia (O que fiz? O que vou fazer? Bloqueios?)
4. ✅ **Sprint Review**: Final de cada semana (demo + retrospectiva)
5. ✅ **Fase 1 Complete**: Após Sprint 4, transição para Fase 2 (Specification Generation)

---

## 📚 Referências

- **[VISAO_FINAL_CONSOLIDADA.md](../../architecture/VISAO_FINAL_CONSOLIDADA.md)** - ⭐⭐⭐ Arquitetura master
- **[01_especificacoes.md](01_especificacoes.md)** - Especificações técnicas (A SER REVISADO)
- **[06_squad_agents.md](06_squad_agents.md)** - Composição da squad
- **[stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)** - Stack por fase

---

**Status**: 🟢 Pronto para implementação
**Aguardando**: Aprovação do Time de Produto + Time Técnico
**Próxima ação**: Sprint 1 Planning (distribuição de cards)
