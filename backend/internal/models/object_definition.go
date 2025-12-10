package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ObjectDefinition represents the "DNA" or "blueprint" for creating instances
type ObjectDefinition struct {
	ID          uuid.UUID       `json:"id"`
	Name        string          `json:"name"`
	DisplayName string          `json:"display_name"`
	Description *string         `json:"description,omitempty"`
	Version     int             `json:"version"`
	Schema      json.RawMessage `json:"schema"`
	Rules       json.RawMessage `json:"rules"`
	States      json.RawMessage `json:"states"`
	UIHints     json.RawMessage `json:"ui_hints"`
	Relationships json.RawMessage `json:"relationships"`
	Category    string          `json:"category"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
	CreatedBy   *string         `json:"created_by,omitempty"`
	IsActive    bool            `json:"is_active"`
}

// CreateObjectDefinitionRequest is the request body for creating an object definition
type CreateObjectDefinitionRequest struct {
	Name          string          `json:"name" binding:"required"`
	DisplayName   string          `json:"display_name" binding:"required"`
	Description   *string         `json:"description"`
	Schema        json.RawMessage `json:"schema" binding:"required"`
	Rules         json.RawMessage `json:"rules"`
	States        json.RawMessage `json:"states"`
	UIHints       json.RawMessage `json:"ui_hints"`
	Relationships json.RawMessage `json:"relationships"`
	Category      string          `json:"category" binding:"required,oneof=BUSINESS_ENTITY RULE POLICY INTEGRATION LOGIC"`
}

// UpdateObjectDefinitionRequest is the request body for updating an object definition
type UpdateObjectDefinitionRequest struct {
	DisplayName   *string         `json:"display_name"`
	Description   *string         `json:"description"`
	Schema        json.RawMessage `json:"schema"`
	Rules         json.RawMessage `json:"rules"`
	States        json.RawMessage `json:"states"`
	UIHints       json.RawMessage `json:"ui_hints"`
	Relationships json.RawMessage `json:"relationships"`
	Category      *string         `json:"category" binding:"omitempty,oneof=BUSINESS_ENTITY RULE POLICY INTEGRATION LOGIC"`
	IsActive      *bool           `json:"is_active"`
}

// ListObjectDefinitionsQuery represents query parameters for listing object definitions
type ListObjectDefinitionsQuery struct {
	Category string `form:"category"`
	IsActive *bool  `form:"is_active"`
	Limit    int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset   int    `form:"offset" binding:"omitempty,min=0"`
}
