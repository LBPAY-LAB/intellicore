#!/usr/bin/env bash

################################################################################
# Squad Communication System - Hierarchical Event Bus for v2.0
################################################################################
# Manages hierarchical communication between squads:
# - Parent → Child events
# - Child → Parent events
# - Sibling communication (frontend ↔ backend)
# - Escalation channels (any squad → meta-squad)
# - Broadcast capabilities
#
# Version: 2.0.0
# License: MIT
################################################################################

set -euo pipefail

# Source common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh" 2>/dev/null || true
source "${SCRIPT_DIR}/logging.sh" 2>/dev/null || true

# Communication directories
COMM_DIR="${STATE_DIR:-./state}/communication"
EVENTS_DIR="${COMM_DIR}/events"
MESSAGES_DIR="${COMM_DIR}/messages"
ESCALATIONS_DIR="${COMM_DIR}/escalations"
BROADCASTS_DIR="${COMM_DIR}/broadcasts"

# Event types
readonly EVENT_CARD_CREATED="card_created"
readonly EVENT_CARD_COMPLETED="card_completed"
readonly EVENT_CARD_BLOCKED="card_blocked"
readonly EVENT_SQUAD_READY="squad_ready"
readonly EVENT_SQUAD_BLOCKED="squad_blocked"
readonly EVENT_ESCALATION="escalation"
readonly EVENT_BROADCAST="broadcast"

# Communication channels
readonly CHANNEL_PARENT_TO_CHILD="parent_child"
readonly CHANNEL_CHILD_TO_PARENT="child_parent"
readonly CHANNEL_SIBLING="sibling"
readonly CHANNEL_ESCALATION="escalation"
readonly CHANNEL_BROADCAST="broadcast"

################################################################################
# Initialize Communication System
################################################################################
comm_init() {
    log_info "Initializing communication system..."

    # Create directories
    mkdir -p "${COMM_DIR}"
    mkdir -p "${EVENTS_DIR}"
    mkdir -p "${MESSAGES_DIR}"
    mkdir -p "${ESCALATIONS_DIR}"
    mkdir -p "${BROADCASTS_DIR}"

    # Create communication registry
    local registry="${COMM_DIR}/registry.json"
    if [[ ! -f "${registry}" ]]; then
        cat > "${registry}" <<EOF
{
  "version": "2.0.0",
  "initialized_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "squads": {},
  "hierarchy": {},
  "subscriptions": {}
}
EOF
        log_success "Communication system initialized"
    fi
}

################################################################################
# Register Squad in Communication System
################################################################################
comm_register_squad() {
    local squad_name="$1"
    local parent_squad="${2:-}"
    local children="${3:-}"  # JSON array

    local registry="${COMM_DIR}/registry.json"

    log_info "Registering squad: ${squad_name}"

    # Create squad entry
    jq --arg squad "${squad_name}" \
       --arg parent "${parent_squad}" \
       --argjson children "${children:-[]}" \
       --arg timestamp "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
       '.squads[$squad] = {
          "name": $squad,
          "parent": $parent,
          "children": $children,
          "registered_at": $timestamp,
          "status": "active",
          "subscriptions": [],
          "message_queue": []
        } |
        .hierarchy[$squad] = {
          "parent": $parent,
          "children": $children
        }' \
        "${registry}" > "${registry}.tmp"

    mv "${registry}.tmp" "${registry}"

    # Create squad message queue
    mkdir -p "${MESSAGES_DIR}/${squad_name}"

    log_success "Squad registered: ${squad_name}"
}

################################################################################
# Subscribe to Events
################################################################################
comm_subscribe() {
    local squad_name="$1"
    local event_type="$2"
    local from_squad="${3:-*}"  # * means any squad

    local registry="${COMM_DIR}/registry.json"

    log_info "Subscribing ${squad_name} to ${event_type} from ${from_squad}"

    jq --arg squad "${squad_name}" \
       --arg event "${event_type}" \
       --arg from "${from_squad}" \
       '.squads[$squad].subscriptions += [{
          "event_type": $event,
          "from_squad": $from,
          "subscribed_at": now | todate
        }] |
        .subscriptions[$event] //= [] |
        .subscriptions[$event] += [{
          "subscriber": $squad,
          "from": $from
        }] |
        .subscriptions[$event] |= unique' \
        "${registry}" > "${registry}.tmp"

    mv "${registry}.tmp" "${registry}"
}

################################################################################
# Publish Event
################################################################################
comm_publish_event() {
    local event_type="$1"
    local from_squad="$2"
    local to_squad="${3:-}"  # Empty means broadcast
    local priority="${4:-normal}"
    local data="${5:-{}}"

    local event_id="evt_$(date +%s)_${RANDOM}"
    local event_file="${EVENTS_DIR}/${event_id}.json"

    log_info "Publishing event: ${event_type} from ${from_squad}"

    # Create event
    cat > "${event_file}" <<EOF
{
  "event_id": "${event_id}",
  "event_type": "${event_type}",
  "from_squad": "${from_squad}",
  "to_squad": "${to_squad}",
  "priority": "${priority}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "data": ${data},
  "status": "pending",
  "delivered_to": []
}
EOF

    # Route event to subscribers
    _comm_route_event "${event_id}" "${event_type}" "${from_squad}" "${to_squad}"

    echo "${event_id}"
}

################################################################################
# Send Message (Direct Communication)
################################################################################
comm_send_message() {
    local from_squad="$1"
    local to_squad="$2"
    local message_type="$3"
    local content="$4"
    local channel="${5:-${CHANNEL_SIBLING}}"

    local msg_id="msg_$(date +%s)_${RANDOM}"
    local msg_file="${MESSAGES_DIR}/${to_squad}/${msg_id}.json"

    log_info "Sending message from ${from_squad} to ${to_squad}"

    mkdir -p "${MESSAGES_DIR}/${to_squad}"

    cat > "${msg_file}" <<EOF
{
  "message_id": "${msg_id}",
  "from_squad": "${from_squad}",
  "to_squad": "${to_squad}",
  "message_type": "${message_type}",
  "channel": "${channel}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "content": "${content}",
  "status": "unread"
}
EOF

    # Notify recipient
    _comm_notify_squad "${to_squad}" "${msg_id}"

    echo "${msg_id}"
}

################################################################################
# Escalate Issue
################################################################################
comm_escalate() {
    local from_squad="$1"
    local issue_type="$2"
    local description="$3"
    local severity="${4:-medium}"
    local related_card="${5:-}"

    local escalation_id="esc_$(date +%s)_${RANDOM}"
    local escalation_file="${ESCALATIONS_DIR}/${escalation_id}.json"

    log_warn "Escalation from ${from_squad}: ${issue_type}"

    cat > "${escalation_file}" <<EOF
{
  "escalation_id": "${escalation_id}",
  "from_squad": "${from_squad}",
  "issue_type": "${issue_type}",
  "description": "${description}",
  "severity": "${severity}",
  "related_card": "${related_card}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "status": "open",
  "assigned_to": "meta-orchestrator",
  "resolution": null,
  "resolved_at": null
}
EOF

    # Find parent squad for escalation
    local parent_squad=$(_comm_get_parent "${from_squad}")

    if [[ -n "${parent_squad}" ]] && [[ "${parent_squad}" != "null" ]]; then
        comm_send_message "${from_squad}" "${parent_squad}" "escalation" \
            "{\"escalation_id\": \"${escalation_id}\", \"severity\": \"${severity}\"}" \
            "${CHANNEL_ESCALATION}"
    fi

    # Always notify meta-orchestrator
    comm_send_message "${from_squad}" "meta-squad" "escalation" \
        "{\"escalation_id\": \"${escalation_id}\", \"severity\": \"${severity}\"}" \
        "${CHANNEL_ESCALATION}"

    echo "${escalation_id}"
}

################################################################################
# Broadcast to All Squads
################################################################################
comm_broadcast() {
    local from_squad="$1"
    local message_type="$2"
    local content="$3"
    local target_level="${4:-all}"  # all, children, siblings

    local broadcast_id="bcast_$(date +%s)_${RANDOM}"
    local broadcast_file="${BROADCASTS_DIR}/${broadcast_id}.json"

    log_info "Broadcasting from ${from_squad}: ${message_type}"

    cat > "${broadcast_file}" <<EOF
{
  "broadcast_id": "${broadcast_id}",
  "from_squad": "${from_squad}",
  "message_type": "${message_type}",
  "content": "${content}",
  "target_level": "${target_level}",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "delivered_to": []
}
EOF

    # Determine recipients based on target level
    local recipients=()
    case "${target_level}" in
        all)
            recipients=($(_comm_get_all_squads))
            ;;
        children)
            recipients=($(_comm_get_children "${from_squad}"))
            ;;
        siblings)
            recipients=($(_comm_get_siblings "${from_squad}"))
            ;;
    esac

    # Send to each recipient
    for recipient in "${recipients[@]}"; do
        [[ "${recipient}" == "${from_squad}" ]] && continue
        comm_send_message "${from_squad}" "${recipient}" "${message_type}" "${content}" \
            "${CHANNEL_BROADCAST}"
    done

    echo "${broadcast_id}"
}

################################################################################
# Get Messages for Squad
################################################################################
comm_get_messages() {
    local squad_name="$1"
    local status="${2:-unread}"  # unread, read, all

    local squad_queue="${MESSAGES_DIR}/${squad_name}"

    if [[ ! -d "${squad_queue}" ]]; then
        echo "[]"
        return
    fi

    local filter='true'
    if [[ "${status}" != "all" ]]; then
        filter='.status == $status'
    fi

    find "${squad_queue}" -name "msg_*.json" -exec \
        jq --arg status "${status}" "select(${filter})" {} \; 2>/dev/null | \
        jq -s '.'
}

################################################################################
# Mark Message as Read
################################################################################
comm_mark_read() {
    local squad_name="$1"
    local message_id="$2"

    local msg_file="${MESSAGES_DIR}/${squad_name}/${message_id}.json"

    if [[ ! -f "${msg_file}" ]]; then
        log_error "Message not found: ${message_id}"
        return 1
    fi

    jq '.status = "read" | .read_at = now | todate' \
        "${msg_file}" > "${msg_file}.tmp"
    mv "${msg_file}.tmp" "${msg_file}"
}

################################################################################
# Get Parent Squad
################################################################################
comm_get_parent() {
    local squad_name="$1"
    _comm_get_parent "${squad_name}"
}

################################################################################
# Get Children Squads
################################################################################
comm_get_children() {
    local squad_name="$1"
    _comm_get_children "${squad_name}"
}

################################################################################
# Check if Squad is Ready
################################################################################
comm_is_squad_ready() {
    local squad_name="$1"

    local registry="${COMM_DIR}/registry.json"

    if [[ ! -f "${registry}" ]]; then
        return 1
    fi

    local status=$(jq -r --arg squad "${squad_name}" \
        '.squads[$squad].status // "unknown"' "${registry}")

    [[ "${status}" == "ready" ]] && return 0 || return 1
}

################################################################################
# Set Squad Status
################################################################################
comm_set_squad_status() {
    local squad_name="$1"
    local status="$2"  # active, ready, blocked, completed

    local registry="${COMM_DIR}/registry.json"

    jq --arg squad "${squad_name}" \
       --arg status "${status}" \
       '.squads[$squad].status = $status |
        .squads[$squad].status_updated_at = now | todate' \
        "${registry}" > "${registry}.tmp"

    mv "${registry}.tmp" "${registry}"

    # Publish status change event
    comm_publish_event "${EVENT_SQUAD_READY}" "${squad_name}" "" "high" \
        "{\"status\": \"${status}\"}"
}

################################################################################
# Internal: Route Event to Subscribers
################################################################################
_comm_route_event() {
    local event_id="$1"
    local event_type="$2"
    local from_squad="$3"
    local to_squad="$4"

    local registry="${COMM_DIR}/registry.json"
    local event_file="${EVENTS_DIR}/${event_id}.json"

    if [[ -n "${to_squad}" ]]; then
        # Direct delivery
        local msg_id=$(comm_send_message "${from_squad}" "${to_squad}" \
            "event" "{\"event_id\": \"${event_id}\", \"event_type\": \"${event_type}\"}")

        jq --arg squad "${to_squad}" \
           '.delivered_to += [$squad] | .status = "delivered"' \
           "${event_file}" > "${event_file}.tmp"
        mv "${event_file}.tmp" "${event_file}"
    else
        # Find subscribers
        local subscribers=$(jq -r --arg event "${event_type}" --arg from "${from_squad}" \
            '.subscriptions[$event][] |
             select(.from == "*" or .from == $from) |
             .subscriber' \
            "${registry}" 2>/dev/null || echo "")

        if [[ -z "${subscribers}" ]]; then
            jq '.status = "no_subscribers"' "${event_file}" > "${event_file}.tmp"
            mv "${event_file}.tmp" "${event_file}"
            return
        fi

        # Deliver to each subscriber
        while IFS= read -r subscriber; do
            [[ -z "${subscriber}" ]] && continue
            comm_send_message "${from_squad}" "${subscriber}" \
                "event" "{\"event_id\": \"${event_id}\", \"event_type\": \"${event_type}\"}"

            jq --arg squad "${subscriber}" \
               '.delivered_to += [$squad]' \
               "${event_file}" > "${event_file}.tmp"
            mv "${event_file}.tmp" "${event_file}"
        done <<< "${subscribers}"

        jq '.status = "delivered"' "${event_file}" > "${event_file}.tmp"
        mv "${event_file}.tmp" "${event_file}"
    fi
}

################################################################################
# Internal: Notify Squad of New Message
################################################################################
_comm_notify_squad() {
    local squad_name="$1"
    local message_id="$2"

    # Create notification file
    local notification_file="${MESSAGES_DIR}/${squad_name}/.notification"
    echo "${message_id}" >> "${notification_file}"
}

################################################################################
# Internal: Get Parent Squad
################################################################################
_comm_get_parent() {
    local squad_name="$1"
    local registry="${COMM_DIR}/registry.json"

    if [[ ! -f "${registry}" ]]; then
        echo ""
        return
    fi

    jq -r --arg squad "${squad_name}" \
        '.hierarchy[$squad].parent // ""' \
        "${registry}"
}

################################################################################
# Internal: Get Children Squads
################################################################################
_comm_get_children() {
    local squad_name="$1"
    local registry="${COMM_DIR}/registry.json"

    if [[ ! -f "${registry}" ]]; then
        echo ""
        return
    fi

    jq -r --arg squad "${squad_name}" \
        '.hierarchy[$squad].children[]? // empty' \
        "${registry}"
}

################################################################################
# Internal: Get Siblings
################################################################################
_comm_get_siblings() {
    local squad_name="$1"
    local parent=$(_comm_get_parent "${squad_name}")

    if [[ -z "${parent}" ]] || [[ "${parent}" == "null" ]]; then
        echo ""
        return
    fi

    # Get all children of parent (excluding self)
    _comm_get_children "${parent}" | grep -v "^${squad_name}$"
}

################################################################################
# Internal: Get All Squads
################################################################################
_comm_get_all_squads() {
    local registry="${COMM_DIR}/registry.json"

    if [[ ! -f "${registry}" ]]; then
        echo ""
        return
    fi

    jq -r '.squads | keys[]' "${registry}"
}

################################################################################
# Get Communication Stats
################################################################################
comm_get_stats() {
    local total_events=$(find "${EVENTS_DIR}" -name "evt_*.json" | wc -l)
    local total_messages=$(find "${MESSAGES_DIR}" -name "msg_*.json" | wc -l)
    local total_escalations=$(find "${ESCALATIONS_DIR}" -name "esc_*.json" | wc -l)
    local total_broadcasts=$(find "${BROADCASTS_DIR}" -name "bcast_*.json" | wc -l)

    cat <<EOF
{
  "total_events": ${total_events},
  "total_messages": ${total_messages},
  "total_escalations": ${total_escalations},
  "total_broadcasts": ${total_broadcasts},
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
}

################################################################################
# Export Functions
################################################################################

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script called directly
    case "${1:-}" in
        init)
            comm_init
            ;;
        register)
            shift
            comm_register_squad "$@"
            ;;
        publish)
            shift
            comm_publish_event "$@"
            ;;
        *)
            echo "Usage: $0 {init|register|publish} [args...]"
            exit 1
            ;;
    esac
fi
