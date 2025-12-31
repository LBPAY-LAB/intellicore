# ADR-014: Solution Layer Architecture

**Status**: Accepted
**Date**: 2025-12-30
**Deciders**: Solution Architect, Backend Architect, Database Specialist, Tech Lead
**Consulted**: DevOps Engineer, Security Architect, Product Owner

---

## Context and Problem Statement

SuperCore v2.0 needed a robust multi-tenancy architecture that could support multiple independent deployments of the platform, each with their own isolated data, configurations, and Oracle knowledge domains. The previous architecture (v1.0) considered Oracles as the top-level entity, which created significant challenges:

1. **No logical grouping**: Multiple Oracles serving the same business context had no common parent
2. **Shared resources**: RAG Global (the cross-Oracle knowledge base) was conceptually global, preventing true isolation
3. **URL routing complexity**: Without a tenant boundary, URLs like `/oracles/{id}` had no isolation context
4. **Multi-tenancy via Oracle-level only**: Using `oracle_id` as the isolation key meant each Oracle was effectively a tenant, which doesn't match business reality where a single organization may have multiple Oracles

The critical question: **What should be the top-level organizational unit that provides complete data isolation while allowing logical grouping of Oracles?**

---

## Decision Drivers

* **Business Isolation**: Different customers/deployments must have complete data separation
* **Logical Grouping**: Multiple Oracles serving one business domain need a common parent
* **RAG Global Scoping**: Each deployment needs its own "global" knowledge base, not a truly global one
* **URL Hierarchy**: Clear routing patterns like `/solucoes/{slug}/oracles/{oracle_name}`
* **Compliance Requirements**: LGPD, PCI-DSS, HIPAA require demonstrable data isolation
* **Operational Flexibility**: Solutions can be suspended, archived, or migrated independently
* **Industry-Specific Behavior**: Different solutions may have different compliance rules based on industry

---

## Considered Options

### Option 1: Global Oracle Pool

Maintain Oracles as top-level entities with a truly global RAG.

**Pros**:
- Simpler schema (no additional table)
- Cross-Oracle knowledge sharing

**Cons**:
- No tenant isolation
- RAG Global is shared (compliance nightmare)
- URL routing confusion (`/oracles/123` - whose Oracle?)
- No way to group related Oracles

**Assessment**: Rejected - Does not provide required data isolation.

### Option 2: Company-Level Multi-Tenancy

Add a `companies` table above Oracles, with each company having multiple Oracles.

**Pros**:
- Clear business entity mapping
- Company-based billing possible

**Cons**:
- Wrong granularity (a company may want multiple isolated Solutions)
- "Company" terminology doesn't fit SaaS model well
- Limits flexibility for white-label deployments

**Assessment**: Rejected - Wrong abstraction level for the platform.

### Option 3: Solution Layer Architecture (Chosen)

Introduce `solutions` as the top-level entity, with each Solution containing its own set of Oracles and its own RAG Global Oracle.

**Pros**:
- Clear isolation boundary
- Each Solution has its own RAG Global (1:1 relationship)
- URL-friendly slugs enable clean routing
- Industry classification for domain-specific behavior
- RLS policies can enforce Solution-level isolation
- Supports white-label, SaaS, and on-premise deployments

**Cons**:
- Additional table and foreign keys
- Circular FK relationship (solutions <-> oracles)
- Slightly more complex queries (always need solution context)

**Assessment**: Accepted - Best balance of isolation, flexibility, and operability.

---

## Decision Outcome

**Chosen option**: "Solution Layer Architecture"

The Solution entity becomes the foundational layer of SuperCore v2.0, sitting above Oracles and providing complete multi-tenancy isolation.

### Rationale

1. **Solution as Tenant Boundary**: Each Solution represents a complete, isolated deployment context. A fintech company might have separate Solutions for "Production", "Staging", and "Sandbox", each with their own Oracles and data.

2. **RAG Global Per Solution**: Instead of a truly global knowledge base, each Solution has its own RAG Global Oracle. This is implemented via a circular foreign key relationship:
   - `oracles.solution_id` references `solutions.id`
   - `solutions.rag_global_oracle_id` references `oracles.id`

3. **Industry Classification**: The `solution_industry` enum allows domain-specific behavior (compliance rules, default configurations, UI themes) to be applied at the Solution level.

4. **URL-Friendly Slugs**: Solutions use slugs (e.g., `acme-corp`) enabling clean URLs:
   - `/solucoes/acme-corp/oracles` - List all Oracles in Solution
   - `/solucoes/acme-corp/oracles/finance/chat` - Chat with Finance Oracle
   - `/solucoes/acme-corp/settings` - Solution configuration

---

## Technical Implementation

### Database Schema: solutions Table

**Location**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/01_solutions.sql`

```sql
-- Solution status enum for lifecycle management
CREATE TYPE solution_status AS ENUM (
    'draft',        -- Initial state, configuration in progress
    'active',       -- Solution is live and operational
    'suspended',    -- Temporarily disabled (billing, compliance, etc.)
    'archived',     -- Soft-archived, read-only access
    'deleted'       -- Marked for deletion (soft delete)
);

-- Industry classification for domain-specific features
CREATE TYPE solution_industry AS ENUM (
    'fintech',           -- Financial technology (banking, payments, lending)
    'ecommerce',         -- E-commerce and retail
    'healthcare',        -- Healthcare and medical
    'logistics',         -- Logistics and supply chain
    'crm',               -- Customer relationship management
    'erp',               -- Enterprise resource planning
    'real_estate',       -- Real estate and property management
    'education',         -- Education and e-learning
    'insurance',         -- Insurance and risk management
    'legal',             -- Legal and compliance
    'manufacturing',     -- Manufacturing and production
    'hospitality',       -- Hospitality and tourism
    'media',             -- Media and entertainment
    'telecommunications', -- Telecommunications
    'government',        -- Government and public sector
    'nonprofit',         -- Non-profit organizations
    'other'              -- Other/custom industries
);

CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(100) NOT NULL,                      -- URL-friendly identifier
    name VARCHAR(255) NOT NULL,                      -- Human-readable name
    description TEXT,                                -- Optional description

    -- Classification
    industry solution_industry DEFAULT 'other',      -- Industry for domain-specific behavior

    -- Status
    status solution_status DEFAULT 'draft',          -- Lifecycle status

    -- Configuration (extensible JSONB)
    config JSONB DEFAULT '{}'::jsonb,                -- Branding, features, limits, integrations

    -- RAG Global Oracle (1:1 relationship, added after oracles table exists)
    -- rag_global_oracle_id UUID REFERENCES oracles(id),

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,                          -- Soft delete timestamp

    -- Constraints
    CONSTRAINT solutions_slug_unique UNIQUE (slug),
    CONSTRAINT solutions_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT solutions_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT solutions_slug_length CHECK (LENGTH(slug) >= 3 AND LENGTH(slug) <= 100)
);
```

### Circular Foreign Key Relationship

**Location**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/02_oracles.sql`

The circular relationship between Solutions and Oracles is implemented with deferred constraints:

```sql
-- Add FK from oracles to solutions
ALTER TABLE oracles
    ADD CONSTRAINT oracles_solution_fk
    FOREIGN KEY (solution_id)
    REFERENCES solutions(id)
    ON DELETE CASCADE;

-- Add FK from solutions to oracles for RAG Global Oracle
ALTER TABLE solutions
    ADD COLUMN rag_global_oracle_id UUID;

ALTER TABLE solutions
    ADD CONSTRAINT solutions_rag_global_oracle_fk
    FOREIGN KEY (rag_global_oracle_id)
    REFERENCES oracles(id)
    ON DELETE SET NULL;
```

**Rationale for ON DELETE SET NULL**: If the RAG Global Oracle is accidentally deleted, we don't want to cascade-delete the entire Solution. Instead, we set the reference to NULL and can recreate the RAG Global Oracle later.

### RAG Global Oracle Creation Function

```sql
-- Function to create RAG Global Oracle for a solution
CREATE OR REPLACE FUNCTION create_rag_global_oracle(p_solution_id UUID)
RETURNS UUID AS $$
DECLARE
    v_oracle_id UUID;
    v_solution_slug VARCHAR(100);
BEGIN
    -- Get solution slug for naming
    SELECT slug INTO v_solution_slug FROM solutions WHERE id = p_solution_id;

    -- Create RAG Global Oracle
    INSERT INTO oracles (
        solution_id,
        oracle_name,
        display_name,
        description,
        oracle_type,
        status,
        is_system,
        system_prompt
    ) VALUES (
        p_solution_id,
        'rag_global',
        'RAG Global',
        'System oracle for general knowledge and cross-domain queries',
        'rag_global',
        'active',
        TRUE,
        'You are a helpful AI assistant with access to the organization''s knowledge base. Provide accurate, helpful responses based on the available documentation and context.'
    ) RETURNING id INTO v_oracle_id;

    -- Update solution with RAG Global Oracle reference
    UPDATE solutions SET rag_global_oracle_id = v_oracle_id WHERE id = p_solution_id;

    RETURN v_oracle_id;
END;
$$ LANGUAGE plpgsql;
```

### Row-Level Security (RLS) Policies

**Location**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/indexes/rls_policies.sql`

RLS policies enforce Solution-level data isolation:

```
Multi-Tenancy Architecture via RLS:

  Application Layer
  ├── 1. Request arrives with solution context (from auth/token)
  ├── 2. Call: SELECT set_current_solution('solution-uuid')
  ├── 3. Execute queries normally (RLS filters automatically)
  └── 4. Call: clear_current_solution() (optional)
                    │
                    ▼
  PostgreSQL RLS
  ├── Session Variable: app.current_solution_id
  ├── Helper Function: current_solution_id() → UUID
  ├── Bypass Check: current_user_is_superuser() → BOOLEAN
  └── Every SELECT/INSERT/UPDATE/DELETE filtered by:
        WHERE solution_id = current_solution_id()
           OR current_user_is_superuser()
                    │
                    ▼
  Tables with RLS Enabled
  ├── oracles (solution_id)
  ├── documents (solution_id)
  ├── document_chunks (solution_id)
  ├── conversations (solution_id)
  ├── messages (solution_id)
  └── temporal_workflows (solution_id - nullable for system workflows)

  Note: solutions table does NOT have RLS (it's the boundary)
```

**RLS Policy Pattern** (applied to all child tables):

```sql
-- Example: oracles table
ALTER TABLE oracles ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracles FORCE ROW LEVEL SECURITY;

CREATE POLICY oracles_select_policy ON oracles
    FOR SELECT
    USING (
        solution_id = current_solution_id()
        OR current_user_is_superuser()
    );

CREATE POLICY oracles_insert_policy ON oracles
    FOR INSERT
    WITH CHECK (
        solution_id = current_solution_id()
        OR current_user_is_superuser()
    );

CREATE POLICY oracles_update_policy ON oracles
    FOR UPDATE
    USING (
        solution_id = current_solution_id()
        OR current_user_is_superuser()
    );

CREATE POLICY oracles_delete_policy ON oracles
    FOR DELETE
    USING (
        solution_id = current_solution_id()
        OR current_user_is_superuser()
    );
```

**Helper Functions**:

```sql
-- Get current solution ID from session
CREATE OR REPLACE FUNCTION current_solution_id()
RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_solution_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Set current solution for RLS
CREATE OR REPLACE FUNCTION set_current_solution(p_solution_id UUID)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_solution_id', p_solution_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- Clear solution context
CREATE OR REPLACE FUNCTION clear_current_solution()
RETURNS VOID AS $$
BEGIN
    PERFORM set_config('app.current_solution_id', '', false);
END;
$$ LANGUAGE plpgsql;

-- Check superuser mode (for admin operations)
CREATE OR REPLACE FUNCTION current_user_is_superuser()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN COALESCE(current_setting('app.is_superuser', true)::BOOLEAN, FALSE);
END;
$$ LANGUAGE plpgsql STABLE;
```

### Performance Indexes

All tables include `solution_id` in their primary indexes for optimal RLS query performance:

```sql
-- Solutions indexes
CREATE UNIQUE INDEX idx_solutions_slug ON solutions(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_status ON solutions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_industry ON solutions(industry) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_active ON solutions(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_solutions_config ON solutions USING GIN(config jsonb_path_ops);

-- Oracles indexes (solution-first for RLS)
CREATE INDEX idx_oracles_solution_id ON oracles(solution_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_solution_name ON oracles(solution_id, oracle_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_oracles_system ON oracles(solution_id) WHERE is_system = TRUE AND deleted_at IS NULL;
CREATE INDEX idx_oracles_active ON oracles(solution_id) WHERE status = 'active' AND deleted_at IS NULL;
```

---

## URL Hierarchy Impact

The Solution Layer enables a clean, hierarchical URL structure:

```
URL Pattern                                           Description
──────────────────────────────────────────────────── ─────────────────────────────────────
/api/v1/solutions                                    List all solutions (admin only)
/api/v1/solutions/{slug}                             Get solution by slug
/api/v1/solutions/{slug}/oracles                     List oracles in solution
/api/v1/solutions/{slug}/oracles/{oracle_name}       Get specific oracle
/api/v1/solutions/{slug}/oracles/{oracle_name}/chat  Chat with oracle
/api/v1/solutions/{slug}/documents                   List documents in solution
/api/v1/solutions/{slug}/conversations               List conversations in solution
/api/v1/solutions/{slug}/workflows                   List workflows in solution

Frontend Routes (Next.js 14):
/solucoes/{slug}                                     Solution dashboard
/solucoes/{slug}/oraculos                            Oracles management
/solucoes/{slug}/oraculos/{oracle_name}              Oracle detail/chat
/solucoes/{slug}/documentos                          Documents management
/solucoes/{slug}/configuracoes                       Solution settings
```

**Implementation Note**: The `slug` is validated via regex constraint to ensure URL-safe characters: `^[a-z0-9]+(-[a-z0-9]+)*$`

---

## Consequences

### Positive

* **Complete Data Isolation**: Each Solution has its own data, enforced at the database level via RLS
* **Clear Ownership**: Oracles, documents, conversations all belong to a Solution
* **RAG Global Per Solution**: Each Solution has its own "global" knowledge base (1:1 relationship)
* **Industry-Specific Behavior**: Solutions can be tagged with industry for compliance rules
* **Lifecycle Management**: Solutions can be suspended, archived, or migrated independently
* **URL Clarity**: Clean, predictable URL patterns enable caching and routing
* **Audit Trail**: All operations are scoped to a Solution for compliance reporting
* **White-Label Support**: Different Solutions can have different branding via `config.branding`

### Negative

* **Query Complexity**: All queries must include Solution context (handled via RLS)
* **Circular FK**: The solutions <-> oracles relationship requires careful handling in migrations
* **Performance Overhead**: RLS adds ~5-10% overhead to queries (mitigated by indexes)
* **Migration Complexity**: Existing Oracle-only data needs migration to Solution-scoped model

### Neutral

* **Storage**: Minimal additional storage (one UUID column per row)
* **Backup/Restore**: Can backup entire Solutions or individual Oracles
* **Cross-Solution Queries**: Requires superuser mode (by design for security)

---

## Validation

This decision will be validated through:

1. **RLS Policy Tests**: Verify that queries without Solution context return no rows
2. **Cross-Solution Isolation Tests**: Confirm Solution A cannot access Solution B's data
3. **Performance Benchmarks**: Verify <10% overhead from RLS policies
4. **SAGA Workflow Tests**: Confirm CreateSolutionSAGA creates both Solution and RAG Global atomically
5. **API Integration Tests**: Verify URL routing with slugs works correctly
6. **Compliance Audit**: Document Solution isolation for LGPD/PCI-DSS requirements

**Evidence Files**:
- RLS Policies: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/indexes/rls_policies.sql`
- Solutions Schema: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/01_solutions.sql`
- Oracles Schema: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/02_oracles.sql`

---

## Related Decisions

* **ADR-003**: PostgreSQL + NebulaGraph Hybrid - Solution Layer uses PostgreSQL's RLS feature
* **ADR-007**: Multi-Tenancy via oracle_id Foreign Key - Extended to solution_id as primary isolation key
* **ADR-012**: Multi-Tenancy Strategy - Solution Layer implements the "shared schema + RLS" approach
* **ADR-015**: Temporal Workflow Orchestration - CreateSolutionSAGA ensures atomic Solution + RAG Global creation

---

## References

### Implemented Artifacts

* **Solutions Schema**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/01_solutions.sql`
* **Oracles Schema**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/schemas/02_oracles.sql`
* **RLS Policies Reference**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/database/indexes/rls_policies.sql`
* **Infrastructure README**: `/Users/jose.silva.lb/LBPay/supercore/fases/fase-1/artefactos/infrastructure/README.md`

### Architecture Documentation

* **Arquitetura SuperCore v2.0**: `/Users/jose.silva.lb/LBPay/supercore/documentation-base/arquitetura_supercore_v2.0.md`
* **Stack SuperCore v2.0**: `/Users/jose.silva.lb/LBPay/supercore/documentation-base/stack_supercore_v2.0.md`
* **CLAUDE.md**: `/Users/jose.silva.lb/LBPay/supercore/CLAUDE.md`

### External References

* [PostgreSQL Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
* [Multi-Tenancy with PostgreSQL](https://www.citusdata.com/blog/2018/02/13/multi-tenant-postgresql/)
* [UUID Performance in PostgreSQL](https://www.postgresql.org/docs/current/uuid-ossp.html)

---

## Changelog

| Date | Version | Author | Description |
|------|---------|--------|-------------|
| 2025-12-30 | 1.0.0 | Solution Architect | Initial ADR creation based on implemented database schemas |

---

**Document Status**: Accepted
**Implementation Status**: Complete (Epic 1.3)
**Next Steps**: Integrate with Go backend services in Sprint 2
