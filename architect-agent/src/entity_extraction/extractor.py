"""
Entity Extractor - Main class for extracting entities from BACEN documents

Uses spaCy NLP with custom patterns for BACEN domain.
"""

import logging
import re
from pathlib import Path
from typing import Any

import spacy
from spacy.language import Language
from spacy.matcher import Matcher
from spacy.tokens import Doc

from ..document_intelligence.types import DocumentStructure
from .field_candidates import (
    FieldCandidate,
    FieldType,
    FSMStateCandidate,
    FSMTransitionCandidate,
    ObjectDefinitionCandidate,
)
from .types import EntityExtractionResult, EntityType, ExtractedEntity

logger = logging.getLogger(__name__)


class EntityExtractor:
    """
    Extract entities from BACEN documents using spaCy NLP

    Features:
    - Named Entity Recognition (NER) with pt_core_news_lg
    - Custom patterns for BACEN domain (CPF, CNPJ, valores)
    - Field candidate identification
    - FSM state detection
    - Relationship extraction
    """

    def __init__(self, model_name: str = "pt_core_news_lg"):
        """
        Initialize entity extractor

        Args:
            model_name: spaCy model name (default: "pt_core_news_lg")
        """
        self.model_name = model_name

        try:
            self.nlp = spacy.load(model_name)
            logger.info(f"Loaded spaCy model: {model_name}")
        except OSError:
            logger.error(f"spaCy model '{model_name}' not found. Run: python -m spacy download {model_name}")
            raise RuntimeError(
                f"spaCy model '{model_name}' not installed. "
                f"Install with: python -m spacy download {model_name}"
            )

        # Initialize custom matchers
        self.matcher = Matcher(self.nlp.vocab)
        self._add_custom_patterns()

    def _add_custom_patterns(self):
        """Add custom spaCy patterns for BACEN-specific entities"""

        # CPF pattern: 123.456.789-01 or 12345678901
        cpf_pattern = [
            [
                {"TEXT": {"REGEX": r"^\d{3}$"}},
                {"TEXT": "."},
                {"TEXT": {"REGEX": r"^\d{3}$"}},
                {"TEXT": "."},
                {"TEXT": {"REGEX": r"^\d{3}$"}},
                {"TEXT": "-"},
                {"TEXT": {"REGEX": r"^\d{2}$"}},
            ],
            [{"TEXT": {"REGEX": r"^\d{11}$"}}],
        ]
        self.matcher.add("CPF", cpf_pattern)

        # CNPJ pattern: 12.345.678/0001-90 or 12345678000190
        cnpj_pattern = [
            [
                {"TEXT": {"REGEX": r"^\d{2}$"}},
                {"TEXT": "."},
                {"TEXT": {"REGEX": r"^\d{3}$"}},
                {"TEXT": "."},
                {"TEXT": {"REGEX": r"^\d{3}$"}},
                {"TEXT": "/"},
                {"TEXT": {"REGEX": r"^\d{4}$"}},
                {"TEXT": "-"},
                {"TEXT": {"REGEX": r"^\d{2}$"}},
            ],
            [{"TEXT": {"REGEX": r"^\d{14}$"}}],
        ]
        self.matcher.add("CNPJ", cnpj_pattern)

        # Valor monetário: R$ 1.000,00
        valor_pattern = [
            [
                {"TEXT": {"IN": ["R$", "R", "$"]}},
                {"TEXT": {"REGEX": r"^\d+(\.\d{3})*(,\d{2})?$"}},
            ]
        ]
        self.matcher.add("VALOR_MONETARIO", valor_pattern)

        # Percentual: 10% ou 10 por cento
        percentual_pattern = [
            [{"LIKE_NUM": True}, {"TEXT": {"IN": ["%", "por", "porcento"]}}]
        ]
        self.matcher.add("PERCENTUAL", percentual_pattern)

        # Chave PIX (email, telefone, CPF, CNPJ, aleatória)
        chave_pix_pattern = [
            [{"TEXT": {"REGEX": r"^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$"}}],  # UUID
        ]
        self.matcher.add("CHAVE_PIX", chave_pix_pattern)

    def extract_from_document(self, doc_structure: DocumentStructure) -> EntityExtractionResult:
        """
        Extract entities from parsed document

        Args:
            doc_structure: Parsed document from BACENDocumentParser

        Returns:
            EntityExtractionResult with all extracted entities
        """
        logger.info(f"Starting entity extraction for document: {doc_structure.metadata.title}")

        # Extract from full text
        entities = self._extract_entities_from_text(doc_structure.full_text)

        # Extract from sections (more context)
        for section in doc_structure.sections:
            section_entities = self._extract_entities_from_text(
                section.content, context=f"Section: {section.title}"
            )
            entities.extend(section_entities)

        # Deduplicate entities
        entities = self._deduplicate_entities(entities)

        # Identify field candidates
        field_candidates = self._identify_field_candidates(entities, doc_structure)

        # Detect FSM states
        states = self._detect_fsm_states(doc_structure)

        # Extract relationships (basic implementation)
        relationships = []  # TODO: Implement relationship extraction

        # Calculate confidence
        confidence = self._calculate_extraction_confidence(entities, field_candidates)

        logger.info(
            f"Extracted {len(entities)} entities, {len(field_candidates)} field candidates, "
            f"{len(states)} states"
        )

        return EntityExtractionResult(
            document_id=doc_structure.metadata.numero_normativo or "unknown",
            entities=entities,
            relationships=relationships,
            field_candidates=field_candidates,
            confidence_score=confidence,
        )

    def _extract_entities_from_text(
        self, text: str, context: str = ""
    ) -> list[ExtractedEntity]:
        """
        Extract entities from text using spaCy NLP + custom patterns

        Args:
            text: Text to extract from
            context: Context information

        Returns:
            List of extracted entities
        """
        if not text or len(text.strip()) < 10:
            return []

        # Process with spaCy
        doc = self.nlp(text)

        entities = []

        # 1. Extract using custom matchers
        matches = self.matcher(doc)
        for match_id, start, end in matches:
            span = doc[start:end]
            match_label = self.nlp.vocab.strings[match_id]

            entity_type = self._map_match_label_to_entity_type(match_label)
            if entity_type:
                entities.append(
                    ExtractedEntity(
                        type=entity_type,
                        text=span.text,
                        normalized_value=self._normalize_value(span.text, entity_type),
                        start_char=span.start_char,
                        end_char=span.end_char,
                        confidence=0.95,  # High confidence for pattern matches
                        context=context,
                    )
                )

        # 2. Extract using spaCy NER
        for ent in doc.ents:
            entity_type = self._map_spacy_label_to_entity_type(ent.label_)
            if entity_type:
                entities.append(
                    ExtractedEntity(
                        type=entity_type,
                        text=ent.text,
                        normalized_value=ent.text,
                        start_char=ent.start_char,
                        end_char=ent.end_char,
                        confidence=0.85,  # Medium confidence for NER
                        context=context,
                    )
                )

        # 3. Extract dates with regex
        date_entities = self._extract_dates(text)
        entities.extend(date_entities)

        return entities

    def _map_match_label_to_entity_type(self, label: str) -> EntityType | None:
        """Map custom matcher label to EntityType"""
        mapping = {
            "CPF": EntityType.CPF,
            "CNPJ": EntityType.CNPJ,
            "VALOR_MONETARIO": EntityType.VALOR_MONETARIO,
            "PERCENTUAL": EntityType.PERCENTUAL,
            "CHAVE_PIX": EntityType.CHAVE_PIX,
        }
        return mapping.get(label)

    def _map_spacy_label_to_entity_type(self, label: str) -> EntityType | None:
        """Map spaCy NER label to EntityType"""
        mapping = {
            "PER": EntityType.PESSOA_NOME,  # Person
            "ORG": EntityType.RAZAO_SOCIAL,  # Organization
            "LOC": EntityType.ENDERECO,  # Location
            "MISC": EntityType.TEXTO,  # Miscellaneous
        }
        return mapping.get(label)

    def _extract_dates(self, text: str) -> list[ExtractedEntity]:
        """Extract dates using regex patterns"""
        entities = []

        # Pattern: dd/mm/yyyy
        pattern = r"\b(\d{2})[/-](\d{2})[/-](\d{4})\b"
        for match in re.finditer(pattern, text):
            entities.append(
                ExtractedEntity(
                    type=EntityType.DATA,
                    text=match.group(0),
                    normalized_value=f"{match.group(3)}-{match.group(2)}-{match.group(1)}",  # ISO format
                    start_char=match.start(),
                    end_char=match.end(),
                    confidence=0.9,
                )
            )

        return entities

    def _normalize_value(self, text: str, entity_type: EntityType) -> Any:
        """Normalize extracted value based on type"""
        if entity_type == EntityType.CPF:
            # Remove formatting
            return re.sub(r"[.\-]", "", text)

        elif entity_type == EntityType.CNPJ:
            # Remove formatting
            return re.sub(r"[.\-/]", "", text)

        elif entity_type == EntityType.VALOR_MONETARIO:
            # Convert to float (centavos)
            value_str = re.sub(r"[R$\s]", "", text)
            value_str = value_str.replace(".", "").replace(",", ".")
            try:
                return int(float(value_str) * 100)  # Convert to centavos
            except ValueError:
                return text

        elif entity_type == EntityType.PERCENTUAL:
            # Extract numeric value
            match = re.search(r"(\d+(?:,\d+)?)", text)
            if match:
                return float(match.group(1).replace(",", "."))
            return text

        return text

    def _deduplicate_entities(self, entities: list[ExtractedEntity]) -> list[ExtractedEntity]:
        """Remove duplicate entities (same text + position)"""
        seen = set()
        unique = []

        for entity in entities:
            key = (entity.type, entity.text, entity.start_char, entity.end_char)
            if key not in seen:
                seen.add(key)
                unique.append(entity)

        return unique

    def _identify_field_candidates(
        self, entities: list[ExtractedEntity], doc_structure: DocumentStructure
    ) -> list[FieldCandidate]:
        """
        Identify field candidates from extracted entities

        Strategy:
        - Group entities by type
        - Infer field properties (type, required, validation)
        - Generate example values
        """
        field_candidates = []

        # Group entities by type
        entity_groups: dict[EntityType, list[ExtractedEntity]] = {}
        for entity in entities:
            if entity.type not in entity_groups:
                entity_groups[entity.type] = []
            entity_groups[entity.type].append(entity)

        # Generate field candidates
        for entity_type, entity_list in entity_groups.items():
            field_candidate = self._create_field_candidate_from_entities(
                entity_type, entity_list
            )
            if field_candidate:
                field_candidates.append(field_candidate)

        return field_candidates

    def _create_field_candidate_from_entities(
        self, entity_type: EntityType, entities: list[ExtractedEntity]
    ) -> FieldCandidate | None:
        """Create FieldCandidate from list of entities of same type"""

        # Extract example values
        example_values = [e.normalized_value for e in entities[:5]]  # Max 5 examples

        # Map entity type to field properties
        field_mapping = {
            EntityType.CPF: {
                "name": "cpf",
                "display_name": "CPF",
                "field_type": FieldType.STRING,
                "description": "Cadastro de Pessoa Física",
                "validation_rules": [
                    {"type": "regex", "pattern": r"^\d{11}$"},
                    {"type": "custom", "rule_name": "cpf_validation"},
                ],
                "ui_widget": "cpf",
            },
            EntityType.CNPJ: {
                "name": "cnpj",
                "display_name": "CNPJ",
                "field_type": FieldType.STRING,
                "description": "Cadastro Nacional de Pessoa Jurídica",
                "validation_rules": [
                    {"type": "regex", "pattern": r"^\d{14}$"},
                    {"type": "custom", "rule_name": "cnpj_validation"},
                ],
                "ui_widget": "cnpj",
            },
            EntityType.VALOR_MONETARIO: {
                "name": "valor",
                "display_name": "Valor",
                "field_type": FieldType.INTEGER,
                "description": "Valor monetário em centavos",
                "validation_rules": [{"type": "minimum", "value": 0}],
                "ui_widget": "currency",
            },
            EntityType.DATA: {
                "name": "data",
                "display_name": "Data",
                "field_type": FieldType.DATE,
                "description": "Data no formato ISO (YYYY-MM-DD)",
                "validation_rules": [{"type": "format", "value": "date"}],
                "ui_widget": "date",
            },
            EntityType.PERCENTUAL: {
                "name": "percentual",
                "display_name": "Percentual",
                "field_type": FieldType.NUMBER,
                "description": "Valor percentual",
                "validation_rules": [
                    {"type": "minimum", "value": 0},
                    {"type": "maximum", "value": 100},
                ],
                "ui_widget": "number",
            },
            EntityType.PESSOA_NOME: {
                "name": "nome_completo",
                "display_name": "Nome Completo",
                "field_type": FieldType.STRING,
                "description": "Nome completo da pessoa",
                "validation_rules": [{"type": "min_length", "value": 3}],
                "ui_widget": "text",
            },
            EntityType.EMAIL: {
                "name": "email",
                "display_name": "E-mail",
                "field_type": FieldType.EMAIL,
                "description": "Endereço de e-mail",
                "validation_rules": [{"type": "format", "value": "email"}],
                "ui_widget": "email",
            },
        }

        config = field_mapping.get(entity_type)
        if not config:
            return None

        return FieldCandidate(
            name=config["name"],
            display_name=config["display_name"],
            field_type=config["field_type"],
            description=config["description"],
            validation_rules=config["validation_rules"],
            example_values=example_values,
            ui_widget=config["ui_widget"],
            confidence=sum(e.confidence for e in entities) / len(entities),
        )

    def _detect_fsm_states(self, doc_structure: DocumentStructure) -> list[FSMStateCandidate]:
        """
        Detect FSM states from document text

        Strategy:
        - Look for keywords: "estado", "status", "situação"
        - Extract enumerated lists
        - Identify state transitions
        """
        states = []

        # Common BACEN state keywords
        state_keywords = [
            "PENDENTE",
            "EM_ANALISE",
            "APROVADO",
            "REPROVADO",
            "ATIVO",
            "INATIVO",
            "BLOQUEADO",
            "CANCELADO",
            "VIGENTE",
            "REVOGADO",
        ]

        # Search in full text
        text_upper = doc_structure.full_text.upper()
        for keyword in state_keywords:
            if keyword in text_upper:
                states.append(
                    FSMStateCandidate(
                        name=keyword,
                        display_name=keyword.replace("_", " ").title(),
                        confidence=0.8,
                    )
                )

        # Deduplicate
        seen = set()
        unique_states = []
        for state in states:
            if state.name not in seen:
                seen.add(state.name)
                unique_states.append(state)

        return unique_states

    def _calculate_extraction_confidence(
        self, entities: list[ExtractedEntity], field_candidates: list[FieldCandidate]
    ) -> float:
        """Calculate overall extraction confidence"""
        if not entities and not field_candidates:
            return 0.0

        # Average entity confidence
        entity_confidence = (
            sum(e.confidence for e in entities) / len(entities) if entities else 0.0
        )

        # Field candidate confidence
        field_confidence = (
            sum(fc.confidence for fc in field_candidates) / len(field_candidates)
            if field_candidates
            else 0.0
        )

        # Weighted average
        return (entity_confidence * 0.6 + field_confidence * 0.4)
