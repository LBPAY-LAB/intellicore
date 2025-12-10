# SuperCore API Reference

**Base URL**: `http://localhost:8080/api/v1`

**Version**: 1.0.0

**Content-Type**: `application/json`

## Table of Contents

- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Oracle API](#oracle-api)
- [Object Definitions API](#object-definitions-api)
- [Instances API](#instances-api)
- [Relationships API](#relationships-api)
- [Validation Rules API](#validation-rules-api)
- [Natural Language Assistant API](#natural-language-assistant-api)
- [Semantic Search API](#semantic-search-api)
- [Rate Limiting](#rate-limiting)

## Authentication

Currently, the API is open for development. Production deployments will require JWT tokens from Keycloak.

Future authentication header:
```http
Authorization: Bearer <jwt_token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "data": {
    ...
  },
  "metadata": {
    "request_id": "uuid",
    "timestamp": "2024-12-10T00:00:00Z"
  }
}
```

### List Response
```json
{
  "data": [...],
  "metadata": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "request_id": "uuid",
    "timestamp": "2024-12-10T00:00:00Z"
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": "cpf",
      "issue": "Invalid CPF format"
    },
    "request_id": "uuid",
    "timestamp": "2024-12-10T00:00:00Z"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT requests |
| 201 | Created | Successful POST requests |
| 204 | No Content | Successful DELETE requests |
| 400 | Bad Request | Validation errors, malformed JSON |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, state conflict |
| 422 | Unprocessable Entity | Business logic validation failed |
| 500 | Internal Server Error | Server-side errors |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE` | Resource already exists |
| `STATE_TRANSITION_ERROR` | Invalid FSM transition |
| `RELATIONSHIP_VALIDATION_ERROR` | Relationship rules violated |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Oracle API

The Oracle is SuperCore's consciousness - it knows the platform's identity, licenses, and capabilities.

### GET /oracle/whoami

Ask the platform "Who am I?" - Returns complete self-description.

**Response:**
```json
{
  "message": "Eu sou LBPAY (CNPJ: 12.345.678/0001-90), uma instituição de pagamento licenciada pelo Banco Central do Brasil...",
  "identity": {
    "corporate_name": "LBPAY Instituição de Pagamento S.A.",
    "trading_name": "LBPAY",
    "cnpj": "12.345.678/0001-90",
    "founding_date": "2020-01-15"
  },
  "licenses": [
    {
      "type": "INSTITUICAO_PAGAMENTO",
      "issuer": "BANCO_CENTRAL",
      "license_number": "12345678",
      "issue_date": "2020-06-01",
      "status": "ATIVA"
    }
  ],
  "integrations": [
    {
      "name": "BACEN - SPI (PIX)",
      "type": "BANCO_CENTRAL",
      "status": "ACTIVE"
    }
  ],
  "capabilities": {
    "pix": true,
    "ted": true,
    "boleto": true,
    "cartao": false
  },
  "timestamp": "2024-12-10T00:00:00Z"
}
```

### GET /oracle/identity

Get corporate identity information only.

**Response:**
```json
{
  "corporate_name": "LBPAY Instituição de Pagamento S.A.",
  "trading_name": "LBPAY",
  "cnpj": "12.345.678/0001-90",
  "founding_date": "2020-01-15",
  "address": {
    "street": "Av. Paulista",
    "number": "1000",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01310-100"
  },
  "contact": {
    "phone": "+55 11 3000-0000",
    "email": "contato@lbpay.com.br",
    "website": "https://lbpay.com.br"
  }
}
```

### GET /oracle/licenses

List all BACEN licenses and regulatory approvals.

**Response:**
```json
{
  "licenses": [
    {
      "type": "INSTITUICAO_PAGAMENTO",
      "issuer": "BANCO_CENTRAL",
      "license_number": "12345678",
      "issue_date": "2020-06-01",
      "expiry_date": null,
      "status": "ATIVA",
      "regulatory_framework": "Resolução BACEN 80/2021"
    },
    {
      "type": "PARTICIPANTE_PIX",
      "issuer": "BANCO_CENTRAL",
      "ispb": "12345678",
      "issue_date": "2020-11-01",
      "status": "ATIVA"
    }
  ]
}
```

### GET /oracle/status

Get complete platform status including health of integrations.

**Response:**
```json
{
  "platform_status": "OPERATIONAL",
  "identity": {...},
  "licenses": [...],
  "integrations": [
    {
      "name": "BACEN - SPI (PIX)",
      "status": "HEALTHY",
      "last_check": "2024-12-10T00:00:00Z",
      "latency_ms": 120
    },
    {
      "name": "TigerBeetle Ledger",
      "status": "HEALTHY",
      "last_check": "2024-12-10T00:00:00Z",
      "latency_ms": 5
    }
  ],
  "capabilities": {...},
  "system_health": {
    "database": "HEALTHY",
    "cache": "HEALTHY",
    "queue": "HEALTHY"
  },
  "timestamp": "2024-12-10T00:00:00Z"
}
```

---

## Object Definitions API

Object definitions are blueprints for creating instances.

### GET /object-definitions

List all object definitions.

**Query Parameters:**
- `name` (string, optional): Filter by name
- `category` (string, optional): Filter by category (BUSINESS_ENTITY, BACEN_RULE, etc.)
- `is_active` (boolean, optional): Filter by active status
- `page` (int, default: 1): Page number
- `per_page` (int, default: 20): Items per page

**Example Request:**
```bash
curl "http://localhost:8080/api/v1/object-definitions?category=BUSINESS_ENTITY&page=1&per_page=10"
```

**Response:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "conta_corrente",
      "display_name": "Conta Corrente PF",
      "description": "Conta corrente para pessoa física",
      "category": "BUSINESS_ENTITY",
      "version": 1,
      "schema": {...},
      "states": {...},
      "rules": [...],
      "ui_hints": {...},
      "relationships": [...],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "is_active": true
    }
  ],
  "metadata": {
    "total": 25,
    "page": 1,
    "per_page": 10,
    "total_pages": 3
  }
}
```

### GET /object-definitions/:id

Get a specific object definition by ID.

**Example Request:**
```bash
curl http://localhost:8080/api/v1/object-definitions/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "conta_corrente",
  "display_name": "Conta Corrente PF",
  "description": "Conta corrente para pessoa física com validações BACEN",
  "category": "BUSINESS_ENTITY",
  "version": 1,
  "schema": {
    "type": "object",
    "required": ["account_number", "cpf", "balance"],
    "properties": {
      "account_number": {
        "type": "string",
        "pattern": "^[0-9]{5}-[0-9]$",
        "description": "Número da conta no formato 12345-6"
      },
      "cpf": {
        "type": "string",
        "pattern": "^[0-9]{11}$",
        "description": "CPF do titular (11 dígitos sem formatação)"
      },
      "balance": {
        "type": "number",
        "minimum": 0,
        "description": "Saldo da conta em centavos"
      },
      "opened_at": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "states": {
    "initial": "DRAFT",
    "states": ["DRAFT", "ACTIVE", "SUSPENDED", "CLOSED"],
    "transitions": [
      {
        "from": "DRAFT",
        "to": "ACTIVE",
        "conditions": ["kyc_approved", "minimum_deposit"]
      },
      {
        "from": "ACTIVE",
        "to": "SUSPENDED",
        "conditions": []
      },
      {
        "from": "SUSPENDED",
        "to": "ACTIVE",
        "conditions": ["admin_approval"]
      },
      {
        "from": "ACTIVE",
        "to": "CLOSED",
        "conditions": ["balance_zero", "no_pending_transactions"]
      }
    ]
  },
  "rules": [
    {
      "field": "cpf",
      "validation_rule_name": "cpf_validation"
    },
    {
      "field": "balance",
      "validation_rule_name": "non_negative_balance"
    }
  ],
  "ui_hints": {
    "widgets": {
      "cpf": "cpf_input",
      "balance": "currency_input",
      "opened_at": "date_picker"
    },
    "field_order": ["account_number", "cpf", "balance", "opened_at"]
  },
  "relationships": [
    {
      "type": "OWNED_BY",
      "target_object": "cliente_pf",
      "cardinality": "MANY_TO_ONE",
      "required": true
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "is_active": true
}
```

### POST /object-definitions

Create a new object definition.

**Request Body:**
```json
{
  "name": "cliente_pf",
  "display_name": "Cliente Pessoa Física",
  "description": "Cliente pessoa física com validações KYC",
  "category": "BUSINESS_ENTITY",
  "schema": {
    "type": "object",
    "required": ["cpf", "name", "email"],
    "properties": {
      "cpf": {
        "type": "string",
        "pattern": "^[0-9]{11}$"
      },
      "name": {
        "type": "string",
        "minLength": 3,
        "maxLength": 200
      },
      "email": {
        "type": "string",
        "format": "email"
      },
      "phone": {
        "type": "string",
        "pattern": "^[0-9]{10,11}$"
      },
      "birth_date": {
        "type": "string",
        "format": "date"
      }
    }
  },
  "states": {
    "initial": "CADASTRO_PENDENTE",
    "states": ["CADASTRO_PENDENTE", "EM_ANALISE", "APROVADO", "ATIVO", "BLOQUEADO"],
    "transitions": [
      {
        "from": "CADASTRO_PENDENTE",
        "to": "EM_ANALISE"
      },
      {
        "from": "EM_ANALISE",
        "to": "APROVADO",
        "conditions": ["kyc_approved", "no_pep_match"]
      },
      {
        "from": "APROVADO",
        "to": "ATIVO"
      }
    ]
  },
  "rules": [
    {
      "field": "cpf",
      "validation_rule_name": "cpf_validation"
    },
    {
      "field": "email",
      "validation_rule_name": "email_format"
    }
  ],
  "relationships": [
    {
      "type": "TITULAR_DE",
      "target_object": "conta_corrente",
      "cardinality": "ONE_TO_MANY"
    }
  ]
}
```

**Response: 201 Created**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "cliente_pf",
  "display_name": "Cliente Pessoa Física",
  ...
}
```

### PUT /object-definitions/:id

Update an existing object definition.

**Request Body:** Same as POST, but all fields are optional.

**Response: 200 OK**

### DELETE /object-definitions/:id

Soft delete an object definition (sets `is_active = false`).

**Response: 204 No Content**

### GET /object-definitions/:id/schema

Get only the JSON Schema for an object definition.

**Response:**
```json
{
  "schema": {
    "type": "object",
    "required": ["cpf", "name"],
    "properties": {...}
  }
}
```

### GET /object-definitions/:id/relationship-rules

Get allowed relationships for an object definition.

**Response:**
```json
{
  "relationships": [
    {
      "type": "TITULAR_DE",
      "target_object": "conta_corrente",
      "target_object_id": "550e8400-e29b-41d4-a716-446655440000",
      "cardinality": "ONE_TO_MANY",
      "required": false
    }
  ]
}
```

---

## Instances API

Instances are real data entities created from object definitions.

### GET /instances

List instances with optional filtering.

**Query Parameters:**
- `object_definition_id` (uuid, optional): Filter by object type
- `current_state` (string, optional): Filter by state
- `search` (string, optional): Full-text search
- `page` (int, default: 1)
- `per_page` (int, default: 20)

**Example Request:**
```bash
curl "http://localhost:8080/api/v1/instances?object_definition_id=550e8400-e29b-41d4-a716-446655440000&current_state=ACTIVE"
```

**Response:**
```json
{
  "data": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "object_definition_id": "550e8400-e29b-41d4-a716-446655440000",
      "data": {
        "account_number": "12345-6",
        "cpf": "12345678901",
        "balance": 150000,
        "opened_at": "2024-01-15T10:00:00Z"
      },
      "current_state": "ACTIVE",
      "state_history": [
        {
          "state": "DRAFT",
          "timestamp": "2024-01-15T10:00:00Z",
          "reason": "Account created"
        },
        {
          "state": "ACTIVE",
          "timestamp": "2024-01-16T14:30:00Z",
          "reason": "KYC approved",
          "changed_by": "admin@lbpay.com"
        }
      ],
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-16T14:30:00Z",
      "created_by": "system",
      "version": 2,
      "is_deleted": false
    }
  ],
  "metadata": {
    "total": 150,
    "page": 1,
    "per_page": 20
  }
}
```

### GET /instances/:id

Get a specific instance by ID.

**Response: 200 OK** (same structure as list item)

### POST /instances

Create a new instance.

**Request Body:**
```json
{
  "object_definition_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
    "account_number": "98765-4",
    "cpf": "98765432109",
    "balance": 0,
    "opened_at": "2024-12-10T00:00:00Z"
  }
}
```

**Validation:**
- Data must conform to object definition schema
- Validation rules are executed
- Instance starts in initial state defined in FSM

**Response: 201 Created**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "object_definition_id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {...},
  "current_state": "DRAFT",
  "created_at": "2024-12-10T00:00:00Z"
}
```

### PUT /instances/:id

Update an instance's data.

**Request Body:**
```json
{
  "data": {
    "balance": 250000
  }
}
```

**Notes:**
- Only `data` field can be updated
- Schema validation is performed
- State transitions must use `/transition` endpoint
- Version is automatically incremented

**Response: 200 OK**

### DELETE /instances/:id

Soft delete an instance (sets `is_deleted = true`).

**Response: 204 No Content**

### POST /instances/:id/transition

Transition instance to a new state.

**Request Body:**
```json
{
  "to_state": "ACTIVE",
  "reason": "KYC approved by compliance team",
  "metadata": {
    "approved_by": "john.doe@lbpay.com",
    "approval_date": "2024-12-10"
  }
}
```

**Validation:**
- Transition must be defined in FSM
- All conditions must be met
- Current state must allow this transition

**Response: 200 OK**
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440000",
  "current_state": "ACTIVE",
  "state_history": [
    {
      "state": "DRAFT",
      "timestamp": "2024-12-10T00:00:00Z",
      "reason": "Account created"
    },
    {
      "state": "ACTIVE",
      "timestamp": "2024-12-10T01:00:00Z",
      "reason": "KYC approved by compliance team",
      "metadata": {
        "approved_by": "john.doe@lbpay.com",
        "approval_date": "2024-12-10"
      }
    }
  ]
}
```

**Error Response: 422 Unprocessable Entity**
```json
{
  "error": {
    "code": "STATE_TRANSITION_ERROR",
    "message": "Transition from DRAFT to CLOSED is not allowed",
    "details": {
      "current_state": "DRAFT",
      "requested_state": "CLOSED",
      "allowed_transitions": ["ACTIVE"]
    }
  }
}
```

### GET /instances/:id/history

Get complete state history for an instance.

**Response:**
```json
{
  "history": [
    {
      "state": "DRAFT",
      "timestamp": "2024-01-15T10:00:00Z",
      "reason": "Account created",
      "changed_by": "system"
    },
    {
      "state": "ACTIVE",
      "timestamp": "2024-01-16T14:30:00Z",
      "reason": "KYC approved",
      "changed_by": "admin@lbpay.com",
      "metadata": {
        "kyc_score": 95
      }
    },
    {
      "state": "SUSPENDED",
      "timestamp": "2024-02-01T09:00:00Z",
      "reason": "Suspicious activity detected",
      "changed_by": "fraud-detection-system"
    },
    {
      "state": "ACTIVE",
      "timestamp": "2024-02-02T15:00:00Z",
      "reason": "Investigation completed - no fraud",
      "changed_by": "compliance@lbpay.com"
    }
  ]
}
```

---

## Relationships API

### GET /relationships

List all relationships with optional filtering.

**Query Parameters:**
- `relationship_type` (string, optional)
- `source_instance_id` (uuid, optional)
- `target_instance_id` (uuid, optional)
- `page` (int, default: 1)
- `per_page` (int, default: 20)

**Example Request:**
```bash
curl "http://localhost:8080/api/v1/relationships?source_instance_id=770e8400-e29b-41d4-a716-446655440000"
```

**Response:**
```json
{
  "data": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "relationship_type": "OWNED_BY",
      "source_instance_id": "770e8400-e29b-41d4-a716-446655440000",
      "target_instance_id": "660e8400-e29b-41d4-a716-446655440000",
      "properties": {
        "ownership_percentage": 100,
        "since": "2024-01-15"
      },
      "valid_from": "2024-01-15T00:00:00Z",
      "valid_until": null,
      "created_at": "2024-01-15T10:00:00Z"
    }
  ],
  "metadata": {
    "total": 5,
    "page": 1,
    "per_page": 20
  }
}
```

### GET /relationships/:id

Get a specific relationship.

**Response: 200 OK**

### POST /relationships

Create a new relationship between instances.

**Request Body:**
```json
{
  "relationship_type": "OWNED_BY",
  "source_instance_id": "770e8400-e29b-41d4-a716-446655440000",
  "target_instance_id": "660e8400-e29b-41d4-a716-446655440000",
  "properties": {
    "ownership_percentage": 100,
    "role": "titular"
  },
  "valid_from": "2024-12-10T00:00:00Z"
}
```

**Validation:**
- Relationship type must be allowed in object definitions
- Cardinality rules are enforced
- No self-relationships
- Both instances must exist

**Response: 201 Created**

**Error Response: 422 Unprocessable Entity**
```json
{
  "error": {
    "code": "RELATIONSHIP_VALIDATION_ERROR",
    "message": "Cardinality violation: cliente_pf can only have ONE_TO_MANY relationships with conta_corrente",
    "details": {
      "relationship_type": "OWNED_BY",
      "cardinality": "ONE_TO_MANY",
      "existing_count": 5,
      "max_allowed": "unlimited"
    }
  }
}
```

### DELETE /relationships/:id

Delete a relationship.

**Response: 204 No Content**

### GET /instances/:id/relationships

Get all relationships for a specific instance (both source and target).

**Query Parameters:**
- `direction` (string, optional): "source", "target", or "both" (default)
- `relationship_type` (string, optional)

**Response:**
```json
{
  "outgoing": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440000",
      "relationship_type": "OWNED_BY",
      "target_instance": {
        "id": "660e8400-e29b-41d4-a716-446655440000",
        "object_definition_name": "cliente_pf",
        "data": {
          "name": "João Silva",
          "cpf": "12345678901"
        }
      }
    }
  ],
  "incoming": [
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440000",
      "relationship_type": "DEPENDS_ON",
      "source_instance": {
        "id": "bb0e8400-e29b-41d4-a716-446655440000",
        "object_definition_name": "transacao_pix",
        "data": {
          "amount": 10000,
          "status": "COMPLETED"
        }
      }
    }
  ]
}
```

---

## Validation Rules API

### GET /validation-rules

List all validation rules.

**Response:**
```json
{
  "data": [
    {
      "id": "cc0e8400-e29b-41d4-a716-446655440000",
      "name": "cpf_validation",
      "description": "Validates Brazilian CPF format and checksum",
      "rule_type": "regex",
      "config": {
        "pattern": "^[0-9]{11}$",
        "error_message": "CPF must have 11 digits"
      },
      "is_system": true,
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "dd0e8400-e29b-41d4-a716-446655440000",
      "name": "email_format",
      "description": "Validates email format",
      "rule_type": "regex",
      "config": {
        "pattern": "^[^@]+@[^@]+\\.[^@]+$",
        "error_message": "Invalid email format"
      },
      "is_system": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### GET /validation-rules/:id

Get a specific validation rule.

### POST /validation-rules

Create a custom validation rule.

**Request Body:**
```json
{
  "name": "custom_age_validation",
  "description": "Validates minimum age of 18",
  "rule_type": "function",
  "config": {
    "code": "const birthDate = new Date(data.birth_date); const age = (new Date() - birthDate) / 31557600000; return age >= 18;",
    "error_message": "Customer must be at least 18 years old"
  }
}
```

**Response: 201 Created**

---

## Natural Language Assistant API

### POST /assistant/chat

Chat with the natural language assistant.

**Request Body:**
```json
{
  "message": "I want to create a Customer object with CPF, name, email, and phone",
  "context": {
    "conversation_id": "uuid",
    "previous_messages": []
  }
}
```

**Response:**
```json
{
  "response": "I can help you create a Customer object. Let me ask you a few questions to generate the complete definition...",
  "suggested_actions": [
    {
      "type": "generate_object_definition",
      "label": "Generate Object Definition",
      "payload": {
        "name": "cliente",
        "fields": ["cpf", "name", "email", "phone"]
      }
    }
  ],
  "conversation_id": "uuid"
}
```

### POST /assistant/generate-object-definition

Generate a complete object definition from natural language.

**Request Body:**
```json
{
  "description": "A customer account for individual persons with Brazilian documents",
  "fields": ["cpf", "name", "email", "phone", "address"],
  "suggested_states": ["pending", "active", "blocked"],
  "relationships": ["can own multiple accounts"]
}
```

**Response:**
```json
{
  "object_definition": {
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "schema": {...},
    "states": {...},
    "relationships": [...]
  },
  "preview": "This will create a Customer object with 5 fields, 3 states, and 1 relationship type.",
  "confidence": 0.95
}
```

### POST /assistant/refine-schema

Refine an existing schema based on feedback.

**Request Body:**
```json
{
  "object_definition_id": "uuid",
  "feedback": "Add a field for mother's name and make email optional"
}
```

**Response:**
```json
{
  "updated_schema": {...},
  "changes": [
    "Added field: mother_name (string, required)",
    "Changed field: email (now optional)"
  ]
}
```

---

## Semantic Search API

Requires embeddings to be initialized (OPENAI_API_KEY or COHERE_API_KEY set).

### POST /search/semantic

Perform semantic search across object definitions and instances.

**Request Body:**
```json
{
  "query": "customer accounts with balance over 10000",
  "filters": {
    "object_type": "conta_corrente",
    "state": "ACTIVE"
  },
  "limit": 10,
  "similarity_threshold": 0.7
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "type": "instance",
      "object_definition_name": "conta_corrente",
      "data": {
        "account_number": "12345-6",
        "balance": 150000
      },
      "similarity_score": 0.92,
      "snippet": "Account with balance of R$ 1,500.00"
    }
  ],
  "metadata": {
    "query_embedding_time_ms": 120,
    "search_time_ms": 45,
    "total_results": 15,
    "returned": 10
  }
}
```

### GET /search/metadata

Search by metadata filters (without embeddings).

**Query Parameters:**
- `object_definition_id` (uuid)
- `json_filter` (json): JSONB query filter
- `limit` (int, default: 20)

**Example:**
```bash
curl "http://localhost:8080/api/v1/search/metadata?object_definition_id=550e8400&json_filter={\"balance\":{\"$gt\":10000}}"
```

### POST /embeddings/index/object-definition/:id

Index a specific object definition for semantic search.

**Response:**
```json
{
  "status": "indexed",
  "object_definition_id": "uuid",
  "embedding_dimension": 1536,
  "indexed_at": "2024-12-10T00:00:00Z"
}
```

### POST /embeddings/reindex-all

Reindex all object definitions and instances.

**Response:**
```json
{
  "status": "started",
  "job_id": "uuid",
  "estimated_time_seconds": 300
}
```

### GET /embeddings/stats

Get embedding statistics.

**Response:**
```json
{
  "total_embeddings": 1250,
  "object_definitions": 25,
  "instances": 1225,
  "avg_dimension": 1536,
  "last_indexed": "2024-12-10T00:00:00Z",
  "index_health": "HEALTHY"
}
```

---

## Rate Limiting

Current rate limits (per IP address):

- **Oracle API**: 100 requests/minute
- **CRUD Operations**: 60 requests/minute
- **Search API**: 30 requests/minute
- **Assistant API**: 10 requests/minute (LLM costs)
- **Embedding Operations**: 5 requests/minute (compute intensive)

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1702166400
```

When rate limited, you'll receive:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 30 seconds.",
    "retry_after_seconds": 30
  }
}
```

---

## Examples

See [examples/](examples/) directory for complete, runnable examples:

- [00-oracle-whoami.md](examples/00-oracle-whoami.md) - Oracle API usage
- [01-create-conta-corrente-definition.json](examples/01-create-conta-corrente-definition.json) - Creating object definitions
- [02-create-account-instance.json](examples/02-create-account-instance.json) - Creating instances
- [03-state-transitions.md](examples/03-state-transitions.md) - Managing state machines
- [04-relationships.md](examples/04-relationships.md) - Creating relationships
- [05-semantic-search.md](examples/05-semantic-search.md) - Using RAG search

---

## Postman Collection

Import our Postman collection for easy API testing:

**[Download SuperCore.postman_collection.json](SuperCore.postman_collection.json)**

---

## Support

- **Issues**: [GitHub Issues](https://github.com/lbpay/supercore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lbpay/supercore/discussions)
- **Email**: dev@lbpay.com.br

---

**Last Updated**: 2024-12-10

**API Version**: 1.0.0
