#!/bin/bash

# CI/CD Pipeline - Local Execution Script
# This script runs the same checks as GitHub Actions locally
# Usage: ./scripts/ci-local.sh [--quick] [--fix] [--verbose]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERBOSE=false
QUICK=false
FIX=false
FAILED_CHECKS=0
PASSED_CHECKS=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --quick)
            QUICK=true
            shift
            ;;
        --fix)
            FIX=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Helper functions
print_header() {
    echo -e "${BLUE}==================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}==================================${NC}"
}

print_check() {
    echo -e "${YELLOW}[CHECK]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_CHECKS++))
}

print_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_CHECKS++))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"

    # Check Go
    if ! command -v go &> /dev/null; then
        print_error "Go is not installed"
        exit 1
    fi
    GO_VERSION=$(go version | awk '{print $3}')
    print_success "Go version: $GO_VERSION"

    # Check git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi
    print_success "Git found"

    # Check if we're in backend directory
    if [ ! -f "go.mod" ]; then
        print_error "go.mod not found. Run this script from backend directory"
        exit 1
    fi
    print_success "Backend directory verified"
}

# Download dependencies
download_dependencies() {
    print_header "Downloading Dependencies"

    print_check "Running go mod download..."
    go mod download

    print_check "Verifying modules..."
    if ! go mod verify; then
        print_error "Module verification failed"
        return 1
    fi
    print_success "Modules verified"
}

# Format check
format_check() {
    print_header "Format Check"

    print_check "Running gofmt..."
    if [ "$FIX" = true ]; then
        go fmt ./...
        print_success "Code formatted"
    else
        if [ -n "$(go fmt ./...)" ]; then
            print_error "Code needs formatting. Run: go fmt ./..."
            if [ "$VERBOSE" = true ]; then
                go fmt -l ./...
            fi
            return 1
        fi
        print_success "Format check passed"
    fi
}

# Vet check
vet_check() {
    print_header "Go Vet Check"

    print_check "Running go vet..."
    if ! go vet ./...; then
        print_error "Go vet found issues"
        return 1
    fi
    print_success "Vet check passed"
}

# Lint check
lint_check() {
    print_header "Lint Check"

    # Check if golangci-lint is installed
    if ! command -v golangci-lint &> /dev/null; then
        print_warning "golangci-lint not installed. Installing..."
        go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
    fi

    print_check "Running golangci-lint..."
    if [ "$FIX" = true ]; then
        if ! golangci-lint run ./... --fix; then
            print_error "Lint check failed (with fixes applied)"
            return 1
        fi
        print_success "Lint check passed (with fixes)"
    else
        if ! golangci-lint run ./...; then
            print_error "Lint check failed"
            if [ "$VERBOSE" = true ]; then
                echo "Run with --fix to auto-fix issues"
            fi
            return 1
        fi
        print_success "Lint check passed"
    fi
}

# Security scan
security_scan() {
    print_header "Security Scan"

    # Check if gosec is installed
    if ! command -v gosec &> /dev/null; then
        print_warning "gosec not installed. Installing..."
        go install github.com/securego/gosec/v2/cmd/gosec@latest
    fi

    print_check "Running gosec..."
    if ! gosec -no-fail ./...; then
        print_warning "Some security issues found (non-blocking)"
    fi
    print_success "Security scan completed"
}

# Unit tests
unit_tests() {
    print_header "Unit Tests"

    print_check "Running tests with race detector..."
    if ! go test -v -race -covermode=atomic -coverprofile=coverage.out ./...; then
        print_error "Tests failed"
        return 1
    fi
    print_success "Tests passed"

    # Generate coverage report
    print_check "Generating coverage report..."
    go tool cover -func=coverage.out > coverage.txt
    COVERAGE=$(grep "total:" coverage.txt | awk '{print $3}')
    echo "Total coverage: $COVERAGE"

    if [ "$VERBOSE" = true ]; then
        echo ""
        echo "Coverage details:"
        head -20 coverage.txt
    fi

    print_success "Coverage report generated"
}

# Build check
build_check() {
    print_header "Build Check"

    print_check "Building binary..."
    if ! go build -v -o ./bin/api ./cmd/api; then
        print_error "Build failed"
        return 1
    fi
    print_success "Build successful"

    # Check binary size
    if [ -f "./bin/api" ]; then
        SIZE=$(du -h ./bin/api | awk '{print $1}')
        echo "Binary size: $SIZE"
    fi
}

# Quick checks only (skip tests)
run_quick() {
    print_header "Running Quick Checks (No Tests)"

    check_prerequisites || return 1
    download_dependencies || return 1
    format_check || return 1
    vet_check || return 1
    lint_check || return 1
    security_scan || return 1
    build_check || return 1
}

# Full CI suite
run_full() {
    print_header "Running Full CI Suite"

    check_prerequisites || return 1
    download_dependencies || return 1
    format_check || return 1
    vet_check || return 1
    lint_check || return 1
    security_scan || return 1
    build_check || return 1
    unit_tests || return 1
}

# Main execution
main() {
    START_TIME=$(date +%s)

    print_header "SuperCore Backend - Local CI Pipeline"
    echo "Started at: $(date)"
    echo ""

    if [ "$QUICK" = true ]; then
        echo "Mode: Quick (skipping tests)"
        run_quick
    else
        echo "Mode: Full"
        run_full
    fi

    LOCAL_FAILED=$?

    # Summary
    echo ""
    print_header "Test Summary"
    echo "Passed: $PASSED_CHECKS"
    echo "Failed: $FAILED_CHECKS"

    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))

    echo "Duration: ${DURATION}s"
    echo "Completed at: $(date)"

    if [ $LOCAL_FAILED -eq 0 ]; then
        echo ""
        print_success "All checks passed! Ready to push."
        echo ""
        echo "Next steps:"
        echo "  1. Commit your changes: git add ."
        echo "  2. Create commit: git commit -m 'your message'"
        echo "  3. Push to remote: git push origin <branch>"
        exit 0
    else
        echo ""
        print_error "Some checks failed. Please fix issues before pushing."
        echo ""
        echo "Tips:"
        echo "  - Run with --fix to auto-fix formatting and import issues"
        echo "  - Run with --verbose for more details"
        echo "  - Check coverage.txt for test coverage details"
        exit 1
    fi
}

# Run main function
main
