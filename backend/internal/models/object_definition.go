package models

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ObjectDefinition representa a definição abstrata de um tipo de objeto
// Corresponde à tabela object_definitions no PostgreSQL
type ObjectDefinition struct {
	ID              uuid.UUID       `json:"id"`
	Name            string          `json:"name"`
	DisplayName     string          `json:"display_name"`
	Description     string          `json:"description"`
	Schema          JSONSchema      `json:"schema"`
	States          FSMDefinition   `json:"states"`
	ValidationRules json.RawMessage `json:"validation_rules"`
	Relationships   json.RawMessage `json:"relationships"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
	IsActive        bool            `json:"is_active"`
	Version         int             `json:"version"`
}

// JSONSchema representa um JSON Schema Draft 7
// É armazenado como JSONB no PostgreSQL
type JSONSchema map[string]interface{}

// FSMDefinition representa uma Finite State Machine
type FSMDefinition struct {
	Initial     string           `json:"initial"`
	States      []string         `json:"states"`
	Transitions []FSMTransition  `json:"transitions"`
}

// FSMTransition representa uma transição válida no FSM
type FSMTransition struct {
	From    string   `json:"from"`
	To      string   `json:"to"`
	Event   string   `json:"event,omitempty"`
	Guards  []string `json:"guards,omitempty"`
}

// Scan implements sql.Scanner for JSONSchema
func (j *JSONSchema) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONSchema)
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, j)
}

// Value implements driver.Valuer for JSONSchema
func (j JSONSchema) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements sql.Scanner for FSMDefinition
func (f *FSMDefinition) Scan(value interface{}) error {
	if value == nil {
		*f = FSMDefinition{
			Initial:     "ACTIVE",
			States:      []string{"ACTIVE"},
			Transitions: []FSMTransition{},
		}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, f)
}

// Value implements driver.Valuer for FSMDefinition
func (f FSMDefinition) Value() (driver.Value, error) {
	return json.Marshal(f)
}

// Validate valida se o ObjectDefinition está correto
func (od *ObjectDefinition) Validate() error {
	// TODO: Implementar validações:
	// - Name não pode estar vazio
	// - Name deve ser slug (lowercase, underscores)
	// - Schema deve ser JSON Schema válido
	// - States deve ter pelo menos 1 estado
	// - Initial state deve existir em States
	// - Transitions devem referenciar estados válidos
	return nil
}

// CreateObjectDefinitionRequest representa o payload para criar um object_definition
type CreateObjectDefinitionRequest struct {
	Name            string          `json:"name" binding:"required"`
	DisplayName     string          `json:"display_name"`
	Description     string          `json:"description"`
	Schema          JSONSchema      `json:"schema" binding:"required"`
	States          *FSMDefinition  `json:"states,omitempty"`
	ValidationRules json.RawMessage `json:"validation_rules,omitempty"`
	Relationships   json.RawMessage `json:"relationships,omitempty"`
}

// UpdateObjectDefinitionRequest representa o payload para atualizar um object_definition
type UpdateObjectDefinitionRequest struct {
	DisplayName     *string         `json:"display_name,omitempty"`
	Description     *string         `json:"description,omitempty"`
	Schema          JSONSchema      `json:"schema,omitempty"`
	States          *FSMDefinition  `json:"states,omitempty"`
	ValidationRules json.RawMessage `json:"validation_rules,omitempty"`
	Relationships   json.RawMessage `json:"relationships,omitempty"`
	IsActive        *bool           `json:"is_active,omitempty"`
}
