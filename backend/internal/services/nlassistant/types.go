package nlassistant

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// ConversationStep defines a single step in the conversation flow
type ConversationStep struct {
	StepNumber int      `json:"step_number"`
	Question   string   `json:"question"`
	Type       string   `json:"type"` // "text", "select", "multiselect", "confirm"
	Options    []string `json:"options,omitempty"`
	Hint       string   `json:"hint,omitempty"`
}

// Conversation represents an active or completed conversation session
type Conversation struct {
	ID                        uuid.UUID                `json:"id"`
	CurrentStep               int                      `json:"current_step"`
	TotalSteps                int                      `json:"total_steps"`
	Answers                   map[string]string        `json:"answers"`
	PreviewSchema             *ObjectDefinitionPreview `json:"preview_schema,omitempty"`
	Completed                 bool                     `json:"completed"`
	Confirmed                 bool                     `json:"confirmed"`
	CreatedObjectDefinitionID *uuid.UUID               `json:"created_object_definition_id,omitempty"`
	CreatedAt                 time.Time                `json:"created_at"`
	UpdatedAt                 time.Time                `json:"updated_at"`
	CreatedBy                 string                   `json:"created_by,omitempty"`
}

// ObjectDefinitionPreview represents the LLM-generated preview before confirmation
type ObjectDefinitionPreview struct {
	Name          string          `json:"name"`
	DisplayName   string          `json:"display_name"`
	Description   string          `json:"description"`
	Category      string          `json:"category"`
	Schema        json.RawMessage `json:"schema"`
	States        json.RawMessage `json:"states"`
	Rules         json.RawMessage `json:"rules"`
	UIHints       json.RawMessage `json:"ui_hints"`
	Relationships json.RawMessage `json:"relationships"`
	FieldCount    int             `json:"field_count"`    // UI metadata
	StateCount    int             `json:"state_count"`    // UI metadata
	Confidence    float64         `json:"confidence"`     // LLM confidence score
	Explanation   string          `json:"explanation"`    // Why the LLM made these choices
}

// ConversationResponse is what we return to the frontend after each step
type ConversationResponse struct {
	ConversationID uuid.UUID                `json:"conversation_id"`
	CurrentStep    int                      `json:"current_step"`
	NextStep       *ConversationStep        `json:"next_step,omitempty"`
	Preview        *ObjectDefinitionPreview `json:"preview,omitempty"`
	Completed      bool                     `json:"completed"`
	Message        string                   `json:"message"`
}

// SendMessageRequest is the request to send a message/answer
type SendMessageRequest struct {
	Message string `json:"message" binding:"required"`
}

// ConversationFlow defines the structured conversation steps
var ConversationFlow = []ConversationStep{
	{
		StepNumber: 1,
		Question:   "Qual o nome do objeto que você quer criar? (Ex: Cliente Pessoa Física, Conta Investimento)",
		Type:       "text",
		Hint:       "Use um nome descritivo que o time de negócio entenda",
	},
	{
		StepNumber: 2,
		Question:   "Descreva em suas palavras o que é esse objeto e para que serve.",
		Type:       "text",
		Hint:       "Ex: 'Um cliente pessoa física é uma pessoa que tem conta no banco e precisa passar por KYC'",
	},
	{
		StepNumber: 3,
		Question:   "Quais informações precisam ser coletadas? Liste os campos necessários.",
		Type:       "text",
		Hint:       "Ex: CPF, Nome Completo, Data de Nascimento, Endereço, Telefone, Email",
	},
	{
		StepNumber: 4,
		Question:   "Algum desses campos tem validação especial do BACEN ou compliance?",
		Type:       "multiselect",
		Options:    []string{"CPF (validação completa)", "CNPJ", "Email", "Telefone BR", "CEP", "Nenhum"},
	},
	{
		StepNumber: 5,
		Question:   "Quais são os estados possíveis deste objeto durante seu ciclo de vida?",
		Type:       "text",
		Hint:       "Ex: Cadastro Pendente, Ativo, Bloqueado, Inativo",
	},
	{
		StepNumber: 6,
		Question:   "Este objeto se relaciona com quais outros objetos?",
		Type:       "text",
		Hint:       "Ex: Cliente pode ser TITULAR de Conta, PAI de outro Cliente (dependente)",
	},
	{
		StepNumber: 7,
		Question:   "Vou mostrar um preview do que será criado. Confirma?",
		Type:       "confirm",
	},
}
