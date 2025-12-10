# API Examples

This directory contains example JSON payloads for testing the SuperCore API.

## Quick Start Guide

### Step 1: Create an Object Definition

This defines the "blueprint" for checking accounts:

```bash
curl -X POST http://localhost:8080/api/v1/object-definitions \
  -H "Content-Type: application/json" \
  -d @docs/api/examples/01-create-conta-corrente-definition.json
```

**Response:** You'll get back a JSON with an `id` field - **save this UUID!**

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "conta_corrente_pf",
  ...
}
```

### Step 2: Create an Instance

Now create an actual checking account using that definition:

1. **Edit** `02-create-conta-instance.json` and replace `REPLACE_WITH_ACTUAL_UUID_FROM_STEP_01` with the UUID from step 1
2. Run:

```bash
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d @docs/api/examples/02-create-conta-instance.json
```

**Response:** You'll get back the instance with `current_state: "DRAFT"` and another `id` - **save this too!**

```json
{
  "id": "instance-uuid-here",
  "current_state": "DRAFT",
  "data": { ... }
}
```

### Step 3: Transition State

Move the account through its lifecycle (DRAFT → PENDING_APPROVAL → ACTIVE):

```bash
# Move to PENDING_APPROVAL
curl -X POST http://localhost:8080/api/v1/instances/{instance-id-from-step-2}/transition \
  -H "Content-Type: application/json" \
  -d @docs/api/examples/03-transition-state.json

# Then move to ACTIVE (edit the JSON to change to_state to "ACTIVE")
curl -X POST http://localhost:8080/api/v1/instances/{instance-id-from-step-2}/transition \
  -H "Content-Type: application/json" \
  -d '{"to_state": "ACTIVE", "reason": "KYC aprovado"}'
```

### Step 4: Query Data

```bash
# List all object definitions
curl http://localhost:8080/api/v1/object-definitions

# List all instances
curl http://localhost:8080/api/v1/instances

# List instances for a specific object definition
curl "http://localhost:8080/api/v1/instances?object_definition_id={uuid-from-step-1}"

# Get instance details
curl http://localhost:8080/api/v1/instances/{instance-id}

# Get instance state history
curl http://localhost:8080/api/v1/instances/{instance-id}/history
```

## Advanced Examples

### Create a Relationship

Link a customer to an account:

```bash
curl -X POST http://localhost:8080/api/v1/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "relationship_type": "OWNS",
    "source_instance_id": "{customer-uuid}",
    "target_instance_id": "{account-uuid}",
    "properties": {
      "ownership_percentage": 100,
      "primary_account": true
    }
  }'
```

### Query Validation Rules

See all pre-seeded BACEN validation rules:

```bash
# List all validation rules
curl http://localhost:8080/api/v1/validation-rules

# Filter by type
curl "http://localhost:8080/api/v1/validation-rules?rule_type=regex"

# Get specific rule
curl http://localhost:8080/api/v1/validation-rules/{rule-id}
```

### Update an Instance

```bash
curl -X PUT http://localhost:8080/api/v1/instances/{instance-id} \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "cpf": "12345678901",
      "nome_completo": "João da Silva Santos",
      "data_nascimento": "1990-05-15",
      "email": "joao.novo@example.com",
      "telefone": "11987654321",
      "tipo_conta": "CORRENTE",
      "agencia": "0001",
      "numero_conta": "123456",
      "saldo": 1500.00
    }
  }'
```

## Testing Validation

Try creating an instance with invalid data to see validation in action:

```bash
# Invalid CPF (wrong format)
curl -X POST http://localhost:8080/api/v1/instances \
  -H "Content-Type: application/json" \
  -d '{
    "object_definition_id": "{uuid}",
    "data": {
      "cpf": "123",
      "nome_completo": "Test",
      "data_nascimento": "1990-01-01",
      "email": "invalid-email",
      "telefone": "123"
    }
  }'
```

You should get validation errors back!

## Tips

1. **Save UUIDs**: Keep track of the UUIDs returned - you'll need them for relationships and updates
2. **Pretty Print**: Add `| jq` to curl commands for formatted output: `curl ... | jq`
3. **State Transitions**: Check allowed transitions in the object_definition's `states.transitions` array
4. **Validation**: The API validates against JSON Schema AND custom rules before allowing creates/updates

## Next Steps

- Read the [README.md](../../README.md) for architecture overview
- Check [CLAUDE.md](../../CLAUDE.md) for implementation details
- Explore creating your own object definitions!
