package rag

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"time"

	nebula "github.com/vesoft-inc/nebula-go/v3"
	"github.com/google/uuid"
)

// GraphLayer manages the Nebula Graph database for RAG relationship mapping
type GraphLayer struct {
	pool    *nebula.SessionPool
	address string
	space   string
}

// GraphConfig holds Nebula Graph connection configuration
type GraphConfig struct {
	Address  string // e.g., "nebula-graphd:9669"
	Username string
	Password string
	Space    string // e.g., "supercore_graph"
}

// ObjectDefinitionVertex represents an ObjectDefinition node in the graph
type ObjectDefinitionVertex struct {
	ID          uuid.UUID
	Name        string
	Category    string
	Version     int
	Description string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// InstanceVertex represents an Instance node in the graph
type InstanceVertex struct {
	ID                   uuid.UUID
	ObjectDefinitionID   uuid.UUID
	ObjectDefinitionName string
	CurrentState         string
	Data                 json.RawMessage
	CreatedAt            time.Time
	UpdatedAt            time.Time
	CreatedBy            string
}

// RelationshipEdge represents a RELATES_TO edge between instances
type RelationshipEdge struct {
	FromID           uuid.UUID
	ToID             uuid.UUID
	RelationshipType string
	Metadata         json.RawMessage
	CreatedAt        time.Time
	CreatedBy        string
}

// GraphPath represents a path between two instances
type GraphPath struct {
	Path       []uuid.UUID // Ordered list of instance IDs
	PathLength int
}

// ImpactAnalysis represents the impact of deleting an instance
type ImpactAnalysis struct {
	TargetInstanceID     uuid.UUID
	DirectDependents     []InstanceVertex
	IndirectDependents   []InstanceVertex
	TotalAffectedCount   int
	MaxDependencyDepth   int
	AffectedObjectTypes  map[string]int // object_name -> count
}

// NewGraphLayer creates a new GraphLayer instance with connection pooling
func NewGraphLayer(config GraphConfig) (*GraphLayer, error) {
	// Parse address to get host and port
	parts := strings.Split(config.Address, ":")
	if len(parts) != 2 {
		return nil, fmt.Errorf("invalid address format: %s (expected host:port)", config.Address)
	}
	host := parts[0]
	port := parts[1]

	// Create connection pool configuration
	poolConfig := nebula.GetDefaultConf()

	// Create host address
	hostAddress := nebula.HostAddress{
		Host: host,
		Port: parsePort(port),
	}

	// Create session pool
	pool, err := nebula.NewSessionPool(
		poolConfig,
		[]nebula.HostAddress{hostAddress},
		nebula.SessionPoolConf{
			Username: config.Username,
			Password: config.Password,
		},
		log.Default(), // Use default logger
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create Nebula session pool: %w", err)
	}

	gl := &GraphLayer{
		pool:    pool,
		address: config.Address,
		space:   config.Space,
	}

	// Initialize space
	if err := gl.initSpace(); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to initialize Nebula space: %w", err)
	}

	return gl, nil
}

// parsePort converts port string to int
func parsePort(port string) int {
	var p int
	fmt.Sscanf(port, "%d", &p)
	return p
}

// initSpace ensures the space is created and in use
func (gl *GraphLayer) initSpace() error {
	ctx := context.Background()
	session, err := gl.pool.GetSession(gl.space, "")
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}
	defer session.Release()

	// Execute a simple query to verify space exists
	query := fmt.Sprintf("USE %s", gl.space)
	_, err = session.Execute(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to use space %s: %w", gl.space, err)
	}

	return nil
}

// Close closes the Nebula Graph connection pool
func (gl *GraphLayer) Close() {
	if gl.pool != nil {
		gl.pool.Close()
	}
}

// executeQuery executes a query and returns the result
func (gl *GraphLayer) executeQuery(ctx context.Context, query string) (*nebula.ResultSet, error) {
	session, err := gl.pool.GetSession(gl.space, "")
	if err != nil {
		return nil, fmt.Errorf("failed to get session: %w", err)
	}
	defer session.Release()

	result, err := session.Execute(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("query execution failed: %w\nQuery: %s", err, query)
	}

	if !result.IsSucceed() {
		return nil, fmt.Errorf("query not successful: %s\nQuery: %s",
			result.GetErrorMsg(), query)
	}

	return result, nil
}

// SyncObjectDefinition creates or updates an ObjectDefinition vertex
func (gl *GraphLayer) SyncObjectDefinition(od *ObjectDefinitionVertex) error {
	ctx := context.Background()

	// Escape strings for Nebula
	name := strings.ReplaceAll(od.Name, "\"", "\\\"")
	category := strings.ReplaceAll(od.Category, "\"", "\\\"")
	description := strings.ReplaceAll(od.Description, "\"", "\\\"")

	// Format timestamps
	createdAt := od.CreatedAt.Format("2006-01-02T15:04:05")
	updatedAt := od.UpdatedAt.Format("2006-01-02T15:04:05")

	// UPSERT vertex (INSERT or UPDATE)
	query := fmt.Sprintf(`
		INSERT VERTEX ObjectDefinition(
			name, category, version, description, created_at, updated_at
		) VALUES
		"%s": ("%s", "%s", %d, "%s", datetime("%s"), datetime("%s"))
	`,
		od.ID.String(),
		name,
		category,
		od.Version,
		description,
		createdAt,
		updatedAt,
	)

	_, err := gl.executeQuery(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to sync ObjectDefinition: %w", err)
	}

	return nil
}

// SyncInstance creates or updates an Instance vertex and creates DEFINES edge
func (gl *GraphLayer) SyncInstance(inst *InstanceVertex) error {
	ctx := context.Background()

	// Escape strings
	objDefName := strings.ReplaceAll(inst.ObjectDefinitionName, "\"", "\\\"")
	currentState := strings.ReplaceAll(inst.CurrentState, "\"", "\\\"")
	createdBy := strings.ReplaceAll(inst.CreatedBy, "\"", "\\\"")
	data := strings.ReplaceAll(string(inst.Data), "\"", "\\\"")

	// Format timestamps
	createdAt := inst.CreatedAt.Format("2006-01-02T15:04:05")
	updatedAt := inst.UpdatedAt.Format("2006-01-02T15:04:05")

	// UPSERT Instance vertex
	vertexQuery := fmt.Sprintf(`
		INSERT VERTEX Instance(
			object_definition_id, object_definition_name, current_state,
			data, created_at, updated_at, created_by
		) VALUES
		"%s": ("%s", "%s", "%s", "%s", datetime("%s"), datetime("%s"), "%s")
	`,
		inst.ID.String(),
		inst.ObjectDefinitionID.String(),
		objDefName,
		currentState,
		data,
		createdAt,
		updatedAt,
		createdBy,
	)

	if _, err := gl.executeQuery(ctx, vertexQuery); err != nil {
		return fmt.Errorf("failed to sync Instance vertex: %w", err)
	}

	// Create DEFINES edge from ObjectDefinition to Instance
	edgeQuery := fmt.Sprintf(`
		INSERT EDGE DEFINES(created_at) VALUES
		"%s" -> "%s": (datetime("%s"))
	`,
		inst.ObjectDefinitionID.String(),
		inst.ID.String(),
		createdAt,
	)

	if _, err := gl.executeQuery(ctx, edgeQuery); err != nil {
		return fmt.Errorf("failed to create DEFINES edge: %w", err)
	}

	return nil
}

// SyncRelationship creates or updates a RELATES_TO edge between instances
func (gl *GraphLayer) SyncRelationship(rel *RelationshipEdge) error {
	ctx := context.Background()

	// Escape strings
	relType := strings.ReplaceAll(rel.RelationshipType, "\"", "\\\"")
	metadata := strings.ReplaceAll(string(rel.Metadata), "\"", "\\\"")
	createdBy := strings.ReplaceAll(rel.CreatedBy, "\"", "\\\"")

	// Format timestamp
	createdAt := rel.CreatedAt.Format("2006-01-02T15:04:05")

	// UPSERT RELATES_TO edge
	query := fmt.Sprintf(`
		INSERT EDGE RELATES_TO(relationship_type, metadata, created_at, created_by) VALUES
		"%s" -> "%s": ("%s", "%s", datetime("%s"), "%s")
	`,
		rel.FromID.String(),
		rel.ToID.String(),
		relType,
		metadata,
		createdAt,
		createdBy,
	)

	_, err := gl.executeQuery(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to sync Relationship: %w", err)
	}

	return nil
}

// FindRelatedInstances finds all instances related to a given instance up to a certain depth
func (gl *GraphLayer) FindRelatedInstances(instanceID uuid.UUID, depth int) ([]InstanceVertex, error) {
	ctx := context.Background()

	if depth < 1 {
		depth = 1
	}
	if depth > 10 {
		depth = 10 // Safety limit
	}

	// Query for instances connected via RELATES_TO up to depth levels
	query := fmt.Sprintf(`
		MATCH (start:Instance)-[:RELATES_TO*1..%d]->(related:Instance)
		WHERE id(start) == "%s"
		RETURN DISTINCT
			id(related) AS id,
			related.object_definition_id AS object_definition_id,
			related.object_definition_name AS object_definition_name,
			related.current_state AS current_state,
			related.data AS data,
			related.created_at AS created_at,
			related.updated_at AS updated_at,
			related.created_by AS created_by
	`,
		depth,
		instanceID.String(),
	)

	result, err := gl.executeQuery(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to find related instances: %w", err)
	}

	return gl.parseInstanceResults(result)
}

// FindPath finds the shortest path between two instances
func (gl *GraphLayer) FindPath(fromID, toID uuid.UUID) ([]GraphPath, error) {
	ctx := context.Background()

	// Find shortest path using Nebula's FIND SHORTEST PATH
	query := fmt.Sprintf(`
		FIND SHORTEST PATH FROM "%s" TO "%s" OVER RELATES_TO YIELD path AS p
	`,
		fromID.String(),
		toID.String(),
	)

	result, err := gl.executeQuery(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to find path: %w", err)
	}

	return gl.parsePathResults(result)
}

// AnalyzeImpact analyzes the impact of deleting an instance
func (gl *GraphLayer) AnalyzeImpact(instanceID uuid.UUID) (*ImpactAnalysis, error) {
	ctx := context.Background()

	// Find all instances that have edges pointing TO this instance
	// (dependents - instances that depend on this one)
	query := fmt.Sprintf(`
		MATCH (dependent:Instance)-[:RELATES_TO]->(target:Instance)
		WHERE id(target) == "%s"
		RETURN DISTINCT
			id(dependent) AS id,
			dependent.object_definition_id AS object_definition_id,
			dependent.object_definition_name AS object_definition_name,
			dependent.current_state AS current_state,
			dependent.data AS data,
			dependent.created_at AS created_at,
			dependent.updated_at AS updated_at,
			dependent.created_by AS created_by
	`,
		instanceID.String(),
	)

	result, err := gl.executeQuery(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze impact: %w", err)
	}

	directDependents, err := gl.parseInstanceResults(result)
	if err != nil {
		return nil, err
	}

	// For now, we'll keep indirect dependents empty
	// In a full implementation, you would recursively find dependents of dependents
	indirectDependents := []InstanceVertex{}

	// Count affected object types
	affectedTypes := make(map[string]int)
	for _, dep := range directDependents {
		affectedTypes[dep.ObjectDefinitionName]++
	}

	analysis := &ImpactAnalysis{
		TargetInstanceID:    instanceID,
		DirectDependents:    directDependents,
		IndirectDependents:  indirectDependents,
		TotalAffectedCount:  len(directDependents) + len(indirectDependents),
		MaxDependencyDepth:  1,
		AffectedObjectTypes: affectedTypes,
	}

	return analysis, nil
}

// parseInstanceResults parses Nebula result set into InstanceVertex slice
func (gl *GraphLayer) parseInstanceResults(result *nebula.ResultSet) ([]InstanceVertex, error) {
	instances := []InstanceVertex{}

	if !result.IsSucceed() || result.IsEmpty() {
		return instances, nil
	}

	// Iterate through rows
	for i := 0; i < result.GetRowSize(); i++ {
		row, err := result.GetRowValuesByIndex(i)
		if err != nil {
			continue
		}

		inst := InstanceVertex{}

		// Parse each column
		for j := 0; j < len(row.GetValues()); j++ {
			val := row.GetValues()[j]
			colName := result.GetColNames()[j]

			switch colName {
			case "id":
				if val.IsString() {
					idStr, _ := val.AsString()
					inst.ID, _ = uuid.Parse(idStr)
				}
			case "object_definition_id":
				if val.IsString() {
					idStr, _ := val.AsString()
					inst.ObjectDefinitionID, _ = uuid.Parse(idStr)
				}
			case "object_definition_name":
				if val.IsString() {
					inst.ObjectDefinitionName, _ = val.AsString()
				}
			case "current_state":
				if val.IsString() {
					inst.CurrentState, _ = val.AsString()
				}
			case "data":
				if val.IsString() {
					dataStr, _ := val.AsString()
					inst.Data = json.RawMessage(dataStr)
				}
			case "created_by":
				if val.IsString() {
					inst.CreatedBy, _ = val.AsString()
				}
			}
		}

		instances = append(instances, inst)
	}

	return instances, nil
}

// parsePathResults parses Nebula path results
func (gl *GraphLayer) parsePathResults(result *nebula.ResultSet) ([]GraphPath, error) {
	paths := []GraphPath{}

	if !result.IsSucceed() || result.IsEmpty() {
		return paths, nil
	}

	// Parse path results
	for i := 0; i < result.GetRowSize(); i++ {
		row, err := result.GetRowValuesByIndex(i)
		if err != nil {
			continue
		}

		// Extract path information
		if len(row.GetValues()) > 0 {
			val := row.GetValues()[0]
			if val.IsPath() {
				pathValue, _ := val.AsPath()

				// Extract node IDs from path
				nodeIDs := []uuid.UUID{}
				for _, seg := range pathValue.GetSegments() {
					// Get start node
					startNode := seg.GetStartNode()
					if startNode != nil {
						vid := startNode.GetID()
						if vid.IsString() {
							idStr, _ := vid.AsString()
							id, _ := uuid.Parse(idStr)
							nodeIDs = append(nodeIDs, id)
						}
					}
				}

				// Add last node
				if len(pathValue.GetSegments()) > 0 {
					lastSeg := pathValue.GetSegments()[len(pathValue.GetSegments())-1]
					endNode := lastSeg.GetEndNode()
					if endNode != nil {
						vid := endNode.GetID()
						if vid.IsString() {
							idStr, _ := vid.AsString()
							id, _ := uuid.Parse(idStr)
							nodeIDs = append(nodeIDs, id)
						}
					}
				}

				paths = append(paths, GraphPath{
					Path:       nodeIDs,
					PathLength: len(nodeIDs),
				})
			}
		}
	}

	return paths, nil
}

// DeleteInstance removes an instance vertex and all its edges
func (gl *GraphLayer) DeleteInstance(instanceID uuid.UUID) error {
	ctx := context.Background()

	// Delete vertex (this also deletes all connected edges)
	query := fmt.Sprintf(`DELETE VERTEX "%s"`, instanceID.String())

	_, err := gl.executeQuery(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to delete instance: %w", err)
	}

	return nil
}

// DeleteObjectDefinition removes an ObjectDefinition vertex
func (gl *GraphLayer) DeleteObjectDefinition(odID uuid.UUID) error {
	ctx := context.Background()

	// Delete vertex
	query := fmt.Sprintf(`DELETE VERTEX "%s"`, odID.String())

	_, err := gl.executeQuery(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to delete object definition: %w", err)
	}

	return nil
}
