package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
	"github.com/xeipuuv/gojsonschema"
)

// InstanceHandler gerencia requisições de instances
type InstanceHandler struct {
	repo       *database.InstanceRepository
	objDefRepo *database.ObjectDefinitionRepository
}

// NewInstanceHandler cria um novo handler
func NewInstanceHandler(repo *database.InstanceRepository, objDefRepo *database.ObjectDefinitionRepository) *InstanceHandler {
	return &InstanceHandler{
		repo:       repo,
		objDefRepo: objDefRepo,
	}
}

// Create cria uma nova instance
// POST /api/v1/instances
func (h *InstanceHandler) Create(c *gin.Context) {
	var req models.CreateInstanceRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Busca o object_definition para validar contra o schema
	objDef, err := h.objDefRepo.GetByID(c.Request.Context(), req.ObjectDefinitionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "object_definition not found"})
		return
	}

	// Valida os dados contra o JSON Schema
	if err := validateInstanceData(req.Data, objDef.Schema); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation failed: " + err.Error()})
		return
	}

	// Cria no banco
	instance, err := h.repo.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, instance)
}

// List lista instances com filtros opcionais
// GET /api/v1/instances?object_definition_id=UUID&state=ACTIVE&limit=50&offset=0
func (h *InstanceHandler) List(c *gin.Context) {
	var query models.ListInstancesQuery

	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	response, err := h.repo.List(c.Request.Context(), &query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetByID busca uma instance por ID
// GET /api/v1/instances/:id
func (h *InstanceHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	instance, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "instance not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "instance not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, instance)
}

// Update atualiza os dados de uma instance
// PUT /api/v1/instances/:id
func (h *InstanceHandler) Update(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	var req models.UpdateInstanceRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Busca a instance atual para obter o object_definition_id
	current, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "instance not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "instance not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Busca o object_definition para validar
	objDef, err := h.objDefRepo.GetByID(c.Request.Context(), current.ObjectDefinitionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "object_definition not found"})
		return
	}

	// Valida os novos dados contra o schema
	if err := validateInstanceData(req.Data, objDef.Schema); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation failed: " + err.Error()})
		return
	}

	// Atualiza
	instance, err := h.repo.Update(c.Request.Context(), id, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, instance)
}

// TransitionState realiza uma transição de estado
// POST /api/v1/instances/:id/transition
func (h *InstanceHandler) TransitionState(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	var req models.TransitionStateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	instance, err := h.repo.TransitionState(c.Request.Context(), id, &req)
	if err != nil {
		// Verifica se é erro de transição inválida
		if err.Error() == "instance not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "instance not found"})
			return
		}
		// Outros erros (invalid state, transition not allowed)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, instance)
}

// Delete marca uma instance como deletada (soft delete)
// DELETE /api/v1/instances/:id
func (h *InstanceHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		if err.Error() == "instance not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "instance not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}

// validateInstanceData valida os dados de uma instance contra o JSON Schema do object_definition
func validateInstanceData(data models.InstanceData, schema models.JSONSchema) error {
	schemaLoader := gojsonschema.NewGoLoader(schema)
	dataLoader := gojsonschema.NewGoLoader(data)

	result, err := gojsonschema.Validate(schemaLoader, dataLoader)
	if err != nil {
		return err
	}

	if !result.Valid() {
		// Retorna o primeiro erro de validação
		errors := result.Errors()
		if len(errors) > 0 {
			return errors[0]
		}
	}

	return nil
}
