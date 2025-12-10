# Custom Validation Rules - Documentation

## Overview

Custom validation rules allow you to define flexible, reusable validation logic that goes beyond JSON Schema validation. The SuperCore platform supports two types of expressions:

1. **Simple Expressions** - Optimized for common validation patterns (numeric comparisons, regex, length checks)
2. **CEL Expressions** - Complex validation logic using Google's Common Expression Language

## Rule Configuration

### CustomRuleConfig Structure

```json
{
  "expression": "value >= 0",
  "error_message": "Balance cannot be negative",
  "field": "balance",
  "fail_on_missing": false
}
```

**Fields:**

- `expression` (required): The validation expression to evaluate
- `error_message` (optional): Custom error message when validation fails
- `field` (optional): Specific field to validate. If omitted, validates entire data object
- `fail_on_missing` (optional): If true, validation fails when field is missing. Default: false

## Expression Types

### 1. Numeric Comparisons (Simple)

Validates numeric values against thresholds.

**Supported Operators:** `>`, `>=`, `<`, `<=`, `==`, `!=`

**Examples:**

```json
// Non-negative balance
{
  "expression": "value >= 0",
  "error_message": "Balance cannot be negative",
  "field": "balance"
}

// Age requirement
{
  "expression": "value >= 18",
  "error_message": "Must be at least 18 years old",
  "field": "age",
  "fail_on_missing": true
}

// Percentage range
{
  "expression": "value >= 0 && value <= 100",
  "error_message": "Percentage must be between 0 and 100",
  "field": "interest_rate"
}
```

### 2. Regex Pattern Matching (Simple)

Validates string values against regex patterns.

**Syntax:** `matches "pattern"`

**Examples:**

```json
// CPF validation
{
  "expression": "matches \"^\\\\d{3}\\\\.\\\\d{3}\\\\.\\\\d{3}-\\\\d{2}$\"",
  "error_message": "CPF must be in format XXX.XXX.XXX-XX",
  "field": "cpf"
}

// Email validation
{
  "expression": "matches \"^[\\\\w\\\\.-]+@[\\\\w\\\\.-]+\\\\.[a-zA-Z]{2,}$\"",
  "error_message": "Invalid email address",
  "field": "email"
}

// Phone validation (Brazilian)
{
  "expression": "matches \"^\\\\(\\\\d{2}\\\\)\\\\s\\\\d{4,5}-\\\\d{4}$\"",
  "error_message": "Phone must be in format (XX) XXXXX-XXXX",
  "field": "phone"
}
```

**Note:** In JSON, backslashes must be escaped twice (e.g., `\\d` becomes `\\\\d`)

### 3. Length Checks (Simple)

Validates string, array, or map length.

**Syntax:** `len(value) <operator> <number>`

**Examples:**

```json
// Password strength
{
  "expression": "len(value) >= 8",
  "error_message": "Password must be at least 8 characters",
  "field": "password"
}

// Username length range
{
  "expression": "len(value) >= 3 && len(value) <= 20",
  "error_message": "Username must be between 3 and 20 characters",
  "field": "username",
  "fail_on_missing": true
}

// Non-empty validation
{
  "expression": "len(value) > 0",
  "error_message": "Field cannot be empty",
  "field": "description"
}
```

### 4. CEL Expressions (Complex)

For complex validation logic, use CEL (Common Expression Language).

**Data Access:** Use `data.fieldName` to access instance data

**Examples:**

```json
// Multi-field validation
{
  "expression": "data.balance >= 0 && data.status == 'active'",
  "error_message": "Active accounts must have non-negative balance"
}

// Credit limit range
{
  "expression": "data.credit_limit >= 0 && data.credit_limit <= 100000",
  "error_message": "Credit limit must be between 0 and 100,000"
}

// Conditional validation
{
  "expression": "data.account_type != 'savings' || data.balance >= 100",
  "error_message": "Savings accounts require minimum balance of 100"
}

// String operations
{
  "expression": "data.name.startsWith('Company') || data.entity_type == 'individual'",
  "error_message": "Company names must start with 'Company' prefix"
}

// List operations
{
  "expression": "data.transactions.size() <= 1000",
  "error_message": "Too many transactions in single request"
}
```

**CEL Built-in Functions:**
- String: `startsWith()`, `endsWith()`, `contains()`, `matches()`, `size()`
- Math: `+`, `-`, `*`, `/`, `%`
- Comparison: `>`, `>=`, `<`, `<=`, `==`, `!=`
- Logical: `&&`, `||`, `!`
- Collections: `size()`, `in`, `has()`

## Creating Validation Rules

### Via API

**POST /api/v1/validation-rules**

```json
{
  "name": "non_negative_balance",
  "display_name": "Non-Negative Balance",
  "description": "Ensures account balance is zero or positive",
  "rule_type": "custom",
  "config": {
    "expression": "value >= 0",
    "error_message": "Balance cannot be negative",
    "field": "balance"
  }
}
```

### Via SQL

```sql
INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
VALUES (
    'non_negative_balance',
    'Non-Negative Balance',
    'Ensures account balance is zero or positive',
    'custom',
    '{
        "expression": "value >= 0",
        "error_message": "Balance cannot be negative",
        "field": "balance"
    }'::jsonb,
    true
);
```

## Using Rules in Object Definitions

Custom rules are referenced in the `rules` field of object definitions:

```json
{
  "name": "account",
  "display_name": "Bank Account",
  "schema": { ... },
  "rules": [
    {
      "rule_name": "non_negative_balance"
    },
    {
      "rule_name": "valid_cpf_format"
    },
    {
      "rule_id": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

**Rule Reference Options:**
- `rule_name`: Reference by unique rule name
- `rule_id`: Reference by UUID
- `config`: Optional override config (advanced)

## Validation Execution Flow

1. **JSON Schema Validation** - Structure and type validation
2. **Custom Rules Validation** - Business logic validation
   - Rules are executed in order
   - First failing rule stops validation
   - Error message is returned to client

## Performance Considerations

### Simple vs CEL Expressions

**Simple expressions** are evaluated first and are optimized for common patterns:
- Numeric comparisons: ~1-5 μs
- Regex matching: ~10-50 μs
- Length checks: ~1-5 μs

**CEL expressions** are used as fallback for complex logic:
- Compilation: ~100-500 μs (cached)
- Evaluation: ~50-200 μs

**Best Practice:** Use simple expressions when possible for better performance.

### Example Performance

```go
// FAST - Simple expression
"value >= 0"

// SLOWER - CEL expression (but more powerful)
"data.balance >= 0 && data.status == 'active'"
```

## Testing Custom Rules

### Unit Testing

```bash
cd backend/internal/services/validator
go test -v
```

### Benchmark Testing

```bash
go test -bench=. -benchmem
```

### Manual Testing via API

```bash
# Create a validation rule
curl -X POST http://localhost:8080/api/v1/validation-rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_rule",
    "display_name": "Test Rule",
    "rule_type": "custom",
    "config": {
      "expression": "value >= 0",
      "field": "balance"
    }
  }'

# Create instance with invalid data (should fail)
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "...",
    "data": {
      "balance": -100
    }
  }'
```

## Common Use Cases

### 1. Financial Validation

```json
{
  "expression": "value >= 0",
  "error_message": "Amount must be non-negative",
  "field": "amount"
}
```

### 2. Document Validation (Brazil)

```json
// CPF
{
  "expression": "matches \"^\\\\d{3}\\\\.\\\\d{3}\\\\.\\\\d{3}-\\\\d{2}$\"",
  "field": "cpf"
}

// CNPJ
{
  "expression": "matches \"^\\\\d{2}\\\\.\\\\d{3}\\\\.\\\\d{3}/\\\\d{4}-\\\\d{2}$\"",
  "field": "cnpj"
}
```

### 3. Age/Date Validation

```json
{
  "expression": "value >= 18",
  "error_message": "Must be 18 or older",
  "field": "age"
}
```

### 4. Business Rules

```json
{
  "expression": "data.account_type != 'premium' || data.balance >= 10000",
  "error_message": "Premium accounts require minimum balance of 10,000"
}
```

## Error Handling

### Default Error Messages

If `error_message` is not provided, a generic message is generated:

```
"<rule_display_name> failed: <technical_error>"
```

### Custom Error Messages

Always provide clear, user-friendly error messages:

```json
// Good
{
  "error_message": "CPF must be in format XXX.XXX.XXX-XX"
}

// Bad
{
  "error_message": "Validation failed"
}
```

## Troubleshooting

### Common Issues

1. **Regex not matching:**
   - Remember to escape backslashes in JSON: `\\d` → `\\\\d`
   - Test regex separately before adding to config

2. **CEL compilation error:**
   - Check that expression returns boolean
   - Verify field names match data structure
   - Use `data.field` for field access in CEL

3. **Field not found:**
   - Set `fail_on_missing: false` for optional fields
   - Set `fail_on_missing: true` for required fields

### Debug Mode

Enable verbose logging:

```go
// In validator.go, add debug logging
log.Printf("Evaluating expression: %s on data: %v", expression, data)
```

## Security Considerations

1. **No Code Execution:** CEL expressions are safe - no arbitrary code execution
2. **Resource Limits:** CEL has built-in protection against infinite loops
3. **Input Sanitization:** All data is validated before rule execution
4. **Rule Isolation:** Each rule executes independently

## Best Practices

1. **Use Simple Expressions First:** Better performance, easier to debug
2. **Provide Clear Error Messages:** Help users understand what went wrong
3. **Test Thoroughly:** Write unit tests for each custom rule
4. **Document Rules:** Add descriptions to explain business logic
5. **Version Control:** Track rule changes in git
6. **Reuse Rules:** Create library of common validation rules
7. **Fail Fast:** Order rules from most restrictive to least restrictive

## Examples Library

See `/backend/scripts/seed_custom_rules.sql` for 15+ production-ready examples including:

- Non-negative balance
- CPF/CNPJ format validation
- Email validation
- Phone number validation
- Password strength
- Credit limit validation
- Age requirements
- Username validation
- PIX key validation

## References

- [CEL Specification](https://github.com/google/cel-spec)
- [CEL Go Library](https://github.com/google/cel-go)
- [Regex Reference](https://pkg.go.dev/regexp)
- [JSON Schema Validation](https://json-schema.org/)

## Support

For questions or issues with custom validation rules:

1. Check this documentation
2. Review example rules in seed file
3. Run unit tests for debugging
4. Contact the SuperCore development team
