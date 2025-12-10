"""
Document Intelligence Engine - Extract structured data from BACEN PDFs

Public API:
    - BACENDocumentParser: Main parser class
    - OCREngine: Advanced OCR with preprocessing
    - TableExtractor: Complex table extraction
    - Types: DocumentStructure, DocumentMetadata, Section, Table
"""

from .ocr import OCREngine
from .parser import BACENDocumentParser
from .table_extractor import TableExtractor
from .types import (
    DocumentMetadata,
    DocumentStructure,
    DocumentType,
    Section,
    SectionType,
    Table,
)

__all__ = [
    "BACENDocumentParser",
    "OCREngine",
    "TableExtractor",
    "DocumentMetadata",
    "DocumentStructure",
    "DocumentType",
    "Section",
    "SectionType",
    "Table",
]
