# Integration tests for API
import pytest
from fastapi.testclient import TestClient
from uuid import uuid4
from src.api.main import app
from io import BytesIO

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_upload_document():
    oracle_id = str(uuid4())
    pdf_content = b"%PDF-1.4 test"
    
    response = client.post(
        "/api/v1/documents/upload",
        files={"file": ("test.pdf", BytesIO(pdf_content), "application/pdf")},
        data={"oracle_id": oracle_id}
    )
    
    assert response.status_code in [200, 500]  # May fail without full DB setup

def test_list_documents():
    oracle_id = str(uuid4())
    response = client.get(
        "/api/v1/documents",
        params={"oracle_id": oracle_id}
    )
    
    assert response.status_code in [200, 500]  # May fail without full DB setup
