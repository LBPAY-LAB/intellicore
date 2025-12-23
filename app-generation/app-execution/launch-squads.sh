#!/bin/bash

#==============================================================================
# SuperCore Squad Orchestrator - Main Launch Script
#==============================================================================
# Description: Launches multiple Claude Code agent squads in parallel background
# Author: SuperCore Team
# Version: 1.0.0
# License: MIT
#==============================================================================

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color
readonly BOLD='\033[1m'

# Script directory and paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOGS_DIR="${SCRIPT_DIR}/logs"
STATE_DIR="${SCRIPT_DIR}/state"
UTILS_DIR="${SCRIPT_DIR}/utils"

# Source utility functions
source "${UTILS_DIR}/common.sh"
source "${UTILS_DIR}/logging.sh"
source "${UTILS_DIR}/squad-runner.sh"

# Global variables
SQUAD_DEFINITIONS_FILE=""
DRY_RUN=false
VERBOSE=false
FORCE_RESTART=false
SESSION_ID=""
ORCHESTRATOR_PID_FILE="${STATE_DIR}/orchestrator.pid"

#==============================================================================
# Help Message
#==============================================================================
show_help() {
    cat << EOF
${BOLD}SuperCore Squad Orchestrator${NC}

${BOLD}USAGE:${NC}
    $0 [OPTIONS] <squad-definitions.json>

${BOLD}DESCRIPTION:${NC}
    Launches multiple Claude Code agent squads in parallel background mode.
    Each squad operates autonomously with full permissions as defined in
    AUTONOMOUS_MODE_GUIDE.md.

${BOLD}ARGUMENTS:${NC}
    squad-definitions.json    JSON file containing squad configurations

${BOLD}OPTIONS:${NC}
    -h, --help               Show this help message
    -v, --verbose            Enable verbose output
    -d, --dry-run           Validate configuration without launching
    -f, --force             Force restart even if squads are running
    -s, --session-id ID     Custom session identifier (auto-generated if not provided)

${BOLD}EXAMPLES:${NC}
    # Launch squads with default settings
    $0 squad-definitions.json

    # Dry run to validate configuration
    $0 --dry-run squad-definitions.json

    # Launch with custom session ID
    $0 --session-id sprint-1-phase-2 squad-definitions.json

    # Force restart existing squads
    $0 --force squad-definitions.json

${BOLD}FEATURES:${NC}
    - Parallel execution of multiple squads
    - Fully autonomous mode (no chat approvals)
    - Independent logging per squad
    - Real-time status monitoring
    - Checkpoint/resume capability
    - Inter-squad communication via state files
    - Automatic error recovery

${BOLD}MONITORING:${NC}
    - View logs: tail -f ${LOGS_DIR}/squad-<name>.log
    - Monitor all: ./monitor-squads.sh
    - Check status: ./monitor-squads.sh --status

${BOLD}FILES:${NC}
    Logs:  ${LOGS_DIR}/
    State: ${STATE_DIR}/
    PID:   ${STATE_DIR}/orchestrator.pid

EOF
}

#==============================================================================
# Parse Command Line Arguments
#==============================================================================
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -f|--force)
                FORCE_RESTART=true
                shift
                ;;
            -s|--session-id)
                SESSION_ID="$2"
                shift 2
                ;;
            -*)
                error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                if [[ -z "${SQUAD_DEFINITIONS_FILE}" ]]; then
                    SQUAD_DEFINITIONS_FILE="$1"
                else
                    error "Multiple definition files provided"
                    exit 1
                fi
                shift
                ;;
        esac
    done

    # Validate required arguments
    if [[ -z "${SQUAD_DEFINITIONS_FILE}" ]]; then
        error "Squad definitions file is required"
        show_help
        exit 1
    fi

    # Make path absolute
    if [[ ! "${SQUAD_DEFINITIONS_FILE}" = /* ]]; then
        SQUAD_DEFINITIONS_FILE="${PWD}/${SQUAD_DEFINITIONS_FILE}"
    fi

    # Generate session ID if not provided
    if [[ -z "${SESSION_ID}" ]]; then
        SESSION_ID="session-$(date +%Y%m%d-%H%M%S)"
    fi
}

#==============================================================================
# Validate Squad Definitions File
#==============================================================================
validate_squad_definitions() {
    local file="$1"

    info "Validating squad definitions file: ${file}"

    # Check file exists
    if [[ ! -f "${file}" ]]; then
        error "Squad definitions file not found: ${file}"
        exit 1
    fi

    # Validate JSON syntax
    if ! jq empty "${file}" 2>/dev/null; then
        error "Invalid JSON in squad definitions file"
        exit 1
    fi

    # Validate required fields
    local required_fields=("version" "squads")
    for field in "${required_fields[@]}"; do
        if ! jq -e ".${field}" "${file}" >/dev/null 2>&1; then
            error "Missing required field: ${field}"
            exit 1
        fi
    done

    # Validate each squad
    local squad_count=$(jq '.squads | length' "${file}")
    if [[ ${squad_count} -eq 0 ]]; then
        error "No squads defined in configuration"
        exit 1
    fi

    info "Found ${squad_count} squad(s) to launch"

    # Validate squad structure
    local i=0
    while [[ $i -lt ${squad_count} ]]; do
        local squad_name=$(jq -r ".squads[${i}].name" "${file}")
        local squad_agent=$(jq -r ".squads[${i}].agent" "${file}")
        local squad_tasks=$(jq -r ".squads[${i}].tasks" "${file}")

        if [[ "${squad_name}" == "null" ]] || [[ -z "${squad_name}" ]]; then
            error "Squad ${i}: Missing 'name' field"
            exit 1
        fi

        if [[ "${squad_agent}" == "null" ]] || [[ -z "${squad_agent}" ]]; then
            error "Squad ${squad_name}: Missing 'agent' field"
            exit 1
        fi

        # Validate agent exists
        local agent_file="${PROJECT_ROOT}/.claude/agents/${squad_agent}.md"
        if [[ ! -f "${agent_file}" ]]; then
            error "Squad ${squad_name}: Agent file not found: ${agent_file}"
            exit 1
        fi

        if [[ "${squad_tasks}" == "null" ]]; then
            error "Squad ${squad_name}: Missing 'tasks' field"
            exit 1
        fi

        success "Squad ${i+1}/${squad_count}: ${squad_name} (agent: ${squad_agent}) - Valid"
        ((i++))
    done

    success "All squad definitions validated successfully"
}

#==============================================================================
# Check for Running Squads
#==============================================================================
check_running_squads() {
    if [[ -f "${ORCHESTRATOR_PID_FILE}" ]]; then
        local old_pid=$(cat "${ORCHESTRATOR_PID_FILE}")
        if ps -p "${old_pid}" > /dev/null 2>&1; then
            if [[ "${FORCE_RESTART}" == "true" ]]; then
                warn "Stopping existing orchestrator (PID: ${old_pid})"
                kill "${old_pid}" 2>/dev/null || true
                sleep 2
            else
                error "Squad orchestrator already running (PID: ${old_pid})"
                echo "Use --force to restart or stop it manually"
                exit 1
            fi
        else
            # Stale PID file
            rm -f "${ORCHESTRATOR_PID_FILE}"
        fi
    fi
}

#==============================================================================
# Initialize Session
#==============================================================================
initialize_session() {
    info "Initializing session: ${SESSION_ID}"

    # Create session directories
    mkdir -p "${LOGS_DIR}/${SESSION_ID}"
    mkdir -p "${STATE_DIR}/${SESSION_ID}"

    # Create session metadata
    local session_file="${STATE_DIR}/${SESSION_ID}/metadata.json"
    jq -n \
        --arg session_id "${SESSION_ID}" \
        --arg start_time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg definitions_file "${SQUAD_DEFINITIONS_FILE}" \
        --arg project_root "${PROJECT_ROOT}" \
        '{
            session_id: $session_id,
            start_time: $start_time,
            definitions_file: $definitions_file,
            project_root: $project_root,
            status: "initializing",
            squads: []
        }' > "${session_file}"

    # Save orchestrator PID
    echo "$$" > "${ORCHESTRATOR_PID_FILE}"

    success "Session initialized: ${SESSION_ID}"
}

#==============================================================================
# Launch Squad in Background
#==============================================================================
launch_squad() {
    local squad_index="$1"
    local squad_name=$(jq -r ".squads[${squad_index}].name" "${SQUAD_DEFINITIONS_FILE}")
    local squad_agent=$(jq -r ".squads[${squad_index}].agent" "${SQUAD_DEFINITIONS_FILE}")
    local squad_config=$(jq ".squads[${squad_index}]" "${SQUAD_DEFINITIONS_FILE}")

    info "Launching squad: ${squad_name} (agent: ${squad_agent})"

    # Squad-specific paths
    local squad_log="${LOGS_DIR}/${SESSION_ID}/${squad_name}.log"
    local squad_state="${STATE_DIR}/${SESSION_ID}/${squad_name}.json"
    local squad_pid_file="${STATE_DIR}/${SESSION_ID}/${squad_name}.pid"

    # Create squad state file
    echo "${squad_config}" | jq \
        --arg session_id "${SESSION_ID}" \
        --arg start_time "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
        --arg log_file "${squad_log}" \
        --arg state_file "${squad_state}" \
        '. + {
            session_id: $session_id,
            start_time: $start_time,
            status: "launching",
            log_file: $log_file,
            state_file: $state_file,
            progress: {
                total_tasks: (.tasks | length),
                completed_tasks: 0,
                current_task: null
            }
        }' > "${squad_state}"

    # Launch squad runner in background
    "${UTILS_DIR}/squad-runner.sh" \
        --squad-name "${squad_name}" \
        --squad-agent "${squad_agent}" \
        --squad-config "${squad_state}" \
        --session-id "${SESSION_ID}" \
        --log-file "${squad_log}" \
        > "${squad_log}" 2>&1 &

    local squad_pid=$!
    echo "${squad_pid}" > "${squad_pid_file}"

    # Update squad state with PID
    local tmp_file=$(mktemp)
    jq --arg pid "${squad_pid}" '.pid = $pid | .status = "running"' "${squad_state}" > "${tmp_file}"
    mv "${tmp_file}" "${squad_state}"

    success "Squad launched: ${squad_name} (PID: ${squad_pid})"
    echo "${squad_pid}"
}

#==============================================================================
# Launch All Squads
#==============================================================================
launch_all_squads() {
    local squad_count=$(jq '.squads | length' "${SQUAD_DEFINITIONS_FILE}")
    local squad_pids=()

    header "Launching ${squad_count} Squad(s)"

    local i=0
    while [[ $i -lt ${squad_count} ]]; do
        local squad_pid=$(launch_squad "${i}")
        squad_pids+=("${squad_pid}")

        # Small delay between launches
        sleep 1

        ((i++))
    done

    # Update session metadata
    local session_file="${STATE_DIR}/${SESSION_ID}/metadata.json"
    local tmp_file=$(mktemp)
    jq --argjson pids "$(printf '%s\n' "${squad_pids[@]}" | jq -R . | jq -s .)" \
       '.status = "running" | .squad_pids = $pids' \
       "${session_file}" > "${tmp_file}"
    mv "${tmp_file}" "${session_file}"

    success "All squads launched successfully"
}

#==============================================================================
# Display Summary
#==============================================================================
display_summary() {
    header "Squad Orchestration Summary"

    echo -e "${BOLD}Session ID:${NC} ${SESSION_ID}"
    echo -e "${BOLD}Definitions:${NC} ${SQUAD_DEFINITIONS_FILE}"
    echo -e "${BOLD}Project Root:${NC} ${PROJECT_ROOT}"
    echo ""

    local squad_count=$(jq '.squads | length' "${SQUAD_DEFINITIONS_FILE}")
    echo -e "${BOLD}Squads Launched:${NC} ${squad_count}"

    local i=0
    while [[ $i -lt ${squad_count} ]]; do
        local squad_name=$(jq -r ".squads[${i}].name" "${SQUAD_DEFINITIONS_FILE}")
        local squad_state="${STATE_DIR}/${SESSION_ID}/${squad_name}.json"
        local squad_pid=$(jq -r '.pid' "${squad_state}")
        local squad_log="${LOGS_DIR}/${SESSION_ID}/${squad_name}.log"

        echo -e "  ${GREEN}•${NC} ${squad_name} (PID: ${squad_pid})"
        echo -e "    Log: ${squad_log}"

        ((i++))
    done

    echo ""
    echo -e "${BOLD}Monitoring:${NC}"
    echo -e "  ${CYAN}# View all logs${NC}"
    echo -e "  tail -f ${LOGS_DIR}/${SESSION_ID}/*.log"
    echo ""
    echo -e "  ${CYAN}# Monitor progress${NC}"
    echo -e "  ${SCRIPT_DIR}/monitor-squads.sh --session ${SESSION_ID}"
    echo ""
    echo -e "  ${CYAN}# Stop all squads${NC}"
    echo -e "  ${SCRIPT_DIR}/stop-squads.sh --session ${SESSION_ID}"
    echo ""

    success "Squad orchestration started successfully!"
}

#==============================================================================
# Dry Run Mode
#==============================================================================
run_dry_run() {
    header "DRY RUN MODE - Configuration Validation Only"

    validate_squad_definitions "${SQUAD_DEFINITIONS_FILE}"

    echo ""
    info "Configuration is valid. No squads were launched."
    echo ""
    echo "Run without --dry-run to launch squads:"
    echo "  $0 ${SQUAD_DEFINITIONS_FILE}"
}

#==============================================================================
# Cleanup on Exit
#==============================================================================
cleanup() {
    local exit_code=$?

    if [[ ${exit_code} -ne 0 ]]; then
        error "Orchestrator exiting with error code: ${exit_code}"

        # Clean up PID file on error
        rm -f "${ORCHESTRATOR_PID_FILE}"
    fi

    exit ${exit_code}
}

#==============================================================================
# Main Function
#==============================================================================
main() {
    # Set up cleanup trap
    trap cleanup EXIT INT TERM

    # Clear screen and show banner
    clear
    show_banner

    # Parse arguments
    parse_arguments "$@"

    # Validate configuration
    validate_squad_definitions "${SQUAD_DEFINITIONS_FILE}"

    # Dry run mode
    if [[ "${DRY_RUN}" == "true" ]]; then
        run_dry_run
        exit 0
    fi

    # Check for running squads
    check_running_squads

    # Initialize session
    initialize_session

    # Launch all squads
    launch_all_squads

    # Display summary
    display_summary

    # Success
    exit 0
}

#==============================================================================
# Execute Main
#==============================================================================
main "$@"
