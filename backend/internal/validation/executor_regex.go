package validation

import (
	"encoding/json"
	"fmt"
	"regexp"
)

// RegexRuleExecutor executes regex-based validation rules
type RegexRuleExecutor struct{}

// Execute validates data against a regex pattern
func (e *RegexRuleExecutor) Execute(configJSON json.RawMessage, data map[string]interface{}) error {
	var config RegexConfig
	if err := json.Unmarshal(configJSON, &config); err != nil {
		return fmt.Errorf("failed to parse regex config: %w", err)
	}

	// Validate configuration
	if config.Field == "" {
		return fmt.Errorf("regex rule: field name is required")
	}

	if config.Pattern == "" {
		return fmt.Errorf("regex rule: pattern is required")
	}

	// Get field value from data
	fieldValue, exists := data[config.Field]
	if !exists {
		return NewFieldValidationError(config.Field, "field not found in data")
	}

	// Convert to string
	strValue, ok := fieldValue.(string)
	if !ok {
		return NewFieldValidationError(config.Field, "field value must be a string")
	}

	// Compile and match regex
	re, err := regexp.Compile(config.Pattern)
	if err != nil {
		return fmt.Errorf("invalid regex pattern '%s': %w", config.Pattern, err)
	}

	if !re.MatchString(strValue) {
		errMsg := config.ErrorMessage
		if errMsg == "" {
			errMsg = fmt.Sprintf("value '%s' does not match required pattern '%s'", strValue, config.Pattern)
		}
		return NewFieldValidationError(config.Field, errMsg)
	}

	return nil
}
