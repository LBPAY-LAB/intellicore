package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
	"github.com/lbpay/supercore/internal/services/statemachine"
	"github.com/lbpay/supercore/internal/services/validator"
	"github.com/xeipuuv/gojsonschema"
)

type InstanceHandler struct {
	db            *database.DB
	validator     *validator.Validator
	stateMachine  *statemachine.StateMachine
}

func NewInstanceHandler(db *database.DB) *InstanceHandler {
	return &InstanceHandler{
		db:           db,
		validator:    validator.New(db),
		stateMachine: statemachine.New(db),
	}
}

// List godoc
// @Summary List instances
// @Description Get a list of instances with optional filters and pagination
// @Tags instances
// @Accept json
// @Produce json
// @Param object_definition_id query string false "Filter by object definition ID"
// @Param current_state query string false "Filter by current state"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(50)
// @Success 200 {object} map[string]interface{} "instances and pagination info"
// @Router /api/v1/instances [get]
func (h *InstanceHandler) List(c *gin.Context) {
	var query models.ListInstancesQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Paginação padrão
	page := 1
	pageSize := 50
	if c.Query("page") != "" {
		fmt.Sscanf(c.Query("page"), "%d", &page)
	}
	if c.Query("page_size") != "" {
		fmt.Sscanf(c.Query("page_size"), "%d", &pageSize)
	}
	if pageSize > 100 {
		pageSize = 100 // Limite máximo
	}
	offset := (page - 1) * pageSize

	if query.IsDeleted == nil {
		isDeleted := false
		query.IsDeleted = &isDeleted
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Query otimizada com JOIN para pegar info do object_definition
	baseQuery := `
		FROM instances i
		INNER JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE i.is_deleted = $1
	`
	args := []interface{}{*query.IsDeleted}
	argCount := 2

	if query.ObjectDefinitionID != nil {
		baseQuery += fmt.Sprintf(" AND i.object_definition_id = $%d", argCount)
		args = append(args, *query.ObjectDefinitionID)
		argCount++
	}

	if query.CurrentState != "" {
		baseQuery += fmt.Sprintf(" AND i.current_state = $%d", argCount)
		args = append(args, query.CurrentState)
		argCount++
	}

	// Count total (para paginação)
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int
	err := h.db.Pool.QueryRow(ctx, countQuery, args...).Scan(&total)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count instances"})
		return
	}

	// Query principal com dados completos
	sqlQuery := `
		SELECT
			i.id,
			i.object_definition_id,
			i.data,
			i.current_state,
			i.state_history,
			i.version,
			i.created_at,
			i.updated_at,
			i.created_by,
			i.updated_by,
			i.is_deleted,
			i.deleted_at,
			i.deleted_by,
			od.name as object_type,
			od.display_name as object_display_name
	` + baseQuery

	// Adiciona ordenação e paginação
	sqlQuery += " ORDER BY i.created_at DESC"
	sqlQuery += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argCount, argCount+1)
	args = append(args, pageSize, offset)

	rows, err := h.db.Pool.Query(ctx, sqlQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query instances"})
		return
	}
	defer rows.Close()

	instances := []map[string]interface{}{}
	for rows.Next() {
		var inst models.Instance
		var objectType, objectDisplayName string
		err := rows.Scan(
			&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState, &inst.StateHistory,
			&inst.Version, &inst.CreatedAt, &inst.UpdatedAt, &inst.CreatedBy, &inst.UpdatedBy,
			&inst.IsDeleted, &inst.DeletedAt, &inst.DeletedBy,
			&objectType, &objectDisplayName,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan instance"})
			return
		}

		// Adiciona metadados do object_definition
		instanceWithMeta := map[string]interface{}{
			"id":                     inst.ID,
			"object_definition_id":   inst.ObjectDefinitionID,
			"object_type":            objectType,
			"object_display_name":    objectDisplayName,
			"data":                   inst.Data,
			"current_state":          inst.CurrentState,
			"state_history":          inst.StateHistory,
			"version":                inst.Version,
			"created_at":             inst.CreatedAt,
			"updated_at":             inst.UpdatedAt,
			"created_by":             inst.CreatedBy,
			"updated_by":             inst.UpdatedBy,
			"is_deleted":             inst.IsDeleted,
			"deleted_at":             inst.DeletedAt,
			"deleted_by":             inst.DeletedBy,
		}
		instances = append(instances, instanceWithMeta)
	}

	totalPages := (total + pageSize - 1) / pageSize

	c.JSON(http.StatusOK, gin.H{
		"instances": instances,
		"pagination": gin.H{
			"page":        page,
			"page_size":   pageSize,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// Get godoc
// @Summary Get an instance
// @Description Get an instance by ID
// @Tags instances
// @Accept json
// @Produce json
// @Param id path string true "Instance ID"
// @Success 200 {object} models.Instance
// @Router /api/v1/instances/{id} [get]
func (h *InstanceHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var inst models.Instance
	err = h.db.Pool.QueryRow(ctx, `
		SELECT id, object_definition_id, data, current_state, state_history, version,
		       created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by
		FROM instances
		WHERE id = $1
	`, id).Scan(
		&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState, &inst.StateHistory,
		&inst.Version, &inst.CreatedAt, &inst.UpdatedAt, &inst.CreatedBy, &inst.UpdatedBy,
		&inst.IsDeleted, &inst.DeletedAt, &inst.DeletedBy,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	c.JSON(http.StatusOK, inst)
}

// Create godoc
// @Summary Create an instance
// @Description Create a new instance from an object definition
// @Tags instances
// @Accept json
// @Produce json
// @Param body body models.CreateInstanceRequest true "Instance"
// @Success 201 {object} models.Instance
// @Router /api/v1/instances [post]
func (h *InstanceHandler) Create(c *gin.Context) {
	var req models.CreateInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get the object definition to validate against
	var objDef models.ObjectDefinition
	err := h.db.Pool.QueryRow(ctx, `
		SELECT schema, states, rules FROM object_definitions WHERE id = $1 AND is_active = true
	`, req.ObjectDefinitionID).Scan(&objDef.Schema, &objDef.States, &objDef.Rules)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Object definition not found or inactive"})
		return
	}

	// Validate data against JSON Schema
	schemaLoader := gojsonschema.NewBytesLoader(objDef.Schema)
	dataLoader := gojsonschema.NewBytesLoader(req.Data)

	result, err := gojsonschema.Validate(schemaLoader, dataLoader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Schema validation error: " + err.Error()})
		return
	}

	if !result.Valid() {
		errors := []string{}
		for _, err := range result.Errors() {
			errors = append(errors, err.String())
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"error":            "Data validation failed",
			"validation_errors": errors,
		})
		return
	}

	// Run custom validation rules
	if err := h.validator.ValidateData(ctx, objDef.Rules, req.Data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed: " + err.Error()})
		return
	}

	// Get initial state from FSM
	var statesConfig map[string]interface{}
	if err := json.Unmarshal(objDef.States, &statesConfig); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse states config"})
		return
	}

	initialState, ok := statesConfig["initial"].(string)
	if !ok {
		initialState = "DRAFT"
	}

	// Create state history with initial entry
	stateHistory := []models.StateHistoryEntry{
		{
			State:     initialState,
			Timestamp: time.Now(),
		},
	}
	stateHistoryJSON, _ := json.Marshal(stateHistory)

	// Insert instance
	var inst models.Instance
	err = h.db.Pool.QueryRow(ctx, `
		INSERT INTO instances (object_definition_id, data, current_state, state_history)
		VALUES ($1, $2, $3, $4)
		RETURNING id, object_definition_id, data, current_state, state_history, version,
		          created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by
	`, req.ObjectDefinitionID, req.Data, initialState, stateHistoryJSON).Scan(
		&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState, &inst.StateHistory,
		&inst.Version, &inst.CreatedAt, &inst.UpdatedAt, &inst.CreatedBy, &inst.UpdatedBy,
		&inst.IsDeleted, &inst.DeletedAt, &inst.DeletedBy,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create instance: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, inst)
}

// Update godoc
// @Summary Update an instance
// @Description Update an existing instance's data
// @Tags instances
// @Accept json
// @Produce json
// @Param id path string true "Instance ID"
// @Param body body models.UpdateInstanceRequest true "Instance Update"
// @Success 200 {object} models.Instance
// @Router /api/v1/instances/{id} [put]
func (h *InstanceHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req models.UpdateInstanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get current instance and its object definition
	var objDefID uuid.UUID
	err = h.db.Pool.QueryRow(ctx, `
		SELECT object_definition_id FROM instances WHERE id = $1 AND is_deleted = false
	`, id).Scan(&objDefID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	// Get object definition for validation
	var objDef models.ObjectDefinition
	err = h.db.Pool.QueryRow(ctx, `
		SELECT schema, rules FROM object_definitions WHERE id = $1 AND is_active = true
	`, objDefID).Scan(&objDef.Schema, &objDef.Rules)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Object definition not found or inactive"})
		return
	}

	// Validate data against JSON Schema
	schemaLoader := gojsonschema.NewBytesLoader(objDef.Schema)
	dataLoader := gojsonschema.NewBytesLoader(req.Data)

	result, err := gojsonschema.Validate(schemaLoader, dataLoader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Schema validation error: " + err.Error()})
		return
	}

	if !result.Valid() {
		errors := []string{}
		for _, err := range result.Errors() {
			errors = append(errors, err.String())
		}
		c.JSON(http.StatusBadRequest, gin.H{
			"error":            "Data validation failed",
			"validation_errors": errors,
		})
		return
	}

	// Run custom validation rules
	if err := h.validator.ValidateData(ctx, objDef.Rules, req.Data); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validation failed: " + err.Error()})
		return
	}

	// Update instance
	var inst models.Instance
	err = h.db.Pool.QueryRow(ctx, `
		UPDATE instances
		SET data = $1, version = version + 1, updated_at = NOW()
		WHERE id = $2 AND is_deleted = false
		RETURNING id, object_definition_id, data, current_state, state_history, version,
		          created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by
	`, req.Data, id).Scan(
		&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState, &inst.StateHistory,
		&inst.Version, &inst.CreatedAt, &inst.UpdatedAt, &inst.CreatedBy, &inst.UpdatedBy,
		&inst.IsDeleted, &inst.DeletedAt, &inst.DeletedBy,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update instance"})
		return
	}

	c.JSON(http.StatusOK, inst)
}

// Delete godoc
// @Summary Delete an instance
// @Description Soft delete an instance
// @Tags instances
// @Accept json
// @Produce json
// @Param id path string true "Instance ID"
// @Success 204
// @Router /api/v1/instances/{id} [delete]
func (h *InstanceHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := h.db.Pool.Exec(ctx, `
		UPDATE instances
		SET is_deleted = true, deleted_at = NOW()
		WHERE id = $1 AND is_deleted = false
	`, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete instance"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	c.Status(http.StatusNoContent)
}

// TransitionState godoc
// @Summary Transition instance state
// @Description Transition an instance from one state to another using FSM
// @Tags instances
// @Accept json
// @Produce json
// @Param id path string true "Instance ID"
// @Param body body models.TransitionStateRequest true "State Transition"
// @Success 200 {object} models.Instance
// @Router /api/v1/instances/{id}/transition [post]
func (h *InstanceHandler) TransitionState(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req models.TransitionStateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Use state machine service to transition
	inst, err := h.stateMachine.Transition(ctx, id, req.ToState, req.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, inst)
}

// GetHistory godoc
// @Summary Get instance state history
// @Description Get the state transition history for an instance
// @Tags instances
// @Accept json
// @Produce json
// @Param id path string true "Instance ID"
// @Success 200 {array} models.StateHistoryEntry
// @Router /api/v1/instances/{id}/history [get]
func (h *InstanceHandler) GetHistory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var stateHistory json.RawMessage
	err = h.db.Pool.QueryRow(ctx, `
		SELECT state_history FROM instances WHERE id = $1
	`, id).Scan(&stateHistory)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	var history []models.StateHistoryEntry
	if err := json.Unmarshal(stateHistory, &history); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse state history"})
		return
	}

	c.JSON(http.StatusOK, history)
}
