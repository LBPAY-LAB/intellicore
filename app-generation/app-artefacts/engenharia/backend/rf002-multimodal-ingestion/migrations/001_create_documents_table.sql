-- Migration 001: Create documents table
-- RF002 - Multimodal Knowledge Ingestion
-- Created: 2025-12-26

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

CREATE TYPE document_status AS ENUM (
    '''pending''',
    '''processing''',
    '''completed''',
    '''failed'''
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oracle_id UUID NOT NULL,
    session_id UUID,
    
    -- File metadata
    filename VARCHAR(512) NOT NULL,
    original_filename VARCHAR(512) NOT NULL,
    mime_type VARCHAR(128) NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0),
    file_path TEXT NOT NULL,
    file_hash VARCHAR(64),
    
    -- Processing status
    status document_status NOT NULL DEFAULT '''pending''',
    progress_percent SMALLINT DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    error_message TEXT,
    retry_count SMALLINT DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '''{}'''::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_documents_oracle_id ON documents(oracle_id);
CREATE INDEX idx_documents_session_id ON documents(session_id) WHERE session_id IS NOT NULL;
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_mime_type ON documents(mime_type);
CREATE INDEX idx_documents_file_hash ON documents(file_hash) WHERE file_hash IS NOT NULL;

-- GIN index for JSONB metadata queries
CREATE INDEX idx_documents_metadata ON documents USING GIN (metadata);

-- Composite index for common queries
CREATE INDEX idx_documents_oracle_status_created ON documents(oracle_id, status, created_at DESC);

-- Full-text search on filename
CREATE INDEX idx_documents_filename_trgm ON documents USING GIN (original_filename gin_trgm_ops);

-- Foreign key to oracles table (if exists)
-- ALTER TABLE documents ADD CONSTRAINT fk_documents_oracle
--     FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE CASCADE;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE documents IS '''Stores metadata about uploaded documents for multimodal ingestion''';
COMMENT ON COLUMN documents.oracle_id IS '''Links document to a specific Oracle (tenant isolation)''';
COMMENT ON COLUMN documents.session_id IS '''Groups documents uploaded together''';
COMMENT ON COLUMN documents.file_hash IS '''SHA256 hash for deduplication''';
COMMENT ON COLUMN documents.metadata IS '''Flexible JSONB field for additional metadata (tags, custom fields, etc.)''';
