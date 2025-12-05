"""Health check endpoints."""

from fastapi import APIRouter, Request

from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/health")
async def health_check(request: Request) -> dict:
    """
    Health check endpoint.

    Returns service status and Ollama availability.
    """
    ollama_service = request.app.state.ollama
    ollama_healthy = await ollama_service.health_check()

    return {
        "status": "healthy" if ollama_healthy else "degraded",
        "service": settings.app_name,
        "version": settings.app_version,
        "ollama": {
            "url": settings.ollama_url,
            "available": ollama_healthy,
        },
    }


@router.get("/ready")
async def readiness_check(request: Request) -> dict:
    """
    Readiness check for Kubernetes.

    Returns ready status when service can accept requests.
    """
    ollama_service = request.app.state.ollama
    ollama_healthy = await ollama_service.health_check()

    return {
        "ready": ollama_healthy,
        "checks": {
            "ollama": ollama_healthy,
        },
    }
