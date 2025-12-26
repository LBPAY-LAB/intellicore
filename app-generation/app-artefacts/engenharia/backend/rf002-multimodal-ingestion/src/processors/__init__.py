# Processor router - selects appropriate processor for file type
from pathlib import Path
from typing import List, Optional
from .base import BaseProcessor, ProcessorResult
from .pdf_processor import PDFProcessor
from .audio_processor import AudioProcessor
from .image_processor import ImageProcessor
from .web_processor import WebProcessor
from .office_processor import OfficeProcessor
from .archive_processor import ArchiveProcessor

class ProcessorRouter:
    def __init__(self):
        self.processors: List[BaseProcessor] = [
            PDFProcessor(),
            AudioProcessor(),
            ImageProcessor(),
            WebProcessor(),
            OfficeProcessor(),
            ArchiveProcessor(),
        ]
    
    def get_processor(self, mime_type: str) -> Optional[BaseProcessor]:
        for processor in self.processors:
            if processor.can_process(mime_type):
                return processor
        return None
    
    def process_file(self, file_path: Path, mime_type: str, **kwargs) -> List[ProcessorResult]:
        processor = self.get_processor(mime_type)
        
        if not processor:
            raise ValueError(f"No processor found for MIME type: {mime_type}")
        
        return processor.process(file_path, mime_type=mime_type, **kwargs)

router = ProcessorRouter()
