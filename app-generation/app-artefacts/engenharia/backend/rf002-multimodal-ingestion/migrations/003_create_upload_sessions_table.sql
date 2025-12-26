-- Migration 003: Create upload_sessions table
-- RF002 - Multimodal Knowledge Ingestion
-- Created: 2025-12-26

CREATE TYPE session_status AS ENUM (
    '''active''',
    '''completed''',
    '''failed''',
    '''expired'''
);

CREATE TABLE IF NOT EXISTS upload_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    oracle_id UUID NOT NULL,
    
    -- Session details
    session_name VARCHAR(256),
    description TEXT,
    
    -- Statistics
    total_files INT NOT NULL DEFAULT 0 CHECK (total_files >= 0),
    completed_files INT NOT NULL DEFAULT 0 CHECK (completed_files >= 0),
    failed_files INT NOT NULL DEFAULT 0 CHECK (failed_files >= 0),
    total_bytes BIGINT NOT NULL DEFAULT 0 CHECK (total_bytes >= 0),
    processed_bytes BIGINT NOT NULL DEFAULT 0 CHECK (processed_bytes >= 0),
    
    -- Status
    status session_status NOT NULL DEFAULT '''active''',
    
    -- Metadata
    metadata JSONB DEFAULT '''{}'''::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '''7 days'''
);

-- Indexes
CREATE INDEX idx_upload_sessions_oracle_id ON upload_sessions(oracle_id);
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX idx_upload_sessions_created_at ON upload_sessions(created_at DESC);
CREATE INDEX idx_upload_sessions_expires_at ON upload_sessions(expires_at) WHERE status = '''active''';

-- GIN index for JSONB metadata
CREATE INDEX idx_upload_sessions_metadata ON upload_sessions USING GIN (metadata);

-- Composite index for common queries
CREATE INDEX idx_upload_sessions_oracle_status_created ON upload_sessions(oracle_id, status, created_at DESC);

-- Auto-update updated_at timestamp
CREATE TRIGGER trigger_upload_sessions_updated_at
    BEFORE UPDATE ON upload_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Computed column for progress percentage
ALTER TABLE upload_sessions ADD COLUMN progress_percent INT GENERATED ALWAYS AS (
    CASE 
        WHEN total_files = 0 THEN 0
        ELSE ((completed_files + failed_files) * 100 / total_files)
    END
) STORED;

-- Comments
COMMENT ON TABLE upload_sessions IS '''Tracks batch upload sessions for grouping multiple documents''';
COMMENT ON COLUMN upload_sessions.expires_at IS '''Session expiration (default 7 days). Cleanup job deletes expired sessions.''';
COMMENT ON COLUMN upload_sessions.progress_percent IS '''Auto-calculated progress (completed + failed / total)''';

-- Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    WITH deleted AS (
        DELETE FROM upload_sessions
        WHERE status = '''expired''' 
          AND updated_at < NOW() - INTERVAL '''30 days'''
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS '''Deletes expired sessions older than 30 days''';
