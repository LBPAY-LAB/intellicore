# SuperCore Backend - CI/CD Setup & Usage Guide

This guide explains how to use the CI/CD pipeline for local development and understand the automated checks.

## Quick Start

### Installation

1. **Install required tools**:

```bash
cd backend

# Install Go linting/checking tools
make install-tools

# Or manually:
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install github.com/securego/gosec/v2/cmd/gosec@latest
go install github.com/cosmtrek/air@latest
```

2. **Setup environment**:

```bash
# Copy example env file
cp ../.env.example .env

# Update with your values
vim .env
```

### Before Every Commit

Run the pre-commit checks:

```bash
cd backend
make ci  # Full CI (lint, test, build)
# OR
make ci-quick  # Quick check (no tests, faster)
# OR
./scripts/ci-local.sh  # Script version
```

If checks fail, try:

```bash
make ci-fix  # Auto-fix formatting and imports
```

## Available Commands

### CI/CD Pipeline

```bash
# Full CI suite (recommended before pushing)
make ci

# Quick checks only (no tests)
make ci-quick

# Auto-fix common issues
make ci-fix

# Run via script
make ci-script
make ci-script-quick
make ci-script-fix
```

### Individual Checks

```bash
# Format code
make format

# Run linter
make lint

# Run security scan
make sec

# Run tests
make test
make test-race
make test-coverage
make test-integration
make test-bench
```

### Build

```bash
# Build binary
make build

# Build Docker image
make docker-build

# Push to registry
make docker-push

# Run locally
make run
make dev  # with hot reload
```

### Utilities

```bash
# Show build info
make info

# Download dependencies
make deps

# Update dependencies
make update-deps

# Check for outdated packages
make outdated

# Generate API docs
make docs

# Clean build artifacts
make clean

# Install dev tools
make install-tools
```

## Workflow Overview

### Local Development Flow

```
1. Make changes to code
      ↓
2. Run: make ci-quick (check for obvious issues)
      ↓
3. Make more changes as needed
      ↓
4. Run: make pre-commit (full validation)
      ↓
5. Fix any issues (use make ci-fix if needed)
      ↓
6. Commit & push
      ↓
7. GitHub Actions runs (automated)
```

### GitHub Actions Workflows

When you push to GitHub, automated workflows run:

**On every push/PR**:
- Backend CI → Lint, test, build verification (5 min)

**On develop push**:
- Backend CD - Dev → Deploy to Dev environment (10 min)

**On main push**:
- Backend CD - Prod → Production deployment with approval (30 min)

**Daily**:
- Code Quality → Advanced analysis, SonarQube, coverage trends (15 min)

**Weekly/Monthly**:
- Maintenance → Dependency updates, security scans (20 min)

View results: https://github.com/lbpay/supercore/actions

## Common Tasks

### Fix Formatting Issues

```bash
# Check what needs fixing
make format

# Or use the script
./scripts/ci-local.sh --fix
```

### Improve Test Coverage

```bash
# Generate coverage report
make test-coverage

# View coverage in HTML
open coverage.html

# See which files need more tests
go tool cover -func=coverage.out
```

### Run Specific Tests

```bash
# Run specific test
go test -v ./internal/handlers -run TestName

# Run with output
go test -v -count=1 ./...

# Run with verbose database logging
DATABASE_LOG_LEVEL=debug go test -v ./...
```

### Debug Test Failures

```bash
# Run with verbose output
go test -v ./...

# Run with race detection
go test -race ./...

# Run with timeout
go test -timeout 30s ./...

# Run specific package
go test -v ./internal/handlers
```

### Security Scanning

```bash
# Run gosec
make sec

# Check for vulnerable dependencies
go list -u -m all | grep -E "\[.*\]"

# Detailed security report
gosec -json ./... > security.json
```

## Troubleshooting

### Problem: Tests fail locally but pass in CI

**Solution**:
- Ensure PostgreSQL is running: `docker-compose up -d postgres`
- Check DATABASE_URL environment variable
- Run with verbose output: `go test -v ./...`

### Problem: Lint warnings

**Solution**:
```bash
# Auto-fix
make ci-fix

# Or manually fix
golangci-lint run ./... --fix
```

### Problem: Build fails with "cannot load..."

**Solution**:
```bash
# Clean and rebuild
go clean -modcache
go mod download
make build
```

### Problem: Tests timeout

**Solution**:
```bash
# Increase timeout
go test -timeout 60s ./...

# Run specific test
go test -v -run TestName -timeout 30s ./...
```

### Problem: Permission denied on scripts

**Solution**:
```bash
chmod +x scripts/ci-local.sh
./scripts/ci-local.sh
```

## Best Practices

### Before Committing

1. Always run full CI locally first:
   ```bash
   make ci
   ```

2. Review your changes:
   ```bash
   git diff
   git status
   ```

3. Run tests for affected packages:
   ```bash
   go test -v ./internal/handlers ./internal/models
   ```

4. Check coverage for new code:
   ```bash
   make test-coverage
   ```

### Commit Messages

Use conventional commit format:

```
feat(OBJ-123): Add new feature
fix(OBJ-456): Fix bug in validation
chore: Update dependencies
docs: Add API documentation
```

For deployment to QA, include marker:
```
chore: Update deps [deploy-qa]
```

### Code Quality

- Aim for >80% test coverage
- Keep functions small and focused
- Add comments for exported functions
- Use meaningful variable names
- Avoid nested loops when possible

### Performance

- Run benchmarks before/after changes:
  ```bash
  go test -bench=. -benchmem ./...
  ```

- Profile code if needed:
  ```bash
  go test -cpuprofile=cpu.prof ./...
  go tool pprof cpu.prof
  ```

## GitHub Actions Secrets

The following secrets need to be configured in GitHub for full CD:

**Development**:
- `CODECOV_TOKEN` - Codecov API token

**Optional (for production deployment)**:
- `AWS_ACCESS_KEY_ID_DEV` - AWS Dev credentials
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_QA` - AWS QA credentials
- `AWS_SECRET_ACCESS_KEY_QA`
- `AWS_ROLE_TO_ASSUME_PROD` - AWS production role
- `SLACK_WEBHOOK_URL` - Slack notifications
- `SLACK_WEBHOOK_PROD` - Slack production notifications
- `SLACK_WEBHOOK_ALERTS` - Slack alerts channel
- `SONAR_HOST_URL` - SonarQube server
- `SONAR_TOKEN` - SonarQube token

## Performance Tips

### Speed Up Local CI

```bash
# Skip tests, run quick checks only
make ci-quick

# Parallel test execution (default)
go test -parallel 4 ./...

# Skip specific tests
go test -short ./...
```

### Faster Builds

```bash
# Use `-trimpath` for smaller binaries
go build -trimpath -o bin/api ./cmd/api

# Use `-ldflags` to strip debug info
go build -ldflags="-s -w" -o bin/api ./cmd/api
```

### Optimize Docker Builds

- Multi-stage builds included in Dockerfile
- Layer caching optimized
- Image size ~20-30MB after optimization

## Monitoring Workflows

### Local Monitoring

```bash
# Check logs
make info

# Monitor running app
tail -f logs/*.log

# Check resource usage
ps aux | grep api
```

### GitHub Monitoring

- **Actions Dashboard**: https://github.com/lbpay/supercore/actions
- **Codecov**: https://codecov.io/gh/lbpay/supercore
- **Branches**: https://github.com/lbpay/supercore/branches/all

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Go Testing Documentation](https://golang.org/doc/effective_go#testing)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [SuperCore CLAUDE.md](../CLAUDE.md) - Implementation guide
- [Workflows README](.github/workflows/WORKFLOWS_README.md)

## Getting Help

1. Check this guide first
2. Review workflow logs in GitHub Actions
3. Ask in team Slack channel
4. Create an issue with error output

## Quick Reference

```bash
# Daily workflow
cd backend
make ci-quick    # Check for issues
make test        # Run tests
make ci          # Full validation before commit

# Before pushing
make pre-commit  # Final check

# After merge to develop
# (Automatic deploy to Dev via GitHub Actions)

# After merge to main
# (Manual approval for production deploy)
```

---

**Last Updated**: December 2024
**Maintained by**: Backend Team
