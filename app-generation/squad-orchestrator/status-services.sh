#!/bin/bash
# Check status of all Squad Orchestrator services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SuperCore v2.0 - Squad Orchestrator Services Status           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if supervisord is running
if [ ! -f "/tmp/supervisord-squad-orchestrator.pid" ]; then
    echo "❌ Supervisord is NOT running"
    echo ""
    echo "To start services:"
    echo "  ./start-services.sh"
    exit 1
fi

PID=$(cat /tmp/supervisord-squad-orchestrator.pid)
if ! ps -p $PID > /dev/null 2>&1; then
    echo "❌ Supervisord PID file exists but process is not running"
    echo "   Cleaning up stale PID..."
    rm -f /tmp/supervisord-squad-orchestrator.pid
    rm -f /tmp/supervisor-squad-orchestrator.sock
    echo ""
    echo "To start services:"
    echo "  ./start-services.sh"
    exit 1
fi

echo "✅ Supervisord is running (PID: $PID)"
echo ""

# Show service status
/Users/jose.silva.lb/Library/Python/3.9/bin/supervisorctl -c supervisord.conf status

echo ""
echo "🔍 Quick Health Checks:"
echo ""

# Redis
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: RUNNING (port 6379)"
else
    echo "❌ Redis: NOT RESPONDING"
fi

# Backend API
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Backend API: RUNNING (port 3000)"

    # Get detailed health
    HEALTH=$(curl -s http://localhost:3000/health | python3 -c "import sys, json; data=json.load(sys.stdin); print(f\"   Mode: {data.get('execution_mode', 'unknown')}, Workers: {data.get('celery_workers', 0)}\")" 2>/dev/null || echo "   (unable to parse health)")
    echo "$HEALTH"
else
    echo "❌ Backend API: NOT RESPONDING"
fi

# Celery workers
WORKER_COUNT=$(celery -A celery_app inspect active 2>/dev/null | grep -c "celery@" || echo "0")
if [ "$WORKER_COUNT" -gt "0" ]; then
    echo "✅ Celery Workers: $WORKER_COUNT active"
else
    echo "⚠️  Celery Workers: none detected"
fi

echo ""
echo "📊 Full health check: curl http://localhost:3000/health | python3 -m json.tool"
echo "📝 View logs: ./logs-services.sh [service-name]"
