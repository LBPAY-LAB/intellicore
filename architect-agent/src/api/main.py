"""
FastAPI Application - Architect Agent API

Endpoints:
- POST /api/v1/architect/upload - Upload BACEN PDF for processing
- GET /api/v1/architect/documents - List processed documents
- GET /api/v1/architect/documents/{id} - Get document details
- GET /api/v1/architect/tasks/{task_id} - Get task status
- POST /api/v1/architect/generate - Generate object_definition from document
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from prometheus_client import make_asgi_app

from ..config import settings
from .routes import architect, health

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("Starting Architect Agent API")
    logger.info(f"Environment: {settings.log_level}")
    logger.info(f"LLM Provider: {settings.llm_provider}")

    yield

    # Shutdown
    logger.info("Shutting down Architect Agent API")


# Create FastAPI app
app = FastAPI(
    title="Architect Agent API",
    description="Auto-generates object_definitions from BACEN documents",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Prometheus metrics
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["Health"])
app.include_router(architect.router, prefix="/api/v1/architect", tags=["Architect"])


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Architect Agent",
        "version": "0.1.0",
        "status": "running",
        "docs": "/api/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=True,
        log_level=settings.log_level.lower(),
    )
