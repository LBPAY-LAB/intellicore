#!/bin/bash

###############################################################################
# SuperCore v2.0 - Stop Monitoring System
# Stops all monitoring components gracefully
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="$SCRIPT_DIR/monitoring/data"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ${RESET} $1"
}

log_success() {
    echo -e "${GREEN}✓${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${RESET} $1"
}

stop_service() {
    local service_name="$1"
    local pid_file="$DATA_DIR/${service_name}.pid"

    if [[ ! -f "$pid_file" ]]; then
        log_warning "$service_name not running (no PID file)"
        return
    fi

    local pid=$(cat "$pid_file")

    if kill -0 "$pid" 2>/dev/null; then
        log_info "Stopping $service_name (PID: $pid)..."
        kill "$pid" 2>/dev/null || true

        # Wait for graceful shutdown
        local waited=0
        while kill -0 "$pid" 2>/dev/null && [[ $waited -lt 10 ]]; do
            sleep 1
            ((waited++))
        done

        # Force kill if still running
        if kill -0 "$pid" 2>/dev/null; then
            log_warning "Force killing $service_name..."
            kill -9 "$pid" 2>/dev/null || true
        fi

        log_success "$service_name stopped"
    else
        log_warning "$service_name not running (stale PID)"
    fi

    rm -f "$pid_file"
}

main() {
    echo ""
    log_info "Stopping SuperCore v2.0 Monitoring System..."
    echo ""

    stop_service "backend"
    stop_service "frontend"
    stop_service "metrics"

    # Also kill any stray processes
    pkill -f "monitoring/backend/server.py" 2>/dev/null || true
    pkill -f "metrics-collector.py" 2>/dev/null || true

    echo ""
    log_success "All monitoring services stopped"
    echo ""
}

main
