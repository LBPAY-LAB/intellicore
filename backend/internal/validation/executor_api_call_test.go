package validation

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAPICallRuleExecutor_Execute(t *testing.T) {
	// Mock API server
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.URL.Path {
		case "/validate/success":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"valid": true}`))
		case "/validate/failure":
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"valid": false}`))
		case "/validate/error":
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte(`{"error": "Invalid input"}`))
		case "/validate/cpf":
			// Simulate CPF validation API
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"is_valid": true, "status": "active"}`))
		default:
			w.WriteHeader(http.StatusNotFound)
		}
	}))
	defer server.Close()

	executor := NewAPICallRuleExecutor()

	tests := []struct {
		name        string
		config      APICallConfig
		data        map[string]interface{}
		expectError bool
	}{
		{
			name: "Successful API call with success field validation",
			config: APICallConfig{
				Endpoint:     server.URL + "/validate/success",
				Method:       "POST",
				SuccessField: "valid",
				SuccessValue: true,
			},
			data: map[string]interface{}{
				"cpf": "12345678901",
			},
			expectError: false,
		},
		{
			name: "Failed API call - success field is false",
			config: APICallConfig{
				Endpoint:     server.URL + "/validate/failure",
				Method:       "POST",
				SuccessField: "valid",
				SuccessValue: true,
				ErrorMessage: "Validation failed",
			},
			data: map[string]interface{}{
				"cpf": "00000000000",
			},
			expectError: true,
		},
		{
			name: "API returns error status",
			config: APICallConfig{
				Endpoint:     server.URL + "/validate/error",
				Method:       "POST",
				ErrorMessage: "API validation error",
			},
			data:        map[string]interface{}{},
			expectError: true,
		},
		{
			name: "Template rendering in body",
			config: APICallConfig{
				Endpoint:     server.URL + "/validate/cpf",
				Method:       "POST",
				BodyTemplate: `{"cpf": "{{cpf}}", "name": "{{name}}"}`,
				SuccessField: "is_valid",
				SuccessValue: true,
			},
			data: map[string]interface{}{
				"cpf":  "12345678901",
				"name": "John Doe",
			},
			expectError: false,
		},
		{
			name: "Nested success field",
			config: APICallConfig{
				Endpoint:     server.URL + "/validate/cpf",
				Method:       "POST",
				SuccessField: "is_valid",
				SuccessValue: true,
			},
			data:        map[string]interface{}{},
			expectError: false,
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

func TestAPICallRuleExecutor_TemplateRendering(t *testing.T) {
	executor := NewAPICallRuleExecutor()

	tests := []struct {
		name     string
		template string
		data     map[string]interface{}
		expected string
	}{
		{
			name:     "Single field",
			template: `{"cpf": "{{cpf}}"}`,
			data: map[string]interface{}{
				"cpf": "12345678901",
			},
			expected: `{"cpf": "12345678901"}`,
		},
		{
			name:     "Multiple fields",
			template: `{"name": "{{name}}", "age": {{age}}}`,
			data: map[string]interface{}{
				"name": "John",
				"age":  30,
			},
			expected: `{"name": "John", "age": 30}`,
		},
		{
			name:     "Missing field",
			template: `{"field": "{{missing}}"}`,
			data:     map[string]interface{}{},
			expected: `{"field": "{{missing}}"}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executor.renderTemplate(tt.template, tt.data)
			if result != tt.expected {
				t.Errorf("renderTemplate() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestAPICallRuleExecutor_ExtractFieldValue(t *testing.T) {
	executor := NewAPICallRuleExecutor()

	data := map[string]interface{}{
		"user": map[string]interface{}{
			"profile": map[string]interface{}{
				"email": "test@example.com",
			},
			"status": "active",
		},
		"value": 100,
	}

	tests := []struct {
		name      string
		fieldPath string
		expected  interface{}
	}{
		{
			name:      "Simple field",
			fieldPath: "value",
			expected:  100,
		},
		{
			name:      "Nested field level 1",
			fieldPath: "user.status",
			expected:  "active",
		},
		{
			name:      "Nested field level 2",
			fieldPath: "user.profile.email",
			expected:  "test@example.com",
		},
		{
			name:      "Non-existent field",
			fieldPath: "missing.field",
			expected:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executor.extractFieldValue(data, tt.fieldPath)
			if result != tt.expected {
				t.Errorf("extractFieldValue() = %v, want %v", result, tt.expected)
			}
		})
	}
}

func TestAPICallRuleExecutor_IsTruthy(t *testing.T) {
	executor := NewAPICallRuleExecutor()

	tests := []struct {
		name     string
		value    interface{}
		expected bool
	}{
		{"nil", nil, false},
		{"true", true, true},
		{"false", false, false},
		{"empty string", "", false},
		{"non-empty string", "test", true},
		{"zero int", 0, false},
		{"non-zero int", 5, true},
		{"zero float", 0.0, false},
		{"non-zero float", 1.5, true},
		{"object", map[string]interface{}{"key": "value"}, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := executor.isTruthy(tt.value)
			if result != tt.expected {
				t.Errorf("isTruthy(%v) = %v, want %v", tt.value, result, tt.expected)
			}
		})
	}
}
