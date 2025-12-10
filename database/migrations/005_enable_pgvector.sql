-- Migration 005: Enable pgvector for RAG Vector Layer
-- Description: Enables pgvector extension and creates document_embeddings table for semantic search

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Table to store document embeddings for RAG
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Original content
    content TEXT NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'object_definition', 'instance', 'documentation', 'regulation'

    -- Embedding vector (OpenAI ada-002: 1536 dimensions, Cohere: 4096, etc)
    embedding vector(1536) NOT NULL,

    -- Metadata for filtering and context
    metadata JSONB DEFAULT '{}'::jsonb,

    -- References (nullable for generic documents)
    object_definition_id UUID REFERENCES object_definitions(id) ON DELETE CASCADE,
    instance_id UUID REFERENCES instances(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- HNSW index for fast similarity search (faster than IVFFlat)
-- m = 16: number of connections per layer
-- ef_construction = 64: size of dynamic candidate list
CREATE INDEX idx_document_embeddings_vector
ON document_embeddings
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Index for filtering by content type
CREATE INDEX idx_document_embeddings_type
ON document_embeddings(content_type);

-- GIN index for metadata search
CREATE INDEX idx_document_embeddings_metadata
ON document_embeddings
USING GIN(metadata jsonb_path_ops);

-- Index for object_definition_id lookups
CREATE INDEX idx_document_embeddings_object_def
ON document_embeddings(object_definition_id)
WHERE object_definition_id IS NOT NULL;

-- Index for instance_id lookups
CREATE INDEX idx_document_embeddings_instance
ON document_embeddings(instance_id)
WHERE instance_id IS NOT NULL;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_document_embeddings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_document_embeddings_updated_at
    BEFORE UPDATE ON document_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_document_embeddings_updated_at();

-- Comments for documentation
COMMENT ON TABLE document_embeddings IS 'Stores document embeddings for semantic search via RAG (Retrieval Augmented Generation)';
COMMENT ON COLUMN document_embeddings.content IS 'Original text content that was embedded';
COMMENT ON COLUMN document_embeddings.content_type IS 'Type of content: object_definition, instance, documentation, regulation';
COMMENT ON COLUMN document_embeddings.embedding IS 'Vector embedding (default 1536 dimensions for OpenAI ada-002)';
COMMENT ON COLUMN document_embeddings.metadata IS 'Additional metadata for filtering and context (JSONB)';
COMMENT ON COLUMN document_embeddings.object_definition_id IS 'Reference to object_definitions if this is an object definition embedding';
COMMENT ON COLUMN document_embeddings.instance_id IS 'Reference to instances if this is an instance embedding';
