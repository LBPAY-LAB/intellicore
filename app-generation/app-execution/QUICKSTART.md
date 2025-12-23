# Squad Orchestrator - Quick Start Guide

## 5-Minute Setup

### Step 1: Verify Prerequisites (30 seconds)

```bash
# Check Claude CLI
which claude
# Expected: /path/to/claude

# Check jq
which jq
# Expected: /usr/local/bin/jq or similar

# Check bash version
bash --version
# Expected: 4.0 or higher
```

### Step 2: Test with Simple Example (2 minutes)

```bash
# Navigate to orchestrator directory
cd scripts/squad-orchestrator

# Run the simple example workflow
./launch-squads.sh examples/simple-workflow.json

# Expected output:
# ✓ Squad definitions validated
# ✓ Session initialized: session-YYYYMMDD-HHMMSS
# ✓ Squad launched: planning-squad (PID: xxxxx)
# ✓ Squad launched: documentation-squad (PID: xxxxx)
# ✓ Squad launched: summary-squad (PID: xxxxx)
```

### Step 3: Monitor Progress (2 minutes)

```bash
# In another terminal, watch progress
./monitor-squads.sh --watch

# You'll see a live dashboard updating every 2 seconds
# Press Ctrl+C to exit when done
```

### Step 4: Check Results

```bash
# View generated files
ls -la ../../docs/examples/

# Expected files:
# - todo-app-plan.md
# - todo-api-spec.yaml
# - project-summary.md

# View logs
tail -f logs/session-*/planning-squad.log
```

## Your First Custom Workflow

### Create Your Squad Definition

```bash
# Copy the example
cp squad-definitions.example.json my-workflow.json

# Edit it
vi my-workflow.json
```

### Minimal Example

```json
{
  "version": "1.0.0",
  "global_config": {
    "autonomous_mode": true
  },
  "squads": [
    {
      "name": "my-squad",
      "agent": "architect-planner",
      "autonomous_permissions": {
        "can_create_files": true,
        "allowed_paths": ["/docs/"]
      },
      "tasks": [
        {
          "id": "TASK-001",
          "title": "Create document",
          "prompt": "Create a README at /docs/my-readme.md explaining...",
          "outputs": ["/docs/my-readme.md"]
        }
      ]
    }
  ]
}
```

### Launch Your Workflow

```bash
# Dry run first (validate only)
./launch-squads.sh --dry-run my-workflow.json

# Launch for real
./launch-squads.sh my-workflow.json

# Monitor
./monitor-squads.sh --watch
```

## Common Use Cases

### Use Case 1: Sequential Tasks

```json
{
  "squads": [
    {
      "name": "step-1",
      "tasks": [{"id": "T1", ...}],
      "communication": {"publishes": ["step1_done"]}
    },
    {
      "name": "step-2",
      "tasks": [{"id": "T2", "waits_for_events": ["step1_done"], ...}]
    }
  ]
}
```

### Use Case 2: Parallel Execution

```json
{
  "squads": [
    {"name": "frontend", "tasks": [...]},
    {"name": "backend", "tasks": [...]},
    {"name": "mobile", "tasks": [...]}
  ]
}
```

All run in parallel - no dependencies!

### Use Case 3: Quality Gates

```json
{
  "squads": [
    {
      "name": "development",
      "tasks": [...],
      "communication": {"publishes": ["code_ready"]}
    },
    {
      "name": "testing",
      "tasks": [{
        "waits_for_events": ["code_ready"],
        "validation_commands": ["pytest", "npm test"]
      }],
      "communication": {"publishes": ["tests_passed"]}
    },
    {
      "name": "deployment",
      "tasks": [{
        "waits_for_events": ["tests_passed"],
        "prompt": "Deploy to staging..."
      }]
    }
  ]
}
```

## Monitoring Commands Cheat Sheet

```bash
# Quick status
./monitor-squads.sh --status

# Watch mode (auto-refresh)
./monitor-squads.sh --watch

# Show logs
./monitor-squads.sh --watch --logs --lines 50

# Filter by squad
./monitor-squads.sh --filter backend-squad --watch

# JSON output
./monitor-squads.sh --format json > status.json

# List all sessions
./monitor-squads.sh --list-sessions

# Monitor specific session
./monitor-squads.sh --session session-ID --watch
```

## Management Commands

```bash
# Stop all squads gracefully
./stop-squads.sh

# Force stop with 10s timeout
./stop-squads.sh --force --timeout 10

# Stop specific session
./stop-squads.sh --session session-ID

# View logs
tail -f logs/session-ID/squad-name.log

# View all logs
tail -f logs/session-ID/*.log

# Check state
cat state/session-ID/squad-name.json | jq
```

## Troubleshooting Quick Fixes

### Squads Not Starting

```bash
# 1. Check if agent exists
ls -la ../../.claude/agents/your-agent.md

# 2. Validate config
./launch-squads.sh --dry-run your-config.json

# 3. Check logs
tail -f logs/session-*/orchestrator.log
```

### Tasks Waiting Forever

```bash
# Check which events are published
ls -la state/session-ID/events/

# Check squad state
cat state/session-ID/squad-name.json | jq '.progress'

# View logs for waiting message
grep "waiting for" logs/session-ID/*.log
```

### Clean Restart

```bash
# Stop everything
./stop-squads.sh --force

# Clean state (careful!)
rm -rf state/session-*
rm -rf logs/session-*

# Start fresh
./launch-squads.sh your-config.json
```

## Next Steps

1. **Read Full Documentation**: See [README.md](README.md)
2. **Study Examples**: Check `examples/` directory
3. **Customize Agents**: Edit agents in `../../.claude/agents/`
4. **Build Complex Workflows**: Combine multiple squads
5. **Integrate with CI/CD**: See README.md for GitHub Actions example

## Getting Help

- **Full Documentation**: [README.md](README.md)
- **Example Workflow**: [examples/simple-workflow.json](examples/simple-workflow.json)
- **Advanced Example**: [squad-definitions.example.json](squad-definitions.example.json)

## Tips for Success

1. **Start Simple**: Use 1-2 squads first
2. **Test Prompts**: Validate prompts work before automating
3. **Monitor Actively**: Use `--watch` mode during first runs
4. **Check Permissions**: Ensure agents have required paths
5. **Use Dry Run**: Always validate with `--dry-run` first
6. **Read Logs**: Logs are your friend when debugging

---

Happy Orchestrating! 🚀
