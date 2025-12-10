package embeddings

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lbpay/supercore/internal/models"
	"github.com/pgvector/pgvector-go"
	openai "github.com/sashabaranov/go-openai"
)

const (
	// OpenAI embedding model
	DefaultEmbeddingModel = openai.AdaEmbeddingV2
	// Embedding dimension for ada-002
	EmbeddingDimension = 1536
)

// EmbeddingService handles all embedding-related operations
type EmbeddingService struct {
	db          *pgxpool.Pool
	openaiClient *openai.Client
	model       string
}

// NewEmbeddingService creates a new embedding service
func NewEmbeddingService(db *pgxpool.Pool, openaiAPIKey string) *EmbeddingService {
	return &EmbeddingService{
		db:           db,
		openaiClient: openai.NewClient(openaiAPIKey),
		model:        DefaultEmbeddingModel,
	}
}

// GenerateEmbedding generates a vector embedding for the given text using OpenAI
func (s *EmbeddingService) GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
	// Clean and prepare text
	cleanText := strings.TrimSpace(text)
	if cleanText == "" {
		return nil, fmt.Errorf("text cannot be empty")
	}

	// Call OpenAI API
	resp, err := s.openaiClient.CreateEmbeddings(ctx, openai.EmbeddingRequest{
		Input: []string{cleanText},
		Model: openai.EmbeddingModel(s.model),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to generate embedding: %w", err)
	}

	if len(resp.Data) == 0 {
		return nil, fmt.Errorf("no embedding returned from API")
	}

	// Convert float64 to float32
	embedding := make([]float32, len(resp.Data[0].Embedding))
	for i, v := range resp.Data[0].Embedding {
		embedding[i] = float32(v)
	}

	return embedding, nil
}

// StoreEmbedding stores an embedding in the database
func (s *EmbeddingService) StoreEmbedding(ctx context.Context, req *models.CreateEmbeddingRequest, embedding []float32) (*models.Embedding, error) {
	query := `
		INSERT INTO embeddings (object_type, object_id, content, embedding, metadata)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, object_type, object_id, content, metadata, created_at, updated_at
	`

	// Convert []float32 to pgvector.Vector
	vector := pgvector.NewVector(embedding)

	var result models.Embedding
	err := s.db.QueryRow(ctx, query,
		req.ObjectType,
		req.ObjectID,
		req.Content,
		vector,
		req.Metadata,
	).Scan(
		&result.ID,
		&result.ObjectType,
		&result.ObjectID,
		&result.Content,
		&result.Metadata,
		&result.CreatedAt,
		&result.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to store embedding: %w", err)
	}

	result.Embedding = embedding
	return &result, nil
}

// CreateEmbedding generates and stores an embedding
func (s *EmbeddingService) CreateEmbedding(ctx context.Context, req *models.CreateEmbeddingRequest) (*models.Embedding, error) {
	// Generate embedding
	embedding, err := s.GenerateEmbedding(ctx, req.Content)
	if err != nil {
		return nil, err
	}

	// Store in database
	return s.StoreEmbedding(ctx, req, embedding)
}

// SearchSimilar performs semantic search for similar embeddings
func (s *EmbeddingService) SearchSimilar(ctx context.Context, req *models.SearchEmbeddingsRequest) (*models.SearchEmbeddingsResponse, error) {
	// Generate embedding for the query
	queryEmbedding, err := s.GenerateEmbedding(ctx, req.Query)
	if err != nil {
		return nil, fmt.Errorf("failed to generate query embedding: %w", err)
	}

	// Build the query
	query := `
		SELECT
			e.id,
			e.object_type,
			e.object_id,
			e.content,
			e.metadata,
			1 - (e.embedding <=> $1) as similarity_score,
			CASE
				WHEN e.object_type = 'object_definition' THEN od.name
				ELSE NULL
			END as object_name,
			CASE
				WHEN e.object_type = 'object_definition' THEN od.display_name
				ELSE NULL
			END as object_display_name,
			CASE
				WHEN e.object_type = 'object_definition' THEN od.category
				ELSE NULL
			END as object_category,
			CASE
				WHEN e.object_type = 'instance' THEN i.current_state
				ELSE NULL
			END as instance_state
		FROM embeddings e
		LEFT JOIN object_definitions od ON e.object_type = 'object_definition' AND e.object_id = od.id
		LEFT JOIN instances i ON e.object_type = 'instance' AND e.object_id = i.id
		WHERE 1=1
	`

	args := []interface{}{pgvector.NewVector(queryEmbedding)}
	argCount := 1

	// Add filters
	if req.ObjectType != nil {
		argCount++
		query += fmt.Sprintf(" AND e.object_type = $%d", argCount)
		args = append(args, *req.ObjectType)
	}

	if req.MinScore != nil {
		argCount++
		query += fmt.Sprintf(" AND (1 - (e.embedding <=> $1)) >= $%d", argCount)
		args = append(args, *req.MinScore)
	}

	if len(req.Categories) > 0 {
		argCount++
		query += fmt.Sprintf(" AND (e.object_type != 'object_definition' OR od.category = ANY($%d))", argCount)
		args = append(args, req.Categories)
	}

	// Order by similarity and limit
	query += " ORDER BY e.embedding <=> $1 LIMIT $" + fmt.Sprintf("%d", argCount+1)
	limit := req.Limit
	if limit == 0 {
		limit = 10
	}
	args = append(args, limit)

	// Execute query
	rows, err := s.db.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to search embeddings: %w", err)
	}
	defer rows.Close()

	results := []models.SearchResult{}
	for rows.Next() {
		var result models.SearchResult
		err := rows.Scan(
			&result.ID,
			&result.ObjectType,
			&result.ObjectID,
			&result.Content,
			&result.Metadata,
			&result.SimilarityScore,
			&result.ObjectName,
			&result.ObjectDisplayName,
			&result.ObjectCategory,
			&result.InstanceState,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan result: %w", err)
		}
		results = append(results, result)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating results: %w", err)
	}

	return &models.SearchEmbeddingsResponse{
		Results: results,
		Query:   req.Query,
		Limit:   limit,
		Count:   len(results),
	}, nil
}

// CreateEmbeddingForObjectDefinition creates an embedding for an object definition
func (s *EmbeddingService) CreateEmbeddingForObjectDefinition(ctx context.Context, objectDef *models.ObjectDefinition) error {
	// Build content from object definition
	content := s.buildObjectDefinitionContent(objectDef)

	// Build metadata
	metadata := models.EmbeddingMetadata{
		ObjectName:     objectDef.Name,
		ObjectCategory: objectDef.Category,
		DisplayName:    objectDef.DisplayName,
		Description:    objectDef.Description,
	}
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// Create embedding request
	req := &models.CreateEmbeddingRequest{
		ObjectType: models.ObjectTypeDefinition,
		ObjectID:   objectDef.ID,
		Content:    content,
		Metadata:   metadataJSON,
	}

	// Generate and store
	_, err = s.CreateEmbedding(ctx, req)
	return err
}

// CreateEmbeddingForInstance creates an embedding for an instance
func (s *EmbeddingService) CreateEmbeddingForInstance(ctx context.Context, instance *models.Instance, objectDef *models.ObjectDefinition) error {
	// Build content from instance data
	content := s.buildInstanceContent(instance, objectDef)

	// Build metadata
	metadata := models.EmbeddingMetadata{
		InstanceState:          instance.CurrentState,
		InstanceDefinitionID:   &instance.ObjectDefinitionID,
		InstanceDefinitionName: objectDef.Name,
	}
	metadataJSON, err := json.Marshal(metadata)
	if err != nil {
		return fmt.Errorf("failed to marshal metadata: %w", err)
	}

	// Create embedding request
	req := &models.CreateEmbeddingRequest{
		ObjectType: models.ObjectTypeInstance,
		ObjectID:   instance.ID,
		Content:    content,
		Metadata:   metadataJSON,
	}

	// Generate and store
	_, err = s.CreateEmbedding(ctx, req)
	return err
}

// UpdateEmbedding updates an existing embedding
func (s *EmbeddingService) UpdateEmbedding(ctx context.Context, objectType models.ObjectType, objectID uuid.UUID, content string, metadata json.RawMessage) error {
	// Generate new embedding
	embedding, err := s.GenerateEmbedding(ctx, content)
	if err != nil {
		return err
	}

	// Update in database
	query := `
		UPDATE embeddings
		SET content = $1, embedding = $2, metadata = $3, updated_at = NOW()
		WHERE object_type = $4 AND object_id = $5
	`

	_, err = s.db.Exec(ctx, query,
		content,
		pgvector.NewVector(embedding),
		metadata,
		objectType,
		objectID,
	)
	if err != nil {
		return fmt.Errorf("failed to update embedding: %w", err)
	}

	return nil
}

// DeleteEmbedding deletes an embedding
func (s *EmbeddingService) DeleteEmbedding(ctx context.Context, objectType models.ObjectType, objectID uuid.UUID) error {
	query := `DELETE FROM embeddings WHERE object_type = $1 AND object_id = $2`
	_, err := s.db.Exec(ctx, query, objectType, objectID)
	if err != nil {
		return fmt.Errorf("failed to delete embedding: %w", err)
	}
	return nil
}

// GetEmbedding retrieves an embedding by object type and ID
func (s *EmbeddingService) GetEmbedding(ctx context.Context, objectType models.ObjectType, objectID uuid.UUID) (*models.Embedding, error) {
	query := `
		SELECT id, object_type, object_id, content, embedding, metadata, created_at, updated_at
		FROM embeddings
		WHERE object_type = $1 AND object_id = $2
	`

	var result models.Embedding
	var vector pgvector.Vector

	err := s.db.QueryRow(ctx, query, objectType, objectID).Scan(
		&result.ID,
		&result.ObjectType,
		&result.ObjectID,
		&result.Content,
		&vector,
		&result.Metadata,
		&result.CreatedAt,
		&result.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get embedding: %w", err)
	}

	result.Embedding = vector.Slice()
	return &result, nil
}

// GetStats returns statistics about embeddings
func (s *EmbeddingService) GetStats(ctx context.Context) (*models.EmbeddingStats, error) {
	query := `
		SELECT
			COUNT(*) as total,
			COUNT(*) FILTER (WHERE object_type = 'object_definition') as obj_def_count,
			COUNT(*) FILTER (WHERE object_type = 'instance') as instance_count,
			MAX(updated_at) as last_updated,
			AVG(LENGTH(content))::int as avg_content_length
		FROM embeddings
	`

	var stats models.EmbeddingStats
	var lastUpdated *time.Time

	err := s.db.QueryRow(ctx, query).Scan(
		&stats.TotalEmbeddings,
		&stats.ObjectDefinitionCount,
		&stats.InstanceCount,
		&lastUpdated,
		&stats.AverageContentLength,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get stats: %w", err)
	}

	if lastUpdated != nil {
		stats.LastUpdated = *lastUpdated
	}

	return &stats, nil
}

// Helper functions to build content for embeddings

func (s *EmbeddingService) buildObjectDefinitionContent(objectDef *models.ObjectDefinition) string {
	var parts []string

	// Name and display name
	parts = append(parts, fmt.Sprintf("Object: %s", objectDef.Name))
	parts = append(parts, fmt.Sprintf("Display Name: %s", objectDef.DisplayName))

	// Description
	if objectDef.Description != nil && *objectDef.Description != "" {
		parts = append(parts, fmt.Sprintf("Description: %s", *objectDef.Description))
	}

	// Category
	parts = append(parts, fmt.Sprintf("Category: %s", objectDef.Category))

	// Schema fields (extract field names and types)
	if len(objectDef.Schema) > 0 {
		var schema map[string]interface{}
		if err := json.Unmarshal(objectDef.Schema, &schema); err == nil {
			if properties, ok := schema["properties"].(map[string]interface{}); ok {
				fieldNames := make([]string, 0, len(properties))
				for fieldName := range properties {
					fieldNames = append(fieldNames, fieldName)
				}
				if len(fieldNames) > 0 {
					parts = append(parts, fmt.Sprintf("Fields: %s", strings.Join(fieldNames, ", ")))
				}
			}
		}
	}

	return strings.Join(parts, "\n")
}

func (s *EmbeddingService) buildInstanceContent(instance *models.Instance, objectDef *models.ObjectDefinition) string {
	var parts []string

	// Object definition info
	parts = append(parts, fmt.Sprintf("Type: %s", objectDef.DisplayName))
	parts = append(parts, fmt.Sprintf("State: %s", instance.CurrentState))

	// Extract key data fields
	if len(instance.Data) > 0 {
		var data map[string]interface{}
		if err := json.Unmarshal(instance.Data, &data); err == nil {
			// Convert data to readable text
			for key, value := range data {
				if value != nil {
					parts = append(parts, fmt.Sprintf("%s: %v", key, value))
				}
			}
		}
	}

	return strings.Join(parts, "\n")
}
