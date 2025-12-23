#!/usr/bin/env bash

################################################################################
# Card System - Hierarchical Kanban for Squad Orchestrator v2.0
################################################################################
# Manages digital cards that flow between squads in a hierarchical workflow
#
# Card States: TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED
# Card Flow: Produto → Arquitetura → Engenharia → QA
#
# Version: 2.0.0
# License: MIT
################################################################################

set -euo pipefail

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh" 2>/dev/null || true
source "${SCRIPT_DIR}/logging.sh" 2>/dev/null || true

# Card system directories
CARDS_DIR="${STATE_DIR:-./state}/cards"
CARDS_INDEX="${CARDS_DIR}/index.json"
CARDS_ARCHIVE="${CARDS_DIR}/archive"
CARDS_TEMPLATES="${CARDS_DIR}/templates"

# Card states
readonly CARD_STATE_TODO="TODO"
readonly CARD_STATE_IN_PROGRESS="IN_PROGRESS"
readonly CARD_STATE_IN_REVIEW="IN_REVIEW"
readonly CARD_STATE_DONE="DONE"
readonly CARD_STATE_BLOCKED="BLOCKED"

# Card types
readonly CARD_TYPE_FEATURE="feature"
readonly CARD_TYPE_BUGFIX="bugfix"
readonly CARD_TYPE_IMPROVEMENT="improvement"
readonly CARD_TYPE_TECHNICAL="technical"
readonly CARD_TYPE_DOCUMENTATION="documentation"

# Priority levels
readonly PRIORITY_CRITICAL="CRITICAL"
readonly PRIORITY_HIGH="HIGH"
readonly PRIORITY_MEDIUM="MEDIUM"
readonly PRIORITY_LOW="LOW"

################################################################################
# Initialize Card System
################################################################################
card_system_init() {
    log_info "Initializing card system..."

    # Create directories
    mkdir -p "${CARDS_DIR}"
    mkdir -p "${CARDS_ARCHIVE}"
    mkdir -p "${CARDS_TEMPLATES}"

    # Initialize index if not exists
    if [[ ! -f "${CARDS_INDEX}" ]]; then
        cat > "${CARDS_INDEX}" <<EOF
{
  "version": "2.0.0",
  "initialized_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "last_card_id": 0,
  "cards": {},
  "stats": {
    "total_cards": 0,
    "by_status": {
      "TODO": 0,
      "IN_PROGRESS": 0,
      "IN_REVIEW": 0,
      "DONE": 0,
      "BLOCKED": 0
    },
    "by_type": {},
    "by_squad": {}
  }
}
EOF
        log_success "Card system initialized"
    else
        log_info "Card system already initialized"
    fi
}

################################################################################
# Generate Card ID
################################################################################
card_generate_id() {
    local prefix="${1:-CARD}"

    # Get next card number
    local last_id=$(jq -r '.last_card_id // 0' "${CARDS_INDEX}")
    local next_id=$((last_id + 1))

    # Update index
    jq --arg id "$next_id" '.last_card_id = ($id | tonumber)' \
        "${CARDS_INDEX}" > "${CARDS_INDEX}.tmp"
    mv "${CARDS_INDEX}.tmp" "${CARDS_INDEX}"

    # Format ID with padding
    printf "%s-%04d" "${prefix}" "${next_id}"
}

################################################################################
# Create Card
################################################################################
card_create() {
    local title="$1"
    local type="$2"
    local priority="$3"
    local created_by_squad="$4"
    local assigned_to_squad="$5"
    local assigned_to_agent="${6:-}"
    local description="${7:-}"
    local parent_card="${8:-}"

    # Generate card ID
    local card_id=$(card_generate_id)
    local card_file="${CARDS_DIR}/${card_id}.json"

    log_info "Creating card: ${card_id} - ${title}"

    # Create card structure
    cat > "${card_file}" <<EOF
{
  "id": "${card_id}",
  "title": "${title}",
  "description": "${description}",
  "type": "${type}",
  "priority": "${priority}",
  "status": "${CARD_STATE_TODO}",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "updated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "created_by_squad": "${created_by_squad}",
  "assigned_to_squad": "${assigned_to_squad}",
  "assigned_to_agent": "${assigned_to_agent}",
  "parent_card": "${parent_card}",
  "children_cards": [],
  "dependencies": [],
  "blocked_by": [],
  "acceptance_criteria": [],
  "technical_spec": {},
  "qa_checklist": [],
  "attachments": [],
  "comments": [],
  "history": [
    {
      "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
      "action": "created",
      "by": "${created_by_squad}",
      "from_state": null,
      "to_state": "${CARD_STATE_TODO}",
      "comment": "Card created"
    }
  ],
  "metrics": {
    "time_in_todo": 0,
    "time_in_progress": 0,
    "time_in_review": 0,
    "cycle_time": 0,
    "qa_cycles": 0
  }
}
EOF

    # Update index
    _card_update_index "${card_id}" "add"

    # Link to parent if exists
    if [[ -n "${parent_card}" ]] && [[ "${parent_card}" != "null" ]]; then
        card_add_child "${parent_card}" "${card_id}"
    fi

    log_success "Card created: ${card_id}"
    echo "${card_id}"
}

################################################################################
# Get Card
################################################################################
card_get() {
    local card_id="$1"
    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    cat "${card_file}"
}

################################################################################
# Update Card Status
################################################################################
card_update_status() {
    local card_id="$1"
    local new_status="$2"
    local updated_by="${3:-system}"
    local comment="${4:-Status updated}"

    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    local old_status=$(jq -r '.status' "${card_file}")

    log_info "Updating card ${card_id}: ${old_status} → ${new_status}"

    # Update card
    jq --arg status "${new_status}" \
       --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       --arg by "${updated_by}" \
       --arg old_status "${old_status}" \
       --arg comment "${comment}" \
       '.status = $status |
        .updated_at = $updated_at |
        .history += [{
          "timestamp": $updated_at,
          "action": "status_change",
          "by": $by,
          "from_state": $old_status,
          "to_state": $status,
          "comment": $comment
        }]' \
        "${card_file}" > "${card_file}.tmp"

    mv "${card_file}.tmp" "${card_file}"

    # Update index stats
    _card_update_index "${card_id}" "update"

    # Trigger status change event
    _card_emit_event "status_changed" "${card_id}" "${old_status}" "${new_status}"

    log_success "Card ${card_id} updated to ${new_status}"
}

################################################################################
# Assign Card
################################################################################
card_assign() {
    local card_id="$1"
    local squad="$2"
    local agent="${3:-}"
    local assigned_by="${4:-system}"

    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    log_info "Assigning card ${card_id} to ${squad}/${agent}"

    jq --arg squad "${squad}" \
       --arg agent "${agent}" \
       --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       --arg by "${assigned_by}" \
       '.assigned_to_squad = $squad |
        .assigned_to_agent = $agent |
        .updated_at = $updated_at |
        .history += [{
          "timestamp": $updated_at,
          "action": "assigned",
          "by": $by,
          "comment": ("Assigned to " + $squad + "/" + $agent)
        }]' \
        "${card_file}" > "${card_file}.tmp"

    mv "${card_file}.tmp" "${card_file}"

    # Trigger assignment event
    _card_emit_event "card_assigned" "${card_id}" "${squad}" "${agent}"

    log_success "Card ${card_id} assigned to ${squad}/${agent}"
}

################################################################################
# Add Child Card
################################################################################
card_add_child() {
    local parent_id="$1"
    local child_id="$2"

    local parent_file="${CARDS_DIR}/${parent_id}.json"

    if [[ ! -f "${parent_file}" ]]; then
        log_error "Parent card not found: ${parent_id}"
        return 1
    fi

    jq --arg child "${child_id}" \
       --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       '.children_cards += [$child] | .children_cards |= unique |
        .updated_at = $updated_at' \
        "${parent_file}" > "${parent_file}.tmp"

    mv "${parent_file}.tmp" "${parent_file}"
}

################################################################################
# Add Dependency
################################################################################
card_add_dependency() {
    local card_id="$1"
    local depends_on_id="$2"

    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    jq --arg dep "${depends_on_id}" \
       --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       '.dependencies += [$dep] | .dependencies |= unique |
        .updated_at = $updated_at' \
        "${card_file}" > "${card_file}.tmp"

    mv "${card_file}.tmp" "${card_file}"

    log_info "Added dependency: ${card_id} depends on ${depends_on_id}"
}

################################################################################
# Block Card
################################################################################
card_block() {
    local card_id="$1"
    local blocked_by="${2:-}"
    local reason="${3:-Blocked}"
    local blocker="${4:-system}"

    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    log_warn "Blocking card ${card_id}: ${reason}"

    jq --arg status "${CARD_STATE_BLOCKED}" \
       --arg blocked_by "${blocked_by}" \
       --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       --arg reason "${reason}" \
       --arg blocker "${blocker}" \
       '.status = $status |
        .blocked_by += (if $blocked_by != "" then [$blocked_by] else [] end) |
        .updated_at = $updated_at |
        .history += [{
          "timestamp": $updated_at,
          "action": "blocked",
          "by": $blocker,
          "comment": $reason
        }]' \
        "${card_file}" > "${card_file}.tmp"

    mv "${card_file}.tmp" "${card_file}"

    _card_emit_event "card_blocked" "${card_id}" "${reason}" ""
}

################################################################################
# Unblock Card
################################################################################
card_unblock() {
    local card_id="$1"
    local unblocked_by="${2:-system}"
    local comment="${3:-Unblocked}"

    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    log_info "Unblocking card ${card_id}"

    jq --arg status "${CARD_STATE_TODO}" \
       --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       --arg by "${unblocked_by}" \
       --arg comment "${comment}" \
       '.status = $status |
        .blocked_by = [] |
        .updated_at = $updated_at |
        .history += [{
          "timestamp": $updated_at,
          "action": "unblocked",
          "by": $by,
          "comment": $comment
        }]' \
        "${card_file}" > "${card_file}.tmp"

    mv "${card_file}.tmp" "${card_file}"

    _card_emit_event "card_unblocked" "${card_id}" "" ""
}

################################################################################
# Add Comment to Card
################################################################################
card_add_comment() {
    local card_id="$1"
    local author="$2"
    local comment="$3"

    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    jq --arg author "${author}" \
       --arg comment "${comment}" \
       --arg timestamp "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       '.comments += [{
          "author": $author,
          "timestamp": $timestamp,
          "comment": $comment
        }] |
        .updated_at = $timestamp' \
        "${card_file}" > "${card_file}.tmp"

    mv "${card_file}.tmp" "${card_file}"
}

################################################################################
# Update Technical Spec
################################################################################
card_update_spec() {
    local card_id="$1"
    local spec_json="$2"

    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    jq --argjson spec "${spec_json}" \
       --arg updated_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       '.technical_spec = $spec |
        .updated_at = $updated_at' \
        "${card_file}" > "${card_file}.tmp"

    mv "${card_file}.tmp" "${card_file}"
}

################################################################################
# List Cards by Status
################################################################################
card_list_by_status() {
    local status="$1"
    local squad="${2:-}"

    local filter='.status == $status'
    if [[ -n "${squad}" ]]; then
        filter="${filter} and .assigned_to_squad == \$squad"
    fi

    find "${CARDS_DIR}" -maxdepth 1 -name "CARD-*.json" -exec \
        jq --arg status "${status}" --arg squad "${squad}" \
        "select(${filter})" {} \;
}

################################################################################
# List Cards by Squad
################################################################################
card_list_by_squad() {
    local squad="$1"
    local status="${2:-}"

    local filter='.assigned_to_squad == $squad'
    if [[ -n "${status}" ]]; then
        filter="${filter} and .status == \$status"
    fi

    find "${CARDS_DIR}" -maxdepth 1 -name "CARD-*.json" -exec \
        jq --arg squad "${squad}" --arg status "${status}" \
        "select(${filter})" {} \;
}

################################################################################
# Get Card Stats
################################################################################
card_get_stats() {
    if [[ ! -f "${CARDS_INDEX}" ]]; then
        echo "{}"
        return
    fi

    jq '.stats' "${CARDS_INDEX}"
}

################################################################################
# Archive Completed Card
################################################################################
card_archive() {
    local card_id="$1"
    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        log_error "Card not found: ${card_id}"
        return 1
    fi

    local status=$(jq -r '.status' "${card_file}")
    if [[ "${status}" != "${CARD_STATE_DONE}" ]]; then
        log_error "Can only archive cards in DONE state"
        return 1
    fi

    # Move to archive
    local archive_date=$(date +"%Y-%m")
    local archive_dir="${CARDS_ARCHIVE}/${archive_date}"
    mkdir -p "${archive_dir}"

    mv "${card_file}" "${archive_dir}/"

    # Update index
    _card_update_index "${card_id}" "remove"

    log_success "Card ${card_id} archived"
}

################################################################################
# Check Dependencies Met
################################################################################
card_dependencies_met() {
    local card_id="$1"
    local card_file="${CARDS_DIR}/${card_id}.json"

    if [[ ! -f "${card_file}" ]]; then
        return 1
    fi

    local dependencies=$(jq -r '.dependencies[]' "${card_file}" 2>/dev/null || echo "")

    if [[ -z "${dependencies}" ]]; then
        return 0  # No dependencies
    fi

    # Check each dependency
    while IFS= read -r dep_id; do
        [[ -z "${dep_id}" ]] && continue

        local dep_file="${CARDS_DIR}/${dep_id}.json"
        if [[ ! -f "${dep_file}" ]]; then
            return 1  # Dependency doesn't exist
        fi

        local dep_status=$(jq -r '.status' "${dep_file}")
        if [[ "${dep_status}" != "${CARD_STATE_DONE}" ]]; then
            return 1  # Dependency not done
        fi
    done <<< "${dependencies}"

    return 0  # All dependencies met
}

################################################################################
# Internal: Update Index
################################################################################
_card_update_index() {
    local card_id="$1"
    local action="$2"  # add, update, remove

    local card_file="${CARDS_DIR}/${card_id}.json"

    case "${action}" in
        add)
            if [[ -f "${card_file}" ]]; then
                local card_data=$(cat "${card_file}")
                jq --argjson card "${card_data}" \
                   --arg card_id "${card_id}" \
                   '.cards[$card_id] = $card |
                    .stats.total_cards += 1 |
                    .stats.by_status[$card.status] += 1 |
                    .stats.by_type[$card.type] += 1 |
                    .stats.by_squad[$card.assigned_to_squad] += 1' \
                    "${CARDS_INDEX}" > "${CARDS_INDEX}.tmp"
                mv "${CARDS_INDEX}.tmp" "${CARDS_INDEX}"
            fi
            ;;
        update)
            if [[ -f "${card_file}" ]]; then
                # Rebuild stats from all cards
                _card_rebuild_stats
            fi
            ;;
        remove)
            jq --arg card_id "${card_id}" \
               'del(.cards[$card_id])' \
               "${CARDS_INDEX}" > "${CARDS_INDEX}.tmp"
            mv "${CARDS_INDEX}.tmp" "${CARDS_INDEX}"
            _card_rebuild_stats
            ;;
    esac
}

################################################################################
# Internal: Rebuild Stats
################################################################################
_card_rebuild_stats() {
    local temp_stats=$(mktemp)

    cat > "${temp_stats}" <<EOF
{
  "total_cards": 0,
  "by_status": {
    "TODO": 0,
    "IN_PROGRESS": 0,
    "IN_REVIEW": 0,
    "DONE": 0,
    "BLOCKED": 0
  },
  "by_type": {},
  "by_squad": {}
}
EOF

    # Count all cards
    find "${CARDS_DIR}" -maxdepth 1 -name "CARD-*.json" | while read -r card_file; do
        local status=$(jq -r '.status' "${card_file}")
        local type=$(jq -r '.type' "${card_file}")
        local squad=$(jq -r '.assigned_to_squad' "${card_file}")

        jq --arg status "${status}" \
           --arg type "${type}" \
           --arg squad "${squad}" \
           '.total_cards += 1 |
            .by_status[$status] += 1 |
            .by_type[$type] += 1 |
            .by_squad[$squad] += 1' \
            "${temp_stats}" > "${temp_stats}.tmp"
        mv "${temp_stats}.tmp" "${temp_stats}"
    done

    # Update index with new stats
    jq --argjson stats "$(cat "${temp_stats}")" \
       '.stats = $stats' \
       "${CARDS_INDEX}" > "${CARDS_INDEX}.tmp"
    mv "${CARDS_INDEX}.tmp" "${CARDS_INDEX}"

    rm -f "${temp_stats}"
}

################################################################################
# Internal: Emit Event
################################################################################
_card_emit_event() {
    local event_type="$1"
    local card_id="$2"
    local data1="${3:-}"
    local data2="${4:-}"

    local events_dir="${STATE_DIR:-./state}/events"
    mkdir -p "${events_dir}"

    local event_file="${events_dir}/card_${event_type}_${card_id}_$(date +%s).event"

    cat > "${event_file}" <<EOF
{
  "event_type": "${event_type}",
  "card_id": "${card_id}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "data": {
    "field1": "${data1}",
    "field2": "${data2}"
  }
}
EOF
}

################################################################################
# Export Functions
################################################################################

# Main exports
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script called directly
    case "${1:-}" in
        init)
            card_system_init
            ;;
        create)
            shift
            card_create "$@"
            ;;
        get)
            card_get "$2"
            ;;
        *)
            echo "Usage: $0 {init|create|get} [args...]"
            exit 1
            ;;
    esac
fi
