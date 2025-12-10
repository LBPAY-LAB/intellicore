package validator

import (
	"context"
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lbpay/supercore/internal/database"
)

// TestEvaluateNumericComparison tests numeric comparison expressions
func TestEvaluateNumericComparison(t *testing.T) {
	v := &Validator{}

	tests := []struct {
		name       string
		expression string
		value      interface{}
		shouldPass bool
	}{
		{"Greater than - pass", "value >= 0", 100.0, true},
		{"Greater than - fail", "value >= 0", -10.0, false},
		{"Greater than equal - pass", "value >= 100", 100.0, true},
		{"Greater than equal - fail", "value >= 100", 99.0, false},
		{"Less than - pass", "value < 100", 50.0, true},
		{"Less than - fail", "value < 100", 100.0, false},
		{"Less than equal - pass", "value <= 100", 100.0, true},
		{"Less than equal - fail", "value <= 100", 101.0, false},
		{"Equal - pass", "value == 100", 100.0, true},
		{"Equal - fail", "value == 100", 99.0, false},
		{"Not equal - pass", "value != 0", 100.0, true},
		{"Not equal - fail", "value != 100", 100.0, false},
		{"Integer value", "value >= 0", 100, true},
		{"String number", "value >= 0", "100", true},
		{"Negative comparison", "value >= -10", -5.0, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.evaluateNumericComparison(tt.expression, tt.value)
			if tt.shouldPass && err != nil {
				t.Errorf("Expected expression to pass, but got error: %v", err)
			}
			if !tt.shouldPass && err == nil {
				t.Errorf("Expected expression to fail, but it passed")
			}
		})
	}
}

// TestEvaluateRegex tests regex pattern matching
func TestEvaluateRegex(t *testing.T) {
	v := &Validator{}

	tests := []struct {
		name       string
		pattern    string
		value      interface{}
		shouldPass bool
	}{
		{"CPF pattern - valid", `^\d{3}\.\d{3}\.\d{3}-\d{2}$`, "123.456.789-00", true},
		{"CPF pattern - invalid", `^\d{3}\.\d{3}\.\d{3}-\d{2}$`, "12345678900", false},
		{"Email pattern - valid", `^[\w\.-]+@[\w\.-]+\.\w+$`, "user@example.com", true},
		{"Email pattern - invalid", `^[\w\.-]+@[\w\.-]+\.\w+$`, "invalid-email", false},
		{"Phone pattern - valid", `^\(\d{2}\)\s\d{4,5}-\d{4}$`, "(11) 98765-4321", true},
		{"Phone pattern - invalid", `^\(\d{2}\)\s\d{4,5}-\d{4}$`, "11987654321", false},
		{"Non-string value", `^\d+$`, 123, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.evaluateRegex(tt.pattern, tt.value)
			if tt.shouldPass && err != nil {
				t.Errorf("Expected pattern to match, but got error: %v", err)
			}
			if !tt.shouldPass && err == nil {
				t.Errorf("Expected pattern to not match, but it did")
			}
		})
	}
}

// TestEvaluateLengthCheck tests length comparison expressions
func TestEvaluateLengthCheck(t *testing.T) {
	v := &Validator{}

	tests := []struct {
		name       string
		expression string
		value      interface{}
		shouldPass bool
	}{
		{"String length greater - pass", "len(value) > 5", "hello world", true},
		{"String length greater - fail", "len(value) > 5", "hi", false},
		{"String length equal - pass", "len(value) == 5", "hello", true},
		{"String length equal - fail", "len(value) == 5", "hi", false},
		{"Array length - pass", "len(value) >= 2", []interface{}{1, 2, 3}, true},
		{"Array length - fail", "len(value) >= 5", []interface{}{1, 2}, false},
		{"Map length - pass", "len(value) > 0", map[string]interface{}{"key": "value"}, true},
		{"Map length - fail", "len(value) > 1", map[string]interface{}{"key": "value"}, false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.evaluateLengthCheck(tt.expression, tt.value)
			if tt.shouldPass && err != nil {
				t.Errorf("Expected length check to pass, but got error: %v", err)
			}
			if !tt.shouldPass && err == nil {
				t.Errorf("Expected length check to fail, but it passed")
			}
		})
	}
}

// TestEvaluateSimpleExpression tests the simple expression router
func TestEvaluateSimpleExpression(t *testing.T) {
	v := &Validator{}

	tests := []struct {
		name       string
		expression string
		value      interface{}
		shouldPass bool
	}{
		{"Numeric comparison", "value >= 0", 100.0, true},
		{"Regex match", `matches "^\d{3}\.\d{3}\.\d{3}-\d{2}$"`, "123.456.789-00", true},
		{"Length check", "len(value) > 5", "hello world", true},
		{"Unsupported format", "custom_function(value)", "test", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.evaluateSimpleExpression(tt.expression, tt.value)
			if tt.shouldPass && err != nil {
				t.Errorf("Expected expression to pass, but got error: %v", err)
			}
			if !tt.shouldPass && err == nil {
				t.Errorf("Expected expression to fail, but it passed")
			}
		})
	}
}

// TestEvaluateCELExpression tests CEL expression evaluation
func TestEvaluateCELExpression(t *testing.T) {
	v := &Validator{}

	tests := []struct {
		name       string
		expression string
		data       map[string]interface{}
		shouldPass bool
	}{
		{
			name:       "Simple field comparison",
			expression: "data.balance >= 0",
			data:       map[string]interface{}{"balance": 100.0},
			shouldPass: true,
		},
		{
			name:       "Simple field comparison - fail",
			expression: "data.balance >= 0",
			data:       map[string]interface{}{"balance": -10.0},
			shouldPass: false,
		},
		{
			name:       "Complex expression",
			expression: "data.balance >= 0 && data.status == 'active'",
			data:       map[string]interface{}{"balance": 100.0, "status": "active"},
			shouldPass: true,
		},
		{
			name:       "Complex expression - fail",
			expression: "data.balance >= 0 && data.status == 'active'",
			data:       map[string]interface{}{"balance": 100.0, "status": "inactive"},
			shouldPass: false,
		},
		{
			name:       "String operations",
			expression: "data.name.startsWith('John')",
			data:       map[string]interface{}{"name": "John Doe"},
			shouldPass: true,
		},
		{
			name:       "List operations",
			expression: "data.items.size() > 0",
			data:       map[string]interface{}{"items": []interface{}{1, 2, 3}},
			shouldPass: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := v.evaluateCELExpression(tt.expression, tt.data)
			if tt.shouldPass && err != nil {
				t.Errorf("Expected CEL expression to pass, but got error: %v", err)
			}
			if !tt.shouldPass && err == nil {
				t.Errorf("Expected CEL expression to fail, but it passed")
			}
		})
	}
}

// TestExecuteCustomRule tests custom rule execution with configuration
func TestExecuteCustomRule(t *testing.T) {
	v := &Validator{}
	ctx := context.Background()

	tests := []struct {
		name       string
		config     CustomRuleConfig
		data       map[string]interface{}
		shouldPass bool
	}{
		{
			name: "Simple numeric rule - pass",
			config: CustomRuleConfig{
				Expression:   "value >= 0",
				ErrorMessage: "Balance must be non-negative",
				Field:        "balance",
			},
			data:       map[string]interface{}{"balance": 100.0},
			shouldPass: true,
		},
		{
			name: "Simple numeric rule - fail",
			config: CustomRuleConfig{
				Expression:   "value >= 0",
				ErrorMessage: "Balance must be non-negative",
				Field:        "balance",
			},
			data:       map[string]interface{}{"balance": -10.0},
			shouldPass: false,
		},
		{
			name: "Field missing - fail on missing true",
			config: CustomRuleConfig{
				Expression:    "value >= 0",
				Field:         "balance",
				FailOnMissing: true,
			},
			data:       map[string]interface{}{"other": "value"},
			shouldPass: false,
		},
		{
			name: "Field missing - fail on missing false",
			config: CustomRuleConfig{
				Expression:    "value >= 0",
				Field:         "balance",
				FailOnMissing: false,
			},
			data:       map[string]interface{}{"other": "value"},
			shouldPass: true,
		},
		{
			name: "Regex validation - CPF",
			config: CustomRuleConfig{
				Expression:   `matches "^\d{3}\.\d{3}\.\d{3}-\d{2}$"`,
				ErrorMessage: "Invalid CPF format",
				Field:        "cpf",
			},
			data:       map[string]interface{}{"cpf": "123.456.789-00"},
			shouldPass: true,
		},
		{
			name: "Length validation",
			config: CustomRuleConfig{
				Expression:   "len(value) >= 8",
				ErrorMessage: "Password must be at least 8 characters",
				Field:        "password",
			},
			data:       map[string]interface{}{"password": "secret123"},
			shouldPass: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			configJSON, _ := json.Marshal(tt.config)
			displayName := tt.name
			err := v.executeCustomRule(ctx, configJSON, tt.data, &displayName)
			if tt.shouldPass && err != nil {
				t.Errorf("Expected rule to pass, but got error: %v", err)
			}
			if !tt.shouldPass && err == nil {
				t.Errorf("Expected rule to fail, but it passed")
			}
		})
	}
}

// Integration test helpers

// mockDB creates a mock database for testing
// In a real scenario, you'd use testcontainers or a test database
func mockDB() *database.DB {
	// This is a placeholder - in production you'd set up a test database
	return &database.DB{
		Pool: nil, // Mock pool for unit tests
	}
}

// TestValidateDataIntegration tests the full validation flow
// Note: This requires a test database to be fully functional
func TestValidateDataIntegration(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test in short mode")
	}

	// This test would require a test database with validation rules
	// For now, we'll test the parsing logic
	v := &Validator{db: mockDB()}

	tests := []struct {
		name       string
		rulesJSON  json.RawMessage
		dataJSON   json.RawMessage
		shouldPass bool
	}{
		{
			name:       "Empty rules - pass",
			rulesJSON:  json.RawMessage(`[]`),
			dataJSON:   json.RawMessage(`{"balance": 100}`),
			shouldPass: true,
		},
		{
			name:       "Invalid rules JSON - fail",
			rulesJSON:  json.RawMessage(`invalid json`),
			dataJSON:   json.RawMessage(`{"balance": 100}`),
			shouldPass: false,
		},
		{
			name:       "Invalid data JSON - fail",
			rulesJSON:  json.RawMessage(`[]`),
			dataJSON:   json.RawMessage(`invalid json`),
			shouldPass: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			ctx := context.Background()
			err := v.ValidateData(ctx, tt.rulesJSON, tt.dataJSON)
			if tt.shouldPass && err != nil {
				t.Errorf("Expected validation to pass, but got error: %v", err)
			}
			if !tt.shouldPass && err == nil {
				t.Errorf("Expected validation to fail, but it passed")
			}
		})
	}
}

// Benchmark tests

func BenchmarkEvaluateNumericComparison(b *testing.B) {
	v := &Validator{}
	for i := 0; i < b.N; i++ {
		_ = v.evaluateNumericComparison("value >= 0", 100.0)
	}
}

func BenchmarkEvaluateRegex(b *testing.B) {
	v := &Validator{}
	pattern := `^\d{3}\.\d{3}\.\d{3}-\d{2}$`
	value := "123.456.789-00"
	for i := 0; i < b.N; i++ {
		_ = v.evaluateRegex(pattern, value)
	}
}

func BenchmarkEvaluateCELExpression(b *testing.B) {
	v := &Validator{}
	data := map[string]interface{}{"balance": 100.0}
	for i := 0; i < b.N; i++ {
		_ = v.evaluateCELExpression("data.balance >= 0", data)
	}
}
