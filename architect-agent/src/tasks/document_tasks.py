"""
Celery tasks for document processing

Tasks:
- parse_document_task: Parse PDF into DocumentStructure
- extract_entities_task: Extract entities from document
- save_to_knowledge_base_task: Store in vector database
"""

import json
import logging
from pathlib import Path

from celery import Task

from ..celery_app import celery_app
from ..document_intelligence import BACENDocumentParser, DocumentType

logger = logging.getLogger(__name__)


class CallbackTask(Task):
    """Base task with callbacks"""

    def on_success(self, retval, task_id, args, kwargs):
        """Called on task success"""
        logger.info(f"Task {task_id} completed successfully")

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Called on task failure"""
        logger.error(f"Task {task_id} failed: {exc}")

    def on_retry(self, exc, task_id, args, kwargs, einfo):
        """Called on task retry"""
        logger.warning(f"Task {task_id} retrying: {exc}")


@celery_app.task(
    base=CallbackTask,
    bind=True,
    name="src.tasks.document_tasks.parse_document_task",
    max_retries=3,
)
def parse_document_task(self, document_id: str, file_path: str, document_type: str, metadata: str = None):
    """
    Parse BACEN PDF document into structured format

    Args:
        document_id: Unique document identifier
        file_path: Path to uploaded PDF file
        document_type: Type of document (circular, resolucao, etc.)
        metadata: Optional JSON metadata string

    Returns:
        dict: Parsed document structure as dict

    Process:
        1. Initialize parser
        2. Parse PDF (extract text, tables, sections)
        3. Save to database (PostgreSQL)
        4. Generate embeddings and store in pgvector
        5. Trigger entity extraction task (Sprint 7-8)
        6. Return document structure
    """
    logger.info(f"Starting document parsing for {document_id}")

    # Update progress
    self.update_state(state="STARTED", meta={"progress": 0, "step": "Initializing parser"})

    try:
        # Initialize parser
        parser = BACENDocumentParser(ocr_language="por", use_advanced_extraction=True)

        # Update progress
        self.update_state(state="PROGRESS", meta={"progress": 10, "step": "Parsing PDF"})

        # Parse document
        file_path_obj = Path(file_path)
        if not file_path_obj.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        doc_structure = parser.parse(file_path_obj)

        # Update progress
        self.update_state(state="PROGRESS", meta={"progress": 50, "step": "Extracting metadata"})

        # TODO: Save to database (Sprint 7)
        # from ..database.repositories import DocumentRepository
        # doc_repo = DocumentRepository()
        # doc_repo.save(document_id, doc_structure)

        logger.info(
            f"Document parsed successfully: {len(doc_structure.sections)} sections, "
            f"{len(doc_structure.tables)} tables, confidence={doc_structure.confidence_score:.2f}"
        )

        # Update progress
        self.update_state(state="PROGRESS", meta={"progress": 70, "step": "Generating embeddings"})

        # TODO: Generate embeddings and save to pgvector (Sprint 11)
        # from ..knowledge_base import embed_document
        # embed_document(document_id, doc_structure)

        # Update progress
        self.update_state(state="PROGRESS", meta={"progress": 90, "step": "Finalizing"})

        # TODO: Trigger entity extraction (Sprint 7-8)
        # extract_entities_task.delay(document_id)

        # Convert to dict for return
        result = {
            "document_id": document_id,
            "metadata": {
                "title": doc_structure.metadata.title,
                "document_type": doc_structure.metadata.document_type.value,
                "numero_normativo": doc_structure.metadata.numero_normativo,
                "data_publicacao": doc_structure.metadata.data_publicacao,
                "data_vigencia": doc_structure.metadata.data_vigencia,
                "total_pages": doc_structure.metadata.total_pages,
            },
            "statistics": {
                "sections_count": len(doc_structure.sections),
                "tables_count": len(doc_structure.tables),
                "confidence_score": doc_structure.confidence_score,
                "text_length": len(doc_structure.full_text),
            },
            "status": "completed",
        }

        logger.info(f"Document parsing completed for {document_id}")
        return result

    except FileNotFoundError as e:
        logger.error(f"File not found for document {document_id}: {e}")
        raise

    except Exception as e:
        logger.error(f"Error parsing document {document_id}: {e}", exc_info=True)
        raise


@celery_app.task(
    base=CallbackTask,
    bind=True,
    name="src.tasks.document_tasks.extract_entities_task",
    max_retries=3,
)
def extract_entities_task(self, document_id: str):
    """
    Extract entities from parsed document using NLP

    Args:
        document_id: Document identifier

    Returns:
        dict: Extracted entities

    Process (Sprint 7-8):
        1. Load document from database
        2. Extract entities with spaCy (pt_core_news_lg)
        3. Identify field candidates (nome, cpf, valor, data, etc.)
        4. Store entities in database
        5. Trigger schema generation (Sprint 9-10)
    """
    logger.info(f"Starting entity extraction for document {document_id}")

    self.update_state(state="STARTED", meta={"progress": 0, "step": "Loading document"})

    # TODO: Implement in Sprint 7-8
    # from ..entity_extraction import EntityExtractor
    # extractor = EntityExtractor()
    # entities = extractor.extract(document_id)

    logger.info("Entity extraction not yet implemented (Sprint 7-8)")
    return {"status": "pending", "message": "Entity extraction - Sprint 7-8"}


@celery_app.task(
    base=CallbackTask,
    bind=True,
    name="src.tasks.document_tasks.save_to_knowledge_base_task",
    max_retries=3,
)
def save_to_knowledge_base_task(self, document_id: str):
    """
    Generate embeddings and save document to pgvector knowledge base

    Args:
        document_id: Document identifier

    Returns:
        dict: Status

    Process (Sprint 11):
        1. Load document structure
        2. Chunk document into sections
        3. Generate embeddings (OpenAI text-embedding-3-large)
        4. Store in pgvector with metadata
    """
    logger.info(f"Starting knowledge base storage for document {document_id}")

    # TODO: Implement in Sprint 11
    # from ..knowledge_base import KnowledgeBaseManager
    # kb = KnowledgeBaseManager()
    # kb.store_document(document_id)

    logger.info("Knowledge base storage not yet implemented (Sprint 11)")
    return {"status": "pending", "message": "Knowledge base storage - Sprint 11"}
