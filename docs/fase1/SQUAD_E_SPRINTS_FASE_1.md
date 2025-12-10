# Squad e Sprints - Fase 1: Fundação do SuperCore

**Período**: Semanas 1-12 (3 meses)
**Objetivo**: Estabelecer a fundação técnica completa do SuperCore com Oracle, Backend, Frontend básico e RAG inicial

---

## 👥 Composição da Squad

### Squad Core (5 pessoas)

#### 1. **Tech Lead / Arquiteto** (1 pessoa)
**Responsabilidades**:
- Definir e manter a arquitetura geral
- Garantir alinhamento entre backend, frontend e dados
- Code review de mudanças críticas
- Decisões técnicas estratégicas
- Mentoria da equipe

**Perfil Ideal**:
- 8+ anos de experiência
- Forte conhecimento em arquitetura de sistemas distribuídos
- Experiência com Core Banking ou FinTech
- Conhecimento em Go, TypeScript, PostgreSQL

---

#### 2. **Backend Engineer (Go)** (2 pessoas)

**Backend Engineer #1 - Foco em API e Lógica de Negócio**

**Responsabilidades**:
- Implementar handlers REST API
- Desenvolver serviços de validação e state machine
- Integração com Oracle
- Implementar middleware e segurança
- Testes unitários e de integração

**Perfil Ideal**:
- 5+ anos de experiência com Go
- Conhecimento em REST APIs, Gin framework
- Experiência com PostgreSQL e JSONB
- Familiaridade com padrões de validação

**Backend Engineer #2 - Foco em Dados e RAG**

**Responsabilidades**:
- Implementar sistema RAG (SQL + Graph + Vector)
- Integração com Nebula Graph
- Implementar pgvector e embeddings
- Otimização de queries complexas
- Performance e indexação

**Perfil Ideal**:
- 5+ anos de experiência com Go
- Conhecimento profundo em bancos de dados
- Experiência com Graph databases
- Familiaridade com Vector databases e embeddings

---

#### 3. **Frontend Engineer (Next.js + React)** (1 pessoa)

**Responsabilidades**:
- Implementar interface do Natural Language Assistant
- Criar componentes do Backoffice (CRUD de Object Definitions)
- Integração com API backend
- Implementar autenticação e autorização (Keycloak)
- Design responsivo e acessível

**Perfil Ideal**:
- 4+ anos de experiência com React/Next.js
- Conhecimento em shadcn/ui, Tailwind CSS
- Experiência com TypeScript
- Familiaridade com APIs REST

---

#### 4. **DevOps / Platform Engineer** (1 pessoa)

**Responsabilidades**:
- Gerenciar infraestrutura Docker/Kubernetes
- CI/CD pipelines (GitHub Actions)
- Monitoramento e observabilidade
- Gerenciamento de ambientes (dev, staging, prod)
- Backups e disaster recovery

**Perfil Ideal**:
- 4+ anos de experiência com DevOps
- Conhecimento em Docker, Kubernetes
- Experiência com PostgreSQL em produção
- Familiaridade com Grafana, Prometheus

---

### Suporte Especializado (Conforme Necessário)

#### 5. **Product Owner** (20-40% do tempo)
- Definir e priorizar features
- Validar entregas com stakeholders
- Manter backlog atualizado

#### 6. **UX/UI Designer** (20% do tempo)
- Design da interface do Assistant
- Design system e componentes
- Wireframes do Backoffice

---

## 🏃 Sprints da Fase 1 (12 semanas = 6 sprints de 2 semanas)

---

## 📅 Sprint 1 (Semanas 1-2): Setup e Oracle

**Objetivo**: Estabelecer ambiente de desenvolvimento e implementar o Oracle (consciência da plataforma)

### Backend (Go)
- [x] ✅ Setup do repositório e estrutura de pastas
- [x] ✅ Docker Compose com PostgreSQL
- [x] ✅ Migrations iniciais (schema completo)
- [x] ✅ Seed de validation_rules (BACEN)
- [x] ✅ Implementar Oracle API (4 endpoints)
- [x] ✅ Seed do Oracle (identidade_corporativa, licenças, integrações)
- [ ] Testes unitários do Oracle handler

### DevOps
- [x] ✅ Setup Docker Compose
- [ ] Setup GitHub Actions (CI básico)
- [ ] Ambiente de desenvolvimento local documentado

### Documentação
- [x] ✅ CLAUDE.md atualizado
- [x] ✅ README.md com Oracle
- [x] ✅ Documentação do Oracle
- [ ] Guia de contribuição

**Entregáveis**:
- ✅ Backend rodando localmente com Oracle funcional
- ✅ Documentação completa do Oracle
- CI básico funcionando

---

## 📅 Sprint 2 (Semanas 3-4): CRUD Completo + Validação

**Objetivo**: Implementar CRUD completo de Object Definitions e Instances com validação robusta

### Backend (Go)

**Object Definitions**:
- [x] ✅ POST /object-definitions (criar)
- [x] ✅ GET /object-definitions (listar com filtros)
- [x] ✅ GET /object-definitions/:id (buscar)
- [x] ✅ PUT /object-definitions/:id (atualizar com versionamento)
- [x] ✅ DELETE /object-definitions/:id (soft delete)
- [x] ✅ GET /object-definitions/:id/schema (buscar schema)

**Instances**:
- [x] ✅ POST /instances (criar com validação JSON Schema)
- [x] ✅ GET /instances (listar com filtros)
- [x] ✅ GET /instances/:id (buscar)
- [x] ✅ PUT /instances/:id (atualizar)
- [x] ✅ DELETE /instances/:id (soft delete)

**Validation Service**:
- [x] ✅ JSON Schema Draft 7 validator
- [ ] Custom rule executor (framework)
- [ ] Validation error aggregation
- [ ] Unit tests (80%+ coverage)

**State Machine Service**:
- [x] ✅ FSM validator
- [x] ✅ POST /instances/:id/transition
- [x] ✅ GET /instances/:id/history
- [ ] Condition evaluator para transições
- [ ] Unit tests (80%+ coverage)

### DevOps
- [ ] Setup ambiente staging
- [ ] Database backups automáticos
- [ ] Monitoramento básico (health checks)

**Entregáveis**:
- CRUD completo e testado
- Validação JSON Schema funcionando
- State Machine com histórico

---

## 📅 Sprint 3 (Semanas 5-6): Relationships + Frontend Setup

**Objetivo**: Implementar sistema de relacionamentos e iniciar frontend

### Backend (Go)

**Relationships**:
- [x] ✅ POST /relationships (criar)
- [x] ✅ GET /relationships (listar)
- [x] ✅ GET /relationships/:id (buscar)
- [x] ✅ DELETE /relationships/:id (deletar)
- [x] ✅ GET /instances/:id/relationships (buscar por instância)
- [ ] Validação de relacionamentos (types, cardinality)
- [ ] Cascade delete rules
- [ ] Unit tests (80%+ coverage)

### Frontend (Next.js)

**Setup**:
- [ ] Inicializar projeto Next.js 14+
- [ ] Setup shadcn/ui + Tailwind CSS
- [ ] Configurar TypeScript
- [ ] Setup de rotas e layout base
- [ ] Integração com API (client HTTP)

**Autenticação**:
- [ ] Integração com Keycloak
- [ ] Login/Logout via Keycloak OIDC
- [ ] Proteção de rotas com Keycloak adapter
- [ ] User context e roles do Keycloak

**Página Inicial**:
- [ ] Dashboard básico
- [ ] Navegação principal
- [ ] Integração com GET /oracle/whoami (exibir identidade)

### DevOps
- [ ] Deploy frontend em ambiente dev
- [ ] HTTPS/SSL setup
- [ ] CORS configurado

**Entregáveis**:
- Sistema de relacionamentos completo
- Frontend rodando com autenticação
- Dashboard básico exibindo Oracle

---

## 📅 Sprint 4 (Semanas 7-8): Backoffice CRUD + NL Assistant Básico

**Objetivo**: Interface de gerenciamento de Object Definitions e primeiro protótipo do Assistant

### Frontend (Next.js)

**Object Definitions Backoffice**:
- [ ] Página de listagem (table com filtros)
- [ ] Formulário de criação
- [ ] Formulário de edição
- [ ] Visualização de schema JSON
- [ ] Delete com confirmação
- [ ] Paginação e busca

**Instances Backoffice**:
- [ ] Página de listagem (filtros por object_definition_id)
- [ ] Visualização de instância (JSON viewer)
- [ ] State history viewer
- [ ] Botão de transição de estado

**Natural Language Assistant (v0.1 - Stub)**:
- [ ] Interface de chat (UI apenas)
- [ ] Input de mensagem
- [ ] Display de mensagens
- [ ] Integração com POST /assistant/chat (stub)
- [ ] Loading states

### Backend (Go)

**NL Assistant Stubs**:
- [x] ✅ POST /assistant/chat (retorna mock)
- [x] ✅ POST /assistant/generate-object-definition (retorna mock)
- [x] ✅ POST /assistant/refine-schema (retorna mock)

**Entregáveis**:
- Backoffice completo para CRUD visual
- Chat Assistant (UI pronta, backend stub)

---

## 📅 Sprint 5 (Semanas 9-10): RAG Foundation + LLM Integration

**Objetivo**: Implementar sistema RAG básico e integrar LLM real no Assistant

### Backend (Go)

**RAG - SQL Layer**:
- [ ] Query builder para object_definitions
- [ ] Query builder para instances
- [ ] Full-text search usando tsvector
- [ ] Filtros complexos (JSONB queries)

**RAG - Vector Layer (pgvector)**:
- [ ] Setup pgvector extension
- [ ] Embedding generator (usando OpenAI/Claude API)
- [ ] Indexação de object_definitions
- [ ] Indexação de instances
- [ ] Semantic search endpoint
- [ ] GET /rag/search (busca semântica)

**RAG - Graph Layer (Nebula Graph - opcional para Fase 1)**:
- [ ] Setup Nebula Graph em Docker
- [ ] Schema de grafo (Object Definitions, Instances, Relationships)
- [ ] Sincronização automática (trigger-based ou CDC)
- [ ] Graph queries básicas

**NL Assistant (Real)**:
- [ ] Integração com Claude API ou OpenAI
- [ ] POST /assistant/chat (com RAG context)
- [ ] POST /assistant/generate-object-definition (gera JSON Schema)
- [ ] Prompt engineering (system prompts)
- [ ] Token management e rate limiting

### DevOps
- [ ] Setup de secrets management (API keys)
- [ ] Monitoramento de custos de LLM
- [ ] Rate limiting para APIs externas

**Entregáveis**:
- RAG básico funcionando (SQL + Vector)
- Assistant respondendo com contexto real
- Geração de schemas via LLM

---

## 📅 Sprint 6 (Semanas 11-12): Polish, Testes e Preparação Fase 2

**Objetivo**: Refinamento, testes end-to-end, documentação e preparação para Fase 2

### Backend (Go)

**Refinamentos**:
- [ ] Otimização de queries lentas
- [ ] Implementação de caching (Redis - opcional)
- [ ] Audit log completo
- [ ] Error handling robusto
- [ ] API versioning

**Testes**:
- [ ] Integration tests (80%+ coverage)
- [ ] E2E tests com Playwright
- [ ] Load testing (k6 ou similar)
- [ ] Security audit básico

### Frontend (Next.js)

**Refinamentos**:
- [ ] Error boundaries
- [ ] Loading states em todas as páginas
- [ ] Feedback visual de ações
- [ ] Accessibility (WCAG AA)
- [ ] Responsive design (mobile-first)

**Testes**:
- [ ] Component tests (Jest + React Testing Library)
- [ ] E2E tests (Playwright)
- [ ] Visual regression tests (opcional)

### DevOps

**Produção-Ready**:
- [ ] Environment variables management
- [ ] Database migration strategy
- [ ] Rollback procedures
- [ ] Monitoring e alerting (Grafana + Prometheus)
- [ ] Backup e restore testados
- [ ] Disaster recovery plan

**CI/CD**:
- [ ] Pipeline completo (build, test, deploy)
- [ ] Automated migrations
- [ ] Blue-green deployment (opcional)
- [ ] Smoke tests pós-deploy

### Documentação

**Para Desenvolvedores**:
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Architecture Decision Records (ADRs)
- [ ] Runbooks para operações comuns
- [ ] Troubleshooting guide

**Para Usuários**:
- [ ] User manual do Backoffice
- [ ] Tutorial do Natural Language Assistant
- [ ] FAQ

**Entregáveis**:
- Sistema completo da Fase 1 em produção
- Documentação completa
- Plano detalhado da Fase 2

---

## 📊 Métricas de Sucesso da Fase 1

### Técnicas
- [ ] 80%+ code coverage (backend)
- [ ] 60%+ code coverage (frontend)
- [ ] API response time < 200ms (p95)
- [ ] Zero critical security vulnerabilities
- [ ] Uptime > 99.5%

### Funcionais
- [ ] Oracle API retorna identidade corretamente
- [ ] CRUD completo de Object Definitions funcional
- [ ] CRUD completo de Instances funcional
- [ ] State Machine com transições validadas
- [ ] Relationships criados e consultados
- [ ] RAG retorna contexto relevante
- [ ] NL Assistant gera schemas válidos

### Negócio
- [ ] Time de Produto consegue criar um Object Definition via UI
- [ ] Time de Produto consegue criar Instances via UI
- [ ] Assistant consegue responder perguntas sobre o sistema
- [ ] Assistant consegue gerar um schema de conta corrente

---

## 🎯 Definition of Done (DoD) por Sprint

Para considerar uma sprint **COMPLETA**, todos os itens devem ser atendidos:

### Código
- [ ] Code review aprovado por pelo menos 1 pessoa
- [ ] Testes unitários escritos e passando
- [ ] Sem bugs críticos conhecidos
- [ ] Segue padrões de código do projeto

### Testes
- [ ] Testes de integração passando (quando aplicável)
- [ ] Testado manualmente em ambiente de dev
- [ ] Edge cases considerados

### Documentação
- [ ] README atualizado (se necessário)
- [ ] API documentation atualizada (se aplicável)
- [ ] Comentários em código complexo

### Deploy
- [ ] Deploy em ambiente de dev bem-sucedido
- [ ] Smoke tests passando
- [ ] Rollback testado (para features críticas)

---

## 🚨 Riscos e Mitigações

### Risco 1: Complexidade do RAG
**Probabilidade**: Alta
**Impacto**: Alto
**Mitigação**: Começar com RAG simplificado (SQL + Vector apenas), deixar Graph para Fase 2 se necessário

### Risco 2: Integração com LLMs (custos e latência)
**Probabilidade**: Média
**Impacto**: Médio
**Mitigação**: Implementar caching agressivo, rate limiting, e considerar modelos open-source auto-hospedados

### Risco 3: Falta de pessoas especializadas
**Probabilidade**: Média
**Impacto**: Alto
**Mitigação**: Contratar com antecedência, permitir ramp-up de 2 semanas, ter documentação clara

### Risco 4: Scope creep
**Probabilidade**: Alta
**Impacto**: Médio
**Mitigação**: Product Owner ativo, sprints bem definidas, revisões de backlog semanais

---

## 📝 Cerimônias Ágeis

### Daily Standup (15 min)
- Todos os dias, 9h30
- O que fiz ontem, o que farei hoje, impedimentos

### Sprint Planning (4h)
- Início de cada sprint
- Definir objetivos, quebrar tarefas, estimar

### Sprint Review (2h)
- Final de cada sprint
- Demo para stakeholders, feedback

### Sprint Retrospective (1.5h)
- Final de cada sprint
- O que funcionou, o que melhorar, ações

### Backlog Refinement (2h/semana)
- Meio da sprint
- Preparar próximas sprints, estimar

---

## 🎓 Onboarding de Novos Membros

### Semana 1: Contexto e Setup
- Leitura de toda documentação (CLAUDE.md, README, Oracle)
- Setup do ambiente local
- Rodando testes
- Primeiro commit (fix de documentação ou teste simples)

### Semana 2: Primeira Feature
- Pair programming com membro sênior
- Feature pequena e bem definida
- Code review detalhado

### Semana 3+: Autonomia Crescente
- Features de complexidade crescente
- Participação em decisões de design
- Code reviews para outros

---

## 📞 Comunicação

### Ferramentas
- **Slack**: Comunicação diária, canais por squad/projeto
- **GitHub**: Code reviews, issues, project board
- **Notion/Confluence**: Documentação, ADRs, runbooks
- **Zoom/Meet**: Reuniões síncronas

### Canais Slack Sugeridos
- `#supercore-geral`: Anúncios e discussões gerais
- `#supercore-backend`: Discussões técnicas de backend
- `#supercore-frontend`: Discussões técnicas de frontend
- `#supercore-devops`: Infra e deploys
- `#supercore-alerts`: Alertas de produção

---

## 🎉 Critérios de Aceitação da Fase 1

A Fase 1 está **COMPLETA** quando:

1. ✅ Oracle API funcional e documentado
2. ✅ CRUD completo de Object Definitions via API e UI
3. ✅ CRUD completo de Instances via API e UI
4. ✅ State Machine com transições e histórico
5. ✅ Sistema de Relationships funcionando
6. ✅ RAG básico (SQL + Vector) retornando contexto
7. ✅ Natural Language Assistant gerando schemas
8. ✅ Backoffice completo e usável
9. ✅ Autenticação funcionando
10. ✅ Testes automatizados com 80%+ coverage (backend)
11. ✅ Sistema rodando em produção com uptime > 99%
12. ✅ Documentação completa para desenvolvedores e usuários

---

**Status Atual**: Sprint 1 parcialmente completa (Oracle implementado ✅)
**Próximo Passo**: Completar Sprint 1 (testes + CI) e iniciar Sprint 2

*Última Atualização: 9 de Dezembro de 2024*
