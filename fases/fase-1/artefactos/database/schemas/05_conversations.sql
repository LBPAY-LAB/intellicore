-- ============================================================================
-- SuperCore v2.0 - Schema: Conversations (Chat History)
-- ============================================================================
-- Description: Conversations track chat sessions with Oracles. Each
--              conversation contains multiple messages and maintains
--              session context for continuous interactions.
--
-- Key Features:
--   - Multi-tenancy via solution_id and oracle_id
--   - Session-based organization
--   - User attribution (optional, for future auth)
--   - Conversation title and summary
--   - Message count and token tracking
--   - Archival and soft delete support
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Conversation status
CREATE TYPE conversation_status AS ENUM (
    'active',           -- Ongoing conversation
    'paused',           -- Temporarily paused
    'completed',        -- Marked as complete
    'archived',         -- Archived for reference
    'deleted'           -- Soft deleted
);

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE conversations (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys (multi-tenancy)
    oracle_id UUID NOT NULL,
    solution_id UUID NOT NULL,

    -- Session Identification
    session_id VARCHAR(255) NOT NULL,  -- Client-generated session ID
    session_metadata JSONB DEFAULT '{}'::jsonb,
    -- Expected structure:
    -- {
    --   "client_type": "web",
    --   "browser": "Chrome 120",
    --   "os": "macOS",
    --   "ip_hash": "abc123...",  -- Hashed for privacy
    --   "timezone": "America/Sao_Paulo"
    -- }

    -- User Attribution (optional, for future auth)
    user_id UUID,
    user_name VARCHAR(255),
    user_email VARCHAR(255),

    -- Conversation Info
    title VARCHAR(500),  -- Auto-generated or user-defined
    summary TEXT,  -- AI-generated summary of conversation
    status conversation_status DEFAULT 'active',

    -- Statistics
    message_count INTEGER DEFAULT 0,
    user_message_count INTEGER DEFAULT 0,
    assistant_message_count INTEGER DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    input_tokens_used INTEGER DEFAULT 0,
    output_tokens_used INTEGER DEFAULT 0,

    -- Timing
    first_message_at TIMESTAMPTZ,
    last_message_at TIMESTAMPTZ,
    duration_seconds INTEGER,  -- Total conversation duration

    -- Quality Metrics (optional)
    user_rating INTEGER CHECK (user_rating >= 1 AND user_rating <= 5),
    user_feedback TEXT,
    is_helpful BOOLEAN,

    -- Memory Context (for long conversations)
    context_summary TEXT,  -- Compressed context for long conversations
    context_updated_at TIMESTAMPTZ,

    -- Configuration Override
    config_override JSONB DEFAULT '{}'::jsonb,
    -- Expected structure:
    -- {
    --   "temperature": 0.8,
    --   "max_tokens": 2000,
    --   "system_prompt_override": "..."
    -- }

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT conversations_oracle_fk FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE CASCADE,
    CONSTRAINT conversations_solution_fk FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE CASCADE,
    CONSTRAINT conversations_session_not_empty CHECK (LENGTH(TRIM(session_id)) > 0)
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE conversations IS 'Chat sessions with Oracles. Each conversation contains multiple messages and maintains session context.';

COMMENT ON COLUMN conversations.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN conversations.oracle_id IS 'Parent oracle';
COMMENT ON COLUMN conversations.solution_id IS 'Parent solution (denormalized)';
COMMENT ON COLUMN conversations.session_id IS 'Client-generated session identifier';
COMMENT ON COLUMN conversations.session_metadata IS 'Client metadata (browser, OS, etc.)';
COMMENT ON COLUMN conversations.user_id IS 'Authenticated user ID (optional)';
COMMENT ON COLUMN conversations.user_name IS 'User display name';
COMMENT ON COLUMN conversations.user_email IS 'User email';
COMMENT ON COLUMN conversations.title IS 'Conversation title (auto or user-defined)';
COMMENT ON COLUMN conversations.summary IS 'AI-generated conversation summary';
COMMENT ON COLUMN conversations.status IS 'Current status';
COMMENT ON COLUMN conversations.message_count IS 'Total message count';
COMMENT ON COLUMN conversations.total_tokens_used IS 'Total tokens consumed';
COMMENT ON COLUMN conversations.first_message_at IS 'First message timestamp';
COMMENT ON COLUMN conversations.last_message_at IS 'Last message timestamp';
COMMENT ON COLUMN conversations.duration_seconds IS 'Conversation duration';
COMMENT ON COLUMN conversations.user_rating IS 'User satisfaction rating (1-5)';
COMMENT ON COLUMN conversations.user_feedback IS 'User feedback text';
COMMENT ON COLUMN conversations.context_summary IS 'Compressed context for long conversations';
COMMENT ON COLUMN conversations.config_override IS 'Per-conversation config overrides';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Oracle-based lookups (primary pattern)
CREATE INDEX idx_conversations_oracle_id ON conversations(oracle_id) WHERE deleted_at IS NULL;

-- Solution-based lookups
CREATE INDEX idx_conversations_solution_id ON conversations(solution_id) WHERE deleted_at IS NULL;

-- Session-based lookups
CREATE INDEX idx_conversations_session_id ON conversations(session_id) WHERE deleted_at IS NULL;

-- Combined oracle + session (for session resumption)
CREATE INDEX idx_conversations_oracle_session ON conversations(oracle_id, session_id) WHERE deleted_at IS NULL;

-- User-based lookups
CREATE INDEX idx_conversations_user_id ON conversations(user_id) WHERE user_id IS NOT NULL AND deleted_at IS NULL;

-- Status filtering
CREATE INDEX idx_conversations_status ON conversations(status) WHERE deleted_at IS NULL;

-- Active conversations (for listing)
CREATE INDEX idx_conversations_active ON conversations(oracle_id, last_message_at DESC)
    WHERE status = 'active' AND deleted_at IS NULL;

-- Recent conversations
CREATE INDEX idx_conversations_recent ON conversations(created_at DESC) WHERE deleted_at IS NULL;

-- Conversations with ratings (for analytics)
CREATE INDEX idx_conversations_rated ON conversations(user_rating)
    WHERE user_rating IS NOT NULL AND deleted_at IS NULL;

-- Session metadata GIN index
CREATE INDEX idx_conversations_session_meta ON conversations USING GIN(session_metadata jsonb_path_ops);

-- Full-text search on title and summary
CREATE INDEX idx_conversations_title_search ON conversations USING GIN(to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(summary, '')));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER conversations_updated_at_trigger
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent hard delete
CREATE TRIGGER conversations_prevent_hard_delete
    BEFORE DELETE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION prevent_hard_delete();

-- Auto-set first_message_at when first message arrives
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

-- Auto-calculate duration when conversation ends
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

-- Update oracle stats when conversation is created
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

-- Function to get or create conversation for session
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
    -- Try to find existing active conversation
    SELECT id INTO v_conversation_id
    FROM conversations
    WHERE oracle_id = p_oracle_id
    AND session_id = p_session_id
    AND status = 'active'
    AND deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1;

    -- Create new if not found
    IF v_conversation_id IS NULL THEN
        INSERT INTO conversations (oracle_id, solution_id, session_id, user_id, user_name)
        VALUES (p_oracle_id, p_solution_id, p_session_id, p_user_id, p_user_name)
        RETURNING id INTO v_conversation_id;
    END IF;

    RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_or_create_conversation IS 'Gets existing conversation for session or creates new one';

-- Function to auto-generate conversation title from first message
CREATE OR REPLACE FUNCTION generate_conversation_title(p_conversation_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_first_message TEXT;
    v_title TEXT;
BEGIN
    -- Get first user message
    SELECT content INTO v_first_message
    FROM messages
    WHERE conversation_id = p_conversation_id
    AND role = 'user'
    ORDER BY created_at
    LIMIT 1;

    -- Generate title (first 50 chars + ellipsis)
    IF v_first_message IS NOT NULL THEN
        v_title = SUBSTRING(v_first_message FROM 1 FOR 50);
        IF LENGTH(v_first_message) > 50 THEN
            v_title = v_title || '...';
        END IF;
    ELSE
        v_title = 'Untitled Conversation';
    END IF;

    -- Update conversation
    UPDATE conversations
    SET title = v_title
    WHERE id = p_conversation_id AND title IS NULL;

    RETURN v_title;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_conversation_title IS 'Auto-generates conversation title from first message';
