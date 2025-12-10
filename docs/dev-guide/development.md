# SuperCore Development Guide

Guide for developers working on SuperCore.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Database Development](#database-development)
- [API Development](#api-development)
- [Best Practices](#best-practices)

---

## Development Environment Setup

### Prerequisites

- Go 1.23+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Git
- Your favorite IDE (VS Code, GoLand, etc.)
- OpenAI or Claude API key

### Local Setup (macOS/Linux)

```bash
# 1. Clone repository
git clone <repository-url>
cd supercore

# 2. Install Go dependencies
cd backend
go mod download

# 3. Setup environment
cd ..
cp .env.example .env
# Edit .env with your API keys

# 4. Start database only
docker-compose up -d postgres

# Wait for database to be ready
docker-compose logs postgres | grep "database system is ready"

# 5. Run migrations
psql -h localhost -U supercore -d supercore < database/migrations/001_initial_schema.sql
psql -h localhost -U supercore -d supercore < database/seeds/002_validation_rules_seed.sql
psql -h localhost -U supercore -d supercore < database/seeds/003_oraculo_seed.sql

# 6. Run backend locally
cd backend
go run cmd/api/main.go

# 7. Test
curl http://localhost:8080/health
```

### VS Code Setup

Install recommended extensions:
```json
{
  "recommendations": [
    "golang.go",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "davidanson.vscode-markdownlint",
    "esbenp.prettier-vscode"
  ]
}
```

Create `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Backend",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}/backend/cmd/api",
      "env": {
        "DATABASE_URL": "postgres://supercore:supercore_dev_2024@localhost:5432/supercore?sslmode=disable",
        "PORT": "8080",
        "GIN_MODE": "debug"
      },
      "args": []
    }
  ]
}
```

### Hot Reload with Air

```bash
# Install Air
go install github.com/cosmtrek/air@latest

# Run with hot reload
cd backend
air

# Air watches for file changes and automatically rebuilds
```

Create `.air.toml`:
```toml
root = "."
testdata_dir = "testdata"
tmp_dir = "tmp"

[build]
  args_bin = []
  bin = "./tmp/main"
  cmd = "go build -o ./tmp/main ./cmd/api"
  delay = 1000
  exclude_dir = ["assets", "tmp", "vendor", "testdata"]
  exclude_file = []
  exclude_regex = ["_test.go"]
  exclude_unchanged = false
  follow_symlink = false
  full_bin = ""
  include_dir = []
  include_ext = ["go", "tpl", "tmpl", "html"]
  kill_delay = "0s"
  log = "build-errors.log"
  poll = false
  poll_interval = 0
  rerun = false
  rerun_delay = 500
  send_interrupt = false
  stop_on_error = false

[color]
  app = ""
  build = "yellow"
  main = "magenta"
  runner = "green"
  watcher = "cyan"

[log]
  main_only = false
  time = false

[misc]
  clean_on_exit = false

[screen]
  clear_on_rebuild = false
  keep_scroll = true
```

---

## Project Structure

```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Application entry point
├── internal/
│   ├── config/                  # Configuration management
│   │   └── llm_config.go
│   ├── database/                # Database connection pool
│   │   └── db.go
│   ├── handlers/                # HTTP request handlers
│   │   ├── oracle.go            # Oracle consciousness API
│   │   ├── object_definition.go # CRUD for object definitions
│   │   ├── instance.go          # CRUD for instances
│   │   ├── relationship.go      # CRUD for relationships
│   │   ├── validation_rule.go   # CRUD for validation rules
│   │   ├── nl_assistant.go      # Natural language assistant
│   │   └── search_handler.go    # Semantic search
│   ├── middleware/              # HTTP middleware
│   │   └── middleware.go
│   ├── models/                  # Data models
│   │   ├── object_definition.go
│   │   ├── instance.go
│   │   ├── relationship.go
│   │   └── validation_rule.go
│   ├── services/                # Business logic
│   │   ├── statemachine/        # FSM engine
│   │   ├── validator/           # Validation engine
│   │   ├── llm/                 # LLM client (OpenAI/Claude)
│   │   ├── embeddings/          # Embedding service
│   │   └── rag/                 # RAG orchestrator
│   ├── validation/              # Validation rule executors
│   │   ├── executor_regex.go
│   │   ├── executor_function.go
│   │   └── executor_api_call.go
│   └── rag/                     # RAG implementation
│       ├── sql_query_builder.go
│       ├── entity_extractor.go
│       └── sql_service.go
├── go.mod
├── go.sum
└── Dockerfile
```

### Adding New Features

#### 1. Add New Handler

```go
// internal/handlers/my_feature.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

type MyFeatureHandler struct {
    db *database.DB
}

func NewMyFeatureHandler(db *database.DB) *MyFeatureHandler {
    return &MyFeatureHandler{db: db}
}

func (h *MyFeatureHandler) GetSomething(c *gin.Context) {
    // Implementation
    c.JSON(http.StatusOK, gin.H{
        "message": "success",
    })
}
```

#### 2. Register Routes

```go
// cmd/api/main.go
v1 := router.Group("/api/v1")
{
    // Add your routes
    myFeatureHandler := handlers.NewMyFeatureHandler(db)
    v1.GET("/my-feature", myFeatureHandler.GetSomething)
}
```

#### 3. Add Tests

```go
// internal/handlers/my_feature_test.go
package handlers

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestGetSomething(t *testing.T) {
    // Setup
    handler := NewMyFeatureHandler(nil)

    // Test
    // ...

    // Assert
    assert.NotNil(t, handler)
}
```

---

## Development Workflow

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-new-feature

# 2. Make changes

# 3. Run tests
go test ./...

# 4. Run linter
golangci-lint run ./...

# 5. Commit (follow conventional commits)
git commit -m "feat: add new feature XYZ"

# 6. Push
git push origin feature/my-new-feature

# 7. Create Pull Request

# 8. Wait for CI to pass and review

# 9. Merge to main
```

### Conventional Commits

Format: `<type>(<scope>): <description>`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/config changes

Examples:
```bash
git commit -m "feat(api): add semantic search endpoint"
git commit -m "fix(validation): correct CPF validation logic"
git commit -m "docs(api): update API documentation"
git commit -m "test(handlers): add tests for instance handler"
```

---

## Code Standards

### Go Code Style

Follow [Effective Go](https://golang.org/doc/effective_go.html) and [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments).

```go
// ✅ GOOD: Clear, concise, follows conventions
func (h *InstanceHandler) Create(c *gin.Context) {
    var req CreateInstanceRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    instance, err := h.service.CreateInstance(c.Request.Context(), req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, instance)
}

// ❌ BAD: No error handling, unclear naming
func (h *InstanceHandler) Create(c *gin.Context) {
    var r CreateInstanceRequest
    c.ShouldBindJSON(&r)
    i, _ := h.service.CreateInstance(c.Request.Context(), r)
    c.JSON(201, i)
}
```

### Error Handling

```go
// ✅ GOOD: Wrap errors with context
if err != nil {
    return fmt.Errorf("failed to create instance: %w", err)
}

// ❌ BAD: Swallow errors
if err != nil {
    return nil
}
```

### Naming Conventions

```go
// Variables: camelCase
var userCount int
var objectDefinition ObjectDefinition

// Constants: PascalCase or UPPER_CASE
const MaxRetries = 3
const DEFAULT_TIMEOUT = 30

// Private methods: camelCase
func (h *Handler) validateInput() error {}

// Public methods: PascalCase
func (h *Handler) Create() error {}

// Interfaces: -er suffix
type Validator interface {
    Validate() error
}
```

---

## Testing

### Run Tests

```bash
# Run all tests
go test ./...

# Run with coverage
go test -v -race -covermode=atomic -coverprofile=coverage.out ./...
go tool cover -html=coverage.out

# Run specific package
go test ./internal/handlers

# Run specific test
go test -run TestCreateInstance ./internal/handlers
```

### Writing Tests

```go
// internal/handlers/instance_test.go
package handlers

import (
    "bytes"
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"

    "github.com/gin-gonic/gin"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
)

// Mock database
type MockDB struct {
    mock.Mock
}

func TestInstanceHandler_Create(t *testing.T) {
    // Setup
    gin.SetMode(gin.TestMode)
    mockDB := new(MockDB)
    handler := NewInstanceHandler(mockDB)

    // Test data
    reqBody := map[string]interface{}{
        "object_definition_id": "uuid",
        "data": map[string]interface{}{
            "name": "Test",
        },
    }
    body, _ := json.Marshal(reqBody)

    // Create request
    w := httptest.NewRecorder()
    c, _ := gin.CreateTestContext(w)
    c.Request = httptest.NewRequest("POST", "/instances", bytes.NewBuffer(body))
    c.Request.Header.Set("Content-Type", "application/json")

    // Execute
    handler.Create(c)

    // Assert
    assert.Equal(t, http.StatusCreated, w.Code)
}
```

### Integration Tests

```go
// internal/handlers/integration_test.go
// +build integration

package handlers

import (
    "testing"
    "github.com/stretchr/testify/suite"
)

type IntegrationTestSuite struct {
    suite.Suite
    db *database.DB
}

func (suite *IntegrationTestSuite) SetupTest() {
    // Setup database connection
    suite.db, _ = database.NewDB(os.Getenv("TEST_DATABASE_URL"))
}

func (suite *IntegrationTestSuite) TestFullWorkflow() {
    // Test complete workflow
}

func TestIntegrationTestSuite(t *testing.T) {
    suite.Run(t, new(IntegrationTestSuite))
}
```

Run integration tests:
```bash
go test -tags=integration ./...
```

---

## Debugging

### Using Delve Debugger

```bash
# Install Delve
go install github.com/go-delve/delve/cmd/dlv@latest

# Run with debugger
dlv debug ./cmd/api

# Set breakpoint
(dlv) break internal/handlers/instance.go:42

# Continue execution
(dlv) continue

# Inspect variables
(dlv) print myVariable

# Step through code
(dlv) next
(dlv) step
```

### Logging

```go
// Use structured logging
log.Printf("[INFO] Creating instance: id=%s, type=%s", id, objType)
log.Printf("[ERROR] Failed to create instance: %v", err)

// In production, use proper logger (e.g., zap, logrus)
import "go.uber.org/zap"

logger, _ := zap.NewProduction()
defer logger.Sync()

logger.Info("Creating instance",
    zap.String("id", id),
    zap.String("type", objType),
)
```

---

## Database Development

### Creating Migrations

```sql
-- database/migrations/002_add_new_table.sql
BEGIN;

CREATE TABLE IF NOT EXISTS my_new_table (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

COMMIT;
```

### Running Migrations

```bash
# Manual
psql -h localhost -U supercore -d supercore < database/migrations/002_add_new_table.sql

# Or use migration tool (future improvement)
```

### Querying Database

```go
// internal/handlers/example.go
func (h *Handler) GetSomething(c *gin.Context) {
    rows, err := h.db.Query(c.Request.Context(), `
        SELECT id, name FROM my_table
        WHERE status = $1
        ORDER BY created_at DESC
        LIMIT $2
    `, "active", 10)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    defer rows.Close()

    // Process rows
    var results []MyType
    for rows.Next() {
        var item MyType
        if err := rows.Scan(&item.ID, &item.Name); err != nil {
            continue
        }
        results = append(results, item)
    }

    c.JSON(http.StatusOK, results)
}
```

---

## Best Practices

### 1. Always Use Context

```go
// ✅ GOOD: Pass context
func (s *Service) DoSomething(ctx context.Context) error {
    rows, err := s.db.Query(ctx, "SELECT ...")
    return err
}

// ❌ BAD: No context
func (s *Service) DoSomething() error {
    rows, err := s.db.Query("SELECT ...")
    return err
}
```

### 2. Handle Errors Properly

```go
// ✅ GOOD: Return errors, don't panic
if err != nil {
    return fmt.Errorf("failed to create instance: %w", err)
}

// ❌ BAD: Panic in library code
if err != nil {
    panic(err)
}
```

### 3. Use Dependency Injection

```go
// ✅ GOOD: Inject dependencies
type Handler struct {
    db      *database.DB
    logger  *zap.Logger
    service ServiceInterface
}

func NewHandler(db *database.DB, logger *zap.Logger, svc ServiceInterface) *Handler {
    return &Handler{
        db:      db,
        logger:  logger,
        service: svc,
    }
}

// ❌ BAD: Global variables
var globalDB *database.DB
```

### 4. Write Tests First (TDD)

```go
// 1. Write test
func TestCreateInstance(t *testing.T) {
    // Given
    // When
    // Then
}

// 2. Run test (it fails)
go test

// 3. Write code to make test pass
func CreateInstance() {}

// 4. Run test (it passes)
go test

// 5. Refactor
```

---

## Useful Commands

```bash
# Format code
go fmt ./...

# Vet code
go vet ./...

# Run linter
golangci-lint run ./...

# Update dependencies
go get -u ./...
go mod tidy

# Build
go build -v ./cmd/api

# Run
go run ./cmd/api

# Test
go test ./...

# Test with coverage
go test -cover ./...

# Benchmark
go test -bench=. ./...

# Profile
go test -cpuprofile=cpu.prof -memprofile=mem.prof ./...
go tool pprof cpu.prof
```

---

## Resources

- [Effective Go](https://golang.org/doc/effective_go.html)
- [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments)
- [Gin Documentation](https://gin-gonic.com/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Last Updated**: 2024-12-10
