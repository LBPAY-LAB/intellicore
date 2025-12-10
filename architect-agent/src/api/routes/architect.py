"""
Architect Agent endpoints - Document upload and processing
"""

import logging
import shutil
from pathlib import Path
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status
from pydantic import BaseModel, Field

from ...config import settings
from ...document_intelligence import DocumentType
from ...tasks.document_tasks import parse_document_task

logger = logging.getLogger(__name__)

router = APIRouter()


# Request/Response models
class DocumentUploadResponse(BaseModel):
    """Response for document upload"""

    task_id: str = Field(..., description="Celery task ID for tracking")
    document_id: str = Field(..., description="Unique document ID")
    filename: str = Field(..., description="Original filename")
    status: str = Field(default="processing", description="Initial status")
    message: str = Field(default="Document uploaded successfully and processing started")


class TaskStatusResponse(BaseModel):
    """Task status response"""

    task_id: str
    status: str  # PENDING, STARTED, SUCCESS, FAILURE, RETRY
    result: Optional[dict] = None
    error: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100, description="Progress percentage")


class DocumentListResponse(BaseModel):
    """List of processed documents"""

    documents: list[dict]
    total: int
    page: int
    page_size: int


class GenerateObjectDefRequest(BaseModel):
    """Request to generate object_definition from document"""

    document_id: str = Field(..., description="Document ID from upload")
    object_name: str = Field(..., description="Name for the object (e.g., 'cliente_pf')")
    description: Optional[str] = Field(None, description="Optional description override")
    review_mode: bool = Field(
        default=True, description="If true, requires manual review before creation"
    )


# Endpoints
@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
async def upload_document(
    file: UploadFile = File(..., description="BACEN PDF document"),
    document_type: DocumentType = Form(..., description="Type of BACEN document"),
    metadata: Optional[str] = Form(None, description="Additional metadata (JSON string)"),
):
    """
    Upload BACEN PDF document for processing

    Process:
    1. Validate file (PDF, size limits)
    2. Save to upload directory
    3. Create Celery task for parsing
    4. Return task ID for tracking

    Args:
        file: PDF file upload
        document_type: Type of document (circular, resolucao, manual, normativo)
        metadata: Optional JSON metadata

    Returns:
        DocumentUploadResponse with task_id for tracking
    """
    # Validate file
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed",
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    max_size_bytes = settings.max_file_size_mb * 1024 * 1024
    if file_size > max_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds {settings.max_file_size_mb}MB limit",
        )

    # Generate unique document ID
    document_id = str(uuid4())

    # Create upload directory if not exists
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = upload_dir / f"{document_id}_{file.filename}"
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file",
        )

    logger.info(f"Saved uploaded file: {file_path} ({file_size} bytes)")

    # Create Celery task for parsing
    try:
        task = parse_document_task.delay(
            document_id=document_id,
            file_path=str(file_path),
            document_type=document_type.value,
            metadata=metadata,
        )

        logger.info(f"Created parsing task {task.id} for document {document_id}")

        return DocumentUploadResponse(
            task_id=task.id,
            document_id=document_id,
            filename=file.filename,
            status="processing",
            message="Document uploaded successfully and processing started",
        )

    except Exception as e:
        logger.error(f"Failed to create parsing task: {e}")
        # Clean up uploaded file
        file_path.unlink(missing_ok=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start document processing",
        )


@router.get("/tasks/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    Get status of a Celery task

    Args:
        task_id: Celery task ID from upload

    Returns:
        TaskStatusResponse with current status and result
    """
    from celery.result import AsyncResult

    task = AsyncResult(task_id)

    response = TaskStatusResponse(
        task_id=task_id,
        status=task.status,
    )

    if task.ready():
        if task.successful():
            response.result = task.result
            response.progress = 100
        else:
            response.error = str(task.info)
    else:
        # Check for progress info
        if hasattr(task.info, "get"):
            response.progress = task.info.get("progress", 0)

    return response


@router.get("/documents", response_model=DocumentListResponse)
async def list_documents(
    page: int = 1,
    page_size: int = 20,
    document_type: Optional[DocumentType] = None,
):
    """
    List processed documents

    Args:
        page: Page number (1-indexed)
        page_size: Items per page
        document_type: Filter by document type

    Returns:
        Paginated list of documents
    """
    # TODO: Implement database query
    # For now, return mock data

    return DocumentListResponse(
        documents=[],
        total=0,
        page=page,
        page_size=page_size,
    )


@router.get("/documents/{document_id}")
async def get_document(document_id: str):
    """
    Get document details and parsed structure

    Args:
        document_id: Document ID from upload

    Returns:
        Complete document structure with metadata, sections, tables
    """
    # TODO: Query from database
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document retrieval not yet implemented",
    )


@router.post("/generate")
async def generate_object_definition(request: GenerateObjectDefRequest):
    """
    Generate object_definition from parsed document

    Process:
    1. Load parsed document from database
    2. Extract entities (NLP)
    3. Generate schema (Claude Opus)
    4. Create object_definition in SuperCore
    5. If review_mode=true, add to review queue

    Args:
        request: Generation request with document_id and object_name

    Returns:
        Generated object_definition or review queue entry
    """
    # TODO: Implement schema generation pipeline
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Schema generation not yet implemented - Sprint 9-10",
    )


@router.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """
    Delete document and all associated data

    Args:
        document_id: Document ID

    Returns:
        Confirmation message
    """
    # TODO: Delete from database and file system
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Document deletion not yet implemented",
    )
