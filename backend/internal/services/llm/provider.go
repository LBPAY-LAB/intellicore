package llm

import (
	"context"
)

// LLMProvider is the interface that all LLM providers must implement
type LLMProvider interface {
	Chat(ctx context.Context, messages []Message, options ChatOptions) (*ChatResponse, error)
	GetModel() string
}

// BaseProvider contains common functionality for all providers
type BaseProvider struct {
	APIKey string
	Model  string
}

func (b *BaseProvider) GetModel() string {
	return b.Model
}
