#!/usr/bin/env bash

################################################################################
# Meta-Squad Bootstrap - Hierarchical Squad System Initialization
################################################################################
# Initializes the complete hierarchical squad orchestration system:
#   - Reads project specifications
#   - Creates all required squads dynamically
#   - Sets up hierarchical relationships
#   - Initializes card system
#   - Configures communication channels
#   - Bootstraps workflow management
#
# Version: 2.0.0
# License: MIT
################################################################################

set -euo pipefail

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Source utilities
source "${SCRIPT_DIR}/utils/common.sh"
source "${SCRIPT_DIR}/utils/logging.sh"
source "${SCRIPT_DIR}/utils/card-system.sh"
source "${SCRIPT_DIR}/utils/squad-communication.sh"

# Directories
STATE_DIR="${STATE_DIR:-${SCRIPT_DIR}/state}"
LOGS_DIR="${SCRIPT_DIR}/logs"
CONFIG_DIR="${SCRIPT_DIR}/config"

# Configuration
BOOTSTRAP_LOG="${LOGS_DIR}/bootstrap.log"
SESSION_ID="session-$(date +%Y%m%d-%H%M%S)"
SESSION_DIR="${STATE_DIR}/${SESSION_ID}"

################################################################################
# Print Usage
################################################################################
print_usage() {
    cat <<EOF
Usage: $(basename "$0") <config-file> [options]

Bootstraps hierarchical squad orchestration system v2.0

Arguments:
  config-file       Path to meta-squad configuration JSON file

Options:
  --dry-run         Validate configuration without creating squads
  --verbose         Enable verbose logging
  --session-id ID   Use specific session ID (default: auto-generated)
  --help            Show this help message

Examples:
  # Bootstrap from configuration
  $(basename "$0") meta-squad-config.json

  # Dry run to validate configuration
  $(basename "$0") meta-squad-config.json --dry-run

  # Verbose output
  $(basename "$0") meta-squad-config.json --verbose

Configuration Format:
  See meta-squad-config.json for complete example

EOF
}

################################################################################
# Parse Arguments
################################################################################
parse_args() {
    if [[ $# -eq 0 ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
        print_usage
        exit 0
    fi

    CONFIG_FILE="$1"
    shift

    DRY_RUN=false
    VERBOSE=false

    while [[ $# -gt 0 ]]; do
        case "$1" in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                LOG_LEVEL=0  # DEBUG
                shift
                ;;
            --session-id)
                SESSION_ID="$2"
                SESSION_DIR="${STATE_DIR}/${SESSION_ID}"
                shift 2
                ;;
            *)
                log_error "Unknown option: $1"
                print_usage
                exit 1
                ;;
        esac
    done

    # Validate config file exists
    if [[ ! -f "${CONFIG_FILE}" ]]; then
        log_error "Configuration file not found: ${CONFIG_FILE}"
        exit 1
    fi
}

################################################################################
# Initialize Bootstrap Environment
################################################################################
init_bootstrap() {
    log_info "=== Meta-Squad Bootstrap v2.0 ==="
    log_info "Session ID: ${SESSION_ID}"
    log_info "Config: ${CONFIG_FILE}"

    # Create directories
    mkdir -p "${STATE_DIR}"
    mkdir -p "${SESSION_DIR}"
    mkdir -p "${LOGS_DIR}"
    mkdir -p "${CONFIG_DIR}"

    # Initialize logging
    exec 1> >(tee -a "${BOOTSTRAP_LOG}")
    exec 2> >(tee -a "${BOOTSTRAP_LOG}" >&2)

    log_success "Bootstrap environment initialized"
}

################################################################################
# Validate Configuration
################################################################################
validate_config() {
    log_info "Validating configuration..."

    # Check if valid JSON
    if ! jq empty "${CONFIG_FILE}" 2>/dev/null; then
        log_error "Invalid JSON in configuration file"
        return 1
    fi

    # Validate required fields
    local required_fields=(
        ".project"
        ".specifications"
        ".squads"
        ".workflow"
    )

    for field in "${required_fields[@]}"; do
        if ! jq -e "${field}" "${CONFIG_FILE}" >/dev/null 2>&1; then
            log_error "Missing required field: ${field}"
            return 1
        fi
    done

    # Validate squad hierarchy
    local meta_squad=$(jq -r '.squads.meta.agent // empty' "${CONFIG_FILE}")
    if [[ -z "${meta_squad}" ]]; then
        log_error "Meta-squad agent not defined"
        return 1
    fi

    # Check if agent files exist
    local agents_dir="${REPO_ROOT}/.claude/agents"
    while IFS= read -r agent; do
        [[ -z "${agent}" ]] && continue

        local agent_file="${agents_dir}/management/${agent}.md"
        if [[ ! -f "${agent_file}" ]]; then
            log_warn "Agent file not found: ${agent_file}"
        fi
    done < <(jq -r '.squads | .. | .agent? // .agents[]? // empty' "${CONFIG_FILE}")

    log_success "Configuration validated"
}

################################################################################
# Initialize Core Systems
################################################################################
init_core_systems() {
    log_info "Initializing core systems..."

    # Initialize card system
    card_system_init

    # Initialize communication system
    comm_init

    # Create session metadata
    cat > "${SESSION_DIR}/metadata.json" <<EOF
{
  "session_id": "${SESSION_ID}",
  "started_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "config_file": "${CONFIG_FILE}",
  "status": "initializing",
  "squads_created": 0,
  "cards_created": 0
}
EOF

    log_success "Core systems initialized"
}

################################################################################
# Create Squad
################################################################################
create_squad() {
    local squad_name="$1"
    local squad_config="$2"
    local parent_squad="${3:-}"

    log_info "Creating squad: ${squad_name}"

    local squad_dir="${SESSION_DIR}/squads/${squad_name}"
    mkdir -p "${squad_dir}"

    # Extract squad configuration
    local agent=$(echo "${squad_config}" | jq -r '.agent // .manager // empty')
    local agents=$(echo "${squad_config}" | jq -r '.agents[]? // empty' | tr '\n' ',')
    local inputs_from=$(echo "${squad_config}" | jq -r '.inputs_from // empty')
    local outputs_to=$(echo "${squad_config}" | jq -r '.outputs_to // empty')

    # Create squad state file
    cat > "${squad_dir}/state.json" <<EOF
{
  "squad_name": "${squad_name}",
  "parent_squad": "${parent_squad}",
  "primary_agent": "${agent}",
  "agents": $(echo "${squad_config}" | jq -c '.agents // []'),
  "inputs_from": "${inputs_from}",
  "outputs_to": "${outputs_to}",
  "status": "initialized",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "cards_assigned": 0,
  "cards_completed": 0
}
EOF

    # Get children squads
    local children=$(echo "${squad_config}" | jq -c '.creates // []')

    # Register in communication system
    comm_register_squad "${squad_name}" "${parent_squad}" "${children}"

    # Set up subscriptions
    if [[ -n "${inputs_from}" ]] && [[ "${inputs_from}" != "null" ]]; then
        comm_subscribe "${squad_name}" "card_created" "${inputs_from}"
        comm_subscribe "${squad_name}" "card_completed" "${inputs_from}"
    fi

    log_success "Squad created: ${squad_name}"
}

################################################################################
# Create Sub-Squads
################################################################################
create_sub_squads() {
    local parent_squad="$1"
    local sub_squads_config="$2"

    log_info "Creating sub-squads for: ${parent_squad}"

    while IFS= read -r sub_squad_name; do
        [[ -z "${sub_squad_name}" ]] && continue

        local sub_squad_config=$(echo "${sub_squads_config}" | jq -c ".${sub_squad_name}")
        local full_name="squad-${sub_squad_name}"

        create_squad "${full_name}" "${sub_squad_config}" "${parent_squad}"
    done < <(echo "${sub_squads_config}" | jq -r 'keys[]')
}

################################################################################
# Bootstrap Squad Hierarchy
################################################################################
bootstrap_hierarchy() {
    log_info "=== Bootstrapping Squad Hierarchy ==="

    local squads_config=$(jq -c '.squads' "${CONFIG_FILE}")

    # 1. Create Meta-Squad
    local meta_config=$(echo "${squads_config}" | jq -c '.meta')
    create_squad "meta-squad" "${meta_config}" ""

    # 2. Create Product Squad
    if jq -e '.squads.produto' "${CONFIG_FILE}" >/dev/null 2>&1; then
        local produto_config=$(echo "${squads_config}" | jq -c '.produto')
        create_squad "squad-produto" "${produto_config}" "meta-squad"
    fi

    # 3. Create Architecture Squad
    if jq -e '.squads.arquitetura' "${CONFIG_FILE}" >/dev/null 2>&1; then
        local arq_config=$(echo "${squads_config}" | jq -c '.arquitetura')
        create_squad "squad-arquitetura" "${arq_config}" "meta-squad"
    fi

    # 4. Create Engineering Squad (parent)
    if jq -e '.squads.engenharia' "${CONFIG_FILE}" >/dev/null 2>&1; then
        local eng_config=$(echo "${squads_config}" | jq -c '.engenharia')
        create_squad "squad-engenharia" "${eng_config}" "meta-squad"

        # 5. Create Engineering Sub-Squads
        if jq -e '.squads.engenharia.sub_squads' "${CONFIG_FILE}" >/dev/null 2>&1; then
            local sub_squads=$(echo "${eng_config}" | jq -c '.sub_squads')
            create_sub_squads "squad-engenharia" "${sub_squads}"
        fi
    fi

    # 6. Create QA Squad
    if jq -e '.squads.qa' "${CONFIG_FILE}" >/dev/null 2>&1; then
        local qa_config=$(echo "${squads_config}" | jq -c '.qa')
        create_squad "squad-qa" "${qa_config}" "meta-squad"
    fi

    # Update session metadata
    local squads_count=$(find "${SESSION_DIR}/squads" -type d -mindepth 1 -maxdepth 1 | wc -l)
    jq --arg count "${squads_count}" \
       '.squads_created = ($count | tonumber) | .status = "squads_created"' \
       "${SESSION_DIR}/metadata.json" > "${SESSION_DIR}/metadata.json.tmp"
    mv "${SESSION_DIR}/metadata.json.tmp" "${SESSION_DIR}/metadata.json"

    log_success "Squad hierarchy bootstrapped: ${squads_count} squads created"
}

################################################################################
# Generate Initial Cards
################################################################################
generate_initial_cards() {
    log_info "=== Generating Initial Cards ==="

    # Check if initial cards are defined in config
    if ! jq -e '.initial_cards' "${CONFIG_FILE}" >/dev/null 2>&1; then
        log_info "No initial cards defined in configuration"
        return
    fi

    local cards_count=0

    # Read project specifications if defined
    local arch_doc=$(jq -r '.specifications.architecture_doc // empty' "${CONFIG_FILE}")
    local func_spec=$(jq -r '.specifications.functional_spec // empty' "${CONFIG_FILE}")
    local backlog=$(jq -r '.specifications.backlog // empty' "${CONFIG_FILE}")

    # Create bootstrap card for meta-orchestrator
    local bootstrap_card=$(card_create \
        "Bootstrap Project: $(jq -r '.project.name' "${CONFIG_FILE}")" \
        "technical" \
        "CRITICAL" \
        "meta-squad" \
        "squad-produto" \
        "product-owner" \
        "Initialize project from specifications: arch=${arch_doc}, spec=${func_spec}, backlog=${backlog}")

    log_info "Created bootstrap card: ${bootstrap_card}"
    cards_count=$((cards_count + 1))

    # Process any additional initial cards from config
    while IFS= read -r card_json; do
        [[ -z "${card_json}" ]] && continue

        local title=$(echo "${card_json}" | jq -r '.title')
        local type=$(echo "${card_json}" | jq -r '.type')
        local priority=$(echo "${card_json}" | jq -r '.priority')
        local assigned_to=$(echo "${card_json}" | jq -r '.assigned_to_squad')

        local card_id=$(card_create \
            "${title}" \
            "${type}" \
            "${priority}" \
            "meta-squad" \
            "${assigned_to}" \
            "" \
            "$(echo "${card_json}" | jq -r '.description // empty')")

        log_info "Created initial card: ${card_id} - ${title}"
        cards_count=$((cards_count + 1))
    done < <(jq -c '.initial_cards[]?' "${CONFIG_FILE}" 2>/dev/null || echo "")

    # Update session metadata
    jq --arg count "${cards_count}" \
       '.cards_created = ($count | tonumber) | .status = "cards_created"' \
       "${SESSION_DIR}/metadata.json" > "${SESSION_DIR}/metadata.json.tmp"
    mv "${SESSION_DIR}/metadata.json.tmp" "${SESSION_DIR}/metadata.json"

    log_success "Initial cards generated: ${cards_count} cards"
}

################################################################################
# Configure Workflow
################################################################################
configure_workflow() {
    log_info "=== Configuring Workflow ==="

    local workflow_config=$(jq -c '.workflow' "${CONFIG_FILE}")

    # Create workflow configuration
    cat > "${SESSION_DIR}/workflow.json" <<EOF
{
  "sprint_duration_days": $(echo "${workflow_config}" | jq -r '.sprint_duration_days // 10'),
  "max_qa_retry_cycles": $(echo "${workflow_config}" | jq -r '.max_qa_retry_cycles // 3'),
  "daily_standup": $(echo "${workflow_config}" | jq -r '.daily_standup // true'),
  "auto_escalation": $(echo "${workflow_config}" | jq -r '.auto_escalation // true'),
  "card_flow": [
    "squad-produto",
    "squad-arquitetura",
    "squad-engenharia",
    "squad-qa"
  ],
  "current_sprint": 1,
  "sprint_start_date": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "configured_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

    log_success "Workflow configured"
}

################################################################################
# Generate Bootstrap Report
################################################################################
generate_report() {
    log_info "=== Generating Bootstrap Report ==="

    local report_file="${SESSION_DIR}/bootstrap-report.md"

    cat > "${report_file}" <<EOF
# Meta-Squad Bootstrap Report

**Session ID:** ${SESSION_ID}
**Timestamp:** $(date -u +"%Y-%m-%dT%H:%M:%SZ")
**Configuration:** ${CONFIG_FILE}

## Project Information

$(jq -r '
  "**Name:** " + .project.name + "\n" +
  "**Type:** " + .project.type + "\n" +
  "**Stack:** " + (.project.stack | to_entries | map(.key + ": " + (.value | join(", "))) | join("\n         "))
' "${CONFIG_FILE}")

## Squads Created

$(find "${SESSION_DIR}/squads" -name "state.json" -exec jq -r '"- **" + .squad_name + "** (Agent: " + .primary_agent + ")"' {} \;)

**Total Squads:** $(find "${SESSION_DIR}/squads" -type d -mindepth 1 -maxdepth 1 | wc -l)

## Squad Hierarchy

\`\`\`
Meta-Squad (meta-orchestrator)
    ├── Product Squad (product-owner)
    │   └── Creates cards for → Architecture Squad
    │
    ├── Architecture Squad (tech-lead)
    │   └── Creates implementation cards for → Engineering Squad
    │
    ├── Engineering Squad (scrum-master)
$(if [ -d "${SESSION_DIR}/squads/squad-frontend" ]; then echo "    │   ├── Frontend Sub-Squad (frontend-lead)"; fi)
$(if [ -d "${SESSION_DIR}/squads/squad-backend" ]; then echo "    │   └── Backend Sub-Squad (backend-lead)"; fi)
    │   └── Delivers to → QA Squad
    │
    └── QA Squad (qa-lead)
        ├── Approves → DONE
        └── Rejects → Creates correction cards → Engineering Squad
\`\`\`

## Initial Cards

$(card_list_by_status "TODO" | jq -r '"- **" + .id + ":** " + .title + " (→ " + .assigned_to_squad + ")"' 2>/dev/null || echo "No initial cards")

**Total Cards:** $(jq -r '.stats.total_cards' "${CARDS_INDEX}")

## Workflow Configuration

$(jq -r '
  "**Sprint Duration:** " + (.sprint_duration_days | tostring) + " days\n" +
  "**Max QA Cycles:** " + (.max_qa_retry_cycles | tostring) + "\n" +
  "**Daily Standup:** " + (.daily_standup | tostring) + "\n" +
  "**Auto Escalation:** " + (.auto_escalation | tostring)
' "${SESSION_DIR}/workflow.json")

## Communication Channels

$(jq -r '.squads | to_entries[] | "- **" + .key + "** ↔ " + (if .value.inputs_from then .value.inputs_from else "—" end) + " / " + (if .value.outputs_to then .value.outputs_to else "—" end)' "${CONFIG_FILE}")

## Next Steps

1. Review bootstrap report and squad configuration
2. Launch hierarchical squads:
   \`\`\`bash
   ./scripts/squad-orchestrator/launch-hierarchical-squads.sh ${SESSION_ID}
   \`\`\`
3. Monitor progress:
   \`\`\`bash
   ./scripts/squad-orchestrator/monitor-hierarchical.sh --session ${SESSION_ID} --watch
   \`\`\`
4. Interact with cards:
   \`\`\`bash
   ./scripts/squad-orchestrator/card-manager.sh list
   \`\`\`

## Status

✅ **Bootstrap completed successfully**

EOF

    log_success "Bootstrap report generated: ${report_file}"

    # Display report
    if command -v bat >/dev/null 2>&1; then
        bat --style=plain "${report_file}"
    else
        cat "${report_file}"
    fi
}

################################################################################
# Main Bootstrap Flow
################################################################################
main() {
    # Parse arguments
    parse_args "$@"

    # Initialize
    init_bootstrap

    # Validate configuration
    if ! validate_config; then
        log_error "Configuration validation failed"
        exit 1
    fi

    if [[ "${DRY_RUN}" == "true" ]]; then
        log_success "Dry run completed - configuration is valid"
        exit 0
    fi

    # Initialize core systems
    init_core_systems

    # Bootstrap squad hierarchy
    bootstrap_hierarchy

    # Generate initial cards
    generate_initial_cards

    # Configure workflow
    configure_workflow

    # Generate report
    generate_report

    # Update final status
    jq '.status = "completed" | .completed_at = now | todate' \
       "${SESSION_DIR}/metadata.json" > "${SESSION_DIR}/metadata.json.tmp"
    mv "${SESSION_DIR}/metadata.json.tmp" "${SESSION_DIR}/metadata.json"

    log_success "=== Bootstrap Completed Successfully ==="
    log_info "Session ID: ${SESSION_ID}"
    log_info "Report: ${SESSION_DIR}/bootstrap-report.md"
    log_info ""
    log_info "Next: Launch squads with:"
    log_info "  ./scripts/squad-orchestrator/launch-hierarchical-squads.sh ${SESSION_ID}"
}

# Run main
main "$@"
