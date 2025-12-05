# CoreBanking Brain - API Reference

> **Version:** 1.0
> **Date:** 2025-12-04
> **Sprint 20** - US-DB-024: Documentation

---

## Overview

This document provides a complete API reference for the CoreBanking Brain system. All APIs use GraphQL and are available at `/graphql` endpoint.

---

## Authentication

All API requests require JWT authentication via Bearer token:

```http
Authorization: Bearer <jwt_token>
```

Tokens are obtained via Keycloak OIDC authentication.

---

## Document Categories API

### Query: documentCategories

List all document categories.

```graphql
query {
  documentCategories {
    id
    name
    description
    ragEnabled
    goldTargets
    createdAt
    updatedAt
  }
}
```

**Response:**
```json
{
  "data": {
    "documentCategories": [
      {
        "id": "uuid",
        "name": "BACEN_CIRCULAR",
        "description": "Circulares do Banco Central",
        "ragEnabled": true,
        "goldTargets": ["A", "B", "C"],
        "createdAt": "2025-12-04T00:00:00Z",
        "updatedAt": "2025-12-04T00:00:00Z"
      }
    ]
  }
}
```

### Query: documentCategory

Get a specific document category by ID.

```graphql
query documentCategory($id: ID!) {
  documentCategory(id: $id) {
    id
    name
    description
    ragEnabled
    goldTargets
    chunkSize
    chunkOverlap
    embeddingModel
  }
}
```

### Mutation: createDocumentCategory

Create a new document category.

```graphql
mutation createDocumentCategory($input: CreateDocumentCategoryInput!) {
  createDocumentCategory(input: $input) {
    id
    name
  }
}
```

**Input:**
```typescript
interface CreateDocumentCategoryInput {
  name: string;           // Required, unique
  description?: string;
  ragEnabled?: boolean;   // Default: true
  goldTargets?: string[]; // ["A", "B", "C"]
  chunkSize?: number;     // Default: 512
  chunkOverlap?: number;  // Default: 50
}
```

### Mutation: updateDocumentCategory

Update an existing document category.

```graphql
mutation updateDocumentCategory($input: UpdateDocumentCategoryInput!) {
  updateDocumentCategory(input: $input) {
    id
    name
  }
}
```

### Mutation: deleteDocumentCategory

Delete a document category (soft delete).

```graphql
mutation deleteDocumentCategory($id: ID!) {
  deleteDocumentCategory(id: $id)
}
```

---

## Bronze Documents API

### Query: bronzeDocuments

List bronze layer documents with optional filtering.

```graphql
query bronzeDocuments($categoryId: ID, $status: ProcessingStatus) {
  bronzeDocuments(categoryId: $categoryId, status: $status) {
    id
    documentId
    categoryId
    status
    processingStage
    extractedText
    metadata
    createdAt
  }
}
```

**Status Values:**
- `PENDING` - Awaiting processing
- `PROCESSING` - Currently being processed
- `COMPLETED` - Successfully processed
- `FAILED` - Processing failed

### Query: bronzeDocument

Get a specific bronze document by ID.

```graphql
query bronzeDocument($id: ID!) {
  bronzeDocument(id: $id) {
    id
    documentId
    categoryId
    status
    processingStage
    extractedText
    wordCount
    charCount
    metadata
    errorMessage
    createdAt
    processedAt
  }
}
```

### Mutation: processDocumentForRAG

Process a document through the Bronze layer.

```graphql
mutation processDocumentForRAG($documentId: ID!, $categoryId: ID!) {
  processDocumentForRAG(documentId: $documentId, categoryId: $categoryId) {
    id
    status
    processingStage
  }
}
```

**Processing Stages:**
1. `BRONZE_PENDING` - Queued for text extraction
2. `BRONZE_PROCESSING` - Extracting text
3. `BRONZE_COMPLETED` - Text extracted
4. `SILVER_PENDING` - Queued for chunking
5. `SILVER_PROCESSING` - Creating chunks
6. `SILVER_COMPLETED` - Chunks created
7. `GOLD_PENDING` - Queued for gold distribution
8. `GOLD_PROCESSING` - Distributing to Gold A/B/C
9. `GOLD_COMPLETED` - Processing complete

### Mutation: reprocessDocument

Reprocess a failed or completed document.

```graphql
mutation reprocessDocument($bronzeId: ID!) {
  reprocessDocument(bronzeId: $bronzeId) {
    id
    status
  }
}
```

---

## Silver Documents API

### Query: silverChunks

List chunks for a bronze document.

```graphql
query silverChunks($bronzeDocumentId: ID!) {
  silverChunks(bronzeDocumentId: $bronzeDocumentId) {
    id
    chunkIndex
    chunkText
    wordCount
    sectionHierarchy
    extractedEntities
    createdAt
  }
}
```

**Extracted Entities Structure:**
```json
{
  "cpf": ["12345678901"],
  "cnpj": ["12345678000199"],
  "dates": ["2025-01-15"],
  "money": ["R$ 1.000,00"],
  "emails": ["email@example.com"],
  "phones": ["+55 11 99999-9999"]
}
```

---

## AI Assistant API

### Mutation: sendChatMessage

Send a message to the AI Assistant with optional RAG context.

```graphql
mutation sendChatMessage($input: ChatMessageInput!) {
  sendChatMessage(input: $input) {
    response
    sources {
      documentId
      documentName
      chunkText
      score
    }
    tokenUsage {
      promptTokens
      completionTokens
      totalTokens
    }
  }
}
```

**Input:**
```typescript
interface ChatMessageInput {
  message: string;         // Required, user's question
  sessionId?: string;      // Optional, for conversation context
  useRagContext?: boolean; // Default: true
  maxSources?: number;     // Default: 5
  temperature?: number;    // Default: 0.7
}
```

**Example Request:**
```graphql
mutation {
  sendChatMessage(input: {
    message: "Qual o prazo para registro de chave PIX?"
    useRagContext: true
    maxSources: 3
  }) {
    response
    sources {
      documentName
      chunkText
      score
    }
  }
}
```

**Example Response:**
```json
{
  "data": {
    "sendChatMessage": {
      "response": "De acordo com a regulamentação BACEN, o prazo para registro de chave PIX é...",
      "sources": [
        {
          "documentName": "Manual DICT v2.0",
          "chunkText": "O prazo para registro de chave...",
          "score": 0.95
        }
      ]
    }
  }
}
```

---

## DICT Validation API

### Mutation: validateDictKey

Validate a PIX key registration request.

```graphql
mutation validateDictKey($input: DictKeyInput!) {
  validateDictKey(input: $input) {
    isValid
    score
    validations {
      field
      isValid
      message
      details
    }
    errors
    warnings
  }
}
```

**Input:**
```typescript
interface DictKeyInput {
  tipoChave: "CPF" | "CNPJ" | "EMAIL" | "TELEFONE" | "EVP";
  valorChave: string;
  titularCpfCnpj: string;
  titularNome?: string;
  titularTipoPessoa?: "F" | "J";
  contaTipo: "CACC" | "SVGS" | "SLRY" | "TRAN";
  contaNumero?: string;
  contaAgencia?: string;
  ispb: string;
}
```

**Key Types:**

| Tipo | Formato | Exemplo |
|------|---------|---------|
| CPF | 11 dígitos | 12345678901 |
| CNPJ | 14 dígitos | 12345678000199 |
| EMAIL | email válido | user@domain.com |
| TELEFONE | +5511999999999 | +5511999999999 |
| EVP | UUID v4 | 123e4567-e89b-12d3-a456-426614174000 |

**Account Types:**

| Tipo | Descrição |
|------|-----------|
| CACC | Conta Corrente |
| SVGS | Conta Poupança |
| SLRY | Conta Salário |
| TRAN | Conta Transacional |

**Example Request:**
```graphql
mutation {
  validateDictKey(input: {
    tipoChave: "CPF"
    valorChave: "12345678901"
    titularCpfCnpj: "12345678901"
    titularNome: "João Silva"
    titularTipoPessoa: "F"
    contaTipo: "CACC"
    ispb: "00000000"
  }) {
    isValid
    score
    validations {
      field
      isValid
      message
    }
    errors
    warnings
  }
}
```

**Example Response:**
```json
{
  "data": {
    "validateDictKey": {
      "isValid": true,
      "score": 95,
      "validations": [
        {
          "field": "tipoChave",
          "isValid": true,
          "message": "Tipo de chave válido"
        },
        {
          "field": "valorChave",
          "isValid": true,
          "message": "CPF válido"
        },
        {
          "field": "titularCpfCnpj",
          "isValid": true,
          "message": "CPF do titular corresponde à chave"
        },
        {
          "field": "ispb",
          "isValid": true,
          "message": "ISPB válido (8 dígitos)"
        }
      ],
      "errors": [],
      "warnings": []
    }
  }
}
```

---

## External Sources API

### Query: externalSources

List all external data sources.

```graphql
query {
  externalSources {
    id
    name
    type
    description
    enabled
    connectionStatus
    lastSyncAt
    createdAt
  }
}
```

**Source Types:**
- `POSTGRESQL`
- `MYSQL`
- `REST_API`
- `GRAPHQL_API`
- `TIGERBEETLE`

### Query: externalSource

Get a specific external source by ID.

```graphql
query externalSource($id: ID!) {
  externalSource(id: $id) {
    id
    name
    type
    description
    config
    enabled
    connectionStatus
    lastSyncAt
    syncStats
  }
}
```

### Mutation: createExternalSource

Create a new external data source.

```graphql
mutation createExternalSource($input: CreateExternalSourceInput!) {
  createExternalSource(input: $input) {
    id
    name
  }
}
```

**Input:**
```typescript
interface CreateExternalSourceInput {
  name: string;
  type: SourceType;
  description?: string;
  config: SourceConfig;
  enabled?: boolean;
}

// PostgreSQL/MySQL config
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
}

// REST API config
interface RestApiConfig {
  baseUrl: string;
  authType: "none" | "basic" | "bearer" | "api_key";
  authConfig?: {
    username?: string;
    password?: string;
    token?: string;
    apiKey?: string;
    headerName?: string;
  };
  headers?: Record<string, string>;
}

// GraphQL API config
interface GraphqlApiConfig {
  endpoint: string;
  headers?: Record<string, string>;
}
```

### Mutation: testExternalSourceConnection

Test connection to an external source.

```graphql
mutation testExternalSourceConnection($id: ID!) {
  testExternalSourceConnection(id: $id) {
    success
    message
    latencyMs
    details
  }
}
```

### Mutation: syncExternalSource

Sync data from an external source.

```graphql
mutation syncExternalSource($id: ID!, $fullSync: Boolean) {
  syncExternalSource(id: $id, fullSync: $fullSync) {
    success
    recordsProcessed
    recordsCreated
    recordsUpdated
    recordsFailed
    errors
    durationMs
  }
}
```

### Mutation: toggleExternalSourceEnabled

Enable or disable an external source.

```graphql
mutation toggleExternalSourceEnabled($id: ID!) {
  toggleExternalSourceEnabled(id: $id) {
    id
    enabled
  }
}
```

---

## Processing History API

### Query: processingHistory

Get processing history for a document.

```graphql
query processingHistory($documentId: ID!) {
  processingHistory(documentId: $documentId) {
    id
    stage
    status
    startedAt
    completedAt
    durationMs
    details
    errorMessage
  }
}
```

### Query: processingStats

Get overall processing statistics.

```graphql
query {
  processingStats {
    totalDocuments
    pendingDocuments
    processingDocuments
    completedDocuments
    failedDocuments
    avgProcessingTimeMs
    documentsProcessedToday
    documentsProcessedThisWeek
  }
}
```

---

## Analytics API

### Query: dashboardSummary

Get dashboard summary statistics.

```graphql
query {
  dashboardSummary {
    totalObjectTypes
    totalInstances
    totalDocuments
    totalRelationships
    activeWorkflows
    pendingWorkflows
    instancesCreatedOverTime {
      timestamp
      value
    }
    instanceStatusDistribution {
      status
      count
    }
    objectTypeStats {
      name
      instanceCount
      fieldCount
      relationshipCount
    }
  }
}
```

---

## Rate Limits

| Endpoint | Development | Production |
|----------|-------------|------------|
| General API | 1000/min | 100/min |
| AI Assistant | 100/min | 20/min |
| DICT Validation | 100/min | 30/min |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

---

## Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "ERROR_CODE",
        "details": {}
      }
    }
  ]
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHENTICATED` | Missing or invalid authentication |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `BAD_USER_INPUT` | Invalid input data |
| `TOO_MANY_REQUESTS` | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | Server error |

---

## Webhooks

External sources can be configured to send webhooks on sync completion:

**Webhook Payload:**
```json
{
  "event": "sync.completed",
  "sourceId": "uuid",
  "sourceName": "Source Name",
  "timestamp": "2025-12-04T00:00:00Z",
  "result": {
    "success": true,
    "recordsProcessed": 100,
    "durationMs": 5000
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Send chat message
const { data } = await client.mutate({
  mutation: gql`
    mutation SendMessage($input: ChatMessageInput!) {
      sendChatMessage(input: $input) {
        response
        sources {
          documentName
          score
        }
      }
    }
  `,
  variables: {
    input: {
      message: 'Qual o prazo para registro de chave PIX?',
      useRagContext: true,
    },
  },
});
```

### Python

```python
import requests

url = "http://localhost:4000/graphql"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

query = """
mutation ValidateDictKey($input: DictKeyInput!) {
  validateDictKey(input: $input) {
    isValid
    score
    errors
  }
}
"""

variables = {
    "input": {
        "tipoChave": "CPF",
        "valorChave": "12345678901",
        "titularCpfCnpj": "12345678901",
        "contaTipo": "CACC",
        "ispb": "00000000"
    }
}

response = requests.post(
    url,
    json={"query": query, "variables": variables},
    headers=headers
)

print(response.json())
```

---

**Document:** API_REFERENCE.md
**Version:** 1.0
**Date:** 2025-12-04
