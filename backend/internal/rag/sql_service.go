package rag

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	"github.com/lbpay/supercore/backend/internal/services"
)

// RAGSQLService orquestra o RAG SQL Layer
type RAGSQLService struct {
	queryBuilder    *SQLQueryBuilder
	entityExtractor *EntityExtractor
	llmService      *services.LLMService
	db              *sql.DB
}

// NewRAGSQLService cria um novo RAG SQL Service
func NewRAGSQLService(db *sql.DB, llm *services.LLMService) *RAGSQLService {
	return &RAGSQLService{
		queryBuilder:    NewSQLQueryBuilder(db),
		entityExtractor: NewEntityExtractor(llm, db),
		llmService:      llm,
		db:              db,
	}
}

// Answer responde uma pergunta usando SQL Layer
func (s *RAGSQLService) Answer(ctx context.Context, question string) (string, error) {
	// 1. Extrai entidades
	queryCtx, err := s.entityExtractor.Extract(ctx, question)
	if err != nil {
		return "", fmt.Errorf("failed to extract entities: %w", err)
	}

	// 2. Busca object definition para contexto adicional
	var objDef *ObjectDefinitionContext
	if queryCtx.ObjectDefID.String() != "00000000-0000-0000-0000-000000000000" {
		objDef, err = s.getObjectDefinition(ctx, queryCtx.ObjectDefID)
		if err != nil {
			// Não é crítico, continua sem o contexto
			objDef = nil
		}
	}

	// 3. Executa query
	result, err := s.queryBuilder.Execute(ctx, *queryCtx)
	if err != nil {
		return "", fmt.Errorf("failed to execute query: %w", err)
	}

	// 4. Formata contexto para LLM
	contextPrompt := s.buildContextPrompt(question, queryCtx, result, objDef)

	// 5. Gera resposta em linguagem natural
	answer, err := s.llmService.Generate(ctx, contextPrompt, 0.3)
	if err != nil {
		return "", fmt.Errorf("failed to generate answer: %w", err)
	}

	return answer, nil
}

// ObjectDefinitionContext contém contexto de um object_definition
type ObjectDefinitionContext struct {
	Name        string
	DisplayName string
	Description string
	Schema      map[string]interface{}
}

// getObjectDefinition busca contexto de um object_definition
func (s *RAGSQLService) getObjectDefinition(ctx context.Context, id interface{}) (*ObjectDefinitionContext, error) {
	query := `
		SELECT name, display_name, description, schema
		FROM object_definitions
		WHERE id = $1
	`

	var objDef ObjectDefinitionContext
	var schemaJSON []byte

	err := s.db.QueryRowContext(ctx, query, id).Scan(
		&objDef.Name,
		&objDef.DisplayName,
		&objDef.Description,
		&schemaJSON,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch object definition: %w", err)
	}

	// Parse schema JSON
	if err := json.Unmarshal(schemaJSON, &objDef.Schema); err != nil {
		return nil, fmt.Errorf("failed to parse schema JSON: %w", err)
	}

	return &objDef, nil
}

// buildContextPrompt monta prompt com contexto completo
func (s *RAGSQLService) buildContextPrompt(
	question string,
	queryCtx *QueryContext,
	result *QueryResult,
	objDef *ObjectDefinitionContext,
) string {
	// Formata filtros
	filtersJSON, _ := json.MarshalIndent(queryCtx.Filters, "", "  ")

	// Contexto do objeto
	objectContext := ""
	if objDef != nil {
		objectContext = fmt.Sprintf(`
DEFINIÇÃO DO OBJETO:
- Nome: %s
- Display Name: %s
- Descrição: %s
`, objDef.Name, objDef.DisplayName, objDef.Description)
	}

	// Formata resultados
	resultContext := s.formatResult(result)

	prompt := fmt.Sprintf(`Você é um assistente especializado em Core Banking.

PERGUNTA DO USUÁRIO:
%s

CONTEXTO EXTRAÍDO:
- Tipo de objeto: %s
- Estado: %s
- Filtros: %s
- Agregação: %s
%s
DADOS ENCONTRADOS:
%s

INSTRUÇÕES:
- Use os dados acima para responder com precisão
- Cite números quando disponíveis
- Se não houver dados suficientes, seja honesto
- Explique de forma clara, sem jargões técnicos
- Use português brasileiro
- Seja conciso mas informativo

RESPOSTA:`,
		question,
		queryCtx.ObjectType,
		queryCtx.State,
		string(filtersJSON),
		queryCtx.Aggregation,
		objectContext,
		resultContext,
	)

	return prompt
}

// formatResult formata o resultado para o prompt
func (s *RAGSQLService) formatResult(result *QueryResult) string {
	// Agregações
	if len(result.Summary) > 0 {
		summaryJSON, _ := json.MarshalIndent(result.Summary, "", "  ")
		return fmt.Sprintf("Resultado da agregação:\n%s", string(summaryJSON))
	}

	// Sem resultados
	if len(result.Rows) == 0 {
		return "Nenhum resultado encontrado."
	}

	// Resultados tabulares
	// Limita a 10 registros para não estourar o contexto do LLM
	displayRows := result.Rows
	if len(displayRows) > 10 {
		displayRows = displayRows[:10]
	}

	rowsJSON, _ := json.MarshalIndent(displayRows, "", "  ")

	resultText := fmt.Sprintf("Total de registros: %d\n", result.Count)
	if len(result.Rows) > 10 {
		resultText += fmt.Sprintf("Mostrando os primeiros 10 registros:\n%s\n\n(... e mais %d registros não exibidos)",
			string(rowsJSON),
			result.Count-10,
		)
	} else {
		resultText += fmt.Sprintf("Registros encontrados:\n%s", string(rowsJSON))
	}

	return resultText
}

// GetQueryContext expõe o método Extract do entityExtractor (útil para testes)
func (s *RAGSQLService) GetQueryContext(ctx context.Context, question string) (*QueryContext, error) {
	return s.entityExtractor.Extract(ctx, question)
}
