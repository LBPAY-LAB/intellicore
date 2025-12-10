package handlers

import (
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
	"github.com/pashagolub/pgxmock/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestObjectDefinitionHandler_GetRelationshipRules(t *testing.T) {
	tests := []struct {
		name           string
		objectDefID    string
		setupMocks     func(mock pgxmock.PgxPoolIface, id uuid.UUID)
		expectedStatus int
		expectedRules  *models.AllowedRelationshipsConfig
	}{
		{
			name:        "Valid object definition with relationships",
			objectDefID: uuid.New().String(),
			setupMocks: func(mock pgxmock.PgxPoolIface, id uuid.UUID) {
				allowedRels := models.AllowedRelationshipsConfig{
					AllowedRelationships: []models.AllowedRelationship{
						{
							Type:                   "TEM_CONTA",
							TargetObjectDefinition: "conta_corrente",
							Cardinality:            models.Cardinality1toN,
							AllowCycles:            false,
							CascadeDelete:          true,
							Description:            "Cliente pode ter múltiplas contas",
						},
						{
							Type:                   "TEM_ENDERECO",
							TargetObjectDefinition: "endereco",
							Cardinality:            models.CardinalityNtoM,
							AllowCycles:            false,
							CascadeDelete:          false,
							Description:            "Cliente pode ter múltiplos endereços",
						},
					},
				}
				relsJSON, _ := json.Marshal(allowedRels)

				mock.ExpectQuery("SELECT relationships FROM object_definitions").
					WithArgs(id).
					WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))
			},
			expectedStatus: http.StatusOK,
			expectedRules: &models.AllowedRelationshipsConfig{
				AllowedRelationships: []models.AllowedRelationship{
					{
						Type:                   "TEM_CONTA",
						TargetObjectDefinition: "conta_corrente",
						Cardinality:            models.Cardinality1toN,
						AllowCycles:            false,
						CascadeDelete:          true,
						Description:            "Cliente pode ter múltiplas contas",
					},
					{
						Type:                   "TEM_ENDERECO",
						TargetObjectDefinition: "endereco",
						Cardinality:            models.CardinalityNtoM,
						AllowCycles:            false,
						CascadeDelete:          false,
						Description:            "Cliente pode ter múltiplos endereços",
					},
				},
			},
		},
		{
			name:        "Object definition with empty relationships",
			objectDefID: uuid.New().String(),
			setupMocks: func(mock pgxmock.PgxPoolIface, id uuid.UUID) {
				mock.ExpectQuery("SELECT relationships FROM object_definitions").
					WithArgs(id).
					WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(json.RawMessage("null")))
			},
			expectedStatus: http.StatusOK,
			expectedRules: &models.AllowedRelationshipsConfig{
				AllowedRelationships: []models.AllowedRelationship{},
			},
		},
		{
			name:        "Object definition not found",
			objectDefID: uuid.New().String(),
			setupMocks: func(mock pgxmock.PgxPoolIface, id uuid.UUID) {
				mock.ExpectQuery("SELECT relationships FROM object_definitions").
					WithArgs(id).
					WillReturnError(assert.AnError)
			},
			expectedStatus: http.StatusNotFound,
			expectedRules:  nil,
		},
		{
			name:           "Invalid UUID format",
			objectDefID:    "invalid-uuid",
			setupMocks:     func(mock pgxmock.PgxPoolIface, id uuid.UUID) {},
			expectedStatus: http.StatusBadRequest,
			expectedRules:  nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create mock pool
			mock, err := pgxmock.NewPool()
			require.NoError(t, err)
			defer mock.Close()

			// Parse ID for setup
			var id uuid.UUID
			if tt.objectDefID != "invalid-uuid" {
				id = uuid.MustParse(tt.objectDefID)
			}

			// Setup mocks
			tt.setupMocks(mock, id)

			// Create handler with mock database
			db := &database.DB{Pool: mock}
			handler := NewObjectDefinitionHandler(db)

			// Setup Gin router
			gin.SetMode(gin.TestMode)
			router := gin.New()
			router.GET("/object-definitions/:id/relationship-rules", handler.GetRelationshipRules)

			// Create request
			w := httptest.NewRecorder()
			req, _ := http.NewRequest("GET", "/object-definitions/"+tt.objectDefID+"/relationship-rules", nil)
			router.ServeHTTP(w, req)

			// Assert status code
			assert.Equal(t, tt.expectedStatus, w.Code)

			// Assert response body if successful
			if tt.expectedRules != nil {
				var response models.AllowedRelationshipsConfig
				err := json.Unmarshal(w.Body.Bytes(), &response)
				require.NoError(t, err)
				assert.Equal(t, tt.expectedRules.AllowedRelationships, response.AllowedRelationships)
			}

			// Verify all expectations were met
			if tt.objectDefID != "invalid-uuid" {
				require.NoError(t, mock.ExpectationsWereMet())
			}
		})
	}
}

func TestObjectDefinitionHandler_GetRelationshipRules_ComplexScenarios(t *testing.T) {
	t.Run("All cardinality types", func(t *testing.T) {
		mock, err := pgxmock.NewPool()
		require.NoError(t, err)
		defer mock.Close()

		id := uuid.New()
		allowedRels := models.AllowedRelationshipsConfig{
			AllowedRelationships: []models.AllowedRelationship{
				{
					Type:                   "TEM_CPF",
					TargetObjectDefinition: "cpf",
					Cardinality:            models.Cardinality1to1,
					AllowCycles:            false,
					CascadeDelete:          false,
				},
				{
					Type:                   "TEM_CONTA",
					TargetObjectDefinition: "conta_corrente",
					Cardinality:            models.Cardinality1toN,
					AllowCycles:            false,
					CascadeDelete:          true,
				},
				{
					Type:                   "PERTENCE_A_GRUPO",
					TargetObjectDefinition: "grupo",
					Cardinality:            models.CardinalityNto1,
					AllowCycles:            false,
					CascadeDelete:          false,
				},
				{
					Type:                   "TEM_TAG",
					TargetObjectDefinition: "tag",
					Cardinality:            models.CardinalityNtoM,
					AllowCycles:            true,
					CascadeDelete:          false,
				},
			},
		}
		relsJSON, _ := json.Marshal(allowedRels)

		mock.ExpectQuery("SELECT relationships FROM object_definitions").
			WithArgs(id).
			WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))

		db := &database.DB{Pool: mock}
		handler := NewObjectDefinitionHandler(db)

		gin.SetMode(gin.TestMode)
		router := gin.New()
		router.GET("/object-definitions/:id/relationship-rules", handler.GetRelationshipRules)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/object-definitions/"+id.String()+"/relationship-rules", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.AllowedRelationshipsConfig
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		// Verify all 4 cardinality types are present
		assert.Len(t, response.AllowedRelationships, 4)

		// Verify specific relationships
		cardinalityMap := make(map[models.CardinalityType]bool)
		for _, rel := range response.AllowedRelationships {
			cardinalityMap[rel.Cardinality] = true
		}

		assert.True(t, cardinalityMap[models.Cardinality1to1])
		assert.True(t, cardinalityMap[models.Cardinality1toN])
		assert.True(t, cardinalityMap[models.CardinalityNto1])
		assert.True(t, cardinalityMap[models.CardinalityNtoM])

		require.NoError(t, mock.ExpectationsWereMet())
	})

	t.Run("With min/max occurrences", func(t *testing.T) {
		mock, err := pgxmock.NewPool()
		require.NoError(t, err)
		defer mock.Close()

		id := uuid.New()
		minOccurrences := 1
		maxOccurrences := 5
		allowedRels := models.AllowedRelationshipsConfig{
			AllowedRelationships: []models.AllowedRelationship{
				{
					Type:                   "TEM_CONTA",
					TargetObjectDefinition: "conta_corrente",
					Cardinality:            models.Cardinality1toN,
					AllowCycles:            false,
					CascadeDelete:          true,
					IsRequired:             true,
					MinOccurrences:         &minOccurrences,
					MaxOccurrences:         &maxOccurrences,
					Description:            "Cliente deve ter entre 1 e 5 contas",
				},
			},
		}
		relsJSON, _ := json.Marshal(allowedRels)

		mock.ExpectQuery("SELECT relationships FROM object_definitions").
			WithArgs(id).
			WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))

		db := &database.DB{Pool: mock}
		handler := NewObjectDefinitionHandler(db)

		gin.SetMode(gin.TestMode)
		router := gin.New()
		router.GET("/object-definitions/:id/relationship-rules", handler.GetRelationshipRules)

		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/object-definitions/"+id.String()+"/relationship-rules", nil)
		router.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)

		var response models.AllowedRelationshipsConfig
		err = json.Unmarshal(w.Body.Bytes(), &response)
		require.NoError(t, err)

		require.Len(t, response.AllowedRelationships, 1)
		rel := response.AllowedRelationships[0]
		assert.True(t, rel.IsRequired)
		assert.NotNil(t, rel.MinOccurrences)
		assert.Equal(t, 1, *rel.MinOccurrences)
		assert.NotNil(t, rel.MaxOccurrences)
		assert.Equal(t, 5, *rel.MaxOccurrences)

		require.NoError(t, mock.ExpectationsWereMet())
	})
}

// Benchmark tests
func BenchmarkGetRelationshipRules(b *testing.B) {
	mock, err := pgxmock.NewPool()
	if err != nil {
		b.Fatal(err)
	}
	defer mock.Close()

	id := uuid.New()
	allowedRels := models.AllowedRelationshipsConfig{
		AllowedRelationships: []models.AllowedRelationship{
			{
				Type:                   "TEM_CONTA",
				TargetObjectDefinition: "conta_corrente",
				Cardinality:            models.Cardinality1toN,
				AllowCycles:            false,
				CascadeDelete:          true,
			},
		},
	}
	relsJSON, _ := json.Marshal(allowedRels)

	// Setup expectations for all iterations
	for i := 0; i < b.N; i++ {
		mock.ExpectQuery("SELECT relationships FROM object_definitions").
			WithArgs(id).
			WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))
	}

	db := &database.DB{Pool: mock}
	handler := NewObjectDefinitionHandler(db)

	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/object-definitions/:id/relationship-rules", handler.GetRelationshipRules)

	b.ResetTimer()
	for i := 0; i < b.N; i++ {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/object-definitions/"+id.String()+"/relationship-rules", nil)
		router.ServeHTTP(w, req)
	}
}

// Integration test helpers
func setupTestObjectDefinition(t *testing.T, db *database.DB) uuid.UUID {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	allowedRels := models.AllowedRelationshipsConfig{
		AllowedRelationships: []models.AllowedRelationship{
			{
				Type:                   "TEM_CONTA",
				TargetObjectDefinition: "conta_corrente",
				Cardinality:            models.Cardinality1toN,
				AllowCycles:            false,
				CascadeDelete:          true,
			},
		},
	}
	relsJSON, _ := json.Marshal(allowedRels)

	var id uuid.UUID
	err := db.Pool.QueryRow(ctx, `
		INSERT INTO object_definitions (name, display_name, schema, relationships, category)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`, "test_object", "Test Object", json.RawMessage(`{"type":"object"}`), relsJSON, "BUSINESS_ENTITY").Scan(&id)

	require.NoError(t, err)
	return id
}
