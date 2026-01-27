from typing import Any

from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_get_root() -> None:
    """Test health check root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "service": "VioletVault Analytics API",
        "version": "1.0.0",
        "status": "healthy",
    }


def test_health_check_detailed() -> None:
    """Test detailed health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "endpoints" in data
    assert data["endpoints"]["audit"] == "/audit/envelope-integrity"


def test_audit_envelope_integrity_success() -> None:
    """Test successful envelope integrity audit"""
    snapshot_data: dict[str, Any] = {
        "envelopes": [
            {
                "id": "env-1",
                "name": "Rent",
                "category": "Living",
                "lastModified": 1700000000000,
                "currentBalance": 1000.0,
                "type": "standard",
            }
        ],
        "transactions": [
            {
                "id": "tx-1",
                "date": "2024-01-01T12:00:00Z",
                "amount": -500.0,
                "envelopeId": "env-1",
                "category": "Living",
                "lastModified": 1700000000000,
            }
        ],
        "metadata": {
            "id": "budget-1",
            "lastModified": 1700000000000,
            "actualBalance": 1500.0,
            "unassignedCash": 500.0,
            "totalEnvelopeBalance": 1000.0,
        },
    }
    response = client.post("/audit/envelope-integrity", json=snapshot_data)
    assert response.status_code == 200
    data = response.json()
    assert "violations" in data
    assert "summary" in data
    assert "timestamp" in data


def test_audit_envelope_integrity_validation_error() -> None:
    """Test validation error for audit endpoint"""
    # Missing required field 'metadata'
    snapshot_data: dict[str, Any] = {"envelopes": [], "transactions": []}
    response = client.post("/audit/envelope-integrity", json=snapshot_data)
    assert response.status_code == 422  # FastAPI validation error


def test_audit_envelope_integrity_internal_error(monkeypatch: Any) -> None:
    """Test standard error handling in audit endpoint"""

    # Mock auditor to raise an exception
    def mock_audit(*args: Any, **kwargs: Any) -> Any:
        raise Exception("Simulated failure")

    monkeypatch.setattr("api.main.EnvelopeIntegrityAuditor.audit", mock_audit)

    snapshot_data: dict[str, Any] = {
        "envelopes": [],
        "transactions": [],
        "metadata": {"id": "budget-1", "lastModified": 1700000000000},
    }
    response = client.post("/audit/envelope-integrity", json=snapshot_data)
    assert response.status_code == 500
    assert "Audit failed: Simulated failure" in response.json()["detail"]
