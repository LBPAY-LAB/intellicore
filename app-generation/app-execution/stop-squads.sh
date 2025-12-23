#!/bin/bash

#==============================================================================
# Stop Squads - Gracefully Stop Running Squads
#==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${SCRIPT_DIR}/state"
UTILS_DIR="${SCRIPT_DIR}/utils"

source "${UTILS_DIR}/common.sh"
source "${UTILS_DIR}/logging.sh"

SESSION_ID=""
FORCE=false
TIMEOUT=30

show_help() {
    cat << EOF
${BOLD}Stop Squads - Gracefully Terminate Running Squads${NC}

${BOLD}USAGE:${NC}
    $0 [OPTIONS]

${BOLD}OPTIONS:${NC}
    -h, --help           Show this help message
    -s, --session ID     Stop specific session (default: all)
    -f, --force         Force kill if graceful shutdown fails
    -t, --timeout N     Timeout in seconds (default: 30)

${BOLD}EXAMPLES:${NC}
    # Stop all running squads
    $0

    # Stop specific session
    $0 --session session-20250120-143022

    # Force stop with 10s timeout
    $0 --force --timeout 10

EOF
}

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
            -f|--force)
                FORCE=true
                shift
                ;;
            -t|--timeout)
                TIMEOUT="$2"
                shift 2
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
}

stop_squad() {
    local squad_name="$1"
    local session="$2"
    local squad_file="${STATE_DIR}/${session}/${squad_name}.json"

    if [[ ! -f "${squad_file}" ]]; then
        return
    fi

    local pid=$(jq -r '.pid // "null"' "${squad_file}")

    if [[ "${pid}" == "null" ]]; then
        return
    fi

    info "Stopping squad: ${squad_name} (PID: ${pid})"

    if kill_process_gracefully "${pid}" "${TIMEOUT}"; then
        success "Squad stopped: ${squad_name}"

        # Update state
        local tmp_file=$(mktemp)
        jq '.status = "stopped"' "${squad_file}" > "${tmp_file}"
        mv "${tmp_file}" "${squad_file}"
    else
        if [[ "${FORCE}" == "true" ]]; then
            warn "Force killing squad: ${squad_name}"
            kill -9 "${pid}" 2>/dev/null || true
            success "Squad force stopped: ${squad_name}"
        else
            error "Failed to stop squad: ${squad_name}"
        fi
    fi
}

stop_session() {
    local session="$1"

    header "Stopping Session: ${session}"

    local session_dir="${STATE_DIR}/${session}"

    for squad_file in "${session_dir}"/*.json; do
        if [[ ! -f "${squad_file}" ]] || [[ "$(basename ${squad_file})" == "metadata.json" ]]; then
            continue
        fi

        local squad_name=$(basename "${squad_file}" .json)
        stop_squad "${squad_name}" "${session}"
    done

    # Stop orchestrator if running
    local orchestrator_pid_file="${STATE_DIR}/orchestrator.pid"
    if [[ -f "${orchestrator_pid_file}" ]]; then
        local orchestrator_pid=$(cat "${orchestrator_pid_file}")
        if is_process_running "${orchestrator_pid}"; then
            info "Stopping orchestrator (PID: ${orchestrator_pid})"
            kill_process_gracefully "${orchestrator_pid}" 10
            rm -f "${orchestrator_pid_file}"
        fi
    fi

    success "Session stopped: ${session}"
}

main() {
    parse_arguments "$@"

    clear
    show_banner

    if [[ -n "${SESSION_ID}" ]]; then
        stop_session "${SESSION_ID}"
    else
        # Stop all sessions
        for session_dir in "${STATE_DIR}"/*; do
            if [[ ! -d "${session_dir}" ]]; then
                continue
            fi

            local session=$(basename "${session_dir}")
            stop_session "${session}"
        done
    fi

    success "All squads stopped"
}

main "$@"
