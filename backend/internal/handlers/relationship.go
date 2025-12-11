package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
)

// RelationshipHandler gerencia requisições de relationships
type RelationshipHandler struct {
	repo         *database.RelationshipRepository
	instanceRepo *database.InstanceRepository
}

// NewRelationshipHandler cria um novo handler
func NewRelationshipHandler(repo *database.RelationshipRepository, instanceRepo *database.InstanceRepository) *RelationshipHandler {
	return &RelationshipHandler{
		repo:         repo,
		instanceRepo: instanceRepo,
	}
}

// Create cria um novo relationship
// POST /api/v1/relationships
func (h *RelationshipHandler) Create(c *gin.Context) {
	var req models.CreateRelationshipRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Valida que source_instance existe
	_, err := h.instanceRepo.GetByID(c.Request.Context(), req.SourceInstanceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "source instance not found"})
		return
	}

	// Valida que target_instance existe
	_, err = h.instanceRepo.GetByID(c.Request.Context(), req.TargetInstanceID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "target instance not found"})
		return
	}

	// Cria o relationship
	relationship, err := h.repo.Create(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, relationship)
}

// List lista relationships com filtros opcionais
// GET /api/v1/relationships?source_instance_id=UUID&target_instance_id=UUID&relationship_type=TYPE
func (h *RelationshipHandler) List(c *gin.Context) {
	var query models.ListRelationshipsQuery

	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	relationships, err := h.repo.List(c.Request.Context(), &query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": relationships,
		"total": len(relationships),
	})
}

// GetByID busca um relationship por ID
// GET /api/v1/relationships/:id
func (h *RelationshipHandler) GetByID(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	relationship, err := h.repo.GetByID(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "relationship not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "relationship not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, relationship)
}

// Delete deleta um relationship
// DELETE /api/v1/relationships/:id
func (h *RelationshipHandler) Delete(c *gin.Context) {
	idParam := c.Param("id")

	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid UUID"})
		return
	}

	if err := h.repo.Delete(c.Request.Context(), id); err != nil {
		if err.Error() == "relationship not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "relationship not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusNoContent, nil)
}
