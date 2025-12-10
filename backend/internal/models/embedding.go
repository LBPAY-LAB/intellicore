package models

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ObjectType represents the type of object being embedded
type ObjectType string

const (
	ObjectTypeDefinition ObjectType = "object_definition"
	ObjectTypeInstance   ObjectType = "instance"
)

// Embedding represents a vector embedding for semantic search
type Embedding struct {
	ID         uuid.UUID       `json:"id"`
	ObjectType ObjectType      `json:"object_type"`
	ObjectID   uuid.UUID       `json:"object_id"`
	Content    string          `json:"content"`
	Embedding  []float32       `json:"embedding"`
	Metadata   json.RawMessage `json:"metadata"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
}

// EmbeddingMetadata contains additional context about the embedding
type EmbeddingMetadata struct {
	// For object_definition embeddings
	ObjectName    string  `json:"object_name,omitempty"`
	ObjectCategory string `json:"object_category,omitempty"`
	DisplayName   string  `json:"display_name,omitempty"`
	Description   *string `json:"description,omitempty"`

	// For instance embeddings
	InstanceState          string     `json:"instance_state,omitempty"`
	InstanceDefinitionID   *uuid.UUID `json:"instance_definition_id,omitempty"`
	InstanceDefinitionName string     `json:"instance_definition_name,omitempty"`

	// Common fields
	Tags      []string               `json:"tags,omitempty"`
	Custom    map[string]interface{} `json:"custom,omitempty"`
}

// CreateEmbeddingRequest is the request to create a new embedding
type CreateEmbeddingRequest struct {
	ObjectType ObjectType      `json:"object_type" binding:"required,oneof=object_definition instance"`
	ObjectID   uuid.UUID       `json:"object_id" binding:"required"`
	Content    string          `json:"content" binding:"required"`
	Metadata   json.RawMessage `json:"metadata"`
}

// SearchEmbeddingsRequest is the request for semantic search
type SearchEmbeddingsRequest struct {
	Query      string       `json:"query" binding:"required" form:"q"`
	Limit      int          `json:"limit" binding:"omitempty,min=1,max=100" form:"limit"`
	ObjectType *ObjectType  `json:"object_type" binding:"omitempty,oneof=object_definition instance" form:"object_type"`
	MinScore   *float32     `json:"min_score" binding:"omitempty,min=0,max=1" form:"min_score"`
	Categories []string     `json:"categories" form:"categories"`
}

// SearchResult represents a single search result with similarity score
type SearchResult struct {
	ID               uuid.UUID       `json:"id"`
	ObjectType       ObjectType      `json:"object_type"`
	ObjectID         uuid.UUID       `json:"object_id"`
	Content          string          `json:"content"`
	Metadata         json.RawMessage `json:"metadata"`
	SimilarityScore  float32         `json:"similarity_score"`

	// Embedded object details (populated via JOIN)
	ObjectName       *string         `json:"object_name,omitempty"`
	ObjectDisplayName *string        `json:"object_display_name,omitempty"`
	ObjectCategory   *string         `json:"object_category,omitempty"`
	InstanceState    *string         `json:"instance_state,omitempty"`
}

// SearchEmbeddingsResponse is the response for semantic search
type SearchEmbeddingsResponse struct {
	Results []SearchResult `json:"results"`
	Query   string         `json:"query"`
	Limit   int            `json:"limit"`
	Count   int            `json:"count"`
}

// GenerateEmbeddingRequest is the internal request to generate an embedding
type GenerateEmbeddingRequest struct {
	Text  string `json:"text"`
	Model string `json:"model"`
}

// GenerateEmbeddingResponse is the internal response from embedding generation
type GenerateEmbeddingResponse struct {
	Embedding []float32 `json:"embedding"`
	Model     string    `json:"model"`
	Tokens    int       `json:"tokens"`
}

// EmbeddingStats provides statistics about embeddings
type EmbeddingStats struct {
	TotalEmbeddings         int       `json:"total_embeddings"`
	ObjectDefinitionCount   int       `json:"object_definition_count"`
	InstanceCount           int       `json:"instance_count"`
	LastUpdated             time.Time `json:"last_updated"`
	AverageContentLength    int       `json:"average_content_length"`
}
