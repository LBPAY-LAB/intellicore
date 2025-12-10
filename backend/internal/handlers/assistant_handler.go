package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/services/nlassistant"
)

// AssistantHandler handles Natural Language Assistant API endpoints
type AssistantHandler struct {
	assistantService *nlassistant.Service
}

// NewAssistantHandler creates a new assistant handler
func NewAssistantHandler(assistantService *nlassistant.Service) *AssistantHandler {
	return &AssistantHandler{
		assistantService: assistantService,
	}
}

// StartConversation initiates a new conversation session
// POST /api/assistant/conversations
func (h *AssistantHandler) StartConversation(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	// For now, use a placeholder
	userID := c.GetString("user_id")
	if userID == "" {
		userID = "system" // Default for development
	}

	response, err := h.assistantService.StartConversation(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to start conversation",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// SendMessage processes a user's message/answer
// POST /api/assistant/conversations/:id/messages
func (h *AssistantHandler) SendMessage(c *gin.Context) {
	// Parse conversation ID
	conversationID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid conversation ID",
		})
		return
	}

	// Parse request body
	var req nlassistant.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate message is not empty
	if req.Message == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "message cannot be empty",
		})
		return
	}

	// Process message
	response, err := h.assistantService.ProcessMessage(c.Request.Context(), conversationID, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to process message",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, response)
}

// GetConversation retrieves a conversation by ID
// GET /api/assistant/conversations/:id
func (h *AssistantHandler) GetConversation(c *gin.Context) {
	// Parse conversation ID
	conversationID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid conversation ID",
		})
		return
	}

	// Get conversation
	conversation, err := h.assistantService.GetConversation(c.Request.Context(), conversationID)
	if err != nil {
		if err.Error() == "conversation not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "conversation not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to get conversation",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, conversation)
}

// ConfirmCreation confirms the conversation and creates the object definition
// POST /api/assistant/conversations/:id/confirm
func (h *AssistantHandler) ConfirmCreation(c *gin.Context) {
	// Parse conversation ID
	conversationID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid conversation ID",
		})
		return
	}

	// Confirm and create object definition
	objectDefinitionID, err := h.assistantService.ConfirmCreation(c.Request.Context(), conversationID)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "conversation not yet completed" {
			statusCode = http.StatusBadRequest
		}

		c.JSON(statusCode, gin.H{
			"error": "failed to confirm creation",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"object_definition_id": objectDefinitionID,
		"message": "Object Definition criada com sucesso!",
		"next_steps": "Você pode agora criar instâncias deste objeto através da UI ou API",
	})
}

// GetConversationFlow returns the conversation flow structure
// GET /api/assistant/flow
func (h *AssistantHandler) GetConversationFlow(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"total_steps": len(nlassistant.ConversationFlow),
		"steps": nlassistant.ConversationFlow,
	})
}
