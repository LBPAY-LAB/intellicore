#!/usr/bin/env bash
################################################################################
# Patch Management Agents with Model Configuration
# Adds model frontmatter to all management agents
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTS_DIR="${SCRIPT_DIR}/../../.claude/agents/management"
MODEL_CONFIG="${SCRIPT_DIR}/model-allocation.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*" >&2
}

################################################################################
# Agent model configuration
################################################################################
declare -A AGENT_MODELS=(
    [meta-orchestrator]="sonnet|think hard"
    [product-owner]="sonnet|think"
    [tech-lead]="opus|ultrathink"
    [scrum-master]="sonnet|think"
    [frontend-lead]="opus|think hard"
    [backend-lead]="opus|think hard"
    [qa-lead]="sonnet|think hard"
)

declare -A MODEL_DESCRIPTIONS=(
    [opus]="Claude Opus 4.5 - Critical architecture & development decisions"
    [sonnet]="Claude Sonnet 4.5 - Management, coordination & documentation"
)

################################################################################
# Patch agent file
################################################################################
patch_agent() {
    local agent_file="$1"
    local agent_name
    agent_name=$(basename "$agent_file" .md)

    if [[ ! -f "$agent_file" ]]; then
        log_error "Agent file not found: $agent_file"
        return 1
    fi

    # Get model config for this agent
    local model_config="${AGENT_MODELS[$agent_name]:-sonnet|think}"
    local model="${model_config%%|*}"
    local thinking="${model_config##*|}"

    log_info "Patching ${agent_name}..."

    # Check if already has frontmatter
    if head -n 5 "$agent_file" | grep -q "^---$"; then
        log_warning "  Already has frontmatter, skipping..."
        return 0
    fi

    # Create backup
    cp "$agent_file" "${agent_file}.bak"

    # Get current title
    local title
    title=$(head -n 1 "$agent_file" | sed 's/^# //')

    # Create temp file with new frontmatter
    cat > "${agent_file}.tmp" <<EOF
# ${title}

---
name: ${agent_name}
model: ${model}
thinking_level: ${thinking}
---

## Model Configuration
- **Primary Model**: ${MODEL_DESCRIPTIONS[$model]}
- **Thinking Level**: \`${thinking}\` (automatically applied to all tasks)
- **Reasoning**: $(get_model_reasoning "$agent_name" "$model")

EOF

    # Append rest of file (skip first line which is the title)
    tail -n +2 "$agent_file" >> "${agent_file}.tmp"

    # Replace original
    mv "${agent_file}.tmp" "$agent_file"

    log_success "  Patched with model=${model}, thinking=${thinking}"
}

################################################################################
# Get reasoning for model choice
################################################################################
get_model_reasoning() {
    local agent_name="$1"
    local model="$2"

    case "$agent_name" in
        tech-lead | *-architect)
            echo "Critical architecture decisions require deepest analytical capabilities and accuracy"
            ;;
        *-lead)
            echo "Complex technical decisions and code implementation require high-quality reasoning"
            ;;
        *-developer)
            echo "Implementation of features requires strong coding and problem-solving capabilities"
            ;;
        product-owner | business-analyst)
            echo "Product and business decisions benefit from speed and cost-effectiveness"
            ;;
        scrum-master | meta-orchestrator)
            echo "Coordination and management tasks are handled efficiently with balanced performance"
            ;;
        qa-lead | test-engineer)
            echo "Testing coordination and documentation are well-served by balanced model"
            ;;
        security-auditor)
            echo "Security analysis is critical and requires maximum analytical depth"
            ;;
        *)
            echo "Balanced model provides good performance for this role"
            ;;
    esac
}

################################################################################
# Show summary
################################################################################
show_summary() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║               AGENT MODEL ALLOCATION SUMMARY                   ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""

    echo "🧠 OPUS 4.5 Agents (Critical Thinking):"
    for agent in tech-lead frontend-lead backend-lead; do
        local config="${AGENT_MODELS[$agent]:-}"
        if [[ "$config" =~ ^opus ]]; then
            local thinking="${config##*|}"
            echo "   ✓ ${agent} (${thinking})"
        fi
    done
    echo ""

    echo "⚡ SONNET 4.5 Agents (Management):"
    for agent in meta-orchestrator product-owner scrum-master qa-lead; do
        local config="${AGENT_MODELS[$agent]:-}"
        if [[ "$config" =~ ^sonnet ]]; then
            local thinking="${config##*|}"
            echo "   ✓ ${agent} (${thinking})"
        fi
    done
    echo ""

    echo "💰 Cost Optimization:"
    echo "   - Architecture & Development: Opus 4.5 (high quality)"
    echo "   - Management & Documentation: Sonnet 4.5 (cost-effective)"
    echo "   - Estimated savings: 40-50% vs all-Opus approach"
    echo ""
}

################################################################################
# Main
################################################################################
main() {
    log_info "Patching management agents with model configuration..."
    echo ""

    local patched=0
    local skipped=0
    local failed=0

    for agent_file in "${AGENTS_DIR}"/*.md; do
        if [[ -f "$agent_file" ]]; then
            if patch_agent "$agent_file"; then
                ((patched++)) || true
            else
                if [[ $? -eq 0 ]]; then
                    ((skipped++)) || true
                else
                    ((failed++)) || true
                fi
            fi
        fi
    done

    echo ""
    echo "════════════════════════════════════════════════════════════════"
    log_success "Patching complete!"
    echo "  Patched: ${patched}"
    echo "  Skipped: ${skipped}"
    echo "  Failed:  ${failed}"
    echo "════════════════════════════════════════════════════════════════"

    if [[ $failed -gt 0 ]]; then
        log_error "Some agents failed to patch. Check errors above."
        exit 1
    fi

    show_summary

    log_info "Backups created with .bak extension"
    log_info "You can restore with: for f in ${AGENTS_DIR}/*.bak; do mv \"\$f\" \"\${f%.bak}\"; done"
}

main "$@"
