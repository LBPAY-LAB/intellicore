package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/services"
)

// RAGGraphHandler handles graph-based RAG queries
type RAGGraphHandler struct {
	ragGraphService *services.RAGGraphService
	nebulaSyncService *services.NebulaSyncService
}

// NewRAGGraphHandler creates a new RAG Graph handler
func NewRAGGraphHandler(
	ragGraphService *services.RAGGraphService,
	nebulaSyncService *services.NebulaSyncService,
) *RAGGraphHandler {
	return &RAGGraphHandler{
		ragGraphService:   ragGraphService,
		nebulaSyncService: nebulaSyncService,
	}
}

// QueryGraph answers questions using the Nebula Graph layer
// POST /api/v1/rag/query/graph
func (h *RAGGraphHandler) QueryGraph(c *gin.Context) {
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

	// Answer question using graph
	answer, err := h.ragGraphService.Answer(c.Request.Context(), req.Question)
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
	})
}

// FindRelatedInstances finds all instances related to a given instance
// GET /api/v1/rag/graph/instances/:id/related
func (h *RAGGraphHandler) FindRelatedInstances(c *gin.Context) {
	// Parse instance ID
	instanceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid instance ID format",
		})
		return
	}

	// Get depth parameter (default: 1)
	depth := 1
	if depthParam := c.Query("depth"); depthParam != "" {
		if _, err := c.GetQuery("depth"); err {
			depth = c.GetInt("depth")
		}
	}

	// Validate depth
	if depth < 1 {
		depth = 1
	}
	if depth > 3 {
		depth = 3
	}

	// Find related instances
	instances, err := h.ragGraphService.FindRelatedInstances(c.Request.Context(), instanceID, depth)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to find related instances",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"instance_id": instanceID,
		"depth":       depth,
		"count":       len(instances),
		"instances":   instances,
	})
}

// AnalyzeImpact analyzes the impact of deleting an instance
// GET /api/v1/rag/graph/instances/:id/impact
func (h *RAGGraphHandler) AnalyzeImpact(c *gin.Context) {
	// Parse instance ID
	instanceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid instance ID format",
		})
		return
	}

	// Analyze impact
	impact, err := h.ragGraphService.AnalyzeImpact(c.Request.Context(), instanceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to analyze impact",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, impact)
}

// FindPath finds the shortest path between two instances
// GET /api/v1/rag/graph/path
func (h *RAGGraphHandler) FindPath(c *gin.Context) {
	// Parse from and to IDs
	fromIDStr := c.Query("from")
	toIDStr := c.Query("to")

	if fromIDStr == "" || toIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Both 'from' and 'to' query parameters are required",
		})
		return
	}

	fromID, err := uuid.Parse(fromIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid 'from' instance ID format",
		})
		return
	}

	toID, err := uuid.Parse(toIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid 'to' instance ID format",
		})
		return
	}

	// Find path
	paths, err := h.ragGraphService.FindPath(c.Request.Context(), fromID, toID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to find path",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"from":       fromID,
		"to":         toID,
		"path_count": len(paths),
		"paths":      paths,
	})
}

// SyncAll synchronizes all data from PostgreSQL to Nebula Graph
// POST /api/v1/rag/graph/sync
func (h *RAGGraphHandler) SyncAll(c *gin.Context) {
	// Perform full sync
	stats, err := h.nebulaSyncService.SyncAll(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to sync data to graph",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":              "Sync completed successfully",
		"duration_seconds":     stats.Duration.Seconds(),
		"object_definitions": gin.H{
			"synced": stats.ObjectDefinitionsSynced,
			"failed": stats.ObjectDefinitionsFailed,
		},
		"instances": gin.H{
			"synced": stats.InstancesSynced,
			"failed": stats.InstancesFailed,
		},
		"relationships": gin.H{
			"synced": stats.RelationshipsSynced,
			"failed": stats.RelationshipsFailed,
		},
	})
}

// SyncInstance synchronizes a single instance to the graph
// POST /api/v1/rag/graph/sync/instance/:id
func (h *RAGGraphHandler) SyncInstance(c *gin.Context) {
	// Parse instance ID
	instanceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid instance ID format",
		})
		return
	}

	// Sync instance
	if err := h.nebulaSyncService.SyncInstance(c.Request.Context(), instanceID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to sync instance",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Instance synced successfully",
		"instance_id": instanceID,
	})
}

// SyncRelationship synchronizes a single relationship to the graph
// POST /api/v1/rag/graph/sync/relationship/:id
func (h *RAGGraphHandler) SyncRelationship(c *gin.Context) {
	// Parse relationship ID
	relationshipID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid relationship ID format",
		})
		return
	}

	// Sync relationship
	if err := h.nebulaSyncService.SyncRelationship(c.Request.Context(), relationshipID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to sync relationship",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":         "Relationship synced successfully",
		"relationship_id": relationshipID,
	})
}

// SyncObjectDefinition synchronizes a single object definition to the graph
// POST /api/v1/rag/graph/sync/object-definition/:id
func (h *RAGGraphHandler) SyncObjectDefinition(c *gin.Context) {
	// Parse object definition ID
	objectDefID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid object definition ID format",
		})
		return
	}

	// Sync object definition
	if err := h.nebulaSyncService.SyncObjectDefinition(c.Request.Context(), objectDefID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to sync object definition",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":             "Object definition synced successfully",
		"object_definition_id": objectDefID,
	})
}
