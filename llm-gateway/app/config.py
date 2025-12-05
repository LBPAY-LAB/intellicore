"""Application configuration using Pydantic Settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "LLM Gateway"
    app_version: str = "1.0.0"
    debug: bool = False
    log_level: str = "INFO"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Ollama Configuration
    ollama_url: str = "http://localhost:11434"
    ollama_default_model: str = "llama3.2"
    ollama_embedding_model: str = "nomic-embed-text"
    ollama_timeout: int = 120  # seconds

    # Valkey (Redis) Configuration
    valkey_url: str = "redis://localhost:6379"
    valkey_cache_ttl: int = 3600  # 1 hour

    # Rate Limiting
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds

    # Model Management
    allowed_models: list[str] = [
        "llama3.2",
        "llama3.2:1b",
        "llama3.2:3b",
        "mistral",
        "codellama",
        "nomic-embed-text",
    ]

    # Prompt Templates
    templates_dir: str = "app/templates/prompts"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
