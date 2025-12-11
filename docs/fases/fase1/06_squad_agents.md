# Squad de Agents - Fase 1: Foundation

**Versão**: 1.0.0
**Data**: 2025-12-11
**Status**: 🟡 Planejamento

---

## Visão Geral

A Fase 1 será executada por uma **squad multi-agent** especializada, onde cada agent tem responsabilidades claras e trabalha de forma autônoma (com orquestração humana).

## Princípios da Squad

1. **Especialização**: Cada agent domina seu domínio
2. **Autonomia**: Agents tomam decisões técnicas dentro de seu escopo
3. **Comunicação**: Agents documentam decisões e interfaces
4. **Qualidade**: Code reviews cruzados entre agents
5. **Iteração**: Sprints semanais com entregas incrementais

---

## Composição da Squad

### 1. Backend Architect Agent
**Tipo**: `backend-architect`
**Responsabilidades**:
- Design da API REST (15 endpoints)
- Arquitetura do repositório (repository pattern)
- Schema PostgreSQL (4 tabelas + índices)
- Validação de JSON Schema
- FSM engine

**Ferramentas**:
- Go 1.21+
- Gin framework
- gojsonschema
- PostgreSQL (lib/pq)

**Entregas**:
- `backend/internal/handlers/` (HTTP handlers)
- `backend/internal/database/` (repositories)
- `backend/internal/models/` (structs)
- `backend/database/migrations/` (SQL)

**Sprints**:
- Sprint 1-2: Database + API básica
- Sprint 7-8: Relacionamentos + validações

---

### 2. Frontend Developer Agent
**Tipo**: `frontend-developer`
**Responsabilidades**:
- Dynamic UI Generation (componentes genéricos)
- Widget library (10 widgets)
- Validação client-side
- Relationship picker
- FSM visualizer

**Ferramentas**:
- Next.js 14 (App Router)
- React 18+
- shadcn/ui + Radix UI
- Tailwind CSS
- React Hook Form + Zod

**Entregas**:
- `frontend/components/dynamic-ui/` (core components)
- `frontend/components/widgets/` (widget library)
- `frontend/lib/validators/` (validações)
- `frontend/app/` (páginas)

**Sprints**:
- Sprint 5-6: Dynamic UI + widgets
- Sprint 7-8: Relationship picker + grafo

---

### 3. AI Engineer Agent
**Tipo**: `ai-engineer`
**Responsabilidades**:
- Assistente de criação (NL → object_definition)
- Integração com LLM (Claude/GPT)
- RAG trimodal (SQL + Graph + Vector)
- Extração de entidades (NLP)
- Query builder dinâmico

**Ferramentas**:
- Python 3.11+
- OpenAI API / Anthropic API
- LangChain (optional)
- spaCy (NLP)
- pgvector (embeddings)

**Entregas**:
- `ai-services/assistant/` (NL assistant)
- `ai-services/rag/` (RAG pipeline)
- `ai-services/nlp/` (entity extraction)

**Sprints**:
- Sprint 3-4: Assistente de criação
- Sprint 11-12: RAG trimodal

---

### 4. Database Architect Agent
**Tipo**: `database-architect`
**Responsabilidades**:
- Schema design otimizado
- Índices GIN/BTREE
- Migrations versionadas
- Seed data (validation_rules)
- Performance tuning

**Ferramentas**:
- PostgreSQL 15+
- JSONB
- pgvector (embeddings)
- Migration tools

**Entregas**:
- `backend/database/migrations/` (schema SQL)
- `backend/database/seeds/` (data inicial)
- Documentação de índices

**Sprints**:
- Sprint 1-2: Schema inicial
- Sprint 7-8: Otimizações

---

### 5. TDD Orchestrator Agent
**Tipo**: `tdd-orchestrator`
**Responsabilidades**:
- Testes unitários (backend + frontend)
- Testes de integração (API)
- Testes E2E (cenário crítico)
- Coverage reports (>80%)
- CI/CD pipelines

**Ferramentas**:
- Backend: Go testing
- Frontend: Vitest + Testing Library
- E2E: Playwright
- GitHub Actions

**Entregas**:
- `backend/internal/*/tests/` (unit tests)
- `backend/tests/integration/` (API tests)
- `frontend/__tests__/` (component tests)
- `.github/workflows/` (CI/CD)

**Sprints**:
- Todas as sprints (TDD contínuo)

---

### 6. DevOps Agent
**Tipo**: `devops-troubleshooter`
**Responsabilidades**:
- Docker Compose setup
- Environment management
- Logs e monitoring básico
- Troubleshooting de infraestrutura
- Scripts de deploy

**Ferramentas**:
- Docker + Docker Compose
- Bash scripts
- PostgreSQL management
- Git workflows

**Entregas**:
- `docker-compose.yml`
- `scripts/` (setup, deploy)
- `.env.example`
- Documentação de setup

**Sprints**:
- Sprint 1-2: Setup inicial
- Suporte contínuo

---

### 7. Code Reviewer Agent
**Tipo**: `code-reviewer`
**Responsabilidades**:
- Code reviews de todos os PRs
- Validação de padrões arquiteturais
- Detecção de code smells
- Validação de testes
- Documentação de decisões

**Ferramentas**:
- GitHub PR reviews
- Static analysis (golangci-lint, ESLint)
- Code quality metrics

**Entregas**:
- PR comments e aprovações
- Documentação de patterns

**Sprints**:
- Todas as sprints (reviews contínuos)

---

### 8. Documentation Agent
**Tipo**: `docs-architect`
**Responsabilidades**:
- API documentation (OpenAPI)
- Guias de uso
- Diagramas de arquitetura
- ADRs (Architecture Decision Records)
- READMEs

**Ferramentas**:
- Markdown
- Mermaid (diagramas)
- OpenAPI 3.1

**Entregas**:
- `docs/api/` (API docs)
- `docs/guides/` (user guides)
- `docs/adrs/` (decisões)
- READMEs atualizados

**Sprints**:
- Todas as sprints (docs contínuos)

---

## Fluxo de Trabalho

### Sprint Planning (Segunda-feira)
1. **Product Owner** define stories da semana
2. Cada **agent** estima suas tasks
3. **TDD Orchestrator** define acceptance tests
4. **Backend** e **Frontend** alinham contratos de API

### Daily Development (Terça-Sexta)
1. Agents trabalham de forma autônoma
2. **Code Reviewer** faz reviews diários
3. **DevOps** resolve bloqueios de infra
4. **Documentation** atualiza docs em paralelo

### Sprint Review (Sexta-feira)
1. Demo das entregas
2. **TDD Orchestrator** roda suite completa
3. Retrospectiva da squad
4. Planning da próxima sprint

---

## Comunicação Entre Agents

### Contratos de Interface

**Backend ↔ Frontend**:
```typescript
// Contrato definido no planning
interface ObjectDefinition {
  id: string;
  name: string;
  schema: JSONSchema7;
  states: FSMDefinition;
  ui_hints: UIHints;
}
```

**Backend ↔ AI Services**:
```go
// API REST para RAG
POST /api/v1/rag/query
{
  "question": "Quantos clientes ativos?",
  "context": {...}
}
```

**Frontend ↔ AI Services**:
```typescript
// WebSocket para assistente
ws://localhost:8081/assistant
{
  "type": "user_answer",
  "question_id": 3,
  "answer": "Cliente Pessoa Física"
}
```

---

## Métricas de Sucesso da Squad

### Performance Individual
- **Backend**: APIs < 200ms p99
- **Frontend**: Renderização < 100ms
- **AI**: LLM responses < 3s
- **Database**: Queries < 50ms
- **Tests**: Coverage > 80%

### Performance da Squad
- ✅ Zero bloqueios críticos (> 1 dia)
- ✅ 100% das stories entregues no sprint
- ✅ Code reviews < 4h turnaround
- ✅ Zero bugs críticos em produção

---

## Escalação da Squad

### Fase 2 (Brain)
Adicionar:
- **ML Engineer Agent** (document parsing)
- **Data Scientist Agent** (embeddings otimizados)

### Fase 3 (Autonomy)
Adicionar:
- **Kubernetes Architect Agent**
- **Observability Engineer Agent**

### Fase 4 (Production)
Adicionar:
- **Security Auditor Agent**
- **Performance Engineer Agent**

---

## Referências

- [Especificações Fase 1](01_especificacoes.md)
- [Planejamento de Sprints](04_planejamento_sprints.md)
- [Visão de Arquitetura](../../architecture/visao_arquitetura.md)

---

**Próximo Passo**: Aprovação das especificações → Iniciar Sprint 1
