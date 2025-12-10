package validator

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/google/cel-go/cel"
	"github.com/google/cel-go/common/types"
	"github.com/google/cel-go/common/types/ref"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
)

type Validator struct {
	db *database.DB
}

func New(db *database.DB) *Validator {
	return &Validator{db: db}
}

// RuleReference represents a rule reference in the object definition
type RuleReference struct {
	RuleID   string                 `json:"rule_id"`
	RuleName string                 `json:"rule_name"`
	Config   map[string]interface{} `json:"config,omitempty"`
}

// CustomRuleConfig represents the configuration for a custom rule
type CustomRuleConfig struct {
	Expression    string `json:"expression"`
	ErrorMessage  string `json:"error_message"`
	Field         string `json:"field,omitempty"`
	FailOnMissing bool   `json:"fail_on_missing,omitempty"`
}

// ValidateData validates instance data against custom validation rules
func (v *Validator) ValidateData(ctx context.Context, rulesJSON json.RawMessage, data json.RawMessage) error {
	// Parse rules array from object definition
	var ruleRefs []RuleReference
	if err := json.Unmarshal(rulesJSON, &ruleRefs); err != nil {
		return fmt.Errorf("failed to parse rules: %w", err)
	}

	// If no rules, validation passes
	if len(ruleRefs) == 0 {
		return nil
	}

	// Parse instance data
	var instanceData map[string]interface{}
	if err := json.Unmarshal(data, &instanceData); err != nil {
		return fmt.Errorf("failed to parse instance data: %w", err)
	}

	// Execute custom rules
	return v.executeCustomRules(ctx, ruleRefs, instanceData)
}

// executeCustomRules executes all custom validation rules against instance data
func (v *Validator) executeCustomRules(ctx context.Context, ruleRefs []RuleReference, data map[string]interface{}) error {
	for _, ruleRef := range ruleRefs {
		// Get validation rule from database
		var ruleType string
		var config json.RawMessage
		var displayName *string

		var ruleID uuid.UUID
		var err error

		// Try to parse as UUID first (rule_id)
		if ruleRef.RuleID != "" {
			ruleID, err = uuid.Parse(ruleRef.RuleID)
			if err != nil {
				return fmt.Errorf("invalid rule_id format: %w", err)
			}

			err = v.db.Pool.QueryRow(ctx, `
				SELECT rule_type, config, display_name
				FROM validation_rules
				WHERE id = $1
			`, ruleID).Scan(&ruleType, &config, &displayName)
		} else if ruleRef.RuleName != "" {
			// Otherwise, look up by name
			err = v.db.Pool.QueryRow(ctx, `
				SELECT rule_type, config, display_name
				FROM validation_rules
				WHERE name = $1
			`, ruleRef.RuleName).Scan(&ruleType, &config, &displayName)
		} else {
			return fmt.Errorf("rule reference must have either rule_id or rule_name")
		}

		if err != nil {
			return fmt.Errorf("failed to find validation rule: %w", err)
		}

		// Only execute custom rules (other types can be added later)
		if ruleType == "custom" {
			if err := v.executeCustomRule(ctx, config, data, displayName); err != nil {
				return err
			}
		}
	}

	return nil
}

// executeCustomRule executes a single custom rule using CEL
func (v *Validator) executeCustomRule(ctx context.Context, configJSON json.RawMessage, data map[string]interface{}, displayName *string) error {
	var config CustomRuleConfig
	if err := json.Unmarshal(configJSON, &config); err != nil {
		return fmt.Errorf("failed to parse custom rule config: %w", err)
	}

	// Validate required fields
	if config.Expression == "" {
		return fmt.Errorf("custom rule expression cannot be empty")
	}

	// If field is specified, extract field value
	var evalData interface{} = data
	if config.Field != "" {
		fieldValue, exists := data[config.Field]
		if !exists {
			if config.FailOnMissing {
				errMsg := config.ErrorMessage
				if errMsg == "" {
					errMsg = fmt.Sprintf("required field '%s' is missing", config.Field)
				}
				return fmt.Errorf(errMsg)
			}
			return nil // Skip validation if field doesn't exist and fail_on_missing is false
		}
		evalData = fieldValue
	}

	// Try simple expression evaluation first (for common cases)
	if err := v.evaluateSimpleExpression(config.Expression, evalData); err == nil {
		return nil
	}

	// Fall back to CEL evaluation for complex expressions
	if err := v.evaluateCELExpression(config.Expression, data); err != nil {
		errMsg := config.ErrorMessage
		if errMsg == "" {
			ruleName := "validation rule"
			if displayName != nil {
				ruleName = *displayName
			}
			errMsg = fmt.Sprintf("%s failed: %s", ruleName, err.Error())
		}
		return fmt.Errorf(errMsg)
	}

	return nil
}

// evaluateSimpleExpression handles common simple expressions without CEL overhead
func (v *Validator) evaluateSimpleExpression(expression string, value interface{}) error {
	expression = strings.TrimSpace(expression)

	// Handle numeric comparisons
	if matched, _ := regexp.MatchString(`^[\w.]+\s*[><=!]+\s*[-\d.]+$`, expression); matched {
		return v.evaluateNumericComparison(expression, value)
	}

	// Handle regex patterns: field matches "pattern"
	if matched, _ := regexp.MatchString(`^matches\s+["'](.+)["']$`, expression); matched {
		re := regexp.MustCompile(`^matches\s+["'](.+)["']$`)
		matches := re.FindStringSubmatch(expression)
		if len(matches) == 2 {
			return v.evaluateRegex(matches[1], value)
		}
	}

	// Handle length checks: len(field) > 5
	if matched, _ := regexp.MatchString(`^len\(.+\)\s*[><=!]+\s*\d+$`, expression); matched {
		return v.evaluateLengthCheck(expression, value)
	}

	return fmt.Errorf("unsupported simple expression format")
}

// evaluateNumericComparison evaluates numeric comparison expressions
func (v *Validator) evaluateNumericComparison(expression string, value interface{}) error {
	// Parse expression like "value >= 0" or "field > 100"
	re := regexp.MustCompile(`^[\w.]+\s*([><=!]+)\s*([-\d.]+)$`)
	matches := re.FindStringSubmatch(expression)
	if len(matches) != 3 {
		return fmt.Errorf("invalid comparison expression")
	}

	operator := matches[1]
	threshold, err := strconv.ParseFloat(matches[2], 64)
	if err != nil {
		return fmt.Errorf("invalid threshold value: %w", err)
	}

	// Convert value to float64
	var numValue float64
	switch v := value.(type) {
	case float64:
		numValue = v
	case float32:
		numValue = float64(v)
	case int:
		numValue = float64(v)
	case int64:
		numValue = float64(v)
	case string:
		numValue, err = strconv.ParseFloat(v, 64)
		if err != nil {
			return fmt.Errorf("value is not a number")
		}
	default:
		return fmt.Errorf("value is not a number")
	}

	// Evaluate comparison
	switch operator {
	case ">":
		if numValue <= threshold {
			return fmt.Errorf("value %v must be greater than %v", numValue, threshold)
		}
	case ">=":
		if numValue < threshold {
			return fmt.Errorf("value %v must be greater than or equal to %v", numValue, threshold)
		}
	case "<":
		if numValue >= threshold {
			return fmt.Errorf("value %v must be less than %v", numValue, threshold)
		}
	case "<=":
		if numValue > threshold {
			return fmt.Errorf("value %v must be less than or equal to %v", numValue, threshold)
		}
	case "==":
		if numValue != threshold {
			return fmt.Errorf("value %v must equal %v", numValue, threshold)
		}
	case "!=":
		if numValue == threshold {
			return fmt.Errorf("value %v must not equal %v", numValue, threshold)
		}
	default:
		return fmt.Errorf("unsupported operator: %s", operator)
	}

	return nil
}

// evaluateRegex evaluates regex pattern matching
func (v *Validator) evaluateRegex(pattern string, value interface{}) error {
	strValue, ok := value.(string)
	if !ok {
		return fmt.Errorf("value must be a string for regex matching")
	}

	matched, err := regexp.MatchString(pattern, strValue)
	if err != nil {
		return fmt.Errorf("invalid regex pattern: %w", err)
	}

	if !matched {
		return fmt.Errorf("value does not match required pattern")
	}

	return nil
}

// evaluateLengthCheck evaluates length comparison expressions
func (v *Validator) evaluateLengthCheck(expression string, value interface{}) error {
	re := regexp.MustCompile(`^len\(.+\)\s*([><=!]+)\s*(\d+)$`)
	matches := re.FindStringSubmatch(expression)
	if len(matches) != 3 {
		return fmt.Errorf("invalid length expression")
	}

	operator := matches[1]
	threshold, _ := strconv.Atoi(matches[2])

	// Get length of value
	var length int
	switch v := value.(type) {
	case string:
		length = len(v)
	case []interface{}:
		length = len(v)
	case map[string]interface{}:
		length = len(v)
	default:
		return fmt.Errorf("value type does not support length operation")
	}

	// Evaluate comparison
	switch operator {
	case ">":
		if length <= threshold {
			return fmt.Errorf("length %d must be greater than %d", length, threshold)
		}
	case ">=":
		if length < threshold {
			return fmt.Errorf("length %d must be greater than or equal to %d", length, threshold)
		}
	case "<":
		if length >= threshold {
			return fmt.Errorf("length %d must be less than %d", length, threshold)
		}
	case "<=":
		if length > threshold {
			return fmt.Errorf("length %d must be less than or equal to %d", length, threshold)
		}
	case "==":
		if length != threshold {
			return fmt.Errorf("length %d must equal %d", length, threshold)
		}
	case "!=":
		if length == threshold {
			return fmt.Errorf("length %d must not equal %d", length, threshold)
		}
	default:
		return fmt.Errorf("unsupported operator: %s", operator)
	}

	return nil
}

// evaluateCELExpression evaluates complex expressions using CEL
func (v *Validator) evaluateCELExpression(expression string, data map[string]interface{}) error {
	// Create CEL environment
	env, err := cel.NewEnv(
		cel.Variable("data", cel.DynType),
	)
	if err != nil {
		return fmt.Errorf("failed to create CEL environment: %w", err)
	}

	// Parse and compile the expression
	ast, issues := env.Compile(expression)
	if issues != nil && issues.Err() != nil {
		return fmt.Errorf("failed to compile expression: %w", issues.Err())
	}

	// Create the program
	prg, err := env.Program(ast)
	if err != nil {
		return fmt.Errorf("failed to create CEL program: %w", err)
	}

	// Evaluate the expression
	out, _, err := prg.Eval(map[string]interface{}{
		"data": data,
	})
	if err != nil {
		return fmt.Errorf("failed to evaluate expression: %w", err)
	}

	// Check if result is boolean true
	if out.Type() != types.BoolType {
		return fmt.Errorf("expression must return a boolean value")
	}

	result := out.Value().(bool)
	if !result {
		return fmt.Errorf("validation expression evaluated to false")
	}

	return nil
}

// ValidateRule executes a single validation rule by name
func (v *Validator) ValidateRule(ctx context.Context, ruleName string, value interface{}) error {
	var ruleType string
	var config json.RawMessage
	var displayName *string

	err := v.db.Pool.QueryRow(ctx, `
		SELECT rule_type, config, display_name
		FROM validation_rules
		WHERE name = $1
	`, ruleName).Scan(&ruleType, &config, &displayName)

	if err != nil {
		return fmt.Errorf("failed to find validation rule '%s': %w", ruleName, err)
	}

	// Create a simple data map with the value
	data := map[string]interface{}{
		"value": value,
	}

	if ruleType == "custom" {
		return v.executeCustomRule(ctx, config, data, displayName)
	}

	return fmt.Errorf("unsupported rule type: %s", ruleType)
}
