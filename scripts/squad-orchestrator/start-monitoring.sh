#!/bin/bash

###############################################################################
# SuperCore v2.0 - Start Monitoring System
# Launches all monitoring components
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MONITORING_DIR="$SCRIPT_DIR/monitoring"
BACKEND_DIR="$MONITORING_DIR/backend"
FRONTEND_DIR="$MONITORING_DIR/frontend"
DATA_DIR="$MONITORING_DIR/data"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'
BOLD='\033[1m'

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ${RESET} $1"
}

log_success() {
    echo -e "${GREEN}✓${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${RESET} $1"
}

log_error() {
    echo -e "${RED}✗${RESET} $1"
}

check_dependencies() {
    log_info "Checking dependencies..."

    # Python
    if ! command -v python3 >/dev/null 2>&1; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi
    log_success "Python 3: $(python3 --version)"

    # Node.js (optional for frontend)
    if command -v node >/dev/null 2>&1; then
        log_success "Node.js: $(node --version)"
    else
        log_warning "Node.js not found - frontend dashboard will not be available"
    fi

    # jq (optional but recommended)
    if command -v jq >/dev/null 2>&1; then
        log_success "jq: $(jq --version)"
    else
        log_warning "jq not found - install for better CLI formatting (brew install jq)"
    fi

    # curl
    if ! command -v curl >/dev/null 2>&1; then
        log_error "curl is required but not installed"
        exit 1
    fi
    log_success "curl: available"

    echo ""
}

install_python_dependencies() {
    log_info "Installing Python dependencies..."

    if [[ ! -f "$BACKEND_DIR/requirements.txt" ]]; then
        log_error "requirements.txt not found"
        exit 1
    fi

    # Create virtual environment if it doesn't exist
    if [[ ! -d "$BACKEND_DIR/venv" ]]; then
        log_info "Creating Python virtual environment..."
        python3 -m venv "$BACKEND_DIR/venv"
    fi

    # Activate and install
    source "$BACKEND_DIR/venv/bin/activate"
    pip install -q --upgrade pip
    pip install -q -r "$BACKEND_DIR/requirements.txt"

    log_success "Python dependencies installed"
    echo ""
}

install_frontend_dependencies() {
    if ! command -v npm >/dev/null 2>&1; then
        log_warning "npm not found - skipping frontend setup"
        return
    fi

    log_info "Installing frontend dependencies..."

    if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
        log_warning "package.json not found - skipping frontend"
        return
    fi

    cd "$FRONTEND_DIR"

    if [[ ! -d "node_modules" ]]; then
        npm install --silent
        log_success "Frontend dependencies installed"
    else
        log_success "Frontend dependencies already installed"
    fi

    cd "$SCRIPT_DIR"
    echo ""
}

setup_data_directory() {
    log_info "Setting up data directory..."

    mkdir -p "$DATA_DIR"

    log_success "Data directory ready: $DATA_DIR"
    echo ""
}

start_backend_server() {
    log_info "Starting backend server..."

    source "$BACKEND_DIR/venv/bin/activate"

    # Check if already running
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Backend server already running on port 3000"
        return
    fi

    # Start in background
    cd "$BACKEND_DIR"
    nohup python3 server.py > "$DATA_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!

    echo "$BACKEND_PID" > "$DATA_DIR/backend.pid"

    # Wait for server to start
    sleep 3

    # Check if started successfully
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Backend server running (PID: $BACKEND_PID)"
        log_success "API: http://localhost:3000"
        log_success "Docs: http://localhost:3000/docs"
    else
        log_error "Backend server failed to start"
        log_error "Check logs: $DATA_DIR/backend.log"
        exit 1
    fi

    cd "$SCRIPT_DIR"
    echo ""
}

start_frontend_server() {
    if ! command -v npm >/dev/null 2>&1; then
        log_warning "npm not found - skipping frontend server"
        return
    fi

    if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
        log_warning "Frontend not configured - skipping"
        return
    fi

    log_info "Starting frontend development server..."

    # Check if already running
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "Frontend server already running on port 3001"
        return
    fi

    # Start in background
    cd "$FRONTEND_DIR"
    nohup npm run dev > "$DATA_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!

    echo "$FRONTEND_PID" > "$DATA_DIR/frontend.pid"

    # Wait for server to start
    sleep 5

    log_success "Frontend server running (PID: $FRONTEND_PID)"
    log_success "Dashboard: http://localhost:3001"

    cd "$SCRIPT_DIR"
    echo ""
}

start_metrics_collector() {
    log_info "Starting metrics collector..."

    source "$BACKEND_DIR/venv/bin/activate"

    # Get current session ID
    SESSION_ID=$(curl -s http://localhost:3000/api/status | jq -r '.session_id' 2>/dev/null || echo "")

    if [[ -z "$SESSION_ID" ]]; then
        log_warning "No active session found - skipping metrics collector"
        return
    fi

    # Start in background
    cd "$BACKEND_DIR"
    nohup python3 metrics-collector.py watch --session "$SESSION_ID" > "$DATA_DIR/metrics.log" 2>&1 &
    METRICS_PID=$!

    echo "$METRICS_PID" > "$DATA_DIR/metrics.pid"

    log_success "Metrics collector running (PID: $METRICS_PID)"
    log_success "Session: $SESSION_ID"

    cd "$SCRIPT_DIR"
    echo ""
}

show_status() {
    echo ""
    echo -e "${BOLD}${GREEN}╔════════════════════════════════════════════════════════════════╗${RESET}"
    echo -e "${BOLD}${GREEN}║  SuperCore v2.0 - Monitoring System Started                   ║${RESET}"
    echo -e "${BOLD}${GREEN}╚════════════════════════════════════════════════════════════════╝${RESET}"
    echo ""
    echo -e "${BOLD}Services:${RESET}"
    echo -e "  ${GREEN}✓${RESET} Backend API:     http://localhost:3000"
    echo -e "  ${GREEN}✓${RESET} API Docs:        http://localhost:3000/docs"
    echo -e "  ${GREEN}✓${RESET} WebSocket:       ws://localhost:3000/ws"

    if [[ -f "$DATA_DIR/frontend.pid" ]]; then
        echo -e "  ${GREEN}✓${RESET} Web Dashboard:   http://localhost:3001"
    fi

    echo ""
    echo -e "${BOLD}Commands:${RESET}"
    echo -e "  ${BLUE}CLI Monitor:${RESET}       ./monitoring/cli/monitor-cli.sh watch"
    echo -e "  ${BLUE}Send Test Notify:${RESET}  ./monitoring/notifications/notify.sh test"
    echo -e "  ${BLUE}View Logs:${RESET}         tail -f monitoring/data/*.log"
    echo -e "  ${BLUE}Stop All:${RESET}          ./stop-monitoring.sh"
    echo ""
    echo -e "${BOLD}Log Files:${RESET}"
    echo -e "  Backend:  $DATA_DIR/backend.log"
    echo -e "  Metrics:  $DATA_DIR/metrics.log"

    if [[ -f "$DATA_DIR/frontend.pid" ]]; then
        echo -e "  Frontend: $DATA_DIR/frontend.log"
    fi

    echo ""
    echo -e "${BOLD}PIDs:${RESET}"
    [[ -f "$DATA_DIR/backend.pid" ]] && echo -e "  Backend:  $(cat $DATA_DIR/backend.pid)"
    [[ -f "$DATA_DIR/metrics.pid" ]] && echo -e "  Metrics:  $(cat $DATA_DIR/metrics.pid)"
    [[ -f "$DATA_DIR/frontend.pid" ]] && echo -e "  Frontend: $(cat $DATA_DIR/frontend.pid)"
    echo ""
}

# ============================================================================
# Main
# ============================================================================

main() {
    echo ""
    echo -e "${BOLD}SuperCore v2.0 - Monitoring System Setup${RESET}"
    echo ""

    check_dependencies
    setup_data_directory
    install_python_dependencies
    install_frontend_dependencies

    echo -e "${BOLD}Starting services...${RESET}"
    echo ""

    start_backend_server
    start_metrics_collector
    start_frontend_server

    show_status
}

# Handle Ctrl+C gracefully
trap 'echo ""; log_warning "Interrupted. Services are still running. Use ./stop-monitoring.sh to stop."; exit 0' INT

main
