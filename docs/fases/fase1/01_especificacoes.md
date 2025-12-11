# Especificações Técnicas - Fase 1: Foundation

**Status**: 🟡 Em Revisão
**Versão**: 1.0.0
**Data**: 2025-12-11
**Aprovação**: ⏸️ Pendente

---

## 🔗 Referências Obrigatórias

Antes de implementar, leia:
1. **[docs/architecture/visao_arquitetura.md](../../architecture/visao_arquitetura.md)** - Arquitetura universal do SuperCore
2. **[docs/architecture/stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)** - ⭐ **Stack master** (seção "Fase 1")
3. **[docs/fases/fase1/06_squad_agents.md](06_squad_agents.md)** - Squad de agents responsável

## ⚠️ Stack Tecnológico

**Referência master**: [docs/architecture/stack_tecnologico_fases.md](../../architecture/stack_tecnologico_fases.md)

Esta fase usa o stack definido na seção **"Fase 1: Foundation (Semanas 1-12)"** do documento master.

**CRÍTICO**: Use EXATAMENTE as versões especificadas no documento master:
- Backend: Go 1.21+, Gin v1.10.0, PostgreSQL 15+
- Frontend: Next.js 14+, React 18+, shadcn/ui
- AI/ML: Python 3.11+, Claude 3.5 Sonnet, spaCy v3.7+

❌ **NUNCA adicione dependências não listadas** no stack master sem aprovação formal.

---

## 1. Objetivo da Fase 1

Construir a **fundação universal** do SuperCore: uma plataforma genérica que permite criar, gerenciar e relacionar objetos de negócio dinamicamente, sem conhecimento prévio de domínio.

### O Que NÃO É Esta Fase
- ❌ Implementar Core Banking
- ❌ Criar lógica de negócio específica
- ❌ Integrar com BACEN/TigerBeetle/sistemas externos
- ❌ Criar portais de clientes ou backoffice

### O Que É Esta Fase
- ✅ Motor universal de gestão de objetos
- ✅ JSON Schema validation engine
- ✅ FSM (Finite State Machine) engine
- ✅ Graph engine para relacionamentos
- ✅ UI dinâmica que renderiza qualquer objeto
- ✅ Assistente que converte linguagem natural → object_definition

---

## 2. Entregas Obrigatórias

### 2.1 Database Schema (PostgreSQL 15+)

#### Tabela: `object_definitions`
```sql
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    description TEXT,
    version INT DEFAULT 1,

    -- Schema JSON (JSON Schema Draft 7)
    schema JSONB NOT NULL,

    -- Regras de validação
    rules JSONB DEFAULT '[]'::jsonb,

    -- FSM (estados e transições)
    states JSONB DEFAULT '{
        "initial": "DRAFT",
        "states": ["DRAFT", "ACTIVE"],
        "transitions": []
    }'::jsonb,

    -- UI hints (como renderizar)
    ui_hints JSONB DEFAULT '{}'::jsonb,

    -- Relacionamentos permitidos
    relationships JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);
```

#### Tabela: `instances`
```sql
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    object_definition_id UUID REFERENCES object_definitions(id),

    -- Dados flexíveis (validados contra schema)
    data JSONB NOT NULL,

    -- Estado atual (FSM)
    current_state VARCHAR(50) NOT NULL,
    state_history JSONB DEFAULT '[]'::jsonb,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    version INT DEFAULT 1,

    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP
);
```

#### Tabela: `relationships`
```sql
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    relationship_type VARCHAR(100) NOT NULL,

    source_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,
    target_instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,

    properties JSONB DEFAULT '{}'::jsonb,

    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(relationship_type, source_instance_id, target_instance_id)
);
```

#### Tabela: `validation_rules`
```sql
CREATE TABLE validation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    rule_type VARCHAR(50),  -- "regex", "function", "api_call"

    config JSONB NOT NULL,

    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Índices Obrigatórios**:
```sql
CREATE INDEX idx_instances_object_def ON instances(object_definition_id) WHERE is_deleted = false;
CREATE INDEX idx_instances_data_gin ON instances USING GIN (data jsonb_path_ops);
CREATE INDEX idx_instances_state ON instances(current_state) WHERE is_deleted = false;
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
```

### 2.2 Backend API (Go 1.21+)

#### 15 Endpoints REST

**Object Definitions (5 endpoints)**:
- `POST /api/v1/object-definitions` - Criar definição
- `GET /api/v1/object-definitions` - Listar todas
- `GET /api/v1/object-definitions/:id` - Buscar por ID
- `PUT /api/v1/object-definitions/:id` - Atualizar
- `DELETE /api/v1/object-definitions/:id` - Deletar

**Instances (6 endpoints)**:
- `POST /api/v1/instances` - Criar instância (com validação)
- `GET /api/v1/instances` - Listar (com filtros)
- `GET /api/v1/instances/:id` - Buscar por ID
- `PUT /api/v1/instances/:id` - Atualizar dados
- `DELETE /api/v1/instances/:id` - Soft delete
- `POST /api/v1/instances/:id/transition` - Transição de estado FSM

**Relationships (4 endpoints)**:
- `POST /api/v1/relationships` - Criar relacionamento
- `GET /api/v1/relationships` - Listar (com filtros)
- `GET /api/v1/relationships/:id` - Buscar por ID
- `DELETE /api/v1/relationships/:id` - Hard delete

#### Validações Obrigatórias

1. **JSON Schema Validation**
   - Biblioteca: `gojsonschema v1.2.0`
   - Suporte completo a JSON Schema Draft 7
   - Validação em runtime antes de persistir

2. **FSM Validation**
   - Verificar se transição `from → to` é permitida
   - Registrar histórico completo em `state_history`
   - Incluir: timestamp, user_id, comentário

3. **Relationship Validation**
   - Source e target devem existir (não deletados)
   - Cardinalidade deve ser respeitada (se definida)

### 2.3 Frontend (Next.js 14+)

#### Componentes Obrigatórios

**1. DynamicInstanceForm**
- Renderiza formulário a partir de `object_definition.schema`
- Suporta 10 widgets básicos:
  - Text, Number, Email, Phone (BR)
  - CPF, CNPJ (com validação)
  - Date, Currency (BRL)
  - Select (dropdown), Relationship (picker)
- Validação client-side (JSON Schema)

**2. RelationshipPicker**
- Busca instâncias do objeto relacionado
- Suporta busca/filtro
- Multi-seleção para `MANY_TO_MANY`

**3. FSMVisualizer**
- Exibe estados e transições
- Permite executar transições válidas
- Mostra estado atual e histórico

**4. ObjectCreationAssistant**
- 7 perguntas estruturadas
- Integração com LLM (Claude/GPT)
- Preview do objeto antes de criar
- Gera: schema + FSM + validações + UI hints

### 2.4 RAG Básico (Python/Go)

#### Pipeline Trimodal

**SQL Layer**:
- Query builder dinâmico
- Suporta filtros em JSONB
- Agregações (COUNT, SUM, AVG)

**Graph Layer**:
- Navegação por relacionamentos
- Queries tipo: "Quais contas Maria possui?"
- Suporte a BFS/DFS

**Vector Layer** (opcional Fase 1):
- Embeddings de documentação
- Busca semântica com pgvector
- Respostas contextualizadas

---

## 3. Requisitos Não-Funcionais

### Performance
- Latência p99 < 500ms (endpoints CRUD)
- Suportar 1.000 instâncias/segundo (writes)
- Renderizar formulários com 50 campos em < 200ms

### Escalabilidade
- PostgreSQL com até 100 GB
- 1 milhão de instances por object_definition
- 10 milhões de relationships

### Confiabilidade
- Uptime > 99% (ambiente dev/staging)
- Zero data loss (transações ACID)
- Backup diário automático

### Segurança
- ❌ SEM autenticação nesta fase (será responsabilidade das aplicações)
- ✅ Input validation (prevenir SQL injection)
- ✅ HTTPS obrigatório (produção)

---

## 4. Testes Obrigatórios

### Backend
- [ ] Testes unitários (coverage > 80%)
- [ ] Testes de integração (15 endpoints)
- [ ] Testes de validação JSON Schema
- [ ] Testes de FSM (transições válidas/inválidas)
- [ ] Testes de relacionamentos (cardinalidade)

### Frontend
- [ ] Testes de renderização de widgets
- [ ] Testes de validação client-side
- [ ] Testes E2E (criar objeto → instância → relacionamento)

### Cenário Crítico
**Teste completo**:
1. Criar `object_definition: cliente_pf` (via Assistente)
2. Criar 3 instâncias (João, Maria, Pedro)
3. Transicionar estado (PENDENTE → ATIVO)
4. Criar relacionamento (João TITULAR_DE Conta-123)
5. Consultar via RAG: "Quantos clientes ativos?"

**Resultado esperado**: Todos os passos executam sem erro.

---

## 5. Critérios de Aceitação

### Deve Funcionar
- ✅ Time de Produto cria objeto em < 15min (sem devs)
- ✅ Formulário renderiza todos os widgets corretamente
- ✅ Validações BACEN (CPF, CNPJ) funcionam
- ✅ 100 instâncias criadas sem erros
- ✅ RAG responde 10 perguntas com precisão > 90%
- ✅ Grafo renderiza 500 nós sem lag

### Não Deve Permitir
- ❌ Criar instance com dados inválidos (schema violation)
- ❌ Transição FSM inválida (estado órfão)
- ❌ Relacionamento entre instances deletadas
- ❌ Código hardcoded de domínio específico

---

## 6. Dependências

### Externas
- PostgreSQL 15+ (com JSONB + pgvector)
- Go 1.21+
- Node.js 20+
- Docker + Docker Compose

### Integrações (Fase 1)
- **LLM**: Claude 3.5 Sonnet / GPT-4 Turbo (API)
- **Embeddings**: OpenAI text-embedding-3-small

### Bloqueadores
- Nenhum bloqueador identificado

---

## 7. Fora do Escopo (Fase 1)

**NÃO será implementado nesta fase**:
- ❌ Autenticação/Autorização
- ❌ Multi-tenancy
- ❌ Audit log completo
- ❌ Integrações externas (BACEN, TigerBeetle)
- ❌ Portais de cliente/backoffice
- ❌ Notificações (email, SMS, push)
- ❌ Workflows complexos (Orquestração de Sagas)
- ❌ Cálculo de tarifas/comissões
- ❌ Compliance automático

---

## 8. Próximos Passos

1. **Revisão destas especificações** (você + time técnico)
2. **Documento de dúvidas** (02_duvidas_especificacoes.md)
3. **Aprovação formal** (03_aprovacao.md)
4. **Planejamento de sprints** (04_planejamento_sprints.md)
5. **Definição de squads** (05_composicao_squads.md)
6. **Início da implementação**

---

## Referências

- [Visão de Arquitetura](../../architecture/visao_arquitetura.md)
- [CLAUDE.md](../../../CLAUDE.md) - Guia completo
- [Backlog Geral](../../backlog/backlog_geral.md)

---

**Aguardando**: Revisão e aprovação para prosseguir ao planejamento de sprints.
