#!/bin/bash
# Start all Squad Orchestrator services via Supervisord

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  SuperCore v2.0 - Squad Orchestrator Services                  ║"
echo "║  Starting all services via Supervisord                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Create logs directory if it doesn't exist
mkdir -p logs

# Check if supervisord is already running
if [ -f "/tmp/supervisord-squad-orchestrator.pid" ]; then
    PID=$(cat /tmp/supervisord-squad-orchestrator.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "⚠️  Supervisord is already running (PID: $PID)"
        echo ""
        echo "To restart services:"
        echo "  ./stop-services.sh"
        echo "  ./start-services.sh"
        echo ""
        echo "To check status:"
        echo "  ./status-services.sh"
        exit 1
    else
        echo "🧹 Cleaning up stale PID file..."
        rm -f /tmp/supervisord-squad-orchestrator.pid
        rm -f /tmp/supervisor-squad-orchestrator.sock
    fi
fi

# Start supervisord
echo "🚀 Starting Supervisord..."
/Users/jose.silva.lb/Library/Python/3.9/bin/supervisord -c supervisord.conf

# Wait for supervisord to initialize
sleep 2

# Check status
echo ""
echo "📊 Service Status:"
/Users/jose.silva.lb/Library/Python/3.9/bin/supervisorctl -c supervisord.conf status

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📊 Portal URLs:"
echo "   - Backend API: http://localhost:3000"
echo "   - API Docs: http://localhost:3000/docs"
echo "   - Health Check: http://localhost:3000/health"
echo ""
echo "🔧 Management Commands:"
echo "   - Status: ./status-services.sh"
echo "   - Stop: ./stop-services.sh"
echo "   - Restart: ./restart-services.sh"
echo "   - Logs: ./logs-services.sh [service-name]"
echo ""
echo "📝 Available services:"
echo "   - redis"
echo "   - celery-worker-cards"
echo "   - celery-worker-maintenance"
echo "   - portal-backend"
echo "   - portal-frontend (manual start)"
echo "   - celery-beat (manual start)"
echo ""
