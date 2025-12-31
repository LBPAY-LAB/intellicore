# ADR-015: Temporal Workflow Orchestration

**Status**: Accepted
**Date**: 2025-12-30
**Deciders**: Solution Architect, Backend Architect, DevOps Engineer, Tech Lead
**Consulted**: Database Specialist, Security Architect, Product Owner

---

## Context and Problem Statement

SuperCore v2.0 requires robust workflow orchestration for complex, multi-step operations that must be:

1. **Durable**: Operations must survive service restarts and failures
2. **Observable**: Real-time visibility into workflow state and progress
3. **Compensatable**: Failed operations must be able to rollback cleanly (SAGA pattern)
4. **Scalable**: Must handle thousands of concurrent workflows

The most critical use case is **Solution Creation**, which involves:
- Creating a Solution record in PostgreSQL
- Automatically creating the RAG Global Oracle (1:1 relationship)
- Configuring initial settings
- Rolling back everything if any step fails (atomic operation)

The previous technology choice (Celery with Redis as message broker) presented significant limitations:

1. **No built-in durability**: Celery tasks can be lost if the worker crashes mid-execution
2. **Manual state tracking**: Developers must manually track workflow state
3. **No native SAGA support**: Compensation logic must be hand-coded
4. **Limited observability**: Flower provides basic monitoring but no workflow visualization
5. **Redis complexity**: Using Redis for both cache and task queue creates operational complexity

The critical question: **What workflow orchestration technology should replace Celery to provide durability, observability, and SAGA support?**

---

## Decision Drivers

* **Durability**: Workflows must survive service restarts and complete eventually
* **SAGA Pattern**: Complex operations need atomic semantics with compensation
* **Observability**: Developers and operators need real-time visibility into workflow state
* **Scalability**: Must handle 1000+ concurrent workflows
* **Developer Experience**: Clear APIs for defining workflows and activities
* **Operational Simplicity**: Reduce operational burden compared to Celery + Redis broker
* **Open Source**: No vendor lock-in, active community
* **Language Support**: Must support Go (primary) and Python (AI/ML services)

---

## Considered Options

### Option 1: Keep Celery (with Improvements)

Continue using Celery with enhanced monitoring and state tracking.

**Pros**:
- Already familiar to team
- Large Python ecosystem
- Minimal migration effort

**Cons**:
- No built-in durability (tasks lost on crash)
- Manual SAGA implementation required
- Flower provides limited observability
- Redis as broker adds complexity
- Python-only (Go services need workarounds)

**Assessment**: Rejected - Does not meet durability and SAGA requirements.

### Option 2: AWS Step Functions

Use AWS managed service for workflow orchestration.

**Pros**:
- Fully managed (no infrastructure)
- Visual workflow designer
- Built-in durability
- Native AWS integration

**Cons**:
- Vendor lock-in (AWS only)
- Pricing per state transition (expensive at scale)
- Limited customization
- Requires AWS SDK in all services
- Cold start latency

**Assessment**: Rejected - Vendor lock-in and cost concerns.

### Option 3: Apache Airflow

Use Apache Airflow for workflow orchestration.

**Pros**:
- Open source, mature
- DAG-based workflows
- Good for batch/ETL workloads
- Web UI included

**Cons**:
- Designed for batch, not real-time
- No native SAGA support
- Python-centric
- High operational complexity (scheduler, workers, database)
- Not designed for event-driven workflows

**Assessment**: Rejected - Wrong use case (batch vs real-time).

### Option 4: Temporal (Chosen)

Use Temporal.io for workflow orchestration.

**Pros**:
- Built-in durability (event-sourced workflows)
- Native SAGA pattern support
- Excellent observability (Web UI, metrics)
- Supports Go, Python, TypeScript, Java
- Open source with enterprise option
- Designed for mission-critical workflows
- Automatic retries with exponential backoff
- Workflow versioning for zero-downtime deployments

**Cons**:
- New technology (learning curve)
- Requires dedicated infrastructure (server, database, Elasticsearch)
- Different programming model than traditional task queues

**Assessment**: Accepted - Best fit for durability, SAGA, and multi-language support.

---

## Decision Outcome

**Chosen option**: "Temporal Workflow Orchestration"

Temporal.io becomes the exclusive workflow orchestration platform for SuperCore v2.0, completely replacing Celery. Redis is demoted to cache-only role.

### Rationale

1. **Event-Sourced Durability**: Temporal uses event sourcing to persist every state change. If a worker crashes mid-workflow, Temporal replays events to restore state and continue execution.

2. **Native SAGA Support**: Temporal workflows can define compensation logic that automatically executes when activities fail:

```python
# Example: CreateSolutionSAGA with compensation
@workflow.defn
class CreateSolutionSAGA:
    @workflow.run
    async def run(self, input: CreateSolutionInput) -> CreateSolutionOutput:
        # Step 1: Create Solution
        solution_id = await workflow.execute_activity(
            create_solution_record,
            input,
            start_to_close_timeout=timedelta(seconds=30)
        )

        try:
            # Step 2: Create RAG Global Oracle
            oracle_id = await workflow.execute_activity(
                create_rag_global_oracle,
                solution_id,
                start_to_close_timeout=timedelta(seconds=30)
            )

            # Step 3: Link Solution to Oracle
            await workflow.execute_activity(
                link_solution_to_oracle,
                solution_id,
                oracle_id,
                start_to_close_timeout=timedelta(seconds=30)
            )

            return CreateSolutionOutput(solution_id=solution_id, oracle_id=oracle_id)

        except Exception as e:
            # SAGA Compensation: Rollback if any step fails
            await workflow.execute_activity(
                delete_solution_record,
                solution_id,
                start_to_close_timeout=timedelta(seconds=30)
            )
            raise
```

3. **Excellent Observability**: Temporal provides a Web UI (port 8088) showing:
   - Active/completed/failed workflows
   - Workflow history (every event)
   - Activity execution details
   - Retry attempts and errors

4. **Multi-Language Support**: Temporal has official SDKs for Go, Python, TypeScript, and Java, matching SuperCore's polyglot architecture.

5. **Redis Role Clarification**: With Temporal handling all task queue responsibilities, Redis becomes purely a cache layer (session storage, API response caching, rate limiting).

---

## Technical Implementation

### Infrastructure Setup

**Location**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/infrastructure/docker/docker-compose.yml`

Temporal requires 4 services:

1. **temporal-postgres**: Dedicated PostgreSQL for Temporal's persistence
2. **temporal-elasticsearch**: For workflow visibility and search
3. **temporal**: The Temporal Server (auto-setup image)
4. **temporal-ui**: Web dashboard

```yaml
# Temporal Database (PostgreSQL for Temporal)
temporal-postgres:
  image: postgres:16-alpine
  container_name: supercore-temporal-postgres
  environment:
    POSTGRES_DB: temporal
    POSTGRES_USER: temporal
    POSTGRES_PASSWORD: temporal_password
  ports:
    - "5433:5432"
  volumes:
    - temporal_postgres_data:/var/lib/postgresql/data
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U temporal -d temporal"]
    interval: 10s
    timeout: 5s
    retries: 5

# Temporal Elasticsearch (for visibility & analytics)
temporal-elasticsearch:
  image: docker.elastic.co/elasticsearch/elasticsearch:8.10.0
  container_name: supercore-temporal-elasticsearch
  environment:
    - discovery.type=single-node
    - xpack.security.enabled=false
    - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
  ports:
    - "9200:9200"
  volumes:
    - temporal_es_data:/usr/share/elasticsearch/data

# Temporal Server 1.23 (Workflow Orchestration)
temporal:
  image: temporalio/auto-setup:1.23.0
  container_name: supercore-temporal
  depends_on:
    temporal-postgres:
      condition: service_healthy
    temporal-elasticsearch:
      condition: service_healthy
  environment:
    DB: postgresql
    DB_PORT: 5432
    POSTGRES_USER: temporal
    POSTGRES_PWD: temporal_password
    POSTGRES_SEEDS: temporal-postgres
    VISIBILITY_DBTYPE: elasticsearch
    VISIBILITY_ELASTICSEARCH_URL: http://temporal-elasticsearch:9200
    TEMPORAL_ADDRESS: 0.0.0.0:7233
    ENABLE_PROMETHEUS_METRICS: "true"
  ports:
    - "7233:7233"  # gRPC server
    - "7234:7234"  # gRPC metrics
    - "9090:9090"  # Prometheus metrics

# Temporal UI (Web Dashboard)
temporal-ui:
  image: temporalio/ui:2.21.0
  container_name: supercore-temporal-ui
  depends_on:
    temporal:
      condition: service_healthy
  environment:
    TEMPORAL_ADDRESS: temporal:7233
    TEMPORAL_TLS_ENABLED: "false"
  ports:
    - "8088:8080"  # Web UI
```

### Redis Role Change

**Before (Celery)**:
```yaml
redis:
  command: redis-server --appendonly yes
  # Used for: Task broker, result backend, cache
```

**After (Temporal)**:
```yaml
redis:
  image: redis:7-alpine
  command:
    - redis-server
    - "--appendonly"
    - "yes"
    - "--maxmemory"
    - "512mb"
    - "--maxmemory-policy"
    - "allkeys-lru"  # Cache eviction policy
  # Used for: Cache ONLY (sessions, API responses, rate limiting)
```

### Database Schema: temporal_workflows Table

**Location**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/07_temporal_workflows.sql`

This tracking table complements Temporal's internal persistence with application-specific metadata:

```sql
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

    'CustomWorkflow'                -- Custom workflow type
);

-- Workflow status (mirrors Temporal states with SAGA additions)
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

CREATE TABLE temporal_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Temporal Identifiers
    workflow_id VARCHAR(255) NOT NULL UNIQUE,  -- Temporal workflow ID
    run_id VARCHAR(255),                       -- Temporal run ID
    task_queue VARCHAR(255) DEFAULT 'supercore-main',

    -- Workflow Type
    workflow_type temporal_workflow_type NOT NULL,
    workflow_type_name VARCHAR(255),           -- Full Temporal type name

    -- Context
    solution_id UUID REFERENCES solutions(id) ON DELETE SET NULL,
    oracle_id UUID REFERENCES oracles(id) ON DELETE SET NULL,
    document_id UUID,

    -- Status
    status temporal_workflow_status DEFAULT 'pending',

    -- Input/Output
    input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_data JSONB,

    -- Error Handling
    error_message TEXT,
    error_code VARCHAR(100),
    error_details JSONB,

    -- SAGA Compensation
    is_saga BOOLEAN DEFAULT FALSE,
    compensation_status VARCHAR(50),
    compensation_steps JSONB DEFAULT '[]'::jsonb,

    -- Progress Tracking
    current_step VARCHAR(255),
    total_steps INTEGER,
    completed_steps INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0,

    -- Timing
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    execution_duration_ms INTEGER,

    -- Retry Information
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,

    -- User Attribution
    initiated_by_user_id UUID,
    initiated_by_user_name VARCHAR(255),

    -- Temporal UI Link
    temporal_ui_url VARCHAR(1000),

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Workflow Tracking Functions

```sql
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

-- Complete workflow
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
    SET
        status = 'failed',
        error_message = p_error_message,
        error_code = p_error_code,
        error_details = p_error_details
    WHERE workflow_id = p_workflow_id;
END;
$$ LANGUAGE plpgsql;
```

### Automatic Triggers

```sql
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
```

---

## SAGA Pattern: CreateSolutionSAGA

The primary use case for SAGA pattern is atomic Solution creation:

```
CreateSolutionSAGA Workflow
══════════════════════════════════════════════════════════════════════════════

Step 1: Create Solution Record
├── Input: { name, slug, industry, config }
├── Activity: create_solution_record
├── Output: solution_id
└── Compensation: delete_solution_record(solution_id)

Step 2: Create RAG Global Oracle
├── Input: solution_id
├── Activity: create_rag_global_oracle
├── Output: oracle_id
└── Compensation: delete_oracle_record(oracle_id)

Step 3: Link Solution to Oracle
├── Input: solution_id, oracle_id
├── Activity: link_solution_to_oracle
├── Output: void
└── Compensation: unlink_solution_from_oracle(solution_id)

═══════════════════════════════════════════════════════════════════════════════

If any step fails:
1. Workflow catches exception
2. Compensation activities execute in reverse order
3. Final status: 'compensated' or 'compensation_failed'

Tracking in temporal_workflows table:
{
    "workflow_type": "CreateSolutionSAGA",
    "is_saga": true,
    "compensation_steps": [
        { "step": "unlink_solution", "status": "completed", "timestamp": "..." },
        { "step": "delete_oracle", "status": "completed", "timestamp": "..." },
        { "step": "delete_solution", "status": "completed", "timestamp": "..." }
    ]
}
```

### Go Workflow Example

```go
// workflows/create_solution_saga.go
package workflows

import (
    "time"
    "go.temporal.io/sdk/workflow"
)

type CreateSolutionInput struct {
    Name     string `json:"name"`
    Slug     string `json:"slug"`
    Industry string `json:"industry"`
    Config   map[string]interface{} `json:"config"`
}

type CreateSolutionOutput struct {
    SolutionID string `json:"solution_id"`
    OracleID   string `json:"oracle_id"`
}

func CreateSolutionSAGA(ctx workflow.Context, input CreateSolutionInput) (*CreateSolutionOutput, error) {
    ao := workflow.ActivityOptions{
        StartToCloseTimeout: 30 * time.Second,
        RetryPolicy: &temporal.RetryPolicy{
            MaximumAttempts: 3,
            InitialInterval: time.Second,
            MaximumInterval: 10 * time.Second,
        },
    }
    ctx = workflow.WithActivityOptions(ctx, ao)

    var solutionID string
    var oracleID string

    // Step 1: Create Solution
    err := workflow.ExecuteActivity(ctx, CreateSolutionRecord, input).Get(ctx, &solutionID)
    if err != nil {
        return nil, err
    }

    // Defer compensation
    defer func() {
        if err != nil {
            // Compensation: Delete Solution
            _ = workflow.ExecuteActivity(ctx, DeleteSolutionRecord, solutionID).Get(ctx, nil)
        }
    }()

    // Step 2: Create RAG Global Oracle
    err = workflow.ExecuteActivity(ctx, CreateRAGGlobalOracle, solutionID).Get(ctx, &oracleID)
    if err != nil {
        return nil, err
    }

    // Defer compensation for Oracle
    defer func() {
        if err != nil {
            // Compensation: Delete Oracle
            _ = workflow.ExecuteActivity(ctx, DeleteOracleRecord, oracleID).Get(ctx, nil)
        }
    }()

    // Step 3: Link Solution to Oracle
    err = workflow.ExecuteActivity(ctx, LinkSolutionToOracle, solutionID, oracleID).Get(ctx, nil)
    if err != nil {
        return nil, err
    }

    return &CreateSolutionOutput{
        SolutionID: solutionID,
        OracleID:   oracleID,
    }, nil
}
```

---

## Observability

### Temporal Web UI

**URL**: http://localhost:8088

The Temporal UI provides:

1. **Workflow List**: All workflows with status, type, and timing
2. **Workflow Details**: Full event history, input/output data
3. **Activity Details**: Each activity's execution, retries, errors
4. **Search**: Query workflows by ID, type, status, time range
5. **Namespace Management**: Multiple namespaces for different environments

### Prometheus Metrics

**URL**: http://localhost:9090/metrics

Key metrics exposed:

```
# Workflow metrics
temporal_workflow_execution_count
temporal_workflow_execution_latency
temporal_workflow_failed_count

# Activity metrics
temporal_activity_execution_count
temporal_activity_execution_latency
temporal_activity_failed_count

# Task queue metrics
temporal_task_queue_depth
temporal_task_queue_latency
```

### Application-Level Tracking

The `temporal_workflows` table provides business-level visibility:

```sql
-- Get active workflows for a solution
SELECT * FROM get_active_workflows('solution-uuid');

-- Monitor SAGA compensations
SELECT workflow_id, workflow_type, status, compensation_status, compensation_steps
FROM temporal_workflows
WHERE is_saga = TRUE AND status IN ('compensating', 'compensation_failed');

-- Failed workflows requiring attention
SELECT workflow_id, workflow_type, error_message, error_details, created_at
FROM temporal_workflows
WHERE status = 'failed'
ORDER BY created_at DESC;
```

---

## Consequences

### Positive

* **Guaranteed Durability**: Workflows survive service restarts (event-sourced)
* **Native SAGA Support**: Compensation logic is first-class citizen
* **Excellent Observability**: Web UI + Prometheus metrics + application tracking
* **Multi-Language Support**: Go, Python, TypeScript workers share the same server
* **Automatic Retries**: Built-in exponential backoff with configurable policies
* **Workflow Versioning**: Deploy new workflow versions without breaking running workflows
* **Redis Simplification**: Redis becomes cache-only (no broker complexity)
* **Audit Trail**: Complete history of every workflow execution

### Negative

* **Learning Curve**: Temporal's programming model differs from traditional task queues
* **Infrastructure Overhead**: Requires PostgreSQL + Elasticsearch + Temporal Server
* **Memory Usage**: Elasticsearch requires 512MB+ RAM
* **Initial Setup Complexity**: More services to configure compared to Celery

### Neutral

* **Different Mental Model**: Workflows are stateful objects, not fire-and-forget tasks
* **SDK Dependency**: Each service needs Temporal SDK (Go, Python, etc.)
* **Testing**: Workflows can be unit tested with Temporal's test framework

---

## Validation

This decision will be validated through:

1. **SAGA Compensation Test**: Create Solution, fail at Step 3, verify Steps 1-2 are rolled back
2. **Durability Test**: Kill worker mid-workflow, restart, verify workflow completes
3. **Performance Benchmark**: 1000 concurrent workflows, measure latency and throughput
4. **Observability Test**: Verify all metrics appear in Prometheus and UI
5. **Multi-Language Test**: Go and Python workers processing same task queue
6. **Recovery Test**: Restart Temporal Server, verify running workflows resume

**Evidence Files**:
- Docker Compose: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/infrastructure/docker/docker-compose.yml`
- Workflow Tracking Schema: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/07_temporal_workflows.sql`
- Infrastructure README: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/infrastructure/README.md`

**Verification Commands**:
```bash
# Start infrastructure
make dev-up

# Verify Temporal is healthy
docker-compose -f docker/docker-compose.yml exec temporal tctl cluster describe

# Access Temporal UI
open http://localhost:8088

# Check Prometheus metrics
curl http://localhost:9090/metrics | grep temporal
```

---

## Related Decisions

* **ADR-002**: Apache Pulsar over RabbitMQ/Kafka - Temporal replaces Celery, Pulsar remains for pub/sub
* **ADR-003**: PostgreSQL + NebulaGraph Hybrid - Temporal uses separate PostgreSQL instance
* **ADR-014**: Solution Layer Architecture - CreateSolutionSAGA ensures atomic Solution + Oracle creation
* **ADR-012**: Multi-Tenancy Strategy - Workflows scoped by solution_id for RLS compliance

---

## Migration from Celery

For teams migrating from Celery:

| Celery Concept | Temporal Equivalent |
|----------------|---------------------|
| Task | Activity |
| Chain | Sequential workflow |
| Chord | Parallel activities with `workflow.Go()` |
| Group | Parallel activities |
| Retry | Built-in RetryPolicy |
| Countdown | `workflow.Sleep()` |
| ETA | Schedule-to-start timeout |
| Result backend | Workflow result (built-in) |
| Flower | Temporal UI |

**Migration Strategy**:
1. Keep existing Celery tasks running
2. Implement new features as Temporal workflows
3. Migrate high-value workflows first (e.g., Solution creation)
4. Eventually decommission Celery completely

---

## References

### Implemented Artifacts

* **Docker Compose**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/infrastructure/docker/docker-compose.yml`
* **Workflow Tracking Schema**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/07_temporal_workflows.sql`
* **Infrastructure README**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/infrastructure/README.md`
* **Temporal Architecture Doc**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/TEMPORAL_ARCHITECTURE.md`

### Architecture Documentation

* **Arquitetura SuperCore v2.0**: `/Users/jose.silva.lb/LBPay/supercore/documentation-base/arquitetura_supercore_v2.0.md`
* **Stack SuperCore v2.0**: `/Users/jose.silva.lb/LBPay/supercore/documentation-base/stack_supercore_v2.0.md`
* **CLAUDE.md**: `/Users/jose.silva.lb/LBPay/supercore/CLAUDE.md`

### External References

* [Temporal.io Documentation](https://docs.temporal.io/)
* [Temporal Go SDK](https://github.com/temporalio/sdk-go)
* [Temporal Python SDK](https://github.com/temporalio/sdk-python)
* [SAGA Pattern (Microsoft)](https://docs.microsoft.com/en-us/azure/architecture/reference-architectures/saga/saga)
* [Event Sourcing Pattern](https://martinfowler.com/eaaDev/EventSourcing.html)

---

## Changelog

| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2025-12-30 | 1.0.0 | Solution Architect | Initial ADR creation based on implemented infrastructure |

---

**Document Status**: Accepted
**Implementation Status**: Complete (Epic 1.4)
**Next Steps**: Implement CreateSolutionSAGA workflow in Go during Sprint 2
