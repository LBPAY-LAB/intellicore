"""
Celery tasks for document processing

Tasks:
- parse_document_task: Parse PDF into DocumentStructure
- extract_entities_task: Extract entities from document
- save_to_knowledge_base_task: Store in vector database
"""

import asyncio
import json
import logging
from pathlib import Path
from uuid import UUID

from celery import Task

from ..celery_app import celery_app
from ..database import (
    DocumentRepository,
    EntityRepository,
    FieldCandidateRepository,
    FSMStateRepository,
    FSMTransitionRepository,
    ObjectDefinitionCandidateRepository,
    init_db,
)
from ..document_intelligence import BACENDocumentParser, DocumentType
from ..entity_extraction import EntityExtractor

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
        self.update_state(state="PROGRESS", meta={"progress": 50, "step": "Saving to database"})

        # Save to database (Sprint 8)
        async def save_document():
            """Save document to database"""
            await init_db()
            doc_repo = DocumentRepository()
            db_id = await doc_repo.create(
                document_id=document_id,
                filename=file_path_obj.name,
                file_path=file_path,
                file_size_bytes=file_path_obj.stat().st_size,
                document_type=document_type,
                doc_structure=doc_structure,
            )
            return db_id

        # Run async save
        db_doc_id = asyncio.run(save_document())

        logger.info(
            f"Document parsed successfully: {len(doc_structure.sections)} sections, "
            f"{len(doc_structure.tables)} tables, confidence={doc_structure.confidence_score:.2f}"
        )

        # Update progress
        self.update_state(state="PROGRESS", meta={"progress": 70, "step": "Triggering entity extraction"})

        # Trigger entity extraction (Sprint 8)
        extract_entities_task.delay(str(db_doc_id))

        # Update progress
        self.update_state(state="PROGRESS", meta={"progress": 90, "step": "Finalizing"})

        # TODO: Generate embeddings and save to pgvector (Sprint 11)
        # from ..knowledge_base import embed_document
        # embed_document(document_id, doc_structure)

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
def extract_entities_task(self, document_uuid: str):
    """
    Extract entities from parsed document using NLP

    Args:
        document_uuid: Document UUID (string)

    Returns:
        dict: Extraction result

    Process (Sprint 8):
        1. Load document from database
        2. Extract entities with spaCy (pt_core_news_lg)
        3. Identify field candidates (nome, cpf, valor, data, etc.)
        4. Store entities and field candidates in database
        5. Trigger schema generation (Sprint 9-10)
    """
    logger.info(f"Starting entity extraction for document {document_uuid}")

    self.update_state(state="STARTED", meta={"progress": 0, "step": "Loading document"})

    try:
        doc_uuid = UUID(document_uuid)

        async def run_extraction():
            """Run entity extraction asynchronously"""
            await init_db()

            # 1. Load document from database
            doc_repo = DocumentRepository()
            document = await doc_repo.get_by_id(doc_uuid)

            if not document:
                raise ValueError(f"Document {doc_uuid} not found")

            # Update status
            await doc_repo.update_processing_status(
                doc_uuid, "extracting", task_id=self.request.id
            )

            # 2. Parse document structure from database
            from ..document_intelligence.types import (
                DocumentMetadata,
                DocumentSection,
                DocumentStructure,
                DocumentTable,
                DocumentType,
            )

            metadata = DocumentMetadata(
                title=document.get("title", ""),
                document_type=DocumentType(document["document_type"]),
                numero_normativo=document.get("numero_normativo"),
                data_publicacao=document.get("data_publicacao"),
                data_vigencia=document.get("data_vigencia"),
                orgao_emissor=document.get("orgao_emissor", "Banco Central do Brasil"),
                assunto=document.get("assunto", ""),
                total_pages=document.get("total_pages", 0),
            )

            sections = [
                DocumentSection(
                    level=s["level"],
                    title=s["title"],
                    content=s["content"],
                    subsections=s.get("subsections", []),
                )
                for s in document.get("sections", [])
            ]

            tables = [
                DocumentTable(
                    caption=t.get("caption", ""),
                    rows=t["rows"],
                    columns=t["columns"],
                )
                for t in document.get("tables", [])
            ]

            doc_structure = DocumentStructure(
                metadata=metadata,
                sections=sections,
                tables=tables,
                full_text=document.get("full_text", ""),
                confidence_score=document.get("confidence_score", 0.0),
            )

            # 3. Extract entities with spaCy
            extractor = EntityExtractor()
            extraction_result = extractor.extract_from_document(doc_structure)

            logger.info(
                f"Extracted {len(extraction_result.entities)} entities, "
                f"{len(extraction_result.field_candidates)} field candidates"
            )

            # 4. Store entities in database
            entity_repo = EntityRepository()
            await entity_repo.bulk_create(doc_uuid, extraction_result.entities)

            # 5. Store field candidates
            field_repo = FieldCandidateRepository()
            await field_repo.bulk_create(doc_uuid, extraction_result.field_candidates)

            # 6. Store FSM states and transitions (if any detected)
            if extraction_result.metadata.get("fsm_states"):
                fsm_state_repo = FSMStateRepository()
                await fsm_state_repo.bulk_create(
                    doc_uuid, extraction_result.metadata["fsm_states"]
                )

            if extraction_result.metadata.get("fsm_transitions"):
                fsm_transition_repo = FSMTransitionRepository()
                await fsm_transition_repo.bulk_create(
                    doc_uuid, extraction_result.metadata["fsm_transitions"]
                )

            # 7. Update document status
            await doc_repo.update_processing_status(doc_uuid, "extracted")
            await doc_repo.mark_parsed(doc_uuid)

            return {
                "document_id": document_uuid,
                "entities_count": len(extraction_result.entities),
                "field_candidates_count": len(extraction_result.field_candidates),
                "confidence_score": extraction_result.confidence_score,
                "status": "completed",
            }

        # Run async extraction
        self.update_state(state="PROGRESS", meta={"progress": 20, "step": "Extracting entities"})
        result = asyncio.run(run_extraction())

        self.update_state(state="PROGRESS", meta={"progress": 100, "step": "Completed"})

        logger.info(f"Entity extraction completed for document {document_uuid}")

        # TODO: Trigger schema generation (Sprint 9-10)
        # from ..tasks.schema_tasks import generate_schema_task
        # generate_schema_task.delay(document_uuid)

        return result

    except ValueError as e:
        logger.error(f"Document not found: {e}")
        raise

    except Exception as e:
        logger.error(f"Error extracting entities from document {document_uuid}: {e}", exc_info=True)
        # Update document status to failed
        async def mark_failed():
            await init_db()
            doc_repo = DocumentRepository()
            await doc_repo.update_processing_status(
                UUID(document_uuid), "failed", error=str(e)
            )

        asyncio.run(mark_failed())
        raise


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
