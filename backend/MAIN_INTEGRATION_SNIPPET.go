// ============================================================================
// ADD THIS TO main.go TO INTEGRATE THE NATURAL LANGUAGE ASSISTANT
// ============================================================================

// 1. Add imports at the top of main.go:
import (
	// ... existing imports ...
	"github.com/lbpay/supercore/internal/config"
	"github.com/lbpay/supercore/internal/services/llm"
	"github.com/lbpay/supercore/internal/services/nlassistant"
)

// 2. After database initialization, add LLM client initialization:
func main() {
	// ... existing database setup code ...

	// Initialize LLM Client
	llmConfig := config.GetLLMConfig()
	llmClient, err := llm.NewClient(llmConfig)
	if err != nil {
		log.Printf("Warning: Failed to initialize LLM client: %v", err)
		log.Println("Natural Language Assistant features will be disabled")
		// Don't fail - continue without LLM features
	} else {
		defer llmClient.Close()
		log.Println("LLM Client initialized successfully")
	}

	// Initialize Assistant Service (if LLM client is available)
	var assistantService *nlassistant.Service
	if llmClient != nil {
		assistantService = nlassistant.NewService(
			db.StdDB,
			llmClient,
			llmConfig.OracleIdentity,
		)
		log.Println("Natural Language Assistant Service initialized")
	}

	// ... existing router setup ...

	// 3. Inside the API v1 routes group, add:
	v1 := router.Group("/api/v1")
	{
		// ... existing routes ...

		// Natural Language Assistant routes (conversational object creation)
		if assistantService != nil {
			assistantHandler := handlers.NewAssistantHandler(assistantService)
			assistant := v1.Group("/assistant")
			{
				assistant.POST("/conversations", assistantHandler.StartConversation)
				assistant.POST("/conversations/:id/messages", assistantHandler.SendMessage)
				assistant.GET("/conversations/:id", assistantHandler.GetConversation)
				assistant.POST("/conversations/:id/confirm", assistantHandler.ConfirmCreation)
				assistant.GET("/flow", assistantHandler.GetConversationFlow)
			}
			log.Println("Assistant routes registered")
		} else {
			log.Println("Assistant routes skipped (LLM client not available)")
		}

		// ... rest of your routes ...
	}

	// ... rest of main.go ...
}

// ============================================================================
// COMPLETE EXAMPLE WITH FULL CONTEXT
// ============================================================================

package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/lbpay/supercore/internal/config"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/handlers"
	"github.com/lbpay/supercore/internal/middleware"
	"github.com/lbpay/supercore/internal/services/llm"
	"github.com/lbpay/supercore/internal/services/nlassistant"
	"github.com/rs/cors"
)

func mainExample() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize database connection
	db, err := database.NewDB(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Initialize LLM Client
	llmConfig := config.GetLLMConfig()
	llmClient, err := llm.NewClient(llmConfig)
	if err != nil {
		log.Printf("Warning: Failed to initialize LLM client: %v", err)
		log.Println("Natural Language Assistant features will be disabled")
	} else {
		defer llmClient.Close()
		log.Printf("LLM Client initialized: Provider=%s, Model=%s", llmConfig.Provider, llmConfig.Model)
	}

	// Initialize Assistant Service
	var assistantService *nlassistant.Service
	if llmClient != nil {
		assistantService = nlassistant.NewService(
			db.StdDB,
			llmClient,
			llmConfig.OracleIdentity,
		)
		log.Println("Natural Language Assistant Service initialized")
	}

	// Initialize Gin router
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = gin.DebugMode
	}
	gin.SetMode(ginMode)

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS middleware
	corsConfig := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposedHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           int(12 * time.Hour / time.Second),
	})
	router.Use(func(c *gin.Context) {
		corsConfig.HandlerFunc(c.Writer, c.Request)
		c.Next()
	})

	// Custom middleware
	router.Use(middleware.RequestID())
	router.Use(middleware.ErrorHandler())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"timestamp": time.Now().Unix(),
			"service":   "supercore-api",
			"features": gin.H{
				"llm_enabled":       llmClient != nil,
				"assistant_enabled": assistantService != nil,
			},
		})
	})

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Object Definitions routes
		objectDefHandler := handlers.NewObjectDefinitionHandler(db)
		v1.GET("/object-definitions", objectDefHandler.List)
		v1.GET("/object-definitions/:id", objectDefHandler.Get)
		v1.POST("/object-definitions", objectDefHandler.Create)
		v1.PUT("/object-definitions/:id", objectDefHandler.Update)
		v1.DELETE("/object-definitions/:id", objectDefHandler.Delete)
		v1.GET("/object-definitions/:id/schema", objectDefHandler.GetSchema)
		v1.GET("/object-definitions/:id/relationship-rules", objectDefHandler.GetRelationshipRules)

		// Instances routes
		instanceHandler := handlers.NewInstanceHandler(db)
		v1.GET("/instances", instanceHandler.List)
		v1.GET("/instances/:id", instanceHandler.Get)
		v1.POST("/instances", instanceHandler.Create)
		v1.PUT("/instances/:id", instanceHandler.Update)
		v1.DELETE("/instances/:id", instanceHandler.Delete)
		v1.POST("/instances/:id/transition", instanceHandler.TransitionState)
		v1.GET("/instances/:id/history", instanceHandler.GetHistory)

		// Relationships routes
		relationshipHandler := handlers.NewRelationshipHandler(db)
		v1.GET("/relationships", relationshipHandler.List)
		v1.GET("/relationships/:id", relationshipHandler.Get)
		v1.POST("/relationships", relationshipHandler.Create)
		v1.DELETE("/relationships/:id", relationshipHandler.Delete)
		v1.GET("/instances/:id/relationships", relationshipHandler.GetByInstance)

		// Validation Rules routes
		validationRuleHandler := handlers.NewValidationRuleHandler(db)
		v1.GET("/validation-rules", validationRuleHandler.List)
		v1.GET("/validation-rules/:id", validationRuleHandler.Get)
		v1.POST("/validation-rules", validationRuleHandler.Create)
		v1.PUT("/validation-rules/:id", validationRuleHandler.Update)
		v1.DELETE("/validation-rules/:id", validationRuleHandler.Delete)

		// Natural Language Assistant routes (OLD - can be deprecated)
		nlAssistantHandler := handlers.NewNLAssistantHandler(db)
		v1.POST("/assistant/chat", nlAssistantHandler.Chat)
		v1.POST("/assistant/generate-object-definition", nlAssistantHandler.GenerateObjectDefinition)
		v1.POST("/assistant/refine-schema", nlAssistantHandler.RefineSchema)

		// NEW: Conversational Assistant routes
		if assistantService != nil {
			assistantHandler := handlers.NewAssistantHandler(assistantService)
			assistant := v1.Group("/assistant")
			{
				assistant.POST("/conversations", assistantHandler.StartConversation)
				assistant.POST("/conversations/:id/messages", assistantHandler.SendMessage)
				assistant.GET("/conversations/:id", assistantHandler.GetConversation)
				assistant.POST("/conversations/:id/confirm", assistantHandler.ConfirmCreation)
				assistant.GET("/flow", assistantHandler.GetConversationFlow)
			}
		}

		// Oracle routes - Platform Consciousness
		oracleHandler := handlers.NewOracleHandler(db)
		v1.GET("/oracle/identity", oracleHandler.GetIdentity)
		v1.GET("/oracle/licenses", oracleHandler.GetLicenses)
		v1.GET("/oracle/status", oracleHandler.GetStatus)
		v1.GET("/oracle/whoami", oracleHandler.WhoAmI)
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:           ":" + port,
		Handler:        router,
		ReadTimeout:    15 * time.Second,
		WriteTimeout:   15 * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// Graceful shutdown
	go func() {
		log.Printf("Starting server on port %s...", port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
