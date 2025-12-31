-- ============================================================================
-- SuperCore v2.0 - Schema: Documents (RAG Knowledge Base)
-- ============================================================================
-- Description: Documents are the source files uploaded to Oracles for RAG
--              processing. Each document goes through a processing pipeline:
--              upload -> validation -> chunking -> embedding -> indexing.
--
-- Key Features:
--   - Multi-tenancy via solution_id and oracle_id
--   - File type validation and classification
--   - Processing status tracking
--   - S3/MinIO storage path reference
--   - Chunking and embedding statistics
--   - Extensible metadata (JSONB)
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Supported file types for document processing
CREATE TYPE document_file_type AS ENUM (
    'pdf',              -- PDF documents
    'docx',             -- Microsoft Word
    'doc',              -- Legacy Word
    'txt',              -- Plain text
    'md',               -- Markdown
    'html',             -- HTML pages
    'htm',              -- HTML pages (alt extension)
    'csv',              -- CSV data
    'xlsx',             -- Excel spreadsheet
    'xls',              -- Legacy Excel
    'pptx',             -- PowerPoint
    'ppt',              -- Legacy PowerPoint
    'json',             -- JSON data
    'xml',              -- XML data
    'rtf',              -- Rich Text Format
    'odt',              -- OpenDocument Text
    'epub',             -- EPUB e-book
    'png',              -- Image (for OCR)
    'jpg',              -- Image (for OCR)
    'jpeg',             -- Image (for OCR)
    'gif',              -- Image (for OCR)
    'webp',             -- Image (for OCR)
    'mp3',              -- Audio (for transcription)
    'wav',              -- Audio (for transcription)
    'mp4',              -- Video (for transcription)
    'webm',             -- Video (for transcription)
    'url',              -- Web URL (for scraping)
    'other'             -- Other file types
);

-- Document processing status
CREATE TYPE document_processing_status AS ENUM (
    'pending',          -- Uploaded, awaiting processing
    'validating',       -- File validation in progress
    'validated',        -- File validated, ready for processing
    'extracting',       -- Text extraction in progress
    'extracted',        -- Text extracted successfully
    'chunking',         -- Document chunking in progress
    'chunked',          -- Chunking completed
    'embedding',        -- Embedding generation in progress
    'embedded',         -- Embeddings generated
    'indexing',         -- Vector indexing in progress
    'completed',        -- Processing completed successfully
    'failed',           -- Processing failed
    'retrying',         -- Retrying after failure
    'cancelled'         -- Processing cancelled by user
);

-- ============================================================================
-- DOCUMENTS TABLE
-- ============================================================================

CREATE TABLE documents (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys (required for multi-tenancy)
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,

    -- File Information
    filename VARCHAR(500) NOT NULL,
    original_filename VARCHAR(500) NOT NULL,
    file_type document_file_type NOT NULL,
    mime_type VARCHAR(255),
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    file_hash VARCHAR(64),  -- SHA-256 hash for deduplication

    -- Storage
    storage_path VARCHAR(1000) NOT NULL,  -- S3/MinIO path (e.g., "oracle-{id}/documents/{doc_id}/{filename}")
    storage_bucket VARCHAR(255) DEFAULT 'supercore-documents',

    -- Processing
    processing_status document_processing_status DEFAULT 'pending',
    processing_started_at TIMESTAMPTZ,
    processing_error TEXT,
    processing_attempts INTEGER DEFAULT 0,

    -- Extraction Results
    extracted_text TEXT,
    extracted_text_length INTEGER DEFAULT 0,
    language_detected VARCHAR(10),  -- ISO 639-1 (e.g., 'en', 'pt', 'es')

    -- Chunking Results
    chunk_count INTEGER DEFAULT 0,
    chunk_strategy VARCHAR(50) DEFAULT 'semantic',  -- semantic, fixed, recursive

    -- Embedding Results
    embedding_count INTEGER DEFAULT 0,
    embedding_model VARCHAR(255),

    -- Metadata (extensible)
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Expected metadata structure:
    -- {
    --   "source": {
    --     "url": "https://...",
    --     "author": "John Doe",
    --     "created_date": "2024-01-15",
    --     "version": "1.0"
    --   },
    --   "processing": {
    --     "ocr_applied": false,
    --     "transcription_applied": false,
    --     "page_count": 10
    --   },
    --   "classification": {
    --     "category": "policy",
    --     "tags": ["compliance", "internal"],
    --     "priority": "high"
    --   },
    --   "permissions": {
    --     "visibility": "internal",
    --     "department": "legal"
    --   }
    -- }

    -- User Attribution
    uploaded_by_user_id UUID,
    uploaded_by_user_name VARCHAR(255),

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Constraints
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

COMMENT ON TABLE documents IS 'Source files uploaded to Oracles for RAG processing. Each document goes through validation, chunking, embedding, and indexing.';

COMMENT ON COLUMN documents.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN documents.oracle_id IS 'Parent oracle (required)';
COMMENT ON COLUMN documents.solution_id IS 'Parent solution (denormalized for query performance)';
COMMENT ON COLUMN documents.filename IS 'Stored filename (sanitized)';
COMMENT ON COLUMN documents.original_filename IS 'Original filename as uploaded';
COMMENT ON COLUMN documents.file_type IS 'Classified file type';
COMMENT ON COLUMN documents.mime_type IS 'MIME type (e.g., application/pdf)';
COMMENT ON COLUMN documents.file_size_bytes IS 'File size in bytes';
COMMENT ON COLUMN documents.file_hash IS 'SHA-256 hash for deduplication';
COMMENT ON COLUMN documents.storage_path IS 'S3/MinIO storage path';
COMMENT ON COLUMN documents.storage_bucket IS 'S3/MinIO bucket name';
COMMENT ON COLUMN documents.processing_status IS 'Current processing status';
COMMENT ON COLUMN documents.processing_error IS 'Error message if processing failed';
COMMENT ON COLUMN documents.processing_attempts IS 'Number of processing attempts';
COMMENT ON COLUMN documents.extracted_text IS 'Full extracted text content';
COMMENT ON COLUMN documents.extracted_text_length IS 'Character count of extracted text';
COMMENT ON COLUMN documents.language_detected IS 'Detected language (ISO 639-1)';
COMMENT ON COLUMN documents.chunk_count IS 'Number of chunks created';
COMMENT ON COLUMN documents.chunk_strategy IS 'Chunking strategy used';
COMMENT ON COLUMN documents.embedding_count IS 'Number of embeddings generated';
COMMENT ON COLUMN documents.embedding_model IS 'Embedding model used';
COMMENT ON COLUMN documents.metadata IS 'Extensible JSONB metadata';
COMMENT ON COLUMN documents.uploaded_by_user_id IS 'User who uploaded the document';
COMMENT ON COLUMN documents.processed_at IS 'Timestamp when processing completed';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Oracle-based lookups (primary query pattern)
CREATE INDEX idx_documents_oracle_id ON documents(oracle_id) WHERE deleted_at IS NULL;

-- Solution-based lookups
CREATE INDEX idx_documents_solution_id ON documents(solution_id) WHERE deleted_at IS NULL;

-- Combined oracle + solution (common join pattern)
CREATE INDEX idx_documents_oracle_solution ON documents(oracle_id, solution_id) WHERE deleted_at IS NULL;

-- Status filtering (for processing queues)
CREATE INDEX idx_documents_status ON documents(processing_status) WHERE deleted_at IS NULL;

-- Pending documents (for processing workers)
CREATE INDEX idx_documents_pending ON documents(id, oracle_id)
    WHERE processing_status IN ('pending', 'retrying') AND deleted_at IS NULL;

-- Failed documents (for monitoring/retry)
CREATE INDEX idx_documents_failed ON documents(id, processing_attempts)
    WHERE processing_status = 'failed' AND deleted_at IS NULL;

-- Completed documents (for listing)
CREATE INDEX idx_documents_completed ON documents(oracle_id, created_at DESC)
    WHERE processing_status = 'completed' AND deleted_at IS NULL;

-- File type filtering
CREATE INDEX idx_documents_file_type ON documents(file_type) WHERE deleted_at IS NULL;

-- Hash-based deduplication lookup
CREATE INDEX idx_documents_hash ON documents(file_hash) WHERE file_hash IS NOT NULL AND deleted_at IS NULL;

-- Full-text search on filename
CREATE INDEX idx_documents_filename_trgm ON documents USING GIN(filename gin_trgm_ops);

-- Metadata GIN index
CREATE INDEX idx_documents_metadata ON documents USING GIN(metadata jsonb_path_ops);

-- Chronological listing
CREATE INDEX idx_documents_created_at ON documents(created_at DESC) WHERE deleted_at IS NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER documents_updated_at_trigger
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent hard delete
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
