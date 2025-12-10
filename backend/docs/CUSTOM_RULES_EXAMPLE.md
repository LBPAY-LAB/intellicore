# Custom Rules - End-to-End Example

This guide demonstrates how to create and test a custom validation rule that enforces business logic.

## Scenario: Bank Account with Balance Validation

We'll create a bank account object definition with custom rules to ensure:
1. Balance is non-negative
2. CPF is properly formatted
3. Account holder is 18 or older

## Step 1: Create Validation Rules

### Rule 1: Non-Negative Balance

```bash
curl -X POST http://localhost:8080/api/v1/validation-rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "non_negative_balance",
    "display_name": "Non-Negative Balance",
    "description": "Account balance must be zero or positive",
    "rule_type": "custom",
    "config": {
      "expression": "value >= 0",
      "error_message": "Account balance cannot be negative",
      "field": "balance"
    }
  }'
```

**Expected Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "non_negative_balance",
  "display_name": "Non-Negative Balance",
  "rule_type": "custom",
  "is_system": false,
  "created_at": "2025-12-09T10:00:00Z",
  "updated_at": "2025-12-09T10:00:00Z"
}
```

### Rule 2: Valid CPF Format

```bash
curl -X POST http://localhost:8080/api/v1/validation-rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "valid_cpf_format",
    "display_name": "Valid CPF Format",
    "description": "CPF must be in XXX.XXX.XXX-XX format",
    "rule_type": "custom",
    "config": {
      "expression": "matches \"^\\\\d{3}\\\\.\\\\d{3}\\\\.\\\\d{3}-\\\\d{2}$\"",
      "error_message": "CPF must be in format XXX.XXX.XXX-XX",
      "field": "cpf",
      "fail_on_missing": true
    }
  }'
```

### Rule 3: Minimum Age 18

```bash
curl -X POST http://localhost:8080/api/v1/validation-rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "minimum_age_18",
    "display_name": "Minimum Age 18",
    "description": "Account holder must be at least 18 years old",
    "rule_type": "custom",
    "config": {
      "expression": "value >= 18",
      "error_message": "Account holder must be at least 18 years old",
      "field": "age",
      "fail_on_missing": true
    }
  }'
```

## Step 2: Create Object Definition

Create a bank account object definition that references our custom rules:

```bash
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "bank_account",
    "display_name": "Bank Account",
    "description": "Customer bank account",
    "category": "BUSINESS_ENTITY",
    "schema": {
      "type": "object",
      "properties": {
        "account_number": {
          "type": "string"
        },
        "holder_name": {
          "type": "string"
        },
        "cpf": {
          "type": "string"
        },
        "age": {
          "type": "integer"
        },
        "balance": {
          "type": "number"
        },
        "status": {
          "type": "string",
          "enum": ["active", "inactive", "suspended"]
        }
      },
      "required": ["account_number", "holder_name", "cpf", "age", "balance", "status"]
    },
    "rules": [
      {
        "rule_name": "non_negative_balance"
      },
      {
        "rule_name": "valid_cpf_format"
      },
      {
        "rule_name": "minimum_age_18"
      }
    ],
    "states": {
      "initial": "active",
      "states": {
        "active": {
          "transitions": ["inactive", "suspended"]
        },
        "inactive": {
          "transitions": ["active"]
        },
        "suspended": {
          "transitions": ["active", "inactive"]
        }
      }
    }
  }'
```

**Expected Response:**
```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "name": "bank_account",
  "display_name": "Bank Account",
  "version": 1,
  "is_active": true,
  "created_at": "2025-12-09T10:05:00Z"
}
```

## Step 3: Test Validation - Success Case

Create an instance with valid data:

```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
    "data": {
      "account_number": "12345-6",
      "holder_name": "João Silva",
      "cpf": "123.456.789-00",
      "age": 25,
      "balance": 1000.50,
      "status": "active"
    }
  }'
```

**Expected Response (Success):**
```json
{
  "id": "750e8400-e29b-41d4-a716-446655440001",
  "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
  "data": {
    "account_number": "12345-6",
    "holder_name": "João Silva",
    "cpf": "123.456.789-00",
    "age": 25,
    "balance": 1000.50,
    "status": "active"
  },
  "current_state": "active",
  "version": 1,
  "created_at": "2025-12-09T10:10:00Z"
}
```

## Step 4: Test Validation - Negative Balance (FAIL)

Create an instance with **negative balance**:

```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
    "data": {
      "account_number": "12345-7",
      "holder_name": "Maria Santos",
      "cpf": "987.654.321-00",
      "age": 30,
      "balance": -500.00,
      "status": "active"
    }
  }'
```

**Expected Response (FAIL):**
```json
{
  "error": "Validation failed: Account balance cannot be negative"
}
```

**Status Code:** 400 Bad Request

## Step 5: Test Validation - Invalid CPF Format (FAIL)

Create an instance with **invalid CPF format**:

```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
    "data": {
      "account_number": "12345-8",
      "holder_name": "Pedro Costa",
      "cpf": "12345678900",
      "age": 28,
      "balance": 500.00,
      "status": "active"
    }
  }'
```

**Expected Response (FAIL):**
```json
{
  "error": "Validation failed: CPF must be in format XXX.XXX.XXX-XX"
}
```

**Status Code:** 400 Bad Request

## Step 6: Test Validation - Underage (FAIL)

Create an instance with **age under 18**:

```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
    "data": {
      "account_number": "12345-9",
      "holder_name": "Carlos Júnior",
      "cpf": "111.222.333-44",
      "age": 17,
      "balance": 100.00,
      "status": "active"
    }
  }'
```

**Expected Response (FAIL):**
```json
{
  "error": "Validation failed: Account holder must be at least 18 years old"
}
```

**Status Code:** 400 Bad Request

## Step 7: Test Validation - Multiple Violations (FAIL)

Create an instance with **multiple validation errors**:

```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
    "data": {
      "account_number": "12345-10",
      "holder_name": "Ana Maria",
      "cpf": "invalid-cpf",
      "age": 16,
      "balance": -100.00,
      "status": "active"
    }
  }'
```

**Expected Response (FAIL - First Error):**
```json
{
  "error": "Validation failed: Account balance cannot be negative"
}
```

**Note:** Validation stops at first failing rule. To see all errors, you'd need to modify the validator to collect all errors before returning.

## Step 8: Update Instance - Validation on Update

Update an existing instance with invalid data:

```bash
curl -X PUT http://localhost:8080/api/v1/instances/750e8400-e29b-41d4-a716-446655440001 \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "account_number": "12345-6",
      "holder_name": "João Silva",
      "cpf": "123.456.789-00",
      "age": 25,
      "balance": -1000.00,
      "status": "active"
    }
  }'
```

**Expected Response (FAIL):**
```json
{
  "error": "Validation failed: Account balance cannot be negative"
}
```

**Status Code:** 400 Bad Request

The instance remains unchanged because validation failed.

## Step 9: Complex CEL Rule Example

Create a more complex rule that validates business logic across multiple fields:

```bash
curl -X POST http://localhost:8080/api/v1/validation-rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "active_account_positive_balance",
    "display_name": "Active Account Balance Check",
    "description": "Active accounts must maintain positive balance",
    "rule_type": "custom",
    "config": {
      "expression": "data.status != \"active\" || data.balance > 0",
      "error_message": "Active accounts must maintain a positive balance"
    }
  }'
```

Add this rule to the bank_account object definition, then test:

```bash
# This should FAIL
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
    "data": {
      "account_number": "12345-11",
      "holder_name": "Lucas Oliveira",
      "cpf": "555.666.777-88",
      "age": 22,
      "balance": 0,
      "status": "active"
    }
  }'
```

**Expected Response (FAIL):**
```json
{
  "error": "Validation failed: Active accounts must maintain a positive balance"
}
```

```bash
# This should PASS (inactive account can have zero balance)
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "650e8400-e29b-41d4-a716-446655440001",
    "data": {
      "account_number": "12345-12",
      "holder_name": "Lucas Oliveira",
      "cpf": "555.666.777-88",
      "age": 22,
      "balance": 0,
      "status": "inactive"
    }
  }'
```

**Expected Response (SUCCESS):** Instance created successfully.

## Verification

### List All Validation Rules

```bash
curl -X GET http://localhost:8080/api/v1/validation-rules?rule_type=custom
```

### Check Instance Data

```bash
curl -X GET http://localhost:8080/api/v1/instances/750e8400-e29b-41d4-a716-446655440001
```

### View Object Definition Rules

```bash
curl -X GET http://localhost:8080/api/v1/object-definitions/650e8400-e29b-41d4-a716-446655440001
```

## Summary

This example demonstrated:

1. Creating custom validation rules with simple and CEL expressions
2. Attaching rules to object definitions
3. Successful validation when all rules pass
4. Failed validation with clear error messages for:
   - Negative balance
   - Invalid CPF format
   - Underage account holder
   - Complex multi-field business rules

## Next Steps

- Explore more complex CEL expressions
- Create composite rules
- Implement custom error handling
- Add API-based validation rules
- Create validation rule templates

## Troubleshooting

If validation isn't working as expected:

1. Check that validation rules were created successfully
2. Verify rule references in object definition
3. Review error logs for detailed error messages
4. Test expressions individually using unit tests
5. Ensure CEL dependency is installed: `go get github.com/google/cel-go/cel@latest`
