# GitHub Actions CI/CD Workflows

This directory contains all the CI/CD workflows for the SuperCore project. Each workflow is designed to automate specific aspects of the development lifecycle.

## Workflow Structure

### 1. Backend CI (`backend-ci.yml`)

**Trigger**: Push/PR to `main`, `develop` branches or manually via `workflow_dispatch`

**Purpose**: Comprehensive testing and validation of backend code

**Jobs**:
- `backend-lint`: Code quality checks (golangci-lint, go fmt, go vet, gosec)
- `backend-test`: Unit tests with coverage and PostgreSQL
- `backend-build`: Cross-platform build verification (Linux, macOS, Windows)
- `security-scan`: Vulnerability scanning with Trivy
- `integration-tests`: Full stack tests with database
- `benchmark`: Performance benchmark comparison
- `notify-success`: Success notification on PR

**Timeline**: ~5 minutes total

**Artifacts Generated**:
- `coverage.out` - Coverage report (uploaded to Codecov)
- `sbom-report.json` - Software Bill of Materials
- `benchmark.txt` - Benchmark results

### 2. Backend CD - Dev (`backend-cd-dev.yml`)

**Trigger**: Push to `develop` branch or manually via `workflow_dispatch`

**Purpose**: Automated deployment to Development environment

**Jobs**:
- `prepare`: Build Docker image and generate SBOM
- `deploy-dev`: Deploy to Dev ECS cluster
- `deploy-qa`: Deploy to QA (if commit contains `[deploy-qa]`)
- `docker-scan`: Scan Docker image for vulnerabilities
- `rollback-on-failure`: Automatic rollback if deployment fails
- `notification`: Slack notifications with deployment status

**Environment**: Dev/QA only

**Requirements**:
- AWS credentials (Dev): `AWS_ACCESS_KEY_ID_DEV`, `AWS_SECRET_ACCESS_KEY_DEV`
- Slack webhook: `SLACK_WEBHOOK_URL`

### 3. Backend CD - Prod (`backend-cd-prod.yml`)

**Trigger**: Push to `main` branch or manually via `workflow_dispatch`

**Purpose**: Production deployment with strict controls and gradual rollout

**Jobs**:
- `pre-deployment-checks`: Verify prerequisites
- `build-and-push`: Build and push production image
- `scan-image`: Security scanning before deployment
- `approval-gate`: Manual approval required before deployment
- `deploy-production`: Blue-Green deployment with canary
- `post-deployment`: Create release and notifications
- `rollback`: Automatic rollback on failure

**Deployment Strategy**:
1. Canary deployment (10% traffic)
2. Smoke tests on canary
3. Blue-Green switch
4. Gradual traffic shift (10% ’ 50% ’ 100%)
5. Production metrics verification

**Timeline**: ~30 minutes (including 5-min stabilization periods)

**Requirements**:
- AWS role: `AWS_ROLE_TO_ASSUME_PROD`
- Slack webhook (prod): `SLACK_WEBHOOK_PROD`
- Slack alerts: `SLACK_WEBHOOK_ALERTS`

### 4. Code Quality (`code-quality.yml`)

**Trigger**: Daily schedule (2 AM UTC) + manual dispatch

**Purpose**: Advanced code quality analysis and trend tracking

**Jobs**:
- `sonarqube`: SonarQube static analysis
- `code-smell-detection`: Cyclomatic complexity, dependency analysis
- `documentation`: GoDoc generation and validation
- `test-coverage`: Coverage report with trending
- `dependency-check`: Vulnerability and outdated dependency checks
- `performance-regression`: Benchmark comparison (on PR)
- `license-check`: License compliance verification

**Reports Generated**:
- SonarQube quality gate results
- Coverage trends
- Dependency vulnerability reports
- License compliance report

### 5. Documentation (`documentation.yml`)

**Trigger**: Changes to docs/backend + manual dispatch

**Purpose**: Generate and deploy API documentation

**Jobs**:
- `api-docs`: Generate Swagger/OpenAPI documentation
- `godoc`: Generate Go package documentation
- `readme-check`: Validate README and documentation quality
- `changelog`: Auto-generate changelog
- `architecture-docs`: Validate architecture documentation
- `deploy-docs`: Deploy to GitHub Pages

**Output**: Deployed to GitHub Pages and DockerHub registry

### 6. Maintenance (`maintenance.yml`)

**Trigger**: Weekly (Sunday 3 AM UTC) + Monthly (1st at 4 AM UTC)

**Purpose**: Proactive maintenance and dependency management

**Jobs**:
- `update-dependencies`: Update Go dependencies with testing
- `scan-vulnerabilities`: Run vulnerability scanners (govulncheck, gosec)
- `code-cleanup`: Auto-format and cleanup code
- `database-maintenance`: Check and validate migrations
- `test-coverage-trend`: Track coverage metrics over time
- `health-check`: Verify repository health
- `notify-maintenance-complete`: Send completion notification

**PR Creation**: Creates PRs for dependency updates and code cleanup

## Workflow Configuration

### Environment Variables

Global environment variables set in each workflow:

```yaml
env:
  GO_VERSION: '1.23'
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}/backend
```

### Secrets Required

**Development**:
- `CODECOV_TOKEN` - Codecov integration token
- `SLACK_WEBHOOK_URL` - Slack notifications

**Production** (optional, for full CD):
- `AWS_ACCESS_KEY_ID_DEV` - AWS credentials for Dev
- `AWS_SECRET_ACCESS_KEY_DEV`
- `AWS_ACCESS_KEY_ID_QA` - AWS credentials for QA
- `AWS_SECRET_ACCESS_KEY_QA`
- `AWS_ROLE_TO_ASSUME_PROD` - AWS role for production
- `SLACK_WEBHOOK_PROD` - Slack notifications (prod)
- `SLACK_WEBHOOK_ALERTS` - Critical alerts channel
- `SONAR_HOST_URL` - SonarQube server URL
- `SONAR_TOKEN` - SonarQube authentication token

## Local Development

### Pre-push Checklist

Before pushing, run these checks locally:

```bash
cd backend

# 1. Format code
go fmt ./...

# 2. Lint
golangci-lint run ./...

# 3. Vet
go vet ./...

# 4. Security scan
gosec ./...

# 5. Run tests
go test -v -race -covermode=atomic -coverprofile=coverage.out ./...

# 6. Check coverage
go tool cover -func=coverage.out

# 7. Build
go build -v ./cmd/api
```

### Setting up Local CI

To run CI checks locally before pushing:

```bash
# Install tools
go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go install github.com/securego/gosec/v2/cmd/gosec@latest

# Run full CI suite
make ci  # if Makefile exists
# OR
./scripts/ci-local.sh  # if script exists
```

## Workflow Execution Times

| Workflow | Duration | Frequency |
|----------|----------|-----------|
| Backend CI | ~5 min | On push/PR |
| Code Quality | ~15 min | Daily + manual |
| Backend CD - Dev | ~10 min | On develop push |
| Backend CD - Prod | ~30 min | On main push (with approval) |
| Documentation | ~5 min | On doc changes |
| Maintenance | ~20 min | Weekly/Monthly |

## Troubleshooting

### CI/CD Failures

1. **Check workflow logs**: Go to Actions tab ’ Select workflow ’ View logs
2. **Local reproduction**: Run commands locally to reproduce issue
3. **Review changes**: Check what changed since last successful run

### Common Issues

**Lint Failures**:
```bash
cd backend && golangci-lint run --fix ./...
```

**Format Issues**:
```bash
cd backend && go fmt ./...
```

**Test Failures**:
```bash
cd backend && go test -v ./...
```

**Coverage Drop**:
- Check what files changed
- Add tests for new code
- Review coverage report

### Getting Help

1. Check workflow logs in GitHub Actions
2. Review recent commits
3. Ask in team Slack channel
4. Create an issue with workflow output

## Best Practices

### Commit Messages

- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, etc.
- Include ticket reference: `fix(OBJ-123): Fix instance creation`
- For deployment to QA: `chore: update deps [deploy-qa]`

### PR Titles

- Clear and descriptive
- Include ticket number
- Example: `fix(OBJ-456): Correct validation for CPF field`

### Branching Strategy

- Feature branches: `feature/OBJ-XXX-description`
- Bugfix branches: `fix/OBJ-XXX-description`
- Hotfix branches: `hotfix/description`
- Main: `main` (production-ready)
- Develop: `develop` (integration branch)

### Deployment Process

1. **Dev**: Automatic on every push to `develop`
2. **QA**: Add `[deploy-qa]` to commit message on `develop`
3. **Production**: Merge to `main` ’ approve manual gate ’ auto-deploys

## Monitoring Workflows

### GitHub Actions Dashboard

- **URL**: GitHub repo ’ Actions tab
- **Status**: View all workflow runs
- **Logs**: Click on failed jobs for detailed logs
- **Artifacts**: Download generated reports

### External Monitoring

- **Codecov**: View coverage at codecov.io
- **SonarQube**: Code quality dashboard (if configured)
- **Docker Registry**: View image history at ghcr.io

## Updating Workflows

When updating workflows:

1. Test changes locally if possible
2. Create a PR with workflow changes
3. Verify changes execute correctly
4. Get approval before merging to main
5. Document any new secrets or requirements

## Performance Optimization

### Caching

All workflows use GitHub Actions caching for:
- Go module cache
- Docker layer cache (buildx)

### Parallel Jobs

Where possible, jobs run in parallel:
- Lint, test, build verification on CI
- Scans during deployment

### Artifact Management

- Artifacts are retained for 90 days
- Older artifacts are automatically cleaned up
- Large artifacts (coverage.html) are temporary

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SuperCore README](../README.md)
- [Contributing Guide](../CONTRIBUTING.md) (if exists)
- [CLAUDE.md](../CLAUDE.md) - Implementation bible

---

**Last Updated**: December 2024
**Maintained by**: DevOps/Platform Team
