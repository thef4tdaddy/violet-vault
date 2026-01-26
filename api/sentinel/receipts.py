import logging
import os
import re
from collections.abc import Generator
from datetime import datetime
from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import ValidationError
from sqlalchemy import JSON, DateTime, Float, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

from api.sentinel.models import OCRRequest, OCRResponse
from api.sentinel.ocr_engine import ReceiptExtractor

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
    if not SessionLocal:
        raise HTTPException(status_code=503, detail="Database connection not configured")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=dict[str, Any])
def get_receipts(db: Annotated[Session, Depends(get_db)]) -> dict[str, Any]:
    """Fetch all receipts from Postgres"""
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
    """Update receipt status (matched/ignored)"""
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


# OCR Extraction Engine (singleton)
ocr_extractor = ReceiptExtractor()


def scrub_pii_from_error(error_message: str) -> str:
    """
    Remove potential PII from error messages before logging.

    Args:
        error_message: Raw error message

    Returns:
        Scrubbed error message
    """
    # Remove base64 data
    scrubbed = re.sub(
        r"image_base64['\"]?\s*:\s*['\"]?[A-Za-z0-9+/=]{20,}",
        "image_base64: [REDACTED]",
        error_message,
    )
    # Remove file paths
    scrubbed = re.sub(r"/[a-zA-Z0-9_\-./]+", "[PATH]", scrubbed)
    return scrubbed


@router.post("/extract", response_model=OCRResponse)
def extract_receipt_data(request: OCRRequest) -> OCRResponse:
    """
    Extract structured receipt data from base64-encoded image.

    Args:
        request: OCR request with base64 image and options

    Returns:
        OCR response with extracted data or error

    Example:
        ```json
        {
            "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
            "options": {
                "language": "eng",
                "preprocessing": true,
                "psm": 6,
                "oem": 3
            }
        }
        ```
    """
    try:
        # Validate Tesseract availability on first request
        if not ocr_extractor.validate_tesseract_available():
            raise HTTPException(
                status_code=503,
                detail="OCR service unavailable. Tesseract is not installed or not in PATH.",
            )

        # Extract receipt data
        extracted_data, metadata = ocr_extractor.extract(request.image_base64, request.options)

        return OCRResponse(success=True, data=extracted_data, error=None, metadata=metadata)

    except ValidationError as e:
        logger.warning(f"Validation error: {e}")
        return OCRResponse(success=False, data=None, error=f"Invalid request: {e}", metadata={})

    except ValueError as e:
        error_msg = str(e)
        logger.warning(f"Invalid input: {error_msg}")
        return OCRResponse(success=False, data=None, error=error_msg, metadata={})

    except RuntimeError as e:
        error_msg = str(e)
        logger.error(f"Runtime error: {error_msg}")
        return OCRResponse(success=False, data=None, error=error_msg, metadata={})

    except HTTPException:
        raise

    except Exception as e:
        error_msg = str(e)
        scrubbed_error = scrub_pii_from_error(error_msg)
        logger.error(f"OCR extraction failed: {scrubbed_error}")
        return OCRResponse(
            success=False, data=None, error="OCR extraction failed. Please try again.", metadata={}
        )
