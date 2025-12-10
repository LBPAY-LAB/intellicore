-- ============================================================================
-- SUPERCORE DATABASE SCHEMA - Phase 1 Foundation
-- ============================================================================
-- This schema implements the Universal Entity Management Machine
-- Everything is an object: data, rules, policies, integrations, logic
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- TABLE 1: object_definitions (The Genome - DNA of the System)
-- ============================================================================
-- This table stores the "blueprints" or "DNA" for all objects in the system.
-- Each object_definition is a template from which instances are created.
-- ============================================================================

CREATE TABLE object_definitions (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,  -- Machine name (e.g., 'conta_corrente')
    display_name VARCHAR(200) NOT NULL,  -- Human name (e.g., 'Conta Corrente PF')
    description TEXT,
    version INT DEFAULT 1,

    -- THE SCHEMA (Structure) - JSON Schema Draft 7
    -- Defines what fields an instance must/can have
    schema JSONB NOT NULL,

    -- THE RULES (Behavior) - Array of validation rules
    -- References to validation_rules table or inline rules
    rules JSONB DEFAULT '[]'::jsonb,

    -- THE LIFECYCLE (Finite State Machine)
    -- Defines allowed states and transitions
    states JSONB DEFAULT '{
        "initial": "DRAFT",
        "states": ["DRAFT", "ACTIVE", "SUSPENDED", "CLOSED"],
        "transitions": [
            {"from": "DRAFT", "to": "ACTIVE", "condition": "all_validations_pass"},
            {"from": "ACTIVE", "to": "SUSPENDED", "condition": null},
            {"from": "SUSPENDED", "to": "ACTIVE", "condition": null},
            {"from": "ACTIVE", "to": "CLOSED", "condition": null}
        ]
    }'::jsonb,

    -- UI HINTS (Presentation Layer)
    -- Instructions for rendering forms and displays
    ui_hints JSONB DEFAULT '{
        "form_layout": "vertical",
        "field_order": [],
        "conditional_fields": [],
        "field_widgets": {}
    }'::jsonb,

    -- ALLOWED RELATIONSHIPS
    -- Defines what relationships this object can have
    relationships JSONB DEFAULT '[]'::jsonb,

    -- CATEGORIZATION
    -- Helps organize different types of object_definitions
    category VARCHAR(50) DEFAULT 'BUSINESS_ENTITY',
    -- Categories: BUSINESS_ENTITY, RULE, POLICY, INTEGRATION, LOGIC

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    is_active BOOLEAN DEFAULT true,

    -- Constraints
    CONSTRAINT valid_category CHECK (
        category IN (
            'BUSINESS_ENTITY',  -- Accounts, customers, transactions
            'RULE',             -- BACEN regulations, validation rules
            'POLICY',           -- Internal policies, risk policies
            'INTEGRATION',      -- TigerBeetle, BACEN-SPI, Data Rudder
            'LOGIC'             -- Custom algorithms, business logic
        )
    )
);

-- Indexes for object_definitions
CREATE INDEX idx_object_definitions_name ON object_definitions(name);
CREATE INDEX idx_object_definitions_category ON object_definitions(category);
CREATE INDEX idx_object_definitions_active ON object_definitions(is_active);
CREATE INDEX idx_object_definitions_schema_gin ON object_definitions USING gin(schema);

-- ============================================================================
-- TABLE 2: instances (The Living Cells)
-- ============================================================================
-- This table stores actual instances created from object_definitions.
-- Each instance is a "living cell" with data validated against its schema.
-- ============================================================================

CREATE TABLE instances (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_definition_id UUID NOT NULL REFERENCES object_definitions(id) ON DELETE RESTRICT,

    -- THE DATA (Flexible, validated against schema)
    -- This is the actual data for this instance
    data JSONB NOT NULL,

    -- CURRENT STATE (From FSM)
    -- Tracks where this instance is in its lifecycle
    current_state VARCHAR(50) NOT NULL,
    state_history JSONB DEFAULT '[]'::jsonb,  -- Array of {state, timestamp, user, reason}

    -- VERSION CONTROL
    version INT DEFAULT 1,

    -- METADATA
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),

    -- SOFT DELETE
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(100),

    -- FULL TEXT SEARCH
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('portuguese', coalesce(data::text, ''))
    ) STORED
);

-- Indexes for instances
CREATE INDEX idx_instances_object_definition ON instances(object_definition_id);
CREATE INDEX idx_instances_current_state ON instances(current_state);
CREATE INDEX idx_instances_created_at ON instances(created_at DESC);
CREATE INDEX idx_instances_is_deleted ON instances(is_deleted) WHERE is_deleted = false;
CREATE INDEX idx_instances_data_gin ON instances USING gin(data);
CREATE INDEX idx_instances_search ON instances USING gin(search_vector);

-- Composite index for common queries
CREATE INDEX idx_instances_def_state ON instances(object_definition_id, current_state)
    WHERE is_deleted = false;

-- ============================================================================
-- TABLE 3: relationships (The Synapses - Neural Connections)
-- ============================================================================
-- This table stores relationships between instances.
-- It creates a directed graph where instances are nodes and relationships are edges.
-- ============================================================================

CREATE TABLE relationships (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relationship_type VARCHAR(100) NOT NULL,  -- e.g., 'OWNS', 'BELONGS_TO', 'TRANSACTS_WITH'

    -- THE CONNECTION
    source_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    target_instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,

    -- PROPERTIES (Metadata about the relationship)
    -- Can store weight, labels, attributes, etc.
    properties JSONB DEFAULT '{}'::jsonb,

    -- TEMPORAL VALIDITY
    -- Relationships can be time-bound
    valid_from TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,

    -- METADATA
    created_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),

    -- Prevent duplicate relationships
    CONSTRAINT unique_relationship UNIQUE(relationship_type, source_instance_id, target_instance_id),

    -- Prevent self-loops (optional - remove if self-loops are valid)
    CONSTRAINT no_self_loops CHECK (source_instance_id != target_instance_id)
);

-- Indexes for relationships
CREATE INDEX idx_relationships_type ON relationships(relationship_type);
CREATE INDEX idx_relationships_source ON relationships(source_instance_id);
CREATE INDEX idx_relationships_target ON relationships(target_instance_id);
CREATE INDEX idx_relationships_valid ON relationships(valid_from, valid_until);
CREATE INDEX idx_relationships_properties_gin ON relationships USING gin(properties);

-- Composite index for graph traversal
CREATE INDEX idx_relationships_graph ON relationships(source_instance_id, relationship_type);

-- ============================================================================
-- TABLE 4: validation_rules (The Rule Library)
-- ============================================================================
-- This table stores reusable validation rules.
-- Rules can be referenced by object_definitions.
-- ============================================================================

CREATE TABLE validation_rules (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200),
    description TEXT,

    -- RULE TYPE
    rule_type VARCHAR(50) NOT NULL,
    -- Types: 'regex', 'function', 'api_call', 'sql_query', 'composite'

    -- RULE CONFIGURATION
    -- Structure varies by rule_type
    config JSONB NOT NULL,

    -- SYSTEM vs CUSTOM
    is_system BOOLEAN DEFAULT false,  -- System rules can't be deleted

    -- METADATA
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(100),

    -- Constraints
    CONSTRAINT valid_rule_type CHECK (
        rule_type IN ('regex', 'function', 'api_call', 'sql_query', 'composite')
    )
);

-- Indexes for validation_rules
CREATE INDEX idx_validation_rules_type ON validation_rules(rule_type);
CREATE INDEX idx_validation_rules_system ON validation_rules(is_system);

-- ============================================================================
-- TABLE 5: audit_log (The Memory - System Chronicle)
-- ============================================================================
-- This table stores all changes for compliance and debugging.
-- ============================================================================

CREATE TABLE audit_log (
    -- Identity
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- WHAT CHANGED
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,  -- INSERT, UPDATE, DELETE

    -- THE CHANGE
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],

    -- WHO AND WHEN
    changed_at TIMESTAMP DEFAULT NOW(),
    changed_by VARCHAR(100),

    -- CONTEXT
    ip_address INET,
    user_agent TEXT,
    request_id UUID
);

-- Indexes for audit_log
CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log(changed_at DESC);
CREATE INDEX idx_audit_log_changed_by ON audit_log(changed_by);

-- Partition by month for performance (optional - can be added later)
-- CREATE TABLE audit_log_y2024m12 PARTITION OF audit_log
--     FOR VALUES FROM ('2024-12-01') TO ('2025-01-01');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_object_definitions_updated_at
    BEFORE UPDATE ON object_definitions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instances_updated_at
    BEFORE UPDATE ON instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_rules_updated_at
    BEFORE UPDATE ON validation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for audit logging (instances table)
CREATE OR REPLACE FUNCTION audit_instances_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values, changed_by)
        VALUES ('instances', OLD.id, 'DELETE', row_to_json(OLD), OLD.updated_by);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_log (table_name, record_id, operation, old_values, new_values, changed_by)
        VALUES ('instances', NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), NEW.updated_by);
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_log (table_name, record_id, operation, new_values, changed_by)
        VALUES ('instances', NEW.id, 'INSERT', row_to_json(NEW), NEW.created_by);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_instances
    AFTER INSERT OR UPDATE OR DELETE ON instances
    FOR EACH ROW
    EXECUTE FUNCTION audit_instances_changes();

-- ============================================================================
-- COMMENTS (Documentation)
-- ============================================================================

COMMENT ON TABLE object_definitions IS 'The DNA: Blueprints for all objects in the system';
COMMENT ON TABLE instances IS 'The Cells: Living entities created from object_definitions';
COMMENT ON TABLE relationships IS 'The Synapses: Connections between instances forming a graph';
COMMENT ON TABLE validation_rules IS 'The Rule Library: Reusable validation rules';
COMMENT ON TABLE audit_log IS 'The Memory: Complete audit trail of all changes';

COMMENT ON COLUMN object_definitions.schema IS 'JSON Schema Draft 7 defining instance structure';
COMMENT ON COLUMN object_definitions.states IS 'Finite State Machine configuration';
COMMENT ON COLUMN object_definitions.ui_hints IS 'Instructions for UI rendering';
COMMENT ON COLUMN instances.data IS 'Actual instance data validated against schema';
COMMENT ON COLUMN instances.current_state IS 'Current FSM state';
COMMENT ON COLUMN relationships.properties IS 'Metadata about the relationship (weight, labels, etc.)';

-- ============================================================================
-- GRANT PERMISSIONS (For application user)
-- ============================================================================

-- Create application user (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'supercore_app') THEN
        CREATE USER supercore_app WITH PASSWORD 'change_me_in_production';
    END IF;
END
$$;

-- Grant permissions
GRANT CONNECT ON DATABASE supercore TO supercore_app;
GRANT USAGE ON SCHEMA public TO supercore_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO supercore_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO supercore_app;

-- Grant for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO supercore_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO supercore_app;
