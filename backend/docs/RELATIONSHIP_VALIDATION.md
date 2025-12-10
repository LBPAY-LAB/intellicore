# Relationship Validation System

## Overview

The SuperCore relationship validation system provides robust validation for relationships between object instances, ensuring data integrity through type validation, cardinality constraints, and cycle detection.

## Architecture

### Components

1. **Models** (`internal/models/allowed_relationship.go`)
   - Defines relationship rules and validation error types
   - Supports multiple cardinality types (1:1, 1:N, N:1, N:M)

2. **Validator Service** (`internal/services/relationship_validator.go`)
   - Implements validation logic
   - Performs cycle detection using depth-first search
   - Handles cascade deletion rules

3. **Handler** (`internal/handlers/relationship.go`)
   - Integrates validation into HTTP endpoints
   - Supports cascade query parameter for deletion

## Validation Rules

### 1. Type Validation

Relationships must be explicitly allowed in the source object definition's `allowed_relationships` configuration.

**Example:**
```json
{
  "allowed_relationships": [
    {
      "type": "TEM_CONTA",
      "target_object_definition": "conta_corrente",
      "cardinality": "1:N",
      "allow_cycles": false,
      "cascade_delete": true,
      "description": "Uma pessoa pode ter múltiplas contas correntes"
    }
  ]
}
```

**Validation:**
- Relationship type must match exactly
- Target instance must be of the specified `target_object_definition` type
- Both source and target instances must exist and not be deleted

**Error Code:** `RELATIONSHIP_NOT_ALLOWED`

### 2. Cardinality Validation

Four cardinality types are supported:

#### 1:1 (One-to-One)
- Source instance can have at most ONE relationship of this type
- Target instance can be referenced by at most ONE relationship of this type

**Use Cases:**
- Person → CPF
- Account → Primary Owner
- Employee → Badge

**Example:**
```json
{
  "type": "TEM_CPF",
  "target_object_definition": "cpf",
  "cardinality": "1:1"
}
```

**Validation:**
- Checks if source already has this relationship type
- Checks if target already has this relationship type
- Both checks must pass

#### 1:N (One-to-Many)
- Source instance can have at most ONE relationship of this type
- Target instances can be referenced by MULTIPLE relationships

**Use Cases:**
- Person → Main Address
- Account → Primary Card
- Order → Payment Method

**Example:**
```json
{
  "type": "ENDERECO_PRINCIPAL",
  "target_object_definition": "endereco",
  "cardinality": "1:N"
}
```

**Validation:**
- Only checks if source already has this relationship type

#### N:1 (Many-to-One)
- Multiple source instances can have this relationship type
- Target instance can be referenced by at most ONE relationship

**Use Cases:**
- Transactions → Account
- Employees → Department
- Items → Category

**Example:**
```json
{
  "type": "PERTENCE_A_CONTA",
  "target_object_definition": "conta_corrente",
  "cardinality": "N:1"
}
```

**Validation:**
- Only checks if target already has this relationship type

#### N:M (Many-to-Many)
- No cardinality restrictions
- Unlimited relationships allowed on both sides

**Use Cases:**
- Person → Addresses
- Product → Categories
- Student → Courses

**Example:**
```json
{
  "type": "TEM_ENDERECO",
  "target_object_definition": "endereco",
  "cardinality": "N:M"
}
```

**Validation:**
- No cardinality checks performed

**Error Code:** `CARDINALITY_VIOLATION`

### 3. Cycle Detection

Prevents circular relationships when configured.

**Algorithm:**
- Uses depth-first search (DFS)
- Starts from target instance
- Attempts to reach source instance
- If path exists, cycle would be created

**Example Configuration:**
```json
{
  "type": "REPORTA_PARA",
  "target_object_definition": "funcionario",
  "cardinality": "N:1",
  "allow_cycles": false
}
```

**Scenario:**
```
Employee A → Reports To → Employee B
Employee B → Reports To → Employee C
Employee C → Reports To → Employee A  ❌ CYCLE DETECTED
```

**When to Allow Cycles:**
- Workflow state transitions (allow returning to previous states)
- Graph structures that intentionally support cycles
- Bidirectional relationships

**Error Code:** `CYCLE_DETECTED`

### 4. Self-Reference Prevention

Prevents instances from creating relationships to themselves.

**Validation:**
- `source_instance_id != target_instance_id`

**Error Code:** `SELF_REFERENCE_NOT_ALLOWED`

### 5. Instance Existence

Both source and target instances must exist and not be deleted.

**Validation:**
- Queries `instances` table
- Checks `is_deleted = false`
- Retrieves object definition information

**Error Code:** `INSTANCE_NOT_FOUND`

## Cascade Deletion

### Configuration

Enable cascade deletion in the relationship configuration:

```json
{
  "type": "TEM_TRANSACAO",
  "target_object_definition": "transacao",
  "cardinality": "1:N",
  "cascade_delete": true
}
```

### Behavior

When deleting a relationship with `cascade=true`:

1. System identifies all dependent relationships
2. Dependent relationships are those where the target of the deleted relationship is the source of other relationships
3. All dependent relationships are deleted in a transaction
4. Returns count of deleted relationships

### API Usage

**Delete without cascade (default):**
```bash
DELETE /relationships/{id}
```

**Delete with cascade:**
```bash
DELETE /relationships/{id}?cascade=true
```

**Response (with cascade):**
```json
{
  "message": "Relationship deleted successfully with cascade",
  "deleted_count": 3,
  "cascade_enabled": true
}
```

### Example Scenario

```
Pessoa → TEM_ENDERECO → Endereco
                         ↓
                         POSSUI_COMPLEMENTO → Complemento
```

Deleting the `TEM_ENDERECO` relationship with `cascade=true` will:
1. Delete `TEM_ENDERECO` relationship
2. Delete `POSSUI_COMPLEMENTO` relationship (if cascade is enabled for it)
3. Return `deleted_count: 2`

## API Reference

### Create Relationship

**Endpoint:** `POST /relationships`

**Request Body:**
```json
{
  "relationship_type": "TEM_CONTA",
  "source_instance_id": "uuid",
  "target_instance_id": "uuid",
  "properties": {},
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": null
}
```

**Success Response (201 Created):**
```json
{
  "id": "uuid",
  "relationship_type": "TEM_CONTA",
  "source_instance_id": "uuid",
  "target_instance_id": "uuid",
  "properties": {},
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": null,
  "created_at": "2024-01-01T00:00:00Z",
  "created_by": null
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "relationship type 'INVALID' to 'conta_corrente' is not allowed",
  "code": "RELATIONSHIP_NOT_ALLOWED",
  "field": "relationship_type"
}
```

### Delete Relationship

**Endpoint:** `DELETE /relationships/{id}?cascade=true`

**Query Parameters:**
- `cascade` (boolean, default: false) - Enable cascade deletion

**Success Response (204 No Content):**
- No body

**Success Response with Cascade (200 OK):**
```json
{
  "message": "Relationship deleted successfully with cascade",
  "deleted_count": 3,
  "cascade_enabled": true
}
```

**Error Response (422 Unprocessable Entity):**
```json
{
  "error": "cannot delete relationship: 2 dependent relationships exist. Use cascade=true to delete them",
  "code": "CARDINALITY_VIOLATION",
  "field": "cascade"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `RELATIONSHIP_NOT_ALLOWED` | The relationship type is not permitted between these object definitions |
| `CARDINALITY_VIOLATION` | The relationship would violate cardinality constraints |
| `CYCLE_DETECTED` | Creating this relationship would create a cycle |
| `INSTANCE_NOT_FOUND` | Source or target instance does not exist |
| `DEFINITION_NOT_FOUND` | Object definition not found |
| `SELF_REFERENCE_NOT_ALLOWED` | Cannot create relationship to self |
| `INVALID_CARDINALITY` | Invalid cardinality type specified |

## Configuration Examples

### Banking Domain

**Pessoa Física:**
```json
{
  "allowed_relationships": [
    {
      "type": "TEM_CONTA",
      "target_object_definition": "conta_corrente",
      "cardinality": "1:N",
      "allow_cycles": false,
      "cascade_delete": true,
      "description": "Uma pessoa pode ter múltiplas contas",
      "is_required": false
    },
    {
      "type": "TEM_CPF",
      "target_object_definition": "cpf",
      "cardinality": "1:1",
      "allow_cycles": false,
      "cascade_delete": false,
      "description": "Cada pessoa tem exatamente um CPF",
      "is_required": true
    }
  ]
}
```

**Conta Corrente:**
```json
{
  "allowed_relationships": [
    {
      "type": "TEM_TRANSACAO",
      "target_object_definition": "transacao",
      "cardinality": "1:N",
      "allow_cycles": false,
      "cascade_delete": true,
      "description": "Conta possui múltiplas transações"
    },
    {
      "type": "TEM_LIMITE",
      "target_object_definition": "limite_credito",
      "cardinality": "1:1",
      "allow_cycles": false,
      "cascade_delete": false,
      "description": "Conta pode ter um limite de crédito"
    }
  ]
}
```

### Workflow System

**Workflow State:**
```json
{
  "allowed_relationships": [
    {
      "type": "NEXT_STATE",
      "target_object_definition": "workflow_state",
      "cardinality": "N:M",
      "allow_cycles": true,
      "cascade_delete": false,
      "description": "Transições de estado (permite ciclos para loops)"
    }
  ]
}
```

### Organizational Hierarchy

**Funcionário:**
```json
{
  "allowed_relationships": [
    {
      "type": "REPORTA_PARA",
      "target_object_definition": "funcionario",
      "cardinality": "N:1",
      "allow_cycles": false,
      "cascade_delete": false,
      "description": "Funcionário reporta para um superior"
    },
    {
      "type": "GERENCIA",
      "target_object_definition": "funcionario",
      "cardinality": "1:N",
      "allow_cycles": false,
      "cascade_delete": false,
      "description": "Funcionário gerencia subordinados"
    }
  ]
}
```

## Testing

### Running Tests

```bash
cd backend
go test ./internal/handlers -v -run TestRelationship
```

### Test Coverage

The test suite covers:

1. **Type Validation**
   - Valid relationship types
   - Invalid relationship types
   - Wrong target types

2. **Cardinality Validation**
   - 1:1 constraints (source and target)
   - 1:N constraints (source only)
   - N:1 constraints (target only)
   - N:M (no constraints)

3. **Cycle Detection**
   - Simple cycles (A → B → A)
   - Deep cycles (A → B → C → A)
   - No false positives for acyclic graphs

4. **Cascade Deletion**
   - Single relationship deletion
   - Multi-level cascade
   - Transaction rollback on error

### Example Test Scenarios

**Valid 1:1 Relationship:**
```go
// Create: Person A → CPF 1 ✓
// Create: Person A → CPF 2 ✗ (source already has relationship)
// Create: Person B → CPF 1 ✗ (target already has relationship)
```

**Cycle Detection:**
```go
// Create: Node1 → Node2 ✓
// Create: Node2 → Node3 ✓
// Create: Node3 → Node1 ✗ (cycle detected)
```

## Best Practices

1. **Define Relationships Explicitly**
   - Always configure `allowed_relationships` in object definitions
   - Document the business rules behind each relationship type

2. **Choose Appropriate Cardinality**
   - Use 1:1 for unique associations (CPF, primary key relationships)
   - Use 1:N for ownership with a single source (main address)
   - Use N:1 for many-to-one associations (transactions to account)
   - Use N:M for flexible many-to-many (tags, categories)

3. **Cascade Delete Carefully**
   - Only enable cascade for owned relationships
   - Don't cascade shared resources
   - Consider data retention requirements

4. **Cycle Prevention**
   - Disable cycles for hierarchical structures
   - Enable cycles only when business logic requires it
   - Document why cycles are allowed

5. **Validation Errors**
   - Handle validation errors gracefully in UI
   - Provide clear error messages to users
   - Log validation failures for monitoring

6. **Performance Considerations**
   - Cycle detection is O(V + E) complexity
   - Consider relationship count limits for N:M
   - Index relationships for efficient queries

## Migration Guide

### Adding Allowed Relationships to Existing Definitions

1. **Update Object Definition:**
```sql
UPDATE object_definitions
SET relationships = jsonb_build_object(
    'allowed_relationships', jsonb_build_array(
        jsonb_build_object(
            'type', 'YOUR_RELATIONSHIP_TYPE',
            'target_object_definition', 'target_type',
            'cardinality', '1:N',
            'allow_cycles', false,
            'cascade_delete', true
        )
    )
)
WHERE name = 'your_object_definition';
```

2. **Verify Configuration:**
```sql
SELECT name, jsonb_pretty(relationships)
FROM object_definitions
WHERE name = 'your_object_definition';
```

3. **Test Validation:**
```bash
curl -X POST http://localhost:8080/relationships \
  -H "Content-Type: application/json" \
  -d '{
    "relationship_type": "YOUR_RELATIONSHIP_TYPE",
    "source_instance_id": "uuid",
    "target_instance_id": "uuid"
  }'
```

## Future Enhancements

- [ ] Conditional relationships based on instance state
- [ ] Relationship versioning and history
- [ ] Bulk relationship creation with validation
- [ ] Relationship constraints based on properties
- [ ] Async validation for performance
- [ ] Relationship templates and inheritance
- [ ] Graph visualization of relationships
- [ ] Relationship analytics and insights
