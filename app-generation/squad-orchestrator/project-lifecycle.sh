#!/bin/bash
#
# Project Lifecycle Management Script
#
# Operations:
#   clean-all     - Reset project to initial state (with backup)
#   pause         - Pause project execution gracefully
#   resume        - Resume project execution
#   backup [name] - Create timestamped backup
#   restore <name> - Restore from backup
#   status        - Show project status
#
# Usage:
#   ./project-lifecycle.sh <operation> [args]
#

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="${SCRIPT_DIR}/state"
BACKUPS_DIR="${SCRIPT_DIR}/backups"
LOGS_DIR="${SCRIPT_DIR}/logs"
ARTIFACTS_DIR="${SCRIPT_DIR}/../../artefactos_implementacao"
MONITORING_DIR="${SCRIPT_DIR}/monitoring"
MONITORING_DB="${MONITORING_DIR}/data/monitoring.db"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Redis is running
check_redis() {
    if redis-cli ping > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if Celery workers are running
check_celery_workers() {
    if pgrep -f "celery.*worker" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check if orchestrator is running
check_orchestrator() {
    if pgrep -f "autonomous_meta_orchestrator.py" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Show project status
show_status() {
    log_info "🔍 Project Status Check..."
    echo ""

    # Check pause state
    if [ -f "${STATE_DIR}/pause.json" ]; then
        PAUSED=$(python3 -c "import json; print(json.load(open('${STATE_DIR}/pause.json')).get('paused', False))" 2>/dev/null || echo "false")
        if [ "$PAUSED" = "True" ]; then
            log_warning "Project is PAUSED"
            cat "${STATE_DIR}/pause.json"
            echo ""
        fi
    fi

    # Check services
    echo "Services Status:"
    if check_redis; then
        log_success "Redis: RUNNING"
    else
        log_error "Redis: STOPPED"
    fi

    if check_celery_workers; then
        WORKER_COUNT=$(pgrep -f "celery.*worker" | wc -l)
        log_success "Celery Workers: RUNNING (${WORKER_COUNT} workers)"
    else
        log_error "Celery Workers: STOPPED"
    fi

    if check_orchestrator; then
        log_success "Orchestrator: RUNNING"
    else
        log_error "Orchestrator: STOPPED"
    fi

    echo ""

    # Check backlog
    if [ -f "${STATE_DIR}/backlog_master.json" ]; then
        TOTAL_CARDS=$(python3 -c "import json; print(len(json.load(open('${STATE_DIR}/backlog_master.json'))['cards']))" 2>/dev/null || echo "0")
        TODO_CARDS=$(python3 -c "import json; cards=json.load(open('${STATE_DIR}/backlog_master.json'))['cards']; print(len([c for c in cards if c['status']=='TODO']))" 2>/dev/null || echo "0")
        IN_PROGRESS_CARDS=$(python3 -c "import json; cards=json.load(open('${STATE_DIR}/backlog_master.json'))['cards']; print(len([c for c in cards if c['status']=='IN_PROGRESS']))" 2>/dev/null || echo "0")
        DONE_CARDS=$(python3 -c "import json; cards=json.load(open('${STATE_DIR}/backlog_master.json'))['cards']; print(len([c for c in cards if c['status']=='DONE']))" 2>/dev/null || echo "0")

        echo "Backlog Status:"
        log_info "Total Cards: ${TOTAL_CARDS}"
        log_info "TODO: ${TODO_CARDS} | IN_PROGRESS: ${IN_PROGRESS_CARDS} | DONE: ${DONE_CARDS}"
    fi

    echo ""

    # Check disk usage
    if [ -d "${ARTIFACTS_DIR}" ]; then
        ARTIFACTS_SIZE=$(du -sh "${ARTIFACTS_DIR}" 2>/dev/null | cut -f1 || echo "0")
        log_info "Artifacts Size: ${ARTIFACTS_SIZE}"
    fi

    if [ -d "${LOGS_DIR}" ]; then
        LOGS_SIZE=$(du -sh "${LOGS_DIR}" 2>/dev/null | cut -f1 || echo "0")
        log_info "Logs Size: ${LOGS_SIZE}"
    fi

    # Check backups
    if [ -d "${BACKUPS_DIR}" ]; then
        BACKUP_COUNT=$(ls -1 "${BACKUPS_DIR}" 2>/dev/null | wc -l)
        log_info "Backups: ${BACKUP_COUNT} available"
    fi
}

# Pause project
pause_project() {
    log_info "⏸️  Pausing project..."

    # Check if already paused
    if [ -f "${STATE_DIR}/pause.json" ]; then
        PAUSED=$(python3 -c "import json; print(json.load(open('${STATE_DIR}/pause.json')).get('paused', False))" 2>/dev/null || echo "false")
        if [ "$PAUSED" = "True" ]; then
            log_warning "Project is already paused"
            return 0
        fi
    fi

    # Create pause flag
    mkdir -p "${STATE_DIR}"
    cat > "${STATE_DIR}/pause.json" <<EOF
{
  "paused": true,
  "paused_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "reason": "User requested pause"
}
EOF

    log_success "Pause flag created"

    # Wait for current card to finish (max 5 minutes)
    log_info "Waiting for current card to finish (max 5 minutes)..."
    WAITED=0
    while [ $WAITED -lt 300 ]; do
        if [ -f "${STATE_DIR}/backlog_master.json" ]; then
            IN_PROGRESS=$(python3 -c "import json; cards=json.load(open('${STATE_DIR}/backlog_master.json'))['cards']; print(len([c for c in cards if c['status']=='IN_PROGRESS']))" 2>/dev/null || echo "1")
            if [ "$IN_PROGRESS" = "0" ]; then
                log_success "No cards in progress"
                break
            fi
        fi
        sleep 5
        WAITED=$((WAITED + 5))
    done

    if [ $WAITED -ge 300 ]; then
        log_warning "Timeout waiting for cards to finish. Proceeding anyway..."
    fi

    # Stop Celery workers gracefully
    log_info "Stopping Celery workers..."
    if check_celery_workers; then
        pkill -TERM -f "celery.*worker" || true
        sleep 5

        # Force kill if still running
        if check_celery_workers; then
            log_warning "Workers did not stop gracefully, force killing..."
            pkill -KILL -f "celery.*worker" || true
        fi
    fi

    log_success "Celery workers stopped"

    # Note: Redis and monitoring portal remain running for UI access
    log_info "Redis and monitoring portal remain running for UI access"
    log_success "Project paused successfully"

    echo ""
    log_info "To resume: ./project-lifecycle.sh resume"
}

# Resume project
resume_project() {
    log_info "▶️  Resuming project..."

    # Check if paused
    if [ ! -f "${STATE_DIR}/pause.json" ]; then
        log_warning "Project is not paused"
        return 0
    fi

    PAUSED=$(python3 -c "import json; print(json.load(open('${STATE_DIR}/pause.json')).get('paused', False))" 2>/dev/null || echo "false")
    if [ "$PAUSED" != "True" ]; then
        log_warning "Project is not paused"
        return 0
    fi

    # Check and reset orphaned cards
    log_info "Checking for orphaned cards..."
    if [ -f "${STATE_DIR}/backlog_master.json" ]; then
        python3 << PYEOF
import json
import sys

backlog_file = "${STATE_DIR}/backlog_master.json"
try:
    with open(backlog_file) as f:
        backlog = json.load(f)

    orphaned = []
    for card in backlog["cards"]:
        if card["status"] == "IN_PROGRESS":
            orphaned.append(card["card_id"])
            card["status"] = "TODO"
            card["celery_task_id"] = None

    if orphaned:
        with open(backlog_file, 'w') as f:
            json.dump(backlog, f, indent=2)
        print(f"Reset {len(orphaned)} orphaned cards: {', '.join(orphaned)}")
    else:
        print("No orphaned cards found")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
PYEOF
    fi

    # Remove pause flag
    log_info "Removing pause flag..."
    rm -f "${STATE_DIR}/pause.json"
    log_success "Pause flag removed"

    # Ensure Redis is running
    if ! check_redis; then
        log_error "Redis is not running. Please start Redis first:"
        echo "  redis-server --daemonize yes"
        exit 1
    fi

    # Start Celery workers
    log_info "Starting Celery workers..."
    cd "${SCRIPT_DIR}"

    # Start 4 workers (one per squad type)
    for i in 1 2 3 4; do
        python3 -m celery -A tasks worker --loglevel=info --concurrency=1 \
            --logfile="${LOGS_DIR}/celery_worker_${i}.log" \
            --pidfile="${STATE_DIR}/celery_worker_${i}.pid" \
            --detach
    done

    sleep 3

    if check_celery_workers; then
        WORKER_COUNT=$(pgrep -f "celery.*worker" | wc -l)
        log_success "Celery workers started (${WORKER_COUNT} workers)"
    else
        log_error "Failed to start Celery workers"
        exit 1
    fi

    log_success "Project resumed successfully"

    echo ""
    log_info "Orchestrator will automatically resume on next cycle"
    log_info "Monitor at: http://localhost:3001"
}

# Backup project state
backup_project() {
    local BACKUP_NAME="${1:-$(date +%Y%m%d_%H%M%S)}"
    local BACKUP_PATH="${BACKUPS_DIR}/${BACKUP_NAME}"

    log_info "💾 Creating backup: ${BACKUP_NAME}..."

    mkdir -p "${BACKUP_PATH}"

    # Backup state directory
    if [ -d "${STATE_DIR}" ]; then
        log_info "Backing up state directory..."
        cp -r "${STATE_DIR}" "${BACKUP_PATH}/state"
    fi

    # Backup monitoring database
    if [ -f "${MONITORING_DB}" ]; then
        log_info "Backing up monitoring database..."
        mkdir -p "${BACKUP_PATH}/monitoring"
        cp "${MONITORING_DB}" "${BACKUP_PATH}/monitoring/monitoring.db"
    fi

    # Backup artifacts (optional - can be large)
    if [ "${BACKUP_ARTIFACTS:-yes}" = "yes" ] && [ -d "${ARTIFACTS_DIR}" ]; then
        log_info "Backing up artifacts (this may take a while)..."
        cp -r "${ARTIFACTS_DIR}" "${BACKUP_PATH}/artefactos_implementacao"
    fi

    # Backup logs (last 1000 lines only to save space)
    if [ -d "${LOGS_DIR}" ]; then
        log_info "Backing up logs (last 1000 lines)..."
        mkdir -p "${BACKUP_PATH}/logs"
        for logfile in "${LOGS_DIR}"/*.log; do
            if [ -f "$logfile" ]; then
                tail -1000 "$logfile" > "${BACKUP_PATH}/logs/$(basename "$logfile")"
            fi
        done
    fi

    # Backup Redis (dump.rdb if available)
    if check_redis; then
        log_info "Backing up Redis data..."
        redis-cli SAVE > /dev/null 2>&1 || true
        REDIS_DIR=$(redis-cli CONFIG GET dir | tail -1)
        if [ -f "${REDIS_DIR}/dump.rdb" ]; then
            cp "${REDIS_DIR}/dump.rdb" "${BACKUP_PATH}/dump.rdb"
        fi
    fi

    # Create metadata
    cat > "${BACKUP_PATH}/backup_metadata.json" <<EOF
{
  "backup_name": "${BACKUP_NAME}",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "hostname": "$(hostname)",
  "project_status": "$(check_orchestrator && echo "running" || echo "stopped")"
}
EOF

    # Calculate backup size
    BACKUP_SIZE=$(du -sh "${BACKUP_PATH}" | cut -f1)

    log_success "Backup created: ${BACKUP_PATH}"
    log_info "Backup size: ${BACKUP_SIZE}"

    echo ""
    log_info "To restore: ./project-lifecycle.sh restore ${BACKUP_NAME}"
}

# Restore from backup
restore_project() {
    local BACKUP_NAME="$1"

    if [ -z "$BACKUP_NAME" ]; then
        log_error "Usage: ./project-lifecycle.sh restore <backup_name>"
        echo ""
        log_info "Available backups:"
        ls -1 "${BACKUPS_DIR}" 2>/dev/null || echo "  (no backups found)"
        exit 1
    fi

    local BACKUP_PATH="${BACKUPS_DIR}/${BACKUP_NAME}"

    if [ ! -d "${BACKUP_PATH}" ]; then
        log_error "Backup not found: ${BACKUP_NAME}"
        exit 1
    fi

    log_warning "⚠️  RESTORE OPERATION - This will overwrite current state!"
    log_info "Backup: ${BACKUP_NAME}"
    echo ""
    read -p "Are you sure? (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        log_info "Restore cancelled"
        exit 0
    fi

    # Create pre-restore backup
    log_info "Creating pre-restore backup..."
    backup_project "pre_restore_$(date +%Y%m%d_%H%M%S)"

    # Stop services
    log_info "Stopping services..."
    if check_celery_workers; then
        pkill -KILL -f "celery.*worker" || true
    fi
    if check_orchestrator; then
        pkill -KILL -f "autonomous_meta_orchestrator.py" || true
    fi

    # Restore state
    if [ -d "${BACKUP_PATH}/state" ]; then
        log_info "Restoring state directory..."
        rm -rf "${STATE_DIR}"
        cp -r "${BACKUP_PATH}/state" "${STATE_DIR}"
    fi

    # Restore monitoring database
    if [ -f "${BACKUP_PATH}/monitoring/monitoring.db" ]; then
        log_info "Restoring monitoring database..."
        mkdir -p "$(dirname "${MONITORING_DB}")"
        cp "${BACKUP_PATH}/monitoring/monitoring.db" "${MONITORING_DB}"
    fi

    # Restore artifacts
    if [ -d "${BACKUP_PATH}/artefactos_implementacao" ]; then
        log_info "Restoring artifacts..."
        rm -rf "${ARTIFACTS_DIR}"
        cp -r "${BACKUP_PATH}/artefactos_implementacao" "${ARTIFACTS_DIR}"
    fi

    # Restore Redis
    if [ -f "${BACKUP_PATH}/dump.rdb" ]; then
        log_info "Restoring Redis data..."
        if check_redis; then
            redis-cli SHUTDOWN NOSAVE || true
            sleep 2
        fi
        REDIS_DIR=$(redis-cli CONFIG GET dir 2>/dev/null | tail -1 || echo "/var/lib/redis")
        cp "${BACKUP_PATH}/dump.rdb" "${REDIS_DIR}/dump.rdb"
        redis-server --daemonize yes
        sleep 2
    fi

    log_success "Restore completed: ${BACKUP_NAME}"

    echo ""
    log_info "To start services: ./project-lifecycle.sh resume"
}

# Clean all (reset to initial state)
clean_all() {
    log_warning "🧹 CLEAN ALL - This will reset project to initial state!"
    echo ""
    read -p "Are you sure? This will DELETE all state, artifacts, and logs! (yes/no): " CONFIRM

    if [ "$CONFIRM" != "yes" ]; then
        log_info "Clean cancelled"
        exit 0
    fi

    # Create backup before cleaning
    log_info "Creating backup before clean..."
    backup_project "pre_clean_$(date +%Y%m%d_%H%M%S)"

    # Stop all services
    log_info "Stopping all services..."
    if check_celery_workers; then
        pkill -KILL -f "celery.*worker" || true
    fi
    if check_orchestrator; then
        pkill -KILL -f "autonomous_meta_orchestrator.py" || true
    fi

    # Clear Redis
    if check_redis; then
        log_info "Flushing Redis databases..."
        redis-cli FLUSHALL
    fi

    # Delete state directory
    log_info "Deleting state directory..."
    rm -rf "${STATE_DIR}"
    mkdir -p "${STATE_DIR}"

    # Delete artifacts
    log_info "Deleting artifacts..."
    rm -rf "${ARTIFACTS_DIR}"
    mkdir -p "${ARTIFACTS_DIR}"
    for squad in produto arquitetura engenharia qa deploy; do
        mkdir -p "${ARTIFACTS_DIR}/${squad}"
    done

    # Delete monitoring database
    if [ -f "${MONITORING_DB}" ]; then
        log_info "Deleting monitoring database..."
        rm -f "${MONITORING_DB}"
    fi

    # Delete logs
    log_info "Deleting logs..."
    rm -rf "${LOGS_DIR}"
    mkdir -p "${LOGS_DIR}"

    log_success "Project cleaned successfully"

    echo ""
    log_info "To start fresh: ./meta-squad-bootstrap.sh <session_id>"
}

# Main
main() {
    local OPERATION="$1"
    shift || true

    case "$OPERATION" in
        status)
            show_status
            ;;
        pause)
            pause_project
            ;;
        resume)
            resume_project
            ;;
        backup)
            backup_project "$@"
            ;;
        restore)
            restore_project "$@"
            ;;
        clean-all)
            clean_all
            ;;
        *)
            echo "Usage: $0 <operation> [args]"
            echo ""
            echo "Operations:"
            echo "  status        - Show project status"
            echo "  pause         - Pause project execution"
            echo "  resume        - Resume project execution"
            echo "  backup [name] - Create backup (default: timestamp)"
            echo "  restore <name> - Restore from backup"
            echo "  clean-all     - Reset to initial state (with backup)"
            echo ""
            echo "Examples:"
            echo "  $0 status"
            echo "  $0 pause"
            echo "  $0 resume"
            echo "  $0 backup my_backup"
            echo "  $0 restore 20240101_120000"
            echo "  $0 clean-all"
            exit 1
            ;;
    esac
}

main "$@"
