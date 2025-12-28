# SuperCore v2.0 - Monitoring System

Real-time monitoring dashboard for squad orchestration.

## Quick Start

```bash
# Start monitoring system
./start-monitoring.sh

# Access dashboards
# Web: http://localhost:3001
# API: http://localhost:3000/docs

# CLI monitor
./monitoring/cli/monitor-cli.sh watch

# Stop system
./stop-monitoring.sh
```

## Components

### 1. Backend Server (FastAPI)
- REST API on port 3000
- WebSocket server
- SQLite database
- Data collection

**Files:**
- `backend/server.py` - Main server
- `backend/metrics-collector.py` - Metrics collector
- `backend/requirements.txt` - Dependencies

### 2. Web Dashboard (React)
- Interactive UI on port 3001
- Real-time updates via WebSocket
- Responsive design

**Files:**
- `frontend/src/` - React components
- `frontend/package.json` - Dependencies

### 3. CLI Monitor (Bash)
- Terminal dashboard
- Auto-refresh mode
- Color-coded output

**Files:**
- `cli/monitor-cli.sh` - CLI monitor

### 4. Notifications
- Slack webhooks
- Desktop notifications
- Email alerts

**Files:**
- `notifications/notify.sh` - Notification system

### 5. Configuration
- Central configuration file
- Environment variables

**Files:**
- `config/monitoring-config.json` - Main config

## Directory Structure

```
monitoring/
├── backend/
│   ├── server.py              # FastAPI server
│   ├── metrics-collector.py   # Metrics collection
│   ├── requirements.txt       # Python deps
│   └── venv/                  # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Main app
│   │   ├── components/        # UI components
│   │   ├── hooks/             # React hooks
│   │   └── utils/             # Utilities
│   ├── package.json
│   └── node_modules/
├── cli/
│   └── monitor-cli.sh         # CLI monitor
├── notifications/
│   └── notify.sh              # Notification system
├── config/
│   └── monitoring-config.json # Configuration
├── data/
│   ├── monitoring.db          # SQLite database
│   ├── backend.log            # Backend logs
│   ├── frontend.log           # Frontend logs
│   └── metrics.log            # Metrics logs
└── README.md                  # This file
```

## Usage Examples

### CLI Monitor

```bash
# Show overview
./monitoring/cli/monitor-cli.sh

# Watch mode (auto-refresh)
./monitoring/cli/monitor-cli.sh watch

# Custom refresh interval
./monitoring/cli/monitor-cli.sh watch --refresh 2

# Filter by squad
./monitoring/cli/monitor-cli.sh --squad backend watch

# Show events
./monitoring/cli/monitor-cli.sh events 100

# Show metrics
./monitoring/cli/monitor-cli.sh metrics
```

### API Queries

```bash
# Get status
curl http://localhost:3000/api/status | jq

# Get squads
curl http://localhost:3000/api/squads | jq

# Get events
curl http://localhost:3000/api/events?limit=20 | jq

# Get metrics
curl http://localhost:3000/api/metrics | jq

# Stream events (SSE)
curl -N http://localhost:3000/api/stream
```

### Notifications

```bash
# Test notifications
./monitoring/notifications/notify.sh test slack
./monitoring/notifications/notify.sh test desktop

# Watch for events
./monitoring/notifications/notify.sh watch

# Manual notifications
./monitoring/notifications/notify.sh card-done CARD-001 squad-backend
./monitoring/notifications/notify.sh squad-blocked squad-backend "Waiting for API"
```

### Metrics

```bash
cd monitoring/backend
source venv/bin/activate

# Collect once
python3 metrics-collector.py collect --session SESSION_ID

# Watch mode
python3 metrics-collector.py watch --session SESSION_ID

# Generate report
python3 metrics-collector.py report --session SESSION_ID --output report.json
```

## Configuration

Edit `config/monitoring-config.json`:

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
    },
    "desktop": {
      "enabled": true
    }
  },
  "metrics": {
    "collection_interval_seconds": 60,
    "retention_days": 90
  }
}
```

### Environment Variables

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
export SLACK_ENABLED="true"
export DESKTOP_ENABLED="true"
```

## API Endpoints

- `GET /api/status` - Overall status
- `GET /api/squads` - All squads
- `GET /api/squads/:id` - Squad details
- `GET /api/cards` - All cards
- `GET /api/cards/:id` - Card details
- `GET /api/events` - Event log
- `GET /api/metrics` - Current metrics
- `GET /api/logs/:squad` - Squad logs
- `WS /ws` - WebSocket connection
- `GET /api/stream` - SSE stream
- `GET /health` - Health check

Full API docs: http://localhost:3000/docs

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
kill $(lsof -t -i:3000)

# Or use different port
MONITOR_PORT=3001 ./start-monitoring.sh
```

### No Data Showing

```bash
# Check backend is running
curl http://localhost:3000/health

# Check logs
tail -f monitoring/data/backend.log

# Restart system
./stop-monitoring.sh
./start-monitoring.sh
```

### Install jq for Better CLI

```bash
# macOS
brew install jq

# Linux
apt install jq
```

## Features

### Dashboard
- Real-time squad status
- Progress tracking
- Event feed
- Metrics panel
- WebSocket updates

### CLI Monitor
- Auto-refresh mode
- Color-coded output
- Progress bars
- Event filtering
- Multiple views

### Notifications
- Slack integration
- Desktop alerts
- Email support
- Custom events
- Rate limiting

### Metrics
- Velocity tracking
- QA rejection rate
- Test coverage
- Time-series data
- Historical reports

## Performance

- Updates every 5 seconds
- WebSocket push updates
- Efficient SQLite queries
- Cached responses
- Low resource usage

## Security

- CORS enabled for local development
- Rate limiting (60 req/min)
- No authentication (internal tool)
- SQLite database (local only)

## Requirements

### Backend
- Python 3.8+
- pip
- Virtual environment

### Frontend (Optional)
- Node.js 18+
- npm

### CLI
- Bash 4+
- curl
- jq (recommended)

## Documentation

See [MONITORING_GUIDE.md](../MONITORING_GUIDE.md) for complete documentation.

## Support

Check logs in `monitoring/data/` for debugging.
