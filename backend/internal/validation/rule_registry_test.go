package validation

import (
	"encoding/json"
	"testing"
)

// MockRuleExecutor is a simple mock for testing
type MockRuleExecutor struct {
	executeFunc func(config json.RawMessage, data map[string]interface{}) error
}

func (m *MockRuleExecutor) Execute(config json.RawMessage, data map[string]interface{}) error {
	if m.executeFunc != nil {
		return m.executeFunc(config, data)
	}
	return nil
}

func TestNewRuleRegistry(t *testing.T) {
	registry := NewRuleRegistry()

	if registry == nil {
		t.Fatal("expected non-nil registry")
	}

	// Check default executors are registered
	defaultTypes := []string{"regex", "function", "api_call", "sql_query", "composite"}
	for _, ruleType := range defaultTypes {
		if !registry.HasExecutor(ruleType) {
			t.Errorf("expected default executor for type %s", ruleType)
		}
	}
}

func TestRuleRegistry_RegisterRule(t *testing.T) {
	registry := NewRuleRegistry()

	tests := []struct {
		name        string
		ruleType    string
		executor    RuleExecutor
		expectError bool
	}{
		{
			name:        "Valid registration",
			ruleType:    "custom_type",
			executor:    &MockRuleExecutor{},
			expectError: false,
		},
		{
			name:        "Empty rule type",
			ruleType:    "",
			executor:    &MockRuleExecutor{},
			expectError: true,
		},
		{
			name:        "Nil executor",
			ruleType:    "test_type",
			executor:    nil,
			expectError: true,
		},
		{
			name:        "Override existing type",
			ruleType:    "regex",
			executor:    &MockRuleExecutor{},
			expectError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := registry.RegisterRule(tt.ruleType, tt.executor)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}

			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if !tt.expectError && err == nil {
				// Verify executor was registered
				if !registry.HasExecutor(tt.ruleType) {
					t.Errorf("executor not registered for type %s", tt.ruleType)
				}
			}
		})
	}
}

func TestRuleRegistry_GetExecutor(t *testing.T) {
	registry := NewRuleRegistry()
	mockExecutor := &MockRuleExecutor{}

	// Register a custom executor
	registry.RegisterRule("test_type", mockExecutor)

	tests := []struct {
		name        string
		ruleType    string
		expectError bool
	}{
		{
			name:        "Get existing executor",
			ruleType:    "test_type",
			expectError: false,
		},
		{
			name:        "Get default executor",
			ruleType:    "regex",
			expectError: false,
		},
		{
			name:        "Get non-existent executor",
			ruleType:    "non_existent",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			executor, err := registry.GetExecutor(tt.ruleType)

			if tt.expectError && err == nil {
				t.Error("expected error but got none")
			}

			if !tt.expectError && err != nil {
				t.Errorf("unexpected error: %v", err)
			}

			if !tt.expectError && executor == nil {
				t.Error("expected executor but got nil")
			}
		})
	}
}

func TestRuleRegistry_UnregisterRule(t *testing.T) {
	registry := NewRuleRegistry()

	// Register a custom rule
	registry.RegisterRule("test_type", &MockRuleExecutor{})

	// Verify it exists
	if !registry.HasExecutor("test_type") {
		t.Fatal("test_type should be registered")
	}

	// Unregister
	registry.UnregisterRule("test_type")

	// Verify it's gone
	if registry.HasExecutor("test_type") {
		t.Error("test_type should not be registered after unregistering")
	}

	// Unregister non-existent type (should not panic)
	registry.UnregisterRule("non_existent")
}

func TestRuleRegistry_ListRegisteredTypes(t *testing.T) {
	registry := NewRuleRegistry()

	// Get initial types
	types := registry.ListRegisteredTypes()

	// Should have default types
	if len(types) == 0 {
		t.Error("expected at least one registered type")
	}

	// Register a custom type
	registry.RegisterRule("custom1", &MockRuleExecutor{})
	registry.RegisterRule("custom2", &MockRuleExecutor{})

	types = registry.ListRegisteredTypes()

	// Verify custom types are in the list
	hasCustom1 := false
	hasCustom2 := false
	for _, typ := range types {
		if typ == "custom1" {
			hasCustom1 = true
		}
		if typ == "custom2" {
			hasCustom2 = true
		}
	}

	if !hasCustom1 || !hasCustom2 {
		t.Error("custom types not found in registered types list")
	}
}

func TestRuleRegistry_ConcurrentAccess(t *testing.T) {
	registry := NewRuleRegistry()

	// Test concurrent registration and access
	done := make(chan bool, 10)

	for i := 0; i < 5; i++ {
		go func(n int) {
			executor := &MockRuleExecutor{}
			registry.RegisterRule("concurrent_test", executor)
			done <- true
		}(i)
	}

	for i := 0; i < 5; i++ {
		go func() {
			_, _ = registry.GetExecutor("concurrent_test")
			done <- true
		}()
	}

	// Wait for all goroutines
	for i := 0; i < 10; i++ {
		<-done
	}

	// Verify registry is still functional
	if !registry.HasExecutor("concurrent_test") {
		t.Error("concurrent test executor should be registered")
	}
}
