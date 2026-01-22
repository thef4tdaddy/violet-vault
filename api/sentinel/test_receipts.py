"""
Tests for SentinelShare Receipts API

Test coverage:
- GET /api/receipts/ - Fetch all receipts
- PATCH /api/receipts/{id} - Update receipt status
- Error handling for database failures
- Edge cases and validation
"""

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
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db() -> Generator[None, None, None]:
    """Reset database before each test"""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_get_receipts_empty() -> None:
    """Test fetching receipts when database is empty"""
    response = client.get("/api/receipts/")
    assert response.status_code == 200
    assert response.json() == {"receipts": [], "total": 0}


def test_update_receipt_status_not_found() -> None:
    """Test updating a non-existent receipt returns 404"""
    response = client.patch("/api/receipts/nonexistent", json={"status": "matched"})
    assert response.status_code == 404
    assert response.json()["detail"] == "Receipt not found"


def test_update_receipt_status_invalid_status() -> None:
    """Test updating receipt with invalid status returns 400"""
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
    """Test successfully updating receipt status"""
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
    """Test fetching receipts with existing data"""
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
    """Test database connection not configured returns 503"""

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
    """Test database exception during fetch returns 500"""

    def mock_query(*args: Any, **kwargs: Any) -> None:
        raise Exception("DB Error")

    # We need to mock the session query
    monkeypatch.setattr(Session, "query", mock_query)

    response = client.get("/api/receipts/")
    assert response.status_code == 500
    assert response.json()["detail"] == "Failed to fetch receipts"


def test_update_receipt_exception(monkeypatch: Any) -> None:
    """Test database exception during update returns 500"""

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


def test_update_receipt_status_to_ignored() -> None:
    """Test updating receipt status to ignored"""
    db = TestingSessionLocal()
    db.add(
        ReceiptDB(
            id="test_ignore",
            amount=25.0,
            merchant="Ignore Merchant",
            date=datetime.utcnow(),
            status="pending",
        )
    )
    db.commit()

    response = client.patch("/api/receipts/test_ignore", json={"status": "ignored"})
    assert response.status_code == 200
    assert response.json() == {"status": "success"}

    # Verify status changed
    receipt = db.query(ReceiptDB).filter(ReceiptDB.id == "test_ignore").first()
    assert receipt is not None
    assert receipt.status == "ignored"


def test_update_receipt_status_back_to_pending() -> None:
    """Test updating receipt status back to pending"""
    db = TestingSessionLocal()
    db.add(
        ReceiptDB(
            id="test_pending",
            amount=30.0,
            merchant="Pending Merchant",
            date=datetime.utcnow(),
            status="matched",
            matched_transaction_id="tx_old",
        )
    )
    db.commit()

    response = client.patch("/api/receipts/test_pending", json={"status": "pending"})
    assert response.status_code == 200

    receipt = db.query(ReceiptDB).filter(ReceiptDB.id == "test_pending").first()
    assert receipt is not None
    assert receipt.status == "pending"


def test_get_receipts_with_multiple_records() -> None:
    """Test fetching multiple receipts"""
    db = TestingSessionLocal()
    now = datetime.utcnow()

    # Add multiple receipts
    for i in range(5):
        db.add(
            ReceiptDB(
                id=f"multi_{i}",
                amount=10.0 * (i + 1),
                merchant=f"Merchant {i}",
                date=now,
                status="pending" if i % 2 == 0 else "matched",
            )
        )
    db.commit()

    response = client.get("/api/receipts/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 5
    assert len(data["receipts"]) == 5


def test_receipt_with_all_fields() -> None:
    """Test receipt with all optional fields populated"""
    db = TestingSessionLocal()
    now = datetime.utcnow()

    db.add(
        ReceiptDB(
            id="full_receipt",
            amount=123.45,
            merchant="Full Merchant",
            date=now,
            category="Food & Dining",
            description="Business lunch",
            status="pending",
            source_app="SentinelShare",
            metadata_json={"tags": ["business", "lunch"], "confidence": 0.95},
        )
    )
    db.commit()

    response = client.get("/api/receipts/")
    assert response.status_code == 200
    data = response.json()
    receipt = data["receipts"][0]

    assert receipt["id"] == "full_receipt"
    assert receipt["amount"] == 123.45
    assert receipt["category"] == "Food & Dining"
    assert receipt["description"] == "Business lunch"
    assert receipt["sourceApp"] == "SentinelShare"
    assert receipt["metadata"]["tags"] == ["business", "lunch"]
    assert receipt["metadata"]["confidence"] == 0.95
