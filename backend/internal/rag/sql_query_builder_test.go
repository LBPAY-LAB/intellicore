package rag

import (
	"testing"

	"github.com/google/uuid"
)

func TestBuildQuery(t *testing.T) {
	builder := &SQLQueryBuilder{}

	tests := []struct {
		name     string
		ctx      QueryContext
		expected string
	}{
		{
			name: "Simple count",
			ctx: QueryContext{
				ObjectDefID: uuid.MustParse("123e4567-e89b-12d3-a456-426614174000"),
				Aggregation: "count",
			},
			expected: "SELECT COUNT(*) as total FROM instances WHERE is_deleted = false AND object_definition_id = '123e4567-e89b-12d3-a456-426614174000'",
		},
		{
			name: "Filter by state",
			ctx: QueryContext{
				ObjectDefID: uuid.MustParse("123e4567-e89b-12d3-a456-426614174000"),
				State:       "ATIVO",
			},
			expected: "SELECT id, data, current_state, created_at, updated_at FROM instances WHERE is_deleted = false AND object_definition_id = '123e4567-e89b-12d3-a456-426614174000' AND current_state = 'ATIVO'",
		},
		{
			name: "With limit",
			ctx: QueryContext{
				ObjectDefID: uuid.MustParse("123e4567-e89b-12d3-a456-426614174000"),
				Limit:       10,
			},
			expected: "SELECT id, data, current_state, created_at, updated_at FROM instances WHERE is_deleted = false AND object_definition_id = '123e4567-e89b-12d3-a456-426614174000' LIMIT 10",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			query := builder.BuildQuery(tt.ctx)
			if query != tt.expected {
				t.Errorf("BuildQuery() = %v, want %v", query, tt.expected)
			}
		})
	}
}
