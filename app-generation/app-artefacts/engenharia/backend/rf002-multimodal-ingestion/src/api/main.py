# FastAPI main application
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from uuid import UUID, uuid4
from pathlib import Path
import magic
import hashlib
from src.config import settings
from src.models import (
    DocumentResponse, UploadURLRequest, SessionResponse, 
    DocumentStatus, SessionCreate
)
from src.db import DocumentRepository, ContentRepository
from src.tasks import process_document
import logging

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RF002 - Multimodal Knowledge Ingestion",
    description="Production-ready multimodal document ingestion API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

doc_repo = DocumentRepository()
content_repo = ContentRepository()

@app.post(f"{settings.api_v1_prefix}/documents/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    oracle_id: str = Form(...),
    session_id: Optional[str] = Form(None),
    metadata: Optional[str] = Form("{}")
):
    """Upload a document for processing.
    
    Args:
        file: File to upload
        oracle_id: Oracle ID (tenant)
        session_id: Optional session ID for batch uploads
        metadata: Optional JSON metadata
    
    Returns:
        Document metadata with processing status
    """
    try:
        # Validate file size
        file_content = await file.read()
        if len(file_content) > settings.max_file_size:
            raise HTTPException(400, f"File too large. Max: {settings.max_file_size} bytes")
        
        # Detect MIME type
        mime_type = magic.from_buffer(file_content, mime=True)
        
        # Generate file hash
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # Save file
        file_id = uuid4()
        file_path = settings.upload_dir / str(oracle_id) / f"{file_id}_{file.filename}"
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Create document record
        doc_id = await doc_repo.create(
            oracle_id=UUID(oracle_id),
            filename=file.filename,
            mime_type=mime_type,
            file_size=len(file_content),
            file_path=str(file_path),
            session_id=UUID(session_id) if session_id else None
        )
        
        # Queue processing task
        process_document.delay(str(doc_id))
        
        # Return document
        doc = await doc_repo.get_by_id(doc_id)
        return doc
        
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(500, str(e))

@app.post(f"{settings.api_v1_prefix}/documents/upload-url", response_model=DocumentResponse)
async def upload_from_url(request: UploadURLRequest):
    """Ingest content from a URL.
    
    Args:
        request: URL and metadata
    
    Returns:
        Document metadata
    """
    try:
        # Create document record
        doc_id = await doc_repo.create(
            oracle_id=request.oracle_id,
            filename=request.url,
            mime_type="text/html",
            file_size=0,
            file_path=request.url,
            session_id=request.session_id
        )
        
        # Queue processing with URL
        process_document.delay(str(doc_id))
        
        doc = await doc_repo.get_by_id(doc_id)
        return doc
        
    except Exception as e:
        logger.error(f"URL upload failed: {e}")
        raise HTTPException(500, str(e))

@app.get(f"{settings.api_v1_prefix}/documents/{{document_id}}", response_model=DocumentResponse)
async def get_document(document_id: UUID):
    """Get document status and metadata."""
    doc = await doc_repo.get_by_id(document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc

@app.get(f"{settings.api_v1_prefix}/documents/{{document_id}}/content")
async def get_document_content(document_id: UUID):
    """Get processed content for a document."""
    doc = await doc_repo.get_by_id(document_id)
    if not doc:
        raise HTTPException(404, "Document not found")
    
    if doc.status != DocumentStatus.COMPLETED:
        raise HTTPException(400, f"Document not ready. Status: {doc.status}")
    
    content = await content_repo.get_by_document(document_id)
    return {"document_id": str(document_id), "content": content}

@app.get(f"{settings.api_v1_prefix}/documents", response_model=List[DocumentResponse])
async def list_documents(
    oracle_id: UUID = Query(...),
    status: Optional[DocumentStatus] = None,
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0)
):
    """List documents for an Oracle."""
    docs = await doc_repo.list_by_oracle(oracle_id, status, limit, offset)
    return docs

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "rf002-multimodal-ingestion"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
