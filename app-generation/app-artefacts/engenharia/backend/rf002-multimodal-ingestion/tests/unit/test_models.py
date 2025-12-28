# Unit tests for Pydantic models
import pytest
from uuid import uuid4
from pydantic import ValidationError
from src.models import (
    DocumentCreate, DocumentStatus, UploadURLRequest,
    SessionCreate, ContentType
)

class TestDocumentCreate:
    def test_valid_document(self):
        doc = DocumentCreate(
            oracle_id=uuid4(),
            filename="test.pdf",
            mime_type="application/pdf",
            file_size=1024
        )
        assert doc.filename == "test.pdf"
        assert doc.metadata == {}
    
    def test_with_metadata(self):
        doc = DocumentCreate(
            oracle_id=uuid4(),
            filename="test.pdf",
            mime_type="application/pdf",
            file_size=1024,
            metadata={"key": "value"}
        )
        assert doc.metadata["key"] == "value"

class TestUploadURLRequest:
    def test_valid_url(self):
        req = UploadURLRequest(
            url="https://example.com",
            oracle_id=uuid4()
        )
        assert req.url == "https://example.com"
    
    def test_invalid_url(self):
        with pytest.raises(ValidationError):
            UploadURLRequest(
                url="not-a-url",
                oracle_id=uuid4()
            )

class TestEnums:
    def test_document_status(self):
        assert DocumentStatus.PENDING.value == "pending"
        assert DocumentStatus.COMPLETED.value == "completed"
    
    def test_content_type(self):
        assert ContentType.TEXT.value == "text"
        assert ContentType.OCR_TEXT.value == "ocr_text"
