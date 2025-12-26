# Celery task for processing documents
from celery import Task
from pathlib import Path
from uuid import UUID
import logging
from src.tasks.worker import celery_app
from src.processors import router
from src.db.repository import DocumentRepository, ContentRepository
from src.models import DocumentStatus

logger = logging.getLogger(__name__)

class ProcessDocumentTask(Task):
    name = "process_document"
    max_retries = 3
    default_retry_delay = 60

@celery_app.task(base=ProcessDocumentTask, bind=True)
def process_document(self, document_id: str):
    """Process a document asynchronously.
    
    Args:
        document_id: UUID of document to process
    """
    doc_repo = DocumentRepository()
    content_repo = ContentRepository()
    
    try:
        # Get document
        doc = doc_repo.get_by_id(UUID(document_id))
        if not doc:
            logger.error(f"Document {document_id} not found")
            return
        
        # Update status to processing
        doc_repo.update_status(UUID(document_id), DocumentStatus.PROCESSING)
        
        # Process file
        file_path = Path(doc.file_path)
        results = router.process_file(file_path, doc.mime_type)
        
        # Save processed content
        for result in results:
            content_repo.create(
                document_id=UUID(document_id),
                content_text=result.content_text,
                content_data=result.content_data,
                confidence=result.confidence,
                language=result.language,
                metadata=result.metadata
            )
        
        # Update status to completed
        doc_repo.update_status(UUID(document_id), DocumentStatus.COMPLETED, progress=100)
        
        logger.info(f"Document {document_id} processed successfully")
        
    except Exception as exc:
        logger.error(f"Failed to process document {document_id}: {exc}")
        
        # Update status to failed
        doc_repo.update_status(
            UUID(document_id),
            DocumentStatus.FAILED,
            error_message=str(exc)
        )
        
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=60 * (2 ** self.request.retries))
