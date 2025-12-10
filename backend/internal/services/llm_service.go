package services

import (
	"context"
	"encoding/json"

	"github.com/lbpay/supercore/internal/services/llm"
)

// LLMService wrapper para compatibilidade com RAG
type LLMService struct {
	client llm.Client
}

// NewLLMService cria um novo LLM service
func NewLLMService(client llm.Client) *LLMService {
	return &LLMService{client: client}
}

// Generate gera texto usando o LLM
func (s *LLMService) Generate(ctx context.Context, prompt string, temperature float64) (string, error) {
	messages := []llm.Message{
		{
			Role:    "user",
			Content: prompt,
		},
	}

	options := llm.ChatOptions{
		Temperature: temperature,
		MaxTokens:   4096,
	}

	response, err := s.client.Chat(ctx, messages, options)
	if err != nil {
		return "", err
	}

	return response.Content, nil
}

// GenerateJSON gera e retorna JSON usando o LLM
func (s *LLMService) GenerateJSON(ctx context.Context, prompt string) (map[string]interface{}, error) {
	// Adiciona instrução para retornar JSON
	enhancedPrompt := prompt + "\n\nIMPORTANT: Return ONLY valid JSON, no markdown, no explanations."

	content, err := s.Generate(ctx, enhancedPrompt, 0.1)
	if err != nil {
		return nil, err
	}

	// Remove markdown code blocks se existirem
	content = cleanJSONResponse(content)

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(content), &result); err != nil {
		return nil, err
	}

	return result, nil
}

// cleanJSONResponse remove markdown code blocks
func cleanJSONResponse(content string) string {
	// Remove ```json e ``` se existirem
	if len(content) > 7 && content[:7] == "```json" {
		content = content[7:]
	}
	if len(content) > 3 && content[len(content)-3:] == "```" {
		content = content[:len(content)-3]
	}

	// Trim whitespace
	return trimWhitespace(content)
}

func trimWhitespace(s string) string {
	start := 0
	end := len(s)

	// Trim leading whitespace
	for start < end && (s[start] == ' ' || s[start] == '\n' || s[start] == '\r' || s[start] == '\t') {
		start++
	}

	// Trim trailing whitespace
	for end > start && (s[end-1] == ' ' || s[end-1] == '\n' || s[end-1] == '\r' || s[end-1] == '\t') {
		end--
	}

	return s[start:end]
}
