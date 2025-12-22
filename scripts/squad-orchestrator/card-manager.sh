#!/usr/bin/env bash

################################################################################
# Card Manager CLI - Interactive Card Management Tool
################################################################################
# Command-line interface for managing digital cards in hierarchical squad system
#
# Version: 2.0.0
# License: MIT
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/utils/common.sh"
source "${SCRIPT_DIR}/utils/logging.sh"
source "${SCRIPT_DIR}/utils/card-system.sh"

################################################################################
# Print Usage
################################################################################
print_usage() {
    cat <<EOF
Card Manager CLI - Hierarchical Squad Orchestrator v2.0

Usage: $(basename "$0") <command> [options]

Commands:
  list              List cards (filtered by squad/status)
  show CARD-ID      Show detailed card information
  create            Create new card (interactive)
  move CARD-ID      Update card status
  assign CARD-ID    Assign card to squad/agent
  comment CARD-ID   Add comment to card
  deps CARD-ID      Show card dependencies
  history CARD-ID   Show card change history
  stats             Show card system statistics

Options (for 'list'):
  --squad SQUAD     Filter by assigned squad
  --status STATUS   Filter by status (TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED)
  --priority PRIO   Filter by priority (CRITICAL, HIGH, MEDIUM, LOW)
  --json            Output as JSON

Options (for 'move'):
  --to STATUS       New status

Options (for 'assign'):
  --squad SQUAD     Target squad
  --agent AGENT     Target agent (optional)

Examples:
  # List all TODO cards
  $(basename "$0") list --status TODO

  # List cards assigned to backend squad
  $(basename "$0") list --squad squad-backend

  # Show card details
  $(basename "$0") show CARD-0042

  # Move card to IN_PROGRESS
  $(basename "$0") move CARD-0042 --to IN_PROGRESS

  # Assign card
  $(basename "$0") assign CARD-0042 --squad squad-frontend --agent react-developer

  # Add comment
  $(basename "$0") comment CARD-0042 "Implementation completed, ready for review"

EOF
}

################################################################################
# List Cards
################################################################################
cmd_list() {
    local squad=""
    local status=""
    local priority=""
    local json_output=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --squad) squad="$2"; shift 2 ;;
            --status) status="$2"; shift 2 ;;
            --priority) priority="$2"; shift 2 ;;
            --json) json_output=true; shift ;;
            *) shift ;;
        esac
    done

    local cards
    if [[ -n "${status}" ]]; then
        cards=$(card_list_by_status "${status}" "${squad}")
    elif [[ -n "${squad}" ]]; then
        cards=$(card_list_by_squad "${squad}" "${status}")
    else
        cards=$(find "${CARDS_DIR}" -maxdepth 1 -name "CARD-*.json" -exec cat {} \; | jq -s '.')
    fi

    if [[ "${json_output}" == "true" ]]; then
        echo "${cards}" | jq '.'
    else
        echo "${cards}" | jq -r '.[] | "[\(.id)] \(.title) - \(.status) (→ \(.assigned_to_squad))"'
    fi
}

################################################################################
# Show Card
################################################################################
cmd_show() {
    local card_id="$1"

    if [[ -z "${card_id}" ]]; then
        log_error "Card ID required"
        return 1
    fi

    local card=$(card_get "${card_id}")

    cat <<EOF
╔════════════════════════════════════════════════════════════════╗
║  CARD DETAILS                                                  ║
╚════════════════════════════════════════════════════════════════╝

ID:          $(echo "${card}" | jq -r '.id')
Title:       $(echo "${card}" | jq -r '.title')
Type:        $(echo "${card}" | jq -r '.type')
Priority:    $(echo "${card}" | jq -r '.priority')
Status:      $(echo "${card}" | jq -r '.status')

Created By:  $(echo "${card}" | jq -r '.created_by_squad')
Assigned To: $(echo "${card}" | jq -r '.assigned_to_squad') / $(echo "${card}" | jq -r '.assigned_to_agent')

Parent:      $(echo "${card}" | jq -r '.parent_card // "none"')
Children:    $(echo "${card}" | jq -r '.children_cards | join(", ") // "none"')
Dependencies: $(echo "${card}" | jq -r '.dependencies | join(", ") // "none"')

Created:     $(echo "${card}" | jq -r '.created_at')
Updated:     $(echo "${card}" | jq -r '.updated_at')

Description:
$(echo "${card}" | jq -r '.description // "No description"')

Acceptance Criteria:
$(echo "${card}" | jq -r '.acceptance_criteria[]? | "  - " + .' || echo "  None")

QA Cycles:   $(echo "${card}" | jq -r '.metrics.qa_cycles')
Cycle Time:  $(echo "${card}" | jq -r '.metrics.cycle_time') hours

EOF
}

################################################################################
# Create Card (Interactive)
################################################################################
cmd_create() {
    echo "=== Create New Card ==="
    echo ""

    read -p "Title: " title
    echo "Type (feature, bugfix, improvement, technical, documentation):"
    read -p "  > " type
    echo "Priority (CRITICAL, HIGH, MEDIUM, LOW):"
    read -p "  > " priority
    read -p "Created by squad: " created_by
    read -p "Assigned to squad: " assigned_to
    read -p "Assigned to agent (optional): " agent
    read -p "Description: " description
    read -p "Parent card ID (optional): " parent

    local card_id=$(card_create \
        "${title}" \
        "${type}" \
        "${priority}" \
        "${created_by}" \
        "${assigned_to}" \
        "${agent}" \
        "${description}" \
        "${parent}")

    echo ""
    log_success "Card created: ${card_id}"
    echo ""
    cmd_show "${card_id}"
}

################################################################################
# Move Card Status
################################################################################
cmd_move() {
    local card_id="$1"
    shift

    local to_status=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --to) to_status="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    if [[ -z "${card_id}" ]] || [[ -z "${to_status}" ]]; then
        log_error "Usage: move CARD-ID --to STATUS"
        return 1
    fi

    card_update_status "${card_id}" "${to_status}" "card-manager-cli"
}

################################################################################
# Assign Card
################################################################################
cmd_assign() {
    local card_id="$1"
    shift

    local squad=""
    local agent=""
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --squad) squad="$2"; shift 2 ;;
            --agent) agent="$2"; shift 2 ;;
            *) shift ;;
        esac
    done

    if [[ -z "${card_id}" ]] || [[ -z "${squad}" ]]; then
        log_error "Usage: assign CARD-ID --squad SQUAD [--agent AGENT]"
        return 1
    fi

    card_assign "${card_id}" "${squad}" "${agent}" "card-manager-cli"
}

################################################################################
# Add Comment
################################################################################
cmd_comment() {
    local card_id="$1"
    shift
    local comment="$*"

    if [[ -z "${card_id}" ]] || [[ -z "${comment}" ]]; then
        log_error "Usage: comment CARD-ID \"comment text\""
        return 1
    fi

    card_add_comment "${card_id}" "card-manager-cli" "${comment}"
}

################################################################################
# Show Dependencies
################################################################################
cmd_deps() {
    local card_id="$1"

    if [[ -z "${card_id}" ]]; then
        log_error "Card ID required"
        return 1
    fi

    local card=$(card_get "${card_id}")

    echo "Dependencies for ${card_id}:"
    echo ""
    echo "Parent:"
    echo "${card}" | jq -r '.parent_card // "  None"'
    echo ""
    echo "Children:"
    echo "${card}" | jq -r '.children_cards[]? | "  - " + .' || echo "  None"
    echo ""
    echo "Depends On:"
    echo "${card}" | jq -r '.dependencies[]? | "  - " + .' || echo "  None"
    echo ""
    echo "Blocked By:"
    echo "${card}" | jq -r '.blocked_by[]? | "  - " + .' || echo "  None"
}

################################################################################
# Show History
################################################################################
cmd_history() {
    local card_id="$1"

    if [[ -z "${card_id}" ]]; then
        log_error "Card ID required"
        return 1
    fi

    local card=$(card_get "${card_id}")

    echo "History for ${card_id}:"
    echo ""
    echo "${card}" | jq -r '.history[] | "\(.timestamp) - \(.action) by \(.by): \(.comment)"'
}

################################################################################
# Show Stats
################################################################################
cmd_stats() {
    local stats=$(card_get_stats)

    cat <<EOF
╔════════════════════════════════════════════════════════════════╗
║  CARD SYSTEM STATISTICS                                        ║
╚════════════════════════════════════════════════════════════════╝

Total Cards: $(echo "${stats}" | jq -r '.total_cards')

By Status:
  TODO:        $(echo "${stats}" | jq -r '.by_status.TODO')
  IN_PROGRESS: $(echo "${stats}" | jq -r '.by_status.IN_PROGRESS')
  IN_REVIEW:   $(echo "${stats}" | jq -r '.by_status.IN_REVIEW')
  DONE:        $(echo "${stats}" | jq -r '.by_status.DONE')
  BLOCKED:     $(echo "${stats}" | jq -r '.by_status.BLOCKED')

By Type:
$(echo "${stats}" | jq -r '.by_type | to_entries[] | "  \(.key): \(.value)"')

By Squad:
$(echo "${stats}" | jq -r '.by_squad | to_entries[] | "  \(.key): \(.value)"')

EOF
}

################################################################################
# Main
################################################################################
main() {
    if [[ $# -eq 0 ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
        print_usage
        exit 0
    fi

    # Initialize card system if needed
    if [[ ! -f "${CARDS_INDEX}" ]]; then
        log_info "Initializing card system..."
        card_system_init
    fi

    local command="$1"
    shift

    case "${command}" in
        list)
            cmd_list "$@"
            ;;
        show)
            cmd_show "$@"
            ;;
        create)
            cmd_create "$@"
            ;;
        move)
            cmd_move "$@"
            ;;
        assign)
            cmd_assign "$@"
            ;;
        comment)
            cmd_comment "$@"
            ;;
        deps)
            cmd_deps "$@"
            ;;
        history)
            cmd_history "$@"
            ;;
        stats)
            cmd_stats "$@"
            ;;
        *)
            log_error "Unknown command: ${command}"
            print_usage
            exit 1
            ;;
    esac
}

main "$@"
