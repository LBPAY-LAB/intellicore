# Archive extraction processor
from pathlib import Path
from typing import List
import zipfile
import tarfile
import tempfile
import shutil
from .base import BaseProcessor, ProcessorResult
from src.config import settings

class ArchiveProcessor(BaseProcessor):
    def can_process(self, mime_type: str) -> bool:
        return mime_type in [
            "application/zip",
            "application/x-tar",
            "application/gzip",
            "application/x-bzip2",
        ]
    
    def process(self, file_path: Path, **kwargs) -> List[ProcessorResult]:
        depth = kwargs.get("depth", 0)
        
        if depth >= settings.max_archive_depth:
            return [ProcessorResult(
                content_text="Max archive depth reached",
                metadata={"warning": "archive_depth_exceeded"}
            )]
        
        # Extract to temp directory
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Extract based on type
            if file_path.suffix == ".zip":
                with zipfile.ZipFile(file_path) as zf:
                    zf.extractall(temp_path)
            elif file_path.suffix in [".tar", ".gz", ".tgz", ".bz2"]:
                with tarfile.open(file_path) as tf:
                    tf.extractall(temp_path)
            
            # List extracted files
            files = list(temp_path.rglob("*"))
            file_list = [str(f.relative_to(temp_path)) for f in files if f.is_file()]
            
            return [ProcessorResult(
                content_text=f"Extracted {len(file_list)} files",
                content_data={"files": file_list[:100]},  # Limit to 100
                metadata={"total_files": len(file_list), "depth": depth}
            )]
