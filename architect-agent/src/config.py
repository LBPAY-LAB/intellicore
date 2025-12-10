"""
Configuration management using pydantic-settings
"""

from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/supercore",
        description="PostgreSQL connection string",
    )
    vector_dimension: int = Field(
        default=1536, description="Embedding dimension (OpenAI text-embedding-3-large)"
    )

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")

    # LLM Providers
    anthropic_api_key: str = Field(default="", description="Anthropic API key for Claude")
    openai_api_key: str = Field(default="", description="OpenAI API key for embeddings")

    # LLM Configuration
    llm_provider: Literal["anthropic", "openai"] = Field(
        default="anthropic", description="LLM provider to use"
    )
    claude_model: str = Field(
        default="claude-opus-4-20250514", description="Claude model version"
    )
    embedding_model: str = Field(
        default="text-embedding-3-large", description="OpenAI embedding model"
    )

    # API Configuration
    api_host: str = Field(default="0.0.0.0", description="API host")
    api_port: int = Field(default=8000, description="API port")
    api_workers: int = Field(default=4, description="Number of API workers")
    cors_origins: list[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        description="Allowed CORS origins",
    )

    # Celery
    celery_broker_url: str = Field(
        default="redis://localhost:6379/1", description="Celery broker URL"
    )
    celery_result_backend: str = Field(
        default="redis://localhost:6379/2", description="Celery result backend URL"
    )

    # Document Processing
    max_file_size_mb: int = Field(default=50, description="Maximum upload file size in MB")
    upload_dir: str = Field(
        default="/tmp/architect-agent/uploads", description="Upload directory path"
    )
    ocr_language: str = Field(default="por", description="OCR language (Portuguese)")

    # BACEN Crawler
    bacen_base_url: str = Field(default="https://www.bcb.gov.br", description="BACEN base URL")
    crawler_user_agent: str = Field(
        default="SuperCore-ArchitectAgent/0.1.0", description="Crawler user agent"
    )
    crawler_delay_seconds: int = Field(default=2, description="Delay between requests (seconds)")
    crawler_max_pages: int = Field(default=100, description="Maximum pages to crawl")

    # Logging
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(
        default="INFO", description="Logging level"
    )
    log_format: Literal["json", "console"] = Field(
        default="json", description="Log format (json or console)"
    )

    # Monitoring
    prometheus_port: int = Field(default=9090, description="Prometheus metrics port")


# Global settings instance
settings = Settings()
