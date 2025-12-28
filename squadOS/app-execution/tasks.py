#!/usr/bin/env python3
"""
SquadOS Celery Tasks
All tasks executed by Agent Owners via Celery workers

Task Types:
1. execute_owner_task - Execute Agent Owner (Product, Architecture, Frontend, Backend, QA, Infrastructure)
2. execute_verification - Run Verification Agent (obra ow-002 compliance)
3. execute_llm_judge - Run LLM-as-Judge (code quality scoring)
4. execute_qa - Run QA Owner (functional + security tests)
5. execute_debugging - Run Debugging Agent (root cause investigation)
"""

from celery import Task
from celery_app import celery_app
import logging
import time
from datetime import datetime
from typing import Dict, Any, Optional
from pathlib import Path

logger = logging.getLogger(__name__)

# ============================================================================
# Base Task Class (with retry logic and error handling)
# ============================================================================

class BaseSquadTask(Task):
    """
    Base task with automatic retry and structured error handling

    Features:
    - Auto-retry on exceptions (3× max)
    - Exponential backoff with jitter
    - Structured logging
    - Cost tracking hooks
    """
    autoretry_for = (Exception,)
    retry_kwargs = {'max_retries': 3, 'countdown': 60}
    retry_backoff = True
    retry_backoff_max = 600  # 10 minutes
    retry_jitter = True

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Hook called when task is retried"""
        logger.warning(f"Task {self.name}[{task_id}] retrying after error: {exc}")

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Hook called when task fails (after all retries exhausted)"""
        logger.error(f"Task {self.name}[{task_id}] FAILED after retries: {exc}")

    def on_success(self, retval, task_id, args, kwargs):
        """Hook called when task succeeds"""
        logger.info(f"Task {self.name}[{task_id}] completed successfully")

# ============================================================================
# Test Task (Hello World)
# ============================================================================

@celery_app.task(bind=True, name='tasks.hello_world')
def hello_world(self, name: str) -> Dict[str, Any]:
    """
    Hello World test task to validate Celery setup

    Args:
        name: Name to greet

    Returns:
        dict with greeting message and task metadata
    """
    logger.info(f"Hello World task started for '{name}'")

    # Simulate work
    time.sleep(2)

    result = {
        'message': f'Hello, {name}! Welcome to SquadOS.',
        'task_id': self.request.id,
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'success'
    }

    logger.info(f"Hello World task completed: {result['message']}")
    return result

# ============================================================================
# Owner Task (Execute Agent Owner)
# ============================================================================

@celery_app.task(bind=True, base=BaseSquadTask, name='tasks.execute_owner_task')
def execute_owner_task(self, card_id: str, card_type: str, card_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Execute Agent Owner for a card

    Args:
        card_id: Card identifier (e.g., "PROD-001", "ARQ-005")
        card_type: Card type prefix (e.g., "PROD", "ARQ", "FE", "BE", "QA", "INFRA")
        card_data: Full card object from backlog_master.json

    Returns:
        TaskResult dict with status, artifacts, validation info, next_actions

    Agent Routing:
        EPIC, PROD → ProductOwnerAgent
        ARQ, ARCH  → ArchitectureOwnerAgent
        FE         → FrontendOwnerAgent
        BE         → BackendOwnerAgent
        QA         → QAOwnerAgent
        INFRA      → InfrastructureOwnerAgent
    """
    logger.info(f"Executing owner task for card {card_id} (type: {card_type})")

    start_time = time.time()

    # Agent registry (import dynamically to avoid circular deps)
    AGENT_REGISTRY = {
        "EPIC": "product_owner_agent.ProductOwnerAgent",
        "PROD": "product_owner_agent.ProductOwnerAgent",
        "ARQ": "architecture_owner_agent.ArchitectureOwnerAgent",
        "ARCH": "architecture_owner_agent.ArchitectureOwnerAgent",
        "FE": "frontend_owner_agent.FrontendOwnerAgent",
        "BE": "backend_owner_agent.BackendOwnerAgent",
        "QA": "qa_owner_agent.QAOwnerAgent",
        "INFRA": "infrastructure_owner_agent.InfrastructureOwnerAgent",
    }

    # Get agent class
    agent_module_class = AGENT_REGISTRY.get(card_type)
    if not agent_module_class:
        raise ValueError(f"Unknown card type: {card_type}. Valid types: {list(AGENT_REGISTRY.keys())}")

    # Import agent dynamically
    module_name, class_name = agent_module_class.rsplit('.', 1)
    module = __import__(f'agents.{module_name}', fromlist=[class_name])
    agent_class = getattr(module, class_name)

    # Instantiate agent
    agent = agent_class()

    # Execute card
    try:
        logger.info(f"Agent {agent.name} (v{agent.version}) executing card {card_id}")
        result = agent.execute(card_data)

        elapsed_time = time.time() - start_time

        # Structure result as TaskResult
        task_result = {
            'card_id': card_id,
            'status': 'success',
            'stage': result.get('stage', 'unknown'),
            'artifacts': result.get('artifacts', []),
            'validation': None,  # Filled by validation pipeline
            'next_actions': ['verify_evidence'],  # Always verify first
            'error': None,
            'elapsed_time': elapsed_time,
            'cost': result.get('cost', None),
            'agent_name': agent.name,
            'agent_version': agent.version,
        }

        logger.info(f"Card {card_id} completed successfully in {elapsed_time:.2f}s")
        logger.info(f"Artifacts generated: {len(task_result['artifacts'])}")

        return task_result

    except Exception as e:
        logger.error(f"Agent execution failed for card {card_id}: {e}", exc_info=True)

        # Re-raise to trigger Celery retry
        raise

# ============================================================================
# Validation Tasks (Verification, LLM-Judge, QA)
# ============================================================================

@celery_app.task(bind=True, base=BaseSquadTask, name='tasks.execute_verification')
def execute_verification(self, card_id: str, artifacts: list) -> Dict[str, Any]:
    """
    Execute Verification Agent (obra ow-002: Evidence before claims)

    Args:
        card_id: Card identifier
        artifacts: List of artifacts to verify

    Returns:
        ValidationResult dict
    """
    logger.info(f"Running Verification Agent for card {card_id}")

    # Import verification agent
    from agents.verification_agent import VerificationAgent

    agent = VerificationAgent()
    result = agent.execute_card(card_id, artifacts)

    logger.info(f"Verification result for {card_id}: {result['result']}")
    return result

@celery_app.task(bind=True, base=BaseSquadTask, name='tasks.execute_llm_judge')
def execute_llm_judge(self, card_id: str, artifacts: list) -> Dict[str, Any]:
    """
    Execute LLM-as-Judge (code quality scoring with rubrics)

    Args:
        card_id: Card identifier
        artifacts: List of artifacts to evaluate

    Returns:
        ValidationResult dict with score
    """
    logger.info(f"Running LLM-Judge for card {card_id}")

    # Import LLM judge agent
    from agents.llm_judge_agent import LLMJudgeAgent

    agent = LLMJudgeAgent()

    # Determine card type for rubric selection
    card_type_prefix = card_id.split('-')[0]
    if card_type_prefix in ['FE', 'PROD']:
        rubric_type = 'frontend'
    elif card_type_prefix in ['BE', 'ARQ', 'ARCH']:
        rubric_type = 'backend'
    elif card_type_prefix == 'INFRA':
        rubric_type = 'architecture'
    else:
        rubric_type = 'backend'  # default

    result = agent.execute_card(card_id, rubric_type, artifacts)

    logger.info(f"LLM-Judge result for {card_id}: {result['result']} (score: {result.get('score', 'N/A')})")
    return result

@celery_app.task(bind=True, base=BaseSquadTask, name='tasks.execute_qa')
def execute_qa(self, card_id: str, artifacts: list) -> Dict[str, Any]:
    """
    Execute QA Owner (functional tests, security scans, zero-tolerance checks)

    Args:
        card_id: Card identifier
        artifacts: List of artifacts to test

    Returns:
        dict with decision (APPROVED/REJECTED) and reasons
    """
    logger.info(f"Running QA Owner for card {card_id}")

    # Import QA owner agent
    from agents.qa_owner_agent import QAOwnerAgent

    agent = QAOwnerAgent()
    result = agent.execute_card(card_id, artifacts)

    logger.info(f"QA result for {card_id}: {result['decision']}")
    return result

# ============================================================================
# Debugging Task
# ============================================================================

@celery_app.task(bind=True, base=BaseSquadTask, name='tasks.execute_debugging')
def execute_debugging(self, card_id: str, failure_logs: list) -> Dict[str, Any]:
    """
    Execute Debugging Agent (obra ow-006: Root cause investigation)

    Args:
        card_id: Card identifier
        failure_logs: Validation history with failure reasons

    Returns:
        dict with root_cause, fix_suggestions
    """
    logger.info(f"Running Debugging Agent for card {card_id}")

    # Import debugging agent
    from agents.debugging_agent import DebuggingAgent

    agent = DebuggingAgent()
    result = agent.investigate(card_id, failure_logs)

    logger.info(f"Debugging complete for {card_id}: Root cause identified")
    return result

# ============================================================================
# Utility Tasks
# ============================================================================

@celery_app.task(name='tasks.cleanup_expired_results')
def cleanup_expired_results():
    """
    Periodic task to cleanup expired Celery results from Redis
    (Run daily via Celery Beat)
    """
    logger.info("Cleaning up expired Celery results...")

    # Celery automatically expires results after result_expires (1 hour)
    # This task is for additional cleanup if needed

    logger.info("Cleanup complete")
    return {'status': 'success', 'timestamp': datetime.utcnow().isoformat()}
