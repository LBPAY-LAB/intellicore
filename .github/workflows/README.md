# GitHub Actions Workflows

This directory contains the CI/CD workflows for the SuperCore project.

## Available Workflows

### ci.yml - Continuous Integration Pipeline

Main CI workflow that runs on every push and pull request.

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Jobs:**
1. `backend-lint` - Code quality and formatting checks
2. `backend-test` - Tests with coverage reporting
3. `build-docker` - Docker image building (main branch only)

**Key Features:**
- Automated testing with PostgreSQL test database
- Code coverage upload to Codecov
- Docker image building and pushing to GHCR
- Linting with golangci-lint
- Format validation with go fmt
- Race condition detection in tests

## Testing Locally

### Using GitHub CLI

```bash
# List all workflows
gh workflow list

# View workflow status
gh workflow view ci.yml

# Watch workflow runs
gh workflow run ci.yml --watch
```

### Using `act` (Local GitHub Actions Runner)

Install `act`:
```bash
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

# Windows (with chocolatey)
choco install act-cli
```

Run workflows locally:
```bash
# Run all jobs
act

# Run specific job
act -j backend-lint

# Run with specific event
act -l
```

## Configuration

### Environment Variables

Edit `env` section in workflow files to change:
- `GO_VERSION`: Go version to use (default: 1.23)
- `POSTGRES_DB`: Test database name (default: supercore_test)
- `POSTGRES_USER`: Database user (default: supercore)
- `POSTGRES_PASSWORD`: Database password (default: test_password)

### Secrets

The following GitHub secrets are required:

- `GITHUB_TOKEN`: Provided automatically by GitHub Actions (for GHCR auth)

## Troubleshooting

### Workflow Not Triggering

- Check branch name matches trigger conditions
- Verify file paths match the `paths` filter
- Check that commits contain changes in `backend/` or workflow files

### Tests Failing

See [CI/CD Pipeline Documentation](../docs/CI_CD_PIPELINE.md) for debugging tips.

### Docker Image Not Pushing

- Ensure you're on the `main` branch
- Check that `needs: backend-test` job passed
- Verify GHCR credentials are correct

## Modifying Workflows

1. Create a new branch
2. Edit workflow files in `.github/workflows/`
3. Test with `act` locally if possible
4. Create a PR for review
5. Merge after CI passes

## Further Documentation

See [CI/CD Pipeline Documentation](../docs/CI_CD_PIPELINE.md) for comprehensive information about the CI/CD setup, including:
- Detailed job descriptions
- Local testing procedures
- Coverage reporting
- Image registry information
- Best practices
