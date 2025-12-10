package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ValidationRule represents a reusable validation rule
type ValidationRule struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	DisplayName *string         `json:"display_name,omitempty"`
	Description *string         `json:"description,omitempty"`
	RuleType    string          `json:"rule_type"`
	Config      json.RawMessage `json:"config"`
	IsSystem    bool            `json:"is_system"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	CreatedBy   *string         `json:"created_by,omitempty"`
}

// CreateValidationRuleRequest is the request body for creating a validation rule
type CreateValidationRuleRequest struct {
	Name        string          `json:"name" binding:"required"`
	DisplayName *string         `json:"display_name"`
	Description *string         `json:"description"`
	RuleType    string          `json:"rule_type" binding:"required,oneof=custom regex function api_call sql_query composite"`
	Config      json.RawMessage `json:"config" binding:"required"`
}

// UpdateValidationRuleRequest is the request body for updating a validation rule
type UpdateValidationRuleRequest struct {
	DisplayName *string         `json:"display_name"`
	Description *string         `json:"description"`
	Config      json.RawMessage `json:"config"`
}

// ListValidationRulesQuery represents query parameters for listing validation rules
type ListValidationRulesQuery struct {
	RuleType string `form:"rule_type"`
	IsSystem *bool  `form:"is_system"`
	Limit    int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset   int    `form:"offset" binding:"omitempty,min=0"`
}
