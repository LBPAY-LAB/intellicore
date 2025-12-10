-- Initial schema for SuperCore Meta-Modeling System
-- This migration creates the foundational tables for object definitions and instances

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Object Definitions table (the "DNA" or "blueprints")
CREATE TABLE object_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    version INTEGER NOT NULL DEFAULT 1,
    schema JSONB NOT NULL,
    rules JSONB,
    states JSONB,
    ui_hints JSONB,
    relationships JSONB,
    category VARCHAR(50) NOT NULL CHECK (category IN ('BUSINESS_ENTITY', 'RULE', 'POLICY', 'INTEGRATION', 'LOGIC')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- Instances table (the "living cells")
CREATE TABLE instances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    object_definition_id UUID NOT NULL REFERENCES object_definitions(id),
    data JSONB NOT NULL,
    current_state VARCHAR(100) NOT NULL DEFAULT 'created',
    state_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by VARCHAR(255),
    updated_by VARCHAR(255),
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP,
    deleted_by VARCHAR(255)
);

-- Indexes for performance
CREATE INDEX idx_object_definitions_name ON object_definitions(name);
CREATE INDEX idx_object_definitions_category ON object_definitions(category);
CREATE INDEX idx_object_definitions_is_active ON object_definitions(is_active);

CREATE INDEX idx_instances_object_definition_id ON instances(object_definition_id);
CREATE INDEX idx_instances_current_state ON instances(current_state);
CREATE INDEX idx_instances_is_deleted ON instances(is_deleted);
CREATE INDEX idx_instances_created_at ON instances(created_at);

-- GIN indexes for JSONB columns to enable efficient queries
CREATE INDEX idx_object_definitions_schema ON object_definitions USING GIN (schema);
CREATE INDEX idx_object_definitions_rules ON object_definitions USING GIN (rules);
CREATE INDEX idx_instances_data ON instances USING GIN (data);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp trigger to tables
CREATE TRIGGER update_object_definitions_updated_at
    BEFORE UPDATE ON object_definitions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instances_updated_at
    BEFORE UPDATE ON instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
