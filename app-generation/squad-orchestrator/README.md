# SuperCore Squad Orchestrator

**Version:** 1.0.0
**Status:** Production Ready
**License:** MIT

## Overview

The SuperCore Squad Orchestrator is a sophisticated task automation system that enables **parallel execution** of multiple Claude Code agent squads in **fully autonomous background mode**. It's designed for complex, multi-phase development workflows where different specialized agents work concurrently on related tasks.

### Key Features

- **Parallel Execution**: Run up to 10 squads simultaneously
- **Fully Autonomous**: No chat approvals required during execution
- **Event-Driven Communication**: Squads communicate via state files and events
- **Dependency Management**: Automatic task dependency resolution
- **Checkpoint/Resume**: Automatic state persistence for recovery
- **Real-time Monitoring**: Live dashboard with progress tracking
- **Comprehensive Logging**: Independent logs per squad with aggregation
- **Graceful Degradation**: Automatic retry and error recovery
- **Security-First**: Granular permission control per squad

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Squad Orchestrator                       │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Planning   │  │  Backend    │  │  Quality    │        │
│  │   Squad     │  │   Squad     │  │   Squad     │        │
│  │             │  │             │  │             │        │
│  │  Agent:     │  │  Agent:     │  │  Agent:     │        │
│  │  architect  │  │  backend-   │  │  security-  │        │
│  │  -planner   │  │  developer  │  │  auditor    │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
│         └────────────────┼────────────────┘                │
│                          │                                 │
│                   ┌──────▼──────┐                          │
│                   │    Events   │                          │
│                   │  State Mgr  │                          │
│                   └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### Components

1. **launch-squads.sh**: Main orchestration script
2. **monitor-squads.sh**: Real-time monitoring dashboard
3. **stop-squads.sh**: Graceful shutdown controller
4. **squad-runner.sh**: Individual squad executor
5. **utils/**: Shared utility functions
6. **squad-definitions.json**: Configuration file

## Quick Start

### Prerequisites

```bash
# Required tools
- bash 4.0+
- jq (JSON processor)
- Claude Code CLI

# Verify installation
which claude  # Should show: /path/to/claude
jq --version  # Should show: jq-1.6 or higher
```

### Installation

```bash
# Navigate to project root
cd /path/to/supercore

# Make scripts executable
chmod +x scripts/squad-orchestrator/*.sh
chmod +x scripts/squad-orchestrator/utils/*.sh

# Verify installation
./scripts/squad-orchestrator/launch-squads.sh --help
```

### Basic Usage

```bash
# 1. Create squad definitions (or use example)
cp scripts/squad-orchestrator/squad-definitions.example.json \
   squad-definitions.json

# 2. Edit definitions for your use case
vi squad-definitions.json

# 3. Validate configuration (dry run)
./scripts/squad-orchestrator/launch-squads.sh \
    --dry-run squad-definitions.json

# 4. Launch squads
./scripts/squad-orchestrator/launch-squads.sh \
    squad-definitions.json

# 5. Monitor progress (in another terminal)
./scripts/squad-orchestrator/monitor-squads.sh --watch

# 6. Stop squads when needed
./scripts/squad-orchestrator/stop-squads.sh
```

## Configuration Guide

### Squad Definitions File

The `squad-definitions.json` file defines all squads, tasks, permissions, and workflows.

#### Structure

```json
{
  "version": "1.0.0",
  "metadata": {
    "project": "SuperCore",
    "sprint": "Sprint 1"
  },
  "global_config": {
    "autonomous_mode": true,
    "max_parallel_tasks": 3,
    "auto_retry_on_failure": true,
    "timeout_hours": 8
  },
  "squads": [
    {
      "name": "planning-squad",
      "agent": "architect-planner",
      "priority": 1,
      "thinking_level": "think hard",
      "autonomous_permissions": { ... },
      "tasks": [ ... ],
      "communication": { ... }
    }
  ]
}
```

#### Squad Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique squad identifier |
| `agent` | string | Yes | Claude agent to use (from `.claude/agents/`) |
| `priority` | number | No | Execution priority (1=highest) |
| `thinking_level` | string | No | Default thinking depth |
| `autonomous_permissions` | object | Yes | Permission boundaries |
| `tasks` | array | Yes | List of tasks to execute |
| `communication` | object | No | Inter-squad communication config |

#### Task Configuration

```json
{
  "id": "PLAN-001",
  "title": "Create system architecture",
  "description": "Design microservices architecture",
  "type": "architecture",
  "priority": "critical",
  "estimated_hours": 2,
  "depends_on": [],
  "waits_for_events": [],
  "prompt": "Detailed prompt for the agent...",
  "success_criteria": [
    "Architecture document created",
    "Diagrams included"
  ],
  "outputs": [
    "/docs/architecture/system-design.md"
  ],
  "validation_commands": [
    "test -f docs/architecture/system-design.md"
  ]
}
```

#### Permission Model

```json
"autonomous_permissions": {
  "can_create_files": true,
  "can_edit_files": true,
  "can_create_directories": true,
  "can_run_commands": true,
  "can_install_packages": false,
  "can_commit_changes": true,
  "allowed_paths": [
    "/src/services/",
    "/tests/"
  ],
  "allowed_commands": [
    "npm test",
    "pytest"
  ]
}
```

### Event-Driven Communication

Squads communicate through events:

```json
"communication": {
  "state_file": "planning-squad-state.json",
  "publishes": ["architecture_ready", "api_contracts_ready"],
  "subscribes": []
}
```

**Example Flow:**
1. Planning Squad completes architecture
2. Publishes `architecture_ready` event
3. Backend Squad (subscribed to event) automatically starts
4. Quality Squad waits for `backend_complete` event

## Monitoring and Management

### Real-time Dashboard

```bash
# Launch interactive dashboard
./scripts/squad-orchestrator/monitor-squads.sh --watch

# Dashboard features:
# - Overall progress with visual progress bars
# - Per-squad status and current task
# - Recent log entries
# - Auto-refresh every 2 seconds
```

**Dashboard Output:**

```
╔═══════════════════════════════════════════════════════════════════╗
║                      SuperCore Squad Orchestrator                 ║
╚═══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Session: session-20250120-143022
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Status: running
Started: 2025-01-20T14:30:22Z

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Squad Progress
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  planning-squad      [running] PID: 12345  2/2 tasks (100%) ████████████████████
  backend-squad       [running] PID: 12346  1/2 tasks ( 50%) ██████████░░░░░░░░░░ → BACK-001
  quality-squad       [pending] PID: N/A    0/2 tasks (  0%) ░░░░░░░░░░░░░░░░░░░░

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Overall Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Squads: 3
Running: 2  Completed: 0  Failed: 0
Total Tasks: 3/6 (50%)

Overall Progress:
█████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 50%
```

### Monitoring Options

```bash
# Quick status check
./scripts/squad-orchestrator/monitor-squads.sh --status

# Monitor specific session
./scripts/squad-orchestrator/monitor-squads.sh \
    --session session-20250120-143022 --watch

# Show logs with monitoring
./scripts/squad-orchestrator/monitor-squads.sh \
    --watch --logs --lines 50

# Filter by squad
./scripts/squad-orchestrator/monitor-squads.sh \
    --filter backend-squad --watch

# JSON output for automation
./scripts/squad-orchestrator/monitor-squads.sh \
    --format json
```

### Log Management

```bash
# View specific squad log
tail -f scripts/squad-orchestrator/logs/session-ID/squad-name.log

# View all logs
tail -f scripts/squad-orchestrator/logs/session-ID/*.log

# Extract errors
grep -E "ERROR|CRITICAL" \
    scripts/squad-orchestrator/logs/session-ID/*.log

# Log rotation (automatic after 100MB)
# Keeps last 5 rotated logs per squad
```

### State Files

State is persisted in `scripts/squad-orchestrator/state/`:

```
state/
├── session-20250120-143022/
│   ├── metadata.json          # Session metadata
│   ├── planning-squad.json    # Squad state
│   ├── backend-squad.json     # Squad state
│   ├── quality-squad.json     # Squad state
│   ├── events/                # Inter-squad events
│   │   ├── architecture_ready.event
│   │   └── api_contracts_ready.event
│   └── checkpoints/           # Automatic checkpoints
│       └── checkpoint-143045.json
└── orchestrator.pid           # Orchestrator process ID
```

## Advanced Features

### Checkpoint and Resume

Automatic checkpointing every 15 minutes (configurable):

```json
"checkpointing": {
  "enabled": true,
  "interval_minutes": 15,
  "checkpoint_location": "./state/checkpoints/",
  "max_checkpoints": 10
}
```

**Resume from checkpoint:**

```bash
# Orchestrator automatically resumes from last checkpoint
# if a squad is restarted after failure
```

### Automatic Retry

Configure retry behavior:

```json
"global_config": {
  "auto_retry_on_failure": true,
  "max_retries": 2,
  "retry_delay_seconds": 30
}
```

### Notifications

Configure webhooks and email notifications:

```json
"notifications": {
  "enabled": true,
  "channels": [
    {
      "type": "slack",
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "events": ["squad_complete", "critical_failure"]
    },
    {
      "type": "email",
      "recipients": ["team@supercore.com"],
      "events": ["all_squads_complete"]
    }
  ]
}
```

### Dependency Management

Tasks can depend on other tasks:

```json
{
  "id": "BACK-001",
  "depends_on": ["PLAN-001", "PLAN-002"],
  "waits_for_events": ["architecture_ready"]
}
```

**Execution Flow:**
1. Task checks dependencies before starting
2. Waits for all dependent tasks to complete
3. Waits for required events to be published
4. Executes only when all conditions are met

## Security and Permissions

### Permission Levels

Permissions are enforced at squad level:

**File Operations:**
- `can_create_files`: Allow creating new files
- `can_edit_files`: Allow editing existing files
- `can_delete_files`: Allow deleting files (dangerous)
- `allowed_paths`: Restrict to specific directories

**System Operations:**
- `can_run_commands`: Allow bash command execution
- `can_install_packages`: Allow npm/pip install
- `allowed_commands`: Whitelist of allowed commands

**Version Control:**
- `can_commit_changes`: Allow git commits
- `can_create_branches`: Allow git branch creation
- `can_push_changes`: Allow git push

### Best Practices

1. **Principle of Least Privilege**: Grant minimum required permissions
2. **Path Restrictions**: Always specify `allowed_paths`
3. **Command Whitelisting**: Use `allowed_commands` for security
4. **Audit Logs**: All operations are logged
5. **Review Critical Squads**: Security/Quality squads should be read-only

## Troubleshooting

### Common Issues

#### Squads Not Starting

```bash
# Check prerequisites
which claude
jq --version

# Verify agent exists
ls -la .claude/agents/your-agent.md

# Check permissions
chmod +x scripts/squad-orchestrator/*.sh

# Validate configuration
./scripts/squad-orchestrator/launch-squads.sh \
    --dry-run squad-definitions.json
```

#### Tasks Stuck Waiting

```bash
# Check event dependencies
ls -la scripts/squad-orchestrator/state/session-ID/events/

# View squad state
cat scripts/squad-orchestrator/state/session-ID/squad-name.json | jq

# Check logs for dependency issues
grep "waiting for" scripts/squad-orchestrator/logs/session-ID/*.log
```

#### High Memory Usage

```bash
# Reduce parallel tasks
# Edit squad-definitions.json:
"global_config": {
  "max_parallel_tasks": 2  # Reduce from 3
}

# Monitor resource usage
top -p $(cat scripts/squad-orchestrator/state/orchestrator.pid)
```

### Debug Mode

```bash
# Enable verbose logging
export LOG_LEVEL=0  # DEBUG level

# Run with verbose output
./scripts/squad-orchestrator/launch-squads.sh \
    --verbose squad-definitions.json

# Check all process IDs
ps aux | grep squad-runner
```

### Recovery Procedures

**If orchestrator crashes:**

```bash
# 1. Check for orphaned processes
ps aux | grep squad-runner

# 2. Clean up state
rm -f scripts/squad-orchestrator/state/orchestrator.pid

# 3. Resume from checkpoint
./scripts/squad-orchestrator/launch-squads.sh squad-definitions.json
```

**If squad fails:**

```bash
# 1. Check logs for error
cat scripts/squad-orchestrator/logs/session-ID/squad-name.log

# 2. Fix underlying issue

# 3. Restart specific squad
# (Edit squad-definitions.json to include only failed squad)
./scripts/squad-orchestrator/launch-squads.sh modified-definitions.json
```

## Examples

### Example 1: Simple Sequential Workflow

```json
{
  "squads": [
    {
      "name": "design-squad",
      "agent": "architect-planner",
      "tasks": [
        {
          "id": "DESIGN-001",
          "title": "Create architecture",
          "prompt": "Design the system architecture..."
        }
      ],
      "communication": {
        "publishes": ["design_complete"]
      }
    },
    {
      "name": "build-squad",
      "agent": "backend-developer",
      "tasks": [
        {
          "id": "BUILD-001",
          "title": "Implement services",
          "waits_for_events": ["design_complete"],
          "prompt": "Implement the services..."
        }
      ]
    }
  ]
}
```

### Example 2: Parallel Development

```json
{
  "squads": [
    {
      "name": "frontend-squad",
      "agent": "frontend-developer",
      "tasks": [...]
    },
    {
      "name": "backend-squad",
      "agent": "backend-developer",
      "tasks": [...]
    },
    {
      "name": "mobile-squad",
      "agent": "mobile-developer",
      "tasks": [...]
    }
  ]
}
```

All three squads run in parallel with no dependencies.

### Example 3: Quality Gates

```json
{
  "squads": [
    {
      "name": "dev-squad",
      "tasks": [...],
      "communication": {
        "publishes": ["code_complete"]
      }
    },
    {
      "name": "test-squad",
      "tasks": [
        {
          "waits_for_events": ["code_complete"],
          "validation_commands": [
            "pytest --cov=90"
          ]
        }
      ],
      "communication": {
        "publishes": ["tests_passed"]
      }
    },
    {
      "name": "security-squad",
      "tasks": [
        {
          "waits_for_events": ["tests_passed"],
          "validation_commands": [
            "bandit -r src/",
            "safety check"
          ]
        }
      ]
    }
  ]
}
```

## Performance Tuning

### Optimization Tips

1. **Parallel Execution**: Set `max_parallel_tasks` based on CPU cores
2. **Log Rotation**: Configure max log size to prevent disk issues
3. **Checkpoint Frequency**: Balance between safety and performance
4. **Event Polling**: Adjust wait intervals for event dependencies

### Resource Requirements

| Squads | RAM | CPU | Disk |
|--------|-----|-----|------|
| 1-3    | 4GB | 2 cores | 10GB |
| 4-6    | 8GB | 4 cores | 20GB |
| 7-10   | 16GB | 8 cores | 50GB |

## Integration with CI/CD

```yaml
# GitHub Actions example
name: Squad Orchestration

on:
  push:
    branches: [main]

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Claude CLI
        run: |
          npm install -g @anthropic/claude-cli

      - name: Launch Squads
        run: |
          ./scripts/squad-orchestrator/launch-squads.sh \
            squad-definitions.json

      - name: Monitor Progress
        run: |
          while true; do
            status=$(./scripts/squad-orchestrator/monitor-squads.sh --status)
            if echo "$status" | grep -q "completed"; then
              break
            fi
            sleep 30
          done

      - name: Collect Results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: squad-logs
          path: scripts/squad-orchestrator/logs/
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Code Style**: Follow existing bash style
2. **Testing**: Test all scripts before PR
3. **Documentation**: Update README for new features
4. **Commit Messages**: Use semantic commits

## Support

- **Issues**: [GitHub Issues](https://github.com/supercore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/supercore/discussions)
- **Slack**: #supercore-squad-orchestrator

## License

MIT License - see LICENSE file for details

## Changelog

### Version 1.0.0 (2025-01-20)
- Initial release
- Parallel squad execution
- Real-time monitoring dashboard
- Event-driven communication
- Checkpoint/resume capability
- Comprehensive logging
- Permission management

---

**Built with ❤️ for the SuperCore Project**
