package validation

import (
	"encoding/json"
)

// RuleExecutor is the interface that all rule executors must implement
type RuleExecutor interface {
	// Execute runs the validation rule against the provided data
	// Returns nil if validation passes, error otherwise
	Execute(config json.RawMessage, data map[string]interface{}) error
}

// RegexConfig represents configuration for regex rule type
type RegexConfig struct {
	Field        string `json:"field"`
	Pattern      string `json:"pattern"`
	ErrorMessage string `json:"error_message,omitempty"`
}

// FunctionConfig represents configuration for JavaScript function rule type
type FunctionConfig struct {
	Code         string `json:"code"`
	ErrorMessage string `json:"error_message,omitempty"`
	Timeout      int    `json:"timeout,omitempty"` // in milliseconds
}

// APICallConfig represents configuration for API call rule type
type APICallConfig struct {
	Endpoint     string            `json:"endpoint"`
	Method       string            `json:"method"` // GET, POST, PUT, DELETE
	Headers      map[string]string `json:"headers,omitempty"`
	BodyTemplate string            `json:"body_template,omitempty"`
	Timeout      int               `json:"timeout,omitempty"`    // in milliseconds
	ErrorMessage string            `json:"error_message,omitempty"`
	// Response validation
	SuccessField string      `json:"success_field,omitempty"` // JSON path to success field
	SuccessValue interface{} `json:"success_value,omitempty"` // Expected success value
}

// SQLQueryConfig represents configuration for SQL query rule type
type SQLQueryConfig struct {
	Query        string            `json:"query"`
	Params       []string          `json:"params,omitempty"` // Field names to use as params
	ExpectExists bool              `json:"expect_exists"`    // true = expect rows, false = expect no rows
	ErrorMessage string            `json:"error_message,omitempty"`
}

// CompositeConfig represents configuration for composite rule type
type CompositeConfig struct {
	Rules        []CompositeRule `json:"rules"`
	Operator     string          `json:"operator"` // "AND" or "OR"
	ErrorMessage string          `json:"error_message,omitempty"`
}

// CompositeRule represents a single rule within a composite
type CompositeRule struct {
	RuleID   string `json:"rule_id,omitempty"`
	RuleName string `json:"rule_name,omitempty"`
}

// ValidationError represents a structured validation error
type ValidationError struct {
	Field   string `json:"field,omitempty"`
	Message string `json:"message"`
	Code    string `json:"code,omitempty"`
}

func (e *ValidationError) Error() string {
	if e.Field != "" {
		return e.Field + ": " + e.Message
	}
	return e.Message
}

// NewValidationError creates a new validation error
func NewValidationError(message string) *ValidationError {
	return &ValidationError{Message: message}
}

// NewFieldValidationError creates a new field-specific validation error
func NewFieldValidationError(field, message string) *ValidationError {
	return &ValidationError{Field: field, Message: message}
}
