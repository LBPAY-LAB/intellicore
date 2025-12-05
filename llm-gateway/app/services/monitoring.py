"""LLM Monitoring and Logging Service for Sprint 9 (US-046)."""

import time
from collections import defaultdict
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

import structlog

logger = structlog.get_logger()


@dataclass
class LLMCallMetrics:
    """Metrics for a single LLM call."""

    request_id: str
    timestamp: datetime
    model: str
    template_id: str | None
    operation: str  # chat, generate, embedding, validation
    input_tokens: int | None
    output_tokens: int | None
    latency_ms: float
    success: bool
    error: str | None = None
    metadata: dict = field(default_factory=dict)


@dataclass
class AggregatedMetrics:
    """Aggregated metrics over a time period."""

    period_start: datetime
    period_end: datetime
    total_calls: int = 0
    successful_calls: int = 0
    failed_calls: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    avg_latency_ms: float = 0.0
    max_latency_ms: float = 0.0
    min_latency_ms: float = float("inf")
    calls_by_model: dict = field(default_factory=dict)
    calls_by_operation: dict = field(default_factory=dict)
    calls_by_template: dict = field(default_factory=dict)
    error_counts: dict = field(default_factory=dict)


class LLMMonitoringService:
    """
    Service for monitoring LLM calls and collecting metrics.

    Provides:
    - Per-call logging with structured data
    - Aggregated metrics for dashboards
    - Error tracking and alerting hooks
    - Token usage tracking for cost estimation
    """

    def __init__(self, max_history: int = 10000) -> None:
        """Initialize the monitoring service."""
        self._call_history: list[LLMCallMetrics] = []
        self._max_history = max_history
        self._request_counter = 0

        # Aggregated metrics
        self._total_calls = 0
        self._successful_calls = 0
        self._failed_calls = 0
        self._total_input_tokens = 0
        self._total_output_tokens = 0
        self._total_latency_ms = 0.0

        # Breakdown counters
        self._calls_by_model: dict[str, int] = defaultdict(int)
        self._calls_by_operation: dict[str, int] = defaultdict(int)
        self._calls_by_template: dict[str, int] = defaultdict(int)
        self._error_types: dict[str, int] = defaultdict(int)

        # Latency tracking
        self._latencies: list[float] = []

        logger.info("LLM Monitoring Service initialized")

    def generate_request_id(self) -> str:
        """Generate a unique request ID."""
        self._request_counter += 1
        timestamp = int(time.time() * 1000)
        return f"llm-{timestamp}-{self._request_counter:06d}"

    def start_call(
        self,
        model: str,
        operation: str,
        template_id: str | None = None,
        metadata: dict | None = None,
    ) -> "CallContext":
        """
        Start tracking an LLM call.

        Returns a context manager for tracking the call lifecycle.
        """
        request_id = self.generate_request_id()
        return CallContext(
            monitoring_service=self,
            request_id=request_id,
            model=model,
            operation=operation,
            template_id=template_id,
            metadata=metadata or {},
        )

    def record_call(self, metrics: LLMCallMetrics) -> None:
        """Record metrics for a completed call."""
        # Add to history
        self._call_history.append(metrics)
        if len(self._call_history) > self._max_history:
            self._call_history.pop(0)

        # Update aggregates
        self._total_calls += 1
        if metrics.success:
            self._successful_calls += 1
        else:
            self._failed_calls += 1
            if metrics.error:
                error_type = metrics.error.split(":")[0] if ":" in metrics.error else metrics.error
                self._error_types[error_type] += 1

        # Token tracking
        if metrics.input_tokens:
            self._total_input_tokens += metrics.input_tokens
        if metrics.output_tokens:
            self._total_output_tokens += metrics.output_tokens

        # Latency tracking
        self._total_latency_ms += metrics.latency_ms
        self._latencies.append(metrics.latency_ms)
        if len(self._latencies) > self._max_history:
            self._latencies.pop(0)

        # Breakdown tracking
        self._calls_by_model[metrics.model] += 1
        self._calls_by_operation[metrics.operation] += 1
        if metrics.template_id:
            self._calls_by_template[metrics.template_id] += 1

        # Log the call
        log_data = {
            "request_id": metrics.request_id,
            "model": metrics.model,
            "operation": metrics.operation,
            "latency_ms": round(metrics.latency_ms, 2),
            "success": metrics.success,
        }
        if metrics.template_id:
            log_data["template_id"] = metrics.template_id
        if metrics.input_tokens:
            log_data["input_tokens"] = metrics.input_tokens
        if metrics.output_tokens:
            log_data["output_tokens"] = metrics.output_tokens
        if metrics.error:
            log_data["error"] = metrics.error

        if metrics.success:
            logger.info("LLM call completed", **log_data)
        else:
            logger.error("LLM call failed", **log_data)

    def get_metrics_summary(self) -> dict[str, Any]:
        """Get a summary of all metrics."""
        avg_latency = self._total_latency_ms / self._total_calls if self._total_calls > 0 else 0
        max_latency = max(self._latencies) if self._latencies else 0
        min_latency = min(self._latencies) if self._latencies else 0
        p95_latency = self._calculate_percentile(self._latencies, 95) if self._latencies else 0
        p99_latency = self._calculate_percentile(self._latencies, 99) if self._latencies else 0

        return {
            "summary": {
                "total_calls": self._total_calls,
                "successful_calls": self._successful_calls,
                "failed_calls": self._failed_calls,
                "success_rate": self._successful_calls / self._total_calls if self._total_calls > 0 else 0,
            },
            "tokens": {
                "total_input": self._total_input_tokens,
                "total_output": self._total_output_tokens,
                "total": self._total_input_tokens + self._total_output_tokens,
            },
            "latency": {
                "avg_ms": round(avg_latency, 2),
                "min_ms": round(min_latency, 2),
                "max_ms": round(max_latency, 2),
                "p95_ms": round(p95_latency, 2),
                "p99_ms": round(p99_latency, 2),
            },
            "breakdown": {
                "by_model": dict(self._calls_by_model),
                "by_operation": dict(self._calls_by_operation),
                "by_template": dict(self._calls_by_template),
            },
            "errors": dict(self._error_types),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_recent_calls(self, limit: int = 100) -> list[dict]:
        """Get recent call history."""
        calls = self._call_history[-limit:]
        return [
            {
                "request_id": c.request_id,
                "timestamp": c.timestamp.isoformat(),
                "model": c.model,
                "operation": c.operation,
                "template_id": c.template_id,
                "input_tokens": c.input_tokens,
                "output_tokens": c.output_tokens,
                "latency_ms": round(c.latency_ms, 2),
                "success": c.success,
                "error": c.error,
            }
            for c in reversed(calls)
        ]

    def get_error_summary(self) -> dict[str, Any]:
        """Get a summary of errors."""
        recent_errors = [c for c in self._call_history if not c.success][-50:]
        return {
            "total_errors": self._failed_calls,
            "error_rate": self._failed_calls / self._total_calls if self._total_calls > 0 else 0,
            "error_types": dict(self._error_types),
            "recent_errors": [
                {
                    "request_id": e.request_id,
                    "timestamp": e.timestamp.isoformat(),
                    "model": e.model,
                    "operation": e.operation,
                    "error": e.error,
                }
                for e in reversed(recent_errors)
            ],
        }

    def get_model_stats(self) -> dict[str, Any]:
        """Get per-model statistics."""
        model_stats = {}
        for model, count in self._calls_by_model.items():
            model_calls = [c for c in self._call_history if c.model == model]
            if model_calls:
                latencies = [c.latency_ms for c in model_calls]
                success_count = sum(1 for c in model_calls if c.success)
                model_stats[model] = {
                    "total_calls": count,
                    "success_rate": success_count / count,
                    "avg_latency_ms": round(sum(latencies) / len(latencies), 2),
                    "total_tokens": sum((c.input_tokens or 0) + (c.output_tokens or 0) for c in model_calls),
                }
        return model_stats

    def reset_metrics(self) -> None:
        """Reset all metrics (use with caution)."""
        self._call_history.clear()
        self._total_calls = 0
        self._successful_calls = 0
        self._failed_calls = 0
        self._total_input_tokens = 0
        self._total_output_tokens = 0
        self._total_latency_ms = 0.0
        self._calls_by_model.clear()
        self._calls_by_operation.clear()
        self._calls_by_template.clear()
        self._error_types.clear()
        self._latencies.clear()
        logger.info("LLM metrics reset")

    @staticmethod
    def _calculate_percentile(values: list[float], percentile: int) -> float:
        """Calculate the given percentile of values."""
        if not values:
            return 0.0
        sorted_values = sorted(values)
        index = int(len(sorted_values) * percentile / 100)
        return sorted_values[min(index, len(sorted_values) - 1)]


class CallContext:
    """Context manager for tracking LLM call lifecycle."""

    def __init__(
        self,
        monitoring_service: LLMMonitoringService,
        request_id: str,
        model: str,
        operation: str,
        template_id: str | None,
        metadata: dict,
    ) -> None:
        self.monitoring_service = monitoring_service
        self.request_id = request_id
        self.model = model
        self.operation = operation
        self.template_id = template_id
        self.metadata = metadata
        self.start_time: float | None = None
        self.input_tokens: int | None = None
        self.output_tokens: int | None = None

    def __enter__(self) -> "CallContext":
        self.start_time = time.perf_counter()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        end_time = time.perf_counter()
        latency_ms = (end_time - self.start_time) * 1000 if self.start_time else 0

        metrics = LLMCallMetrics(
            request_id=self.request_id,
            timestamp=datetime.now(timezone.utc),
            model=self.model,
            template_id=self.template_id,
            operation=self.operation,
            input_tokens=self.input_tokens,
            output_tokens=self.output_tokens,
            latency_ms=latency_ms,
            success=exc_type is None,
            error=str(exc_val) if exc_val else None,
            metadata=self.metadata,
        )

        self.monitoring_service.record_call(metrics)

    def set_tokens(self, input_tokens: int | None = None, output_tokens: int | None = None) -> None:
        """Set token counts for this call."""
        if input_tokens is not None:
            self.input_tokens = input_tokens
        if output_tokens is not None:
            self.output_tokens = output_tokens


# Global monitoring service instance
_monitoring_service: LLMMonitoringService | None = None


def get_monitoring_service() -> LLMMonitoringService:
    """Get the global monitoring service instance."""
    global _monitoring_service
    if _monitoring_service is None:
        _monitoring_service = LLMMonitoringService()
    return _monitoring_service
