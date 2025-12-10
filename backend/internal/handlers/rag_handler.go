package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lbpay/supercore/internal/models"
	"github.com/lbpay/supercore/internal/rag"
	"github.com/lbpay/supercore/internal/services/embeddings"
)

// RAGHandler handles RAG (Retrieval-Augmented Generation) endpoints
type RAGHandler struct {
	embeddingService *embeddings.EmbeddingService
	ragSQLService    *rag.RAGSQLService
}

// NewRAGHandler creates a new RAG handler
func NewRAGHandler(embeddingService *embeddings.EmbeddingService, ragSQLService *rag.RAGSQLService) *RAGHandler {
	return &RAGHandler{
		embeddingService: embeddingService,
		ragSQLService:    ragSQLService,
	}
}

// NewRAGHandlerWithSQL creates a RAG handler with only SQL service (for when embedding service is not available)
func NewRAGHandlerWithSQL(ragSQLService *rag.RAGSQLService) *RAGHandler {
	return &RAGHandler{
		embeddingService: nil,
		ragSQLService:    ragSQLService,
	}
}

// SearchEmbeddings performs semantic search across embeddings
// GET /api/v1/rag/search
func (h *RAGHandler) SearchEmbeddings(c *gin.Context) {
	var req models.SearchEmbeddingsRequest

	// Bind query parameters
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request parameters",
			"details": err.Error(),
		})
		return
	}

	// Validate query is not empty
	if req.Query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Query parameter 'q' is required",
		})
		return
	}

	// Set default limit if not provided
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Perform semantic search
	results, err := h.embeddingService.SearchSimilar(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to search embeddings",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, results)
}

// CreateEmbedding manually creates an embedding
// POST /api/v1/rag/embeddings
func (h *RAGHandler) CreateEmbedding(c *gin.Context) {
	var req models.CreateEmbeddingRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Create embedding
	embedding, err := h.embeddingService.CreateEmbedding(c.Request.Context(), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create embedding",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, embedding)
}

// GetEmbeddingStats returns statistics about embeddings
// GET /api/v1/rag/stats
func (h *RAGHandler) GetEmbeddingStats(c *gin.Context) {
	stats, err := h.embeddingService.GetStats(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get embedding stats",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// DeleteEmbedding deletes an embedding
// DELETE /api/v1/rag/embeddings/:type/:id
func (h *RAGHandler) DeleteEmbedding(c *gin.Context) {
	objectType := models.ObjectType(c.Param("type"))
	objectID := c.Param("id")

	// Validate object type
	if objectType != models.ObjectTypeDefinition && objectType != models.ObjectTypeInstance {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid object type. Must be 'object_definition' or 'instance'",
		})
		return
	}

	// Parse UUID
	id, err := parseUUID(objectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid UUID format",
		})
		return
	}

	// Delete embedding
	if err := h.embeddingService.DeleteEmbedding(c.Request.Context(), objectType, id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete embedding",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Embedding deleted successfully",
		"object_type": objectType,
		"object_id": objectID,
	})
}

// RegenerateEmbedding regenerates an embedding for an existing object
// POST /api/v1/rag/embeddings/:type/:id/regenerate
func (h *RAGHandler) RegenerateEmbedding(c *gin.Context) {
	objectType := models.ObjectType(c.Param("type"))
	objectID := c.Param("id")

	// Validate object type
	if objectType != models.ObjectTypeDefinition && objectType != models.ObjectTypeInstance {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid object type. Must be 'object_definition' or 'instance'",
		})
		return
	}

	// Parse UUID
	id, err := parseUUID(objectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid UUID format",
		})
		return
	}

	// Get existing embedding
	existing, err := h.embeddingService.GetEmbedding(c.Request.Context(), objectType, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get existing embedding",
			"details": err.Error(),
		})
		return
	}

	if existing == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Embedding not found",
		})
		return
	}

	// Regenerate embedding with existing content
	if err := h.embeddingService.UpdateEmbedding(
		c.Request.Context(),
		objectType,
		id,
		existing.Content,
		existing.Metadata,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to regenerate embedding",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Embedding regenerated successfully",
		"object_type": objectType,
		"object_id": objectID,
	})
}

// SearchByExample performs similarity search using an example text
// POST /api/v1/rag/search-by-example
func (h *RAGHandler) SearchByExample(c *gin.Context) {
	var req struct {
		Example    string             `json:"example" binding:"required"`
		Limit      int                `json:"limit" binding:"omitempty,min=1,max=100"`
		ObjectType *models.ObjectType `json:"object_type" binding:"omitempty,oneof=object_definition instance"`
		MinScore   *float32           `json:"min_score" binding:"omitempty,min=0,max=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Set default limit
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Create search request
	searchReq := &models.SearchEmbeddingsRequest{
		Query:      req.Example,
		Limit:      req.Limit,
		ObjectType: req.ObjectType,
		MinScore:   req.MinScore,
	}

	// Perform search
	results, err := h.embeddingService.SearchSimilar(c.Request.Context(), searchReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to search by example",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, results)
}

// QuerySQL responde perguntas usando SQL Layer do RAG
// POST /api/v1/rag/query/sql
func (h *RAGHandler) QuerySQL(c *gin.Context) {
	var req struct {
		Question string `json:"question" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Responde usando SQL Layer
	answer, err := h.ragSQLService.Answer(c.Request.Context(), req.Question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to process question",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"question": req.Question,
		"answer":   answer,
		"layer":    "sql",
	})
}
