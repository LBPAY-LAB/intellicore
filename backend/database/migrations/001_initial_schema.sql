-- SuperCore - Initial Database Schema
-- Fase 1, Sprint 1: Core Tables (object_definitions, instances, relationships)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: object_definitions (DNA dos objetos)
-- ============================================================================
-- Armazena as definições abstratas de tipos de objetos
-- Ex: "cliente_pf", "conta_corrente", "transacao_pix"
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,              -- Nome técnico (slug)
    display_name VARCHAR(200),                      -- Nome para exibição
    description TEXT,                               -- Descrição em linguagem natural

    -- SCHEMA: JSON Schema Draft 7 que define a estrutura
    schema JSONB NOT NULL,

    -- STATES: Finite State Machine (FSM) - estados e transições
    states JSONB DEFAULT '{"initial": "ACTIVE", "states": ["ACTIVE"], "transitions": []}'::jsonb,

    -- VALIDATION RULES: Regras de validação aplicáveis
    validation_rules JSONB DEFAULT '[]'::jsonb,

    -- RELATIONSHIPS: Tipos de relacionamentos permitidos
    relationships JSONB DEFAULT '[]'::jsonb,

    -- METADATA
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1,

    -- CONSTRAINTS
    CONSTRAINT valid_name CHECK (name ~ '^[a-z0-9_]+$'),
    CONSTRAINT valid_schema CHECK (jsonb_typeof(schema) = 'object')
);

-- Índices para performance
CREATE INDEX idx_object_definitions_name ON object_definitions(name) WHERE is_active = true;
CREATE INDEX idx_object_definitions_active ON object_definitions(is_active);

-- ============================================================================
-- TABLE: instances (Células Vivas)
-- ============================================================================
-- Armazena instâncias concretas de object_definitions
-- Ex: Maria Silva (instance de "cliente_pf")
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_definition_id UUID NOT NULL REFERENCES object_definitions(id) ON DELETE RESTRICT,

    -- DATA: Dados da instância (validados contra schema do object_definition)
    data JSONB NOT NULL,

    -- STATE: Estado atual no FSM
    current_state VARCHAR(50) NOT NULL,

    -- STATE HISTORY: Histórico de transições de estado (para auditoria)
    state_history JSONB DEFAULT '[]'::jsonb,

    -- METADATA
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,                                -- Futuro: pode referenciar instances de "usuario" (se necessário)
    updated_by UUID,
    version INT DEFAULT 1,

    -- SOFT DELETE
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,

    -- CONSTRAINTS
    CONSTRAINT valid_data CHECK (jsonb_typeof(data) = 'object')
);

-- Índices para performance (CRÍTICO para queries JSONB)
CREATE INDEX idx_instances_object_def ON instances(object_definition_id) WHERE is_deleted = false;
CREATE INDEX idx_instances_state ON instances(current_state) WHERE is_deleted = false;
CREATE INDEX idx_instances_created_at ON instances(created_at DESC) WHERE is_deleted = false;

-- GIN index para queries em campos JSONB
CREATE INDEX idx_instances_data_gin ON instances USING GIN (data jsonb_path_ops);

-- Índices para campos específicos comuns (podem ser adicionados dinamicamente)
-- Ex: CREATE INDEX idx_instances_cpf ON instances ((data->>'cpf')) WHERE object_definition_id = 'uuid-cliente-pf';

-- ============================================================================
-- TABLE: relationships (Sinapses do Grafo)
-- ============================================================================
-- Armazena relacionamentos entre instances
-- Ex: (Maria Silva) --[TITULAR_DE]--> (Conta 12345-6)
CREATE TABLE relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- TIPO DE RELACIONAMENTO
    relationship_type VARCHAR(100) NOT NULL,        -- "TITULAR_DE", "PAI_DE", "DEPENDENTE_DE"

    -- SOURCE e TARGET
    source_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    target_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,

    -- PROPRIEDADES: Metadados do relacionamento
    properties JSONB DEFAULT '{}'::jsonb,

    -- VALIDADE TEMPORAL (opcional)
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,

    -- METADATA
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID,

    -- CONSTRAINTS
    CONSTRAINT no_self_reference CHECK (source_instance_id != target_instance_id),
    CONSTRAINT valid_properties CHECK (jsonb_typeof(properties) = 'object'),

    -- UNIQUE: Previne relacionamentos duplicados
    UNIQUE(relationship_type, source_instance_id, target_instance_id)
);

-- Índices para navegação do grafo
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_source_type ON relationships(source_instance_id, relationship_type);
CREATE INDEX idx_relationships_target_type ON relationships(target_instance_id, relationship_type);

-- GIN index para queries em properties JSONB
CREATE INDEX idx_relationships_properties_gin ON relationships USING GIN (properties jsonb_path_ops);

-- ============================================================================
-- FUNCTION: update_updated_at_column()
-- ============================================================================
-- Trigger para atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para object_definitions
CREATE TRIGGER update_object_definitions_updated_at
    BEFORE UPDATE ON object_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers para instances
CREATE TRIGGER update_instances_updated_at
    BEFORE UPDATE ON instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS (Documentação inline)
-- ============================================================================
COMMENT ON TABLE object_definitions IS 'Definições abstratas de tipos de objetos (DNA)';
COMMENT ON COLUMN object_definitions.schema IS 'JSON Schema Draft 7 validando a estrutura de instances';
COMMENT ON COLUMN object_definitions.states IS 'FSM: {"initial": "DRAFT", "states": [...], "transitions": [...]}';
COMMENT ON COLUMN object_definitions.validation_rules IS 'Array de referências a validation_rules aplicáveis';
COMMENT ON COLUMN object_definitions.relationships IS 'Array de tipos de relacionamentos permitidos';

COMMENT ON TABLE instances IS 'Instâncias concretas de object_definitions (células vivas)';
COMMENT ON COLUMN instances.data IS 'Dados da instância (validados contra object_definition.schema)';
COMMENT ON COLUMN instances.current_state IS 'Estado atual no FSM do object_definition';
COMMENT ON COLUMN instances.state_history IS 'Histórico de transições: [{"from": "X", "to": "Y", "timestamp": "..."}]';

COMMENT ON TABLE relationships IS 'Relacionamentos entre instances (grafo)';
COMMENT ON COLUMN relationships.properties IS 'Metadados do relacionamento (ex: {"porcentagem": 100, "desde": "2024-01-01"})';
