package nlassistant

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/services/llm"
)

// Service handles Natural Language Assistant operations
type Service struct {
	db         *sql.DB
	llmClient  llm.Client
	oracleCtx  string
}

// NewService creates a new assistant service
func NewService(db *sql.DB, llmClient llm.Client, oracleContext string) *Service {
	return &Service{
		db:        db,
		llmClient: llmClient,
		oracleCtx: oracleContext,
	}
}

// StartConversation initiates a new conversation session
func (s *Service) StartConversation(ctx context.Context, createdBy string) (*ConversationResponse, error) {
	conversationID := uuid.New()

	// Insert new conversation
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO conversations (id, current_step, total_steps, answers, completed, created_by)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, conversationID, 1, len(ConversationFlow), "{}", false, createdBy)

	if err != nil {
		return nil, fmt.Errorf("failed to create conversation: %w", err)
	}

	return &ConversationResponse{
		ConversationID: conversationID,
		CurrentStep:    1,
		NextStep:       &ConversationFlow[0],
		Completed:      false,
		Message:        "Olá! Vou te ajudar a criar um novo objeto. Vamos começar!",
	}, nil
}

// ProcessMessage processes a user's answer and advances the conversation
func (s *Service) ProcessMessage(ctx context.Context, conversationID uuid.UUID, message string) (*ConversationResponse, error) {
	// 1. Load conversation
	conv, err := s.loadConversation(ctx, conversationID)
	if err != nil {
		return nil, fmt.Errorf("failed to load conversation: %w", err)
	}

	if conv.Completed {
		return nil, fmt.Errorf("conversation already completed")
	}

	// 2. Save answer for current step
	stepKey := fmt.Sprintf("step_%d", conv.CurrentStep)
	conv.Answers[stepKey] = message

	// 3. Advance to next step
	conv.CurrentStep++
	conv.UpdatedAt = time.Now()

	// 4. Check if this is the preview step (step 7)
	var preview *ObjectDefinitionPreview
	if conv.CurrentStep == 7 {
		// Generate preview using LLM
		preview, err = s.generatePreview(ctx, conv.Answers)
		if err != nil {
			return nil, fmt.Errorf("failed to generate preview: %w", err)
		}
		conv.PreviewSchema = preview
	}

	// 5. Check if conversation is complete
	if conv.CurrentStep > len(ConversationFlow) {
		conv.Completed = true
	}

	// 6. Update conversation in database
	answersJSON, _ := json.Marshal(conv.Answers)
	previewJSON, _ := json.Marshal(conv.PreviewSchema)

	_, err = s.db.ExecContext(ctx, `
		UPDATE conversations
		SET current_step = $1,
		    answers = $2,
		    preview_schema = $3,
		    completed = $4,
		    updated_at = $5
		WHERE id = $6
	`, conv.CurrentStep, answersJSON, previewJSON, conv.Completed, conv.UpdatedAt, conversationID)

	if err != nil {
		return nil, fmt.Errorf("failed to update conversation: %w", err)
	}

	// 7. Prepare response
	response := &ConversationResponse{
		ConversationID: conversationID,
		CurrentStep:    conv.CurrentStep,
		Preview:        preview,
		Completed:      conv.Completed,
	}

	if !conv.Completed && conv.CurrentStep <= len(ConversationFlow) {
		response.NextStep = &ConversationFlow[conv.CurrentStep-1]
		response.Message = "Obrigado! Próxima pergunta:"
	} else if conv.Completed {
		response.Message = "Conversa concluída! Use o endpoint /confirm para criar o objeto."
	}

	return response, nil
}

// ConfirmCreation creates the actual object_definition from the conversation
func (s *Service) ConfirmCreation(ctx context.Context, conversationID uuid.UUID) (uuid.UUID, error) {
	// 1. Load conversation
	conv, err := s.loadConversation(ctx, conversationID)
	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to load conversation: %w", err)
	}

	if !conv.Completed {
		return uuid.Nil, fmt.Errorf("conversation not yet completed")
	}

	if conv.Confirmed {
		return *conv.CreatedObjectDefinitionID, nil // Already confirmed
	}

	// 2. Get preview (should be cached)
	preview := conv.PreviewSchema
	if preview == nil {
		// Regenerate if somehow missing
		preview, err = s.generatePreview(ctx, conv.Answers)
		if err != nil {
			return uuid.Nil, fmt.Errorf("failed to generate preview: %w", err)
		}
	}

	// 3. Create object_definition
	objDefID := uuid.New()
	_, err = s.db.ExecContext(ctx, `
		INSERT INTO object_definitions (
			id, name, display_name, description, category,
			schema, states, rules, ui_hints, relationships,
			created_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, objDefID,
		preview.Name,
		preview.DisplayName,
		preview.Description,
		preview.Category,
		preview.Schema,
		preview.States,
		preview.Rules,
		preview.UIHints,
		preview.Relationships,
		conv.CreatedBy,
	)

	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to create object_definition: %w", err)
	}

	// 4. Mark conversation as confirmed
	_, err = s.db.ExecContext(ctx, `
		UPDATE conversations
		SET confirmed = true,
		    created_object_definition_id = $1,
		    updated_at = $2
		WHERE id = $3
	`, objDefID, time.Now(), conversationID)

	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to confirm conversation: %w", err)
	}

	return objDefID, nil
}

// GetConversation retrieves a conversation by ID
func (s *Service) GetConversation(ctx context.Context, conversationID uuid.UUID) (*Conversation, error) {
	return s.loadConversation(ctx, conversationID)
}

// loadConversation loads a conversation from the database
func (s *Service) loadConversation(ctx context.Context, conversationID uuid.UUID) (*Conversation, error) {
	var conv Conversation
	var answersJSON string
	var previewJSON sql.NullString
	var createdObjDefID sql.NullString

	err := s.db.QueryRowContext(ctx, `
		SELECT id, current_step, total_steps, answers, preview_schema,
		       completed, confirmed, created_object_definition_id,
		       created_at, updated_at, created_by
		FROM conversations
		WHERE id = $1
	`, conversationID).Scan(
		&conv.ID,
		&conv.CurrentStep,
		&conv.TotalSteps,
		&answersJSON,
		&previewJSON,
		&conv.Completed,
		&conv.Confirmed,
		&createdObjDefID,
		&conv.CreatedAt,
		&conv.UpdatedAt,
		&conv.CreatedBy,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("conversation not found")
	}
	if err != nil {
		return nil, fmt.Errorf("database error: %w", err)
	}

	// Parse answers
	if err := json.Unmarshal([]byte(answersJSON), &conv.Answers); err != nil {
		return nil, fmt.Errorf("failed to parse answers: %w", err)
	}

	// Parse preview if exists
	if previewJSON.Valid && previewJSON.String != "" {
		var preview ObjectDefinitionPreview
		if err := json.Unmarshal([]byte(previewJSON.String), &preview); err != nil {
			return nil, fmt.Errorf("failed to parse preview: %w", err)
		}
		conv.PreviewSchema = &preview
	}

	// Parse created object definition ID if exists
	if createdObjDefID.Valid && createdObjDefID.String != "" {
		id, err := uuid.Parse(createdObjDefID.String)
		if err == nil {
			conv.CreatedObjectDefinitionID = &id
		}
	}

	return &conv, nil
}

// generatePreview uses LLM to generate an object definition preview
func (s *Service) generatePreview(ctx context.Context, answers map[string]string) (*ObjectDefinitionPreview, error) {
	// Build the prompt with all answers
	userDescription := s.buildUserDescription(answers)

	// Create schema generation request
	req := llm.SchemaGenerationRequest{
		UserDescription: userDescription,
		RAGContext:      s.oracleCtx,
		Category:        "BUSINESS_ENTITY", // Default category
	}

	// Call LLM to generate schema
	generation, err := s.llmClient.GenerateObjectDefinition(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("LLM generation failed: %w", err)
	}

	// Convert to preview format
	preview := &ObjectDefinitionPreview{
		Name:          generation.Name,
		DisplayName:   generation.DisplayName,
		Description:   generation.Description,
		Category:      generation.Category,
		Schema:        generation.Schema,
		States:        generation.States,
		Rules:         generation.Rules,
		UIHints:       generation.UIHints,
		Relationships: generation.Relationships,
		Confidence:    generation.Confidence,
		Explanation:   generation.Explanation,
	}

	// Calculate metadata for UI
	preview.FieldCount = s.countSchemaFields(generation.Schema)
	preview.StateCount = s.countStates(generation.States)

	return preview, nil
}

// buildUserDescription builds a comprehensive description from conversation answers
func (s *Service) buildUserDescription(answers map[string]string) string {
	var parts []string

	parts = append(parts, fmt.Sprintf("Nome do Objeto: %s", answers["step_1"]))
	parts = append(parts, fmt.Sprintf("Descrição: %s", answers["step_2"]))
	parts = append(parts, fmt.Sprintf("Campos necessários: %s", answers["step_3"]))
	parts = append(parts, fmt.Sprintf("Validações especiais: %s", answers["step_4"]))
	parts = append(parts, fmt.Sprintf("Estados do ciclo de vida: %s", answers["step_5"]))
	parts = append(parts, fmt.Sprintf("Relacionamentos: %s", answers["step_6"]))

	return strings.Join(parts, "\n")
}

// countSchemaFields counts the number of properties in a JSON schema
func (s *Service) countSchemaFields(schemaJSON json.RawMessage) int {
	var schema map[string]interface{}
	if err := json.Unmarshal(schemaJSON, &schema); err != nil {
		return 0
	}

	if props, ok := schema["properties"].(map[string]interface{}); ok {
		return len(props)
	}

	return 0
}

// countStates counts the number of states in the FSM
func (s *Service) countStates(statesJSON json.RawMessage) int {
	var states map[string]interface{}
	if err := json.Unmarshal(statesJSON, &states); err != nil {
		return 0
	}

	if stateList, ok := states["states"].([]interface{}); ok {
		return len(stateList)
	}

	return 0
}
