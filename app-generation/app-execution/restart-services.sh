#!/bin/bash
# Restart Squad Orchestrator services or specific service

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SERVICE=$1

if [ -z "$SERVICE" ]; then
    # Restart all services
    echo "🔄 Restarting all Squad Orchestrator services..."
    /Users/jose.silva.lb/Library/Python/3.9/bin/supervisorctl -c supervisord.conf restart all
else
    # Restart specific service
    echo "🔄 Restarting service: $SERVICE"
    /Users/jose.silva.lb/Library/Python/3.9/bin/supervisorctl -c supervisord.conf restart "$SERVICE"
fi

echo ""
echo "✅ Restart complete!"
echo ""
echo "Check status:"
echo "  ./status-services.sh"
