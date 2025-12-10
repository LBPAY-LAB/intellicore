# Relationship Validation API Documentation

## Overview

The Relationship Validation system provides comprehensive validation of relationships between instances based on rules defined in `object_definitions`. This ensures data integrity and enforces business rules at the platform level.

## Features

- **Cardinality Validation**: Enforces 1:1, 1:N, N:1, and N:M relationships
- **Cycle Detection**: Prevents circular references when configured
- **Type Validation**: Ensures only allowed relationship types can be created
- **Cascade Deletion**: Supports automatic deletion of dependent relationships
- **Self-Reference Prevention**: Blocks relationships from an instance to itself

## API Endpoints

### 1. Get Relationship Rules

Retrieves the allowed relationships configuration for an object definition.

**Endpoint**: `GET /api/v1/object-definitions/:id/relationship-rules`

**Parameters**:
- `id` (path, required): UUID of the object definition

**Response**: `200 OK`
```json
{
  "allowed_relationships": [
    {
      "type": "TEM_CONTA",
      "target_object_definition": "conta_corrente",
      "cardinality": "1:N",
      "allow_cycles": false,
      "cascade_delete": true,
      "description": "Cliente pode ter múltiplas contas",
      "is_required": false,
      "min_occurrences": 1,
      "max_occurrences": 5
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid UUID format
- `404 Not Found`: Object definition not found

**Example**:
```bash
curl http://localhost:8080/api/v1/object-definitions/123e4567-e89b-12d3-a456-426614174000/relationship-rules
```

### 2. Create Relationship (with validation)

Creates a new relationship between two instances after comprehensive validation.

**Endpoint**: `POST /api/v1/relationships`

**Request Body**:
```json
{
  "relationship_type": "TEM_CONTA",
  "source_instance_id": "123e4567-e89b-12d3-a456-426614174000",
  "target_instance_id": "987fcdeb-51a2-43d1-8765-ba9876543210",
  "properties": {
    "percentage": 100,
    "since": "2024-01-01"
  },
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2025-01-01T00:00:00Z"
}
```

**Validation Steps**:
1. Verify source and target instances exist
2. Check for self-reference
3. Validate relationship type is allowed
4. Validate cardinality constraints
5. Detect cycles (if configured)

**Response**: `201 Created`
```json
{
  "id": "abc12345-6789-1234-5678-def012345678",
  "relationship_type": "TEM_CONTA",
  "source_instance_id": "123e4567-e89b-12d3-a456-426614174000",
  "target_instance_id": "987fcdeb-51a2-43d1-8765-ba9876543210",
  "properties": {
    "percentage": 100,
    "since": "2024-01-01"
  },
  "valid_from": "2024-01-01T00:00:00Z",
  "valid_until": "2025-01-01T00:00:00Z",
  "created_at": "2024-01-15T10:30:00Z",
  "created_by": null
}
```

**Error Responses**:

**422 Unprocessable Entity** - Validation errors:
```json
{
  "error": "relationship type 'INVALID_TYPE' to 'conta_corrente' is not allowed",
  "code": "RELATIONSHIP_NOT_ALLOWED",
  "field": "relationship_type"
}
```

```json
{
  "error": "source instance already has a 'TEM_CPF' relationship (1:1 cardinality)",
  "code": "CARDINALITY_VIOLATION",
  "field": "source_instance_id"
}
```

```json
{
  "error": "creating this relationship would create a cycle (relationship type: CONNECTS_TO)",
  "code": "CYCLE_DETECTED",
  "field": "target_instance_id"
}
```

```json
{
  "error": "cannot create relationship to self",
  "code": "SELF_REFERENCE_NOT_ALLOWED",
  "field": "target_instance_id"
}
```

### 3. Delete Relationship (with cascade)

Deletes a relationship with optional cascade deletion of dependent relationships.

**Endpoint**: `DELETE /api/v1/relationships/:id?cascade=true`

**Parameters**:
- `id` (path, required): UUID of the relationship
- `cascade` (query, optional): Enable cascade deletion (default: false)

**Response**: `204 No Content` (without cascade)

**Response**: `200 OK` (with cascade)
```json
{
  "message": "Relationship deleted successfully with cascade",
  "deleted_count": 3,
  "cascade_enabled": true
}
```

**Error Responses**:
```json
{
  "error": "cannot delete relationship: 2 dependent relationships exist. Use cascade=true to delete them",
  "code": "CARDINALITY_VIOLATION",
  "field": "cascade"
}
```

## Cardinality Types

### 1:1 (One-to-One)

Both source and target can have **at most one** relationship of this type.

**Use Cases**:
- Person → CPF
- Account → Primary Owner
- Employee → Badge

**Example**:
```json
{
  "type": "TEM_CPF",
  "target_object_definition": "cpf",
  "cardinality": "1:1",
  "allow_cycles": false
}
```

**Validation**:
- Source cannot have more than 1 relationship of this type
- Target cannot have more than 1 relationship of this type

### 1:N (One-to-Many)

Source can have **at most one** relationship, but target can have **multiple**.

**Use Cases**:
- Person → Primary Account (one person, one primary account)
- Order → Payment Method (one order, one payment method)

**Example**:
```json
{
  "type": "TEM_CONTA_PRIMARIA",
  "target_object_definition": "conta_corrente",
  "cardinality": "1:N",
  "allow_cycles": false
}
```

**Validation**:
- Source cannot have more than 1 relationship of this type
- Target can have unlimited relationships

### N:1 (Many-to-One)

Source can have **multiple** relationships, but target can have **at most one**.

**Use Cases**:
- Accounts → Bank (many accounts, one bank)
- Employees → Department (many employees, one department)

**Example**:
```json
{
  "type": "PERTENCE_A_BANCO",
  "target_object_definition": "banco",
  "cardinality": "N:1",
  "allow_cycles": false
}
```

**Validation**:
- Source can have unlimited relationships
- Target cannot have more than 1 relationship of this type

### N:M (Many-to-Many)

Both source and target can have **multiple** relationships.

**Use Cases**:
- Person → Addresses (one person, many addresses; one address, many people)
- Student → Courses (one student, many courses; one course, many students)
- Product → Tags (one product, many tags; one tag, many products)

**Example**:
```json
{
  "type": "TEM_ENDERECO",
  "target_object_definition": "endereco",
  "cardinality": "N:M",
  "allow_cycles": false
}
```

**Validation**:
- No cardinality restrictions

## Cycle Detection

Cycles are detected using **Depth-First Search (DFS)** algorithm on the relationship graph.

### Algorithm

```go
// Starting from target, traverse all outgoing relationships
// If we reach the source, a cycle exists
func detectCycle(source, target, relationshipType) bool {
    visited := make(map[UUID]bool)
    return dfs(target, source, relationshipType, visited)
}

func dfs(current, target, relType, visited) bool {
    if current == target {
        return true  // Cycle detected!
    }

    if visited[current] {
        return false  // Already visited
    }

    visited[current] = true

    // Get all outgoing relationships of same type
    for each neighbor in getOutgoingRelationships(current, relType) {
        if dfs(neighbor, target, relType, visited) {
            return true
        }
    }

    return false
}
```

### Example

**Scenario**: Creating relationship hierarchy

```
Step 1: Create Node1 → Node2 ✅
Step 2: Create Node2 → Node3 ✅
Step 3: Create Node3 → Node1 ❌ (would create cycle)
```

**Configuration**:
```json
{
  "type": "CONNECTS_TO",
  "target_object_definition": "node",
  "cardinality": "N:M",
  "allow_cycles": false
}
```

**Result**: Step 3 is rejected with error:
```json
{
  "error": "creating this relationship would create a cycle (relationship type: CONNECTS_TO)",
  "code": "CYCLE_DETECTED",
  "field": "target_instance_id"
}
```

### Allowing Cycles

For certain use cases (e.g., social networks, organizational charts), cycles may be allowed:

```json
{
  "type": "FRIEND_OF",
  "target_object_definition": "pessoa_fisica",
  "cardinality": "N:M",
  "allow_cycles": true
}
```

## Cascade Deletion

Cascade deletion automatically removes dependent relationships when a parent relationship is deleted.

### Configuration

```json
{
  "type": "TEM_ENDERECO",
  "target_object_definition": "endereco",
  "cardinality": "N:M",
  "cascade_delete": true
}
```

### Behavior

**Relationship Chain**:
```
Pessoa → Endereco → Complemento
  (TEM_ENDERECO, cascade=true) → (TEM_COMPLEMENTO, cascade=true)
```

**Delete Pessoa→Endereco relationship**:
1. Finds dependent relationships (Endereco→Complemento)
2. If `cascade=true`: Deletes all dependent relationships recursively
3. If `cascade=false`: Returns error if dependents exist

**Example Request**:
```bash
# Without cascade (fails if dependents exist)
DELETE /api/v1/relationships/abc123?cascade=false

# With cascade (deletes dependents)
DELETE /api/v1/relationships/abc123?cascade=true
```

**Response (with cascade)**:
```json
{
  "message": "Relationship deleted successfully with cascade",
  "deleted_count": 3,
  "cascade_enabled": true
}
```

## Validation Error Codes

| Code | Description | Field | Resolution |
|------|-------------|-------|------------|
| `RELATIONSHIP_NOT_ALLOWED` | Relationship type not allowed for this object definition | `relationship_type` | Check allowed relationships in object definition |
| `CARDINALITY_VIOLATION` | Cardinality constraint violated | `source_instance_id` or `target_instance_id` | Remove existing relationship first |
| `CYCLE_DETECTED` | Creating relationship would create a cycle | `target_instance_id` | Choose different target or restructure relationships |
| `INSTANCE_NOT_FOUND` | Source or target instance does not exist | `source_instance_id` or `target_instance_id` | Verify instance IDs |
| `DEFINITION_NOT_FOUND` | Object definition not found | N/A | Check object definition exists |
| `SELF_REFERENCE_NOT_ALLOWED` | Cannot create relationship to self | `target_instance_id` | Choose different target instance |
| `INVALID_CARDINALITY` | Invalid cardinality type specified | `cardinality` | Use 1:1, 1:N, N:1, or N:M |

## Complete Example: Cliente → Conta

### 1. Define Object Definitions

**Cliente PF**:
```json
{
  "name": "cliente_pf",
  "display_name": "Cliente Pessoa Física",
  "schema": {
    "type": "object",
    "properties": {
      "cpf": {"type": "string"},
      "nome_completo": {"type": "string"}
    }
  },
  "relationships": {
    "allowed_relationships": [
      {
        "type": "TEM_CONTA",
        "target_object_definition": "conta_corrente",
        "cardinality": "1:N",
        "allow_cycles": false,
        "cascade_delete": true,
        "description": "Cliente pode ter múltiplas contas",
        "is_required": true,
        "min_occurrences": 1,
        "max_occurrences": 5
      },
      {
        "type": "TEM_ENDERECO",
        "target_object_definition": "endereco",
        "cardinality": "N:M",
        "allow_cycles": false,
        "cascade_delete": false,
        "description": "Cliente pode ter múltiplos endereços"
      }
    ]
  }
}
```

**Conta Corrente**:
```json
{
  "name": "conta_corrente",
  "display_name": "Conta Corrente",
  "schema": {
    "type": "object",
    "properties": {
      "numero": {"type": "string"},
      "agencia": {"type": "string"},
      "saldo": {"type": "number"}
    }
  },
  "relationships": {
    "allowed_relationships": []
  }
}
```

### 2. Create Instances

**Create Cliente**:
```bash
POST /api/v1/instances
{
  "object_definition_id": "uuid-cliente-pf",
  "data": {
    "cpf": "12345678901",
    "nome_completo": "João Silva"
  }
}
```

**Create Conta**:
```bash
POST /api/v1/instances
{
  "object_definition_id": "uuid-conta-corrente",
  "data": {
    "numero": "12345-6",
    "agencia": "0001",
    "saldo": 1000.00
  }
}
```

### 3. Create Relationship

```bash
POST /api/v1/relationships
{
  "relationship_type": "TEM_CONTA",
  "source_instance_id": "uuid-joao-silva",
  "target_instance_id": "uuid-conta-12345",
  "properties": {
    "tipo_titular": "principal",
    "percentual_participacao": 100
  }
}
```

**Validation Performed**:
1. ✅ João Silva instance exists
2. ✅ Conta 12345 instance exists
3. ✅ Not self-reference
4. ✅ "TEM_CONTA" is allowed for cliente_pf → conta_corrente
5. ✅ 1:N cardinality: João Silva doesn't have TEM_CONTA relationship yet
6. ✅ No cycles (not applicable here)

**Result**: `201 Created`

### 4. Try to Create Second TEM_CONTA (Should Fail)

```bash
POST /api/v1/relationships
{
  "relationship_type": "TEM_CONTA",
  "source_instance_id": "uuid-joao-silva",
  "target_instance_id": "uuid-conta-54321"
}
```

**Result**: `422 Unprocessable Entity`
```json
{
  "error": "source instance already has a 'TEM_CONTA' relationship (1:N cardinality)",
  "code": "CARDINALITY_VIOLATION",
  "field": "source_instance_id"
}
```

### 5. Query Relationship Rules

```bash
GET /api/v1/object-definitions/uuid-cliente-pf/relationship-rules
```

**Response**:
```json
{
  "allowed_relationships": [
    {
      "type": "TEM_CONTA",
      "target_object_definition": "conta_corrente",
      "cardinality": "1:N",
      "allow_cycles": false,
      "cascade_delete": true,
      "description": "Cliente pode ter múltiplas contas",
      "is_required": true,
      "min_occurrences": 1,
      "max_occurrences": 5
    },
    {
      "type": "TEM_ENDERECO",
      "target_object_definition": "endereco",
      "cardinality": "N:M",
      "allow_cycles": false,
      "cascade_delete": false,
      "description": "Cliente pode ter múltiplos endereços"
    }
  ]
}
```

## Testing

### Running Tests

```bash
# Install dependencies
go get github.com/pashagolub/pgxmock/v3
go get github.com/stretchr/testify/assert
go get github.com/stretchr/testify/require

# Run all relationship validation tests
cd backend
go test ./internal/services -v -run TestRelationshipValidator
go test ./internal/handlers -v -run TestRelationship

# Run with coverage
go test ./internal/services -coverprofile=coverage.out
go tool cover -html=coverage.out
```

### Test Coverage

The test suite covers:
- ✅ Type validation (allowed vs. not allowed)
- ✅ Cardinality validation (1:1, 1:N, N:1, N:M)
- ✅ Cycle detection (direct and indirect cycles)
- ✅ Cascade deletion (with and without dependents)
- ✅ Self-reference prevention
- ✅ Instance existence validation
- ✅ Min/max occurrences validation
- ✅ GetRelationshipRules endpoint

**Expected Coverage**: > 80%

## Best Practices

### 1. Define Clear Relationship Rules

```json
{
  "type": "DESCRIPTIVE_NAME",
  "target_object_definition": "specific_type",
  "cardinality": "appropriate_type",
  "description": "Clear explanation of the relationship",
  "allow_cycles": false,  // Default to false unless needed
  "cascade_delete": true  // Enable if dependents should be auto-deleted
}
```

### 2. Use Appropriate Cardinality

- **1:1**: Unique associations (Person→CPF, Account→PrimaryOwner)
- **1:N**: Single parent (Order→PrimaryPaymentMethod)
- **N:1**: Categorization (Accounts→Bank, Employees→Department)
- **N:M**: Many-to-many (Person→Addresses, Product→Tags)

### 3. Enable Cascade Carefully

Only enable cascade deletion when:
- Dependent relationships should be automatically removed
- Data integrity requires cleanup
- No orphaned relationships should exist

### 4. Prevent Cycles by Default

Set `allow_cycles: false` unless you specifically need cyclic relationships (e.g., social networks, org charts).

### 5. Document Relationships

Always include a clear `description` field explaining the relationship's purpose and constraints.

## Performance Considerations

### Cycle Detection Performance

- **Algorithm**: DFS with visited set
- **Complexity**: O(V + E) where V = vertices, E = edges
- **Optimization**: Early termination when cycle found
- **Caching**: Consider caching for frequently checked paths

### Database Indexes

Ensure indexes exist on:
```sql
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
```

### Batch Operations

For bulk relationship creation:
1. Validate all relationships first
2. Use database transactions
3. Consider async validation for large batches

## Troubleshooting

### Common Issues

**Issue**: "relationship type not allowed"
- **Cause**: Relationship type not in object definition's allowed relationships
- **Solution**: Add relationship to `relationships.allowed_relationships` array

**Issue**: "cardinality violation"
- **Cause**: Trying to create more relationships than cardinality allows
- **Solution**: Delete existing relationship first or change cardinality

**Issue**: "cycle detected"
- **Cause**: Creating relationship would form a cycle
- **Solution**: Restructure relationships or enable `allow_cycles: true`

**Issue**: "instance not found"
- **Cause**: Source or target instance doesn't exist or is deleted
- **Solution**: Verify instance IDs and check `is_deleted` flag
