# Validation Rule Executor - Quick Reference

## Setup (One-Time)

```bash
cd backend
go get github.com/dop251/goja@latest
go mod tidy
go test ./internal/validation/... -v
```

## Basic Usage

```go
import "github.com/lbpay/supercore/internal/validation"

// Initialize
ruleExecutor := validation.NewRuleExecutorService(db.Pool)

// Validate
err := ruleExecutor.ValidateData(ctx, rulesJSON, dataJSON)
```

## Rule Type Cheat Sheet

### Regex - Pattern Matching

```sql
-- Config
{"field": "cpf", "pattern": "^\\d{11}$", "error_message": "Invalid CPF"}

-- Example
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_format', 'regex', '{"field": "cpf", "pattern": "^\\d{11}$"}');
```

### Function - JavaScript Logic

```sql
-- Config
{"code": "return validateCPF(data.cpf);", "error_message": "Invalid CPF", "timeout": 5000}

-- Example
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_check', 'function', '{"code": "return validateCPF(data.cpf);"}');
```

**Available Utilities**:
- `validateCPF(cpf)`, `validateCNPJ(cnpj)`, `validateEmail(email)`
- `parseDate(str)`, `now()`, `console.log(...)`

### API Call - External Validation

```sql
-- Config
{
  "endpoint": "https://api.example.com/validate",
  "method": "POST",
  "body_template": "{\"cpf\": \"{{cpf}}\"}",
  "success_field": "is_valid",
  "success_value": true
}

-- Example
INSERT INTO validation_rules (name, rule_type, config) VALUES
('blacklist_check', 'api_call', '{
  "endpoint": "https://api.compliance.com/check",
  "body_template": "{\"cpf\": \"{{cpf}}\"}"
}');
```

### SQL Query - Database Validation

```sql
-- Config
{
  "query": "SELECT 1 FROM instances WHERE data->>'email' = $1",
  "params": ["email"],
  "expect_exists": false,
  "error_message": "Email already exists"
}

-- Example
INSERT INTO validation_rules (name, rule_type, config) VALUES
('email_unique', 'sql_query', '{
  "query": "SELECT 1 FROM instances WHERE data->>''email'' = $1",
  "params": ["email"],
  "expect_exists": false
}');
```

### Composite - Combine Rules

```sql
-- Config
{
  "operator": "AND",
  "rules": [
    {"rule_name": "cpf_format"},
    {"rule_name": "cpf_check"}
  ]
}

-- Example
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_complete', 'composite', '{
  "operator": "AND",
  "rules": [
    {"rule_name": "cpf_format"},
    {"rule_name": "cpf_check"}
  ]
}');
```

## Object Definition Integration

```json
{
  "name": "cliente_pf",
  "schema": { /* JSON Schema */ },
  "rules": [
    {"rule_name": "cpf_complete"},
    {"rule_name": "email_unique"},
    {"rule_id": "uuid-of-rule"}
  ]
}
```

## Common Patterns

### CPF Validation (Complete)

```sql
-- Format
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_format', 'regex', '{"field": "cpf", "pattern": "^\\d{11}$"}');

-- Algorithm
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_algo', 'function', '{"code": "return validateCPF(data.cpf);"}');

-- Composite
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_complete', 'composite', '{
  "operator": "AND",
  "rules": [{"rule_name": "cpf_format"}, {"rule_name": "cpf_algo"}]
}');
```

### Email Validation

```sql
-- Format
INSERT INTO validation_rules (name, rule_type, config) VALUES
('email_format', 'regex', '{
  "field": "email",
  "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.[a-zA-Z]{2,}$"
}');

-- Uniqueness
INSERT INTO validation_rules (name, rule_type, config) VALUES
('email_unique', 'sql_query', '{
  "query": "SELECT 1 FROM instances WHERE data->>''email'' = $1 AND is_deleted = false",
  "params": ["email"],
  "expect_exists": false
}');
```

### Age Validation

```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
('age_18', 'function', '{
  "code": "const d = parseDate(data.data_nascimento); return (now()-d)/(1000*60*60*24*365.25) >= 18;",
  "error_message": "Must be 18+"
}');
```

## Testing

```bash
# Run all tests
go test ./internal/validation/... -v

# Coverage
go test ./internal/validation/... -cover

# Specific test
go test -run TestRegexRuleExecutor -v
```

## Custom Executor

```go
// 1. Implement interface
type MyExecutor struct{}

func (e *MyExecutor) Execute(config json.RawMessage, data map[string]interface{}) error {
    // Your logic
    return nil
}

// 2. Register
registry := executor.GetRegistry()
registry.RegisterRule("my_type", &MyExecutor{})
```

## Error Handling

```go
err := executor.ValidateData(ctx, rulesJSON, dataJSON)
if err != nil {
    // Returns: "validation failed: [rule 0: error1; rule 1: error2]"
    // Extract specific errors for user-friendly messages
}
```

## Performance Tips

1. **Cache rules**: Frequently used rules can be cached
2. **Timeouts**: Set appropriate timeouts for API/function rules
3. **Indexes**: Add indexes for SQL query rules
4. **Parallel**: Independent rules can run in parallel (future)

## Debugging

```javascript
// In function rules, use console.log
{
  "code": "console.log('data:', data); return true;"
}
```

```bash
# Check registered types
types := registry.ListRegisteredTypes()
fmt.Println(types)  // ["regex", "function", "api_call", "sql_query", "composite"]
```

## Common Errors

| Error | Solution |
|-------|----------|
| "no executor registered" | Check rule_type matches registered executor |
| "failed to parse config" | Validate JSON config syntax |
| "timeout" | Increase timeout in config |
| "field not found" | Ensure field exists in data |

## File Locations

```
backend/internal/validation/
├── types.go              # Core types
├── rule_executor.go      # Main service
├── rule_registry.go      # Registry
├── executor_*.go         # Executors
├── *_test.go             # Tests
├── README.md             # Full docs
├── EXAMPLES.md           # Examples
└── QUICK_REFERENCE.md    # This file
```

## SQL Helpers

```sql
-- List all rules
SELECT name, rule_type FROM validation_rules ORDER BY name;

-- Find rules by type
SELECT name FROM validation_rules WHERE rule_type = 'function';

-- Test rule config (validate JSON)
SELECT config::jsonb FROM validation_rules WHERE name = 'cpf_format';
```

## Need Help?

1. Check `README.md` for detailed docs
2. Check `EXAMPLES.md` for real-world examples
3. Check `SETUP.md` for installation issues
4. Run tests: `go test -v`
5. Contact dev team

## Validation Flow Diagram

```
Request → JSON Schema → Custom Rules → Create Instance
                ↓
         RuleExecutorService
                ↓
         For each rule:
         1. Fetch from DB
         2. Get executor
         3. Execute
         4. Collect errors
                ↓
         Return aggregated errors
```

## Rule Priority

Rules execute in order defined in `object_definition.rules` array:

```json
{
  "rules": [
    {"rule_name": "format_check"},     // 1st
    {"rule_name": "algorithm_check"},  // 2nd
    {"rule_name": "blacklist_check"}   // 3rd
  ]
}
```

**Note**: If any rule fails, validation stops and returns error.

## API Integration

```go
// In InstanceHandler.Create()
ruleExecutor := validation.NewRuleExecutorService(h.db.Pool)
if err := ruleExecutor.ValidateData(ctx, objDef.Rules, req.Data); err != nil {
    c.JSON(400, gin.H{"error": err.Error()})
    return
}
```

## Complete Example

```sql
-- 1. Create rules
INSERT INTO validation_rules (name, rule_type, config) VALUES
('cpf_fmt', 'regex', '{"field": "cpf", "pattern": "^\\d{11}$"}'),
('cpf_algo', 'function', '{"code": "return validateCPF(data.cpf);"}'),
('cpf_all', 'composite', '{"operator": "AND", "rules": [{"rule_name": "cpf_fmt"}, {"rule_name": "cpf_algo"}]}');

-- 2. Use in object definition
UPDATE object_definitions
SET rules = '[{"rule_name": "cpf_all"}]'::jsonb
WHERE name = 'cliente_pf';

-- 3. Test via API
POST /api/v1/instances
{
  "object_definition_id": "uuid-cliente-pf",
  "data": {"cpf": "12345678909"}  // Will validate!
}
```

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Sprint**: Sprint 2 - Custom Rule Executor Implementation
