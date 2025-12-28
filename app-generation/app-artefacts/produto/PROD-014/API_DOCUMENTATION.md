# API Documentation - RAG 3D Service

## OpenAPI Specification

**Base URL**: `/api/v1/rag`  
**Authentication**: Bearer token required  
**Rate Limit**: 60 requests/minute

---

## Endpoints

### 1. POST /query

Execute trimodal RAG query.

**Request Body**:
```json
{
  "question": "Quais são os limites de PIX?",
  "oracle_id": "uuid-oracle-banking",
  "context": {
    "object_type": "PixPayment",
    "user_role": "compliance_officer"
  },
  "max_results": 10,
  "include_sources": true
}
```

**Response 200**:
```json
{
  "answer": "Os limites de PIX são...",
  "sources": [
    {
      "type": "sql",
      "entity_id": "uuid-001",
      "title": "Limites PIX PF",
      "relevance_score": 0.95
    }
  ],
  "query_metrics": {
    "total_latency_ms": 87,
    "sql_latency_ms": 12,
    "graph_latency_ms": 34,
    "vector_latency_ms": 28,
    "llm_latency_ms": 13,
    "cache_hit": false
  }
}
```

**Error Responses**:
- 400: Invalid request (malformed question, invalid oracle_id)
- 401: Unauthorized (missing/invalid token)
- 429: Rate limit exceeded
- 500: Internal server error

---

### 2. GET /history

Retrieve query history for audit trail.

**Query Parameters**:
- `oracle_id` (required): UUID
- `user_id` (optional): UUID
- `start_date` (optional): ISO 8601
- `end_date` (optional): ISO 8601  
- `limit` (default: 50, max: 100)

**Response 200**:
```json
{
  "queries": [
    {
      "id": "uuid-query-001",
      "question": "Quais são os limites de PIX?",
      "timestamp": "2025-12-26T10:30:00Z",
      "user_id": "uuid-user-001",
      "latency_ms": 87,
      "cache_hit": false
    }
  ],
  "total": 150,
  "page": 1,
  "page_size": 50
}
```

---

### 3. POST /embed

Generate embeddings for text (utility endpoint).

**Request Body**:
```json
{
  "text": "Resolução BACEN sobre PIX",
  "model": "text-embedding-ada-002"
}
```

**Response 200**:
```json
{
  "embedding": [0.023, -0.15, 0.42, ...],
  "dimensions": 1536,
  "model": "text-embedding-ada-002"
}
```

---

## Performance SLAs

- **p95 Latency**: <100ms ✅  
- **p99 Latency**: <200ms ✅  
- **Uptime**: 99.9%  
- **Error Rate**: <1% ✅

---

## Security

- **Authentication**: OAuth 2.0 / JWT
- **Authorization**: RBAC per oracle
- **Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Rate Limiting**: Token bucket (60/min)
- **Input Validation**: Pydantic models
- **SQL Injection**: Parameterized queries only

---

**Documentation**: Auto-generated at `/docs` (Swagger UI)
