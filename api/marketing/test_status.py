from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)


def test_marketing_status_endpoint() -> None:
    resp = client.get("/api/marketing/status/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "operational"
    assert "latency_ms" in data
    assert data["services"]["vault_core"] == "encrypted"


def test_marketing_status_failure() -> None:
    # Simulate network failure (e.g., DNS error or timeout)
    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.side_effect = Exception("Network Down")

        resp = client.get("/api/marketing/status/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "degraded"
        assert data["latency_ms"] == -1
        assert data["services"]["web"] == "online"
