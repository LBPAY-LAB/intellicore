package statemachine

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/models"
)

func TestNewConditionEvaluator(t *testing.T) {
	evaluator, err := NewConditionEvaluator()
	if err != nil {
		t.Fatalf("Failed to create condition evaluator: %v", err)
	}

	if evaluator == nil {
		t.Fatal("Expected non-nil evaluator")
	}
}

func TestEvaluate(t *testing.T) {
	evaluator, err := NewConditionEvaluator()
	if err != nil {
		t.Fatalf("Failed to create evaluator: %v", err)
	}

	tests := []struct {
		name           string
		condition      string
		data           map[string]interface{}
		expectedResult bool
		expectError    bool
	}{
		// Numeric comparisons
		{
			name:           "Greater than - true",
			condition:      "data.saldo > 100",
			data:           map[string]interface{}{"saldo": 150.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Greater than - false",
			condition:      "data.saldo > 100",
			data:           map[string]interface{}{"saldo": 50.0},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "Greater than or equal - boundary true",
			condition:      "data.saldo >= 100",
			data:           map[string]interface{}{"saldo": 100.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Less than - true",
			condition:      "data.amount < 1000",
			data:           map[string]interface{}{"amount": 500.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Less than or equal - boundary true",
			condition:      "data.amount <= 1000",
			data:           map[string]interface{}{"amount": 1000.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Equal numeric - true",
			condition:      "data.count == 5",
			data:           map[string]interface{}{"count": 5.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Not equal numeric - true",
			condition:      "data.count != 5",
			data:           map[string]interface{}{"count": 10.0},
			expectedResult: true,
			expectError:    false,
		},

		// String comparisons
		{
			name:           "String equality - true",
			condition:      "data.status == 'approved'",
			data:           map[string]interface{}{"status": "approved"},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "String equality - false",
			condition:      "data.status == 'approved'",
			data:           map[string]interface{}{"status": "rejected"},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "String inequality - true",
			condition:      "data.status != 'pending'",
			data:           map[string]interface{}{"status": "approved"},
			expectedResult: true,
			expectError:    false,
		},

		// Boolean checks
		{
			name:           "Boolean true check",
			condition:      "data.is_verified == true",
			data:           map[string]interface{}{"is_verified": true},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Boolean false check",
			condition:      "data.is_verified == false",
			data:           map[string]interface{}{"is_verified": false},
			expectedResult: true,
			expectError:    false,
		},

		// Logical AND
		{
			name:           "AND - both true",
			condition:      "data.saldo >= 100 && data.score > 700",
			data:           map[string]interface{}{"saldo": 150.0, "score": 750.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "AND - first false",
			condition:      "data.saldo >= 100 && data.score > 700",
			data:           map[string]interface{}{"saldo": 50.0, "score": 750.0},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "AND - second false",
			condition:      "data.saldo >= 100 && data.score > 700",
			data:           map[string]interface{}{"saldo": 150.0, "score": 650.0},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "AND - both false",
			condition:      "data.saldo >= 100 && data.score > 700",
			data:           map[string]interface{}{"saldo": 50.0, "score": 650.0},
			expectedResult: false,
			expectError:    false,
		},

		// Logical OR
		{
			name:           "OR - both true",
			condition:      "data.is_vip == true || data.saldo >= 10000",
			data:           map[string]interface{}{"is_vip": true, "saldo": 15000.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "OR - first true",
			condition:      "data.is_vip == true || data.saldo >= 10000",
			data:           map[string]interface{}{"is_vip": true, "saldo": 5000.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "OR - second true",
			condition:      "data.is_vip == true || data.saldo >= 10000",
			data:           map[string]interface{}{"is_vip": false, "saldo": 15000.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "OR - both false",
			condition:      "data.is_vip == true || data.saldo >= 10000",
			data:           map[string]interface{}{"is_vip": false, "saldo": 5000.0},
			expectedResult: false,
			expectError:    false,
		},

		// Negation
		{
			name:           "NOT - negates true to false",
			condition:      "!(data.blacklisted == true)",
			data:           map[string]interface{}{"blacklisted": true},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "NOT - negates false to true",
			condition:      "!(data.blacklisted == true)",
			data:           map[string]interface{}{"blacklisted": false},
			expectedResult: true,
			expectError:    false,
		},

		// Nested object access
		{
			name:           "Nested field - true",
			condition:      "data.account.balance >= 100",
			data:           map[string]interface{}{"account": map[string]interface{}{"balance": 250.0}},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Nested field - false",
			condition:      "data.account.balance >= 100",
			data:           map[string]interface{}{"account": map[string]interface{}{"balance": 50.0}},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "Deeply nested field",
			condition:      "data.user.profile.age >= 18",
			data:           map[string]interface{}{"user": map[string]interface{}{"profile": map[string]interface{}{"age": 25.0}}},
			expectedResult: true,
			expectError:    false,
		},

		// Complex conditions
		{
			name:           "Complex business logic - auto approve",
			condition:      "data.amount <= 1000 || (data.amount <= 10000 && data.manager_approved == true)",
			data:           map[string]interface{}{"amount": 500.0, "manager_approved": false},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Complex business logic - manager approved",
			condition:      "data.amount <= 1000 || (data.amount <= 10000 && data.manager_approved == true)",
			data:           map[string]interface{}{"amount": 5000.0, "manager_approved": true},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Complex business logic - rejected",
			condition:      "data.amount <= 1000 || (data.amount <= 10000 && data.manager_approved == true)",
			data:           map[string]interface{}{"amount": 5000.0, "manager_approved": false},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "Range check - within range",
			condition:      "data.age >= 18 && data.age <= 65",
			data:           map[string]interface{}{"age": 25.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Range check - below range",
			condition:      "data.age >= 18 && data.age <= 65",
			data:           map[string]interface{}{"age": 15.0},
			expectedResult: false,
			expectError:    false,
		},
		{
			name:           "Range check - above range",
			condition:      "data.age >= 18 && data.age <= 65",
			data:           map[string]interface{}{"age": 70.0},
			expectedResult: false,
			expectError:    false,
		},

		// Error cases
		{
			name:        "Invalid syntax - incomplete expression",
			condition:   "data.saldo >= ",
			data:        map[string]interface{}{"saldo": 100.0},
			expectError: true,
		},
		{
			name:        "Invalid syntax - missing operator",
			condition:   "data.saldo 100",
			data:        map[string]interface{}{"saldo": 100.0},
			expectError: true,
		},
		{
			name:        "Non-boolean result - arithmetic",
			condition:   "data.saldo + 100",
			data:        map[string]interface{}{"saldo": 100.0},
			expectError: true,
		},
		{
			name:        "Non-boolean result - string",
			condition:   "data.name",
			data:        map[string]interface{}{"name": "test"},
			expectError: true,
		},

		// Edge cases
		{
			name:           "Empty condition string - should be valid",
			condition:      "",
			data:           map[string]interface{}{"saldo": 100.0},
			expectedResult: true, // Empty condition defaults to true in CEL
			expectError:    true,  // But our validator should catch it
		},
		{
			name:           "Zero value comparison",
			condition:      "data.count == 0",
			data:           map[string]interface{}{"count": 0.0},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:           "Negative number comparison",
			condition:      "data.balance < 0",
			data:           map[string]interface{}{"balance": -50.0},
			expectedResult: true,
			expectError:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.Evaluate(tt.condition, tt.data)

			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if result != tt.expectedResult {
				t.Errorf("Expected result %v, got %v", tt.expectedResult, result)
			}
		})
	}
}

func TestEvaluateWithContext(t *testing.T) {
	evaluator, err := NewConditionEvaluator()
	if err != nil {
		t.Fatalf("Failed to create evaluator: %v", err)
	}

	tests := []struct {
		name           string
		condition      string
		data           map[string]interface{}
		context        map[string]interface{}
		expectedResult bool
		expectError    bool
	}{
		{
			name:      "Access current_state variable",
			condition: "current_state == 'PENDING' && data.ready == true",
			data:      map[string]interface{}{"ready": true},
			context: map[string]interface{}{
				"current_state": "PENDING",
				"version":       1,
			},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Access version variable",
			condition: "version > 0 && data.validated == true",
			data:      map[string]interface{}{"validated": true},
			context: map[string]interface{}{
				"current_state": "ACTIVE",
				"version":       5,
			},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Check is_deleted flag",
			condition: "is_deleted == false && data.active == true",
			data:      map[string]interface{}{"active": true},
			context: map[string]interface{}{
				"is_deleted": false,
			},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Combined context and data check",
			condition: "current_state == 'PENDING' && version >= 1 && data.amount <= 1000",
			data:      map[string]interface{}{"amount": 500.0},
			context: map[string]interface{}{
				"current_state": "PENDING",
				"version":       3,
			},
			expectedResult: true,
			expectError:    false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := evaluator.EvaluateWithContext(tt.condition, tt.data, tt.context)

			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if result != tt.expectedResult {
				t.Errorf("Expected result %v, got %v", tt.expectedResult, result)
			}
		})
	}
}

func TestValidateCondition(t *testing.T) {
	evaluator, err := NewConditionEvaluator()
	if err != nil {
		t.Fatalf("Failed to create evaluator: %v", err)
	}

	tests := []struct {
		name        string
		condition   string
		expectError bool
	}{
		{
			name:        "Valid numeric comparison",
			condition:   "data.saldo >= 100",
			expectError: false,
		},
		{
			name:        "Valid string comparison",
			condition:   "data.status == 'approved'",
			expectError: false,
		},
		{
			name:        "Valid complex condition",
			condition:   "data.saldo >= 100 && data.score > 700",
			expectError: false,
		},
		{
			name:        "Valid nested access",
			condition:   "data.account.balance >= 100",
			expectError: false,
		},
		{
			name:        "Empty condition",
			condition:   "",
			expectError: false, // Empty is valid
		},
		{
			name:        "Invalid syntax",
			condition:   "data.saldo >= ",
			expectError: true,
		},
		{
			name:        "Non-boolean expression",
			condition:   "data.saldo + 100",
			expectError: true,
		},
		{
			name:        "Invalid operator",
			condition:   "data.saldo === 100",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := evaluator.ValidateCondition(tt.condition)

			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
			} else {
				if err != nil {
					t.Errorf("Unexpected error: %v", err)
				}
			}
		})
	}
}

func TestEvaluateInstanceCondition(t *testing.T) {
	evaluator, err := NewConditionEvaluator()
	if err != nil {
		t.Fatalf("Failed to create evaluator: %v", err)
	}

	tests := []struct {
		name           string
		condition      string
		instance       *models.Instance
		expectedResult bool
		expectError    bool
	}{
		{
			name:      "Simple instance condition",
			condition: "data.saldo >= 100",
			instance: &models.Instance{
				ID:           uuid.New(),
				Data:         json.RawMessage(`{"saldo": 150}`),
				CurrentState: "ACTIVE",
				Version:      1,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Instance with state check",
			condition: "current_state == 'PENDING' && data.ready == true",
			instance: &models.Instance{
				ID:           uuid.New(),
				Data:         json.RawMessage(`{"ready": true}`),
				CurrentState: "PENDING",
				Version:      1,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Instance with version check",
			condition: "version >= 1 && data.validated == true",
			instance: &models.Instance{
				ID:           uuid.New(),
				Data:         json.RawMessage(`{"validated": true}`),
				CurrentState: "ACTIVE",
				Version:      5,
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Invalid JSON in instance data",
			condition: "data.saldo >= 100",
			instance: &models.Instance{
				ID:           uuid.New(),
				Data:         json.RawMessage(`{invalid json}`),
				CurrentState: "ACTIVE",
				Version:      1,
			},
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := EvaluateInstanceCondition(evaluator, tt.condition, tt.instance)

			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}

			if result != tt.expectedResult {
				t.Errorf("Expected result %v, got %v", tt.expectedResult, result)
			}
		})
	}
}

func TestGetConditionExamples(t *testing.T) {
	examples := GetConditionExamples()

	if len(examples) == 0 {
		t.Error("Expected at least one example")
	}

	evaluator, err := NewConditionEvaluator()
	if err != nil {
		t.Fatalf("Failed to create evaluator: %v", err)
	}

	// Validate that all example conditions are syntactically correct
	for _, example := range examples {
		t.Run(example.Name, func(t *testing.T) {
			err := evaluator.ValidateCondition(example.Condition)
			if err != nil {
				t.Errorf("Example condition is invalid: %v", err)
			}

			// Try to evaluate with the example data
			var data map[string]interface{}
			if err := json.Unmarshal([]byte(example.Example), &data); err != nil {
				t.Errorf("Example data is invalid JSON: %v", err)
				return
			}

			_, err = evaluator.Evaluate(example.Condition, data)
			if err != nil {
				t.Errorf("Failed to evaluate example condition: %v", err)
			}
		})
	}
}

func TestRealWorldScenarios(t *testing.T) {
	evaluator, err := NewConditionEvaluator()
	if err != nil {
		t.Fatalf("Failed to create evaluator: %v", err)
	}

	t.Run("BACEN PIX nighttime limit", func(t *testing.T) {
		// Circular 3.978: PIX has different limits during nighttime (20:00-06:00)
		condition := "data.valor < 1000 || data.horario_limite == false"

		// Scenario 1: High value during daytime - should pass
		result, err := evaluator.Evaluate(condition, map[string]interface{}{
			"valor":          5000.0,
			"horario_limite": false,
		})
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}
		if !result {
			t.Error("Expected high value during daytime to pass")
		}

		// Scenario 2: Low value during nighttime - should pass
		result, err = evaluator.Evaluate(condition, map[string]interface{}{
			"valor":          500.0,
			"horario_limite": true,
		})
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}
		if !result {
			t.Error("Expected low value during nighttime to pass")
		}

		// Scenario 3: High value during nighttime - should fail
		result, err = evaluator.Evaluate(condition, map[string]interface{}{
			"valor":          5000.0,
			"horario_limite": true,
		})
		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}
		if result {
			t.Error("Expected high value during nighttime to fail")
		}
	})

	t.Run("Multi-level approval workflow", func(t *testing.T) {
		// Different approval levels based on amount
		condition := "data.valor <= 5000 || (data.valor <= 50000 && data.gerente_aprovou == true) || (data.valor > 50000 && data.diretor_aprovou == true)"

		// Auto-approve small amounts
		result, err := evaluator.Evaluate(condition, map[string]interface{}{
			"valor":             3000.0,
			"gerente_aprovou":   false,
			"diretor_aprovou":   false,
		})
		if err != nil || !result {
			t.Error("Expected small amount to auto-approve")
		}

		// Manager approval for medium amounts
		result, err = evaluator.Evaluate(condition, map[string]interface{}{
			"valor":             25000.0,
			"gerente_aprovou":   true,
			"diretor_aprovou":   false,
		})
		if err != nil || !result {
			t.Error("Expected manager-approved medium amount to pass")
		}

		// Director approval for large amounts
		result, err = evaluator.Evaluate(condition, map[string]interface{}{
			"valor":             100000.0,
			"gerente_aprovou":   false,
			"diretor_aprovou":   true,
		})
		if err != nil || !result {
			t.Error("Expected director-approved large amount to pass")
		}

		// Reject medium amount without approval
		result, err = evaluator.Evaluate(condition, map[string]interface{}{
			"valor":             25000.0,
			"gerente_aprovou":   false,
			"diretor_aprovou":   false,
		})
		if err != nil || result {
			t.Error("Expected unapproved medium amount to fail")
		}
	})

	t.Run("Credit score evaluation", func(t *testing.T) {
		condition := "data.creditScore >= 700 && data.income >= 5000 && data.debtRatio < 0.4"

		// Good credit profile
		result, err := evaluator.Evaluate(condition, map[string]interface{}{
			"creditScore": 750.0,
			"income":      8000.0,
			"debtRatio":   0.3,
		})
		if err != nil || !result {
			t.Error("Expected good credit profile to pass")
		}

		// Low credit score
		result, err = evaluator.Evaluate(condition, map[string]interface{}{
			"creditScore": 650.0,
			"income":      8000.0,
			"debtRatio":   0.3,
		})
		if err != nil || result {
			t.Error("Expected low credit score to fail")
		}
	})
}

func BenchmarkEvaluate(b *testing.B) {
	evaluator, _ := NewConditionEvaluator()
	condition := "data.saldo >= 100 && data.score > 700"
	data := map[string]interface{}{
		"saldo": 150.0,
		"score": 750.0,
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = evaluator.Evaluate(condition, data)
	}
}

func BenchmarkEvaluateComplex(b *testing.B) {
	evaluator, _ := NewConditionEvaluator()
	condition := "data.amount <= 1000 || (data.amount <= 10000 && data.manager_approved == true) || (data.amount > 10000 && data.director_approved == true)"
	data := map[string]interface{}{
		"amount":             5000.0,
		"manager_approved":   true,
		"director_approved":  false,
	}

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		_, _ = evaluator.Evaluate(condition, data)
	}
}
