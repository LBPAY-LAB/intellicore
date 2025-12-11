package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Instance representa uma instância concreta de um ObjectDefinition
// Corresponde à tabela instances no PostgreSQL
type Instance struct {
	ID                 uuid.UUID       `json:"id"`
	ObjectDefinitionID uuid.UUID       `json:"object_definition_id"`
	Data               InstanceData    `json:"data"`
	CurrentState       string          `json:"current_state"`
	StateHistory       []StateTransition `json:"state_history"`
	CreatedAt          time.Time       `json:"created_at"`
	UpdatedAt          time.Time       `json:"updated_at"`
	CreatedBy          *uuid.UUID      `json:"created_by,omitempty"`
	UpdatedBy          *uuid.UUID      `json:"updated_by,omitempty"`
	Version            int             `json:"version"`
	IsDeleted          bool            `json:"is_deleted"`
	DeletedAt          *time.Time      `json:"deleted_at,omitempty"`
}

// InstanceData representa os dados da instância (armazenados como JSONB)
type InstanceData map[string]interface{}

// StateTransition representa uma transição de estado no histórico
type StateTransition struct {
	FromState string    `json:"from_state"`
	ToState   string    `json:"to_state"`
	Timestamp time.Time `json:"timestamp"`
	Comment   string    `json:"comment,omitempty"`
	ChangedBy *uuid.UUID `json:"changed_by,omitempty"`
}

// Scan implements sql.Scanner for InstanceData
func (id *InstanceData) Scan(value interface{}) error {
	if value == nil {
		*id = make(InstanceData)
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, id)
}

// Value implements driver.Valuer for InstanceData
func (id InstanceData) Value() (driver.Value, error) {
	if id == nil {
		return nil, nil
	}
	return json.Marshal(id)
}

// Scan implements sql.Scanner for StateTransition slice
func (st *[]StateTransition) Scan(value interface{}) error {
	if value == nil {
		*st = []StateTransition{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, st)
}

// Value implements driver.Valuer for StateTransition slice
func (st []StateTransition) Value() (driver.Value, error) {
	if st == nil {
		return json.Marshal([]StateTransition{})
	}
	return json.Marshal(st)
}

// CreateInstanceRequest representa o payload para criar uma instance
type CreateInstanceRequest struct {
	ObjectDefinitionID uuid.UUID    `json:"object_definition_id" binding:"required"`
	Data               InstanceData `json:"data" binding:"required"`
	InitialState       *string      `json:"initial_state,omitempty"`
}

// UpdateInstanceRequest representa o payload para atualizar uma instance
type UpdateInstanceRequest struct {
	Data InstanceData `json:"data" binding:"required"`
}

// TransitionStateRequest representa o payload para transição de estado
type TransitionStateRequest struct {
	ToState string  `json:"to_state" binding:"required"`
	Comment *string `json:"comment,omitempty"`
}

// ListInstancesQuery representa os filtros para listar instances
type ListInstancesQuery struct {
	ObjectDefinitionID *uuid.UUID        `form:"object_definition_id"`
	State              *string           `form:"state"`
	Filters            map[string]string `form:"filters"` // Filtros em campos JSONB
	Limit              int               `form:"limit"`
	Offset             int               `form:"offset"`
	SortBy             string            `form:"sort_by"`
	SortOrder          string            `form:"sort_order"` // asc ou desc
}

// ListInstancesResponse representa a resposta paginada de instances
type ListInstancesResponse struct {
	Items      []Instance `json:"items"`
	Total      int64      `json:"total"`
	Limit      int        `json:"limit"`
	Offset     int        `json:"offset"`
	HasMore    bool       `json:"has_more"`
}
