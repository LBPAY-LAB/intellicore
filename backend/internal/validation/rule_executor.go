package validation

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

// RuleExecutorService provides validation rule execution capabilities
type RuleExecutorService struct {
	db       *pgxpool.Pool
	registry *RuleRegistry
}

// NewRuleExecutorService creates a new rule executor service
func NewRuleExecutorService(db *pgxpool.Pool) *RuleExecutorService {
	registry := NewRuleRegistry()

	// Configure SQL and Composite executors with DB
	sqlExecutor := NewSQLQueryRuleExecutor(db)
	registry.RegisterRule("sql_query", sqlExecutor)

	compositeExecutor := NewCompositeRuleExecutor(db, registry)
	registry.RegisterRule("composite", compositeExecutor)

	// API Call executor
	apiExecutor := NewAPICallRuleExecutor()
	registry.RegisterRule("api_call", apiExecutor)

	return &RuleExecutorService{
		db:       db,
		registry: registry,
	}
}

// GetRegistry returns the rule registry
func (s *RuleExecutorService) GetRegistry() *RuleRegistry {
	return s.registry
}

// ValidateData validates instance data against validation rules
func (s *RuleExecutorService) ValidateData(ctx context.Context, rulesJSON json.RawMessage, data json.RawMessage) error {
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

	// Execute all rules
	var errors []string

	for i, ruleRef := range ruleRefs {
		if err := s.executeRule(ctx, ruleRef, instanceData); err != nil {
			errors = append(errors, fmt.Sprintf("rule %d: %s", i, err.Error()))
		}
	}

	// If any errors, return them
	if len(errors) > 0 {
		return fmt.Errorf("validation failed: %v", errors)
	}

	return nil
}

// executeRule executes a single validation rule
func (s *RuleExecutorService) executeRule(ctx context.Context, ruleRef RuleReference, data map[string]interface{}) error {
	// Get validation rule from database
	var ruleType string
	var config json.RawMessage
	var displayName *string

	if ruleRef.RuleID != "" {
		ruleID, err := uuid.Parse(ruleRef.RuleID)
		if err != nil {
			return fmt.Errorf("invalid rule_id format: %w", err)
		}

		err = s.db.QueryRow(ctx, `
			SELECT rule_type, config, display_name
			FROM validation_rules
			WHERE id = $1
		`, ruleID).Scan(&ruleType, &config, &displayName)

		if err != nil {
			return fmt.Errorf("failed to find validation rule by ID: %w", err)
		}
	} else if ruleRef.RuleName != "" {
		err := s.db.QueryRow(ctx, `
			SELECT rule_type, config, display_name
			FROM validation_rules
			WHERE name = $1
		`, ruleRef.RuleName).Scan(&ruleType, &config, &displayName)

		if err != nil {
			return fmt.Errorf("failed to find validation rule by name: %w", err)
		}
	} else {
		return fmt.Errorf("rule reference must have either rule_id or rule_name")
	}

	// Merge rule-specific config with reference config
	if ruleRef.Config != nil && len(ruleRef.Config) > 0 {
		config = s.mergeConfigs(config, ruleRef.Config)
	}

	// Get executor for rule type
	executor, err := s.registry.GetExecutor(ruleType)
	if err != nil {
		return fmt.Errorf("no executor for rule type '%s': %w", ruleType, err)
	}

	// Execute the rule
	if err := executor.Execute(config, data); err != nil {
		// Add display name to error if available
		if displayName != nil && *displayName != "" {
			return fmt.Errorf("%s: %w", *displayName, err)
		}
		return err
	}

	return nil
}

// mergeConfigs merges rule reference config with base config
func (s *RuleExecutorService) mergeConfigs(baseConfig json.RawMessage, refConfig map[string]interface{}) json.RawMessage {
	var base map[string]interface{}
	if err := json.Unmarshal(baseConfig, &base); err != nil {
		return baseConfig
	}

	// Merge refConfig into base
	for key, value := range refConfig {
		base[key] = value
	}

	merged, err := json.Marshal(base)
	if err != nil {
		return baseConfig
	}

	return merged
}

// ValidateRuleByName executes a single validation rule by name
func (s *RuleExecutorService) ValidateRuleByName(ctx context.Context, ruleName string, value interface{}) error {
	var ruleType string
	var config json.RawMessage
	var displayName *string

	err := s.db.QueryRow(ctx, `
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

	// Get executor
	executor, err := s.registry.GetExecutor(ruleType)
	if err != nil {
		return fmt.Errorf("no executor for rule type '%s': %w", ruleType, err)
	}

	// Execute
	if err := executor.Execute(config, data); err != nil {
		if displayName != nil && *displayName != "" {
			return fmt.Errorf("%s: %w", *displayName, err)
		}
		return err
	}

	return nil
}

// RuleReference represents a rule reference in the object definition
type RuleReference struct {
	RuleID   string                 `json:"rule_id,omitempty"`
	RuleName string                 `json:"rule_name,omitempty"`
	Config   map[string]interface{} `json:"config,omitempty"`
}
