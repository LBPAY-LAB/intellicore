package statemachine

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
)

type StateMachine struct {
	db        *database.DB
	evaluator ConditionEvaluator
}

func New(db *database.DB) *StateMachine {
	evaluator, err := NewConditionEvaluator()
	if err != nil {
		// This should never happen in production, but handle gracefully
		panic(fmt.Sprintf("failed to create condition evaluator: %v", err))
	}

	return &StateMachine{
		db:        db,
		evaluator: evaluator,
	}
}

// evaluateCondition evaluates a CEL expression against instance data
// Returns true if condition passes, false if it fails, or error if invalid
// Deprecated: Use the ConditionEvaluator interface directly for new code
func (sm *StateMachine) evaluateCondition(condition string, instance *models.Instance) (bool, error) {
	return EvaluateInstanceCondition(sm.evaluator, condition, instance)
}

// FSMConfig represents the structure of the states JSON field
type FSMConfig struct {
	Initial     string        `json:"initial"`
	States      []string      `json:"states"`
	Transitions []Transition  `json:"transitions"`
}

type Transition struct {
	From      string  `json:"from"`
	To        string  `json:"to"`
	Condition *string `json:"condition"`
}

// Transition moves an instance from one state to another
func (sm *StateMachine) Transition(ctx context.Context, instanceID uuid.UUID, toState string, reason *string) (*models.Instance, error) {
	// Get current instance and its object definition
	var inst models.Instance
	var fsmConfigJSON json.RawMessage

	err := sm.db.Pool.QueryRow(ctx, `
		SELECT i.id, i.object_definition_id, i.data, i.current_state, i.state_history, i.version,
		       i.created_at, i.updated_at, i.created_by, i.updated_by, i.is_deleted, i.deleted_at, i.deleted_by,
		       od.states
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE i.id = $1 AND i.is_deleted = false
	`, instanceID).Scan(
		&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState, &inst.StateHistory,
		&inst.Version, &inst.CreatedAt, &inst.UpdatedAt, &inst.CreatedBy, &inst.UpdatedBy,
		&inst.IsDeleted, &inst.DeletedAt, &inst.DeletedBy, &fsmConfigJSON,
	)

	if err != nil {
		return nil, fmt.Errorf("instance not found: %w", err)
	}

	// Parse FSM config
	var fsmConfig FSMConfig
	if err := json.Unmarshal(fsmConfigJSON, &fsmConfig); err != nil {
		return nil, fmt.Errorf("failed to parse FSM config: %w", err)
	}

	// Validate that toState exists in allowed states
	stateExists := false
	for _, state := range fsmConfig.States {
		if state == toState {
			stateExists = true
			break
		}
	}

	if !stateExists {
		return nil, fmt.Errorf("invalid target state: %s", toState)
	}

	// Check if transition is allowed and evaluate condition
	var matchedTransition *Transition
	for i, trans := range fsmConfig.Transitions {
		if trans.From == inst.CurrentState && trans.To == toState {
			matchedTransition = &fsmConfig.Transitions[i]
			break
		}
	}

	if matchedTransition == nil {
		return nil, fmt.Errorf("transition from %s to %s not allowed", inst.CurrentState, toState)
	}

	// Evaluate condition if present
	if matchedTransition.Condition != nil && *matchedTransition.Condition != "" {
		conditionMet, err := sm.evaluateCondition(*matchedTransition.Condition, &inst)
		if err != nil {
			return nil, fmt.Errorf("failed to evaluate transition condition: %w", err)
		}
		if !conditionMet {
			return nil, fmt.Errorf("transition condition not met: %s", *matchedTransition.Condition)
		}
	}

	// Parse existing state history
	var stateHistory []models.StateHistoryEntry
	if err := json.Unmarshal(inst.StateHistory, &stateHistory); err != nil {
		stateHistory = []models.StateHistoryEntry{}
	}

	// Add new entry to history
	stateHistory = append(stateHistory, models.StateHistoryEntry{
		State:     toState,
		Timestamp: time.Now(),
		Reason:    reason,
	})

	stateHistoryJSON, _ := json.Marshal(stateHistory)

	// Update instance with new state
	err = sm.db.Pool.QueryRow(ctx, `
		UPDATE instances
		SET current_state = $1, state_history = $2, version = version + 1, updated_at = NOW()
		WHERE id = $3
		RETURNING id, object_definition_id, data, current_state, state_history, version,
		          created_at, updated_at, created_by, updated_by, is_deleted, deleted_at, deleted_by
	`, toState, stateHistoryJSON, instanceID).Scan(
		&inst.ID, &inst.ObjectDefinitionID, &inst.Data, &inst.CurrentState, &inst.StateHistory,
		&inst.Version, &inst.CreatedAt, &inst.UpdatedAt, &inst.CreatedBy, &inst.UpdatedBy,
		&inst.IsDeleted, &inst.DeletedAt, &inst.DeletedBy,
	)

	if err != nil {
		return nil, fmt.Errorf("failed to update instance state: %w", err)
	}

	return &inst, nil
}

// GetAllowedTransitions returns the list of allowed transitions from the current state
func (sm *StateMachine) GetAllowedTransitions(ctx context.Context, instanceID uuid.UUID) ([]string, error) {
	var currentState string
	var fsmConfigJSON json.RawMessage

	err := sm.db.Pool.QueryRow(ctx, `
		SELECT i.current_state, od.states
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE i.id = $1
	`, instanceID).Scan(&currentState, &fsmConfigJSON)

	if err != nil {
		return nil, err
	}

	var fsmConfig FSMConfig
	if err := json.Unmarshal(fsmConfigJSON, &fsmConfig); err != nil {
		return nil, err
	}

	allowedStates := []string{}
	for _, trans := range fsmConfig.Transitions {
		if trans.From == currentState {
			allowedStates = append(allowedStates, trans.To)
		}
	}

	return allowedStates, nil
}
