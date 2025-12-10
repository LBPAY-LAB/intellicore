-- Migration: 007_performance_indexes
-- Description: Adiciona índices otimizados para queries comuns
-- Date: 2024-01-10

-- Índices para performance em queries comuns

-- Instances: busca por object_definition_id e state
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_objdef_state
ON instances(object_definition_id, current_state)
WHERE is_deleted = false;

-- Instances: busca por data JSONB (campos comuns)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_data_cpf
ON instances((data->>'cpf'))
WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_data_email
ON instances((data->>'email'))
WHERE is_deleted = false;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_data_cnpj
ON instances((data->>'cnpj'))
WHERE is_deleted = false;

-- Instances: ordenação por created_at (usado em listagens)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_created_at_desc
ON instances(created_at DESC)
WHERE is_deleted = false;

-- Instances: busca por updated_at (para sincronização)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_updated_at_desc
ON instances(updated_at DESC)
WHERE is_deleted = false;

-- Relationships: busca bidirecional otimizada
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relationships_source_type
ON relationships(source_instance_id, relationship_type);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relationships_target_type
ON relationships(target_instance_id, relationship_type);

-- Relationships: busca por validade temporal
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_relationships_validity
ON relationships(valid_from, valid_until)
WHERE valid_until IS NULL OR valid_until > NOW();

-- Object Definitions: busca por nome (pesquisa textual)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_object_definitions_name_trgm
ON object_definitions USING gin(name gin_trgm_ops)
WHERE is_active = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_object_definitions_display_name_trgm
ON object_definitions USING gin(display_name gin_trgm_ops)
WHERE is_active = true;

-- Object Definitions: busca por categoria
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_object_definitions_category
ON object_definitions(category)
WHERE is_active = true;

-- State History: busca por instance (para auditoria)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_state_history
ON instances USING gin(state_history jsonb_path_ops);

-- Validation Rules: busca por tipo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_validation_rules_type
ON validation_rules(rule_type)
WHERE is_system = true;

-- Instances: índice composto para queries complexas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_objdef_state_created
ON instances(object_definition_id, current_state, created_at DESC)
WHERE is_deleted = false;

-- Instances: índice GIN para busca full-text em data JSONB
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_instances_data_gin
ON instances USING gin(data jsonb_path_ops);

-- Estatísticas (importante para query planner)
ANALYZE instances;
ANALYZE relationships;
ANALYZE object_definitions;
ANALYZE validation_rules;

-- Comentários para documentação
COMMENT ON INDEX idx_instances_objdef_state IS 'Otimiza filtros por object_definition_id + current_state';
COMMENT ON INDEX idx_instances_data_cpf IS 'Otimiza busca de instâncias por CPF';
COMMENT ON INDEX idx_instances_data_email IS 'Otimiza busca de instâncias por email';
COMMENT ON INDEX idx_instances_created_at_desc IS 'Otimiza ordenação por data de criação';
COMMENT ON INDEX idx_relationships_source_type IS 'Otimiza navegação de relacionamentos a partir da origem';
COMMENT ON INDEX idx_relationships_target_type IS 'Otimiza navegação de relacionamentos inversos';
COMMENT ON INDEX idx_instances_data_gin IS 'Permite busca full-text em qualquer campo JSONB de data';
