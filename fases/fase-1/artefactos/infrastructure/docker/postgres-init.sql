-- ==============================================================================
-- PostgreSQL Initialization Script
-- ==============================================================================
-- This script runs BEFORE migrations in docker-entrypoint-initdb.d/
-- Purpose: Set up database, users, and basic configurations
--
-- Execution Order:
--   1. postgres-init.sql (this file) - Setup
--   2. 001_create_extensions_and_functions.sql - Migrations start here
-- ==============================================================================

-- Create supercore database if it doesn't exist (usually already created by docker env)
-- This is just a safety measure
SELECT 'CREATE DATABASE supercore_dev'
WHERE NOT EXISTS (
    SELECT FROM pg_database WHERE datname = 'supercore_dev'
)\gexec

-- Connect to supercore_dev database
\connect supercore_dev

-- ==============================================================================
-- Set Session Configuration (for migrations to work properly)
-- ==============================================================================
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = on;

-- ==============================================================================
-- Create Schema
-- ==============================================================================
CREATE SCHEMA IF NOT EXISTS public;

-- ==============================================================================
-- Grant Default Privileges
-- ==============================================================================
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO supercore;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO supercore;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO supercore;

GRANT ALL PRIVILEGES ON DATABASE supercore_dev TO supercore;
GRANT ALL PRIVILEGES ON SCHEMA public TO supercore;

-- ==============================================================================
-- Logging Configuration
-- ==============================================================================
-- Enable query logging for debugging (comment out in production)
-- ALTER DATABASE supercore_dev SET log_statement = 'all';
-- ALTER DATABASE supercore_dev SET log_duration = 'on';
-- ALTER DATABASE supercore_dev SET log_min_duration_statement = 1000;  -- Log queries > 1 second

-- ==============================================================================
-- Connection Pool Configuration (if using pgBouncer, these are guidelines)
-- ==============================================================================
-- These are application-level settings, not database settings
-- But documented here for reference:
--
-- pgBouncer pool settings:
--   pool_mode = transaction
--   max_client_conn = 1000
--   default_pool_size = 25
--   min_pool_size = 10

-- ==============================================================================
-- Application-Specific Settings
-- ==============================================================================

-- Set timezone to UTC for all timestamps
ALTER DATABASE supercore_dev SET timezone = 'UTC';

-- Enable JSON validation for JSON columns
-- (This will be used by migrations for object_definitions.definition JSONB column)

-- ==============================================================================
-- Ready for Migrations
-- ==============================================================================
-- The goose migrations will now run in order:
--   - 001_create_extensions_and_functions.sql
--   - 002_create_solutions.sql
--   - 003_create_oracles.sql
--   - ... etc
