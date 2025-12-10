# CI/CD Pipeline Documentation

## Overview

The SuperCore project uses **GitHub Actions** for continuous integration and deployment. This document describes the automated workflows and how to work with them.

## Workflows

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Changes to `backend/**` or workflow files

**Jobs:**

#### `backend-lint` - Code Quality Checks
Runs on every trigger:
- **golangci-lint**: Comprehensive Go linting (imports, complexity, security, etc.)
- **go fmt**: Ensures consistent code formatting
- **go vet**: Detects suspicious code patterns

**Fail conditions:** Any linting or formatting issues will fail the job

#### `backend-test` - Build & Test
Runs after `backend-lint` succeeds:
- Downloads Go dependencies via `go mod download`
- Builds the backend binary
- Runs all tests with race detection: `go test -race -covermode=atomic ./...`
- Uploads coverage reports to Codecov
- Generates coverage summary

**Services:**
- PostgreSQL 16 (for database tests)
  - Database: `supercore_test`
  - User: `supercore`
  - Password: `test_password`

**Environment:** Tests run with `DATABASE_URL` pointing to the test PostgreSQL instance

#### `build-docker` - Docker Image Build & Push
Runs only:
- After `backend-test` succeeds
- On push to `main` branch
- Builds and pushes Docker image to GHCR (ghcr.io)
- Generates tags based on git metadata (SHA, branch, semver)
- Uses GitHub Actions cache for faster builds

## GitHub Container Registry (GHCR)

### Authentication

The pipeline automatically authenticates with GHCR using `GITHUB_TOKEN` provided by GitHub Actions.

### Image Tags

Images are tagged with:
- `sha-<commit-sha>`: Commit-specific tag (e.g., `sha-a1b2c3d`)
- `main`: Latest on main branch
- `<tag>`: Semantic version tags (when pushed)

### Image URL

```
ghcr.io/lbpay/supercore/backend:<tag>
```

Example:
```bash
docker pull ghcr.io/lbpay/supercore/backend:main
docker pull ghcr.io/lbpay/supercore/backend:sha-a1b2c3d
```

## Code Coverage

Coverage reports are automatically uploaded to **Codecov**.

- Coverage badge shown in README
- Coverage reports available at: https://codecov.io/gh/lbpay/supercore

## Running Tests Locally

### Prerequisites

```bash
cd backend
go mod download
```

### Run All Tests

```bash
go test -v ./...
```

### Run Tests with Coverage

```bash
go test -v -race -covermode=atomic -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

### Run Specific Tests

```bash
go test -v -run TestName ./package
```

## Linting Locally

### golangci-lint

```bash
# Install golangci-lint
curl -sSfL https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh | sh -s -- -b $(go env GOPATH)/bin

# Run linting
cd backend
golangci-lint run ./...
```

### Format Check

```bash
cd backend
go fmt ./...
```

## Debugging CI Failures

### Common Issues

1. **Format Issues**
   ```bash
   # Fix formatting
   cd backend
   go fmt ./...
   ```

2. **Linting Errors**
   ```bash
   # Run locally to see issues
   cd backend
   golangci-lint run ./...
   ```

3. **Test Failures**
   ```bash
   # Run tests locally with database
   # Ensure PostgreSQL is running
   go test -v ./...
   ```

### Viewing Workflow Logs

1. Go to your GitHub repository
2. Click "Actions" tab
3. Select the workflow run
4. Click on the failed job to see logs

## Modifying Workflows

When updating workflow files:

1. Test locally with `act` tool (GitHub Actions local runner)
2. Ensure YAML syntax is valid
3. Test in a branch before merging to main
4. Update this documentation if workflow logic changes

### Installing `act`

```bash
# macOS
brew install act

# Then run
act -j backend-lint
```

## Best Practices

1. **Keep Commits Clean**: Ensure code passes linting before committing
2. **Test Locally**: Run `go test ./...` before pushing
3. **PR Checks**: Always create PRs and let CI verify changes
4. **Monitor Coverage**: Watch for coverage decreases in PRs
5. **Review Logs**: Check CI logs if builds fail unexpectedly

## Environment Variables in CI

| Variable | Value | Used By |
|----------|-------|---------|
| GO_VERSION | 1.23 | All jobs |
| POSTGRES_DB | supercore_test | Test job |
| POSTGRES_USER | supercore | Test job |
| POSTGRES_PASSWORD | test_password | Test job |
| DATABASE_URL | postgres://... | Test job |

## Next Steps

- Add E2E tests workflow
- Add performance benchmarks job
- Add security scanning (Trivy) for Docker images
- Add automated deployments based on tags
- Add staging environment deployment

## Related Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [golangci-lint Documentation](https://golangci-lint.run/)
- [Go Testing Best Practices](https://golang.org/doc/effective_go#testing)
- [GHCR Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
