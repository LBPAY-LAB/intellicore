package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
	"github.com/xeipuuv/gojsonschema"
)

// ObjectDefinitionHandler gerencia requisições de object_definitions
type ObjectDefinitionHandler struct {
	repo *database.ObjectDefinitionRepository
}

// NewObjectDefinitionHandler cria um novo handler
func NewObjectDefinitionHandler(repo *database.ObjectDefinitionRepository) *ObjectDefinitionHandler {
	return &ObjectDefinitionHandler{repo: repo}
}

// Create cria um novo object_definition
// POST /api/v1/object-definitions
func (h *ObjectDefinitionHandler) Create(c *gin.Context) {
	var req models.CreateObjectDefinitionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Valida que o schema é um JSON Schema válido
	if err := validateJSONSchema(req.Schema); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON Schema: " + err.Error()})
		return
	}

	// Cria no banco
	objDef, err := h.repo.Create(c.Request.Context(), &req)
	if err != nil {
		if isUniqueViolation(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "object_definition with this name already exists"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, objDef)
}

// List lista todos os object_definitions
// GET /api/v1/object-definitions
func (h *ObjectDefinitionHandler) List(c *gin.Context) {
	objDefs, err := h.repo.List(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": objDefs,
		"total": len(objDefs),
	})
}

// GetByID busca um object_definition por ID
// GET /api/v1/object-definitions/:id
func (h *ObjectDefinitionHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	objDef, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "object_definition not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "object_definition not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, objDef)
}

// Update atualiza um object_definition existente
// PUT /api/v1/object-definitions/:id
func (h *ObjectDefinitionHandler) Update(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	var req models.UpdateObjectDefinitionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Se schema foi fornecido, valida
	if req.Schema != nil {
		if err := validateJSONSchema(req.Schema); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid JSON Schema: " + err.Error()})
			return
		}
	}

	objDef, err := h.repo.Update(c.Request.Context(), id, &req)
	if err != nil {
		if err.Error() == "object_definition not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "object_definition not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, objDef)
}

// Delete desativa um object_definition
// DELETE /api/v1/object-definitions/:id
func (h *ObjectDefinitionHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		if err.Error() == "object_definition not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "object_definition not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// validateJSONSchema valida se um objeto é um JSON Schema válido
func validateJSONSchema(schema models.JSONSchema) error {
	// Usa gojsonschema para validar que o schema está bem formado
	schemaLoader := gojsonschema.NewGoLoader(schema)

	// Tenta criar o schema
	_, err := gojsonschema.NewSchema(schemaLoader)
	if err != nil {
		return err
	}

	return nil
}

// isUniqueViolation verifica se o erro é de violação de constraint UNIQUE
func isUniqueViolation(err error) bool {
	// PostgreSQL error code 23505 = unique_violation
	return err != nil && (err.Error() == "pq: duplicate key value violates unique constraint \"object_definitions_name_key\"" ||
		err.Error() == "UNIQUE constraint failed")
}
