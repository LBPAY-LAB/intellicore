#!/usr/bin/env bash
################################################################################
# Add Zero-Tolerance Implementation Constraints to All Development Agents
################################################################################

set -euo pipefail

AGENTS_DIR="/Users/jose.silva.lb/LBPay/supercore/.claude/agents/management"

echo "🚫 Adding ZERO-TOLERANCE constraints to development agents..."
echo ""

CONSTRAINTS='

## 🚫 CRITICAL CONSTRAINTS - ZERO TOLERANCE

**MANDATORY FOR ALL IMPLEMENTATIONS** - These constraints are NON-NEGOTIABLE:

### ❌ ABSOLUTELY FORBIDDEN

1. **NO Mock Implementations**
   - Never use fake data, mock responses, or placeholder implementations
   - All functions must connect to real databases, APIs, and services
   - Example forbidden: `return { id: 1, name: "Mock User" }`

2. **NO Placeholder Comments**
   - Never leave TODO, FIXME, or HACK comments in production code
   - If you cannot implement something fully, ESCALATE to Tech Lead
   - Do not submit incomplete work

3. **NO Hardcoded Values**
   - Never hardcode credentials, API keys, or configuration
   - All configuration must come from environment variables or config files
   - Example forbidden: `const API_KEY = "test-123"`

4. **NO Simplified Logic**
   - Every function must be production-ready and complete
   - Include all edge cases, error handling, and validation
   - No shortcuts or "we will fix this later" approaches

5. **NO Missing Error Handling**
   - Every function must handle ALL possible error cases
   - Use typed exceptions with meaningful messages
   - Log errors appropriately
   - Never swallow exceptions silently

6. **NO Incomplete Tests**
   - Test coverage must be ≥80%
   - Include unit tests, integration tests, and edge case tests
   - Test both success and error paths
   - No skipped tests in production code

### ✅ REQUIRED STANDARDS

Every implementation MUST include:

1. **Real Database Integration**
   - Actual database connections with proper pooling
   - Transactions where appropriate
   - Proper error handling for DB operations
   - Migrations for schema changes

2. **Comprehensive Error Handling**
   - Try-catch blocks for all operations
   - Typed error responses
   - Proper HTTP status codes
   - Error logging with context

3. **Production-Grade Security**
   - Input validation for ALL user inputs
   - Output sanitization
   - Authentication and authorization
   - Protection against SQL injection, XSS, CSRF
   - Rate limiting
   - Audit logging

4. **Complete Testing**
   - Unit tests (>80% coverage)
   - Integration tests
   - E2E tests for critical paths
   - Performance tests
   - Security tests

5. **Full Documentation**
   - API documentation (OpenAPI/Swagger)
   - Function docstrings
   - README updates
   - Architecture Decision Records (ADRs) for major decisions

6. **Observability**
   - Structured logging
   - Metrics (Prometheus format)
   - Distributed tracing (OpenTelemetry)
   - Health check endpoints

### 🚨 ENFORCEMENT

**If you encounter ANY situation where you cannot implement something completely:**
1. ❌ DO NOT use mocks or placeholders
2. ❌ DO NOT leave TODO comments
3. ❌ DO NOT submit incomplete work
4. ✅ ESCALATE to Tech Lead immediately
5. ✅ Document the blocker clearly
6. ✅ Wait for architectural decision

**QA will automatically reject cards that:**
- Contain mock implementations
- Have TODO/FIXME in production code
- Missing error handling
- Test coverage <80%
- Security vulnerabilities
- Hardcoded credentials or config

### 📋 Definition of Done

A card is ONLY done when ALL of these are true:
- ✅ ALL acceptance criteria met (no exceptions)
- ✅ NO mocks, stubs, or fake data anywhere
- ✅ Real database/API integration working
- ✅ ALL edge cases handled
- ✅ Comprehensive error handling
- ✅ Test coverage ≥80%
- ✅ Security scan clean (no HIGH/CRITICAL)
- ✅ Documentation complete
- ✅ Code review approved
- ✅ Deployment tested in dev AND QA

**Remember**: We are building production systems. Every line of code you write will handle real users, real data, and real money. There are NO shortcuts.'

# Add constraints to tech-lead
if [ -f "$AGENTS_DIR/tech-lead.md" ]; then
    echo "Adding constraints to tech-lead..."
    if ! grep -q "CRITICAL CONSTRAINTS - ZERO TOLERANCE" "$AGENTS_DIR/tech-lead.md"; then
        echo "$CONSTRAINTS" >> "$AGENTS_DIR/tech-lead.md"
        echo "  ✓ Done"
    else
        echo "  ⊘ Already has constraints"
    fi
fi

# Add constraints to frontend-lead
if [ -f "$AGENTS_DIR/frontend-lead.md" ]; then
    echo "Adding constraints to frontend-lead..."
    if ! grep -q "CRITICAL CONSTRAINTS - ZERO TOLERANCE" "$AGENTS_DIR/frontend-lead.md"; then
        echo "$CONSTRAINTS" >> "$AGENTS_DIR/frontend-lead.md"
        echo "  ✓ Done"
    else
        echo "  ⊘ Already has constraints"
    fi
fi

# Add constraints to backend-lead
if [ -f "$AGENTS_DIR/backend-lead.md" ]; then
    echo "Adding constraints to backend-lead..."
    if ! grep -q "CRITICAL CONSTRAINTS - ZERO TOLERANCE" "$AGENTS_DIR/backend-lead.md"; then
        echo "$CONSTRAINTS" >> "$AGENTS_DIR/backend-lead.md"
        echo "  ✓ Done"
    else
        echo "  ⊘ Already has constraints"
    fi
fi

# Add QA validation constraints to qa-lead
QA_CONSTRAINTS='

## 🚫 QA VALIDATION - ZERO TOLERANCE POLICY

As QA Lead, you are the **LAST LINE OF DEFENSE** against incomplete or poor-quality code.

### ❌ AUTO-REJECT Criteria

**IMMEDIATELY REJECT** any card that contains:

1. **Mock Implementations**
   ```bash
   # Check for mocks
   grep -r "mock\|fake\|stub" src/ --exclude-dir=tests
   # Expected: No matches in production code
   ```

2. **Placeholder Comments**
   ```bash
   # Check for TODOs
   grep -r "TODO\|FIXME\|HACK\|XXX" src/ --exclude-dir=tests
   # Expected: No matches
   ```

3. **Hardcoded Credentials**
   ```bash
   # Check for secrets
   trufflehog filesystem src/
   # Expected: No secrets found
   ```

4. **Missing Error Handling**
   - Every function must have try-catch or error returns
   - No silent error swallowing
   - All error paths must be tested

5. **Low Test Coverage**
   ```bash
   # Check coverage
   pytest --cov=src --cov-report=term-missing
   # Expected: ≥80% coverage
   ```

6. **Security Vulnerabilities**
   ```bash
   # Security scan
   npm audit  # or pip-audit, gosec, etc
   # Expected: 0 HIGH or CRITICAL vulnerabilities
   ```

### ✅ VALIDATION CHECKLIST

Before approving ANY card, verify ALL of these:

#### Functional Validation
- [ ] ALL acceptance criteria met (no exceptions)
- [ ] All user inputs validated
- [ ] All edge cases handled
- [ ] Error messages are clear and actionable
- [ ] No debug code (console.log, print statements, etc)

#### Integration Validation
- [ ] Real database connection working
- [ ] Real API integrations working
- [ ] No mock data or services
- [ ] Transactions work correctly
- [ ] Database migrations present (if schema changes)

#### Security Validation
- [ ] Input validation on all user inputs
- [ ] Output sanitization
- [ ] Authentication working
- [ ] Authorization enforced
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Rate limiting configured
- [ ] Secrets not in code
- [ ] Security scan clean

#### Quality Validation
- [ ] Test coverage ≥80%
- [ ] All tests passing
- [ ] No skipped tests
- [ ] Integration tests passing
- [ ] E2E tests passing (if applicable)
- [ ] Performance benchmarks met

#### Documentation Validation
- [ ] API documentation complete
- [ ] Function docstrings present
- [ ] README updated
- [ ] Environment variables documented
- [ ] Deployment instructions clear

#### Observability Validation
- [ ] Structured logging implemented
- [ ] Metrics exported
- [ ] Tracing configured
- [ ] Health check endpoint working
- [ ] Error tracking configured

### 🔄 FEEDBACK LOOP

When rejecting a card:
1. Create detailed correction card
2. List ALL violations found
3. Include examples of correct implementations
4. Set priority to HIGH
5. Assign back to original developer
6. Include links to IMPLEMENTATION_STANDARDS.md

### 🚨 ESCALATION TRIGGERS

Escalate to Tech Lead if:
- Same card failed QA 2+ times
- Developer consistently submits incomplete work
- Architectural issues preventing proper implementation
- Security vulnerabilities found

### 📊 QUALITY METRICS

Track and report:
- Cards rejected on first QA: % (target: <20%)
- Average QA cycles per card: number (target: <1.5)
- Security vulnerabilities found: count (target: 0 HIGH/CRITICAL)
- Test coverage: % (target: >85%)

**Remember**: Your job is to ensure ZERO defects reach production. Better to reject now than debug in production later.'

if [ -f "$AGENTS_DIR/qa-lead.md" ]; then
    echo "Adding QA validation constraints to qa-lead..."
    if ! grep -q "QA VALIDATION - ZERO TOLERANCE POLICY" "$AGENTS_DIR/qa-lead.md"; then
        echo "$QA_CONSTRAINTS" >> "$AGENTS_DIR/qa-lead.md"
        echo "  ✓ Done"
    else
        echo "  ⊘ Already has constraints"
    fi
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          ZERO-TOLERANCE CONSTRAINTS ADDED                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "✅ All development agents now enforce:"
echo "   • NO mocks or placeholder implementations"
echo "   • NO TODO/FIXME comments in production code"
echo "   • NO hardcoded credentials or config"
echo "   • NO missing error handling"
echo "   • NO incomplete tests (min 80% coverage)"
echo ""
echo "✅ QA Lead now enforces:"
echo "   • AUTO-REJECT on any violations"
echo "   • Comprehensive validation checklist"
echo "   • Detailed feedback on rejections"
echo ""
echo "📋 Review full standards: IMPLEMENTATION_STANDARDS.md"
echo ""
