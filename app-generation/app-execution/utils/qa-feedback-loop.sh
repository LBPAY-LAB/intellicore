#!/usr/bin/env bash

################################################################################
# QA Feedback Loop - Automated Quality Assurance Workflow
################################################################################
# Manages the QA validation cycle with automatic feedback to development squads
#
# Flow:
#   1. QA receives card from Engineering
#   2. QA validates against acceptance criteria
#   3. If passes → Mark as DONE
#   4. If fails → Create correction card → Route back to Engineering
#   5. Track retry cycles (max 3)
#   6. Escalate to Tech Lead if max retries exceeded
#
# Version: 2.0.0
# License: MIT
################################################################################

set -euo pipefail

# Source utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${SCRIPT_DIR}/common.sh" 2>/dev/null || true
source "${SCRIPT_DIR}/logging.sh" 2>/dev/null || true
source "${SCRIPT_DIR}/card-system.sh" 2>/dev/null || true
source "${SCRIPT_DIR}/squad-communication.sh" 2>/dev/null || true

# QA configuration
QA_DIR="${STATE_DIR:-./state}/qa"
QA_VALIDATIONS="${QA_DIR}/validations"
QA_REPORTS="${QA_DIR}/reports"
QA_METRICS="${QA_DIR}/metrics"

readonly MAX_QA_CYCLES=3
readonly QA_SQUAD_NAME="squad-qa"
readonly ENGINEERING_SQUAD_NAME="squad-engenharia"
readonly TECH_LEAD_SQUAD="squad-arquitetura"

# Validation result types
readonly VALIDATION_PASS="PASS"
readonly VALIDATION_FAIL="FAIL"
readonly VALIDATION_BLOCKED="BLOCKED"

################################################################################
# Initialize QA System
################################################################################
qa_init() {
    log_info "Initializing QA feedback loop system..."

    mkdir -p "${QA_DIR}"
    mkdir -p "${QA_VALIDATIONS}"
    mkdir -p "${QA_REPORTS}"
    mkdir -p "${QA_METRICS}"

    # Create QA metrics file
    if [[ ! -f "${QA_METRICS}/stats.json" ]]; then
        cat > "${QA_METRICS}/stats.json" <<EOF
{
  "version": "2.0.0",
  "initialized_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "total_validations": 0,
  "passed_first_time": 0,
  "failed_validations": 0,
  "escalations": 0,
  "average_qa_cycles": 0,
  "by_type": {},
  "by_squad": {}
}
EOF
    fi

    log_success "QA system initialized"
}

################################################################################
# Submit Card for QA Review
################################################################################
qa_submit_card() {
    local card_id="$1"
    local submitted_by="${2:-${ENGINEERING_SQUAD_NAME}}"

    log_info "Submitting card ${card_id} for QA review"

    # Update card status to IN_REVIEW
    card_update_status "${card_id}" "IN_REVIEW" "${submitted_by}" \
        "Submitted for QA review"

    # Assign to QA squad
    card_assign "${card_id}" "${QA_SQUAD_NAME}" "qa-lead" "${submitted_by}"

    # Create validation record
    local validation_id="val_$(date +%s)_${RANDOM}"
    local validation_file="${QA_VALIDATIONS}/${validation_id}.json"

    # Get current QA cycle count
    local qa_cycles=$(card_get "${card_id}" | jq -r '.metrics.qa_cycles // 0')
    qa_cycles=$((qa_cycles + 1))

    cat > "${validation_file}" <<EOF
{
  "validation_id": "${validation_id}",
  "card_id": "${card_id}",
  "submitted_by": "${submitted_by}",
  "submitted_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "qa_cycle": ${qa_cycles},
  "status": "pending",
  "assigned_to": "qa-lead",
  "validation_results": [],
  "issues_found": [],
  "result": null,
  "completed_at": null
}
EOF

    # Update card QA cycle count
    local card_file="${CARDS_DIR}/${card_id}.json"
    jq --arg cycles "${qa_cycles}" \
       '.metrics.qa_cycles = ($cycles | tonumber)' \
       "${card_file}" > "${card_file}.tmp"
    mv "${card_file}.tmp" "${card_file}"

    # Notify QA squad
    comm_send_message "${submitted_by}" "${QA_SQUAD_NAME}" "qa_submission" \
        "{\"card_id\": \"${card_id}\", \"validation_id\": \"${validation_id}\"}"

    echo "${validation_id}"
}

################################################################################
# Validate Card
################################################################################
qa_validate_card() {
    local validation_id="$1"
    local validator="${2:-qa-lead}"

    local validation_file="${QA_VALIDATIONS}/${validation_id}.json"

    if [[ ! -f "${validation_file}" ]]; then
        log_error "Validation not found: ${validation_id}"
        return 1
    fi

    local card_id=$(jq -r '.card_id' "${validation_file}")
    log_info "Validating card ${card_id} (${validation_id})"

    # Get card details
    local card=$(card_get "${card_id}")
    local acceptance_criteria=$(echo "${card}" | jq -r '.acceptance_criteria[]' 2>/dev/null || echo "")

    # Prepare validation checklist
    local validation_results=()
    local all_passed=true

    # If acceptance criteria exist, validate against them
    if [[ -n "${acceptance_criteria}" ]]; then
        while IFS= read -r criterion; do
            [[ -z "${criterion}" ]] && continue

            # Create validation item (in real scenario, agent would validate)
            local item_result=$(cat <<EOF
{
  "criterion": "${criterion}",
  "status": "pending",
  "validated_at": null,
  "notes": ""
}
EOF
)
            validation_results+=("${item_result}")
        done <<< "${acceptance_criteria}"
    fi

    # Update validation with checklist
    local results_json=$(printf '%s\n' "${validation_results[@]}" | jq -s '.')

    jq --argjson results "${results_json}" \
       --arg validator "${validator}" \
       '.validation_results = $results |
        .assigned_to = $validator |
        .status = "in_progress" |
        .started_at = now | todate' \
       "${validation_file}" > "${validation_file}.tmp"
    mv "${validation_file}.tmp" "${validation_file}"

    log_success "Validation checklist prepared for ${card_id}"
    echo "${validation_id}"
}

################################################################################
# Complete Validation (Pass)
################################################################################
qa_pass_card() {
    local validation_id="$1"
    local validator="${2:-qa-lead}"
    local notes="${3:-All acceptance criteria met}"

    local validation_file="${QA_VALIDATIONS}/${validation_id}.json"

    if [[ ! -f "${validation_file}" ]]; then
        log_error "Validation not found: ${validation_id}"
        return 1
    fi

    local card_id=$(jq -r '.card_id' "${validation_file}")
    local qa_cycle=$(jq -r '.qa_cycle' "${validation_file}")

    log_success "QA PASSED: Card ${card_id}"

    # Update validation
    jq --arg result "${VALIDATION_PASS}" \
       --arg notes "${notes}" \
       --arg validator "${validator}" \
       '.result = $result |
        .status = "completed" |
        .completed_at = now | todate |
        .completed_by = $validator |
        .notes = $notes' \
       "${validation_file}" > "${validation_file}.tmp"
    mv "${validation_file}.tmp" "${validation_file}"

    # Update card to DONE
    card_update_status "${card_id}" "DONE" "${QA_SQUAD_NAME}" \
        "QA validation passed on cycle ${qa_cycle}"

    # Generate QA report
    _qa_generate_report "${validation_id}" "${VALIDATION_PASS}"

    # Update metrics
    _qa_update_metrics "${card_id}" "${VALIDATION_PASS}" "${qa_cycle}"

    # Notify stakeholders
    local submitted_by=$(jq -r '.created_by_squad' "${CARDS_DIR}/${card_id}.json")
    comm_send_message "${QA_SQUAD_NAME}" "${submitted_by}" "qa_passed" \
        "{\"card_id\": \"${card_id}\", \"validation_id\": \"${validation_id}\"}"

    # Publish event
    comm_publish_event "card_qa_passed" "${QA_SQUAD_NAME}" "" "high" \
        "{\"card_id\": \"${card_id}\", \"qa_cycles\": ${qa_cycle}}"
}

################################################################################
# Fail Validation (Create Correction Card)
################################################################################
qa_fail_card() {
    local validation_id="$1"
    local validator="${2:-qa-lead}"
    local issues_json="$3"  # JSON array of issues
    local notes="${4:-Validation failed - corrections needed}"

    local validation_file="${QA_VALIDATIONS}/${validation_id}.json"

    if [[ ! -f "${validation_file}" ]]; then
        log_error "Validation not found: ${validation_id}"
        return 1
    fi

    local card_id=$(jq -r '.card_id' "${validation_file}")
    local qa_cycle=$(jq -r '.qa_cycle' "${validation_file}")
    local original_dev=$(jq -r '.assigned_to_agent' "${CARDS_DIR}/${card_id}.json")

    log_warn "QA FAILED: Card ${card_id} (Cycle ${qa_cycle}/${MAX_QA_CYCLES})"

    # Update validation
    jq --arg result "${VALIDATION_FAIL}" \
       --argjson issues "${issues_json}" \
       --arg notes "${notes}" \
       --arg validator "${validator}" \
       '.result = $result |
        .status = "completed" |
        .completed_at = now | todate |
        .completed_by = $validator |
        .issues_found = $issues |
        .notes = $notes' \
       "${validation_file}" > "${validation_file}.tmp"
    mv "${validation_file}.tmp" "${validation_file}"

    # Check if max cycles exceeded
    if [[ ${qa_cycle} -ge ${MAX_QA_CYCLES} ]]; then
        log_error "Max QA cycles (${MAX_QA_CYCLES}) exceeded for ${card_id}"
        _qa_escalate_card "${card_id}" "${validation_id}" "${issues_json}"
        return 2
    fi

    # Create correction card
    local issues_description=$(echo "${issues_json}" | jq -r '.[] | "- " + .description' | tr '\n' '; ')
    local correction_card_id=$(card_create \
        "FIX: $(card_get "${card_id}" | jq -r '.title')" \
        "bugfix" \
        "HIGH" \
        "${QA_SQUAD_NAME}" \
        "${ENGINEERING_SQUAD_NAME}" \
        "${original_dev}" \
        "QA Cycle ${qa_cycle} failed. Issues: ${issues_description}" \
        "${card_id}")

    log_info "Created correction card: ${correction_card_id}"

    # Add issues as comments to correction card
    while IFS= read -r issue; do
        [[ -z "${issue}" ]] && continue
        card_add_comment "${correction_card_id}" "${validator}" "${issue}"
    done < <(echo "${issues_json}" | jq -r '.[] | .description')

    # Update original card
    card_update_status "${card_id}" "BLOCKED" "${QA_SQUAD_NAME}" \
        "QA failed - correction card ${correction_card_id} created"

    card_add_child "${card_id}" "${correction_card_id}"

    # Generate QA report
    _qa_generate_report "${validation_id}" "${VALIDATION_FAIL}"

    # Update metrics
    _qa_update_metrics "${card_id}" "${VALIDATION_FAIL}" "${qa_cycle}"

    # Notify engineering squad
    comm_send_message "${QA_SQUAD_NAME}" "${ENGINEERING_SQUAD_NAME}" "qa_failed" \
        "{\"card_id\": \"${card_id}\", \"correction_card\": \"${correction_card_id}\", \"issues\": ${issues_json}}"

    # Auto-assign correction to original developer
    card_assign "${correction_card_id}" "${ENGINEERING_SQUAD_NAME}" "${original_dev}" \
        "${QA_SQUAD_NAME}"

    card_update_status "${correction_card_id}" "TODO" "${QA_SQUAD_NAME}" \
        "Awaiting correction by ${original_dev}"

    echo "${correction_card_id}"
}

################################################################################
# Escalate to Tech Lead
################################################################################
_qa_escalate_card() {
    local card_id="$1"
    local validation_id="$2"
    local issues_json="$3"

    log_warn "ESCALATING card ${card_id} to Tech Lead after ${MAX_QA_CYCLES} failed QA cycles"

    # Update card status
    card_update_status "${card_id}" "BLOCKED" "${QA_SQUAD_NAME}" \
        "Escalated to Tech Lead - max QA cycles exceeded"

    # Create escalation
    local escalation_id=$(comm_escalate \
        "${QA_SQUAD_NAME}" \
        "qa_max_cycles_exceeded" \
        "Card ${card_id} failed QA ${MAX_QA_CYCLES} times. Issues: $(echo "${issues_json}" | jq -c '.')" \
        "high" \
        "${card_id}")

    # Notify Tech Lead
    comm_send_message "${QA_SQUAD_NAME}" "${TECH_LEAD_SQUAD}" "escalation" \
        "{\"escalation_id\": \"${escalation_id}\", \"card_id\": \"${card_id}\", \"reason\": \"qa_max_cycles_exceeded\"}"

    # Update metrics
    jq '.escalations += 1' "${QA_METRICS}/stats.json" > "${QA_METRICS}/stats.json.tmp"
    mv "${QA_METRICS}/stats.json.tmp" "${QA_METRICS}/stats.json"

    echo "${escalation_id}"
}

################################################################################
# Generate QA Report
################################################################################
_qa_generate_report() {
    local validation_id="$1"
    local result="$2"

    local validation_file="${QA_VALIDATIONS}/${validation_id}.json"
    local validation=$(cat "${validation_file}")

    local card_id=$(echo "${validation}" | jq -r '.card_id')
    local qa_cycle=$(echo "${validation}" | jq -r '.qa_cycle')

    local report_file="${QA_REPORTS}/${card_id}_cycle${qa_cycle}.md"

    cat > "${report_file}" <<EOF
# QA Validation Report

**Card ID:** ${card_id}
**Validation ID:** ${validation_id}
**QA Cycle:** ${qa_cycle}
**Result:** ${result}
**Validated By:** $(echo "${validation}" | jq -r '.completed_by')
**Completed At:** $(echo "${validation}" | jq -r '.completed_at')

## Card Details

$(card_get "${card_id}" | jq -r '"**Title:** " + .title + "\n**Type:** " + .type + "\n**Priority:** " + .priority')

## Validation Results

EOF

    if [[ "${result}" == "${VALIDATION_PASS}" ]]; then
        cat >> "${report_file}" <<EOF
### ✅ PASSED

All acceptance criteria met.

**Notes:** $(echo "${validation}" | jq -r '.notes')

EOF
    else
        cat >> "${report_file}" <<EOF
### ❌ FAILED

**Issues Found:**

EOF
        echo "${validation}" | jq -r '.issues_found[] | "- **" + .type + ":** " + .description' >> "${report_file}"

        cat >> "${report_file}" <<EOF

**Notes:** $(echo "${validation}" | jq -r '.notes')

EOF
    fi

    cat >> "${report_file}" <<EOF

## Validation Checklist

EOF

    echo "${validation}" | jq -r '.validation_results[]? | "- [ ] " + .criterion' >> "${report_file}" 2>/dev/null || echo "No formal checklist" >> "${report_file}"

    log_info "QA report generated: ${report_file}"
}

################################################################################
# Update QA Metrics
################################################################################
_qa_update_metrics() {
    local card_id="$1"
    local result="$2"
    local qa_cycle="$3"

    local card=$(card_get "${card_id}")
    local card_type=$(echo "${card}" | jq -r '.type')
    local squad=$(echo "${card}" | jq -r '.created_by_squad')

    local metrics_file="${QA_METRICS}/stats.json"

    jq --arg result "${result}" \
       --arg type "${card_type}" \
       --arg squad "${squad}" \
       --arg cycle "${qa_cycle}" \
       '.total_validations += 1 |
        (if $result == "PASS" and ($cycle | tonumber) == 1 then
          .passed_first_time += 1
        else . end) |
        (if $result == "FAIL" then
          .failed_validations += 1
        else . end) |
        .by_type[$type] += 1 |
        .by_squad[$squad] += 1 |
        .average_qa_cycles = (
          (.average_qa_cycles * (.total_validations - 1) + ($cycle | tonumber)) / .total_validations
        )' \
        "${metrics_file}" > "${metrics_file}.tmp"

    mv "${metrics_file}.tmp" "${metrics_file}"
}

################################################################################
# Get QA Metrics
################################################################################
qa_get_metrics() {
    if [[ ! -f "${QA_METRICS}/stats.json" ]]; then
        echo "{}"
        return
    fi

    cat "${QA_METRICS}/stats.json"
}

################################################################################
# Get Validation Status
################################################################################
qa_get_validation() {
    local validation_id="$1"
    local validation_file="${QA_VALIDATIONS}/${validation_id}.json"

    if [[ ! -f "${validation_file}" ]]; then
        log_error "Validation not found: ${validation_id}"
        return 1
    fi

    cat "${validation_file}"
}

################################################################################
# List Pending Validations
################################################################################
qa_list_pending() {
    find "${QA_VALIDATIONS}" -name "val_*.json" -exec \
        jq 'select(.status == "pending" or .status == "in_progress")' {} \;
}

################################################################################
# Get QA Queue Size
################################################################################
qa_queue_size() {
    find "${QA_VALIDATIONS}" -name "val_*.json" -exec \
        jq -r 'select(.status == "pending") | .validation_id' {} \; | wc -l
}

################################################################################
# Export Functions
################################################################################

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    # Script called directly
    case "${1:-}" in
        init)
            qa_init
            ;;
        submit)
            qa_submit_card "$2" "${3:-}"
            ;;
        pass)
            qa_pass_card "$2" "${3:-}" "${4:-}"
            ;;
        fail)
            qa_fail_card "$2" "${3:-}" "${4:-}" "${5:-}"
            ;;
        metrics)
            qa_get_metrics
            ;;
        *)
            echo "Usage: $0 {init|submit|pass|fail|metrics} [args...]"
            exit 1
            ;;
    esac
fi
