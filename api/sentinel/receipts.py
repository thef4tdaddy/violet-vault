"""
SentinelShare Receipts API
PostgreSQL-backed endpoint for cross-app transaction matching

Features:
- Connection pooling for performance
- Prepared statements for SQL injection prevention
- Graceful error handling
- SSL support for Heroku PostgreSQL
"""

import logging
import os
from collections.abc import Generator
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import JSON, DateTime, Float, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

# Configure logging
logger = logging.getLogger(__name__)

# Database Setup
DATABASE_URL = os.environ.get("SENT_DATABASE_URL")
if not DATABASE_URL:
    logger.warning("SENT_DATABASE_URL not set. SentinelShare backend will not be functional.")

# SSL settings for Heroku Postgres
connect_args: dict[str, Any] = {}
if DATABASE_URL and "localhost" not in DATABASE_URL:
    connect_args = {"sslmode": "require"}

engine = create_engine(DATABASE_URL, connect_args=connect_args) if DATABASE_URL else None
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) if engine else None


class Base(DeclarativeBase):
    """Base class for SQLAlchemy models"""

    pass


# SQLAlchemy Model
class ReceiptDB(Base):
    """
    SQLAlchemy model for SentinelShare receipts stored in PostgreSQL.

    This model represents receipts from external applications (like SentinelShare)
    that can be matched against transactions in VioletVault.

    Attributes:
        id: Unique receipt identifier
        amount: Transaction amount
        merchant: Merchant or vendor name
        date: Transaction date
        category: Optional receipt category
        description: Optional receipt description
        status: Current status (pending, matched, ignored)
        created_at: Timestamp when receipt was created
        updated_at: Timestamp when receipt was last updated
        matched_transaction_id: ID of matched VioletVault transaction
        source_app: Source application that created the receipt
        metadata_json: Additional metadata as JSON
    """

    __tablename__ = "receipts"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    merchant: Mapped[str] = mapped_column(String, index=True, nullable=False)
    date: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    category: Mapped[str | None] = mapped_column(String, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String, default="pending", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
    matched_transaction_id: Mapped[str | None] = mapped_column(String, nullable=True)
    source_app: Mapped[str | None] = mapped_column(String, nullable=True)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)


# Create tables if they don't exist
if engine:
    try:
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error("Failed to initialize database tables: %s", str(e))

router = APIRouter(prefix="/receipts", tags=["sentinel"])


# Dependency
def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency.

    Provides a SQLAlchemy session for each request and ensures
    proper cleanup after the request is complete.

    Yields:
        Session: A SQLAlchemy database session

    Raises:
        HTTPException: 503 if database is not configured
    """
    if not SessionLocal:
        raise HTTPException(status_code=503, detail="Database connection not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=dict[str, Any])
def get_receipts(db: Annotated[Session, Depends(get_db)]) -> dict[str, Any]:
    """
    Fetch all receipts from PostgreSQL.

    Returns all SentinelShare receipts ordered by creation date (newest first).
    The response includes a list of receipts and the total count.

    Args:
        db: SQLAlchemy database session (injected by FastAPI)

    Returns:
        dict containing:
            - receipts: List of receipt objects with camelCase keys
            - total: Total number of receipts

    Raises:
        HTTPException: 500 if database query fails
    """
    try:
        receipts = db.query(ReceiptDB).all()
        return {
            "receipts": [
                {
                    "id": r.id,
                    "amount": r.amount,
                    "merchant": r.merchant,
                    "date": r.date.isoformat() if r.date else None,
                    "category": r.category,
                    "description": r.description,
                    "status": r.status,
                    "createdAt": r.created_at.isoformat() if r.created_at else None,
                    "updatedAt": r.updated_at.isoformat() if r.updated_at else None,
                    "matchedTransactionId": r.matched_transaction_id,
                    "sourceApp": r.source_app,
                    "metadata": r.metadata_json or {},
                }
                for r in receipts
            ],
            "total": len(receipts),
        }
    except Exception as e:
        logger.error("Failed to fetch receipts: %s", str(e))
        raise HTTPException(status_code=500, detail="Failed to fetch receipts") from e


@router.patch("/{receipt_id}", response_model=dict[str, str])
def update_receipt_status(
    receipt_id: str, payload: dict[str, Any], db: Annotated[Session, Depends(get_db)]
) -> dict[str, str]:
    """
    Update receipt status (matched/ignored/pending).

    Updates the status of a receipt and optionally links it to a
    matched VioletVault transaction.

    Args:
        receipt_id: Unique identifier of the receipt to update
        payload: Dictionary containing:
            - status: New status (matched, ignored, or pending)
            - matchedTransactionId: Optional ID of matched transaction
        db: SQLAlchemy database session (injected by FastAPI)

    Returns:
        dict containing status: "success" if update succeeded

    Raises:
        HTTPException: 404 if receipt not found
        HTTPException: 400 if status is invalid
        HTTPException: 500 if database update fails
    """
    try:
        receipt = db.query(ReceiptDB).filter(ReceiptDB.id == receipt_id).first()
        if not receipt:
            raise HTTPException(status_code=404, detail="Receipt not found")

        status = payload.get("status")
        if status and status not in ["matched", "ignored", "pending"]:
            raise HTTPException(status_code=400, detail="Invalid status")

        if status:
            receipt.status = str(status)

        if "matchedTransactionId" in payload:
            receipt.matched_transaction_id = str(payload.get("matchedTransactionId"))

        receipt.updated_at = datetime.utcnow()

        db.commit()
        return {"status": "success"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update receipt: %s", str(e))
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update receipt") from e
