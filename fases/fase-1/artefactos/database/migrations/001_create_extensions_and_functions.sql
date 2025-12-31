-- +goose Up
-- +goose StatementBegin

-- ============================================================================
-- Migration 001: Extensions and Common Functions
-- ============================================================================
-- Description: Creates required PostgreSQL extensions and common utility
--              functions used across all tables.
--
-- Extensions:
--   - uuid-ossp: UUID generation
--   - pgcrypto: Cryptographic functions
--   - pg_trgm: Trigram similarity for fuzzy search
--   - vector: pgvector for embeddings (if available)
--
-- Common Functions:
--   - update_updated_at_column: Auto-update updated_at timestamp
--   - prevent_hard_delete: Enforce soft delete policy
--
-- Version: 1.0.0
-- Author: Backend Architect (Database Specialist)
-- Date: 2025-12-30
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Try to enable pgvector if available (optional, for embeddings)
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "vector";
EXCEPTION
    WHEN undefined_file THEN
        RAISE NOTICE 'pgvector extension not available. Embeddings will be stored in Qdrant only.';
END
$$;

-- ============================================================================
-- COMMON UTILITY FUNCTIONS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates updated_at timestamp on row update';

-- Prevent hard delete (enforce soft delete policy)
CREATE OR REPLACE FUNCTION prevent_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Hard delete is not allowed. Use soft delete by setting deleted_at timestamp.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION prevent_hard_delete IS 'Prevents hard deletion of records, enforcing soft delete policy';

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP FUNCTION IF EXISTS prevent_hard_delete();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Note: Extensions are not dropped to avoid breaking other databases on same cluster
-- DROP EXTENSION IF EXISTS "vector";
-- DROP EXTENSION IF EXISTS "pg_trgm";
-- DROP EXTENSION IF EXISTS "pgcrypto";
-- DROP EXTENSION IF EXISTS "uuid-ossp";

-- +goose StatementEnd
