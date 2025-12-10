# Testing Guide - SuperCore Backend

## Overview

This guide covers running tests for the SuperCore backend, including unit tests, integration tests, and coverage reports.

## Prerequisites

### Install Test Dependencies

```bash
cd backend

# Install testing libraries
go get github.com/pashagolub/pgxmock/v3
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/require

# Update dependencies
go mod tidy
```

## Running Tests

### Run All Tests

```bash
# Run all tests with verbose output
go test ./... -v

# Run all tests (quiet mode)
go test ./...
```

### Run Specific Package Tests

```bash
# Test services
go test ./internal/services -v

# Test handlers
go test ./internal/handlers -v

# Test models
go test ./internal/models -v
```

### Run Specific Test Functions

```bash
# Run relationship validator tests
go test ./internal/services -v -run TestRelationshipValidator

# Run specific test case
go test ./internal/services -v -run TestRelationshipValidator_ValidateCardinality

# Run object definition tests
go test ./internal/handlers -v -run TestObjectDefinition

# Run relationship handler tests
go test ./internal/handlers -v -run TestRelationship
```

### Run Tests with Pattern Matching

```bash
# Run all tests with "Validation" in name
go test ./... -v -run Validation

# Run all tests with "Cardinality" in name
go test ./... -v -run Cardinality

# Run all tests with "Cycle" in name
go test ./... -v -run Cycle
```

## Test Coverage

### Generate Coverage Report

```bash
# Generate coverage for all packages
go test ./... -coverprofile=coverage.out

# Generate coverage for specific package
go test ./internal/services -coverprofile=coverage.out

# View coverage summary
go tool cover -func=coverage.out

# Generate HTML coverage report
go tool cover -html=coverage.out -o coverage.html

# Open coverage report in browser
open coverage.html  # macOS
xdg-open coverage.html  # Linux
start coverage.html  # Windows
```

### Coverage by Package

```bash
# Services coverage
go test ./internal/services -coverprofile=services_coverage.out
go tool cover -func=services_coverage.out

# Handlers coverage
go test ./internal/handlers -coverprofile=handlers_coverage.out
go tool cover -func=handlers_coverage.out

# Combined coverage
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out | grep total
```

### Expected Coverage

- **Services**: > 85%
- **Handlers**: > 80%
- **Models**: > 70%
- **Overall**: > 80%

## Test Organization

### Unit Tests

**Location**: Same directory as source code, `*_test.go` files

**Examples**:
- `/internal/services/relationship_validator_test.go`
- `/internal/handlers/object_definition_test.go`
- `/internal/handlers/relationship_test.go`

**Run**:
```bash
go test ./internal/services -v
```

### Integration Tests

**Location**: `/internal/handlers/*_test.go`

**Requirements**: These tests use mocked database connections (pgxmock)

**Run**:
```bash
go test ./internal/handlers -v
```

### Benchmark Tests

**Run benchmarks**:
```bash
# Run all benchmarks
go test ./... -bench=.

# Run specific benchmark
go test ./internal/handlers -bench=BenchmarkGetRelationshipRules

# Run benchmarks with memory stats
go test ./... -bench=. -benchmem

# Run benchmarks multiple times
go test ./... -bench=. -count=5
```

## Test Suites

### 1. Relationship Validator Tests

**File**: `/internal/services/relationship_validator_test.go`

**Test Cases**:
- `TestRelationshipValidator_ValidateRelationship`
  - Valid relationship
  - Source instance not found
  - Self-reference not allowed
  - Relationship type not allowed
- `TestRelationshipValidator_ValidateCardinality`
  - 1:1 - No existing relationships
  - 1:1 - Source already has relationship
  - 1:N - Source already has relationship
  - N:1 - Target already has relationship
  - N:M - Always valid
- `TestRelationshipValidator_DetectCycle`
  - No cycle - linear path
  - Cycle detected - direct
  - Cycle detected - indirect (A → B → C → A)
- `TestRelationshipValidator_GetCascadeDeleteIDs`
  - Cascade enabled with dependents
  - Cascade disabled

**Run**:
```bash
go test ./internal/services -v -run TestRelationshipValidator
```

### 2. Object Definition Handler Tests

**File**: `/internal/handlers/object_definition_test.go`

**Test Cases**:
- `TestObjectDefinitionHandler_GetRelationshipRules`
  - Valid object definition with relationships
  - Object definition with empty relationships
  - Object definition not found
  - Invalid UUID format
- `TestObjectDefinitionHandler_GetRelationshipRules_ComplexScenarios`
  - All cardinality types (1:1, 1:N, N:1, N:M)
  - With min/max occurrences

**Run**:
```bash
go test ./internal/handlers -v -run TestObjectDefinition
```

### 3. Relationship Handler Tests

**File**: `/internal/handlers/relationship_test.go`

**Test Cases**:
- `TestRelationshipValidation_TypeValidation`
  - Valid relationship type
  - Invalid relationship type
  - Wrong target type
- `TestRelationshipValidation_Cardinality1to1`
  - First relationship succeeds
  - Second with same source fails
  - Relationship with same target fails
- `TestRelationshipValidation_Cardinality1toN`
  - First relationship succeeds
  - Second with same source fails
- `TestRelationshipValidation_CycleDetection`
  - Create chain (Node1 → Node2)
  - Extend chain (Node2 → Node3)
  - Try to create cycle (Node3 → Node1) - fails
- `TestRelationshipDelete_Cascade`
  - Delete without cascade
  - Delete with cascade

**Run**:
```bash
go test ./internal/handlers -v -run TestRelationship
```

## Test Examples

### Running Specific Test Suites

```bash
# Run all relationship validation tests
go test ./internal/services ./internal/handlers -v -run ".*Relationship.*"

# Run all cardinality tests
go test ./... -v -run ".*Cardinality.*"

# Run all cycle detection tests
go test ./... -v -run ".*Cycle.*"

# Run all cascade tests
go test ./... -v -run ".*Cascade.*"
```

### Running Tests with Timeout

```bash
# Set 30 second timeout
go test ./... -timeout 30s

# Set 5 minute timeout for integration tests
go test ./internal/handlers -timeout 5m
```

### Running Tests in Parallel

```bash
# Run tests in parallel (default)
go test ./... -v

# Disable parallel execution
go test ./... -v -parallel 1

# Set specific parallelism level
go test ./... -v -parallel 4
```

## Continuous Integration

### GitHub Actions

Example workflow for running tests:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.21'

      - name: Install dependencies
        working-directory: backend
        run: |
          go get github.com/pashagolub/pgxmock/v3
          go get github.com/stretchr/testify/assert
          go get github.com/stretchr/testify/require
          go mod tidy

      - name: Run tests
        working-directory: backend
        run: go test ./... -v -coverprofile=coverage.out

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: backend/coverage.out
```

## Troubleshooting

### Common Issues

**Issue**: "no required module provides package"
```bash
# Solution: Install missing dependencies
go get github.com/pashagolub/pgxmock/v3
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/require
go mod tidy
```

**Issue**: "database connection not configured for tests"
```bash
# Solution: Some tests skip without database
# This is expected behavior for integration tests
# Use pgxmock for unit tests
```

**Issue**: Tests fail with timeout
```bash
# Solution: Increase timeout
go test ./... -timeout 5m
```

**Issue**: Import cycle detected
```bash
# Solution: Check for circular dependencies in imports
go mod graph
```

## Best Practices

### 1. Table-Driven Tests

```go
tests := []struct {
    name          string
    input         string
    expected      string
    expectedError bool
}{
    {
        name:     "valid input",
        input:    "test",
        expected: "test",
    },
    {
        name:          "invalid input",
        input:         "",
        expectedError: true,
    },
}

for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
        result, err := Function(tt.input)
        if tt.expectedError {
            require.Error(t, err)
        } else {
            require.NoError(t, err)
            assert.Equal(t, tt.expected, result)
        }
    })
}
```

### 2. Use Mocks for External Dependencies

```go
// Use pgxmock for database
mock, err := pgxmock.NewPool()
require.NoError(t, err)
defer mock.Close()

// Setup expectations
mock.ExpectQuery("SELECT").WillReturnRows(...)

// Verify expectations met
require.NoError(t, mock.ExpectationsWereMet())
```

### 3. Test Isolation

```go
// Each test should be independent
func TestFunction(t *testing.T) {
    // Setup
    setup := createTestSetup()
    defer setup.cleanup()

    // Execute
    result := Function(setup.input)

    // Assert
    assert.Equal(t, expected, result)
}
```

### 4. Clear Test Names

```go
// Good
func TestRelationshipValidator_ValidateCardinality_1to1_SourceAlreadyHasRelationship(t *testing.T)

// Bad
func TestValidate(t *testing.T)
```

## Performance Testing

### Benchmarking

```bash
# Run all benchmarks
go test ./... -bench=. -benchmem

# Compare benchmarks
go test ./internal/handlers -bench=BenchmarkGetRelationshipRules -count=5 > old.txt
# Make changes
go test ./internal/handlers -bench=BenchmarkGetRelationshipRules -count=5 > new.txt
benchcmp old.txt new.txt
```

### Profiling

```bash
# CPU profiling
go test ./... -cpuprofile=cpu.prof
go tool pprof cpu.prof

# Memory profiling
go test ./... -memprofile=mem.prof
go tool pprof mem.prof

# Block profiling
go test ./... -blockprofile=block.prof
go tool pprof block.prof
```

## Test Output Examples

### Successful Test Run

```
=== RUN   TestRelationshipValidator_ValidateRelationship
=== RUN   TestRelationshipValidator_ValidateRelationship/Valid_relationship
=== RUN   TestRelationshipValidator_ValidateRelationship/Source_instance_not_found
=== RUN   TestRelationshipValidator_ValidateRelationship/Self-reference_not_allowed
=== RUN   TestRelationshipValidator_ValidateRelationship/Relationship_type_not_allowed
--- PASS: TestRelationshipValidator_ValidateRelationship (0.05s)
    --- PASS: TestRelationshipValidator_ValidateRelationship/Valid_relationship (0.01s)
    --- PASS: TestRelationshipValidator_ValidateRelationship/Source_instance_not_found (0.01s)
    --- PASS: TestRelationshipValidator_ValidateRelationship/Self-reference_not_allowed (0.01s)
    --- PASS: TestRelationshipValidator_ValidateRelationship/Relationship_type_not_allowed (0.01s)
PASS
coverage: 85.7% of statements
ok      github.com/lbpay/supercore/internal/services    0.123s
```

### Coverage Summary

```
github.com/lbpay/supercore/internal/services/relationship_validator.go:25:   ValidateRelationship          87.5%
github.com/lbpay/supercore/internal/services/relationship_validator.go:82:   getInstanceDefinition        100.0%
github.com/lbpay/supercore/internal/services/relationship_validator.go:102:  getAllowedRelationships       92.3%
github.com/lbpay/supercore/internal/services/relationship_validator.go:145:  validateCardinality          100.0%
github.com/lbpay/supercore/internal/services/relationship_validator.go:257:  detectCycle                   95.0%
github.com/lbpay/supercore/internal/services/relationship_validator.go:280:  dfs                           90.5%
total:                                                                        (statements)                  88.2%
```

## Additional Resources

- [Go Testing Documentation](https://golang.org/pkg/testing/)
- [Testify Documentation](https://github.com/stretchr/testify)
- [pgxmock Documentation](https://github.com/pashagolub/pgxmock)
- [Go Coverage Tools](https://go.dev/blog/cover)

## Summary

This testing guide covers:
- ✅ Installing dependencies
- ✅ Running all test types (unit, integration, benchmark)
- ✅ Generating coverage reports
- ✅ Test organization and structure
- ✅ Best practices
- ✅ Troubleshooting
- ✅ CI/CD integration

**Target Coverage**: > 80% across all packages
**Test Count**: 30+ test cases
**Test Files**: 3 comprehensive test suites
