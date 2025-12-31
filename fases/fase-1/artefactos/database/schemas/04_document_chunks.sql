-- ============================================================================
-- SuperCore v2.0 - Schema: Document Chunks (RAG Chunking)
-- ============================================================================
-- Description: Document chunks are the segmented pieces of documents used
--              for RAG retrieval. Each chunk has its own embedding stored
--              in the vector database (Qdrant) with a reference ID.
--
-- Key Features:
--   - Multi-tenancy via solution_id, oracle_id, document_id
--   - Sequential chunk indexing
--   - Embedding ID reference to Qdrant
--   - Token count tracking
--   - Overlap metadata
--   - Chunk-level metadata (page, section, etc.)
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- DOCUMENT CHUNKS TABLE
-- ============================================================================

CREATE TABLE document_chunks (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys (hierarchical multi-tenancy)
    document_id UUID NOT NULL,
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,

    -- Chunk Position
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    total_chunks INTEGER,  -- Total chunks in document (denormalized for convenience)

    -- Chunk Content
    chunk_text TEXT NOT NULL,
    chunk_text_length INTEGER NOT NULL DEFAULT 0,
    token_count INTEGER,  -- Approximate token count

    -- Chunking Information
    start_char_offset INTEGER,  -- Character offset in original document
    end_char_offset INTEGER,
    overlap_tokens INTEGER DEFAULT 0,  -- Overlap with previous chunk

    -- Embedding Reference (Qdrant)
    embedding_id VARCHAR(255),  -- Qdrant point ID
    embedding_vector_hash VARCHAR(64),  -- Hash of embedding for integrity

    -- Chunk Metadata
    chunk_metadata JSONB DEFAULT '{}'::jsonb,
    -- Expected structure:
    -- {
    --   "source": {
    --     "page_number": 5,
    --     "section": "Introduction",
    --     "paragraph": 3
    --   },
    --   "headers": ["Chapter 1", "Section 1.1"],
    --   "formatting": {
    --     "has_code": false,
    --     "has_table": true,
    --     "has_list": false
    --   },
    --   "entities": ["ACME Corp", "John Doe"],
    --   "keywords": ["compliance", "regulation"]
    -- }

    -- Retrieval Statistics (updated on queries)
    retrieval_count INTEGER DEFAULT 0,
    last_retrieved_at TIMESTAMPTZ,
    relevance_score_avg DECIMAL(5,4),  -- Average similarity score when retrieved

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chunks_document_fk FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT chunks_oracle_fk FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE CASCADE,
    CONSTRAINT chunks_solution_fk FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
    CONSTRAINT chunks_text_not_empty CHECK (LENGTH(TRIM(chunk_text)) > 0),
    CONSTRAINT chunks_unique_per_document UNIQUE (document_id, chunk_index),
    CONSTRAINT chunks_offset_valid CHECK (
        start_char_offset IS NULL OR
        end_char_offset IS NULL OR
        end_char_offset > start_char_offset
    )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE document_chunks IS 'Segmented pieces of documents for RAG retrieval. Each chunk has an embedding stored in Qdrant.';

COMMENT ON COLUMN document_chunks.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN document_chunks.document_id IS 'Parent document';
COMMENT ON COLUMN document_chunks.oracle_id IS 'Parent oracle (denormalized)';
COMMENT ON COLUMN document_chunks.solution_id IS 'Parent solution (denormalized)';
COMMENT ON COLUMN document_chunks.chunk_index IS 'Sequential position in document (0-based)';
COMMENT ON COLUMN document_chunks.total_chunks IS 'Total chunks in document';
COMMENT ON COLUMN document_chunks.chunk_text IS 'Chunk text content';
COMMENT ON COLUMN document_chunks.chunk_text_length IS 'Character count';
COMMENT ON COLUMN document_chunks.token_count IS 'Approximate token count';
COMMENT ON COLUMN document_chunks.start_char_offset IS 'Start position in original document';
COMMENT ON COLUMN document_chunks.end_char_offset IS 'End position in original document';
COMMENT ON COLUMN document_chunks.overlap_tokens IS 'Overlap with previous chunk';
COMMENT ON COLUMN document_chunks.embedding_id IS 'Qdrant point ID';
COMMENT ON COLUMN document_chunks.embedding_vector_hash IS 'Hash for embedding integrity check';
COMMENT ON COLUMN document_chunks.chunk_metadata IS 'Page, section, headers, entities, etc.';
COMMENT ON COLUMN document_chunks.retrieval_count IS 'Times retrieved in RAG queries';
COMMENT ON COLUMN document_chunks.last_retrieved_at IS 'Last retrieval timestamp';
COMMENT ON COLUMN document_chunks.relevance_score_avg IS 'Average similarity score';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Document-based lookups (primary pattern)
CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);

-- Sequential access within document
CREATE INDEX idx_chunks_document_index ON document_chunks(document_id, chunk_index);

-- Oracle-based lookups (for cross-document retrieval)
CREATE INDEX idx_chunks_oracle_id ON document_chunks(oracle_id);

-- Solution-based lookups
CREATE INDEX idx_chunks_solution_id ON document_chunks(solution_id);

-- Embedding ID lookup (for Qdrant sync)
CREATE INDEX idx_chunks_embedding_id ON document_chunks(embedding_id) WHERE embedding_id IS NOT NULL;

-- Retrieval statistics (for analytics)
CREATE INDEX idx_chunks_retrieval_count ON document_chunks(retrieval_count DESC) WHERE retrieval_count > 0;

-- Metadata GIN index
CREATE INDEX idx_chunks_metadata ON document_chunks USING GIN(chunk_metadata jsonb_path_ops);

-- Full-text search on chunk content
CREATE INDEX idx_chunks_text_search ON document_chunks USING GIN(to_tsvector('english', chunk_text));

-- Token count (for context window management)
CREATE INDEX idx_chunks_token_count ON document_chunks(token_count) WHERE token_count IS NOT NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER chunks_updated_at_trigger
    BEFORE UPDATE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate text length on insert/update
CREATE OR REPLACE FUNCTION calculate_chunk_text_length()
RETURNS TRIGGER AS $$
BEGIN
    NEW.chunk_text_length = LENGTH(NEW.chunk_text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chunks_calculate_length
    BEFORE INSERT OR UPDATE OF chunk_text ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION calculate_chunk_text_length();

-- Update document chunk_count when chunks are added
CREATE OR REPLACE FUNCTION update_document_chunk_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE documents
        SET chunk_count = chunk_count + 1
        WHERE id = NEW.document_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE documents
        SET chunk_count = chunk_count - 1
        WHERE id = OLD.document_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chunks_update_document_count
    AFTER INSERT OR DELETE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_document_chunk_count();

-- Update oracle stats when embeddings are created
CREATE OR REPLACE FUNCTION update_oracle_chunk_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.embedding_id IS NOT NULL AND (OLD.embedding_id IS NULL OR OLD.embedding_id != NEW.embedding_id) THEN
        UPDATE oracles
        SET stats = jsonb_set(
            jsonb_set(
                stats,
                '{chunk_count}',
                to_jsonb(COALESCE((stats->>'chunk_count')::int, 0) + 1)
            ),
            '{embedding_count}',
            to_jsonb(COALESCE((stats->>'embedding_count')::int, 0) + 1)
        )
        WHERE id = NEW.oracle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER chunks_update_oracle_stats
    AFTER UPDATE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_oracle_chunk_stats();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to retrieve chunks with surrounding context
CREATE OR REPLACE FUNCTION get_chunk_with_context(
    p_chunk_id UUID,
    p_context_before INTEGER DEFAULT 1,
    p_context_after INTEGER DEFAULT 1
)
RETURNS TABLE (
    chunk_id UUID,
    chunk_index INTEGER,
    chunk_text TEXT,
    is_target BOOLEAN
) AS $$
DECLARE
    v_document_id UUID;
    v_target_index INTEGER;
BEGIN
    -- Get target chunk info
    SELECT document_id, dc.chunk_index INTO v_document_id, v_target_index
    FROM document_chunks dc
    WHERE id = p_chunk_id;

    -- Return chunks with context
    RETURN QUERY
    SELECT
        dc.id,
        dc.chunk_index,
        dc.chunk_text,
        (dc.chunk_index = v_target_index) AS is_target
    FROM document_chunks dc
    WHERE dc.document_id = v_document_id
    AND dc.chunk_index BETWEEN (v_target_index - p_context_before) AND (v_target_index + p_context_after)
    ORDER BY dc.chunk_index;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_chunk_with_context IS 'Retrieves a chunk with surrounding context chunks';
