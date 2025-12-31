-- ============================================================================
-- SuperCore v2.0 - Schema: Solutions (Foundation Layer)
-- ============================================================================
-- Description: Solutions are the top-level organizational units in SuperCore.
--              Each solution can contain multiple oracles and provides
--              complete multi-tenancy isolation.
--
-- Key Features:
--   - URL-friendly slugs for routing (/solucoes/{slug}/...)
--   - Industry classification for domain-specific behavior
--   - Soft delete support (deleted_at)
--   - Auto-created RAG Global Oracle reference
--   - Audit timestamps (created_at, updated_at)
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

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

-- ============================================================================
-- SOLUTIONS TABLE
-- ============================================================================

CREATE TABLE solutions (
    -- Primary Key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Classification
    industry solution_industry DEFAULT 'other',

    -- Status
    status solution_status DEFAULT 'draft',

    -- Configuration (extensible JSONB)
    config JSONB DEFAULT '{}'::jsonb,
    -- Expected config structure:
    -- {
    --   "branding": {
    --     "logo_url": "https://...",
    --     "primary_color": "#4F46E5",
    --     "favicon_url": "https://..."
    --   },
    --   "features": {
    --     "rag_enabled": true,
    --     "graph_enabled": true,
    --     "chat_enabled": true
    --   },
    --   "limits": {
    --     "max_oracles": 10,
    --     "max_documents": 1000,
    --     "max_storage_gb": 50
    --   },
    --   "integrations": {
    --     "llm_provider": "anthropic",
    --     "llm_model": "claude-3-5-sonnet-20241022"
    --   }
    -- }

    -- RAG Global Oracle (auto-created, 1:1 relationship)
    -- This FK will be added after oracles table is created
    -- rag_global_oracle_id UUID REFERENCES oracles(id),

    -- Audit Fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,  -- Soft delete timestamp

    -- Constraints
    CONSTRAINT solutions_slug_unique UNIQUE (slug),
    CONSTRAINT solutions_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT solutions_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT solutions_slug_length CHECK (LENGTH(slug) >= 3 AND LENGTH(slug) <= 100)
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE solutions IS 'Top-level organizational units in SuperCore. Each solution provides complete multi-tenancy isolation and can contain multiple oracles.';

COMMENT ON COLUMN solutions.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN solutions.slug IS 'URL-friendly identifier for routing (e.g., "acme-corp" for /solucoes/acme-corp/...)';
COMMENT ON COLUMN solutions.name IS 'Human-readable display name';
COMMENT ON COLUMN solutions.description IS 'Optional detailed description of the solution';
COMMENT ON COLUMN solutions.industry IS 'Industry classification for domain-specific features';
COMMENT ON COLUMN solutions.status IS 'Lifecycle status (draft, active, suspended, archived, deleted)';
COMMENT ON COLUMN solutions.config IS 'Extensible JSONB configuration (branding, features, limits, integrations)';
COMMENT ON COLUMN solutions.created_at IS 'Timestamp when solution was created';
COMMENT ON COLUMN solutions.updated_at IS 'Timestamp of last update';
COMMENT ON COLUMN solutions.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Primary lookup by slug (used in URL routing)
CREATE UNIQUE INDEX idx_solutions_slug ON solutions(slug) WHERE deleted_at IS NULL;

-- Status filtering (common query pattern)
CREATE INDEX idx_solutions_status ON solutions(status) WHERE deleted_at IS NULL;

-- Industry filtering
CREATE INDEX idx_solutions_industry ON solutions(industry) WHERE deleted_at IS NULL;

-- Chronological listing
CREATE INDEX idx_solutions_created_at ON solutions(created_at DESC) WHERE deleted_at IS NULL;

-- Active solutions lookup (most common query)
CREATE INDEX idx_solutions_active ON solutions(id) WHERE status = 'active' AND deleted_at IS NULL;

-- Config JSONB GIN index for flexible querying
CREATE INDEX idx_solutions_config ON solutions USING GIN(config jsonb_path_ops);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER solutions_updated_at_trigger
    BEFORE UPDATE ON solutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Prevent hard delete (enforce soft delete)
CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Hard delete is not allowed. Use soft delete by setting deleted_at timestamp.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER solutions_prevent_hard_delete
    BEFORE DELETE ON solutions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_hard_delete();

-- ============================================================================
-- SAMPLE DATA (for development/testing only)
-- ============================================================================

-- To insert sample data, run:
-- INSERT INTO solutions (slug, name, description, industry, status)
-- VALUES
--     ('supercore-demo', 'SuperCore Demo', 'Demonstration solution for SuperCore v2.0', 'fintech', 'active'),
--     ('acme-payments', 'ACME Payments', 'Payment processing solution for ACME Corp', 'fintech', 'draft');
