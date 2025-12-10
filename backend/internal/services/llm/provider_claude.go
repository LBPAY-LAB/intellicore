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

// ClaudeProvider implements the LLMProvider interface for Anthropic's Claude
type ClaudeProvider struct {
	BaseProvider
	httpClient *http.Client
	apiURL     string
}

// NewClaudeProvider creates a new Claude provider
func NewClaudeProvider(apiKey, model string) (*ClaudeProvider, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("Claude API key is required")
	}

	return &ClaudeProvider{
		BaseProvider: BaseProvider{
			APIKey: apiKey,
			Model:  model,
		},
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
		apiURL: "https://api.anthropic.com/v1/messages",
	}, nil
}

// claudeRequest represents the request format for Claude API
type claudeRequest struct {
	Model       string          `json:"model"`
	MaxTokens   int             `json:"max_tokens"`
	Temperature float64         `json:"temperature,omitempty"`
	System      string          `json:"system,omitempty"`
	Messages    []claudeMessage `json:"messages"`
}

type claudeMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// claudeResponse represents the response format from Claude API
type claudeResponse struct {
	ID           string               `json:"id"`
	Type         string               `json:"type"`
	Role         string               `json:"role"`
	Content      []claudeContentBlock `json:"content"`
	Model        string               `json:"model"`
	StopReason   string               `json:"stop_reason"`
	StopSequence *string              `json:"stop_sequence"`
	Usage        claudeUsage          `json:"usage"`
}

type claudeContentBlock struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type claudeUsage struct {
	InputTokens  int `json:"input_tokens"`
	OutputTokens int `json:"output_tokens"`
}

type claudeError struct {
	Type    string `json:"type"`
	Message string `json:"message"`
}

type claudeErrorResponse struct {
	Error claudeError `json:"error"`
}

// Chat sends a chat request to Claude
func (p *ClaudeProvider) Chat(ctx context.Context, messages []Message, options ChatOptions) (*ChatResponse, error) {
	// Convert messages to Claude format
	claudeMessages := make([]claudeMessage, 0, len(messages))
	for _, msg := range messages {
		// Claude doesn't accept "system" role in messages array
		if msg.Role != "system" {
			claudeMessages = append(claudeMessages, claudeMessage{
				Role:    msg.Role,
				Content: msg.Content,
			})
		}
	}

	// Build request
	reqBody := claudeRequest{
		Model:       p.Model,
		MaxTokens:   options.MaxTokens,
		Temperature: options.Temperature,
		System:      options.SystemPrompt,
		Messages:    claudeMessages,
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
	req.Header.Set("x-api-key", p.APIKey)
	req.Header.Set("anthropic-version", "2023-06-01")

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
		var errResp claudeErrorResponse
		if err := json.Unmarshal(body, &errResp); err != nil {
			return nil, fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
		}
		return nil, fmt.Errorf("Claude API error: %s", errResp.Error.Message)
	}

	// Parse response
	var claudeResp claudeResponse
	if err := json.Unmarshal(body, &claudeResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	// Extract text from content blocks
	var content string
	if len(claudeResp.Content) > 0 {
		content = claudeResp.Content[0].Text
	}

	return &ChatResponse{
		Content:      content,
		Model:        claudeResp.Model,
		TokensUsed:   claudeResp.Usage.InputTokens + claudeResp.Usage.OutputTokens,
		FinishReason: claudeResp.StopReason,
		Metadata: map[string]interface{}{
			"id":            claudeResp.ID,
			"input_tokens":  claudeResp.Usage.InputTokens,
			"output_tokens": claudeResp.Usage.OutputTokens,
		},
	}, nil
}
