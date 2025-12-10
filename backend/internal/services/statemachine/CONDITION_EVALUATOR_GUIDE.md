# Condition Evaluator Guide

## Overview

The Condition Evaluator is a powerful component that allows you to define conditional state transitions in your FSM (Finite State Machine) using **CEL (Common Expression Language)**. This enables flexible, dynamic business logic without code changes.

## What is CEL?

CEL is a non-Turing complete expression language designed by Google for safe, fast evaluation of conditions. It's used in Kubernetes, Firebase, and other Google Cloud products.

**Key Features:**
- Type-safe evaluation
- No side effects (read-only)
- Fast compilation and evaluation
- Rich set of operators and functions
- Protected against infinite loops and resource exhaustion

## Basic Usage

### Creating an Evaluator

```go
import "github.com/lbpay/supercore/internal/services/statemachine"

evaluator, err := statemachine.NewConditionEvaluator()
if err != nil {
    log.Fatal(err)
}
```

### Simple Evaluation

```go
condition := "data.saldo >= 100"
data := map[string]interface{}{
    "saldo": 150.0,
}

result, err := evaluator.Evaluate(condition, data)
// result: true
```

## Available Variables

In your conditions, you have access to:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `data` | object | The instance data (JSONB) | `data.saldo >= 100` |
| `current_state` | string | Current FSM state | `current_state == 'PENDING'` |
| `version` | int | Instance version number | `version > 1` |
| `is_deleted` | bool | Soft delete flag | `is_deleted == false` |
| `created_at` | timestamp | Creation timestamp | N/A (available in context) |
| `updated_at` | timestamp | Last update timestamp | N/A (available in context) |

## Supported Operators

### Comparison Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `>` | Greater than | `data.saldo > 100` |
| `<` | Less than | `data.amount < 1000` |
| `>=` | Greater than or equal | `data.score >= 700` |
| `<=` | Less than or equal | `data.age <= 65` |
| `==` | Equal | `data.status == 'approved'` |
| `!=` | Not equal | `data.type != 'blocked'` |

### Logical Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `&&` | Logical AND | `data.saldo >= 100 && data.score > 700` |
| `\|\|` | Logical OR | `data.is_vip == true \|\| data.saldo >= 10000` |
| `!` | Logical NOT | `!(data.blacklisted == true)` |

### Field Access

```javascript
// Simple field
data.cpf

// Nested field
data.account.balance

// Deeply nested
data.user.profile.address.city
```

## Condition Examples

### 1. Numeric Comparisons

```javascript
// Minimum balance check
data.saldo >= 1000

// Credit score threshold
data.score > 700

// Amount within range
data.amount >= 100 && data.amount <= 10000
```

### 2. String Comparisons

```javascript
// Status check
data.status == 'approved'

// Multiple valid states
data.status == 'approved' || data.status == 'verified'

// Not in blocked state
data.status != 'blocked'
```

### 3. Boolean Flags

```javascript
// Account verified
data.is_verified == true

// Not blacklisted
data.blacklisted == false

// VIP customer
data.is_vip == true
```

### 4. Complex Business Logic

```javascript
// Multi-level approval
data.amount <= 5000 ||
(data.amount <= 50000 && data.manager_approved == true) ||
(data.amount > 50000 && data.director_approved == true)

// Credit approval criteria
data.creditScore >= 700 &&
data.income >= 5000 &&
data.debtRatio < 0.4 &&
data.accountAge >= 6
```

### 5. BACEN Compliance Rules

```javascript
// PIX nighttime limit (Circular 3.978)
data.valor < 1000 || data.horario_limite == false

// KYC verification required
data.valor > 10000 && data.kyc_completo == true

// Daily transaction limit
data.total_dia + data.valor_atual <= 50000
```

### 6. State-Based Conditions

```javascript
// Transition only from specific state
current_state == 'PENDING' && data.documents_received == true

// Version-based checks
version >= 1 && data.updated_fields == true

// Prevent deleted entities
is_deleted == false && data.active == true
```

## FSM Configuration with Conditions

### Object Definition Example

```json
{
  "name": "conta_corrente",
  "states": {
    "initial": "CADASTRO_PENDENTE",
    "states": [
      "CADASTRO_PENDENTE",
      "DOCUMENTOS_ENVIADOS",
      "EM_ANALISE",
      "APROVADA",
      "ATIVA",
      "BLOQUEADA"
    ],
    "transitions": [
      {
        "from": "CADASTRO_PENDENTE",
        "to": "DOCUMENTOS_ENVIADOS",
        "condition": "data.cpf != '' && data.rg != '' && data.comprovante_residencia != ''"
      },
      {
        "from": "DOCUMENTOS_ENVIADOS",
        "to": "EM_ANALISE",
        "condition": null
      },
      {
        "from": "EM_ANALISE",
        "to": "APROVADA",
        "condition": "data.score_credito >= 700 && data.renda_mensal >= 3000"
      },
      {
        "from": "APROVADA",
        "to": "ATIVA",
        "condition": "data.deposito_inicial >= 100"
      },
      {
        "from": "ATIVA",
        "to": "BLOQUEADA",
        "condition": "data.saldo < 0 || data.atividade_suspeita == true"
      }
    ]
  }
}
```

## Real-World Scenarios

### Scenario 1: Account Approval Workflow

```json
{
  "transitions": [
    {
      "from": "PENDING",
      "to": "AUTO_APPROVED",
      "condition": "data.amount <= 1000 && data.customerRating >= 4"
    },
    {
      "from": "PENDING",
      "to": "MANAGER_REVIEW",
      "condition": "data.amount > 1000 && data.amount <= 10000"
    },
    {
      "from": "PENDING",
      "to": "DIRECTOR_REVIEW",
      "condition": "data.amount > 10000"
    },
    {
      "from": "MANAGER_REVIEW",
      "to": "APPROVED",
      "condition": "data.manager_approved == true"
    },
    {
      "from": "DIRECTOR_REVIEW",
      "to": "APPROVED",
      "condition": "data.director_approved == true && data.compliance_checked == true"
    }
  ]
}
```

### Scenario 2: PIX Transaction Compliance

```json
{
  "transitions": [
    {
      "from": "INICIADA",
      "to": "VALIDACAO_LIMITE",
      "condition": "data.valor > 0 && data.chave_destino != ''"
    },
    {
      "from": "VALIDACAO_LIMITE",
      "to": "AGUARDANDO_SPI",
      "condition": "(data.horario_noturno == false || data.valor <= 1000) && data.saldo_disponivel >= data.valor"
    },
    {
      "from": "VALIDACAO_LIMITE",
      "to": "BLOQUEADA_LIMITE",
      "condition": "data.horario_noturno == true && data.valor > 1000"
    },
    {
      "from": "AGUARDANDO_SPI",
      "to": "LIQUIDADA",
      "condition": "data.spi_response_code == 0"
    }
  ]
}
```

### Scenario 3: KYC Verification

```json
{
  "transitions": [
    {
      "from": "CADASTRO_INICIAL",
      "to": "DOCUMENTOS_BASICOS",
      "condition": "data.cpf != '' && data.nome_completo != '' && data.data_nascimento != ''"
    },
    {
      "from": "DOCUMENTOS_BASICOS",
      "to": "VERIFICACAO_BIOMETRICA",
      "condition": "data.documento_frente != '' && data.documento_verso != '' && data.selfie != ''"
    },
    {
      "from": "VERIFICACAO_BIOMETRICA",
      "to": "ANALISE_COMPLIANCE",
      "condition": "data.biometria_score >= 0.95"
    },
    {
      "from": "ANALISE_COMPLIANCE",
      "to": "APROVADO",
      "condition": "data.pld_score < 50 && data.lista_restritiva == false && data.pep == false"
    },
    {
      "from": "ANALISE_COMPLIANCE",
      "to": "REVISAO_MANUAL",
      "condition": "data.pld_score >= 50 || data.pep == true"
    }
  ]
}
```

## API Usage

### Validating Conditions Before Saving

```go
func ValidateFSMConfiguration(fsmConfig FSMConfig) error {
    evaluator, err := statemachine.NewConditionEvaluator()
    if err != nil {
        return err
    }

    for _, transition := range fsmConfig.Transitions {
        if transition.Condition != nil && *transition.Condition != "" {
            if err := evaluator.ValidateCondition(*transition.Condition); err != nil {
                return fmt.Errorf("invalid condition in transition %s -> %s: %w",
                    transition.From, transition.To, err)
            }
        }
    }

    return nil
}
```

### Evaluating Instance Conditions

```go
func CanTransition(instanceID uuid.UUID, toState string) (bool, error) {
    // Get instance from database
    instance, err := db.GetInstance(ctx, instanceID)
    if err != nil {
        return false, err
    }

    // Get object definition with FSM config
    objDef, err := db.GetObjectDefinition(ctx, instance.ObjectDefinitionID)
    if err != nil {
        return false, err
    }

    var fsmConfig FSMConfig
    json.Unmarshal(objDef.States, &fsmConfig)

    // Find matching transition
    for _, trans := range fsmConfig.Transitions {
        if trans.From == instance.CurrentState && trans.To == toState {
            if trans.Condition != nil && *trans.Condition != "" {
                evaluator, _ := statemachine.NewConditionEvaluator()
                return statemachine.EvaluateInstanceCondition(evaluator, *trans.Condition, instance)
            }
            return true, nil
        }
    }

    return false, fmt.Errorf("transition not allowed")
}
```

## Testing Conditions

### Unit Test Example

```go
func TestAccountApprovalCondition(t *testing.T) {
    evaluator, _ := statemachine.NewConditionEvaluator()

    condition := "data.score >= 700 && data.income >= 5000"

    tests := []struct {
        name     string
        data     map[string]interface{}
        expected bool
    }{
        {
            name: "Approved - meets all criteria",
            data: map[string]interface{}{
                "score": 750.0,
                "income": 8000.0,
            },
            expected: true,
        },
        {
            name: "Rejected - low score",
            data: map[string]interface{}{
                "score": 650.0,
                "income": 8000.0,
            },
            expected: false,
        },
        {
            name: "Rejected - low income",
            data: map[string]interface{}{
                "score": 750.0,
                "income": 3000.0,
            },
            expected: false,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            result, err := evaluator.Evaluate(condition, tt.data)
            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }
            if result != tt.expected {
                t.Errorf("expected %v, got %v", tt.expected, result)
            }
        })
    }
}
```

## Performance Considerations

### CEL Performance

- **Compilation**: ~100-500 microseconds (cached after first use)
- **Evaluation**: ~10-50 microseconds per evaluation
- **Memory**: Minimal (< 1KB per compiled program)

### Best Practices

1. **Validate conditions at configuration time**, not runtime
2. **Cache compiled programs** for frequently used conditions
3. **Keep conditions simple** - complex logic should be in code
4. **Use early returns** with OR operators: `cheap_check || expensive_check`

### Caching Example

```go
type CachedEvaluator struct {
    evaluator statemachine.ConditionEvaluator
    cache     map[string]*cel.Program
    mu        sync.RWMutex
}

func (ce *CachedEvaluator) Evaluate(condition string, data map[string]interface{}) (bool, error) {
    // Check cache first
    ce.mu.RLock()
    prg, exists := ce.cache[condition]
    ce.mu.RUnlock()

    if !exists {
        // Compile and cache
        // ... implementation
    }

    // Evaluate using cached program
    return ce.evaluator.Evaluate(condition, data)
}
```

## Common Pitfalls

### 1. Type Mismatches

```javascript
// ❌ WRONG - comparing number to string
data.amount == "1000"

// ✅ CORRECT
data.amount == 1000
```

### 2. Null/Undefined Fields

```javascript
// ❌ WRONG - will error if field doesn't exist
data.optional_field == true

// ✅ CORRECT - check existence first or provide default
data.optional_field == true || data.optional_field == null
```

### 3. Float Precision

```javascript
// ❌ WRONG - float comparison can be imprecise
data.balance == 100.33

// ✅ CORRECT - use >= and <=
data.balance >= 100.33 && data.balance <= 100.33
```

## Error Handling

### Common Errors

| Error Type | Description | Solution |
|------------|-------------|----------|
| Syntax Error | Invalid CEL syntax | Check operator usage, parentheses, quotes |
| Type Error | Wrong data type | Ensure data types match (number vs string) |
| Non-boolean | Expression doesn't return bool | Add comparison operator |
| Missing Field | Referenced field doesn't exist | Check field names, use optional checks |

### Example Error Messages

```
// Syntax error
"failed to compile condition 'data.saldo >= ': Syntax error: mismatched input '<EOF>'"

// Type error
"condition must evaluate to boolean, got: int (value: 1000)"

// Missing field
"failed to evaluate condition: no such key: missing_field"
```

## Migration Guide

### From Hardcoded Logic

**Before:**
```go
func CanApprove(account Account) bool {
    return account.Balance >= 1000 && account.Score > 700
}
```

**After:**
```json
{
  "condition": "data.balance >= 1000 && data.score > 700"
}
```

### From Simple Rules

**Before:**
```json
{
  "from": "PENDING",
  "to": "APPROVED"
}
```

**After:**
```json
{
  "from": "PENDING",
  "to": "APPROVED",
  "condition": "data.manager_approved == true"
}
```

## Advanced Topics

### Custom Functions (Future)

CEL supports custom functions. In the future, we can add:

```javascript
// Check if CPF is valid
validCPF(data.cpf)

// Calculate age from birthdate
age(data.data_nascimento) >= 18

// Check business hours
isBusinessHours(now())
```

### Macros and Reusable Expressions

Define common expressions as constants:

```go
const (
    ConditionHighValue = "data.amount > 10000"
    ConditionVIPCustomer = "data.is_vip == true || data.lifetime_value > 100000"
    ConditionBusinessHours = "data.hour >= 9 && data.hour <= 18"
)
```

## References

- [CEL Specification](https://github.com/google/cel-spec)
- [CEL Go Implementation](https://github.com/google/cel-go)
- [CEL Language Definition](https://github.com/google/cel-spec/blob/master/doc/langdef.md)

## Summary

The Condition Evaluator provides a powerful, flexible way to define business logic in your FSM without code changes. Key benefits:

✅ **Type-safe** - CEL prevents runtime type errors
✅ **Fast** - Compiled programs execute in microseconds
✅ **Safe** - No code injection, no infinite loops
✅ **Flexible** - Change rules without deploying code
✅ **Testable** - Easy to unit test conditions
✅ **Readable** - Business logic in human-readable format

Use conditions to implement:
- Approval workflows
- Compliance rules
- Business logic gates
- Dynamic routing
- Feature flags
