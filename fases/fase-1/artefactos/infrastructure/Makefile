# ==============================================================================
# SuperCore v2.0 - Development Infrastructure Makefile
# ==============================================================================
# Commands for managing the complete development environment
#
# Quick Start:
#   make help           - Show all available commands
#   make dev-up         - Start all services
#   make dev-logs       - View logs from all services
#   make dev-down       - Stop all services
#   make clean          - Clean all data and volumes
#
# Database:
#   make migrate-up     - Run database migrations
#   make migrate-down   - Rollback migrations
#   make db-console     - Open PostgreSQL psql console
#
# NebulaGraph:
#   make nebula-init    - Initialize NebulaGraph spaces and schemas
#   make nebula-console - Open NebulaGraph console
#
# MinIO:
#   make minio-init     - Create MinIO buckets
#   make minio-console  - Open MinIO web console
#
# Temporal:
#   make temporal-ui    - Open Temporal web UI
#   make temporal-cli   - Access Temporal CLI tools
#
# Monitoring:
#   make metrics        - View Prometheus metrics
#   make health         - Check all services health status
# ==============================================================================

.PHONY: help dev-up dev-down dev-logs dev-status clean \
        migrate-up migrate-down db-console db-dump \
        nebula-init nebula-console nebula-status \
        minio-init minio-console minio-status \
        temporal-ui temporal-cli temporal-status \
        metrics health install-tools logs-clear

# ==============================================================================
# Variables
# ==============================================================================

DOCKER_COMPOSE := docker-compose -f docker/docker-compose.yml
DOCKER_COMPOSE_EXEC := $(DOCKER_COMPOSE) exec -T
SCRIPTS_DIR := scripts
DATABASE_DIR := ../database

# Database Migration Tool
MIGRATIONS_DIR := $(DATABASE_DIR)/migrations
GOOSE := goose
DB_DRIVER := postgres
DB_STRING := "postgres://supercore:supercore_dev_password@localhost:5432/supercore_dev?sslmode=disable"

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

# ==============================================================================
# Help Command
# ==============================================================================

help:
	@echo ""
	@echo "$(BLUE)╔═════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║$(NC) SuperCore v2.0 - Development Infrastructure Commands        $(BLUE)║$(NC)"
	@echo "$(BLUE)╚═════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Quick Start:$(NC)"
	@echo "  $(YELLOW)make dev-up$(NC)          Start all services"
	@echo "  $(YELLOW)make dev-logs$(NC)        View logs from all services"
	@echo "  $(YELLOW)make dev-down$(NC)        Stop all services"
	@echo "  $(YELLOW)make health$(NC)          Check all services health status"
	@echo ""
	@echo "$(GREEN)Database:$(NC)"
	@echo "  $(YELLOW)make migrate-up$(NC)      Run pending database migrations"
	@echo "  $(YELLOW)make migrate-down$(NC)    Rollback last migration"
	@echo "  $(YELLOW)make migrate-status$(NC)  Show migration status"
	@echo "  $(YELLOW)make db-console$(NC)      Open PostgreSQL psql console"
	@echo "  $(YELLOW)make db-dump$(NC)         Backup database to SQL file"
	@echo "  $(YELLOW)make db-restore$(NC)      Restore database from SQL file"
	@echo ""
	@echo "$(GREEN)NebulaGraph:$(NC)"
	@echo "  $(YELLOW)make nebula-init$(NC)     Initialize NebulaGraph spaces"
	@echo "  $(YELLOW)make nebula-console$(NC)  Open NebulaGraph console"
	@echo "  $(YELLOW)make nebula-status$(NC)   Check NebulaGraph status"
	@echo ""
	@echo "$(GREEN)MinIO (Object Storage):$(NC)"
	@echo "  $(YELLOW)make minio-init$(NC)      Create MinIO buckets"
	@echo "  $(YELLOW)make minio-console$(NC)   Open MinIO web console"
	@echo "  $(YELLOW)make minio-status$(NC)    Check MinIO status"
	@echo ""
	@echo "$(GREEN)Temporal (Workflow Orchestration):$(NC)"
	@echo "  $(YELLOW)make temporal-ui$(NC)     Open Temporal web UI"
	@echo "  $(YELLOW)make temporal-cli$(NC)    Access Temporal CLI"
	@echo "  $(YELLOW)make temporal-status$(NC) Check Temporal status"
	@echo ""
	@echo "$(GREEN)Monitoring:$(NC)"
	@echo "  $(YELLOW)make metrics$(NC)         View Prometheus metrics"
	@echo "  $(YELLOW)make logs-clear$(NC)      Clear all logs"
	@echo ""
	@echo "$(GREEN)System:$(NC)"
	@echo "  $(YELLOW)make clean$(NC)           Stop services and clean volumes"
	@echo "  $(YELLOW)make install-tools$(NC)   Install required CLI tools"
	@echo ""

# ==============================================================================
# Core Services Management
# ==============================================================================

dev-up:
	@echo "$(GREEN)[Starting SuperCore v2.0 Development Environment]$(NC)"
	@$(DOCKER_COMPOSE) up -d
	@echo ""
	@echo "$(GREEN)Waiting for services to start...$(NC)"
	@sleep 15
	@echo ""
	@echo "$(GREEN)Running database migrations...$(NC)"
	@$(MAKE) migrate-up
	@echo ""
	@echo "$(GREEN)Initializing MinIO buckets...$(NC)"
	@bash $(SCRIPTS_DIR)/init-minio-buckets.sh
	@echo ""
	@echo "$(GREEN)Initializing NebulaGraph spaces...$(NC)"
	@bash $(SCRIPTS_DIR)/init-nebula-spaces.sh || echo "$(YELLOW)Warning: NebulaGraph initialization may need manual setup$(NC)"
	@echo ""
	@echo "$(GREEN)All services started successfully!$(NC)"
	@$(MAKE) health

dev-down:
	@echo "$(YELLOW)[Stopping SuperCore v2.0 Development Environment]$(NC)"
	@$(DOCKER_COMPOSE) down
	@echo "$(GREEN)Services stopped$(NC)"

dev-logs:
	@$(DOCKER_COMPOSE) logs -f

dev-status:
	@echo ""
	@echo "$(BLUE)Service Status:$(NC)"
	@$(DOCKER_COMPOSE) ps
	@echo ""

# ==============================================================================
# Database Management
# ==============================================================================

migrate-up:
	@echo "$(GREEN)[Running Database Migrations]$(NC)"
	@if [ ! -f "$(MIGRATIONS_DIR)/001_create_extensions_and_functions.sql" ]; then \
		echo "$(RED)Error: Migrations not found in $(MIGRATIONS_DIR)$(NC)"; \
		exit 1; \
	fi
	@echo "Checking for goose installation..."
	@if ! command -v $(GOOSE) &> /dev/null; then \
		echo "$(RED)Error: goose not installed. Run: make install-tools$(NC)"; \
		exit 1; \
	fi
	@echo "Running migrations..."
	@cd $(MIGRATIONS_DIR) && goose -dir . $(DB_DRIVER) $(DB_STRING) up
	@echo "$(GREEN)Migrations completed$(NC)"

migrate-down:
	@echo "$(YELLOW)[Rolling Back Last Migration]$(NC)"
	@if ! command -v $(GOOSE) &> /dev/null; then \
		echo "$(RED)Error: goose not installed. Run: make install-tools$(NC)"; \
		exit 1; \
	fi
	@cd $(MIGRATIONS_DIR) && goose -dir . $(DB_DRIVER) $(DB_STRING) down
	@echo "$(GREEN)Migration rolled back$(NC)"

migrate-status:
	@echo "$(BLUE)[Migration Status]$(NC)"
	@if ! command -v $(GOOSE) &> /dev/null; then \
		echo "$(RED)Error: goose not installed. Run: make install-tools$(NC)"; \
		exit 1; \
	fi
	@cd $(MIGRATIONS_DIR) && goose -dir . $(DB_DRIVER) $(DB_STRING) status
	@echo ""

db-console:
	@echo "$(GREEN)[Opening PostgreSQL Console]$(NC)"
	@echo "Database: supercore_dev"
	@echo "User: supercore"
	@echo ""
	@$(DOCKER_COMPOSE_EXEC) postgres psql -U supercore -d supercore_dev

db-dump:
	@echo "$(GREEN)[Backing Up Database]$(NC)"
	@$(DOCKER_COMPOSE_EXEC) postgres pg_dump -U supercore supercore_dev > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Database backed up$(NC)"

db-restore:
	@echo "$(YELLOW)[Restoring Database]$(NC)"
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Error: Please specify FILE=path/to/backup.sql$(NC)"; \
		exit 1; \
	fi
	@$(DOCKER_COMPOSE_EXEC) postgres psql -U supercore supercore_dev < $(FILE)
	@echo "$(GREEN)Database restored$(NC)"

# ==============================================================================
# NebulaGraph Management
# ==============================================================================

nebula-init:
	@echo "$(GREEN)[Initializing NebulaGraph]$(NC)"
	@bash $(SCRIPTS_DIR)/init-nebula-spaces.sh

nebula-console:
	@echo "$(GREEN)[Opening NebulaGraph Console]$(NC)"
	@echo "Note: If console doesn't connect, ensure all NebulaGraph services are running"
	@echo ""
	@$(DOCKER_COMPOSE_EXEC) nebula-console nebula-console -addr nebula-graphd -port 9669 -u root -p nebula

nebula-status:
	@echo "$(BLUE)[NebulaGraph Status]$(NC)"
	@echo "Checking services..."
	@$(DOCKER_COMPOSE) ps | grep nebula

# ==============================================================================
# MinIO Management
# ==============================================================================

minio-init:
	@echo "$(GREEN)[Initializing MinIO Buckets]$(NC)"
	@bash $(SCRIPTS_DIR)/init-minio-buckets.sh

minio-console:
	@echo "$(GREEN)[Opening MinIO Console]$(NC)"
	@echo "URL: http://localhost:9001"
	@echo "Username: minio_admin"
	@echo "Password: minio_password_change_me"
	@echo ""
	@if command -v open &> /dev/null; then \
		open http://localhost:9001; \
	elif command -v xdg-open &> /dev/null; then \
		xdg-open http://localhost:9001; \
	else \
		echo "Please open http://localhost:9001 in your browser"; \
	fi

minio-status:
	@echo "$(BLUE)[MinIO Status]$(NC)"
	@curl -s http://localhost:9000/minio/health/live && echo "$(GREEN) - Healthy$(NC)" || echo "$(RED) - Unavailable$(NC)"

# ==============================================================================
# Temporal Management
# ==============================================================================

temporal-ui:
	@echo "$(GREEN)[Opening Temporal Web UI]$(NC)"
	@echo "URL: http://localhost:8088"
	@echo ""
	@if command -v open &> /dev/null; then \
		open http://localhost:8088; \
	elif command -v xdg-open &> /dev/null; then \
		xdg-open http://localhost:8088; \
	else \
		echo "Please open http://localhost:8088 in your browser"; \
	fi

temporal-cli:
	@echo "$(GREEN)[Temporal CLI Access]$(NC)"
	@echo "Common commands:"
	@echo "  tctl workflow list -a default"
	@echo "  tctl workflow describe -w <workflow-id>"
	@echo "  tctl namespace list"
	@echo ""
	@echo "For interactive access:"
	@echo "  $(DOCKER_COMPOSE_EXEC) temporal tctl"
	@echo ""

temporal-status:
	@echo "$(BLUE)[Temporal Status]$(NC)"
	@$(DOCKER_COMPOSE_EXEC) temporal tctl cluster describe || echo "$(YELLOW)Temporal still starting...$(NC)"

# ==============================================================================
# Monitoring
# ==============================================================================

metrics:
	@echo "$(GREEN)[Prometheus Metrics]$(NC)"
	@echo "URL: http://localhost:9090"
	@echo ""
	@echo "Temporal Metrics: http://localhost:9090/metrics"
	@echo ""
	@if command -v open &> /dev/null; then \
		open http://localhost:9090; \
	else \
		echo "Please open http://localhost:9090 in your browser"; \
	fi

health:
	@echo ""
	@echo "$(BLUE)Service Health Status:$(NC)"
	@echo ""
	@echo -n "PostgreSQL (5432)... "
	@pg_isready -h localhost -p 5432 > /dev/null 2>&1 && echo "$(GREEN)OK$(NC)" || echo "$(RED)DOWN$(NC)"
	@echo -n "Redis (6379)......... "
	@redis-cli -p 6379 ping > /dev/null 2>&1 && echo "$(GREEN)OK$(NC)" || echo "$(RED)DOWN$(NC)"
	@echo -n "Temporal (7233)..... "
	@curl -s http://localhost:7233/ > /dev/null 2>&1 && echo "$(GREEN)OK$(NC)" || echo "$(RED)DOWN$(NC)"
	@echo -n "NebulaGraph (9669).. "
	@nc -zv localhost 9669 > /dev/null 2>&1 && echo "$(GREEN)OK$(NC)" || echo "$(RED)DOWN$(NC)"
	@echo -n "Qdrant (6333)....... "
	@curl -s http://localhost:6333/health > /dev/null 2>&1 && echo "$(GREEN)OK$(NC)" || echo "$(RED)DOWN$(NC)"
	@echo -n "MinIO (9000)........ "
	@curl -s http://localhost:9000/minio/health/live > /dev/null 2>&1 && echo "$(GREEN)OK$(NC)" || echo "$(RED)DOWN$(NC)"
	@echo ""

logs-clear:
	@echo "$(YELLOW)[Clearing Logs]$(NC)"
	@$(DOCKER_COMPOSE) logs --follow --timestamps | tail -n 0
	@echo "$(GREEN)Logs cleared$(NC)"

# ==============================================================================
# System Commands
# ==============================================================================

install-tools:
	@echo "$(GREEN)[Installing Required Tools]$(NC)"
	@echo ""
	@echo "$(YELLOW)1. Checking for required tools...$(NC)"
	@echo ""
	@command -v docker &> /dev/null && echo "$(GREEN)✓ docker$(NC)" || echo "$(RED)✗ docker - Install from https://www.docker.com$(NC)"
	@command -v docker-compose &> /dev/null && echo "$(GREEN)✓ docker-compose$(NC)" || echo "$(RED)✗ docker-compose - Install from https://docs.docker.com/compose$(NC)"
	@command -v goose &> /dev/null && echo "$(GREEN)✓ goose$(NC)" || echo "$(YELLOW)  Installing goose...$(NC)" && go install github.com/pressly/goose/v3/cmd/goose@latest
	@command -v tctl &> /dev/null && echo "$(GREEN)✓ tctl (Temporal CLI)$(NC)" || echo "$(YELLOW)  Installing tctl...$(NC)" && brew install temporal-cli
	@command -v mc &> /dev/null && echo "$(GREEN)✓ mc (MinIO Client)$(NC)" || echo "$(YELLOW)  Installing mc...$(NC)" && brew install minio/stable/mc
	@command -v nc &> /dev/null && echo "$(GREEN)✓ nc (netcat)$(NC)" || echo "$(RED)✗ nc - Install from your package manager$(NC)"
	@echo ""
	@echo "$(GREEN)Tool installation check complete$(NC)"

clean:
	@echo "$(RED)[Cleaning Up All Data]$(NC)"
	@read -p "Are you sure? This will DELETE all data. Type 'yes' to confirm: " confirm && \
	if [ "$$confirm" = "yes" ]; then \
		echo "$(YELLOW)Stopping services...$(NC)"; \
		$(DOCKER_COMPOSE) down -v; \
		echo "$(GREEN)Cleanup complete$(NC)"; \
	else \
		echo "$(YELLOW)Cleanup cancelled$(NC)"; \
	fi

# ==============================================================================
# Docker Compose Utilities
# ==============================================================================

logs:
	@$(DOCKER_COMPOSE) logs -f

ps:
	@$(DOCKER_COMPOSE) ps

build:
	@echo "$(GREEN)[Building Services]$(NC)"
	@$(DOCKER_COMPOSE) build

pull:
	@echo "$(GREEN)[Pulling Latest Images]$(NC)"
	@$(DOCKER_COMPOSE) pull

restart:
	@echo "$(YELLOW)[Restarting Services]$(NC)"
	@$(DOCKER_COMPOSE) restart

# ==============================================================================
# Convenience Targets
# ==============================================================================

all: dev-up

.DEFAULT_GOAL := help
