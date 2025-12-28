#!/usr/bin/env bash
################################################################################
# Model Selector Utility
# Selects appropriate Claude model based on agent role and task type
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
MODEL_CONFIG="${SCRIPT_DIR}/../model-allocation.json"

# Model IDs
OPUS_MODEL="claude-opus-4-5-20251101"
SONNET_MODEL="claude-sonnet-4-5-20250929"
HAIKU_MODEL="claude-haiku-3-5-20241022"

################################################################################
# Get model for agent
################################################################################
get_model_for_agent() {
    local agent_name="$1"
    local squad_name="${2:-}"

    # Check model-allocation.json
    if [[ -f "$MODEL_CONFIG" ]]; then
        # Try to find agent in mapping
        local model
        model=$(jq -r --arg agent "$agent_name" --arg squad "$squad_name" '
            .agent_model_mapping
            | to_entries[]
            | select(.key == $squad or (.value | type == "object" and (.value | has($agent))))
            | if .value | type == "object" then
                if .value | has($agent) then
                    .value[$agent]
                else
                    (.value | to_entries[] | select(.value | type == "object" and (.value | has($agent))) | .value[$agent])
                end
              else
                .value
              end
        ' "$MODEL_CONFIG" 2>/dev/null || echo "")

        if [[ -n "$model" && "$model" != "null" ]]; then
            case "$model" in
                opus)
                    echo "$OPUS_MODEL"
                    return 0
                    ;;
                sonnet)
                    echo "$SONNET_MODEL"
                    return 0
                    ;;
                haiku)
                    echo "$HAIKU_MODEL"
                    return 0
                    ;;
            esac
        fi
    fi

    # Default based on agent type
    case "$agent_name" in
        *architect* | *tech-lead* | *-developer | *engineer* | security-auditor)
            echo "$OPUS_MODEL"
            ;;
        *owner* | *analyst* | *scrum-master* | qa-lead | test-engineer)
            echo "$SONNET_MODEL"
            ;;
        *)
            echo "$SONNET_MODEL"  # Default to Sonnet
            ;;
    esac
}

################################################################################
# Get model for task type
################################################################################
get_model_for_task() {
    local task_type="$1"

    if [[ -f "$MODEL_CONFIG" ]]; then
        local model
        model=$(jq -r --arg task "$task_type" '
            .task_type_model_override[$task] // "sonnet"
        ' "$MODEL_CONFIG" 2>/dev/null || echo "sonnet")

        case "$model" in
            opus)
                echo "$OPUS_MODEL"
                ;;
            haiku)
                echo "$HAIKU_MODEL"
                ;;
            *)
                echo "$SONNET_MODEL"
                ;;
        esac
    else
        # Default mapping
        case "$task_type" in
            security_review | architecture_design | performance_optimization | \
            complex_algorithm | api_design | database_schema_design)
                echo "$OPUS_MODEL"
                ;;
            log_analysis | health_check)
                echo "$HAIKU_MODEL"
                ;;
            *)
                echo "$SONNET_MODEL"
                ;;
        esac
    fi
}

################################################################################
# Get thinking level for agent/task
################################################################################
get_thinking_level() {
    local agent_name="$1"
    local task_type="${2:-default}"

    # Critical agents/tasks always use deeper thinking
    case "$agent_name" in
        *architect* | *tech-lead* | security-auditor)
            case "$task_type" in
                architecture_design | security_review)
                    echo "ultrathink"
                    ;;
                *)
                    echo "think hard"
                    ;;
            esac
            ;;
        *-developer)
            case "$task_type" in
                complex_algorithm | performance_optimization)
                    echo "think harder"
                    ;;
                *)
                    echo "think"
                    ;;
            esac
            ;;
        *)
            echo "think"
            ;;
    esac
}

################################################################################
# Get cost estimate
################################################################################
get_cost_estimate() {
    local model_id="$1"
    local input_tokens="${2:-1000}"
    local output_tokens="${3:-500}"

    local input_cost output_cost

    case "$model_id" in
        "$OPUS_MODEL")
            input_cost=15.0
            output_cost=75.0
            ;;
        "$SONNET_MODEL")
            input_cost=3.0
            output_cost=15.0
            ;;
        "$HAIKU_MODEL")
            input_cost=0.8
            output_cost=4.0
            ;;
        *)
            input_cost=3.0
            output_cost=15.0
            ;;
    esac

    # Cost per million tokens
    local total_cost
    total_cost=$(awk -v it="$input_tokens" -v ot="$output_tokens" \
                     -v ic="$input_cost" -v oc="$output_cost" \
                     'BEGIN {printf "%.4f", (it/1000000)*ic + (ot/1000000)*oc}')

    echo "$total_cost"
}

################################################################################
# Format model info
################################################################################
format_model_info() {
    local model_id="$1"

    case "$model_id" in
        "$OPUS_MODEL")
            echo "🧠 Opus 4.5 (Premium - Best reasoning)"
            ;;
        "$SONNET_MODEL")
            echo "⚡ Sonnet 4.5 (Balanced - Fast & accurate)"
            ;;
        "$HAIKU_MODEL")
            echo "🏃 Haiku 3.5 (Economy - Quick tasks)"
            ;;
        *)
            echo "❓ Unknown model: $model_id"
            ;;
    esac
}

################################################################################
# Show model allocation report
################################################################################
show_allocation_report() {
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║            MODEL ALLOCATION STRATEGY                           ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    echo "📋 ARCHITECTURE & DEVELOPMENT (Opus 4.5):"
    echo "   - Tech Lead (ultrathink)"
    echo "   - Solution Architect (ultrathink)"
    echo "   - Security Architect (ultrathink)"
    echo "   - Frontend Lead (think hard)"
    echo "   - Backend Lead (think hard)"
    echo "   - All Developers (think → think harder)"
    echo "   - Security Auditor (ultrathink)"
    echo ""

    echo "📊 MANAGEMENT & DOCUMENTATION (Sonnet 4.5):"
    echo "   - Meta Orchestrator (think)"
    echo "   - Product Owner (think)"
    echo "   - Business Analyst (think)"
    echo "   - Scrum Master (think)"
    echo "   - QA Lead (think hard)"
    echo "   - Test Engineer (think)"
    echo "   - UI/UX Designer (think)"
    echo ""

    echo "💰 COST COMPARISON (per 1M tokens):"
    echo "   Opus Input:  \$15.00  | Output: \$75.00"
    echo "   Sonnet Input: \$3.00  | Output: \$15.00"
    echo "   Haiku Input:  \$0.80  | Output: \$4.00"
    echo ""

    echo "💡 COST SAVINGS:"
    echo "   Using Sonnet for management saves ~80% vs Opus"
    echo "   Estimated project cost reduction: 40-50%"
    echo ""
}

################################################################################
# Main
################################################################################
main() {
    local command="${1:-help}"
    shift || true

    case "$command" in
        agent)
            if [[ $# -lt 1 ]]; then
                echo "Usage: $0 agent <agent-name> [squad-name]" >&2
                exit 1
            fi
            get_model_for_agent "$@"
            ;;

        task)
            if [[ $# -lt 1 ]]; then
                echo "Usage: $0 task <task-type>" >&2
                exit 1
            fi
            get_model_for_task "$1"
            ;;

        thinking)
            if [[ $# -lt 1 ]]; then
                echo "Usage: $0 thinking <agent-name> [task-type]" >&2
                exit 1
            fi
            get_thinking_level "$@"
            ;;

        cost)
            if [[ $# -lt 3 ]]; then
                echo "Usage: $0 cost <model-id> <input-tokens> <output-tokens>" >&2
                exit 1
            fi
            get_cost_estimate "$@"
            ;;

        info)
            if [[ $# -lt 1 ]]; then
                echo "Usage: $0 info <model-id>" >&2
                exit 1
            fi
            format_model_info "$1"
            ;;

        report)
            show_allocation_report
            ;;

        help | *)
            cat <<EOF
Model Selector Utility

Usage: $0 <command> [options]

Commands:
  agent <name> [squad]        Get model for agent
  task <type>                 Get model for task type
  thinking <agent> [task]     Get thinking level
  cost <model> <in> <out>     Calculate cost estimate
  info <model-id>             Show model info
  report                      Show allocation report

Examples:
  $0 agent tech-lead architecture
  $0 task architecture_design
  $0 thinking tech-lead security_review
  $0 cost $OPUS_MODEL 10000 5000
  $0 report

Model IDs:
  Opus:   $OPUS_MODEL
  Sonnet: $SONNET_MODEL
  Haiku:  $HAIKU_MODEL
EOF
            ;;
    esac
}

# Run if executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
