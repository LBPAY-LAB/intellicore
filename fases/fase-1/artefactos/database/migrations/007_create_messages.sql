-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 007: Messages Table
-- ============================================================================
-- Description: Creates the messages table - individual chat messages within
--              conversations with source citations and metrics.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE message_role AS ENUM (
    'user',
    'assistant',
    'system',
    'tool',
    'error'
);

CREATE TYPE message_status AS ENUM (
    'pending',
    'streaming',
    'completed',
    'failed',
    'cancelled'
);

CREATE TYPE message_feedback AS ENUM (
    'positive',
    'negative',
    'neutral'
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL,
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    content_format VARCHAR(50) DEFAULT 'text',
    status message_status DEFAULT 'completed',
    sequence_number INTEGER NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,
    latency_ms INTEGER,
    total_time_ms INTEGER,
    model_used VARCHAR(100),
    sources JSONB DEFAULT '[]'::jsonb,
    tool_calls JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    feedback message_feedback,
    feedback_text TEXT,
    feedback_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT messages_conversation_fk FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    CONSTRAINT messages_oracle_fk FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE CASCADE,
    CONSTRAINT messages_solution_fk FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
    CONSTRAINT messages_content_not_empty CHECK (LENGTH(TRIM(content)) > 0),
    CONSTRAINT messages_sequence_positive CHECK (sequence_number > 0),
    CONSTRAINT messages_unique_sequence UNIQUE (conversation_id, sequence_number),
    CONSTRAINT messages_tokens_valid CHECK (
        (input_tokens IS NULL OR input_tokens >= 0) AND
        (output_tokens IS NULL OR output_tokens >= 0) AND
        (total_tokens IS NULL OR total_tokens >= 0)
    ),
    CONSTRAINT messages_latency_valid CHECK (
        (latency_ms IS NULL OR latency_ms >= 0) AND
        (total_time_ms IS NULL OR total_time_ms >= 0)
    )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE messages IS 'Individual chat messages within conversations.';
COMMENT ON COLUMN messages.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN messages.conversation_id IS 'Parent conversation';
COMMENT ON COLUMN messages.oracle_id IS 'Parent oracle (denormalized)';
COMMENT ON COLUMN messages.solution_id IS 'Parent solution (denormalized)';
COMMENT ON COLUMN messages.role IS 'Message sender role';
COMMENT ON COLUMN messages.content IS 'Message content';
COMMENT ON COLUMN messages.content_format IS 'Content format (text, markdown, html)';
COMMENT ON COLUMN messages.status IS 'Message status (for streaming)';
COMMENT ON COLUMN messages.sequence_number IS 'Order within conversation';
COMMENT ON COLUMN messages.input_tokens IS 'Input tokens used';
COMMENT ON COLUMN messages.output_tokens IS 'Output tokens used';
COMMENT ON COLUMN messages.total_tokens IS 'Total tokens used';
COMMENT ON COLUMN messages.latency_ms IS 'Time to first token (ms)';
COMMENT ON COLUMN messages.model_used IS 'Actual LLM model used';
COMMENT ON COLUMN messages.sources IS 'RAG source citations';
COMMENT ON COLUMN messages.tool_calls IS 'Tool/function calls and results';
COMMENT ON COLUMN messages.metadata IS 'Extended metadata';
COMMENT ON COLUMN messages.feedback IS 'User feedback (positive/negative)';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_seq ON messages(conversation_id, sequence_number);
CREATE INDEX idx_messages_oracle_id ON messages(oracle_id);
CREATE INDEX idx_messages_solution_id ON messages(solution_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_status ON messages(status) WHERE status != 'completed';
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_with_sources ON messages(conversation_id) WHERE sources != '[]'::jsonb;
CREATE INDEX idx_messages_with_feedback ON messages(feedback) WHERE feedback IS NOT NULL;
CREATE INDEX idx_messages_negative_feedback ON messages(oracle_id, created_at DESC) WHERE feedback = 'negative';
CREATE INDEX idx_messages_sources ON messages USING GIN(sources jsonb_path_ops);
CREATE INDEX idx_messages_tool_calls ON messages USING GIN(tool_calls jsonb_path_ops);
CREATE INDEX idx_messages_metadata ON messages USING GIN(metadata jsonb_path_ops);
CREATE INDEX idx_messages_content_search ON messages USING GIN(to_tsvector('english', content));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER messages_updated_at_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-set feedback_at
CREATE OR REPLACE FUNCTION set_message_feedback_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.feedback IS NOT NULL AND (OLD.feedback IS NULL OR OLD.feedback != NEW.feedback) THEN
        NEW.feedback_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_set_feedback_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION set_message_feedback_at();

-- Update conversation stats
CREATE OR REPLACE FUNCTION update_conversation_message_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET
        message_count = message_count + 1,
        user_message_count = CASE WHEN NEW.role = 'user' THEN user_message_count + 1 ELSE user_message_count END,
        assistant_message_count = CASE WHEN NEW.role = 'assistant' THEN assistant_message_count + 1 ELSE assistant_message_count END,
        total_tokens_used = total_tokens_used + COALESCE(NEW.total_tokens, 0),
        input_tokens_used = input_tokens_used + COALESCE(NEW.input_tokens, 0),
        output_tokens_used = output_tokens_used + COALESCE(NEW.output_tokens, 0),
        last_message_at = NEW.created_at,
        first_message_at = CASE WHEN first_message_at IS NULL THEN NEW.created_at ELSE first_message_at END
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_conversation_stats
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_message_stats();

-- Update oracle message stats
CREATE OR REPLACE FUNCTION update_oracle_message_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE oracles
    SET stats = jsonb_set(
        stats,
        '{message_count}',
        to_jsonb(COALESCE((stats->>'message_count')::int, 0) + 1)
    )
    WHERE id = NEW.oracle_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_oracle_stats
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_oracle_message_stats();

-- Update chunk retrieval stats
CREATE OR REPLACE FUNCTION update_chunk_retrieval_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_chunk_id UUID;
    v_score DECIMAL;
    v_source JSONB;
BEGIN
    IF NEW.role = 'assistant' AND jsonb_array_length(NEW.sources) > 0 THEN
        FOR v_source IN SELECT * FROM jsonb_array_elements(NEW.sources)
        LOOP
            v_chunk_id := (v_source->>'chunk_id')::UUID;
            v_score := (v_source->>'relevance_score')::DECIMAL;

            IF v_chunk_id IS NOT NULL THEN
                UPDATE document_chunks
                SET
                    retrieval_count = retrieval_count + 1,
                    last_retrieved_at = NOW(),
                    relevance_score_avg = CASE
                        WHEN relevance_score_avg IS NULL THEN v_score
                        ELSE (relevance_score_avg * retrieval_count + v_score) / (retrieval_count + 1)
                    END
                WHERE id = v_chunk_id;
            END IF;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER messages_update_chunk_stats
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chunk_retrieval_stats();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get next sequence number
CREATE OR REPLACE FUNCTION get_next_message_sequence(p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_next_seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(sequence_number), 0) + 1 INTO v_next_seq
    FROM messages WHERE conversation_id = p_conversation_id;
    RETURN v_next_seq;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_message_sequence IS 'Gets the next sequence number for a conversation';

-- Get conversation history with pagination
CREATE OR REPLACE FUNCTION get_conversation_history(
    p_conversation_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_before_sequence INTEGER DEFAULT NULL
)
RETURNS TABLE (
    message_id UUID,
    role message_role,
    content TEXT,
    sources JSONB,
    created_at TIMESTAMPTZ,
    sequence_number INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT m.id, m.role, m.content, m.sources, m.created_at, m.sequence_number
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    AND (p_before_sequence IS NULL OR m.sequence_number < p_before_sequence)
    ORDER BY m.sequence_number DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_conversation_history IS 'Gets paginated conversation history';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP FUNCTION IF EXISTS get_conversation_history(UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS get_next_message_sequence(UUID);
DROP TRIGGER IF EXISTS messages_update_chunk_stats ON messages;
DROP TRIGGER IF EXISTS messages_update_oracle_stats ON messages;
DROP TRIGGER IF EXISTS messages_update_conversation_stats ON messages;
DROP TRIGGER IF EXISTS messages_set_feedback_at ON messages;
DROP TRIGGER IF EXISTS messages_updated_at_trigger ON messages;

DROP FUNCTION IF EXISTS update_chunk_retrieval_stats();
DROP FUNCTION IF EXISTS update_oracle_message_stats();
DROP FUNCTION IF EXISTS update_conversation_message_stats();
DROP FUNCTION IF EXISTS set_message_feedback_at();

DROP TABLE IF EXISTS messages CASCADE;
DROP TYPE IF EXISTS message_feedback;
DROP TYPE IF EXISTS message_status;
DROP TYPE IF EXISTS message_role;

-- +goose StatementEnd
