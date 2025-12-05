# LBPay intelliCore - GraphQL API Documentation

## Overview

This document provides comprehensive documentation for the GraphQL API of the LBPay intelliCore meta-modeling platform.

**Base URL:** `http://localhost:4000/graphql`
**GraphQL Playground:** `http://localhost:4000/graphql` (when server is running)

## Authentication & Authorization

### Authentication
All mutation operations require JWT authentication via Keycloak. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authorization Roles
The API implements role-based access control (RBAC):

- **Public**: Read operations (queries)
- **backoffice**: Create and update ObjectTypes
- **admin**: All operations including delete and restore

## ObjectTypes API

### Queries

#### Get All ObjectTypes (Paginated)
Retrieve a paginated list of ObjectTypes with cursor-based pagination.

**Access:** Public

```graphql
query GetObjectTypes($first: Int, $after: String) {
  objectTypes(first: $first, after: $after) {
    nodes {
      id
      name
      description
      is_active
      created_at
      updated_at
      deleted_at
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

**Variables:**
```json
{
  "first": 10,
  "after": "cursor-value"
}
```

**Parameters:**
- `first` (Int, optional): Number of items to fetch (default: 10, max: 100)
- `after` (String, optional): Cursor for pagination

---

#### Get Single ObjectType
Retrieve a single ObjectType by ID.

**Access:** Public

```graphql
query GetObjectType($id: ID!) {
  objectType(id: $id) {
    id
    name
    description
    is_active
    fields {
      id
      name
      field_type
      required
    }
    created_at
    updated_at
    deleted_at
  }
}
```

**Variables:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### Mutations

#### Create ObjectType
Create a new ObjectType in the system.

**Access:** Requires `admin` or `backoffice` role

```graphql
mutation CreateObjectType($input: CreateObjectTypeInput!) {
  createObjectType(input: $input) {
    id
    name
    description
    is_active
    created_at
    updated_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "name": "Cliente PF",
    "description": "Pessoa Física - Indivíduo",
    "is_active": true
  }
}
```

**Validation:**
- `name`: Required, max 100 characters, must be unique
- `description`: Optional, max 1000 characters
- `is_active`: Optional, defaults to true

**Errors:**
- `CONFLICT (409)`: ObjectType with this name already exists
- `BAD_REQUEST (400)`: Validation errors
- `UNAUTHENTICATED (401)`: Missing or invalid JWT token
- `FORBIDDEN (403)`: Insufficient permissions

---

#### Update ObjectType
Update an existing ObjectType.

**Access:** Requires `admin` or `backoffice` role

```graphql
mutation UpdateObjectType($input: UpdateObjectTypeInput!) {
  updateObjectType(input: $input) {
    id
    name
    description
    is_active
    updated_at
  }
}
```

**Variables:**
```json
{
  "input": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Cliente PF Updated",
    "description": "Updated description",
    "is_active": false
  }
}
```

**Validation:**
- `id`: Required, must be valid UUID
- `name`: Optional, max 100 characters, must be unique if provided
- `description`: Optional, max 1000 characters
- `is_active`: Optional

**Errors:**
- `NOT_FOUND (404)`: ObjectType not found
- `CONFLICT (409)`: Another ObjectType with this name already exists
- `BAD_REQUEST (400)`: Validation errors
- `UNAUTHENTICATED (401)`: Missing or invalid JWT token
- `FORBIDDEN (403)`: Insufficient permissions

---

#### Delete ObjectType (Soft Delete)
Soft delete an ObjectType. The record is marked as deleted but not removed from the database.

**Access:** Requires `admin` role

```graphql
mutation DeleteObjectType($id: ID!) {
  deleteObjectType(id: $id)
}
```

**Variables:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Returns:** Boolean indicating success

**Errors:**
- `NOT_FOUND (404)`: ObjectType not found
- `UNAUTHENTICATED (401)`: Missing or invalid JWT token
- `FORBIDDEN (403)`: Insufficient permissions (admin role required)

---

#### Restore ObjectType
Restore a soft-deleted ObjectType.

**Access:** Requires `admin` role

```graphql
mutation RestoreObjectType($id: ID!) {
  restoreObjectType(id: $id) {
    id
    name
    description
    is_active
    deleted_at
    updated_at
  }
}
```

**Variables:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Errors:**
- `NOT_FOUND (404)`: ObjectType not found
- `BAD_REQUEST (400)`: ObjectType is not deleted
- `UNAUTHENTICATED (401)`: Missing or invalid JWT token
- `FORBIDDEN (403)`: Insufficient permissions (admin role required)

---

## Error Handling

All GraphQL errors follow a standardized format:

```json
{
  "errors": [
    {
      "message": "Human-readable error message",
      "extensions": {
        "code": "ERROR_CODE",
        "status": 400,
        "timestamp": "2025-12-03T08:00:00.000Z",
        "validationErrors": ["field1 is required", "field2 must be unique"],
        "originalError": "ConflictException"
      }
    }
  ]
}
```

### Error Codes

- `BAD_REQUEST (400)`: Invalid input or validation errors
- `UNAUTHENTICATED (401)`: Missing or invalid authentication
- `FORBIDDEN (403)`: Insufficient permissions
- `NOT_FOUND (404)`: Resource not found
- `CONFLICT (409)`: Resource conflict (e.g., duplicate name)
- `UNPROCESSABLE_ENTITY (422)`: Cannot process request
- `TOO_MANY_REQUESTS (429)`: Rate limit exceeded
- `INTERNAL_SERVER_ERROR (500)`: Server error
- `SERVICE_UNAVAILABLE (503)`: Service temporarily unavailable

---

## Testing with GraphQL Playground

### 1. Start the Server

```bash
cd server
npm run start:dev
```

### 2. Access GraphQL Playground

Open your browser and navigate to: `http://localhost:4000/graphql`

### 3. Set Authentication Headers (for mutations)

In the bottom-left corner of Playground, click "HTTP HEADERS" and add:

```json
{
  "Authorization": "Bearer YOUR_KEYCLOAK_JWT_TOKEN"
}
```

### 4. Example Test Scenarios

#### Scenario 1: Create and Query ObjectTypes

```graphql
# Step 1: Create a new ObjectType
mutation {
  createObjectType(input: {
    name: "Cliente PF"
    description: "Pessoa Física"
    is_active: true
  }) {
    id
    name
    created_at
  }
}

# Step 2: Query all ObjectTypes
query {
  objectTypes(first: 10) {
    nodes {
      id
      name
      description
    }
    totalCount
  }
}

# Step 3: Query specific ObjectType (use ID from Step 1)
query {
  objectType(id: "YOUR_ID_HERE") {
    id
    name
    description
    is_active
  }
}
```

#### Scenario 2: Update and Delete

```graphql
# Step 1: Update ObjectType
mutation {
  updateObjectType(input: {
    id: "YOUR_ID_HERE"
    name: "Cliente PF - Atualizado"
    is_active: false
  }) {
    id
    name
    is_active
    updated_at
  }
}

# Step 2: Soft delete
mutation {
  deleteObjectType(id: "YOUR_ID_HERE")
}

# Step 3: Restore
mutation {
  restoreObjectType(id: "YOUR_ID_HERE") {
    id
    name
    deleted_at
  }
}
```

#### Scenario 3: Test Error Handling

```graphql
# Try to create duplicate name (should return CONFLICT)
mutation {
  createObjectType(input: {
    name: "Cliente PF"
    description: "Duplicate name test"
  }) {
    id
  }
}

# Try to get non-existent ID (should return NOT_FOUND)
query {
  objectType(id: "00000000-0000-0000-0000-000000000000") {
    id
  }
}

# Try mutation without auth header (should return UNAUTHENTICATED)
mutation {
  deleteObjectType(id: "YOUR_ID_HERE")
}
```

---

## Schema Introspection

You can explore the full GraphQL schema using introspection:

```graphql
{
  __schema {
    types {
      name
      description
    }
  }
}
```

Or query specific types:

```graphql
{
  __type(name: "ObjectTypeEntity") {
    name
    fields {
      name
      type {
        name
      }
    }
  }
}
```

---

## Performance Considerations

- **Pagination**: Always use pagination for list queries to avoid performance issues
- **Field Selection**: Only request fields you need to minimize response size
- **Caching**: Queries are cached at the field level when appropriate
- **Rate Limiting**: Future implementation will enforce rate limits per user/role

---

## Future Enhancements (Sprint 3+)

- Field-level permissions with fine-grained access control
- Real-time subscriptions for ObjectType changes
- Batch operations for bulk create/update
- Advanced filtering and search capabilities
- GraphQL DataLoader for N+1 query optimization
- Automatic persisted queries (APQ) for performance
- Query complexity analysis and depth limiting

---

## Support

For questions or issues, please contact the development team or create an issue in the project repository.

**Last Updated:** December 3, 2025
**API Version:** 1.0.0
**Sprint:** 2 (Backend CRUD Foundation)
