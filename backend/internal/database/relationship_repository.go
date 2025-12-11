package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/models"
)

// RelationshipRepository gerencia operações de relationships no banco
type RelationshipRepository struct {
	db *DB
}

// NewRelationshipRepository cria um novo repositório
func NewRelationshipRepository(db *DB) *RelationshipRepository {
	return &RelationshipRepository{db: db}
}

// Create cria um novo relationship
func (r *RelationshipRepository) Create(ctx context.Context, req *models.CreateRelationshipRequest) (*models.Relationship, error) {
	relationship := &models.Relationship{
		ID:               uuid.New(),
		RelationshipType: req.RelationshipType,
		SourceInstanceID: req.SourceInstanceID,
		TargetInstanceID: req.TargetInstanceID,
		Properties:       req.Properties,
		ValidFrom:        req.ValidFrom,
		ValidUntil:       req.ValidUntil,
	}

	query := `
		INSERT INTO relationships (
			id, relationship_type, source_instance_id, target_instance_id,
			properties, valid_from, valid_until
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		relationship.ID, relationship.RelationshipType,
		relationship.SourceInstanceID, relationship.TargetInstanceID,
		relationship.Properties, relationship.ValidFrom, relationship.ValidUntil,
	).Scan(&relationship.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create relationship: %w", err)
	}

	return relationship, nil
}

// List lista relationships com filtros opcionais
func (r *RelationshipRepository) List(ctx context.Context, query *models.ListRelationshipsQuery) ([]models.Relationship, error) {
	baseQuery := `
		SELECT id, relationship_type, source_instance_id, target_instance_id,
		       properties, valid_from, valid_until, created_at
		FROM relationships
		WHERE 1=1
	`

	var args []interface{}
	argCount := 1

	// Filtro por source_instance_id
	if query.SourceInstanceID != nil {
		baseQuery += fmt.Sprintf(" AND source_instance_id = $%d", argCount)
		args = append(args, *query.SourceInstanceID)
		argCount++
	}

	// Filtro por target_instance_id
	if query.TargetInstanceID != nil {
		baseQuery += fmt.Sprintf(" AND target_instance_id = $%d", argCount)
		args = append(args, *query.TargetInstanceID)
		argCount++
	}

	// Filtro por relationship_type
	if query.RelationshipType != nil {
		baseQuery += fmt.Sprintf(" AND relationship_type = $%d", argCount)
		args = append(args, *query.RelationshipType)
		argCount++
	}

	// Order by created_at DESC
	baseQuery += " ORDER BY created_at DESC"

	rows, err := r.db.QueryContext(ctx, baseQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list relationships: %w", err)
	}
	defer rows.Close()

	var relationships []models.Relationship

	for rows.Next() {
		var rel models.Relationship

		err := rows.Scan(
			&rel.ID, &rel.RelationshipType,
			&rel.SourceInstanceID, &rel.TargetInstanceID,
			&rel.Properties, &rel.ValidFrom, &rel.ValidUntil,
			&rel.CreatedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan relationship: %w", err)
		}

		relationships = append(relationships, rel)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating relationships: %w", err)
	}

	return relationships, nil
}

// GetByID busca um relationship por ID
func (r *RelationshipRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Relationship, error) {
	relationship := &models.Relationship{}

	query := `
		SELECT id, relationship_type, source_instance_id, target_instance_id,
		       properties, valid_from, valid_until, created_at
		FROM relationships
		WHERE id = $1
	`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&relationship.ID, &relationship.RelationshipType,
		&relationship.SourceInstanceID, &relationship.TargetInstanceID,
		&relationship.Properties, &relationship.ValidFrom, &relationship.ValidUntil,
		&relationship.CreatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("relationship not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get relationship: %w", err)
	}

	return relationship, nil
}

// Delete deleta um relationship (hard delete - relationships podem ser recriados)
func (r *RelationshipRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		DELETE FROM relationships
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete relationship: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("relationship not found")
	}

	return nil
}
