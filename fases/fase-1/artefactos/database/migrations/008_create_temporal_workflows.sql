-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 008: Temporal Workflows Table
-- ============================================================================
-- Description: Creates the temporal_workflows table - tracks Temporal.io
--              workflow executions for visibility and debugging.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE temporal_workflow_type AS ENUM (
    'CreateSolutionSAGA',
    'DeleteSolutionSAGA',
    'ArchiveSolutionWorkflow',
    'CreateOracleWorkflow',
    'DeleteOracleWorkflow',
    'ConfigureOracleWorkflow',
    'ProcessDocumentWorkflow',
    'ExtractTextWorkflow',
    'ChunkDocumentWorkflow',
    'GenerateEmbeddingsWorkflow',
    'IndexDocumentWorkflow',
    'ReprocessDocumentWorkflow',
    'BatchUploadWorkflow',
    'BatchReindexWorkflow',
    'BatchDeleteWorkflow',
    'RAGQueryWorkflow',
    'HybridSearchWorkflow',
    'CleanupWorkflow',
    'SyncWorkflow',
    'BackupWorkflow',
    'CustomWorkflow'
);

CREATE TYPE temporal_workflow_status AS ENUM (
    'pending',
    'running',
    'completed',
    'failed',
    'cancelled',
    'terminated',
    'timed_out',
    'compensating',
    'compensated',
    'compensation_failed'
);

-- ============================================================================
-- TEMPORAL WORKFLOWS TABLE
-- ============================================================================

CREATE TABLE temporal_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id VARCHAR(255) NOT NULL,
    run_id VARCHAR(255),
    task_queue VARCHAR(255) DEFAULT 'supercore-main',
    workflow_type temporal_workflow_type NOT NULL,
    workflow_type_name VARCHAR(255),
    solution_id UUID,
    oracle_id UUID,
    document_id UUID,
    status temporal_workflow_status DEFAULT 'pending',
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB,
    error_message TEXT,
    error_code VARCHAR(100),
    error_details JSONB,
    is_saga BOOLEAN DEFAULT FALSE,
    compensation_status VARCHAR(50),
    compensation_steps JSONB DEFAULT '[]'::jsonb,
    current_step VARCHAR(255),
    total_steps INTEGER,
    completed_steps INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    progress_details JSONB DEFAULT '{}'::jsonb,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_duration_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    initiated_by_user_id UUID,
    initiated_by_user_name VARCHAR(255),
    temporal_ui_url VARCHAR(1000),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
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

COMMENT ON TABLE temporal_workflows IS 'Tracks Temporal.io workflow executions for visibility and debugging.';
COMMENT ON COLUMN temporal_workflows.id IS 'Internal unique identifier';
COMMENT ON COLUMN temporal_workflows.workflow_id IS 'Temporal workflow ID (unique)';
COMMENT ON COLUMN temporal_workflows.run_id IS 'Temporal run ID';
COMMENT ON COLUMN temporal_workflows.task_queue IS 'Temporal task queue name';
COMMENT ON COLUMN temporal_workflows.workflow_type IS 'Workflow type classification';
COMMENT ON COLUMN temporal_workflows.solution_id IS 'Related solution (if applicable)';
COMMENT ON COLUMN temporal_workflows.oracle_id IS 'Related oracle (if applicable)';
COMMENT ON COLUMN temporal_workflows.document_id IS 'Related document (if applicable)';
COMMENT ON COLUMN temporal_workflows.status IS 'Current workflow status';
COMMENT ON COLUMN temporal_workflows.input_data IS 'Workflow input parameters';
COMMENT ON COLUMN temporal_workflows.output_data IS 'Workflow output results';
COMMENT ON COLUMN temporal_workflows.error_message IS 'Error message if failed';
COMMENT ON COLUMN temporal_workflows.is_saga IS 'Whether this is a SAGA workflow';
COMMENT ON COLUMN temporal_workflows.compensation_status IS 'SAGA compensation status';
COMMENT ON COLUMN temporal_workflows.progress_percentage IS 'Overall progress (0-100)';
COMMENT ON COLUMN temporal_workflows.temporal_ui_url IS 'Direct link to Temporal UI';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE UNIQUE INDEX idx_workflows_workflow_id ON temporal_workflows(workflow_id);
CREATE INDEX idx_workflows_run_id ON temporal_workflows(run_id) WHERE run_id IS NOT NULL;
CREATE INDEX idx_workflows_solution_id ON temporal_workflows(solution_id) WHERE solution_id IS NOT NULL;
CREATE INDEX idx_workflows_oracle_id ON temporal_workflows(oracle_id) WHERE oracle_id IS NOT NULL;
CREATE INDEX idx_workflows_document_id ON temporal_workflows(document_id) WHERE document_id IS NOT NULL;
CREATE INDEX idx_workflows_type ON temporal_workflows(workflow_type);
CREATE INDEX idx_workflows_status ON temporal_workflows(status);
CREATE INDEX idx_workflows_running ON temporal_workflows(workflow_type, started_at) WHERE status = 'running';
CREATE INDEX idx_workflows_failed ON temporal_workflows(workflow_type, created_at DESC)
    WHERE status IN ('failed', 'compensation_failed');
CREATE INDEX idx_workflows_pending ON temporal_workflows(scheduled_at) WHERE status = 'pending';
CREATE INDEX idx_workflows_saga ON temporal_workflows(solution_id)
    WHERE is_saga = TRUE AND status IN ('compensating', 'compensation_failed');
CREATE INDEX idx_workflows_created_at ON temporal_workflows(created_at DESC);
CREATE INDEX idx_workflows_task_queue ON temporal_workflows(task_queue);
CREATE INDEX idx_workflows_input_data ON temporal_workflows USING GIN(input_data jsonb_path_ops);
CREATE INDEX idx_workflows_output_data ON temporal_workflows USING GIN(output_data jsonb_path_ops) WHERE output_data IS NOT NULL;
CREATE INDEX idx_workflows_progress ON temporal_workflows USING GIN(progress_details jsonb_path_ops);
CREATE INDEX idx_workflows_metadata ON temporal_workflows USING GIN(metadata jsonb_path_ops);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER workflows_updated_at_trigger
    BEFORE UPDATE ON temporal_workflows
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Auto-set started_at
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
    v_base_url VARCHAR(255) := 'http://localhost:8233';
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

-- Create workflow tracking entry
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
        workflow_id, workflow_type, input_data, solution_id, oracle_id,
        document_id, is_saga, initiated_by_user_id, initiated_by_user_name, scheduled_at
    ) VALUES (
        p_workflow_id, p_workflow_type, p_input_data, p_solution_id, p_oracle_id,
        p_document_id, p_is_saga, p_user_id, p_user_name, NOW()
    )
    RETURNING id INTO v_tracking_id;
    RETURN v_tracking_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION create_workflow_tracking IS 'Creates a new workflow tracking entry';

-- Update workflow progress
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

-- Complete workflow
CREATE OR REPLACE FUNCTION complete_workflow(
    p_workflow_id VARCHAR(255),
    p_output_data JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE temporal_workflows
    SET status = 'completed', output_data = p_output_data, progress_percentage = 100
    WHERE workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION complete_workflow IS 'Marks workflow as completed';

-- Fail workflow
CREATE OR REPLACE FUNCTION fail_workflow(
    p_workflow_id VARCHAR(255),
    p_error_message TEXT,
    p_error_code VARCHAR(100) DEFAULT NULL,
    p_error_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE temporal_workflows
    SET status = 'failed', error_message = p_error_message, error_code = p_error_code, error_details = p_error_details
    WHERE workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION fail_workflow IS 'Marks workflow as failed with error details';

-- Get active workflows
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
    SELECT tw.workflow_id, tw.workflow_type, tw.status, tw.progress_percentage, tw.current_step, tw.started_at
    FROM temporal_workflows tw
    WHERE tw.status IN ('pending', 'running', 'compensating')
    AND (p_solution_id IS NULL OR tw.solution_id = p_solution_id)
    AND (p_oracle_id IS NULL OR tw.oracle_id = p_oracle_id)
    AND (p_workflow_type IS NULL OR tw.workflow_type = p_workflow_type)
    ORDER BY tw.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_active_workflows IS 'Gets active (running/pending) workflows';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP FUNCTION IF EXISTS get_active_workflows(UUID, UUID, temporal_workflow_type);
DROP FUNCTION IF EXISTS fail_workflow(VARCHAR, TEXT, VARCHAR, JSONB);
DROP FUNCTION IF EXISTS complete_workflow(VARCHAR, JSONB);
DROP FUNCTION IF EXISTS update_workflow_progress(VARCHAR, VARCHAR, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS create_workflow_tracking(VARCHAR, temporal_workflow_type, JSONB, UUID, UUID, UUID, BOOLEAN, UUID, VARCHAR);
DROP TRIGGER IF EXISTS workflows_generate_ui_url ON temporal_workflows;
DROP TRIGGER IF EXISTS workflows_set_completed_at ON temporal_workflows;
DROP TRIGGER IF EXISTS workflows_set_started_at ON temporal_workflows;
DROP TRIGGER IF EXISTS workflows_updated_at_trigger ON temporal_workflows;

DROP FUNCTION IF EXISTS generate_temporal_ui_url();
DROP FUNCTION IF EXISTS set_workflow_completed_at();
DROP FUNCTION IF EXISTS set_workflow_started_at();

DROP TABLE IF EXISTS temporal_workflows CASCADE;
DROP TYPE IF EXISTS temporal_workflow_status;
DROP TYPE IF EXISTS temporal_workflow_type;

-- +goose StatementEnd
