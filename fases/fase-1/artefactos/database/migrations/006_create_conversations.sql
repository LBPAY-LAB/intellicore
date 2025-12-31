-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 006: Conversations Table
-- ============================================================================
-- Description: Creates the conversations table - chat sessions with oracles.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE conversation_status AS ENUM (
    'active',
    'paused',
    'completed',
    'archived',
    'deleted'
);

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    session_metadata JSONB DEFAULT '{}'::jsonb,
    user_id UUID,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    title VARCHAR(500),
    summary TEXT,
    status conversation_status DEFAULT 'active',
    message_count INTEGER DEFAULT 0,
    user_message_count INTEGER DEFAULT 0,
    assistant_message_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    input_tokens_used INTEGER DEFAULT 0,
    output_tokens_used INTEGER DEFAULT 0,
    first_message_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    is_helpful BOOLEAN,
    context_summary TEXT,
    context_updated_at TIMESTAMPTZ,
    config_override JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    CONSTRAINT conversations_oracle_fk FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE CASCADE,
    CONSTRAINT conversations_solution_fk FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
    CONSTRAINT conversations_session_not_empty CHECK (LENGTH(TRIM(session_id)) > 0)
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE conversations IS 'Chat sessions with Oracles.';
COMMENT ON COLUMN conversations.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN conversations.oracle_id IS 'Parent oracle';
COMMENT ON COLUMN conversations.solution_id IS 'Parent solution (denormalized)';
COMMENT ON COLUMN conversations.session_id IS 'Client-generated session identifier';
COMMENT ON COLUMN conversations.session_metadata IS 'Client metadata (browser, OS, etc.)';
COMMENT ON COLUMN conversations.user_id IS 'Authenticated user ID (optional)';
COMMENT ON COLUMN conversations.title IS 'Conversation title';
COMMENT ON COLUMN conversations.summary IS 'AI-generated summary';
COMMENT ON COLUMN conversations.status IS 'Current status';
COMMENT ON COLUMN conversations.message_count IS 'Total message count';
COMMENT ON COLUMN conversations.total_tokens_used IS 'Total tokens consumed';
COMMENT ON COLUMN conversations.user_rating IS 'User satisfaction rating (1-5)';
COMMENT ON COLUMN conversations.context_summary IS 'Compressed context for long conversations';
COMMENT ON COLUMN conversations.config_override IS 'Per-conversation config overrides';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_conversations_oracle_id ON conversations(oracle_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_solution_id ON conversations(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_session_id ON conversations(session_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_oracle_session ON conversations(oracle_id, session_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_user_id ON conversations(user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_conversations_status ON conversations(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_active ON conversations(oracle_id, last_message_at DESC)
    WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_conversations_recent ON conversations(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_conversations_rated ON conversations(user_rating)
    WHERE user_rating IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_conversations_session_meta ON conversations USING GIN(session_metadata jsonb_path_ops);
CREATE INDEX idx_conversations_title_search ON conversations USING GIN(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, ''))
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER conversations_updated_at_trigger
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER conversations_prevent_hard_delete
    BEFORE DELETE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION prevent_hard_delete();

-- Auto-set first_message_at
CREATE OR REPLACE FUNCTION set_conversation_first_message()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.message_count = 1 AND NEW.first_message_at IS NULL THEN
        NEW.first_message_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_set_first_message
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION set_conversation_first_message();

-- Auto-calculate duration
CREATE OR REPLACE FUNCTION calculate_conversation_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'archived') AND OLD.status = 'active' THEN
        IF NEW.first_message_at IS NOT NULL AND NEW.last_message_at IS NOT NULL THEN
            NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.last_message_at - NEW.first_message_at))::INTEGER;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_calculate_duration
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_conversation_duration();

-- Update oracle stats
CREATE OR REPLACE FUNCTION update_oracle_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE oracles
    SET stats = jsonb_set(
        stats,
        '{conversation_count}',
        to_jsonb(COALESCE((stats->>'conversation_count')::int, 0) + 1)
    )
    WHERE id = NEW.oracle_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER conversations_update_oracle_stats
    AFTER INSERT ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_oracle_conversation_stats();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get or create conversation for session
CREATE OR REPLACE FUNCTION get_or_create_conversation(
    p_oracle_id UUID,
    p_solution_id UUID,
    p_session_id VARCHAR(255),
    p_user_id UUID DEFAULT NULL,
    p_user_name VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE oracle_id = p_oracle_id
    AND session_id = p_session_id
    AND status = 'active'
    AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (oracle_id, solution_id, session_id, user_id, user_name)
        VALUES (p_oracle_id, p_solution_id, p_session_id, p_user_id, p_user_name)
        RETURNING id INTO v_conversation_id;
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_or_create_conversation IS 'Gets existing conversation or creates new one';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP FUNCTION IF EXISTS get_or_create_conversation(UUID, UUID, VARCHAR, UUID, VARCHAR);
DROP TRIGGER IF EXISTS conversations_update_oracle_stats ON conversations;
DROP TRIGGER IF EXISTS conversations_calculate_duration ON conversations;
DROP TRIGGER IF EXISTS conversations_set_first_message ON conversations;
DROP TRIGGER IF EXISTS conversations_prevent_hard_delete ON conversations;
DROP TRIGGER IF EXISTS conversations_updated_at_trigger ON conversations;

DROP FUNCTION IF EXISTS update_oracle_conversation_stats();
DROP FUNCTION IF EXISTS calculate_conversation_duration();
DROP FUNCTION IF EXISTS set_conversation_first_message();

DROP TABLE IF EXISTS conversations CASCADE;
DROP TYPE IF EXISTS conversation_status;

-- +goose StatementEnd
