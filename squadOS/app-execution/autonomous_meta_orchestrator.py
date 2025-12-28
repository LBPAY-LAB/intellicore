#!/usr/bin/env python3
"""
Autonomous Meta-Orchestrator for SquadOS
Coordinates execution of Agent Owners via Celery, manages state machine, and handles validation pipeline

Architecture:
- State Machine: TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED → DONE/CORRECTING/ESCALATED
- Dependency Graph: Cards execute only when dependencies are DONE
- Validation Pipeline: Verification → LLM-Judge + QA (parallel) → Decision
- Correction Loop: Max 3 attempts → Escalate to Tech Lead
- Checkpoint System: Save backlog every N cards (fault tolerance)

Usage:
    orchestrator = MetaOrchestrator(backlog_path="state/backlog_master.json")
    orchestrator.run()
"""

import json
import logging
import time
from pathlib import Path
from typing import Dict, List, Optional, Set
from datetime import datetime
from celery.result import AsyncResult

from models import (
    CardState,
    BacklogMaster,
    TaskResult,
    ValidationResult,
    ValidationHistoryEntry,
    CorrectionCard,
    is_valid_transition,
    create_correction_card_id,
    is_correction_card,
    get_parent_card_id,
)
from tasks import (
    execute_owner_task,
    execute_verification,
    execute_llm_judge,
    execute_qa,
    execute_debugging,
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s [%(name)s] %(message)s',
    handlers=[
        logging.FileHandler('logs/meta_orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class MetaOrchestrator:
    """
    Autonomous Meta-Orchestrator

    Responsibilities:
    1. Load backlog from backlog_master.json
    2. Build dependency graph
    3. Enqueue cards to Celery (respecting dependencies)
    4. Monitor task execution
    5. Run validation pipeline (Verification → LLM-Judge + QA)
    6. Handle state transitions (TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED → DONE)
    7. Create correction cards (max 3 attempts)
    8. Escalate to human after 3 failures
    9. Save checkpoints (fault tolerance)
    10. Emit SSE events to Portal (future)
    """

    VERSION = "1.0.0"

    # Configuration
    MAX_CORRECTION_ATTEMPTS = 3
    CHECKPOINT_INTERVAL = 10  # Save backlog every 10 cards processed
    COST_ALERT_THRESHOLD = 1.0  # USD - alert when card exceeds this
    POLL_INTERVAL = 5  # seconds - how often to check task status

    def __init__(self, backlog_path: str = "state/backlog_master.json"):
        """
        Initialize Meta-Orchestrator

        Args:
            backlog_path: Path to backlog_master.json
        """
        self.backlog_path = Path(backlog_path)
        self.backlog: Optional[BacklogMaster] = None
        self.cards_by_id: Dict[str, CardState] = {}
        self.dependency_graph: Dict[str, Set[str]] = {}  # card_id → set of dependent card_ids
        self.active_tasks: Dict[str, AsyncResult] = {}  # card_id → Celery AsyncResult
        self.processed_count = 0

        logger.info(f"Meta-Orchestrator v{self.VERSION} initialized")
        logger.info(f"Backlog path: {self.backlog_path}")

    # ========================================================================
    # Lifecycle Methods
    # ========================================================================

    def run(self):
        """
        Main orchestration loop

        Flow:
        1. Load backlog
        2. Build dependency graph
        3. Loop:
            - Enqueue ready cards (dependencies satisfied)
            - Monitor active tasks
            - Handle completed tasks (validation pipeline)
            - Update state machine
            - Save checkpoints
            - Exit when all cards DONE or ESCALATED
        """
        logger.info("=" * 80)
        logger.info("Starting Meta-Orchestrator")
        logger.info("=" * 80)

        # Load backlog
        self.load_backlog()

        # Build dependency graph
        self.build_dependency_graph()

        # Main loop
        iteration = 0
        while True:
            iteration += 1
            logger.info(f"\n--- Iteration {iteration} ---")

            # Enqueue ready cards
            enqueued = self.enqueue_ready_cards()
            if enqueued:
                logger.info(f"Enqueued {enqueued} cards")

            # Monitor active tasks
            self.monitor_active_tasks()

            # Check if done
            if self.is_complete():
                logger.info("\n" + "=" * 80)
                logger.info("All cards processed!")
                logger.info("=" * 80)
                self.print_final_statistics()
                break

            # Checkpoint
            if self.processed_count > 0 and self.processed_count % self.CHECKPOINT_INTERVAL == 0:
                self.save_checkpoint()

            # Sleep before next iteration
            time.sleep(self.POLL_INTERVAL)

        # Final save
        self.save_backlog()
        logger.info("Meta-Orchestrator completed successfully")

    def load_backlog(self):
        """Load backlog from JSON file"""
        logger.info(f"Loading backlog from {self.backlog_path}")

        if not self.backlog_path.exists():
            logger.error(f"Backlog file not found: {self.backlog_path}")
            raise FileNotFoundError(f"Backlog file not found: {self.backlog_path}")

        with open(self.backlog_path, 'r', encoding='utf-8') as f:
            self.backlog = json.load(f)

        # Build index
        self.cards_by_id = {card['id']: card for card in self.backlog['cards']}

        logger.info(f"Loaded {len(self.cards_by_id)} cards from backlog")
        logger.info(f"Project: {self.backlog['project']}")
        logger.info(f"Phase: {self.backlog['metadata'].get('phase', 'Unknown')}")

    def save_backlog(self):
        """Save backlog to JSON file"""
        logger.info("Saving backlog...")

        # Update metadata
        self.backlog['metadata']['last_updated'] = datetime.utcnow().isoformat() + 'Z'
        self.backlog['metadata']['generated_by'] = f"autonomous_meta_orchestrator.py v{self.VERSION}"

        # Update statistics
        self.update_statistics()

        # Save to file
        with open(self.backlog_path, 'w', encoding='utf-8') as f:
            json.dump(self.backlog, f, indent=2, ensure_ascii=False)

        logger.info(f"Backlog saved to {self.backlog_path}")

    def save_checkpoint(self):
        """Save checkpoint (intermediate save for fault tolerance)"""
        logger.info(f"Checkpoint: {self.processed_count} cards processed")
        self.save_backlog()

    def build_dependency_graph(self):
        """
        Build dependency graph for topological sorting

        Graph structure:
        dependency_graph[card_id] = set of cards that depend on card_id

        Example:
        PROD-001 depends on EPIC-001
        → dependency_graph['EPIC-001'] = {'PROD-001'}
        """
        logger.info("Building dependency graph...")

        for card in self.backlog['cards']:
            card_id = card['id']
            dependencies = card.get('dependencies', [])

            for dep_id in dependencies:
                if dep_id not in self.dependency_graph:
                    self.dependency_graph[dep_id] = set()
                self.dependency_graph[dep_id].add(card_id)

        logger.info(f"Dependency graph built: {len(self.dependency_graph)} nodes with dependencies")

    # ========================================================================
    # Card Enqueueing Logic
    # ========================================================================

    def enqueue_ready_cards(self) -> int:
        """
        Enqueue cards that are ready to execute

        A card is ready if:
        1. Status = TODO
        2. All dependencies are DONE
        3. Not already in active_tasks

        Returns:
            Number of cards enqueued
        """
        enqueued_count = 0

        for card in self.backlog['cards']:
            card_id = card['id']

            # Skip if not TODO
            if card['status'] != 'TODO':
                continue

            # Skip if already active
            if card_id in self.active_tasks:
                continue

            # Check dependencies
            if not self.are_dependencies_satisfied(card):
                continue

            # Enqueue card
            self.enqueue_card(card)
            enqueued_count += 1

        return enqueued_count

    def are_dependencies_satisfied(self, card: CardState) -> bool:
        """
        Check if all dependencies of a card are satisfied (status = DONE)

        Args:
            card: Card to check

        Returns:
            True if all dependencies are DONE, False otherwise
        """
        dependencies = card.get('dependencies', [])

        for dep_id in dependencies:
            dep_card = self.cards_by_id.get(dep_id)
            if not dep_card:
                logger.warning(f"Dependency {dep_id} not found for card {card['id']}")
                return False

            if dep_card['status'] != 'DONE':
                return False

        return True

    def enqueue_card(self, card: CardState):
        """
        Enqueue card to Celery for execution

        Flow:
        1. Transition TODO → IN_PROGRESS
        2. Create Celery task (execute_owner_task)
        3. Store AsyncResult in active_tasks
        4. Update backlog (started_at, task_id)

        Args:
            card: Card to enqueue
        """
        card_id = card['id']
        card_type = card['type']

        logger.info(f"Enqueuing card {card_id} ({card_type})")

        # Transition state
        self.transition_state(card, 'TODO', 'IN_PROGRESS')

        # Update timestamps
        card['started_at'] = datetime.utcnow().isoformat() + 'Z'

        # Enqueue to Celery
        task_result = execute_owner_task.delay(
            card_id=card_id,
            card_type=card_type,
            card_data=card
        )

        # Store AsyncResult
        self.active_tasks[card_id] = task_result
        card['task_id'] = task_result.id

        logger.info(f"Card {card_id} enqueued to Celery (task_id: {task_result.id})")

    # ========================================================================
    # Task Monitoring & Validation Pipeline
    # ========================================================================

    def monitor_active_tasks(self):
        """
        Monitor active Celery tasks and handle completed ones

        For each active task:
        1. Check if ready (task.ready())
        2. If failed → transition to REJECTED, create correction card
        3. If successful → run validation pipeline
        """
        completed_cards = []

        for card_id, task_result in list(self.active_tasks.items()):
            if not task_result.ready():
                continue

            # Task completed
            completed_cards.append(card_id)
            card = self.cards_by_id[card_id]

            try:
                # Get task result
                task_output: TaskResult = task_result.get(timeout=5)

                logger.info(f"Card {card_id} completed: {task_output['status']}")

                # Transition to VALIDATING
                self.transition_state(card, 'IN_PROGRESS', 'VALIDATING')

                # Update card with artifacts and cost
                card['artifacts'] = task_output.get('artifacts', [])
                self.update_cost_tracking(card, task_output.get('cost'))

                # Run validation pipeline
                self.run_validation_pipeline(card, task_output)

            except Exception as e:
                logger.error(f"Task {card_id} failed with exception: {e}", exc_info=True)

                # Transition to REJECTED
                self.transition_state(card, 'IN_PROGRESS', 'REJECTED')

                # Create correction card
                self.handle_rejection(card, error_message=str(e))

        # Remove completed tasks from active_tasks
        for card_id in completed_cards:
            del self.active_tasks[card_id]
            self.processed_count += 1

    def run_validation_pipeline(self, card: CardState, task_output: TaskResult):
        """
        Run validation pipeline (cascading validation)

        Pipeline:
        1. Verification Agent (blocker) - Evidence checking
        2. If PASSED → LLM-Judge + QA (parallel)
        3. If all PASSED → APPROVED → DONE
        4. If any FAILED → REJECTED → Correction Card (or Escalation)

        Args:
            card: Card being validated
            task_output: Output from Agent Owner
        """
        card_id = card['id']
        logger.info(f"Running validation pipeline for {card_id}")

        # Stage 1: Verification Agent (blocker)
        verification_result = self.run_verification(card, task_output)

        if verification_result['result'] == 'FAILED':
            logger.warning(f"Verification FAILED for {card_id}")
            self.handle_rejection(card, validation_results=[verification_result])
            return

        logger.info(f"Verification PASSED for {card_id}")

        # Stage 2: LLM-Judge + QA (parallel)
        llm_judge_result = self.run_llm_judge(card, task_output)
        qa_result = self.run_qa(card, task_output)

        # Aggregate results
        all_results = [verification_result, llm_judge_result, qa_result]

        # Check if all passed
        if all(r['result'] == 'PASSED' for r in all_results):
            logger.info(f"All validations PASSED for {card_id}")
            self.handle_approval(card, all_results)
        else:
            logger.warning(f"Validation FAILED for {card_id}")
            failed_validators = [r['validator'] for r in all_results if r['result'] == 'FAILED']
            logger.warning(f"Failed validators: {', '.join(failed_validators)}")
            self.handle_rejection(card, validation_results=all_results)

    def run_verification(self, card: CardState, task_output: TaskResult) -> ValidationResult:
        """
        Run Verification Agent (obra ow-002: Evidence before claims)

        Args:
            card: Card being validated
            task_output: Agent Owner output

        Returns:
            ValidationResult
        """
        logger.info(f"Running Verification Agent for {card['id']}")

        try:
            result = execute_verification.delay(
                card_id=card['id'],
                artifacts=task_output.get('artifacts', [])
            ).get(timeout=60)

            return result

        except Exception as e:
            logger.error(f"Verification Agent failed: {e}", exc_info=True)
            return {
                'validator': 'VerificationAgent',
                'result': 'FAILED',
                'score': None,
                'reasons': [f"Verification Agent crashed: {str(e)}"],
                'feedback': {},
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }

    def run_llm_judge(self, card: CardState, task_output: TaskResult) -> ValidationResult:
        """
        Run LLM-Judge (code quality scoring with rubrics)

        Args:
            card: Card being validated
            task_output: Agent Owner output

        Returns:
            ValidationResult
        """
        logger.info(f"Running LLM-Judge for {card['id']}")

        try:
            result = execute_llm_judge.delay(
                card_id=card['id'],
                artifacts=task_output.get('artifacts', [])
            ).get(timeout=120)

            return result

        except Exception as e:
            logger.error(f"LLM-Judge failed: {e}", exc_info=True)
            return {
                'validator': 'LLMJudgeAgent',
                'result': 'FAILED',
                'score': 0.0,
                'reasons': [f"LLM-Judge crashed: {str(e)}"],
                'feedback': {},
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }

    def run_qa(self, card: CardState, task_output: TaskResult) -> ValidationResult:
        """
        Run QA Owner (functional tests, security scans, zero-tolerance checks)

        Args:
            card: Card being validated
            task_output: Agent Owner output

        Returns:
            ValidationResult
        """
        logger.info(f"Running QA Owner for {card['id']}")

        try:
            result = execute_qa.delay(
                card_id=card['id'],
                artifacts=task_output.get('artifacts', [])
            ).get(timeout=300)  # 5 min timeout for tests

            return result

        except Exception as e:
            logger.error(f"QA Owner failed: {e}", exc_info=True)
            return {
                'validator': 'QAOwner',
                'result': 'FAILED',
                'score': None,
                'reasons': [f"QA Owner crashed: {str(e)}"],
                'feedback': {},
                'timestamp': datetime.utcnow().isoformat() + 'Z'
            }

    # ========================================================================
    # Approval & Rejection Handlers
    # ========================================================================

    def handle_approval(self, card: CardState, validation_results: List[ValidationResult]):
        """
        Handle card approval (all validations passed)

        Flow:
        1. Add validation results to history
        2. Transition VALIDATING → APPROVED → DONE
        3. Mark completed_at
        4. Enqueue dependent cards

        Args:
            card: Card that passed validation
            validation_results: List of validation results
        """
        card_id = card['id']
        logger.info(f"Card {card_id} APPROVED ✅")

        # Add validation results to history
        for result in validation_results:
            entry: ValidationHistoryEntry = {
                'attempt': card['correction_attempts'] + 1,
                'validator': result['validator'],
                'result': result['result'],
                'score': result.get('score'),
                'reasons': result.get('reasons', []),
                'feedback': result.get('feedback', {}),
                'timestamp': result['timestamp'],
                'agent_version': result.get('agent_version', 'unknown')
            }
            card['validation_history'].append(entry)

        # Transition to DONE
        self.transition_state(card, 'VALIDATING', 'APPROVED')
        self.transition_state(card, 'APPROVED', 'DONE')

        # Mark completed
        card['completed_at'] = datetime.utcnow().isoformat() + 'Z'

        logger.info(f"Card {card_id} marked as DONE")

    def handle_rejection(self, card: CardState, validation_results: Optional[List[ValidationResult]] = None, error_message: Optional[str] = None):
        """
        Handle card rejection (validation failed or agent crashed)

        Flow:
        1. Add validation results to history
        2. Transition VALIDATING → REJECTED
        3. If attempts < 3 → Create correction card → CORRECTING
        4. If attempts = 3 → ESCALATED (human review)

        Args:
            card: Card that was rejected
            validation_results: List of validation results (if available)
            error_message: Error message (if agent crashed)
        """
        card_id = card['id']
        logger.warning(f"Card {card_id} REJECTED ❌")

        # Add validation results to history
        if validation_results:
            for result in validation_results:
                entry: ValidationHistoryEntry = {
                    'attempt': card['correction_attempts'] + 1,
                    'validator': result['validator'],
                    'result': result['result'],
                    'score': result.get('score'),
                    'reasons': result.get('reasons', []),
                    'feedback': result.get('feedback', {}),
                    'timestamp': result['timestamp'],
                    'agent_version': result.get('agent_version', 'unknown')
                }
                card['validation_history'].append(entry)

        # Transition to REJECTED
        self.transition_state(card, 'VALIDATING', 'REJECTED')

        # Increment correction attempts
        card['correction_attempts'] += 1

        # Check if max attempts reached
        if card['correction_attempts'] >= self.MAX_CORRECTION_ATTEMPTS:
            logger.warning(f"Card {card_id} reached max correction attempts ({self.MAX_CORRECTION_ATTEMPTS})")
            self.escalate_card(card, validation_results)
        else:
            logger.info(f"Creating correction card for {card_id} (attempt {card['correction_attempts']})")
            self.create_correction_card(card, validation_results)
            self.transition_state(card, 'REJECTED', 'CORRECTING')

    def create_correction_card(self, parent_card: CardState, validation_results: Optional[List[ValidationResult]]):
        """
        Create correction card when validation fails

        Correction card:
        - ID: {parent_id}-CORR-{attempt} (e.g., PROD-001-CORR-1)
        - Title: "[CORRECTION {attempt}] {parent_title}"
        - Description: What needs to be fixed (from validation feedback)
        - Acceptance Criteria: Validation feedback as actionable items

        Args:
            parent_card: Original card that failed
            validation_results: Validation results with feedback
        """
        parent_id = parent_card['id']
        attempt = parent_card['correction_attempts']
        correction_id = create_correction_card_id(parent_id, attempt)

        logger.info(f"Creating correction card {correction_id}")

        # Aggregate feedback from all validators
        aggregated_feedback = {}
        failure_reasons = []

        if validation_results:
            for result in validation_results:
                if result['result'] == 'FAILED':
                    failure_reasons.extend(result.get('reasons', []))
                    aggregated_feedback.update(result.get('feedback', {}))

        # Create description
        description = f"Corrigir issues identificados na validação (tentativa {attempt}):\n\n"
        for i, reason in enumerate(failure_reasons, 1):
            description += f"{i}. {reason}\n"
        description += "\nVer feedback detalhado em validation_feedback."

        # Create acceptance criteria from feedback
        acceptance_criteria = [
            f"{category}: {action}"
            for category, action in aggregated_feedback.items()
        ]
        acceptance_criteria.append("Score LLM-Judge ≥8.0")
        acceptance_criteria.append("Todos os validadores passam")

        # Create correction card
        correction_card: CorrectionCard = {
            'id': correction_id,
            'parent_card': parent_id,
            'attempt': attempt,
            'type': parent_card['type'],
            'title': f"[CORRECTION {attempt}] {parent_card['title']}",
            'description': description,
            'acceptance_criteria': acceptance_criteria,
            'validation_feedback': aggregated_feedback,
            'priority': parent_card['priority'],
            'effort': f"{int(parent_card['effort'].split()[0]) // 2} story points",  # Half effort
            'status': 'TODO',
            'assigned_to': parent_card['assigned_to'],
            'dependencies': [parent_id],
            'created_at': datetime.utcnow().isoformat() + 'Z',
            'task_id': None,
            'validation_history': [],
            'correction_attempts': attempt,
            'cost_tracking': {
                'total_tokens': 0,
                'total_cost': 0.0,
                'attempts': [],
                'alerts': []
            },
            'escalated': False,
            'escalation_reason': None,
            'artifacts': [],
            'started_at': None,
            'completed_at': None,
        }

        # Add to backlog
        self.backlog['cards'].append(correction_card)
        self.cards_by_id[correction_id] = correction_card

        logger.info(f"Correction card {correction_id} created and added to backlog")

    def escalate_card(self, card: CardState, validation_results: Optional[List[ValidationResult]]):
        """
        Escalate card to human review (Tech Lead) after max attempts

        Flow:
        1. Transition REJECTED → ESCALATED
        2. Set escalation_reason with summary of failures
        3. Log warning for human attention

        Args:
            card: Card that failed max attempts
            validation_results: Validation history
        """
        card_id = card['id']
        logger.warning(f"ESCALATING card {card_id} to Tech Lead after {self.MAX_CORRECTION_ATTEMPTS} failed attempts")

        # Build escalation reason
        failure_summary = []
        if validation_results:
            for result in validation_results:
                if result['result'] == 'FAILED':
                    failure_summary.append(f"{result['validator']}: {', '.join(result.get('reasons', []))}")

        escalation_reason = (
            f"Max correction attempts ({self.MAX_CORRECTION_ATTEMPTS}) reached. "
            f"Repeated failures suggest architectural or fundamental issue. "
            f"Tech Lead review required.\n\n"
            f"Failure summary:\n" + "\n".join(f"- {s}" for s in failure_summary)
        )

        # Update card
        card['escalated'] = True
        card['escalation_reason'] = escalation_reason
        self.transition_state(card, 'REJECTED', 'ESCALATED')

        logger.warning(f"Card {card_id} ESCALATED - Human review required")
        logger.warning(f"Escalation reason: {escalation_reason}")

    # ========================================================================
    # State Machine
    # ========================================================================

    def transition_state(self, card: CardState, from_state: str, to_state: str):
        """
        Transition card state (with validation)

        Args:
            card: Card to transition
            from_state: Expected current state
            to_state: Target state

        Raises:
            ValueError: If transition is invalid
        """
        card_id = card['id']
        current_state = card['status']

        # Validate current state matches expectation
        if current_state != from_state:
            logger.warning(f"State mismatch for {card_id}: expected {from_state}, got {current_state}")

        # Validate transition is allowed
        if not is_valid_transition(from_state, to_state):
            raise ValueError(f"Invalid transition for {card_id}: {from_state} → {to_state}")

        # Transition
        card['status'] = to_state
        logger.info(f"Card {card_id}: {from_state} → {to_state}")

    # ========================================================================
    # Cost Tracking
    # ========================================================================

    def update_cost_tracking(self, card: CardState, cost_data: Optional[Dict[str, float]]):
        """
        Update cost tracking for a card

        Args:
            card: Card to update
            cost_data: Cost data from Agent Owner (input_tokens, output_tokens, total_cost)
        """
        if not cost_data:
            return

        attempt = card['correction_attempts'] + 1

        # Add to attempts
        cost_entry = {
            'attempt': attempt,
            'input_tokens': cost_data.get('input_tokens', 0),
            'output_tokens': cost_data.get('output_tokens', 0),
            'total_cost': cost_data.get('total_cost', 0.0),
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }
        card['cost_tracking']['attempts'].append(cost_entry)

        # Update totals
        card['cost_tracking']['total_tokens'] += cost_entry['input_tokens'] + cost_entry['output_tokens']
        card['cost_tracking']['total_cost'] += cost_entry['total_cost']

        # Alert if threshold exceeded
        if card['cost_tracking']['total_cost'] >= self.COST_ALERT_THRESHOLD:
            alert_msg = f"Exceeded ${self.COST_ALERT_THRESHOLD} threshold at attempt {attempt}"
            if alert_msg not in card['cost_tracking']['alerts']:
                card['cost_tracking']['alerts'].append(alert_msg)
                logger.warning(f"Card {card['id']}: {alert_msg}")

    # ========================================================================
    # Statistics & Completion
    # ========================================================================

    def update_statistics(self):
        """Update backlog statistics"""
        stats = {
            'by_status': {},
            'by_type': {},
            'total_cost': 0.0,
            'escalated_count': 0,
            'avg_correction_attempts': 0.0,
            'validation_pass_rate': 0.0
        }

        total_attempts = 0
        total_validations = 0
        passed_validations = 0

        for card in self.backlog['cards']:
            # By status
            status = card['status']
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1

            # By type
            card_type = card['type']
            stats['by_type'][card_type] = stats['by_type'].get(card_type, 0) + 1

            # Total cost
            stats['total_cost'] += card['cost_tracking']['total_cost']

            # Escalated count
            if card['escalated']:
                stats['escalated_count'] += 1

            # Average correction attempts
            total_attempts += card['correction_attempts']

            # Validation pass rate
            for entry in card['validation_history']:
                total_validations += 1
                if entry['result'] == 'PASSED':
                    passed_validations += 1

        # Calculate averages
        if self.backlog['cards']:
            stats['avg_correction_attempts'] = total_attempts / len(self.backlog['cards'])
        if total_validations > 0:
            stats['validation_pass_rate'] = passed_validations / total_validations

        self.backlog['statistics'] = stats

    def is_complete(self) -> bool:
        """
        Check if orchestration is complete

        Complete when all cards are in terminal states: DONE or ESCALATED

        Returns:
            True if complete, False otherwise
        """
        for card in self.backlog['cards']:
            if card['status'] not in ['DONE', 'ESCALATED']:
                return False
        return True

    def print_final_statistics(self):
        """Print final statistics"""
        stats = self.backlog['statistics']

        logger.info("\n" + "=" * 80)
        logger.info("FINAL STATISTICS")
        logger.info("=" * 80)
        logger.info(f"Total cards: {len(self.backlog['cards'])}")
        logger.info(f"\nBy status:")
        for status, count in sorted(stats['by_status'].items()):
            logger.info(f"  {status}: {count}")
        logger.info(f"\nBy type:")
        for card_type, count in sorted(stats['by_type'].items()):
            logger.info(f"  {card_type}: {count}")
        logger.info(f"\nTotal cost: ${stats['total_cost']:.2f}")
        logger.info(f"Escalated cards: {stats['escalated_count']}")
        logger.info(f"Avg correction attempts: {stats['avg_correction_attempts']:.2f}")
        logger.info(f"Validation pass rate: {stats['validation_pass_rate']:.1%}")
        logger.info("=" * 80 + "\n")


# ============================================================================
# CLI Entry Point
# ============================================================================

if __name__ == '__main__':
    import sys

    # Parse arguments
    backlog_path = sys.argv[1] if len(sys.argv) > 1 else "state/backlog_master.json"

    # Create orchestrator
    orchestrator = MetaOrchestrator(backlog_path=backlog_path)

    # Run
    try:
        orchestrator.run()
    except KeyboardInterrupt:
        logger.info("\nOrchestration interrupted by user")
        orchestrator.save_backlog()
        sys.exit(0)
    except Exception as e:
        logger.error(f"Orchestration failed: {e}", exc_info=True)
        orchestrator.save_backlog()
        sys.exit(1)
