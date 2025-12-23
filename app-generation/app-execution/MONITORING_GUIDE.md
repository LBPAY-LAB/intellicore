# SuperCore v2.0 - Monitoring System Guide

Complete guide for the real-time monitoring system for squad orchestration.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Components](#components)
4. [Web Dashboard](#web-dashboard)
5. [CLI Monitor](#cli-monitor)
6. [Notifications](#notifications)
7. [API Reference](#api-reference)
8. [Metrics & Analytics](#metrics--analytics)
9. [Configuration](#configuration)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The SuperCore v2.0 monitoring system provides comprehensive real-time visibility into squad execution with:

- **Web Dashboard**: Interactive React-based UI with live updates
- **CLI Monitor**: Terminal-based dashboard with auto-refresh
- **REST API**: Full REST API for programmatic access
- **WebSocket**: Real-time updates via WebSocket
- **Notifications**: Slack, Desktop, Email notifications
- **Metrics**: Time-series metrics and analytics
- **SQLite Database**: Persistent storage for all data

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Squad Orchestrator                      │
│                   (state/ directory)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  Monitoring Backend                         │
│  - FastAPI Server (Port 3000)                               │
│  - WebSocket Server                                         │
│  - SQLite Database                                          │
│  - Data Collector (5s intervals)                            │
└───┬─────────────┬─────────────┬─────────────┬──────────────┘
    │             │             │             │
    ▼             ▼             ▼             ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐
│  Web   │  │   CLI    │  │  API     │  │ Notifi-   │
│Dashboard│  │ Monitor  │  │ Clients  │  │ cations   │
└────────┘  └──────────┘  └──────────┘  └───────────┘
```

---

## Quick Start

### 1. Start the Monitoring System

```bash
# From squad-orchestrator directory
./start-monitoring.sh
```

This will:
- Install Python dependencies
- Install frontend dependencies (if Node.js available)
- Start backend API server (port 3000)
- Start metrics collector
- Start frontend dev server (port 3001, if available)

### 2. Access Dashboards

**Web Dashboard:**
```
http://localhost:3001
```

**API Documentation:**
```
http://localhost:3000/docs
```

**CLI Monitor:**
```bash
./monitoring/cli/monitor-cli.sh watch
```

### 3. Stop the System

```bash
./stop-monitoring.sh
```

---

## Components

### Backend Server

**Location**: `monitoring/backend/server.py`

FastAPI-based server providing:
- REST API endpoints
- WebSocket server for real-time updates
- SQLite database management
- Data collection from state files

**Start manually:**
```bash
cd monitoring/backend
source venv/bin/activate
python3 server.py
```

**Endpoints:**
- `GET /api/status` - Overall system status
- `GET /api/squads` - All squads
- `GET /api/cards` - All cards
- `GET /api/events` - Event log
- `GET /api/metrics` - Current metrics
- `WS /ws` - WebSocket connection
- `GET /health` - Health check

### Metrics Collector

**Location**: `monitoring/backend/metrics-collector.py`

Collects time-series metrics every 60 seconds.

**Commands:**
```bash
# Collect once
python3 metrics-collector.py collect --session SESSION_ID

# Generate report
python3 metrics-collector.py report --session SESSION_ID

# Watch mode (continuous)
python3 metrics-collector.py watch --session SESSION_ID --interval 60
```

### Frontend Dashboard

**Location**: `monitoring/frontend/`

React + Vite + TailwindCSS dashboard.

**Development:**
```bash
cd monitoring/frontend
npm install
npm run dev
```

**Build for production:**
```bash
npm run build
npm run preview
```

---

## Web Dashboard

### Features

#### Squad Cards
- Real-time status updates
- Progress bars
- Current card display
- Blocked card warnings
- Health indicators

#### Overview Bar
- Overall progress
- Velocity metrics
- QA rejection rate
- Test coverage
- Cards completed today

#### Events Feed
- Live event stream
- Filterable by squad/card
- Timestamped entries
- Color-coded by severity

#### Metrics Panel
- Current metrics summary
- Historical trends
- Quality score
- Health status

### Screenshots

#### Main Dashboard
```
┌─────────────────────────────────────────────────────────────┐
│  SuperCore v2.0         Session: session_123    🟢 LIVE    │
├─────────────────────────────────────────────────────────────┤
│  Overall Progress: ██████████████░░░░░░ 65%                │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ 📋 Product   │  │ 🏗️ Arch      │  │ ⚙️ Backend   │     │
│  │ Running ▶️   │  │ Running ▶️   │  │ Running ▶️   │     │
│  │ 5/8 cards    │  │ 3/4 cards    │  │ 10/15 cards  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  Recent Events:                     Metrics:                │
│  ✅ CARD-007 completed               Velocity: 8.5 pts/day  │
│  🔄 CARD-013 in progress             Coverage: 87%          │
│  ❌ CARD-011 rejected                QA Rejection: 12%      │
└─────────────────────────────────────────────────────────────┘
```

---

## CLI Monitor

**Location**: `monitoring/cli/monitor-cli.sh`

Terminal-based dashboard with rich formatting.

### Commands

```bash
# Show overview once
./monitor-cli.sh

# Watch mode (auto-refresh every 5s)
./monitor-cli.sh watch

# Custom refresh interval
./monitor-cli.sh watch --refresh 2

# Filter by squad
./monitor-cli.sh --squad backend watch

# Show events
./monitor-cli.sh events 50

# Show metrics
./monitor-cli.sh metrics

# List squads
./monitor-cli.sh squads
```

### Example Output

```
╔════════════════════════════════════════════════════════════════╗
║  SuperCore v2.0 - Squad Monitoring Dashboard                   ║
╚════════════════════════════════════════════════════════════════╝
Refresh: 5s | API: http://localhost:3000

━━━ Session Overview ━━━
Session ID: session_1734753628
Uptime:     02:45:32
Progress:   [████████████░░░░░░░░░░░░] 45%

━━━ Squads Status ━━━
SQUAD                     STATUS       PROGRESS        CURRENT
────────────────────────────────────────────────────────────────
product                   ▶️ running   5/8             CARD-008
architecture              ▶️ running   3/4             CARD-012
backend                   ▶️ running   10/15           CARD-023
  ⚠ 2 blocked cards
frontend                  ⏸️ waiting   0/10            N/A
qa                        ⏸️ waiting   0/5             N/A

━━━ Metrics ━━━
  📈 Velocity:              8.5 pts/day
  ❌ QA Rejection Rate:     12.0%
  🧪 Test Coverage:         87%
  ✅ Completed Today:       12 cards
  👥 Active Squads:         3
```

### Keyboard Shortcuts

- `Ctrl+C` - Exit

---

## Notifications

**Location**: `monitoring/notifications/notify.sh`

Multi-channel notification system.

### Supported Channels

1. **Slack** - Team notifications via webhook
2. **Desktop** - macOS/Linux desktop notifications
3. **Email** - Email alerts (requires mail setup)

### Configuration

Edit `monitoring/config/monitoring-config.json`:

```json
{
  "notifications": {
    "slack": {
      "enabled": true,
      "webhook_url": "${SLACK_WEBHOOK_URL}",
      "events": ["card_done", "squad_blocked", "qa_rejected"]
    },
    "desktop": {
      "enabled": true,
      "events": ["card_blocked", "squad_blocked"]
    },
    "email": {
      "enabled": false,
      "to_addresses": ["team@example.com"]
    }
  }
}
```

### Environment Variables

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
export SLACK_ENABLED="true"
export DESKTOP_ENABLED="true"
```

### Event Types

- `card_done` - Card completed
- `card_blocked` - Card blocked
- `qa_rejected` - QA rejected card
- `squad_blocked` - Squad blocked (critical)
- `sprint_complete` - Sprint completed
- `error` - System error

### Commands

```bash
# Watch for events and send notifications
./notify.sh watch

# Send test notification
./notify.sh test slack
./notify.sh test desktop
./notify.sh test all

# Manual notifications
./notify.sh card-done CARD-001 squad-backend
./notify.sh card-blocked CARD-002 squad-backend "Missing dependencies"
./notify.sh qa-rejected CARD-003 squad-backend "Low test coverage"
./notify.sh squad-blocked squad-backend "Waiting for API spec"

# Custom notification
./notify.sh custom "Deploy Complete" "Production deployed successfully" "success"
```

### Slack Webhook Setup

1. Go to https://api.slack.com/apps
2. Create new app → Incoming Webhooks
3. Add webhook to workspace
4. Copy webhook URL
5. Set environment variable:
   ```bash
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
   ```

### Example Slack Notification

```
SuperCore v2.0

Squad Blocked 🚨
Squad: squad-backend
Reason: Waiting for architecture decisions
⚠️ Immediate Attention Required
```

---

## API Reference

Base URL: `http://localhost:3000`

### Endpoints

#### GET /api/status

Get overall system status.

**Response:**
```json
{
  "session_id": "session_1734753628",
  "started_at": "2024-12-21T10:00:00Z",
  "uptime_seconds": 9932,
  "overall_progress": 45.5,
  "squads": [...],
  "metrics": {...},
  "recent_events": [...]
}
```

#### GET /api/squads

List all squads.

**Response:**
```json
[
  {
    "squad_id": "squad-backend",
    "status": "running",
    "current_card": "CARD-023",
    "cards_total": 15,
    "cards_done": 10,
    "cards_in_progress": 2,
    "cards_blocked": 2,
    "agent_current": "backend-lead",
    "last_update": "2024-12-21T12:30:00Z",
    "health": "healthy",
    "uptime_seconds": 9932
  }
]
```

#### GET /api/squads/:id

Get specific squad details.

**Example:**
```bash
curl http://localhost:3000/api/squads/squad-backend
```

#### GET /api/cards

List all cards with optional filters.

**Query Parameters:**
- `status` - Filter by status (todo, in_progress, blocked, done)
- `squad` - Filter by squad ID

**Example:**
```bash
curl "http://localhost:3000/api/cards?status=in_progress&squad=squad-backend"
```

#### GET /api/cards/:id

Get specific card details.

#### GET /api/events

Get event log.

**Query Parameters:**
- `limit` - Number of events (default: 100)
- `squad` - Filter by squad

**Example:**
```bash
curl "http://localhost:3000/api/events?limit=50&squad=squad-backend"
```

#### GET /api/metrics

Get current metrics summary.

**Response:**
```json
{
  "velocity_per_day": 8.5,
  "qa_rejection_rate": 12.0,
  "average_coverage": 87.0,
  "cards_completed_today": 12,
  "active_squads": 3,
  "total_events": 342
}
```

#### GET /api/logs/:squad_id

Get squad logs.

**Query Parameters:**
- `lines` - Number of lines (default: 100)

#### WebSocket /ws

Real-time updates via WebSocket.

**Connect:**
```javascript
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

**Message Format:**
```json
{
  "type": "update",
  "timestamp": "2024-12-21T12:30:00Z",
  "data": {
    "squads": [...],
    "cards": [...],
    "metrics": {...}
  }
}
```

#### GET /api/stream

Server-Sent Events (SSE) stream.

**Example:**
```bash
curl -N http://localhost:3000/api/stream
```

---

## Metrics & Analytics

### Collected Metrics

1. **Velocity** - Cards completed per day
2. **QA Rejection Rate** - Percentage of cards rejected by QA
3. **Test Coverage** - Average test coverage across cards
4. **Cards by Status** - Distribution (todo, in_progress, blocked, done)
5. **Squad Health** - Health status per squad
6. **Active Squads** - Number of running squads
7. **Cards Completed Today** - Daily completion count
8. **Average QA Cycles** - Average number of QA iterations
9. **Blocked Cards** - Number of currently blocked cards

### Time-Series Storage

Metrics are collected every 60 seconds and stored in SQLite for historical analysis.

### Generate Report

```bash
cd monitoring/backend
source venv/bin/activate

# Generate JSON report
python3 metrics-collector.py report --session SESSION_ID

# Save to file
python3 metrics-collector.py report --session SESSION_ID --output report.json
```

**Report Structure:**
```json
{
  "generated_at": "2024-12-21T12:30:00Z",
  "session_id": "session_123",
  "current_metrics": {...},
  "trends": {
    "velocity_24h": [...],
    "coverage_24h": [...]
  },
  "summary": {
    "total_cards": 42,
    "completion_rate": 65.0,
    "quality_score": 85.0,
    "health_status": "healthy"
  }
}
```

### Quality Score

Calculated based on:
- Test Coverage (0-40 points)
- QA Rejection Rate (0-40 points)
- Blocked Cards (0-20 points)

Range: 0-100 (higher is better)

---

## Configuration

**File**: `monitoring/config/monitoring-config.json`

### Dashboard Settings

```json
{
  "dashboard": {
    "enabled": true,
    "port": 3000,
    "auto_refresh_seconds": 5
  }
}
```

### Notification Settings

See [Notifications](#notifications) section.

### Metrics Settings

```json
{
  "metrics": {
    "collection_enabled": true,
    "collection_interval_seconds": 60,
    "retention_days": 90
  }
}
```

### Database Settings

```json
{
  "database": {
    "type": "sqlite",
    "path": "monitoring/data/monitoring.db",
    "backup_enabled": true
  }
}
```

---

## Troubleshooting

### Backend Server Won't Start

**Check if port 3000 is in use:**
```bash
lsof -i :3000
```

**Kill existing process:**
```bash
kill $(lsof -t -i:3000)
```

**Check logs:**
```bash
tail -f monitoring/data/backend.log
```

### WebSocket Not Connecting

1. Ensure backend is running
2. Check browser console for errors
3. Verify firewall settings
4. Try restarting backend

### CLI Monitor Shows No Data

1. **Install jq:**
   ```bash
   brew install jq  # macOS
   apt install jq   # Linux
   ```

2. **Check API connection:**
   ```bash
   curl http://localhost:3000/api/status
   ```

3. **Verify backend is running:**
   ```bash
   curl http://localhost:3000/health
   ```

### Notifications Not Sending

**Slack:**
- Verify `SLACK_WEBHOOK_URL` is set
- Test webhook manually:
  ```bash
  curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Test"}' \
    $SLACK_WEBHOOK_URL
  ```

**Desktop:**
- macOS: Ensure notification permissions granted
- Linux: Install `notify-send`

### Database Locked Error

SQLite database is locked by another process.

**Solution:**
```bash
# Stop all monitoring processes
./stop-monitoring.sh

# Remove lock
rm monitoring/data/monitoring.db-wal
rm monitoring/data/monitoring.db-shm

# Restart
./start-monitoring.sh
```

### Frontend Build Fails

```bash
cd monitoring/frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Advanced Usage

### Custom API Client

**Python:**
```python
import requests

API_URL = "http://localhost:3000"

# Get status
response = requests.get(f"{API_URL}/api/status")
data = response.json()

print(f"Session: {data['session_id']}")
print(f"Progress: {data['overall_progress']}%")

# Get squads
squads = requests.get(f"{API_URL}/api/squads").json()
for squad in squads:
    print(f"{squad['squad_id']}: {squad['status']}")
```

**JavaScript:**
```javascript
const API_URL = 'http://localhost:3000';

async function getStatus() {
  const response = await fetch(`${API_URL}/api/status`);
  const data = await response.json();

  console.log(`Session: ${data.session_id}`);
  console.log(`Progress: ${data.overall_progress}%`);
}
```

### Continuous Integration

Monitor in CI/CD pipeline:

```bash
#!/bin/bash
# ci-monitor.sh

# Start monitoring
./start-monitoring.sh

# Run squads
./launch-squads.sh meta-squad-config.json

# Poll status until complete
while true; do
  STATUS=$(curl -s http://localhost:3000/api/status | jq -r '.overall_progress')

  if (( $(echo "$STATUS >= 100" | bc -l) )); then
    echo "✓ All squads completed!"
    break
  fi

  echo "Progress: $STATUS%"
  sleep 30
done

# Generate report
cd monitoring/backend
source venv/bin/activate
python3 metrics-collector.py report --session "$(curl -s http://localhost:3000/api/status | jq -r '.session_id')" --output ci-report.json

# Stop monitoring
./stop-monitoring.sh
```

---

## Support

For issues or questions:
1. Check logs in `monitoring/data/`
2. Review API docs at `http://localhost:3000/docs`
3. Consult troubleshooting section above
4. Review configuration in `monitoring/config/monitoring-config.json`

---

## License

SuperCore v2.0 - Internal Tool
