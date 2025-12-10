# Quick Start - Testing Sprint 3 Relationship Validation

## 1. Install Test Dependencies

```bash
cd /Users/jose.silva.lb/LBPay/supercore/backend

go get github.com/pashagolub/pgxmock/v3
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/require

go mod tidy
```

## 2. Run All Tests

```bash
# Run all tests
go test ./... -v

# Run with coverage
go test ./... -coverprofile=coverage.out
go tool cover -html=coverage.out -o coverage.html
open coverage.html
```

## 3. Run Specific Test Suites

```bash
# Relationship Validator tests
go test ./internal/services -v -run TestRelationshipValidator

# Object Definition Handler tests
go test ./internal/handlers -v -run TestObjectDefinition

# Relationship Handler tests
go test ./internal/handlers -v -run TestRelationship
```

## 4. Check Coverage

```bash
# Overall coverage
go test ./... -coverprofile=coverage.out
go tool cover -func=coverage.out | grep total

# Expected: > 80%
```

## 5. Verify Implementation

```bash
# Test cardinality validation
go test ./internal/services -v -run ".*Cardinality.*"

# Test cycle detection
go test ./internal/services -v -run ".*Cycle.*"

# Test cascade deletion
go test ./internal/handlers -v -run ".*Cascade.*"
```

## Expected Output

```
PASS: TestRelationshipValidator_ValidateRelationship (4 test cases)
PASS: TestRelationshipValidator_ValidateCardinality (5 test cases)
PASS: TestRelationshipValidator_DetectCycle (3 test cases)
PASS: TestRelationshipValidator_GetCascadeDeleteIDs (2 test cases)
PASS: TestObjectDefinitionHandler_GetRelationshipRules (4 test cases)
PASS: TestObjectDefinitionHandler_GetRelationshipRules_ComplexScenarios (2 test cases)
PASS: TestRelationshipValidation_TypeValidation (3 test cases)
PASS: TestRelationshipValidation_Cardinality1to1
PASS: TestRelationshipValidation_Cardinality1toN
PASS: TestRelationshipValidation_CycleDetection
PASS: TestRelationshipDelete_Cascade

Total: 30+ test cases
Coverage: > 80%
```

## Troubleshooting

If tests fail to run, ensure:
1. Go version 1.21+ is installed: `go version`
2. Dependencies are installed: `go mod tidy`
3. You're in the backend directory: `cd backend`

## Documentation

- **Full Testing Guide**: `/backend/TESTING.md`
- **API Documentation**: `/Docs/api/RELATIONSHIP_VALIDATION.md`
- **Sprint Summary**: `/Docs/SPRINT_3_RELATIONSHIP_VALIDATION_SUMMARY.md`
