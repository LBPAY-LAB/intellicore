# Contributing to SuperCore

Thank you for considering contributing to SuperCore! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards

**Examples of behavior that contributes to a positive environment:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Examples of unacceptable behavior:**
- Use of sexualized language or imagery
- Trolling, insulting, or derogatory comments
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:

1. **Go 1.23+** installed
2. **Docker & Docker Compose** for local development
3. **Git** configured with your name and email
4. **GitHub account** with SSH keys set up
5. Read the [Development Guide](Docs/dev-guide/development.md)

### Fork and Clone

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone git@github.com:YOUR-USERNAME/supercore.git
cd supercore

# 3. Add upstream remote
git remote add upstream git@github.com:lbpay/supercore.git

# 4. Verify remotes
git remote -v
```

### Setup Development Environment

```bash
# 1. Install dependencies
cd backend
go mod download

# 2. Setup environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start PostgreSQL
docker-compose up -d postgres

# 4. Run migrations
psql -h localhost -U supercore -d supercore < database/migrations/001_initial_schema.sql

# 5. Run backend
go run cmd/api/main.go

# 6. Verify
curl http://localhost:8080/health
```

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When submitting a bug report, include:**
- **Clear, descriptive title**
- **Exact steps to reproduce** the problem
- **Expected behavior** and **actual behavior**
- **Screenshots** if applicable
- **Environment details**:
  - OS (macOS, Linux, Windows)
  - Go version (`go version`)
  - Docker version (`docker --version`)
  - SuperCore version (`git describe --tags`)
- **Log output** (use code blocks)

**Example Bug Report:**

```markdown
**Title**: Instance creation fails with CPF validation error

**Description**:
When creating an instance with a valid CPF, the API returns validation error.

**Steps to Reproduce**:
1. POST to /api/v1/instances
2. Include valid CPF: "12345678901"
3. Observe error response

**Expected Behavior**:
Instance should be created successfully

**Actual Behavior**:
Returns 400: "CPF validation failed"

**Environment**:
- macOS 14.0
- Go 1.23
- Docker 24.0.6
- SuperCore v1.0.0

**Logs**:
\`\`\`
2024-12-10T10:00:00Z [ERROR] Validation failed: cpf_validation
\`\`\`
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:

- **Use case**: Describe the problem you're trying to solve
- **Proposed solution**: Your idea for solving it
- **Alternatives considered**: Other approaches you've thought about
- **Additional context**: Screenshots, mockups, code examples

### Pull Requests

We actively welcome pull requests for:

- Bug fixes
- New features
- Documentation improvements
- Test coverage improvements
- Performance optimizations
- Code refactoring

---

## Development Process

### 1. Choose an Issue

- Check [Issues](https://github.com/lbpay/supercore/issues)
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to claim it
- Wait for maintainer approval before starting

### 2. Create a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/issue-123-add-new-feature

# Branch naming conventions:
# - feature/issue-XXX-description
# - fix/issue-XXX-description
# - docs/issue-XXX-description
# - refactor/issue-XXX-description
```

### 3. Make Changes

- Follow [Coding Standards](#coding-standards)
- Write tests for new code
- Update documentation if needed
- Keep commits atomic and focused

### 4. Test Your Changes

```bash
# Run tests
go test ./...

# Run with coverage
go test -v -race -covermode=atomic -coverprofile=coverage.out ./...

# Run linter
golangci-lint run ./...

# Format code
go fmt ./...
go vet ./...
```

### 5. Commit Changes

```bash
# Stage changes
git add .

# Commit with meaningful message (see Commit Guidelines)
git commit -m "feat(api): add semantic search endpoint"

# Push to your fork
git push origin feature/issue-123-add-new-feature
```

---

## Pull Request Process

### Before Submitting

- ✅ All tests pass locally
- ✅ Linter passes without errors
- ✅ Code is formatted (`go fmt`)
- ✅ Documentation is updated
- ✅ Commit messages follow conventions
- ✅ Branch is up-to-date with main

### Creating Pull Request

1. **Push your branch** to your fork
2. **Open Pull Request** on GitHub
3. **Fill out the PR template** completely
4. **Link related issue** (e.g., "Closes #123")
5. **Request review** from maintainers

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Refactoring

## Issue
Closes #123

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)
```

### Review Process

1. **Automated Checks**: CI/CD runs tests, linters, builds
2. **Code Review**: Maintainer reviews your code
3. **Feedback**: Address review comments
4. **Approval**: Maintainer approves PR
5. **Merge**: Maintainer merges to main

### After Merge

```bash
# Sync your fork
git checkout main
git pull upstream main
git push origin main

# Delete feature branch
git branch -d feature/issue-123-add-new-feature
git push origin --delete feature/issue-123-add-new-feature
```

---

## Coding Standards

### Go Style

Follow [Effective Go](https://golang.org/doc/effective_go.html) and [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments).

**Key Points:**

```go
// ✅ GOOD
func (h *Handler) Create(c *gin.Context) {
    var req CreateRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    // ... implementation
}

// ❌ BAD
func (h *Handler) Create(c *gin.Context) {
    var req CreateRequest
    c.ShouldBindJSON(&req) // No error handling
    // ... implementation
}
```

### Error Handling

```go
// ✅ GOOD: Wrap errors with context
if err != nil {
    return fmt.Errorf("failed to create instance: %w", err)
}

// ❌ BAD: Swallow or ignore errors
if err != nil {
    log.Println(err)
}
```

### Naming

```go
// Variables and functions: camelCase
var userCount int
func calculateTotal() int {}

// Exported functions: PascalCase
func CreateInstance() error {}

// Constants: PascalCase or UPPER_CASE
const MaxRetries = 3
const DEFAULT_TIMEOUT = 30

// Interfaces: -er suffix
type Validator interface {
    Validate() error
}
```

---

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build/config changes

### Scopes

- `api`: API changes
- `db`: Database changes
- `ui`: UI changes
- `docs`: Documentation
- `ci`: CI/CD changes

### Examples

```bash
# Feature
git commit -m "feat(api): add semantic search endpoint"

# Bug fix
git commit -m "fix(validation): correct CPF validation logic"

# Documentation
git commit -m "docs(api): update API documentation"

# With body
git commit -m "feat(api): add semantic search endpoint

Adds new /search/semantic endpoint that uses pgvector
for similarity search across object definitions and instances.

Closes #123"
```

### Rules

- Use imperative mood ("add" not "adds" or "added")
- First line max 72 characters
- Capitalize first letter
- No period at the end
- Separate subject from body with blank line
- Reference issues in footer

---

## Testing Guidelines

### Test Coverage

- **Aim for >80% coverage** for new code
- **Write tests before code** (TDD preferred)
- **Test both happy path and error cases**

### Test Structure

```go
func TestFeatureName(t *testing.T) {
    // Given (Setup)
    mockDB := setupMockDB()
    handler := NewHandler(mockDB)

    // When (Execute)
    result, err := handler.DoSomething()

    // Then (Assert)
    assert.NoError(t, err)
    assert.NotNil(t, result)
    assert.Equal(t, expected, result)
}
```

### Test Types

**Unit Tests** - Test individual functions
```go
func TestValidateCPF(t *testing.T) {
    valid := validateCPF("12345678901")
    assert.True(t, valid)
}
```

**Integration Tests** - Test multiple components
```go
// +build integration

func TestCreateInstanceFlow(t *testing.T) {
    // Test full workflow
}
```

**End-to-End Tests** - Test complete API flows
```bash
# Run E2E tests
npm run test:e2e  # (future)
```

---

## Documentation

### When to Update Documentation

Update documentation when:
- Adding new features
- Changing existing behavior
- Fixing bugs that affect documentation
- Improving clarity

### What to Document

- **API endpoints**: Add to [API Reference](Docs/api/README.md)
- **User features**: Add to [User Guides](Docs/user-guide/)
- **Developer features**: Add to [Dev Guide](Docs/dev-guide/)
- **Configuration**: Update [Deployment Guide](Docs/ops/deployment.md)

### Documentation Style

```markdown
# Clear, descriptive titles

## Subsections for organization

**Bold** for emphasis

`code` for inline code

\`\`\`bash
# Code blocks for commands
curl http://localhost:8080/health
\`\`\`

**Example:**
```json
{
  "example": "data"
}
```
```

---

## Getting Help

### Resources

- **Documentation**: [Docs/](Docs/)
- **API Reference**: [Docs/api/README.md](Docs/api/README.md)
- **Development Guide**: [Docs/dev-guide/development.md](Docs/dev-guide/development.md)
- **Issues**: [GitHub Issues](https://github.com/lbpay/supercore/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lbpay/supercore/discussions)

### Contact

- **Email**: dev@lbpay.com.br
- **Slack**: [Join our Slack](#) (if available)

---

## Recognition

Contributors will be recognized in:
- **README.md** Contributors section
- **CHANGELOG.md** for each release
- **Release notes** on GitHub

---

## License

By contributing to SuperCore, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

**Thank you for contributing to SuperCore!**

We appreciate your time and effort in making SuperCore better for everyone.
