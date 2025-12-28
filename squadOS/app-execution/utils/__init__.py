"""
SquadOS Utilities Package

Provides utility classes for SquadOS agent orchestration:
- HybridDelegator: Unified delegation interface (CLI + Skills + Internal Skills)
- CachedLLMClient: LLM client with prompt caching (90% cost reduction)
"""

from .hybrid_delegator import HybridDelegator, create_hybrid_delegator

__all__ = [
    'HybridDelegator',
    'create_hybrid_delegator',
]
