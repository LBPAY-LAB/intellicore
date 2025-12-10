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
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/handlers"
	"github.com/lbpay/supercore/internal/logger"
	"github.com/lbpay/supercore/internal/metrics"
	"github.com/lbpay/supercore/internal/middleware"
	ragsql "github.com/lbpay/supercore/internal/rag"
	"github.com/lbpay/supercore/internal/services"
	"github.com/lbpay/supercore/internal/services/llm"
	raggraph "github.com/lbpay/supercore/internal/services/rag"
	"github.com/rs/cors"
	"go.uber.org/zap"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Initialize structured logger
	environment := os.Getenv("ENVIRONMENT")
	if environment == "" {
		environment = "development"
	}
	if err := logger.InitLogger(environment); err != nil {
		log.Fatalf("Failed to initialize logger: %v", err)
	}
	defer logger.Sync()

	logger.Info("Starting SuperCore API", zap.String("environment", environment))

	// Initialize database connection
	db, err := database.NewDB(os.Getenv("DATABASE_URL"))
	if err != nil {
		logger.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer db.Close()

	logger.Info("Database connection established")

	// Start business metrics collection
	metrics.UpdateBusinessMetrics(db.StdDB)
	logger.Info("Metrics collection started")

	// Initialize Embedding Service and Indexer
	embeddingProvider := os.Getenv("EMBEDDING_PROVIDER")
	if embeddingProvider == "" {
		embeddingProvider = "openai"
	}

	embeddingModel := os.Getenv("EMBEDDING_MODEL")
	if embeddingModel == "" {
		embeddingModel = "text-embedding-ada-002"
	}

	var embeddingAPIKey string
	if embeddingProvider == "openai" {
		embeddingAPIKey = os.Getenv("OPENAI_API_KEY")
	} else if embeddingProvider == "cohere" {
		embeddingAPIKey = os.Getenv("COHERE_API_KEY")
	}

	var embeddingService *services.EmbeddingService
	var embeddingIndexer *services.EmbeddingIndexer
	var searchHandler *handlers.SearchHandler
	var ragSQLService *ragsql.RAGSQLService
	var ragHandler *handlers.RAGHandler

	// Initialize LLM Client for RAG SQL Layer
	llmProvider := os.Getenv("LLM_PROVIDER")
	if llmProvider == "" {
		llmProvider = "openai"
	}

	llmAPIKey := os.Getenv("OPENAI_API_KEY")
	if llmProvider == "claude" {
		llmAPIKey = os.Getenv("ANTHROPIC_API_KEY")
	}

	llmModel := os.Getenv("LLM_MODEL")
	if llmModel == "" {
		if llmProvider == "claude" {
			llmModel = "claude-3-5-sonnet-20241022"
		} else {
			llmModel = "gpt-4o-mini"
		}
	}

	if embeddingAPIKey != "" {
		embeddingService = services.NewEmbeddingService(embeddingProvider, embeddingAPIKey, embeddingModel)
		embeddingIndexer = services.NewEmbeddingIndexer(db.StdDB, embeddingService, log.Default())
		searchHandler = handlers.NewSearchHandler(embeddingService, embeddingIndexer, db.StdDB, log.Default())
		logger.Info("Embedding service initialized",
			zap.String("provider", embeddingProvider),
			zap.String("model", embeddingModel))
	} else {
		logger.Warn("Embedding service not initialized - set OPENAI_API_KEY or COHERE_API_KEY to enable RAG features")
	}

	// Initialize RAG SQL Service
	if llmAPIKey != "" {
		llmConfig := llm.Config{
			Provider:       llm.Provider(llmProvider),
			APIKey:         llmAPIKey,
			Model:          llmModel,
			DefaultTemp:    0.3,
			DefaultMaxToks: 4096,
			EnableMetrics:  true,
			EnableCache:    true,
			RateLimitRPS:   10,
		}

		llmClient, err := llm.NewClient(llmConfig)
		if err != nil {
			logger.Warn("Failed to initialize LLM client", zap.Error(err))
		} else {
			llmService := services.NewLLMService(llmClient)
			ragSQLService = ragsql.NewRAGSQLService(db.StdDB, llmService)
			logger.Info("RAG SQL Service initialized",
				zap.String("provider", llmProvider),
				zap.String("model", llmModel))
		}
	}

	// Initialize RAG Handler (SQL Layer only for now)
	if ragSQLService != nil {
		ragHandler = handlers.NewRAGHandlerWithSQL(ragSQLService)
	}

	// Initialize Nebula Graph services
	var graphLayer *raggraph.GraphLayer
	var ragGraphService *services.RAGGraphService
	var nebulaSyncService *services.NebulaSyncService
	var ragGraphHandler *handlers.RAGGraphHandler

	nebulaAddress := os.Getenv("NEBULA_ADDRESS")
	if nebulaAddress == "" {
		nebulaAddress = "127.0.0.1:9669"
	}

	nebulaUser := os.Getenv("NEBULA_USER")
	if nebulaUser == "" {
		nebulaUser = "root"
	}

	nebulaPassword := os.Getenv("NEBULA_PASSWORD")
	if nebulaPassword == "" {
		nebulaPassword = "nebula"
	}

	nebulaSpace := os.Getenv("NEBULA_SPACE")
	if nebulaSpace == "" {
		nebulaSpace = "supercore_graph"
	}

	// Try to initialize Nebula Graph connection
	graphConfig := raggraph.GraphConfig{
		Address:  nebulaAddress,
		Username: nebulaUser,
		Password: nebulaPassword,
		Space:    nebulaSpace,
	}

	var initErr error
	graphLayer, initErr = raggraph.NewGraphLayer(graphConfig)
	if initErr != nil {
		logger.Warn("Failed to initialize Nebula Graph - Graph RAG features will be disabled",
			zap.Error(initErr),
			zap.String("address", nebulaAddress))
	} else {
		logger.Info("Nebula Graph connected",
			zap.String("address", nebulaAddress),
			zap.String("space", nebulaSpace))

		// Initialize sync service
		nebulaSyncService = services.NewNebulaSyncService(db.StdDB, graphLayer)

		// Initialize RAG Graph service if we have LLM client
		if llmAPIKey != "" {
			llmConfig := llm.Config{
				Provider:       llm.Provider(llmProvider),
				APIKey:         llmAPIKey,
				Model:          llmModel,
				DefaultTemp:    0.3,
				DefaultMaxToks: 4096,
				EnableMetrics:  true,
				EnableCache:    true,
				RateLimitRPS:   10,
			}

			llmClient, err := llm.NewClient(llmConfig)
			if err != nil {
				logger.Warn("Failed to initialize LLM client for Graph RAG", zap.Error(err))
			} else {
				ragGraphService = services.NewRAGGraphService(graphLayer, llmClient)
				ragGraphHandler = handlers.NewRAGGraphHandler(ragGraphService, nebulaSyncService)
				logger.Info("RAG Graph Service initialized successfully")
			}
		}

		// Ensure graph layer is closed on shutdown
		defer graphLayer.Close()
	}

	// Initialize Gin router
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = gin.DebugMode
	}
	gin.SetMode(ginMode)

	router := gin.New()

	// Add custom middleware
	router.Use(logger.GinMiddleware())
	router.Use(metrics.PrometheusMiddleware())
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
		})
	})

	// Metrics endpoint for Prometheus
	router.GET("/metrics", metrics.Handler())

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

		// Natural Language Assistant routes
		nlAssistantHandler := handlers.NewNLAssistantHandler(db)
		v1.POST("/assistant/chat", nlAssistantHandler.Chat)
		v1.POST("/assistant/generate-object-definition", nlAssistantHandler.GenerateObjectDefinition)
		v1.POST("/assistant/refine-schema", nlAssistantHandler.RefineSchema)

		// Oracle routes - Platform Consciousness
		oracleHandler := handlers.NewOracleHandler(db)
		v1.GET("/oracle/identity", oracleHandler.GetIdentity)
		v1.GET("/oracle/licenses", oracleHandler.GetLicenses)
		v1.GET("/oracle/status", oracleHandler.GetStatus)
		v1.GET("/oracle/whoami", oracleHandler.WhoAmI)

		// RAG / Semantic Search routes (only if embedding service is initialized)
		if searchHandler != nil {
			// Semantic search
			v1.POST("/search/semantic", searchHandler.SemanticSearch)
			v1.GET("/search/metadata", searchHandler.SearchByMetadata)

			// Embedding indexing
			v1.POST("/embeddings/index/object-definition/:id", searchHandler.IndexObjectDefinition)
			v1.POST("/embeddings/index/instance/:id", searchHandler.IndexInstance)
			v1.POST("/embeddings/index/object-definitions", searchHandler.IndexAllObjectDefinitions)
			v1.POST("/embeddings/index/instances", searchHandler.IndexAllInstances)
			v1.POST("/embeddings/reindex-all", searchHandler.ReindexAll)

			// Embedding management
			v1.GET("/embeddings/stats", searchHandler.GetEmbeddingStats)
			v1.DELETE("/embeddings/:id", searchHandler.DeleteEmbedding)
		}

		// RAG Graph routes (only if Nebula Graph is initialized)
		if ragGraphHandler != nil {
			rag := v1.Group("/rag")
			{
				// Graph-based question answering
				rag.POST("/query/graph", ragGraphHandler.QueryGraph)

				// Graph operations
				rag.GET("/graph/instances/:id/related", ragGraphHandler.FindRelatedInstances)
				rag.GET("/graph/instances/:id/impact", ragGraphHandler.AnalyzeImpact)
				rag.GET("/graph/path", ragGraphHandler.FindPath)

				// Graph synchronization
				rag.POST("/graph/sync", ragGraphHandler.SyncAll)
				rag.POST("/graph/sync/instance/:id", ragGraphHandler.SyncInstance)
				rag.POST("/graph/sync/relationship/:id", ragGraphHandler.SyncRelationship)
				rag.POST("/graph/sync/object-definition/:id", ragGraphHandler.SyncObjectDefinition)
			}
		}
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
		logger.Info("Starting server", zap.String("port", port))
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.Info("Server exited")
}
