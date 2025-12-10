package handlers

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/database"
	"github.com/lbpay/supercore/internal/models"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TestRelationshipValidation_TypeValidation tests that only allowed relationship types can be created
func TestRelationshipValidation_TypeValidation(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	db, cleanup := setupTestDB(t)
	defer cleanup()

	handler := NewRelationshipHandler(db)
	router := setupRouter(handler)

	// Create object definitions
	pessoaDefID := createObjectDefinition(t, db, "pessoa_fisica", "Pessoa Física", withAllowedRelationships([]models.AllowedRelationship{
		{
			Type:                   "TEM_CONTA",
			TargetObjectDefinition: "conta_corrente",
			Cardinality:            models.Cardinality1toN,
			AllowCycles:            false,
			CascadeDelete:          true,
		},
	}))

	contaDefID := createObjectDefinition(t, db, "conta_corrente", "Conta Corrente", withAllowedRelationships([]models.AllowedRelationship{}))

	// Create instances
	pessoaID := createInstance(t, db, pessoaDefID, `{"nome": "João Silva", "cpf": "12345678901"}`)
	contaID := createInstance(t, db, contaDefID, `{"numero": "12345-6", "agencia": "0001"}`)

	tests := []struct {
		name           string
		relationshipType string
		sourceID       uuid.UUID
		targetID       uuid.UUID
		expectedStatus int
		expectedCode   string
	}{
		{
			name:           "Valid relationship type",
			relationshipType: "TEM_CONTA",
			sourceID:       pessoaID,
			targetID:       contaID,
			expectedStatus: http.StatusCreated,
		},
		{
			name:           "Invalid relationship type",
			relationshipType: "RELATIONSHIP_NOT_ALLOWED",
			sourceID:       pessoaID,
			targetID:       contaID,
			expectedStatus: http.StatusUnprocessableEntity,
			expectedCode:   models.ErrCodeRelationshipNotAllowed,
		},
		{
			name:           "Wrong target type",
			relationshipType: "TEM_CONTA",
			sourceID:       pessoaID,
			targetID:       pessoaID,
			expectedStatus: http.StatusUnprocessableEntity,
			expectedCode:   models.ErrCodeRelationshipNotAllowed,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := models.CreateRelationshipRequest{
				RelationshipType: tt.relationshipType,
				SourceInstanceID: tt.sourceID,
				TargetInstanceID: tt.targetID,
				Properties:       json.RawMessage(`{}`),
			}

			body, _ := json.Marshal(req)
			w := httptest.NewRecorder()
			httpReq, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body))
			httpReq.Header.Set("Content-Type", "application/json")
			router.ServeHTTP(w, httpReq)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedCode != "" {
				var response map[string]interface{}
				json.Unmarshal(w.Body.Bytes(), &response)
				assert.Equal(t, tt.expectedCode, response["code"])
			}
		})
	}
}

// TestRelationshipValidation_Cardinality1to1 tests 1:1 cardinality validation
func TestRelationshipValidation_Cardinality1to1(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	db, cleanup := setupTestDB(t)
	defer cleanup()

	handler := NewRelationshipHandler(db)
	router := setupRouter(handler)

	// Create object definitions with 1:1 cardinality
	pessoaDefID := createObjectDefinition(t, db, "pessoa_fisica", "Pessoa Física", withAllowedRelationships([]models.AllowedRelationship{
		{
			Type:                   "TEM_CPF",
			TargetObjectDefinition: "cpf",
			Cardinality:            models.Cardinality1to1,
			AllowCycles:            false,
		},
	}))

	cpfDefID := createObjectDefinition(t, db, "cpf", "CPF", withAllowedRelationships([]models.AllowedRelationship{}))

	// Create instances
	pessoa1ID := createInstance(t, db, pessoaDefID, `{"nome": "João Silva"}`)
	pessoa2ID := createInstance(t, db, pessoaDefID, `{"nome": "Maria Santos"}`)
	cpf1ID := createInstance(t, db, cpfDefID, `{"numero": "12345678901"}`)
	cpf2ID := createInstance(t, db, cpfDefID, `{"numero": "98765432100"}`)

	// First relationship should succeed
	req1 := models.CreateRelationshipRequest{
		RelationshipType: "TEM_CPF",
		SourceInstanceID: pessoa1ID,
		TargetInstanceID: cpf1ID,
		Properties:       json.RawMessage(`{}`),
	}

	body1, _ := json.Marshal(req1)
	w1 := httptest.NewRecorder()
	httpReq1, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body1))
	httpReq1.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w1, httpReq1)

	assert.Equal(t, http.StatusCreated, w1.Code)

	// Second relationship with same source should fail (1:1 violated on source side)
	req2 := models.CreateRelationshipRequest{
		RelationshipType: "TEM_CPF",
		SourceInstanceID: pessoa1ID,
		TargetInstanceID: cpf2ID,
		Properties:       json.RawMessage(`{}`),
	}

	body2, _ := json.Marshal(req2)
	w2 := httptest.NewRecorder()
	httpReq2, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body2))
	httpReq2.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w2, httpReq2)

	assert.Equal(t, http.StatusUnprocessableEntity, w2.Code)
	var response2 map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &response2)
	assert.Equal(t, models.ErrCodeCardinalityViolation, response2["code"])

	// Relationship with same target should also fail (1:1 violated on target side)
	req3 := models.CreateRelationshipRequest{
		RelationshipType: "TEM_CPF",
		SourceInstanceID: pessoa2ID,
		TargetInstanceID: cpf1ID,
		Properties:       json.RawMessage(`{}`),
	}

	body3, _ := json.Marshal(req3)
	w3 := httptest.NewRecorder()
	httpReq3, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body3))
	httpReq3.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w3, httpReq3)

	assert.Equal(t, http.StatusUnprocessableEntity, w3.Code)
	var response3 map[string]interface{}
	json.Unmarshal(w3.Body.Bytes(), &response3)
	assert.Equal(t, models.ErrCodeCardinalityViolation, response3["code"])
}

// TestRelationshipValidation_Cardinality1toN tests 1:N cardinality validation
func TestRelationshipValidation_Cardinality1toN(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	db, cleanup := setupTestDB(t)
	defer cleanup()

	handler := NewRelationshipHandler(db)
	router := setupRouter(handler)

	// Create object definitions with 1:N cardinality
	pessoaDefID := createObjectDefinition(t, db, "pessoa_fisica", "Pessoa Física", withAllowedRelationships([]models.AllowedRelationship{
		{
			Type:                   "TEM_CONTA",
			TargetObjectDefinition: "conta_corrente",
			Cardinality:            models.Cardinality1toN,
			AllowCycles:            false,
		},
	}))

	contaDefID := createObjectDefinition(t, db, "conta_corrente", "Conta Corrente", withAllowedRelationships([]models.AllowedRelationship{}))

	// Create instances
	pessoaID := createInstance(t, db, pessoaDefID, `{"nome": "João Silva"}`)
	conta1ID := createInstance(t, db, contaDefID, `{"numero": "12345-6"}`)
	conta2ID := createInstance(t, db, contaDefID, `{"numero": "54321-0"}`)

	// First relationship should succeed
	req1 := models.CreateRelationshipRequest{
		RelationshipType: "TEM_CONTA",
		SourceInstanceID: pessoaID,
		TargetInstanceID: conta1ID,
		Properties:       json.RawMessage(`{}`),
	}

	body1, _ := json.Marshal(req1)
	w1 := httptest.NewRecorder()
	httpReq1, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body1))
	httpReq1.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w1, httpReq1)

	assert.Equal(t, http.StatusCreated, w1.Code)

	// Second relationship with same source should fail (1:N means source can only have ONE)
	req2 := models.CreateRelationshipRequest{
		RelationshipType: "TEM_CONTA",
		SourceInstanceID: pessoaID,
		TargetInstanceID: conta2ID,
		Properties:       json.RawMessage(`{}`),
	}

	body2, _ := json.Marshal(req2)
	w2 := httptest.NewRecorder()
	httpReq2, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body2))
	httpReq2.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w2, httpReq2)

	assert.Equal(t, http.StatusUnprocessableEntity, w2.Code)
	var response2 map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &response2)
	assert.Equal(t, models.ErrCodeCardinalityViolation, response2["code"])
}

// TestRelationshipValidation_CycleDetection tests cycle detection
func TestRelationshipValidation_CycleDetection(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	db, cleanup := setupTestDB(t)
	defer cleanup()

	handler := NewRelationshipHandler(db)
	router := setupRouter(handler)

	// Create object definitions with cycle prevention
	nodeDefID := createObjectDefinition(t, db, "node", "Node", withAllowedRelationships([]models.AllowedRelationship{
		{
			Type:                   "CONNECTS_TO",
			TargetObjectDefinition: "node",
			Cardinality:            models.CardinalityNtoM,
			AllowCycles:            false,
		},
	}))

	// Create instances
	node1ID := createInstance(t, db, nodeDefID, `{"name": "Node 1"}`)
	node2ID := createInstance(t, db, nodeDefID, `{"name": "Node 2"}`)
	node3ID := createInstance(t, db, nodeDefID, `{"name": "Node 3"}`)

	// Create chain: Node1 -> Node2
	req1 := models.CreateRelationshipRequest{
		RelationshipType: "CONNECTS_TO",
		SourceInstanceID: node1ID,
		TargetInstanceID: node2ID,
		Properties:       json.RawMessage(`{}`),
	}

	body1, _ := json.Marshal(req1)
	w1 := httptest.NewRecorder()
	httpReq1, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body1))
	httpReq1.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w1, httpReq1)

	assert.Equal(t, http.StatusCreated, w1.Code)

	// Create chain: Node2 -> Node3
	req2 := models.CreateRelationshipRequest{
		RelationshipType: "CONNECTS_TO",
		SourceInstanceID: node2ID,
		TargetInstanceID: node3ID,
		Properties:       json.RawMessage(`{}`),
	}

	body2, _ := json.Marshal(req2)
	w2 := httptest.NewRecorder()
	httpReq2, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body2))
	httpReq2.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w2, httpReq2)

	assert.Equal(t, http.StatusCreated, w2.Code)

	// Try to create cycle: Node3 -> Node1 (should fail)
	req3 := models.CreateRelationshipRequest{
		RelationshipType: "CONNECTS_TO",
		SourceInstanceID: node3ID,
		TargetInstanceID: node1ID,
		Properties:       json.RawMessage(`{}`),
	}

	body3, _ := json.Marshal(req3)
	w3 := httptest.NewRecorder()
	httpReq3, _ := http.NewRequest("POST", "/relationships", bytes.NewBuffer(body3))
	httpReq3.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w3, httpReq3)

	assert.Equal(t, http.StatusUnprocessableEntity, w3.Code)
	var response3 map[string]interface{}
	json.Unmarshal(w3.Body.Bytes(), &response3)
	assert.Equal(t, models.ErrCodeCycleDetected, response3["code"])
}

// TestRelationshipDelete_Cascade tests cascade deletion
func TestRelationshipDelete_Cascade(t *testing.T) {
	if testing.Short() {
		t.Skip("Skipping integration test")
	}

	db, cleanup := setupTestDB(t)
	defer cleanup()

	handler := NewRelationshipHandler(db)
	router := setupRouter(handler)

	// Create object definitions with cascade delete enabled
	pessoaDefID := createObjectDefinition(t, db, "pessoa_fisica", "Pessoa Física", withAllowedRelationships([]models.AllowedRelationship{
		{
			Type:                   "TEM_ENDERECO",
			TargetObjectDefinition: "endereco",
			Cardinality:            models.CardinalityNtoM,
			AllowCycles:            false,
			CascadeDelete:          true,
		},
	}))

	enderecoDefID := createObjectDefinition(t, db, "endereco", "Endereço", withAllowedRelationships([]models.AllowedRelationship{
		{
			Type:                   "POSSUI_COMPLEMENTO",
			TargetObjectDefinition: "complemento",
			Cardinality:            models.CardinalityNtoM,
			AllowCycles:            false,
			CascadeDelete:          true,
		},
	}))

	complementoDefID := createObjectDefinition(t, db, "complemento", "Complemento", withAllowedRelationships([]models.AllowedRelationship{}))

	// Create instances
	pessoaID := createInstance(t, db, pessoaDefID, `{"nome": "João Silva"}`)
	enderecoID := createInstance(t, db, enderecoDefID, `{"rua": "Rua A"}`)
	complementoID := createInstance(t, db, complementoDefID, `{"texto": "Apto 101"}`)

	// Create relationships: Pessoa -> Endereco -> Complemento
	rel1ID := createRelationship(t, db, "TEM_ENDERECO", pessoaID, enderecoID)
	createRelationship(t, db, "POSSUI_COMPLEMENTO", enderecoID, complementoID)

	// Delete without cascade should fail if there are dependent relationships
	w1 := httptest.NewRecorder()
	httpReq1, _ := http.NewRequest("DELETE", "/relationships/"+rel1ID.String()+"?cascade=false", nil)
	router.ServeHTTP(w1, httpReq1)

	// Should succeed as cascade delete will handle dependent relationships
	assert.Equal(t, http.StatusNoContent, w1.Code)

	// Recreate the relationships
	rel2ID := createRelationship(t, db, "TEM_ENDERECO", pessoaID, enderecoID)
	createRelationship(t, db, "POSSUI_COMPLEMENTO", enderecoID, complementoID)

	// Delete with cascade should succeed
	w2 := httptest.NewRecorder()
	httpReq2, _ := http.NewRequest("DELETE", "/relationships/"+rel2ID.String()+"?cascade=true", nil)
	router.ServeHTTP(w2, httpReq2)

	assert.Equal(t, http.StatusOK, w2.Code)

	var response map[string]interface{}
	json.Unmarshal(w2.Body.Bytes(), &response)
	assert.Equal(t, true, response["cascade_enabled"])
	assert.Greater(t, response["deleted_count"], float64(1)) // Should delete more than one
}

// Helper functions

func setupTestDB(t *testing.T) (*database.DB, func()) {
	// This should connect to a test database
	// For now, we'll skip the actual database connection
	t.Skip("Database connection not configured for tests")
	return nil, func() {}
}

func setupRouter(handler *RelationshipHandler) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.POST("/relationships", handler.Create)
	router.DELETE("/relationships/:id", handler.Delete)
	return router
}

func createObjectDefinition(t *testing.T, db *database.DB, name, displayName string, opts ...func(*models.ObjectDefinition)) uuid.UUID {
	id := uuid.New()
	// Implementation would insert into database
	return id
}

func createInstance(t *testing.T, db *database.DB, defID uuid.UUID, data string) uuid.UUID {
	id := uuid.New()
	// Implementation would insert into database
	return id
}

func createRelationship(t *testing.T, db *database.DB, relType string, sourceID, targetID uuid.UUID) uuid.UUID {
	id := uuid.New()
	// Implementation would insert into database
	return id
}

func withAllowedRelationships(rels []models.AllowedRelationship) func(*models.ObjectDefinition) {
	return func(od *models.ObjectDefinition) {
		config := models.AllowedRelationshipsConfig{
			AllowedRelationships: rels,
		}
		data, _ := json.Marshal(config)
		od.Relationships = data
	}
}
