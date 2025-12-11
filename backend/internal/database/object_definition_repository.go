package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/models"
)

// ObjectDefinitionRepository gerencia operações de object_definitions no banco
type ObjectDefinitionRepository struct {
	db *DB
}

// NewObjectDefinitionRepository cria um novo repositório
func NewObjectDefinitionRepository(db *DB) *ObjectDefinitionRepository {
	return &ObjectDefinitionRepository{db: db}
}

// Create cria um novo object_definition
func (r *ObjectDefinitionRepository) Create(ctx context.Context, req *models.CreateObjectDefinitionRequest) (*models.ObjectDefinition, error) {
	objDef := &models.ObjectDefinition{
		ID:          uuid.New(),
		Name:        req.Name,
		DisplayName: req.DisplayName,
		Description: req.Description,
		Schema:      req.Schema,
		IsActive:    true,
		Version:     1,
	}

	// Se States não foi fornecido, usa default
	if req.States != nil {
		objDef.States = *req.States
	} else {
		objDef.States = models.FSMDefinition{
			Initial:     "ACTIVE",
			States:      []string{"ACTIVE"},
			Transitions: []models.FSMTransition{},
		}
	}

	// ValidationRules e Relationships (opcionais)
	if req.ValidationRules != nil {
		objDef.ValidationRules = req.ValidationRules
	} else {
		objDef.ValidationRules = json.RawMessage("[]")
	}

	if req.Relationships != nil {
		objDef.Relationships = req.Relationships
	} else {
		objDef.Relationships = json.RawMessage("[]")
	}

	query := `
		INSERT INTO object_definitions (
			id, name, display_name, description, schema, states,
			validation_rules, relationships, is_active, version
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRowContext(
		ctx, query,
		objDef.ID, objDef.Name, objDef.DisplayName, objDef.Description,
		objDef.Schema, objDef.States, objDef.ValidationRules, objDef.Relationships,
		objDef.IsActive, objDef.Version,
	).Scan(&objDef.CreatedAt, &objDef.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create object_definition: %w", err)
	}

	return objDef, nil
}

// GetByID busca um object_definition por ID
func (r *ObjectDefinitionRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.ObjectDefinition, error) {
	objDef := &models.ObjectDefinition{}

	query := `
		SELECT id, name, display_name, description, schema, states,
		       validation_rules, relationships, created_at, updated_at,
		       is_active, version
		FROM object_definitions
		WHERE id = $1
	`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&objDef.ID, &objDef.Name, &objDef.DisplayName, &objDef.Description,
		&objDef.Schema, &objDef.States, &objDef.ValidationRules, &objDef.Relationships,
		&objDef.CreatedAt, &objDef.UpdatedAt, &objDef.IsActive, &objDef.Version,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("object_definition not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get object_definition: %w", err)
	}

	return objDef, nil
}

// GetByName busca um object_definition por nome
func (r *ObjectDefinitionRepository) GetByName(ctx context.Context, name string) (*models.ObjectDefinition, error) {
	objDef := &models.ObjectDefinition{}

	query := `
		SELECT id, name, display_name, description, schema, states,
		       validation_rules, relationships, created_at, updated_at,
		       is_active, version
		FROM object_definitions
		WHERE name = $1 AND is_active = true
	`

	err := r.db.QueryRowContext(ctx, query, name).Scan(
		&objDef.ID, &objDef.Name, &objDef.DisplayName, &objDef.Description,
		&objDef.Schema, &objDef.States, &objDef.ValidationRules, &objDef.Relationships,
		&objDef.CreatedAt, &objDef.UpdatedAt, &objDef.IsActive, &objDef.Version,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("object_definition not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get object_definition: %w", err)
	}

	return objDef, nil
}

// List lista todos os object_definitions ativos
func (r *ObjectDefinitionRepository) List(ctx context.Context) ([]models.ObjectDefinition, error) {
	query := `
		SELECT id, name, display_name, description, schema, states,
		       validation_rules, relationships, created_at, updated_at,
		       is_active, version
		FROM object_definitions
		WHERE is_active = true
		ORDER BY name ASC
	`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list object_definitions: %w", err)
	}
	defer rows.Close()

	var objDefs []models.ObjectDefinition

	for rows.Next() {
		var objDef models.ObjectDefinition

		err := rows.Scan(
			&objDef.ID, &objDef.Name, &objDef.DisplayName, &objDef.Description,
			&objDef.Schema, &objDef.States, &objDef.ValidationRules, &objDef.Relationships,
			&objDef.CreatedAt, &objDef.UpdatedAt, &objDef.IsActive, &objDef.Version,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan object_definition: %w", err)
		}

		objDefs = append(objDefs, objDef)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating object_definitions: %w", err)
	}

	return objDefs, nil
}

// Update atualiza um object_definition existente
func (r *ObjectDefinitionRepository) Update(ctx context.Context, id uuid.UUID, req *models.UpdateObjectDefinitionRequest) (*models.ObjectDefinition, error) {
	// Busca o object_definition atual
	current, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Aplica os updates (apenas campos não-nil)
	if req.DisplayName != nil {
		current.DisplayName = *req.DisplayName
	}
	if req.Description != nil {
		current.Description = *req.Description
	}
	if req.Schema != nil {
		current.Schema = req.Schema
	}
	if req.States != nil {
		current.States = *req.States
	}
	if req.ValidationRules != nil {
		current.ValidationRules = req.ValidationRules
	}
	if req.Relationships != nil {
		current.Relationships = req.Relationships
	}
	if req.IsActive != nil {
		current.IsActive = *req.IsActive
	}

	// Incrementa versão
	current.Version++

	query := `
		UPDATE object_definitions
		SET display_name = $2, description = $3, schema = $4, states = $5,
		    validation_rules = $6, relationships = $7, is_active = $8, version = $9
		WHERE id = $1
		RETURNING updated_at
	`

	err = r.db.QueryRowContext(
		ctx, query,
		id, current.DisplayName, current.Description, current.Schema, current.States,
		current.ValidationRules, current.Relationships, current.IsActive, current.Version,
	).Scan(&current.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to update object_definition: %w", err)
	}

	return current, nil
}

// Delete desativa um object_definition (soft delete)
func (r *ObjectDefinitionRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `
		UPDATE object_definitions
		SET is_active = false
		WHERE id = $1
	`

	result, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete object_definition: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("object_definition not found")
	}

	return nil
}
