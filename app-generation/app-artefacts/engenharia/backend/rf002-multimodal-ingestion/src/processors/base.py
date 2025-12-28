# Base processor class
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ProcessorResult:
    def __init__(self, content_text: str = "", content_data: Dict = None, 
                 confidence: float = 1.0, language: str = "en"):
        self.content_text = content_text
        self.content_data = content_data or {}
        self.confidence = confidence
        self.language = language
        self.metadata = {}

class BaseProcessor(ABC):
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0.0"
    
    @abstractmethod
    def can_process(self, mime_type: str) -> bool:
        pass
    
    @abstractmethod
    def process(self, file_path: Path, **kwargs) -> List[ProcessorResult]:
        pass
    
    def _handle_error(self, error: Exception, file_path: Path) -> None:
        logger.error(f"{self.name} failed: {error}", extra={"file": str(file_path)})
        raise
