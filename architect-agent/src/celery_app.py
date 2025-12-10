"""
Celery Application Configuration

Celery is used for:
- Async document parsing (PDF → DocumentStructure)
- Entity extraction (NLP with spaCy)
- Schema generation (LLM calls)
- BACEN crawler tasks
"""

import logging

from celery import Celery
from celery.signals import after_setup_logger

from .config import settings

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery(
    "architect-agent",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "src.tasks.document_tasks",
        "src.tasks.schema_tasks",
        "src.tasks.crawler_tasks",
    ],
)

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="America/Sao_Paulo",
    enable_utc=True,
    # Result backend settings
    result_expires=3600 * 24,  # 24 hours
    result_extended=True,
    # Task execution settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    task_time_limit=3600,  # 1 hour hard limit
    task_soft_time_limit=3000,  # 50 minutes soft limit
    # Retry settings
    task_autoretry_for=(Exception,),
    task_retry_kwargs={"max_retries": 3, "countdown": 60},
    # Worker settings
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
    # Beat schedule (periodic tasks)
    beat_schedule={
        "crawl-bacen-updates": {
            "task": "src.tasks.crawler_tasks.crawl_bacen_updates",
            "schedule": 3600 * 6,  # Every 6 hours
        },
    },
)


@after_setup_logger.connect
def setup_loggers(logger, *args, **kwargs):
    """Configure Celery logging"""
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)


if __name__ == "__main__":
    celery_app.start()
