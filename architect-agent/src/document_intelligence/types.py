"""
Type definitions for Document Intelligence Engine
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class DocumentType(str, Enum):
    """Type of BACEN document"""

    CIRCULAR = "circular_bacen"
    RESOLUCAO = "resolucao_bacen"
    MANUAL = "manual_bacen"
    NORMATIVO = "normativo_bacen"


class SectionType(str, Enum):
    """Type of document section"""

    CHAPTER = "chapter"
    SECTION = "section"
    SUBSECTION = "subsection"
    PARAGRAPH = "paragraph"
    LIST_ITEM = "list_item"
    TABLE = "table"
    REQUIREMENT = "requirement"


@dataclass
class Table:
    """Extracted table from document"""

    headers: list[str]
    rows: list[list[str]]
    caption: str | None = None
    page_number: int = 0
    confidence: float = 1.0


@dataclass
class Section:
    """Document section with hierarchical structure"""

    type: SectionType
    title: str
    content: str
    level: int  # Hierarchy level (1=chapter, 2=section, 3=subsection)
    page_number: int
    subsections: list["Section"] = field(default_factory=list)
    tables: list[Table] = field(default_factory=list)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class DocumentMetadata:
    """Metadata extracted from document"""

    title: str
    document_type: DocumentType
    numero_normativo: str | None = None  # e.g., "3978"
    data_publicacao: str | None = None  # ISO format: "2020-01-23"
    data_vigencia: str | None = None
    orgao_emissor: str = "Banco Central do Brasil"
    assunto: str | None = None
    total_pages: int = 0
    language: str = "pt-BR"


@dataclass
class DocumentStructure:
    """Complete structured document"""

    metadata: DocumentMetadata
    sections: list[Section]
    full_text: str  # Raw text for reference
    tables: list[Table]  # All tables in document
    confidence_score: float = 1.0  # Overall extraction confidence

    def to_dict(self) -> dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "metadata": {
                "title": self.metadata.title,
                "document_type": self.metadata.document_type.value,
                "numero_normativo": self.metadata.numero_normativo,
                "data_publicacao": self.metadata.data_publicacao,
                "data_vigencia": self.metadata.data_vigencia,
                "orgao_emissor": self.metadata.orgao_emissor,
                "assunto": self.metadata.assunto,
                "total_pages": self.metadata.total_pages,
                "language": self.metadata.language,
            },
            "sections": [self._section_to_dict(s) for s in self.sections],
            "tables": [
                {
                    "headers": t.headers,
                    "rows": t.rows,
                    "caption": t.caption,
                    "page_number": t.page_number,
                    "confidence": t.confidence,
                }
                for t in self.tables
            ],
            "full_text": self.full_text,
            "confidence_score": self.confidence_score,
        }

    def _section_to_dict(self, section: Section) -> dict[str, Any]:
        """Convert section to dictionary recursively"""
        return {
            "type": section.type.value,
            "title": section.title,
            "content": section.content,
            "level": section.level,
            "page_number": section.page_number,
            "subsections": [self._section_to_dict(s) for s in section.subsections],
            "tables": [
                {
                    "headers": t.headers,
                    "rows": t.rows,
                    "caption": t.caption,
                    "page_number": t.page_number,
                }
                for t in section.tables
            ],
            "metadata": section.metadata,
        }
