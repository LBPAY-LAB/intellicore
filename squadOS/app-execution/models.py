#!/usr/bin/env python3
"""
SquadOS Data Models
Type definitions for orchestration, validation, and card management

Models:
- TaskResult: Output from Agent Owner execution
- ValidationResult: Output from validation pipeline (Verification/LLMJudge/QA)
- CardState: Backlog card with extended metadata
- CorrectionCard: Card created when validation fails
"""

from typing import TypedDict, Literal, Optional, List, Dict, Any
from datetime import datetime


# ============================================================================
# Agent Execution Results
# ============================================================================

class TaskResult(TypedDict):
    """
    Result from Agent Owner execution (returned by Celery task)

    Used by: execute_owner_task()
    Flow: Meta-Orchestrator → Celery → Agent → TaskResult → Validation Pipeline

    Fields:
        card_id: Card identifier (PROD-001, ARQ-005, etc)
        status: Execution outcome (success, failed, rejected)
        stage: Current stage in agent workflow
        artifacts: Generated files/outputs
        validation: Validation results (None until validation runs)
        next_actions: What should happen next (verify_evidence, etc)
        error: Error message if status=failed
        elapsed_time: Execution time in seconds
        cost: LLM API cost breakdown
        agent_name: Which agent executed (ProductOwnerAgent, etc)
        agent_version: Agent version (for debugging)
    """
    card_id: str
    status: Literal["success", "failed", "rejected"]
    stage: str
    artifacts: List[Dict[str, str]]  # [{"type": "user_story", "path": "..."}, ...]
    validation: Optional['ValidationResult']  # Filled after validation pipeline
    next_actions: List[str]  # ["verify_evidence", "llm_judge", "qa_tests"]
    error: Optional[str]
    elapsed_time: float
    cost: Optional[Dict[str, float]]  # {"input_tokens": 1000, "output_tokens": 500, "total_cost": 0.05}
    agent_name: str
    agent_version: str


# ============================================================================
# Validation Results
# ============================================================================

class ValidationResult(TypedDict):
    """
    Result from validation pipeline (Verification/LLMJudge/QA)

    Used by: execute_verification(), execute_llm_judge(), execute_qa()
    Flow: TaskResult → Validation Pipeline → ValidationResult → State Transition

    Fields:
        validator: Which validator ran (VerificationAgent, LLMJudgeAgent, QAOwner)
        result: Validation outcome (PASSED, FAILED)
        score: Quality score (0-10, only for LLMJudge)
        reasons: List of failure reasons or success notes
        feedback: Actionable feedback per category
        timestamp: When validation ran (ISO 8601)
    """
    validator: str  # "VerificationAgent", "LLMJudgeAgent", "QAOwner"
    result: Literal["PASSED", "FAILED"]
    score: Optional[float]  # 0-10 (LLMJudge only)
    reasons: List[str]  # ["Missing test evidence", "Build failed", ...]
    feedback: Dict[str, str]  # {"tests": "Add integration tests", "lint": "Fix 3 errors"}
    timestamp: str  # ISO 8601


# ============================================================================
# Card State (Extended backlog_master.json schema)
# ============================================================================

class ValidationHistoryEntry(TypedDict):
    """Single validation attempt entry"""
    attempt: int  # 1, 2, 3
    validator: str  # "VerificationAgent", "LLMJudgeAgent", "QAOwner"
    result: Literal["PASSED", "FAILED"]
    score: Optional[float]
    reasons: List[str]
    feedback: Dict[str, str]
    timestamp: str  # ISO 8601
    agent_version: str


class CostTracking(TypedDict):
    """Cost tracking per card"""
    total_tokens: int
    total_cost: float  # USD
    attempts: List[Dict[str, Any]]  # [{"attempt": 1, "tokens": 1000, "cost": 0.05}, ...]
    alerts: List[str]  # ["Exceeded $1 threshold at attempt 2"]


class CardState(TypedDict):
    """
    Extended card schema for backlog_master.json

    Lifecycle:
    TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED → CORRECTING/ESCALATED → DONE

    Fields (base):
        id: Card identifier (PROD-001, ARQ-005, etc)
        type: Card type (EPIC, PROD, ARQ, FE, BE, QA, INFRA)
        title: Short description
        description: Full user story or requirement
        acceptance_criteria: List of criteria
        dependencies: List of card IDs this depends on
        priority: P0, P1, P2, P3, P4
        effort: Story points or hours
        status: Current state in state machine

    Fields (extended for orchestration):
        assigned_to: Agent Owner class name (ProductOwnerAgent, etc)
        validation_history: List of all validation attempts
        correction_attempts: How many correction cycles (max 3)
        cost_tracking: Token/cost tracking
        escalated: Whether card escalated to human review
        escalation_reason: Why escalated
        artifacts: List of generated files
        task_id: Celery task ID (for monitoring)
        started_at: When card execution started
        completed_at: When card completed (or null)
        parent_card: Parent card ID (for correction cards)
    """
    # Base fields (from original schema)
    id: str
    type: str
    title: str
    description: str
    acceptance_criteria: List[str]
    dependencies: List[str]
    priority: Literal["P0", "P1", "P2", "P3", "P4"]
    effort: str
    status: Literal["TODO", "IN_PROGRESS", "VALIDATING", "APPROVED", "REJECTED", "CORRECTING", "ESCALATED", "DONE"]

    # Extended fields (for orchestration)
    assigned_to: str  # "ProductOwnerAgent", "ArchitectureOwnerAgent", etc
    validation_history: List[ValidationHistoryEntry]
    correction_attempts: int  # 0, 1, 2, 3 (max 3)
    cost_tracking: CostTracking
    escalated: bool
    escalation_reason: Optional[str]
    artifacts: List[Dict[str, str]]  # [{"type": "user_story", "path": "..."}, ...]
    task_id: Optional[str]  # Celery task ID
    started_at: Optional[str]  # ISO 8601
    completed_at: Optional[str]  # ISO 8601
    parent_card: Optional[str]  # For correction cards (PROD-001-CORR-1)


# ============================================================================
# Correction Card
# ============================================================================

class CorrectionCard(TypedDict):
    """
    Correction card created when validation fails

    Naming: {parent_id}-CORR-{attempt} (e.g., PROD-001-CORR-1)
    Max attempts: 3
    After 3 failures: Escalate to human (Tech Lead)

    Fields:
        id: Correction card ID
        parent_card: Original card ID
        attempt: Which correction attempt (1, 2, 3)
        type: Same as parent
        title: "[CORRECTION {attempt}] {parent_title}"
        description: What needs to be fixed
        acceptance_criteria: Validation feedback as criteria
        validation_feedback: Structured feedback from validators
        priority: Inherited from parent
        effort: Estimated fix effort
        status: Always starts as TODO
        assigned_to: Same agent as parent
    """
    id: str
    parent_card: str
    attempt: int  # 1, 2, 3
    type: str
    title: str
    description: str
    acceptance_criteria: List[str]
    validation_feedback: Dict[str, str]  # {"tests": "Add integration tests", ...}
    priority: Literal["P0", "P1", "P2", "P3", "P4"]
    effort: str
    status: Literal["TODO", "IN_PROGRESS", "VALIDATING", "APPROVED", "REJECTED", "DONE"]
    assigned_to: str
    dependencies: List[str]
    created_at: str  # ISO 8601
    task_id: Optional[str]


# ============================================================================
# Backlog Master Structure
# ============================================================================

class BacklogMaster(TypedDict):
    """
    Complete backlog_master.json schema

    Structure:
    {
        "project": "SuperCore v2.0",
        "cards": [CardState, ...],
        "metadata": {
            "total_cards": 121,
            "phase": "Fase 1 - Fundação",
            "last_updated": "2025-12-27T10:00:00",
            "generated_by": "autonomous_meta_orchestrator.py v1.0.0"
        },
        "statistics": {
            "by_status": {"TODO": 100, "IN_PROGRESS": 10, ...},
            "by_type": {"PROD": 120, "ARQ": 30, ...},
            "total_cost": 12.50,
            "escalated_count": 2
        }
    }
    """
    project: str
    cards: List[CardState]
    metadata: Dict[str, Any]
    statistics: Dict[str, Any]


# ============================================================================
# State Machine Transitions
# ============================================================================

class StateTransition(TypedDict):
    """
    Valid state transitions in the state machine

    State Machine:
    TODO → IN_PROGRESS → VALIDATING → APPROVED/REJECTED
                            ↓               ↓
                         ESCALATED      CORRECTING
                            ↓               ↓
                          DONE          (back to TODO for correction card)
    """
    from_state: str
    to_state: str
    trigger: str  # "enqueue", "complete", "validate", "approve", "reject", "escalate"
    condition: Optional[str]  # "validation_passed", "max_attempts_reached", etc


# Valid transitions (enforced by Meta-Orchestrator)
VALID_TRANSITIONS: List[StateTransition] = [
    {"from_state": "TODO", "to_state": "IN_PROGRESS", "trigger": "enqueue", "condition": None},
    {"from_state": "IN_PROGRESS", "to_state": "VALIDATING", "trigger": "complete", "condition": None},
    {"from_state": "VALIDATING", "to_state": "APPROVED", "trigger": "validate", "condition": "all_validators_passed"},
    {"from_state": "VALIDATING", "to_state": "REJECTED", "trigger": "validate", "condition": "any_validator_failed"},
    {"from_state": "REJECTED", "to_state": "CORRECTING", "trigger": "create_correction", "condition": "attempts_lt_3"},
    {"from_state": "REJECTED", "to_state": "ESCALATED", "trigger": "escalate", "condition": "attempts_eq_3"},
    {"from_state": "APPROVED", "to_state": "DONE", "trigger": "finalize", "condition": None},
    {"from_state": "ESCALATED", "to_state": "DONE", "trigger": "human_review", "condition": "approved_by_tech_lead"},
]


# ============================================================================
# Utility Functions
# ============================================================================

def is_valid_transition(from_state: str, to_state: str) -> bool:
    """Check if state transition is valid"""
    for transition in VALID_TRANSITIONS:
        if transition["from_state"] == from_state and transition["to_state"] == to_state:
            return True
    return False


def get_next_states(current_state: str) -> List[str]:
    """Get list of possible next states from current state"""
    return [
        t["to_state"]
        for t in VALID_TRANSITIONS
        if t["from_state"] == current_state
    ]


def create_correction_card_id(parent_id: str, attempt: int) -> str:
    """
    Generate correction card ID

    Examples:
        create_correction_card_id("PROD-001", 1) → "PROD-001-CORR-1"
        create_correction_card_id("ARQ-005", 2) → "ARQ-005-CORR-2"
    """
    return f"{parent_id}-CORR-{attempt}"


def is_correction_card(card_id: str) -> bool:
    """Check if card is a correction card"""
    return "-CORR-" in card_id


def get_parent_card_id(correction_card_id: str) -> str:
    """
    Extract parent card ID from correction card ID

    Examples:
        get_parent_card_id("PROD-001-CORR-1") → "PROD-001"
        get_parent_card_id("ARQ-005-CORR-2") → "ARQ-005"
    """
    if not is_correction_card(correction_card_id):
        return correction_card_id
    return correction_card_id.split("-CORR-")[0]
