package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Instance represents a "living cell" created from an ObjectDefinition
type Instance struct {
	ID                 uuid.UUID       `json:"id"`
	ObjectDefinitionID uuid.UUID       `json:"object_definition_id"`
	Data               json.RawMessage `json:"data"`
	CurrentState       string          `json:"current_state"`
	StateHistory       json.RawMessage `json:"state_history"`
	Version            int             `json:"version"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
	CreatedBy          *string         `json:"created_by,omitempty"`
	UpdatedBy          *string         `json:"updated_by,omitempty"`
	IsDeleted          bool            `json:"is_deleted"`
	DeletedAt          *time.Time      `json:"deleted_at,omitempty"`
	DeletedBy          *string         `json:"deleted_by,omitempty"`
}

// CreateInstanceRequest is the request body for creating an instance
type CreateInstanceRequest struct {
	ObjectDefinitionID uuid.UUID       `json:"object_definition_id" binding:"required"`
	Data               json.RawMessage `json:"data" binding:"required"`
}

// UpdateInstanceRequest is the request body for updating an instance
type UpdateInstanceRequest struct {
	Data json.RawMessage `json:"data" binding:"required"`
}

// TransitionStateRequest is the request body for transitioning an instance's state
type TransitionStateRequest struct {
	ToState string  `json:"to_state" binding:"required"`
	Reason  *string `json:"reason"`
}

// ListInstancesQuery represents query parameters for listing instances
type ListInstancesQuery struct {
	ObjectDefinitionID *uuid.UUID `form:"object_definition_id"`
	CurrentState       string     `form:"current_state"`
	IsDeleted          *bool      `form:"is_deleted"`
	Limit              int        `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset             int        `form:"offset" binding:"omitempty,min=0"`
}

// StateHistoryEntry represents a single state transition in the instance's history
type StateHistoryEntry struct {
	State     string    `json:"state"`
	Timestamp time.Time `json:"timestamp"`
	User      *string   `json:"user,omitempty"`
	Reason    *string   `json:"reason,omitempty"`
}
