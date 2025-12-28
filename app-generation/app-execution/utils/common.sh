#!/bin/bash

#==============================================================================
# Common Utility Functions for Squad Orchestrator
#==============================================================================

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly MAGENTA='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'
readonly BOLD='\033[1m'

#==============================================================================
# Banner Display
#==============================================================================
show_banner() {
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════════╗
║                                                                   ║
║   ███████╗██╗   ██╗██████╗ ███████╗██████╗  ██████╗ ██████╗ ███████╗
║   ██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔════╝
║   ███████╗██║   ██║██████╔╝█████╗  ██████╔╝██║     ██║   ██║█████╗
║   ╚════██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗██║     ██║   ██║██╔══╝
║   ███████║╚██████╔╝██║     ███████╗██║  ██║╚██████╗╚██████╔╝███████╗
║   ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
║                                                                   ║
║                    Squad Orchestrator v1.0.0                     ║
║              Autonomous Multi-Agent Task Execution               ║
║                                                                   ║
╚═══════════════════════════════════════════════════════════════════╝

EOF
}

#==============================================================================
# Logging Functions
#==============================================================================
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[${timestamp}] [${level}] ${message}"
}

info() {
    echo -e "${BLUE}ℹ${NC} $*"
    log "INFO" "$*" >&2
}

success() {
    echo -e "${GREEN}✓${NC} $*"
    log "SUCCESS" "$*" >&2
}

warn() {
    echo -e "${YELLOW}⚠${NC} $*"
    log "WARN" "$*" >&2
}

error() {
    echo -e "${RED}✗${NC} $*" >&2
    log "ERROR" "$*" >&2
}

header() {
    echo ""
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}  $*${NC}"
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

#==============================================================================
# JSON Utilities
#==============================================================================
json_get() {
    local file="$1"
    local path="$2"
    jq -r "${path}" "${file}" 2>/dev/null || echo "null"
}

json_set() {
    local file="$1"
    local path="$2"
    local value="$3"
    local tmp_file=$(mktemp)

    jq "${path} = ${value}" "${file}" > "${tmp_file}" && mv "${tmp_file}" "${file}"
}

json_merge() {
    local file1="$1"
    local file2="$2"
    local output="$3"

    jq -s '.[0] * .[1]' "${file1}" "${file2}" > "${output}"
}

#==============================================================================
# File System Utilities
#==============================================================================
ensure_directory() {
    local dir="$1"
    if [[ ! -d "${dir}" ]]; then
        mkdir -p "${dir}"
    fi
}

safe_delete() {
    local path="$1"
    if [[ -e "${path}" ]]; then
        rm -rf "${path}"
    fi
}

atomic_write() {
    local file="$1"
    local content="$2"
    local tmp_file=$(mktemp)

    echo "${content}" > "${tmp_file}"
    mv "${tmp_file}" "${file}"
}

#==============================================================================
# Process Management
#==============================================================================
is_process_running() {
    local pid="$1"
    ps -p "${pid}" > /dev/null 2>&1
}

kill_process_gracefully() {
    local pid="$1"
    local timeout="${2:-30}"

    if is_process_running "${pid}"; then
        # Try SIGTERM first
        kill -TERM "${pid}" 2>/dev/null || return 1

        # Wait for graceful shutdown
        local elapsed=0
        while is_process_running "${pid}" && [[ ${elapsed} -lt ${timeout} ]]; do
            sleep 1
            ((elapsed++))
        done

        # Force kill if still running
        if is_process_running "${pid}"; then
            kill -KILL "${pid}" 2>/dev/null || return 1
        fi
    fi
}

wait_for_process() {
    local pid="$1"
    local timeout="${2:-0}"

    if [[ ${timeout} -eq 0 ]]; then
        wait "${pid}" 2>/dev/null
    else
        local elapsed=0
        while is_process_running "${pid}" && [[ ${elapsed} -lt ${timeout} ]]; do
            sleep 1
            ((elapsed++))
        done

        if is_process_running "${pid}"; then
            return 1
        fi
    fi
}

#==============================================================================
# Time Utilities
#==============================================================================
timestamp_iso8601() {
    date -u +%Y-%m-%dT%H:%M:%SZ
}

timestamp_unix() {
    date +%s
}

duration_seconds() {
    local start="$1"
    local end="$2"
    echo $((end - start))
}

format_duration() {
    local seconds="$1"
    local hours=$((seconds / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))

    if [[ ${hours} -gt 0 ]]; then
        printf "%dh %dm %ds" ${hours} ${minutes} ${secs}
    elif [[ ${minutes} -gt 0 ]]; then
        printf "%dm %ds" ${minutes} ${secs}
    else
        printf "%ds" ${secs}
    fi
}

#==============================================================================
# Validation
#==============================================================================
validate_command_exists() {
    local cmd="$1"
    if ! command -v "${cmd}" &> /dev/null; then
        error "Required command not found: ${cmd}"
        return 1
    fi
}

validate_file_exists() {
    local file="$1"
    if [[ ! -f "${file}" ]]; then
        error "Required file not found: ${file}"
        return 1
    fi
}

validate_directory_exists() {
    local dir="$1"
    if [[ ! -d "${dir}" ]]; then
        error "Required directory not found: ${dir}"
        return 1
    fi
}

#==============================================================================
# Progress Indicators
#==============================================================================
spinner() {
    local pid=$1
    local delay=0.1
    local spinstr='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
    local i=0

    while is_process_running "${pid}"; do
        local temp=${spinstr:$i:1}
        printf " ${CYAN}%s${NC} " "$temp"
        sleep ${delay}
        printf "\b\b\b"
        i=$(((i + 1) % ${#spinstr}))
    done
    printf "    \b\b\b\b"
}

progress_bar() {
    local current="$1"
    local total="$2"
    local width="${3:-50}"

    local percent=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "\r${CYAN}["
    printf "%${filled}s" | tr ' ' '='
    printf "%${empty}s" | tr ' ' ' '
    printf "]${NC} %3d%%" ${percent}
}

#==============================================================================
# Checksum and Verification
#==============================================================================
calculate_checksum() {
    local file="$1"
    if command -v sha256sum &> /dev/null; then
        sha256sum "${file}" | cut -d' ' -f1
    elif command -v shasum &> /dev/null; then
        shasum -a 256 "${file}" | cut -d' ' -f1
    else
        error "No checksum utility available"
        return 1
    fi
}

verify_checksum() {
    local file="$1"
    local expected="$2"
    local actual=$(calculate_checksum "${file}")

    [[ "${actual}" == "${expected}" ]]
}

#==============================================================================
# Lock Management
#==============================================================================
acquire_lock() {
    local lock_file="$1"
    local timeout="${2:-30}"
    local elapsed=0

    while [[ ${elapsed} -lt ${timeout} ]]; do
        if mkdir "${lock_file}" 2>/dev/null; then
            echo $$ > "${lock_file}/pid"
            return 0
        fi

        # Check if lock holder is still alive
        if [[ -f "${lock_file}/pid" ]]; then
            local holder_pid=$(cat "${lock_file}/pid")
            if ! is_process_running "${holder_pid}"; then
                # Stale lock, remove it
                rm -rf "${lock_file}"
                continue
            fi
        fi

        sleep 1
        ((elapsed++))
    done

    error "Failed to acquire lock: ${lock_file}"
    return 1
}

release_lock() {
    local lock_file="$1"
    rm -rf "${lock_file}"
}

#==============================================================================
# Network Utilities
#==============================================================================
wait_for_http() {
    local url="$1"
    local timeout="${2:-60}"
    local elapsed=0

    while [[ ${elapsed} -lt ${timeout} ]]; do
        if curl -sf "${url}" > /dev/null 2>&1; then
            return 0
        fi
        sleep 1
        ((elapsed++))
    done

    return 1
}

#==============================================================================
# Error Handling
#==============================================================================
exit_on_error() {
    local exit_code=$?
    if [[ ${exit_code} -ne 0 ]]; then
        error "Command failed with exit code ${exit_code}"
        exit ${exit_code}
    fi
}

trap_error() {
    local exit_code=$?
    local line_number=$1
    error "Error on line ${line_number} (exit code: ${exit_code})"
    exit ${exit_code}
}

#==============================================================================
# Initialization
#==============================================================================
require_commands() {
    local missing=()

    for cmd in "$@"; do
        if ! command -v "${cmd}" &> /dev/null; then
            missing+=("${cmd}")
        fi
    done

    if [[ ${#missing[@]} -gt 0 ]]; then
        error "Missing required commands: ${missing[*]}"
        return 1
    fi
}

init_common() {
    # Ensure required commands exist
    require_commands jq date mkdir rm mv cat
}

# Auto-initialize
init_common
