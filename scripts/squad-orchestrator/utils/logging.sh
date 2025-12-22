#!/bin/bash

#==============================================================================
# Logging Utilities for Squad Orchestrator
#==============================================================================

# Log levels
readonly LOG_LEVEL_DEBUG=0
readonly LOG_LEVEL_INFO=1
readonly LOG_LEVEL_WARN=2
readonly LOG_LEVEL_ERROR=3
readonly LOG_LEVEL_CRITICAL=4

# Current log level (default: INFO)
LOG_LEVEL=${LOG_LEVEL:-${LOG_LEVEL_INFO}}

#==============================================================================
# Structured Logging
#==============================================================================
log_structured() {
    local level="$1"
    local message="$2"
    local squad_name="${3:-}"
    local task_id="${4:-}"
    local context="${5:-}"

    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local log_entry=$(jq -n \
        --arg timestamp "${timestamp}" \
        --arg level "${level}" \
        --arg message "${message}" \
        --arg squad "${squad_name}" \
        --arg task "${task_id}" \
        --arg context "${context}" \
        '{
            timestamp: $timestamp,
            level: $level,
            message: $message,
            squad: $squad,
            task: $task,
            context: $context
        }')

    echo "${log_entry}"
}

log_to_file() {
    local log_file="$1"
    local level="$2"
    shift 2
    local message="$*"

    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" >> "${log_file}"
}

#==============================================================================
# Log Level Functions
#==============================================================================
log_debug() {
    if [[ ${LOG_LEVEL} -le ${LOG_LEVEL_DEBUG} ]]; then
        echo -e "${CYAN}[DEBUG]${NC} $*" >&2
    fi
}

log_info() {
    if [[ ${LOG_LEVEL} -le ${LOG_LEVEL_INFO} ]]; then
        echo -e "${BLUE}[INFO]${NC} $*" >&2
    fi
}

log_warn() {
    if [[ ${LOG_LEVEL} -le ${LOG_LEVEL_WARN} ]]; then
        echo -e "${YELLOW}[WARN]${NC} $*" >&2
    fi
}

log_error() {
    if [[ ${LOG_LEVEL} -le ${LOG_LEVEL_ERROR} ]]; then
        echo -e "${RED}[ERROR]${NC} $*" >&2
    fi
}

log_critical() {
    echo -e "${RED}${BOLD}[CRITICAL]${NC} $*" >&2
}

#==============================================================================
# Task Logging
#==============================================================================
log_task_start() {
    local task_id="$1"
    local task_title="$2"
    local log_file="${3:-}"

    local message="Task started: ${task_id} - ${task_title}"

    if [[ -n "${log_file}" ]]; then
        log_to_file "${log_file}" "TASK_START" "${message}"
    fi

    info "${message}"
}

log_task_complete() {
    local task_id="$1"
    local task_title="$2"
    local duration="$3"
    local log_file="${4:-}"

    local message="Task completed: ${task_id} - ${task_title} (${duration})"

    if [[ -n "${log_file}" ]]; then
        log_to_file "${log_file}" "TASK_COMPLETE" "${message}"
    fi

    success "${message}"
}

log_task_failed() {
    local task_id="$1"
    local task_title="$2"
    local error_message="$3"
    local log_file="${4:-}"

    local message="Task failed: ${task_id} - ${task_title}: ${error_message}"

    if [[ -n "${log_file}" ]]; then
        log_to_file "${log_file}" "TASK_FAILED" "${message}"
    fi

    error "${message}"
}

#==============================================================================
# Squad Logging
#==============================================================================
log_squad_start() {
    local squad_name="$1"
    local log_file="${2:-}"

    local message="Squad started: ${squad_name}"

    if [[ -n "${log_file}" ]]; then
        log_to_file "${log_file}" "SQUAD_START" "${message}"
        log_structured "INFO" "${message}" "${squad_name}" "" "squad_lifecycle" >> "${log_file}"
    fi

    header "${message}"
}

log_squad_complete() {
    local squad_name="$1"
    local tasks_completed="$2"
    local duration="$3"
    local log_file="${4:-}"

    local message="Squad completed: ${squad_name} (${tasks_completed} tasks, ${duration})"

    if [[ -n "${log_file}" ]]; then
        log_to_file "${log_file}" "SQUAD_COMPLETE" "${message}"
        log_structured "INFO" "${message}" "${squad_name}" "" "squad_lifecycle" >> "${log_file}"
    fi

    success "${message}"
}

log_squad_failed() {
    local squad_name="$1"
    local error_message="$2"
    local log_file="${3:-}"

    local message="Squad failed: ${squad_name}: ${error_message}"

    if [[ -n "${log_file}" ]]; then
        log_to_file "${log_file}" "SQUAD_FAILED" "${message}"
        log_structured "ERROR" "${message}" "${squad_name}" "" "squad_lifecycle" >> "${log_file}"
    fi

    error "${message}"
}

#==============================================================================
# Event Logging
#==============================================================================
log_event() {
    local event_type="$1"
    local event_data="$2"
    local log_file="${3:-}"

    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local event=$(jq -n \
        --arg timestamp "${timestamp}" \
        --arg type "${event_type}" \
        --argjson data "${event_data}" \
        '{
            timestamp: $timestamp,
            type: $type,
            data: $data
        }')

    if [[ -n "${log_file}" ]]; then
        echo "${event}" >> "${log_file}"
    fi

    echo "${event}"
}

#==============================================================================
# Progress Logging
#==============================================================================
log_progress() {
    local squad_name="$1"
    local current="$2"
    local total="$3"
    local log_file="${4:-}"

    local percent=$((current * 100 / total))
    local message="Progress: ${squad_name} - ${current}/${total} tasks (${percent}%)"

    if [[ -n "${log_file}" ]]; then
        log_to_file "${log_file}" "PROGRESS" "${message}"
    fi

    info "${message}"
}

#==============================================================================
# Log Rotation
#==============================================================================
rotate_log() {
    local log_file="$1"
    local max_size_mb="${2:-100}"
    local max_files="${3:-5}"

    if [[ ! -f "${log_file}" ]]; then
        return 0
    fi

    local file_size_mb=$(du -m "${log_file}" | cut -f1)

    if [[ ${file_size_mb} -ge ${max_size_mb} ]]; then
        # Rotate logs
        for i in $(seq $((max_files - 1)) -1 1); do
            local old_file="${log_file}.${i}"
            local new_file="${log_file}.$((i + 1))"

            if [[ -f "${old_file}" ]]; then
                mv "${old_file}" "${new_file}"
            fi
        done

        mv "${log_file}" "${log_file}.1"
        touch "${log_file}"

        log_info "Log rotated: ${log_file}"
    fi
}

#==============================================================================
# Log Aggregation
#==============================================================================
aggregate_logs() {
    local log_dir="$1"
    local output_file="$2"
    local format="${3:-json}"

    if [[ "${format}" == "json" ]]; then
        # Aggregate JSON logs
        find "${log_dir}" -name "*.log" -type f -exec cat {} \; | \
            grep -E '^\{' | \
            jq -s '.' > "${output_file}"
    else
        # Simple concatenation
        find "${log_dir}" -name "*.log" -type f -exec cat {} \; > "${output_file}"
    fi

    log_info "Logs aggregated to: ${output_file}"
}

#==============================================================================
# Log Analysis
#==============================================================================
count_log_level() {
    local log_file="$1"
    local level="$2"

    grep -c "\[${level}\]" "${log_file}" 2>/dev/null || echo "0"
}

get_error_summary() {
    local log_file="$1"

    local errors=$(count_log_level "${log_file}" "ERROR")
    local warnings=$(count_log_level "${log_file}" "WARN")
    local criticals=$(count_log_level "${log_file}" "CRITICAL")

    echo "Errors: ${errors}, Warnings: ${warnings}, Critical: ${criticals}"
}

extract_errors() {
    local log_file="$1"
    local output_file="${2:-/dev/stdout}"

    grep "\[ERROR\]\|\[CRITICAL\]" "${log_file}" > "${output_file}"
}

#==============================================================================
# Log Formatting
#==============================================================================
colorize_log_level() {
    local line="$1"

    echo "${line}" | \
        sed "s/\[DEBUG\]/${CYAN}[DEBUG]${NC}/g" | \
        sed "s/\[INFO\]/${BLUE}[INFO]${NC}/g" | \
        sed "s/\[WARN\]/${YELLOW}[WARN]${NC}/g" | \
        sed "s/\[ERROR\]/${RED}[ERROR]${NC}/g" | \
        sed "s/\[CRITICAL\]/${RED}${BOLD}[CRITICAL]${NC}/g"
}

tail_log_colorized() {
    local log_file="$1"
    local lines="${2:-50}"

    tail -n "${lines}" -f "${log_file}" | while read -r line; do
        colorize_log_level "${line}"
    done
}

#==============================================================================
# Export Functions
#==============================================================================
export -f log_structured
export -f log_to_file
export -f log_debug
export -f log_info
export -f log_warn
export -f log_error
export -f log_critical
export -f log_task_start
export -f log_task_complete
export -f log_task_failed
export -f log_squad_start
export -f log_squad_complete
export -f log_squad_failed
export -f log_event
export -f log_progress
