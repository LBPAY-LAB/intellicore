"""
SquadOS Agents Package
Contains specialized agents for validation, QA, and debugging.
"""

from .verification_agent import VerificationAgent, validate_card_completion

__all__ = [
    'VerificationAgent',
    'validate_card_completion',
]

__version__ = '1.0.0'
