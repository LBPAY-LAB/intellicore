.PHONY: help ci ci-quick ci-fix build test lint format clean docker-build docker-push

# Default target
.DEFAULT_GOAL := help

# Variables
GO := go
GOFLAGS := -v
BINARY_NAME := api
BINARY_PATH := ./bin/$(BINARY_NAME)
DOCKER_REGISTRY := ghcr.io
DOCKER_IMAGE := $(DOCKER_REGISTRY)/lbpay/supercore/backend
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TIME := $(shell date -u '+%Y-%m-%dT%H:%M:%SZ')
COMMIT := $(shell git rev-parse HEAD 2>/dev/null || echo "unknown")

# Help target
help:
	@echo "SuperCore Backend - Development Commands"
	@echo ""
	@echo "CI/CD Commands:"
	@echo "  make ci             - Run full CI pipeline (lint, test, build)"
	@echo "  make ci-quick       - Run quick checks (no tests)"
	@echo "  make ci-fix         - Run CI with auto-fixes for formatting/imports"
	@echo ""
	@echo "Build Commands:"
	@echo "  make build          - Build binary"
	@echo "  make docker-build   - Build Docker image"
	@echo "  make docker-push    - Push Docker image to registry"
	@echo ""
	@echo "Test Commands:"
	@echo "  make test           - Run unit tests"
	@echo "  make test-coverage  - Run tests with coverage report"
	@echo "  make test-race      - Run tests with race detector"
	@echo "  make test-integration - Run integration tests"
	@echo "  make test-bench     - Run benchmarks"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint           - Run golangci-lint"
	@echo "  make format         - Format code with gofmt"
	@echo "  make vet            - Run go vet"
	@echo "  make sec            - Run security scan with gosec"
	@echo ""
	@echo "Development:"
	@echo "  make clean          - Remove build artifacts"
	@echo "  make run            - Run application locally"
	@echo "  make dev            - Run with hot reload (requires air)"
	@echo ""
	@echo "Other:"
	@echo "  make info           - Show build information"
	@echo "  make deps           - Download and verify dependencies"

# Info target
info:
	@echo "Build Information:"
	@echo "  Version:  $(VERSION)"
	@echo "  Commit:   $(COMMIT)"
	@echo "  Time:     $(BUILD_TIME)"
	@echo "  Go:       $(shell go version)"

# Dependencies
deps:
	@echo "Downloading dependencies..."
	$(GO) mod download
	@echo "Verifying modules..."
	$(GO) mod verify
	@echo "Done!"

# Code formatting
format:
	@echo "Formatting code..."
	$(GO) fmt ./...
	@echo "Done!"

# Go vet
vet:
	@echo "Running go vet..."
	$(GO) vet ./...
	@echo "Done!"

# Linting
lint:
	@echo "Running golangci-lint..."
	@command -v golangci-lint >/dev/null 2>&1 || (echo "Installing golangci-lint..." && go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run ./...
	@echo "Done!"

# Security scanning
sec:
	@echo "Running security scan..."
	@command -v gosec >/dev/null 2>&1 || (echo "Installing gosec..." && go install github.com/securego/gosec/v2/cmd/gosec@latest)
	gosec -no-fail ./...
	@echo "Done!"

# Tests
test:
	@echo "Running tests..."
	$(GO) test -v ./...
	@echo "Done!"

test-race:
	@echo "Running tests with race detector..."
	$(GO) test -v -race ./...
	@echo "Done!"

test-coverage:
	@echo "Running tests with coverage..."
	$(GO) test -v -race -covermode=atomic -coverprofile=coverage.out ./...
	@echo "Generating coverage report..."
	go tool cover -html=coverage.out -o coverage.html
	go tool cover -func=coverage.out
	@echo "Coverage report: coverage.html"
	@echo "Done!"

test-integration:
	@echo "Running integration tests..."
	$(GO) test -v -tags=integration -timeout 30s ./...
	@echo "Done!"

test-bench:
	@echo "Running benchmarks..."
	$(GO) test -bench=. -benchmem ./...
	@echo "Done!"

# Build
build:
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p ./bin
	$(GO) build $(GOFLAGS) \
		-ldflags="-X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME) -X main.Commit=$(COMMIT)" \
		-o $(BINARY_PATH) ./cmd/api
	@echo "Binary created: $(BINARY_PATH)"

# Run locally
run: build
	@echo "Starting $(BINARY_NAME)..."
	./bin/api

# Development with hot reload
dev:
	@command -v air >/dev/null 2>&1 || (echo "Installing air..." && go install github.com/cosmtrek/air@latest)
	@echo "Starting with hot reload..."
	air

# Clean
clean:
	@echo "Cleaning build artifacts..."
	$(GO) clean
	rm -f ./bin/$(BINARY_NAME)
	rm -f coverage.out coverage.html coverage.txt
	rm -rf dist/
	@echo "Done!"

# Docker build
docker-build:
	@echo "Building Docker image: $(DOCKER_IMAGE):$(VERSION)"
	docker build \
		-t $(DOCKER_IMAGE):$(VERSION) \
		-t $(DOCKER_IMAGE):latest \
		--build-arg VERSION=$(VERSION) \
		--build-arg BUILD_TIME=$(BUILD_TIME) \
		--build-arg COMMIT=$(COMMIT) \
		.
	@echo "Done!"

# Docker push
docker-push: docker-build
	@echo "Pushing Docker image: $(DOCKER_IMAGE):$(VERSION)"
	docker push $(DOCKER_IMAGE):$(VERSION)
	docker push $(DOCKER_IMAGE):latest
	@echo "Done!"

# Full CI pipeline
ci: deps format vet lint sec build test
	@echo ""
	@echo "✓ All CI checks passed!"

# Quick CI (no tests)
ci-quick: deps format vet lint sec build
	@echo ""
	@echo "✓ Quick CI checks passed!"

# CI with auto-fixes
ci-fix:
	@echo "Running CI with auto-fixes..."
	$(GO) fmt ./...
	@command -v golangci-lint >/dev/null 2>&1 || (go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest)
	golangci-lint run ./... --fix || true
	$(GO) mod tidy
	@echo "Auto-fixes applied. Review changes before committing."

# Full CI via script
ci-script:
	@./scripts/ci-local.sh

ci-script-quick:
	@./scripts/ci-local.sh --quick

ci-script-fix:
	@./scripts/ci-local.sh --fix

# Pre-commit check
pre-commit: format vet lint sec build test
	@echo ""
	@echo "✓ Ready to commit!"
	@echo "Next steps:"
	@echo "  git add ."
	@echo "  git commit -m 'your message'"
	@echo "  git push origin <branch>"

# Install development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install github.com/securego/gosec/v2/cmd/gosec@latest
	go install github.com/cosmtrek/air@latest
	go install golang.org/x/tools/cmd/goimports@latest
	@echo "Done!"

# Generate documentation
docs:
	@echo "Generating documentation..."
	@command -v swag >/dev/null 2>&1 || (echo "Installing swag..." && go install github.com/swaggo/swag/cmd/swag@latest)
	swag init -g cmd/api/main.go
	@echo "Documentation generated in docs/"

# Check for outdated dependencies
outdated:
	@echo "Checking for outdated dependencies..."
	$(GO) list -u -m all

# Update dependencies
update-deps:
	@echo "Updating dependencies..."
	$(GO) get -u ./...
	$(GO) mod tidy
	@echo "Done! Review changes with: git diff go.mod go.sum"

# Generate test coverage badge
badge:
	@echo "Generating coverage badge..."
	@coverage=$$(grep "total:" coverage.txt | awk '{print $$3}' | sed 's/%//'); \
	if [ -z "$$coverage" ]; then \
		echo "Please run 'make test-coverage' first"; \
		exit 1; \
	fi; \
	echo "Coverage: $$coverage%"

# Help for GitHub Actions
gh-help:
	@echo "GitHub Actions CI/CD Workflows:"
	@echo ""
	@echo "View at: https://github.com/lbpay/supercore/actions"
	@echo ""
	@echo "Workflows:"
	@echo "  - Backend CI (on every push/PR)"
	@echo "  - Backend CD - Dev (on develop push)"
	@echo "  - Backend CD - Prod (on main push with approval)"
	@echo "  - Code Quality (daily + on demand)"
	@echo "  - Documentation (on doc changes)"
	@echo "  - Maintenance (weekly + monthly)"
	@echo ""
	@echo "See .github/workflows/WORKFLOWS_README.md for details"
