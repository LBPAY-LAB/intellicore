-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 005: Document Chunks Table
-- ============================================================================
-- Description: Creates the document_chunks table - segmented pieces of
--              documents for RAG retrieval with embedding references.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- DOCUMENT CHUNKS TABLE
-- ============================================================================

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL,
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    total_chunks INTEGER,
    chunk_text TEXT NOT NULL,
    chunk_text_length INTEGER NOT NULL DEFAULT 0,
    token_count INTEGER,
    start_char_offset INTEGER,
    end_char_offset INTEGER,
    overlap_tokens INTEGER DEFAULT 0,
    embedding_id VARCHAR(255),
    embedding_vector_hash VARCHAR(64),
    chunk_metadata JSONB DEFAULT '{}'::jsonb,
    retrieval_count INTEGER DEFAULT 0,
    last_retrieved_at TIMESTAMPTZ,
    relevance_score_avg DECIMAL(5,4),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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

COMMENT ON TABLE document_chunks IS 'Segmented pieces of documents for RAG retrieval.';
COMMENT ON COLUMN document_chunks.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN document_chunks.document_id IS 'Parent document';
COMMENT ON COLUMN document_chunks.oracle_id IS 'Parent oracle (denormalized)';
COMMENT ON COLUMN document_chunks.solution_id IS 'Parent solution (denormalized)';
COMMENT ON COLUMN document_chunks.chunk_index IS 'Sequential position (0-based)';
COMMENT ON COLUMN document_chunks.total_chunks IS 'Total chunks in document';
COMMENT ON COLUMN document_chunks.chunk_text IS 'Chunk text content';
COMMENT ON COLUMN document_chunks.chunk_text_length IS 'Character count';
COMMENT ON COLUMN document_chunks.token_count IS 'Approximate token count';
COMMENT ON COLUMN document_chunks.embedding_id IS 'Qdrant point ID';
COMMENT ON COLUMN document_chunks.chunk_metadata IS 'Page, section, headers, etc.';
COMMENT ON COLUMN document_chunks.retrieval_count IS 'Times retrieved in queries';
COMMENT ON COLUMN document_chunks.relevance_score_avg IS 'Average similarity score';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX idx_chunks_document_index ON document_chunks(document_id, chunk_index);
CREATE INDEX idx_chunks_oracle_id ON document_chunks(oracle_id);
CREATE INDEX idx_chunks_solution_id ON document_chunks(solution_id);
CREATE INDEX idx_chunks_embedding_id ON document_chunks(embedding_id) WHERE embedding_id IS NOT NULL;
CREATE INDEX idx_chunks_retrieval_count ON document_chunks(retrieval_count DESC) WHERE retrieval_count > 0;
CREATE INDEX idx_chunks_metadata ON document_chunks USING GIN(chunk_metadata jsonb_path_ops);
CREATE INDEX idx_chunks_text_search ON document_chunks USING GIN(to_tsvector('english', chunk_text));
CREATE INDEX idx_chunks_token_count ON document_chunks(token_count) WHERE token_count IS NOT NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER chunks_updated_at_trigger
    BEFORE UPDATE ON document_chunks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-calculate text length
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

-- Update document chunk_count
CREATE OR REPLACE FUNCTION update_document_chunk_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE documents SET chunk_count = chunk_count + 1 WHERE id = NEW.document_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE documents SET chunk_count = chunk_count - 1 WHERE id = OLD.document_id;
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

-- Get chunk with surrounding context
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
    SELECT document_id, dc.chunk_index INTO v_document_id, v_target_index
    FROM document_chunks dc WHERE id = p_chunk_id;

    RETURN QUERY
    SELECT dc.id, dc.chunk_index, dc.chunk_text, (dc.chunk_index = v_target_index)
    FROM document_chunks dc
    WHERE dc.document_id = v_document_id
    AND dc.chunk_index BETWEEN (v_target_index - p_context_before) AND (v_target_index + p_context_after)
    ORDER BY dc.chunk_index;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_chunk_with_context IS 'Retrieves a chunk with surrounding context chunks';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP FUNCTION IF EXISTS get_chunk_with_context(UUID, INTEGER, INTEGER);
DROP TRIGGER IF EXISTS chunks_update_oracle_stats ON document_chunks;
DROP TRIGGER IF EXISTS chunks_update_document_count ON document_chunks;
DROP TRIGGER IF EXISTS chunks_calculate_length ON document_chunks;
DROP TRIGGER IF EXISTS chunks_updated_at_trigger ON document_chunks;

DROP FUNCTION IF EXISTS update_oracle_chunk_stats();
DROP FUNCTION IF EXISTS update_document_chunk_count();
DROP FUNCTION IF EXISTS calculate_chunk_text_length();

DROP TABLE IF EXISTS document_chunks CASCADE;

-- +goose StatementEnd
