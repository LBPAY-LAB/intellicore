package rag

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/backend/internal/services"
)

// EntityExtractor extrai entidades estruturadas de perguntas em linguagem natural
type EntityExtractor struct {
	llmService *services.LLMService
	db         *sql.DB
}

// NewEntityExtractor cria um novo extrator de entidades
func NewEntityExtractor(llm *services.LLMService, db *sql.DB) *EntityExtractor {
	return &EntityExtractor{
		llmService: llm,
		db:         db,
	}
}

// Extract extrai entidades estruturadas de uma pergunta em linguagem natural
func (e *EntityExtractor) Extract(ctx context.Context, question string) (*QueryContext, error) {
	// 1. Busca object_definitions disponíveis
	rows, err := e.db.QueryContext(ctx, "SELECT name, display_name FROM object_definitions WHERE is_active = true")
	if err != nil {
		return nil, fmt.Errorf("failed to fetch object definitions: %w", err)
	}
	defer rows.Close()

	objectTypes := make(map[string]string) // name -> display_name
	for rows.Next() {
		var name, displayName string
		if err := rows.Scan(&name, &displayName); err != nil {
			return nil, fmt.Errorf("failed to scan object definition: %w", err)
		}
		objectTypes[name] = displayName
	}

	if len(objectTypes) == 0 {
		return nil, fmt.Errorf("no object definitions found in the system")
	}

	// 2. Monta prompt para LLM
	objectTypesJSON, _ := json.MarshalIndent(objectTypes, "", "  ")
	prompt := fmt.Sprintf(`Você é um extrator de entidades para um sistema de Core Banking.

PERGUNTA: %s

OBJETOS DISPONÍVEIS NO SISTEMA:
%s

Extraia as seguintes entidades da pergunta (retorne JSON):
- object_type: qual tipo de objeto está sendo perguntado? (use o 'name', não o display_name)
- state: algum estado específico? (ex: ATIVO, BLOQUEADO)
- filters: quaisquer filtros mencionados (formato: {"campo": {"$gt": valor}})
- aggregation: tipo de agregação (count, sum, avg, min, max) ou null
- aggregation_field: campo para agregação (se aplicável)
- time_range: período de tempo mencionado (formato: {"field": "created_at", "start": "2024-01-01", "end": "2024-12-31"})
- order_by: ordenação mencionada (ex: "created_at DESC")
- limit: limite de resultados (número ou null)

Exemplos:
- "Quantos clientes ativos?" → {"object_type": "cliente_pf", "state": "ATIVO", "aggregation": "count"}
- "Contas com saldo acima de 1000" → {"object_type": "conta_corrente", "filters": {"saldo": {"$gt": 1000}}}
- "Últimas 10 transações" → {"object_type": "transacao", "order_by": "created_at DESC", "limit": 10}
- "Clientes cadastrados nos últimos 7 dias" → {"object_type": "cliente_pf", "time_range": {"field": "created_at", "start": "LAST_7_DAYS"}}

Para time_range, use valores especiais como "LAST_7_DAYS", "LAST_30_DAYS", "TODAY", "YESTERDAY", ou datas específicas.

Retorne APENAS o JSON, sem explicações.
`, question, string(objectTypesJSON))

	// 3. Gera extração via LLM
	response, err := e.llmService.Generate(ctx, prompt, 0.1)
	if err != nil {
		return nil, fmt.Errorf("failed to generate entity extraction: %w", err)
	}

	// 4. Parse JSON response
	var result map[string]interface{}
	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return nil, fmt.Errorf("failed to parse LLM response as JSON: %w (response: %s)", err, response)
	}

	// 5. Converte para QueryContext
	qctx := &QueryContext{
		Filters: make(map[string]interface{}),
	}

	// Object type
	if objType, ok := result["object_type"].(string); ok && objType != "" {
		qctx.ObjectType = objType

		// Busca object_definition_id
		var id uuid.UUID
		err := e.db.QueryRowContext(ctx, "SELECT id FROM object_definitions WHERE name = $1", objType).Scan(&id)
		if err != nil && err != sql.ErrNoRows {
			return nil, fmt.Errorf("failed to fetch object definition ID: %w", err)
		}
		qctx.ObjectDefID = id
	}

	// State
	if state, ok := result["state"].(string); ok && state != "" {
		qctx.State = state
	}

	// Filters
	if filters, ok := result["filters"].(map[string]interface{}); ok {
		qctx.Filters = filters
	}

	// Aggregation
	if agg, ok := result["aggregation"].(string); ok && agg != "" && agg != "null" {
		qctx.Aggregation = agg
	}

	// Aggregation field
	if aggField, ok := result["aggregation_field"].(string); ok && aggField != "" {
		qctx.AggregationField = aggField
	}

	// Time range
	if timeRange, ok := result["time_range"].(map[string]interface{}); ok && len(timeRange) > 0 {
		tr, err := e.parseTimeRange(timeRange)
		if err == nil {
			qctx.TimeRange = tr
		}
	}

	// Order by
	if orderBy, ok := result["order_by"].(string); ok && orderBy != "" {
		qctx.OrderBy = orderBy
	}

	// Limit
	if limit, ok := result["limit"].(float64); ok && limit > 0 {
		qctx.Limit = int(limit)
	}

	return qctx, nil
}

// parseTimeRange converte time_range do LLM para TimeRange struct
func (e *EntityExtractor) parseTimeRange(tr map[string]interface{}) (*TimeRange, error) {
	timeRange := &TimeRange{
		Field: "created_at", // default
	}

	// Field
	if field, ok := tr["field"].(string); ok && field != "" {
		timeRange.Field = field
	}

	now := time.Now()

	// Start
	if start, ok := tr["start"].(string); ok && start != "" {
		switch start {
		case "TODAY":
			timeRange.Start = time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		case "YESTERDAY":
			yesterday := now.AddDate(0, 0, -1)
			timeRange.Start = time.Date(yesterday.Year(), yesterday.Month(), yesterday.Day(), 0, 0, 0, 0, yesterday.Location())
		case "LAST_7_DAYS":
			timeRange.Start = now.AddDate(0, 0, -7)
		case "LAST_30_DAYS":
			timeRange.Start = now.AddDate(0, 0, -30)
		case "LAST_90_DAYS":
			timeRange.Start = now.AddDate(0, 0, -90)
		default:
			// Tenta parse de data ISO
			t, err := time.Parse("2006-01-02", start)
			if err != nil {
				return nil, fmt.Errorf("invalid time range start: %s", start)
			}
			timeRange.Start = t
		}
	}

	// End
	if end, ok := tr["end"].(string); ok && end != "" {
		switch end {
		case "NOW":
			timeRange.End = now
		case "TODAY":
			timeRange.End = time.Date(now.Year(), now.Month(), now.Day(), 23, 59, 59, 0, now.Location())
		default:
			// Tenta parse de data ISO
			t, err := time.Parse("2006-01-02", end)
			if err != nil {
				return nil, fmt.Errorf("invalid time range end: %s", end)
			}
			timeRange.End = t
		}
	}

	return timeRange, nil
}
