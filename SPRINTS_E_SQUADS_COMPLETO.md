# SuperCore - Sprints e Squads Completo (6 Fases)

> **Visão Revisada**: Sistema redesenhado SEM autenticação de terceiros (Keycloak/Logto/Cerbos). JWT + RBAC nativo implementado como object_definitions.

---

## 📊 Visão Geral das Fases

| Fase | Duração | Sprints | Objetivo Principal | Status |
|------|---------|---------|-------------------|--------|
| **Fase 1: Foundation** | 12 semanas | 6 sprints | Engine de Objetos + RAG | ✅ Implementado (precisa limpeza) |
| **Fase 2: Brain** | 12 semanas | 6 sprints | Architect Agent (PDF→Schema) | 📝 Especificado |
| **Fase 3: BackOffice** | 10 semanas | 5 sprints | 11 módulos operacionais | 📋 A implementar |
| **Fase 4: Client Portal** | 12 semanas | 6 sprints | 11 módulos cliente + mobile | 📋 A implementar |
| **Fase 5: Autonomy** | 12 semanas | 6 sprints | Descoberta + Auto-Deploy | 📋 A implementar |
| **Fase 6: Production** | 12 semanas | 6 sprints | BACEN real + 10k clientes | 📋 A implementar |

**Total**: 70 semanas (~17 meses)

---

## 🎯 FASE 1: FOUNDATION (12 semanas - REFATORAÇÃO)

### Objetivo Revisado
Reimplementar o core do SuperCore SEM dependências de autenticação externa. Foco 100% no engine genérico de objetos.

### Squad Fase 1

| Papel | Responsabilidade | Agent Principal |
|-------|------------------|-----------------|
| **Backend Lead** | API Go, PostgreSQL, Redis, NebulaGraph | `backend-architect`, `golang-pro` |
| **Database Architect** | Schema design, migrations, indexing | `database-architect`, `sql-pro` |
| **Frontend Lead** | Next.js 14, Dynamic UI, shadcn/ui | `frontend-developer`, `typescript-pro` |
| **RAG Engineer** | Vector search, embeddings, pgvector | `ai-engineer`, `python-pro` |
| **DevOps** | Docker, CI/CD, monitoring | `deployment-engineer`, `kubernetes-architect` |
| **QA Automation** | E2E tests, integration tests | `test-automator`, `playwright` |

**Total**: 6 pessoas

---

### Sprint 1 (Semanas 1-2): Database + API Core

**Objetivos**:
- ✅ PostgreSQL schema (4 tabelas principais)
- ✅ API CRUD para object_definitions
- ✅ API CRUD para instances
- ✅ API CRUD para relationships
- ✅ Validation engine básico
- ❌ REMOVER: Toda infraestrutura Keycloak/Logto

**Entregas**:
```
backend/
├── database/migrations/
│   ├── 001_create_object_definitions.sql
│   ├── 002_create_instances.sql
│   ├── 003_create_relationships.sql
│   └── 004_create_validation_rules.sql
├── internal/handlers/
│   ├── object_definition.go (CRUD genérico)
│   ├── instance.go (CRUD genérico)
│   └── relationship.go (CRUD genérico)
└── internal/services/
    └── validator/validator.go (5 tipos de regras)
```

**Testes Críticos**:
```bash
# Criar object_definition via API
curl POST /api/v1/object-definitions -d '{
  "name": "cliente_pf",
  "schema": {"type": "object", "properties": {...}}
}'

# Criar instance com validação automática
curl POST /api/v1/instances -d '{
  "object_definition_id": "uuid-123",
  "data": {"cpf": "12345678901", "nome": "Maria Silva"}
}'

# Deve falhar: CPF inválido
curl POST /api/v1/instances -d '{
  "data": {"cpf": "123"}  # ❌ Regex validation fail
}'
```

**Agents Autônomos**:
- `backend-architect`: Desenha API RESTful
- `database-architect`: Otimiza índices GIN para JSONB
- `golang-pro`: Implementa handlers genéricos
- `test-automator`: Gera testes de integração

---

### Sprint 2 (Semanas 3-4): FSM Engine + State Transitions

**Objetivos**:
- ✅ FSM definition em object_definitions.states (JSON)
- ✅ State transition API com validação
- ✅ State history tracking
- ✅ Condition evaluator (CEL expressions)

**Entregas**:
```
backend/internal/services/statemachine/
├── fsm_engine.go          # Valida transições
├── condition_evaluator.go # CEL expressions
└── state_history.go       # Auditoria de mudanças

# Exemplo de FSM
{
  "states": {
    "initial": "CADASTRO_PENDENTE",
    "states": ["CADASTRO_PENDENTE", "ATIVO", "BLOQUEADO"],
    "transitions": [
      {
        "from": "CADASTRO_PENDENTE",
        "to": "ATIVO",
        "trigger": "aprovar_cadastro",
        "condition": "data.kyc_status == 'APROVADO'"
      }
    ]
  }
}
```

**API**:
```bash
POST /api/v1/instances/{id}/transition
{
  "to_state": "ATIVO",
  "trigger": "aprovar_cadastro",
  "metadata": {"aprovado_por": "user-123"}
}
```

**Agents Autônomos**:
- `backend-architect`: Design FSM engine
- `golang-pro`: Implementa CEL evaluator
- `security-auditor`: Valida que transições respeitam condições

---

### Sprint 3 (Semanas 5-6): Natural Language Assistant

**Objetivos**:
- ✅ Conversa estruturada (7 perguntas)
- ✅ LLM gera JSON Schema automaticamente
- ✅ Preview antes de criar object_definition
- ✅ UI hints gerados automaticamente

**Entregas**:
```
frontend/app/assistant/
├── page.tsx                    # Fluxo conversacional
├── components/
│   ├── ConversationStep.tsx    # Cada pergunta
│   ├── SchemaPreview.tsx       # Preview do schema gerado
│   └── UIHintEditor.tsx        # Ajustar widgets

backend/internal/services/assistant/
├── nl_processor.go             # Processa respostas NL
├── schema_generator.go         # LLM gera JSON Schema
└── ui_hints_generator.go       # Infere widgets dos tipos
```

**Fluxo Completo**:
```
1. "Qual o nome do objeto?"
   → "Cliente Pessoa Física"

2. "Descreva o que é esse objeto"
   → "Uma pessoa que vai abrir conta no banco"

3. "Quais campos coletar?"
   → "CPF, Nome, Email, Telefone, Endereço"

4. "Validações especiais?"
   → [X] CPF  [X] Email  [X] Telefone

5. "Estados possíveis?"
   → "Pendente, Ativo, Bloqueado"

6. "Relacionamentos?"
   → "Cliente TITULAR_DE Conta"

7. Preview do JSON Schema gerado
   → [Aprovar] [Editar] [Cancelar]
```

**Agents Autônomos**:
- `frontend-developer`: Implementa wizard UI
- `ai-engineer`: Integra LLM para schema generation
- `prompt-engineer`: Otimiza prompts para precisão

---

### Sprint 4 (Semanas 7-8): Dynamic UI Generation

**Objetivos**:
- ✅ Form renderer 100% genérico
- ✅ 10 widgets principais
- ✅ Validação client-side (JSON Schema)
- ✅ RelationshipPicker

**Entregas**:
```
frontend/components/dynamic-ui/
├── DynamicInstanceForm.tsx     # Renderiza qualquer objeto
├── FieldRenderer.tsx           # Switch por tipo de campo
├── widgets/
│   ├── TextInput.tsx
│   ├── CPFInput.tsx            # Máscara + validação
│   ├── CurrencyInput.tsx       # R$ formatting
│   ├── DatePicker.tsx
│   ├── SelectInput.tsx
│   ├── RelationshipPicker.tsx  # Busca instances de outro tipo
│   ├── AddressInput.tsx        # CEP → ViaCEP
│   ├── PhoneInput.tsx          # (99) 99999-9999
│   ├── EmailInput.tsx
│   └── NumberInput.tsx
└── validation/
    └── JSONSchemaValidator.ts  # Client-side validation
```

**Exemplo de Uso**:
```tsx
// Frontend NUNCA sabe que é "Cliente"
<DynamicInstanceForm
  objectDefinitionId="uuid-cliente-pf"
  onSubmit={async (data) => {
    await api.post('/instances', {
      object_definition_id: "uuid-cliente-pf",
      data: data
    });
  }}
/>

// Renderiza automaticamente:
// - CPF com máscara
// - Nome (text)
// - Email (validação RFC 5322)
// - Endereço (CEP autocomplete)
```

**Agents Autônomos**:
- `frontend-developer`: Widgets reutilizáveis
- `ui-ux-designer`: Design tokens, acessibilidade
- `typescript-pro`: Type safety avançado

---

### Sprint 5 (Semanas 9-10): RAG Trimodal

**Objetivos**:
- ✅ SQL search (instances)
- ✅ Graph search (relationships via NebulaGraph)
- ✅ Vector search (embeddings via pgvector)
- ✅ Hybrid query engine

**Entregas**:
```
backend/internal/services/rag/
├── sql_layer.go        # Query builder dinâmico
├── graph_layer.go      # NebulaGraph integration
├── vector_layer.go     # pgvector similarity search
└── hybrid_search.go    # Combina 3 fontes

# Tabela de embeddings
CREATE TABLE document_embeddings (
  id UUID PRIMARY KEY,
  source_instance_id UUID REFERENCES instances(id),
  content TEXT,
  metadata JSONB,
  embedding vector(1536)  -- OpenAI text-embedding-3-small
);

CREATE INDEX ON document_embeddings
USING hnsw (embedding vector_cosine_ops);
```

**API de RAG**:
```bash
POST /api/v1/rag/query
{
  "question": "Quantos clientes ativos temos?",
  "context": {
    "object_types": ["cliente_pf"],
    "filters": {"current_state": "ATIVO"}
  }
}

# Resposta:
{
  "answer": "Atualmente temos 1.247 clientes ativos no sistema.",
  "sources": [
    {"type": "sql", "query": "SELECT COUNT(*)...", "result": 1247},
    {"type": "graph", "path": null},
    {"type": "vector", "documents": []}
  ]
}
```

**Agents Autônomos**:
- `ai-engineer`: RAG pipeline
- `python-pro`: Vector indexing scripts
- `database-optimizer`: Query performance tuning

---

### Sprint 6 (Semanas 11-12): Auth JWT + RBAC Nativo

**CRÍTICO**: Reimplementar autenticação SEM Keycloak/Logto/Cerbos

**Objetivos**:
- ✅ JWT token generation/validation
- ✅ RBAC como object_definitions
- ✅ Session management (Redis)
- ✅ 2FA (TOTP)

**Entregas**:
```
# 1. object_definition: user
{
  "name": "user",
  "schema": {
    "properties": {
      "email": {"type": "string", "format": "email"},
      "password_hash": {"type": "string"},
      "totp_secret": {"type": "string"},
      "roles": {"type": "array", "items": {"type": "string"}}
    }
  }
}

# 2. object_definition: role
{
  "name": "role",
  "schema": {
    "properties": {
      "name": {"type": "string"},
      "permissions": {"type": "array"}
    }
  }
}

# 3. object_definition: permission
{
  "name": "permission",
  "schema": {
    "properties": {
      "resource": {"type": "string"},  # "instances", "object_definitions"
      "actions": {"type": "array"}     # ["create", "read", "update"]
    }
  }
}

backend/internal/auth/
├── jwt.go              # Token issue/verify
├── password.go         # bcrypt hashing
├── totp.go             # Google Authenticator
├── session.go          # Redis session store
└── rbac.go             # Permission checker

frontend/lib/
├── auth-context.tsx    # JWT storage
└── api/client.ts       # Auto-inject Authorization header
```

**API de Auth**:
```bash
# Login
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "senha123",
  "totp_code": "123456"  # opcional
}
# Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "...",
  "expires_in": 3600
}

# Verificar permissão
GET /api/v1/auth/can?resource=instances&action=create
# Response: {"allowed": true}

# Refresh token
POST /api/v1/auth/refresh
{
  "refresh_token": "..."
}
```

**Agents Autônomos**:
- `backend-security-coder`: JWT implementation
- `security-auditor`: Pen test, OWASP checks
- `frontend-security-coder`: XSS prevention

---

## 🧠 FASE 2: BRAIN - ARCHITECT AGENT (12 semanas)

### Objetivo
Ler documentos PDF do BACEN e gerar object_definitions automaticamente.

### Squad Fase 2

| Papel | Responsabilidade | Agent Principal |
|-------|------------------|-----------------|
| **ML Engineer** | Document Intelligence, schema generation | `ml-engineer`, `python-pro` |
| **NLP Engineer** | spaCy, entity extraction | `data-scientist`, `python-pro` |
| **Backend Integration** | Architect Agent API, webhooks | `backend-architect`, `fastapi-pro` |
| **Frontend Reviewer** | UI para revisar schemas gerados | `frontend-developer`, `react-pro` |
| **Knowledge Engineer** | BACEN knowledge base, vector DB | `ai-engineer`, `rag-implementation` |
| **Crawler Engineer** | Monitor BACEN site para novos docs | `devops-troubleshooter`, `python-pro` |

**Total**: 6 pessoas

---

### Sprint 7 (Semanas 13-14): Document Intelligence Engine

**Objetivo**: PDF → Texto Estruturado

**Entregas**:
```
architect-agent/src/document_parser/
├── pdf_extractor.py        # PyMuPDF extraction
├── text_cleaner.py         # Remove headers/footers
├── section_detector.py     # Identifica seções
└── table_parser.py         # Tabelas → JSON

# Exemplo:
input: "Manual PIX v8.3.pdf"
output: {
  "title": "Manual de Uso do PIX",
  "sections": [
    {
      "number": "4.2",
      "title": "Limites de Valor por Horário",
      "content": "No período noturno..."
    }
  ]
}
```

**Agents Autônomos**:
- `python-pro`: PyMuPDF integration
- `ml-engineer`: Table detection models

---

### Sprint 8 (Semanas 15-16): Entity Extraction com spaCy

**Objetivo**: Extrair entidades regulatórias

**Entregas**:
```
architect-agent/src/entity_extraction/
├── ner_model.py            # spaCy custom NER
├── entities/
│   ├── limite.py           # Detecta limites ("R$ 1.000")
│   ├── horario.py          # Detecta horários ("20h-6h")
│   ├── validacao.py        # Detecta validações ("CPF válido")
│   └── campo.py            # Detecta campos ("nome completo")

# Exemplo:
input: "O limite noturno é de R$ 1.000 entre 20h e 6h"
output: [
  {"type": "LIMITE", "valor": 1000, "moeda": "BRL"},
  {"type": "HORARIO", "inicio": "20:00", "fim": "06:00"}
]
```

**Agents Autônomos**:
- `data-scientist`: Train custom NER model
- `python-pro`: spaCy pipeline

---

### Sprint 9 (Semanas 17-18): Schema Generation com LLM

**Objetivo**: Entidades → JSON Schema

**Entregas**:
```
architect-agent/src/schema_generation/
├── llm_generator.py        # Claude Opus prompt
├── validator.py            # Valida JSON Schema
└── ui_hints_mapper.py      # Gera UI hints

# Prompt para LLM:
"""
Você é um expert em JSON Schema Draft 7.

Entidades extraídas:
- LIMITE: R$ 1.000 (noturno)
- HORARIO: 20h-6h
- CAMPO: valor (número), chave_destino (string)

Gere um JSON Schema para object_definition "transacao_pix":
"""

# Output:
{
  "name": "transacao_pix",
  "schema": {
    "type": "object",
    "properties": {
      "valor": {"type": "number", "minimum": 0.01},
      "chave_destino": {"type": "string"}
    }
  },
  "rules": [
    {
      "name": "limite_noturno",
      "condition": "valor <= 1000 && (hora >= 20 || hora < 6)"
    }
  ]
}
```

**Agents Autônomos**:
- `ai-engineer`: LLM integration
- `prompt-engineer`: Optimize prompts for accuracy

---

### Sprint 10 (Semanas 19-20): Knowledge Base + Vector DB

**Objetivo**: Indexar 20+ documentos BACEN

**Entregas**:
```
architect-agent/knowledge_base/
├── documents/
│   ├── manual_pix_v8_3.pdf
│   ├── circular_3978_pld.pdf
│   ├── resolucao_4753_kyc.pdf
│   └── ... (20+ docs)
├── embeddings_store.py     # pgvector
└── search.py               # Semantic search

# API:
GET /api/v1/knowledge-base/search?q=limite%20pix%20noturno

# Response:
{
  "results": [
    {
      "document": "Manual PIX v8.3",
      "section": "4.2",
      "content": "Limite de R$ 1.000 entre 20h-6h",
      "similarity": 0.92
    }
  ]
}
```

**Agents Autônomos**:
- `ai-engineer`: Embedding pipeline
- `database-optimizer`: pgvector indexing

---

### Sprint 11 (Semanas 21-22): Review & Deployment UI

**Objetivo**: Interface para aprovar schemas gerados

**Entregas**:
```
frontend/app/architect/
├── page.tsx                    # Lista de schemas pendentes
├── components/
│   ├── SchemaReviewer.tsx      # Diff view
│   ├── FieldEditor.tsx         # Editar campos
│   └── ApprovalFlow.tsx        # Aprovar/Rejeitar

# Fluxo:
1. Architect Agent processa "Manual PIX v8.3"
2. Gera object_definition "transacao_pix"
3. Status: PENDING_REVIEW
4. Compliance/Produto revisa → Aprovar
5. Status: APPROVED → Auto-deploy para production
```

**Agents Autônomos**:
- `frontend-developer`: Review UI
- `ui-ux-designer`: Diff visualization

---

### Sprint 12 (Semanas 23-24): BACEN Crawler

**Objetivo**: Monitor diário de novos normativos

**Entregas**:
```
architect-agent/crawler/
├── bacen_monitor.py        # Scraper (Playwright)
├── change_detector.py      # Diff de versões
└── notification.py         # Slack/Email alerts

# Cron job diário:
1. Acessa https://www.bcb.gov.br/estabilidadefinanceira/buscanormas
2. Extrai lista de normativos
3. Compara com versão anterior
4. Se novo: Download PDF → Processa → Notifica
```

**Agents Autônomos**:
- `devops-troubleshooter`: Crawler setup
- `python-pro`: Playwright automation

---

## 🏢 FASE 3: BACKOFFICE PORTAL (10 semanas)

### Objetivo
11 módulos para equipes internas operarem a plataforma.

### Squad Fase 3

| Papel | Responsabilidade | Agent Principal |
|-------|------------------|-----------------|
| **Frontend Architect** | Design system, routing, auth | `frontend-developer`, `react-pro` |
| **Backend API** | Endpoints específicos de cada módulo | `backend-architect`, `golang-pro` |
| **UX Designer** | Wireframes, protótipos | `ui-ux-designer`, `figma` |
| **Data Viz** | Charts, dashboards, KPIs | `data-scientist`, `recharts` |
| **Integration Engineer** | WebSockets, real-time | `backend-architect`, `socketio` |
| **QA** | E2E tests por módulo | `test-automator`, `playwright` |

**Total**: 6 pessoas

---

### Sprint 13 (Semanas 25-26): Módulos 1-2

**Módulo 1: Dashboard Executivo**
```
Funcionalidades:
✓ KPIs principais (clientes, contas, transações, receita)
✓ Gráficos de tendência (últimos 30 dias)
✓ Alertas críticos (fraude, COAF, limites)
✓ Shortcuts para ações rápidas

Tela:
┌─────────────────────────────────────────┐
│  Clientes  │  Contas  │  Tx Hoje  │ $  │
│   1,247    │  2,891   │  15,342   │ 5M │
├─────────────────────────────────────────┤
│  Gráfico: Transações (últimos 30 dias) │
│  [Line chart com volume diário]         │
├─────────────────────────────────────────┤
│  ⚠️ Alertas (3 pendentes)              │
│  • COAF: 2 transações suspeitas        │
│  • Limite: Cliente X excedeu saldo     │
└─────────────────────────────────────────┘
```

**Módulo 2: Gestão de Clientes**
```
Funcionalidades:
✓ Listagem com filtros avançados
✓ Busca por CPF/Nome/Email
✓ 360° view (contas, transações, docs)
✓ Bulk operations (bloquear N clientes)
✓ Export CSV/Excel

Tela:
┌─────────────────────────────────────────┐
│  🔍 Buscar: [CPF/Nome/Email]           │
│  Filtros: [Estado] [Segmento] [Desde] │
├─────────────────────────────────────────┤
│  CPF          │ Nome     │ Estado      │
│  123.456.789  │ Maria    │ ATIVO  [▶] │
│  987.654.321  │ João     │ BLOQ   [▶] │
└─────────────────────────────────────────┘

Detalhes (Maria Silva):
├─ Dados Cadastrais
├─ Contas (2)
│  └─ 12345-6 (Corrente, R$ 5.000)
├─ Transações (últimas 50)
└─ Documentos KYC (3 aprovados)
```

**Agents Autônomos**:
- `frontend-developer`: React Table, charts
- `data-scientist`: KPI calculations

---

### Sprint 14 (Semanas 27-28): Módulos 3-4

**Módulo 3: Gestão de Contas**
**Módulo 4: Gestão de Transações**

(Similar structure)

---

### Sprint 15 (Semanas 29-30): Módulos 5-6

**Módulo 5: Compliance & KYC**
**Módulo 6: Risco & Fraude**

---

### Sprint 16 (Semanas 31-32): Módulos 7-8

**Módulo 7: Produto & Configuração**
```
Funcionalidades:
✓ Object Definition Editor visual
✓ FSM Designer (React Flow)
✓ Validation Rules Builder
✓ UI Hints configurator

Tela:
┌─────────────────────────────────────────┐
│  Object Definitions                     │
│  ├─ cliente_pf        [Editar] [FSM]   │
│  ├─ conta_corrente    [Editar] [FSM]   │
│  └─ transacao_pix     [Editar] [FSM]   │
│                                         │
│  [+ Novo Object Definition]             │
└─────────────────────────────────────────┘

FSM Designer (transacao_pix):
┌─────────────────────────────────────────┐
│  [PENDENTE] ──aprovar──> [LIQUIDADA]   │
│      │                        │         │
│      └──rejeitar──> [REJEITADA]        │
│                                         │
│  Transition: aprovar                    │
│  Condition: saldo >= valor              │
│  Actions: [ notify_customer ]           │
└─────────────────────────────────────────┘
```

**Módulo 8: Suporte & Atendimento**

---

### Sprint 17 (Semanas 33-34): Módulos 9-10-11

**Módulo 9: Relatórios & Analytics**
**Módulo 10: Administração & Segurança**
**Módulo 11: Notificações & Alertas**

---

## 👤 FASE 4: CLIENT PORTAL + MOBILE (12 semanas)

### Objetivo
Portal completo para clientes finais (web + mobile).

### Squad Fase 4

| Papel | Responsabilidade | Agent Principal |
|-------|------------------|-----------------|
| **Mobile Lead (iOS)** | React Native iOS | `ios-developer`, `swift` |
| **Mobile Lead (Android)** | React Native Android | `mobile-developer`, `kotlin` |
| **Frontend Web** | Next.js client portal | `frontend-developer`, `react-pro` |
| **Backend API** | Endpoints cliente | `backend-architect`, `fastapi-pro` |
| **Security Engineer** | Biometria, 2FA, device fingerprint | `security-auditor`, `mobile-security-coder` |
| **QA Mobile** | Testes iOS + Android | `test-automator`, `detox` |

**Total**: 6 pessoas

---

### Sprint 18 (Semanas 35-36): Módulo 1-2 Cliente

**Módulo 1: Onboarding & Cadastro**
```
Funcionalidades (Web + Mobile):
✓ Multi-step form (5 etapas)
✓ Selfie + OCR (RG/CNH)
✓ Validação biométrica (liveness)
✓ Verificação de email/SMS
✓ Aceite de termos

Fluxo:
1️⃣ Dados Pessoais (CPF, Nome, Nascimento)
2️⃣ Contato (Email, Telefone)
3️⃣ Endereço (CEP autocomplete)
4️⃣ Documentos (Selfie + RG/CNH)
5️⃣ Revisão + Confirmação
```

**Módulo 2: Login & Autenticação**
```
Funcionalidades:
✓ Login email/senha
✓ Biometria (FaceID/TouchID no mobile)
✓ 2FA (TOTP ou SMS)
✓ Recuperação de senha
✓ Logout em todos os dispositivos
```

---

### Sprint 19-22 (Semanas 37-44): Módulos 3-11 Cliente

(Similar structure para 9 módulos restantes)

---

## 🤖 FASE 5: AUTONOMY - SELF-HEALING (12 semanas)

### Objetivo
Sistema descobre problemas e auto-gera soluções.

### Squad Fase 5

| Papel | Responsabilidade | Agent Principal |
|-------|------------------|-----------------|
| **AI Architect** | Agent discovery engine | `ai-engineer`, `ml-engineer` |
| **Code Generator** | Template-based code gen | `backend-architect`, `golang-pro` |
| **K8s Engineer** | Auto-deploy, GitOps | `kubernetes-architect`, `argocd` |
| **Monitoring Engineer** | Prometheus, alerting | `observability-engineer`, `grafana` |
| **ML Ops** | Model deployment, A/B testing | `mlops-engineer`, `kubeflow` |
| **Security** | Agent sandbox, policy enforcement | `security-auditor`, `k8s-security-policies` |

**Total**: 6 pessoas

---

### Sprint 23-28 (Semanas 45-56): Autonomy Components

**Sprint 23**: Problem Detection Engine
**Sprint 24**: Agent Suggester (LLM-based)
**Sprint 25**: Code Generator (Go templates)
**Sprint 26**: Test Generator
**Sprint 27**: Deployment Orchestrator
**Sprint 28**: Self-Healing Monitor

---

## 🚀 FASE 6: PRODUCTION - BACEN REAL (12 semanas)

### Objetivo
10.000 clientes reais processando PIX via BACEN.

### Squad Fase 6

| Papel | Responsabilidade | Agent Principal |
|-------|------------------|-----------------|
| **Integration Lead** | BACEN SPI, mTLS | `backend-architect`, `network-engineer` |
| **Ledger Engineer** | TigerBeetle integration | `backend-architect`, `golang-pro` |
| **Security Engineer** | Penetration testing, LGPD | `security-auditor`, `pci-compliance` |
| **SRE** | Multi-region, DR | `incident-responder`, `kubernetes-architect` |
| **Performance Engineer** | Load testing, optimization | `performance-engineer`, `database-optimizer` |
| **Compliance** | BACEN certification, audit | `security-auditor`, `legal-advisor` |

**Total**: 6 pessoas

---

### Sprint 29-34 (Semanas 57-70): Production Launch

**Sprint 29**: BACEN SPI Integration (mTLS, certificados)
**Sprint 30**: TigerBeetle Ledger (accounting de produção)
**Sprint 31**: Anti-Fraude (Data Rudder, machine learning)
**Sprint 32**: Disaster Recovery (multi-region, RTO <1h)
**Sprint 33**: Load Testing (50k tx/dia)
**Sprint 34**: 100 Beta Customers → 10k Customers

---

## 📊 RESUMO DE RECURSOS

| Fase | Squad Size | Sprints | Semanas | Custo Estimado (6 pessoas × $10k/mês) |
|------|------------|---------|---------|---------------------------------------|
| Fase 1 | 6 | 6 | 12 | $180k |
| Fase 2 | 6 | 6 | 12 | $180k |
| Fase 3 | 6 | 5 | 10 | $150k |
| Fase 4 | 6 | 6 | 12 | $180k |
| Fase 5 | 6 | 6 | 12 | $180k |
| Fase 6 | 6 | 6 | 12 | $180k |
| **TOTAL** | **6** | **35** | **70** | **$1.05M** |

---

## 🎯 MÉTRICAS DE SUCESSO POR FASE

| Fase | Métrica Chave | Meta |
|------|---------------|------|
| **Fase 1** | Object definitions criados via NL | >95% precisão |
| **Fase 2** | BACEN docs → schemas | <30 min/documento |
| **Fase 3** | Redução em tickets de suporte | >90% |
| **Fase 4** | Transações self-service | >90% |
| **Fase 5** | Agents auto-deployed | >10 agents |
| **Fase 6** | Uptime SLA | 99.95% |

---

## 🚀 PRÓXIMOS PASSOS IMEDIATOS

### Limpeza do Código Atual

```bash
# 1. Remover Keycloak/Logto/Cerbos
rm -rf frontend/lib/keycloak/
rm -rf frontend/app/api/logto/
rm -rf frontend/app/api/auth/token/
rm -rf frontend/app/api/auth/user/

# 2. Atualizar dependências
cd frontend
npm uninstall keycloak-js @logto/next

# 3. Limpar backend (se houver referências)
cd ../backend
grep -r "keycloak\|logto\|cerbos" . # Verificar referências
```

### Reimplementação Fase 1 (Sprint 6)

```bash
# 1. Criar nova branch
git checkout -b fase1-refactor-auth

# 2. Implementar JWT nativo
mkdir -p backend/internal/auth
touch backend/internal/auth/jwt.go
touch backend/internal/auth/rbac.go

# 3. Criar object_definitions de auth
curl POST /api/v1/object-definitions -d @user_object.json
curl POST /api/v1/object-definitions -d @role_object.json

# 4. Frontend: Atualizar auth-context.tsx
# Remover Keycloak, usar apenas JWT

# 5. Commit
git add .
git commit -m "refactor(auth): Replace Keycloak with native JWT + RBAC"
```

---

**Este documento substitui TODOS os roadmaps e sprint plans anteriores. É a fonte única da verdade para implementação do SuperCore.**
