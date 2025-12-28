-- Migration 002: Create processed_content table
-- RF002 - Multimodal Knowledge Ingestion
-- Created: 2025-12-26

CREATE TYPE content_type AS ENUM (
    '''text''',           -- Extracted text from documents
    '''metadata''',       -- Structured metadata
    '''ocr_text''',       -- OCR-extracted text from images/PDFs
    '''transcript''',     -- Audio/video transcription
    '''html''',           -- Web content (HTML)
    '''structured'''      -- JSON/XML/CSV structured data
);

CREATE TABLE IF NOT EXISTS processed_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL,
    
    -- Content details
    content_type content_type NOT NULL,
    content_text TEXT,
    content_data JSONB,
    
    -- Quality metrics
    confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
    language VARCHAR(10),  -- ISO 639-1 language code
    page_number INT,       -- For multi-page documents
    chunk_index INT,       -- For chunked processing
    
    -- Metadata
    processor_name VARCHAR(64),  -- Which processor generated this
    processor_version VARCHAR(16),
    metadata JSONB DEFAULT '''{}'''::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_processed_content_document_id ON processed_content(document_id);
CREATE INDEX idx_processed_content_type ON processed_content(content_type);
CREATE INDEX idx_processed_content_created_at ON processed_content(created_at DESC);
CREATE INDEX idx_processed_content_language ON processed_content(language) WHERE language IS NOT NULL;

-- GIN indexes for JSONB and full-text search
CREATE INDEX idx_processed_content_data ON processed_content USING GIN (content_data) WHERE content_data IS NOT NULL;
CREATE INDEX idx_processed_content_metadata ON processed_content USING GIN (metadata);

-- Full-text search on content_text
CREATE INDEX idx_processed_content_text_fts ON processed_content USING GIN (to_tsvector('''english''', COALESCE(content_text, '''''')));

-- Composite index for common queries
CREATE INDEX idx_processed_content_doc_type_created ON processed_content(document_id, content_type, created_at DESC);

-- Foreign key to documents table
ALTER TABLE processed_content ADD CONSTRAINT fk_processed_content_document
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE;

-- Comments
COMMENT ON TABLE processed_content IS '''Stores extracted/processed content from documents''';
COMMENT ON COLUMN processed_content.confidence_score IS '''Quality score (0-1) for OCR/transcription accuracy''';
COMMENT ON COLUMN processed_content.chunk_index IS '''For large documents split into chunks''';
COMMENT ON COLUMN processed_content.content_data IS '''Structured data for JSON/XML/CSV files''';
