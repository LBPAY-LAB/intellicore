-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 002: Solutions Table (Foundation Layer)
-- ============================================================================
-- Description: Creates the solutions table - the top-level organizational
--              unit in SuperCore providing multi-tenancy isolation.
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE solution_status AS ENUM (
    'draft',
    'active',
    'suspended',
    'archived',
    'deleted'
);

CREATE TYPE solution_industry AS ENUM (
    'fintech',
    'ecommerce',
    'healthcare',
    'logistics',
    'crm',
    'erp',
    'real_estate',
    'education',
    'insurance',
    'legal',
    'manufacturing',
    'hospitality',
    'media',
    'telecommunications',
    'government',
    'nonprofit',
    'other'
);

-- ============================================================================
-- SOLUTIONS TABLE
-- ============================================================================

CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry solution_industry DEFAULT 'other',
    status solution_status DEFAULT 'draft',
    config JSONB DEFAULT '{}'::jsonb,
    -- rag_global_oracle_id will be added after oracles table
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT solutions_slug_unique UNIQUE (slug),
    CONSTRAINT solutions_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT solutions_name_not_empty CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT solutions_slug_length CHECK (LENGTH(slug) >= 3 AND LENGTH(slug) <= 100)
);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE solutions IS 'Top-level organizational units in SuperCore. Each solution provides complete multi-tenancy isolation.';
COMMENT ON COLUMN solutions.id IS 'Unique identifier (UUID v4)';
COMMENT ON COLUMN solutions.slug IS 'URL-friendly identifier for routing';
COMMENT ON COLUMN solutions.name IS 'Human-readable display name';
COMMENT ON COLUMN solutions.description IS 'Optional detailed description';
COMMENT ON COLUMN solutions.industry IS 'Industry classification';
COMMENT ON COLUMN solutions.status IS 'Lifecycle status';
COMMENT ON COLUMN solutions.config IS 'Extensible JSONB configuration';
COMMENT ON COLUMN solutions.deleted_at IS 'Soft delete timestamp';

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE UNIQUE INDEX idx_solutions_slug ON solutions(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_status ON solutions(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_industry ON solutions(industry) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_created_at ON solutions(created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_solutions_active ON solutions(id) WHERE status = 'active' AND deleted_at IS NULL;
CREATE INDEX idx_solutions_config ON solutions USING GIN(config jsonb_path_ops);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER solutions_updated_at_trigger
    BEFORE UPDATE ON solutions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER solutions_prevent_hard_delete
    BEFORE DELETE ON solutions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_hard_delete();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS solutions_prevent_hard_delete ON solutions;
DROP TRIGGER IF EXISTS solutions_updated_at_trigger ON solutions;
DROP TABLE IF EXISTS solutions CASCADE;
DROP TYPE IF EXISTS solution_industry;
DROP TYPE IF EXISTS solution_status;

-- +goose StatementEnd
