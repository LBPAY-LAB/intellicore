package handlers

import (
	"context"
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
	"github.com/lbpay/supercore/internal/services"
)

type RelationshipHandler struct {
	db        *database.DB
	validator *services.RelationshipValidator
}

func NewRelationshipHandler(db *database.DB) *RelationshipHandler {
	return &RelationshipHandler{
		db:        db,
		validator: services.NewRelationshipValidator(db.Pool),
	}
}

func (h *RelationshipHandler) List(c *gin.Context) {
	var query models.ListRelationshipsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if query.Limit == 0 {
		query.Limit = 20
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := h.db.Pool.Query(ctx, `
		SELECT id, relationship_type, source_instance_id, target_instance_id, properties, valid_from, valid_until, created_at, created_by
		FROM relationships
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`, query.Limit, query.Offset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query relationships"})
		return
	}
	defer rows.Close()

	relationships := []models.Relationship{}
	for rows.Next() {
		var rel models.Relationship
		err := rows.Scan(&rel.ID, &rel.RelationshipType, &rel.SourceInstanceID, &rel.TargetInstanceID,
			&rel.Properties, &rel.ValidFrom, &rel.ValidUntil, &rel.CreatedAt, &rel.CreatedBy)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to scan relationship"})
			return
		}
		relationships = append(relationships, rel)
	}

	c.JSON(http.StatusOK, relationships)
}

func (h *RelationshipHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var rel models.Relationship
	err = h.db.Pool.QueryRow(ctx, `
		SELECT id, relationship_type, source_instance_id, target_instance_id, properties, valid_from, valid_until, created_at, created_by
		FROM relationships WHERE id = $1
	`, id).Scan(&rel.ID, &rel.RelationshipType, &rel.SourceInstanceID, &rel.TargetInstanceID,
		&rel.Properties, &rel.ValidFrom, &rel.ValidUntil, &rel.CreatedAt, &rel.CreatedBy)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Relationship not found"})
		return
	}

	c.JSON(http.StatusOK, rel)
}

func (h *RelationshipHandler) Create(c *gin.Context) {
	var req models.CreateRelationshipRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Validate the relationship
	if err := h.validator.ValidateRelationship(ctx, req); err != nil {
		var validationErr models.RelationshipValidationError
		if errors.As(err, &validationErr) {
			c.JSON(http.StatusUnprocessableEntity, gin.H{
				"error": validationErr.Message,
				"code":  validationErr.Code,
				"field": validationErr.Field,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Validation failed: " + err.Error()})
		return
	}

	// Create the relationship
	var rel models.Relationship
	err := h.db.Pool.QueryRow(ctx, `
		INSERT INTO relationships (relationship_type, source_instance_id, target_instance_id, properties, valid_from, valid_until)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, relationship_type, source_instance_id, target_instance_id, properties, valid_from, valid_until, created_at, created_by
	`, req.RelationshipType, req.SourceInstanceID, req.TargetInstanceID, req.Properties, req.ValidFrom, req.ValidUntil).Scan(
		&rel.ID, &rel.RelationshipType, &rel.SourceInstanceID, &rel.TargetInstanceID,
		&rel.Properties, &rel.ValidFrom, &rel.ValidUntil, &rel.CreatedAt, &rel.CreatedBy,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create relationship: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, rel)
}

func (h *RelationshipHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	// Parse cascade query parameter
	cascadeStr := c.DefaultQuery("cascade", "false")
	cascade, err := strconv.ParseBool(cascadeStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid cascade parameter, must be true or false"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Validate deletion
	if err := h.validator.ValidateRelationshipDeletion(ctx, id, cascade); err != nil {
		var validationErr models.RelationshipValidationError
		if errors.As(err, &validationErr) {
			statusCode := http.StatusUnprocessableEntity
			if validationErr.Code == models.ErrCodeInstanceNotFound {
				statusCode = http.StatusNotFound
			}
			c.JSON(statusCode, gin.H{
				"error": validationErr.Message,
				"code":  validationErr.Code,
				"field": validationErr.Field,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Validation failed: " + err.Error()})
		return
	}

	// Begin transaction for cascade delete
	tx, err := h.db.Pool.Begin(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to begin transaction"})
		return
	}
	defer tx.Rollback(ctx)

	deletedCount := 0

	// If cascade is enabled, get and delete dependent relationships
	if cascade {
		cascadeIDs, err := h.validator.GetCascadeDeleteIDs(ctx, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cascade relationships"})
			return
		}

		// Delete cascade relationships recursively
		for _, cascadeID := range cascadeIDs {
			result, err := tx.Exec(ctx, `DELETE FROM relationships WHERE id = $1`, cascadeID)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete cascade relationship"})
				return
			}
			deletedCount += int(result.RowsAffected())
		}
	}

	// Delete the main relationship
	result, err := tx.Exec(ctx, `DELETE FROM relationships WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete relationship"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Relationship not found"})
		return
	}
	deletedCount++

	// Commit transaction
	if err := tx.Commit(ctx); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	// Return success with deletion details
	if deletedCount > 1 {
		c.JSON(http.StatusOK, gin.H{
			"message":        "Relationship deleted successfully with cascade",
			"deleted_count":  deletedCount,
			"cascade_enabled": true,
		})
	} else {
		c.Status(http.StatusNoContent)
	}
}

func (h *RelationshipHandler) GetByInstance(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	rows, err := h.db.Pool.Query(ctx, `
		SELECT id, relationship_type, source_instance_id, target_instance_id, properties, valid_from, valid_until, created_at, created_by
		FROM relationships
		WHERE source_instance_id = $1 OR target_instance_id = $1
		ORDER BY created_at DESC
	`, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query relationships"})
		return
	}
	defer rows.Close()

	relationships := []models.Relationship{}
	for rows.Next() {
		var rel models.Relationship
		err := rows.Scan(&rel.ID, &rel.RelationshipType, &rel.SourceInstanceID, &rel.TargetInstanceID,
			&rel.Properties, &rel.ValidFrom, &rel.ValidUntil, &rel.CreatedAt, &rel.CreatedBy)
		if err != nil {
			continue
		}
		relationships = append(relationships, rel)
	}

	c.JSON(http.StatusOK, relationships)
}
