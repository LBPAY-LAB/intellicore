package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Relationship representa um relacionamento entre duas instances
// Corresponde à tabela relationships no PostgreSQL
type Relationship struct {
	ID               uuid.UUID            `json:"id"`
	RelationshipType string               `json:"relationship_type"`
	SourceInstanceID uuid.UUID            `json:"source_instance_id"`
	TargetInstanceID uuid.UUID            `json:"target_instance_id"`
	Properties       RelationshipProperties `json:"properties"`
	ValidFrom        *time.Time           `json:"valid_from,omitempty"`
	ValidUntil       *time.Time           `json:"valid_until,omitempty"`
	CreatedAt        time.Time            `json:"created_at"`
	CreatedBy        *uuid.UUID           `json:"created_by,omitempty"`
}

// RelationshipProperties representa as propriedades (metadados) de um relacionamento
// Armazenado como JSONB no PostgreSQL
type RelationshipProperties map[string]interface{}

// Scan implements sql.Scanner for RelationshipProperties
func (rp *RelationshipProperties) Scan(value interface{}) error {
	if value == nil {
		*rp = make(RelationshipProperties)
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, rp)
}

// Value implements driver.Valuer for RelationshipProperties
func (rp RelationshipProperties) Value() (driver.Value, error) {
	if rp == nil {
		return json.Marshal(RelationshipProperties{})
	}
	return json.Marshal(rp)
}

// CreateRelationshipRequest representa o payload para criar um relationship
type CreateRelationshipRequest struct {
	RelationshipType string                 `json:"relationship_type" binding:"required"`
	SourceInstanceID uuid.UUID              `json:"source_instance_id" binding:"required"`
	TargetInstanceID uuid.UUID              `json:"target_instance_id" binding:"required"`
	Properties       RelationshipProperties `json:"properties,omitempty"`
	ValidFrom        *time.Time             `json:"valid_from,omitempty"`
	ValidUntil       *time.Time             `json:"valid_until,omitempty"`
}

// ListRelationshipsQuery representa os filtros para listar relationships
type ListRelationshipsQuery struct {
	SourceInstanceID *uuid.UUID `form:"source_instance_id"`
	TargetInstanceID *uuid.UUID `form:"target_instance_id"`
	RelationshipType *string    `form:"relationship_type"`
	Limit            int        `form:"limit"`
	Offset           int        `form:"offset"`
}

// ListRelationshipsResponse representa a resposta paginada de relationships
type ListRelationshipsResponse struct {
	Items   []Relationship `json:"items"`
	Total   int64          `json:"total"`
	Limit   int            `json:"limit"`
	Offset  int            `json:"offset"`
	HasMore bool           `json:"has_more"`
}

// RelationshipWithInstances representa um relacionamento com as instances completas
// Usado para queries de navegação do grafo
type RelationshipWithInstances struct {
	Relationship
	SourceInstance *Instance `json:"source_instance,omitempty"`
	TargetInstance *Instance `json:"target_instance,omitempty"`
}
