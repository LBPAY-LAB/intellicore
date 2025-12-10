package validation

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// SQLQueryRuleExecutor executes SQL-based validation rules
type SQLQueryRuleExecutor struct {
	db *pgxpool.Pool
}

// NewSQLQueryRuleExecutor creates a new SQL query executor
func NewSQLQueryRuleExecutor(db *pgxpool.Pool) *SQLQueryRuleExecutor {
	return &SQLQueryRuleExecutor{db: db}
}

// SetDB sets the database connection pool
func (e *SQLQueryRuleExecutor) SetDB(db *pgxpool.Pool) {
	e.db = db
}

// Execute runs a SQL query to validate data
func (e *SQLQueryRuleExecutor) Execute(configJSON json.RawMessage, data map[string]interface{}) error {
	if e.db == nil {
		return fmt.Errorf("database connection not configured for SQL rule executor")
	}

	var config SQLQueryConfig
	if err := json.Unmarshal(configJSON, &config); err != nil {
		return fmt.Errorf("failed to parse SQL query config: %w", err)
	}

	// Validate configuration
	if config.Query == "" {
		return fmt.Errorf("sql_query rule: query is required")
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Extract parameter values from data
	params := make([]interface{}, 0, len(config.Params))
	for _, paramName := range config.Params {
		value, exists := data[paramName]
		if !exists {
			return fmt.Errorf("parameter '%s' not found in data", paramName)
		}
		params = append(params, value)
	}

	// Execute query
	rows, err := e.db.Query(ctx, config.Query, params...)
	if err != nil {
		return fmt.Errorf("failed to execute validation query: %w", err)
	}
	defer rows.Close()

	// Check if rows exist
	hasRows := rows.Next()

	// Validate based on expectation
	if config.ExpectExists && !hasRows {
		errMsg := config.ErrorMessage
		if errMsg == "" {
			errMsg = "validation query returned no rows (expected at least one)"
		}
		return NewValidationError(errMsg)
	}

	if !config.ExpectExists && hasRows {
		errMsg := config.ErrorMessage
		if errMsg == "" {
			errMsg = "validation query returned rows (expected none)"
		}
		return NewValidationError(errMsg)
	}

	return nil
}
