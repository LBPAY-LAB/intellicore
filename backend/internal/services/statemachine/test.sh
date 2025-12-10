#!/bin/bash

# Test script for State Machine with Condition Evaluator

set -e

echo "========================================="
echo "State Machine - Condition Evaluator Tests"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running unit tests...${NC}"
go test -v ./...

echo ""
echo -e "${YELLOW}Running tests with coverage...${NC}"
go test -coverprofile=coverage.out ./...

echo ""
echo -e "${YELLOW}Generating coverage report...${NC}"
go tool cover -func=coverage.out

echo ""
COVERAGE=$(go tool cover -func=coverage.out | grep total | awk '{print $3}' | sed 's/%//')
THRESHOLD=80

echo -e "${YELLOW}Total coverage: ${COVERAGE}%${NC}"

if (( $(echo "$COVERAGE >= $THRESHOLD" | bc -l) )); then
    echo -e "${GREEN}✓ Coverage is above ${THRESHOLD}% threshold${NC}"
else
    echo -e "${RED}✗ Coverage is below ${THRESHOLD}% threshold${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Running benchmarks...${NC}"
go test -bench=. -benchmem

echo ""
echo -e "${GREEN}All tests passed!${NC}"
echo ""
echo "To view detailed coverage in browser, run:"
echo "  go tool cover -html=coverage.out"
