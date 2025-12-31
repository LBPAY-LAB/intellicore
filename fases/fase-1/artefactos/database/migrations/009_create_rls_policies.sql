-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 009: Row-Level Security (RLS) Policies
-- ============================================================================
-- Description: Implements multi-tenancy security using PostgreSQL Row-Level
--              Security (RLS). Ensures complete data isolation between
--              solutions using session-level context variables.
--
-- Usage:
--   Before executing queries, set the current solution context:
--   SET app.current_solution_id = 'your-solution-uuid';
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current solution ID from session context
CREATE OR REPLACE FUNCTION current_solution_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_solution_id', TRUE), '')::UUID;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION current_solution_id() IS 'Returns the current solution ID from session context (app.current_solution_id)';

-- Function to check if user bypasses RLS (for admin operations)
CREATE OR REPLACE FUNCTION current_user_is_superuser()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if app.is_superuser is set to 'true'
    RETURN COALESCE(NULLIF(current_setting('app.is_superuser', TRUE), ''), 'false')::BOOLEAN;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION current_user_is_superuser() IS 'Returns true if current session has superuser privileges for RLS bypass';

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

-- Solutions table (no RLS - solutions are top-level)
-- Note: Solutions themselves are not filtered, but they serve as the isolation boundary

-- Oracles table
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracles FORCE ROW LEVEL SECURITY;

-- Documents table
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents FORCE ROW LEVEL SECURITY;

-- Document chunks table
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks FORCE ROW LEVEL SECURITY;

-- Conversations table
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations FORCE ROW LEVEL SECURITY;

-- Messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages FORCE ROW LEVEL SECURITY;

-- Temporal workflows table
ALTER TABLE temporal_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE temporal_workflows FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - ORACLES
-- ============================================================================

-- Select policy: Users can only see oracles from their current solution
CREATE POLICY oracles_select_policy ON oracles
    FOR SELECT
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- Insert policy: Users can only insert oracles into their current solution
CREATE POLICY oracles_insert_policy ON oracles
    FOR INSERT
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- Update policy: Users can only update oracles in their current solution
CREATE POLICY oracles_update_policy ON oracles
    FOR UPDATE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    )
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- Delete policy: Users can only delete oracles in their current solution
CREATE POLICY oracles_delete_policy ON oracles
    FOR DELETE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- ============================================================================
-- RLS POLICIES - DOCUMENTS
-- ============================================================================

CREATE POLICY documents_select_policy ON documents
    FOR SELECT
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY documents_insert_policy ON documents
    FOR INSERT
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY documents_update_policy ON documents
    FOR UPDATE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    )
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY documents_delete_policy ON documents
    FOR DELETE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- ============================================================================
-- RLS POLICIES - DOCUMENT CHUNKS
-- ============================================================================

CREATE POLICY chunks_select_policy ON document_chunks
    FOR SELECT
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY chunks_insert_policy ON document_chunks
    FOR INSERT
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY chunks_update_policy ON document_chunks
    FOR UPDATE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    )
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY chunks_delete_policy ON document_chunks
    FOR DELETE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- ============================================================================
-- RLS POLICIES - CONVERSATIONS
-- ============================================================================

CREATE POLICY conversations_select_policy ON conversations
    FOR SELECT
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY conversations_insert_policy ON conversations
    FOR INSERT
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY conversations_update_policy ON conversations
    FOR UPDATE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    )
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY conversations_delete_policy ON conversations
    FOR DELETE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- ============================================================================
-- RLS POLICIES - MESSAGES
-- ============================================================================

CREATE POLICY messages_select_policy ON messages
    FOR SELECT
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY messages_insert_policy ON messages
    FOR INSERT
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY messages_update_policy ON messages
    FOR UPDATE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    )
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

CREATE POLICY messages_delete_policy ON messages
    FOR DELETE
    USING (
        current_user_is_superuser() OR
        solution_id = current_solution_id()
    );

-- ============================================================================
-- RLS POLICIES - TEMPORAL WORKFLOWS
-- ============================================================================

CREATE POLICY workflows_select_policy ON temporal_workflows
    FOR SELECT
    USING (
        current_user_is_superuser() OR
        solution_id IS NULL OR  -- Workflows without solution (system-level)
        solution_id = current_solution_id()
    );

CREATE POLICY workflows_insert_policy ON temporal_workflows
    FOR INSERT
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id IS NULL OR
        solution_id = current_solution_id()
    );

CREATE POLICY workflows_update_policy ON temporal_workflows
    FOR UPDATE
    USING (
        current_user_is_superuser() OR
        solution_id IS NULL OR
        solution_id = current_solution_id()
    )
    WITH CHECK (
        current_user_is_superuser() OR
        solution_id IS NULL OR
        solution_id = current_solution_id()
    );

CREATE POLICY workflows_delete_policy ON temporal_workflows
    FOR DELETE
    USING (
        current_user_is_superuser() OR
        solution_id IS NULL OR
        solution_id = current_solution_id()
    );

-- ============================================================================
-- UTILITY FUNCTIONS FOR APPLICATION USE
-- ============================================================================

-- Function to set current solution context
CREATE OR REPLACE FUNCTION set_current_solution(p_solution_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_solution_id', p_solution_id::TEXT, FALSE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_current_solution IS 'Sets the current solution context for RLS filtering';

-- Function to clear solution context
CREATE OR REPLACE FUNCTION clear_current_solution()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_solution_id', '', FALSE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION clear_current_solution IS 'Clears the current solution context';

-- Function to enable superuser mode (for admin operations)
CREATE OR REPLACE FUNCTION enable_superuser_mode()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.is_superuser', 'true', FALSE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION enable_superuser_mode IS 'Enables superuser mode to bypass RLS (use with caution)';

-- Function to disable superuser mode
CREATE OR REPLACE FUNCTION disable_superuser_mode()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.is_superuser', 'false', FALSE);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION disable_superuser_mode IS 'Disables superuser mode';

-- ============================================================================
-- EXAMPLE USAGE
-- ============================================================================

-- To use RLS in your application:
--
-- 1. At the start of a request, set the solution context:
--    SELECT set_current_solution('your-solution-uuid');
--
-- 2. Execute your queries normally - RLS will filter automatically:
--    SELECT * FROM oracles;  -- Only returns oracles for current solution
--
-- 3. For admin operations that need to see all data:
--    SELECT enable_superuser_mode();
--    SELECT * FROM oracles;  -- Returns all oracles
--    SELECT disable_superuser_mode();
--
-- 4. At the end of a request, optionally clear context:
--    SELECT clear_current_solution();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

-- Drop utility functions
DROP FUNCTION IF EXISTS disable_superuser_mode();
DROP FUNCTION IF EXISTS enable_superuser_mode();
DROP FUNCTION IF EXISTS clear_current_solution();
DROP FUNCTION IF EXISTS set_current_solution(UUID);

-- Drop RLS policies - temporal_workflows
DROP POLICY IF EXISTS workflows_delete_policy ON temporal_workflows;
DROP POLICY IF EXISTS workflows_update_policy ON temporal_workflows;
DROP POLICY IF EXISTS workflows_insert_policy ON temporal_workflows;
DROP POLICY IF EXISTS workflows_select_policy ON temporal_workflows;

-- Drop RLS policies - messages
DROP POLICY IF EXISTS messages_delete_policy ON messages;
DROP POLICY IF EXISTS messages_update_policy ON messages;
DROP POLICY IF EXISTS messages_insert_policy ON messages;
DROP POLICY IF EXISTS messages_select_policy ON messages;

-- Drop RLS policies - conversations
DROP POLICY IF EXISTS conversations_delete_policy ON conversations;
DROP POLICY IF EXISTS conversations_update_policy ON conversations;
DROP POLICY IF EXISTS conversations_insert_policy ON conversations;
DROP POLICY IF EXISTS conversations_select_policy ON conversations;

-- Drop RLS policies - document_chunks
DROP POLICY IF EXISTS chunks_delete_policy ON document_chunks;
DROP POLICY IF EXISTS chunks_update_policy ON document_chunks;
DROP POLICY IF EXISTS chunks_insert_policy ON document_chunks;
DROP POLICY IF EXISTS chunks_select_policy ON document_chunks;

-- Drop RLS policies - documents
DROP POLICY IF EXISTS documents_delete_policy ON documents;
DROP POLICY IF EXISTS documents_update_policy ON documents;
DROP POLICY IF EXISTS documents_insert_policy ON documents;
DROP POLICY IF EXISTS documents_select_policy ON documents;

-- Drop RLS policies - oracles
DROP POLICY IF EXISTS oracles_delete_policy ON oracles;
DROP POLICY IF EXISTS oracles_update_policy ON oracles;
DROP POLICY IF EXISTS oracles_insert_policy ON oracles;
DROP POLICY IF EXISTS oracles_select_policy ON oracles;

-- Disable RLS on all tables
ALTER TABLE temporal_workflows DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks DISABLE ROW LEVEL SECURITY;
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE oracles DISABLE ROW LEVEL SECURITY;

-- Drop helper functions
DROP FUNCTION IF EXISTS current_user_is_superuser();
DROP FUNCTION IF EXISTS current_solution_id();

-- +goose StatementEnd
