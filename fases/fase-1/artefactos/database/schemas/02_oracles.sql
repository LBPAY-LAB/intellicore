-- ============================================================================
-- SuperCore v2.0 - Schema: Oracles
-- ============================================================================
-- Description: Oracles are knowledge domains within a Solution. Each Oracle
--              represents a specialized area of knowledge (RAG domain) and
--              can have its own LLM configuration, vector collection, and
--              knowledge base.
--
-- Key Features:
--   - Multi-tenancy via solution_id
--   - System oracles (is_system=true for RAG Global)
--   - Configurable LLM provider and model
--   - Vector collection mapping (Qdrant)
--   - Unique oracle names per solution (not global)
--   - Soft delete support
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Oracle type classification
CREATE TYPE oracle_type AS ENUM (
    'rag_global',       -- System oracle for general knowledge (auto-created)
    'domain',           -- General domain-specific knowledge
    'financial',        -- Financial domain (regulations, compliance)
    'legal',            -- Legal domain (contracts, policies)
    'technical',        -- Technical documentation
    'customer',         -- Customer data and interactions
    'product',          -- Product information
    'operations',       -- Operational procedures
    'hr',               -- Human resources
    'compliance',       -- Compliance and regulatory
    'custom'            -- Custom oracle type
);

-- Oracle status enum
CREATE TYPE oracle_status AS ENUM (
    'draft',            -- Initial state, configuration in progress
    'configuring',      -- LLM and vector DB being set up
    'indexing',         -- Documents being processed and indexed
    'active',           -- Oracle is ready and operational
    'suspended',        -- Temporarily disabled
    'archived',         -- Soft-archived, read-only
    'deleted'           -- Marked for deletion
);

-- LLM provider options
CREATE TYPE llm_provider AS ENUM (
    'anthropic',        -- Claude models
    'openai',           -- GPT models
    'google',           -- Gemini models
    'aws_bedrock',      -- AWS Bedrock
    'azure_openai',     -- Azure OpenAI
    'ollama',           -- Local Ollama (development)
    'vllm',             -- vLLM (production self-hosted)
    'custom'            -- Custom provider
);

-- ============================================================================
-- ORACLES TABLE
-- ============================================================================

CREATE TABLE oracles (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Key to Solution (required, cascading delete)
    solution_id UUID NOT NULL,

    -- Identification
    oracle_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    description TEXT,

    -- Classification
    oracle_type oracle_type NOT NULL DEFAULT 'domain',

    -- Status
    status oracle_status DEFAULT 'draft',

    -- System Oracle Flag (true for RAG Global)
    is_system BOOLEAN NOT NULL DEFAULT FALSE,

    -- LLM Configuration
    llm_provider llm_provider DEFAULT 'anthropic',
    llm_model VARCHAR(100) DEFAULT 'claude-3-5-sonnet-20241022',
    temperature DECIMAL(3,2) DEFAULT 0.7 CHECK (temperature >= 0 AND temperature <= 2),
    max_tokens INTEGER DEFAULT 4096 CHECK (max_tokens > 0 AND max_tokens <= 200000),

    -- RAG Configuration
    vector_collection_name VARCHAR(255),  -- Qdrant collection name
    embedding_model VARCHAR(255) DEFAULT 'text-embedding-3-small',
    embedding_dimensions INTEGER DEFAULT 1536 CHECK (embedding_dimensions > 0 AND embedding_dimensions <= 4096),
    chunk_size INTEGER DEFAULT 512 CHECK (chunk_size > 0 AND chunk_size <= 8192),
    chunk_overlap INTEGER DEFAULT 50 CHECK (chunk_overlap >= 0),

    -- System Prompt
    system_prompt TEXT,

    -- Extended Configuration (JSONB)
    config JSONB DEFAULT '{}'::jsonb,
    -- Expected config structure:
    -- {
    --   "retrieval": {
    --     "top_k": 5,
    --     "similarity_threshold": 0.7,
    --     "reranking_enabled": true,
    --     "hybrid_search": true
    --   },
    --   "context": {
    --     "max_context_length": 16000,
    --     "include_sources": true
    --   },
    --   "features": {
    --     "streaming": true,
    --     "citations": true,
    --     "memory": true
    --   }
    -- }

    -- Statistics (updated asynchronously)
    stats JSONB DEFAULT '{}'::jsonb,
    -- Expected stats structure:
    -- {
    --   "document_count": 0,
    --   "chunk_count": 0,
    --   "embedding_count": 0,
    --   "conversation_count": 0,
    --   "message_count": 0,
    --   "last_indexed_at": null,
    --   "storage_bytes": 0
    -- }

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT oracles_solution_name_unique UNIQUE (solution_id, oracle_name),
    CONSTRAINT oracles_name_not_empty CHECK (LENGTH(TRIM(oracle_name)) > 0),
    CONSTRAINT oracles_chunk_overlap_valid CHECK (chunk_overlap < chunk_size),
    CONSTRAINT oracles_vector_collection_format CHECK (
        vector_collection_name IS NULL OR
        vector_collection_name ~ '^[a-z0-9_]+$'
    )
);

-- ============================================================================
-- FOREIGN KEY (deferred to allow circular reference with solutions)
-- ============================================================================

-- Add FK to solutions table
ALTER TABLE oracles
    ADD CONSTRAINT oracles_solution_fk
    FOREIGN KEY (solution_id)
    REFERENCES solutions(id)
    ON DELETE CASCADE;

-- Add FK from solutions to oracles for RAG Global Oracle
ALTER TABLE solutions
    ADD COLUMN rag_global_oracle_id UUID;

ALTER TABLE solutions
    ADD CONSTRAINT solutions_rag_global_oracle_fk
    FOREIGN KEY (rag_global_oracle_id)
    REFERENCES oracles(id)
    ON DELETE SET NULL;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE oracles IS 'Knowledge domains within a Solution. Each Oracle has its own LLM configuration, vector collection, and knowledge base.';

COMMENT ON COLUMN oracles.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN oracles.solution_id IS 'Parent solution (required for multi-tenancy)';
COMMENT ON COLUMN oracles.oracle_name IS 'Internal name (unique within solution)';
COMMENT ON COLUMN oracles.display_name IS 'Human-readable display name';
COMMENT ON COLUMN oracles.description IS 'Detailed description of the oracle purpose';
COMMENT ON COLUMN oracles.oracle_type IS 'Classification type (rag_global, domain, financial, etc.)';
COMMENT ON COLUMN oracles.status IS 'Lifecycle status';
COMMENT ON COLUMN oracles.is_system IS 'True for system oracles (RAG Global)';
COMMENT ON COLUMN oracles.llm_provider IS 'LLM provider (anthropic, openai, etc.)';
COMMENT ON COLUMN oracles.llm_model IS 'Specific model identifier';
COMMENT ON COLUMN oracles.temperature IS 'LLM temperature (0.0-2.0)';
COMMENT ON COLUMN oracles.max_tokens IS 'Maximum tokens for LLM response';
COMMENT ON COLUMN oracles.vector_collection_name IS 'Qdrant collection name for embeddings';
COMMENT ON COLUMN oracles.embedding_model IS 'Embedding model for vectorization';
COMMENT ON COLUMN oracles.embedding_dimensions IS 'Vector dimensions (1536 for OpenAI, etc.)';
COMMENT ON COLUMN oracles.chunk_size IS 'Document chunking size in tokens';
COMMENT ON COLUMN oracles.chunk_overlap IS 'Overlap between chunks';
COMMENT ON COLUMN oracles.system_prompt IS 'Custom system prompt for the oracle';
COMMENT ON COLUMN oracles.config IS 'Extended JSONB configuration';
COMMENT ON COLUMN oracles.stats IS 'Cached statistics (document count, etc.)';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Solution-based lookups (most common query pattern)
CREATE INDEX idx_oracles_solution_id ON oracles(solution_id) WHERE deleted_at IS NULL;

-- Unique name per solution (already covered by constraint, but explicit for clarity)
CREATE INDEX idx_oracles_solution_name ON oracles(solution_id, oracle_name) WHERE deleted_at IS NULL;

-- Type filtering
CREATE INDEX idx_oracles_type ON oracles(oracle_type) WHERE deleted_at IS NULL;

-- Status filtering
CREATE INDEX idx_oracles_status ON oracles(status) WHERE deleted_at IS NULL;

-- System oracles lookup
CREATE INDEX idx_oracles_system ON oracles(solution_id) WHERE is_system = TRUE AND deleted_at IS NULL;

-- Active oracles (most common operational query)
CREATE INDEX idx_oracles_active ON oracles(solution_id) WHERE status = 'active' AND deleted_at IS NULL;

-- Config JSONB GIN index
CREATE INDEX idx_oracles_config ON oracles USING GIN(config jsonb_path_ops);

-- Stats JSONB GIN index
CREATE INDEX idx_oracles_stats ON oracles USING GIN(stats jsonb_path_ops);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER oracles_updated_at_trigger
    BEFORE UPDATE ON oracles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent hard delete
CREATE TRIGGER oracles_prevent_hard_delete
    BEFORE DELETE ON oracles
    FOR EACH ROW
    EXECUTE FUNCTION prevent_hard_delete();

-- Auto-generate vector collection name if not provided
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
    v_solution_slug VARCHAR(100);
BEGIN
    -- Get solution slug for naming
    SELECT slug INTO v_solution_slug FROM solutions WHERE id = p_solution_id;

    -- Create RAG Global Oracle
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

    -- Update solution with RAG Global Oracle reference
    UPDATE solutions SET rag_global_oracle_id = v_oracle_id WHERE id = p_solution_id;

    RETURN v_oracle_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_rag_global_oracle IS 'Creates the default RAG Global Oracle for a solution';
