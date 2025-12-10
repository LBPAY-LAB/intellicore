package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strings"

	"github.com/google/uuid"
)

// EmbeddingIndexer handles automatic indexing of objects and instances
type EmbeddingIndexer struct {
	db               *sql.DB
	embeddingService *EmbeddingService
	logger           *log.Logger
}

// NewEmbeddingIndexer creates a new embedding indexer
func NewEmbeddingIndexer(db *sql.DB, embSvc *EmbeddingService, logger *log.Logger) *EmbeddingIndexer {
	if logger == nil {
		logger = log.Default()
	}

	return &EmbeddingIndexer{
		db:               db,
		embeddingService: embSvc,
		logger:           logger,
	}
}

// IndexObjectDefinition creates an embedding for an object_definition
func (idx *EmbeddingIndexer) IndexObjectDefinition(ctx context.Context, objDefID uuid.UUID) error {
	// 1. Fetch object_definition from database
	var name, displayName, description string
	var schemaJSON json.RawMessage
	var states, rules json.RawMessage

	query := `
		SELECT
			name,
			display_name,
			description,
			schema,
			states,
			rules
		FROM object_definitions
		WHERE id = $1 AND is_active = true
	`

	err := idx.db.QueryRowContext(ctx, query, objDefID).Scan(
		&name,
		&displayName,
		&description,
		&schemaJSON,
		&states,
		&rules,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("object_definition not found or inactive: %s", objDefID)
		}
		return fmt.Errorf("failed to fetch object_definition: %w", err)
	}

	// 2. Create rich text for embedding
	var schemaFormatted, statesFormatted, rulesFormatted string

	// Format schema
	var schemaMap map[string]interface{}
	if err := json.Unmarshal(schemaJSON, &schemaMap); err == nil {
		if props, ok := schemaMap["properties"].(map[string]interface{}); ok {
			var fields []string
			for fieldName, fieldDef := range props {
				fieldMap, _ := fieldDef.(map[string]interface{})
				fieldType, _ := fieldMap["type"].(string)
				fieldDesc, _ := fieldMap["description"].(string)
				fields = append(fields, fmt.Sprintf("  - %s (%s): %s", fieldName, fieldType, fieldDesc))
			}
			schemaFormatted = strings.Join(fields, "\n")
		}
	}

	// Format states
	var statesMap map[string]interface{}
	if err := json.Unmarshal(states, &statesMap); err == nil {
		if statesList, ok := statesMap["states"].([]interface{}); ok {
			var stateNames []string
			for _, state := range statesList {
				stateNames = append(stateNames, fmt.Sprintf("%v", state))
			}
			statesFormatted = strings.Join(stateNames, ", ")
		}
	}

	// Format rules
	var rulesList []interface{}
	if err := json.Unmarshal(rules, &rulesList); err == nil && len(rulesList) > 0 {
		rulesFormatted = fmt.Sprintf("%d validation rules configured", len(rulesList))
	}

	// Build comprehensive text
	text := fmt.Sprintf(`Object Definition: %s (%s)

Description: %s

Fields:
%s

States: %s

Validation Rules: %s

Full Schema: %s
`,
		displayName,
		name,
		description,
		schemaFormatted,
		statesFormatted,
		rulesFormatted,
		string(schemaJSON),
	)

	// 3. Generate embedding
	embedding, err := idx.embeddingService.GenerateEmbedding(ctx, text)
	if err != nil {
		return fmt.Errorf("failed to generate embedding: %w", err)
	}

	// 4. Delete existing embeddings for this object_definition
	if err := idx.embeddingService.DeleteEmbeddingsByObjectDefinition(ctx, idx.db, objDefID); err != nil {
		idx.logger.Printf("Warning: failed to delete existing embeddings for object_definition %s: %v", objDefID, err)
	}

	// 5. Store embedding
	metadata := map[string]interface{}{
		"name":         name,
		"display_name": displayName,
		"has_schema":   schemaFormatted != "",
		"has_states":   statesFormatted != "",
		"has_rules":    rulesFormatted != "",
	}

	embeddingID, err := idx.embeddingService.StoreEmbedding(
		ctx,
		idx.db,
		text,
		"object_definition",
		embedding,
		metadata,
		&objDefID,
		nil,
	)
	if err != nil {
		return fmt.Errorf("failed to store embedding: %w", err)
	}

	idx.logger.Printf("Successfully indexed object_definition %s (embedding ID: %s)", objDefID, embeddingID)
	return nil
}

// IndexInstance creates an embedding for an instance
func (idx *EmbeddingIndexer) IndexInstance(ctx context.Context, instanceID uuid.UUID) error {
	// 1. Fetch instance and its object_definition
	var objDefID uuid.UUID
	var objDefName, objDefDisplayName string
	var dataJSON json.RawMessage
	var currentState string

	query := `
		SELECT
			i.object_definition_id,
			i.data,
			i.current_state,
			od.name,
			od.display_name
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE i.id = $1 AND i.is_deleted = false
	`

	err := idx.db.QueryRowContext(ctx, query, instanceID).Scan(
		&objDefID,
		&dataJSON,
		&currentState,
		&objDefName,
		&objDefDisplayName,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("instance not found or deleted: %s", instanceID)
		}
		return fmt.Errorf("failed to fetch instance: %w", err)
	}

	// 2. Create rich text for embedding
	var dataMap map[string]interface{}
	var dataFormatted string

	if err := json.Unmarshal(dataJSON, &dataMap); err == nil {
		var fields []string
		for key, value := range dataMap {
			// Format value based on type
			var valueStr string
			switch v := value.(type) {
			case string:
				valueStr = v
			case float64:
				valueStr = fmt.Sprintf("%.2f", v)
			case bool:
				valueStr = fmt.Sprintf("%t", v)
			case map[string]interface{}, []interface{}:
				jsonBytes, _ := json.Marshal(v)
				valueStr = string(jsonBytes)
			default:
				valueStr = fmt.Sprintf("%v", v)
			}

			fields = append(fields, fmt.Sprintf("  %s: %s", key, valueStr))
		}
		dataFormatted = strings.Join(fields, "\n")
	}

	text := fmt.Sprintf(`Instance of %s (%s)

Instance ID: %s
Current State: %s

Data:
%s

Full Data JSON: %s
`,
		objDefDisplayName,
		objDefName,
		instanceID,
		currentState,
		dataFormatted,
		string(dataJSON),
	)

	// 3. Generate embedding
	embedding, err := idx.embeddingService.GenerateEmbedding(ctx, text)
	if err != nil {
		return fmt.Errorf("failed to generate embedding: %w", err)
	}

	// 4. Delete existing embeddings for this instance
	if err := idx.embeddingService.DeleteEmbeddingsByInstance(ctx, idx.db, instanceID); err != nil {
		idx.logger.Printf("Warning: failed to delete existing embeddings for instance %s: %v", instanceID, err)
	}

	// 5. Store embedding
	metadata := map[string]interface{}{
		"object_definition_id":   objDefID.String(),
		"object_definition_name": objDefName,
		"current_state":          currentState,
	}

	// Add key fields to metadata for better searchability
	if dataMap != nil {
		// Common identifying fields
		for _, key := range []string{"cpf", "cnpj", "email", "nome", "nome_completo", "razao_social", "numero_conta"} {
			if val, exists := dataMap[key]; exists {
				metadata[key] = val
			}
		}
	}

	embeddingID, err := idx.embeddingService.StoreEmbedding(
		ctx,
		idx.db,
		text,
		"instance",
		embedding,
		metadata,
		&objDefID,
		&instanceID,
	)
	if err != nil {
		return fmt.Errorf("failed to store embedding: %w", err)
	}

	idx.logger.Printf("Successfully indexed instance %s (embedding ID: %s)", instanceID, embeddingID)
	return nil
}

// IndexAllObjectDefinitions indexes all active object_definitions
func (idx *EmbeddingIndexer) IndexAllObjectDefinitions(ctx context.Context) (int, error) {
	query := `SELECT id FROM object_definitions WHERE is_active = true`
	rows, err := idx.db.QueryContext(ctx, query)
	if err != nil {
		return 0, fmt.Errorf("failed to fetch object_definitions: %w", err)
	}
	defer rows.Close()

	count := 0
	failed := 0

	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			idx.logger.Printf("Error scanning object_definition ID: %v", err)
			failed++
			continue
		}

		if err := idx.IndexObjectDefinition(ctx, id); err != nil {
			idx.logger.Printf("Error indexing object_definition %s: %v", id, err)
			failed++
		} else {
			count++
		}
	}

	if err := rows.Err(); err != nil {
		return count, fmt.Errorf("error iterating object_definitions: %w", err)
	}

	idx.logger.Printf("Indexed %d object definitions (%d failed)", count, failed)
	return count, nil
}

// IndexAllInstances indexes all non-deleted instances
func (idx *EmbeddingIndexer) IndexAllInstances(ctx context.Context) (int, error) {
	query := `SELECT id FROM instances WHERE is_deleted = false`
	rows, err := idx.db.QueryContext(ctx, query)
	if err != nil {
		return 0, fmt.Errorf("failed to fetch instances: %w", err)
	}
	defer rows.Close()

	count := 0
	failed := 0

	for rows.Next() {
		var id uuid.UUID
		if err := rows.Scan(&id); err != nil {
			idx.logger.Printf("Error scanning instance ID: %v", err)
			failed++
			continue
		}

		if err := idx.IndexInstance(ctx, id); err != nil {
			idx.logger.Printf("Error indexing instance %s: %v", id, err)
			failed++
		} else {
			count++
		}
	}

	if err := rows.Err(); err != nil {
		return count, fmt.Errorf("error iterating instances: %w", err)
	}

	idx.logger.Printf("Indexed %d instances (%d failed)", count, failed)
	return count, nil
}

// ReindexAll reindexes all object_definitions and instances
func (idx *EmbeddingIndexer) ReindexAll(ctx context.Context) error {
	idx.logger.Println("Starting full reindexing...")

	// Index object definitions
	objDefCount, err := idx.IndexAllObjectDefinitions(ctx)
	if err != nil {
		return fmt.Errorf("failed to index object_definitions: %w", err)
	}

	// Index instances
	instanceCount, err := idx.IndexAllInstances(ctx)
	if err != nil {
		return fmt.Errorf("failed to index instances: %w", err)
	}

	idx.logger.Printf("Reindexing complete: %d object_definitions, %d instances", objDefCount, instanceCount)
	return nil
}
