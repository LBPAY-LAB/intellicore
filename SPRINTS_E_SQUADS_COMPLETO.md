# SuperCore - Sprints e Squads Completo (6 Fases)

> **Visão Definitiva**: Plataforma universal de gestão de objetos. ZERO autenticação, ZERO lógica de negócio hardcoded. 100% genérico.

---

## 📊 Visão Geral das Fases

| Fase | Duração | Sprints | Objetivo Principal | Status |
|------|---------|---------|-------------------|--------|
| **Fase 1: Foundation** | 10 semanas | 5 sprints | Engine de Objetos + RAG | ✅ Implementado (precisa limpeza) |
| **Fase 2: Brain** | 12 semanas | 6 sprints | Architect Agent (PDF→Schema) | 📝 Especificado |
| **Fase 3: BackOffice** | 10 semanas | 5 sprints | 11 módulos operacionais | 📋 A implementar |
| **Fase 4: Client Portal** | 12 semanas | 6 sprints | 11 módulos cliente + mobile | 📋 A implementar |
| **Fase 5: Autonomy** | 12 semanas | 6 sprints | Descoberta + Auto-Deploy | 📋 A implementar |
| **Fase 6: Production** | 12 semanas | 6 sprints | BACEN real + 10k clientes | 📋 A implementar |

**Total**: 68 semanas (~17 meses)

---

## 🎯 FASE 1: FOUNDATION (10 semanas)

### Objetivo
Engine genérico 100% abstrato para gestão de objetos, instâncias e relacionamentos. ZERO lógica de negócio.

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
- ✅ Validation engine básico (5 tipos: regex, function, api_call, jsonschema, custom)

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

**Schema PostgreSQL**:
```sql
-- object_definitions: DNA dos objetos
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    description TEXT,
    version INT DEFAULT 1,

    -- Estrutura (JSON Schema)
    schema JSONB NOT NULL,

    -- Regras de validação
    rules JSONB DEFAULT '[]'::jsonb,

    -- FSM (ciclo de vida)
    states JSONB DEFAULT '{}'::jsonb,

    -- UI hints (como renderizar)
    ui_hints JSONB DEFAULT '{}'::jsonb,

    -- Relacionamentos permitidos
    relationships JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- instances: Células vivas
CREATE TABLE instances (
    id UUID PRIMARY KEY,
    object_definition_id UUID REFERENCES object_definitions(id),

    -- Dados flexíveis (validados contra schema)
    data JSONB NOT NULL,

    -- Estado atual (FSM)
    current_state VARCHAR(50) NOT NULL,
    state_history JSONB DEFAULT '[]'::jsonb,

    -- Metadados
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP
);

-- relationships: Sinapses do grafo
CREATE TABLE relationships (
    id UUID PRIMARY KEY,
    relationship_type VARCHAR(100) NOT NULL,

    source_instance_id UUID REFERENCES instances(id),
    target_instance_id UUID REFERENCES instances(id),

    properties JSONB DEFAULT '{}'::jsonb,

    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices críticos
CREATE INDEX idx_instances_object_def ON instances(object_definition_id) WHERE is_deleted = false;
CREATE INDEX idx_instances_data_gin ON instances USING GIN (data jsonb_path_ops);
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
```

**API Endpoints**:
```
POST   /api/v1/object-definitions        # Criar definition
GET    /api/v1/object-definitions        # Listar
GET    /api/v1/object-definitions/:id    # Buscar por ID
PUT    /api/v1/object-definitions/:id    # Atualizar
DELETE /api/v1/object-definitions/:id    # Deletar

POST   /api/v1/instances                 # Criar instance (com validação)
GET    /api/v1/instances                 # Listar (com filtros JSONB)
GET    /api/v1/instances/:id             # Buscar
PUT    /api/v1/instances/:id             # Atualizar
DELETE /api/v1/instances/:id             # Soft delete

POST   /api/v1/relationships             # Criar relacionamento
GET    /api/v1/relationships             # Listar
GET    /api/v1/relationships?source=:id  # Buscar por origem
DELETE /api/v1/relationships/:id         # Deletar
```

**Teste Crítico**:
```bash
# 1. Criar object_definition
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "schema": {
      "type": "object",
      "properties": {
        "cpf": {"type": "string", "pattern": "^\\d{11}$"},
        "nome_completo": {"type": "string", "minLength": 3}
      },
      "required": ["cpf", "nome_completo"]
    },
    "states": {
      "initial": "ATIVO",
      "states": ["ATIVO", "BLOQUEADO"]
    }
  }'

# 2. Criar instance válida
curl -X POST http://localhost:8080/api/v1/instances \
  -d '{
    "object_definition_id": "uuid-do-cliente-pf",
    "data": {
      "cpf": "12345678901",
      "nome_completo": "Maria Silva"
    }
  }'

# 3. Tentar criar instance INVÁLIDA (deve falhar)
curl -X POST http://localhost:8080/api/v1/instances \
  -d '{
    "object_definition_id": "uuid-do-cliente-pf",
    "data": {
      "cpf": "123",  # ❌ Regex fail
      "nome_completo": "Ma" # ❌ minLength fail
    }
  }'
# Esperado: HTTP 400 com erros de validação
```

**Agents Autônomos**:
- `backend-architect`: Desenha API RESTful genérica
- `database-architect`: Otimiza índices GIN/JSONB
- `golang-pro`: Implementa handlers sem lógica de negócio
- `test-automator`: Gera testes de integração

---

### Sprint 2 (Semanas 3-4): FSM Engine + State Transitions

**Objetivos**:
- ✅ FSM definition em object_definitions.states
- ✅ State transition API com validação
- ✅ State history tracking (auditoria)
- ✅ Condition evaluator (CEL expressions)

**Entregas**:
```
backend/internal/services/statemachine/
├── fsm_engine.go          # Valida transições FSM
├── condition_evaluator.go # Interpreta CEL expressions
└── state_history.go       # Tracking de mudanças
```

**Exemplo FSM**:
```json
{
  "states": {
    "initial": "CADASTRO_PENDENTE",
    "states": ["CADASTRO_PENDENTE", "ATIVO", "BLOQUEADO", "INATIVO"],
    "transitions": [
      {
        "from": "CADASTRO_PENDENTE",
        "to": "ATIVO",
        "trigger": "aprovar",
        "condition": "data.documentos_validados == true"
      },
      {
        "from": "ATIVO",
        "to": "BLOQUEADO",
        "trigger": "bloquear",
        "condition": "true"  # Sempre permitido
      },
      {
        "from": "BLOQUEADO",
        "to": "ATIVO",
        "trigger": "desbloquear",
        "condition": "data.motivo_bloqueio_resolvido == true"
      }
    ]
  }
}
```

**API Transition**:
```bash
POST /api/v1/instances/:id/transition
{
  "to_state": "ATIVO",
  "trigger": "aprovar",
  "metadata": {"aprovado_por": "sistema", "timestamp": "2024-01-15T10:00:00Z"}
}

# Response:
{
  "id": "uuid-123",
  "current_state": "ATIVO",
  "state_history": [
    {
      "from_state": "CADASTRO_PENDENTE",
      "to_state": "ATIVO",
      "trigger": "aprovar",
      "timestamp": "2024-01-15T10:00:00Z",
      "metadata": {...}
    }
  ]
}
```

**Agents Autônomos**:
- `backend-architect`: Design FSM engine
- `golang-pro`: Implementa CEL evaluator
- `security-auditor`: Valida condições de segurança

---

### Sprint 3 (Semanas 5-6): Natural Language Assistant

**Objetivos**:
- ✅ Interface de conversa (7 perguntas estruturadas)
- ✅ LLM gera JSON Schema automaticamente
- ✅ Preview antes de criar object_definition
- ✅ UI hints gerados automaticamente

**Entregas**:
```
frontend/app/assistant/
├── page.tsx                    # Chat interface
├── components/
│   ├── ConversationFlow.tsx   # 7 perguntas
│   ├── SchemaPreview.tsx      # Preview do objeto
│   └── ConfirmCreate.tsx      # Confirmação final
└── lib/
    └── schema-generator.ts    # LLM → JSON Schema

backend/internal/services/
└── assistant/
    ├── nl_processor.go        # Processa linguagem natural
    └── schema_generator.go    # Gera schema via LLM
```

**Fluxo de Conversa**:
```
1. Qual o nome do objeto?
   → "Conta Corrente"

2. Descreva o que é esse objeto.
   → "Uma conta bancária onde o cliente deposita dinheiro e faz transações"

3. Quais campos precisam ser coletados?
   → "Número da conta, agência, saldo, tipo (corrente/poupança), limite, titular"

4. Algum campo tem validação especial?
   → "Número da conta: 8 dígitos, Saldo: sempre positivo"

5. Quais são os estados do ciclo de vida?
   → "Aberta → Ativa → Bloqueada → Encerrada"

6. Se relaciona com outros objetos?
   → "Cliente é TITULAR da Conta"

7. Preview e confirmação
   → Mostra JSON Schema gerado, FSM, validações
```

**LLM Prompt (Interno)**:
```
Você é um especialista em modelagem de dados.

O usuário descreveu:
- Nome: Conta Corrente
- Descrição: Uma conta bancária...
- Campos: Número da conta, agência, saldo...
- Validações: Número 8 dígitos, saldo positivo
- Estados: Aberta → Ativa → Bloqueada → Encerrada
- Relacionamentos: Cliente TITULAR_DE Conta

Gere um JSON Schema Draft 7 completo com:
1. Tipos corretos (string, number, boolean)
2. Required fields
3. Patterns para validações
4. Enums quando aplicável
5. Descrições em português

Retorne APENAS JSON válido.
```

**Agents Autônomos**:
- `frontend-developer`: Implementa chat UI
- `ai-engineer`: Otimiza prompts LLM
- `typescript-pro`: Valida JSON Schema gerado

---

### Sprint 4 (Semanas 7-8): Dynamic UI Generation

**Objetivos**:
- ✅ Componente DynamicInstanceForm (100% genérico)
- ✅ Widget library (12 widgets)
- ✅ Validação client-side (JSON Schema)
- ✅ Integração com API de instances

**Widgets Implementados**:
1. `text` - Input básico
2. `cpf` - Máscara 999.999.999-99
3. `cnpj` - Máscara 99.999.999/9999-99
4. `currency` - R$ 0,00
5. `date` - DatePicker
6. `select` - Dropdown
7. `multiselect` - Checkboxes
8. `relationship` - Picker de outra instance
9. `address` - Composto (CEP, Rua, Número, etc)
10. `phone_br` - (11) 98765-4321
11. `email` - Validação RFC 5322
12. `number` - Input numérico

**Componente Principal**:
```typescript
// DynamicInstanceForm.tsx
interface Props {
  objectDefinitionId: string;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
}

export function DynamicInstanceForm({ objectDefinitionId, initialData, onSubmit }: Props) {
  const { data: objDef } = useObjectDefinition(objectDefinitionId);
  const [formData, setFormData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validator = useMemo(() => {
    return new JSONSchemaValidator(objDef.schema);
  }, [objDef]);

  const fields = Object.entries(objDef.schema.properties || {});

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const errors = validator.validate(formData);
      if (errors.length > 0) {
        setErrors(errors);
        return;
      }
      onSubmit(formData);
    }}>
      {fields.map(([fieldName, fieldSchema]) => {
        const widget = objDef.ui_hints?.widgets?.[fieldName] || inferWidget(fieldSchema);

        return (
          <FormField key={fieldName} label={fieldSchema.title} required={isRequired(fieldName)}>
            <WidgetRenderer
              widget={widget}
              schema={fieldSchema}
              value={formData[fieldName]}
              onChange={(value) => setFormData({ ...formData, [fieldName]: value })}
            />
          </FormField>
        );
      })}
      <Button type="submit">Salvar</Button>
    </form>
  );
}
```

**Teste Crítico**:
```typescript
// Usuário acessa /objects/cliente_pf/new
// Sistema busca object_definition
// DynamicInstanceForm renderiza:
//   - Campo CPF com máscara
//   - Campo Nome (text input)
//   - Campo Data Nascimento (DatePicker)
//   - Botão "Salvar"
// Ao salvar, valida JSON Schema e envia para API
```

**Agents Autônomos**:
- `frontend-developer`: Implementa DynamicInstanceForm
- `ui-ux-designer`: Design dos 12 widgets
- `typescript-pro`: Type safety total

---

### Sprint 5 (Semanas 9-10): RAG Trimodal

**Objetivos**:
- ✅ SQL layer (busca em instances via PostgreSQL)
- ✅ Graph layer (busca em relationships via NebulaGraph)
- ✅ Vector layer (busca semântica via pgvector)
- ✅ Query builder dinâmico
- ✅ Interface de chat

**Arquitetura**:
```
backend/internal/rag/
├── orchestrator.go       # Coordena 3 camadas
├── sql_layer.go          # Query PostgreSQL (instances)
├── graph_layer.go        # Query NebulaGraph (relationships)
├── vector_layer.go       # Busca semântica (embeddings)
└── entity_extractor.go   # LLM extrai entidades da pergunta

frontend/app/chat/
└── page.tsx              # Interface de chat
```

**Pipeline RAG**:
```
1. USUÁRIO: "Quantos clientes ativos temos?"

2. ENTITY EXTRACTION (LLM):
   {
     "object_type": "cliente_pf",
     "state": "ATIVO",
     "aggregation": "count"
   }

3. SQL LAYER:
   SELECT COUNT(*)
   FROM instances
   WHERE object_definition_id = 'uuid-cliente-pf'
     AND current_state = 'ATIVO'
     AND is_deleted = false

4. RESULTADO: 1247

5. LLM SÍNTESE:
   "Atualmente temos 1.247 clientes ativos no sistema."
```

**Exemplo Complexo (Grafo)**:
```
USUÁRIO: "Quais contas a Maria Silva possui?"

ENTITY EXTRACTION:
{
  "object_type": "conta_corrente",
  "relationship_type": "TITULAR_DE",
  "source_name": "Maria Silva"
}

GRAPH QUERY (NebulaGraph):
MATCH (cli:Instance)-[rel:TITULAR_DE]->(conta:Instance)
WHERE cli.data.nome_completo CONTAINS 'Maria Silva'
RETURN cli, rel, conta

RESULTADO:
- Conta 12345-6 (Corrente) - Saldo: R$ 5.000
- Conta 98765-4 (Poupança) - Saldo: R$ 15.000

LLM SÍNTESE:
"Maria Silva possui 2 contas:
1. Conta Corrente 12345-6 - Saldo: R$ 5.000,00
2. Conta Poupança 98765-4 - Saldo: R$ 15.000,00"
```

**Agents Autônomos**:
- `ai-engineer`: Implementa RAG pipeline
- `python-pro`: Otimiza embeddings
- `database-architect`: Tuning PostgreSQL + NebulaGraph

---

## 🧠 FASE 2: BRAIN (12 semanas)

### Objetivo
Architect Agent lê PDFs (Manuais BACEN, circulares, resoluções) e AUTOMATICAMENTE gera object_definitions completos.

### Squad Fase 2

| Papel | Responsabilidade |
|-------|------------------|
| **ML Engineer** | spaCy NER, PyMuPDF, LLM fine-tuning |
| **Backend Lead** | API integration, validation |
| **Data Scientist** | Entity extraction optimization |
| **QA** | Validação de schemas gerados |

### Sprint 7-12: Architect Agent

**Entregas**:
```
architect-agent/
├── src/
│   ├── pdf_parser.py           # PyMuPDF extract
│   ├── entity_extractor.py     # spaCy NER
│   ├── schema_generator.py     # LLM → JSON Schema
│   ├── validation_mapper.py    # Mapeia validações BACEN
│   └── api/
│       └── main.py             # FastAPI
└── tests/
    └── test_bacen_circular.py  # Teste com Circular 3.978
```

**Pipeline**:
```
1. INPUT: PDF da Circular 3.978 (PLD/FT)

2. PDF PARSING:
   - Extrai texto completo
   - Identifica seções
   - Preserva estrutura

3. ENTITY EXTRACTION (spaCy):
   - Entidades: Cliente, Transação, Limite
   - Atributos: CPF, Valor, Data
   - Validações: CPF válido, Valor > 0

4. SCHEMA GENERATION (LLM):
   {
     "name": "transacao_pld",
     "schema": {
       "type": "object",
       "properties": {
         "cpf_origem": {"type": "string", "pattern": "^\\d{11}$"},
         "valor": {"type": "number", "minimum": 0},
         "data": {"type": "string", "format": "date-time"}
       }
     },
     "rules": [
       {"type": "regex", "field": "cpf_origem", "pattern": "^\\d{11}$"},
       {"type": "function", "code": "valor > 10000 => reportar_coaf()"}
     ]
   }

5. VALIDATION:
   - JSON Schema válido?
   - FSM coerente?
   - Regras executáveis?

6. PERSISTÊNCIA:
   - POST /api/v1/object-definitions
   - Cria automaticamente
```

**Teste Real**:
```python
# test_bacen_circular.py
def test_circular_3978_pld():
    pdf_path = "docs/bacen/Circular_3978_PLD.pdf"

    # Agent processa PDF
    result = architect_agent.process_pdf(pdf_path)

    assert result.success == True
    assert len(result.object_definitions) >= 3  # Cliente, Transação, Regra
    assert result.object_definitions[0].name == "transacao_pld"
    assert "cpf_origem" in result.object_definitions[0].schema["properties"]
```

---

## 🏢 FASE 3: BACKOFFICE PORTAL (10 semanas)

### 11 Módulos Operacionais

1. **Dashboard Executivo**
   - KPIs em tempo real
   - Gráficos de tendências
   - Alertas críticos

2. **Gestão de Clientes**
   - Busca avançada (JSONB queries)
   - Visão 360° (relacionamentos)
   - Bulk operations

3. **Gestão de Contas**
   - Saldos, limites, extratos
   - Bloqueio/desbloqueio
   - Histórico de transações

4. **Gestão de Transações**
   - Filtros avançados
   - Estorno/reversão
   - Auditoria completa

5. **Compliance & KYC**
   - Review de documentos
   - Aprovação/rejeição
   - Relatórios COAF

6. **Risco & Fraude**
   - Score de risco
   - Regras configuráveis
   - Alertas automáticos

7. **Produto & Configuração**
   - Editor de Object Definitions
   - Designer de FSMs
   - Regras de validação

8. **Suporte & Atendimento**
   - Ticketing
   - Chat interno
   - Knowledge base

9. **Relatórios & Analytics**
   - Report Builder
   - Export CSV/Excel/PDF
   - Dashboards customizáveis

10. **Administração & Segurança**
    - Auditoria de ações
    - Logs de sistema
    - Configurações gerais

11. **Notificações & Alertas**
    - Email/SMS/Push
    - Webhooks
    - Regras de disparo

---

## 📱 FASE 4: CLIENT PORTAL (12 semanas)

### 11 Módulos Cliente + Mobile

1. **Onboarding & Cadastro**
   - Selfie + OCR
   - Upload de documentos
   - Assinatura eletrônica

2. **Dashboard Cliente**
   - Saldos
   - Últimas transações
   - Quick actions

3. **Gestão de Contas**
   - Extratos (PDF/CSV)
   - Histórico completo
   - Detalhes da conta

4. **Transações & Pagamentos**
   - PIX (send/receive)
   - TED/DOC
   - Boletos

5. **Cartões**
   - Virtual/físico
   - Ver CVV
   - Bloquear/desbloquear

6. **Perfil & Dados Cadastrais**
   - Editar informações
   - Trocar senha
   - Upload de novos docs

7. **Investimentos** (opcional)
   - Portfolio
   - Aplicações CDB
   - Simulações

8. **Suporte & Atendimento**
   - Chat
   - FAQ
   - Abertura de tickets

9. **Notificações**
   - In-app
   - Push notifications
   - Preferências

10. **Segurança**
    - 2FA (TOTP)
    - Dispositivos autorizados
    - Histórico de acessos

11. **Mobile Apps**
    - iOS (React Native)
    - Android (React Native)
    - Biometria (Face/Touch ID)

---

## 🤖 FASE 5: AUTONOMY (12 semanas)

### Self-Healing & Agent Discovery

**Objetivos**:
- Sistema descobre necessidade de novos agentes
- Auto-deploy de agentes em Kubernetes
- Self-healing automático
- Zero downtime

**Entregas**:
- Agent Registry (PostgreSQL)
- Agent Discovery (NebulaGraph)
- Auto-Deploy Engine (ArgoCD + Kubernetes)
- Health Monitor (Prometheus + Grafana)

---

## 🚀 FASE 6: PRODUCTION (12 semanas)

### BACEN Real + 10k Clientes

**Objetivos**:
- Integração BACEN SPI (PIX real)
- TigerBeetle Ledger (contabilidade)
- 10.000 clientes beta
- 100.000 transações/dia

**Entregas**:
- Integração PIX completa
- Compliance 100% BACEN
- Monitoring produção
- SLA 99.9%

---

## 📊 Métricas de Sucesso

### Fase 1 (Foundation)
- ✅ Time de Produto cria objeto em < 15min (sem devs)
- ✅ 100 instâncias criadas sem erros
- ✅ RAG responde 10 perguntas com 90% precisão
- ✅ UI renderiza 12 tipos de widget corretamente

### Fase 2 (Brain)
- ✅ Agent gera object_definition de PDF em < 5min
- ✅ 90% de precisão na extração de entidades
- ✅ Schema gerado passa validação JSON Schema

### Fase 3 (BackOffice)
- ✅ 11 módulos funcionais
- ✅ 50 usuários internos usando diariamente
- ✅ < 2s de resposta em 95% das requests

### Fase 4 (Client Portal)
- ✅ 11 módulos cliente + 2 apps mobile
- ✅ 1.000 clientes cadastrados via app
- ✅ 10.000 transações processadas

### Fase 5 (Autonomy)
- ✅ Sistema descobre 5+ novos agentes necessários
- ✅ Auto-deploy < 10min
- ✅ Self-healing em < 30s

### Fase 6 (Production)
- ✅ 10.000 clientes ativos
- ✅ 100.000 transações/dia
- ✅ SLA 99.9% uptime
- ✅ Zero incidentes críticos

---

## 💰 Orçamento Total

| Fase | Duração | Custo Estimado |
|------|---------|----------------|
| Fase 1 | 10 semanas | $150k |
| Fase 2 | 12 semanas | $180k |
| Fase 3 | 10 semanas | $150k |
| Fase 4 | 12 semanas | $180k |
| Fase 5 | 12 semanas | $180k |
| Fase 6 | 12 semanas | $180k |

**Total**: $1.02M (~68 semanas / 17 meses)

---

## 🎯 Próximos Passos Imediatos

1. ✅ Cleanup concluído (branch `fase1-refactor-auth`)
2. 📝 Revisar este documento (SPRINTS_E_SQUADS_COMPLETO.md)
3. 🚀 Iniciar Fase 1, Sprint 1: Database + API Core
4. 🔄 Daily standups (15min)
5. 📊 Weekly demos (sexta-feira)

---

**Este documento é o contrato de implementação. Zero POCs. Zero protótipos. Apenas produção.**
