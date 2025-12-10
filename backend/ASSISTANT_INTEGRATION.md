# Natural Language Assistant Integration Guide

## Overview

This guide explains how to integrate the Natural Language Assistant (conversational object creation) into the SuperCore API.

## Architecture

The assistant uses a **structured conversation flow** with 7 steps to guide users through creating object definitions using natural language.

### Components

1. **Database**: `conversations` table (migration `006_create_conversations.sql`)
2. **Service**: `internal/services/nlassistant/service.go` - Core business logic
3. **Handler**: `internal/handlers/assistant_handler.go` - API endpoints
4. **Types**: `internal/services/nlassistant/types.go` - Data models
5. **LLM Integration**: Uses existing `internal/services/llm` package

## Integration Steps

### 1. Run Database Migration

```bash
# Apply the migration
psql $DATABASE_URL -f database/migrations/006_create_conversations.sql
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# LLM Provider (openai or claude)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Optional: Use Claude instead
# LLM_PROVIDER=claude
# CLAUDE_API_KEY=sk-ant-...
# CLAUDE_MODEL=claude-3-5-sonnet-20241022

# LLM Features
LLM_ENABLE_CACHE=true
LLM_ENABLE_METRICS=true
LLM_RATE_LIMIT_RPS=5

# Oracle Context (used in prompts)
ORACLE_IDENTITY=LBPAY - Instituição de Pagamento licenciada pelo BACEN
```

### 3. Update main.go

Add the assistant routes to your main.go:

```go
package main

import (
	// ... existing imports
	"github.com/lbpay/supercore/internal/config"
	"github.com/lbpay/supercore/internal/services/llm"
	"github.com/lbpay/supercore/internal/services/nlassistant"
)

func main() {
	// ... existing setup code ...

	// Initialize LLM Client
	llmConfig := config.GetLLMConfig()
	llmClient, err := llm.NewClient(llmConfig)
	if err != nil {
		log.Fatalf("Failed to initialize LLM client: %v", err)
	}
	defer llmClient.Close()

	// Initialize Assistant Service
	assistantService := nlassistant.NewService(
		db.StdDB,
		llmClient,
		llmConfig.OracleIdentity,
	)

	// ... inside API v1 routes group ...

	// Conversational Assistant routes
	assistantHandler := handlers.NewAssistantHandler(assistantService)
	v1.POST("/assistant/conversations", assistantHandler.StartConversation)
	v1.POST("/assistant/conversations/:id/messages", assistantHandler.SendMessage)
	v1.GET("/assistant/conversations/:id", assistantHandler.GetConversation)
	v1.POST("/assistant/conversations/:id/confirm", assistantHandler.ConfirmCreation)
	v1.GET("/assistant/flow", assistantHandler.GetConversationFlow)

	// ... rest of the code ...
}
```

## API Endpoints

### 1. Start Conversation

**POST** `/api/v1/assistant/conversations`

Initiates a new conversation session.

**Response:**
```json
{
  "conversation_id": "uuid",
  "current_step": 1,
  "next_step": {
    "step_number": 1,
    "question": "Qual o nome do objeto que você quer criar?",
    "type": "text",
    "hint": "Use um nome descritivo..."
  },
  "completed": false,
  "message": "Olá! Vou te ajudar a criar um novo objeto."
}
```

### 2. Send Message

**POST** `/api/v1/assistant/conversations/:id/messages`

Processes a user's answer and advances the conversation.

**Request:**
```json
{
  "message": "Cliente Pessoa Física"
}
```

**Response:**
```json
{
  "conversation_id": "uuid",
  "current_step": 2,
  "next_step": {
    "step_number": 2,
    "question": "Descreva em suas palavras...",
    "type": "text"
  },
  "completed": false,
  "message": "Obrigado! Próxima pergunta:"
}
```

### 3. Get Preview (Step 7)

When you reach step 7, the response includes a `preview`:

**Response:**
```json
{
  "conversation_id": "uuid",
  "current_step": 7,
  "preview": {
    "name": "cliente_pf",
    "display_name": "Cliente Pessoa Física",
    "description": "...",
    "schema": {...},
    "states": {...},
    "field_count": 9,
    "state_count": 5,
    "confidence": 0.95,
    "explanation": "Generated based on..."
  },
  "completed": true
}
```

### 4. Confirm Creation

**POST** `/api/v1/assistant/conversations/:id/confirm`

Creates the actual object_definition from the conversation.

**Response:**
```json
{
  "object_definition_id": "uuid",
  "message": "Object Definition criada com sucesso!",
  "next_steps": "Você pode agora criar instâncias..."
}
```

### 5. Get Conversation

**GET** `/api/v1/assistant/conversations/:id`

Retrieves a conversation's state.

### 6. Get Flow Structure

**GET** `/api/v1/assistant/flow`

Returns the conversation flow metadata.

## Conversation Flow

The assistant follows a 7-step structured flow:

1. **Name**: "Qual o nome do objeto?" (text)
2. **Description**: "Descreva o que é esse objeto" (text)
3. **Fields**: "Quais informações precisam ser coletadas?" (text)
4. **Validations**: "Validações especiais BACEN?" (multiselect)
5. **States**: "Estados do ciclo de vida?" (text)
6. **Relationships**: "Relacionamentos com outros objetos?" (text)
7. **Preview**: "Confirma a criação?" (confirm)

## LLM Integration

The assistant uses the existing LLM service to:

1. **Generate Schema**: Convert natural language to JSON Schema Draft 7
2. **Generate FSM**: Create finite state machine from lifecycle description
3. **Map Validations**: Connect BACEN validations to validation_rules
4. **Generate UI Hints**: Create widget mappings for form rendering

## Example Usage

### Full Conversation Flow

```bash
# 1. Start conversation
curl -X POST http://localhost:8080/api/v1/assistant/conversations

# 2. Answer step 1
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Cliente Pessoa Física"}'

# 3. Answer step 2
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/messages \
  -d '{"message": "Uma pessoa que abre conta no banco"}'

# 4. Answer step 3
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/messages \
  -d '{"message": "CPF, Nome, Email, Telefone, Endereço"}'

# 5. Answer step 4
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/messages \
  -d '{"message": "CPF (validação completa), Email, Telefone BR"}'

# 6. Answer step 5
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/messages \
  -d '{"message": "Pendente, Ativo, Bloqueado, Inativo"}'

# 7. Answer step 6
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/messages \
  -d '{"message": "Cliente pode ser TITULAR de Conta"}'

# 8. Answer step 7 (will generate preview)
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/messages \
  -d '{"message": "sim"}'

# 9. Confirm creation
curl -X POST http://localhost:8080/api/v1/assistant/conversations/{id}/confirm
```

## Testing

### Unit Tests

```bash
cd backend
go test ./internal/services/nlassistant/...
go test ./internal/handlers/...
```

### Integration Tests

```bash
# Run full integration test
go test -tags=integration ./tests/assistant_test.go
```

## Troubleshooting

### LLM API Errors

If you see "LLM generation failed":
- Check API key is valid
- Verify internet connectivity
- Check rate limits (adjust `LLM_RATE_LIMIT_RPS`)

### Database Errors

If you see "conversation not found":
- Ensure migration was applied
- Check database connectivity
- Verify conversation ID is valid

### Schema Validation Errors

If generated schema fails validation:
- Check LLM model configuration
- Review Oracle identity context
- Manually inspect `preview_schema` in database

## Production Considerations

### Cost Management

- Enable caching: `LLM_ENABLE_CACHE=true`
- Use cheaper models for development: `gpt-4o-mini`
- Monitor metrics: `LLM_ENABLE_METRICS=true`

### Rate Limiting

- Adjust based on your API tier
- Default: 5 requests/second
- Override: `LLM_RATE_LIMIT_RPS=10`

### Prompt Engineering

The prompts are in `internal/services/llm/prompts.go`:
- `SchemaGenerationPrompt`: Generates object definitions
- Oracle context enhances domain understanding

## Future Enhancements

1. **Multi-language support**: Portuguese + English
2. **Schema refinement**: Iterative improvement
3. **Validation preview**: Test schema before creation
4. **Undo/redo**: Navigate conversation steps
5. **Templates**: Pre-built object templates

## Support

For issues or questions:
- Check logs: `docker-compose logs backend`
- Review metrics: GET `/api/v1/metrics`
- Database state: Query `conversations` table
