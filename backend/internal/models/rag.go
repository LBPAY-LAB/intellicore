package models

import "github.com/google/uuid"

// RAGSearchRequest represents the request body for RAG search
type RAGSearchRequest struct {
	Query      string     `form:"q" binding:"required,min=1"`
	Type       string     `form:"type" binding:"omitempty,oneof=all object_definitions instances relationships"`
	Category   *string    `form:"category"`
	IsActive   *bool      `form:"is_active"`
	State      *string    `form:"state"`
	ObjectDefID *uuid.UUID `form:"object_definition_id"`
	Limit      int        `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset     int        `form:"offset" binding:"omitempty,min=0"`
}

// RAGJSONBSearchRequest represents a JSONB-based search request
type RAGJSONBSearchRequest struct {
	JSONBPath string      `json:"jsonb_path" binding:"required"`
	Operator  string      `json:"operator" binding:"required,oneof== > < >= <= != @> <@ ? ?| ?&"`
	Value     interface{} `json:"value" binding:"required"`
	State     *string     `json:"state"`
	Limit     int         `json:"limit" binding:"omitempty,min=1,max=100"`
	Offset    int         `json:"offset" binding:"omitempty,min=0"`
}

// RAGRelationshipSearchRequest represents relationship search parameters
type RAGRelationshipSearchRequest struct {
	FromInstanceID   *uuid.UUID `form:"from_instance_id"`
	ToInstanceID     *uuid.UUID `form:"to_instance_id"`
	RelationshipType *string    `form:"relationship_type"`
	Limit            int        `form:"limit" binding:"omitempty,min=1,max=100"`
	Offset           int        `form:"offset" binding:"omitempty,min=0"`
}

// RAGRelatedInstancesRequest finds instances related to a given instance
type RAGRelatedInstancesRequest struct {
	InstanceID       uuid.UUID `json:"instance_id" binding:"required"`
	RelationshipType *string   `json:"relationship_type"`
	Depth            int       `json:"depth" binding:"omitempty,min=1,max=3"`
}

// RAGBatchSearchRequest for batch search operations
type RAGBatchSearchRequest struct {
	Queries []string `json:"queries" binding:"required,min=1,max=10"`
	Type    string   `json:"type" binding:"omitempty,oneof=all object_definitions instances relationships"`
	Limit   int      `json:"limit" binding:"omitempty,min=1,max=100"`
}
