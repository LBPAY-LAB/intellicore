-- Criar database para Keycloak
CREATE DATABASE keycloak;

-- Criar extensões no database principal
\c lbpay;

-- Extensão para fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Extensão para full-text search
CREATE EXTENSION IF NOT EXISTS btree_gin;

-- Extensão para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Comentário
COMMENT ON DATABASE lbpay IS 'LBPay Universal Meta-Modeling Platform';
