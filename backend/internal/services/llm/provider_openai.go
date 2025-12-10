package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// OpenAIProvider implements the LLMProvider interface for OpenAI
type OpenAIProvider struct {
	BaseProvider
	httpClient *http.Client
	apiURL     string
}

// NewOpenAIProvider creates a new OpenAI provider
func NewOpenAIProvider(apiKey, model string) (*OpenAIProvider, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("OpenAI API key is required")
	}

	return &OpenAIProvider{
		BaseProvider: BaseProvider{
			APIKey: apiKey,
			Model:  model,
		},
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
		apiURL: "https://api.openai.com/v1/chat/completions",
	}, nil
}

// openAIRequest represents the request format for OpenAI API
type openAIRequest struct {
	Model       string          `json:"model"`
	Messages    []openAIMessage `json:"messages"`
	Temperature float64         `json:"temperature,omitempty"`
	MaxTokens   int             `json:"max_tokens,omitempty"`
}

type openAIMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// openAIResponse represents the response format from OpenAI API
type openAIResponse struct {
	ID      string         `json:"id"`
	Object  string         `json:"object"`
	Created int64          `json:"created"`
	Model   string         `json:"model"`
	Choices []openAIChoice `json:"choices"`
	Usage   openAIUsage    `json:"usage"`
}

type openAIChoice struct {
	Index        int           `json:"index"`
	Message      openAIMessage `json:"message"`
	FinishReason string        `json:"finish_reason"`
}

type openAIUsage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type openAIError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Code    string `json:"code"`
}

type openAIErrorResponse struct {
	Error openAIError `json:"error"`
}

// Chat sends a chat request to OpenAI
func (p *OpenAIProvider) Chat(ctx context.Context, messages []Message, options ChatOptions) (*ChatResponse, error) {
	// Convert messages to OpenAI format
	openAIMessages := make([]openAIMessage, 0, len(messages))

	// Add system prompt if provided
	if options.SystemPrompt != "" {
		openAIMessages = append(openAIMessages, openAIMessage{
			Role:    "system",
			Content: options.SystemPrompt,
		})
	}

	// Add user/assistant messages
	for _, msg := range messages {
		if msg.Role != "system" { // System already handled above
			openAIMessages = append(openAIMessages, openAIMessage{
				Role:    msg.Role,
				Content: msg.Content,
			})
		}
	}

	// Build request
	reqBody := openAIRequest{
		Model:       p.Model,
		Messages:    openAIMessages,
		Temperature: options.Temperature,
		MaxTokens:   options.MaxTokens,
	}

	// Marshal request
	reqJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, "POST", p.apiURL, bytes.NewBuffer(reqJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.APIKey)

	// Send request
	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check for errors
	if resp.StatusCode != http.StatusOK {
		var errResp openAIErrorResponse
		if err := json.Unmarshal(body, &errResp); err != nil {
			return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
		}
		return nil, fmt.Errorf("OpenAI API error: %s", errResp.Error.Message)
	}

	// Parse response
	var openAIResp openAIResponse
	if err := json.Unmarshal(body, &openAIResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	// Extract content from first choice
	if len(openAIResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices in response")
	}

	choice := openAIResp.Choices[0]

	return &ChatResponse{
		Content:      choice.Message.Content,
		Model:        openAIResp.Model,
		TokensUsed:   openAIResp.Usage.TotalTokens,
		FinishReason: choice.FinishReason,
		Metadata: map[string]interface{}{
			"id":                openAIResp.ID,
			"prompt_tokens":     openAIResp.Usage.PromptTokens,
			"completion_tokens": openAIResp.Usage.CompletionTokens,
		},
	}, nil
}
