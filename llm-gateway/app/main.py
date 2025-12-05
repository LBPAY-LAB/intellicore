"""FastAPI application entry point for LLM Gateway Service."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import chat, crawler, health, models, monitoring, templates, validation
from app.config import get_settings
from app.services.ollama import OllamaService

logger = structlog.get_logger()
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    # Startup
    logger.info("Starting LLM Gateway Service", version=settings.app_version)

    # Initialize Ollama service
    ollama_service = OllamaService()
    app.state.ollama = ollama_service

    # Check Ollama connection
    try:
        is_available = await ollama_service.health_check()
        if is_available:
            logger.info("Ollama connection established", url=settings.ollama_url)
            # List available models
            models_list = await ollama_service.list_models()
            logger.info("Available models", count=len(models_list))
        else:
            logger.warning("Ollama not available", url=settings.ollama_url)
    except Exception as e:
        logger.error("Failed to connect to Ollama", error=str(e))

    yield

    # Shutdown
    logger.info("Shutting down LLM Gateway Service")
    await ollama_service.close()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="LLM Gateway Service for intelliCore - AI-native meta-modeling platform",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(models.router, prefix="/api/v1/models", tags=["Models"])
app.include_router(templates.router, prefix="/api/v1/templates", tags=["Templates"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(validation.router, prefix="/api/v1/validation", tags=["Validation"])
app.include_router(monitoring.router, prefix="/api/v1/monitoring", tags=["Monitoring"])
app.include_router(crawler.router, prefix="/api/v1/crawler", tags=["Web Crawler"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
    )
