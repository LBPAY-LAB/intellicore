"""
Entity Extraction Module - Extract entities from BACEN documents using NLP

Public API:
    - EntityExtractor: Main extractor class with spaCy NLP
    - BACENEntityRecognizer: Custom NER for BACEN domain
    - FieldCandidate: Identified field from document
    - EntityType: Enum of entity types
"""

from .extractor import EntityExtractor
from .field_candidates import FieldCandidate, FieldType
from .types import EntityType, ExtractedEntity

__all__ = [
    "EntityExtractor",
    "FieldCandidate",
    "FieldType",
    "EntityType",
    "ExtractedEntity",
]
