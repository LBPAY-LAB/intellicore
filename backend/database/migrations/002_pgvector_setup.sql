-- pgvector extension setup for RAG (Retrieval-Augmented Generation)
-- This migration enables semantic search capabilities using vector embeddings

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Embeddings table for storing vector representations of objects
-- This enables semantic search across object definitions and instances
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Type of object: 'object_definition' or 'instance'
    object_type VARCHAR(50) NOT NULL CHECK (object_type IN ('object_definition', 'instance')),

    -- Reference to the actual object (either object_definition or instance)
    object_id UUID NOT NULL,

    -- Original text content that was embedded
    content TEXT NOT NULL,

    -- Vector embedding (OpenAI ada-002 uses 1536 dimensions)
    embedding vector(1536) NOT NULL,

    -- Additional metadata for filtering and context
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for efficient querying

-- Standard B-tree indexes for filtering
CREATE INDEX idx_embeddings_object_type ON embeddings(object_type);
CREATE INDEX idx_embeddings_object_id ON embeddings(object_id);
CREATE INDEX idx_embeddings_created_at ON embeddings(created_at);

-- GIN index for metadata JSONB queries
CREATE INDEX idx_embeddings_metadata ON embeddings USING GIN (metadata);

-- IVFFlat index for vector similarity search using cosine distance
-- Lists parameter: good rule of thumb is rows/1000 for < 1M rows
-- For initial dataset, using 100 lists (suitable for ~100K embeddings)
-- IVFFlat is faster than HNSW for smaller datasets and provides good recall
CREATE INDEX idx_embeddings_vector_cosine ON embeddings
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- Alternative: L2 distance index (Euclidean distance)
-- Uncomment if you prefer L2 distance over cosine similarity
-- CREATE INDEX idx_embeddings_vector_l2 ON embeddings
--     USING ivfflat (embedding vector_l2_ops)
--     WITH (lists = 100);

-- Composite index for common query pattern: filtering by type + vector search
CREATE INDEX idx_embeddings_type_created ON embeddings(object_type, created_at DESC);

-- Foreign key constraints to ensure referential integrity
-- Note: We use partial indexes here since object_id can reference either table
ALTER TABLE embeddings
    ADD CONSTRAINT fk_embeddings_object_definition
    FOREIGN KEY (object_id)
    REFERENCES object_definitions(id)
    ON DELETE CASCADE
    NOT VALID;

-- We'll validate this constraint through application logic since
-- object_id can point to either object_definitions or instances

-- Update timestamp trigger
CREATE TRIGGER update_embeddings_updated_at
    BEFORE UPDATE ON embeddings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate cosine similarity (helper for queries)
CREATE OR REPLACE FUNCTION cosine_similarity(a vector, b vector)
RETURNS float AS $$
BEGIN
    RETURN 1 - (a <=> b);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE;

-- View for easy querying of embeddings with object details
CREATE OR REPLACE VIEW embeddings_with_objects AS
SELECT
    e.id,
    e.object_type,
    e.object_id,
    e.content,
    e.embedding,
    e.metadata,
    e.created_at,
    CASE
        WHEN e.object_type = 'object_definition' THEN od.name
        ELSE NULL
    END as object_name,
    CASE
        WHEN e.object_type = 'object_definition' THEN od.display_name
        ELSE NULL
    END as object_display_name,
    CASE
        WHEN e.object_type = 'object_definition' THEN od.category
        ELSE NULL
    END as object_category,
    CASE
        WHEN e.object_type = 'instance' THEN i.current_state
        ELSE NULL
    END as instance_state
FROM embeddings e
LEFT JOIN object_definitions od ON e.object_type = 'object_definition' AND e.object_id = od.id
LEFT JOIN instances i ON e.object_type = 'instance' AND e.object_id = i.id;

-- Comments for documentation
COMMENT ON TABLE embeddings IS 'Stores vector embeddings for semantic search across object definitions and instances';
COMMENT ON COLUMN embeddings.object_type IS 'Type of object: object_definition or instance';
COMMENT ON COLUMN embeddings.object_id IS 'UUID reference to either object_definitions.id or instances.id';
COMMENT ON COLUMN embeddings.content IS 'Original text content that was converted to embedding';
COMMENT ON COLUMN embeddings.embedding IS 'Vector embedding (1536 dimensions for OpenAI ada-002)';
COMMENT ON COLUMN embeddings.metadata IS 'Additional context like category, tags, or custom attributes';
COMMENT ON INDEX idx_embeddings_vector_cosine IS 'IVFFlat index for fast cosine similarity search';
