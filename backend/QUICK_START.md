# Natural Language Assistant - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Apply Migration
```bash
psql $DATABASE_URL -f database/migrations/006_create_conversations.sql
```

### 2. Set Environment Variables
```bash
# Add to .env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-key-here
OPENAI_MODEL=gpt-4o-mini
ORACLE_IDENTITY=LBPAY - Instituição de Pagamento licenciada pelo BACEN
```

### 3. Update main.go

**Add imports:**
```go
import (
    "github.com/lbpay/supercore/internal/config"
    "github.com/lbpay/supercore/internal/services/llm"
    "github.com/lbpay/supercore/internal/services/nlassistant"
)
```

**Initialize services (after db setup):**
```go
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
```

**Register routes (inside v1 group):**
```go
// Conversational Assistant routes
assistantHandler := handlers.NewAssistantHandler(assistantService)
assistant := v1.Group("/assistant")
{
    assistant.POST("/conversations", assistantHandler.StartConversation)
    assistant.POST("/conversations/:id/messages", assistantHandler.SendMessage)
    assistant.GET("/conversations/:id", assistantHandler.GetConversation)
    assistant.POST("/conversations/:id/confirm", assistantHandler.ConfirmCreation)
    assistant.GET("/flow", assistantHandler.GetConversationFlow)
}
```

### 4. Test
```bash
# Start the server
go run cmd/api/main.go

# Run test script
./test_assistant.sh
```

## 📋 Quick Test (Manual)

```bash
# 1. Start conversation
CONV=$(curl -s -X POST http://localhost:8080/api/v1/assistant/conversations | jq -r '.conversation_id')

# 2. Answer questions
curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/messages \
  -H "Content-Type: application/json" \
  -d '{"message": "Cliente Pessoa Física"}'

curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/messages \
  -d '{"message": "Uma pessoa que abre conta no banco"}'

curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/messages \
  -d '{"message": "CPF, Nome, Email, Telefone"}'

curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/messages \
  -d '{"message": "CPF (validação completa), Email"}'

curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/messages \
  -d '{"message": "Pendente, Ativo, Bloqueado"}'

curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/messages \
  -d '{"message": "Cliente pode ser TITULAR de Conta"}'

# 3. Get preview (step 7)
curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/messages \
  -d '{"message": "sim"}' | jq '.preview'

# 4. Confirm
curl -X POST http://localhost:8080/api/v1/assistant/conversations/$CONV/confirm | jq
```

## 🎯 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/assistant/conversations` | POST | Start conversation |
| `/api/v1/assistant/conversations/:id/messages` | POST | Send answer |
| `/api/v1/assistant/conversations/:id` | GET | Get state |
| `/api/v1/assistant/conversations/:id/confirm` | POST | Create object |
| `/api/v1/assistant/flow` | GET | Get flow info |

## 🔍 Troubleshooting

### "Failed to initialize LLM client"
- Check API key is valid
- Verify provider name (openai or claude)
- Test connectivity: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

### "Conversation not found"
- Ensure migration was applied
- Check conversation ID is valid UUID
- Verify database connection

### "LLM generation failed"
- Check rate limits
- Verify API quota
- Review LLM_RATE_LIMIT_RPS setting

## 📚 Full Documentation

- **Integration Guide**: `ASSISTANT_INTEGRATION.md`
- **Complete README**: `SPRINT_5_ASSISTANT_README.md`
- **Implementation Details**: `IMPLEMENTATION_COMPLETE.md`

## ✅ Checklist

- [ ] Migration applied
- [ ] Environment variables set
- [ ] main.go updated (imports, init, routes)
- [ ] Server starts without errors
- [ ] Test script runs successfully
- [ ] Object definitions created via conversation

---

**Time to complete**: 5-10 minutes
**Difficulty**: ⭐⭐☆☆☆ (Easy)
**Status**: Ready for production
