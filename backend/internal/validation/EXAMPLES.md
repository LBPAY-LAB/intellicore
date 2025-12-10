# Validation Rule Executor - Examples and Usage

## Overview

The Rule Executor framework provides a flexible, extensible system for validating instance data using different types of validation rules. All rules are stored in the `validation_rules` table and executed dynamically at runtime.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RuleExecutorService                      │
│  - Coordinates validation rule execution                    │
│  - Manages RuleRegistry                                     │
│  - Integrates with InstanceHandler                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      RuleRegistry                           │
│  - Maps rule_type → RuleExecutor                            │
│  - Supports custom executor registration                    │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐   ┌──────────────┐   ┌─────────────────┐
│   Regex     │   │  Function    │   │   API Call      │
│  Executor   │   │  Executor    │   │   Executor      │
└─────────────┘   └──────────────┘   └─────────────────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌─────────────┐   ┌──────────────┐
│  SQL Query  │   │  Composite   │
│  Executor   │   │  Executor    │
└─────────────┘   └──────────────┘
```

## Rule Types

### 1. Regex Rule (`rule_type: "regex"`)

Validates field values against regular expression patterns.

**Configuration Schema:**
```json
{
  "field": "string (required)",
  "pattern": "string (required, regex pattern)",
  "error_message": "string (optional)"
}
```

**Database Example:**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config, is_system) VALUES
(
  'cpf_format',
  'CPF Format Validation',
  'regex',
  '{
    "field": "cpf",
    "pattern": "^\\d{11}$",
    "error_message": "CPF must contain exactly 11 digits"
  }',
  true
),
(
  'email_format',
  'Email Format Validation',
  'regex',
  '{
    "field": "email",
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "error_message": "Invalid email format"
  }',
  true
),
(
  'phone_br_format',
  'Brazilian Phone Format',
  'regex',
  '{
    "field": "phone",
    "pattern": "^\\d{10,11}$",
    "error_message": "Phone must have 10 or 11 digits"
  }',
  true
);
```

**Usage in Object Definition:**
```json
{
  "name": "cliente_pf",
  "schema": { /* ... */ },
  "rules": [
    {
      "rule_name": "cpf_format"
    },
    {
      "rule_name": "email_format"
    }
  ]
}
```

---

### 2. Function Rule (`rule_type: "function"`)

Executes JavaScript code to perform complex validations. Runs in a sandboxed environment with utility functions.

**Configuration Schema:**
```json
{
  "code": "string (required, JavaScript code)",
  "error_message": "string (optional)",
  "timeout": "number (optional, milliseconds, default: 5000)"
}
```

**Available Utility Functions:**
- `validateCPF(cpf)` - Validates Brazilian CPF with check digits
- `validateCNPJ(cnpj)` - Validates Brazilian CNPJ with check digits
- `validateEmail(email)` - Basic email validation
- `parseDate(dateStr)` - Parse date string (YYYY-MM-DD)
- `now()` - Get current timestamp
- `console.log(...)` - Debug logging

**Database Examples:**

**Example 1: Age Validation**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config) VALUES
(
  'minimum_age_18',
  'Minimum Age 18 Years',
  'function',
  '{
    "code": "const birthDate = parseDate(data.data_nascimento); const age = (now() - birthDate) / (1000 * 60 * 60 * 24 * 365.25); return age >= 18;",
    "error_message": "Customer must be at least 18 years old",
    "timeout": 1000
  }'
);
```

**Example 2: CPF Validation with Algorithm**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config, is_system) VALUES
(
  'cpf_algorithm_validation',
  'CPF Algorithm Validation',
  'function',
  '{
    "code": "return validateCPF(data.cpf);",
    "error_message": "Invalid CPF check digits"
  }',
  true
);
```

**Example 3: Complex Business Logic**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config) VALUES
(
  'premium_account_balance',
  'Premium Account Minimum Balance',
  'function',
  '{
    "code": "if (data.account_type === ''premium'') { return data.balance >= 10000; } return true;",
    "error_message": "Premium accounts require minimum balance of R$ 10,000"
  }'
);
```

**Example 4: Custom Error Messages**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
(
  'transaction_limit_check',
  'function',
  '{
    "code": "if (data.valor > data.limite_diario) { return ''Transaction exceeds daily limit of R$ '' + (data.limite_diario / 100).toFixed(2); } return true;"
  }'
);
```

---

### 3. API Call Rule (`rule_type: "api_call"`)

Calls external APIs for validation (e.g., blacklist checks, fraud detection, BACEN validations).

**Configuration Schema:**
```json
{
  "endpoint": "string (required, full URL)",
  "method": "string (optional, default: POST)",
  "headers": "object (optional)",
  "body_template": "string (optional, supports {{field}} placeholders)",
  "timeout": "number (optional, milliseconds, default: 5000)",
  "success_field": "string (optional, JSON path to success indicator)",
  "success_value": "any (optional, expected success value)",
  "error_message": "string (optional)"
}
```

**Database Examples:**

**Example 1: CPF Blacklist Check**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config) VALUES
(
  'cpf_blacklist_check',
  'CPF Blacklist Validation',
  'api_call',
  '{
    "endpoint": "https://api.internal.lbpay.com/compliance/blacklist/check",
    "method": "POST",
    "headers": {
      "Authorization": "Bearer {{INTERNAL_API_KEY}}",
      "Content-Type": "application/json"
    },
    "body_template": "{\"cpf\": \"{{cpf}}\", \"type\": \"PF\"}",
    "success_field": "is_clear",
    "success_value": true,
    "error_message": "CPF found in blacklist",
    "timeout": 3000
  }'
);
```

**Example 2: Fraud Detection**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config) VALUES
(
  'fraud_score_check',
  'Data Rudder Fraud Detection',
  'api_call',
  '{
    "endpoint": "https://api.datarudder.com/v2/risk-score",
    "method": "POST",
    "headers": {
      "X-API-Key": "{{DATA_RUDDER_KEY}}"
    },
    "body_template": "{\"transaction\": {\"amount\": {{valor}}, \"device_id\": \"{{device_id}}\"}, \"user\": {\"cpf\": \"{{cpf}}\"}}",
    "success_field": "risk_score",
    "success_value": 75,
    "error_message": "Transaction flagged as high risk",
    "timeout": 5000
  }'
);
```

**Example 3: Address Validation via ViaCEP**
```sql
INSERT INTO validation_rules (name, rule_type, config, is_system) VALUES
(
  'cep_validation',
  'api_call',
  '{
    "endpoint": "https://viacep.com.br/ws/{{cep}}/json/",
    "method": "GET",
    "success_field": "erro",
    "error_message": "Invalid CEP",
    "timeout": 3000
  }',
  true
);
```

---

### 4. SQL Query Rule (`rule_type: "sql_query"`)

Executes SQL queries against the database for complex validations.

**Configuration Schema:**
```json
{
  "query": "string (required, SQL query with $1, $2 placeholders)",
  "params": "array of strings (field names to use as parameters)",
  "expect_exists": "boolean (true = expect rows, false = expect no rows)",
  "error_message": "string (optional)"
}
```

**Database Examples:**

**Example 1: Unique Email Check**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config) VALUES
(
  'email_unique',
  'Email Must Be Unique',
  'sql_query',
  '{
    "query": "SELECT 1 FROM instances WHERE object_definition_id = (SELECT id FROM object_definitions WHERE name = ''cliente_pf'') AND data->>''email'' = $1 AND is_deleted = false LIMIT 1",
    "params": ["email"],
    "expect_exists": false,
    "error_message": "Email already registered"
  }'
);
```

**Example 2: Daily Transaction Limit**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
(
  'daily_transaction_limit',
  'sql_query',
  '{
    "query": "SELECT SUM((data->>''valor'')::numeric) as total FROM instances WHERE object_definition_id = (SELECT id FROM object_definitions WHERE name = ''transacao_pix'') AND data->>''cpf_origem'' = $1 AND created_at >= CURRENT_DATE AND is_deleted = false HAVING SUM((data->>''valor'')::numeric) + $2 <= 10000",
    "params": ["cpf", "valor"],
    "expect_exists": true,
    "error_message": "Daily transaction limit exceeded"
  }'
);
```

**Example 3: Account Ownership Check**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
(
  'account_ownership',
  'sql_query',
  '{
    "query": "SELECT 1 FROM relationships r JOIN instances i ON r.target_instance_id = i.id WHERE r.source_instance_id = (SELECT id FROM instances WHERE data->>''cpf'' = $1 LIMIT 1) AND i.data->>''numero_conta'' = $2 AND r.relationship_type = ''TITULAR_DE''",
    "params": ["cpf", "numero_conta"],
    "expect_exists": true,
    "error_message": "User is not the account owner"
  }'
);
```

---

### 5. Composite Rule (`rule_type: "composite"`)

Combines multiple rules with AND/OR logic.

**Configuration Schema:**
```json
{
  "rules": [
    {
      "rule_id": "uuid (optional)",
      "rule_name": "string (optional)"
    }
  ],
  "operator": "string (AND or OR, default: AND)",
  "error_message": "string (optional)"
}
```

**Database Examples:**

**Example 1: Complete CPF Validation (AND)**
```sql
INSERT INTO validation_rules (name, display_name, rule_type, config) VALUES
(
  'cpf_complete_validation',
  'Complete CPF Validation',
  'composite',
  '{
    "operator": "AND",
    "rules": [
      {"rule_name": "cpf_format"},
      {"rule_name": "cpf_algorithm_validation"},
      {"rule_name": "cpf_blacklist_check"}
    ],
    "error_message": "CPF validation failed"
  }'
);
```

**Example 2: Alternative Identification (OR)**
```sql
INSERT INTO validation_rules (name, rule_type, config) VALUES
(
  'identity_document_required',
  'composite',
  '{
    "operator": "OR",
    "rules": [
      {"rule_name": "cpf_complete_validation"},
      {"rule_name": "passport_validation"},
      {"rule_name": "rne_validation"}
    ],
    "error_message": "At least one valid identification document is required"
  }'
);
```

---

## Integration with Instance Handler

The Rule Executor integrates seamlessly with the InstanceHandler:

```go
// In InstanceHandler.Create()

// 1. JSON Schema Validation (structural)
schemaLoader := gojsonschema.NewBytesLoader(objDef.Schema)
dataLoader := gojsonschema.NewBytesLoader(req.Data)
result, err := gojsonschema.Validate(schemaLoader, dataLoader)

if !result.Valid() {
    return errors
}

// 2. Custom Rules Validation (business logic)
ruleExecutor := validation.NewRuleExecutorService(db)
if err := ruleExecutor.ValidateData(ctx, objDef.Rules, req.Data); err != nil {
    return err
}

// 3. Create instance
// ...
```

---

## Usage Examples

### Example 1: Creating a Customer with Full Validation

**Object Definition:**
```json
{
  "name": "cliente_pf",
  "display_name": "Cliente Pessoa Física",
  "schema": {
    "type": "object",
    "properties": {
      "cpf": {"type": "string"},
      "email": {"type": "string"},
      "data_nascimento": {"type": "string", "format": "date"},
      "phone": {"type": "string"}
    },
    "required": ["cpf", "email", "data_nascimento"]
  },
  "rules": [
    {"rule_name": "cpf_complete_validation"},
    {"rule_name": "email_format"},
    {"rule_name": "email_unique"},
    {"rule_name": "minimum_age_18"},
    {"rule_name": "phone_br_format"}
  ]
}
```

**API Request:**
```bash
POST /api/v1/instances
{
  "object_definition_id": "uuid-cliente-pf",
  "data": {
    "cpf": "12345678909",
    "email": "user@example.com",
    "data_nascimento": "1990-05-15",
    "phone": "11987654321"
  }
}
```

**Validation Flow:**
1. JSON Schema validates structure and types ✓
2. `cpf_complete_validation` (composite):
   - `cpf_format` (regex) ✓
   - `cpf_algorithm_validation` (function) ✓
   - `cpf_blacklist_check` (api_call) ✓
3. `email_format` (regex) ✓
4. `email_unique` (sql_query) ✓
5. `minimum_age_18` (function) ✓
6. `phone_br_format` (regex) ✓

---

### Example 2: Transaction Validation

**Object Definition:**
```json
{
  "name": "transacao_pix",
  "rules": [
    {"rule_name": "valor_positivo"},
    {"rule_name": "daily_transaction_limit"},
    {"rule_name": "fraud_score_check"},
    {"rule_name": "account_ownership"}
  ]
}
```

---

## Testing

### Unit Tests

```bash
cd backend/internal/validation
go test -v -cover
```

### Coverage Report

```bash
go test -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Integration Tests

Create test validation rules and test full flow:

```go
func TestRuleExecutorIntegration(t *testing.T) {
    // Setup DB and create test rule
    // ...

    executor := validation.NewRuleExecutorService(db)

    data := map[string]interface{}{
        "cpf": "12345678909",
    }

    err := executor.ValidateRuleByName(ctx, "cpf_format", data)
    if err != nil {
        t.Errorf("validation failed: %v", err)
    }
}
```

---

## Performance Considerations

1. **Caching**: Rule definitions are fetched from DB on each validation. Consider adding cache layer for frequently used rules.

2. **Timeouts**: Set appropriate timeouts for API calls and function execution to prevent hanging validations.

3. **Concurrent Validation**: Rules are executed sequentially. For independent rules, consider parallel execution.

4. **Database Queries**: SQL query rules should be optimized with proper indexes.

---

## Security

1. **JavaScript Sandbox**: Function executor runs in isolated goja VM with timeout protection
2. **SQL Injection**: All SQL queries use parameterized queries ($1, $2, etc.)
3. **API Secrets**: Store API keys in encrypted configuration, use environment variables
4. **Rate Limiting**: Implement rate limiting for external API calls

---

## Custom Rule Executor Example

You can register custom executors for specialized validation:

```go
// Custom BACEN compliance executor
type BACENRuleExecutor struct {
    bacenClient *BACENClient
}

func (e *BACENRuleExecutor) Execute(config json.RawMessage, data map[string]interface{}) error {
    // Custom BACEN validation logic
    return nil
}

// Register
registry := executor.GetRegistry()
registry.RegisterRule("bacen_compliance", &BACENRuleExecutor{})
```

---

## Troubleshooting

### Common Errors

**Error: "no executor registered for rule type"**
- Solution: Ensure rule_type in validation_rules matches registered executor

**Error: "failed to parse config"**
- Solution: Validate JSON config structure matches expected schema

**Error: "API call failed: timeout"**
- Solution: Increase timeout in config or check API availability

**Error: "validation query returned no rows"**
- Solution: Check SQL query syntax and parameters

---

## Next Steps

1. Add monitoring and metrics for rule execution
2. Implement caching layer for rule definitions
3. Add rule versioning support
4. Create UI for rule management
5. Add audit trail for validation failures
