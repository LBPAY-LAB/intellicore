#!/bin/bash
set -e

# Start Celery Worker for Squad Orchestrator
# This script ensures Celery worker is running before orchestrator starts

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

CELERY_LOG="/tmp/celery_worker.log"
CELERY_PID="/tmp/celery_worker.pid"

# Check if worker is already running
if [ -f "$CELERY_PID" ]; then
    PID=$(cat "$CELERY_PID")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "✅ Celery worker already running (PID: $PID)"
        exit 0
    else
        # Stale PID file, remove it
        rm -f "$CELERY_PID"
    fi
fi

# Start Celery worker in background
echo "🚀 Starting Celery worker..."
nohup python3 -m celery -A tasks worker --loglevel=info > "$CELERY_LOG" 2>&1 &
WORKER_PID=$!

# Save PID
echo "$WORKER_PID" > "$CELERY_PID"

# Wait for worker to be ready
sleep 3

# Verify worker is running
if ps -p "$WORKER_PID" > /dev/null 2>&1; then
    echo "✅ Celery worker started successfully (PID: $WORKER_PID)"
    echo "📋 Log: $CELERY_LOG"
else
    echo "❌ Failed to start Celery worker"
    echo "📋 Check log: $CELERY_LOG"
    exit 1
fi
