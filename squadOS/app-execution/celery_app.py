#!/usr/bin/env python3
"""
SquadOS Celery Application
Distributed task queue for Agent Owners orchestration

Configuration:
- Broker: Redis (localhost:6379/2)
- Backend: Redis (localhost:6379/2)
- Queues: squadOS.owners, squadOS.validation, squadOS.debugging, squadOS.failed
- Workers: 5 concurrent (configurable)
"""

from celery import Celery
import os

# ============================================================================
# Configuration
# ============================================================================

REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = int(os.getenv('REDIS_PORT', 6379))
REDIS_DB = int(os.getenv('REDIS_DB', 2))

BROKER_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
BACKEND_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'

# ============================================================================
# Celery App
# ============================================================================

celery_app = Celery(
    'squadOS',
    broker=BROKER_URL,
    backend=BACKEND_URL,
    include=['tasks']  # Auto-import tasks module
)

# ============================================================================
# Advanced Configuration
# ============================================================================

celery_app.conf.update(
    # Serialization (JSON only for security)
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',

    # Timezone
    timezone='UTC',
    enable_utc=True,

    # Task routing (queue per task type)
    task_routes={
        'tasks.hello_world': {'queue': 'squadOS.test'},
        'tasks.execute_owner_task': {'queue': 'squadOS.owners'},
        'tasks.execute_verification': {'queue': 'squadOS.validation'},
        'tasks.execute_llm_judge': {'queue': 'squadOS.validation'},
        'tasks.execute_qa': {'queue': 'squadOS.validation'},
        'tasks.execute_debugging': {'queue': 'squadOS.debugging'},
    },

    # Priority queue support
    task_default_priority=5,
    task_queue_max_priority=10,

    # Reliability
    task_acks_late=True,  # Acknowledge task AFTER completion (not before)
    worker_prefetch_multiplier=1,  # Fetch 1 task at a time (fair distribution)

    # Timeouts
    task_time_limit=3600,  # 1 hour hard limit (kill task)
    task_soft_time_limit=3000,  # 50 min soft limit (raise exception)

    # Result expiration
    result_expires=3600,  # Results expire after 1 hour

    # Dead Letter Queue behavior
    task_reject_on_worker_lost=True,  # Reject task if worker dies
    task_send_sent_event=True,  # Send events for monitoring

    # Retry policy (global defaults)
    task_autoretry_for=(Exception,),  # Retry on any exception
    task_retry_kwargs={'max_retries': 3, 'countdown': 60},  # 3 retries, 60s delay
    task_retry_backoff=True,  # Exponential backoff
    task_retry_backoff_max=600,  # Max 10 minutes backoff
    task_retry_jitter=True,  # Add jitter to prevent thundering herd

    # Worker configuration
    worker_max_tasks_per_child=100,  # Restart worker after 100 tasks (prevent memory leaks)
    worker_disable_rate_limits=False,
    worker_send_task_events=True,  # Send task events to monitoring

    # Logging
    worker_log_format='[%(asctime)s: %(levelname)s/%(processName)s] %(message)s',
    worker_task_log_format='[%(asctime)s: %(levelname)s/%(processName)s][%(task_name)s(%(task_id)s)] %(message)s',
)

# ============================================================================
# Beat Schedule (future: periodic tasks)
# ============================================================================

celery_app.conf.beat_schedule = {
    # Example: Run cleanup every day at midnight
    # 'cleanup-expired-results': {
    #     'task': 'tasks.cleanup_expired_results',
    #     'schedule': crontab(hour=0, minute=0),
    # },
}

if __name__ == '__main__':
    celery_app.start()
