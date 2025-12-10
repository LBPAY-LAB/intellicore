package models

// CardinalityType represents the cardinality of a relationship
type CardinalityType string

const (
	// Cardinality1to1 means one source can have at most one target
	Cardinality1to1 CardinalityType = "1:1"
	// Cardinality1toN means one source can have multiple targets
	Cardinality1toN CardinalityType = "1:N"
	// CardinalityNto1 means multiple sources can point to one target
	CardinalityNto1 CardinalityType = "N:1"
	// CardinalityNtoM means multiple sources can have multiple targets
	CardinalityNtoM CardinalityType = "N:M"
)

// AllowedRelationship defines the rules for a relationship type
type AllowedRelationship struct {
	Type                    string          `json:"type"`
	TargetObjectDefinition  string          `json:"target_object_definition"`
	Cardinality             CardinalityType `json:"cardinality"`
	AllowCycles             bool            `json:"allow_cycles"`
	CascadeDelete           bool            `json:"cascade_delete"`
	Description             string          `json:"description,omitempty"`
	IsRequired              bool            `json:"is_required,omitempty"`
	MinOccurrences          *int            `json:"min_occurrences,omitempty"`
	MaxOccurrences          *int            `json:"max_occurrences,omitempty"`
}

// AllowedRelationshipsConfig represents the configuration of allowed relationships for an object definition
type AllowedRelationshipsConfig struct {
	AllowedRelationships []AllowedRelationship `json:"allowed_relationships"`
}

// RelationshipValidationError represents a validation error for relationships
type RelationshipValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Code    string `json:"code"`
}

func (e RelationshipValidationError) Error() string {
	return e.Message
}

// Validation error codes
const (
	ErrCodeRelationshipNotAllowed  = "RELATIONSHIP_NOT_ALLOWED"
	ErrCodeCardinalityViolation    = "CARDINALITY_VIOLATION"
	ErrCodeCycleDetected           = "CYCLE_DETECTED"
	ErrCodeInstanceNotFound        = "INSTANCE_NOT_FOUND"
	ErrCodeDefinitionNotFound      = "DEFINITION_NOT_FOUND"
	ErrCodeSelfReference           = "SELF_REFERENCE_NOT_ALLOWED"
	ErrCodeInvalidCardinality      = "INVALID_CARDINALITY"
)
