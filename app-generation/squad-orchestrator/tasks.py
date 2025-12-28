"""
Celery Tasks for Squad Orchestrator

This module defines Celery tasks for distributed card execution with progress reporting.
"""

import os
import sys
import json
import time
import subprocess
import sqlite3
import redis
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional
from celery import Task
from celery.utils.log import get_task_logger

from celery_app import celery_app
from milestone_loader import create_progress_context_for_card_with_config
from progress_detector import create_progress_detector

# Setup paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
REPO_ROOT = PROJECT_ROOT
STATE_DIR = SCRIPT_DIR / "state"
DB_PATH = SCRIPT_DIR / "monitoring" / "data" / "monitoring.db"
BACKLOG_FILE = STATE_DIR / "backlog_master.json"

# Setup logger
logger = get_task_logger(__name__)

# Redis client for real-time updates
redis_client = redis.Redis(host='localhost', port=6379, db=2, decode_responses=True)

# Agent mapping
AGENT_MAP = {
    "produto": "product-owner.md",
    "arquitetura": "tech-lead.md",
    "engenharia": "backend-lead.md",
    "qa": "qa-lead.md",
    "deploy": "deploy-lead.md"
}

AGENTS_DIR = PROJECT_ROOT / ".claude" / "agents" / "management"


class ProgressReportingTask(Task):
    """Custom Celery task with progress reporting and logging"""

    def __init__(self):
        super().__init__()
        self.start_time = None

    def before_start(self, task_id, args, kwargs):
        """Called before task execution starts"""
        self.start_time = time.time()
        logger.info(f"🚀 Task {task_id} starting with args={args}")

    def on_success(self, retval, task_id, args, kwargs):
        """Called when task succeeds"""
        elapsed = time.time() - self.start_time if self.start_time else 0
        logger.info(f"✅ Task {task_id} succeeded in {elapsed:.2f}s")

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called when task fails"""
        elapsed = time.time() - self.start_time if self.start_time else 0
        logger.error(f"❌ Task {task_id} failed after {elapsed:.2f}s: {exc}")

    def update_progress(self, card_id: str, progress: int, current_step: str, extra: Optional[Dict] = None):
        """Update task progress and publish to Redis for WebSocket"""
        elapsed = time.time() - self.start_time if self.start_time else 0

        # Update Celery state
        self.update_state(
            state='PROGRESS',
            meta={
                'card_id': card_id,
                'progress': progress,
                'current_step': current_step,
                'elapsed': elapsed,
                'worker': os.getenv('HOSTNAME', 'worker-1'),
                'timestamp': datetime.now().isoformat(),
                **(extra or {})
            }
        )

        # Publish to Redis pub/sub for WebSocket
        redis_client.publish('task_updates', json.dumps({
            'type': 'progress',
            'task_id': self.request.id,
            'card_id': card_id,
            'progress': progress,
            'current_step': current_step,
            'elapsed': elapsed,
            'timestamp': datetime.now().isoformat()
        }))

        logger.info(f"📊 Progress: {card_id} - {progress}% - {current_step}")

    def log_message(self, card_id: str, level: str, message: str):
        """Stream logs to Redis for real-time viewing"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'message': message,
            'task_id': self.request.id
        }

        # Store in Redis list (for history)
        redis_client.rpush(f"task:logs:{card_id}", json.dumps(log_entry))
        redis_client.expire(f"task:logs:{card_id}", 86400)  # Expire after 24h

        # Publish to Redis pub/sub (for WebSocket)
        redis_client.publish('task_updates', json.dumps({
            'type': 'log',
            'card_id': card_id,
            'log': log_entry
        }))

        # Also log to Celery logger
        getattr(logger, level.lower(), logger.info)(f"[{card_id}] {message}")


@celery_app.task(base=ProgressReportingTask, bind=True, time_limit=1800, soft_time_limit=1700, max_retries=3)
def execute_card_task(self, card_id: str) -> Dict[str, Any]:
    """
    Execute a card using Claude agent with progress reporting

    Special routing:
    - EPIC-001: Uses Production-Grade Product Owner Agent (direct API)
    - All other cards: Uses subprocess claude agent run

    Args:
        card_id: Card ID to execute

    Returns:
        Dict with execution result
    """
    try:
        # Load card from backlog
        self.update_progress(card_id, 0, "Loading card from backlog...")
        card = load_card_from_backlog(card_id)

        if not card:
            raise ValueError(f"Card {card_id} not found in backlog")

        self.log_message(card_id, 'INFO', f"Loaded card: {card['title']}")

        # SPECIAL ROUTING: EPIC-001 uses Production-Grade Product Owner Agent
        if card_id == "EPIC-001":
            self.log_message(card_id, 'INFO', "🎯 EPIC-001 detected - using Production-Grade Product Owner Agent")
            return _execute_product_owner_agent(self, card_id, card)

        # All other cards use standard subprocess approach
        return _execute_standard_agent(self, card_id, card)

    except Exception as e:
        self.log_message(card_id, 'ERROR', f"Task exception: {str(e)}")

        # Reset card to TODO
        update_card_status_in_db(card_id, "TODO", assigned_to=None, celery_task_id=None)

        # Retry logic
        if self.request.retries < self.max_retries:
            self.log_message(card_id, 'INFO', f"Retrying... (attempt {self.request.retries + 1}/{self.max_retries})")
            raise self.retry(exc=e, countdown=60)  # Retry after 60s

        return {
            "status": "error",
            "card_id": card_id,
            "message": str(e),
            "elapsed": time.time() - self.start_time if self.start_time else 0
        }


def _execute_product_owner_agent(self, card_id: str, card: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute EPIC-001 using Production-Grade Product Owner Agent

    This agent autonomously:
    1. Reads ALL documentation (requisitos_funcionais, arquitetura, stack)
    2. Analyzes deeply using Anthropic Claude API
    3. Generates 50-80+ comprehensive product cards
    4. Creates all artifacts (wireframes, user stories, backlog)

    NO MOCKS. REAL PRODUCTION IMPLEMENTATION.
    """
    try:
        # Import Product Owner Agent
        self.update_progress(card_id, 5, "Loading Product Owner Agent...")
        from agents.product_owner_agent import execute_product_owner_card

        # Update card status to IN_PROGRESS
        self.update_progress(card_id, 10, "Marking card as IN_PROGRESS...")
        update_card_status_in_db(card_id, "IN_PROGRESS", assigned_to="product-owner-agent", celery_task_id=self.request.id)

        # Execute Product Owner Agent
        self.update_progress(card_id, 15, "Starting Product Owner Agent...")
        self.log_message(card_id, 'INFO', "🤖 Executing Production-Grade Product Owner Agent")
        self.log_message(card_id, 'INFO', "📚 Agent will read: requisitos_funcionais, arquitetura, stack")
        self.log_message(card_id, 'INFO', "🧠 Agent will analyze documentation using Anthropic Claude API")
        self.log_message(card_id, 'INFO', "📋 Agent will generate 50-80+ product cards")

        # Execute (this is a long-running operation - 5-10 minutes expected)
        self.update_progress(card_id, 20, "Agent analyzing documentation...")
        result = execute_product_owner_card(card_id, card)

        # Check result
        if result.get('success'):
            cards_generated = result.get('cards_generated', 0)
            self.log_message(card_id, 'INFO', f"✅ Product Owner Agent completed successfully!")
            self.log_message(card_id, 'INFO', f"📊 Generated {cards_generated} product cards")
            self.log_message(card_id, 'INFO', f"📄 Created {len(result.get('artifacts', []))} artifacts")
            self.log_message(card_id, 'INFO', f"💾 Backlog saved to: {result.get('backlog_path')}")

            self.update_progress(card_id, 100, "Completed!")

            # Update card status to DONE
            update_card_status_in_db(card_id, "DONE", celery_task_id=self.request.id)

            return {
                "status": "success",
                "card_id": card_id,
                "message": f"Product Owner Agent completed - Generated {cards_generated} cards",
                "cards_generated": cards_generated,
                "artifacts_created": len(result.get('artifacts', [])),
                "elapsed": time.time() - self.start_time
            }
        else:
            error_msg = result.get('error', 'Unknown error')
            self.log_message(card_id, 'ERROR', f"Product Owner Agent failed: {error_msg}")

            # Reset card to TODO
            update_card_status_in_db(card_id, "TODO", assigned_to=None, celery_task_id=None)

            return {
                "status": "failure",
                "card_id": card_id,
                "message": f"Product Owner Agent failed: {error_msg}",
                "elapsed": time.time() - self.start_time
            }

    except Exception as e:
        self.log_message(card_id, 'ERROR', f"Product Owner Agent exception: {str(e)}")
        import traceback
        self.log_message(card_id, 'ERROR', f"Traceback: {traceback.format_exc()}")

        # Reset card to TODO
        update_card_status_in_db(card_id, "TODO", assigned_to=None, celery_task_id=None)

        raise


def _execute_standard_agent(self, card_id: str, card: Dict[str, Any]) -> Dict[str, Any]:
    """Execute card using standard subprocess claude agent run approach"""

    # Create progress context with milestone configuration
    self.update_progress(card_id, 5, "Loading milestone configuration...")
    progress_context = create_progress_context_for_card_with_config(card)
    progress_detector = create_progress_detector(progress_context)
    self.log_message(card_id, 'INFO', f"Milestone: {progress_context.milestone.name} (Phase {progress_context.milestone.phase})")
    self.log_message(card_id, 'INFO', f"Deliverables: {progress_context.milestone.total_deliverables}")

    # Get agent file
    self.update_progress(card_id, 10, "Selecting agent...")
    agent_file = get_agent_file_path(card['squad'])

    if not agent_file or not agent_file.exists():
        raise ValueError(f"Agent not found for squad: {card['squad']}")

    self.log_message(card_id, 'INFO', f"Using agent: {agent_file.name}")

    # Update card status to IN_PROGRESS
    self.update_progress(card_id, 15, "Marking card as IN_PROGRESS...")
    update_card_status_in_db(card_id, "IN_PROGRESS", assigned_to=agent_file.stem, celery_task_id=self.request.id)

    # Build prompt
    self.update_progress(card_id, 20, "Building prompt...")
    prompt = build_agent_prompt(card)
    self.log_message(card_id, 'DEBUG', f"Prompt length: {len(prompt)} chars")

    # Execute Claude agent
    self.update_progress(card_id, 25, "Starting Claude agent...")
    self.log_message(card_id, 'INFO', f"Executing: claude agent run {agent_file}")

    cmd = ["claude", "agent", "run", str(agent_file)]

    process = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=REPO_ROOT,
        text=True
    )

    self.log_message(card_id, 'INFO', f"Spawned process PID: {process.pid}")

    # Monitor execution with incremental output reading
    self.update_progress(card_id, 30, "Agent executing...")

    stdout_lines = []
    stderr_lines = []

    # Send input
    try:
        process.stdin.write(prompt)
        process.stdin.close()
    except Exception as e:
        self.log_message(card_id, 'ERROR', f"Error writing to stdin: {e}")

    # Read output incrementally
    import select
    import fcntl

    # Set stdout and stderr to non-blocking
    for stream in [process.stdout, process.stderr]:
        fd = stream.fileno()
        fl = fcntl.fcntl(fd, fcntl.F_GETFL)
        fcntl.fcntl(fd, fcntl.F_SETFL, fl | os.O_NONBLOCK)

    start_time = time.time()
    last_update = start_time
    timeout_seconds = 1700  # Soft timeout

    while process.poll() is None:
        current_time = time.time()

        # Check soft timeout
        if current_time - start_time > timeout_seconds:
            self.log_message(card_id, 'ERROR', f"Soft timeout reached ({timeout_seconds}s)")
            process.kill()
            process.wait(timeout=5)
            raise TimeoutError(f"Card execution exceeded {timeout_seconds}s")

        # Read available output
        try:
            line = process.stdout.readline()
            if line:
                stdout_lines.append(line)
                self.log_message(card_id, 'INFO', line.strip())

                # Process line with progress detector for intelligent progress tracking
                changes = progress_detector.process_log_line(line)
                if changes:
                    # Update context and report detailed progress
                    progress_percentage = progress_context.overall_progress_percentage
                    current_step = progress_context.current_step

                    # Build detailed progress message
                    extra_info = {
                        'milestone_phase': progress_context.milestone.phase,
                        'milestone_name': progress_context.milestone.name,
                        'deliverable_index': progress_context.milestone.current_deliverable_index,
                        'deliverable_name': progress_context.current_deliverable.name if progress_context.current_deliverable else None,
                        'files_modified_count': len(progress_context.files_modified),
                        'dependencies_blocked': len(progress_context.dependencies_waiting),
                        'progress_context': progress_context.to_dict()
                    }

                    self.update_progress(card_id, progress_percentage, current_step, extra=extra_info)

                    # Log file modifications
                    if 'file_modified' in changes:
                        self.log_message(card_id, 'DEBUG', f"📝 File modified: {changes['file_modified']}")

                    # Log deliverable transitions
                    if 'deliverable_detected' in changes:
                        self.log_message(card_id, 'INFO', f"🎯 Working on deliverable: {changes['deliverable_detected']}")

        except Exception:
            pass  # Non-blocking read, ignore if no data

        try:
            err_line = process.stderr.readline()
            if err_line:
                stderr_lines.append(err_line)
                self.log_message(card_id, 'WARNING', err_line.strip())
        except Exception:
            pass

        # Update progress periodically with detailed context
        if current_time - last_update > 10:
            elapsed = current_time - start_time

            # Use intelligent progress from context instead of linear estimation
            progress_percentage = progress_context.overall_progress_percentage

            # If no progress detected, fall back to linear estimation (capped at 85%)
            if progress_percentage <= progress_context.milestone.min_progress:
                progress_percentage = min(85, 30 + int((elapsed / timeout_seconds) * 55))

            # Build detailed status message
            current_step = progress_context.current_step
            if not current_step or current_step == "Initializing...":
                current_step = f"Agent working... ({int(elapsed)}s elapsed)"

            extra_info = {
                'milestone_phase': progress_context.milestone.phase,
                'milestone_name': progress_context.milestone.name,
                'deliverable_index': progress_context.milestone.current_deliverable_index,
                'deliverable_name': progress_context.current_deliverable.name if progress_context.current_deliverable else None,
                'files_modified_count': len(progress_context.files_modified),
                'dependencies_blocked': len(progress_context.dependencies_waiting),
                'elapsed_seconds': elapsed,
                'eta_seconds': progress_context.estimate_eta(),
                'progress_context': progress_context.to_dict()
            }

            self.update_progress(card_id, progress_percentage, current_step, extra=extra_info)
            last_update = current_time

        time.sleep(0.5)

    # Process finished
    stdout = ''.join(stdout_lines)
    stderr = ''.join(stderr_lines)

    self.update_progress(card_id, 95, "Checking execution result...")

    # Check if successful
    if "✅ CARD COMPLETED" in stdout or process.returncode == 0:
        self.log_message(card_id, 'INFO', "✅ Card execution completed successfully!")
        self.update_progress(card_id, 100, "Completed!")

        # Update card status to DONE
        update_card_status_in_db(card_id, "DONE", celery_task_id=self.request.id)

        return {
            "status": "success",
            "card_id": card_id,
            "message": "Card completed successfully",
            "elapsed": time.time() - self.start_time
        }
    else:
        self.log_message(card_id, 'ERROR', f"Card execution failed. Return code: {process.returncode}")
        self.log_message(card_id, 'ERROR', f"stderr: {stderr[:500]}")

        # Reset card to TODO
        update_card_status_in_db(card_id, "TODO", assigned_to=None, celery_task_id=None)

        return {
            "status": "failure",
            "card_id": card_id,
            "message": f"Card execution failed: {stderr[:200]}",
            "elapsed": time.time() - self.start_time
        }


# Helper functions

def load_card_from_backlog(card_id: str) -> Optional[Dict[str, Any]]:
    """Load card from backlog JSON"""
    try:
        with open(BACKLOG_FILE, 'r', encoding='utf-8') as f:
            backlog = json.load(f)

        for card in backlog.get('cards', []):
            if card['card_id'] == card_id:
                return card

        return None
    except Exception as e:
        logger.error(f"Error loading backlog: {e}")
        return None


def get_agent_file_path(squad: str) -> Optional[Path]:
    """Get agent file path for squad"""
    agent_filename = AGENT_MAP.get(squad)
    if not agent_filename:
        return None

    agent_path = AGENTS_DIR / agent_filename
    return agent_path if agent_path.exists() else None


def build_agent_prompt(card: Dict[str, Any]) -> str:
    """Build prompt for Claude agent"""
    return f"""
🎯 **CARD: {card['card_id']}**

**Title**: {card['title']}

**Description**:
{card['description']}

**Acceptance Criteria**:
{chr(10).join(f'- {criteria}' for criteria in card.get('acceptance_criteria', []))}

**Priority**: {card.get('priority', 'MEDIUM')}
**Phase**: {card.get('phase', 1)}

---

**YOUR TASK**:
Execute this card following CLAUDE.md guidelines:

1. Read required documentation from Supercore_v2.0/DOCUMENTACAO_BASE/
2. Create deliverables in artefactos_implementacao/{card['squad']}/
3. Follow zero-tolerance policy (no mocks, no TODOs, full testing)
4. When done, respond with "✅ CARD COMPLETED" in your final message

**IMPORTANT**:
- Work autonomously - do not ask for confirmation unless absolutely necessary
- Create real, production-ready artifacts
- Document everything you create
- Follow the stack defined in stack_supercore_v2.0.md
"""


def update_card_status_in_db(card_id: str, status: str, assigned_to: Optional[str] = None,
                              celery_task_id: Optional[str] = None):
    """Update card status in SQLite database"""
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()

        # Update card
        fields = ["status = ?", "updated_at = ?"]
        values = [status, datetime.now().isoformat()]

        if assigned_to is not None:
            fields.append("agent = ?")
            values.append(assigned_to)

        if status == "IN_PROGRESS":
            fields.append("started_at = ?")
            values.append(datetime.now().isoformat())
        elif status == "DONE":
            fields.append("completed_at = ?")
            values.append(datetime.now().isoformat())

        values.append(card_id)

        cursor.execute(f"""
            UPDATE cards
            SET {', '.join(fields)}
            WHERE card_id = ?
        """, tuple(values))

        conn.commit()
        conn.close()

        logger.info(f"✅ Updated card {card_id} status to {status}")

    except Exception as e:
        logger.error(f"❌ Error updating card status: {e}")


@celery_app.task
def cleanup_old_logs(days: int = 7):
    """Cleanup old task logs from Redis"""
    cutoff = time.time() - (days * 86400)

    keys = redis_client.keys("task:logs:*")
    deleted = 0

    for key in keys:
        # Check if key is old
        ttl = redis_client.ttl(key)
        if ttl < 0 or ttl > 86400:  # No TTL or > 1 day
            redis_client.delete(key)
            deleted += 1

    logger.info(f"🧹 Cleaned up {deleted} old log keys")
    return {"deleted": deleted}
