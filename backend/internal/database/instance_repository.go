package database

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/models"
)

// InstanceRepository gerencia operações de instances no banco
type InstanceRepository struct {
	db     *DB
	objDefRepo *ObjectDefinitionRepository
}

// NewInstanceRepository cria um novo repositório
func NewInstanceRepository(db *DB, objDefRepo *ObjectDefinitionRepository) *InstanceRepository {
	return &InstanceRepository{
		db:     db,
		objDefRepo: objDefRepo,
	}
}

// Create cria uma nova instance
func (r *InstanceRepository) Create(ctx context.Context, req *models.CreateInstanceRequest) (*models.Instance, error) {
	// Busca o object_definition
	objDef, err := r.objDefRepo.GetByID(ctx, req.ObjectDefinitionID)
	if err != nil {
		return nil, fmt.Errorf("object_definition not found: %w", err)
	}

	// Determina o estado inicial
	initialState := objDef.States.Initial
	if req.InitialState != nil && *req.InitialState != "" {
		// Valida que o estado fornecido é válido
		if !isValidState(*req.InitialState, objDef.States.States) {
			return nil, fmt.Errorf("invalid initial state: %s", *req.InitialState)
		}
		initialState = *req.InitialState
	}

	instance := &models.Instance{
		ID:                 uuid.New(),
		ObjectDefinitionID: req.ObjectDefinitionID,
		Data:               req.Data,
		CurrentState:       initialState,
		StateHistory:       []models.StateTransition{},
		Version:            1,
		IsDeleted:          false,
	}

	query := `
		INSERT INTO instances (
			id, object_definition_id, data, current_state, state_history, version, is_deleted
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at, updated_at
	`

	err = r.db.QueryRowContext(
		ctx, query,
		instance.ID, instance.ObjectDefinitionID, instance.Data,
		instance.CurrentState, instance.StateHistory, instance.Version, instance.IsDeleted,
	).Scan(&instance.CreatedAt, &instance.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to create instance: %w", err)
	}

	return instance, nil
}

// GetByID busca uma instance por ID
func (r *InstanceRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Instance, error) {
	instance := &models.Instance{}

	query := `
		SELECT id, object_definition_id, data, current_state, state_history,
		       created_at, updated_at, created_by, updated_by, version, is_deleted, deleted_at
		FROM instances
		WHERE id = $1 AND is_deleted = false
	`

	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&instance.ID, &instance.ObjectDefinitionID, &instance.Data,
		&instance.CurrentState, &instance.StateHistory,
		&instance.CreatedAt, &instance.UpdatedAt,
		&instance.CreatedBy, &instance.UpdatedBy,
		&instance.Version, &instance.IsDeleted, &instance.DeletedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("instance not found")
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get instance: %w", err)
	}

	return instance, nil
}

// List lista instances com filtros
func (r *InstanceRepository) List(ctx context.Context, query *models.ListInstancesQuery) (*models.ListInstancesResponse, error) {
	// Query base
	baseQuery := `
		FROM instances
		WHERE is_deleted = false
	`

	var args []interface{}
	argCount := 1

	// Filtro por object_definition_id
	if query.ObjectDefinitionID != nil {
		baseQuery += fmt.Sprintf(" AND object_definition_id = $%d", argCount)
		args = append(args, *query.ObjectDefinitionID)
		argCount++
	}

	// Filtro por state
	if query.State != nil {
		baseQuery += fmt.Sprintf(" AND current_state = $%d", argCount)
		args = append(args, *query.State)
		argCount++
	}

	// TODO: Filtros JSONB (query.Filters)
	// Ex: data->>'cpf' = '12345678901'

	// Count total
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int64
	err := r.db.QueryRowContext(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		return nil, fmt.Errorf("failed to count instances: %w", err)
	}

	// Sort
	sortBy := "created_at"
	if query.SortBy != "" {
		sortBy = query.SortBy
	}

	sortOrder := "DESC"
	if query.SortOrder == "asc" {
		sortOrder = "ASC"
	}

	// Limit e Offset
	limit := 100
	if query.Limit > 0 && query.Limit <= 1000 {
		limit = query.Limit
	}

	offset := 0
	if query.Offset > 0 {
		offset = query.Offset
	}

	// Query final
	selectQuery := `
		SELECT id, object_definition_id, data, current_state, state_history,
		       created_at, updated_at, created_by, updated_by, version, is_deleted, deleted_at
	` + baseQuery + fmt.Sprintf(" ORDER BY %s %s LIMIT $%d OFFSET $%d", sortBy, sortOrder, argCount, argCount+1)

	args = append(args, limit, offset)

	rows, err := r.db.QueryContext(ctx, selectQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list instances: %w", err)
	}
	defer rows.Close()

	var instances []models.Instance

	for rows.Next() {
		var instance models.Instance

		err := rows.Scan(
			&instance.ID, &instance.ObjectDefinitionID, &instance.Data,
			&instance.CurrentState, &instance.StateHistory,
			&instance.CreatedAt, &instance.UpdatedAt,
			&instance.CreatedBy, &instance.UpdatedBy,
			&instance.Version, &instance.IsDeleted, &instance.DeletedAt,
		)

		if err != nil {
			return nil, fmt.Errorf("failed to scan instance: %w", err)
		}

		instances = append(instances, instance)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating instances: %w", err)
	}

	hasMore := int64(offset+limit) < total

	return &models.ListInstancesResponse{
		Items:   instances,
		Total:   total,
		Limit:   limit,
		Offset:  offset,
		HasMore: hasMore,
	}, nil
}

// Update atualiza os dados de uma instance
func (r *InstanceRepository) Update(ctx context.Context, id uuid.UUID, req *models.UpdateInstanceRequest) (*models.Instance, error) {
	// Busca a instance atual
	current, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Atualiza os dados
	current.Data = req.Data
	current.Version++

	query := `
		UPDATE instances
		SET data = $2, version = $3
		WHERE id = $1
		RETURNING updated_at
	`

	err = r.db.QueryRowContext(ctx, query, id, current.Data, current.Version).Scan(&current.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to update instance: %w", err)
	}

	return current, nil
}

// TransitionState realiza uma transição de estado
func (r *InstanceRepository) TransitionState(ctx context.Context, id uuid.UUID, req *models.TransitionStateRequest) (*models.Instance, error) {
	// Busca a instance atual
	current, err := r.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Busca o object_definition para validar a transição
	objDef, err := r.objDefRepo.GetByID(ctx, current.ObjectDefinitionID)
	if err != nil {
		return nil, fmt.Errorf("object_definition not found: %w", err)
	}

	// Valida que o novo estado existe
	if !isValidState(req.ToState, objDef.States.States) {
		return nil, fmt.Errorf("invalid state: %s", req.ToState)
	}

	// Valida que a transição é permitida
	if !isValidTransition(current.CurrentState, req.ToState, objDef.States.Transitions) {
		return nil, fmt.Errorf("transition not allowed: %s -> %s", current.CurrentState, req.ToState)
	}

	// Adiciona transição ao histórico
	transition := models.StateTransition{
		FromState: current.CurrentState,
		ToState:   req.ToState,
		Timestamp: time.Now(),
	}

	if req.Comment != nil {
		transition.Comment = *req.Comment
	}

	current.StateHistory = append(current.StateHistory, transition)
	current.CurrentState = req.ToState
	current.Version++

	query := `
		UPDATE instances
		SET current_state = $2, state_history = $3, version = $4
		WHERE id = $1
		RETURNING updated_at
	`

	err = r.db.QueryRowContext(
		ctx, query,
		id, current.CurrentState, current.StateHistory, current.Version,
	).Scan(&current.UpdatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to transition state: %w", err)
	}

	return current, nil
}

// Delete marca uma instance como deletada (soft delete)
func (r *InstanceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	now := time.Now()

	query := `
		UPDATE instances
		SET is_deleted = true, deleted_at = $2
		WHERE id = $1 AND is_deleted = false
	`

	result, err := r.db.ExecContext(ctx, query, id, now)
	if err != nil {
		return fmt.Errorf("failed to delete instance: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rowsAffected == 0 {
		return fmt.Errorf("instance not found")
	}

	return nil
}

// isValidState verifica se um estado existe na lista de estados válidos
func isValidState(state string, validStates []string) bool {
	for _, s := range validStates {
		if s == state {
			return true
		}
	}
	return false
}

// isValidTransition verifica se uma transição é permitida
func isValidTransition(from, to string, transitions []models.FSMTransition) bool {
	// Se não há transições definidas, permite qualquer transição
	if len(transitions) == 0 {
		return true
	}

	// Verifica se existe uma transição explícita
	for _, t := range transitions {
		if t.From == from && t.To == to {
			return true
		}
	}

	return false
}
