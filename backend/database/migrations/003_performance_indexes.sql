-- Performance Optimization Indexes
-- This migration adds optimized indexes for common query patterns

-- Composite indexes for common filter combinations on object_definitions
CREATE INDEX IF NOT EXISTS idx_object_definitions_category_active
    ON object_definitions(category, is_active)
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_object_definitions_active_created
    ON object_definitions(is_active, created_at DESC)
    WHERE is_active = true;

-- Composite indexes for instances queries
CREATE INDEX IF NOT EXISTS idx_instances_objdef_deleted
    ON instances(object_definition_id, is_deleted)
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_instances_objdef_state
    ON instances(object_definition_id, current_state)
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_instances_deleted_created
    ON instances(is_deleted, created_at DESC)
    WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_instances_objdef_created
    ON instances(object_definition_id, created_at DESC)
    WHERE is_deleted = false;

-- Index for state history queries (covers common state filtering)
CREATE INDEX IF NOT EXISTS idx_instances_state_deleted
    ON instances(current_state, is_deleted)
    WHERE is_deleted = false;

-- JSONB path indexes for common data field queries
-- These support queries like: WHERE data @> '{"status": "active"}'
CREATE INDEX IF NOT EXISTS idx_instances_data_path_ops
    ON instances USING GIN (data jsonb_path_ops);

-- Additional GIN index for object_definitions relationships
CREATE INDEX IF NOT EXISTS idx_object_definitions_relationships
    ON object_definitions USING GIN (relationships jsonb_path_ops);

-- Index for faster UUID lookups in embeddings
CREATE INDEX IF NOT EXISTS idx_embeddings_object_type_id
    ON embeddings(object_type, object_id);

-- Composite index for common embedding queries with filters
CREATE INDEX IF NOT EXISTS idx_embeddings_type_metadata
    ON embeddings USING GIN (object_type, metadata);

-- Add tables for relationships and validation_rules if they exist
-- Assuming you have a relationships table (from relationship handler)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'relationships') THEN
        CREATE INDEX IF NOT EXISTS idx_relationships_source_instance
            ON relationships(source_instance_id, is_active)
            WHERE is_active = true;

        CREATE INDEX IF NOT EXISTS idx_relationships_target_instance
            ON relationships(target_instance_id, is_active)
            WHERE is_active = true;

        CREATE INDEX IF NOT EXISTS idx_relationships_type
            ON relationships(relationship_type, is_active)
            WHERE is_active = true;
    END IF;
END
$$;

-- Assuming you have a validation_rules table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'validation_rules') THEN
        CREATE INDEX IF NOT EXISTS idx_validation_rules_objdef
            ON validation_rules(object_definition_id, is_active)
            WHERE is_active = true;

        CREATE INDEX IF NOT EXISTS idx_validation_rules_type
            ON validation_rules(rule_type, is_active)
            WHERE is_active = true;
    END IF;
END
$$;

-- Covering index for object_definitions list queries
-- This includes most frequently accessed columns to avoid table lookups
CREATE INDEX IF NOT EXISTS idx_object_definitions_list_covering
    ON object_definitions(created_at DESC)
    INCLUDE (id, name, display_name, category, is_active)
    WHERE is_active = true;

-- Covering index for instances list queries
CREATE INDEX IF NOT EXISTS idx_instances_list_covering
    ON instances(created_at DESC)
    INCLUDE (id, object_definition_id, current_state, version)
    WHERE is_deleted = false;

-- Analyze tables to update statistics for query planner
ANALYZE object_definitions;
ANALYZE instances;
ANALYZE embeddings;

-- Comments for documentation
COMMENT ON INDEX idx_object_definitions_category_active IS 'Optimizes filtering by category and active status';
COMMENT ON INDEX idx_instances_objdef_deleted IS 'Optimizes queries filtering instances by object definition';
COMMENT ON INDEX idx_instances_data_path_ops IS 'Optimizes JSONB containment queries using path operators';
COMMENT ON INDEX idx_embeddings_type_metadata IS 'Optimizes semantic search with metadata filters';
