# Validation Package - Custom Rule Executor Framework

## Overview

This package implements a flexible, extensible validation rule execution framework for the SuperCore platform. It allows validation rules to be defined as data (stored in the `validation_rules` table) and executed dynamically at runtime without code changes.

## Architecture

### Core Components

1. **RuleExecutor Interface** - Common interface for all rule executors
2. **RuleRegistry** - Maps rule types to executors (thread-safe)
3. **RuleExecutorService** - Main service that coordinates validation
4. **Specific Executors**:
   - RegexRuleExecutor
   - FunctionRuleExecutor (JavaScript via goja)
   - APICallRuleExecutor
   - SQLQueryRuleExecutor
   - CompositeRuleExecutor

### Design Principles

- **Data-Driven**: Rules are data, not code
- **Extensible**: Easy to add new rule types
- **Composable**: Combine rules with AND/OR logic
- **Type-Safe**: Strong typing with Go interfaces
- **Testable**: 80%+ test coverage

## Installation

### Prerequisites

Add required dependencies to `go.mod`:

```bash
cd backend
go get github.com/dop251/goja@latest
go get github.com/google/uuid@latest
go get github.com/jackc/pgx/v5@latest
```

### Dependencies

```
github.com/dop251/goja       # JavaScript VM for function executor
github.com/google/uuid        # UUID handling
github.com/jackc/pgx/v5       # PostgreSQL driver
```

## Quick Start

### 1. Initialize the Service

```go
import (
    "github.com/lbpay/supercore/internal/validation"
    "github.com/lbpay/supercore/internal/database"
)

// In your application setup
db := database.NewDB()
ruleExecutor := validation.NewRuleExecutorService(db.Pool)
```

### 2. Create Validation Rules

```sql
-- Regex Rule
INSERT INTO validation_rules (name, display_name, rule_type, config, is_system) VALUES
(
    'cpf_format',
    'CPF Format Validation',
    'regex',
    '{
        "field": "cpf",
        "pattern": "^\\d{11}$",
        "error_message": "CPF must have 11 digits"
    }',
    true
);

-- Function Rule
INSERT INTO validation_rules (name, display_name, rule_type, config) VALUES
(
    'minimum_age_18',
    'Minimum Age 18',
    'function',
    '{
        "code": "const birthDate = parseDate(data.data_nascimento); const age = (now() - birthDate) / (1000 * 60 * 60 * 24 * 365.25); return age >= 18;",
        "error_message": "Must be at least 18 years old"
    }'
);
```

### 3. Add Rules to Object Definition

```json
{
    "name": "cliente_pf",
    "schema": { /* ... */ },
    "rules": [
        {"rule_name": "cpf_format"},
        {"rule_name": "minimum_age_18"}
    ]
}
```

### 4. Validate Data

```go
ctx := context.Background()

// Validation happens automatically in InstanceHandler
// Or call directly:
err := ruleExecutor.ValidateData(ctx, objDef.Rules, instanceData)
if err != nil {
    // Handle validation error
}
```

## Rule Types

### Regex Rule

**Use Case**: Pattern matching (CPF, email, phone, etc.)

**Config:**
```json
{
    "field": "cpf",
    "pattern": "^\\d{11}$",
    "error_message": "Invalid CPF format"
}
```

**Example:**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
('email_format', 'regex', '{"field": "email", "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}');
```

### Function Rule

**Use Case**: Complex business logic, calculations, algorithm validation

**Config:**
```json
{
    "code": "return validateCPF(data.cpf);",
    "error_message": "Invalid CPF",
    "timeout": 5000
}
```

**Available Utilities:**
- `validateCPF(cpf)` - Brazilian CPF validation
- `validateCNPJ(cnpj)` - Brazilian CNPJ validation
- `validateEmail(email)` - Email validation
- `parseDate(str)` - Date parsing
- `now()` - Current timestamp
- `console.log(...)` - Debug logging

**Example:**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_validation', 'function', '{"code": "return validateCPF(data.cpf);", "error_message": "Invalid CPF"}');
```

### API Call Rule

**Use Case**: External validation (blacklist, fraud detection, BACEN APIs)

**Config:**
```json
{
    "endpoint": "https://api.example.com/validate",
    "method": "POST",
    "headers": {"Authorization": "Bearer TOKEN"},
    "body_template": "{\"cpf\": \"{{cpf}}\"}",
    "success_field": "is_valid",
    "success_value": true,
    "timeout": 5000
}
```

**Example:**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_blacklist', 'api_call', '{
    "endpoint": "https://api.compliance.com/blacklist",
    "method": "POST",
    "body_template": "{\"cpf\": \"{{cpf}}\"}",
    "success_field": "is_clear",
    "success_value": true
}');
```

### SQL Query Rule

**Use Case**: Database-dependent validation (uniqueness, relationships, limits)

**Config:**
```json
{
    "query": "SELECT 1 FROM instances WHERE data->>'email' = $1 LIMIT 1",
    "params": ["email"],
    "expect_exists": false,
    "error_message": "Email already registered"
}
```

**Example:**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
('email_unique', 'sql_query', '{
    "query": "SELECT 1 FROM instances WHERE data->>''email'' = $1 AND is_deleted = false LIMIT 1",
    "params": ["email"],
    "expect_exists": false,
    "error_message": "Email already registered"
}');
```

### Composite Rule

**Use Case**: Combine multiple rules with AND/OR logic

**Config:**
```json
{
    "rules": [
        {"rule_name": "cpf_format"},
        {"rule_name": "cpf_validation"}
    ],
    "operator": "AND",
    "error_message": "CPF validation failed"
}
```

**Example:**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_complete', 'composite', '{
    "operator": "AND",
    "rules": [
        {"rule_name": "cpf_format"},
        {"rule_name": "cpf_validation"},
        {"rule_name": "cpf_blacklist"}
    ]
}');
```

## API

### RuleExecutorService

```go
type RuleExecutorService struct {
    // ...
}

// Create new service
func NewRuleExecutorService(db *pgxpool.Pool) *RuleExecutorService

// Validate data against rules
func (s *RuleExecutorService) ValidateData(
    ctx context.Context,
    rulesJSON json.RawMessage,
    data json.RawMessage,
) error

// Validate using a specific rule by name
func (s *RuleExecutorService) ValidateRuleByName(
    ctx context.Context,
    ruleName string,
    value interface{},
) error

// Get the rule registry
func (s *RuleExecutorService) GetRegistry() *RuleRegistry
```

### RuleRegistry

```go
type RuleRegistry struct {
    // ...
}

// Register custom executor
func (r *RuleRegistry) RegisterRule(ruleType string, executor RuleExecutor) error

// Get executor for rule type
func (r *RuleRegistry) GetExecutor(ruleType string) (RuleExecutor, error)

// Check if executor exists
func (r *RuleRegistry) HasExecutor(ruleType string) bool

// List all registered types
func (r *RuleRegistry) ListRegisteredTypes() []string
```

### RuleExecutor Interface

```go
type RuleExecutor interface {
    Execute(config json.RawMessage, data map[string]interface{}) error
}
```

## Testing

### Run Tests

```bash
cd backend/internal/validation
go test -v
```

### Run Tests with Coverage

```bash
go test -v -cover
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Test Structure

```
validation/
├── executor_regex_test.go          # Regex executor tests
├── executor_function_test.go       # Function executor tests
├── executor_api_call_test.go       # API call executor tests
└── rule_registry_test.go           # Registry tests
```

### Example Test

```go
func TestRegexRuleExecutor(t *testing.T) {
    executor := &RegexRuleExecutor{}

    config := RegexConfig{
        Field:   "cpf",
        Pattern: `^\d{11}$`,
    }

    configJSON, _ := json.Marshal(config)

    data := map[string]interface{}{
        "cpf": "12345678901",
    }

    err := executor.Execute(configJSON, data)
    if err != nil {
        t.Errorf("unexpected error: %v", err)
    }
}
```

## Custom Executors

You can register custom executors for specialized validation:

```go
// 1. Implement RuleExecutor interface
type CustomRuleExecutor struct {
    // dependencies
}

func (e *CustomRuleExecutor) Execute(config json.RawMessage, data map[string]interface{}) error {
    // Custom validation logic
    return nil
}

// 2. Register executor
registry := ruleExecutor.GetRegistry()
err := registry.RegisterRule("custom_type", &CustomRuleExecutor{})
```

**Example: BACEN Compliance Executor**

```go
type BACENComplianceExecutor struct {
    bacenClient *BACENClient
}

func (e *BACENComplianceExecutor) Execute(config json.RawMessage, data map[string]interface{}) error {
    var cfg struct {
        Regulation string `json:"regulation"`
        CheckType  string `json:"check_type"`
    }

    json.Unmarshal(config, &cfg)

    // Call BACEN API
    result, err := e.bacenClient.Validate(cfg.Regulation, data)
    if err != nil {
        return err
    }

    if !result.IsCompliant {
        return validation.NewValidationError("BACEN compliance check failed")
    }

    return nil
}

// Register
registry.RegisterRule("bacen_compliance", &BACENComplianceExecutor{
    bacenClient: bacenClient,
})
```

## Integration with InstanceHandler

The validation framework integrates with the InstanceHandler:

```go
// handlers/instance.go

func (h *InstanceHandler) Create(c *gin.Context) {
    // ... parse request ...

    // 1. JSON Schema Validation
    schemaLoader := gojsonschema.NewBytesLoader(objDef.Schema)
    dataLoader := gojsonschema.NewBytesLoader(req.Data)
    result, _ := gojsonschema.Validate(schemaLoader, dataLoader)

    if !result.Valid() {
        // Return schema validation errors
    }

    // 2. Custom Rules Validation
    ruleExecutor := validation.NewRuleExecutorService(h.db.Pool)
    if err := ruleExecutor.ValidateData(ctx, objDef.Rules, req.Data); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "error": "Validation failed: " + err.Error(),
        })
        return
    }

    // 3. Create instance
    // ...
}
```

## Performance Optimization

### 1. Rule Caching

Consider caching frequently used rules:

```go
type CachedRuleExecutorService struct {
    *RuleExecutorService
    cache map[string]*ValidationRule
    mu    sync.RWMutex
}
```

### 2. Parallel Validation

For independent rules, execute in parallel:

```go
var wg sync.WaitGroup
errorChan := make(chan error, len(ruleRefs))

for _, ruleRef := range ruleRefs {
    wg.Add(1)
    go func(ref RuleReference) {
        defer wg.Done()
        if err := s.executeRule(ctx, ref, data); err != nil {
            errorChan <- err
        }
    }(ruleRef)
}

wg.Wait()
close(errorChan)
```

### 3. Timeout Handling

All executors support timeouts to prevent hanging:

```go
ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
defer cancel()
```

## Security Considerations

### 1. JavaScript Sandbox

The FunctionRuleExecutor uses goja VM which is isolated:
- No file system access
- No network access
- Timeout protection
- Memory limits

### 2. SQL Injection Prevention

All SQL queries use parameterized queries:

```go
db.Query(ctx, "SELECT 1 FROM table WHERE field = $1", value)
```

### 3. API Security

- Use HTTPS for all external API calls
- Store API keys in environment variables
- Implement rate limiting
- Validate SSL certificates

## Troubleshooting

### Common Issues

**1. "no executor registered for rule type"**

Check that rule_type in database matches registered executor:

```go
registry := executor.GetRegistry()
types := registry.ListRegisteredTypes()
fmt.Println("Registered types:", types)
```

**2. "failed to parse config"**

Validate JSON config structure:

```bash
echo '{"field": "cpf"}' | jq .
```

**3. JavaScript execution timeout**

Increase timeout in function config:

```json
{
    "code": "...",
    "timeout": 10000
}
```

**4. API call fails**

Check network connectivity and API availability:

```bash
curl -X POST https://api.example.com/validate \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Best Practices

1. **Rule Naming**: Use descriptive names (e.g., `cpf_format_validation` not `rule1`)
2. **Error Messages**: Provide clear, user-friendly messages
3. **Timeouts**: Set appropriate timeouts for all async operations
4. **Testing**: Write tests for custom executors
5. **Documentation**: Document custom rules in EXAMPLES.md
6. **Versioning**: Use composite rules to version validation logic
7. **Monitoring**: Log validation failures for analysis

## Migration from Old Validator

If migrating from the old `services/validator` package:

```go
// Old
validator := validator.New(db)
err := validator.ValidateData(ctx, rulesJSON, dataJSON)

// New
ruleExecutor := validation.NewRuleExecutorService(db.Pool)
err := ruleExecutor.ValidateData(ctx, rulesJSON, dataJSON)
```

The API is compatible, but new features are available in the validation package.

## Future Enhancements

- [ ] Rule versioning support
- [ ] Async rule execution with queues
- [ ] Rule execution metrics and monitoring
- [ ] GraphQL executor for graph-based validations
- [ ] Machine learning executor for AI-based validation
- [ ] Rule builder UI
- [ ] Audit trail for validation failures
- [ ] Rule performance profiling

## Contributing

When adding new executors:

1. Implement `RuleExecutor` interface
2. Add configuration type to `types.go`
3. Register in `NewRuleExecutorService()`
4. Write comprehensive tests (80%+ coverage)
5. Document in `EXAMPLES.md`
6. Update this README

## License

Internal use only - LBPAY SuperCore Platform

## Support

For questions or issues, contact the SuperCore development team.
