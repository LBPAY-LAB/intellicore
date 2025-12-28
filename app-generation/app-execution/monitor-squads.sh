#!/bin/bash

#==============================================================================
# Squad Monitor - Real-time Squad Progress Monitoring
#==============================================================================

set -euo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${SCRIPT_DIR}/state"
LOGS_DIR="${SCRIPT_DIR}/logs"
UTILS_DIR="${SCRIPT_DIR}/utils"

# Source utilities
source "${UTILS_DIR}/common.sh"
source "${UTILS_DIR}/logging.sh"

# Configuration
SESSION_ID=""
WATCH_MODE=false
REFRESH_INTERVAL=2
SHOW_LOGS=false
LOG_LINES=20
FILTER_SQUAD=""
OUTPUT_FORMAT="dashboard"  # dashboard, json, simple

#==============================================================================
# Help Message
#==============================================================================
show_help() {
    cat << EOF
${BOLD}Squad Monitor - Real-time Progress Tracking${NC}

${BOLD}USAGE:${NC}
    $0 [OPTIONS]

${BOLD}OPTIONS:${NC}
    -h, --help                Show this help message
    -s, --session ID          Monitor specific session (default: latest)
    -w, --watch              Enable watch mode (auto-refresh)
    -i, --interval SECONDS    Refresh interval in watch mode (default: 2)
    -l, --logs               Show recent log entries
    -n, --lines N            Number of log lines to show (default: 20)
    -f, --filter SQUAD       Filter by squad name
    -o, --format FORMAT      Output format: dashboard, json, simple (default: dashboard)
    --status                 Show quick status summary
    --list-sessions          List all available sessions

${BOLD}EXAMPLES:${NC}
    # Monitor latest session with auto-refresh
    $0 --watch

    # Monitor specific session
    $0 --session session-20250120-143022

    # Show logs with monitoring
    $0 --watch --logs --lines 50

    # Filter specific squad
    $0 --filter backend-squad --watch

    # JSON output for scripting
    $0 --format json

    # Quick status check
    $0 --status

${BOLD}INTERACTIVE COMMANDS (in watch mode):${NC}
    q     - Quit
    r     - Refresh now
    l     - Toggle log view
    1-9   - Focus on squad N
    a     - Show all squads

EOF
}

#==============================================================================
# Parse Arguments
#==============================================================================
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -s|--session)
                SESSION_ID="$2"
                shift 2
                ;;
            -w|--watch)
                WATCH_MODE=true
                shift
                ;;
            -i|--interval)
                REFRESH_INTERVAL="$2"
                shift 2
                ;;
            -l|--logs)
                SHOW_LOGS=true
                shift
                ;;
            -n|--lines)
                LOG_LINES="$2"
                shift 2
                ;;
            -f|--filter)
                FILTER_SQUAD="$2"
                shift 2
                ;;
            -o|--format)
                OUTPUT_FORMAT="$2"
                shift 2
                ;;
            --status)
                show_quick_status
                exit 0
                ;;
            --list-sessions)
                list_sessions
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done

    # Get latest session if not specified
    if [[ -z "${SESSION_ID}" ]]; then
        SESSION_ID=$(get_latest_session)
        if [[ -z "${SESSION_ID}" ]]; then
            error "No active sessions found"
            exit 1
        fi
    fi
}

#==============================================================================
# Session Management
#==============================================================================
get_latest_session() {
    local latest=$(ls -t "${STATE_DIR}" 2>/dev/null | head -n 1)
    echo "${latest}"
}

list_sessions() {
    header "Available Sessions"

    if [[ ! -d "${STATE_DIR}" ]] || [[ -z "$(ls -A "${STATE_DIR}" 2>/dev/null)" ]]; then
        warn "No sessions found"
        return
    fi

    for session_dir in "${STATE_DIR}"/*; do
        if [[ ! -d "${session_dir}" ]]; then
            continue
        fi

        local session=$(basename "${session_dir}")
        local metadata="${session_dir}/metadata.json"

        if [[ ! -f "${metadata}" ]]; then
            continue
        fi

        local status=$(jq -r '.status' "${metadata}")
        local start_time=$(jq -r '.start_time' "${metadata}")
        local squad_count=$(jq '.squads | length' "${metadata}")

        echo -e "  ${BOLD}${session}${NC}"
        echo -e "    Status: $(colorize_status ${status})"
        echo -e "    Started: ${start_time}"
        echo -e "    Squads: ${squad_count}"
        echo ""
    done
}

colorize_status() {
    local status="$1"

    case "${status}" in
        running)
            echo -e "${BLUE}${status}${NC}"
            ;;
        completed)
            echo -e "${GREEN}${status}${NC}"
            ;;
        failed)
            echo -e "${RED}${status}${NC}"
            ;;
        *)
            echo -e "${YELLOW}${status}${NC}"
            ;;
    esac
}

#==============================================================================
# Squad Information
#==============================================================================
get_squad_list() {
    local session_dir="${STATE_DIR}/${SESSION_ID}"

    find "${session_dir}" -name "*.json" -type f ! -name "metadata.json" | \
        xargs -I {} basename {} .json | \
        sort
}

get_squad_info() {
    local squad_name="$1"
    local squad_file="${STATE_DIR}/${SESSION_ID}/${squad_name}.json"

    if [[ ! -f "${squad_file}" ]]; then
        echo "null"
        return
    fi

    cat "${squad_file}"
}

#==============================================================================
# Dashboard Display
#==============================================================================
show_dashboard() {
    clear
    show_banner

    local session_dir="${STATE_DIR}/${SESSION_ID}"
    local metadata="${session_dir}/metadata.json"

    if [[ ! -f "${metadata}" ]]; then
        error "Session not found: ${SESSION_ID}"
        return 1
    fi

    # Session header
    header "Session: ${SESSION_ID}"

    local session_status=$(jq -r '.status' "${metadata}")
    local start_time=$(jq -r '.start_time' "${metadata}")
    local definitions=$(jq -r '.definitions_file' "${metadata}")

    echo -e "${BOLD}Status:${NC} $(colorize_status ${session_status})"
    echo -e "${BOLD}Started:${NC} ${start_time}"
    echo -e "${BOLD}Definitions:${NC} ${definitions}"
    echo ""

    # Squad summary
    header "Squad Progress"

    local squads=($(get_squad_list))

    if [[ ${#squads[@]} -eq 0 ]]; then
        warn "No squads found"
        return
    fi

    # Calculate overall progress
    local total_tasks=0
    local completed_tasks=0
    local running_squads=0
    local completed_squads=0
    local failed_squads=0

    for squad in "${squads[@]}"; do
        if [[ -n "${FILTER_SQUAD}" ]] && [[ "${squad}" != "${FILTER_SQUAD}" ]]; then
            continue
        fi

        local squad_info=$(get_squad_info "${squad}")

        if [[ "${squad_info}" == "null" ]]; then
            continue
        fi

        local status=$(echo "${squad_info}" | jq -r '.status')
        local total=$(echo "${squad_info}" | jq -r '.progress.total_tasks')
        local completed=$(echo "${squad_info}" | jq -r '.progress.completed_tasks')
        local current=$(echo "${squad_info}" | jq -r '.progress.current_task')
        local pid=$(echo "${squad_info}" | jq -r '.pid // "N/A"')

        total_tasks=$((total_tasks + total))
        completed_tasks=$((completed_tasks + completed))

        case "${status}" in
            running)
                ((running_squads++))
                ;;
            completed)
                ((completed_squads++))
                ;;
            failed)
                ((failed_squads++))
                ;;
        esac

        # Squad row
        local percent=0
        if [[ ${total} -gt 0 ]]; then
            percent=$((completed * 100 / total))
        fi

        printf "  ${BOLD}%-20s${NC} " "${squad}"
        printf "[$(colorize_status ${status})] "
        printf "PID: %-6s " "${pid}"
        printf "%2d/%2d tasks (%3d%%) " ${completed} ${total} ${percent}

        # Progress bar
        draw_progress_bar ${completed} ${total} 20

        if [[ "${current}" != "null" ]] && [[ -n "${current}" ]]; then
            printf " ${CYAN}→ ${current}${NC}"
        fi

        echo ""
    done

    echo ""

    # Overall summary
    header "Overall Summary"

    local total_squads=${#squads[@]}
    local overall_percent=0
    if [[ ${total_tasks} -gt 0 ]]; then
        overall_percent=$((completed_tasks * 100 / total_tasks))
    fi

    echo -e "${BOLD}Total Squads:${NC} ${total_squads}"
    echo -e "${BOLD}Running:${NC} ${running_squads}  ${BOLD}Completed:${NC} ${completed_squads}  ${BOLD}Failed:${NC} ${failed_squads}"
    echo -e "${BOLD}Total Tasks:${NC} ${completed_tasks}/${total_tasks} (${overall_percent}%)"
    echo ""

    # Overall progress bar
    echo -e "${BOLD}Overall Progress:${NC}"
    draw_progress_bar ${completed_tasks} ${total_tasks} 60
    echo -e " ${overall_percent}%"
    echo ""

    # Show logs if requested
    if [[ "${SHOW_LOGS}" == "true" ]]; then
        show_recent_logs
    fi

    # Footer
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"

    if [[ "${WATCH_MODE}" == "true" ]]; then
        echo -e "Auto-refresh every ${REFRESH_INTERVAL}s | Press Ctrl+C to exit"
    fi
}

draw_progress_bar() {
    local current="$1"
    local total="$2"
    local width="$3"

    local filled=0
    if [[ ${total} -gt 0 ]]; then
        filled=$((current * width / total))
    fi
    local empty=$((width - filled))

    printf "${GREEN}"
    printf "%${filled}s" | tr ' ' '█'
    printf "${NC}"
    printf "%${empty}s" | tr ' ' '░'
}

#==============================================================================
# Log Display
#==============================================================================
show_recent_logs() {
    header "Recent Logs"

    local squads=($(get_squad_list))

    for squad in "${squads[@]}"; do
        if [[ -n "${FILTER_SQUAD}" ]] && [[ "${squad}" != "${FILTER_SQUAD}" ]]; then
            continue
        fi

        local log_file="${LOGS_DIR}/${SESSION_ID}/${squad}.log"

        if [[ ! -f "${log_file}" ]]; then
            continue
        fi

        echo -e "${BOLD}${squad}:${NC}"
        tail -n ${LOG_LINES} "${log_file}" | while read -r line; do
            echo "  $(colorize_log_level "${line}")"
        done
        echo ""
    done
}

#==============================================================================
# Quick Status
#==============================================================================
show_quick_status() {
    local session_dir="${STATE_DIR}/${SESSION_ID}"
    local metadata="${session_dir}/metadata.json"

    if [[ ! -f "${metadata}" ]]; then
        error "No active session found"
        exit 1
    fi

    local status=$(jq -r '.status' "${metadata}")
    local squads=($(get_squad_list))

    local running=0
    local completed=0
    local failed=0

    for squad in "${squads[@]}"; do
        local squad_info=$(get_squad_info "${squad}")
        local squad_status=$(echo "${squad_info}" | jq -r '.status')

        case "${squad_status}" in
            running) ((running++)) ;;
            completed) ((completed++)) ;;
            failed) ((failed++)) ;;
        esac
    done

    echo "Session: ${SESSION_ID}"
    echo "Status: ${status}"
    echo "Squads: Running=${running} Completed=${completed} Failed=${failed}"
}

#==============================================================================
# JSON Output
#==============================================================================
show_json() {
    local session_dir="${STATE_DIR}/${SESSION_ID}"
    local metadata="${session_dir}/metadata.json"

    local squads_json="[]"
    local squads=($(get_squad_list))

    for squad in "${squads[@]}"; do
        local squad_info=$(get_squad_info "${squad}")
        squads_json=$(echo "${squads_json}" | jq ". += [${squad_info}]")
    done

    jq -n \
        --argjson metadata "$(cat ${metadata})" \
        --argjson squads "${squads_json}" \
        '{
            session: $metadata,
            squads: $squads
        }'
}

#==============================================================================
# Simple Output
#==============================================================================
show_simple() {
    local squads=($(get_squad_list))

    for squad in "${squads[@]}"; do
        local squad_info=$(get_squad_info "${squad}")
        local status=$(echo "${squad_info}" | jq -r '.status')
        local completed=$(echo "${squad_info}" | jq -r '.progress.completed_tasks')
        local total=$(echo "${squad_info}" | jq -r '.progress.total_tasks')

        printf "%-20s %10s %3d/%3d\n" "${squad}" "${status}" ${completed} ${total}
    done
}

#==============================================================================
# Watch Mode
#==============================================================================
run_watch_mode() {
    # Trap Ctrl+C
    trap 'echo ""; exit 0' INT TERM

    while true; do
        case "${OUTPUT_FORMAT}" in
            dashboard)
                show_dashboard
                ;;
            json)
                show_json
                ;;
            simple)
                show_simple
                ;;
        esac

        sleep ${REFRESH_INTERVAL}
    done
}

#==============================================================================
# Main Function
#==============================================================================
main() {
    parse_arguments "$@"

    if [[ "${WATCH_MODE}" == "true" ]]; then
        run_watch_mode
    else
        case "${OUTPUT_FORMAT}" in
            dashboard)
                show_dashboard
                ;;
            json)
                show_json
                ;;
            simple)
                show_simple
                ;;
        esac
    fi
}

#==============================================================================
# Execute Main
#==============================================================================
main "$@"
