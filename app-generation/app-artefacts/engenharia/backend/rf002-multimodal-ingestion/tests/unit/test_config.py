# Unit tests for configuration
import pytest
from pathlib import Path
from src.config import Settings

class TestSettings:
    def test_default_settings(self):
        settings = Settings()
        assert settings.database_pool_size == 10
        assert settings.whisper_model == "base"
        assert settings.log_level == "INFO"
    
    def test_upload_dir_creation(self, tmp_path):
        settings = Settings(upload_dir=tmp_path / "uploads")
        assert settings.upload_dir.exists()
