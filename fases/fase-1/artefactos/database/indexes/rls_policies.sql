-- ============================================================================
-- SuperCore v2.0 - Row-Level Security (RLS) Policies Reference
-- ============================================================================
-- Description: Reference documentation for all RLS policies implemented
--              in the database. Policies are created in migration 009.
--
-- Multi-Tenancy Architecture:
--   - Solutions are the top-level isolation boundary
--   - All child tables (oracles, documents, etc.) include solution_id
--   - RLS policies filter data based on current session context
--   - Superuser mode available for admin operations
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- RLS POLICY ARCHITECTURE
-- ============================================================================

/*
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Multi-Tenancy via RLS                                   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Application Layer                                                   │   │
│  │                                                                       │   │
│  │  1. Request arrives with solution context (from auth/token)          │   │
│  │  2. Call: SELECT set_current_solution('solution-uuid')               │   │
│  │  3. Execute queries normally (RLS filters automatically)             │   │
│  │  4. Call: SELECT clear_current_solution() (optional)                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PostgreSQL RLS                                                      │   │
│  │                                                                       │   │
│  │  Session Variable: app.current_solution_id                           │   │
│  │  Helper Function: current_solution_id() → UUID                       │   │
│  │  Bypass Check: current_user_is_superuser() → BOOLEAN                 │   │
│  │                                                                       │   │
│  │  Every SELECT/INSERT/UPDATE/DELETE filtered by:                      │   │
│  │    WHERE solution_id = current_solution_id()                         │   │
│  │       OR current_user_is_superuser()                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                              │                                              │
│                              ▼                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Tables with RLS Enabled                                             │   │
│  │                                                                       │   │
│  │  • oracles (solution_id)                                             │   │
│  │  • documents (solution_id)                                           │   │
│  │  • document_chunks (solution_id)                                     │   │
│  │  • conversations (solution_id)                                       │   │
│  │  • messages (solution_id)                                            │   │
│  │  • temporal_workflows (solution_id - nullable for system workflows)  │   │
│  │                                                                       │   │
│  │  Note: solutions table does NOT have RLS (it's the boundary)         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
*/

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- current_solution_id()
-- Returns: UUID
-- Description: Gets current solution ID from session variable
-- Usage: Internal use by RLS policies
-- Note: Returns NULL if not set (will filter out all rows)

-- current_user_is_superuser()
-- Returns: BOOLEAN
-- Description: Checks if current session has superuser bypass
-- Usage: Admin operations that need cross-solution access
-- Note: Returns FALSE by default

-- set_current_solution(p_solution_id UUID)
-- Returns: VOID
-- Description: Sets the current solution context for RLS
-- Usage: Call at start of request with authenticated solution ID
-- Example: SELECT set_current_solution('123e4567-e89b-12d3-a456-426614174000');

-- clear_current_solution()
-- Returns: VOID
-- Description: Clears the current solution context
-- Usage: Call at end of request (optional, connection pooling)
-- Example: SELECT clear_current_solution();

-- enable_superuser_mode()
-- Returns: VOID
-- Description: Enables RLS bypass for admin operations
-- Usage: USE WITH EXTREME CAUTION - only for admin/migration tasks
-- Example: SELECT enable_superuser_mode();

-- disable_superuser_mode()
-- Returns: VOID
-- Description: Disables RLS bypass
-- Usage: Always call after admin operation completes
-- Example: SELECT disable_superuser_mode();

-- ============================================================================
-- POLICIES BY TABLE
-- ============================================================================

-- ORACLES TABLE
-- ├── oracles_select_policy  - Filter SELECT by solution_id
-- ├── oracles_insert_policy  - Ensure INSERT to correct solution
-- ├── oracles_update_policy  - Filter UPDATE by solution_id
-- └── oracles_delete_policy  - Filter DELETE by solution_id

-- DOCUMENTS TABLE
-- ├── documents_select_policy  - Filter SELECT by solution_id
-- ├── documents_insert_policy  - Ensure INSERT to correct solution
-- ├── documents_update_policy  - Filter UPDATE by solution_id
-- └── documents_delete_policy  - Filter DELETE by solution_id

-- DOCUMENT_CHUNKS TABLE
-- ├── chunks_select_policy  - Filter SELECT by solution_id
-- ├── chunks_insert_policy  - Ensure INSERT to correct solution
-- ├── chunks_update_policy  - Filter UPDATE by solution_id
-- └── chunks_delete_policy  - Filter DELETE by solution_id

-- CONVERSATIONS TABLE
-- ├── conversations_select_policy  - Filter SELECT by solution_id
-- ├── conversations_insert_policy  - Ensure INSERT to correct solution
-- ├── conversations_update_policy  - Filter UPDATE by solution_id
-- └── conversations_delete_policy  - Filter DELETE by solution_id

-- MESSAGES TABLE
-- ├── messages_select_policy  - Filter SELECT by solution_id
-- ├── messages_insert_policy  - Ensure INSERT to correct solution
-- ├── messages_update_policy  - Filter UPDATE by solution_id
-- └── messages_delete_policy  - Filter DELETE by solution_id

-- TEMPORAL_WORKFLOWS TABLE
-- ├── workflows_select_policy  - Filter SELECT (allows NULL solution_id)
-- ├── workflows_insert_policy  - Ensure INSERT (allows NULL solution_id)
-- ├── workflows_update_policy  - Filter UPDATE (allows NULL solution_id)
-- └── workflows_delete_policy  - Filter DELETE (allows NULL solution_id)

-- ============================================================================
-- USAGE EXAMPLES
-- ============================================================================

/*
-- Example 1: Normal API Request Flow
-- Application receives request for authenticated user with solution "acme-corp"

BEGIN;

-- Set solution context from auth token
SELECT set_current_solution('123e4567-e89b-12d3-a456-426614174000');

-- All queries now automatically filtered to this solution
SELECT * FROM oracles;  -- Only ACME Corp oracles
SELECT * FROM documents;  -- Only ACME Corp documents

-- Create new oracle (automatically validated)
INSERT INTO oracles (solution_id, oracle_name, oracle_type)
VALUES ('123e4567-e89b-12d3-a456-426614174000', 'finance', 'financial');

COMMIT;


-- Example 2: Admin Operation (Cross-Solution Analytics)
BEGIN;

-- Enable superuser mode
SELECT enable_superuser_mode();

-- Now can see all data across solutions
SELECT s.name, COUNT(o.id) as oracle_count
FROM solutions s
LEFT JOIN oracles o ON s.id = o.solution_id
GROUP BY s.id;

-- Always disable when done
SELECT disable_superuser_mode();

COMMIT;


-- Example 3: Migration/Batch Job
BEGIN;

SELECT enable_superuser_mode();

-- Perform system-wide updates
UPDATE oracles
SET embedding_model = 'text-embedding-3-large'
WHERE embedding_model = 'text-embedding-ada-002';

SELECT disable_superuser_mode();

COMMIT;


-- Example 4: Debugging RLS Issues
-- Check current context
SELECT current_solution_id();
SELECT current_user_is_superuser();

-- If queries return empty, verify:
-- 1. Solution context is set correctly
-- 2. Data exists for that solution
-- 3. Policies are not overly restrictive
*/

-- ============================================================================
-- SECURITY CONSIDERATIONS
-- ============================================================================

/*
1. Connection Pooling:
   - Solution context is per-connection
   - Always set context at start of request
   - Clear context before returning to pool (or use transaction-level setting)

2. Superuser Mode:
   - NEVER enable in production application code
   - Only use for admin tools, migrations, analytics
   - Always disable after use
   - Consider using separate database users for admin tasks

3. Performance:
   - RLS adds overhead to every query
   - Ensure solution_id columns are indexed
   - Monitor query plans with EXPLAIN ANALYZE

4. Testing:
   - Test with RLS enabled AND disabled
   - Verify cross-solution isolation
   - Test policy bypass attempts

5. Audit:
   - Consider logging solution context changes
   - Track superuser mode usage
   - Monitor failed policy checks
*/

-- ============================================================================
-- POLICY ENFORCEMENT
-- ============================================================================

/*
RLS enforcement levels used in SuperCore:

1. ENABLE ROW LEVEL SECURITY
   - Activates RLS for the table
   - Still allows table owner to bypass

2. FORCE ROW LEVEL SECURITY
   - Even table owner must pass policy checks
   - Used on all SuperCore tables for maximum security

Both are applied to ensure complete isolation even for database administrators.
*/
