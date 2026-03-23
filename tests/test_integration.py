from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_extract_endpoint_success():
    """Test successful interaction between API and extract_deadline."""
    response = client.post("/extract", json={"text": "Assignment due tomorrow"})
    assert response.status_code == 200
    assert response.json() == {"deadline": "2026-04-10T23:59:59"}

def test_extract_endpoint_error():
    """Test API error handling when interacting with extract_deadline."""
    response = client.post("/extract", json={"text": ""})
    assert response.status_code == 400
    assert "detail" in response.json()
