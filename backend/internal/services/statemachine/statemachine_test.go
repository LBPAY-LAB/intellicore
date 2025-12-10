package statemachine

import (
	"encoding/json"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/models"
)

func TestEvaluateCondition(t *testing.T) {
	sm := &StateMachine{}

	tests := []struct {
		name           string
		condition      string
		instanceData   map[string]interface{}
		currentState   string
		version        int
		expectedResult bool
		expectError    bool
	}{
		{
			name:      "Simple numeric comparison - true",
			condition: "data.saldo >= 100",
			instanceData: map[string]interface{}{
				"saldo": 150.0,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Simple numeric comparison - false",
			condition: "data.saldo >= 100",
			instanceData: map[string]interface{}{
				"saldo": 50.0,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: false,
			expectError:    false,
		},
		{
			name:      "String comparison - true",
			condition: "data.status == 'approved'",
			instanceData: map[string]interface{}{
				"status": "approved",
			},
			currentState:   "pending",
			version:        1,
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "String comparison - false",
			condition: "data.status == 'approved'",
			instanceData: map[string]interface{}{
				"status": "rejected",
			},
			currentState:   "pending",
			version:        1,
			expectedResult: false,
			expectError:    false,
		},
		{
			name:      "Complex condition with AND - true",
			condition: "data.saldo >= 100 && data.score > 700",
			instanceData: map[string]interface{}{
				"saldo": 150.0,
				"score": 750.0,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Complex condition with AND - false",
			condition: "data.saldo >= 100 && data.score > 700",
			instanceData: map[string]interface{}{
				"saldo": 150.0,
				"score": 650.0,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: false,
			expectError:    false,
		},
		{
			name:      "Complex condition with OR - true",
			condition: "data.saldo >= 1000 || data.vip == true",
			instanceData: map[string]interface{}{
				"saldo": 500.0,
				"vip":   true,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Access current_state variable - true",
			condition: "current_state == 'pending' && data.ready == true",
			instanceData: map[string]interface{}{
				"ready": true,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Access version variable - true",
			condition: "version > 0 && data.validated == true",
			instanceData: map[string]interface{}{
				"validated": true,
			},
			currentState:   "pending",
			version:        5,
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Nested object access - true",
			condition: "data.account.balance >= 100",
			instanceData: map[string]interface{}{
				"account": map[string]interface{}{
					"balance": 250.0,
				},
			},
			currentState:   "pending",
			version:        1,
			expectedResult: true,
			expectError:    false,
		},
		{
			name:      "Nested object access - false",
			condition: "data.account.balance >= 100",
			instanceData: map[string]interface{}{
				"account": map[string]interface{}{
					"balance": 50.0,
				},
			},
			currentState:   "pending",
			version:        1,
			expectedResult: false,
			expectError:    false,
		},
		{
			name:      "Invalid condition - syntax error",
			condition: "data.saldo >= ",
			instanceData: map[string]interface{}{
				"saldo": 150.0,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: false,
			expectError:    true,
		},
		{
			name:      "Non-boolean result - error",
			condition: "data.saldo + 100",
			instanceData: map[string]interface{}{
				"saldo": 150.0,
			},
			currentState:   "pending",
			version:        1,
			expectedResult: false,
			expectError:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create instance with test data
			dataJSON, err := json.Marshal(tt.instanceData)
			if err != nil {
				t.Fatalf("Failed to marshal test data: %v", err)
			}

			instance := &models.Instance{
				ID:           uuid.New(),
				Data:         dataJSON,
				CurrentState: tt.currentState,
				Version:      tt.version,
			}

			// Evaluate condition
			result, err := sm.evaluateCondition(tt.condition, instance)

			// Check error expectation
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

			// Check result
			if result != tt.expectedResult {
				t.Errorf("Expected result %v, got %v", tt.expectedResult, result)
			}
		})
	}
}

func TestTransitionWithCondition(t *testing.T) {
	// Note: This test requires a database connection and full integration testing
	// For now, we'll test the logic flow with mock data
	// A full integration test should be written separately

	t.Run("Condition evaluation integration", func(t *testing.T) {
		// This test demonstrates the expected behavior
		// Actual integration tests will require database setup

		sm := &StateMachine{}

		// Test case 1: Condition met
		dataJSON, _ := json.Marshal(map[string]interface{}{
			"saldo": 150.0,
		})

		instance := &models.Instance{
			ID:           uuid.New(),
			Data:         dataJSON,
			CurrentState: "pending",
			Version:      1,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		condition := "data.saldo >= 100"
		result, err := sm.evaluateCondition(condition, instance)

		if err != nil {
			t.Errorf("Unexpected error: %v", err)
		}

		if !result {
			t.Errorf("Expected condition to be met")
		}

		// Test case 2: Condition not met
		dataJSON2, _ := json.Marshal(map[string]interface{}{
			"saldo": 50.0,
		})

		instance2 := &models.Instance{
			ID:           uuid.New(),
			Data:         dataJSON2,
			CurrentState: "pending",
			Version:      1,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}

		result2, err2 := sm.evaluateCondition(condition, instance2)

		if err2 != nil {
			t.Errorf("Unexpected error: %v", err2)
		}

		if result2 {
			t.Errorf("Expected condition to NOT be met")
		}
	})
}

func TestConditionExamples(t *testing.T) {
	sm := &StateMachine{}

	examples := []struct {
		name      string
		condition string
		scenario  string
	}{
		{
			name:      "Account approval based on balance",
			condition: "data.saldo >= 100",
			scenario:  "Approve account only if balance >= 100",
		},
		{
			name:      "Credit approval based on score",
			condition: "data.creditScore > 700 && data.income >= 5000",
			scenario:  "Approve credit if score > 700 AND income >= 5000",
		},
		{
			name:      "VIP fast track",
			condition: "data.vip == true || data.saldo >= 10000",
			scenario:  "Fast track if VIP or balance >= 10000",
		},
		{
			name:      "Multi-level approval",
			condition: "data.amount <= 1000 || (data.amount <= 10000 && data.managerApproved == true)",
			scenario:  "Auto-approve if <= 1000, or <= 10000 with manager approval",
		},
	}

	for _, ex := range examples {
		t.Run(ex.name, func(t *testing.T) {
			// Just validate that the condition syntax is valid
			instance := &models.Instance{
				ID:           uuid.New(),
				Data:         json.RawMessage(`{"saldo": 100, "creditScore": 750, "income": 6000, "vip": true, "amount": 500, "managerApproved": true}`),
				CurrentState: "pending",
				Version:      1,
			}

			_, err := sm.evaluateCondition(ex.condition, instance)
			if err != nil {
				t.Errorf("Condition syntax error in example '%s': %v", ex.name, err)
			}
		})
	}
}
