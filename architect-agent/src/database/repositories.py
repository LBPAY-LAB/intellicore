"""
Database repositories for Architect Agent

Provides data access layer with CRUD operations for all tables.
Uses Repository Pattern to abstract database operations.
"""

import json
import logging
from datetime import datetime
from typing import Any, Optional
from uuid import UUID, uuid4

import asyncpg

from ..document_intelligence.types import DocumentStructure
from ..entity_extraction.field_candidates import (
    FieldCandidate,
    FSMStateCandidate,
    FSMTransitionCandidate,
    ObjectDefinitionCandidate,
)
from ..entity_extraction.types import ExtractedEntity
from .connection import get_db_connection

logger = logging.getLogger(__name__)


class DocumentRepository:
    """Repository for documents table"""

    async def create(
        self,
        document_id: str,
        filename: str,
        file_path: str,
        file_size_bytes: int,
        document_type: str,
        doc_structure: Optional[DocumentStructure] = None,
    ) -> UUID:
        """
        Create new document record

        Args:
            document_id: External document identifier
            filename: Original filename
            file_path: Path to PDF file
            file_size_bytes: File size
            document_type: Type (circular_bacen, resolucao, etc.)
            doc_structure: Optional parsed document structure

        Returns:
            UUID of created document
        """
        async with get_db_connection() as conn:
            # Prepare data from doc_structure if available
            if doc_structure:
                metadata = {
                    "orgao_emissor": doc_structure.metadata.orgao_emissor,
                    "assunto": doc_structure.metadata.assunto,
                }
                sections = [
                    {
                        "level": s.level,
                        "title": s.title,
                        "content": s.content,
                        "subsections": s.subsections,
                    }
                    for s in doc_structure.sections
                ]
                tables = [
                    {"caption": t.caption, "rows": t.rows, "columns": t.columns}
                    for t in doc_structure.tables
                ]
                full_text = doc_structure.full_text
                title = doc_structure.metadata.title
                numero_normativo = doc_structure.metadata.numero_normativo
                data_publicacao = doc_structure.metadata.data_publicacao
                data_vigencia = doc_structure.metadata.data_vigencia
                total_pages = doc_structure.metadata.total_pages
                confidence_score = doc_structure.confidence_score
            else:
                metadata = {}
                sections = []
                tables = []
                full_text = None
                title = None
                numero_normativo = None
                data_publicacao = None
                data_vigencia = None
                total_pages = 0
                confidence_score = 0.0

            query = """
                INSERT INTO documents (
                    document_id, filename, file_path, file_size_bytes,
                    document_type, title, numero_normativo,
                    data_publicacao, data_vigencia, total_pages,
                    metadata, sections, tables, full_text,
                    confidence_score, processing_status
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15, $16
                )
                RETURNING id
            """

            result = await conn.fetchval(
                query,
                document_id,
                filename,
                file_path,
                file_size_bytes,
                document_type,
                title,
                numero_normativo,
                data_publicacao,
                data_vigencia,
                total_pages,
                json.dumps(metadata),
                json.dumps(sections),
                json.dumps(tables),
                full_text,
                confidence_score,
                "parsed" if doc_structure else "uploaded",
            )

            logger.info(f"Created document: {result}")
            return result

    async def get_by_id(self, document_id: UUID) -> Optional[dict]:
        """Get document by UUID"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM documents
                WHERE id = $1 AND is_deleted = false
            """
            row = await conn.fetchrow(query, document_id)
            return dict(row) if row else None

    async def get_by_document_id(self, document_id: str) -> Optional[dict]:
        """Get document by external document_id"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM documents
                WHERE document_id = $1 AND is_deleted = false
            """
            row = await conn.fetchrow(query, document_id)
            return dict(row) if row else None

    async def update_processing_status(
        self,
        document_id: UUID,
        status: str,
        error: Optional[str] = None,
        task_id: Optional[str] = None,
    ) -> None:
        """Update document processing status"""
        async with get_db_connection() as conn:
            query = """
                UPDATE documents
                SET processing_status = $1,
                    processing_error = $2,
                    task_id = $3
                WHERE id = $4
            """
            await conn.execute(query, status, error, task_id, document_id)
            logger.info(f"Updated document {document_id} status to {status}")

    async def mark_parsed(self, document_id: UUID) -> None:
        """Mark document as successfully parsed"""
        async with get_db_connection() as conn:
            query = """
                UPDATE documents
                SET processing_status = 'parsed',
                    parsed_at = NOW()
                WHERE id = $1
            """
            await conn.execute(query, document_id)

    async def soft_delete(self, document_id: UUID) -> None:
        """Soft delete document"""
        async with get_db_connection() as conn:
            query = """
                UPDATE documents
                SET is_deleted = true,
                    deleted_at = NOW()
                WHERE id = $1
            """
            await conn.execute(query, document_id)
            logger.info(f"Soft deleted document: {document_id}")

    async def list_by_type(
        self, document_type: str, limit: int = 100, offset: int = 0
    ) -> list[dict]:
        """List documents by type with pagination"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM documents
                WHERE document_type = $1 AND is_deleted = false
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            """
            rows = await conn.fetch(query, document_type, limit, offset)
            return [dict(row) for row in rows]

    async def list_by_status(
        self, status: str, limit: int = 100, offset: int = 0
    ) -> list[dict]:
        """List documents by processing status"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM documents
                WHERE processing_status = $1 AND is_deleted = false
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
            """
            rows = await conn.fetch(query, status, limit, offset)
            return [dict(row) for row in rows]


class EntityRepository:
    """Repository for extracted_entities table"""

    async def create(self, document_id: UUID, entity: ExtractedEntity) -> UUID:
        """
        Create extracted entity record

        Args:
            document_id: Document UUID
            entity: ExtractedEntity instance

        Returns:
            UUID of created entity
        """
        async with get_db_connection() as conn:
            query = """
                INSERT INTO extracted_entities (
                    document_id, entity_type, text, normalized_value,
                    start_char, end_char, context, confidence, metadata
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9
                )
                RETURNING id
            """

            result = await conn.fetchval(
                query,
                document_id,
                entity.type.value,
                entity.text,
                str(entity.normalized_value) if entity.normalized_value else None,
                entity.start_char,
                entity.end_char,
                entity.context,
                entity.confidence,
                json.dumps(entity.metadata),
            )

            return result

    async def bulk_create(
        self, document_id: UUID, entities: list[ExtractedEntity]
    ) -> int:
        """
        Bulk insert entities for a document

        Returns:
            Number of entities created
        """
        async with get_db_connection() as conn:
            # Prepare data for COPY
            records = [
                (
                    uuid4(),
                    document_id,
                    entity.type.value,
                    entity.text,
                    str(entity.normalized_value) if entity.normalized_value else None,
                    entity.start_char,
                    entity.end_char,
                    entity.context,
                    entity.confidence,
                    json.dumps(entity.metadata),
                )
                for entity in entities
            ]

            # Use COPY for bulk insert (much faster than individual INSERTs)
            result = await conn.copy_records_to_table(
                "extracted_entities",
                records=records,
                columns=[
                    "id",
                    "document_id",
                    "entity_type",
                    "text",
                    "normalized_value",
                    "start_char",
                    "end_char",
                    "context",
                    "confidence",
                    "metadata",
                ],
            )

            logger.info(f"Bulk created {len(entities)} entities for document {document_id}")
            return len(entities)

    async def get_by_document(self, document_id: UUID) -> list[dict]:
        """Get all entities for a document"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM extracted_entities
                WHERE document_id = $1
                ORDER BY start_char
            """
            rows = await conn.fetch(query, document_id)
            return [dict(row) for row in rows]

    async def get_by_type(
        self, document_id: UUID, entity_type: str
    ) -> list[dict]:
        """Get entities of specific type for a document"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM extracted_entities
                WHERE document_id = $1 AND entity_type = $2
                ORDER BY start_char
            """
            rows = await conn.fetch(query, document_id, entity_type)
            return [dict(row) for row in rows]

    async def count_by_document(self, document_id: UUID) -> int:
        """Count entities for a document"""
        async with get_db_connection() as conn:
            query = """
                SELECT COUNT(*) FROM extracted_entities
                WHERE document_id = $1
            """
            return await conn.fetchval(query, document_id)


class FieldCandidateRepository:
    """Repository for field_candidates table"""

    async def create(
        self, document_id: UUID, field_candidate: FieldCandidate
    ) -> UUID:
        """Create field candidate record"""
        async with get_db_connection() as conn:
            query = """
                INSERT INTO field_candidates (
                    document_id, name, display_name, field_type,
                    description, required, validation_rules,
                    example_values, enum_values, default_value,
                    ui_widget, confidence, metadata
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
                )
                RETURNING id
            """

            result = await conn.fetchval(
                query,
                document_id,
                field_candidate.name,
                field_candidate.display_name,
                field_candidate.field_type.value,
                field_candidate.description,
                field_candidate.required,
                json.dumps(field_candidate.validation_rules),
                json.dumps(field_candidate.example_values),
                json.dumps(field_candidate.enum_values) if field_candidate.enum_values else None,
                json.dumps(field_candidate.default_value) if field_candidate.default_value else None,
                field_candidate.ui_widget,
                field_candidate.confidence,
                json.dumps(field_candidate.metadata),
            )

            return result

    async def bulk_create(
        self, document_id: UUID, field_candidates: list[FieldCandidate]
    ) -> int:
        """Bulk insert field candidates"""
        async with get_db_connection() as conn:
            records = [
                (
                    uuid4(),
                    document_id,
                    fc.name,
                    fc.display_name,
                    fc.field_type.value,
                    fc.description,
                    fc.required,
                    json.dumps(fc.validation_rules),
                    json.dumps(fc.example_values),
                    json.dumps(fc.enum_values) if fc.enum_values else None,
                    json.dumps(fc.default_value) if fc.default_value else None,
                    fc.ui_widget,
                    fc.confidence,
                    json.dumps(fc.metadata),
                )
                for fc in field_candidates
            ]

            await conn.copy_records_to_table(
                "field_candidates",
                records=records,
                columns=[
                    "id",
                    "document_id",
                    "name",
                    "display_name",
                    "field_type",
                    "description",
                    "required",
                    "validation_rules",
                    "example_values",
                    "enum_values",
                    "default_value",
                    "ui_widget",
                    "confidence",
                    "metadata",
                ],
            )

            logger.info(f"Bulk created {len(field_candidates)} field candidates")
            return len(field_candidates)

    async def get_by_document(self, document_id: UUID) -> list[dict]:
        """Get all field candidates for a document"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM field_candidates
                WHERE document_id = $1
                ORDER BY name
            """
            rows = await conn.fetch(query, document_id)
            return [dict(row) for row in rows]


class FSMStateRepository:
    """Repository for fsm_states table"""

    async def create(
        self, document_id: UUID, state: FSMStateCandidate
    ) -> UUID:
        """Create FSM state record"""
        async with get_db_connection() as conn:
            query = """
                INSERT INTO fsm_states (
                    document_id, name, display_name, description,
                    is_initial, is_final, confidence
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7
                )
                RETURNING id
            """

            result = await conn.fetchval(
                query,
                document_id,
                state.name,
                state.display_name,
                state.description,
                state.is_initial,
                state.is_final,
                state.confidence,
            )

            return result

    async def bulk_create(
        self, document_id: UUID, states: list[FSMStateCandidate]
    ) -> int:
        """Bulk insert FSM states"""
        async with get_db_connection() as conn:
            records = [
                (
                    uuid4(),
                    document_id,
                    state.name,
                    state.display_name,
                    state.description,
                    state.is_initial,
                    state.is_final,
                    state.confidence,
                )
                for state in states
            ]

            await conn.copy_records_to_table(
                "fsm_states",
                records=records,
                columns=[
                    "id",
                    "document_id",
                    "name",
                    "display_name",
                    "description",
                    "is_initial",
                    "is_final",
                    "confidence",
                ],
            )

            logger.info(f"Bulk created {len(states)} FSM states")
            return len(states)

    async def get_by_document(self, document_id: UUID) -> list[dict]:
        """Get all FSM states for a document"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM fsm_states
                WHERE document_id = $1
                ORDER BY name
            """
            rows = await conn.fetch(query, document_id)
            return [dict(row) for row in rows]


class FSMTransitionRepository:
    """Repository for fsm_transitions table"""

    async def create(
        self, document_id: UUID, transition: FSMTransitionCandidate
    ) -> UUID:
        """Create FSM transition record"""
        async with get_db_connection() as conn:
            query = """
                INSERT INTO fsm_transitions (
                    document_id, from_state, to_state, trigger,
                    description, conditions, confidence
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7
                )
                RETURNING id
            """

            result = await conn.fetchval(
                query,
                document_id,
                transition.from_state,
                transition.to_state,
                transition.trigger,
                transition.description,
                json.dumps(transition.conditions),
                transition.confidence,
            )

            return result

    async def bulk_create(
        self, document_id: UUID, transitions: list[FSMTransitionCandidate]
    ) -> int:
        """Bulk insert FSM transitions"""
        async with get_db_connection() as conn:
            records = [
                (
                    uuid4(),
                    document_id,
                    t.from_state,
                    t.to_state,
                    t.trigger,
                    t.description,
                    json.dumps(t.conditions),
                    t.confidence,
                )
                for t in transitions
            ]

            await conn.copy_records_to_table(
                "fsm_transitions",
                records=records,
                columns=[
                    "id",
                    "document_id",
                    "from_state",
                    "to_state",
                    "trigger",
                    "description",
                    "conditions",
                    "confidence",
                ],
            )

            logger.info(f"Bulk created {len(transitions)} FSM transitions")
            return len(transitions)

    async def get_by_document(self, document_id: UUID) -> list[dict]:
        """Get all FSM transitions for a document"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM fsm_transitions
                WHERE document_id = $1
                ORDER BY from_state, to_state
            """
            rows = await conn.fetch(query, document_id)
            return [dict(row) for row in rows]


class ObjectDefinitionCandidateRepository:
    """Repository for object_definition_candidates table"""

    async def create(
        self, document_id: UUID, obj_def_candidate: ObjectDefinitionCandidate
    ) -> UUID:
        """Create object definition candidate"""
        async with get_db_connection() as conn:
            query = """
                INSERT INTO object_definition_candidates (
                    document_id, name, display_name, description,
                    json_schema, fsm_definition, ui_hints,
                    relationships, confidence_score, metadata
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
                )
                RETURNING id
            """

            result = await conn.fetchval(
                query,
                document_id,
                obj_def_candidate.name,
                obj_def_candidate.display_name,
                obj_def_candidate.description,
                json.dumps(obj_def_candidate.to_json_schema()),
                json.dumps(obj_def_candidate.to_fsm_definition()),
                json.dumps(obj_def_candidate.to_ui_hints()),
                json.dumps(obj_def_candidate.relationships),
                obj_def_candidate.confidence_score,
                json.dumps(obj_def_candidate.metadata),
            )

            logger.info(f"Created object definition candidate: {result}")
            return result

    async def get_by_id(self, candidate_id: UUID) -> Optional[dict]:
        """Get object definition candidate by UUID"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM object_definition_candidates
                WHERE id = $1
            """
            row = await conn.fetchrow(query, candidate_id)
            return dict(row) if row else None

    async def get_by_document(self, document_id: UUID) -> list[dict]:
        """Get all object definition candidates for a document"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM object_definition_candidates
                WHERE document_id = $1
                ORDER BY created_at DESC
            """
            rows = await conn.fetch(query, document_id)
            return [dict(row) for row in rows]

    async def update_review_status(
        self,
        candidate_id: UUID,
        status: str,
        reviewed_by: str,
        notes: Optional[str] = None,
    ) -> None:
        """Update review status of candidate"""
        async with get_db_connection() as conn:
            query = """
                UPDATE object_definition_candidates
                SET review_status = $1,
                    reviewed_by = $2,
                    reviewed_at = NOW(),
                    review_notes = $3
                WHERE id = $4
            """
            await conn.execute(query, status, reviewed_by, notes, candidate_id)
            logger.info(f"Updated candidate {candidate_id} review status to {status}")

    async def mark_created_in_supercore(
        self, candidate_id: UUID, supercore_object_id: UUID
    ) -> None:
        """Mark candidate as created in SuperCore backend"""
        async with get_db_connection() as conn:
            query = """
                UPDATE object_definition_candidates
                SET supercore_object_id = $1,
                    created_in_supercore = true,
                    created_in_supercore_at = NOW()
                WHERE id = $2
            """
            await conn.execute(query, supercore_object_id, candidate_id)
            logger.info(f"Marked candidate {candidate_id} as created in SuperCore")

    async def list_pending_review(
        self, limit: int = 50, offset: int = 0
    ) -> list[dict]:
        """List candidates pending review"""
        async with get_db_connection() as conn:
            query = """
                SELECT * FROM object_definition_candidates
                WHERE review_status = 'pending'
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            """
            rows = await conn.fetch(query, limit, offset)
            return [dict(row) for row in rows]


class EmbeddingRepository:
    """Repository for document_embeddings table"""

    async def create(
        self,
        document_id: UUID,
        chunk_index: int,
        chunk_text: str,
        embedding: list[float],
        chunk_metadata: Optional[dict] = None,
    ) -> UUID:
        """Create document embedding record"""
        async with get_db_connection() as conn:
            query = """
                INSERT INTO document_embeddings (
                    document_id, chunk_index, chunk_text,
                    embedding, chunk_metadata
                ) VALUES (
                    $1, $2, $3, $4, $5
                )
                RETURNING id
            """

            # Convert list to pgvector format
            embedding_str = f"[{','.join(map(str, embedding))}]"

            result = await conn.fetchval(
                query,
                document_id,
                chunk_index,
                chunk_text,
                embedding_str,
                json.dumps(chunk_metadata or {}),
            )

            return result

    async def bulk_create(
        self,
        document_id: UUID,
        chunks: list[tuple[int, str, list[float], Optional[dict]]],
    ) -> int:
        """
        Bulk insert embeddings

        Args:
            document_id: Document UUID
            chunks: List of (chunk_index, chunk_text, embedding, metadata) tuples

        Returns:
            Number of embeddings created
        """
        async with get_db_connection() as conn:
            records = [
                (
                    uuid4(),
                    document_id,
                    chunk_index,
                    chunk_text,
                    f"[{','.join(map(str, embedding))}]",
                    json.dumps(metadata or {}),
                )
                for chunk_index, chunk_text, embedding, metadata in chunks
            ]

            await conn.copy_records_to_table(
                "document_embeddings",
                records=records,
                columns=[
                    "id",
                    "document_id",
                    "chunk_index",
                    "chunk_text",
                    "embedding",
                    "chunk_metadata",
                ],
            )

            logger.info(f"Bulk created {len(chunks)} embeddings for document {document_id}")
            return len(chunks)

    async def similarity_search(
        self,
        query_embedding: list[float],
        limit: int = 10,
        document_id: Optional[UUID] = None,
    ) -> list[dict]:
        """
        Perform similarity search using cosine distance

        Args:
            query_embedding: Query vector
            limit: Number of results
            document_id: Optional filter by document

        Returns:
            List of results with similarity scores
        """
        async with get_db_connection() as conn:
            embedding_str = f"[{','.join(map(str, query_embedding))}]"

            if document_id:
                query = """
                    SELECT
                        id,
                        document_id,
                        chunk_index,
                        chunk_text,
                        chunk_metadata,
                        1 - (embedding <=> $1::vector) as similarity
                    FROM document_embeddings
                    WHERE document_id = $2
                    ORDER BY embedding <=> $1::vector
                    LIMIT $3
                """
                rows = await conn.fetch(query, embedding_str, document_id, limit)
            else:
                query = """
                    SELECT
                        id,
                        document_id,
                        chunk_index,
                        chunk_text,
                        chunk_metadata,
                        1 - (embedding <=> $1::vector) as similarity
                    FROM document_embeddings
                    ORDER BY embedding <=> $1::vector
                    LIMIT $2
                """
                rows = await conn.fetch(query, embedding_str, limit)

            return [dict(row) for row in rows]

    async def delete_by_document(self, document_id: UUID) -> int:
        """Delete all embeddings for a document"""
        async with get_db_connection() as conn:
            query = """
                DELETE FROM document_embeddings
                WHERE document_id = $1
            """
            result = await conn.execute(query, document_id)
            # Extract number from result string "DELETE N"
            count = int(result.split()[-1]) if result else 0
            logger.info(f"Deleted {count} embeddings for document {document_id}")
            return count
