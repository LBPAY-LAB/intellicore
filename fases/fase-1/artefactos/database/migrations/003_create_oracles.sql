-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 003: Oracles Table
-- ============================================================================
-- Description: Creates the oracles table - knowledge domains within solutions.
--              Each oracle has its own LLM configuration and vector collection.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE oracle_type AS ENUM (
    'rag_global',
    'domain',
    'financial',
    'legal',
    'technical',
    'customer',
    'product',
    'operations',
    'hr',
    'compliance',
    'custom'
);

CREATE TYPE oracle_status AS ENUM (
    'draft',
    'configuring',
    'indexing',
    'active',
    'suspended',
    'archived',
    'deleted'
);

CREATE TYPE llm_provider AS ENUM (
    'anthropic',
    'openai',
    'google',
    'aws_bedrock',
    'azure_openai',
    'ollama',
    'vllm',
    'custom'
);

-- ============================================================================
-- ORACLES TABLE
-- ============================================================================

CREATE TABLE oracles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    solution_id UUID NOT NULL,
    oracle_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,
    oracle_type oracle_type NOT NULL DEFAULT 'domain',
    status oracle_status DEFAULT 'draft',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    llm_provider llm_provider DEFAULT 'anthropic',
    llm_model VARCHAR(100) DEFAULT 'claude-3-5-sonnet-20241022',
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 4096 CHECK (max_tokens > 0 AND max_tokens <= 200000),
    vector_collection_name VARCHAR(255),
    embedding_model VARCHAR(255) DEFAULT 'text-embedding-3-small',
    embedding_dimensions INTEGER DEFAULT 1536 CHECK (embedding_dimensions > 0 AND embedding_dimensions <= 4096),
    chunk_size INTEGER DEFAULT 512 CHECK (chunk_size > 0 AND chunk_size <= 8192),
    chunk_overlap INTEGER DEFAULT 50 CHECK (chunk_overlap >= 0),
    system_prompt TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    stats JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT oracles_solution_fk FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
    CONSTRAINT oracles_solution_name_unique UNIQUE (solution_id, oracle_name),
    CONSTRAINT oracles_name_not_empty CHECK (LENGTH(TRIM(oracle_name)) > 0),
    CONSTRAINT oracles_chunk_overlap_valid CHECK (chunk_overlap < chunk_size),
    CONSTRAINT oracles_vector_collection_format CHECK (
        vector_collection_name IS NULL OR
        vector_collection_name ~ '^[a-z0-9_]+$'
    )
);

-- ============================================================================
-- ADD RAG GLOBAL ORACLE REFERENCE TO SOLUTIONS
-- ============================================================================

ALTER TABLE solutions ADD COLUMN rag_global_oracle_id UUID;

ALTER TABLE solutions
    ADD CONSTRAINT solutions_rag_global_oracle_fk
    FOREIGN KEY (rag_global_oracle_id)
    REFERENCES oracles(id)
    ON DELETE SET NULL;

COMMENT ON COLUMN solutions.rag_global_oracle_id IS 'Reference to auto-created RAG Global Oracle';

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE oracles IS 'Knowledge domains within a Solution. Each Oracle has its own LLM configuration and vector collection.';
COMMENT ON COLUMN oracles.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN oracles.solution_id IS 'Parent solution (required)';
COMMENT ON COLUMN oracles.oracle_name IS 'Internal name (unique within solution)';
COMMENT ON COLUMN oracles.display_name IS 'Human-readable display name';
COMMENT ON COLUMN oracles.description IS 'Detailed description';
COMMENT ON COLUMN oracles.oracle_type IS 'Classification type';
COMMENT ON COLUMN oracles.status IS 'Lifecycle status';
COMMENT ON COLUMN oracles.is_system IS 'True for system oracles (RAG Global)';
COMMENT ON COLUMN oracles.llm_provider IS 'LLM provider';
COMMENT ON COLUMN oracles.llm_model IS 'Specific model identifier';
COMMENT ON COLUMN oracles.temperature IS 'LLM temperature (0.0-2.0)';
COMMENT ON COLUMN oracles.max_tokens IS 'Maximum tokens for response';
COMMENT ON COLUMN oracles.vector_collection_name IS 'Qdrant collection name';
COMMENT ON COLUMN oracles.embedding_model IS 'Embedding model';
COMMENT ON COLUMN oracles.embedding_dimensions IS 'Vector dimensions';
COMMENT ON COLUMN oracles.chunk_size IS 'Document chunking size';
COMMENT ON COLUMN oracles.chunk_overlap IS 'Overlap between chunks';
COMMENT ON COLUMN oracles.system_prompt IS 'Custom system prompt';
COMMENT ON COLUMN oracles.config IS 'Extended configuration';
COMMENT ON COLUMN oracles.stats IS 'Cached statistics';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_oracles_solution_id ON oracles(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_solution_name ON oracles(solution_id, oracle_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_type ON oracles(oracle_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_status ON oracles(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_system ON oracles(solution_id) WHERE is_system = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_oracles_active ON oracles(solution_id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_oracles_config ON oracles USING GIN(config jsonb_path_ops);
CREATE INDEX idx_oracles_stats ON oracles USING GIN(stats jsonb_path_ops);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER oracles_updated_at_trigger
    BEFORE UPDATE ON oracles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER oracles_prevent_hard_delete
    BEFORE DELETE ON oracles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_hard_delete();

-- Auto-generate vector collection name
CREATE OR REPLACE FUNCTION generate_vector_collection_name()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.vector_collection_name IS NULL THEN
        NEW.vector_collection_name := 'oracle_' || REPLACE(NEW.id::TEXT, '-', '_');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER oracles_generate_collection_name
    BEFORE INSERT ON oracles
    FOR EACH ROW
    EXECUTE FUNCTION generate_vector_collection_name();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create RAG Global Oracle for a solution
CREATE OR REPLACE FUNCTION create_rag_global_oracle(p_solution_id UUID)
RETURNS UUID AS $$
DECLARE
    v_oracle_id UUID;
BEGIN
    INSERT INTO oracles (
        solution_id,
        oracle_name,
        display_name,
        description,
        oracle_type,
        status,
        is_system,
        system_prompt
    ) VALUES (
        p_solution_id,
        'rag_global',
        'RAG Global',
        'System oracle for general knowledge and cross-domain queries',
        'rag_global',
        'active',
        TRUE,
        'You are a helpful AI assistant with access to the organization''s knowledge base. Provide accurate, helpful responses based on the available documentation and context.'
    ) RETURNING id INTO v_oracle_id;

    UPDATE solutions SET rag_global_oracle_id = v_oracle_id WHERE id = p_solution_id;

    RETURN v_oracle_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_rag_global_oracle IS 'Creates the default RAG Global Oracle for a solution';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP FUNCTION IF EXISTS create_rag_global_oracle(UUID);
DROP FUNCTION IF EXISTS generate_vector_collection_name();
DROP TRIGGER IF EXISTS oracles_generate_collection_name ON oracles;
DROP TRIGGER IF EXISTS oracles_prevent_hard_delete ON oracles;
DROP TRIGGER IF EXISTS oracles_updated_at_trigger ON oracles;

ALTER TABLE solutions DROP CONSTRAINT IF EXISTS solutions_rag_global_oracle_fk;
ALTER TABLE solutions DROP COLUMN IF EXISTS rag_global_oracle_id;

DROP TABLE IF EXISTS oracles CASCADE;
DROP TYPE IF EXISTS llm_provider;
DROP TYPE IF EXISTS oracle_status;
DROP TYPE IF EXISTS oracle_type;

-- +goose StatementEnd
