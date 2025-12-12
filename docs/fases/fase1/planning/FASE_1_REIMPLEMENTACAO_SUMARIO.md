# Fase 1 - Sumário de Reimplementação

**Data**: 2025-12-11
**Status**: 🟢 Planejamento Completo
**Mudança**: Foundation (Old) → AI-Driven Context Generator (New)

---

## 📋 O Que Foi Feito

### 1. Documentos Deletados ❌

- **`SPRINT_1_COMPLETE.md`** - Documentação da implementação antiga (15 REST endpoints)
- **`SPRINT_1_TESTING.md`** - Guia de testes da implementação antiga

**Motivo**: Estes documentos descreviam a abordagem **Foundation** baseada na antiga arquitetura de 4 fases. A nova visão consolidada (AI-Driven Context Generator) exige uma abordagem completamente diferente.

### 2. Documento Criado ✅

- **`PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md`** - Novo planejamento completo com 4 sprints

**Conteúdo**:
- Breakdown completo de 4 sprints (4 semanas)
- 43 cards Kanban distribuídos entre os agents
- Arquitetura detalhada (Frontend + Backend + AI Services)
- Critérios de sucesso e checklist de aprovação

---

## 🔄 Mudança de Escopo: Antes vs Depois

### ❌ ANTES (Foundation - Old)

**Objetivo**: Construir motor universal de gestão de objetos

**Entregas**:
- 15 REST endpoints CRUD (Object Definitions, Instances, Relationships)
- Assistente de criação manual de objetos (7 perguntas em NL)
- Dynamic UI generation básica (10 widgets)
- RAG básico (SQL + Graph + Vector)

**Abordagem**: Manual, bottom-up (Time de Produto cria objetos manualmente)

**Duração**: 12 semanas (sprints não bem definidos)

---

### ✅ DEPOIS (AI-Driven Context Generator - New)

**Objetivo**: Criar interface de upload multi-modal e orquestrador que processa documentação

**Entregas**:
1. Página "Novo Contexto" (upload interface)
2. Upload multi-modal: PDFs BACEN, Mermaid files, Whimsical images, super prompt
3. Backend: object_definition `context_inputs`
4. Vision API integration (Anthropic Claude)
5. PDF parsing (PyMuPDF)
6. ContextProcessorOrchestrator (coordena processamento)
7. Background job system (task queue)
8. Testes completos (> 80% coverage)

**Abordagem**: Automática, top-down (IA processa documentação e gera modelos)

**Duração**: 4 semanas (4 sprints bem definidos)

---

## 🎯 Por Que Mudou?

### Documento Consolidado: VISAO_FINAL_CONSOLIDADA.md

A nova visão consolidada introduziu o conceito **revolucionário** do **AI-Driven Context Generator**:

> **"Não estamos construindo um Core Banking manualmente. Estamos construindo uma máquina que GERA Core Bankings automaticamente a partir de documentação."**

### 6 Fases da Nova Arquitetura

| Fase | Nome | Duração | Descrição |
|------|------|---------|-----------|
| **Fase 0** | Oracle Configuration | 1 semana | Identidade da solução ("Sou uma IP licenciada pelo BACEN...") |
| **Fase 1** | AI Context Generator | 4 semanas | **Upload de contexto multi-modal** |
| **Fase 2** | Specification Generation | 3 semanas | IA gera especificação editável |
| **Fase 3** | Object Graph Generation | 6 semanas | IA gera object graph completo |
| **Fase 4** | Model Preview & Approval | 2 semanas | Preview e aprovação do modelo |
| **Fase 5** | Dynamic UI (3 Pilares) | 8 semanas | UI 100% dinâmica |
| **Integração** | Gateways + Testing | 9 semanas | Integrações externas |

**Fase 1 antiga (Foundation)** tentava fazer tudo ao mesmo tempo (manual).

**Fase 1 nova (AI Context Generator)** é focada: apenas preparar inputs para IA processar.

---

## 🏗️ Arquitetura da Fase 1 Revisada

```
┌────────────────────────────────────────────────────────────┐
│  USUÁRIO: Time de Produto / Compliance                     │
│  - Faz upload de PDFs BACEN (Circulares, Resoluções)       │
│  - Faz upload de diagramas (Mermaid, Whimsical)            │
│  - Escreve super prompt descrevendo solução                 │
└────────────────────────────────────────────────────────────┘
                          ↓ Upload
┌────────────────────────────────────────────────────────────┐
│  FRONTEND: Página "Novo Contexto"                          │
│  - Drag & drop files                                       │
│  - Preview de arquivos                                      │
│  - Super prompt (textarea)                                  │
│  - Botão "Processar Contexto"                              │
└────────────────────────────────────────────────────────────┘
                          ↓ POST /api/v1/context/upload
┌────────────────────────────────────────────────────────────┐
│  BACKEND: ContextProcessorOrchestrator                     │
│  1. Armazena arquivos em /data/uploads                      │
│  2. Cria registro em DB (context_inputs)                    │
│  3. Aciona background job                                   │
└────────────────────────────────────────────────────────────┘
                          ↓ Background Processing
┌────────────────────────────────────────────────────────────┐
│  AI SERVICES                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Para cada PDF:                                      │  │
│  │  - PDFParser (PyMuPDF)                               │  │
│  │  - Extrai: seções, tabelas, listas                   │  │
│  │  - Identifica: Circular X, Resolução Y               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Para cada imagem/diagrama:                          │  │
│  │  - Vision API (Anthropic Claude)                     │  │
│  │  - Extrai: entidades, relacionamentos, fluxos        │  │
│  │  - Identifica: tipo de diagrama                      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Super Prompt:                                       │  │
│  │  - Armazena como texto estruturado                   │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────┘
                          ↓ Consolidação
┌────────────────────────────────────────────────────────────┐
│  DATABASE: context_inputs.processed_data (JSONB)           │
│  {                                                         │
│    "pdfs": [                                               │
│      {                                                     │
│        "file": "circular_3978.pdf",                        │
│        "sections": [...],                                  │
│        "tables": [...],                                    │
│        "metadata": {...}                                   │
│      }                                                     │
│    ],                                                      │
│    "diagrams": [                                           │
│      {                                                     │
│        "file": "fluxo_pix.png",                            │
│        "entities": ["Cliente", "Conta", "Transacao"],     │
│        "relationships": ["TITULAR_DE", "EXECUTA"],        │
│        "flows": [...]                                      │
│      }                                                     │
│    ],                                                      │
│    "prompt": "Criar Core Banking para IP com PIX..."      │
│  }                                                         │
└────────────────────────────────────────────────────────────┘
                          ↓ Próxima Fase
┌────────────────────────────────────────────────────────────┐
│  FASE 2: Specification Generation                          │
│  - LLM lê processed_data                                   │
│  - Gera especificação editável (Markdown)                  │
│  - Usuário itera até aprovar                               │
└────────────────────────────────────────────────────────────┘
```

---

## 🎯 Impacto da Mudança

### Time de Produto
**Antes**: Tinha que criar objetos manualmente (via assistente de 7 perguntas)
**Depois**: Faz upload de documentação existente → IA faz o trabalho pesado

### Time Técnico
**Antes**: Implementar 15 endpoints + FSM engine + RAG trimodal (complexo demais para Fase 1)
**Depois**: Implementar upload + processamento de arquivos (escopo bem definido)

### Roadmap
**Antes**: Fase 1 = 12 semanas (sem clareza de sprints)
**Depois**: Fase 1 = 4 semanas (4 sprints bem definidos, 43 cards Kanban)

---

## 📊 Breakdown de Sprints (Resumo)

### Sprint 1: Infraestrutura Base + Upload Interface (1 semana)
- Database schema (context_inputs, uploaded_files)
- Backend API (upload, listar contextos)
- Frontend (página de upload, FileUploader component)
- **10 cards Kanban**

### Sprint 2: PDF Parser + Vision API Integration (1 semana)
- AI Services (pdf-parser, vision-api)
- Backend clients (PDFParserClient, VisionAPIClient)
- Frontend (botão processar, status real-time)
- **9 cards Kanban**

### Sprint 3: ContextProcessorOrchestrator + Background Jobs (1 semana)
- ContextProcessorOrchestrator service
- Background job system (task queue)
- Melhorias nos AI services
- **10 cards Kanban**

### Sprint 4: Polimento + Testes End-to-End + Documentação (1 semana)
- Error handling + otimizações
- Polimento de UI + responsividade + acessibilidade
- Testes completos (unitários, integração, E2E > 80% coverage)
- Documentação (API docs, README, ADRs)
- CI/CD pipeline
- **13 cards Kanban**

**Total**: 43 cards distribuídos entre 8 agents ao longo de 4 semanas.

---

## ✅ Critérios de Sucesso da Fase 1 Revisada

| Critério | Métrica Esperada |
|----------|------------------|
| **Upload funciona** | 100% dos tipos suportados (PDF, PNG, JPG, SVG, TXT, MD) |
| **PDF parsing funciona** | > 90% de textos extraídos corretamente |
| **Vision API funciona** | > 80% de entidades/relacionamentos identificados |
| **Performance** | Processar 3 PDFs + 1 diagrama em < 2 min |
| **Confiabilidade** | Retry automático (max 3 tentativas em caso de falha) |
| **Testes** | Coverage > 80% (backend, frontend, AI services) |
| **Documentação** | API docs + README + ADRs completos |
| **CI/CD** | Pipeline automático (build, tests, lint) |

---

## 🚀 Próximos Passos

### Imediato (Hoje)
1. ✅ Time de Produto revisa e aprova novo escopo
2. ✅ Time Técnico revisa stack e arquitetura
3. ✅ Squad de Agents lê VISAO_FINAL_CONSOLIDADA.md

### Após Aprovação
1. ✅ Criar branch `feat/fase1-ai-context-generator`
2. ✅ Sprint 1 Planning (Orchestrator Agent distribui cards)
3. ✅ Daily standups (15 min/dia)
4. ✅ Sprint Review ao final de cada semana

### Após Fase 1 Completa (4 semanas)
1. ✅ Transição para **Fase 2: Specification Generation**
2. ✅ LLM lê `context_inputs.processed_data` e gera especificação
3. ✅ Usuário itera com IA até aprovar especificação

---

## 📚 Documentos Relacionados

### ⭐⭐⭐ Essenciais
- **[VISAO_FINAL_CONSOLIDADA.md](../../architecture/VISAO_FINAL_CONSOLIDADA.md)** - Arquitetura master (1000+ linhas)
- **[PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md](PLANEJAMENTO_SPRINTS_FASE_1_REVISADO.md)** - Novo planejamento de sprints

### Complementares
- **[06_squad_agents.md](06_squad_agents.md)** - Composição da squad (8 agents)
- **[stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)** - Stack por fase
- **[CLAUDE.md](../../../CLAUDE.md)** - Guia de implementação master

### A Revisar (Próxima Etapa)
- **[01_especificacoes.md](01_especificacoes.md)** - ⚠️ AINDA descreve abordagem antiga (Foundation)
- **[07_mocks_ui_navegacao.md](07_mocks_ui_navegacao.md)** - ⚠️ AINDA descreve UI antiga (15 telas)

**Nota**: Estes dois documentos serão revisados após aprovação do novo planejamento de sprints.

---

## 📝 Notas Técnicas

### Stack Tecnológico (Confirmado)

**Backend**:
- Go 1.21+ (Gin v1.10.0)
- PostgreSQL 15+ (JSONB + pgvector para futuro RAG)
- Redis (task queue - opcional Sprint 3)

**Frontend**:
- Next.js 14+ (App Router)
- React 18+
- shadcn/ui (componentes)
- Tailwind CSS

**AI Services**:
- Python 3.11+
- FastAPI v0.110+
- PyMuPDF v1.23+ (PDF parsing)
- Anthropic Claude Vision API (diagram analysis)

**DevOps**:
- Docker + Docker Compose
- GitHub Actions (CI/CD)

### Decisões Arquiteturais (ADRs)

**ADR-001: Por que separar AI Services em Python?**
- **Contexto**: Backend principal é Go, mas AI/ML ecosystem é Python-centric
- **Decisão**: Microservices Python (pdf-parser, vision-api) chamados via HTTP
- **Consequências**: +Flexibilidade, +Ecossistema ML, -Complexidade operacional

**ADR-002: Por que background jobs?**
- **Contexto**: Processamento de PDFs/imagens pode levar minutos
- **Decisão**: Task queue com retry + polling de status
- **Consequências**: +UX (não trava), +Confiabilidade (retry), -Complexidade

**ADR-003: Por que Anthropic Claude Vision?**
- **Contexto**: Precisa analisar diagramas complexos (Mermaid, Whimsical, fluxogramas)
- **Decisão**: Claude 3.5 Sonnet (Vision API)
- **Alternativas consideradas**: GPT-4 Vision, open-source (LLaVA)
- **Consequências**: +Qualidade, +Português, -Custo por request

---

**Status**: 🟢 Planejamento completo e pronto para aprovação
**Aguardando**: Aprovação do Time de Produto + Time Técnico
**Próxima ação**: Sprint 1 Planning (após aprovação)
