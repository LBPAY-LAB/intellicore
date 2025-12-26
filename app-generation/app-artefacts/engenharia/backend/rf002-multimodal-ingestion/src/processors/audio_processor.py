# Audio transcription processor
from pathlib import Path
from typing import List
import whisper
from .base import BaseProcessor, ProcessorResult
from src.config import settings

class AudioProcessor(BaseProcessor):
    def __init__(self):
        super().__init__()
        self.model = whisper.load_model(settings.whisper_model)
    
    def can_process(self, mime_type: str) -> bool:
        return mime_type.startswith("audio/")
    
    def process(self, file_path: Path, **kwargs) -> List[ProcessorResult]:
        result = self.model.transcribe(
            str(file_path),
            fp16=False if settings.whisper_device == "cpu" else True
        )
        
        return [ProcessorResult(
            content_text=result["text"],
            confidence=1.0,
            language=result.get("language", "en"),
            metadata={"segments": len(result.get("segments", []))}
        )]
