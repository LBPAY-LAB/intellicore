# Database repository for documents and content
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy import create_engine, select, update, and_
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from src.config import settings
from src.models import DocumentStatus, DocumentResponse
import logging

logger = logging.getLogger(__name__)

class DocumentRepository:
    def __init__(self):
        self.engine = create_async_engine(settings.database_url, pool_size=settings.database_pool_size)
        self.Session = sessionmaker(self.engine, class_=AsyncSession, expire_on_commit=False)
    
    async def create(self, oracle_id: UUID, filename: str, mime_type: str, 
                    file_size: int, file_path: str, session_id: Optional[UUID] = None,
                    metadata: Dict[str, Any] = None) -> UUID:
        """Create a new document record."""
        async with self.Session() as session:
            query = """
                INSERT INTO documents (oracle_id, session_id, filename, original_filename, 
                                      mime_type, file_size, file_path, metadata)
                VALUES (, , , , , , , )
                RETURNING id
            """
            result = await session.execute(
                query, 
                (oracle_id, session_id, filename, filename, mime_type, file_size, file_path, metadata or {})
            )
            doc_id = result.scalar_one()
            await session.commit()
            return doc_id
    
    async def get_by_id(self, document_id: UUID) -> Optional[DocumentResponse]:
        """Get document by ID."""
        async with self.Session() as session:
            query = "SELECT * FROM documents WHERE id = "
            result = await session.execute(query, (document_id,))
            row = result.fetchone()
            return DocumentResponse(**dict(row)) if row else None
    
    async def update_status(self, document_id: UUID, status: DocumentStatus, 
                           progress: int = None, error_message: str = None):
        """Update document processing status."""
        async with self.Session() as session:
            updates = {"status": status.value}
            if progress is not None:
                updates["progress_percent"] = progress
            if error_message:
                updates["error_message"] = error_message
            if status == DocumentStatus.COMPLETED:
                updates["processing_completed_at"] = datetime.utcnow()
            
            query = """
                UPDATE documents 
                SET status = , progress_percent = , error_message = , updated_at = NOW()
                WHERE id = 
            """
            await session.execute(query, (status.value, progress, error_message, document_id))
            await session.commit()
    
    async def list_by_oracle(self, oracle_id: UUID, status: Optional[DocumentStatus] = None,
                            limit: int = 50, offset: int = 0) -> List[DocumentResponse]:
        """List documents for an Oracle."""
        async with self.Session() as session:
            query = "SELECT * FROM documents WHERE oracle_id = "
            params = [oracle_id]
            
            if status:
                query += " AND status = "
                params.append(status.value)
            
            query += " ORDER BY created_at DESC LIMIT  OFFSET "
            params.extend([limit, offset])
            
            result = await session.execute(query, params)
            rows = result.fetchall()
            return [DocumentResponse(**dict(row)) for row in rows]

class ContentRepository:
    def __init__(self):
        self.engine = create_async_engine(settings.database_url)
        self.Session = sessionmaker(self.engine, class_=AsyncSession)
    
    async def create(self, document_id: UUID, content_text: str, content_data: Dict = None,
                    confidence: float = 1.0, language: str = "en", metadata: Dict = None):
        """Create processed content record."""
        async with self.Session() as session:
            query = """
                INSERT INTO processed_content 
                (document_id, content_type, content_text, content_data, confidence_score, language, metadata)
                VALUES (, , , , , , )
                RETURNING id
            """
            result = await session.execute(
                query,
                (document_id, "text", content_text, content_data, confidence, language, metadata or {})
            )
            await session.commit()
            return result.scalar_one()
    
    async def get_by_document(self, document_id: UUID) -> List[Dict]:
        """Get all content for a document."""
        async with self.Session() as session:
            query = "SELECT * FROM processed_content WHERE document_id =  ORDER BY created_at"
            result = await session.execute(query, (document_id,))
            return [dict(row) for row in result.fetchall()]
