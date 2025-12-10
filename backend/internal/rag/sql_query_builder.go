package rag

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

// SQLQueryBuilder constrói queries SQL dinamicamente
type SQLQueryBuilder struct {
	db *sql.DB
}

// QueryContext define o contexto de uma query
type QueryContext struct {
	ObjectType       string                 // "cliente_pf", "conta_corrente"
	ObjectDefID      uuid.UUID              // ID da object_definition
	State            string                 // "ATIVO"
	Filters          map[string]interface{} // {"saldo": {"$gt": 1000}}
	Aggregation      string                 // "count", "sum", "avg", "min", "max"
	AggregationField string                 // campo para agregação
	TimeRange        *TimeRange
	OrderBy          string
	Limit            int
}

// TimeRange define um intervalo de tempo
type TimeRange struct {
	Field string    // "created_at"
	Start time.Time // início do período
	End   time.Time // fim do período
}

// QueryResult contém os resultados da query
type QueryResult struct {
	Rows    []map[string]interface{} // Linhas retornadas
	Count   int                      // Total de linhas
	Summary map[string]interface{}   // Para agregações
}

// NewSQLQueryBuilder cria um novo query builder
func NewSQLQueryBuilder(db *sql.DB) *SQLQueryBuilder {
	return &SQLQueryBuilder{db: db}
}

// BuildQuery constrói query SQL dinamicamente
func (b *SQLQueryBuilder) BuildQuery(ctx QueryContext) string {
	var query strings.Builder

	// SELECT clause
	if ctx.Aggregation != "" {
		switch ctx.Aggregation {
		case "count":
			query.WriteString("SELECT COUNT(*) as total")
		case "sum":
			if ctx.AggregationField != "" {
				query.WriteString(fmt.Sprintf("SELECT SUM((data->>'%s')::numeric) as total", ctx.AggregationField))
			} else {
				query.WriteString("SELECT COUNT(*) as total") // fallback
			}
		case "avg":
			if ctx.AggregationField != "" {
				query.WriteString(fmt.Sprintf("SELECT AVG((data->>'%s')::numeric) as average", ctx.AggregationField))
			}
		case "min":
			if ctx.AggregationField != "" {
				query.WriteString(fmt.Sprintf("SELECT MIN((data->>'%s')::numeric) as minimum", ctx.AggregationField))
			}
		case "max":
			if ctx.AggregationField != "" {
				query.WriteString(fmt.Sprintf("SELECT MAX((data->>'%s')::numeric) as maximum", ctx.AggregationField))
			}
		}
	} else {
		query.WriteString("SELECT id, data, current_state, created_at, updated_at")
	}

	// FROM clause
	query.WriteString(" FROM instances")

	// WHERE clause
	var whereClauses []string
	whereClauses = append(whereClauses, "is_deleted = false")

	if ctx.ObjectDefID != uuid.Nil {
		whereClauses = append(whereClauses, fmt.Sprintf("object_definition_id = '%s'", ctx.ObjectDefID))
	}

	if ctx.State != "" {
		whereClauses = append(whereClauses, fmt.Sprintf("current_state = '%s'", ctx.State))
	}

	// Filtros em campos JSONB
	for field, condition := range ctx.Filters {
		switch cond := condition.(type) {
		case map[string]interface{}:
			if gt, ok := cond["$gt"]; ok {
				whereClauses = append(whereClauses, fmt.Sprintf("(data->>'%s')::numeric > %v", field, gt))
			}
			if lt, ok := cond["$lt"]; ok {
				whereClauses = append(whereClauses, fmt.Sprintf("(data->>'%s')::numeric < %v", field, lt))
			}
			if gte, ok := cond["$gte"]; ok {
				whereClauses = append(whereClauses, fmt.Sprintf("(data->>'%s')::numeric >= %v", field, gte))
			}
			if lte, ok := cond["$lte"]; ok {
				whereClauses = append(whereClauses, fmt.Sprintf("(data->>'%s')::numeric <= %v", field, lte))
			}
			if eq, ok := cond["$eq"]; ok {
				switch v := eq.(type) {
				case string:
					whereClauses = append(whereClauses, fmt.Sprintf("data->>'%s' = '%s'", field, v))
				case float64:
					whereClauses = append(whereClauses, fmt.Sprintf("(data->>'%s')::numeric = %v", field, v))
				default:
					whereClauses = append(whereClauses, fmt.Sprintf("data->>'%s' = '%v'", field, v))
				}
			}
			if contains, ok := cond["$contains"]; ok {
				whereClauses = append(whereClauses, fmt.Sprintf("data->>'%s' ILIKE '%%%v%%'", field, contains))
			}
		}
	}

	// Time range
	if ctx.TimeRange != nil {
		if !ctx.TimeRange.Start.IsZero() {
			whereClauses = append(whereClauses, fmt.Sprintf("%s >= '%s'", ctx.TimeRange.Field, ctx.TimeRange.Start.Format("2006-01-02 15:04:05")))
		}
		if !ctx.TimeRange.End.IsZero() {
			whereClauses = append(whereClauses, fmt.Sprintf("%s <= '%s'", ctx.TimeRange.Field, ctx.TimeRange.End.Format("2006-01-02 15:04:05")))
		}
	}

	if len(whereClauses) > 0 {
		query.WriteString(" WHERE ")
		query.WriteString(strings.Join(whereClauses, " AND "))
	}

	// ORDER BY
	if ctx.OrderBy != "" && ctx.Aggregation == "" {
		query.WriteString(fmt.Sprintf(" ORDER BY %s", ctx.OrderBy))
	}

	// LIMIT
	if ctx.Limit > 0 && ctx.Aggregation == "" {
		query.WriteString(fmt.Sprintf(" LIMIT %d", ctx.Limit))
	}

	return query.String()
}

// Execute executa a query e retorna resultados
func (b *SQLQueryBuilder) Execute(ctx context.Context, queryCtx QueryContext) (*QueryResult, error) {
	query := b.BuildQuery(queryCtx)

	rows, err := b.db.QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	result := &QueryResult{
		Rows:    []map[string]interface{}{},
		Summary: make(map[string]interface{}),
	}

	// Parse columns
	columns, err := rows.Columns()
	if err != nil {
		return nil, fmt.Errorf("failed to get columns: %w", err)
	}

	// Se é agregação, retorna summary
	if queryCtx.Aggregation != "" {
		if rows.Next() {
			var value interface{}
			if err := rows.Scan(&value); err != nil {
				return nil, fmt.Errorf("failed to scan aggregation result: %w", err)
			}
			result.Summary[queryCtx.Aggregation] = value
		}
		return result, nil
	}

	// Parse rows
	for rows.Next() {
		values := make([]interface{}, len(columns))
		valuePtrs := make([]interface{}, len(columns))
		for i := range values {
			valuePtrs[i] = &values[i]
		}

		if err := rows.Scan(valuePtrs...); err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		row := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			// Convert []byte to string for better JSON serialization
			if b, ok := val.([]byte); ok {
				row[col] = string(b)
			} else {
				row[col] = val
			}
		}

		result.Rows = append(result.Rows, row)
	}

	result.Count = len(result.Rows)
	return result, nil
}
