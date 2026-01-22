from collections.abc import Generator
from datetime import datetime
from typing import Any

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from api.main import app
from api.sentinel.receipts import Base, ReceiptDB, get_db

# Use in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite://"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db() -> Generator[Session, None, None]:
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db() -> Generator[None, None, None]:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_get_receipts_empty() -> None:
    response = client.get("/api/receipts/")
    assert response.status_code == 200
    assert response.json() == {"receipts": [], "total": 0}


def test_update_receipt_status_not_found() -> None:
    response = client.patch("/api/receipts/nonexistent", json={"status": "matched"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Receipt not found"


def test_update_receipt_status_invalid_status() -> None:
    # First add a receipt
    db = TestingSessionLocal()
    db.add(
        ReceiptDB(
            id="test1",
            amount=100.0,
            merchant="Test Merchant",
            date=datetime.utcnow(),
            status="pending",
        )
    )
    db.commit()

    response = client.patch("/api/receipts/test1", json={"status": "invalid"})
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid status"


def test_update_receipt_status_success() -> None:
    # First add a receipt
    db = TestingSessionLocal()
    db.add(
        ReceiptDB(
            id="test2",
            amount=50.0,
            merchant="Another Merchant",
            date=datetime.utcnow(),
            status="pending",
        )
    )
    db.commit()

    response = client.patch(
        "/api/receipts/test2", json={"status": "matched", "matchedTransactionId": "tx123"}
    )
    assert response.status_code == 200
    assert response.json() == {"status": "success"}

    # Verify in DB
    receipt = db.query(ReceiptDB).filter(ReceiptDB.id == "test2").first()
    assert receipt is not None
    assert receipt.status == "matched"
    assert receipt.matched_transaction_id == "tx123"


def test_get_receipts_with_data() -> None:
    db = TestingSessionLocal()
    now = datetime.utcnow()
    db.add(ReceiptDB(id="test3", amount=75.0, merchant="Merchant 3", date=now, status="pending"))
    db.commit()

    response = client.get("/api/receipts/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["receipts"][0]["id"] == "test3"
    assert data["receipts"][0]["merchant"] == "Merchant 3"


def test_get_db_no_session_factory(monkeypatch: Any) -> None:
    def mock_get_db() -> None:
        raise HTTPException(status_code=503, detail="Database connection not configured")

    # Override the dependency for this test
    app.dependency_overrides[get_db] = mock_get_db
    try:
        response = client.get("/api/receipts/")
        assert response.status_code == 503
        assert response.json()["detail"] == "Database connection not configured"
    finally:
        # Restore original override
        app.dependency_overrides[get_db] = override_get_db


def test_get_receipts_exception(monkeypatch: Any) -> None:
    def mock_query(*args: Any, **kwargs: Any) -> None:
        raise Exception("DB Error")

    # We need to mock the session query
    monkeypatch.setattr(Session, "query", mock_query)

    response = client.get("/api/receipts/")
    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to fetch receipts"


def test_update_receipt_exception(monkeypatch: Any) -> None:
    def mock_query(*args: Any, **kwargs: Any) -> None:
        raise Exception("DB Error")

    # First add a receipt
    db = TestingSessionLocal()
    db.add(
        ReceiptDB(
            id="test_exc",
            amount=10.0,
            merchant="Exc Merchant",
            date=datetime.utcnow(),
            status="pending",
        )
    )
    db.commit()

    # Mocking filter to raise exception during update
    monkeypatch.setattr(Session, "query", mock_query)

    response = client.patch("/api/receipts/test_exc", json={"status": "matched"})
    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to update receipt"
