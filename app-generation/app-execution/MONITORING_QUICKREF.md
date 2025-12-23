# SuperCore v2.0 - Monitoring Quick Reference

One-page reference for common monitoring tasks.

## Quick Start (30 seconds)

```bash
# 1. Start monitoring
./start-monitoring.sh

# 2. Access dashboards
# Web: http://localhost:3001
# API: http://localhost:3000/docs

# 3. CLI monitor
./monitoring/cli/monitor-cli.sh watch
```

---

## Essential Commands

### Start/Stop
```bash
./start-monitoring.sh           # Start all services
./stop-monitoring.sh            # Stop all services
```

### Web Dashboard
```bash
open http://localhost:3001      # Web UI
open http://localhost:3000/docs # API docs
```

### CLI Monitor
```bash
./monitoring/cli/monitor-cli.sh                    # Overview once
./monitoring/cli/monitor-cli.sh watch              # Watch mode
./monitoring/cli/monitor-cli.sh watch --refresh 2  # 2s refresh
./monitoring/cli/monitor-cli.sh --squad backend watch  # Filter squad
./monitoring/cli/monitor-cli.sh events 100         # Show events
./monitoring/cli/monitor-cli.sh metrics            # Show metrics
```

### API Queries
```bash
curl http://localhost:3000/api/status | jq              # Status
curl http://localhost:3000/api/squads | jq              # Squads
curl http://localhost:3000/api/cards | jq               # Cards
curl http://localhost:3000/api/events?limit=20 | jq     # Events
curl http://localhost:3000/api/metrics | jq             # Metrics
curl -N http://localhost:3000/api/stream                # SSE stream
```

### Notifications
```bash
# Setup Slack
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."

# Test
./monitoring/notifications/notify.sh test slack
./monitoring/notifications/notify.sh test desktop

# Watch mode
./monitoring/notifications/notify.sh watch

# Manual
./monitoring/notifications/notify.sh card-done CARD-001 squad-backend
./monitoring/notifications/notify.sh squad-blocked squad-backend "Reason"
```

### Metrics
```bash
cd monitoring/backend && source venv/bin/activate

# Collect once
python3 metrics-collector.py collect --session SESSION_ID

# Watch mode
python3 metrics-collector.py watch --session SESSION_ID

# Generate report
python3 metrics-collector.py report --session SESSION_ID --output report.json
```

---

## Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000 |
| API Docs | 3000 | http://localhost:3000/docs |
| WebSocket | 3000 | ws://localhost:3000/ws |
| Frontend | 3001 | http://localhost:3001 |

---

## API Endpoints

```
GET  /api/status           - Overall status
GET  /api/squads           - All squads
GET  /api/squads/:id       - Squad details
GET  /api/cards            - All cards (filterable)
GET  /api/cards/:id        - Card details
GET  /api/events           - Event log
GET  /api/metrics          - Metrics summary
GET  /api/logs/:squad      - Squad logs
WS   /ws                   - WebSocket
GET  /api/stream           - SSE stream
GET  /health               - Health check
```

---

## File Locations

```
monitoring/
├── backend/server.py              # API server
├── backend/metrics-collector.py   # Metrics
├── frontend/                      # Web UI
├── cli/monitor-cli.sh             # CLI
├── notifications/notify.sh        # Notifications
├── config/monitoring-config.json  # Config
└── data/                          # Runtime data
    ├── monitoring.db              # Database
    ├── backend.log                # Logs
    └── *.pid                      # Process IDs
```

---

## Troubleshooting

```bash
# Port in use
kill $(lsof -t -i:3000)

# Check logs
tail -f monitoring/data/backend.log
tail -f monitoring/data/metrics.log

# Restart
./stop-monitoring.sh && ./start-monitoring.sh

# Install jq
brew install jq  # macOS
apt install jq   # Linux

# Check backend
curl http://localhost:3000/health
```

---

## Configuration

Edit: `monitoring/config/monitoring-config.json`

```json
{
  "dashboard": {
    "port": 3000,
    "auto_refresh_seconds": 5
  },
  "notifications": {
    "slack": {
      "enabled": true,
      "webhook_url": "${SLACK_WEBHOOK_URL}"
    }
  },
  "metrics": {
    "collection_interval_seconds": 60
  }
}
```

---

## Environment Variables

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."
export SLACK_ENABLED="true"
export DESKTOP_ENABLED="true"
export MONITOR_API_URL="http://localhost:3000"
```

---

## Common Workflows

### Monitor Squads During Development
```bash
# Terminal 1: Start monitoring
./start-monitoring.sh

# Terminal 2: Launch squads
./launch-squads.sh meta-squad-config.json

# Terminal 3: Watch
./monitoring/cli/monitor-cli.sh watch
```

### Get Metrics Report
```bash
cd monitoring/backend
source venv/bin/activate
SESSION_ID=$(curl -s http://localhost:3000/api/status | jq -r '.session_id')
python3 metrics-collector.py report --session "$SESSION_ID" --output report.json
cat report.json | jq
```

### Test Notifications
```bash
export SLACK_WEBHOOK_URL="your-webhook"
./monitoring/notifications/notify.sh test all
```

### Watch Specific Squad
```bash
./monitoring/cli/monitor-cli.sh --squad backend watch --refresh 2
```

---

## WebSocket Example

```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

---

## Documentation

- **MONITORING_GUIDE.md** - Complete guide
- **MONITORING_SUMMARY.md** - System overview
- **monitoring/README.md** - Component docs
- **http://localhost:3000/docs** - API docs

---

## Demo

```bash
./monitoring/examples/demo-usage.sh
```

---

## Support

Check logs in `monitoring/data/` for debugging.

All commands assume you're in `squad-orchestrator/` directory.
