"""
Pydantic models for OCR and receipt extraction.
"""

from typing import Any

from pydantic import BaseModel, Field, field_validator


class OCROptions(BaseModel):
    """OCR processing options"""

    language: str = Field(
        default="eng", description="Tesseract language code (e.g., 'eng', 'fra', 'spa')"
    )
    preprocessing: bool = Field(default=True, description="Enable image preprocessing pipeline")
    psm: int = Field(default=6, ge=0, le=13, description="Page segmentation mode (0-13)")
    oem: int = Field(default=3, ge=0, le=3, description="OCR Engine Mode (0-3)")


class OCRRequest(BaseModel):
    """Request model for OCR extraction"""

    image_base64: str = Field(..., description="Base64-encoded image (JPEG, PNG, WebP)")
    options: OCROptions = Field(default_factory=OCROptions)

    @field_validator("image_base64")
    @classmethod
    def validate_image_size(cls, v: str) -> str:
        """Validate base64 image size (5MB limit)"""
        # Base64 encoding increases size by ~33%, so 5MB image = ~6.7MB base64
        max_base64_size = 6_700_000  # ~5MB original image
        if len(v) > max_base64_size:
            raise ValueError(
                f"Image too large. Maximum size is 5MB (got {len(v) / 1_000_000:.2f}MB base64)"
            )
        return v


class ConfidenceScores(BaseModel):
    """Confidence scores for extracted fields"""

    merchant: float = Field(default=0.0, ge=0.0, le=1.0)
    total: float = Field(default=0.0, ge=0.0, le=1.0)
    date: float = Field(default=0.0, ge=0.0, le=1.0)
    overall: float = Field(default=0.0, ge=0.0, le=1.0)


class LineItem(BaseModel):
    """Individual line item on receipt"""

    description: str = Field(..., description="Item description")
    quantity: float | None = Field(None, description="Quantity purchased")
    unit_price: float | None = Field(None, description="Price per unit")
    total_price: float | None = Field(None, description="Total price for this item")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class ExtractedReceiptData(BaseModel):
    """Extracted receipt data from OCR"""

    merchant: str | None = Field(None, description="Merchant name")
    total: float | None = Field(None, description="Total amount")
    subtotal: float | None = Field(None, description="Subtotal before tax")
    tax: float | None = Field(None, description="Tax amount")
    date: str | None = Field(None, description="Receipt date (ISO 8601 format)")
    currency: str = Field(default="USD", description="Currency code")
    line_items: list[LineItem] = Field(default_factory=list, description="Individual line items")
    raw_text: str = Field(default="", description="Raw OCR text output")
    confidence_scores: ConfidenceScores = Field(default_factory=ConfidenceScores)


class OCRResponse(BaseModel):
    """Response model for OCR extraction"""

    success: bool = Field(..., description="Whether extraction succeeded")
    data: ExtractedReceiptData | None = Field(None, description="Extracted receipt data")
    error: str | None = Field(None, description="Error message if extraction failed")
    metadata: dict[str, Any] = Field(
        default_factory=dict, description="Processing metadata (engine used, processing time, etc.)"
    )
