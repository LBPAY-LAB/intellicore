#!/bin/bash
# Stop all Squad Orchestrator services

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🛑 Stopping Squad Orchestrator services..."
echo ""

# Check if supervisord is running
if [ ! -f "/tmp/supervisord-squad-orchestrator.pid" ]; then
    echo "⚠️  Supervisord is not running"
    exit 0
fi

# Stop all services
/Users/jose.silva.lb/Library/Python/3.9/bin/supervisorctl -c supervisord.conf stop all

# Shutdown supervisord
/Users/jose.silva.lb/Library/Python/3.9/bin/supervisorctl -c supervisord.conf shutdown

# Wait for graceful shutdown
sleep 2

# Clean up PID files
rm -f /tmp/supervisord-squad-orchestrator.pid
rm -f /tmp/supervisor-squad-orchestrator.sock

echo ""
echo "✅ All services stopped successfully!"
