"""Monitoring API endpoints for Sprint 9 (US-046) - LLM Monitoring & Logging."""

from fastapi import APIRouter, HTTPException

from app.services.monitoring import get_monitoring_service

router = APIRouter()


@router.get("/metrics")
async def get_metrics() -> dict:
    """
    Get comprehensive LLM metrics summary.

    Returns aggregated metrics including:
    - Total calls, success/failure rates
    - Token usage statistics
    - Latency percentiles (avg, p95, p99)
    - Breakdown by model, operation, and template
    - Error type counts
    """
    service = get_monitoring_service()
    return service.get_metrics_summary()


@router.get("/metrics/models")
async def get_model_metrics() -> dict:
    """
    Get per-model statistics.

    Returns detailed metrics for each model including:
    - Call counts
    - Success rates
    - Average latency
    - Total tokens used
    """
    service = get_monitoring_service()
    return service.get_model_stats()


@router.get("/calls")
async def get_recent_calls(limit: int = 100) -> dict:
    """
    Get recent LLM call history.

    Args:
        limit: Maximum number of calls to return (default: 100)

    Returns recent calls with:
    - Request ID
    - Timestamp
    - Model and operation
    - Token counts
    - Latency
    - Success status
    """
    if limit < 1 or limit > 1000:
        raise HTTPException(status_code=400, detail="Limit must be between 1 and 1000")

    service = get_monitoring_service()
    calls = service.get_recent_calls(limit)
    return {
        "calls": calls,
        "count": len(calls),
        "limit": limit,
    }


@router.get("/errors")
async def get_errors() -> dict:
    """
    Get error summary and recent errors.

    Returns:
    - Total error count
    - Error rate
    - Error type breakdown
    - Recent error details
    """
    service = get_monitoring_service()
    return service.get_error_summary()


@router.post("/reset")
async def reset_metrics() -> dict:
    """
    Reset all metrics (use with caution).

    This action cannot be undone. All historical metrics will be lost.
    """
    service = get_monitoring_service()
    service.reset_metrics()
    return {"status": "ok", "message": "Metrics reset successfully"}


@router.get("/health")
async def monitoring_health() -> dict:
    """
    Check monitoring service health.

    Returns basic health status and current metric counts.
    """
    service = get_monitoring_service()
    summary = service.get_metrics_summary()
    return {
        "status": "healthy",
        "total_calls_tracked": summary["summary"]["total_calls"],
        "success_rate": summary["summary"]["success_rate"],
    }
