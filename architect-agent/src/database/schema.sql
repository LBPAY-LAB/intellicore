-- Database Schema for Architect Agent
-- PostgreSQL 15+ with pgvector extension

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- ====================
-- DOCUMENTS
-- ====================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(255) UNIQUE NOT NULL,  -- External document ID
    filename VARCHAR(500) NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,

    -- Document type and metadata
    document_type VARCHAR(50) NOT NULL,  -- circular_bacen, resolucao, manual, normativo
    title TEXT,
    numero_normativo VARCHAR(100),
    data_publicacao DATE,
    data_vigencia DATE,
    orgao_emissor VARCHAR(255) DEFAULT 'Banco Central do Brasil',
    assunto TEXT,
    total_pages INTEGER DEFAULT 0,

    -- Parsed structure (JSONB)
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    sections JSONB DEFAULT '[]'::jsonb,
    tables JSONB DEFAULT '[]'::jsonb,
    full_text TEXT,

    -- Extraction confidence
    confidence_score FLOAT DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),

    -- Processing status
    processing_status VARCHAR(50) DEFAULT 'uploaded',  -- uploaded, parsing, parsed, extracting, extracted, failed
    processing_error TEXT,
    task_id VARCHAR(255),  -- Celery task ID

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    parsed_at TIMESTAMP,

    -- Soft delete
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP
);

-- Indexes for documents
CREATE INDEX idx_documents_document_id ON documents(document_id) WHERE is_deleted = false;
CREATE INDEX idx_documents_type ON documents(document_type) WHERE is_deleted = false;
CREATE INDEX idx_documents_numero ON documents(numero_normativo) WHERE is_deleted = false;
CREATE INDEX idx_documents_status ON documents(processing_status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_metadata_gin ON documents USING GIN (metadata jsonb_path_ops);


-- ====================
-- EXTRACTED ENTITIES
-- ====================

CREATE TABLE extracted_entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,

    -- Entity data
    entity_type VARCHAR(100) NOT NULL,  -- cpf, cnpj, valor_monetario, etc.
    text TEXT NOT NULL,
    normalized_value TEXT,

    -- Position in document
    start_char INTEGER NOT NULL,
    end_char INTEGER NOT NULL,
    context TEXT,

    -- Confidence
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for entities
CREATE INDEX idx_entities_document ON extracted_entities(document_id);
CREATE INDEX idx_entities_type ON extracted_entities(entity_type);
CREATE INDEX idx_entities_text ON extracted_entities USING GIN (to_tsvector('portuguese', text));


-- ====================
-- FIELD CANDIDATES
-- ====================

CREATE TABLE field_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,

    -- Field definition
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL,  -- string, number, integer, boolean, etc.
    description TEXT,

    -- Schema properties
    required BOOLEAN DEFAULT false,
    validation_rules JSONB DEFAULT '[]'::jsonb,
    example_values JSONB DEFAULT '[]'::jsonb,
    enum_values JSONB DEFAULT '[]'::jsonb,
    default_value JSONB,

    -- UI hints
    ui_widget VARCHAR(100) DEFAULT 'text',

    -- Confidence
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for field candidates
CREATE INDEX idx_field_candidates_document ON field_candidates(document_id);
CREATE INDEX idx_field_candidates_name ON field_candidates(name);


-- ====================
-- FSM STATES
-- ====================

CREATE TABLE fsm_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,

    -- State definition
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,

    is_initial BOOLEAN DEFAULT false,
    is_final BOOLEAN DEFAULT false,

    -- Confidence
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),

    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for FSM states
CREATE INDEX idx_fsm_states_document ON fsm_states(document_id);


-- ====================
-- FSM TRANSITIONS
-- ====================

CREATE TABLE fsm_transitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,

    -- Transition definition
    from_state VARCHAR(100) NOT NULL,
    to_state VARCHAR(100) NOT NULL,
    trigger VARCHAR(100) NOT NULL,
    description TEXT,
    conditions JSONB DEFAULT '[]'::jsonb,

    -- Confidence
    confidence FLOAT DEFAULT 1.0 CHECK (confidence >= 0.0 AND confidence <= 1.0),

    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for FSM transitions
CREATE INDEX idx_fsm_transitions_document ON fsm_transitions(document_id);
CREATE INDEX idx_fsm_transitions_states ON fsm_transitions(from_state, to_state);


-- ====================
-- OBJECT DEFINITION CANDIDATES
-- ====================

CREATE TABLE object_definition_candidates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,

    -- Object definition
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Generated schemas
    json_schema JSONB NOT NULL,
    fsm_definition JSONB DEFAULT '{}'::jsonb,
    ui_hints JSONB DEFAULT '{}'::jsonb,
    relationships JSONB DEFAULT '[]'::jsonb,

    -- Confidence
    confidence_score FLOAT DEFAULT 1.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),

    -- Review status
    review_status VARCHAR(50) DEFAULT 'pending',  -- pending, approved, rejected, modified
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    review_notes TEXT,

    -- SuperCore integration
    supercore_object_id UUID,  -- UUID from SuperCore backend
    created_in_supercore BOOLEAN DEFAULT false,
    created_in_supercore_at TIMESTAMP,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for object definition candidates
CREATE INDEX idx_obj_candidates_document ON object_definition_candidates(document_id);
CREATE INDEX idx_obj_candidates_name ON object_definition_candidates(name);
CREATE INDEX idx_obj_candidates_review_status ON object_definition_candidates(review_status);
CREATE INDEX idx_obj_candidates_supercore ON object_definition_candidates(supercore_object_id) WHERE supercore_object_id IS NOT NULL;


-- ====================
-- DOCUMENT EMBEDDINGS (pgvector)
-- ====================

CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,

    -- Chunk data
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    chunk_metadata JSONB DEFAULT '{}'::jsonb,

    -- Vector embedding (1536 dimensions for text-embedding-3-large)
    embedding vector(1536),

    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(document_id, chunk_index)
);

-- Indexes for embeddings
CREATE INDEX idx_embeddings_document ON document_embeddings(document_id);
CREATE INDEX idx_embeddings_vector ON document_embeddings USING ivfflat (embedding vector_cosine_ops);


-- ====================
-- CRAWLER HISTORY
-- ====================

CREATE TABLE crawler_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Crawl metadata
    crawl_timestamp TIMESTAMP DEFAULT NOW(),
    bacen_url TEXT NOT NULL,

    -- Results
    new_documents_found INTEGER DEFAULT 0,
    documents_downloaded INTEGER DEFAULT 0,
    documents_failed INTEGER DEFAULT 0,

    -- Errors
    errors JSONB DEFAULT '[]'::jsonb,

    -- Duration
    duration_seconds INTEGER,

    created_at TIMESTAMP DEFAULT NOW()
);

-- Index for crawler history
CREATE INDEX idx_crawler_history_timestamp ON crawler_history(crawl_timestamp DESC);


-- ====================
-- HELPER FUNCTIONS
-- ====================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obj_candidates_updated_at BEFORE UPDATE ON object_definition_candidates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ====================
-- VIEWS FOR ANALYTICS
-- ====================

CREATE VIEW v_document_statistics AS
SELECT
    document_type,
    COUNT(*) as total_documents,
    AVG(confidence_score) as avg_confidence,
    AVG(total_pages) as avg_pages,
    COUNT(*) FILTER (WHERE processing_status = 'extracted') as completed,
    COUNT(*) FILTER (WHERE processing_status = 'failed') as failed
FROM documents
WHERE is_deleted = false
GROUP BY document_type;


CREATE VIEW v_extraction_summary AS
SELECT
    d.id as document_id,
    d.document_id as external_id,
    d.title,
    d.document_type,
    d.processing_status,
    d.confidence_score,
    COUNT(DISTINCT e.id) as entities_count,
    COUNT(DISTINCT fc.id) as field_candidates_count,
    COUNT(DISTINCT fs.id) as fsm_states_count,
    COUNT(DISTINCT odc.id) as object_candidates_count
FROM documents d
LEFT JOIN extracted_entities e ON d.id = e.document_id
LEFT JOIN field_candidates fc ON d.id = fc.document_id
LEFT JOIN fsm_states fs ON d.id = fs.document_id
LEFT JOIN object_definition_candidates odc ON d.id = odc.document_id
WHERE d.is_deleted = false
GROUP BY d.id, d.document_id, d.title, d.document_type, d.processing_status, d.confidence_score;


-- ====================
-- SEED DATA
-- ====================

-- Insert sample document types (for validation)
-- NOTE: This is a comment, actual enum validation is done at application level
