package validation

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// APICallRuleExecutor executes validation rules by calling external APIs
type APICallRuleExecutor struct {
	httpClient *http.Client
}

// NewAPICallRuleExecutor creates a new API call executor with a configured HTTP client
func NewAPICallRuleExecutor() *APICallRuleExecutor {
	return &APICallRuleExecutor{
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// Execute calls an external API to validate data
func (e *APICallRuleExecutor) Execute(configJSON json.RawMessage, data map[string]interface{}) error {
	var config APICallConfig
	if err := json.Unmarshal(configJSON, &config); err != nil {
		return fmt.Errorf("failed to parse API call config: %w", err)
	}

	// Validate configuration
	if config.Endpoint == "" {
		return fmt.Errorf("api_call rule: endpoint is required")
	}

	if config.Method == "" {
		config.Method = "POST"
	}

	// Set default timeout
	timeout := config.Timeout
	if timeout == 0 {
		timeout = 5000 // 5 seconds default
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Millisecond)
	defer cancel()

	// Render body template if provided
	var body []byte
	var err error
	if config.BodyTemplate != "" {
		bodyStr := e.renderTemplate(config.BodyTemplate, data)
		body = []byte(bodyStr)
	} else {
		// Send data as JSON by default
		body, err = json.Marshal(data)
		if err != nil {
			return fmt.Errorf("failed to marshal request body: %w", err)
		}
	}

	// Create HTTP request
	req, err := http.NewRequestWithContext(ctx, config.Method, config.Endpoint, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	for key, value := range config.Headers {
		req.Header.Set(key, value)
	}

	// Execute request
	resp, err := e.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("API call failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("failed to read response body: %w", err)
	}

	// Check HTTP status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		errMsg := config.ErrorMessage
		if errMsg == "" {
			errMsg = fmt.Sprintf("API returned status %d: %s", resp.StatusCode, string(respBody))
		}
		return NewValidationError(errMsg)
	}

	// If SuccessField is specified, validate response
	if config.SuccessField != "" {
		var respData map[string]interface{}
		if err := json.Unmarshal(respBody, &respData); err != nil {
			return fmt.Errorf("failed to parse API response as JSON: %w", err)
		}

		// Extract success field value
		fieldValue := e.extractFieldValue(respData, config.SuccessField)

		// Compare with expected success value
		if config.SuccessValue != nil {
			if fieldValue != config.SuccessValue {
				errMsg := config.ErrorMessage
				if errMsg == "" {
					errMsg = fmt.Sprintf("API validation failed: expected %v, got %v", config.SuccessValue, fieldValue)
				}
				return NewValidationError(errMsg)
			}
		} else {
			// If no success value specified, just check if field is truthy
			if !e.isTruthy(fieldValue) {
				errMsg := config.ErrorMessage
				if errMsg == "" {
					errMsg = "API validation failed"
				}
				return NewValidationError(errMsg)
			}
		}
	}

	return nil
}

// renderTemplate renders a template string by replacing {{field}} with data values
func (e *APICallRuleExecutor) renderTemplate(template string, data map[string]interface{}) string {
	result := template
	for key, value := range data {
		placeholder := fmt.Sprintf("{{%s}}", key)
		valueStr := fmt.Sprintf("%v", value)
		result = strings.ReplaceAll(result, placeholder, valueStr)
	}
	return result
}

// extractFieldValue extracts a field value from nested map using dot notation
func (e *APICallRuleExecutor) extractFieldValue(data map[string]interface{}, fieldPath string) interface{} {
	parts := strings.Split(fieldPath, ".")
	current := interface{}(data)

	for _, part := range parts {
		if m, ok := current.(map[string]interface{}); ok {
			current = m[part]
		} else {
			return nil
		}
	}

	return current
}

// isTruthy checks if a value is truthy
func (e *APICallRuleExecutor) isTruthy(value interface{}) bool {
	if value == nil {
		return false
	}

	switch v := value.(type) {
	case bool:
		return v
	case string:
		return v != ""
	case int, int64, float64:
		return v != 0
	default:
		return true
	}
}
