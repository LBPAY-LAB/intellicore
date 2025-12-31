-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 004: Documents Table
-- ============================================================================
-- Description: Creates the documents table - source files uploaded to oracles
--              for RAG processing.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE document_file_type AS ENUM (
    'pdf', 'docx', 'doc', 'txt', 'md', 'html', 'htm',
    'csv', 'xlsx', 'xls', 'pptx', 'ppt', 'json', 'xml',
    'rtf', 'odt', 'epub', 'png', 'jpg', 'jpeg', 'gif', 'webp',
    'mp3', 'wav', 'mp4', 'webm', 'url', 'other'
);

CREATE TYPE document_processing_status AS ENUM (
    'pending', 'validating', 'validated', 'extracting', 'extracted',
    'chunking', 'chunked', 'embedding', 'embedded', 'indexing',
    'completed', 'failed', 'retrying', 'cancelled'
);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type document_file_type NOT NULL,
    mime_type VARCHAR(255),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    file_hash VARCHAR(64),
    storage_path VARCHAR(1000) NOT NULL,
    storage_bucket VARCHAR(255) DEFAULT 'supercore-documents',
    processing_status document_processing_status DEFAULT 'pending',
    processing_started_at TIMESTAMPTZ,
    processing_error TEXT,
    processing_attempts INTEGER DEFAULT 0,
    extracted_text TEXT,
    extracted_text_length INTEGER DEFAULT 0,
    language_detected VARCHAR(10),
    chunk_count INTEGER DEFAULT 0,
    chunk_strategy VARCHAR(50) DEFAULT 'semantic',
    embedding_count INTEGER DEFAULT 0,
    embedding_model VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    uploaded_by_user_id UUID,
    uploaded_by_user_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT documents_oracle_fk FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE CASCADE,
    CONSTRAINT documents_solution_fk FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
    CONSTRAINT documents_filename_not_empty CHECK (LENGTH(TRIM(filename)) > 0),
    CONSTRAINT documents_storage_path_not_empty CHECK (LENGTH(TRIM(storage_path)) > 0),
    CONSTRAINT documents_chunk_count_valid CHECK (chunk_count >= 0),
    CONSTRAINT documents_embedding_count_valid CHECK (embedding_count >= 0)
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE documents IS 'Source files uploaded to Oracles for RAG processing.';
COMMENT ON COLUMN documents.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN documents.oracle_id IS 'Parent oracle';
COMMENT ON COLUMN documents.solution_id IS 'Parent solution (denormalized)';
COMMENT ON COLUMN documents.filename IS 'Stored filename (sanitized)';
COMMENT ON COLUMN documents.original_filename IS 'Original filename as uploaded';
COMMENT ON COLUMN documents.file_type IS 'Classified file type';
COMMENT ON COLUMN documents.mime_type IS 'MIME type';
COMMENT ON COLUMN documents.file_size_bytes IS 'File size in bytes';
COMMENT ON COLUMN documents.file_hash IS 'SHA-256 hash for deduplication';
COMMENT ON COLUMN documents.storage_path IS 'S3/MinIO storage path';
COMMENT ON COLUMN documents.processing_status IS 'Current processing status';
COMMENT ON COLUMN documents.processing_error IS 'Error message if failed';
COMMENT ON COLUMN documents.extracted_text IS 'Full extracted text content';
COMMENT ON COLUMN documents.chunk_count IS 'Number of chunks created';
COMMENT ON COLUMN documents.embedding_count IS 'Number of embeddings generated';
COMMENT ON COLUMN documents.metadata IS 'Extensible JSONB metadata';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_documents_oracle_id ON documents(oracle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_solution_id ON documents(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_oracle_solution ON documents(oracle_id, solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_status ON documents(processing_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_pending ON documents(id, oracle_id)
    WHERE processing_status IN ('pending', 'retrying') AND deleted_at IS NULL;
CREATE INDEX idx_documents_failed ON documents(id, processing_attempts)
    WHERE processing_status = 'failed' AND deleted_at IS NULL;
CREATE INDEX idx_documents_completed ON documents(oracle_id, created_at DESC)
    WHERE processing_status = 'completed' AND deleted_at IS NULL;
CREATE INDEX idx_documents_file_type ON documents(file_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_hash ON documents(file_hash) WHERE file_hash IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_documents_filename_trgm ON documents USING GIN(filename gin_trgm_ops);
CREATE INDEX idx_documents_metadata ON documents USING GIN(metadata jsonb_path_ops);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER documents_updated_at_trigger
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER documents_prevent_hard_delete
    BEFORE DELETE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION prevent_hard_delete();

-- Auto-set processed_at when status becomes completed
CREATE OR REPLACE FUNCTION set_document_processed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
        NEW.processed_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_set_processed_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION set_document_processed_at();

-- Update oracle stats when document is completed
CREATE OR REPLACE FUNCTION update_oracle_document_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
        UPDATE oracles
        SET stats = jsonb_set(
            jsonb_set(
                stats,
                '{document_count}',
                to_jsonb(COALESCE((stats->>'document_count')::int, 0) + 1)
            ),
            '{last_indexed_at}',
            to_jsonb(NOW()::text)
        )
        WHERE id = NEW.oracle_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_update_oracle_stats
    AFTER UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_oracle_document_stats();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS documents_update_oracle_stats ON documents;
DROP TRIGGER IF EXISTS documents_set_processed_at ON documents;
DROP TRIGGER IF EXISTS documents_prevent_hard_delete ON documents;
DROP TRIGGER IF EXISTS documents_updated_at_trigger ON documents;

DROP FUNCTION IF EXISTS update_oracle_document_stats();
DROP FUNCTION IF EXISTS set_document_processed_at();

DROP TABLE IF EXISTS documents CASCADE;
DROP TYPE IF EXISTS document_processing_status;
DROP TYPE IF EXISTS document_file_type;

-- +goose StatementEnd
