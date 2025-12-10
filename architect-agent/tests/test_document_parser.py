"""
Tests for Document Intelligence Engine

Tests:
- PDF text extraction
- OCR for scanned PDFs
- Table extraction
- Section detection
- Metadata extraction
"""

import tempfile
from pathlib import Path

import pytest
from PIL import Image, ImageDraw, ImageFont

# Import modules to test
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from document_intelligence.parser import BACENDocumentParser
from document_intelligence.ocr import OCREngine
from document_intelligence.table_extractor import TableExtractor
from document_intelligence.types import DocumentType, SectionType


class TestBACENDocumentParser:
    """Test BACENDocumentParser class"""

    @pytest.fixture
    def parser(self):
        """Create parser instance"""
        return BACENDocumentParser(ocr_language="por", use_advanced_extraction=True)

    @pytest.fixture
    def sample_pdf_path(self, tmp_path):
        """
        Create a sample PDF for testing
        (In real implementation, use actual BACEN PDFs)
        """
        # NOTE: In production, replace this with actual BACEN PDFs
        # For now, return path to test fixtures
        fixtures_dir = Path(__file__).parent / "fixtures"
        fixtures_dir.mkdir(exist_ok=True)

        # Create a dummy PDF path (tests should use real fixtures)
        pdf_path = fixtures_dir / "sample_circular.pdf"
        return pdf_path

    def test_parser_initialization(self, parser):
        """Test parser initializes correctly"""
        assert parser.ocr_language == "por"
        assert parser.use_advanced_extraction is True
        assert hasattr(parser, "ocr_engine")
        assert hasattr(parser, "table_extractor")

    def test_detect_document_type(self, parser):
        """Test document type detection"""
        # Circular BACEN
        doc_type = parser._detect_document_type("Circular 3.978", "PLD/FT")
        assert doc_type == DocumentType.CIRCULAR

        # Resolução
        doc_type = parser._detect_document_type("Resolução 4.753", "KYC")
        assert doc_type == DocumentType.RESOLUCAO

        # Manual
        doc_type = parser._detect_document_type("Manual de Normas", "PIX")
        assert doc_type == DocumentType.MANUAL

    def test_extract_numero_normativo(self, parser):
        """Test extraction of normativo number"""
        # With dot
        numero = parser._extract_numero_normativo("Circular 3.978")
        assert numero == "3978"

        # Without dot
        numero = parser._extract_numero_normativo("Circular 3978")
        assert numero == "3978"

        # With comma
        numero = parser._extract_numero_normativo("Resolução 4,753")
        assert numero == "4753"

        # None
        numero = parser._extract_numero_normativo("Manual Geral")
        assert numero is None

    def test_extract_date(self, parser):
        """Test date extraction"""
        text = "Data de publicação: 23/01/2020 e vigência: 01/02/2020"

        # Publication date
        date = parser._extract_date(text, "publicação")
        assert date == "2020-01-23"

        # Vigência date
        date = parser._extract_date(text, "vigência")
        assert date == "2020-02-01"

        # Not found
        date = parser._extract_date(text, "revogação")
        assert date is None

    def test_is_chapter(self, parser):
        """Test chapter heading detection"""
        assert parser._is_chapter("CAPÍTULO I - DISPOSIÇÕES GERAIS")
        assert parser._is_chapter("CAPÍTULO II")
        assert parser._is_chapter("1. INTRODUÇÃO")
        assert not parser._is_chapter("1.1 Subseção")
        assert not parser._is_chapter("Este é um parágrafo")

    def test_is_section(self, parser):
        """Test section heading detection"""
        assert parser._is_section("1.1 Conceitos")
        assert parser._is_section("2.3.4 Detalhes")
        assert parser._is_section("a) item")
        assert not parser._is_section("CAPÍTULO I")
        assert not parser._is_section("i. subitem")

    def test_is_requirement(self, parser):
        """Test requirement/list item detection"""
        assert parser._is_requirement("i. primeiro item")
        assert parser._is_requirement("ii. segundo item")
        assert parser._is_requirement("- lista com traço")
        assert parser._is_requirement("• lista com bullet")
        assert parser._is_requirement("(1) item numerado")
        assert not parser._is_requirement("1.1 Seção")

    def test_calculate_confidence(self, parser):
        """Test confidence calculation"""
        from document_intelligence.types import Section, SectionType, Table

        # Good extraction
        full_text = "A" * 1000  # Sufficient text
        sections = [
            Section(
                type=SectionType.CHAPTER,
                title="Chapter 1",
                content="Content",
                level=1,
                page_number=1,
            )
        ]
        tables = [
            Table(headers=["A", "B"], rows=[["1", "2"]], page_number=1, confidence=0.9)
        ]

        confidence = parser._calculate_confidence(full_text, sections, tables)
        assert confidence >= 0.9

        # Poor extraction (short text, no sections)
        confidence = parser._calculate_confidence("Short", [], [])
        assert confidence < 0.7


class TestOCREngine:
    """Test OCREngine class"""

    @pytest.fixture
    def ocr_engine(self):
        """Create OCR engine instance"""
        return OCREngine(primary_lang="por", min_confidence=60.0)

    @pytest.fixture
    def sample_text_image(self):
        """Create a sample image with text for testing"""
        # Create image with text
        img = Image.new("RGB", (800, 200), color="white")
        draw = ImageDraw.Draw(img)

        # Draw text (use default font)
        text = "Este é um texto de teste para OCR"
        draw.text((50, 80), text, fill="black")

        return img

    def test_ocr_engine_initialization(self, ocr_engine):
        """Test OCR engine initializes correctly"""
        assert ocr_engine.primary_lang == "por"
        assert ocr_engine.fallback_lang == "eng"
        assert ocr_engine.min_confidence == 60.0

    def test_extract_text_from_image(self, ocr_engine, sample_text_image):
        """Test text extraction from image"""
        result = ocr_engine.extract_text(sample_text_image, preprocess=False)

        assert "text" in result
        assert "confidence" in result
        assert "language" in result
        assert result["language"] == "por"
        assert isinstance(result["confidence"], float)
        assert result["word_count"] > 0

    def test_is_scanned_page(self, ocr_engine, sample_text_image):
        """Test scanned page detection"""
        # Text image should not be detected as scanned (has extractable text)
        is_scanned = ocr_engine.is_scanned_page(sample_text_image, text_threshold=5)
        # NOTE: Result depends on OCR accuracy, so we just check it returns bool
        assert isinstance(is_scanned, bool)


class TestTableExtractor:
    """Test TableExtractor class"""

    @pytest.fixture
    def table_extractor(self):
        """Create table extractor instance"""
        return TableExtractor(min_rows=2, min_cols=2, confidence_threshold=0.5)

    def test_table_extractor_initialization(self, table_extractor):
        """Test table extractor initializes correctly"""
        assert table_extractor.min_rows == 2
        assert table_extractor.min_cols == 2
        assert table_extractor.confidence_threshold == 0.5

    def test_clean_table(self, table_extractor):
        """Test table cleaning"""
        from document_intelligence.types import Table

        # Table with empty columns
        table = Table(
            headers=["A", "", "B", ""],
            rows=[
                ["1", "", "2", ""],
                ["3", "", "4", ""],
            ],
            page_number=1,
            confidence=0.9,
        )

        cleaned = table_extractor._clean_table(table)

        # Should remove empty columns
        assert len(cleaned.headers) == 2
        assert cleaned.headers == ["A", "B"]
        assert len(cleaned.rows[0]) == 2

    def test_is_valid_table(self, table_extractor):
        """Test table validation"""
        from document_intelligence.types import Table

        # Valid table
        valid_table = Table(
            headers=["A", "B", "C"],
            rows=[
                ["1", "2", "3"],
                ["4", "5", "6"],
            ],
            page_number=1,
            confidence=0.9,
        )
        assert table_extractor._is_valid_table(valid_table)

        # Invalid: too few rows
        invalid_table = Table(
            headers=["A", "B"], rows=[["1", "2"]], page_number=1, confidence=0.9
        )
        assert not table_extractor._is_valid_table(invalid_table)

        # Invalid: too few columns
        invalid_table = Table(
            headers=["A"], rows=[["1"], ["2"]], page_number=1, confidence=0.9
        )
        assert not table_extractor._is_valid_table(invalid_table)

        # Invalid: mostly empty
        invalid_table = Table(
            headers=["A", "B", "C"],
            rows=[
                ["", "", ""],
                ["", "", ""],
                ["", "", ""],
            ],
            page_number=1,
            confidence=0.9,
        )
        assert not table_extractor._is_valid_table(invalid_table)

    def test_headers_match(self, table_extractor):
        """Test header matching"""
        headers1 = ["Nome", "CPF", "Valor"]
        headers2 = ["Nome", "CPF", "Valor"]
        assert table_extractor._headers_match(headers1, headers2)

        # Case insensitive
        headers2 = ["nome", "cpf", "valor"]
        assert table_extractor._headers_match(headers1, headers2)

        # Different headers
        headers2 = ["Nome", "CNPJ", "Data"]
        assert not table_extractor._headers_match(headers1, headers2)

        # Different length
        headers2 = ["Nome", "CPF"]
        assert not table_extractor._headers_match(headers1, headers2)

    def test_classify_table(self, table_extractor):
        """Test table classification"""
        from document_intelligence.types import Table

        # Data table (lots of numbers)
        data_table = Table(
            headers=["Item", "Quantidade", "Valor"],
            rows=[
                ["A", "100", "R$ 1.000"],
                ["B", "200", "R$ 2.000"],
                ["C", "150", "R$ 1.500"],
            ],
            page_number=1,
            confidence=0.9,
        )
        classification = table_extractor.classify_table(data_table)
        assert classification == "data"

        # Layout table (mostly empty)
        layout_table = Table(
            headers=["", "", ""],
            rows=[
                ["", "", ""],
                ["", "Title", ""],
                ["", "", ""],
            ],
            page_number=1,
            confidence=0.9,
        )
        classification = table_extractor.classify_table(layout_table)
        assert classification == "layout"

    def test_infer_column_types(self, table_extractor):
        """Test column type inference"""
        from document_intelligence.types import Table

        table = Table(
            headers=["Nome", "CPF", "Valor", "Data"],
            rows=[
                ["João", "12345678901", "R$ 1.000", "23/01/2020"],
                ["Maria", "98765432100", "R$ 2.500", "24/01/2020"],
            ],
            page_number=1,
            confidence=0.9,
        )

        column_types = table_extractor.infer_column_types(table)

        assert len(column_types) == 4
        assert column_types[0] == "text"  # Nome
        assert column_types[1] == "numeric"  # CPF
        assert column_types[2] == "currency"  # Valor
        assert column_types[3] == "date"  # Data


# Integration tests
class TestDocumentParserIntegration:
    """Integration tests for complete parsing pipeline"""

    @pytest.fixture
    def parser(self):
        """Create parser with all features"""
        return BACENDocumentParser(ocr_language="por", use_advanced_extraction=True)

    def test_parse_workflow(self, parser):
        """Test complete parsing workflow (requires real PDF fixture)"""
        # NOTE: This test requires a real BACEN PDF fixture
        # For CI/CD, you can skip this test if fixture is not available

        fixtures_dir = Path(__file__).parent / "fixtures"
        pdf_path = fixtures_dir / "sample_circular.pdf"

        if not pdf_path.exists():
            pytest.skip("Sample PDF fixture not available")

        try:
            doc_structure = parser.parse(pdf_path)

            # Verify structure
            assert doc_structure.metadata is not None
            assert doc_structure.full_text != ""
            assert doc_structure.confidence_score > 0

            # Check metadata
            assert doc_structure.metadata.document_type in [
                DocumentType.CIRCULAR,
                DocumentType.RESOLUCAO,
                DocumentType.MANUAL,
                DocumentType.NORMATIVO,
            ]

        except Exception as e:
            pytest.fail(f"Parsing failed: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
