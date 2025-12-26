# Unit tests for file processors
import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from src.processors.base import ProcessorResult
from src.processors.pdf_processor import PDFProcessor
from src.processors.image_processor import ImageProcessor
from src.processors.audio_processor import AudioProcessor
from src.processors.web_processor import WebProcessor
from src.processors import router

class TestPDFProcessor:
    def test_can_process_pdf(self):
        processor = PDFProcessor()
        assert processor.can_process("application/pdf") is True
        assert processor.can_process("image/png") is False
    
    @patch("src.processors.pdf_processor.PyPDF2.PdfReader")
    def test_extract_text(self, mock_reader):
        mock_page = Mock()
        mock_page.extract_text.return_value = "Sample text"
        mock_reader.return_value.pages = [mock_page]
        
        processor = PDFProcessor()
        text = processor._extract_text(Path("/tmp/test.pdf"))
        
        assert "Sample text" in text
    
    def test_estimate_ocr_confidence(self):
        processor = PDFProcessor()
        
        # High quality text
        assert processor._estimate_ocr_confidence("Hello World") > 0.8
        
        # Low quality (many special chars)
        assert processor._estimate_ocr_confidence("###@@@!!!") < 0.5
        
        # Empty
        assert processor._estimate_ocr_confidence("") == 0.0

class TestImageProcessor:
    def test_can_process_images(self):
        processor = ImageProcessor()
        assert processor.can_process("image/png") is True
        assert processor.can_process("image/jpeg") is True
        assert processor.can_process("application/pdf") is False
    
    @patch("src.processors.image_processor.pytesseract.image_to_string")
    @patch("src.processors.image_processor.pytesseract.image_to_data")
    @patch("src.processors.image_processor.Image.open")
    def test_process_image(self, mock_open, mock_data, mock_string):
        mock_img = Mock()
        mock_img.width = 800
        mock_img.height = 600
        mock_open.return_value = mock_img
        
        mock_data.return_value = {"conf": ["95", "90", "85"]}
        mock_string.return_value = "Extracted text"
        
        processor = ImageProcessor()
        results = processor.process(Path("/tmp/test.png"))
        
        assert len(results) == 1
        assert results[0].content_text == "Extracted text"
        assert results[0].confidence > 0.8

class TestAudioProcessor:
    def test_can_process_audio(self):
        processor = AudioProcessor()
        assert processor.can_process("audio/mpeg") is True
        assert processor.can_process("audio/wav") is True
        assert processor.can_process("video/mp4") is False

class TestWebProcessor:
    def test_can_process_html(self):
        processor = WebProcessor()
        assert processor.can_process("text/html") is True
        assert processor.can_process("application/pdf") is False
    
    def test_extract_from_html(self):
        processor = WebProcessor()
        html = "<html><body><p>Hello</p><script>alert(1)</script></body></html>"
        
        results = processor._extract_from_html(html)
        
        assert len(results) == 1
        assert "Hello" in results[0].content_text
        assert "alert" not in results[0].content_text  # Scripts removed

class TestProcessorRouter:
    def test_get_processor_for_pdf(self):
        processor = router.get_processor("application/pdf")
        assert isinstance(processor, PDFProcessor)
    
    def test_get_processor_for_image(self):
        processor = router.get_processor("image/png")
        assert isinstance(processor, ImageProcessor)
    
    def test_get_processor_unsupported(self):
        processor = router.get_processor("application/unknown")
        assert processor is None
