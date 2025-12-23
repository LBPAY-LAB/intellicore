#!/bin/bash

#==============================================================================
# Squad Runner - Executes Individual Squad in Background
#==============================================================================

set -euo pipefail

# Parse arguments
SQUAD_NAME=""
SQUAD_AGENT=""
SQUAD_CONFIG=""
SESSION_ID=""
LOG_FILE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --squad-name)
            SQUAD_NAME="$2"
            shift 2
            ;;
        --squad-agent)
            SQUAD_AGENT="$2"
            shift 2
            ;;
        --squad-config)
            SQUAD_CONFIG="$2"
            shift 2
            ;;
        --session-id)
            SESSION_ID="$2"
            shift 2
            ;;
        --log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        *)
            echo "Unknown argument: $1"
            exit 1
            ;;
    esac
done

# Validate required parameters
if [[ -z "${SQUAD_NAME}" ]] || [[ -z "${SQUAD_AGENT}" ]] || [[ -z "${SQUAD_CONFIG}" ]]; then
    echo "ERROR: Missing required parameters"
    exit 1
fi

# Redirect all output to log file if specified
if [[ -n "${LOG_FILE}" ]]; then
    exec > "${LOG_FILE}" 2>&1
fi

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

# Source utilities
source "${SCRIPT_DIR}/common.sh"
source "${SCRIPT_DIR}/logging.sh"

#==============================================================================
# Squad Runner Main Logic
#==============================================================================

log_squad_start "${SQUAD_NAME}" "${LOG_FILE}"

# Read squad configuration
SQUAD_DATA=$(cat "${SQUAD_CONFIG}")
TASKS=$(echo "${SQUAD_DATA}" | jq -r '.tasks')
TASK_COUNT=$(echo "${TASKS}" | jq 'length')

info "Squad ${SQUAD_NAME} starting with ${TASK_COUNT} tasks"

# Update squad state
update_squad_state "running" "0" "null"

# Track timing
START_TIME=$(timestamp_unix)
TASKS_COMPLETED=0

#==============================================================================
# Helper Functions
#==============================================================================

update_squad_state() {
    local status="$1"
    local completed="$2"
    local current_task="$3"

    local tmp_file=$(mktemp)
    jq --arg status "${status}" \
       --arg completed "${completed}" \
       --arg current "${current_task}" \
       --arg updated "$(timestamp_iso8601)" \
       '.status = $status |
        .progress.completed_tasks = ($completed | tonumber) |
        .progress.current_task = $current |
        .last_updated = $updated' \
       "${SQUAD_CONFIG}" > "${tmp_file}"
    mv "${tmp_file}" "${SQUAD_CONFIG}"
}

check_task_dependencies() {
    local task_id="$1"
    local depends_on=$(echo "${TASKS}" | jq -r ".[] | select(.id == \"${task_id}\") | .depends_on // []")

    if [[ "${depends_on}" == "[]" ]] || [[ "${depends_on}" == "null" ]]; then
        return 0
    fi

    # Check if all dependencies are complete
    local all_complete=true
    for dep_id in $(echo "${depends_on}" | jq -r '.[]'); do
        local dep_status=$(get_task_status "${dep_id}")
        if [[ "${dep_status}" != "completed" ]]; then
            all_complete=false
            break
        fi
    done

    if [[ "${all_complete}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

wait_for_events() {
    local task_id="$1"
    local waits_for=$(echo "${TASKS}" | jq -r ".[] | select(.id == \"${task_id}\") | .waits_for_events // []")

    if [[ "${waits_for}" == "[]" ]] || [[ "${waits_for}" == "null" ]]; then
        return 0
    fi

    info "Task ${task_id} waiting for events: ${waits_for}"

    # Wait for events from other squads
    local all_received=false
    local max_wait=3600  # 1 hour timeout
    local elapsed=0

    while [[ "${all_received}" == "false" ]] && [[ ${elapsed} -lt ${max_wait} ]]; do
        all_received=true

        for event in $(echo "${waits_for}" | jq -r '.[]'); do
            if ! check_event_published "${event}"; then
                all_received=false
                break
            fi
        done

        if [[ "${all_received}" == "false" ]]; then
            sleep 10
            ((elapsed+=10))
        fi
    done

    if [[ "${all_received}" == "true" ]]; then
        success "All required events received for task ${task_id}"
        return 0
    else
        error "Timeout waiting for events for task ${task_id}"
        return 1
    fi
}

check_event_published() {
    local event="$1"
    local events_dir="${SCRIPT_DIR}/../state/${SESSION_ID}/events"

    [[ -f "${events_dir}/${event}.event" ]]
}

publish_events() {
    local events=$(echo "${SQUAD_DATA}" | jq -r '.communication.publishes // []')

    if [[ "${events}" == "[]" ]] || [[ "${events}" == "null" ]]; then
        return 0
    fi

    local events_dir="${SCRIPT_DIR}/../state/${SESSION_ID}/events"
    mkdir -p "${events_dir}"

    for event in $(echo "${events}" | jq -r '.[]'); do
        local event_file="${events_dir}/${event}.event"
        jq -n \
            --arg event "${event}" \
            --arg squad "${SQUAD_NAME}" \
            --arg timestamp "$(timestamp_iso8601)" \
            '{
                event: $event,
                published_by: $squad,
                timestamp: $timestamp
            }' > "${event_file}"

        info "Published event: ${event}"
    done
}

get_task_status() {
    local task_id="$1"
    echo "${TASKS}" | jq -r ".[] | select(.id == \"${task_id}\") | .status // \"pending\""
}

set_task_status() {
    local task_id="$1"
    local status="$2"

    local tmp_file=$(mktemp)
    echo "${TASKS}" | jq "map(if .id == \"${task_id}\" then .status = \"${status}\" else . end)" > "${tmp_file}"
    TASKS=$(cat "${tmp_file}")
    rm "${tmp_file}"
}

execute_task() {
    local task_index="$1"
    local task=$(echo "${TASKS}" | jq ".[$task_index]")

    local task_id=$(echo "${task}" | jq -r '.id')
    local task_title=$(echo "${task}" | jq -r '.title')
    local task_prompt=$(echo "${task}" | jq -r '.prompt')
    local task_type=$(echo "${task}" | jq -r '.type')

    log_task_start "${task_id}" "${task_title}" "${LOG_FILE}"

    # Update current task
    update_squad_state "running" "${TASKS_COMPLETED}" "${task_id}"

    # Check dependencies
    if ! check_task_dependencies "${task_id}"; then
        warn "Task ${task_id} dependencies not met, skipping"
        return 1
    fi

    # Wait for events if needed
    if ! wait_for_events "${task_id}"; then
        error "Task ${task_id} event dependencies not met"
        return 1
    fi

    # Task start time
    local task_start=$(timestamp_unix)

    # Execute task via Claude Code agent
    info "Executing task ${task_id} with agent ${SQUAD_AGENT}"

    # Build Claude Code command
    local claude_cmd="claude"
    local agent_file="${PROJECT_ROOT}/.claude/agents/${SQUAD_AGENT}.md"

    # Create temporary prompt file
    local prompt_file=$(mktemp)
    cat > "${prompt_file}" << EOF
${task_prompt}

Task ID: ${task_id}
Task Title: ${task_title}
Task Type: ${task_type}

Execute this task autonomously. No approvals required.
Document your work and report completion.
EOF

    # Execute with Claude Code
    # Note: This assumes Claude Code CLI supports agent execution
    # Adjust based on actual Claude Code CLI capabilities

    cd "${PROJECT_ROOT}"

    if ${claude_cmd} --agent "${SQUAD_AGENT}" < "${prompt_file}"; then
        local task_end=$(timestamp_unix)
        local task_duration=$(format_duration $(duration_seconds ${task_start} ${task_end}))

        log_task_complete "${task_id}" "${task_title}" "${task_duration}" "${LOG_FILE}"

        # Mark task as complete
        set_task_status "${task_id}" "completed"
        ((TASKS_COMPLETED++))

        # Update state
        update_squad_state "running" "${TASKS_COMPLETED}" "null"

        # Validate outputs if specified
        validate_task_outputs "${task_index}"

        # Run validation commands if specified
        run_validation_commands "${task_index}"

        rm -f "${prompt_file}"
        return 0
    else
        local task_end=$(timestamp_unix)
        local task_duration=$(format_duration $(duration_seconds ${task_start} ${task_end}))

        log_task_failed "${task_id}" "${task_title}" "Claude execution failed" "${LOG_FILE}"

        # Mark task as failed
        set_task_status "${task_id}" "failed"

        rm -f "${prompt_file}"
        return 1
    fi
}

validate_task_outputs() {
    local task_index="$1"
    local outputs=$(echo "${TASKS}" | jq -r ".[$task_index].outputs // []")

    if [[ "${outputs}" == "[]" ]] || [[ "${outputs}" == "null" ]]; then
        return 0
    fi

    local all_exist=true
    for output in $(echo "${outputs}" | jq -r '.[]'); do
        local full_path="${PROJECT_ROOT}/${output}"
        if [[ ! -e "${full_path}" ]]; then
            warn "Expected output not found: ${output}"
            all_exist=false
        else
            success "Output validated: ${output}"
        fi
    done

    if [[ "${all_exist}" == "true" ]]; then
        return 0
    else
        return 1
    fi
}

run_validation_commands() {
    local task_index="$1"
    local commands=$(echo "${TASKS}" | jq -r ".[$task_index].validation_commands // []")

    if [[ "${commands}" == "[]" ]] || [[ "${commands}" == "null" ]]; then
        return 0
    fi

    info "Running validation commands..."

    cd "${PROJECT_ROOT}"

    for cmd in $(echo "${commands}" | jq -r '.[]'); do
        info "Executing: ${cmd}"
        if eval "${cmd}"; then
            success "Validation passed: ${cmd}"
        else
            error "Validation failed: ${cmd}"
            return 1
        fi
    done

    return 0
}

#==============================================================================
# Main Execution Loop
#==============================================================================

# Execute tasks in order
for i in $(seq 0 $((TASK_COUNT - 1))); do
    if execute_task "$i"; then
        success "Task $((i + 1))/${TASK_COUNT} completed"
    else
        error "Task $((i + 1))/${TASK_COUNT} failed"

        # Check if we should retry
        local auto_retry=$(echo "${SQUAD_DATA}" | jq -r '.global_config.auto_retry_on_failure // false')
        if [[ "${auto_retry}" == "true" ]]; then
            warn "Retrying task..."
            sleep 5
            if execute_task "$i"; then
                success "Task $((i + 1))/${TASK_COUNT} completed on retry"
            else
                error "Task $((i + 1))/${TASK_COUNT} failed on retry, stopping squad"
                update_squad_state "failed" "${TASKS_COMPLETED}" "null"
                exit 1
            fi
        else
            update_squad_state "failed" "${TASKS_COMPLETED}" "null"
            exit 1
        fi
    fi
done

#==============================================================================
# Squad Completion
#==============================================================================

END_TIME=$(timestamp_unix)
TOTAL_DURATION=$(format_duration $(duration_seconds ${START_TIME} ${END_TIME}))

# Publish completion events
publish_events

# Update final state
update_squad_state "completed" "${TASKS_COMPLETED}" "null"

log_squad_complete "${SQUAD_NAME}" "${TASKS_COMPLETED}" "${TOTAL_DURATION}" "${LOG_FILE}"

success "Squad ${SQUAD_NAME} completed successfully!"
exit 0
