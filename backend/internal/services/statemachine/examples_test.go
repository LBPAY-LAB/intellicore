package statemachine_test

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/models"
	"github.com/lbpay/supercore/internal/services/statemachine"
)

// ExampleNewConditionEvaluator demonstrates basic usage of the condition evaluator
func ExampleNewConditionEvaluator() {
	evaluator, err := statemachine.NewConditionEvaluator()
	if err != nil {
		log.Fatal(err)
	}

	condition := "data.saldo >= 100"
	data := map[string]interface{}{
		"saldo": 150.0,
	}

	result, err := evaluator.Evaluate(condition, data)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Condition result: %v\n", result)
	// Output: Condition result: true
}

// ExampleConditionEvaluator_Evaluate_numericComparison shows numeric comparison
func ExampleConditionEvaluator_Evaluate_numericComparison() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	// Check if balance is sufficient
	condition := "data.saldo >= 1000"
	data := map[string]interface{}{
		"saldo": 1500.0,
	}

	result, _ := evaluator.Evaluate(condition, data)
	fmt.Printf("Balance sufficient: %v\n", result)
	// Output: Balance sufficient: true
}

// ExampleConditionEvaluator_Evaluate_stringComparison shows string comparison
func ExampleConditionEvaluator_Evaluate_stringComparison() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	condition := "data.status == 'approved'"
	data := map[string]interface{}{
		"status": "approved",
	}

	result, _ := evaluator.Evaluate(condition, data)
	fmt.Printf("Status is approved: %v\n", result)
	// Output: Status is approved: true
}

// ExampleConditionEvaluator_Evaluate_complexLogic shows complex business logic
func ExampleConditionEvaluator_Evaluate_complexLogic() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	// Multi-level approval logic
	condition := "data.amount <= 1000 || (data.amount <= 10000 && data.manager_approved == true)"

	// Case 1: Auto-approve small amount
	data1 := map[string]interface{}{
		"amount":           500.0,
		"manager_approved": false,
	}
	result1, _ := evaluator.Evaluate(condition, data1)
	fmt.Printf("Small amount auto-approved: %v\n", result1)

	// Case 2: Manager-approved medium amount
	data2 := map[string]interface{}{
		"amount":           5000.0,
		"manager_approved": true,
	}
	result2, _ := evaluator.Evaluate(condition, data2)
	fmt.Printf("Manager-approved medium amount: %v\n", result2)

	// Output:
	// Small amount auto-approved: true
	// Manager-approved medium amount: true
}

// ExampleConditionEvaluator_EvaluateWithContext shows context variable usage
func ExampleConditionEvaluator_EvaluateWithContext() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	condition := "current_state == 'PENDING' && data.ready == true"
	data := map[string]interface{}{
		"ready": true,
	}
	context := map[string]interface{}{
		"current_state": "PENDING",
		"version":       1,
	}

	result, _ := evaluator.EvaluateWithContext(condition, data, context)
	fmt.Printf("Can transition: %v\n", result)
	// Output: Can transition: true
}

// ExampleConditionEvaluator_ValidateCondition shows condition validation
func ExampleConditionEvaluator_ValidateCondition() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	// Valid condition
	err1 := evaluator.ValidateCondition("data.saldo >= 100")
	fmt.Printf("Valid condition error: %v\n", err1)

	// Invalid condition
	err2 := evaluator.ValidateCondition("data.saldo >= ")
	fmt.Printf("Invalid condition has error: %v\n", err2 != nil)

	// Output:
	// Valid condition error: <nil>
	// Invalid condition has error: true
}

// ExampleEvaluateInstanceCondition shows evaluation against a full instance
func ExampleEvaluateInstanceCondition() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	// Create an instance
	instance := &models.Instance{
		ID:   uuid.New(),
		Data: json.RawMessage(`{"saldo": 1500, "score": 750}`),
		CurrentState: "PENDING",
		Version:      1,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	condition := "data.saldo >= 1000 && data.score > 700"
	result, _ := statemachine.EvaluateInstanceCondition(evaluator, condition, instance)

	fmt.Printf("Instance meets condition: %v\n", result)
	// Output: Instance meets condition: true
}

// ExampleGetConditionExamples shows how to get documented examples
func ExampleGetConditionExamples() {
	examples := statemachine.GetConditionExamples()

	fmt.Printf("Total examples: %d\n", len(examples))
	fmt.Printf("First example: %s\n", examples[0].Name)
	fmt.Printf("First condition: %s\n", examples[0].Condition)

	// Output:
	// Total examples: 12
	// First example: Numeric Comparison
	// First condition: data.saldo >= 1000
}

// Example_bacenPIXNightLimit demonstrates BACEN PIX nighttime limit check
func Example_bacenPIXNightLimit() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	// BACEN Circular 3.978: PIX has different limits during nighttime (20:00-06:00)
	condition := "data.valor < 1000 || data.horario_limite == false"

	// Scenario 1: High value during daytime - should pass
	data1 := map[string]interface{}{
		"valor":          5000.0,
		"horario_limite": false,
	}
	result1, _ := evaluator.Evaluate(condition, data1)
	fmt.Printf("High value during daytime: %v\n", result1)

	// Scenario 2: Low value during nighttime - should pass
	data2 := map[string]interface{}{
		"valor":          500.0,
		"horario_limite": true,
	}
	result2, _ := evaluator.Evaluate(condition, data2)
	fmt.Printf("Low value during nighttime: %v\n", result2)

	// Scenario 3: High value during nighttime - should fail
	data3 := map[string]interface{}{
		"valor":          5000.0,
		"horario_limite": true,
	}
	result3, _ := evaluator.Evaluate(condition, data3)
	fmt.Printf("High value during nighttime: %v\n", result3)

	// Output:
	// High value during daytime: true
	// Low value during nighttime: true
	// High value during nighttime: false
}

// Example_multiLevelApproval demonstrates a multi-level approval workflow
func Example_multiLevelApproval() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	condition := "data.valor <= 5000 || (data.valor <= 50000 && data.gerente_aprovou == true) || (data.valor > 50000 && data.diretor_aprovou == true)"

	// Case 1: Small amount - auto approve
	data1 := map[string]interface{}{
		"valor":             3000.0,
		"gerente_aprovou":   false,
		"diretor_aprovou":   false,
	}
	result1, _ := evaluator.Evaluate(condition, data1)
	fmt.Printf("Small amount auto-approved: %v\n", result1)

	// Case 2: Medium amount with manager approval
	data2 := map[string]interface{}{
		"valor":             25000.0,
		"gerente_aprovou":   true,
		"diretor_aprovou":   false,
	}
	result2, _ := evaluator.Evaluate(condition, data2)
	fmt.Printf("Medium amount manager-approved: %v\n", result2)

	// Case 3: Large amount with director approval
	data3 := map[string]interface{}{
		"valor":             100000.0,
		"gerente_aprovou":   false,
		"diretor_aprovou":   true,
	}
	result3, _ := evaluator.Evaluate(condition, data3)
	fmt.Printf("Large amount director-approved: %v\n", result3)

	// Case 4: Medium amount without approval
	data4 := map[string]interface{}{
		"valor":             25000.0,
		"gerente_aprovou":   false,
		"diretor_aprovou":   false,
	}
	result4, _ := evaluator.Evaluate(condition, data4)
	fmt.Printf("Medium amount without approval: %v\n", result4)

	// Output:
	// Small amount auto-approved: true
	// Medium amount manager-approved: true
	// Large amount director-approved: true
	// Medium amount without approval: false
}

// Example_nestedFieldAccess demonstrates accessing nested object fields
func Example_nestedFieldAccess() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	condition := "data.account.balance >= 100 && data.user.profile.verified == true"
	data := map[string]interface{}{
		"account": map[string]interface{}{
			"balance": 250.0,
		},
		"user": map[string]interface{}{
			"profile": map[string]interface{}{
				"verified": true,
			},
		},
	}

	result, _ := evaluator.Evaluate(condition, data)
	fmt.Printf("Nested condition met: %v\n", result)
	// Output: Nested condition met: true
}

// Example_creditScoreEvaluation demonstrates credit score evaluation
func Example_creditScoreEvaluation() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	condition := "data.creditScore >= 700 && data.income >= 5000 && data.debtRatio < 0.4"

	// Good credit profile
	data1 := map[string]interface{}{
		"creditScore": 750.0,
		"income":      8000.0,
		"debtRatio":   0.3,
	}
	result1, _ := evaluator.Evaluate(condition, data1)
	fmt.Printf("Good credit profile approved: %v\n", result1)

	// Poor credit profile
	data2 := map[string]interface{}{
		"creditScore": 650.0,
		"income":      8000.0,
		"debtRatio":   0.3,
	}
	result2, _ := evaluator.Evaluate(condition, data2)
	fmt.Printf("Poor credit profile approved: %v\n", result2)

	// Output:
	// Good credit profile approved: true
	// Poor credit profile approved: false
}

// Example_fsmTransitionWithCondition demonstrates FSM transition with conditions
func Example_fsmTransitionWithCondition() {
	// This example shows how FSM transitions use conditions

	fsmConfig := statemachine.FSMConfig{
		Initial: "CADASTRO_PENDENTE",
		States: []string{
			"CADASTRO_PENDENTE",
			"DOCUMENTOS_ENVIADOS",
			"EM_ANALISE",
			"APROVADA",
		},
		Transitions: []statemachine.Transition{
			{
				From: "CADASTRO_PENDENTE",
				To:   "DOCUMENTOS_ENVIADOS",
				Condition: func() *string {
					s := "data.cpf != '' && data.rg != ''"
					return &s
				}(),
			},
			{
				From: "DOCUMENTOS_ENVIADOS",
				To:   "EM_ANALISE",
				Condition: nil, // No condition - always allowed
			},
			{
				From: "EM_ANALISE",
				To:   "APROVADA",
				Condition: func() *string {
					s := "data.score_credito >= 700"
					return &s
				}(),
			},
		},
	}

	fmt.Printf("Initial state: %s\n", fsmConfig.Initial)
	fmt.Printf("Total states: %d\n", len(fsmConfig.States))
	fmt.Printf("Total transitions: %d\n", len(fsmConfig.Transitions))
	fmt.Printf("First transition has condition: %v\n", fsmConfig.Transitions[0].Condition != nil)

	// Output:
	// Initial state: CADASTRO_PENDENTE
	// Total states: 4
	// Total transitions: 3
	// First transition has condition: true
}

// Example_logicalOperators demonstrates logical operators
func Example_logicalOperators() {
	evaluator, _ := statemachine.NewConditionEvaluator()

	// AND operator - both must be true
	and1, _ := evaluator.Evaluate("data.a == true && data.b == true", map[string]interface{}{
		"a": true,
		"b": true,
	})
	fmt.Printf("Both true (AND): %v\n", and1)

	and2, _ := evaluator.Evaluate("data.a == true && data.b == true", map[string]interface{}{
		"a": true,
		"b": false,
	})
	fmt.Printf("One false (AND): %v\n", and2)

	// OR operator - at least one must be true
	or1, _ := evaluator.Evaluate("data.a == true || data.b == true", map[string]interface{}{
		"a": true,
		"b": false,
	})
	fmt.Printf("One true (OR): %v\n", or1)

	or2, _ := evaluator.Evaluate("data.a == true || data.b == true", map[string]interface{}{
		"a": false,
		"b": false,
	})
	fmt.Printf("Both false (OR): %v\n", or2)

	// NOT operator - negation
	not1, _ := evaluator.Evaluate("!(data.blocked == true)", map[string]interface{}{
		"blocked": false,
	})
	fmt.Printf("Not blocked: %v\n", not1)

	// Output:
	// Both true (AND): true
	// One false (AND): false
	// One true (OR): true
	// Both false (OR): false
	// Not blocked: true
}
