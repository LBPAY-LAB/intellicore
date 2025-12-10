package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/cache"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
	"github.com/xeipuuv/gojsonschema"
)

type ObjectDefinitionHandler struct {
	db    *database.DB
	cache *cache.RedisCache
}

func NewObjectDefinitionHandler(db *database.DB, cache *cache.RedisCache) *ObjectDefinitionHandler {
	return &ObjectDefinitionHandler{
		db:    db,
		cache: cache,
	}
}

// List godoc
// @Summary List object definitions
// @Description Get a list of object definitions with optional filters
// @Tags object-definitions
// @Accept json
// @Produce json
// @Param category query string false "Filter by category"
// @Param is_active query boolean false "Filter by active status"
// @Param limit query int false "Limit results" default(20)
// @Param offset query int false "Offset results" default(0)
// @Success 200 {array} models.ObjectDefinition
// @Router /api/v1/object-definitions [get]
func (h *ObjectDefinitionHandler) List(c *gin.Context) {
	var query models.ListObjectDefinitionsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set defaults
	if query.Limit == 0 {
		query.Limit = 20
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Build SQL query
	sqlQuery := `
		SELECT id, name, display_name, description, version, schema, rules, states, ui_hints, relationships, category, created_at, updated_at, created_by, is_active
		FROM object_definitions
		WHERE 1=1
	`
	args := []interface{}{}
	argCount := 1

	if query.Category != "" {
		sqlQuery += ` AND category = $` + string(rune(argCount))
		args = append(args, query.Category)
		argCount++
	}

	if query.IsActive != nil {
		sqlQuery += ` AND is_active = $` + string(rune(argCount))
		args = append(args, *query.IsActive)
		argCount++
	}

	sqlQuery += ` ORDER BY created_at DESC LIMIT $` + string(rune(argCount)) + ` OFFSET $` + string(rune(argCount+1))
	args = append(args, query.Limit, query.Offset)

	rows, err := h.db.Pool.Query(ctx, sqlQuery, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query object definitions"})
		return
	}
	defer rows.Close()

	objectDefs := []models.ObjectDefinition{}
	for rows.Next() {
		var od models.ObjectDefinition
		err := rows.Scan(
			&od.ID, &od.Name, &od.DisplayName, &od.Description, &od.Version,
			&od.Schema, &od.Rules, &od.States, &od.UIHints, &od.Relationships,
			&od.Category, &od.CreatedAt, &od.UpdatedAt, &od.CreatedBy, &od.IsActive,
		)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan object definition"})
			return
		}
		objectDefs = append(objectDefs, od)
	}

	c.JSON(http.StatusOK, objectDefs)
}

// Get godoc
// @Summary Get an object definition
// @Description Get an object definition by ID
// @Tags object-definitions
// @Accept json
// @Produce json
// @Param id path string true "Object Definition ID"
// @Success 200 {object} models.ObjectDefinition
// @Router /api/v1/object-definitions/{id} [get]
func (h *ObjectDefinitionHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// 1. Tenta buscar do cache
	cacheKey := fmt.Sprintf("object_definition:%s", idStr)
	var od models.ObjectDefinition

	err = h.cache.Get(ctx, cacheKey, &od)
	if err == nil {
		// Cache hit
		c.Header("X-Cache", "HIT")
		c.JSON(http.StatusOK, od)
		return
	}

	// 2. Cache miss - busca do banco
	c.Header("X-Cache", "MISS")

	err = h.db.Pool.QueryRow(ctx, `
		SELECT id, name, display_name, description, version, schema, rules, states, ui_hints, relationships, category, created_at, updated_at, created_by, is_active
		FROM object_definitions
		WHERE id = $1
	`, id).Scan(
		&od.ID, &od.Name, &od.DisplayName, &od.Description, &od.Version,
		&od.Schema, &od.Rules, &od.States, &od.UIHints, &od.Relationships,
		&od.Category, &od.CreatedAt, &od.UpdatedAt, &od.CreatedBy, &od.IsActive,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Object definition not found"})
		return
	}

	// 3. Armazena no cache (TTL: 1 hora)
	h.cache.Set(ctx, cacheKey, od, 1*time.Hour)

	c.JSON(http.StatusOK, od)
}

// Create godoc
// @Summary Create an object definition
// @Description Create a new object definition
// @Tags object-definitions
// @Accept json
// @Produce json
// @Param body body models.CreateObjectDefinitionRequest true "Object Definition"
// @Success 201 {object} models.ObjectDefinition
// @Router /api/v1/object-definitions [post]
func (h *ObjectDefinitionHandler) Create(c *gin.Context) {
	var req models.CreateObjectDefinitionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate that the schema is valid JSON Schema
	schemaLoader := gojsonschema.NewBytesLoader(req.Schema)
	_, err := gojsonschema.NewSchemaLoader().Compile(schemaLoader)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON Schema: " + err.Error()})
		return
	}

	// Set defaults for optional fields
	if req.Rules == nil {
		req.Rules = json.RawMessage("[]")
	}
	if req.States == nil {
		req.States = json.RawMessage(`{"initial": "DRAFT", "states": ["DRAFT", "ACTIVE"], "transitions": []}`)
	}
	if req.UIHints == nil {
		req.UIHints = json.RawMessage(`{"form_layout": "vertical", "field_order": [], "field_widgets": {}}`)
	}
	if req.Relationships == nil {
		req.Relationships = json.RawMessage("[]")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var od models.ObjectDefinition
	err = h.db.Pool.QueryRow(ctx, `
		INSERT INTO object_definitions (name, display_name, description, schema, rules, states, ui_hints, relationships, category)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, name, display_name, description, version, schema, rules, states, ui_hints, relationships, category, created_at, updated_at, created_by, is_active
	`, req.Name, req.DisplayName, req.Description, req.Schema, req.Rules, req.States, req.UIHints, req.Relationships, req.Category).Scan(
		&od.ID, &od.Name, &od.DisplayName, &od.Description, &od.Version,
		&od.Schema, &od.Rules, &od.States, &od.UIHints, &od.Relationships,
		&od.Category, &od.CreatedAt, &od.UpdatedAt, &od.CreatedBy, &od.IsActive,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create object definition: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, od)
}

// Update godoc
// @Summary Update an object definition
// @Description Update an existing object definition
// @Tags object-definitions
// @Accept json
// @Produce json
// @Param id path string true "Object Definition ID"
// @Param body body models.UpdateObjectDefinitionRequest true "Object Definition Update"
// @Success 200 {object} models.ObjectDefinition
// @Router /api/v1/object-definitions/{id} [put]
func (h *ObjectDefinitionHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req models.UpdateObjectDefinitionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate schema if provided
	if req.Schema != nil {
		schemaLoader := gojsonschema.NewBytesLoader(req.Schema)
		_, err := gojsonschema.NewSchemaLoader().Compile(schemaLoader)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON Schema: " + err.Error()})
			return
		}
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Build dynamic update query
	query := "UPDATE object_definitions SET version = version + 1"
	args := []interface{}{id}
	argCount := 2

	if req.DisplayName != nil {
		query += ", display_name = $" + string(rune(argCount))
		args = append(args, *req.DisplayName)
		argCount++
	}
	if req.Description != nil {
		query += ", description = $" + string(rune(argCount))
		args = append(args, *req.Description)
		argCount++
	}
	if req.Schema != nil {
		query += ", schema = $" + string(rune(argCount))
		args = append(args, req.Schema)
		argCount++
	}
	if req.Rules != nil {
		query += ", rules = $" + string(rune(argCount))
		args = append(args, req.Rules)
		argCount++
	}
	if req.States != nil {
		query += ", states = $" + string(rune(argCount))
		args = append(args, req.States)
		argCount++
	}
	if req.UIHints != nil {
		query += ", ui_hints = $" + string(rune(argCount))
		args = append(args, req.UIHints)
		argCount++
	}
	if req.Relationships != nil {
		query += ", relationships = $" + string(rune(argCount))
		args = append(args, req.Relationships)
		argCount++
	}
	if req.Category != nil {
		query += ", category = $" + string(rune(argCount))
		args = append(args, *req.Category)
		argCount++
	}
	if req.IsActive != nil {
		query += ", is_active = $" + string(rune(argCount))
		args = append(args, *req.IsActive)
		argCount++
	}

	query += " WHERE id = $1 RETURNING id, name, display_name, description, version, schema, rules, states, ui_hints, relationships, category, created_at, updated_at, created_by, is_active"

	var od models.ObjectDefinition
	err = h.db.Pool.QueryRow(ctx, query, args...).Scan(
		&od.ID, &od.Name, &od.DisplayName, &od.Description, &od.Version,
		&od.Schema, &od.Rules, &od.States, &od.UIHints, &od.Relationships,
		&od.Category, &od.CreatedAt, &od.UpdatedAt, &od.CreatedBy, &od.IsActive,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update object definition"})
		return
	}

	// Invalida cache
	cacheKey := fmt.Sprintf("object_definition:%s", idStr)
	h.cache.Delete(ctx, cacheKey)

	// Invalida cache de listagem
	h.cache.DeletePattern(ctx, "object_definitions:list:*")

	c.JSON(http.StatusOK, od)
}

// Delete godoc
// @Summary Delete an object definition
// @Description Soft delete an object definition
// @Tags object-definitions
// @Accept json
// @Produce json
// @Param id path string true "Object Definition ID"
// @Success 204
// @Router /api/v1/object-definitions/{id} [delete]
func (h *ObjectDefinitionHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := h.db.Pool.Exec(ctx, `
		UPDATE object_definitions SET is_active = false WHERE id = $1
	`, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete object definition"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Object definition not found"})
		return
	}

	c.Status(http.StatusNoContent)
}

// GetSchema godoc
// @Summary Get object definition schema
// @Description Get only the JSON Schema of an object definition
// @Tags object-definitions
// @Accept json
// @Produce json
// @Param id path string true "Object Definition ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/object-definitions/{id}/schema [get]
func (h *ObjectDefinitionHandler) GetSchema(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var schema json.RawMessage
	err = h.db.Pool.QueryRow(ctx, `
		SELECT schema FROM object_definitions WHERE id = $1
	`, id).Scan(&schema)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Object definition not found"})
		return
	}

	var schemaMap map[string]interface{}
	if err := json.Unmarshal(schema, &schemaMap); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse schema"})
		return
	}

	c.JSON(http.StatusOK, schemaMap)
}

// GetRelationshipRules godoc
// @Summary Get relationship rules for an object definition
// @Description Get the allowed relationships configuration for an object definition
// @Tags object-definitions
// @Accept json
// @Produce json
// @Param id path string true "Object Definition ID"
// @Success 200 {object} models.AllowedRelationshipsConfig
// @Router /api/v1/object-definitions/{id}/relationship-rules [get]
func (h *ObjectDefinitionHandler) GetRelationshipRules(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var relationshipsJSON json.RawMessage
	err = h.db.Pool.QueryRow(ctx, `
		SELECT relationships FROM object_definitions WHERE id = $1
	`, id).Scan(&relationshipsJSON)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Object definition not found"})
		return
	}

	// If no relationships defined, return empty array
	if len(relationshipsJSON) == 0 || string(relationshipsJSON) == "null" {
		c.JSON(http.StatusOK, models.AllowedRelationshipsConfig{
			AllowedRelationships: []models.AllowedRelationship{},
		})
		return
	}

	var config models.AllowedRelationshipsConfig
	if err := json.Unmarshal(relationshipsJSON, &config); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse relationships config: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, config)
}
