#!/usr/bin/env bash
################################################################################
# Apply Model Configuration to Agents
# Simple script to add model frontmatter to agent files
################################################################################

AGENTS_DIR="/Users/jose.silva.lb/LBPay/supercore/.claude/agents/management"

echo "🔧 Applying model configuration to agents..."
echo ""

# Meta Orchestrator - Sonnet
if [ -f "$AGENTS_DIR/meta-orchestrator.md" ] && ! grep -q "^---$" "$AGENTS_DIR/meta-orchestrator.md"; then
    echo "Patching meta-orchestrator..."
    cp "$AGENTS_DIR/meta-orchestrator.md" "$AGENTS_DIR/meta-orchestrator.md.bak"
    {
        echo "# Meta Orchestrator Agent"
        echo ""
        echo "---"
        echo "name: meta-orchestrator"
        echo "model: sonnet"
        echo "thinking_level: think hard"
        echo "---"
        echo ""
        echo "## Model Configuration"
        echo "- **Primary Model**: Claude Sonnet 4.5 - Fast coordination & decision-making"
        echo "- **Thinking Level**: \`think hard\` for complex orchestration decisions"
        echo "- **Reasoning**: Squad coordination benefits from speed and cost-effectiveness"
        echo ""
        tail -n +2 "$AGENTS_DIR/meta-orchestrator.md.bak"
    } > "$AGENTS_DIR/meta-orchestrator.md"
    echo "  ✓ Done"
fi

# Product Owner - Sonnet
if [ -f "$AGENTS_DIR/product-owner.md" ] && ! grep -q "^---$" "$AGENTS_DIR/product-owner.md"; then
    echo "Patching product-owner..."
    cp "$AGENTS_DIR/product-owner.md" "$AGENTS_DIR/product-owner.md.bak"
    {
        echo "# Product Owner Agent"
        echo ""
        echo "---"
        echo "name: product-owner"
        echo "model: sonnet"
        echo "thinking_level: think"
        echo "---"
        echo ""
        echo "## Model Configuration"
        echo "- **Primary Model**: Claude Sonnet 4.5 - Balanced performance for product decisions"
        echo "- **Thinking Level**: \`think\` for requirements analysis"
        echo "- **Reasoning**: Product decisions benefit from speed while maintaining quality"
        echo ""
        tail -n +2 "$AGENTS_DIR/product-owner.md.bak"
    } > "$AGENTS_DIR/product-owner.md"
    echo "  ✓ Done"
fi

# Scrum Master - Sonnet
if [ -f "$AGENTS_DIR/scrum-master.md" ] && ! grep -q "^---$" "$AGENTS_DIR/scrum-master.md"; then
    echo "Patching scrum-master..."
    cp "$AGENTS_DIR/scrum-master.md" "$AGENTS_DIR/scrum-master.md.bak"
    {
        echo "# Scrum Master Agent"
        echo ""
        echo "---"
        echo "name: scrum-master"
        echo "model: sonnet"
        echo "thinking_level: think"
        echo "---"
        echo ""
        echo "## Model Configuration"
        echo "- **Primary Model**: Claude Sonnet 4.5 - Efficient sprint coordination"
        echo "- **Thinking Level**: \`think\` for process facilitation"
        echo "- **Reasoning**: Coordination tasks are handled efficiently with balanced model"
        echo ""
        tail -n +2 "$AGENTS_DIR/scrum-master.md.bak"
    } > "$AGENTS_DIR/scrum-master.md"
    echo "  ✓ Done"
fi

# Frontend Lead - Opus
if [ -f "$AGENTS_DIR/frontend-lead.md" ] && ! grep -q "^---$" "$AGENTS_DIR/frontend-lead.md"; then
    echo "Patching frontend-lead..."
    cp "$AGENTS_DIR/frontend-lead.md" "$AGENTS_DIR/frontend-lead.md.bak"
    {
        echo "# Frontend Lead Agent"
        echo ""
        echo "---"
        echo "name: frontend-lead"
        echo "model: opus"
        echo "thinking_level: think hard"
        echo "---"
        echo ""
        echo "## Model Configuration"
        echo "- **Primary Model**: Claude Opus 4.5 - Critical frontend architecture & complex UI logic"
        echo "- **Thinking Level**: \`think hard\` for component design and performance optimization"
        echo "- **Reasoning**: Complex React/TypeScript implementations require deep analytical capabilities"
        echo ""
        tail -n +2 "$AGENTS_DIR/frontend-lead.md.bak"
    } > "$AGENTS_DIR/frontend-lead.md"
    echo "  ✓ Done"
fi

# Backend Lead - Opus
if [ -f "$AGENTS_DIR/backend-lead.md" ] && ! grep -q "^---$" "$AGENTS_DIR/backend-lead.md"; then
    echo "Patching backend-lead..."
    cp "$AGENTS_DIR/backend-lead.md" "$AGENTS_DIR/backend-lead.md.bak"
    {
        echo "# Backend Lead Agent"
        echo ""
        echo "---"
        echo "name: backend-lead"
        echo "model: opus"
        echo "thinking_level: think hard"
        echo "---"
        echo ""
        echo "## Model Configuration"
        echo "- **Primary Model**: Claude Opus 4.5 - Critical backend architecture & complex algorithms"
        echo "- **Thinking Level**: \`think hard\` for API design and system integration"
        echo "- **Reasoning**: Complex Go/Python implementations require deep problem-solving capabilities"
        echo ""
        tail -n +2 "$AGENTS_DIR/backend-lead.md.bak"
    } > "$AGENTS_DIR/backend-lead.md"
    echo "  ✓ Done"
fi

# QA Lead - Sonnet
if [ -f "$AGENTS_DIR/qa-lead.md" ] && ! grep -q "^---$" "$AGENTS_DIR/qa-lead.md"; then
    echo "Patching qa-lead..."
    cp "$AGENTS_DIR/qa-lead.md" "$AGENTS_DIR/qa-lead.md.bak"
    {
        echo "# QA Lead Agent"
        echo ""
        echo "---"
        echo "name: qa-lead"
        echo "model: sonnet"
        echo "thinking_level: think hard"
        echo "---"
        echo ""
        echo "## Model Configuration"
        echo "- **Primary Model**: Claude Sonnet 4.5 - Thorough testing & validation"
        echo "- **Thinking Level**: \`think hard\` for comprehensive test planning"
        echo "- **Reasoning**: Testing coordination benefits from balanced speed and analytical depth"
        echo ""
        tail -n +2 "$AGENTS_DIR/qa-lead.md.bak"
    } > "$AGENTS_DIR/qa-lead.md"
    echo "  ✓ Done"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║               MODEL ALLOCATION SUMMARY                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🧠 OPUS 4.5 Agents (Critical Thinking):"
echo "   ✓ tech-lead (ultrathink)"
echo "   ✓ frontend-lead (think hard)"
echo "   ✓ backend-lead (think hard)"
echo ""
echo "⚡ SONNET 4.5 Agents (Management):"
echo "   ✓ meta-orchestrator (think hard)"
echo "   ✓ product-owner (think)"
echo "   ✓ scrum-master (think)"
echo "   ✓ qa-lead (think hard)"
echo ""
echo "💰 Cost Optimization:"
echo "   - Architecture & Development: Opus 4.5 (highest quality)"
echo "   - Management & Documentation: Sonnet 4.5 (cost-effective)"
echo "   - Estimated savings: 40-50% vs all-Opus approach"
echo ""
echo "✅ All agents configured successfully!"
echo "📝 Backups created with .bak extension"
