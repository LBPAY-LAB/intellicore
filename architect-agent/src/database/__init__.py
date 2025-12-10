"""
Database module for Architect Agent

Provides database connection management and repositories.
"""

from .connection import close_db, get_db_connection, init_db
from .repositories import (
    DocumentRepository,
    EmbeddingRepository,
    EntityRepository,
    FieldCandidateRepository,
    FSMStateRepository,
    FSMTransitionRepository,
    ObjectDefinitionCandidateRepository,
)

__all__ = [
    # Connection management
    "init_db",
    "close_db",
    "get_db_connection",
    # Repositories
    "DocumentRepository",
    "EntityRepository",
    "FieldCandidateRepository",
    "FSMStateRepository",
    "FSMTransitionRepository",
    "ObjectDefinitionCandidateRepository",
    "EmbeddingRepository",
]
