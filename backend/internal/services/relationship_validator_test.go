package services

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/lbpay/supercore/internal/models"
	"github.com/pashagolub/pgxmock/v3"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRelationshipValidator_ValidateRelationship(t *testing.T) {
	tests := []struct {
		name          string
		setupMocks    func(mock pgxmock.PgxPoolIface)
		request       models.CreateRelationshipRequest
		expectedError string
		expectedCode  string
	}{
		{
			name: "Valid relationship",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				sourceDefID := uuid.New()
				targetDefID := uuid.New()

				// Mock source instance lookup
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(pgxmock.AnyArg()).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(sourceDefID, "pessoa_fisica"))

				// Mock target instance lookup
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(pgxmock.AnyArg()).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(targetDefID, "conta_corrente"))

				// Mock allowed relationships lookup
				allowedRels := models.AllowedRelationshipsConfig{
					AllowedRelationships: []models.AllowedRelationship{
						{
							Type:                   "TEM_CONTA",
							TargetObjectDefinition: "conta_corrente",
							Cardinality:            models.Cardinality1toN,
							AllowCycles:            false,
						},
					},
				}
				relsJSON, _ := json.Marshal(allowedRels)
				mock.ExpectQuery("SELECT relationships FROM object_definitions").
					WithArgs(sourceDefID).
					WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))

				// Mock cardinality check
				mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM relationships").
					WithArgs(pgxmock.AnyArg(), "TEM_CONTA").
					WillReturnRows(pgxmock.NewRows([]string{"count"}).AddRow(0))
			},
			request: models.CreateRelationshipRequest{
				RelationshipType: "TEM_CONTA",
				SourceInstanceID: uuid.New(),
				TargetInstanceID: uuid.New(),
			},
			expectedError: "",
		},
		{
			name: "Source instance not found",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(pgxmock.AnyArg()).
					WillReturnError(assert.AnError)
			},
			request: models.CreateRelationshipRequest{
				RelationshipType: "TEM_CONTA",
				SourceInstanceID: uuid.New(),
				TargetInstanceID: uuid.New(),
			},
			expectedError: "source instance not found",
			expectedCode:  models.ErrCodeInstanceNotFound,
		},
		{
			name: "Self-reference not allowed",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				sourceDefID := uuid.New()

				// Mock source instance lookup
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(pgxmock.AnyArg()).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(sourceDefID, "pessoa_fisica"))

				// Mock target instance lookup (same as source)
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(pgxmock.AnyArg()).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(sourceDefID, "pessoa_fisica"))
			},
			request: func() models.CreateRelationshipRequest {
				id := uuid.New()
				return models.CreateRelationshipRequest{
					RelationshipType: "TEM_CONTA",
					SourceInstanceID: id,
					TargetInstanceID: id,
				}
			}(),
			expectedError: "cannot create relationship to self",
			expectedCode:  models.ErrCodeSelfReference,
		},
		{
			name: "Relationship type not allowed",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				sourceDefID := uuid.New()
				targetDefID := uuid.New()

				// Mock source instance lookup
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(pgxmock.AnyArg()).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(sourceDefID, "pessoa_fisica"))

				// Mock target instance lookup
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(pgxmock.AnyArg()).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(targetDefID, "conta_corrente"))

				// Mock allowed relationships lookup (empty list)
				allowedRels := models.AllowedRelationshipsConfig{
					AllowedRelationships: []models.AllowedRelationship{},
				}
				relsJSON, _ := json.Marshal(allowedRels)
				mock.ExpectQuery("SELECT relationships FROM object_definitions").
					WithArgs(sourceDefID).
					WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))
			},
			request: models.CreateRelationshipRequest{
				RelationshipType: "INVALID_TYPE",
				SourceInstanceID: uuid.New(),
				TargetInstanceID: uuid.New(),
			},
			expectedError: "relationship type 'INVALID_TYPE' to 'conta_corrente' is not allowed",
			expectedCode:  models.ErrCodeRelationshipNotAllowed,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock, err := pgxmock.NewPool()
			require.NoError(t, err)
			defer mock.Close()

			tt.setupMocks(mock)

			validator := NewRelationshipValidator(mock)
			err = validator.ValidateRelationship(context.Background(), tt.request)

			if tt.expectedError != "" {
				require.Error(t, err)
				assert.Contains(t, err.Error(), tt.expectedError)

				if tt.expectedCode != "" {
					var validationErr models.RelationshipValidationError
					require.ErrorAs(t, err, &validationErr)
					assert.Equal(t, tt.expectedCode, validationErr.Code)
				}
			} else {
				require.NoError(t, err)
			}

			require.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestRelationshipValidator_ValidateCardinality(t *testing.T) {
	tests := []struct {
		name          string
		cardinality   models.CardinalityType
		setupMocks    func(mock pgxmock.PgxPoolIface)
		expectedError bool
		expectedCode  string
	}{
		{
			name:        "1:1 - No existing relationships",
			cardinality: models.Cardinality1to1,
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// Check source
				mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM relationships").
					WithArgs(pgxmock.AnyArg(), "TEM_CPF").
					WillReturnRows(pgxmock.NewRows([]string{"count"}).AddRow(0))
				// Check target
				mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM relationships").
					WithArgs(pgxmock.AnyArg(), "TEM_CPF").
					WillReturnRows(pgxmock.NewRows([]string{"count"}).AddRow(0))
			},
			expectedError: false,
		},
		{
			name:        "1:1 - Source already has relationship",
			cardinality: models.Cardinality1to1,
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// Check source (already has one)
				mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM relationships").
					WithArgs(pgxmock.AnyArg(), "TEM_CPF").
					WillReturnRows(pgxmock.NewRows([]string{"count"}).AddRow(1))
			},
			expectedError: true,
			expectedCode:  models.ErrCodeCardinalityViolation,
		},
		{
			name:        "1:N - Source already has relationship",
			cardinality: models.Cardinality1toN,
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// Check source (already has one)
				mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM relationships").
					WithArgs(pgxmock.AnyArg(), "TEM_CONTA").
					WillReturnRows(pgxmock.NewRows([]string{"count"}).AddRow(1))
			},
			expectedError: true,
			expectedCode:  models.ErrCodeCardinalityViolation,
		},
		{
			name:        "N:1 - Target already has relationship",
			cardinality: models.CardinalityNto1,
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// Check target (already has one)
				mock.ExpectQuery("SELECT COUNT\\(\\*\\) FROM relationships").
					WithArgs(pgxmock.AnyArg(), "PERTENCE_A").
					WillReturnRows(pgxmock.NewRows([]string{"count"}).AddRow(1))
			},
			expectedError: true,
			expectedCode:  models.ErrCodeCardinalityViolation,
		},
		{
			name:        "N:M - Always valid",
			cardinality: models.CardinalityNtoM,
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// N:M doesn't require any checks
			},
			expectedError: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock, err := pgxmock.NewPool()
			require.NoError(t, err)
			defer mock.Close()

			tt.setupMocks(mock)

			validator := NewRelationshipValidator(mock)
			allowedRel := &models.AllowedRelationship{
				Type:                   "TEST_REL",
				TargetObjectDefinition: "target",
				Cardinality:            tt.cardinality,
			}

			req := models.CreateRelationshipRequest{
				RelationshipType: "TEST_REL",
				SourceInstanceID: uuid.New(),
				TargetInstanceID: uuid.New(),
			}

			err = validator.validateCardinality(context.Background(), req, allowedRel)

			if tt.expectedError {
				require.Error(t, err)
				if tt.expectedCode != "" {
					var validationErr models.RelationshipValidationError
					require.ErrorAs(t, err, &validationErr)
					assert.Equal(t, tt.expectedCode, validationErr.Code)
				}
			} else {
				require.NoError(t, err)
			}

			require.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestRelationshipValidator_DetectCycle(t *testing.T) {
	tests := []struct {
		name          string
		setupMocks    func(mock pgxmock.PgxPoolIface)
		sourceID      uuid.UUID
		targetID      uuid.UUID
		expectedCycle bool
	}{
		{
			name: "No cycle - linear path",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// Target has no outgoing relationships
				mock.ExpectQuery("SELECT target_instance_id FROM relationships").
					WithArgs(pgxmock.AnyArg(), "CONNECTS_TO").
					WillReturnRows(pgxmock.NewRows([]string{"target_instance_id"}))
			},
			sourceID:      uuid.New(),
			targetID:      uuid.New(),
			expectedCycle: false,
		},
		{
			name: "Cycle detected - direct",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				sourceID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
				targetID := uuid.MustParse("00000000-0000-0000-0000-000000000002")

				// Target points back to source
				mock.ExpectQuery("SELECT target_instance_id FROM relationships").
					WithArgs(targetID, "CONNECTS_TO").
					WillReturnRows(pgxmock.NewRows([]string{"target_instance_id"}).AddRow(sourceID))
			},
			sourceID:      uuid.MustParse("00000000-0000-0000-0000-000000000001"),
			targetID:      uuid.MustParse("00000000-0000-0000-0000-000000000002"),
			expectedCycle: true,
		},
		{
			name: "Cycle detected - indirect (A -> B -> C -> A)",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				sourceID := uuid.MustParse("00000000-0000-0000-0000-000000000001")
				targetID := uuid.MustParse("00000000-0000-0000-0000-000000000002")
				intermediateID := uuid.MustParse("00000000-0000-0000-0000-000000000003")

				// Target (B) points to intermediate (C)
				mock.ExpectQuery("SELECT target_instance_id FROM relationships").
					WithArgs(targetID, "CONNECTS_TO").
					WillReturnRows(pgxmock.NewRows([]string{"target_instance_id"}).AddRow(intermediateID))

				// Intermediate (C) points back to source (A)
				mock.ExpectQuery("SELECT target_instance_id FROM relationships").
					WithArgs(intermediateID, "CONNECTS_TO").
					WillReturnRows(pgxmock.NewRows([]string{"target_instance_id"}).AddRow(sourceID))
			},
			sourceID:      uuid.MustParse("00000000-0000-0000-0000-000000000001"),
			targetID:      uuid.MustParse("00000000-0000-0000-0000-000000000002"),
			expectedCycle: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock, err := pgxmock.NewPool()
			require.NoError(t, err)
			defer mock.Close()

			tt.setupMocks(mock)

			validator := NewRelationshipValidator(mock)
			err = validator.detectCycle(context.Background(), tt.sourceID, tt.targetID, "CONNECTS_TO")

			if tt.expectedCycle {
				require.Error(t, err)
				var validationErr models.RelationshipValidationError
				require.ErrorAs(t, err, &validationErr)
				assert.Equal(t, models.ErrCodeCycleDetected, validationErr.Code)
			} else {
				require.NoError(t, err)
			}

			require.NoError(t, mock.ExpectationsWereMet())
		})
	}
}

func TestRelationshipValidator_GetCascadeDeleteIDs(t *testing.T) {
	relationshipID := uuid.New()
	sourceID := uuid.New()
	targetID := uuid.New()
	sourceDefID := uuid.New()
	dependentID1 := uuid.New()
	dependentID2 := uuid.New()

	tests := []struct {
		name           string
		setupMocks     func(mock pgxmock.PgxPoolIface)
		expectedIDs    []uuid.UUID
		expectedError  bool
		cascadeEnabled bool
	}{
		{
			name: "Cascade enabled with dependents",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// Get relationship details
				mock.ExpectQuery("SELECT source_instance_id, target_instance_id, relationship_type").
					WithArgs(relationshipID).
					WillReturnRows(pgxmock.NewRows([]string{"source_instance_id", "target_instance_id", "relationship_type"}).
						AddRow(sourceID, targetID, "TEM_CONTA"))

				// Get source definition
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(sourceID).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(sourceDefID, "pessoa_fisica"))

				// Get allowed relationships (with cascade enabled)
				allowedRels := models.AllowedRelationshipsConfig{
					AllowedRelationships: []models.AllowedRelationship{
						{
							Type:                   "TEM_CONTA",
							TargetObjectDefinition: "conta_corrente",
							Cardinality:            models.Cardinality1toN,
							CascadeDelete:          true,
						},
					},
				}
				relsJSON, _ := json.Marshal(allowedRels)
				mock.ExpectQuery("SELECT relationships FROM object_definitions").
					WithArgs(sourceDefID).
					WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))

				// Get dependent relationships
				mock.ExpectQuery("SELECT id FROM relationships").
					WithArgs(targetID).
					WillReturnRows(pgxmock.NewRows([]string{"id"}).
						AddRow(dependentID1).
						AddRow(dependentID2))
			},
			expectedIDs:    []uuid.UUID{dependentID1, dependentID2},
			expectedError:  false,
			cascadeEnabled: true,
		},
		{
			name: "Cascade disabled",
			setupMocks: func(mock pgxmock.PgxPoolIface) {
				// Get relationship details
				mock.ExpectQuery("SELECT source_instance_id, target_instance_id, relationship_type").
					WithArgs(relationshipID).
					WillReturnRows(pgxmock.NewRows([]string{"source_instance_id", "target_instance_id", "relationship_type"}).
						AddRow(sourceID, targetID, "TEM_CONTA"))

				// Get source definition
				mock.ExpectQuery("SELECT i.object_definition_id, od.name").
					WithArgs(sourceID).
					WillReturnRows(pgxmock.NewRows([]string{"object_definition_id", "name"}).
						AddRow(sourceDefID, "pessoa_fisica"))

				// Get allowed relationships (cascade disabled)
				allowedRels := models.AllowedRelationshipsConfig{
					AllowedRelationships: []models.AllowedRelationship{
						{
							Type:                   "TEM_CONTA",
							TargetObjectDefinition: "conta_corrente",
							Cardinality:            models.Cardinality1toN,
							CascadeDelete:          false,
						},
					},
				}
				relsJSON, _ := json.Marshal(allowedRels)
				mock.ExpectQuery("SELECT relationships FROM object_definitions").
					WithArgs(sourceDefID).
					WillReturnRows(pgxmock.NewRows([]string{"relationships"}).AddRow(relsJSON))
			},
			expectedIDs:    []uuid.UUID{},
			expectedError:  false,
			cascadeEnabled: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock, err := pgxmock.NewPool()
			require.NoError(t, err)
			defer mock.Close()

			tt.setupMocks(mock)

			validator := NewRelationshipValidator(mock)
			ids, err := validator.GetCascadeDeleteIDs(context.Background(), relationshipID)

			if tt.expectedError {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
				assert.ElementsMatch(t, tt.expectedIDs, ids)
			}

			require.NoError(t, mock.ExpectationsWereMet())
		})
	}
}
