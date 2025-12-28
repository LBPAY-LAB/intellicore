#!/bin/bash
# View logs for Squad Orchestrator services

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Usage: ./logs-services.sh <service-name> [lines]"
    echo ""
    echo "Available services:"
    echo "  - redis"
    echo "  - celery-worker-cards"
    echo "  - celery-worker-maintenance"
    echo "  - portal-backend"
    echo "  - portal-frontend"
    echo "  - celery-beat"
    echo "  - supervisord"
    echo ""
    echo "Examples:"
    echo "  ./logs-services.sh celery-worker-cards"
    echo "  ./logs-services.sh portal-backend 100"
    echo "  ./logs-services.sh supervisord"
    exit 1
fi

LINES=${2:-50}

if [ "$SERVICE" == "supervisord" ]; then
    LOG_FILE="logs/supervisord.log"
else
    LOG_FILE="logs/${SERVICE}.log"
fi

if [ ! -f "$LOG_FILE" ]; then
    echo "❌ Log file not found: $LOG_FILE"
    echo ""
    echo "Available log files:"
    ls -1 logs/*.log 2>/dev/null || echo "  (no log files found)"
    exit 1
fi

echo "📝 Showing last $LINES lines of $SERVICE logs:"
echo "   File: $LOG_FILE"
echo ""
echo "──────────────────────────────────────────────────────────────────"
tail -n "$LINES" "$LOG_FILE"
echo "──────────────────────────────────────────────────────────────────"
echo ""
echo "To follow logs in real-time:"
echo "  tail -f $LOG_FILE"
