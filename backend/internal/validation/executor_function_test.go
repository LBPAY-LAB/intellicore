package validation

import (
	"encoding/json"
	"testing"
)

func TestFunctionRuleExecutor_Execute(t *testing.T) {
	executor := &FunctionRuleExecutor{}

	tests := []struct {
		name        string
		config      FunctionConfig
		data        map[string]interface{}
		expectError bool
	}{
		{
			name: "Simple boolean return - true",
			config: FunctionConfig{
				Code: `data.age >= 18`,
			},
			data: map[string]interface{}{
				"age": 25,
			},
			expectError: false,
		},
		{
			name: "Simple boolean return - false",
			config: FunctionConfig{
				Code:         `data.age >= 18`,
				ErrorMessage: "Must be 18 or older",
			},
			data: map[string]interface{}{
				"age": 15,
			},
			expectError: true,
		},
		{
			name: "CPF validation using utility function - valid",
			config: FunctionConfig{
				Code: `validateCPF(data.cpf)`,
			},
			data: map[string]interface{}{
				"cpf": "12345678909",
			},
			expectError: false,
		},
		{
			name: "CPF validation - invalid",
			config: FunctionConfig{
				Code:         `validateCPF(data.cpf)`,
				ErrorMessage: "Invalid CPF",
			},
			data: map[string]interface{}{
				"cpf": "00000000000",
			},
			expectError: true,
		},
		{
			name: "Email validation - valid",
			config: FunctionConfig{
				Code: `validateEmail(data.email)`,
			},
			data: map[string]interface{}{
				"email": "test@example.com",
			},
			expectError: false,
		},
		{
			name: "Email validation - invalid",
			config: FunctionConfig{
				Code: `validateEmail(data.email)`,
			},
			data: map[string]interface{}{
				"email": "invalid-email",
			},
			expectError: true,
		},
		{
			name: "Complex logic - multiple conditions",
			config: FunctionConfig{
				Code: `
					if (data.type === 'premium') {
						return data.balance >= 10000;
					}
					return data.balance >= 0;
				`,
			},
			data: map[string]interface{}{
				"type":    "premium",
				"balance": 15000,
			},
			expectError: false,
		},
		{
			name: "Return error string",
			config: FunctionConfig{
				Code: `
					if (data.value < 0) {
						return "Value must be positive";
					}
					return true;
				`,
			},
			data: map[string]interface{}{
				"value": -10,
			},
			expectError: true,
		},
		{
			name: "Return null (pass)",
			config: FunctionConfig{
				Code: `null`,
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

func TestValidateCPF(t *testing.T) {
	tests := []struct {
		name  string
		cpf   string
		valid bool
	}{
		{"Valid CPF 1", "12345678909", true},
		{"Valid CPF 2", "11144477735", true},
		{"Valid CPF with formatting", "111.444.777-35", true},
		{"Invalid - all same digits", "11111111111", false},
		{"Invalid - wrong length", "123", false},
		{"Invalid - wrong check digit", "12345678901", false},
		{"Invalid - all zeros", "00000000000", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := validateCPF(tt.cpf)
			if result != tt.valid {
				t.Errorf("validateCPF(%s) = %v, want %v", tt.cpf, result, tt.valid)
			}
		})
	}
}

func TestValidateCNPJ(t *testing.T) {
	tests := []struct {
		name  string
		cnpj  string
		valid bool
	}{
		{"Valid CNPJ 1", "11222333000181", true},
		{"Valid CNPJ with formatting", "11.222.333/0001-81", true},
		{"Invalid - all same digits", "11111111111111", false},
		{"Invalid - wrong length", "123", false},
		{"Invalid - all zeros", "00000000000000", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := validateCNPJ(tt.cnpj)
			if result != tt.valid {
				t.Errorf("validateCNPJ(%s) = %v, want %v", tt.cnpj, result, tt.valid)
			}
		})
	}
}

func TestValidateEmail(t *testing.T) {
	tests := []struct {
		name  string
		email string
		valid bool
	}{
		{"Valid email", "user@example.com", true},
		{"Valid email with subdomain", "user@mail.example.com", true},
		{"Valid email with plus", "user+tag@example.com", true},
		{"Invalid - no @", "userexample.com", false},
		{"Invalid - no domain", "user@", false},
		{"Invalid - no TLD", "user@example", false},
		{"Invalid - spaces", "user @example.com", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := validateEmail(tt.email)
			if result != tt.valid {
				t.Errorf("validateEmail(%s) = %v, want %v", tt.email, result, tt.valid)
			}
		})
	}
}

func TestFunctionRuleExecutor_Timeout(t *testing.T) {
	executor := &FunctionRuleExecutor{}

	config := FunctionConfig{
		Code: `
			// Infinite loop
			while(true) {}
		`,
		Timeout: 100, // 100ms timeout
	}

	configJSON, _ := json.Marshal(config)
	err := executor.Execute(configJSON, map[string]interface{}{})

	if err == nil {
		t.Error("expected timeout error but got none")
	}
}
