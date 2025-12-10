package rag

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"backend/internal/models"
)

// SQLLayer implements SQL-based search for the RAG system
// This is the first layer of the trimodal RAG (SQL + Graph + Vector)
type SQLLayer struct {
	pool *pgxpool.Pool
}

// NewSQLLayer creates a new SQL layer for RAG
func NewSQLLayer(pool *pgxpool.Pool) *SQLLayer {
	return &SQLLayer{pool: pool}
}

// SearchFilters represents common search filters
type SearchFilters struct {
	Category     *string
	IsActive     *bool
	CurrentState *string
	Limit        int
	Offset       int
}

// ObjectDefinitionResult represents a search result for object definitions
type ObjectDefinitionResult struct {
	ObjectDefinition models.ObjectDefinition `json:"object_definition"`
	Rank             float32                 `json:"rank"` // Relevance score from full-text search
	MatchedFields    []string                `json:"matched_fields"`
}

// InstanceResult represents a search result for instances
type InstanceResult struct {
	Instance      models.Instance `json:"instance"`
	Rank          float32         `json:"rank"`
	MatchedFields []string        `json:"matched_fields"`
}

// RelationshipResult represents a search result for relationships
type RelationshipResult struct {
	Relationship  models.Relationship `json:"relationship"`
	SourceName    *string             `json:"source_name,omitempty"`
	TargetName    *string             `json:"target_name,omitempty"`
}

// SearchObjectDefinitions performs full-text search on object definitions
// Uses PostgreSQL's tsvector for intelligent text search
func (s *SQLLayer) SearchObjectDefinitions(ctx context.Context, query string, filters SearchFilters) ([]ObjectDefinitionResult, error) {
	// Set default limit if not provided
	if filters.Limit <= 0 {
		filters.Limit = 20
	}
	if filters.Limit > 100 {
		filters.Limit = 100
	}

	// Build the SQL query with full-text search
	var sqlBuilder strings.Builder
	sqlBuilder.WriteString(`
		SELECT
			id, name, display_name, description, version, schema, rules, states,
			ui_hints, relationships, category, created_at, updated_at, created_by, is_active,
			ts_rank(search_vector, plainto_tsquery('english', $1)) as rank,
			ARRAY[]::text[] as matched_fields
		FROM object_definitions
		WHERE 1=1
	`)

	args := []interface{}{query}
	argCount := 1

	// Add full-text search condition if query is provided
	if strings.TrimSpace(query) != "" {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND search_vector @@ plainto_tsquery('english', $%d)", argCount))
		args = append(args, query)
	}

	// Add filters
	if filters.Category != nil && *filters.Category != "" {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND category = $%d", argCount))
		args = append(args, *filters.Category)
	}

	if filters.IsActive != nil {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND is_active = $%d", argCount))
		args = append(args, *filters.IsActive)
	}

	// Order by relevance
	sqlBuilder.WriteString(" ORDER BY rank DESC, created_at DESC")

	// Add pagination
	argCount++
	sqlBuilder.WriteString(fmt.Sprintf(" LIMIT $%d", argCount))
	args = append(args, filters.Limit)

	if filters.Offset > 0 {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" OFFSET $%d", argCount))
		args = append(args, filters.Offset)
	}

	// Execute query
	rows, err := s.pool.Query(ctx, sqlBuilder.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to search object definitions: %w", err)
	}
	defer rows.Close()

	var results []ObjectDefinitionResult
	for rows.Next() {
		var result ObjectDefinitionResult
		var od models.ObjectDefinition

		err := rows.Scan(
			&od.ID, &od.Name, &od.DisplayName, &od.Description, &od.Version,
			&od.Schema, &od.Rules, &od.States, &od.UIHints, &od.Relationships,
			&od.Category, &od.CreatedAt, &od.UpdatedAt, &od.CreatedBy, &od.IsActive,
			&result.Rank, &result.MatchedFields,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan object definition: %w", err)
		}

		result.ObjectDefinition = od

		// Identify which fields matched the query
		if strings.TrimSpace(query) != "" {
			result.MatchedFields = s.identifyMatchedFields(query, od)
		}

		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating object definitions: %w", err)
	}

	return results, nil
}

// SearchInstances performs full-text search on instances including JSONB data
// Supports complex JSONB queries for advanced filtering
func (s *SQLLayer) SearchInstances(ctx context.Context, query string, objectDefID *uuid.UUID, filters SearchFilters) ([]InstanceResult, error) {
	// Set default limit
	if filters.Limit <= 0 {
		filters.Limit = 20
	}
	if filters.Limit > 100 {
		filters.Limit = 100
	}

	var sqlBuilder strings.Builder
	sqlBuilder.WriteString(`
		SELECT
			i.id, i.object_definition_id, i.data, i.current_state, i.state_history,
			i.version, i.created_at, i.updated_at, i.created_by, i.updated_by,
			i.is_deleted, i.deleted_at, i.deleted_by,
			COALESCE(ts_rank(i.search_vector, plainto_tsquery('english', $1)), 0) as rank,
			ARRAY[]::text[] as matched_fields
		FROM instances i
		WHERE i.is_deleted = false
	`)

	args := []interface{}{query}
	argCount := 1

	// Add full-text search on JSONB data if query is provided
	if strings.TrimSpace(query) != "" {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND i.search_vector @@ plainto_tsquery('english', $%d)", argCount))
		args = append(args, query)
	}

	// Filter by object definition ID
	if objectDefID != nil {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND i.object_definition_id = $%d", argCount))
		args = append(args, *objectDefID)
	}

	// Filter by current state
	if filters.CurrentState != nil && *filters.CurrentState != "" {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND i.current_state = $%d", argCount))
		args = append(args, *filters.CurrentState)
	}

	// Order by relevance
	sqlBuilder.WriteString(" ORDER BY rank DESC, i.created_at DESC")

	// Add pagination
	argCount++
	sqlBuilder.WriteString(fmt.Sprintf(" LIMIT $%d", argCount))
	args = append(args, filters.Limit)

	if filters.Offset > 0 {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" OFFSET $%d", argCount))
		args = append(args, filters.Offset)
	}

	// Execute query
	rows, err := s.pool.Query(ctx, sqlBuilder.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to search instances: %w", err)
	}
	defer rows.Close()

	var results []InstanceResult
	for rows.Next() {
		var result InstanceResult
		var inst models.Instance

		err := rows.Scan(
			&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState,
			&inst.StateHistory, &inst.Version, &inst.CreatedAt, &inst.UpdatedAt,
			&inst.CreatedBy, &inst.UpdatedBy, &inst.IsDeleted, &inst.DeletedAt,
			&inst.DeletedBy, &result.Rank, &result.MatchedFields,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan instance: %w", err)
		}

		result.Instance = inst

		// Identify matched fields in JSONB data
		if strings.TrimSpace(query) != "" {
			result.MatchedFields = s.identifyMatchedFieldsInInstance(query, inst)
		}

		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating instances: %w", err)
	}

	return results, nil
}

// SearchInstancesByJSONB performs advanced JSONB queries on instance data
// Example: Find all instances where data->'balance' > 1000
func (s *SQLLayer) SearchInstancesByJSONB(ctx context.Context, jsonbPath string, operator string, value interface{}, filters SearchFilters) ([]InstanceResult, error) {
	// Set default limit
	if filters.Limit <= 0 {
		filters.Limit = 20
	}
	if filters.Limit > 100 {
		filters.Limit = 100
	}

	// Build JSONB query
	// Example: data->>'balance' > $1
	var sqlBuilder strings.Builder
	sqlBuilder.WriteString(`
		SELECT
			i.id, i.object_definition_id, i.data, i.current_state, i.state_history,
			i.version, i.created_at, i.updated_at, i.created_by, i.updated_by,
			i.is_deleted, i.deleted_at, i.deleted_by,
			0 as rank,
			ARRAY[]::text[] as matched_fields
		FROM instances i
		WHERE i.is_deleted = false
	`)

	args := []interface{}{}
	argCount := 0

	// Add JSONB condition
	// Sanitize operator to prevent SQL injection
	allowedOperators := map[string]bool{
		"=": true, ">": true, "<": true, ">=": true, "<=": true, "!=": true,
		"@>": true, "<@": true, "?": true, "?|": true, "?&": true,
	}

	if !allowedOperators[operator] {
		return nil, fmt.Errorf("invalid operator: %s", operator)
	}

	argCount++
	// Use ->> for text extraction or -> for JSON extraction
	if operator == "@>" || operator == "<@" {
		sqlBuilder.WriteString(fmt.Sprintf(" AND i.data %s $%d", operator, argCount))
	} else {
		sqlBuilder.WriteString(fmt.Sprintf(" AND i.data->>'%s' %s $%d", jsonbPath, operator, argCount))
	}
	args = append(args, value)

	// Apply additional filters
	if filters.CurrentState != nil && *filters.CurrentState != "" {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND i.current_state = $%d", argCount))
		args = append(args, *filters.CurrentState)
	}

	// Order by creation date
	sqlBuilder.WriteString(" ORDER BY i.created_at DESC")

	// Add pagination
	argCount++
	sqlBuilder.WriteString(fmt.Sprintf(" LIMIT $%d", argCount))
	args = append(args, filters.Limit)

	if filters.Offset > 0 {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" OFFSET $%d", argCount))
		args = append(args, filters.Offset)
	}

	// Execute query
	rows, err := s.pool.Query(ctx, sqlBuilder.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to search instances by JSONB: %w", err)
	}
	defer rows.Close()

	var results []InstanceResult
	for rows.Next() {
		var result InstanceResult
		var inst models.Instance

		err := rows.Scan(
			&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState,
			&inst.StateHistory, &inst.Version, &inst.CreatedAt, &inst.UpdatedAt,
			&inst.CreatedBy, &inst.UpdatedBy, &inst.IsDeleted, &inst.DeletedAt,
			&inst.DeletedBy, &result.Rank, &result.MatchedFields,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan instance: %w", err)
		}

		result.Instance = inst
		result.MatchedFields = []string{jsonbPath}

		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating instances: %w", err)
	}

	return results, nil
}

// SearchRelationships searches for relationships between instances
func (s *SQLLayer) SearchRelationships(ctx context.Context, fromID *uuid.UUID, toID *uuid.UUID, relType *string, filters SearchFilters) ([]RelationshipResult, error) {
	// Set default limit
	if filters.Limit <= 0 {
		filters.Limit = 20
	}
	if filters.Limit > 100 {
		filters.Limit = 100
	}

	var sqlBuilder strings.Builder
	sqlBuilder.WriteString(`
		SELECT
			r.id, r.relationship_type, r.source_instance_id, r.target_instance_id,
			r.properties, r.valid_from, r.valid_until, r.created_at, r.created_by,
			NULL as source_name, NULL as target_name
		FROM relationships r
		WHERE 1=1
	`)

	args := []interface{}{}
	argCount := 0

	// Filter by source instance
	if fromID != nil {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND r.source_instance_id = $%d", argCount))
		args = append(args, *fromID)
	}

	// Filter by target instance
	if toID != nil {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND r.target_instance_id = $%d", argCount))
		args = append(args, *toID)
	}

	// Filter by relationship type
	if relType != nil && *relType != "" {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" AND r.relationship_type = $%d", argCount))
		args = append(args, *relType)
	}

	// Filter by validity (only active relationships)
	now := time.Now()
	argCount++
	sqlBuilder.WriteString(fmt.Sprintf(" AND (r.valid_from IS NULL OR r.valid_from <= $%d)", argCount))
	args = append(args, now)

	argCount++
	sqlBuilder.WriteString(fmt.Sprintf(" AND (r.valid_until IS NULL OR r.valid_until >= $%d)", argCount))
	args = append(args, now)

	// Order by creation date
	sqlBuilder.WriteString(" ORDER BY r.created_at DESC")

	// Add pagination
	argCount++
	sqlBuilder.WriteString(fmt.Sprintf(" LIMIT $%d", argCount))
	args = append(args, filters.Limit)

	if filters.Offset > 0 {
		argCount++
		sqlBuilder.WriteString(fmt.Sprintf(" OFFSET $%d", argCount))
		args = append(args, filters.Offset)
	}

	// Execute query
	rows, err := s.pool.Query(ctx, sqlBuilder.String(), args...)
	if err != nil {
		return nil, fmt.Errorf("failed to search relationships: %w", err)
	}
	defer rows.Close()

	var results []RelationshipResult
	for rows.Next() {
		var result RelationshipResult
		var rel models.Relationship

		err := rows.Scan(
			&rel.ID, &rel.RelationshipType, &rel.SourceInstanceID, &rel.TargetInstanceID,
			&rel.Properties, &rel.ValidFrom, &rel.ValidUntil, &rel.CreatedAt, &rel.CreatedBy,
			&result.SourceName, &result.TargetName,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan relationship: %w", err)
		}

		result.Relationship = rel
		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating relationships: %w", err)
	}

	return results, nil
}

// UnifiedSearchResult combines all search results
type UnifiedSearchResult struct {
	ObjectDefinitions []ObjectDefinitionResult `json:"object_definitions"`
	Instances         []InstanceResult         `json:"instances"`
	Relationships     []RelationshipResult     `json:"relationships"`
	TotalResults      int                      `json:"total_results"`
	Query             string                   `json:"query"`
	ExecutionTimeMs   int64                    `json:"execution_time_ms"`
}

// UnifiedSearch performs a comprehensive search across all entities
func (s *SQLLayer) UnifiedSearch(ctx context.Context, query string, searchType string, filters SearchFilters) (*UnifiedSearchResult, error) {
	startTime := time.Now()

	result := &UnifiedSearchResult{
		Query:             query,
		ObjectDefinitions: []ObjectDefinitionResult{},
		Instances:         []InstanceResult{},
		Relationships:     []RelationshipResult{},
	}

	// Search based on type
	if searchType == "all" || searchType == "object_definitions" {
		objDefs, err := s.SearchObjectDefinitions(ctx, query, filters)
		if err != nil {
			return nil, fmt.Errorf("failed to search object definitions: %w", err)
		}
		result.ObjectDefinitions = objDefs
	}

	if searchType == "all" || searchType == "instances" {
		instances, err := s.SearchInstances(ctx, query, nil, filters)
		if err != nil {
			return nil, fmt.Errorf("failed to search instances: %w", err)
		}
		result.Instances = instances
	}

	if searchType == "all" || searchType == "relationships" {
		relationships, err := s.SearchRelationships(ctx, nil, nil, nil, filters)
		if err != nil {
			return nil, fmt.Errorf("failed to search relationships: %w", err)
		}
		result.Relationships = relationships
	}

	result.TotalResults = len(result.ObjectDefinitions) + len(result.Instances) + len(result.Relationships)
	result.ExecutionTimeMs = time.Since(startTime).Milliseconds()

	return result, nil
}

// Helper function to identify which fields matched the search query
func (s *SQLLayer) identifyMatchedFields(query string, od models.ObjectDefinition) []string {
	var matched []string
	queryLower := strings.ToLower(query)

	if strings.Contains(strings.ToLower(od.Name), queryLower) {
		matched = append(matched, "name")
	}
	if strings.Contains(strings.ToLower(od.DisplayName), queryLower) {
		matched = append(matched, "display_name")
	}
	if od.Description != nil && strings.Contains(strings.ToLower(*od.Description), queryLower) {
		matched = append(matched, "description")
	}

	return matched
}

// Helper function to identify matched fields in instance JSONB data
func (s *SQLLayer) identifyMatchedFieldsInInstance(query string, inst models.Instance) []string {
	var matched []string
	queryLower := strings.ToLower(query)

	// Parse JSONB data
	var data map[string]interface{}
	if err := json.Unmarshal(inst.Data, &data); err == nil {
		for key, value := range data {
			valueStr := fmt.Sprintf("%v", value)
			if strings.Contains(strings.ToLower(valueStr), queryLower) {
				matched = append(matched, fmt.Sprintf("data.%s", key))
			}
		}
	}

	if strings.Contains(strings.ToLower(inst.CurrentState), queryLower) {
		matched = append(matched, "current_state")
	}

	return matched
}

// GetRelatedInstances finds all instances related to a given instance
func (s *SQLLayer) GetRelatedInstances(ctx context.Context, instanceID uuid.UUID, relationshipType *string, depth int) ([]InstanceResult, error) {
	if depth <= 0 {
		depth = 1
	}
	if depth > 3 {
		depth = 3 // Limit depth to prevent performance issues
	}

	// Use recursive CTE to traverse relationships
	query := `
		WITH RECURSIVE related_instances AS (
			-- Base case: start with the given instance
			SELECT
				i.id, i.object_definition_id, i.data, i.current_state, i.state_history,
				i.version, i.created_at, i.updated_at, i.created_by, i.updated_by,
				i.is_deleted, i.deleted_at, i.deleted_by,
				0 as depth
			FROM instances i
			WHERE i.id = $1 AND i.is_deleted = false

			UNION

			-- Recursive case: find instances connected via relationships
			SELECT
				i.id, i.object_definition_id, i.data, i.current_state, i.state_history,
				i.version, i.created_at, i.updated_at, i.created_by, i.updated_by,
				i.is_deleted, i.deleted_at, i.deleted_by,
				ri.depth + 1
			FROM instances i
			INNER JOIN relationships r ON (i.id = r.target_instance_id OR i.id = r.source_instance_id)
			INNER JOIN related_instances ri ON (ri.id = r.source_instance_id OR ri.id = r.target_instance_id)
			WHERE i.is_deleted = false
				AND ri.depth < $2
				AND i.id != ri.id
	`

	args := []interface{}{instanceID, depth}
	argCount := 2

	if relationshipType != nil && *relationshipType != "" {
		argCount++
		query += fmt.Sprintf(" AND r.relationship_type = $%d", argCount)
		args = append(args, *relationshipType)
	}

	query += `
		)
		SELECT DISTINCT
			id, object_definition_id, data, current_state, state_history,
			version, created_at, updated_at, created_by, updated_by,
			is_deleted, deleted_at, deleted_by
		FROM related_instances
		WHERE id != $1
		ORDER BY created_at DESC
		LIMIT 50
	`

	rows, err := s.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to get related instances: %w", err)
	}
	defer rows.Close()

	var results []InstanceResult
	for rows.Next() {
		var result InstanceResult
		var inst models.Instance

		err := rows.Scan(
			&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState,
			&inst.StateHistory, &inst.Version, &inst.CreatedAt, &inst.UpdatedAt,
			&inst.CreatedBy, &inst.UpdatedBy, &inst.IsDeleted, &inst.DeletedAt,
			&inst.DeletedBy,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan related instance: %w", err)
		}

		result.Instance = inst
		result.Rank = 0
		result.MatchedFields = []string{"relationship"}

		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating related instances: %w", err)
	}

	return results, nil
}

// BatchSearch performs searches in parallel for better performance
func (s *SQLLayer) BatchSearch(ctx context.Context, queries []string, searchType string, filters SearchFilters) (map[string]*UnifiedSearchResult, error) {
	results := make(map[string]*UnifiedSearchResult)

	// Use goroutines for parallel execution
	type searchResult struct {
		query  string
		result *UnifiedSearchResult
		err    error
	}

	resultChan := make(chan searchResult, len(queries))

	// Launch searches in parallel
	for _, query := range queries {
		go func(q string) {
			result, err := s.UnifiedSearch(ctx, q, searchType, filters)
			resultChan <- searchResult{query: q, result: result, err: err}
		}(query)
	}

	// Collect results
	for i := 0; i < len(queries); i++ {
		sr := <-resultChan
		if sr.err != nil {
			return nil, fmt.Errorf("failed to search query '%s': %w", sr.query, sr.err)
		}
		results[sr.query] = sr.result
	}

	return results, nil
}
