package validation

import (
	"encoding/json"
	"testing"
)

func TestRegexRuleExecutor_Execute(t *testing.T) {
	executor := &RegexRuleExecutor{}

	tests := []struct {
		name        string
		config      RegexConfig
		data        map[string]interface{}
		expectError bool
	}{
		{
			name: "Valid CPF pattern",
			config: RegexConfig{
				Field:        "cpf",
				Pattern:      `^\d{11}$`,
				ErrorMessage: "CPF must have 11 digits",
			},
			data: map[string]interface{}{
				"cpf": "12345678901",
			},
			expectError: false,
		},
		{
			name: "Invalid CPF pattern",
			config: RegexConfig{
				Field:        "cpf",
				Pattern:      `^\d{11}$`,
				ErrorMessage: "CPF must have 11 digits",
			},
			data: map[string]interface{}{
				"cpf": "123",
			},
			expectError: true,
		},
		{
			name: "Valid email pattern",
			config: RegexConfig{
				Field:   "email",
				Pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
			},
			data: map[string]interface{}{
				"email": "user@example.com",
			},
			expectError: false,
		},
		{
			name: "Invalid email pattern",
			config: RegexConfig{
				Field:   "email",
				Pattern: `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`,
			},
			data: map[string]interface{}{
				"email": "invalid-email",
			},
			expectError: true,
		},
		{
			name: "Field not found",
			config: RegexConfig{
				Field:   "missing_field",
				Pattern: `.*`,
			},
			data: map[string]interface{}{
				"other_field": "value",
			},
			expectError: true,
		},
		{
			name: "Field value not string",
			config: RegexConfig{
				Field:   "number",
				Pattern: `.*`,
			},
			data: map[string]interface{}{
				"number": 123,
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			configJSON, _ := json.Marshal(tt.config)
			err := executor.Execute(configJSON, tt.data)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}

			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}
		})
	}
}

func TestRegexRuleExecutor_InvalidConfig(t *testing.T) {
	executor := &RegexRuleExecutor{}

	tests := []struct {
		name   string
		config string
	}{
		{
			name:   "Invalid JSON",
			config: `{invalid json}`,
		},
		{
			name:   "Missing field",
			config: `{"pattern": ".*"}`,
		},
		{
			name:   "Missing pattern",
			config: `{"field": "test"}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := executor.Execute(json.RawMessage(tt.config), map[string]interface{}{})
			if err == nil {
				t.Error("expected error for invalid config but got none")
			}
		})
	}
}
