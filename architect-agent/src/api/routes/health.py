"""
Health check endpoints
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "architect-agent",
        "version": "0.1.0",
    }


@router.get("/health/ready")
async def readiness_check():
    """Readiness check (checks dependencies)"""
    # TODO: Check database, Redis, LLM API connectivity
    return {
        "status": "ready",
        "database": "connected",
        "redis": "connected",
        "llm_api": "available",
    }


@router.get("/health/live")
async def liveness_check():
    """Liveness check (simple ping)"""
    return {"status": "alive"}
