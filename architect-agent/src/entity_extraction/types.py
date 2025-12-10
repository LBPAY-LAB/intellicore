"""
Type definitions for entity extraction
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class EntityType(str, Enum):
    """Types of entities that can be extracted from BACEN documents"""

    # Identifiers
    CPF = "cpf"
    CNPJ = "cnpj"
    NUMERO_CONTA = "numero_conta"
    CODIGO_BANCO = "codigo_banco"
    CHAVE_PIX = "chave_pix"

    # Personal Information
    PESSOA_NOME = "pessoa_nome"
    DATA_NASCIMENTO = "data_nascimento"
    TELEFONE = "telefone"
    EMAIL = "email"
    ENDERECO = "endereco"
    CEP = "cep"

    # Financial
    VALOR_MONETARIO = "valor_monetario"
    PERCENTUAL = "percentual"
    TAXA = "taxa"
    LIMITE = "limite"
    PRAZO = "prazo"

    # Dates and Time
    DATA = "data"
    PERIODO = "periodo"
    HORARIO = "horario"

    # BACEN Specific
    NORMATIVO_NUMERO = "normativo_numero"  # e.g., "Circular 3.978"
    ARTIGO = "artigo"
    INCISO = "inciso"
    PARAGRAFO = "paragrafo"

    # Business
    RAZAO_SOCIAL = "razao_social"
    NOME_FANTASIA = "nome_fantasia"
    SEGMENTO = "segmento"
    ATIVIDADE = "atividade"

    # States/Status
    ESTADO = "estado"  # Estados de FSM
    STATUS = "status"

    # Generic
    TEXTO = "texto"
    NUMERO = "numero"
    BOOLEAN = "boolean"


@dataclass
class ExtractedEntity:
    """An entity extracted from document text"""

    type: EntityType
    text: str  # Original text from document
    normalized_value: Any  # Normalized/parsed value
    start_char: int  # Character position in document
    end_char: int
    confidence: float = 1.0  # Extraction confidence (0.0-1.0)
    context: str = ""  # Surrounding text for context
    metadata: dict = field(default_factory=dict)  # Additional metadata

    def __post_init__(self):
        """Validate entity"""
        if not 0 <= self.confidence <= 1.0:
            raise ValueError("Confidence must be between 0.0 and 1.0")
        if self.start_char > self.end_char:
            raise ValueError("start_char must be <= end_char")


@dataclass
class EntityRelationship:
    """Relationship between two entities"""

    source_entity: ExtractedEntity
    target_entity: ExtractedEntity
    relationship_type: str  # e.g., "TITULAR_DE", "PERTENCE_A"
    confidence: float = 1.0
    metadata: dict = field(default_factory=dict)


@dataclass
class EntityExtractionResult:
    """Result of entity extraction for a document"""

    document_id: str
    entities: list[ExtractedEntity]
    relationships: list[EntityRelationship]
    field_candidates: list["FieldCandidate"]  # Forward reference
    confidence_score: float  # Overall extraction confidence
    metadata: dict = field(default_factory=dict)

    def get_entities_by_type(self, entity_type: EntityType) -> list[ExtractedEntity]:
        """Filter entities by type"""
        return [e for e in self.entities if e.type == entity_type]

    def get_unique_entity_types(self) -> set[EntityType]:
        """Get all unique entity types found"""
        return {e.type for e in self.entities}
