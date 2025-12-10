package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/lbpay/supercore/internal/database"
)

type NLAssistantHandler struct {
	db *database.DB
}

func NewNLAssistantHandler(db *database.DB) *NLAssistantHandler {
	return &NLAssistantHandler{db: db}
}

type ChatRequest struct {
	Message string `json:"message" binding:"required"`
}

type ChatResponse struct {
	Reply string `json:"reply"`
}

// Chat godoc
// @Summary Chat with natural language assistant
// @Description Send a message to the NL assistant
// @Tags assistant
// @Accept json
// @Produce json
// @Param body body ChatRequest true "Chat Message"
// @Success 200 {object} ChatResponse
// @Router /api/v1/assistant/chat [post]
func (h *NLAssistantHandler) Chat(c *gin.Context) {
	var req ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement actual LLM integration (Claude/GPT)
	// For now, return a placeholder response
	c.JSON(http.StatusOK, ChatResponse{
		Reply: "Natural Language Assistant is under development. You said: " + req.Message,
	})
}

type GenerateObjectDefinitionRequest struct {
	Description string `json:"description" binding:"required"`
}

// GenerateObjectDefinition godoc
// @Summary Generate object definition from description
// @Description Use AI to generate a complete object definition from natural language description
// @Tags assistant
// @Accept json
// @Produce json
// @Param body body GenerateObjectDefinitionRequest true "Description"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/assistant/generate-object-definition [post]
func (h *NLAssistantHandler) GenerateObjectDefinition(c *gin.Context) {
	var req GenerateObjectDefinitionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement actual AI generation logic
	// This would use Claude/GPT to:
	// 1. Understand the description
	// 2. Generate appropriate JSON Schema
	// 3. Define FSM states and transitions
	// 4. Create UI hints
	// 5. Return a complete object_definition

	c.JSON(http.StatusOK, gin.H{
		"message": "AI generation under development",
		"description": req.Description,
	})
}

type RefineSchemaRequest struct {
	CurrentSchema map[string]interface{} `json:"current_schema" binding:"required"`
	Feedback      string                 `json:"feedback" binding:"required"`
}

// RefineSchema godoc
// @Summary Refine an existing schema based on feedback
// @Description Use AI to refine a schema based on user feedback
// @Tags assistant
// @Accept json
// @Produce json
// @Param body body RefineSchemaRequest true "Refinement Request"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/assistant/refine-schema [post]
func (h *NLAssistantHandler) RefineSchema(c *gin.Context) {
	var req RefineSchemaRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// TODO: Implement schema refinement logic
	c.JSON(http.StatusOK, gin.H{
		"message": "Schema refinement under development",
		"feedback": req.Feedback,
	})
}
