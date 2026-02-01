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
