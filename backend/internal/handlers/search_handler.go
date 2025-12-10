package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/services"
)

// SearchHandler handles semantic search operations
type SearchHandler struct {
	embeddingService *services.EmbeddingService
	indexer          *services.EmbeddingIndexer
	db               *sql.DB
	logger           *log.Logger
}

// NewSearchHandler creates a new search handler
func NewSearchHandler(embeddingService *services.EmbeddingService, indexer *services.EmbeddingIndexer, db *sql.DB, logger *log.Logger) *SearchHandler {
	if logger == nil {
		logger = log.Default()
	}

	return &SearchHandler{
		embeddingService: embeddingService,
		indexer:          indexer,
		db:               db,
		logger:           logger,
	}
}

// SemanticSearch handles POST /api/search/semantic
func (h *SearchHandler) SemanticSearch(c *gin.Context) {
	var req struct {
		Query       string `json:"query" binding:"required"`
		ContentType string `json:"content_type"` // "object_definition", "instance", or empty for all
		Limit       int    `json:"limit"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default limit
	if req.Limit == 0 {
		req.Limit = 10
	}

	// Validate content_type
	if req.ContentType != "" {
		validTypes := map[string]bool{
			"object_definition": true,
			"instance":          true,
			"documentation":     true,
			"regulation":        true,
		}
		if !validTypes[req.ContentType] {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "invalid content_type. Must be one of: object_definition, instance, documentation, regulation",
			})
			return
		}
	}

	// 1. Generate embedding for query
	queryEmbedding, err := h.embeddingService.GenerateEmbedding(c.Request.Context(), req.Query)
	if err != nil {
		h.logger.Printf("Failed to generate embedding: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate embedding"})
		return
	}

	// 2. Search for similar documents
	results, err := h.embeddingService.SearchSimilar(
		c.Request.Context(),
		h.db,
		queryEmbedding,
		req.ContentType,
		req.Limit,
	)
	if err != nil {
		h.logger.Printf("Search failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"query":   req.Query,
		"results": results,
		"count":   len(results),
	})
}

// IndexObjectDefinition handles POST /api/embeddings/index/object-definition/:id
func (h *SearchHandler) IndexObjectDefinition(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid object_definition ID"})
		return
	}

	if err := h.indexer.IndexObjectDefinition(c.Request.Context(), id); err != nil {
		h.logger.Printf("Failed to index object_definition %s: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to index object_definition"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":              "object_definition indexed successfully",
		"object_definition_id": id,
	})
}

// IndexInstance handles POST /api/embeddings/index/instance/:id
func (h *SearchHandler) IndexInstance(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid instance ID"})
		return
	}

	if err := h.indexer.IndexInstance(c.Request.Context(), id); err != nil {
		h.logger.Printf("Failed to index instance %s: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to index instance"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "instance indexed successfully",
		"instance_id": id,
	})
}

// IndexAllObjectDefinitions handles POST /api/embeddings/index/object-definitions
func (h *SearchHandler) IndexAllObjectDefinitions(c *gin.Context) {
	count, err := h.indexer.IndexAllObjectDefinitions(c.Request.Context())
	if err != nil {
		h.logger.Printf("Failed to index all object_definitions: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to index object_definitions"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "object_definitions indexed successfully",
		"count":   count,
	})
}

// IndexAllInstances handles POST /api/embeddings/index/instances
func (h *SearchHandler) IndexAllInstances(c *gin.Context) {
	count, err := h.indexer.IndexAllInstances(c.Request.Context())
	if err != nil {
		h.logger.Printf("Failed to index all instances: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to index instances"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "instances indexed successfully",
		"count":   count,
	})
}

// ReindexAll handles POST /api/embeddings/reindex-all
func (h *SearchHandler) ReindexAll(c *gin.Context) {
	if err := h.indexer.ReindexAll(c.Request.Context()); err != nil {
		h.logger.Printf("Failed to reindex all: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reindex"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "full reindexing completed successfully",
	})
}

// GetEmbeddingStats handles GET /api/embeddings/stats
func (h *SearchHandler) GetEmbeddingStats(c *gin.Context) {
	var stats struct {
		TotalEmbeddings         int `json:"total_embeddings"`
		ObjectDefinitions       int `json:"object_definitions"`
		Instances               int `json:"instances"`
		Documentation           int `json:"documentation"`
		Regulations             int `json:"regulations"`
	}

	// Total embeddings
	err := h.db.QueryRowContext(c.Request.Context(), `
		SELECT COUNT(*) FROM document_embeddings
	`).Scan(&stats.TotalEmbeddings)
	if err != nil {
		h.logger.Printf("Failed to get total embeddings: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get stats"})
		return
	}

	// By content type
	rows, err := h.db.QueryContext(c.Request.Context(), `
		SELECT content_type, COUNT(*) as count
		FROM document_embeddings
		GROUP BY content_type
	`)
	if err != nil {
		h.logger.Printf("Failed to get embeddings by type: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get stats"})
		return
	}
	defer rows.Close()

	for rows.Next() {
		var contentType string
		var count int
		if err := rows.Scan(&contentType, &count); err != nil {
			continue
		}

		switch contentType {
		case "object_definition":
			stats.ObjectDefinitions = count
		case "instance":
			stats.Instances = count
		case "documentation":
			stats.Documentation = count
		case "regulation":
			stats.Regulations = count
		}
	}

	c.JSON(http.StatusOK, stats)
}

// DeleteEmbedding handles DELETE /api/embeddings/:id
func (h *SearchHandler) DeleteEmbedding(c *gin.Context) {
	idParam := c.Param("id")
	id, err := uuid.Parse(idParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid embedding ID"})
		return
	}

	if err := h.embeddingService.DeleteEmbedding(c.Request.Context(), h.db, id); err != nil {
		h.logger.Printf("Failed to delete embedding %s: %v", id, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete embedding"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":      "embedding deleted successfully",
		"embedding_id": id,
	})
}

// SearchByMetadata handles GET /api/embeddings/search-metadata
func (h *SearchHandler) SearchByMetadata(c *gin.Context) {
	contentType := c.Query("content_type")
	metadataKey := c.Query("metadata_key")
	metadataValue := c.Query("metadata_value")
	limitStr := c.DefaultQuery("limit", "50")

	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 {
		limit = 50
	}
	if limit > 100 {
		limit = 100
	}

	var query string
	var args []interface{}

	if metadataKey != "" && metadataValue != "" {
		// Search by specific metadata key-value
		query = `
			SELECT
				id,
				content,
				content_type,
				metadata,
				object_definition_id,
				instance_id,
				created_at
			FROM document_embeddings
			WHERE metadata->$1 = to_jsonb($2::text)
		`
		args = []interface{}{metadataKey, metadataValue}

		if contentType != "" {
			query += " AND content_type = $3 LIMIT $4"
			args = append(args, contentType, limit)
		} else {
			query += " LIMIT $3"
			args = append(args, limit)
		}
	} else if contentType != "" {
		// Search by content type only
		query = `
			SELECT
				id,
				content,
				content_type,
				metadata,
				object_definition_id,
				instance_id,
				created_at
			FROM document_embeddings
			WHERE content_type = $1
			ORDER BY created_at DESC
			LIMIT $2
		`
		args = []interface{}{contentType, limit}
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "at least one of content_type or metadata_key+metadata_value is required",
		})
		return
	}

	rows, err := h.db.QueryContext(c.Request.Context(), query, args...)
	if err != nil {
		h.logger.Printf("Failed to search by metadata: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "search failed"})
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var id, objectDefID, instanceID sql.NullString
		var content, contentType string
		var metadata []byte
		var createdAt string

		err := rows.Scan(&id, &content, &contentType, &metadata, &objectDefID, &instanceID, &createdAt)
		if err != nil {
			continue
		}

		var metadataMap map[string]interface{}
		_ = json.Unmarshal(metadata, &metadataMap)

		result := map[string]interface{}{
			"id":           id.String,
			"content":      content,
			"content_type": contentType,
			"metadata":     metadataMap,
			"created_at":   createdAt,
		}

		if objectDefID.Valid {
			result["object_definition_id"] = objectDefID.String
		}
		if instanceID.Valid {
			result["instance_id"] = instanceID.String
		}

		results = append(results, result)
	}

	c.JSON(http.StatusOK, gin.H{
		"results": results,
		"count":   len(results),
	})
}
