# FASE 1: FOUNDATION - Escopo Técnico e Funcional Completo

## 📋 SUMÁRIO EXECUTIVO

**Objetivo**: Implementar a fundação da plataforma - uma Máquina Universal de Gestão de Entidades que permite ao time de Produto/Compliance criar objetos de negócio através de linguagem natural, sem necessidade de desenvolvedores.

**Duração**: 12 semanas (3 sprints de 4 semanas cada)
**Squad**: 8 agentes especializados + 1 Scrum Master + 1 Product Owner
**Entregável Final**: Portal Backoffice funcional com criação de objetos via assistente e CRUD completo de instâncias

---

## 🎯 OBJETIVOS DA FASE 1

### Objetivos de Negócio

1. **Empoderar time não-técnico**: Produto e Compliance criam objetos sem desenvolvedores
2. **Provar o conceito meta**: Demonstrar que tudo (dados, regras, integrações) pode ser objeto
3. **Base para Core Banking**: Fundação sólida para as fases 2, 3 e 4

### Objetivos Técnicos

1. **Database genérico**: PostgreSQL com 4 tabelas mestras (`object_definitions`, `instances`, `relationships`, `validation_rules`)
2. **API Universal**: Go com endpoints genéricos que funcionam para qualquer objeto
3. **Assistente NL**: Interface conversacional que transforma linguagem natural em `object_definition`
4. **UI Dinâmica**: Next.js que renderiza formulários automaticamente a partir de JSON Schema
5. **RAG Básico**: Pipeline trimodal (SQL + Graph + Vector) que entende objetos e instâncias

---

## 🏗️ ARQUITETURA TÉCNICA DETALHADA

### Stack Tecnológica

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
├─────────────────────────────────────────────────────────┤
│  Next.js 14+ (App Router)                               │
│  React 18+                                               │
│  shadcn/ui + Tailwind CSS                                │
│  React Flow (visualização de grafo)                     │
│  React Query (cache + state)                            │
│  Monaco Editor (JSON/code editing)                      │
│  Zod (validação)                                         │
└─────────────────────────────────────────────────────────┘
                         ↕ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│                    BACKEND (API)                         │
├─────────────────────────────────────────────────────────┤
│  Go 1.21+                                                │
│  Gin (HTTP framework)                                    │
│  gojsonschema (validação JSON Schema)                   │
│  pgx (PostgreSQL driver)                                 │
│  OpenAI/Anthropic SDK (LLM para assistente)             │
└─────────────────────────────────────────────────────────┘
                         ↕ SQL
┌─────────────────────────────────────────────────────────┐
│                    DATABASE                              │
├─────────────────────────────────────────────────────────┤
│  PostgreSQL 15+                                          │
│  Extensões: pgvector, pg_trgm                            │
│  Índices GIN para JSONB                                  │
└─────────────────────────────────────────────────────────┘
```

### Schema do Banco de Dados (Detalhado)

```sql
-- ============================================
-- SCHEMA COMPLETO - FASE 1
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- TABELA 1: object_definitions
-- ============================================
CREATE TABLE object_definitions (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    version INT DEFAULT 1,

    -- Schema (estrutura)
    schema JSONB NOT NULL,

    -- Validações e enriquecimentos
    rules JSONB DEFAULT '[]'::jsonb,

    -- Máquina de estados
    states JSONB DEFAULT '{
        "initial": "DRAFT",
        "states": ["DRAFT", "ACTIVE"],
        "transitions": []
    }'::jsonb,

    -- UI hints
    ui_hints JSONB DEFAULT '{}'::jsonb,

    -- Relacionamentos permitidos
    relationships JSONB DEFAULT '[]'::jsonb,

    -- Categorização
    category VARCHAR(50) DEFAULT 'BUSINESS_ENTITY',
    -- BUSINESS_ENTITY, RULE, POLICY, INTEGRATION, LOGIC

    -- Metadados
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Controle
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    parent_version_id UUID REFERENCES object_definitions(id),

    -- Constraints
    CONSTRAINT valid_name CHECK (name ~ '^[a-z][a-z0-9_]*$'),
    CONSTRAINT valid_version CHECK (version > 0),
    CONSTRAINT valid_schema CHECK (jsonb_typeof(schema) = 'object')
);

-- Índices para performance
CREATE INDEX idx_object_definitions_name ON object_definitions(name) WHERE is_active = true;
CREATE INDEX idx_object_definitions_category ON object_definitions(category);
CREATE INDEX idx_object_definitions_created_at ON object_definitions(created_at DESC);
CREATE INDEX idx_object_definitions_schema_gin ON object_definitions USING GIN (schema jsonb_path_ops);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_object_definitions_updated_at BEFORE UPDATE
    ON object_definitions FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA 2: instances
-- ============================================
CREATE TABLE instances (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_definition_id UUID NOT NULL REFERENCES object_definitions(id),

    -- Dados (flexível)
    data JSONB NOT NULL,

    -- Estado (FSM)
    current_state VARCHAR(50) NOT NULL,
    state_history JSONB DEFAULT '[]'::jsonb,

    -- Versionamento
    version INT DEFAULT 1,

    -- Metadados
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Soft delete
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by UUID,

    -- Constraints
    CONSTRAINT valid_version CHECK (version > 0),
    CONSTRAINT valid_data CHECK (jsonb_typeof(data) = 'object')
);

-- Índices para performance
CREATE INDEX idx_instances_object_def ON instances(object_definition_id)
    WHERE is_deleted = false;
CREATE INDEX idx_instances_state ON instances(current_state)
    WHERE is_deleted = false;
CREATE INDEX idx_instances_created_at ON instances(created_at DESC);
CREATE INDEX idx_instances_data_gin ON instances USING GIN (data jsonb_path_ops);

-- Índices para queries comuns em JSONB
-- (Adicionar conforme necessário para campos específicos)
-- Exemplo: CREATE INDEX idx_instances_data_cpf ON instances ((data->>'cpf'));

-- Trigger para updated_at
CREATE TRIGGER update_instances_updated_at BEFORE UPDATE
    ON instances FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA 3: relationships
-- ============================================
CREATE TABLE relationships (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_type VARCHAR(100) NOT NULL,

    -- Vértices
    source_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    target_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,

    -- Propriedades da relação
    properties JSONB DEFAULT '{}'::jsonb,

    -- Vigência temporal
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,

    -- Metadados
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_by UUID,
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    UNIQUE(relationship_type, source_instance_id, target_instance_id),
    CONSTRAINT no_self_reference CHECK (source_instance_id != target_instance_id),
    CONSTRAINT valid_temporal_range CHECK (
        valid_until IS NULL OR valid_from IS NULL OR valid_until > valid_from
    )
);

-- Índices para navegação no grafo
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_temporal ON relationships(valid_from, valid_until)
    WHERE valid_from IS NOT NULL;

-- Trigger para updated_at
CREATE TRIGGER update_relationships_updated_at BEFORE UPDATE
    ON relationships FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA 4: validation_rules
-- ============================================
CREATE TABLE validation_rules (
    -- Identificação
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    description TEXT,

    -- Tipo de regra
    rule_type VARCHAR(50) NOT NULL,
    -- "regex", "function", "api_call", "database_query"

    -- Configuração (varia por tipo)
    config JSONB NOT NULL,

    -- Metadados
    is_system BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_rule_type CHECK (
        rule_type IN ('regex', 'function', 'api_call', 'database_query', 'custom')
    )
);

-- Índices
CREATE INDEX idx_validation_rules_name ON validation_rules(name) WHERE is_active = true;
CREATE INDEX idx_validation_rules_type ON validation_rules(rule_type);

-- Trigger para updated_at
CREATE TRIGGER update_validation_rules_updated_at BEFORE UPDATE
    ON validation_rules FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABELA 5: audit_log (Rastreabilidade)
-- ============================================
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- O que foi modificado
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,

    -- Tipo de operação
    operation VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE

    -- Estado anterior e novo
    old_data JSONB,
    new_data JSONB,

    -- Quem fez
    user_id UUID,
    user_email VARCHAR(255),

    -- Quando
    timestamp TIMESTAMP DEFAULT NOW(),

    -- Contexto adicional
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE'))
);

-- Índices para consultas de auditoria
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- ============================================
-- SEED: validation_rules BACEN
-- ============================================
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system) VALUES
-- CPF
('cpf_format', 'CPF - Formato', 'Valida formato de CPF (11 dígitos)', 'regex',
 '{"pattern": "^\\d{11}$", "error_message": "CPF deve ter 11 dígitos numéricos"}', true),

('cpf_digits', 'CPF - Dígitos Verificadores', 'Valida dígitos verificadores do CPF', 'function',
 '{"language": "javascript", "code": "function validateCPF(cpf) { if (cpf.length !== 11) return false; let sum = 0; for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i); let digit1 = (sum * 10) % 11; if (digit1 === 10) digit1 = 0; if (digit1 !== parseInt(cpf[9])) return false; sum = 0; for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i); let digit2 = (sum * 10) % 11; if (digit2 === 10) digit2 = 0; return digit2 === parseInt(cpf[10]); }", "error_message": "CPF inválido (dígitos verificadores incorretos)"}', true),

-- CNPJ
('cnpj_format', 'CNPJ - Formato', 'Valida formato de CNPJ (14 dígitos)', 'regex',
 '{"pattern": "^\\d{14}$", "error_message": "CNPJ deve ter 14 dígitos numéricos"}', true),

-- Email
('email_format', 'Email - Formato RFC 5322', 'Valida formato de email', 'regex',
 '{"pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$", "error_message": "Email em formato inválido"}', true),

-- Telefone BR
('phone_br', 'Telefone BR - Formato', 'Valida telefone brasileiro (10 ou 11 dígitos)', 'regex',
 '{"pattern": "^\\d{10,11}$", "error_message": "Telefone deve ter 10 ou 11 dígitos"}', true),

-- CEP
('cep_format', 'CEP - Formato', 'Valida formato de CEP (8 dígitos)', 'regex',
 '{"pattern": "^\\d{8}$", "error_message": "CEP deve ter 8 dígitos"}', true),

-- Idade mínima
('idade_minima_18', 'Idade Mínima - 18 anos', 'Valida idade mínima de 18 anos', 'function',
 '{"language": "javascript", "code": "function validateAge(birthDate) { const birth = new Date(birthDate); const today = new Date(); const age = (today - birth) / (1000 * 60 * 60 * 24 * 365.25); return age >= 18; }", "error_message": "Idade mínima: 18 anos"}', true),

-- Valor monetário positivo
('valor_positivo', 'Valor Positivo', 'Valida que valor é maior que zero', 'function',
 '{"language": "javascript", "code": "function validatePositive(value) { return parseFloat(value) > 0; }", "error_message": "Valor deve ser maior que zero"}', true);
```

### API Endpoints (Especificação OpenAPI)

```yaml
openapi: 3.0.0
info:
  title: Universal Objects API
  version: 1.0.0
  description: API genérica para gestão de object_definitions e instances

servers:
  - url: http://localhost:8080/api/v1

paths:
  # ========================================
  # OBJECT DEFINITIONS
  # ========================================
  /object-definitions:
    get:
      summary: Lista object_definitions
      parameters:
        - name: category
          in: query
          schema:
            type: string
            enum: [BUSINESS_ENTITY, RULE, POLICY, INTEGRATION, LOGIC]
        - name: is_active
          in: query
          schema:
            type: boolean
        - name: search
          in: query
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        200:
          description: Lista de object_definitions
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/ObjectDefinition'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

    post:
      summary: Cria object_definition
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateObjectDefinitionRequest'
      responses:
        201:
          description: Object definition criada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ObjectDefinition'
        400:
          description: Validação falhou
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /object-definitions/{id}:
    get:
      summary: Busca object_definition por ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Object definition encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ObjectDefinition'
        404:
          description: Não encontrada

    put:
      summary: Atualiza object_definition
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateObjectDefinitionRequest'
      responses:
        200:
          description: Atualizada com sucesso

    delete:
      summary: Deleta object_definition (soft delete)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        204:
          description: Deletada com sucesso

  # ========================================
  # INSTANCES
  # ========================================
  /instances:
    get:
      summary: Lista instances
      parameters:
        - name: object_definition_id
          in: query
          required: true
          schema:
            type: string
            format: uuid
        - name: state
          in: query
          schema:
            type: string
        - name: search
          in: query
          description: Busca em campos JSONB
          schema:
            type: string
        - name: filters
          in: query
          description: Filtros JSONB (JSON encoded)
          schema:
            type: string
        - name: page
          in: query
          schema:
            type: integer
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        200:
          description: Lista de instances
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/Instance'
                  pagination:
                    $ref: '#/components/schemas/Pagination'

    post:
      summary: Cria instance
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateInstanceRequest'
      responses:
        201:
          description: Instance criada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Instance'

  /instances/{id}:
    get:
      summary: Busca instance por ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: Instance encontrada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Instance'

    put:
      summary: Atualiza instance
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateInstanceRequest'
      responses:
        200:
          description: Atualizada com sucesso

  /instances/{id}/state:
    post:
      summary: Transição de estado (FSM)
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                event:
                  type: string
                metadata:
                  type: object
      responses:
        200:
          description: Transição executada

  # ========================================
  # RELATIONSHIPS
  # ========================================
  /relationships:
    get:
      summary: Lista relationships
      parameters:
        - name: source_instance_id
          in: query
          schema:
            type: string
            format: uuid
        - name: target_instance_id
          in: query
          schema:
            type: string
            format: uuid
        - name: relationship_type
          in: query
          schema:
            type: string
      responses:
        200:
          description: Lista de relationships

    post:
      summary: Cria relationship
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateRelationshipRequest'
      responses:
        201:
          description: Relationship criada

  # ========================================
  # ASSISTENTE (NL → object_definition)
  # ========================================
  /assistant/conversations:
    post:
      summary: Inicia conversa com assistente
      responses:
        201:
          description: Conversa iniciada
          content:
            application/json:
              schema:
                type: object
                properties:
                  conversation_id:
                    type: string
                    format: uuid
                  first_question:
                    type: string

  /assistant/conversations/{id}/answer:
    post:
      summary: Responde pergunta do assistente
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                answer:
                  type: string
      responses:
        200:
          description: Próxima pergunta ou resultado final
          content:
            application/json:
              schema:
                type: object
                properties:
                  next_question:
                    type: string
                  is_complete:
                    type: boolean
                  preview:
                    type: object

  /assistant/conversations/{id}/confirm:
    post:
      summary: Confirma criação do object_definition
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        201:
          description: Object definition criada
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ObjectDefinition'

components:
  schemas:
    ObjectDefinition:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        display_name:
          type: string
        description:
          type: string
        version:
          type: integer
        schema:
          type: object
        rules:
          type: array
        states:
          type: object
        ui_hints:
          type: object
        relationships:
          type: array
        category:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Instance:
      type: object
      properties:
        id:
          type: string
          format: uuid
        object_definition_id:
          type: string
          format: uuid
        data:
          type: object
        current_state:
          type: string
        state_history:
          type: array
        version:
          type: integer
        created_at:
          type: string
          format: date-time

    CreateObjectDefinitionRequest:
      type: object
      required:
        - name
        - display_name
        - schema
      properties:
        name:
          type: string
        display_name:
          type: string
        description:
          type: string
        schema:
          type: object
        rules:
          type: array
        states:
          type: object
        ui_hints:
          type: object
        relationships:
          type: array
        category:
          type: string

    CreateInstanceRequest:
      type: object
      required:
        - object_definition_id
        - data
      properties:
        object_definition_id:
          type: string
          format: uuid
        data:
          type: object

    CreateRelationshipRequest:
      type: object
      required:
        - relationship_type
        - source_instance_id
        - target_instance_id
      properties:
        relationship_type:
          type: string
        source_instance_id:
          type: string
          format: uuid
        target_instance_id:
          type: string
          format: uuid
        properties:
          type: object

    Pagination:
      type: object
      properties:
        page:
          type: integer
        limit:
          type: integer
        total:
          type: integer
        total_pages:
          type: integer

    Error:
      type: object
      properties:
        error:
          type: string
        details:
          type: object
```

---

## 👥 DEFINIÇÃO DA SQUAD

### Composição do Time

```
┌─────────────────────────────────────────────────────────┐
│                    SQUAD FASE 1                         │
│                  (10 membros totais)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  GESTÃO (2)                                             │
│  ├─ Scrum Master / Orchestrator                        │
│  └─ Product Owner / Project Manager                    │
│                                                         │
│  BACKEND (3)                                            │
│  ├─ Backend Architect (líder técnico)                  │
│  ├─ Golang Pro (API implementation)                    │
│  └─ Database Architect                                 │
│                                                         │
│  FRONTEND (2)                                           │
│  ├─ Frontend Developer (líder)                         │
│  └─ UI/UX Designer                                     │
│                                                         │
│  AI/DATA (2)                                            │
│  ├─ AI Engineer (assistente NL + RAG)                  │
│  └─ Prompt Engineer                                    │
│                                                         │
│  QUALIDADE (1)                                          │
│  └─ Test Automator                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Papéis e Responsabilidades Detalhadas

#### 1. **Scrum Master / Orchestrator** (`tdd-orchestrator`)

**Responsabilidades**:
- Facilitar cerimônias ágeis (daily, planning, retro, review)
- Remover impedimentos
- Orquestrar trabalho entre agentes
- Garantir práticas TDD
- Manter métricas de velocity e burn-down

**Entregas da Fase 1**:
- [ ] 3 Sprint Plannings executados
- [ ] 36 Daily Stand-ups facilitados (12 semanas)
- [ ] 3 Sprint Reviews
- [ ] 3 Sprint Retrospectives
- [ ] Backlog priorizado e atualizado diariamente
- [ ] Relatório de velocity por sprint

---

#### 2. **Product Owner / Project Manager** (`gerente-projeto`)

**Responsabilidades**:
- Manter backlog priorizado
- Definir critérios de aceitação
- Validar entregas
- Interface com stakeholders (time de Produto/Compliance real)
- Garantir alinhamento com visão do produto

**Entregas da Fase 1**:
- [ ] Backlog inicial (100+ stories)
- [ ] User stories com critérios de aceitação
- [ ] Product roadmap atualizado
- [ ] Demos para stakeholders (3 demos de sprint)
- [ ] Documento de requisitos validados

---

#### 3. **Backend Architect** (`backend-architect`)

**Responsabilidades**:
- Design da arquitetura backend
- Definir padrões de código Go
- Revisar PRs críticos
- Garantir escalabilidade e performance
- Mentoria técnica do time backend

**Entregas da Fase 1**:
- [ ] Arquitetura detalhada (diagrama C4)
- [ ] ADRs (Architecture Decision Records) - mínimo 5
- [ ] API design guidelines
- [ ] Performance benchmarks (targets definidos)
- [ ] Código de infraestrutura (Docker, k8s configs)

---

#### 4. **Golang Pro** (`golang-pro`)

**Responsabilidades**:
- Implementar API endpoints
- Validação de JSON Schema
- Integração com PostgreSQL
- Testes unitários e de integração
- Documentação de código

**Entregas da Fase 1**:
- [ ] 15+ endpoints REST implementados
- [ ] Validators genéricos (JSON Schema)
- [ ] CRUD completo para 4 tabelas
- [ ] 200+ testes unitários (coverage > 80%)
- [ ] Swagger/OpenAPI spec atualizada

---

#### 5. **Database Architect** (`database-architect`)

**Responsabilidades**:
- Schema design (normalização, índices)
- Otimização de queries
- Estratégia de backup e recovery
- Migrations versionadas
- Monitoramento de performance

**Entregas da Fase 1**:
- [ ] Schema completo (4 tabelas + triggers)
- [ ] 20+ índices otimizados
- [ ] Seed data (validation_rules BACEN)
- [ ] Migration scripts (up/down)
- [ ] Query optimization report

---

#### 6. **Frontend Developer** (`frontend-developer`)

**Responsabilidades**:
- Implementar componentes React
- Dynamic form rendering
- Integração com API
- State management (React Query)
- Responsividade e acessibilidade

**Entregas da Fase 1**:
- [ ] 30+ componentes React
- [ ] DynamicInstanceForm (100% genérico)
- [ ] 10+ widgets (CPF, currency, date, etc)
- [ ] RelationshipPicker component
- [ ] Graph visualization (React Flow básico)

---

#### 7. **UI/UX Designer** (`ui-ux-designer`)

**Responsabilidades**:
- Design system
- Wireframes e protótipos (Figma)
- Usability testing
- Design de fluxos de navegação
- Acessibilidade (WCAG 2.1)

**Entregas da Fase 1**:
- [ ] Design system completo (Figma)
- [ ] 20+ telas desenhadas
- [ ] Protótipo interativo (assistente NL)
- [ ] 3 rodadas de usability testing
- [ ] Guia de estilo (cores, tipografia, espaçamento)

---

#### 8. **AI Engineer** (`ai-engineer`)

**Responsabilidades**:
- Implementar assistente NL
- Pipeline RAG trimodal
- Integração com LLMs (Claude/GPT)
- Embeddings e vector search
- Prompt engineering

**Entregas da Fase 1**:
- [ ] Assistente conversacional (7 perguntas)
- [ ] Schema generator (NL → JSON Schema)
- [ ] RAG básico (SQL + Graph queries)
- [ ] Vector store (pgvector setup)
- [ ] Accuracy report (>90% em testes)

---

#### 9. **Prompt Engineer** (`prompt-engineer`)

**Responsabilidades**:
- Otimizar prompts do assistente
- Criar system prompts
- Few-shot examples
- Avaliação de outputs
- Redução de alucinações

**Entregas da Fase 1**:
- [ ] 10+ prompts otimizados
- [ ] Biblioteca de few-shot examples
- [ ] Prompt testing framework
- [ ] Guia de prompt engineering
- [ ] Evaluation metrics (precision, recall)

---

#### 10. **Test Automator** (`test-automator`)

**Responsabilidades**:
- Estratégia de testes
- Testes E2E (Playwright)
- CI/CD pipelines
- Test data management
- Smoke tests e regression tests

**Entregas da Fase 1**:
- [ ] 50+ testes E2E
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Test coverage report (>80%)
- [ ] Performance tests (load testing)
- [ ] Smoke test suite (execução < 5min)

---

## 📅 CRONOGRAMA DETALHADO (12 Semanas)

### Sprint 1: Foundation (Semanas 1-4)

**Objetivo**: Database + API básica + Setup do projeto

#### Semana 1: Setup e Database

**Stories**:
```
STORY-001: Setup do repositório Git
  ├─ Task: Criar repo + README
  ├─ Task: Setup .gitignore, .editorconfig
  ├─ Task: Definir branch strategy (Gitflow)
  └─ Estimation: 2 pontos

STORY-002: Setup ambiente de desenvolvimento
  ├─ Task: Docker Compose (Postgres + Redis)
  ├─ Task: Scripts de setup (./scripts/dev-setup.sh)
  ├─ Task: Documentação de onboarding
  └─ Estimation: 3 pontos

STORY-003: Schema do banco de dados
  ├─ Task: Criar migrations (golang-migrate)
  ├─ Task: Implementar 4 tabelas principais
  ├─ Task: Criar índices GIN e B-tree
  ├─ Task: Triggers (updated_at, audit_log)
  └─ Estimation: 8 pontos

STORY-004: Seed de validation_rules
  ├─ Task: Inserir 8 regras BACEN
  ├─ Task: Testes de validação
  └─ Estimation: 3 pontos
```

**Entregáveis da Semana 1**:
- ✅ Repositório Git configurado
- ✅ Docker Compose funcional
- ✅ PostgreSQL com schema completo
- ✅ Seed de validation_rules

---

#### Semana 2: API Core

**Stories**:
```
STORY-005: Setup projeto Go
  ├─ Task: Estrutura de pastas (cmd, internal, pkg)
  ├─ Task: Setup Gin framework
  ├─ Task: Configuração (viper)
  ├─ Task: Logger (zerolog)
  └─ Estimation: 5 pontos

STORY-006: Endpoints object_definitions
  ├─ Task: POST /api/v1/object-definitions
  ├─ Task: GET /api/v1/object-definitions
  ├─ Task: GET /api/v1/object-definitions/:id
  ├─ Task: PUT /api/v1/object-definitions/:id
  ├─ Task: DELETE /api/v1/object-definitions/:id (soft delete)
  └─ Estimation: 13 pontos

STORY-007: Validação de JSON Schema
  ├─ Task: Integrar gojsonschema
  ├─ Task: Validator genérico
  ├─ Task: Testes unitários (20+ casos)
  └─ Estimation: 8 pontos
```

**Entregáveis da Semana 2**:
- ✅ API Go estruturada
- ✅ CRUD de object_definitions
- ✅ Validador de JSON Schema

---

#### Semana 3: Instances API

**Stories**:
```
STORY-008: Endpoints instances
  ├─ Task: POST /api/v1/instances
  ├─ Task: GET /api/v1/instances (com filtros JSONB)
  ├─ Task: GET /api/v1/instances/:id
  ├─ Task: PUT /api/v1/instances/:id
  ├─ Task: DELETE /api/v1/instances/:id
  └─ Estimation: 13 pontos

STORY-009: Validação de instances contra schema
  ├─ Task: Buscar object_definition
  ├─ Task: Validar data contra schema
  ├─ Task: Aplicar validation_rules
  ├─ Task: Error handling detalhado
  └─ Estimation: 8 pontos

STORY-010: State machine engine
  ├─ Task: FSM validator
  ├─ Task: POST /api/v1/instances/:id/state
  ├─ Task: State history tracking
  └─ Estimation: 8 pontos
```

**Entregáveis da Semana 3**:
- ✅ CRUD de instances
- ✅ Validação completa
- ✅ FSM engine básico

---

#### Semana 4: Relationships + Sprint Review

**Stories**:
```
STORY-011: Endpoints relationships
  ├─ Task: POST /api/v1/relationships
  ├─ Task: GET /api/v1/relationships
  ├─ Task: Validação de cardinalidade
  ├─ Task: Detecção de ciclos (básica)
  └─ Estimation: 13 pontos

STORY-012: Testes de integração
  ├─ Task: Setup testcontainers
  ├─ Task: 30+ integration tests
  ├─ Task: CI pipeline (GitHub Actions)
  └─ Estimation: 8 pontos

STORY-013: Documentação API
  ├─ Task: Swagger/OpenAPI completo
  ├─ Task: Postman collection
  ├─ Task: README técnico
  └─ Estimation: 5 pontos
```

**Entregáveis da Semana 4**:
- ✅ API de relationships
- ✅ Testes de integração
- ✅ Documentação completa

**Sprint 1 Review**: Demo da API funcionando com Postman/curl

---

### Sprint 2: Assistente + UI Core (Semanas 5-8)

#### Semana 5: Assistente NL - Backend

**Stories**:
```
STORY-014: Assistente conversacional - Infra
  ├─ Task: Tabela conversations (state machine)
  ├─ Task: Endpoints /assistant/conversations
  ├─ Task: Integração Claude/GPT SDK
  └─ Estimation: 8 pontos

STORY-015: Schema generator (NL → JSON Schema)
  ├─ Task: Prompt engineering (system prompt)
  ├─ Task: Few-shot examples
  ├─ Task: Parser de resposta LLM
  ├─ Task: Validação de schema gerado
  └─ Estimation: 13 pontos

STORY-016: FSM generator
  ├─ Task: Extrair estados de texto NL
  ├─ Task: Gerar transitions
  ├─ Task: Validação de FSM
  └─ Estimation: 8 pontos
```

---

#### Semana 6: Assistente NL - Frontend

**Stories**:
```
STORY-017: Setup projeto Next.js
  ├─ Task: Create Next.js app (App Router)
  ├─ Task: Setup Tailwind + shadcn/ui
  ├─ Task: Estrutura de pastas
  └─ Estimation: 5 pontos

STORY-018: Componente AssistantConversation
  ├─ Task: Interface de chat
  ├─ Task: Integração com API
  ├─ Task: State management (zustand)
  ├─ Task: Animações (framer-motion)
  └─ Estimation: 13 pontos

STORY-019: Preview de object_definition
  ├─ Task: Visualização de schema
  ├─ Task: Preview de FSM (React Flow)
  ├─ Task: Botão confirmar/editar
  └─ Estimation: 8 pontos
```

---

#### Semana 7: Dynamic UI Core

**Stories**:
```
STORY-020: DynamicInstanceForm component
  ├─ Task: Schema parser
  ├─ Task: Field renderer genérico
  ├─ Task: Validação client-side (Zod)
  └─ Estimation: 13 pontos

STORY-021: Widget library (Parte 1)
  ├─ Task: text, number, boolean widgets
  ├─ Task: date, select widgets
  ├─ Task: Máscaras (CPF, telefone)
  └─ Estimation: 8 pontos

STORY-022: Widget library (Parte 2)
  ├─ Task: currency widget
  ├─ Task: address widget (ViaCEP)
  ├─ Task: relationship picker (básico)
  └─ Estimation: 8 pontos
```

---

#### Semana 8: Pages + Sprint Review

**Stories**:
```
STORY-023: Back Section - Object Definitions
  ├─ Task: Lista de object_definitions
  ├─ Task: Página de criação (assistente)
  ├─ Task: Página de edição
  └─ Estimation: 13 pontos

STORY-024: Front Section - Instances
  ├─ Task: Seletor de tipo de objeto
  ├─ Task: Lista de instances (tabela)
  ├─ Task: Página de criação (dynamic form)
  ├─ Task: Página de detalhes
  └─ Estimation: 13 pontos

STORY-025: Navegação e layout
  ├─ Task: Sidebar navigation
  ├─ Task: Header com breadcrumbs
  ├─ Task: Responsividade mobile
  └─ Estimation: 8 pontos
```

**Sprint 2 Review**: Demo end-to-end (criar objeto via assistente + criar instance)

---

### Sprint 3: Graph + RAG + Polish (Semanas 9-12)

#### Semana 9: Visualização de Grafo

**Stories**:
```
STORY-026: React Flow integration
  ├─ Task: Setup React Flow
  ├─ Task: Custom node types
  ├─ Task: Custom edge types
  └─ Estimation: 8 pontos

STORY-027: Graph data fetching
  ├─ Task: Endpoint /api/v1/graph/context
  ├─ Task: Algoritmo de layout (dagre)
  ├─ Task: Lazy loading de nós
  └─ Estimation: 13 pontos

STORY-028: Graph interactions
  ├─ Task: Click em nó (centralizar)
  ├─ Task: Tooltip com detalhes
  ├─ Task: Filtros (tipo de relação)
  └─ Estimation: 8 pontos
```

---

#### Semana 10: RAG Básico

**Stories**:
```
STORY-029: Vector store (pgvector)
  ├─ Task: Extension pgvector
  ├─ Task: Tabela document_embeddings
  ├─ Task: Seed com docs iniciais
  └─ Estimation: 5 pontos

STORY-030: RAG pipeline
  ├─ Task: Entity extraction (LLM)
  ├─ Task: SQL query builder
  ├─ Task: Graph query builder
  ├─ Task: Vector similarity search
  └─ Estimation: 13 pontos

STORY-031: Chat interface
  ├─ Task: Componente ChatWindow
  ├─ Task: Integração com RAG API
  ├─ Task: Streaming de respostas
  └─ Estimation: 8 pontos
```

---

#### Semana 11: Testes E2E + Performance

**Stories**:
```
STORY-032: Testes E2E (Playwright)
  ├─ Task: Setup Playwright
  ├─ Task: 20+ cenários E2E
  ├─ Task: CI integration
  └─ Estimation: 13 pontos

STORY-033: Performance testing
  ├─ Task: Load tests (k6)
  ├─ Task: Benchmarks (targets: <200ms p95)
  ├─ Task: Optimization (índices, caching)
  └─ Estimation: 8 pontos

STORY-034: Security testing
  ├─ Task: SQL injection tests
  ├─ Task: XSS protection
  ├─ Task: CSRF tokens
  └─ Estimation: 5 pontos
```

---

#### Semana 12: Polish + Sprint Review Final

**Stories**:
```
STORY-035: UI polish
  ├─ Task: Loading states
  ├─ Task: Error boundaries
  ├─ Task: Toast notifications
  ├─ Task: Skeleton loaders
  └─ Estimation: 8 pontos

STORY-036: Documentação final
  ├─ Task: User guide
  ├─ Task: Developer docs
  ├─ Task: API reference
  ├─ Task: Video tutorial (5min)
  └─ Estimation: 8 pontos

STORY-037: Deployment pipeline
  ├─ Task: Dockerfile (prod)
  ├─ Task: Kubernetes manifests
  ├─ Task: CI/CD completo
  └─ Estimation: 8 pontos
```

**Sprint 3 Review**: Demo completa da Fase 1 para stakeholders

---

## 🎯 CRITÉRIOS DE ACEITAÇÃO DA FASE 1

### Funcionalidades Obrigatórias

#### 1. **Back Section (Criação de Objetos)**

- [ ] Assistente conversacional funcional (7 perguntas)
- [ ] Gera JSON Schema válido a partir de NL
- [ ] Preview de object_definition antes de criar
- [ ] Edição manual de schema (Monaco Editor)
- [ ] Validação de schema (sem estados órfãos)
- [ ] FSM visual (diagrama)

**Teste de Aceitação**:
```
Cenário: Time de Produto cria "Cliente PF" via assistente
DADO que o usuário está na página "Criar Objeto"
QUANDO ele responde 7 perguntas sobre "Cliente PF"
E confirma o preview
ENTÃO um object_definition válido é criado
E aparece na lista de objetos
E pode ser usado para criar instances
```

---

#### 2. **Front Section (Gestão de Instâncias)**

- [ ] Seletor de tipo de objeto (dropdown)
- [ ] Lista de instances com filtros e busca
- [ ] Formulário dinâmico 100% genérico
- [ ] 10+ widgets funcionais (CPF, currency, date, etc)
- [ ] Validação client + server side
- [ ] Criação/edição/exclusão de instances

**Teste de Aceitação**:
```
Cenário: Criar 100 instâncias de "Cliente PF"
DADO que existe um object_definition "cliente_pf"
QUANDO o usuário cria 100 clientes via formulário
ENTÃO todas as 100 instances são validadas corretamente
E aparecem na lista filtráveis por estado/campos
E nenhum erro de validação ocorre
```

---

#### 3. **Relacionamentos**

- [ ] Criar relacionamento entre instances
- [ ] Widget RelationshipPicker funcional
- [ ] Validação de cardinalidade
- [ ] Navegação no grafo (React Flow)
- [ ] Filtros por tipo de relação

**Teste de Aceitação**:
```
Cenário: Vincular Cliente a Conta
DADO que existe uma instance "Maria Silva" (Cliente)
E existe uma instance "Conta 12345-6" (Conta Corrente)
QUANDO o usuário edita a conta
E seleciona "Maria Silva" como titular
ENTÃO um relacionamento TITULAR_DE é criado
E aparece no grafo visual
```

---

#### 4. **RAG Básico**

- [ ] Pergunta em linguagem natural
- [ ] Extrai entidades da pergunta
- [ ] Consulta SQL dinâmica
- [ ] Consulta grafo (relacionamentos)
- [ ] Resposta sintetizada pelo LLM

**Teste de Aceitação**:
```
Cenário: RAG responde "Quantos clientes ativos?"
DADO que existem 47 instances de "cliente_pf" em estado ATIVO
QUANDO o usuário pergunta "Quantos clientes ativos temos?"
ENTÃO o RAG consulta o banco
E responde "Temos 47 clientes ativos no sistema."
E a precisão é > 90%
```

---

### Métricas de Qualidade

#### Performance
- [ ] API: p95 < 200ms (endpoints CRUD)
- [ ] Frontend: First Contentful Paint < 1.5s
- [ ] Database: Query p95 < 50ms

#### Testes
- [ ] Backend: Coverage > 80%
- [ ] Frontend: Coverage > 70%
- [ ] E2E: 50+ cenários passando

#### Segurança
- [ ] SQL injection: 0 vulnerabilidades
- [ ] XSS: sanitização completa
- [ ] Secrets: não commitados no Git

#### Documentação
- [ ] API: 100% endpoints documentados (OpenAPI)
- [ ] Code: Funções públicas comentadas
- [ ] User Guide: 10+ páginas

---

## 📊 ESTRUTURA DE GESTÃO ÁGIL

### Cerimônias

#### Daily Stand-up (15 min, 9h)
**Formato**:
```
Cada agente responde:
1. O que fiz ontem?
2. O que vou fazer hoje?
3. Algum bloqueio?

Scrum Master:
- Anota impedimentos
- Atualiza burndown
- Resolve bloqueios (após o daily)
```

#### Sprint Planning (4h, início de sprint)
**Agenda**:
```
Parte 1 (2h): O que fazer?
- PO apresenta top 20 stories do backlog
- Squad faz perguntas de esclarecimento
- Squad estima stories (Planning Poker)
- Commitment: squad seleciona stories para a sprint

Parte 2 (2h): Como fazer?
- Squad quebra stories em tasks
- Atribui responsáveis
- Define Definition of Done
```

#### Sprint Review (2h, fim de sprint)
**Agenda**:
```
- Demo de funcionalidades (30min)
- Feedback de stakeholders (30min)
- Métricas da sprint (30min)
- Atualização de roadmap (30min)
```

#### Sprint Retrospective (1.5h, após review)
**Formato**:
```
1. O que foi bem? (30min)
2. O que pode melhorar? (30min)
3. Action items (30min)

Artefato: Lista de melhorias para próxima sprint
```

---

### Backlog Inicial (Top 50 Stories)

```
ÉPICO 1: DATABASE & API CORE
├─ STORY-001: Setup repositório Git [2 pts]
├─ STORY-002: Setup ambiente dev [3 pts]
├─ STORY-003: Schema do banco [8 pts]
├─ STORY-004: Seed validation_rules [3 pts]
├─ STORY-005: Setup projeto Go [5 pts]
├─ STORY-006: Endpoints object_definitions [13 pts]
├─ STORY-007: Validação JSON Schema [8 pts]
├─ STORY-008: Endpoints instances [13 pts]
├─ STORY-009: Validação de instances [8 pts]
├─ STORY-010: State machine engine [8 pts]
├─ STORY-011: Endpoints relationships [13 pts]
├─ STORY-012: Testes de integração [8 pts]
└─ STORY-013: Documentação API [5 pts]

ÉPICO 2: ASSISTENTE NL
├─ STORY-014: Assistente - Infra [8 pts]
├─ STORY-015: Schema generator [13 pts]
├─ STORY-016: FSM generator [8 pts]
├─ STORY-017: Setup Next.js [5 pts]
├─ STORY-018: AssistantConversation component [13 pts]
└─ STORY-019: Preview de object_definition [8 pts]

ÉPICO 3: DYNAMIC UI
├─ STORY-020: DynamicInstanceForm [13 pts]
├─ STORY-021: Widget library Parte 1 [8 pts]
├─ STORY-022: Widget library Parte 2 [8 pts]
├─ STORY-023: Back Section pages [13 pts]
├─ STORY-024: Front Section pages [13 pts]
└─ STORY-025: Navegação e layout [8 pts]

ÉPICO 4: GRAPH & RAG
├─ STORY-026: React Flow integration [8 pts]
├─ STORY-027: Graph data fetching [13 pts]
├─ STORY-028: Graph interactions [8 pts]
├─ STORY-029: Vector store setup [5 pts]
├─ STORY-030: RAG pipeline [13 pts]
└─ STORY-031: Chat interface [8 pts]

ÉPICO 5: QUALIDADE & DEPLOY
├─ STORY-032: Testes E2E [13 pts]
├─ STORY-033: Performance testing [8 pts]
├─ STORY-034: Security testing [5 pts]
├─ STORY-035: UI polish [8 pts]
├─ STORY-036: Documentação final [8 pts]
└─ STORY-037: Deployment pipeline [8 pts]

TOTAL: 37 stories | 333 story points
Velocidade esperada: ~100 pts/sprint
Sprints necessários: 3 (12 semanas)
```

---

## 📋 TEMPLATE DE STORY

```markdown
# STORY-XXX: [Título da Story]

## Descrição
Como [persona]
Quero [ação]
Para que [benefício]

## Critérios de Aceitação
- [ ] Critério 1
- [ ] Critério 2
- [ ] Critério 3

## Tasks
- [ ] Task 1 (responsável: @agent, estimativa: Xh)
- [ ] Task 2 (responsável: @agent, estimativa: Xh)
- [ ] Task 3 (responsável: @agent, estimativa: Xh)

## Definition of Done
- [ ] Código implementado
- [ ] Testes unitários (coverage > 80%)
- [ ] Testes de integração (se aplicável)
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Demo funcional

## Dependências
- Depende de: STORY-YYY
- Bloqueia: STORY-ZZZ

## Estimativa
Points: X (Fibonacci: 1, 2, 3, 5, 8, 13, 21)

## Notes
[Notas técnicas, links úteis, discussões]
```

---

## 🎯 RESPONSABILIDADES DO SCRUM MASTER

### Diárias
- [ ] Facilitar daily stand-up
- [ ] Atualizar burndown chart
- [ ] Resolver impedimentos
- [ ] Sync com PO sobre prioridades

### Semanais
- [ ] Revisar velocity
- [ ] Atualizar roadmap
- [ ] 1:1 com agentes (resolver blockers)
- [ ] Refinamento de backlog (com PO)

### Por Sprint
- [ ] Sprint Planning
- [ ] Sprint Review
- [ ] Sprint Retrospective
- [ ] Relatório de métricas

### Métricas a Manter
- [ ] Velocity (por sprint)
- [ ] Burndown chart (diário)
- [ ] Cycle time (por story)
- [ ] Lead time (backlog → done)
- [ ] Defect rate
- [ ] Code coverage
- [ ] Performance metrics

---

## 🎯 RESPONSABILIDADES DO PRODUCT OWNER

### Diárias
- [ ] Revisar stories em review
- [ ] Responder dúvidas de negócio
- [ ] Validar entregas

### Semanais
- [ ] Refinar backlog (grooming)
- [ ] Atualizar prioridades
- [ ] Validar demos
- [ ] Stakeholder sync

### Por Sprint
- [ ] Participar de planning
- [ ] Participar de review
- [ ] Atualizar roadmap
- [ ] Validar critérios de aceitação

### Artefatos a Manter
- [ ] Product backlog (atualizado)
- [ ] Product roadmap
- [ ] Release notes
- [ ] Stakeholder reports

---

## 🚀 ENTREGA FINAL DA FASE 1

### Checklist de Entrega

#### Código
- [ ] Repositório Git com histórico limpo
- [ ] README.md completo (setup, run, test)
- [ ] Dockerfile + docker-compose.yml
- [ ] CI/CD pipeline funcional

#### Database
- [ ] Schema versionado (migrations)
- [ ] Seed data (validation_rules)
- [ ] Backup/restore scripts
- [ ] Performance tuning aplicado

#### Backend
- [ ] 15+ endpoints REST
- [ ] Swagger/OpenAPI completo
- [ ] Testes (coverage > 80%)
- [ ] Error handling robusto

#### Frontend
- [ ] Portal funcional (Back + Front sections)
- [ ] Assistente NL funcional
- [ ] Dynamic forms funcionando
- [ ] Graph visualization

#### Documentação
- [ ] User Guide (PDF, 15+ páginas)
- [ ] Developer Docs (API, architecture)
- [ ] Video tutorial (5-10 min)
- [ ] Runbook (operações)

#### Testes
- [ ] 200+ testes unitários
- [ ] 30+ testes de integração
- [ ] 50+ testes E2E
- [ ] Performance tests passando

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs de Negócio

1. **Time to Create Object**: < 15 minutos (via assistente)
2. **Time to Create Instance**: < 2 minutos (via dynamic form)
3. **User Satisfaction**: Score > 4/5 (usability testing)
4. **Accuracy do Assistente**: > 90% (schemas válidos gerados)
5. **RAG Precision**: > 90% (respostas corretas)

### KPIs Técnicos

1. **API Latency**: p95 < 200ms
2. **Test Coverage**: Backend > 80%, Frontend > 70%
3. **Uptime**: > 99.5% (durante testes)
4. **Code Quality**: SonarQube Grade A
5. **Security**: 0 vulnerabilidades críticas

### KPIs de Processo

1. **Sprint Velocity**: 100 ± 20 pontos/sprint
2. **Sprint Commitment**: > 90% (stories completadas)
3. **Defect Rate**: < 5 bugs/sprint
4. **Cycle Time**: < 3 dias (story → done)
5. **Lead Time**: < 7 dias (backlog → done)

---

## 🎬 PRÓXIMOS PASSOS IMEDIATOS

### Semana 0 (Pré-Sprint)

1. **Scrum Master**: Criar board no Jira/Linear
2. **Product Owner**: Refinar top 30 stories
3. **Backend Architect**: Review de arquitetura
4. **Frontend Developer**: Setup de ambiente
5. **AI Engineer**: Testar integrações LLM
6. **Test Automator**: Setup de CI/CD

### Sprint Planning da Sprint 1

**Agenda**:
```
09:00 - 09:30: Visão geral da Fase 1 (PO)
09:30 - 10:30: Estimativa de stories (Planning Poker)
10:30 - 11:00: Break
11:00 - 12:00: Seleção de stories (commitment)
12:00 - 13:00: Almoço
13:00 - 15:00: Quebra de stories em tasks
15:00 - 15:30: Definition of Done
15:30 - 16:00: Perguntas + Alinhamento
```

**Output**:
- Sprint backlog definido
- Tasks atribuídas
- DoD acordado
- Todos os agentes sabem o que fazer

---

**Este documento é o contrato de entrega da Fase 1.**

Tudo que está aqui será construído. Zero POCs. Zero mocks. Apenas produção.

**Let's build the foundation. 🚀**
