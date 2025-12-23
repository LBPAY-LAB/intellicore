#!/bin/bash

###############################################################################
# SuperCore v2.0 - Enhanced CLI Monitor
# Terminal UI with auto-refresh, colors, and rich formatting
###############################################################################

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
STATE_DIR="$BASE_DIR/state"
API_URL="${MONITOR_API_URL:-http://localhost:3000}"

REFRESH_INTERVAL="${REFRESH_INTERVAL:-5}"  # seconds
WATCH_MODE="${WATCH_MODE:-false}"
FILTER_SQUAD=""
SHOW_LOGS=false

# ============================================================================
# Colors and Formatting
# ============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

# Emojis/Icons
ICON_RUNNING="▶ "
ICON_WAITING="⏸ "
ICON_BLOCKED="🚧"
ICON_DONE="✅"
ICON_ERROR="❌"
ICON_CARD="📋"
ICON_AGENT="🤖"
ICON_PROGRESS="📊"
ICON_TIME="⏱ "

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    local text="$1"
    echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════════════╗${RESET}"
    printf "${BOLD}${CYAN}║${RESET} ${BOLD}%-60s${RESET} ${BOLD}${CYAN}║${RESET}\n" "$text"
    echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════════════╝${RESET}"
}

print_section() {
    local text="$1"
    echo ""
    echo -e "${BOLD}${WHITE}━━━ $text ━━━${RESET}"
}

format_duration() {
    local seconds=$1
    local hours=$((seconds / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))
    printf "%02d:%02d:%02d" $hours $minutes $secs
}

format_timestamp() {
    local timestamp="$1"
    if command -v date >/dev/null 2>&1; then
        date -d "$timestamp" "+%H:%M:%S" 2>/dev/null || echo "$timestamp"
    else
        echo "$timestamp"
    fi
}

progress_bar() {
    local current=$1
    local total=$2
    local width=${3:-30}

    if [[ $total -eq 0 ]]; then
        echo -e "${GRAY}[$(printf '%.0s─' $(seq 1 $width))]${RESET} 0%"
        return
    fi

    local percentage=$((current * 100 / total))
    local filled=$((percentage * width / 100))
    local empty=$((width - filled))

    local color="${GREEN}"
    if [[ $percentage -lt 33 ]]; then
        color="${RED}"
    elif [[ $percentage -lt 66 ]]; then
        color="${YELLOW}"
    fi

    local bar=""
    bar+="${color}["
    [[ $filled -gt 0 ]] && bar+="$(printf '%.0s█' $(seq 1 $filled))"
    [[ $empty -gt 0 ]] && bar+="$(printf '%.0s░' $(seq 1 $empty))"
    bar+="]${RESET}"

    echo -e "$bar ${BOLD}$percentage%${RESET}"
}

get_status_color() {
    local status="$1"
    case "$status" in
        running) echo "$GREEN" ;;
        waiting) echo "$YELLOW" ;;
        blocked) echo "$RED" ;;
        completed) echo "$BLUE" ;;
        error) echo "$RED" ;;
        *) echo "$GRAY" ;;
    esac
}

get_status_icon() {
    local status="$1"
    case "$status" in
        running) echo "$ICON_RUNNING" ;;
        waiting) echo "$ICON_WAITING" ;;
        blocked) echo "$ICON_BLOCKED" ;;
        completed) echo "$ICON_DONE" ;;
        error) echo "$ICON_ERROR" ;;
        *) echo "  " ;;
    esac
}

# ============================================================================
# API Functions
# ============================================================================

api_get() {
    local endpoint="$1"
    curl -s "$API_URL$endpoint" 2>/dev/null || echo "{}"
}

fetch_status() {
    api_get "/api/status"
}

fetch_squads() {
    api_get "/api/squads"
}

fetch_events() {
    local limit="${1:-20}"
    api_get "/api/events?limit=$limit"
}

fetch_metrics() {
    api_get "/api/metrics"
}

# ============================================================================
# Display Functions
# ============================================================================

display_overview() {
    local status_json="$1"

    # Parse JSON (basic parsing, use jq if available)
    if command -v jq >/dev/null 2>&1; then
        local session_id=$(echo "$status_json" | jq -r '.session_id // "unknown"')
        local uptime=$(echo "$status_json" | jq -r '.uptime_seconds // 0')
        local progress=$(echo "$status_json" | jq -r '.overall_progress // 0')

        print_section "Session Overview"
        echo -e "${CYAN}Session ID:${RESET} ${BOLD}$session_id${RESET}"
        echo -e "${CYAN}Uptime:${RESET}     ${BOLD}$(format_duration $uptime)${RESET}"
        echo -e "${CYAN}Progress:${RESET}   $(progress_bar ${progress%.*} 100 40)"
    else
        print_section "Session Overview"
        echo -e "${YELLOW}⚠ Install 'jq' for better formatting${RESET}"
        echo "$status_json" | head -10
    fi
}

display_squads() {
    local status_json="$1"

    print_section "Squads Status"

    if ! command -v jq >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Install 'jq' to view squad details${RESET}"
        return
    fi

    local squads=$(echo "$status_json" | jq -c '.squads[]?' 2>/dev/null)

    if [[ -z "$squads" ]]; then
        echo -e "${GRAY}No squads running${RESET}"
        return
    fi

    echo ""
    printf "%-25s %-12s %-15s %s\n" "SQUAD" "STATUS" "PROGRESS" "CURRENT"
    echo "────────────────────────────────────────────────────────────────────"

    while IFS= read -r squad; do
        local squad_id=$(echo "$squad" | jq -r '.squad_id')
        local status=$(echo "$squad" | jq -r '.status')
        local cards_done=$(echo "$squad" | jq -r '.cards_done // 0')
        local cards_total=$(echo "$squad" | jq -r '.cards_total // 0')
        local current_card=$(echo "$squad" | jq -r '.current_card // "N/A"')
        local cards_blocked=$(echo "$squad" | jq -r '.cards_blocked // 0')

        # Filter if needed
        if [[ -n "$FILTER_SQUAD" ]] && [[ "$squad_id" != *"$FILTER_SQUAD"* ]]; then
            continue
        fi

        local status_color=$(get_status_color "$status")
        local status_icon=$(get_status_icon "$status")

        # Squad name
        printf "%-25s " "${squad_id/squad-/}"

        # Status
        echo -ne "${status_color}${status_icon}${status}${RESET}"
        printf "%$((12-${#status}-2))s" ""

        # Progress
        local progress="$cards_done/$cards_total"
        printf "%-15s " "$progress"

        # Current card
        if [[ "$current_card" != "N/A" ]]; then
            echo -e "${CYAN}${current_card}${RESET}"
        else
            echo -e "${GRAY}—${RESET}"
        fi

        # Show blocked warning
        if [[ $cards_blocked -gt 0 ]]; then
            echo -e "  ${YELLOW}⚠ $cards_blocked blocked cards${RESET}"
        fi
    done <<< "$squads"

    echo ""
}

display_metrics() {
    local status_json="$1"

    if ! command -v jq >/dev/null 2>&1; then
        return
    fi

    local metrics=$(echo "$status_json" | jq '.metrics' 2>/dev/null)

    if [[ "$metrics" == "null" ]] || [[ -z "$metrics" ]]; then
        return
    fi

    print_section "Metrics"

    local velocity=$(echo "$metrics" | jq -r '.velocity_per_day // 0')
    local qa_rejection=$(echo "$metrics" | jq -r '.qa_rejection_rate // 0')
    local coverage=$(echo "$metrics" | jq -r '.average_coverage // 0')
    local cards_today=$(echo "$metrics" | jq -r '.cards_completed_today // 0')
    local active_squads=$(echo "$metrics" | jq -r '.active_squads // 0')

    echo ""
    printf "  %-25s ${BOLD}%.1f${RESET} pts/day\n" "📈 Velocity:" "$velocity"
    printf "  %-25s ${BOLD}%.1f%%${RESET}\n" "❌ QA Rejection Rate:" "$qa_rejection"
    printf "  %-25s ${BOLD}%.0f%%${RESET}\n" "🧪 Test Coverage:" "$coverage"
    printf "  %-25s ${BOLD}%d${RESET} cards\n" "✅ Completed Today:" "$cards_today"
    printf "  %-25s ${BOLD}%d${RESET}\n" "👥 Active Squads:" "$active_squads"
    echo ""
}

display_events() {
    local status_json="$1"

    if ! command -v jq >/dev/null 2>&1; then
        return
    fi

    local events=$(echo "$status_json" | jq -c '.recent_events[]?' 2>/dev/null)

    if [[ -z "$events" ]]; then
        return
    fi

    print_section "Recent Events (Last 10)"
    echo ""

    local count=0
    while IFS= read -r event && [[ $count -lt 10 ]]; do
        local timestamp=$(echo "$event" | jq -r '.timestamp')
        local type=$(echo "$event" | jq -r '.type')
        local message=$(echo "$event" | jq -r '.message')
        local squad=$(echo "$event" | jq -r '.squad')

        local time_str=$(format_timestamp "$timestamp")

        # Color based on event type
        local event_color="$GRAY"
        case "$type" in
            *done*|*approved*) event_color="$GREEN" ;;
            *rejected*|*error*) event_color="$RED" ;;
            *blocked*|*warning*) event_color="$YELLOW" ;;
            *started*|*progress*) event_color="$BLUE" ;;
        esac

        echo -e "${DIM}${time_str}${RESET} ${event_color}●${RESET} ${message} ${GRAY}(${squad})${RESET}"

        ((count++))
    done <<< "$events"

    echo ""
}

display_full_dashboard() {
    # Clear screen
    clear

    # Header
    print_header "SuperCore v2.0 - Squad Monitoring Dashboard"
    echo -e "${GRAY}Refresh: ${REFRESH_INTERVAL}s | API: $API_URL${RESET}"
    echo -e "${GRAY}Press Ctrl+C to exit${RESET}"

    # Fetch data
    local status_json=$(fetch_status)

    if [[ "$status_json" == "{}" ]] || [[ -z "$status_json" ]]; then
        echo ""
        echo -e "${RED}❌ Failed to connect to monitoring API${RESET}"
        echo -e "${GRAY}Make sure the server is running: ./monitoring/backend/server.py${RESET}"
        echo ""
        return 1
    fi

    # Display sections
    display_overview "$status_json"
    display_squads "$status_json"
    display_metrics "$status_json"
    display_events "$status_json"

    # Footer
    echo -e "${GRAY}────────────────────────────────────────────────────────────────────${RESET}"
    echo -e "${DIM}Last update: $(date '+%Y-%m-%d %H:%M:%S')${RESET}"
}

# ============================================================================
# Watch Mode
# ============================================================================

watch_dashboard() {
    while true; do
        display_full_dashboard

        sleep "$REFRESH_INTERVAL"
    done
}

# ============================================================================
# CLI Commands
# ============================================================================

cmd_overview() {
    display_full_dashboard
}

cmd_watch() {
    WATCH_MODE=true
    watch_dashboard
}

cmd_squads() {
    local squads_json=$(fetch_squads)

    if ! command -v jq >/dev/null 2>&1; then
        echo "$squads_json"
        return
    fi

    print_header "Squads List"
    echo ""

    echo "$squads_json" | jq -r '.[] | "\(.squad_id): \(.status) - \(.cards_done)/\(.cards_total) cards"'
    echo ""
}

cmd_events() {
    local limit="${1:-50}"
    local events_json=$(fetch_events "$limit")

    if ! command -v jq >/dev/null 2>&1; then
        echo "$events_json"
        return
    fi

    print_header "Event Log (Last $limit)"
    echo ""

    echo "$events_json" | jq -r '.[] | "\(.timestamp | split("T")[1] | split(".")[0]) [\(.type)] \(.message) (\(.squad))"'
    echo ""
}

cmd_metrics() {
    local metrics_json=$(fetch_metrics)

    if ! command -v jq >/dev/null 2>&1; then
        echo "$metrics_json"
        return
    fi

    print_header "Metrics Dashboard"
    echo ""

    echo "$metrics_json" | jq '.'
    echo ""
}

# ============================================================================
# Main
# ============================================================================

show_help() {
    cat <<EOF
SuperCore v2.0 - CLI Monitor

USAGE:
    $(basename "$0") [OPTIONS] [COMMAND]

COMMANDS:
    overview        Show dashboard overview (default)
    watch          Watch mode with auto-refresh
    squads         List all squads
    events [N]     Show last N events (default: 50)
    metrics        Show metrics dashboard

OPTIONS:
    --watch, -w         Enable watch mode
    --refresh N         Set refresh interval (seconds, default: 5)
    --squad NAME        Filter by squad name
    --api URL           API endpoint (default: http://localhost:3000)
    --help, -h          Show this help

EXAMPLES:
    # Show overview once
    $(basename "$0")

    # Watch mode with 2s refresh
    $(basename "$0") watch --refresh 2

    # Filter specific squad
    $(basename "$0") --squad backend watch

    # Show last 100 events
    $(basename "$0") events 100

KEYBOARD SHORTCUTS (in watch mode):
    Ctrl+C          Exit

NOTE: Install 'jq' for better JSON formatting
      brew install jq  (macOS)
      apt install jq   (Linux)
EOF
}

main() {
    local command="overview"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -h|--help)
                show_help
                exit 0
                ;;
            -w|--watch)
                WATCH_MODE=true
                shift
                ;;
            --refresh)
                REFRESH_INTERVAL="$2"
                shift 2
                ;;
            --squad)
                FILTER_SQUAD="$2"
                shift 2
                ;;
            --api)
                API_URL="$2"
                shift 2
                ;;
            overview|watch|squads|events|metrics)
                command="$1"
                shift
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Check if jq is available
    if ! command -v jq >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠ Warning: 'jq' not found. Install for better formatting.${RESET}"
        echo ""
    fi

    # Execute command
    case "$command" in
        overview)
            if [[ "$WATCH_MODE" == "true" ]]; then
                cmd_watch
            else
                cmd_overview
            fi
            ;;
        watch)
            cmd_watch
            ;;
        squads)
            cmd_squads
            ;;
        events)
            cmd_events "$@"
            ;;
        metrics)
            cmd_metrics
            ;;
        *)
            echo "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Run
main "$@"
