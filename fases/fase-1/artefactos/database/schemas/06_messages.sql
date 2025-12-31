-- ============================================================================
-- SuperCore v2.0 - Schema: Messages (Chat Messages)
-- ============================================================================
-- Description: Messages are individual chat messages within conversations.
--              Each message can be from user, assistant, or system, and
--              includes metadata about sources, tokens, and latency.
--
-- Key Features:
--   - Multi-tenancy via solution_id, oracle_id, conversation_id
--   - Role-based messages (user, assistant, system)
--   - Source citations and references
--   - Token usage tracking
--   - Latency metrics
--   - Streaming support
--   - Feedback/thumbs-up-down
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Message role (who sent the message)
CREATE TYPE message_role AS ENUM (
    'user',             -- User input
    'assistant',        -- AI response
    'system',           -- System message (context, instructions)
    'tool',             -- Tool/function result
    'error'             -- Error message
);

-- Message status (for streaming)
CREATE TYPE message_status AS ENUM (
    'pending',          -- Message being created
    'streaming',        -- Response streaming in progress
    'completed',        -- Message completed
    'failed',           -- Message generation failed
    'cancelled'         -- User cancelled
);

-- Feedback type
CREATE TYPE message_feedback AS ENUM (
    'positive',         -- Thumbs up
    'negative',         -- Thumbs down
    'neutral'           -- No explicit feedback
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================

CREATE TABLE messages (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys (hierarchical multi-tenancy)
    conversation_id UUID NOT NULL,
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,

    -- Message Content
    role message_role NOT NULL,
    content TEXT NOT NULL,
    content_format VARCHAR(50) DEFAULT 'text',  -- text, markdown, html, json

    -- Status (for streaming)
    status message_status DEFAULT 'completed',

    -- Sequence
    sequence_number INTEGER NOT NULL,  -- Order within conversation

    -- Token Usage (for assistant messages)
    input_tokens INTEGER,
    output_tokens INTEGER,
    total_tokens INTEGER,

    -- Performance Metrics (for assistant messages)
    latency_ms INTEGER,  -- Time to first token
    total_time_ms INTEGER,  -- Total generation time
    model_used VARCHAR(100),  -- Actual model that responded

    -- RAG Sources (for assistant messages)
    sources JSONB DEFAULT '[]'::jsonb,
    -- Expected structure:
    -- [
    --   {
    --     "document_id": "uuid",
    --     "chunk_id": "uuid",
    --     "filename": "policy.pdf",
    --     "page": 5,
    --     "section": "1.2",
    --     "relevance_score": 0.92,
    --     "excerpt": "..."
    --   }
    -- ]

    -- Tool Calls (for assistant messages with tools)
    tool_calls JSONB DEFAULT '[]'::jsonb,
    -- Expected structure:
    -- [
    --   {
    --     "tool_name": "search_documents",
    --     "arguments": {"query": "..."},
    --     "result": "...",
    --     "execution_time_ms": 150
    --   }
    -- ]

    -- Extended Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Expected structure:
    -- {
    --   "intent": "question_answering",
    --   "sentiment": "neutral",
    --   "language": "en",
    --   "confidence": 0.95,
    --   "parent_message_id": null,
    --   "is_regenerated": false,
    --   "regeneration_count": 0
    -- }

    -- User Feedback
    feedback message_feedback,
    feedback_text TEXT,
    feedback_at TIMESTAMPTZ,

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
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

COMMENT ON TABLE messages IS 'Individual chat messages within conversations. Includes content, sources, metrics, and feedback.';

COMMENT ON COLUMN messages.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN messages.conversation_id IS 'Parent conversation';
COMMENT ON COLUMN messages.oracle_id IS 'Parent oracle (denormalized)';
COMMENT ON COLUMN messages.solution_id IS 'Parent solution (denormalized)';
COMMENT ON COLUMN messages.role IS 'Message sender role (user, assistant, system)';
COMMENT ON COLUMN messages.content IS 'Message content';
COMMENT ON COLUMN messages.content_format IS 'Content format (text, markdown, html)';
COMMENT ON COLUMN messages.status IS 'Message status (for streaming support)';
COMMENT ON COLUMN messages.sequence_number IS 'Order within conversation';
COMMENT ON COLUMN messages.input_tokens IS 'Input tokens used (assistant only)';
COMMENT ON COLUMN messages.output_tokens IS 'Output tokens used (assistant only)';
COMMENT ON COLUMN messages.total_tokens IS 'Total tokens used';
COMMENT ON COLUMN messages.latency_ms IS 'Time to first token (ms)';
COMMENT ON COLUMN messages.total_time_ms IS 'Total generation time (ms)';
COMMENT ON COLUMN messages.model_used IS 'Actual LLM model used';
COMMENT ON COLUMN messages.sources IS 'RAG source citations';
COMMENT ON COLUMN messages.tool_calls IS 'Tool/function calls and results';
COMMENT ON COLUMN messages.metadata IS 'Extended metadata (intent, sentiment, etc.)';
COMMENT ON COLUMN messages.feedback IS 'User feedback (positive/negative)';
COMMENT ON COLUMN messages.feedback_text IS 'Optional feedback text';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Conversation-based lookups (primary pattern)
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);

-- Sequential access within conversation
CREATE INDEX idx_messages_conversation_seq ON messages(conversation_id, sequence_number);

-- Oracle-based lookups (for cross-conversation analysis)
CREATE INDEX idx_messages_oracle_id ON messages(oracle_id);

-- Solution-based lookups
CREATE INDEX idx_messages_solution_id ON messages(solution_id);

-- Role filtering
CREATE INDEX idx_messages_role ON messages(role);

-- Status filtering (for streaming)
CREATE INDEX idx_messages_status ON messages(status) WHERE status != 'completed';

-- Chronological access
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- Conversation + chronological (for message history)
CREATE INDEX idx_messages_conversation_time ON messages(conversation_id, created_at DESC);

-- Messages with sources (for citation analysis)
CREATE INDEX idx_messages_with_sources ON messages(conversation_id)
    WHERE sources != '[]'::jsonb;

-- Messages with feedback (for quality analysis)
CREATE INDEX idx_messages_with_feedback ON messages(feedback)
    WHERE feedback IS NOT NULL;

-- Negative feedback (for improvement)
CREATE INDEX idx_messages_negative_feedback ON messages(oracle_id, created_at DESC)
    WHERE feedback = 'negative';

-- Sources JSONB GIN index
CREATE INDEX idx_messages_sources ON messages USING GIN(sources jsonb_path_ops);

-- Tool calls JSONB GIN index
CREATE INDEX idx_messages_tool_calls ON messages USING GIN(tool_calls jsonb_path_ops);

-- Metadata JSONB GIN index
CREATE INDEX idx_messages_metadata ON messages USING GIN(metadata jsonb_path_ops);

-- Full-text search on content
CREATE INDEX idx_messages_content_search ON messages USING GIN(to_tsvector('english', content));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER messages_updated_at_trigger
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-set feedback_at when feedback is provided
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

-- Update conversation stats when message is added
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

-- Update chunk retrieval stats when sources are used
CREATE OR REPLACE FUNCTION update_chunk_retrieval_stats()
RETURNS TRIGGER AS $$
DECLARE
    v_chunk_id UUID;
    v_score DECIMAL;
    v_source JSONB;
BEGIN
    -- Only process assistant messages with sources
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

-- Function to get next sequence number for conversation
CREATE OR REPLACE FUNCTION get_next_message_sequence(p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_next_seq INTEGER;
BEGIN
    SELECT COALESCE(MAX(sequence_number), 0) + 1 INTO v_next_seq
    FROM messages
    WHERE conversation_id = p_conversation_id;

    RETURN v_next_seq;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_next_message_sequence IS 'Gets the next sequence number for a conversation';

-- Function to get conversation history with pagination
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
    SELECT
        m.id,
        m.role,
        m.content,
        m.sources,
        m.created_at,
        m.sequence_number
    FROM messages m
    WHERE m.conversation_id = p_conversation_id
    AND (p_before_sequence IS NULL OR m.sequence_number < p_before_sequence)
    ORDER BY m.sequence_number DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_conversation_history IS 'Gets paginated conversation history';
