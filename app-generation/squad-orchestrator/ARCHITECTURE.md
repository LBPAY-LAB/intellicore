# Squad Orchestrator - Architecture Documentation

## System Overview

The Squad Orchestrator is a **multi-agent task automation framework** designed for complex, parallel development workflows using Claude Code agents in autonomous mode.

### Design Principles

1. **Autonomous Execution**: No human intervention required during execution
2. **Parallel Processing**: Multiple squads work concurrently
3. **Event-Driven**: Inter-squad communication via publish-subscribe pattern
4. **Fault Tolerant**: Automatic retry, checkpointing, and recovery
5. **Observable**: Comprehensive logging and real-time monitoring
6. **Secure**: Granular permission control per squad

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATOR LAYER                          │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │               launch-squads.sh (Main Controller)              │ │
│  │  • Validates configuration                                    │ │
│  │  • Initializes session                                        │ │
│  │  • Spawns squad runners                                       │ │
│  │  • Manages global state                                       │ │
│  └────────────────────────┬──────────────────────────────────────┘ │
│                           │                                         │
│           ┌───────────────┼───────────────┐                        │
│           │               │               │                        │
├───────────▼───────────────▼───────────────▼────────────────────────┤
│                        SQUAD RUNNER LAYER                           │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│  │   Squad 1   │   │   Squad 2   │   │   Squad 3   │              │
│  │             │   │             │   │             │              │
│  │ squad-      │   │ squad-      │   │ squad-      │              │
│  │ runner.sh   │   │ runner.sh   │   │ runner.sh   │              │
│  │             │   │             │   │             │              │
│  │ PID: 12345  │   │ PID: 12346  │   │ PID: 12347  │              │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘              │
│         │                 │                 │                      │
├─────────┼─────────────────┼─────────────────┼──────────────────────┤
│         │                 │                 │                      │
│         │       AGENT EXECUTION LAYER       │                      │
│         ▼                 ▼                 ▼                      │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐              │
│  │   Claude    │   │   Claude    │   │   Claude    │              │
│  │    Agent    │   │    Agent    │   │    Agent    │              │
│  │             │   │             │   │             │              │
│  │ architect-  │   │ backend-    │   │ security-   │              │
│  │ planner     │   │ developer   │   │ auditor     │              │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘              │
│         │                 │                 │                      │
│         └─────────────────┼─────────────────┘                      │
│                           │                                         │
├───────────────────────────┼─────────────────────────────────────────┤
│                           │                                         │
│                  STATE & EVENT LAYER                                │
│  ┌────────────────────────▼──────────────────────────┐             │
│  │              State Management                      │             │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │             │
│  │  │ Session      │  │ Squad        │  │ Event   │ │             │
│  │  │ Metadata     │  │ State Files  │  │ Files   │ │             │
│  │  │              │  │              │  │         │ │             │
│  │  │ metadata.json│  │ squad-1.json │  │ *.event │ │             │
│  │  └──────────────┘  └──────────────┘  └─────────┘ │             │
│  └────────────────────────────────────────────────────┘             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────┐           │
│  │              Checkpoint & Recovery                   │           │
│  │  • Auto-checkpoint every N minutes                   │           │
│  │  • Resume from last checkpoint on failure            │           │
│  │  • State consistency validation                      │           │
│  └─────────────────────────────────────────────────────┘           │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                     MONITORING & LOGGING LAYER                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐       │
│  │   Dashboard    │  │   Log Files    │  │  Notifications │       │
│  │                │  │                │  │                │       │
│  │ monitor-       │  │ squad-1.log    │  │ Slack/Email    │       │
│  │ squads.sh      │  │ squad-2.log    │  │ Webhooks       │       │
│  │                │  │ squad-3.log    │  │                │       │
│  │ Real-time UI   │  │ Structured Log │  │ Events         │       │
│  └────────────────┘  └────────────────┘  └────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Orchestrator Layer

#### launch-squads.sh
**Responsibilities:**
- Parse and validate `squad-definitions.json`
- Initialize session with unique ID
- Create directory structure (logs, state, events)
- Spawn squad runners in background
- Maintain orchestrator PID file
- Handle graceful shutdown

**State Management:**
```json
{
  "session_id": "session-20250120-143022",
  "start_time": "2025-01-20T14:30:22Z",
  "status": "running",
  "squads": [
    {"name": "squad-1", "pid": 12345},
    {"name": "squad-2", "pid": 12346}
  ]
}
```

### 2. Squad Runner Layer

#### squad-runner.sh
**Responsibilities:**
- Execute tasks in sequence
- Check task dependencies before execution
- Wait for required events from other squads
- Invoke Claude Code agents with prompts
- Validate task outputs
- Run validation commands
- Update squad state continuously
- Publish events on completion

**Task Execution Flow:**
```
1. Read squad configuration
2. For each task:
   a. Check dependencies (depends_on)
   b. Wait for events (waits_for_events)
   c. Build prompt from task definition
   d. Execute via Claude CLI: claude --agent <agent> < prompt
   e. Validate outputs exist
   f. Run validation commands
   g. Update progress state
   h. Log completion
3. Publish completion events
4. Update squad status to "completed"
```

**State Per Squad:**
```json
{
  "name": "backend-squad",
  "agent": "backend-developer",
  "pid": 12346,
  "status": "running",
  "start_time": "2025-01-20T14:30:25Z",
  "progress": {
    "total_tasks": 3,
    "completed_tasks": 1,
    "current_task": "BACK-002"
  },
  "tasks": [
    {"id": "BACK-001", "status": "completed"},
    {"id": "BACK-002", "status": "running"},
    {"id": "BACK-003", "status": "pending"}
  ]
}
```

### 3. Agent Execution Layer

**Claude Code Integration:**
```bash
# Agent invocation
claude --agent <agent-name> << EOF
<task-prompt>
Task ID: <task-id>
Execute autonomously. No approvals required.
EOF
```

**Agent Capabilities:**
- Read/Write files within allowed paths
- Execute allowed commands
- Generate code, documentation, tests
- Interact with tools (bash, git, npm, etc.)
- Create commits (if permitted)

**Permission Enforcement:**
```json
"autonomous_permissions": {
  "can_create_files": true,
  "can_edit_files": true,
  "can_run_commands": true,
  "allowed_paths": ["/src/", "/tests/"],
  "allowed_commands": ["npm test", "pytest"]
}
```

### 4. State & Event Layer

#### State Files Structure
```
state/
└── session-20250120-143022/
    ├── metadata.json           # Session-level state
    ├── planning-squad.json     # Squad 1 state
    ├── backend-squad.json      # Squad 2 state
    ├── quality-squad.json      # Squad 3 state
    ├── events/                 # Event files
    │   ├── architecture_ready.event
    │   ├── api_contracts_ready.event
    │   └── code_complete.event
    └── checkpoints/            # Auto-checkpoints
        └── checkpoint-143045.json
```

#### Event System

**Publishing Events:**
```bash
# Squad publishes event on completion
publish_event() {
    local event_name="$1"
    echo '{
        "event": "'$event_name'",
        "squad": "'$SQUAD_NAME'",
        "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
    }' > state/session-ID/events/${event_name}.event
}
```

**Subscribing to Events:**
```bash
# Squad waits for event before starting task
wait_for_event() {
    local event_name="$1"
    while [[ ! -f "state/session-ID/events/${event_name}.event" ]]; do
        sleep 5  # Poll every 5 seconds
    done
}
```

**Event Flow Example:**
```
Time  Squad              Action                    Event
────  ─────              ──────                    ─────
T1    planning-squad     Start PLAN-001
T2    planning-squad     Complete PLAN-001
T3    planning-squad     Publish event             → architecture_ready
T4    backend-squad      Wait for event            ← architecture_ready
T5    backend-squad      Event received
T6    backend-squad      Start BACK-001
```

#### Checkpointing

**Auto-checkpoint every N minutes:**
```json
{
  "checkpoint_id": "checkpoint-143045",
  "timestamp": "2025-01-20T14:30:45Z",
  "session_state": { ... },
  "squad_states": [ ... ],
  "events_published": ["architecture_ready"]
}
```

**Recovery on Failure:**
```bash
1. Detect squad failure (process died)
2. Load most recent checkpoint
3. Restore squad state
4. Resume from last completed task
5. Re-publish events if needed
```

### 5. Monitoring & Logging Layer

#### monitor-squads.sh

**Dashboard Components:**
- Session overview (status, start time, definitions)
- Squad progress bars (tasks completed/total)
- Current task per squad
- Overall completion percentage
- Recent log entries
- Auto-refresh capability

**Monitoring Modes:**
```bash
# Real-time dashboard (TUI)
./monitor-squads.sh --watch

# JSON output (for automation)
./monitor-squads.sh --format json

# Simple text (for scripting)
./monitor-squads.sh --format simple
```

#### Logging Strategy

**Log Levels:**
- `DEBUG`: Detailed execution traces
- `INFO`: Normal operation events
- `WARN`: Non-critical issues
- `ERROR`: Recoverable errors
- `CRITICAL`: Fatal errors

**Structured Logging:**
```json
{
  "timestamp": "2025-01-20T14:30:45Z",
  "level": "INFO",
  "squad": "backend-squad",
  "task": "BACK-001",
  "message": "Task completed successfully",
  "context": "task_execution"
}
```

**Log Rotation:**
- Automatic rotation at 100MB
- Keep last 5 rotated logs
- Compress old logs (optional)

## Data Flow

### Sequential Workflow
```
Planning Squad                    Backend Squad                Quality Squad
     │                                 │                            │
     ├─ PLAN-001 (start)              │                            │
     ├─ Create architecture           │                            │
     ├─ PLAN-001 (complete)           │                            │
     ├─ Publish: architecture_ready   │                            │
     │                                 │                            │
     │                            ┌────▼────┐                       │
     │                            │ Wait    │                       │
     │                            └────┬────┘                       │
     │                                 │                            │
     │                            ├─ BACK-001 (start)               │
     │                            ├─ Implement service              │
     │                            ├─ BACK-001 (complete)            │
     │                            ├─ Publish: code_ready            │
     │                                 │                            │
     │                                 │                       ┌────▼────┐
     │                                 │                       │ Wait    │
     │                                 │                       └────┬────┘
     │                                 │                            │
     │                                 │                     ├─ QA-001 (start)
     │                                 │                     ├─ Security audit
     │                                 │                     ├─ QA-001 (complete)
```

### Parallel Workflow
```
Frontend Squad         Backend Squad          Mobile Squad
     │                      │                      │
     ├─ FRONT-001          ├─ BACK-001            ├─ MOB-001
     │  (runs)             │  (runs)              │  (runs)
     │                     │                      │
     ├─ Complete           ├─ Complete            ├─ Complete
     │                     │                      │
     └─────────────────────┴──────────────────────┘
                           │
                    All Complete Event
```

## Scalability & Performance

### Resource Management

**Per Squad:**
- Memory: ~500MB - 2GB (depends on agent model)
- CPU: 1-2 cores per squad
- Disk: Logs + State (~100MB per session)

**Recommendations:**
| Squads | Min RAM | Min Cores | Storage |
|--------|---------|-----------|---------|
| 1-3    | 4GB     | 2         | 10GB    |
| 4-6    | 8GB     | 4         | 20GB    |
| 7-10   | 16GB    | 8         | 50GB    |

### Performance Tuning

**Optimize Parallelism:**
```json
"global_config": {
  "max_parallel_tasks": 3  // Based on CPU cores
}
```

**Reduce Log Overhead:**
```json
"logging": {
  "level": "INFO",  // Not DEBUG in production
  "rotation_mb": 50
}
```

**Checkpoint Frequency:**
```json
"checkpointing": {
  "interval_minutes": 15  // Balance safety vs performance
}
```

## Security Model

### Isolation

**Process Isolation:**
- Each squad runs in separate process
- No shared memory between squads
- Communication only via state files

**Permission Boundaries:**
```json
"autonomous_permissions": {
  "allowed_paths": ["/src/services/order-service/"],
  "denied_paths": ["/src/services/payment-service/"],
  "allowed_commands": ["npm test"],
  "denied_commands": ["rm -rf", "curl"]
}
```

**Audit Trail:**
- All file operations logged
- All command executions logged
- State changes tracked
- Event publications logged

### Attack Surface

**Potential Risks:**
1. **Malicious Prompts**: Agents could be prompted to execute harmful commands
2. **Path Traversal**: Agents might try to escape `allowed_paths`
3. **Resource Exhaustion**: Infinite loops or memory leaks
4. **Secret Exposure**: Agents might log sensitive data

**Mitigations:**
1. **Prompt Validation**: Sanitize task prompts before execution
2. **Path Whitelisting**: Enforce allowed paths strictly
3. **Timeouts**: Kill squads exceeding time limits
4. **Secret Scanning**: Detect secrets in logs/outputs

## Failure Modes & Recovery

### Failure Scenarios

1. **Squad Crash**
   - Detection: Process no longer running
   - Recovery: Restart from checkpoint
   - Mitigation: Auto-retry with exponential backoff

2. **Task Timeout**
   - Detection: Task exceeds `timeout_hours`
   - Recovery: Kill task, mark as failed
   - Mitigation: Configure realistic timeouts

3. **Dependency Deadlock**
   - Detection: All squads waiting indefinitely
   - Recovery: Manual intervention required
   - Mitigation: Validate dependency graph before launch

4. **Event Never Published**
   - Detection: Squad waiting > max_wait_time
   - Recovery: Timeout and fail gracefully
   - Mitigation: Set event wait timeouts

5. **Disk Full**
   - Detection: Write operations fail
   - Recovery: Pause squads, alert operator
   - Mitigation: Monitor disk usage, log rotation

### Recovery Strategies

**Automatic Recovery:**
```bash
1. Detect failure (process exit, timeout)
2. Load last checkpoint
3. Restore squad state
4. Identify last successful task
5. Resume from next task
6. Retry failed task (if auto_retry enabled)
```

**Manual Recovery:**
```bash
1. Stop all squads
2. Review logs for root cause
3. Fix underlying issue
4. Edit squad definitions if needed
5. Relaunch with --resume flag
```

## Extension Points

### Adding New Squad Types

1. Create agent in `.claude/agents/new-agent.md`
2. Define squad in `squad-definitions.json`
3. Configure permissions
4. Test in isolation first

### Custom Validation

```json
"tasks": [{
  "validation_commands": [
    "custom-validator.sh output-file.json",
    "python custom_check.py"
  ]
}]
```

### Event-Driven Integrations

```bash
# Hook into event publication
on_event_publish() {
    local event="$1"
    # Send to external system
    curl -X POST https://api.example.com/events \
        -d '{"event": "'$event'"}'
}
```

## Future Enhancements

1. **Web Dashboard**: Real-time UI instead of CLI
2. **Distributed Execution**: Run squads across multiple machines
3. **Dynamic Scaling**: Auto-scale squad workers based on load
4. **Advanced Scheduling**: Priority queues, resource limits
5. **Telemetry**: Prometheus metrics, Grafana dashboards
6. **AI-Optimized Prompts**: Auto-improve prompts based on success rate

---

**Architecture Version:** 1.0.0
**Last Updated:** 2025-01-20
**Status:** Production
