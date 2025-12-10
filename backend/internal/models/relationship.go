package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Relationship represents a connection between two instances (the "synapses")
type Relationship struct {
	ID               uuid.UUID       `json:"id"`
	RelationshipType string          `json:"relationship_type"`
	SourceInstanceID uuid.UUID       `json:"source_instance_id"`
	TargetInstanceID uuid.UUID       `json:"target_instance_id"`
	Properties       json.RawMessage `json:"properties"`
	ValidFrom        *time.Time      `json:"valid_from,omitempty"`
	ValidUntil       *time.Time      `json:"valid_until,omitempty"`
	CreatedAt        time.Time       `json:"created_at"`
	CreatedBy        *string         `json:"created_by,omitempty"`
}

// CreateRelationshipRequest is the request body for creating a relationship
type CreateRelationshipRequest struct {
	RelationshipType string          `json:"relationship_type" binding:"required"`
	SourceInstanceID uuid.UUID       `json:"source_instance_id" binding:"required"`
	TargetInstanceID uuid.UUID       `json:"target_instance_id" binding:"required"`
	Properties       json.RawMessage `json:"properties"`
	ValidFrom        *time.Time      `json:"valid_from"`
	ValidUntil       *time.Time      `json:"valid_until"`
}

// ListRelationshipsQuery represents query parameters for listing relationships
type ListRelationshipsQuery struct {
	RelationshipType string     `form:"relationship_type"`
	SourceInstanceID *uuid.UUID `form:"source_instance_id"`
	TargetInstanceID *uuid.UUID `form:"target_instance_id"`
	Limit            int        `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset           int        `form:"offset" binding:"omitempty,min=0"`
}
