# Image OCR processor
from pathlib import Path
from typing import List
from PIL import Image
import pytesseract
from .base import BaseProcessor, ProcessorResult
from src.config import settings

class ImageProcessor(BaseProcessor):
    def can_process(self, mime_type: str) -> bool:
        return mime_type.startswith("image/")
    
    def process(self, file_path: Path, **kwargs) -> List[ProcessorResult]:
        image = Image.open(file_path)
        
        # Get OCR data with confidence
        data = pytesseract.image_to_data(image, lang=settings.tesseract_lang, output_type=pytesseract.Output.DICT)
        
        # Extract text
        text = pytesseract.image_to_string(image, lang=settings.tesseract_lang)
        
        # Calculate average confidence
        confidences = [int(conf) for conf in data["conf"] if conf != "-1"]
        avg_confidence = sum(confidences) / len(confidences) / 100 if confidences else 0.5
        
        return [ProcessorResult(
            content_text=text,
            confidence=avg_confidence,
            language="en",
            metadata={"width": image.width, "height": image.height}
        )]
