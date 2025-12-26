# PROD-068 Component Specification

**Card ID**: PROD-068  
**RF**: RF032 - Ferramentas MCP - Operações Executáveis  
**Priority**: LOW  
**Phase**: 1  
**Squad**: Backend Engineering  
**Status**: ✅ SPECIFICATION COMPLETE  
**Date**: 2025-12-26

## User Stories

### US-068-01: As a developer, I want to execute MCP tools via REST API
**Acceptance Criteria**:
- API endpoint POST /api/v1/mcp/tools/{tool_name}/execute available
- Request authenticated via JWT or API Key
- Rate limiting enforced (tool-specific limits)
- Sync tools return result immediately (<200ms)
- Async tools return execution_id for status polling
- Error responses follow standard format

### US-068-02: As a system administrator, I want to track all MCP tool executions
**Acceptance Criteria**:
- All executions logged in mcp_tool_executions table
- Execution status tracked (pending → running → completed/failed)
- Execution time calculated automatically
- Audit log records all invocations with user context

### US-068-03: As a security engineer, I want MCP tools to be secure
**Acceptance Criteria**:
- All inputs validated via Pydantic models
- SQL injection prevented (parameterized queries)
- Rate limiting prevents abuse
- Audit trail for compliance
- No credentials in logs or responses

## Technical Specifications

### Database Schema

**Tables**:
1. mcp_tools - Registry of available tools
2. mcp_tool_executions - Execution tracking
3. mcp_rate_limits - Rate limiting data
4. mcp_audit_log - Immutable audit trail

### MCP Tools

| Tool | Category | Rate Limit | Async | Timeout |
|------|----------|------------|-------|---------|
| create_oracle | oracle | 10/min | No | 10s |
| upload_context | context | 20/min | Yes | 300s |
| generate_object_definition | generation | 30/min | Yes | 60s |
| generate_agent | generation | 30/min | Yes | 60s |
| generate_workflow | generation | 30/min | Yes | 60s |
| execute_workflow | execution | 60/min | Yes | 120s |
| execute_agent | execution | 60/min | Yes | 120s |
| rag_query | query | 100/min | No | 10s |
| test_validation_rule | validation | 60/min | No | 5s |

### API Endpoints

**Base**: /api/v1/mcp

1. GET /tools - List all available MCP tools
2. GET /tools/{tool_name} - Get tool details
3. POST /tools/{tool_name}/execute - Execute tool
4. POST /tools/{tool_name}/validate - Validate input params
5. GET /executions/{id} - Get execution status
6. GET /executions/{id}/logs - Get execution logs

### Authentication

**Methods**:
- JWT tokens (24h expiration)
- API keys (hashed in database)

**Authorization**:
- Role-based access control (RBAC)
- Oracle-level permissions

### Performance Requirements

| Metric | Target |
|--------|--------|
| Sync tool latency (p99) | <200ms |
| Async tool latency (p99) | <500ms |
| Throughput | 100 req/sec |
| Database query (p99) | <100ms |
| Test coverage | ≥80% |

## Implementation Location

**Artefacts**: app-generation/app-artefacts/engenharia/backend/rf032-mcp-tools/

**Files**:
- migrations/ - SQL database migrations
- tools/ - Tool implementations
- routers/ - FastAPI route handlers
- middleware/ - Auth and rate limiting
- services/ - Database, Redis, LLM clients
- tests/ - Unit and integration tests
- main.py - FastAPI application
- models.py - Pydantic data models
- config.py - Application settings

## Dependencies

**From Stack**:
- FastAPI 0.104+
- PostgreSQL 16+ (asyncpg driver)
- Redis 7+
- Pydantic V2
- Celery 5.3+
- pytest + pytest-asyncio

**External Services**:
- LLM provider (Anthropic Claude / vLLM)
- PostgreSQL database
- Redis cache

## Testing Strategy

### Unit Tests (≥80% coverage)
- Test each tool individually
- Mock external dependencies
- Test error handling
- Test input validation

### Integration Tests
- End-to-end API flow
- Authentication/authorization
- Rate limiting with real Redis
- Database persistence

### Performance Tests
- Load testing (Locust)
- Latency benchmarks
- Throughput validation

## Security Considerations

**Threats Mitigated**:
- SQL injection (parameterized queries)
- XSS (output sanitization)
- Authentication bypass (JWT validation)
- Rate limit abuse (token bucket)
- Data leakage (audit logging)

**Best Practices**:
- Principle of least privilege
- Defense in depth
- Fail securely
- Audit trail

## References

- RF032: requisitos_funcionais_v2.0.md:681-700
- Stack: stack_supercore_v2.0.md
- Architecture: arquitetura_supercore_v2.0.md
- CLAUDE.md: Zero-tolerance policy


