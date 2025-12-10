package validation

import (
	"fmt"
	"sync"
)

// RuleRegistry manages the mapping between rule types and their executors
type RuleRegistry struct {
	executors map[string]RuleExecutor
	mu        sync.RWMutex
}

// NewRuleRegistry creates a new rule registry with default executors
func NewRuleRegistry() *RuleRegistry {
	registry := &RuleRegistry{
		executors: make(map[string]RuleExecutor),
	}

	// Register default executors
	registry.registerDefaultExecutors()

	return registry
}

// registerDefaultExecutors registers all built-in rule executors
func (r *RuleRegistry) registerDefaultExecutors() {
	r.executors["regex"] = &RegexRuleExecutor{}
	r.executors["function"] = &FunctionRuleExecutor{}
	r.executors["api_call"] = &APICallRuleExecutor{}
	r.executors["sql_query"] = &SQLQueryRuleExecutor{}
	r.executors["composite"] = &CompositeRuleExecutor{}
}

// RegisterRule registers a custom rule executor for a given rule type
func (r *RuleRegistry) RegisterRule(ruleType string, executor RuleExecutor) error {
	r.mu.Lock()
	defer r.mu.Unlock()

	if ruleType == "" {
		return fmt.Errorf("rule type cannot be empty")
	}

	if executor == nil {
		return fmt.Errorf("executor cannot be nil")
	}

	r.executors[ruleType] = executor
	return nil
}

// GetExecutor retrieves the executor for a given rule type
func (r *RuleRegistry) GetExecutor(ruleType string) (RuleExecutor, error) {
	r.mu.RLock()
	defer r.mu.RUnlock()

	executor, exists := r.executors[ruleType]
	if !exists {
		return nil, fmt.Errorf("no executor registered for rule type: %s", ruleType)
	}

	return executor, nil
}

// UnregisterRule removes a rule executor
func (r *RuleRegistry) UnregisterRule(ruleType string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	delete(r.executors, ruleType)
}

// ListRegisteredTypes returns all registered rule types
func (r *RuleRegistry) ListRegisteredTypes() []string {
	r.mu.RLock()
	defer r.mu.RUnlock()

	types := make([]string, 0, len(r.executors))
	for ruleType := range r.executors {
		types = append(types, ruleType)
	}

	return types
}

// HasExecutor checks if an executor is registered for a rule type
func (r *RuleRegistry) HasExecutor(ruleType string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()

	_, exists := r.executors[ruleType]
	return exists
}
