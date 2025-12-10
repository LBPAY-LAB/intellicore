package llm

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

// Message represents a chat message in the conversation
type Message struct {
	Role    string `json:"role"`    // "user", "assistant", "system"
	Content string `json:"content"` // The message content
}

// ChatOptions configures the LLM chat request
type ChatOptions struct {
	Temperature   float64 `json:"temperature"`    // 0.0 to 1.0, controls randomness
	MaxTokens     int     `json:"max_tokens"`     // Maximum tokens in response
	SystemPrompt  string  `json:"system_prompt"`  // System-level instructions
	StreamEnabled bool    `json:"stream_enabled"` // Whether to stream the response
}

// ChatResponse represents the LLM response
type ChatResponse struct {
	Content      string                 `json:"content"`       // The generated text
	Model        string                 `json:"model"`         // Model used
	TokensUsed   int                    `json:"tokens_used"`   // Total tokens consumed
	FinishReason string                 `json:"finish_reason"` // Why generation stopped
	Metadata     map[string]interface{} `json:"metadata"`      // Additional response metadata
}

// ObjectDefinitionGeneration represents a generated object definition
type ObjectDefinitionGeneration struct {
	Name          string          `json:"name"`
	DisplayName   string          `json:"display_name"`
	Description   string          `json:"description"`
	Category      string          `json:"category"`
	Schema        json.RawMessage `json:"schema"`
	Rules         json.RawMessage `json:"rules"`
	States        json.RawMessage `json:"states"`
	UIHints       json.RawMessage `json:"ui_hints"`
	Relationships json.RawMessage `json:"relationships"`
	Confidence    float64         `json:"confidence"` // 0.0 to 1.0
	Explanation   string          `json:"explanation"`
}

// SchemaGenerationRequest contains parameters for generating an object schema
type SchemaGenerationRequest struct {
	UserDescription string   `json:"user_description"`
	RAGContext      string   `json:"rag_context"`
	Category        string   `json:"category"`
	Examples        []string `json:"examples"`
}

// SchemaRefinementRequest contains parameters for refining an existing schema
type SchemaRefinementRequest struct {
	CurrentSchema map[string]interface{} `json:"current_schema"`
	Feedback      string                 `json:"feedback"`
	RAGContext    string                 `json:"rag_context"`
}

// UsageMetrics tracks LLM usage for cost management
type UsageMetrics struct {
	RequestID     uuid.UUID `json:"request_id"`
	Model         string    `json:"model"`
	PromptTokens  int       `json:"prompt_tokens"`
	OutputTokens  int       `json:"output_tokens"`
	TotalTokens   int       `json:"total_tokens"`
	CostUSD       float64   `json:"cost_usd"`
	Latency       int64     `json:"latency_ms"`
	Timestamp     time.Time `json:"timestamp"`
	Endpoint      string    `json:"endpoint"`
	Success       bool      `json:"success"`
	ErrorMessage  string    `json:"error_message,omitempty"`
}

// Provider represents the LLM provider type
type Provider string

const (
	ProviderClaude Provider = "claude"
	ProviderOpenAI Provider = "openai"
)

// Model constants for different LLM providers
const (
	// Claude models (Anthropic)
	ModelClaudeSonnet35 = "claude-3-5-sonnet-20241022"
	ModelClaudeSonnet3  = "claude-3-sonnet-20240229"
	ModelClaudeHaiku3   = "claude-3-haiku-20240307"
	ModelClaudeOpus3    = "claude-3-opus-20240229"

	// OpenAI models
	ModelGPT4o     = "gpt-4o"
	ModelGPT4oMini = "gpt-4o-mini"
	ModelGPT4      = "gpt-4-turbo"
)

// Pricing per 1M tokens (input/output) in USD
var ModelPricing = map[string][2]float64{
	ModelClaudeSonnet35: {3.00, 15.00},
	ModelClaudeSonnet3:  {3.00, 15.00},
	ModelClaudeHaiku3:   {0.25, 1.25},
	ModelClaudeOpus3:    {15.00, 75.00},
	ModelGPT4o:          {2.50, 10.00},
	ModelGPT4oMini:      {0.15, 0.60},
	ModelGPT4:           {10.00, 30.00},
}

// CalculateCost calculates the cost of a request based on token usage
func CalculateCost(model string, promptTokens, outputTokens int) float64 {
	pricing, exists := ModelPricing[model]
	if !exists {
		return 0.0
	}

	inputCost := (float64(promptTokens) / 1000000.0) * pricing[0]
	outputCost := (float64(outputTokens) / 1000000.0) * pricing[1]

	return inputCost + outputCost
}
