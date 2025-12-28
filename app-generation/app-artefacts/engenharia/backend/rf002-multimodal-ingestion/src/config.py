# Configuration management for RF002
import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings
from pydantic import Field, field_validator

class Settings(BaseSettings):
    # Database
    database_url: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/supercore")
    database_pool_size: int = 10
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"
    
    # Storage
    upload_dir: Path = Path("/tmp/supercore/uploads")
    max_file_size: int = 100 * 1024 * 1024  # 100MB
    
    # Processing
    tesseract_cmd: str = "/usr/bin/tesseract"
    tesseract_lang: str = "eng+por+spa"
    whisper_model: str = "base"
    whisper_device: str = "cpu"
    playwright_timeout: int = 30000
    
    # API
    api_v1_prefix: str = "/api/v1"
    cors_origins: List[str] = ["http://localhost:3000"]
    log_level: str = "INFO"
    
    @field_validator("upload_dir")
    @classmethod
    def ensure_upload_dir_exists(cls, v: Path) -> Path:
        v.mkdir(parents=True, exist_ok=True)
        return v
    
    class Config:
        env_file = ".env"

settings = Settings()
