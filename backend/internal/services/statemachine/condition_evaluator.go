package statemachine

import (
	"encoding/json"
	"fmt"

	"github.com/google/cel-go/cel"
	"github.com/google/cel-go/common/types"
	"github.com/google/cel-go/common/types/ref"
	"github.com/lbpay/supercore/internal/models"
)

// ConditionEvaluator provides a flexible interface for evaluating conditional expressions
// against instance data using Google's Common Expression Language (CEL).
//
// Supported Features:
// - Comparison operators: >, <, >=, <=, ==, !=
// - Logical operators: &&, ||, !
// - Field access: data.field, data.nested.field
// - Built-in variables: current_state, version
// - Type-safe evaluation with proper error handling
type ConditionEvaluator interface {
	// Evaluate evaluates a condition expression against the provided data
	// Returns true if condition passes, false if it fails, or error if invalid
	Evaluate(condition string, data map[string]interface{}) (bool, error)

	// EvaluateWithContext evaluates a condition with additional context variables
	// Context can include: current_state, version, created_at, etc.
	EvaluateWithContext(condition string, data map[string]interface{}, context map[string]interface{}) (bool, error)

	// ValidateCondition checks if a condition expression is syntactically valid
	// without evaluating it. Useful for validating FSM configurations.
	ValidateCondition(condition string) error
}

// celConditionEvaluator implements ConditionEvaluator using Google CEL
type celConditionEvaluator struct {
	env *cel.Env
}

// NewConditionEvaluator creates a new CEL-based condition evaluator
// with a pre-configured environment supporting common data types and operations
func NewConditionEvaluator() (ConditionEvaluator, error) {
	// Create CEL environment with standard variables and functions
	env, err := cel.NewEnv(
		// Primary variable containing instance data
		cel.Variable("data", cel.DynType),

		// Context variables available in all evaluations
		cel.Variable("current_state", cel.StringType),
		cel.Variable("version", cel.IntType),
		cel.Variable("created_at", cel.TimestampType),
		cel.Variable("updated_at", cel.TimestampType),

		// Additional helper variables
		cel.Variable("is_deleted", cel.BoolType),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create CEL environment: %w", err)
	}

	return &celConditionEvaluator{env: env}, nil
}

// Evaluate evaluates a condition expression against instance data
func (e *celConditionEvaluator) Evaluate(condition string, data map[string]interface{}) (bool, error) {
	// Use default context values
	context := map[string]interface{}{
		"current_state": "",
		"version":       0,
		"is_deleted":    false,
	}

	return e.EvaluateWithContext(condition, data, context)
}

// EvaluateWithContext evaluates a condition with full context
func (e *celConditionEvaluator) EvaluateWithContext(condition string, data map[string]interface{}, context map[string]interface{}) (bool, error) {
	// Parse and compile the condition expression
	ast, issues := e.env.Compile(condition)
	if issues != nil && issues.Err() != nil {
		return false, fmt.Errorf("failed to compile condition '%s': %w", condition, issues.Err())
	}

	// Create executable program from AST
	prg, err := e.env.Program(ast)
	if err != nil {
		return false, fmt.Errorf("failed to create CEL program: %w", err)
	}

	// Prepare evaluation variables
	vars := map[string]interface{}{
		"data": data,
	}

	// Merge context into vars
	for key, value := range context {
		vars[key] = value
	}

	// Evaluate the expression
	result, _, err := prg.Eval(vars)
	if err != nil {
		return false, fmt.Errorf("failed to evaluate condition '%s': %w", condition, err)
	}

	// Ensure result is boolean
	boolResult, ok := result.(types.Bool)
	if !ok {
		return false, fmt.Errorf("condition must evaluate to boolean, got: %T (value: %v)", result, result)
	}

	return bool(boolResult), nil
}

// ValidateCondition checks if a condition expression is syntactically valid
func (e *celConditionEvaluator) ValidateCondition(condition string) error {
	if condition == "" {
		return nil // Empty condition is valid (always true)
	}

	ast, issues := e.env.Compile(condition)
	if issues != nil && issues.Err() != nil {
		return fmt.Errorf("invalid condition syntax: %w", issues.Err())
	}

	// Check that the output type is boolean
	if ast.OutputType() != cel.BoolType {
		return fmt.Errorf("condition must return boolean, got: %s", ast.OutputType())
	}

	return nil
}

// EvaluateInstanceCondition is a convenience method for evaluating conditions
// against a models.Instance object
func EvaluateInstanceCondition(evaluator ConditionEvaluator, condition string, instance *models.Instance) (bool, error) {
	// Parse instance data
	var data map[string]interface{}
	if err := json.Unmarshal(instance.Data, &data); err != nil {
		return false, fmt.Errorf("failed to parse instance data: %w", err)
	}

	// Prepare context from instance
	context := map[string]interface{}{
		"current_state": instance.CurrentState,
		"version":       instance.Version,
		"is_deleted":    instance.IsDeleted,
	}

	if !instance.CreatedAt.IsZero() {
		context["created_at"] = instance.CreatedAt
	}

	if !instance.UpdatedAt.IsZero() {
		context["updated_at"] = instance.UpdatedAt
	}

	return evaluator.EvaluateWithContext(condition, data, context)
}

// ConditionError represents an error that occurred during condition evaluation
type ConditionError struct {
	Condition string
	Data      map[string]interface{}
	Err       error
}

func (e *ConditionError) Error() string {
	return fmt.Sprintf("condition evaluation failed: %v (condition: %s)", e.Err, e.Condition)
}

func (e *ConditionError) Unwrap() error {
	return e.Err
}

// Common condition patterns for documentation and testing

// ConditionExample represents a documented condition pattern
type ConditionExample struct {
	Name        string
	Condition   string
	Description string
	Example     string
}

// GetConditionExamples returns common condition patterns for reference
func GetConditionExamples() []ConditionExample {
	return []ConditionExample{
		{
			Name:        "Numeric Comparison",
			Condition:   "data.saldo >= 1000",
			Description: "Check if balance is at least 1000",
			Example:     `{"saldo": 1500}`,
		},
		{
			Name:        "String Equality",
			Condition:   "data.status == 'approved'",
			Description: "Check if status is approved",
			Example:     `{"status": "approved"}`,
		},
		{
			Name:        "Boolean Check",
			Condition:   "data.is_verified == true",
			Description: "Check if entity is verified",
			Example:     `{"is_verified": true}`,
		},
		{
			Name:        "Logical AND",
			Condition:   "data.saldo >= 1000 && data.score > 700",
			Description: "Check multiple conditions (all must be true)",
			Example:     `{"saldo": 1500, "score": 750}`,
		},
		{
			Name:        "Logical OR",
			Condition:   "data.is_vip == true || data.saldo >= 10000",
			Description: "Check alternative conditions (any can be true)",
			Example:     `{"is_vip": false, "saldo": 15000}`,
		},
		{
			Name:        "Nested Field Access",
			Condition:   "data.account.balance >= 100",
			Description: "Access nested object properties",
			Example:     `{"account": {"balance": 250}}`,
		},
		{
			Name:        "Complex Business Logic",
			Condition:   "data.amount <= 1000 || (data.amount <= 10000 && data.manager_approved == true)",
			Description: "Auto-approve small amounts or larger amounts with manager approval",
			Example:     `{"amount": 5000, "manager_approved": true}`,
		},
		{
			Name:        "State-based Condition",
			Condition:   "current_state == 'PENDING' && data.documents_received == true",
			Description: "Check current state combined with data fields",
			Example:     `{"documents_received": true}`,
		},
		{
			Name:        "Negation",
			Condition:   "!(data.blacklisted == true)",
			Description: "Ensure entity is not blacklisted",
			Example:     `{"blacklisted": false}`,
		},
		{
			Name:        "Range Check",
			Condition:   "data.age >= 18 && data.age <= 65",
			Description: "Check if value is within range",
			Example:     `{"age": 25}`,
		},
		{
			Name:        "Time-based Condition",
			Condition:   "data.valor < 1000 || data.horario_limite == false",
			Description: "BACEN PIX nighttime limit check",
			Example:     `{"valor": 500, "horario_limite": false}`,
		},
		{
			Name:        "Multi-level Approval",
			Condition:   "data.valor <= 5000 || (data.valor <= 50000 && data.gerente_aprovou == true) || (data.valor > 50000 && data.diretor_aprovou == true)",
			Description: "Different approval levels based on amount",
			Example:     `{"valor": 25000, "gerente_aprovou": true}`,
		},
	}
}
