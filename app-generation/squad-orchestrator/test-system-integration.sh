#!/bin/bash
################################################################################
# SuperCore v2.0 - System Integration Test
# Validates that all components are properly configured and ready for use
################################################################################

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
RESET='\033[0m'
BOLD='\033[1m'

TESTS_PASSED=0
TESTS_FAILED=0

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}ℹ${RESET} $1"
}

log_success() {
    echo -e "${GREEN}✓${RESET} $1"
    ((TESTS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}⚠${RESET} $1"
}

log_error() {
    echo -e "${RED}✗${RESET} $1"
    ((TESTS_FAILED++))
}

test_file_exists() {
    local file="$1"
    local description="$2"

    if [ -f "$file" ]; then
        log_success "$description exists: $file"
        return 0
    else
        log_error "$description NOT FOUND: $file"
        return 1
    fi
}

test_file_executable() {
    local file="$1"
    local description="$2"

    if [ -x "$file" ]; then
        log_success "$description is executable: $file"
        return 0
    else
        log_error "$description NOT executable: $file"
        return 1
    fi
}

test_command_exists() {
    local cmd="$1"
    local description="$2"

    if command -v "$cmd" >/dev/null 2>&1; then
        log_success "$description found: $cmd"
        return 0
    else
        log_error "$description NOT FOUND: $cmd"
        return 1
    fi
}

# ============================================================================
# Test Suite
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║       SUPERCORE V2.0 - SYSTEM INTEGRATION TEST                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ----------------------------------------------------------------------------
# 1. Core System Files
# ----------------------------------------------------------------------------
log_info "Testing Core System Files..."
echo ""

test_file_exists "meta-squad-bootstrap.sh" "Meta-Squad Bootstrap"
test_file_executable "meta-squad-bootstrap.sh" "Meta-Squad Bootstrap"

test_file_exists "meta-squad-config.json" "Meta-Squad Configuration"

test_file_exists "launch-squads.sh" "Squad Launcher"
test_file_executable "launch-squads.sh" "Squad Launcher"

test_file_exists "monitor-squads.sh" "Squad Monitor"
test_file_executable "monitor-squads.sh" "Squad Monitor"

test_file_exists "stop-squads.sh" "Squad Stopper"
test_file_executable "stop-squads.sh" "Squad Stopper"

test_file_exists "card-manager.sh" "Card Manager"
test_file_executable "card-manager.sh" "Card Manager"

echo ""

# ----------------------------------------------------------------------------
# 2. Utilities
# ----------------------------------------------------------------------------
log_info "Testing Utility Scripts..."
echo ""

test_file_exists "utils/common.sh" "Common utilities"
test_file_exists "utils/logging.sh" "Logging framework"
test_file_exists "utils/card-system.sh" "Card system"
test_file_exists "utils/squad-communication.sh" "Squad communication"
test_file_exists "utils/qa-feedback-loop.sh" "QA feedback loop"
test_file_exists "utils/squad-runner.sh" "Squad runner"
test_file_exists "utils/model-selector.sh" "Model selector"
test_file_executable "utils/model-selector.sh" "Model selector"

echo ""

# ----------------------------------------------------------------------------
# 3. Model Allocation
# ----------------------------------------------------------------------------
log_info "Testing Model Allocation System..."
echo ""

test_file_exists "model-allocation.json" "Model allocation config"
test_file_exists "MODEL_STRATEGY.md" "Model strategy documentation"
test_file_exists "MODEL_CONFIG_SUMMARY.md" "Model config summary"

# Test model selector utility
if [ -x "utils/model-selector.sh" ]; then
    MODEL_OUTPUT=$(./utils/model-selector.sh agent tech-lead 2>/dev/null || echo "ERROR")
    if [[ "$MODEL_OUTPUT" == *"opus"* ]]; then
        log_success "Model selector works: tech-lead → opus"
    else
        log_error "Model selector failed for tech-lead"
    fi
fi

echo ""

# ----------------------------------------------------------------------------
# 4. Zero-Tolerance Policy
# ----------------------------------------------------------------------------
log_info "Testing Zero-Tolerance Policy..."
echo ""

test_file_exists "ZERO_TOLERANCE_SUMMARY.md" "Zero-Tolerance Summary"
test_file_exists "IMPLEMENTATION_STANDARDS.md" "Implementation Standards"
test_file_exists "add-zero-tolerance-constraints.sh" "Constraint injection script"
test_file_executable "add-zero-tolerance-constraints.sh" "Constraint injection script"

# Check if agents have constraints
TECH_LEAD_FILE="../../.claude/agents/management/tech-lead.md"
if [ -f "$TECH_LEAD_FILE" ]; then
    if grep -q "CRITICAL CONSTRAINTS" "$TECH_LEAD_FILE"; then
        log_success "Tech Lead has zero-tolerance constraints"
    else
        log_warning "Tech Lead missing zero-tolerance constraints (run add-zero-tolerance-constraints.sh)"
    fi
else
    log_warning "Tech Lead agent file not found: $TECH_LEAD_FILE"
fi

echo ""

# ----------------------------------------------------------------------------
# 5. Monitoring System
# ----------------------------------------------------------------------------
log_info "Testing Monitoring System..."
echo ""

test_file_exists "start-monitoring.sh" "Monitoring start script"
test_file_executable "start-monitoring.sh" "Monitoring start script"

test_file_exists "stop-monitoring.sh" "Monitoring stop script"
test_file_executable "stop-monitoring.sh" "Monitoring stop script"

test_file_exists "monitoring/backend/server.py" "Backend server"
test_file_exists "monitoring/backend/metrics-collector.py" "Metrics collector"
test_file_exists "monitoring/backend/requirements.txt" "Backend requirements"

test_file_exists "monitoring/frontend/package.json" "Frontend package.json"
test_file_exists "monitoring/frontend/src/App.jsx" "Frontend App.jsx"

test_file_exists "monitoring/cli/monitor-cli.sh" "CLI monitor"
test_file_executable "monitoring/cli/monitor-cli.sh" "CLI monitor"

test_file_exists "monitoring/notifications/notify.sh" "Notification script"
test_file_executable "monitoring/notifications/notify.sh" "Notification script"

test_file_exists "monitoring/config/monitoring-config.json" "Monitoring configuration"

echo ""

# ----------------------------------------------------------------------------
# 6. Documentation
# ----------------------------------------------------------------------------
log_info "Testing Documentation..."
echo ""

test_file_exists "README.md" "Main README"
test_file_exists "COMPLETE_SYSTEM_OVERVIEW.md" "Complete System Overview"
test_file_exists "HIERARCHICAL_ARCHITECTURE.md" "Hierarchical Architecture"
test_file_exists "MONITORING_GUIDE.md" "Monitoring Guide"
test_file_exists "MONITORING_SUMMARY.md" "Monitoring Summary"
test_file_exists "MONITORING_QUICKREF.md" "Monitoring Quick Reference"
test_file_exists "QUICKSTART.md" "Quickstart Guide"
test_file_exists "MONITORING_FILES.txt" "Monitoring Files List"

echo ""

# ----------------------------------------------------------------------------
# 7. Management Agents
# ----------------------------------------------------------------------------
log_info "Testing Management Agents..."
echo ""

AGENTS_DIR="../../.claude/agents/management"
test_file_exists "$AGENTS_DIR/meta-orchestrator.md" "Meta-Orchestrator agent"
test_file_exists "$AGENTS_DIR/product-owner.md" "Product Owner agent"
test_file_exists "$AGENTS_DIR/tech-lead.md" "Tech Lead agent"
test_file_exists "$AGENTS_DIR/scrum-master.md" "Scrum Master agent"
test_file_exists "$AGENTS_DIR/frontend-lead.md" "Frontend Lead agent"
test_file_exists "$AGENTS_DIR/backend-lead.md" "Backend Lead agent"
test_file_exists "$AGENTS_DIR/qa-lead.md" "QA Lead agent"

# Check for model configuration in agents
for agent_file in "$AGENTS_DIR"/*.md; do
    if [ -f "$agent_file" ]; then
        agent_name=$(basename "$agent_file" .md)
        if grep -q "^---$" "$agent_file" && grep -q "model:" "$agent_file"; then
            log_success "Agent $agent_name has model configuration"
        else
            log_warning "Agent $agent_name missing model frontmatter"
        fi
    fi
done

echo ""

# ----------------------------------------------------------------------------
# 8. System Dependencies
# ----------------------------------------------------------------------------
log_info "Testing System Dependencies..."
echo ""

test_command_exists "python3" "Python 3"
test_command_exists "node" "Node.js"
test_command_exists "npm" "npm"
test_command_exists "curl" "curl"
test_command_exists "bash" "Bash"

# Optional dependencies
if command -v jq >/dev/null 2>&1; then
    log_success "jq found (optional - improves CLI monitor)"
else
    log_warning "jq not found (optional - CLI monitor will work but with limited formatting)"
fi

echo ""

# ----------------------------------------------------------------------------
# 9. Python Dependencies
# ----------------------------------------------------------------------------
log_info "Testing Python Dependencies..."
echo ""

if command -v python3 >/dev/null 2>&1; then
    # Check Python version
    PYTHON_VERSION=$(python3 --version 2>&1 | awk '{print $2}')
    PYTHON_MAJOR=$(echo "$PYTHON_VERSION" | cut -d. -f1)
    PYTHON_MINOR=$(echo "$PYTHON_VERSION" | cut -d. -f2)

    if [ "$PYTHON_MAJOR" -ge 3 ] && [ "$PYTHON_MINOR" -ge 8 ]; then
        log_success "Python version OK: $PYTHON_VERSION (≥3.8 required)"
    else
        log_error "Python version too old: $PYTHON_VERSION (≥3.8 required)"
    fi

    # Check if FastAPI is installed
    if python3 -c "import fastapi" 2>/dev/null; then
        log_success "FastAPI is installed"
    else
        log_warning "FastAPI not installed (run: pip3 install -r monitoring/backend/requirements.txt)"
    fi
fi

echo ""

# ----------------------------------------------------------------------------
# 10. Node.js Dependencies
# ----------------------------------------------------------------------------
log_info "Testing Node.js Dependencies..."
echo ""

if command -v node >/dev/null 2>&1; then
    # Check Node.js version
    NODE_VERSION=$(node --version 2>&1 | sed 's/v//')
    NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)

    if [ "$NODE_MAJOR" -ge 18 ]; then
        log_success "Node.js version OK: $NODE_VERSION (≥18 required)"
    else
        log_error "Node.js version too old: $NODE_VERSION (≥18 required)"
    fi

    # Check if React dependencies are installed
    if [ -d "monitoring/frontend/node_modules" ]; then
        log_success "Frontend dependencies installed"
    else
        log_warning "Frontend dependencies not installed (run: cd monitoring/frontend && npm install)"
    fi
fi

echo ""

# ----------------------------------------------------------------------------
# 11. Configuration Validation
# ----------------------------------------------------------------------------
log_info "Validating Configuration Files..."
echo ""

# Validate meta-squad-config.json
if [ -f "meta-squad-config.json" ]; then
    if python3 -c "import json; json.load(open('meta-squad-config.json'))" 2>/dev/null; then
        log_success "meta-squad-config.json is valid JSON"
    else
        log_error "meta-squad-config.json has JSON syntax errors"
    fi
fi

# Validate model-allocation.json
if [ -f "model-allocation.json" ]; then
    if python3 -c "import json; json.load(open('model-allocation.json'))" 2>/dev/null; then
        log_success "model-allocation.json is valid JSON"
    else
        log_error "model-allocation.json has JSON syntax errors"
    fi
fi

# Validate monitoring-config.json
if [ -f "monitoring/config/monitoring-config.json" ]; then
    if python3 -c "import json; json.load(open('monitoring/config/monitoring-config.json'))" 2>/dev/null; then
        log_success "monitoring-config.json is valid JSON"
    else
        log_error "monitoring-config.json has JSON syntax errors"
    fi
fi

echo ""

# ----------------------------------------------------------------------------
# 12. Directory Structure
# ----------------------------------------------------------------------------
log_info "Validating Directory Structure..."
echo ""

EXPECTED_DIRS=(
    "utils"
    "monitoring"
    "monitoring/backend"
    "monitoring/frontend"
    "monitoring/cli"
    "monitoring/notifications"
    "monitoring/config"
    "monitoring/data"
    "examples"
    "../../.claude/agents/management"
)

for dir in "${EXPECTED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "Directory exists: $dir"
    else
        log_error "Directory NOT FOUND: $dir"
    fi
done

echo ""

# ============================================================================
# Test Summary
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    TEST RESULTS SUMMARY                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${GREEN}✓ Passed:${RESET} $TESTS_PASSED / $TOTAL_TESTS"
echo -e "${RED}✗ Failed:${RESET} $TESTS_FAILED / $TOTAL_TESTS"
echo ""

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                 🎉  ALL TESTS PASSED!  🎉                      ║"
    echo "║                                                                ║"
    echo "║  System is READY for production use!                          ║"
    echo "║                                                                ║"
    echo "║  Next Steps:                                                   ║"
    echo "║  1. Create your project specifications                        ║"
    echo "║  2. ./start-monitoring.sh                                     ║"
    echo "║  3. ./meta-squad-bootstrap.sh meta-squad-config.json          ║"
    echo "║                                                                ║"
    echo "║  Documentation:                                                ║"
    echo "║  • Complete guide: COMPLETE_SYSTEM_OVERVIEW.md                ║"
    echo "║  • Quick start: QUICKSTART.md                                 ║"
    echo "║  • Monitoring: MONITORING_GUIDE.md                            ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    exit 0
else
    echo "╔════════════════════════════════════════════════════════════════╗"
    echo "║                 ⚠️  TESTS FAILED  ⚠️                           ║"
    echo "║                                                                ║"
    echo "║  Please fix the errors above before using the system.         ║"
    echo "║                                                                ║"
    echo "║  Common fixes:                                                 ║"
    echo "║  • Install Python dependencies:                               ║"
    echo "║    cd monitoring/backend && pip3 install -r requirements.txt  ║"
    echo "║                                                                ║"
    echo "║  • Install Node.js dependencies:                              ║"
    echo "║    cd monitoring/frontend && npm install                      ║"
    echo "║                                                                ║"
    echo "║  • Add agent constraints:                                     ║"
    echo "║    ./add-zero-tolerance-constraints.sh                        ║"
    echo "║                                                                ║"
    echo "║  • Re-run this test: ./test-system-integration.sh             ║"
    echo "╚════════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi
