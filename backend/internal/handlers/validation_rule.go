package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
)

type ValidationRuleHandler struct {
	db *database.DB
}

func NewValidationRuleHandler(db *database.DB) *ValidationRuleHandler {
	return &ValidationRuleHandler{db: db}
}

func (h *ValidationRuleHandler) List(c *gin.Context) {
	var query models.ListValidationRulesQuery
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
		SELECT id, name, display_name, description, rule_type, config, is_system, created_at, updated_at, created_by
		FROM validation_rules
		ORDER BY name
		LIMIT $1 OFFSET $2
	`, query.Limit, query.Offset)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query validation rules"})
		return
	}
	defer rows.Close()

	rules := []models.ValidationRule{}
	for rows.Next() {
		var rule models.ValidationRule
		err := rows.Scan(&rule.ID, &rule.Name, &rule.DisplayName, &rule.Description, &rule.RuleType,
			&rule.Config, &rule.IsSystem, &rule.CreatedAt, &rule.UpdatedAt, &rule.CreatedBy)
		if err != nil {
			continue
		}
		rules = append(rules, rule)
	}

	c.JSON(http.StatusOK, rules)
}

func (h *ValidationRuleHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var rule models.ValidationRule
	err = h.db.Pool.QueryRow(ctx, `
		SELECT id, name, display_name, description, rule_type, config, is_system, created_at, updated_at, created_by
		FROM validation_rules WHERE id = $1
	`, id).Scan(&rule.ID, &rule.Name, &rule.DisplayName, &rule.Description, &rule.RuleType,
		&rule.Config, &rule.IsSystem, &rule.CreatedAt, &rule.UpdatedAt, &rule.CreatedBy)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Validation rule not found"})
		return
	}

	c.JSON(http.StatusOK, rule)
}

func (h *ValidationRuleHandler) Create(c *gin.Context) {
	var req models.CreateValidationRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var rule models.ValidationRule
	err := h.db.Pool.QueryRow(ctx, `
		INSERT INTO validation_rules (name, display_name, description, rule_type, config, is_system)
		VALUES ($1, $2, $3, $4, $5, false)
		RETURNING id, name, display_name, description, rule_type, config, is_system, created_at, updated_at, created_by
	`, req.Name, req.DisplayName, req.Description, req.RuleType, req.Config).Scan(
		&rule.ID, &rule.Name, &rule.DisplayName, &rule.Description, &rule.RuleType,
		&rule.Config, &rule.IsSystem, &rule.CreatedAt, &rule.UpdatedAt, &rule.CreatedBy,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create validation rule: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, rule)
}

func (h *ValidationRuleHandler) Update(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	var req models.UpdateValidationRuleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if it's a system rule (can't update)
	var isSystem bool
	err = h.db.Pool.QueryRow(ctx, `SELECT is_system FROM validation_rules WHERE id = $1`, id).Scan(&isSystem)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Validation rule not found"})
		return
	}

	if isSystem {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot update system validation rules"})
		return
	}

	var rule models.ValidationRule
	err = h.db.Pool.QueryRow(ctx, `
		UPDATE validation_rules
		SET display_name = COALESCE($1, display_name),
		    description = COALESCE($2, description),
		    config = COALESCE($3, config),
		    updated_at = NOW()
		WHERE id = $4
		RETURNING id, name, display_name, description, rule_type, config, is_system, created_at, updated_at, created_by
	`, req.DisplayName, req.Description, req.Config, id).Scan(
		&rule.ID, &rule.Name, &rule.DisplayName, &rule.Description, &rule.RuleType,
		&rule.Config, &rule.IsSystem, &rule.CreatedAt, &rule.UpdatedAt, &rule.CreatedBy,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update validation rule"})
		return
	}

	c.JSON(http.StatusOK, rule)
}

func (h *ValidationRuleHandler) Delete(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Check if it's a system rule (can't delete)
	var isSystem bool
	err = h.db.Pool.QueryRow(ctx, `SELECT is_system FROM validation_rules WHERE id = $1`, id).Scan(&isSystem)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Validation rule not found"})
		return
	}

	if isSystem {
		c.JSON(http.StatusForbidden, gin.H{"error": "Cannot delete system validation rules"})
		return
	}

	result, err := h.db.Pool.Exec(ctx, `DELETE FROM validation_rules WHERE id = $1`, id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete validation rule"})
		return
	}

	if result.RowsAffected() == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Validation rule not found"})
		return
	}

	c.Status(http.StatusNoContent)
}
