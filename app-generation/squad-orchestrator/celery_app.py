"""
Celery Application Configuration for Squad Orchestrator

This module configures Celery for distributed task execution with Redis as broker.
"""

from celery import Celery
import os

# Celery app configuration
celery_app = Celery(
    'squad_orchestrator',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1',
    include=['tasks']  # Auto-discover tasks module
)

# CRITICAL: Import tasks module to register tasks with Celery
# Without this import, tasks won't be discoverable by workers
import tasks  # noqa: F401

# Celery configuration
celery_app.conf.update(
    # Task settings
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='America/Sao_Paulo',
    enable_utc=True,

    # Task execution settings
    task_track_started=True,
    task_time_limit=1800,  # 30 minutes hard limit
    task_soft_time_limit=1700,  # 28 minutes soft limit (warning)

    # Retry settings
    task_acks_late=True,
    task_reject_on_worker_lost=True,

    # Result backend settings
    result_expires=86400,  # 24 hours
    result_persistent=True,

    # Worker settings
    worker_prefetch_multiplier=1,  # Only take 1 task at a time
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks (prevent memory leaks)
    worker_disable_rate_limits=True,

    # Monitoring
    worker_send_task_events=True,
    task_send_sent_event=True,

    # Redis settings
    redis_socket_timeout=30,
    redis_socket_connect_timeout=30,
    redis_retry_on_timeout=True,
    redis_max_connections=50,

    # Serialization
    task_compression='gzip',
    result_compression='gzip',
)

# Task routes - DISABLED to use default 'celery' queue
# If custom queues needed, worker must be started with: celery -A celery_app worker -Q celery,cards,maintenance
# celery_app.conf.task_routes = {
#     'tasks.execute_card_task': {'queue': 'cards'},
#     'tasks.cleanup_old_results': {'queue': 'maintenance'},
# }

if __name__ == '__main__':
    celery_app.start()
