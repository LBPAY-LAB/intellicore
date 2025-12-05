-- LBPay v2 - Database Schema for Universal Meta-Modeling
-- PostgreSQL 16+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- ============================================================================
-- BACKOFFICE (Meta-Layer) - Definição de Tipos de Objetos
-- ============================================================================

-- Tipos de Objetos (Cliente PF, PJ, Conta, etc.)
CREATE TABLE object_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Definições em linguagem natural
    fields_definition TEXT NOT NULL,
    validation_rules TEXT,
    internal_policies TEXT,
    workflow_definition TEXT,
    agent_system_prompt TEXT NOT NULL,
    
    -- Schema estruturado gerado pelo LLM
    generated_schema JSONB,
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_object_types_name ON object_types(name);
CREATE INDEX idx_object_types_active ON object_types(is_active);

-- Relacionamentos entre tipos de objetos
CREATE TABLE object_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type_id UUID NOT NULL REFERENCES object_types(id) ON DELETE CASCADE,
    target_type_id UUID NOT NULL REFERENCES object_types(id) ON DELETE CASCADE,
    
    -- Tipo de relacionamento (possui, é_sócio_de, vinculado_a, etc.)
    relationship_type VARCHAR(100) NOT NULL,
    
    -- Cardinalidade (1:1, 1:N, N:N)
    cardinality VARCHAR(10) NOT NULL CHECK (cardinality IN ('1:1', '1:N', 'N:1', 'N:N')),
    
    -- Direção (unidirecional, bidirecional)
    is_bidirectional BOOLEAN DEFAULT FALSE,
    
    -- Regras do relacionamento em linguagem natural
    relationship_rules TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Evitar relacionamentos duplicados
    UNIQUE(source_type_id, target_type_id, relationship_type)
);

CREATE INDEX idx_relationships_source ON object_relationships(source_type_id);
CREATE INDEX idx_relationships_target ON object_relationships(target_type_id);
CREATE INDEX idx_relationships_type ON object_relationships(relationship_type);

-- Documentos normativos (PDFs do BACEN, políticas internas, etc.)
CREATE TABLE regulatory_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Tipo de documento (bacen_resolution, internal_policy, kyc_guideline, etc.)
    document_type VARCHAR(100) NOT NULL,
    
    -- Storage (S3, local, etc.)
    file_url TEXT NOT NULL,
    file_key TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    
    -- Indexação para RAG
    indexed_content TEXT,
    embeddings_generated BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    uploaded_by UUID,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_documents_type ON regulatory_documents(document_type);
CREATE INDEX idx_documents_active ON regulatory_documents(is_active);
-- Full-text search index
CREATE INDEX idx_documents_content ON regulatory_documents USING GIN (to_tsvector('portuguese', indexed_content));

-- Vínculo entre documentos e tipos de objetos
CREATE TABLE object_type_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_type_id UUID NOT NULL REFERENCES object_types(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES regulatory_documents(id) ON DELETE CASCADE,
    
    -- Relevância do documento para este tipo (0-100)
    relevance_score INTEGER DEFAULT 100 CHECK (relevance_score >= 0 AND relevance_score <= 100),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(object_type_id, document_id)
);

CREATE INDEX idx_type_docs_type ON object_type_documents(object_type_id);
CREATE INDEX idx_type_docs_doc ON object_type_documents(document_id);

-- ============================================================================
-- FRONT-OFFICE (Operational Layer) - Instâncias de Objetos
-- ============================================================================

-- Instâncias de objetos (clientes PF, PJ, contas, etc.)
CREATE TABLE object_instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_type_id UUID NOT NULL REFERENCES object_types(id),
    
    -- Dados da instância (JSON flexível)
    data JSONB NOT NULL,
    
    -- Estado atual no workflow
    current_state VARCHAR(100) NOT NULL,
    
    -- Metadata
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    is_archived BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_instances_type ON object_instances(object_type_id);
CREATE INDEX idx_instances_state ON object_instances(current_state);
CREATE INDEX idx_instances_active ON object_instances(is_active);
CREATE INDEX idx_instances_archived ON object_instances(is_archived);
-- GIN index for JSONB queries
CREATE INDEX idx_instances_data ON object_instances USING GIN (data);

-- Relacionamentos entre instâncias
CREATE TABLE instance_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_def_id UUID NOT NULL REFERENCES object_relationships(id),
    source_instance_id UUID NOT NULL REFERENCES object_instances(id) ON DELETE CASCADE,
    target_instance_id UUID NOT NULL REFERENCES object_instances(id) ON DELETE CASCADE,
    
    -- Dados adicionais do relacionamento (ex: percentual de participação societária)
    relationship_data JSONB,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(relationship_def_id, source_instance_id, target_instance_id)
);

CREATE INDEX idx_inst_rel_source ON instance_relationships(source_instance_id);
CREATE INDEX idx_inst_rel_target ON instance_relationships(target_instance_id);
CREATE INDEX idx_inst_rel_def ON instance_relationships(relationship_def_id);

-- Histórico de mudanças de estado
CREATE TABLE state_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID NOT NULL REFERENCES object_instances(id) ON DELETE CASCADE,
    
    from_state VARCHAR(100),
    to_state VARCHAR(100) NOT NULL,
    
    -- Razão da transição
    transition_reason TEXT,
    
    -- Quem aprovou/rejeitou
    changed_by UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Dados adicionais (comentários, anexos, etc.)
    metadata JSONB
);

CREATE INDEX idx_state_history_instance ON state_history(instance_id);
CREATE INDEX idx_state_history_date ON state_history(changed_at DESC);

-- Histórico de validações LLM
CREATE TABLE validation_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    instance_id UUID REFERENCES object_instances(id) ON DELETE CASCADE,
    object_type_id UUID NOT NULL REFERENCES object_types(id),
    
    -- Input do usuário
    user_input TEXT NOT NULL,
    
    -- Resposta do LLM
    llm_response JSONB NOT NULL,
    
    -- Campos extraídos
    extracted_fields JSONB,
    
    -- Validações aplicadas
    validations_applied JSONB,
    
    -- Políticas verificadas
    policies_checked JSONB,
    
    -- Normas consultadas
    norms_consulted JSONB,
    
    -- Resultado (approved, rejected, pending)
    validation_result VARCHAR(50) NOT NULL,
    
    -- Metadata
    validated_by UUID,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Performance metrics
    processing_time_ms INTEGER,
    llm_model VARCHAR(100),
    llm_tokens_used INTEGER
);

CREATE INDEX idx_validation_instance ON validation_history(instance_id);
CREATE INDEX idx_validation_type ON validation_history(object_type_id);
CREATE INDEX idx_validation_date ON validation_history(validated_at DESC);
CREATE INDEX idx_validation_result ON validation_history(validation_result);

-- ============================================================================
-- USERS & AUTH (Keycloak sync)
-- ============================================================================

-- Usuários (sincronizado com Keycloak)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    keycloak_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(320) UNIQUE NOT NULL,
    name VARCHAR(255),
    
    -- Roles (sincronizado com Keycloak)
    roles JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_keycloak ON users(keycloak_id);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

-- Log de auditoria
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Quem fez a ação
    user_id UUID REFERENCES users(id),
    user_email VARCHAR(320),
    
    -- O que foi feito
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    
    -- Dados antes e depois
    old_data JSONB,
    new_data JSONB,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp DESC);
CREATE INDEX idx_audit_action ON audit_log(action);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_object_types_updated_at BEFORE UPDATE ON object_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_object_relationships_updated_at BEFORE UPDATE ON object_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_object_instances_updated_at BEFORE UPDATE ON object_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instance_relationships_updated_at BEFORE UPDATE ON instance_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE object_types IS 'Meta-layer: Definição de tipos de objetos (Cliente PF, PJ, Conta, etc.)';
COMMENT ON TABLE object_relationships IS 'Meta-layer: Relacionamentos entre tipos de objetos';
COMMENT ON TABLE regulatory_documents IS 'Documentos normativos (BACEN, políticas internas)';
COMMENT ON TABLE object_instances IS 'Operational layer: Instâncias de objetos (clientes, contas, etc.)';
COMMENT ON TABLE instance_relationships IS 'Operational layer: Relacionamentos entre instâncias';
COMMENT ON TABLE state_history IS 'Histórico de mudanças de estado das instâncias';
COMMENT ON TABLE validation_history IS 'Histórico de validações LLM';
COMMENT ON TABLE users IS 'Usuários sincronizados com Keycloak';
COMMENT ON TABLE audit_log IS 'Log de auditoria de todas as ações';
