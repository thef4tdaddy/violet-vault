from typing import Any

import pytest
from fastapi.testclient import TestClient

from api.main import app, before_send, scrub_pii


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


def test_scrub_pii() -> None:
    assert (
        scrub_pii("Error in transaction 550e8400-e29b-41d4-a716-446655440000")
        == "Error in transaction [REDACTED_ID]"
    )
    assert scrub_pii("Amount is $125.50") == "Amount is [REDACTED_AMOUNT]"
    assert scrub_pii("Contact test@example.com for help") == "Contact [REDACTED_EMAIL] for help"
    assert (
        scrub_pii("Mixed: ID 550e8400-e29b-41d4-a716-446655440000 and $50.00")
        == "Mixed: ID [REDACTED_ID] and [REDACTED_AMOUNT]"
    )


def test_before_send_redaction() -> None:
    event: dict[str, Any] = {
        "message": "Error 550e8400-e29b-41d4-a716-446655440000",
        "exception": {"values": [{"value": "Failed to process $100.00"}]},
        "request": {"data": "user@example.com touched $5.00", "cookies": "sensitive-cookie=secret"},
    }

    result = before_send(event, {})

    assert result is not None
    assert result["message"] == "Error [REDACTED_ID]"
    assert result["exception"]["values"][0]["value"] == "Failed to process [REDACTED_AMOUNT]"
    assert result["request"]["data"] == "[REDACTED_EMAIL] touched [REDACTED_AMOUNT]"
    assert result["request"]["cookies"] == ""


def test_health_check(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_warm_up(client: TestClient) -> None:
    response = client.get("/api/warm")
    assert response.status_code == 200
    assert response.json()["status"] == "warmed"
    assert "Analytics API" in response.json()["service"]
