# PDF processor with OCR support
from pathlib import Path
from typing import List
import PyPDF2
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
from .base import BaseProcessor, ProcessorResult
import logging

logger = logging.getLogger(__name__)

class PDFProcessor(BaseProcessor):
    def can_process(self, mime_type: str) -> bool:
        return mime_type == "application/pdf"
    
    def process(self, file_path: Path, **kwargs) -> List[ProcessorResult]:
        results = []
        try:
            # Try text extraction first
            text = self._extract_text(file_path)
            if text.strip():
                results.append(ProcessorResult(
                    content_text=text,
                    confidence=1.0,
                    language="en"
                ))
            else:
                # Fallback to OCR
                results.extend(self._extract_with_ocr(file_path))
            
            return results
        except Exception as e:
            self._handle_error(e, file_path)
    
    def _extract_text(self, file_path: Path) -> str:
        text = ""
        with open(file_path, "rb") as f:
            pdf_reader = PyPDF2.PdfReader(f)
            for page in pdf_reader.pages:
                text += page.extract_text() + "
"
        return text
    
    def _extract_with_ocr(self, file_path: Path) -> List[ProcessorResult]:
        results = []
        images = convert_from_path(file_path)
        
        for i, image in enumerate(images):
            try:
                text = pytesseract.image_to_string(image)
                confidence = self._estimate_ocr_confidence(text)
                
                results.append(ProcessorResult(
                    content_text=text,
                    confidence=confidence,
                    language="en",
                    metadata={"page_number": i + 1, "method": "ocr"}
                ))
            except Exception as e:
                logger.warning(f"OCR failed for page {i + 1}: {e}")
        
        return results
    
    def _estimate_ocr_confidence(self, text: str) -> float:
        # Simple heuristic: ratio of alphanumeric to total chars
        if not text:
            return 0.0
        alnum = sum(c.isalnum() or c.isspace() for c in text)
        return min(alnum / len(text), 1.0)
