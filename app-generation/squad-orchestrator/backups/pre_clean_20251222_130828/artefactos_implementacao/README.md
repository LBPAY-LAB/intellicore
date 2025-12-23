# 📦 Artefactos de Implementação

Este diretório contém **todos os outputs gerados pelas squads** durante o desenvolvimento do SuperCore v2.0.

---

## 📂 Estrutura de Diretórios

```
artefactos_implementacao/
├── produto/             ← Squad Produto
├── arquitetura/         ← Squad Arquitetura
├── engenharia/          ← Squad Engenharia
│   ├── frontend/        ← Sub-squad Frontend
│   └── backend/         ← Sub-squad Backend
├── qa/                  ← Squad QA
└── deploy/              ← Squad Deploy
```

---

## 📋 Squad Produto

**Localização**: `produto/`

**Responsável**: product-owner, business-analyst, ux-designer

**Conteúdo**:
- Cards de features (baseados em RF001-RF062)
- User stories decompostas
- Backlog priorizado
- Critérios de aceitação (funcionais + UX/usabilidade)
- Product requirements documents (PRDs)
- **UX Designs**:
  - Wireframes detalhados (back-office + front-office)
  - User flows completos (Mermaid diagrams)
  - Design system (tokens, componentes, patterns)
  - Protótipos interativos

**Formato Sugerido**:
```
produto/
├── cards/
│   ├── CARD-001-oraculo-knowledge-base.md
│   ├── CARD-002-object-definitions.md
│   └── ...
├── user-stories/
│   ├── US-001-criar-oraculo.md
│   └── ...
├── ux-designs/                              ← NOVO: UX Designer outputs
│   ├── wireframes/
│   │   ├── WIREFRAME-001-dashboard-oraculos.md
│   │   ├── WIREFRAME-002-criar-oraculo-wizard.md
│   │   ├── WIREFRAME-003-object-definitions-list.md
│   │   ├── WIREFRAME-004-agentes-ia-config.md
│   │   └── ...
│   ├── user-flows/
│   │   ├── FLOW-001-criar-oraculo-completo.mmd
│   │   ├── FLOW-002-definir-objeto-via-ia.mmd
│   │   ├── FLOW-003-configurar-agente.mmd
│   │   └── ...
│   ├── design-system/
│   │   ├── tokens.json                      (cores, tipografia, espaçamento)
│   │   ├── components.md                    (biblioteca de componentes)
│   │   ├── patterns.md                      (patterns de interação)
│   │   └── accessibility.md                 (WCAG 2.1 AA guidelines)
│   └── prototypes/
│       └── links-figma.md                   (links para protótipos interativos)
├── backlog.md
└── acceptance-criteria.md
```

**Portais a Desenhar** (UX Designer):
- **Back-office**: Admin do SuperCore
  - Dashboard principal
  - Gestão de Oráculos (criar, editar, configurar)
  - Gestão de Object Definitions
  - Gestão de Agentes IA (CrewAI)
  - Gestão de Workflows (LangFlow visual editor)
  - Gestão de MCPs
  - Configurações e permissões
  - Monitoring e Analytics
- **Front-office**: Interfaces geradas dinamicamente
  - Formulários dinâmicos baseados em Object Definitions
  - Chat com Agentes IA
  - Visualização de workflows em execução
  - Self-service features

---

## 🏗️ Squad Arquitetura

**Localização**: `arquitetura/`

**Responsável**: tech-lead, solution-architect, security-architect

**Conteúdo**:
- Designs técnicos detalhados
- ADRs (Architecture Decision Records)
- Diagramas (Mermaid, C4, UML)
- Definições de APIs (OpenAPI/Swagger)
- Contratos entre componentes
- Database schemas

**Formato Sugerido**:
```
arquitetura/
├── designs/
│   ├── oraculo-api-design.md
│   ├── object-definitions-schema.md
│   └── ...
├── adrs/
│   ├── ADR-001-escolha-postgresql.md
│   ├── ADR-002-fastapi-vs-gin.md
│   └── ...
├── diagramas/
│   ├── c4-context.mmd
│   ├── c4-container.mmd
│   └── database-erd.mmd
└── api-specs/
    ├── oraculo-api.yaml
    └── ...
```

---

## ⚙️ Squad Engenharia - Frontend

**Localização**: `engenharia/frontend/`

**Responsável**: frontend-lead, react-developer, ui-ux-designer

**Conteúdo**:
- Documentação de componentes React
- Design system (se customizado)
- Storybook stories
- Guias de estilo
- Notas de implementação

**Formato Sugerido**:
```
engenharia/frontend/
├── components/
│   ├── OracleSelector.md
│   ├── ObjectDefinitionForm.md
│   └── ...
├── pages/
│   ├── OracleManagement.md
│   └── ...
├── design-system/
│   └── tokens.json
└── implementation-notes.md
```

**Nota**: Código React real fica em `/frontend/` (raiz do projeto)

---

## ⚙️ Squad Engenharia - Backend

**Localização**: `engenharia/backend/`

**Responsável**: backend-lead, golang-developer, python-developer, database-specialist

**Conteúdo**:
- Documentação de APIs
- Database migration notes
- Integrações com serviços externos
- Performance considerations
- Security notes

**Formato Sugerido**:
```
engenharia/backend/
├── api-docs/
│   ├── oraculo-endpoints.md
│   ├── objects-endpoints.md
│   └── ...
├── migrations/
│   ├── MIGRATION-001-initial-schema.md
│   └── ...
├── integrations/
│   ├── langflow-integration.md
│   └── ...
└── performance-notes.md
```

**Nota**: Código Go/Python real fica em `/backend/` (raiz do projeto)

---

## 🧪 Squad QA

**Localização**: `qa/`

**Responsável**: qa-lead, test-engineer, security-auditor

**Conteúdo**:
- Planos de teste
- Casos de teste (unit, integration, E2E)
- Test reports
- Bug reports
- Security scan results
- Performance test results
- Coverage reports

**Formato Sugerido**:
```
qa/
├── test-plans/
│   ├── oraculo-test-plan.md
│   └── ...
├── test-cases/
│   ├── TC-001-criar-oraculo.md
│   └── ...
├── bug-reports/
│   ├── BUG-001-oraculo-validation-error.md
│   └── ...
├── security-scans/
│   ├── trivy-report-2024-12-21.md
│   └── ...
├── performance/
│   ├── load-test-results.md
│   └── ...
└── coverage-reports/
    └── coverage-summary.md
```

---

## 🚀 Squad Deploy

**Localização**: `deploy/`

**Responsável**: deploy-lead

**Conteúdo**:
- Runbooks operacionais
- Deployment guides
- Rollback procedures
- Monitoring setup docs
- Infrastructure diagrams
- Cost analysis

**Formato Sugerido**:
```
deploy/
├── runbooks/
│   ├── deploy-to-qa.md
│   ├── deploy-to-staging.md
│   ├── deploy-to-production.md
│   └── rollback-procedure.md
├── monitoring/
│   ├── cloudwatch-setup.md
│   ├── alerts-configuration.md
│   └── dashboard-setup.md
├── infrastructure/
│   ├── aws-architecture.md
│   └── cost-analysis.md
└── deployment-history.md
```

**Nota**: Código Terraform real fica em `/infrastructure/` (raiz do projeto)

---

## 📝 Convenções de Nomenclatura

### Arquivos Markdown:
- **Cards**: `CARD-{número}-{título-kebab-case}.md`
- **User Stories**: `US-{número}-{título}.md`
- **ADRs**: `ADR-{número}-{decisão}.md`
- **Test Cases**: `TC-{número}-{cenário}.md`
- **Bugs**: `BUG-{número}-{descrição}.md`

### Estrutura de Arquivo:
Todos os documentos devem ter:
1. **Título** (H1)
2. **Metadados** (Data, Autor, Status, Squad)
3. **Contexto/Background**
4. **Conteúdo Principal**
5. **Referências** (links para docs base, outros artefactos)

**Exemplo**:
```markdown
# CARD-001 - Oráculo Knowledge Base

**Data**: 2024-12-21
**Autor**: Squad Produto (product-owner)
**Status**: Em Análise
**Requisito Base**: RF001, RF002, RF003

## Contexto
(Baseado em requisitos_funcionais_v2.0.md)

## Descrição
...

## Critérios de Aceitação
- [ ] ...

## Referências
- [RF001](../Supercore_v2.0/DOCUMENTACAO_BASE/requisitos_funcionais_v2.0.md#rf001)
- [Arquitetura Camada 1](../Supercore_v2.0/DOCUMENTACAO_BASE/arquitetura_supercore_v2.0.md#camada-1)
```

---

## 🔗 Relação com Documentação Base

**Documentação Base** (READ-ONLY):
- `Supercore_v2.0/DOCUMENTACAO_BASE/requisitos_funcionais_v2.0.md`
- `Supercore_v2.0/DOCUMENTACAO_BASE/arquitetura_supercore_v2.0.md`
- `Supercore_v2.0/DOCUMENTACAO_BASE/stack_supercore_v2.0.md`

**Artefactos de Implementação** (WRITE):
- Baseiam-se na documentação base
- **NÃO** modificam a documentação base
- Referenciam a documentação base
- Adicionam detalhes específicos de implementação

---

## 📊 Fluxo de Artefactos

```
Documentação Base (READ-ONLY)
        ↓
Squad Produto (produto/)
        ↓
Squad Arquitetura (arquitetura/)
        ↓
Squad Engenharia (engenharia/frontend/ + engenharia/backend/)
        ↓
Squad QA (qa/)
        ↓
Squad Deploy (deploy/)
```

Cada squad:
1. **Lê** artefactos da squad anterior
2. **Lê** documentação base relevante
3. **Escreve** seus próprios artefactos
4. **Referencia** fontes (docs base + artefactos anteriores)

---

## ✅ Checklist por Squad

### Squad Produto:
- [ ] Card criado em `produto/cards/`
- [ ] User stories em `produto/user-stories/`
- [ ] Backlog atualizado
- [ ] Referências a RF001-RF062

### Squad Arquitetura:
- [ ] Design técnico em `arquitetura/designs/`
- [ ] ADR criado se decisão importante
- [ ] Diagramas em `arquitetura/diagramas/`
- [ ] API spec em `arquitetura/api-specs/`
- [ ] CLAUDE.md atualizado se necessário

### Squad Engenharia:
- [ ] Docs em `engenharia/frontend/` ou `engenharia/backend/`
- [ ] Código implementado em `/frontend/` ou `/backend/`
- [ ] Testes escritos
- [ ] README atualizado

### Squad QA:
- [ ] Test plan em `qa/test-plans/`
- [ ] Test cases em `qa/test-cases/`
- [ ] Testes executados
- [ ] Reports em `qa/`
- [ ] Aprovação/Rejeição documentada

### Squad Deploy:
- [ ] Runbook em `deploy/runbooks/`
- [ ] Terraform em `/infrastructure/`
- [ ] CI/CD em `/.github/workflows/`
- [ ] Deployment history atualizado

---

## 🔐 Permissões

Conforme definido em `CLAUDE.md` e `meta-squad-config.json`:

- **Squad Produto**: WRITE em `produto/`, READ em docs base
- **Squad Arquitetura**: WRITE em `arquitetura/` + `CLAUDE.md`, READ em `produto/` + docs base
- **Squad Engenharia**: WRITE em `engenharia/` + código, READ em `arquitetura/` + docs base
- **Squad QA**: WRITE em `qa/`, READ em tudo
- **Squad Deploy**: WRITE em `deploy/` + infra, READ em `qa/` + docs base

---

## 📞 Dúvidas?

Consulte:
1. **CLAUDE.md** (raiz do projeto)
2. **Documentação Base** (`Supercore_v2.0/DOCUMENTACAO_BASE/`)
3. **Meta-Squad Config** (`scripts/squad-orchestrator/meta-squad-config.json`)

---

**Mantido por**: Todas as Squads
**Última Atualização**: 2024-12-21
