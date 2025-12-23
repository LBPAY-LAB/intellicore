#!/bin/bash

###############################################################################
# SuperCore v2.0 - Monitoring System Demo
# Example usage scenarios
###############################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'
BOLD='\033[1m'

print_step() {
    echo -e "\n${BOLD}${CYAN}━━━ $1 ━━━${RESET}\n"
}

print_command() {
    echo -e "${BLUE}$${RESET} ${BOLD}$1${RESET}"
}

# ============================================================================
# Demo Scenarios
# ============================================================================

demo_quickstart() {
    print_step "Quick Start Demo"

    echo "This demo shows how to start and use the monitoring system."
    echo ""

    print_command "./start-monitoring.sh"
    echo "Starts all monitoring components:"
    echo "  - Backend API (port 3000)"
    echo "  - Frontend Dashboard (port 3001)"
    echo "  - Metrics Collector"
    echo ""

    print_command "Open browser: http://localhost:3001"
    echo "Access the web dashboard with real-time updates"
    echo ""

    print_command "./monitoring/cli/monitor-cli.sh watch"
    echo "Terminal dashboard with auto-refresh"
    echo ""

    print_command "./stop-monitoring.sh"
    echo "Stop all services gracefully"
    echo ""
}

demo_api_usage() {
    print_step "API Usage Demo"

    echo "Examples of using the REST API:"
    echo ""

    print_command "curl http://localhost:3000/api/status | jq"
    echo "Get overall system status"
    echo ""

    print_command "curl http://localhost:3000/api/squads | jq"
    echo "List all squads with their status"
    echo ""

    print_command "curl 'http://localhost:3000/api/cards?status=in_progress' | jq"
    echo "Filter cards by status"
    echo ""

    print_command "curl http://localhost:3000/api/events?limit=20 | jq"
    echo "Get recent events"
    echo ""

    print_command "curl http://localhost:3000/api/metrics | jq"
    echo "Get current metrics summary"
    echo ""
}

demo_notifications() {
    print_step "Notifications Demo"

    echo "Configure and test notifications:"
    echo ""

    print_command "export SLACK_WEBHOOK_URL='https://hooks.slack.com/...'"
    echo "Set Slack webhook URL"
    echo ""

    print_command "./monitoring/notifications/notify.sh test slack"
    echo "Send test Slack notification"
    echo ""

    print_command "./monitoring/notifications/notify.sh test desktop"
    echo "Send test desktop notification"
    echo ""

    print_command "./monitoring/notifications/notify.sh watch"
    echo "Watch for events and send notifications automatically"
    echo ""

    echo "Example manual notifications:"
    echo ""

    print_command "./monitoring/notifications/notify.sh card-done CARD-001 squad-backend"
    echo "Notify card completion"
    echo ""

    print_command "./monitoring/notifications/notify.sh squad-blocked squad-backend 'Waiting for API spec'"
    echo "Notify critical squad block"
    echo ""
}

demo_metrics() {
    print_step "Metrics Collection Demo"

    echo "Collect and analyze metrics:"
    echo ""

    print_command "cd monitoring/backend && source venv/bin/activate"
    echo "Activate Python environment"
    echo ""

    print_command "python3 metrics-collector.py collect --session SESSION_ID"
    echo "Collect metrics snapshot"
    echo ""

    print_command "python3 metrics-collector.py watch --session SESSION_ID --interval 60"
    echo "Continuous metrics collection (every 60s)"
    echo ""

    print_command "python3 metrics-collector.py report --session SESSION_ID --output report.json"
    echo "Generate comprehensive metrics report"
    echo ""

    echo "Example report output:"
    echo ""
    cat <<'EOF'
{
  "current_metrics": {
    "velocity_per_day": 8.5,
    "qa_rejection_rate": 12.0,
    "test_coverage": 87.0,
    "cards_completed_today": 12
  },
  "summary": {
    "completion_rate": 65.0,
    "quality_score": 85.0,
    "health_status": "healthy"
  }
}
EOF
    echo ""
}

demo_cli_monitor() {
    print_step "CLI Monitor Demo"

    echo "Terminal-based monitoring:"
    echo ""

    print_command "./monitoring/cli/monitor-cli.sh"
    echo "Show overview once"
    echo ""

    print_command "./monitoring/cli/monitor-cli.sh watch"
    echo "Auto-refresh mode (default: 5s)"
    echo ""

    print_command "./monitoring/cli/monitor-cli.sh watch --refresh 2"
    echo "Custom refresh interval (2 seconds)"
    echo ""

    print_command "./monitoring/cli/monitor-cli.sh --squad backend watch"
    echo "Filter by specific squad"
    echo ""

    print_command "./monitoring/cli/monitor-cli.sh events 100"
    echo "Show last 100 events"
    echo ""

    print_command "./monitoring/cli/monitor-cli.sh metrics"
    echo "Show metrics summary"
    echo ""
}

demo_websocket() {
    print_step "WebSocket Real-time Updates Demo"

    echo "Connect to WebSocket for live updates:"
    echo ""

    echo "JavaScript example:"
    cat <<'EOF'
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onopen = () => {
  console.log('Connected to monitoring server');
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'update') {
    console.log('Squads:', data.data.squads);
    console.log('Metrics:', data.data.metrics);
  }
};

// Keep-alive ping
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send('ping');
  }
}, 30000);
EOF
    echo ""

    echo "Python example:"
    cat <<'EOF'
import websocket
import json

def on_message(ws, message):
    data = json.loads(message)
    print(f"Update: {data['type']}")
    if 'data' in data:
        print(f"Squads: {len(data['data'].get('squads', []))}")

ws = websocket.WebSocketApp(
    "ws://localhost:3000/ws",
    on_message=on_message
)

ws.run_forever()
EOF
    echo ""
}

demo_integration() {
    print_step "CI/CD Integration Demo"

    echo "Example CI/CD pipeline integration:"
    echo ""

    cat <<'EOF'
#!/bin/bash
# ci-monitor.sh - Monitor squads in CI/CD

# Start monitoring
./start-monitoring.sh

# Launch squads
./launch-squads.sh meta-squad-config.json &
SQUAD_PID=$!

# Monitor progress
SESSION_ID=$(curl -s http://localhost:3000/api/status | jq -r '.session_id')

while true; do
  STATUS=$(curl -s http://localhost:3000/api/status)
  PROGRESS=$(echo "$STATUS" | jq -r '.overall_progress')

  echo "Progress: $PROGRESS%"

  # Check for errors
  BLOCKED=$(echo "$STATUS" | jq '[.squads[] | select(.status == "blocked")] | length')
  if [[ $BLOCKED -gt 0 ]]; then
    echo "ERROR: $BLOCKED squads blocked!"
    exit 1
  fi

  # Check completion
  if (( $(echo "$PROGRESS >= 100" | bc -l) )); then
    echo "SUCCESS: All squads completed!"
    break
  fi

  sleep 30
done

# Generate report
cd monitoring/backend
source venv/bin/activate
python3 metrics-collector.py report --session "$SESSION_ID" --output ci-report.json

# Upload report
aws s3 cp ci-report.json s3://my-bucket/reports/

# Stop monitoring
./stop-monitoring.sh

exit 0
EOF
    echo ""
}

# ============================================================================
# Main Menu
# ============================================================================

show_menu() {
    cat <<EOF
${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════╗
║  SuperCore v2.0 - Monitoring System Demo                       ║
╚════════════════════════════════════════════════════════════════╝${RESET}

Select a demo scenario:

  ${BOLD}1${RESET} - Quick Start
  ${BOLD}2${RESET} - API Usage
  ${BOLD}3${RESET} - Notifications
  ${BOLD}4${RESET} - Metrics Collection
  ${BOLD}5${RESET} - CLI Monitor
  ${BOLD}6${RESET} - WebSocket Real-time
  ${BOLD}7${RESET} - CI/CD Integration
  ${BOLD}8${RESET} - Show All Demos

  ${BOLD}0${RESET} - Exit

EOF
}

run_demo() {
    clear

    case "$1" in
        1) demo_quickstart ;;
        2) demo_api_usage ;;
        3) demo_notifications ;;
        4) demo_metrics ;;
        5) demo_cli_monitor ;;
        6) demo_websocket ;;
        7) demo_integration ;;
        8)
            demo_quickstart
            demo_api_usage
            demo_notifications
            demo_metrics
            demo_cli_monitor
            demo_websocket
            demo_integration
            ;;
        0) exit 0 ;;
        *)
            echo -e "${YELLOW}Invalid option${RESET}"
            return
            ;;
    esac

    echo ""
    echo -e "${GREEN}Press Enter to continue...${RESET}"
    read
}

# ============================================================================
# Main Loop
# ============================================================================

if [[ $# -gt 0 ]]; then
    # Run specific demo
    run_demo "$1"
else
    # Interactive menu
    while true; do
        clear
        show_menu
        echo -n "Choose option: "
        read option
        run_demo "$option"
    done
fi
