-- ============================================================================
-- SuperCore v2.0 - Performance Indexes Summary
-- ============================================================================
-- Description: Complete summary of all indexes created in the database.
--              This file is for reference and documentation purposes.
--              Indexes are created in the individual migration files.
--
-- Total Indexes: 70+
-- Tables: 7 (solutions, oracles, documents, document_chunks, conversations, messages, temporal_workflows)
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- SOLUTIONS INDEXES (6 indexes)
-- ============================================================================

-- idx_solutions_slug              - UNIQUE, WHERE deleted_at IS NULL
--                                   Used for: URL routing (/solucoes/{slug}/...)
--                                   Pattern: Exact match lookup

-- idx_solutions_status            - WHERE deleted_at IS NULL
--                                   Used for: Status filtering (active, draft, etc.)
--                                   Pattern: Status-based filtering

-- idx_solutions_industry          - WHERE deleted_at IS NULL
--                                   Used for: Industry filtering
--                                   Pattern: Industry-based filtering

-- idx_solutions_created_at        - DESC, WHERE deleted_at IS NULL
--                                   Used for: Chronological listing
--                                   Pattern: Sorting by creation date

-- idx_solutions_active            - WHERE status = 'active' AND deleted_at IS NULL
--                                   Used for: Active solutions lookup
--                                   Pattern: Most common query pattern

-- idx_solutions_config            - GIN (jsonb_path_ops)
--                                   Used for: JSONB queries on config
--                                   Pattern: Flexible configuration queries

-- ============================================================================
-- ORACLES INDEXES (8 indexes)
-- ============================================================================

-- idx_oracles_solution_id         - WHERE deleted_at IS NULL
--                                   Used for: Solution-based lookups (most common)
--                                   Pattern: Parent-child relationship

-- idx_oracles_solution_name       - (solution_id, oracle_name), WHERE deleted_at IS NULL
--                                   Used for: Unique name within solution
--                                   Pattern: Composite key lookup

-- idx_oracles_type                - WHERE deleted_at IS NULL
--                                   Used for: Type-based filtering
--                                   Pattern: Classification queries

-- idx_oracles_status              - WHERE deleted_at IS NULL
--                                   Used for: Status filtering
--                                   Pattern: Lifecycle queries

-- idx_oracles_system              - solution_id, WHERE is_system = TRUE AND deleted_at IS NULL
--                                   Used for: System oracles (RAG Global)
--                                   Pattern: System oracle lookup

-- idx_oracles_active              - solution_id, WHERE status = 'active' AND deleted_at IS NULL
--                                   Used for: Active oracles lookup
--                                   Pattern: Most common operational query

-- idx_oracles_config              - GIN (jsonb_path_ops)
--                                   Used for: Config JSONB queries
--                                   Pattern: Flexible configuration queries

-- idx_oracles_stats               - GIN (jsonb_path_ops)
--                                   Used for: Stats JSONB queries
--                                   Pattern: Analytics and metrics

-- ============================================================================
-- DOCUMENTS INDEXES (11 indexes)
-- ============================================================================

-- idx_documents_oracle_id         - WHERE deleted_at IS NULL
--                                   Used for: Oracle-based lookups
--                                   Pattern: Parent-child relationship

-- idx_documents_solution_id       - WHERE deleted_at IS NULL
--                                   Used for: Solution-based lookups
--                                   Pattern: Multi-tenancy filtering

-- idx_documents_oracle_solution   - (oracle_id, solution_id), WHERE deleted_at IS NULL
--                                   Used for: Combined filtering
--                                   Pattern: Common join pattern

-- idx_documents_status            - WHERE deleted_at IS NULL
--                                   Used for: Processing status filtering
--                                   Pattern: Processing pipeline queries

-- idx_documents_pending           - (id, oracle_id), WHERE status IN ('pending', 'retrying')
--                                   Used for: Processing queue workers
--                                   Pattern: Worker polling

-- idx_documents_failed            - (id, processing_attempts), WHERE status = 'failed'
--                                   Used for: Failed document retry
--                                   Pattern: Monitoring and retry

-- idx_documents_completed         - (oracle_id, created_at DESC), WHERE status = 'completed'
--                                   Used for: Completed documents listing
--                                   Pattern: Document listing UI

-- idx_documents_file_type         - WHERE deleted_at IS NULL
--                                   Used for: File type filtering
--                                   Pattern: Type-based filtering

-- idx_documents_hash              - WHERE file_hash IS NOT NULL AND deleted_at IS NULL
--                                   Used for: Deduplication lookup
--                                   Pattern: Hash-based deduplication

-- idx_documents_filename_trgm     - GIN (gin_trgm_ops)
--                                   Used for: Fuzzy filename search
--                                   Pattern: Partial text match

-- idx_documents_metadata          - GIN (jsonb_path_ops)
--                                   Used for: Metadata JSONB queries
--                                   Pattern: Flexible metadata queries

-- idx_documents_created_at        - DESC, WHERE deleted_at IS NULL
--                                   Used for: Chronological listing
--                                   Pattern: Sorting by creation date

-- ============================================================================
-- DOCUMENT_CHUNKS INDEXES (9 indexes)
-- ============================================================================

-- idx_chunks_document_id          - Unconditioned
--                                   Used for: Document-based lookups
--                                   Pattern: Parent-child relationship

-- idx_chunks_document_index       - (document_id, chunk_index)
--                                   Used for: Sequential access
--                                   Pattern: Ordered chunk retrieval

-- idx_chunks_oracle_id            - Unconditioned
--                                   Used for: Cross-document retrieval
--                                   Pattern: Oracle-wide search

-- idx_chunks_solution_id          - Unconditioned
--                                   Used for: Multi-tenancy filtering
--                                   Pattern: Solution-level queries

-- idx_chunks_embedding_id         - WHERE embedding_id IS NOT NULL
--                                   Used for: Qdrant sync lookup
--                                   Pattern: External system sync

-- idx_chunks_retrieval_count      - DESC, WHERE retrieval_count > 0
--                                   Used for: Popular chunks analysis
--                                   Pattern: Analytics and optimization

-- idx_chunks_metadata             - GIN (jsonb_path_ops)
--                                   Used for: Chunk metadata queries
--                                   Pattern: Page/section filtering

-- idx_chunks_text_search          - GIN (to_tsvector)
--                                   Used for: Full-text search
--                                   Pattern: Keyword search in chunks

-- idx_chunks_token_count          - WHERE token_count IS NOT NULL
--                                   Used for: Context window management
--                                   Pattern: Token budget queries

-- ============================================================================
-- CONVERSATIONS INDEXES (10 indexes)
-- ============================================================================

-- idx_conversations_oracle_id     - WHERE deleted_at IS NULL
--                                   Used for: Oracle-based lookups
--                                   Pattern: Oracle conversations listing

-- idx_conversations_solution_id   - WHERE deleted_at IS NULL
--                                   Used for: Solution-based lookups
--                                   Pattern: Multi-tenancy filtering

-- idx_conversations_session_id    - WHERE deleted_at IS NULL
--                                   Used for: Session-based lookups
--                                   Pattern: Session resumption

-- idx_conversations_oracle_session - (oracle_id, session_id), WHERE deleted_at IS NULL
--                                    Used for: Session in oracle lookup
--                                    Pattern: Most common pattern

-- idx_conversations_user_id       - WHERE user_id IS NOT NULL AND deleted_at IS NULL
--                                   Used for: User conversations
--                                   Pattern: User history

-- idx_conversations_status        - WHERE deleted_at IS NULL
--                                   Used for: Status filtering
--                                   Pattern: Active/archived filtering

-- idx_conversations_active        - (oracle_id, last_message_at DESC), WHERE status = 'active'
--                                   Used for: Recent active conversations
--                                   Pattern: Most common listing

-- idx_conversations_recent        - (created_at DESC), WHERE deleted_at IS NULL
--                                   Used for: Recent conversations
--                                   Pattern: Chronological listing

-- idx_conversations_rated         - (user_rating), WHERE user_rating IS NOT NULL
--                                   Used for: Quality analytics
--                                   Pattern: Feedback analysis

-- idx_conversations_session_meta  - GIN (jsonb_path_ops)
--                                   Used for: Session metadata queries
--                                   Pattern: Client analytics

-- idx_conversations_title_search  - GIN (to_tsvector)
--                                   Used for: Conversation search
--                                   Pattern: Text search in titles

-- ============================================================================
-- MESSAGES INDEXES (14 indexes)
-- ============================================================================

-- idx_messages_conversation_id    - Unconditioned
--                                   Used for: Conversation messages lookup
--                                   Pattern: Most common pattern

-- idx_messages_conversation_seq   - (conversation_id, sequence_number)
--                                   Used for: Sequential message access
--                                   Pattern: Ordered message retrieval

-- idx_messages_oracle_id          - Unconditioned
--                                   Used for: Cross-conversation analysis
--                                   Pattern: Oracle-level analytics

-- idx_messages_solution_id        - Unconditioned
--                                   Used for: Multi-tenancy filtering
--                                   Pattern: Solution-level queries

-- idx_messages_role               - Unconditioned
--                                   Used for: Role-based filtering
--                                   Pattern: User/assistant filtering

-- idx_messages_status             - WHERE status != 'completed'
--                                   Used for: Streaming messages
--                                   Pattern: Active streaming lookup

-- idx_messages_created_at         - DESC
--                                   Used for: Chronological access
--                                   Pattern: Recent messages

-- idx_messages_conversation_time  - (conversation_id, created_at DESC)
--                                   Used for: Conversation history
--                                   Pattern: Message pagination

-- idx_messages_with_sources       - WHERE sources != '[]'
--                                   Used for: Citation analysis
--                                   Pattern: RAG analytics

-- idx_messages_with_feedback      - (feedback), WHERE feedback IS NOT NULL
--                                   Used for: Feedback analysis
--                                   Pattern: Quality metrics

-- idx_messages_negative_feedback  - (oracle_id, created_at DESC), WHERE feedback = 'negative'
--                                   Used for: Improvement opportunities
--                                   Pattern: Quality improvement

-- idx_messages_sources            - GIN (jsonb_path_ops)
--                                   Used for: Source citation queries
--                                   Pattern: Citation lookup

-- idx_messages_tool_calls         - GIN (jsonb_path_ops)
--                                   Used for: Tool usage analysis
--                                   Pattern: Tool analytics

-- idx_messages_metadata           - GIN (jsonb_path_ops)
--                                   Used for: Message metadata queries
--                                   Pattern: Flexible queries

-- idx_messages_content_search     - GIN (to_tsvector)
--                                   Used for: Content search
--                                   Pattern: Message search

-- ============================================================================
-- TEMPORAL_WORKFLOWS INDEXES (13 indexes)
-- ============================================================================

-- idx_workflows_workflow_id       - UNIQUE
--                                   Used for: Workflow lookup by ID
--                                   Pattern: Primary lookup

-- idx_workflows_run_id            - WHERE run_id IS NOT NULL
--                                   Used for: Run-specific lookup
--                                   Pattern: Execution tracking

-- idx_workflows_solution_id       - WHERE solution_id IS NOT NULL
--                                   Used for: Solution workflows
--                                   Pattern: Multi-tenancy filtering

-- idx_workflows_oracle_id         - WHERE oracle_id IS NOT NULL
--                                   Used for: Oracle workflows
--                                   Pattern: Oracle-level filtering

-- idx_workflows_document_id       - WHERE document_id IS NOT NULL
--                                   Used for: Document processing workflows
--                                   Pattern: Document tracking

-- idx_workflows_type              - Unconditioned
--                                   Used for: Type-based filtering
--                                   Pattern: Workflow type queries

-- idx_workflows_status            - Unconditioned
--                                   Used for: Status filtering
--                                   Pattern: Status monitoring

-- idx_workflows_running           - (workflow_type, started_at), WHERE status = 'running'
--                                   Used for: Active workflow monitoring
--                                   Pattern: Real-time monitoring

-- idx_workflows_failed            - (workflow_type, created_at DESC), WHERE status IN ('failed', 'compensation_failed')
--                                   Used for: Failed workflow retry
--                                   Pattern: Error handling

-- idx_workflows_pending           - (scheduled_at), WHERE status = 'pending'
--                                   Used for: Pending workflow scheduling
--                                   Pattern: Scheduler queries

-- idx_workflows_saga              - (solution_id), WHERE is_saga = TRUE AND status IN ('compensating', 'compensation_failed')
--                                   Used for: SAGA compensation monitoring
--                                   Pattern: SAGA pattern support

-- idx_workflows_created_at        - DESC
--                                   Used for: Chronological listing
--                                   Pattern: Recent workflows

-- idx_workflows_task_queue        - Unconditioned
--                                   Used for: Task queue filtering
--                                   Pattern: Queue-based queries

-- idx_workflows_input_data        - GIN (jsonb_path_ops)
--                                   Used for: Input data queries
--                                   Pattern: Workflow filtering by input

-- idx_workflows_output_data       - GIN (jsonb_path_ops), WHERE output_data IS NOT NULL
--                                   Used for: Output data queries
--                                   Pattern: Result analysis

-- idx_workflows_progress          - GIN (jsonb_path_ops)
--                                   Used for: Progress queries
--                                   Pattern: Progress monitoring

-- idx_workflows_metadata          - GIN (jsonb_path_ops)
--                                   Used for: Metadata queries
--                                   Pattern: Flexible filtering

-- ============================================================================
-- INDEX SUMMARY BY TYPE
-- ============================================================================

-- B-Tree Indexes: ~50 (standard lookups, sorting, uniqueness)
-- GIN Indexes: ~18 (JSONB queries, full-text search, trigram)
-- Partial Indexes: ~25 (WHERE conditions for optimization)
-- Unique Indexes: ~3 (slug, workflow_id, solution+name)
-- Composite Indexes: ~12 (multi-column for common patterns)

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================

-- 1. All indexes include WHERE deleted_at IS NULL for soft delete optimization
-- 2. JSONB GIN indexes use jsonb_path_ops for smaller size and faster queries
-- 3. Full-text search indexes are English-specific (configurable per deployment)
-- 4. Partial indexes reduce index size and improve write performance
-- 5. Composite indexes are ordered by selectivity (most selective first)
-- 6. Foreign key columns are indexed for JOIN performance
-- 7. Temporal workflows have specific indexes for Temporal.io integration
