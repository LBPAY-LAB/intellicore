package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/services/rag"
)

// NebulaSyncService synchronizes PostgreSQL data to Nebula Graph
type NebulaSyncService struct {
	pgDB       *sql.DB
	graphLayer *rag.GraphLayer
}

// NewNebulaSyncService creates a new Nebula sync service
func NewNebulaSyncService(pgDB *sql.DB, graphLayer *rag.GraphLayer) *NebulaSyncService {
	return &NebulaSyncService{
		pgDB:       pgDB,
		graphLayer: graphLayer,
	}
}

// SyncInstance synchronizes a single instance from PostgreSQL to Nebula Graph
func (s *NebulaSyncService) SyncInstance(ctx context.Context, instanceID uuid.UUID) error {
	// 1. Fetch instance from PostgreSQL
	var objDefID uuid.UUID
	var objDefName, currentState, createdBy string
	var data json.RawMessage
	var createdAt, updatedAt time.Time

	err := s.pgDB.QueryRowContext(ctx, `
		SELECT
			i.object_definition_id,
			od.name,
			i.current_state,
			i.data,
			i.created_at,
			i.updated_at,
			COALESCE(i.created_by::text, '')
		FROM instances i
		JOIN object_definitions od ON i.object_definition_id = od.id
		WHERE i.id = $1 AND i.is_deleted = false
	`, instanceID).Scan(&objDefID, &objDefName, &currentState, &data, &createdAt, &updatedAt, &createdBy)

	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("instance not found: %s", instanceID)
		}
		return fmt.Errorf("failed to fetch instance: %w", err)
	}

	// 2. Create Instance vertex in Nebula Graph
	instance := &rag.InstanceVertex{
		ID:                   instanceID,
		ObjectDefinitionID:   objDefID,
		ObjectDefinitionName: objDefName,
		CurrentState:         currentState,
		Data:                 data,
		CreatedAt:            createdAt,
		UpdatedAt:            updatedAt,
		CreatedBy:            createdBy,
	}

	if err := s.graphLayer.SyncInstance(instance); err != nil {
		return fmt.Errorf("failed to sync instance to graph: %w", err)
	}

	log.Printf("Synced instance %s (%s) to Nebula Graph", instanceID, objDefName)
	return nil
}

// SyncRelationship synchronizes a single relationship from PostgreSQL to Nebula Graph
func (s *NebulaSyncService) SyncRelationship(ctx context.Context, relationshipID uuid.UUID) error {
	// 1. Fetch relationship from PostgreSQL
	var relType, createdBy string
	var sourceID, targetID uuid.UUID
	var properties json.RawMessage
	var createdAt time.Time

	err := s.pgDB.QueryRowContext(ctx, `
		SELECT
			relationship_type,
			source_instance_id,
			target_instance_id,
			properties,
			created_at,
			COALESCE(created_by::text, '')
		FROM relationships
		WHERE id = $1
	`, relationshipID).Scan(&relType, &sourceID, &targetID, &properties, &createdAt, &createdBy)

	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("relationship not found: %s", relationshipID)
		}
		return fmt.Errorf("failed to fetch relationship: %w", err)
	}

	// 2. Create RELATES_TO edge in Nebula Graph
	relationship := &rag.RelationshipEdge{
		FromID:           sourceID,
		ToID:             targetID,
		RelationshipType: relType,
		Metadata:         properties,
		CreatedAt:        createdAt,
		CreatedBy:        createdBy,
	}

	if err := s.graphLayer.SyncRelationship(relationship); err != nil {
		return fmt.Errorf("failed to sync relationship to graph: %w", err)
	}

	log.Printf("Synced relationship %s: %s -> %s (%s)", relationshipID, sourceID, targetID, relType)
	return nil
}

// SyncObjectDefinition synchronizes a single object definition from PostgreSQL to Nebula Graph
func (s *NebulaSyncService) SyncObjectDefinition(ctx context.Context, objectDefID uuid.UUID) error {
	// 1. Fetch object definition from PostgreSQL
	var name, displayName, description, category string
	var version int
	var createdAt, updatedAt time.Time

	err := s.pgDB.QueryRowContext(ctx, `
		SELECT
			name,
			display_name,
			description,
			COALESCE((schema->>'category')::text, 'GENERAL'),
			version,
			created_at,
			updated_at
		FROM object_definitions
		WHERE id = $1 AND is_active = true
	`, objectDefID).Scan(&name, &displayName, &description, &category, &version, &createdAt, &updatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("object definition not found: %s", objectDefID)
		}
		return fmt.Errorf("failed to fetch object definition: %w", err)
	}

	// 2. Create ObjectDefinition vertex in Nebula Graph
	objectDef := &rag.ObjectDefinitionVertex{
		ID:          objectDefID,
		Name:        name,
		Category:    category,
		Version:     version,
		Description: description,
		CreatedAt:   createdAt,
		UpdatedAt:   updatedAt,
	}

	if err := s.graphLayer.SyncObjectDefinition(objectDef); err != nil {
		return fmt.Errorf("failed to sync object definition to graph: %w", err)
	}

	log.Printf("Synced object definition %s (%s) to Nebula Graph", objectDefID, name)
	return nil
}

// SyncAll synchronizes all data from PostgreSQL to Nebula Graph
func (s *NebulaSyncService) SyncAll(ctx context.Context) (*SyncStats, error) {
	stats := &SyncStats{
		StartTime: time.Now(),
	}

	log.Println("Starting full sync of PostgreSQL to Nebula Graph...")

	// 1. Sync all object definitions
	log.Println("Syncing object definitions...")
	objDefRows, err := s.pgDB.QueryContext(ctx, "SELECT id FROM object_definitions WHERE is_active = true")
	if err != nil {
		return stats, fmt.Errorf("failed to query object definitions: %w", err)
	}
	defer objDefRows.Close()

	for objDefRows.Next() {
		var id uuid.UUID
		if err := objDefRows.Scan(&id); err != nil {
			stats.ObjectDefinitionsFailed++
			log.Printf("Error scanning object definition: %v", err)
			continue
		}

		if err := s.SyncObjectDefinition(ctx, id); err != nil {
			stats.ObjectDefinitionsFailed++
			log.Printf("Error syncing object definition %s: %v", id, err)
		} else {
			stats.ObjectDefinitionsSynced++
		}
	}

	// 2. Sync all instances
	log.Println("Syncing instances...")
	instanceRows, err := s.pgDB.QueryContext(ctx, "SELECT id FROM instances WHERE is_deleted = false")
	if err != nil {
		return stats, fmt.Errorf("failed to query instances: %w", err)
	}
	defer instanceRows.Close()

	for instanceRows.Next() {
		var id uuid.UUID
		if err := instanceRows.Scan(&id); err != nil {
			stats.InstancesFailed++
			log.Printf("Error scanning instance: %v", err)
			continue
		}

		if err := s.SyncInstance(ctx, id); err != nil {
			stats.InstancesFailed++
			log.Printf("Error syncing instance %s: %v", id, err)
		} else {
			stats.InstancesSynced++
		}
	}

	// 3. Sync all relationships
	log.Println("Syncing relationships...")
	relRows, err := s.pgDB.QueryContext(ctx, "SELECT id FROM relationships")
	if err != nil {
		return stats, fmt.Errorf("failed to query relationships: %w", err)
	}
	defer relRows.Close()

	for relRows.Next() {
		var id uuid.UUID
		if err := relRows.Scan(&id); err != nil {
			stats.RelationshipsFailed++
			log.Printf("Error scanning relationship: %v", err)
			continue
		}

		if err := s.SyncRelationship(ctx, id); err != nil {
			stats.RelationshipsFailed++
			log.Printf("Error syncing relationship %s: %v", id, err)
		} else {
			stats.RelationshipsSynced++
		}
	}

	stats.EndTime = time.Now()
	stats.Duration = stats.EndTime.Sub(stats.StartTime)

	log.Printf("Sync completed in %v", stats.Duration)
	log.Printf("Object Definitions: %d synced, %d failed", stats.ObjectDefinitionsSynced, stats.ObjectDefinitionsFailed)
	log.Printf("Instances: %d synced, %d failed", stats.InstancesSynced, stats.InstancesFailed)
	log.Printf("Relationships: %d synced, %d failed", stats.RelationshipsSynced, stats.RelationshipsFailed)

	return stats, nil
}

// DeleteInstance removes an instance from the graph
func (s *NebulaSyncService) DeleteInstance(ctx context.Context, instanceID uuid.UUID) error {
	return s.graphLayer.DeleteInstance(instanceID)
}

// DeleteObjectDefinition removes an object definition from the graph
func (s *NebulaSyncService) DeleteObjectDefinition(ctx context.Context, objectDefID uuid.UUID) error {
	return s.graphLayer.DeleteObjectDefinition(objectDefID)
}

// SyncStats holds statistics about a sync operation
type SyncStats struct {
	StartTime                 time.Time
	EndTime                   time.Time
	Duration                  time.Duration
	ObjectDefinitionsSynced   int
	ObjectDefinitionsFailed   int
	InstancesSynced           int
	InstancesFailed           int
	RelationshipsSynced       int
	RelationshipsFailed       int
}
