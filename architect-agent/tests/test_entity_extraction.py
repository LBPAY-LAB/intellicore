"""
Tests for Entity Extraction Module

Tests:
- Entity extraction with spaCy
- Custom pattern matching (CPF, CNPJ, valores)
- Field candidate identification
- FSM state detection
- Value normalization
"""

import sys
from pathlib import Path

import pytest

# Import modules to test
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from document_intelligence.types import (
    DocumentMetadata,
    DocumentSection,
    DocumentStructure,
    DocumentTable,
    DocumentType,
)
from entity_extraction.extractor import EntityExtractor
from entity_extraction.field_candidates import (
    FieldCandidate,
    FieldType,
    FSMStateCandidate,
    FSMTransitionCandidate,
    ObjectDefinitionCandidate,
)
from entity_extraction.types import EntityType, ExtractedEntity


class TestEntityExtractor:
    """Test EntityExtractor class"""

    @pytest.fixture
    def extractor(self):
        """Create extractor instance"""
        return EntityExtractor()

    @pytest.fixture
    def sample_document(self):
        """Create sample document structure for testing"""
        metadata = DocumentMetadata(
            title="Circular BACEN 3.978 - PLD/FT",
            document_type=DocumentType.CIRCULAR,
            numero_normativo="3978",
            data_publicacao="2020-01-23",
            data_vigencia="2020-02-01",
            orgao_emissor="Banco Central do Brasil",
            assunto="Prevenção à Lavagem de Dinheiro",
            total_pages=10,
        )

        sections = [
            DocumentSection(
                level=1,
                title="Disposições Gerais",
                content=(
                    "As instituições financeiras devem cadastrar clientes com "
                    "CPF 123.456.789-01 e verificar valores acima de R$ 10.000,00. "
                    "O limite para transações noturnas é de R$ 1.000,00. "
                    "A instituição deve manter cadastro atualizado com telefone "
                    "(11) 98765-4321 e email contato@exemplo.com.br"
                ),
                subsections=[],
            ),
            DocumentSection(
                level=1,
                title="Estados do Processo",
                content=(
                    "O processo de cadastro possui os seguintes estados: "
                    "CADASTRO_INICIADO, DOCUMENTOS_PENDENTES, EM_ANALISE, "
                    "APROVADO, ATIVO, BLOQUEADO, INATIVO. "
                    "A transição de CADASTRO_INICIADO para DOCUMENTOS_PENDENTES "
                    "ocorre quando o cliente envia os documentos."
                ),
                subsections=[],
            ),
        ]

        tables = [
            DocumentTable(
                caption="Limites de Transação",
                rows=[
                    ["Tipo", "Limite Diurno", "Limite Noturno"],
                    ["PIX", "R$ 5.000,00", "R$ 1.000,00"],
                    ["TED", "R$ 10.000,00", "R$ 5.000,00"],
                ],
                columns=["Tipo", "Limite Diurno", "Limite Noturno"],
            )
        ]

        full_text = " ".join([s.content for s in sections])

        return DocumentStructure(
            metadata=metadata,
            sections=sections,
            tables=tables,
            full_text=full_text,
            confidence_score=0.95,
        )

    def test_extractor_initialization(self, extractor):
        """Test extractor initializes correctly"""
        assert extractor.nlp is not None
        assert extractor.matcher is not None
        assert len(extractor.matcher) > 0  # Has custom patterns

    def test_extract_cpf(self, extractor):
        """Test CPF extraction"""
        text = "O CPF do cliente é 123.456.789-01 e foi validado."

        entities = extractor._extract_entities_from_text(text)

        cpf_entities = [e for e in entities if e.type == EntityType.CPF]
        assert len(cpf_entities) >= 1

        cpf = cpf_entities[0]
        assert cpf.text in ["123.456.789-01", "12345678901"]
        assert cpf.normalized_value == "12345678901"

    def test_extract_cpf_without_formatting(self, extractor):
        """Test CPF extraction without formatting"""
        text = "CPF: 12345678901"

        entities = extractor._extract_entities_from_text(text)

        cpf_entities = [e for e in entities if e.type == EntityType.CPF]
        assert len(cpf_entities) >= 1
        assert cpf_entities[0].normalized_value == "12345678901"

    def test_extract_cnpj(self, extractor):
        """Test CNPJ extraction"""
        text = "O CNPJ da empresa é 12.345.678/0001-90"

        entities = extractor._extract_entities_from_text(text)

        cnpj_entities = [e for e in entities if e.type == EntityType.CNPJ]
        assert len(cnpj_entities) >= 1

        cnpj = cnpj_entities[0]
        assert cnpj.normalized_value == "12345678000190"

    def test_extract_valor_monetario(self, extractor):
        """Test monetary value extraction"""
        text = "O valor da transação é R$ 1.000,00 e a tarifa é R$ 5,90"

        entities = extractor._extract_entities_from_text(text)

        valor_entities = [e for e in entities if e.type == EntityType.VALOR_MONETARIO]
        assert len(valor_entities) >= 2

        # First value: R$ 1.000,00 = 100000 centavos
        assert valor_entities[0].normalized_value == 100000

        # Second value: R$ 5,90 = 590 centavos
        assert valor_entities[1].normalized_value == 590

    def test_extract_percentual(self, extractor):
        """Test percentage extraction"""
        text = "A taxa de juros é de 10% ao mês e o desconto é de 2,5%"

        entities = extractor._extract_entities_from_text(text)

        percent_entities = [e for e in entities if e.type == EntityType.PERCENTUAL]
        assert len(percent_entities) >= 2

        assert percent_entities[0].normalized_value == 10.0
        assert percent_entities[1].normalized_value == 2.5

    def test_extract_chave_pix(self, extractor):
        """Test PIX key extraction (UUID)"""
        text = "A chave PIX é 550e8400-e29b-41d4-a716-446655440000"

        entities = extractor._extract_entities_from_text(text)

        pix_entities = [e for e in entities if e.type == EntityType.CHAVE_PIX]
        assert len(pix_entities) >= 1
        assert "550e8400" in pix_entities[0].text

    def test_extract_dates(self, extractor):
        """Test date extraction"""
        text = "Data de publicação: 23/01/2020 e vigência em 01/02/2020"

        entities = extractor._extract_entities_from_text(text)

        date_entities = [e for e in entities if e.type == EntityType.DATA]
        assert len(date_entities) >= 2

        # Normalized dates should be in ISO format
        assert date_entities[0].normalized_value == "2020-01-23"
        assert date_entities[1].normalized_value == "2020-02-01"

    def test_extract_email(self, extractor):
        """Test email extraction"""
        text = "Entre em contato: suporte@banco.com.br e admin@exemplo.com"

        entities = extractor._extract_entities_from_text(text)

        email_entities = [e for e in entities if e.type == EntityType.EMAIL]
        assert len(email_entities) >= 2

    def test_extract_telefone(self, extractor):
        """Test phone extraction"""
        text = "Telefone: (11) 98765-4321 ou 11-3456-7890"

        entities = extractor._extract_entities_from_text(text)

        phone_entities = [e for e in entities if e.type == EntityType.TELEFONE]
        assert len(phone_entities) >= 1

    def test_extract_from_document(self, extractor, sample_document):
        """Test extraction from complete document structure"""
        result = extractor.extract_from_document(sample_document)

        # Should extract multiple entity types
        assert len(result.entities) > 0

        # Should have field candidates
        assert len(result.field_candidates) > 0

        # Should have confidence score
        assert 0.0 <= result.confidence_score <= 1.0

        # Check entity types extracted
        entity_types = result.get_unique_entity_types()
        assert EntityType.CPF in entity_types
        assert EntityType.VALOR_MONETARIO in entity_types

    def test_deduplicate_entities(self, extractor):
        """Test entity deduplication"""
        entities = [
            ExtractedEntity(
                type=EntityType.CPF,
                text="123.456.789-01",
                normalized_value="12345678901",
                start_char=0,
                end_char=14,
            ),
            ExtractedEntity(
                type=EntityType.CPF,
                text="123.456.789-01",
                normalized_value="12345678901",
                start_char=100,
                end_char=114,
            ),
            ExtractedEntity(
                type=EntityType.CPF,
                text="987.654.321-00",
                normalized_value="98765432100",
                start_char=200,
                end_char=214,
            ),
        ]

        deduplicated = extractor._deduplicate_entities(entities)

        # Should keep only one instance of each unique normalized value
        assert len(deduplicated) == 2
        cpf_values = {e.normalized_value for e in deduplicated if e.type == EntityType.CPF}
        assert len(cpf_values) == 2

    def test_identify_field_candidates(self, extractor, sample_document):
        """Test field candidate identification"""
        result = extractor.extract_from_document(sample_document)

        field_candidates = result.field_candidates

        # Should have field candidates
        assert len(field_candidates) > 0

        # Check CPF field candidate
        cpf_fields = [f for f in field_candidates if f.name == "cpf"]
        if cpf_fields:
            cpf_field = cpf_fields[0]
            assert cpf_field.field_type == FieldType.STRING
            assert cpf_field.required is False  # Inferred
            assert len(cpf_field.validation_rules) > 0

        # Check valor field candidate
        valor_fields = [f for f in field_candidates if "valor" in f.name.lower()]
        if valor_fields:
            valor_field = valor_fields[0]
            assert valor_field.field_type in [FieldType.NUMBER, FieldType.INTEGER]

    def test_detect_fsm_states(self, extractor, sample_document):
        """Test FSM state detection"""
        result = extractor.extract_from_document(sample_document)

        # FSM states should be detected from the second section
        if "fsm_states" in result.metadata:
            fsm_states = result.metadata["fsm_states"]
            assert len(fsm_states) > 0

            state_names = {s.name for s in fsm_states}
            assert "CADASTRO_INICIADO" in state_names
            assert "APROVADO" in state_names
            assert "ATIVO" in state_names

    def test_calculate_confidence(self, extractor):
        """Test confidence calculation"""
        entities = [
            ExtractedEntity(
                type=EntityType.CPF,
                text="123.456.789-01",
                normalized_value="12345678901",
                start_char=0,
                end_char=14,
                confidence=1.0,
            ),
            ExtractedEntity(
                type=EntityType.VALOR_MONETARIO,
                text="R$ 1.000,00",
                normalized_value=100000,
                start_char=20,
                end_char=31,
                confidence=1.0,
            ),
        ]

        field_candidates = [
            FieldCandidate(
                name="cpf",
                display_name="CPF",
                field_type=FieldType.STRING,
                confidence=0.9,
            ),
            FieldCandidate(
                name="valor",
                display_name="Valor",
                field_type=FieldType.NUMBER,
                confidence=0.85,
            ),
        ]

        confidence = extractor._calculate_extraction_confidence(entities, field_candidates)

        assert 0.0 <= confidence <= 1.0
        assert confidence >= 0.85  # Should be high with good entities and fields


class TestFieldCandidate:
    """Test FieldCandidate class"""

    def test_create_field_candidate(self):
        """Test field candidate creation"""
        field = FieldCandidate(
            name="cpf",
            display_name="CPF do Cliente",
            field_type=FieldType.STRING,
            description="Cadastro de Pessoa Física",
            required=True,
            validation_rules=[
                {"type": "regex", "pattern": r"^\d{11}$"},
                {"type": "min_length", "value": 11},
                {"type": "max_length", "value": 11},
            ],
            example_values=["12345678901", "98765432100"],
            ui_widget="cpf",
            confidence=0.95,
        )

        assert field.name == "cpf"
        assert field.field_type == FieldType.STRING
        assert field.required is True
        assert len(field.validation_rules) == 3

    def test_to_json_schema_property(self):
        """Test JSON Schema property generation"""
        field = FieldCandidate(
            name="valor",
            display_name="Valor da Transação",
            field_type=FieldType.NUMBER,
            description="Valor em reais",
            validation_rules=[
                {"type": "minimum", "value": 0},
                {"type": "maximum", "value": 100000},
            ],
        )

        schema_prop = field.to_json_schema_property()

        assert schema_prop["type"] == "number"
        assert schema_prop["title"] == "Valor da Transação"
        assert schema_prop["description"] == "Valor em reais"
        assert schema_prop["minimum"] == 0
        assert schema_prop["maximum"] == 100000

    def test_string_field_to_json_schema(self):
        """Test string field JSON Schema"""
        field = FieldCandidate(
            name="email",
            display_name="Email",
            field_type=FieldType.EMAIL,
            validation_rules=[
                {"type": "regex", "pattern": r"^[^@]+@[^@]+\.[^@]+$"},
            ],
        )

        schema_prop = field.to_json_schema_property()

        assert schema_prop["type"] == "string"
        assert schema_prop["format"] == "email"
        assert "pattern" in schema_prop


class TestObjectDefinitionCandidate:
    """Test ObjectDefinitionCandidate class"""

    def test_create_object_definition_candidate(self):
        """Test object definition candidate creation"""
        fields = [
            FieldCandidate(
                name="cpf",
                display_name="CPF",
                field_type=FieldType.STRING,
                required=True,
            ),
            FieldCandidate(
                name="nome_completo",
                display_name="Nome Completo",
                field_type=FieldType.STRING,
                required=True,
            ),
            FieldCandidate(
                name="data_nascimento",
                display_name="Data de Nascimento",
                field_type=FieldType.DATE,
                required=True,
            ),
        ]

        states = [
            FSMStateCandidate(
                name="CADASTRO_INICIADO",
                display_name="Cadastro Iniciado",
                is_initial=True,
            ),
            FSMStateCandidate(
                name="ATIVO",
                display_name="Ativo",
                is_final=False,
            ),
        ]

        transitions = [
            FSMTransitionCandidate(
                from_state="CADASTRO_INICIADO",
                to_state="ATIVO",
                trigger="aprovar",
            )
        ]

        obj_def = ObjectDefinitionCandidate(
            name="cliente_pf",
            display_name="Cliente Pessoa Física",
            description="Cliente pessoa física do banco",
            fields=fields,
            states=states,
            transitions=transitions,
        )

        assert obj_def.name == "cliente_pf"
        assert len(obj_def.fields) == 3
        assert len(obj_def.states) == 2
        assert len(obj_def.transitions) == 1

    def test_to_json_schema(self):
        """Test JSON Schema generation"""
        fields = [
            FieldCandidate(
                name="cpf",
                display_name="CPF",
                field_type=FieldType.STRING,
                required=True,
                validation_rules=[{"type": "regex", "pattern": r"^\d{11}$"}],
            ),
            FieldCandidate(
                name="nome_completo",
                display_name="Nome Completo",
                field_type=FieldType.STRING,
                required=True,
            ),
        ]

        obj_def = ObjectDefinitionCandidate(
            name="cliente_pf",
            display_name="Cliente Pessoa Física",
            description="Cliente pessoa física",
            fields=fields,
        )

        schema = obj_def.to_json_schema()

        assert schema["$schema"] == "http://json-schema.org/draft-07/schema#"
        assert schema["type"] == "object"
        assert schema["title"] == "Cliente Pessoa Física"
        assert "properties" in schema
        assert "cpf" in schema["properties"]
        assert "nome_completo" in schema["properties"]
        assert "required" in schema
        assert len(schema["required"]) == 2

    def test_to_fsm_definition(self):
        """Test FSM definition generation"""
        states = [
            FSMStateCandidate(
                name="PENDENTE",
                display_name="Pendente",
                is_initial=True,
            ),
            FSMStateCandidate(
                name="ATIVO",
                display_name="Ativo",
                is_final=False,
            ),
            FSMStateCandidate(
                name="INATIVO",
                display_name="Inativo",
                is_final=True,
            ),
        ]

        transitions = [
            FSMTransitionCandidate(
                from_state="PENDENTE",
                to_state="ATIVO",
                trigger="aprovar",
            ),
            FSMTransitionCandidate(
                from_state="ATIVO",
                to_state="INATIVO",
                trigger="desativar",
            ),
        ]

        obj_def = ObjectDefinitionCandidate(
            name="cliente",
            display_name="Cliente",
            description="Cliente",
            fields=[],
            states=states,
            transitions=transitions,
        )

        fsm_def = obj_def.to_fsm_definition()

        assert fsm_def["initial"] == "PENDENTE"
        assert "PENDENTE" in fsm_def["states"]
        assert "ATIVO" in fsm_def["states"]
        assert "INATIVO" in fsm_def["states"]
        assert len(fsm_def["transitions"]) == 2

    def test_to_ui_hints(self):
        """Test UI hints generation"""
        fields = [
            FieldCandidate(
                name="cpf",
                display_name="CPF",
                field_type=FieldType.STRING,
                ui_widget="cpf",
            ),
            FieldCandidate(
                name="valor",
                display_name="Valor",
                field_type=FieldType.NUMBER,
                ui_widget="currency",
            ),
        ]

        obj_def = ObjectDefinitionCandidate(
            name="transacao",
            display_name="Transação",
            description="Transação",
            fields=fields,
        )

        ui_hints = obj_def.to_ui_hints()

        assert "widgets" in ui_hints
        assert ui_hints["widgets"]["cpf"] == "cpf"
        assert ui_hints["widgets"]["valor"] == "currency"
        assert "field_groups" in ui_hints

    def test_infer_field_groups(self):
        """Test field grouping inference"""
        fields = [
            FieldCandidate(name="cpf", display_name="CPF", field_type=FieldType.STRING),
            FieldCandidate(name="nome", display_name="Nome", field_type=FieldType.STRING),
            FieldCandidate(name="endereco_rua", display_name="Rua", field_type=FieldType.STRING),
            FieldCandidate(name="endereco_cidade", display_name="Cidade", field_type=FieldType.STRING),
            FieldCandidate(name="telefone", display_name="Telefone", field_type=FieldType.STRING),
        ]

        obj_def = ObjectDefinitionCandidate(
            name="cliente",
            display_name="Cliente",
            description="Cliente",
            fields=fields,
        )

        groups = obj_def._infer_field_groups()

        # Should group endereco_* fields together
        endereco_group = next((g for g in groups if g["name"] == "endereco"), None)
        assert endereco_group is not None
        assert "endereco_rua" in endereco_group["fields"]
        assert "endereco_cidade" in endereco_group["fields"]


class TestEntityNormalization:
    """Test entity value normalization"""

    @pytest.fixture
    def extractor(self):
        return EntityExtractor()

    def test_normalize_cpf(self, extractor):
        """Test CPF normalization"""
        # With formatting
        normalized = extractor._normalize_value("123.456.789-01", EntityType.CPF)
        assert normalized == "12345678901"

        # Without formatting
        normalized = extractor._normalize_value("12345678901", EntityType.CPF)
        assert normalized == "12345678901"

    def test_normalize_cnpj(self, extractor):
        """Test CNPJ normalization"""
        normalized = extractor._normalize_value("12.345.678/0001-90", EntityType.CNPJ)
        assert normalized == "12345678000190"

    def test_normalize_valor_monetario(self, extractor):
        """Test monetary value normalization"""
        # R$ 1.000,00 = 100000 centavos
        normalized = extractor._normalize_value("R$ 1.000,00", EntityType.VALOR_MONETARIO)
        assert normalized == 100000

        # R$ 5,90 = 590 centavos
        normalized = extractor._normalize_value("R$ 5,90", EntityType.VALOR_MONETARIO)
        assert normalized == 590

        # R$ 10 = 1000 centavos
        normalized = extractor._normalize_value("R$ 10", EntityType.VALOR_MONETARIO)
        assert normalized == 1000

    def test_normalize_percentual(self, extractor):
        """Test percentage normalization"""
        normalized = extractor._normalize_value("10%", EntityType.PERCENTUAL)
        assert normalized == 10.0

        normalized = extractor._normalize_value("2,5%", EntityType.PERCENTUAL)
        assert normalized == 2.5

    def test_normalize_date(self, extractor):
        """Test date normalization"""
        normalized = extractor._normalize_value("23/01/2020", EntityType.DATA)
        assert normalized == "2020-01-23"


# Integration tests
class TestEntityExtractionIntegration:
    """Integration tests for complete extraction pipeline"""

    @pytest.fixture
    def extractor(self):
        return EntityExtractor()

    def test_complete_extraction_pipeline(self, extractor):
        """Test complete extraction from document to candidates"""
        # Create document with various entities
        metadata = DocumentMetadata(
            title="Circular 3.978",
            document_type=DocumentType.CIRCULAR,
            numero_normativo="3978",
            data_publicacao="2020-01-23",
            orgao_emissor="Banco Central do Brasil",
            assunto="PLD/FT",
            total_pages=5,
        )

        section = DocumentSection(
            level=1,
            title="Requisitos",
            content=(
                "As instituições devem cadastrar clientes com CPF 123.456.789-01 "
                "e CNPJ 12.345.678/0001-90. O limite para transações é R$ 10.000,00 "
                "e a taxa de juros é de 2,5% ao mês. "
                "Contato: suporte@banco.com.br ou (11) 98765-4321."
            ),
            subsections=[],
        )

        doc_structure = DocumentStructure(
            metadata=metadata,
            sections=[section],
            tables=[],
            full_text=section.content,
            confidence_score=0.9,
        )

        # Extract
        result = extractor.extract_from_document(doc_structure)

        # Verify extraction
        assert len(result.entities) >= 6  # CPF, CNPJ, valor, taxa, email, telefone

        # Verify entity types
        entity_types = result.get_unique_entity_types()
        assert EntityType.CPF in entity_types
        assert EntityType.CNPJ in entity_types
        assert EntityType.VALOR_MONETARIO in entity_types
        assert EntityType.PERCENTUAL in entity_types
        assert EntityType.EMAIL in entity_types
        assert EntityType.TELEFONE in entity_types

        # Verify field candidates
        assert len(result.field_candidates) > 0

        field_names = {f.name for f in result.field_candidates}
        assert "cpf" in field_names

        # Verify confidence
        assert result.confidence_score > 0.7


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
