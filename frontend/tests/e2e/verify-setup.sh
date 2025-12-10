#!/bin/bash

# E2E Test Setup Verification Script
# Checks if all prerequisites are met for running Playwright tests

set -e

echo "========================================="
echo "SuperCore E2E Test Setup Verification"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

ERRORS=0

# Check Node.js version
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        success "Node.js $(node -v) installed"
    else
        error "Node.js version too old. Need 18+, found $(node -v)"
        ERRORS=$((ERRORS + 1))
    fi
else
    error "Node.js not found. Install from https://nodejs.org"
    ERRORS=$((ERRORS + 1))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    success "npm $(npm -v) installed"
else
    error "npm not found"
    ERRORS=$((ERRORS + 1))
fi

# Check if dependencies are installed
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    success "node_modules directory exists"
else
    warning "node_modules not found. Run: npm install"
    ERRORS=$((ERRORS + 1))
fi

# Check if Playwright is installed
echo "Checking Playwright..."
if [ -f "node_modules/.bin/playwright" ]; then
    success "Playwright installed"
else
    error "Playwright not found. Run: npm install @playwright/test"
    ERRORS=$((ERRORS + 1))
fi

# Check if Playwright browsers are installed
echo "Checking Playwright browsers..."
if npx playwright --version &> /dev/null; then
    if [ -d "$HOME/.cache/ms-playwright" ] || [ -d "$HOME/Library/Caches/ms-playwright" ]; then
        success "Playwright browsers installed"
    else
        warning "Playwright browsers may not be installed. Run: npx playwright install"
        ERRORS=$((ERRORS + 1))
    fi
else
    error "Cannot run playwright command"
    ERRORS=$((ERRORS + 1))
fi

# Check backend API
echo "Checking backend API..."
BACKEND_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8080}"
if curl -f -s "$BACKEND_URL/health" > /dev/null 2>&1 || curl -f -s "$BACKEND_URL/api/health" > /dev/null 2>&1; then
    success "Backend API is accessible at $BACKEND_URL"
else
    error "Backend API not accessible at $BACKEND_URL"
    echo "  Start backend with: cd backend && go run cmd/api/main.go"
    ERRORS=$((ERRORS + 1))
fi

# Check frontend
echo "Checking frontend..."
FRONTEND_URL="${PLAYWRIGHT_BASE_URL:-http://localhost:3000}"
if curl -f -s "$FRONTEND_URL" > /dev/null 2>&1; then
    success "Frontend is accessible at $FRONTEND_URL"
else
    error "Frontend not accessible at $FRONTEND_URL"
    echo "  Start frontend with: npm run dev"
    ERRORS=$((ERRORS + 1))
fi

# Check PostgreSQL
echo "Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    if psql -h localhost -U postgres -d supercore -c "SELECT 1;" &> /dev/null; then
        success "PostgreSQL is accessible"
    else
        warning "Cannot connect to PostgreSQL database 'supercore'"
        echo "  Start with: docker run -d -p 5432:5432 -e POSTGRES_DB=supercore postgres:15"
    fi
else
    warning "psql command not found (optional for verification)"
fi

# Check environment file
echo "Checking environment configuration..."
if [ -f ".env.test" ]; then
    success ".env.test file exists"
else
    warning ".env.test file not found. Copy from .env.test.example if available"
fi

# Check test files
echo "Checking test files..."
TEST_COUNT=$(find tests/e2e -name "*.spec.ts" 2>/dev/null | wc -l)
if [ "$TEST_COUNT" -gt 0 ]; then
    success "Found $TEST_COUNT test files"
else
    error "No test files found in tests/e2e/"
    ERRORS=$((ERRORS + 1))
fi

# Check playwright config
echo "Checking Playwright configuration..."
if [ -f "playwright.config.ts" ]; then
    success "playwright.config.ts exists"
else
    error "playwright.config.ts not found"
    ERRORS=$((ERRORS + 1))
fi

# Check disk space
echo "Checking disk space..."
if command -v df &> /dev/null; then
    AVAILABLE_GB=$(df -h . | awk 'NR==2 {print $4}' | sed 's/G.*//')
    if [ -n "$AVAILABLE_GB" ] && [ "$AVAILABLE_GB" -ge 2 ]; then
        success "Sufficient disk space ($AVAILABLE_GB GB available)"
    else
        warning "Low disk space. Playwright needs ~2GB for browsers"
    fi
fi

# Summary
echo ""
echo "========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "You can now run tests with:"
    echo "  npm run test:e2e"
    echo ""
    echo "Or use interactive mode:"
    echo "  npm run test:e2e:ui"
    exit 0
else
    echo -e "${RED}✗ $ERRORS check(s) failed${NC}"
    echo ""
    echo "Please fix the issues above before running tests."
    echo ""
    echo "Quick setup:"
    echo "  1. npm install"
    echo "  2. npx playwright install"
    echo "  3. Start backend: cd backend && go run cmd/api/main.go"
    echo "  4. Start frontend: npm run dev"
    echo "  5. Run tests: npm run test:e2e"
    exit 1
fi
