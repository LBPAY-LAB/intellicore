package services

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"

	"github.com/google/uuid"
	"github.com/pgvector/pgvector-go"
)

// EmbeddingService handles embedding generation and storage
type EmbeddingService struct {
	apiKey   string
	provider string // "openai" or "cohere"
	model    string // "text-embedding-ada-002" or "embed-multilingual-v3.0"
	client   *http.Client
}

// NewEmbeddingService creates a new embedding service
func NewEmbeddingService(provider, apiKey, model string) *EmbeddingService {
	return &EmbeddingService{
		provider: provider,
		apiKey:   apiKey,
		model:    model,
		client:   &http.Client{},
	}
}

// GenerateEmbedding generates an embedding for the given text
func (s *EmbeddingService) GenerateEmbedding(ctx context.Context, text string) ([]float32, error) {
	if text == "" {
		return nil, errors.New("text cannot be empty")
	}

	switch s.provider {
	case "openai":
		return s.generateOpenAIEmbedding(ctx, text)
	case "cohere":
		return s.generateCohereEmbedding(ctx, text)
	default:
		return nil, fmt.Errorf("unsupported embedding provider: %s", s.provider)
	}
}

// generateOpenAIEmbedding generates embedding using OpenAI API
func (s *EmbeddingService) generateOpenAIEmbedding(ctx context.Context, text string) ([]float32, error) {
	reqBody := map[string]interface{}{
		"input": text,
		"model": s.model,
	}

	bodyJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.openai.com/v1/embeddings", bytes.NewReader(bodyJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call OpenAI API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("OpenAI API error (status %d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		Data []struct {
			Embedding []float32 `json:"embedding"`
		} `json:"data"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if result.Error != nil {
		return nil, fmt.Errorf("OpenAI API error: %s", result.Error.Message)
	}

	if len(result.Data) == 0 {
		return nil, errors.New("no embedding returned from OpenAI")
	}

	return result.Data[0].Embedding, nil
}

// generateCohereEmbedding generates embedding using Cohere API
func (s *EmbeddingService) generateCohereEmbedding(ctx context.Context, text string) ([]float32, error) {
	reqBody := map[string]interface{}{
		"texts":          []string{text},
		"model":          s.model,
		"input_type":     "search_document",
		"embedding_types": []string{"float"},
	}

	bodyJSON, err := json.Marshal(reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.cohere.ai/v1/embed", bytes.NewReader(bodyJSON))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.apiKey)

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call Cohere API: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Cohere API error (status %d): %s", resp.StatusCode, string(body))
	}

	var result struct {
		Embeddings struct {
			Float [][]float32 `json:"float"`
		} `json:"embeddings"`
		Message string `json:"message"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if result.Message != "" {
		return nil, fmt.Errorf("Cohere API error: %s", result.Message)
	}

	if len(result.Embeddings.Float) == 0 {
		return nil, errors.New("no embedding returned from Cohere")
	}

	return result.Embeddings.Float[0], nil
}

// StoreEmbedding stores an embedding in the database
func (s *EmbeddingService) StoreEmbedding(
	ctx context.Context,
	db *sql.DB,
	content string,
	contentType string,
	embedding []float32,
	metadata map[string]interface{},
	objectDefID *uuid.UUID,
	instanceID *uuid.UUID,
) (uuid.UUID, error) {
	var metadataJSON []byte
	var err error

	if metadata != nil {
		metadataJSON, err = json.Marshal(metadata)
		if err != nil {
			return uuid.Nil, fmt.Errorf("failed to marshal metadata: %w", err)
		}
	} else {
		metadataJSON = []byte("{}")
	}

	query := `
		INSERT INTO document_embeddings (
			content,
			content_type,
			embedding,
			metadata,
			object_definition_id,
			instance_id
		)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	var id uuid.UUID
	err = db.QueryRowContext(
		ctx,
		query,
		content,
		contentType,
		pgvector.NewVector(embedding),
		metadataJSON,
		objectDefID,
		instanceID,
	).Scan(&id)

	if err != nil {
		return uuid.Nil, fmt.Errorf("failed to store embedding: %w", err)
	}

	return id, nil
}

// SearchResult represents a search result from semantic search
type SearchResult struct {
	ID          uuid.UUID              `json:"id"`
	Content     string                 `json:"content"`
	ContentType string                 `json:"content_type"`
	Metadata    map[string]interface{} `json:"metadata"`
	Similarity  float64                `json:"similarity"`
	ObjectDefID *uuid.UUID             `json:"object_definition_id,omitempty"`
	InstanceID  *uuid.UUID             `json:"instance_id,omitempty"`
}

// SearchSimilar searches for similar documents using cosine similarity
func (s *EmbeddingService) SearchSimilar(
	ctx context.Context,
	db *sql.DB,
	queryEmbedding []float32,
	contentType string,
	limit int,
) ([]SearchResult, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100 // Max limit
	}

	var query string
	var args []interface{}

	if contentType != "" {
		query = `
			SELECT
				id,
				content,
				content_type,
				metadata,
				object_definition_id,
				instance_id,
				1 - (embedding <=> $1) as similarity
			FROM document_embeddings
			WHERE content_type = $2
			ORDER BY embedding <=> $1
			LIMIT $3
		`
		args = []interface{}{
			pgvector.NewVector(queryEmbedding),
			contentType,
			limit,
		}
	} else {
		// Search across all content types
		query = `
			SELECT
				id,
				content,
				content_type,
				metadata,
				object_definition_id,
				instance_id,
				1 - (embedding <=> $1) as similarity
			FROM document_embeddings
			ORDER BY embedding <=> $1
			LIMIT $2
		`
		args = []interface{}{
			pgvector.NewVector(queryEmbedding),
			limit,
		}
	}

	rows, err := db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query embeddings: %w", err)
	}
	defer rows.Close()

	var results []SearchResult
	for rows.Next() {
		var r SearchResult
		var metadataJSON []byte

		err := rows.Scan(
			&r.ID,
			&r.Content,
			&r.ContentType,
			&metadataJSON,
			&r.ObjectDefID,
			&r.InstanceID,
			&r.Similarity,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		// Parse metadata
		if err := json.Unmarshal(metadataJSON, &r.Metadata); err != nil {
			r.Metadata = make(map[string]interface{})
		}

		results = append(results, r)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return results, nil
}

// DeleteEmbedding deletes an embedding by ID
func (s *EmbeddingService) DeleteEmbedding(ctx context.Context, db *sql.DB, id uuid.UUID) error {
	query := `DELETE FROM document_embeddings WHERE id = $1`
	result, err := db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete embedding: %w", err)
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to get rows affected: %w", err)
	}

	if rows == 0 {
		return errors.New("embedding not found")
	}

	return nil
}

// DeleteEmbeddingsByObjectDefinition deletes all embeddings for an object definition
func (s *EmbeddingService) DeleteEmbeddingsByObjectDefinition(ctx context.Context, db *sql.DB, objectDefID uuid.UUID) error {
	query := `DELETE FROM document_embeddings WHERE object_definition_id = $1`
	_, err := db.ExecContext(ctx, query, objectDefID)
	if err != nil {
		return fmt.Errorf("failed to delete embeddings: %w", err)
	}
	return nil
}

// DeleteEmbeddingsByInstance deletes all embeddings for an instance
func (s *EmbeddingService) DeleteEmbeddingsByInstance(ctx context.Context, db *sql.DB, instanceID uuid.UUID) error {
	query := `DELETE FROM document_embeddings WHERE instance_id = $1`
	_, err := db.ExecContext(ctx, query, instanceID)
	if err != nil {
		return fmt.Errorf("failed to delete embeddings: %w", err)
	}
	return nil
}
