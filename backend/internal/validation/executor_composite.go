package validation

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CompositeRuleExecutor executes composite validation rules (AND/OR combinations)
type CompositeRuleExecutor struct {
	db       *pgxpool.Pool
	registry *RuleRegistry
}

// NewCompositeRuleExecutor creates a new composite rule executor
func NewCompositeRuleExecutor(db *pgxpool.Pool, registry *RuleRegistry) *CompositeRuleExecutor {
	return &CompositeRuleExecutor{
		db:       db,
		registry: registry,
	}
}

// SetDB sets the database connection pool
func (e *CompositeRuleExecutor) SetDB(db *pgxpool.Pool) {
	e.db = db
}

// SetRegistry sets the rule registry
func (e *CompositeRuleExecutor) SetRegistry(registry *RuleRegistry) {
	e.registry = registry
}

// Execute runs multiple rules with AND/OR logic
func (e *CompositeRuleExecutor) Execute(configJSON json.RawMessage, data map[string]interface{}) error {
	if e.db == nil {
		return fmt.Errorf("database connection not configured for composite rule executor")
	}

	if e.registry == nil {
		return fmt.Errorf("rule registry not configured for composite rule executor")
	}

	var config CompositeConfig
	if err := json.Unmarshal(configJSON, &config); err != nil {
		return fmt.Errorf("failed to parse composite config: %w", err)
	}

	// Validate configuration
	if len(config.Rules) == 0 {
		return fmt.Errorf("composite rule: at least one rule is required")
	}

	if config.Operator == "" {
		config.Operator = "AND"
	}

	operator := strings.ToUpper(config.Operator)
	if operator != "AND" && operator != "OR" {
		return fmt.Errorf("composite rule: operator must be 'AND' or 'OR'")
	}

	// Execute all rules
	var errors []string
	successCount := 0

	ctx := context.Background()

	for i, rule := range config.Rules {
		// Fetch rule from database
		var ruleType string
		var ruleConfig json.RawMessage

		if rule.RuleID != "" {
			ruleID, err := uuid.Parse(rule.RuleID)
			if err != nil {
				errors = append(errors, fmt.Sprintf("rule %d: invalid rule_id format", i))
				continue
			}

			err = e.db.QueryRow(ctx, `
				SELECT rule_type, config FROM validation_rules WHERE id = $1
			`, ruleID).Scan(&ruleType, &ruleConfig)

			if err != nil {
				errors = append(errors, fmt.Sprintf("rule %d: failed to fetch rule by ID", i))
				continue
			}
		} else if rule.RuleName != "" {
			err := e.db.QueryRow(ctx, `
				SELECT rule_type, config FROM validation_rules WHERE name = $1
			`, rule.RuleName).Scan(&ruleType, &ruleConfig)

			if err != nil {
				errors = append(errors, fmt.Sprintf("rule %d: failed to fetch rule by name", i))
				continue
			}
		} else {
			errors = append(errors, fmt.Sprintf("rule %d: must have either rule_id or rule_name", i))
			continue
		}

		// Get executor for rule type
		executor, err := e.registry.GetExecutor(ruleType)
		if err != nil {
			errors = append(errors, fmt.Sprintf("rule %d: %v", i, err))
			continue
		}

		// Execute the rule
		if err := executor.Execute(ruleConfig, data); err != nil {
			errors = append(errors, err.Error())
		} else {
			successCount++
		}
	}

	// Evaluate result based on operator
	if operator == "AND" {
		if len(errors) > 0 {
			errMsg := config.ErrorMessage
			if errMsg == "" {
				errMsg = fmt.Sprintf("composite validation failed (AND): %s", strings.Join(errors, "; "))
			}
			return NewValidationError(errMsg)
		}
	} else { // OR
		if successCount == 0 {
			errMsg := config.ErrorMessage
			if errMsg == "" {
				errMsg = fmt.Sprintf("composite validation failed (OR): all rules failed - %s", strings.Join(errors, "; "))
			}
			return NewValidationError(errMsg)
		}
	}

	return nil
}
