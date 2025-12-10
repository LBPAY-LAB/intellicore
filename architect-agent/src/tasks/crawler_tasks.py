"""
Celery tasks for BACEN crawler

Tasks:
- crawl_bacen_updates: Periodic task to check for new normatives
- download_document_task: Download specific BACEN document
"""

import logging

from celery import Task

from ..celery_app import celery_app

logger = logging.getLogger(__name__)


class CallbackTask(Task):
    """Base task with callbacks"""

    def on_success(self, retval, task_id, args, kwargs):
        logger.info(f"Task {task_id} completed successfully")

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        logger.error(f"Task {task_id} failed: {exc}")


@celery_app.task(
    base=CallbackTask,
    bind=True,
    name="src.tasks.crawler_tasks.crawl_bacen_updates",
    max_retries=2,
)
def crawl_bacen_updates(self):
    """
    Periodic task to crawl BACEN for new normatives

    Process (Sprint 13):
        1. Fetch BACEN normatives page
        2. Compare with existing documents in database
        3. Download new documents
        4. Trigger parsing for new documents
        5. Send notifications for updates
    """
    logger.info("Starting BACEN crawler")

    # TODO: Implement in Sprint 13
    # from ..bacen_crawler import BACENCrawler
    # crawler = BACENCrawler()
    # new_documents = crawler.check_updates()

    logger.info("BACEN crawler not yet implemented (Sprint 13)")
    return {"status": "pending", "new_documents": 0}


@celery_app.task(
    base=CallbackTask,
    bind=True,
    name="src.tasks.crawler_tasks.download_document_task",
    max_retries=3,
)
def download_document_task(self, url: str, document_type: str):
    """
    Download specific BACEN document

    Args:
        url: Document URL
        document_type: Type of document

    Returns:
        dict: Download result with file_path
    """
    logger.info(f"Downloading document from {url}")

    # TODO: Implement download logic (Sprint 13)
    return {"status": "pending", "message": "Document download - Sprint 13"}
