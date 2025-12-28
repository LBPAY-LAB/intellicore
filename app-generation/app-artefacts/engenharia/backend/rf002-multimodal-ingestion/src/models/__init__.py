# Pydantic models for RF002
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field, field_validator

class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class ContentType(str, Enum):
    TEXT = "text"
    METADATA = "metadata"
    OCR_TEXT = "ocr_text"
    TRANSCRIPT = "transcript"
    HTML = "html"
    STRUCTURED = "structured"

class SessionStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    EXPIRED = "expired"

class DocumentCreate(BaseModel):
    oracle_id: UUID
    session_id: Optional[UUID] = None
    filename: str
    mime_type: str
    file_size: int
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class DocumentResponse(BaseModel):
    id: UUID
    oracle_id: UUID
    session_id: Optional[UUID]
    filename: str
    original_filename: str
    mime_type: str
    file_size: int
    status: DocumentStatus
    progress_percent: int
    error_message: Optional[str]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ProcessedContentResponse(BaseModel):
    id: UUID
    document_id: UUID
    content_type: ContentType
    content_text: Optional[str]
    content_data: Optional[Dict[str, Any]]
    confidence_score: Optional[float]
    language: Optional[str]
    page_number: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class SessionCreate(BaseModel):
    oracle_id: UUID
    session_name: Optional[str] = None
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class SessionResponse(BaseModel):
    id: UUID
    oracle_id: UUID
    session_name: Optional[str]
    total_files: int
    completed_files: int
    failed_files: int
    status: SessionStatus
    progress_percent: Optional[int]
    created_at: datetime
    expires_at: datetime
    
    class Config:
        from_attributes = True

class UploadURLRequest(BaseModel):
    url: str = Field(..., description="URL to scrape")
    oracle_id: UUID
    session_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    
    @field_validator("url")
    @classmethod
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v
