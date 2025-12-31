-- ============================================================================
-- SuperCore v2.0 - Schema: Temporal Workflows (Workflow Tracking)
-- ============================================================================
-- Description: Tracks Temporal.io workflow executions for visibility and
--              debugging. This table complements Temporal's native persistence
--              with application-specific metadata and business context.
--
-- Key Features:
--   - Temporal workflow ID and run ID tracking
--   - Workflow type classification
--   - Solution and Oracle context
--   - Input/output data storage
--   - Error tracking and compensation status
--   - SAGA pattern support
--   - Temporal UI deep-linking
--
-- Note: This is a TRACKING table, not a replacement for Temporal's
--       persistence layer. Temporal handles durable execution internally.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Workflow type classification
CREATE TYPE temporal_workflow_type AS ENUM (
    -- Solution Lifecycle
    'CreateSolutionSAGA',           -- Create solution + RAG Global Oracle
    'DeleteSolutionSAGA',           -- Soft delete solution + cascade
    'ArchiveSolutionWorkflow',      -- Archive solution data

    -- Oracle Lifecycle
    'CreateOracleWorkflow',         -- Create and configure oracle
    'DeleteOracleWorkflow',         -- Delete oracle and cleanup
    'ConfigureOracleWorkflow',      -- Update oracle configuration

    -- Document Processing
    'ProcessDocumentWorkflow',      -- Full document processing pipeline
    'ExtractTextWorkflow',          -- Text extraction only
    'ChunkDocumentWorkflow',        -- Chunking only
    'GenerateEmbeddingsWorkflow',   -- Embedding generation only
    'IndexDocumentWorkflow',        -- Vector indexing only
    'ReprocessDocumentWorkflow',    -- Reprocess failed document

    -- Batch Operations
    'BatchUploadWorkflow',          -- Batch document upload
    'BatchReindexWorkflow',         -- Reindex all documents
    'BatchDeleteWorkflow',          -- Batch delete documents

    -- RAG Operations
    'RAGQueryWorkflow',             -- RAG query with retrieval
    'HybridSearchWorkflow',         -- Hybrid SQL + Graph + Vector search

    -- Maintenance
    'CleanupWorkflow',              -- Cleanup old data
    'SyncWorkflow',                 -- Sync data between systems
    'BackupWorkflow',               -- Backup oracle data

    -- Custom
    'CustomWorkflow'                -- Custom workflow type
);

-- Workflow status (mirrors Temporal states with additions)
CREATE TYPE temporal_workflow_status AS ENUM (
    'pending',          -- Scheduled but not started
    'running',          -- Currently executing
    'completed',        -- Completed successfully
    'failed',           -- Failed with error
    'cancelled',        -- Cancelled by user
    'terminated',       -- Terminated externally
    'timed_out',        -- Exceeded timeout
    'compensating',     -- Running compensation (SAGA)
    'compensated',      -- Compensation completed
    'compensation_failed'  -- Compensation failed
);

-- ============================================================================
-- TEMPORAL WORKFLOWS TABLE
-- ============================================================================

CREATE TABLE temporal_workflows (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Temporal Identifiers (from Temporal.io)
    workflow_id VARCHAR(255) NOT NULL,  -- Temporal workflow ID
    run_id VARCHAR(255),  -- Temporal run ID (for specific execution)
    task_queue VARCHAR(255) DEFAULT 'supercore-main',  -- Temporal task queue

    -- Workflow Type
    workflow_type temporal_workflow_type NOT NULL,
    workflow_type_name VARCHAR(255),  -- Full Temporal workflow type name

    -- Context (optional, depends on workflow type)
    solution_id UUID,
    oracle_id UUID,
    document_id UUID,

    -- Status
    status temporal_workflow_status DEFAULT 'pending',

    -- Input/Output Data
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    -- Expected structure varies by workflow type:
    -- CreateSolutionSAGA: { "name": "...", "slug": "...", "industry": "..." }
    -- ProcessDocumentWorkflow: { "document_id": "...", "oracle_id": "..." }

    output_data JSONB,
    -- Expected structure varies by workflow type:
    -- CreateSolutionSAGA: { "solution_id": "...", "rag_oracle_id": "..." }
    -- ProcessDocumentWorkflow: { "chunk_count": 50, "embedding_count": 50 }

    -- Error Handling
    error_message TEXT,
    error_code VARCHAR(100),
    error_details JSONB,
    -- Expected structure:
    -- {
    --   "type": "DocumentProcessingError",
    --   "stack_trace": "...",
    --   "activity": "ExtractText",
    --   "retry_count": 3
    -- }

    -- SAGA Compensation
    is_saga BOOLEAN DEFAULT FALSE,
    compensation_status VARCHAR(50),  -- null, 'running', 'completed', 'failed'
    compensation_steps JSONB DEFAULT '[]'::jsonb,
    -- Expected structure:
    -- [
    --   { "step": "DeleteOracle", "status": "completed", "timestamp": "..." },
    --   { "step": "DeleteSolution", "status": "running", "timestamp": "..." }
    -- ]

    -- Progress Tracking
    current_step VARCHAR(255),
    total_steps INTEGER,
    completed_steps INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    progress_details JSONB DEFAULT '{}'::jsonb,
    -- Expected structure:
    -- {
    --   "steps": [
    --     { "name": "Validate", "status": "completed", "duration_ms": 50 },
    --     { "name": "Extract", "status": "running", "duration_ms": null }
    --   ]
    -- }

    -- Timing
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_duration_ms INTEGER,

    -- Retry Information
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,

    -- User Attribution
    initiated_by_user_id UUID,
    initiated_by_user_name VARCHAR(255),

    -- Temporal UI Link
    temporal_ui_url VARCHAR(1000),

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    -- Expected structure:
    -- {
    --   "priority": "high",
    --   "tags": ["batch", "reindex"],
    --   "parent_workflow_id": null,
    --   "child_workflow_ids": []
    -- }

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT workflows_workflow_id_unique UNIQUE (workflow_id),
    CONSTRAINT workflows_solution_fk FOREIGN KEY (solution_id) REFERENCES solutions(id) ON DELETE SET NULL,
    CONSTRAINT workflows_oracle_fk FOREIGN KEY (oracle_id) REFERENCES oracles(id) ON DELETE SET NULL,
    CONSTRAINT workflows_workflow_id_not_empty CHECK (LENGTH(TRIM(workflow_id)) > 0),
    CONSTRAINT workflows_steps_valid CHECK (
        completed_steps >= 0 AND
        (total_steps IS NULL OR completed_steps <= total_steps)
    )
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE temporal_workflows IS 'Tracks Temporal.io workflow executions for visibility, debugging, and business context.';

COMMENT ON COLUMN temporal_workflows.id IS 'Internal unique identifier';
COMMENT ON COLUMN temporal_workflows.workflow_id IS 'Temporal workflow ID (unique)';
COMMENT ON COLUMN temporal_workflows.run_id IS 'Temporal run ID for specific execution';
COMMENT ON COLUMN temporal_workflows.task_queue IS 'Temporal task queue name';
COMMENT ON COLUMN temporal_workflows.workflow_type IS 'Workflow type classification';
COMMENT ON COLUMN temporal_workflows.workflow_type_name IS 'Full Temporal workflow type name';
COMMENT ON COLUMN temporal_workflows.solution_id IS 'Related solution (if applicable)';
COMMENT ON COLUMN temporal_workflows.oracle_id IS 'Related oracle (if applicable)';
COMMENT ON COLUMN temporal_workflows.document_id IS 'Related document (if applicable)';
COMMENT ON COLUMN temporal_workflows.status IS 'Current workflow status';
COMMENT ON COLUMN temporal_workflows.input_data IS 'Workflow input parameters';
COMMENT ON COLUMN temporal_workflows.output_data IS 'Workflow output results';
COMMENT ON COLUMN temporal_workflows.error_message IS 'Error message if failed';
COMMENT ON COLUMN temporal_workflows.error_details IS 'Detailed error information';
COMMENT ON COLUMN temporal_workflows.is_saga IS 'Whether this is a SAGA workflow';
COMMENT ON COLUMN temporal_workflows.compensation_status IS 'SAGA compensation status';
COMMENT ON COLUMN temporal_workflows.compensation_steps IS 'SAGA compensation step details';
COMMENT ON COLUMN temporal_workflows.current_step IS 'Current executing step';
COMMENT ON COLUMN temporal_workflows.progress_percentage IS 'Overall progress (0-100)';
COMMENT ON COLUMN temporal_workflows.scheduled_at IS 'When workflow was scheduled';
COMMENT ON COLUMN temporal_workflows.started_at IS 'When workflow started executing';
COMMENT ON COLUMN temporal_workflows.completed_at IS 'When workflow completed';
COMMENT ON COLUMN temporal_workflows.execution_duration_ms IS 'Total execution time (ms)';
COMMENT ON COLUMN temporal_workflows.temporal_ui_url IS 'Direct link to Temporal UI';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Workflow ID lookup (primary lookup pattern)
CREATE UNIQUE INDEX idx_workflows_workflow_id ON temporal_workflows(workflow_id);

-- Run ID lookup
CREATE INDEX idx_workflows_run_id ON temporal_workflows(run_id) WHERE run_id IS NOT NULL;

-- Solution-based lookups
CREATE INDEX idx_workflows_solution_id ON temporal_workflows(solution_id) WHERE solution_id IS NOT NULL;

-- Oracle-based lookups
CREATE INDEX idx_workflows_oracle_id ON temporal_workflows(oracle_id) WHERE oracle_id IS NOT NULL;

-- Document-based lookups
CREATE INDEX idx_workflows_document_id ON temporal_workflows(document_id) WHERE document_id IS NOT NULL;

-- Type filtering
CREATE INDEX idx_workflows_type ON temporal_workflows(workflow_type);

-- Status filtering (common query pattern)
CREATE INDEX idx_workflows_status ON temporal_workflows(status);

-- Running workflows (for monitoring)
CREATE INDEX idx_workflows_running ON temporal_workflows(workflow_type, started_at)
    WHERE status = 'running';

-- Failed workflows (for retry/debugging)
CREATE INDEX idx_workflows_failed ON temporal_workflows(workflow_type, created_at DESC)
    WHERE status IN ('failed', 'compensation_failed');

-- Pending workflows (for scheduling)
CREATE INDEX idx_workflows_pending ON temporal_workflows(scheduled_at)
    WHERE status = 'pending';

-- SAGA workflows (for compensation monitoring)
CREATE INDEX idx_workflows_saga ON temporal_workflows(solution_id)
    WHERE is_saga = TRUE AND status IN ('compensating', 'compensation_failed');

-- Chronological listing
CREATE INDEX idx_workflows_created_at ON temporal_workflows(created_at DESC);

-- Task queue filtering
CREATE INDEX idx_workflows_task_queue ON temporal_workflows(task_queue);

-- Input/Output data GIN indexes
CREATE INDEX idx_workflows_input_data ON temporal_workflows USING GIN(input_data jsonb_path_ops);
CREATE INDEX idx_workflows_output_data ON temporal_workflows USING GIN(output_data jsonb_path_ops) WHERE output_data IS NOT NULL;

-- Progress details GIN index
CREATE INDEX idx_workflows_progress ON temporal_workflows USING GIN(progress_details jsonb_path_ops);

-- Metadata GIN index
CREATE INDEX idx_workflows_metadata ON temporal_workflows USING GIN(metadata jsonb_path_ops);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE TRIGGER workflows_updated_at_trigger
    BEFORE UPDATE ON temporal_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-set started_at when status changes to running
CREATE OR REPLACE FUNCTION set_workflow_started_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'running' AND OLD.status != 'running' AND NEW.started_at IS NULL THEN
        NEW.started_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflows_set_started_at
    BEFORE UPDATE ON temporal_workflows
    FOR EACH ROW
    EXECUTE FUNCTION set_workflow_started_at();

-- Auto-set completed_at and calculate duration
CREATE OR REPLACE FUNCTION set_workflow_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'failed', 'cancelled', 'terminated', 'timed_out', 'compensated', 'compensation_failed')
       AND OLD.status NOT IN ('completed', 'failed', 'cancelled', 'terminated', 'timed_out', 'compensated', 'compensation_failed') THEN
        NEW.completed_at = NOW();
        IF NEW.started_at IS NOT NULL THEN
            NEW.execution_duration_ms = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflows_set_completed_at
    BEFORE UPDATE ON temporal_workflows
    FOR EACH ROW
    EXECUTE FUNCTION set_workflow_completed_at();

-- Auto-generate Temporal UI URL
CREATE OR REPLACE FUNCTION generate_temporal_ui_url()
RETURNS TRIGGER AS $$
DECLARE
    v_base_url VARCHAR(255) := 'http://localhost:8233';  -- Override in production
BEGIN
    IF NEW.temporal_ui_url IS NULL AND NEW.workflow_id IS NOT NULL THEN
        NEW.temporal_ui_url = v_base_url || '/namespaces/default/workflows/' || NEW.workflow_id;
        IF NEW.run_id IS NOT NULL THEN
            NEW.temporal_ui_url = NEW.temporal_ui_url || '/' || NEW.run_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflows_generate_ui_url
    BEFORE INSERT ON temporal_workflows
    FOR EACH ROW
    EXECUTE FUNCTION generate_temporal_ui_url();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create workflow tracking entry
CREATE OR REPLACE FUNCTION create_workflow_tracking(
    p_workflow_id VARCHAR(255),
    p_workflow_type temporal_workflow_type,
    p_input_data JSONB,
    p_solution_id UUID DEFAULT NULL,
    p_oracle_id UUID DEFAULT NULL,
    p_document_id UUID DEFAULT NULL,
    p_is_saga BOOLEAN DEFAULT FALSE,
    p_user_id UUID DEFAULT NULL,
    p_user_name VARCHAR(255) DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_tracking_id UUID;
BEGIN
    INSERT INTO temporal_workflows (
        workflow_id,
        workflow_type,
        input_data,
        solution_id,
        oracle_id,
        document_id,
        is_saga,
        initiated_by_user_id,
        initiated_by_user_name,
        scheduled_at
    ) VALUES (
        p_workflow_id,
        p_workflow_type,
        p_input_data,
        p_solution_id,
        p_oracle_id,
        p_document_id,
        p_is_saga,
        p_user_id,
        p_user_name,
        NOW()
    )
    RETURNING id INTO v_tracking_id;

    RETURN v_tracking_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_workflow_tracking IS 'Creates a new workflow tracking entry';

-- Function to update workflow progress
CREATE OR REPLACE FUNCTION update_workflow_progress(
    p_workflow_id VARCHAR(255),
    p_current_step VARCHAR(255),
    p_completed_steps INTEGER,
    p_total_steps INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE temporal_workflows
    SET
        current_step = p_current_step,
        completed_steps = p_completed_steps,
        total_steps = p_total_steps,
        progress_percentage = CASE
            WHEN p_total_steps > 0 THEN (p_completed_steps * 100 / p_total_steps)
            ELSE 0
        END
    WHERE workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_workflow_progress IS 'Updates workflow progress';

-- Function to complete workflow
CREATE OR REPLACE FUNCTION complete_workflow(
    p_workflow_id VARCHAR(255),
    p_output_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE temporal_workflows
    SET
        status = 'completed',
        output_data = p_output_data,
        progress_percentage = 100
    WHERE workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION complete_workflow IS 'Marks workflow as completed';

-- Function to fail workflow
CREATE OR REPLACE FUNCTION fail_workflow(
    p_workflow_id VARCHAR(255),
    p_error_message TEXT,
    p_error_code VARCHAR(100) DEFAULT NULL,
    p_error_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE temporal_workflows
    SET
        status = 'failed',
        error_message = p_error_message,
        error_code = p_error_code,
        error_details = p_error_details
    WHERE workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fail_workflow IS 'Marks workflow as failed with error details';

-- Function to get active workflows for solution
CREATE OR REPLACE FUNCTION get_active_workflows(
    p_solution_id UUID DEFAULT NULL,
    p_oracle_id UUID DEFAULT NULL,
    p_workflow_type temporal_workflow_type DEFAULT NULL
)
RETURNS TABLE (
    workflow_id VARCHAR(255),
    workflow_type temporal_workflow_type,
    status temporal_workflow_status,
    progress_percentage INTEGER,
    current_step VARCHAR(255),
    started_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        tw.workflow_id,
        tw.workflow_type,
        tw.status,
        tw.progress_percentage,
        tw.current_step,
        tw.started_at
    FROM temporal_workflows tw
    WHERE tw.status IN ('pending', 'running', 'compensating')
    AND (p_solution_id IS NULL OR tw.solution_id = p_solution_id)
    AND (p_oracle_id IS NULL OR tw.oracle_id = p_oracle_id)
    AND (p_workflow_type IS NULL OR tw.workflow_type = p_workflow_type)
    ORDER BY tw.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_workflows IS 'Gets active (running/pending) workflows';
