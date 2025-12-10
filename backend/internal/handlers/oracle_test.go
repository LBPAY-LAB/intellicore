package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/lbpay/supercore/internal/database"
)

// MockRow implements pgx.Row interface for testing QueryRow operations
type MockRow struct {
	data  json.RawMessage
	err   error
	calls int
}

func (m *MockRow) Scan(dest ...interface{}) error {
	m.calls++
	if m.err != nil {
		return m.err
	}
	if len(dest) > 0 {
		if ptr, ok := dest[0].(*json.RawMessage); ok {
			*ptr = m.data
			return nil
		}
	}
	return nil
}

// MockRows implements pgx.Rows interface for testing Query operations
type MockRows struct {
	data     []json.RawMessage
	err      error
	position int
	closed   bool
}

func (m *MockRows) Close() {
	m.closed = true
}

func (m *MockRows) Err() error {
	return m.err
}

func (m *MockRows) CommandTag() pgconn.CommandTag {
	return pgconn.CommandTag{}
}

func (m *MockRows) FieldDescriptions() []pgconn.FieldDescription {
	return nil
}

func (m *MockRows) Next() bool {
	if m.position >= len(m.data) {
		return false
	}
	m.position++
	return true
}

func (m *MockRows) Scan(dest ...interface{}) error {
	if m.position == 0 || m.position > len(m.data) {
		return errors.New("no data available")
	}
	if len(dest) > 0 {
		if ptr, ok := dest[0].(*json.RawMessage); ok {
			*ptr = m.data[m.position-1]
			return nil
		}
		if ptr, ok := dest[0].(*string); ok {
			*ptr = "Test Integration"
			if len(dest) > 1 {
				if ptr2, ok := dest[1].(*string); ok {
					*ptr2 = "ATIVO"
				}
			}
			return nil
		}
		if ptr, ok := dest[0].(*int); ok {
			*ptr = len(m.data)
			return nil
		}
	}
	return nil
}

func (m *MockRows) Values() ([]interface{}, error) {
	return nil, nil
}

func (m *MockRows) RawValues() [][]byte {
	return nil
}

func (m *MockRows) Conn() *pgx.Conn {
	return nil
}

// MockPool implements a minimal pgxpool.Pool for testing
type MockPool struct {
	queryRowFunc func(ctx context.Context, sql string, args ...interface{}) pgx.Row
	queryFunc    func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error)
}

func (m *MockPool) QueryRow(ctx context.Context, sql string, args ...interface{}) pgx.Row {
	if m.queryRowFunc != nil {
		return m.queryRowFunc(ctx, sql, args...)
	}
	return &MockRow{err: errors.New("not implemented")}
}

func (m *MockPool) Query(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
	if m.queryFunc != nil {
		return m.queryFunc(ctx, sql, args...)
	}
	return nil, errors.New("not implemented")
}

func (m *MockPool) Ping(ctx context.Context) error {
	return nil
}

func (m *MockPool) Close() {}

func (m *MockPool) Acquire(ctx context.Context) (*pgxpool.Conn, error) {
	return nil, errors.New("not implemented")
}

func (m *MockPool) Exec(ctx context.Context, sql string, args ...interface{}) (pgconn.CommandTag, error) {
	return pgconn.CommandTag{}, errors.New("not implemented")
}

func (m *MockPool) Begin(ctx context.Context) (pgx.Tx, error) {
	return nil, errors.New("not implemented")
}

func (m *MockPool) Config() *pgxpool.Config {
	return nil
}

func (m *MockPool) Stat() *pgxpool.Stat {
	return nil
}

// Helper function to create a mock database with custom query handlers
func newMockDB(queryRowFunc func(ctx context.Context, sql string, args ...interface{}) pgx.Row,
	queryFunc func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error)) *database.DB {
	return &database.DB{
		Pool: &MockPool{
			queryRowFunc: queryRowFunc,
			queryFunc:    queryFunc,
		},
	}
}

// setupRouter creates a test Gin router
func setupRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	return gin.New()
}

// TestGetIdentity tests the GetIdentity endpoint
func TestGetIdentity(t *testing.T) {
	tests := []struct {
		name           string
		mockQueryRow   func(ctx context.Context, sql string, args ...interface{}) pgx.Row
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "Success - Returns valid identity",
			mockQueryRow: func(ctx context.Context, sql string, args ...interface{}) pgx.Row {
				identityJSON := json.RawMessage(`{
					"cnpj": "12345678000190",
					"razao_social": "LBPay Instituição de Pagamento S.A.",
					"nome_fantasia": "LBPay",
					"logo_url": "https://lbpay.com.br/logo.png",
					"capital_social": 1000000.00
				}`)
				return &MockRow{data: identityJSON, err: nil}
			},
			expectedStatus: http.StatusOK,
			expectedBody:   "LBPay",
		},
		{
			name: "Error - Identity not found",
			mockQueryRow: func(ctx context.Context, sql string, args ...interface{}) pgx.Row {
				return &MockRow{err: pgx.ErrNoRows}
			},
			expectedStatus: http.StatusNotFound,
			expectedBody:   "não encontrada",
		},
		{
			name: "Error - Invalid JSON in database",
			mockQueryRow: func(ctx context.Context, sql string, args ...interface{}) pgx.Row {
				invalidJSON := json.RawMessage(`{invalid json}`)
				return &MockRow{data: invalidJSON, err: nil}
			},
			expectedStatus: http.StatusInternalServerError,
			expectedBody:   "parsear identidade",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			db := newMockDB(tt.mockQueryRow, nil)
			handler := NewOracleHandler(db)
			router := setupRouter()
			router.GET("/oracle/identity", handler.GetIdentity)

			// Create request
			req, _ := http.NewRequest(http.MethodGet, "/oracle/identity", nil)
			w := httptest.NewRecorder()

			// Execute
			router.ServeHTTP(w, req)

			// Assert
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if tt.expectedBody != "" {
				body := w.Body.String()
				if !containsString(body, tt.expectedBody) {
					t.Errorf("Expected body to contain '%s', got: %s", tt.expectedBody, body)
				}
			}
		})
	}
}

// TestGetLicenses tests the GetLicenses endpoint
func TestGetLicenses(t *testing.T) {
	tests := []struct {
		name           string
		mockQuery      func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error)
		expectedStatus int
		expectedCount  int
		expectError    bool
	}{
		{
			name: "Success - Returns multiple licenses",
			mockQuery: func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
				license1 := json.RawMessage(`{
					"tipo_autorizacao": "Instituição de Pagamento",
					"numero_autorizacao": "IP-2024-001",
					"data_concessao": "2024-01-15",
					"status": "ATIVA"
				}`)
				license2 := json.RawMessage(`{
					"tipo_autorizacao": "Correspondente Bancário",
					"numero_autorizacao": "CB-2024-002",
					"data_concessao": "2024-02-20",
					"status": "ATIVA"
				}`)
				return &MockRows{data: []json.RawMessage{license1, license2}}, nil
			},
			expectedStatus: http.StatusOK,
			expectedCount:  2,
			expectError:    false,
		},
		{
			name: "Success - No licenses found (empty array)",
			mockQuery: func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
				return &MockRows{data: []json.RawMessage{}}, nil
			},
			expectedStatus: http.StatusOK,
			expectedCount:  0,
			expectError:    false,
		},
		{
			name: "Error - Database query failure",
			mockQuery: func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
				return nil, errors.New("database connection failed")
			},
			expectedStatus: http.StatusInternalServerError,
			expectError:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			db := newMockDB(nil, tt.mockQuery)
			handler := NewOracleHandler(db)
			router := setupRouter()
			router.GET("/oracle/licenses", handler.GetLicenses)

			// Create request
			req, _ := http.NewRequest(http.MethodGet, "/oracle/licenses", nil)
			w := httptest.NewRecorder()

			// Execute
			router.ServeHTTP(w, req)

			// Assert
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if !tt.expectError {
				var licenses []OracleLicense
				if err := json.Unmarshal(w.Body.Bytes(), &licenses); err != nil {
					t.Errorf("Failed to parse response: %v", err)
				}
				if len(licenses) != tt.expectedCount {
					t.Errorf("Expected %d licenses, got %d", tt.expectedCount, len(licenses))
				}
			}
		})
	}
}

// TestGetStatus tests the GetStatus endpoint
func TestGetStatus(t *testing.T) {
	tests := []struct {
		name           string
		mockQueryRow   func(ctx context.Context, sql string, args ...interface{}) pgx.Row
		mockQuery      func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error)
		expectedStatus int
		expectError    bool
	}{
		{
			name: "Success - Returns complete status",
			mockQueryRow: func(ctx context.Context, sql string, args ...interface{}) pgx.Row {
				identityJSON := json.RawMessage(`{
					"cnpj": "12345678000190",
					"razao_social": "LBPay Instituição de Pagamento S.A.",
					"nome_fantasia": "LBPay"
				}`)
				return &MockRow{data: identityJSON, err: nil}
			},
			mockQuery: func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
				// Return different data based on query
				if containsString(sql, "licenca_bacen") {
					license1 := json.RawMessage(`{
						"tipo_autorizacao": "Instituição de Pagamento",
						"numero_autorizacao": "IP-2024-001",
						"data_concessao": "2024-01-15",
						"status": "ATIVA"
					}`)
					return &MockRows{data: []json.RawMessage{license1}}, nil
				}
				// Integrations query
				return &MockRows{data: []json.RawMessage{json.RawMessage(`"test"`)}}, nil
			},
			expectedStatus: http.StatusOK,
			expectError:    false,
		},
		{
			name: "Error - Oracle not initialized",
			mockQueryRow: func(ctx context.Context, sql string, args ...interface{}) pgx.Row {
				return &MockRow{err: pgx.ErrNoRows}
			},
			mockQuery: func(ctx context.Context, sql string, args ...interface{}) (pgx.Rows, error) {
				return &MockRows{data: []json.RawMessage{}}, nil
			},
			expectedStatus: http.StatusNotFound,
			expectError:    true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			db := newMockDB(tt.mockQueryRow, tt.mockQuery)
			handler := NewOracleHandler(db)
			router := setupRouter()
			router.GET("/oracle/status", handler.GetStatus)

			// Create request
			req, _ := http.NewRequest(http.MethodGet, "/oracle/status", nil)
			w := httptest.NewRecorder()

			// Execute
			router.ServeHTTP(w, req)

			// Assert
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			if !tt.expectError {
				var status OracleStatus
				if err := json.Unmarshal(w.Body.Bytes(), &status); err != nil {
					t.Errorf("Failed to parse response: %v", err)
				}
				if status.Identidade.NomeFantasia == "" {
					t.Error("Expected non-empty nome_fantasia")
				}
				if status.Consciousness == "" {
					t.Error("Expected non-empty consciousness")
				}
			}
		})
	}
}

// TestWhoAmI tests the WhoAmI endpoint
func TestWhoAmI(t *testing.T) {
	tests := []struct {
		name           string
		mockQueryRow   func(ctx context.Context, sql string, args ...interface{}) pgx.Row
		expectedStatus int
		expectedField  string
		expectValue    string
	}{
		{
			name: "Success - Oracle initialized with licenses",
			mockQueryRow: func(ctx context.Context, sql string, args ...interface{}) pgx.Row {
				// Check if this is the identity query or license count query
				if containsString(sql, "COUNT") {
					// Return license count
					return &MockRow{
						data: json.RawMessage(`2`),
						err:  nil,
					}
				}
				// Return identity
				identityJSON := json.RawMessage(`{
					"cnpj": "12345678000190",
					"razao_social": "LBPay Instituição de Pagamento S.A.",
					"nome_fantasia": "LBPay"
				}`)
				return &MockRow{data: identityJSON, err: nil}
			},
			expectedStatus: http.StatusOK,
			expectedField:  "nome_fantasia",
			expectValue:    "LBPay",
		},
		{
			name: "Success - Oracle not initialized",
			mockQueryRow: func(ctx context.Context, sql string, args ...interface{}) pgx.Row {
				return &MockRow{err: pgx.ErrNoRows}
			},
			expectedStatus: http.StatusOK,
			expectedField:  "consciousness",
			expectValue:    "não sei quem sou",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Setup
			db := newMockDB(tt.mockQueryRow, nil)
			handler := NewOracleHandler(db)
			router := setupRouter()
			router.GET("/oracle/whoami", handler.WhoAmI)

			// Create request
			req, _ := http.NewRequest(http.MethodGet, "/oracle/whoami", nil)
			w := httptest.NewRecorder()

			// Execute
			router.ServeHTTP(w, req)

			// Assert
			if w.Code != tt.expectedStatus {
				t.Errorf("Expected status %d, got %d", tt.expectedStatus, w.Code)
			}

			var response map[string]interface{}
			if err := json.Unmarshal(w.Body.Bytes(), &response); err != nil {
				t.Errorf("Failed to parse response: %v", err)
			}

			if tt.expectedField != "" && tt.expectValue != "" {
				if val, ok := response[tt.expectedField]; ok {
					if valStr, ok := val.(string); ok {
						if !containsString(valStr, tt.expectValue) {
							t.Errorf("Expected field '%s' to contain '%s', got: %s", tt.expectedField, tt.expectValue, valStr)
						}
					}
				} else {
					t.Errorf("Expected field '%s' not found in response", tt.expectedField)
				}
			}
		})
	}
}

// TestHelperFunctions tests the utility functions
func TestFormatCNPJ(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Valid CNPJ",
			input:    "12345678000190",
			expected: "12.345.678/0001-90",
		},
		{
			name:     "Invalid CNPJ length",
			input:    "123456",
			expected: "123456",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatCNPJ(tt.input)
			if result != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestFormatNumber(t *testing.T) {
	tests := []struct {
		name     string
		input    int
		expected string
	}{
		{
			name:     "Number 1",
			input:    1,
			expected: "1",
		},
		{
			name:     "Number 2",
			input:    2,
			expected: "2",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatNumber(tt.input)
			if result != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestFormatLicenses(t *testing.T) {
	tests := []struct {
		name     string
		input    []OracleLicense
		expected string
	}{
		{
			name:     "No licenses",
			input:    []OracleLicense{},
			expected: "nenhuma licença",
		},
		{
			name: "One license",
			input: []OracleLicense{
				{TipoAutorizacao: "Instituição de Pagamento"},
			},
			expected: "licença de Instituição de Pagamento",
		},
		{
			name: "Multiple licenses",
			input: []OracleLicense{
				{TipoAutorizacao: "IP"},
				{TipoAutorizacao: "CB"},
			},
			expected: "2 licenças",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatLicenses(tt.input)
			if result != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestFormatIntegracoes(t *testing.T) {
	tests := []struct {
		name     string
		input    []string
		expected string
	}{
		{
			name:     "No integrations",
			input:    []string{},
			expected: "nenhuma integração externa",
		},
		{
			name:     "One integration",
			input:    []string{"Sistema PIX"},
			expected: "Sistema PIX",
		},
		{
			name:     "Multiple integrations",
			input:    []string{"PIX", "TED"},
			expected: "2 sistemas externos",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatIntegracoes(tt.input)
			if result != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result)
			}
		})
	}
}

// Helper function to check if a string contains a substring (case-insensitive)
func containsString(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 ||
		findSubstring(s, substr))
}

func findSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		match := true
		for j := 0; j < len(substr); j++ {
			if toLower(s[i+j]) != toLower(substr[j]) {
				match = false
				break
			}
		}
		if match {
			return true
		}
	}
	return false
}

func toLower(b byte) byte {
	if b >= 'A' && b <= 'Z' {
		return b + 32
	}
	return b
}
