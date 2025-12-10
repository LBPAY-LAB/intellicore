-- ============================================================================
-- CONVERSATIONS TABLE - Natural Language Assistant
-- ============================================================================
-- This table stores conversational sessions where users create object definitions
-- through structured natural language interaction
-- ============================================================================

CREATE TABLE conversations (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Conversation flow tracking
    current_step INT NOT NULL DEFAULT 1,
    total_steps INT NOT NULL DEFAULT 7,

    -- User answers (stored as JSONB for flexibility)
    -- Format: {"step_1": "answer", "step_2": "answer", ...}
    answers JSONB DEFAULT '{}'::jsonb,

    -- Generated preview (cached until confirmed)
    preview_schema JSONB,

    -- Status
    completed BOOLEAN DEFAULT false,
    confirmed BOOLEAN DEFAULT false,

    -- If confirmed, reference to created object_definition
    created_object_definition_id UUID REFERENCES object_definitions(id),

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),

    -- Session info
    user_agent TEXT,
    ip_address INET
);

-- Indexes
CREATE INDEX idx_conversations_completed ON conversations(completed);
CREATE INDEX idx_conversations_confirmed ON conversations(confirmed);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);

-- Trigger to update updated_at
CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON conversations TO supercore_app;

COMMENT ON TABLE conversations IS 'Stores Natural Language Assistant conversational sessions for creating object definitions';
COMMENT ON COLUMN conversations.answers IS 'User answers for each step of the conversation flow';
COMMENT ON COLUMN conversations.preview_schema IS 'LLM-generated preview cached before user confirmation';
