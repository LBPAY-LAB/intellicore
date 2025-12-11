package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/handlers"
)

func main() {
	log.Println("🚀 SuperCore API - Starting...")

	// Conecta ao banco de dados
	db, err := database.NewDBFromEnv()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Executa migrations se solicitado
	if os.Getenv("RUN_MIGRATIONS") == "true" {
		if err := db.RunMigration("database/migrations/001_initial_schema.sql"); err != nil {
			log.Fatalf("Failed to run migrations: %v", err)
		}
	}

	// Configura Gin
	if os.Getenv("GIN_MODE") == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"service": "supercore-api",
		})
	})

	// Initialize repositories
	objDefRepo := database.NewObjectDefinitionRepository(db)
	instanceRepo := database.NewInstanceRepository(db, objDefRepo)
	relationshipRepo := database.NewRelationshipRepository(db)

	// Initialize handlers
	objDefHandler := handlers.NewObjectDefinitionHandler(objDefRepo)
	instanceHandler := handlers.NewInstanceHandler(instanceRepo, objDefRepo)
	relationshipHandler := handlers.NewRelationshipHandler(relationshipRepo, instanceRepo)

	// API v1 routes
	v1 := router.Group("/api/v1")
	{
		// Object Definitions
		v1.POST("/object-definitions", objDefHandler.Create)
		v1.GET("/object-definitions", objDefHandler.List)
		v1.GET("/object-definitions/:id", objDefHandler.GetByID)
		v1.PUT("/object-definitions/:id", objDefHandler.Update)
		v1.DELETE("/object-definitions/:id", objDefHandler.Delete)

		// Instances
		v1.POST("/instances", instanceHandler.Create)
		v1.GET("/instances", instanceHandler.List)
		v1.GET("/instances/:id", instanceHandler.GetByID)
		v1.PUT("/instances/:id", instanceHandler.Update)
		v1.DELETE("/instances/:id", instanceHandler.Delete)
		v1.POST("/instances/:id/transition", instanceHandler.TransitionState)

		// Relationships
		v1.POST("/relationships", relationshipHandler.Create)
		v1.GET("/relationships", relationshipHandler.List)
		v1.GET("/relationships/:id", relationshipHandler.GetByID)
		v1.DELETE("/relationships/:id", relationshipHandler.Delete)
	}

	// Inicia o servidor
	port := getEnv("PORT", "8080")
	addr := fmt.Sprintf(":%s", port)

	log.Printf("✅ SuperCore API listening on %s", addr)
	log.Printf("📚 API Documentation: http://localhost:%s/api/v1", port)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
