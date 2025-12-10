package services

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lbpay/supercore/internal/models"
)

// RelationshipValidator provides validation logic for relationships
type RelationshipValidator struct {
	pool *pgxpool.Pool
}

// NewRelationshipValidator creates a new relationship validator
func NewRelationshipValidator(pool *pgxpool.Pool) *RelationshipValidator {
	return &RelationshipValidator{pool: pool}
}

// ValidateRelationship performs comprehensive validation of a relationship
func (v *RelationshipValidator) ValidateRelationship(ctx context.Context, req models.CreateRelationshipRequest) error {
	// 1. Validate that source and target instances exist and get their definitions
	sourceDefID, sourceDefName, err := v.getInstanceDefinition(ctx, req.SourceInstanceID)
	if err != nil {
		return models.RelationshipValidationError{
			Field:   "source_instance_id",
			Message: fmt.Sprintf("source instance not found: %v", err),
			Code:    models.ErrCodeInstanceNotFound,
		}
	}

	targetDefID, targetDefName, err := v.getInstanceDefinition(ctx, req.TargetInstanceID)
	if err != nil {
		return models.RelationshipValidationError{
			Field:   "target_instance_id",
			Message: fmt.Sprintf("target instance not found: %v", err),
			Code:    models.ErrCodeInstanceNotFound,
		}
	}

	// 2. Check for self-reference if needed
	if req.SourceInstanceID == req.TargetInstanceID {
		return models.RelationshipValidationError{
			Field:   "target_instance_id",
			Message: "cannot create relationship to self",
			Code:    models.ErrCodeSelfReference,
		}
	}

	// 3. Get allowed relationships configuration for source definition
	allowedRels, err := v.getAllowedRelationships(ctx, sourceDefID)
	if err != nil {
		return fmt.Errorf("failed to get allowed relationships: %w", err)
	}

	// 4. Validate relationship type is allowed
	allowedRel, err := v.validateRelationshipType(req.RelationshipType, targetDefName, allowedRels)
	if err != nil {
		return err
	}

	// 5. Validate cardinality constraints
	if err := v.validateCardinality(ctx, req, allowedRel); err != nil {
		return err
	}

	// 6. Check for cycles if not allowed
	if !allowedRel.AllowCycles {
		if err := v.detectCycle(ctx, req.SourceInstanceID, req.TargetInstanceID, req.RelationshipType); err != nil {
			return err
		}
	}

	return nil
}

// getInstanceDefinition retrieves the object definition ID and name for an instance
func (v *RelationshipValidator) getInstanceDefinition(ctx context.Context, instanceID uuid.UUID) (uuid.UUID, string, error) {
	var defID uuid.UUID
	var defName string

	query := `
		SELECT i.object_definition_id, od.name
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE i.id = $1 AND i.is_deleted = false
	`

	err := v.pool.QueryRow(ctx, query, instanceID).Scan(&defID, &defName)
	if err != nil {
		return uuid.Nil, "", err
	}

	return defID, defName, nil
}

// getAllowedRelationships retrieves the allowed relationships configuration
func (v *RelationshipValidator) getAllowedRelationships(ctx context.Context, defID uuid.UUID) ([]models.AllowedRelationship, error) {
	var relationshipsJSON json.RawMessage

	query := `SELECT relationships FROM object_definitions WHERE id = $1`
	err := v.pool.QueryRow(ctx, query, defID).Scan(&relationshipsJSON)
	if err != nil {
		return nil, err
	}

	// If no relationships defined, return empty array
	if len(relationshipsJSON) == 0 || string(relationshipsJSON) == "null" {
		return []models.AllowedRelationship{}, nil
	}

	var config models.AllowedRelationshipsConfig
	if err := json.Unmarshal(relationshipsJSON, &config); err != nil {
		return nil, fmt.Errorf("failed to parse relationships config: %w", err)
	}

	return config.AllowedRelationships, nil
}

// validateRelationshipType checks if the relationship type is allowed
func (v *RelationshipValidator) validateRelationshipType(
	relType string,
	targetDefName string,
	allowedRels []models.AllowedRelationship,
) (*models.AllowedRelationship, error) {
	for i := range allowedRels {
		rel := &allowedRels[i]
		if rel.Type == relType && rel.TargetObjectDefinition == targetDefName {
			return rel, nil
		}
	}

	return nil, models.RelationshipValidationError{
		Field:   "relationship_type",
		Message: fmt.Sprintf("relationship type '%s' to '%s' is not allowed", relType, targetDefName),
		Code:    models.ErrCodeRelationshipNotAllowed,
	}
}

// validateCardinality validates the cardinality constraints
func (v *RelationshipValidator) validateCardinality(
	ctx context.Context,
	req models.CreateRelationshipRequest,
	allowedRel *models.AllowedRelationship,
) error {
	switch allowedRel.Cardinality {
	case models.Cardinality1to1:
		return v.validateOneToOne(ctx, req)
	case models.Cardinality1toN:
		return v.validateOneToMany(ctx, req)
	case models.CardinalityNto1:
		return v.validateManyToOne(ctx, req)
	case models.CardinalityNtoM:
		// N:M has no cardinality restrictions
		return nil
	default:
		return models.RelationshipValidationError{
			Field:   "cardinality",
			Message: fmt.Sprintf("invalid cardinality type: %s", allowedRel.Cardinality),
			Code:    models.ErrCodeInvalidCardinality,
		}
	}
}

// validateOneToOne ensures both source and target can only have one relationship of this type
func (v *RelationshipValidator) validateOneToOne(ctx context.Context, req models.CreateRelationshipRequest) error {
	// Check if source already has this relationship type
	var sourceCount int
	err := v.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM relationships
		WHERE source_instance_id = $1 AND relationship_type = $2
	`, req.SourceInstanceID, req.RelationshipType).Scan(&sourceCount)
	if err != nil {
		return fmt.Errorf("failed to check source cardinality: %w", err)
	}

	if sourceCount > 0 {
		return models.RelationshipValidationError{
			Field:   "source_instance_id",
			Message: fmt.Sprintf("source instance already has a '%s' relationship (1:1 cardinality)", req.RelationshipType),
			Code:    models.ErrCodeCardinalityViolation,
		}
	}

	// Check if target already has this relationship type
	var targetCount int
	err = v.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM relationships
		WHERE target_instance_id = $1 AND relationship_type = $2
	`, req.TargetInstanceID, req.RelationshipType).Scan(&targetCount)
	if err != nil {
		return fmt.Errorf("failed to check target cardinality: %w", err)
	}

	if targetCount > 0 {
		return models.RelationshipValidationError{
			Field:   "target_instance_id",
			Message: fmt.Sprintf("target instance already has a '%s' relationship (1:1 cardinality)", req.RelationshipType),
			Code:    models.ErrCodeCardinalityViolation,
		}
	}

	return nil
}

// validateOneToMany ensures source can only have one relationship, but target can have multiple
func (v *RelationshipValidator) validateOneToMany(ctx context.Context, req models.CreateRelationshipRequest) error {
	// Check if source already has this relationship type
	var count int
	err := v.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM relationships
		WHERE source_instance_id = $1 AND relationship_type = $2
	`, req.SourceInstanceID, req.RelationshipType).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check source cardinality: %w", err)
	}

	if count > 0 {
		return models.RelationshipValidationError{
			Field:   "source_instance_id",
			Message: fmt.Sprintf("source instance already has a '%s' relationship (1:N cardinality)", req.RelationshipType),
			Code:    models.ErrCodeCardinalityViolation,
		}
	}

	return nil
}

// validateManyToOne ensures target can only have one relationship, but source can have multiple
func (v *RelationshipValidator) validateManyToOne(ctx context.Context, req models.CreateRelationshipRequest) error {
	// Check if target already has this relationship type
	var count int
	err := v.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM relationships
		WHERE target_instance_id = $1 AND relationship_type = $2
	`, req.TargetInstanceID, req.RelationshipType).Scan(&count)
	if err != nil {
		return fmt.Errorf("failed to check target cardinality: %w", err)
	}

	if count > 0 {
		return models.RelationshipValidationError{
			Field:   "target_instance_id",
			Message: fmt.Sprintf("target instance already has a '%s' relationship (N:1 cardinality)", req.RelationshipType),
			Code:    models.ErrCodeCardinalityViolation,
		}
	}

	return nil
}

// detectCycle uses DFS to detect cycles in the relationship graph
func (v *RelationshipValidator) detectCycle(
	ctx context.Context,
	sourceID uuid.UUID,
	targetID uuid.UUID,
	relType string,
) error {
	// Start from the target and see if we can reach the source
	// This would create a cycle
	visited := make(map[uuid.UUID]bool)

	hasCycle := v.dfs(ctx, targetID, sourceID, relType, visited)
	if hasCycle {
		return models.RelationshipValidationError{
			Field:   "target_instance_id",
			Message: fmt.Sprintf("creating this relationship would create a cycle (relationship type: %s)", relType),
			Code:    models.ErrCodeCycleDetected,
		}
	}

	return nil
}

// dfs performs depth-first search to detect cycles
func (v *RelationshipValidator) dfs(
	ctx context.Context,
	current uuid.UUID,
	target uuid.UUID,
	relType string,
	visited map[uuid.UUID]bool,
) bool {
	// If we reached the target, we found a cycle
	if current == target {
		return true
	}

	// If already visited, skip
	if visited[current] {
		return false
	}

	visited[current] = true

	// Get all outgoing relationships of the same type
	rows, err := v.pool.Query(ctx, `
		SELECT target_instance_id FROM relationships
		WHERE source_instance_id = $1 AND relationship_type = $2
	`, current, relType)
	if err != nil {
		return false
	}
	defer rows.Close()

	for rows.Next() {
		var nextID uuid.UUID
		if err := rows.Scan(&nextID); err != nil {
			continue
		}

		if v.dfs(ctx, nextID, target, relType, visited) {
			return true
		}
	}

	return false
}

// GetCascadeDeleteIDs returns all relationship IDs that should be cascade deleted
func (v *RelationshipValidator) GetCascadeDeleteIDs(
	ctx context.Context,
	relationshipID uuid.UUID,
) ([]uuid.UUID, error) {
	// First, get the relationship details
	var sourceID, targetID uuid.UUID
	var relType string

	err := v.pool.QueryRow(ctx, `
		SELECT source_instance_id, target_instance_id, relationship_type
		FROM relationships WHERE id = $1
	`, relationshipID).Scan(&sourceID, &targetID, &relType)
	if err != nil {
		return nil, err
	}

	// Get source definition and check cascade rules
	sourceDefID, _, err := v.getInstanceDefinition(ctx, sourceID)
	if err != nil {
		return nil, err
	}

	allowedRels, err := v.getAllowedRelationships(ctx, sourceDefID)
	if err != nil {
		return nil, err
	}

	// Find if this relationship type has cascade delete enabled
	cascadeEnabled := false
	for _, rel := range allowedRels {
		if rel.Type == relType && rel.CascadeDelete {
			cascadeEnabled = true
			break
		}
	}

	if !cascadeEnabled {
		return []uuid.UUID{}, nil
	}

	// Get all dependent relationships (relationships that have targetID as source)
	var dependentIDs []uuid.UUID
	rows, err := v.pool.Query(ctx, `
		SELECT id FROM relationships
		WHERE source_instance_id = $1
	`, targetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			continue
		}
		dependentIDs = append(dependentIDs, id)
	}

	return dependentIDs, nil
}

// ValidateRelationshipDeletion checks if a relationship can be deleted
func (v *RelationshipValidator) ValidateRelationshipDeletion(
	ctx context.Context,
	relationshipID uuid.UUID,
	cascade bool,
) error {
	// Check if relationship exists
	var exists bool
	err := v.pool.QueryRow(ctx, `
		SELECT EXISTS(SELECT 1 FROM relationships WHERE id = $1)
	`, relationshipID).Scan(&exists)
	if err != nil {
		return err
	}

	if !exists {
		return models.RelationshipValidationError{
			Field:   "id",
			Message: "relationship not found",
			Code:    models.ErrCodeInstanceNotFound,
		}
	}

	// If cascade is not enabled, check if there are dependent relationships
	if !cascade {
		cascadeIDs, err := v.GetCascadeDeleteIDs(ctx, relationshipID)
		if err != nil {
			return err
		}

		if len(cascadeIDs) > 0 {
			return models.RelationshipValidationError{
				Field:   "cascade",
				Message: fmt.Sprintf("cannot delete relationship: %d dependent relationships exist. Use cascade=true to delete them", len(cascadeIDs)),
				Code:    models.ErrCodeCardinalityViolation,
			}
		}
	}

	return nil
}
