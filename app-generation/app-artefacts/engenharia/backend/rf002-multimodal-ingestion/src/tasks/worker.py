# Celery worker configuration
from celery import Celery
from src.config import settings

celery_app = Celery(
    "rf002-multimodal-ingestion",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["src.tasks.process_document"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
)
