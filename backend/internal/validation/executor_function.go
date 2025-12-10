package validation

import (
	"context"
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	"github.com/dop251/goja"
)

// FunctionRuleExecutor executes JavaScript-based validation rules using goja
type FunctionRuleExecutor struct{}

// Execute runs JavaScript code to validate data
func (e *FunctionRuleExecutor) Execute(configJSON json.RawMessage, data map[string]interface{}) error {
	var config FunctionConfig
	if err := json.Unmarshal(configJSON, &config); err != nil {
		return fmt.Errorf("failed to parse function config: %w", err)
	}

	// Validate configuration
	if config.Code == "" {
		return fmt.Errorf("function rule: code is required")
	}

	// Set default timeout
	timeout := config.Timeout
	if timeout == 0 {
		timeout = 5000 // 5 seconds default
	}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), time.Duration(timeout)*time.Millisecond)
	defer cancel()

	// Create JavaScript VM
	vm := goja.New()

	// Set up the data object
	if err := vm.Set("data", data); err != nil {
		return fmt.Errorf("failed to set data in VM: %w", err)
	}

	// Set up utility functions
	e.setupUtilityFunctions(vm)

	// Execute code with timeout
	resultChan := make(chan interface{}, 1)
	errorChan := make(chan error, 1)

	go func() {
		defer func() {
			if r := recover(); r != nil {
				errorChan <- fmt.Errorf("panic during script execution: %v", r)
			}
		}()

		result, err := vm.RunString(config.Code)
		if err != nil {
			errorChan <- err
			return
		}

		resultChan <- result.Export()
	}()

	// Wait for result or timeout
	select {
	case <-ctx.Done():
		return fmt.Errorf("function execution timed out after %dms", timeout)
	case err := <-errorChan:
		return fmt.Errorf("script execution error: %w", err)
	case result := <-resultChan:
		return e.handleResult(result, config.ErrorMessage)
	}
}

// setupUtilityFunctions adds utility functions to the JavaScript VM
func (e *FunctionRuleExecutor) setupUtilityFunctions(vm *goja.Runtime) {
	// CPF validation function
	vm.Set("validateCPF", func(cpf string) bool {
		return validateCPF(cpf)
	})

	// CNPJ validation function
	vm.Set("validateCNPJ", func(cnpj string) bool {
		return validateCNPJ(cnpj)
	})

	// Email validation
	vm.Set("validateEmail", func(email string) bool {
		return validateEmail(email)
	})

	// Date utilities
	vm.Set("parseDate", func(dateStr string) time.Time {
		t, _ := time.Parse("2006-01-02", dateStr)
		return t
	})

	vm.Set("now", func() time.Time {
		return time.Now()
	})

	// Logging function (for debugging)
	vm.Set("console", map[string]interface{}{
		"log": func(args ...interface{}) {
			fmt.Println(args...)
		},
	})
}

// handleResult processes the JavaScript execution result
func (e *FunctionRuleExecutor) handleResult(result interface{}, errorMessage string) error {
	// If result is boolean
	if boolResult, ok := result.(bool); ok {
		if !boolResult {
			errMsg := errorMessage
			if errMsg == "" {
				errMsg = "validation function returned false"
			}
			return NewValidationError(errMsg)
		}
		return nil
	}

	// If result is a string, treat as error message
	if strResult, ok := result.(string); ok {
		if strResult != "" {
			return NewValidationError(strResult)
		}
		return nil
	}

	// If result is null/undefined, treat as pass
	if result == nil {
		return nil
	}

	// Any other truthy value passes
	return nil
}

// validateCPF validates Brazilian CPF document number
func validateCPF(cpf string) bool {
	// Remove non-digits
	digits := ""
	for _, r := range cpf {
		if r >= '0' && r <= '9' {
			digits += string(r)
		}
	}

	// CPF must have 11 digits
	if len(digits) != 11 {
		return false
	}

	// Check if all digits are the same (invalid CPF)
	allSame := true
	for i := 1; i < len(digits); i++ {
		if digits[i] != digits[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return false
	}

	// Validate first check digit
	sum := 0
	for i := 0; i < 9; i++ {
		sum += int(digits[i]-'0') * (10 - i)
	}
	firstCheck := (sum * 10) % 11
	if firstCheck == 10 {
		firstCheck = 0
	}
	if firstCheck != int(digits[9]-'0') {
		return false
	}

	// Validate second check digit
	sum = 0
	for i := 0; i < 10; i++ {
		sum += int(digits[i]-'0') * (11 - i)
	}
	secondCheck := (sum * 10) % 11
	if secondCheck == 10 {
		secondCheck = 0
	}
	if secondCheck != int(digits[10]-'0') {
		return false
	}

	return true
}

// validateCNPJ validates Brazilian CNPJ document number
func validateCNPJ(cnpj string) bool {
	// Remove non-digits
	digits := ""
	for _, r := range cnpj {
		if r >= '0' && r <= '9' {
			digits += string(r)
		}
	}

	// CNPJ must have 14 digits
	if len(digits) != 14 {
		return false
	}

	// Check if all digits are the same (invalid CNPJ)
	allSame := true
	for i := 1; i < len(digits); i++ {
		if digits[i] != digits[0] {
			allSame = false
			break
		}
	}
	if allSame {
		return false
	}

	// Validate first check digit
	weights := []int{5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum := 0
	for i := 0; i < 12; i++ {
		sum += int(digits[i]-'0') * weights[i]
	}
	firstCheck := sum % 11
	if firstCheck < 2 {
		firstCheck = 0
	} else {
		firstCheck = 11 - firstCheck
	}
	if firstCheck != int(digits[12]-'0') {
		return false
	}

	// Validate second check digit
	weights = []int{6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2}
	sum = 0
	for i := 0; i < 13; i++ {
		sum += int(digits[i]-'0') * weights[i]
	}
	secondCheck := sum % 11
	if secondCheck < 2 {
		secondCheck = 0
	} else {
		secondCheck = 11 - secondCheck
	}
	if secondCheck != int(digits[13]-'0') {
		return false
	}

	return true
}

// validateEmail performs basic email validation
func validateEmail(email string) bool {
	// Simple email regex
	re := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	matched, _ := regexp.MatchString(re, email)
	return matched
}
