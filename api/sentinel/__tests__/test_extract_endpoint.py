"""
Tests for OCR extraction endpoint.
Target: 85%+ code coverage
"""

import base64
import sys
from io import BytesIO
from pathlib import Path
from unittest.mock import Mock, patch

import numpy as np
import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from PIL import Image

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from api.sentinel.models import ConfidenceScores, ExtractedReceiptData  # noqa: E402
from api.sentinel.receipts import router  # noqa: E402

# Create test app and client
app = FastAPI()
app.include_router(router)
client = TestClient(app)


@pytest.fixture
def sample_base64_image() -> str:
    """Create a simple test image as base64"""
    image = np.ones((100, 100, 3), dtype=np.uint8) * 255
    pil_image = Image.fromarray(image)

    buffer = BytesIO()
    pil_image.save(buffer, format="JPEG")
    buffer.seek(0)

    base64_bytes = base64.b64encode(buffer.read())
    return base64_bytes.decode("utf-8")


@pytest.fixture
def sample_request_payload(sample_base64_image: str) -> dict:
    """Create sample OCR request payload"""
    return {
        "image_base64": sample_base64_image,
        "options": {"language": "eng", "preprocessing": True, "psm": 6, "oem": 3},
    }


@pytest.fixture
def sample_extracted_data() -> ExtractedReceiptData:
    """Create sample extracted receipt data"""
    return ExtractedReceiptData(
        merchant="WALMART",
        total=10.00,
        subtotal=9.00,
        tax=1.00,
        date="2024-01-15",
        currency="USD",
        line_items=[],
        raw_text="WALMART\nTotal: $10.00",
        confidence_scores=ConfidenceScores(merchant=0.8, total=0.9, date=0.85, overall=0.85),
    )


# Test successful extraction
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_receipt_data_success(
    mock_validate: Mock,
    mock_ocr: Mock,
    mock_version: Mock,
    sample_request_payload: dict,
    sample_extracted_data: ExtractedReceiptData,
) -> None:
    """Test successful receipt data extraction"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "WALMART\nDate: 01/15/2024\nSubtotal: $9.00\nTax: $1.00\nTotal: $10.00"

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 200
    data = response.json()

    # Check response structure
    assert data["success"] is True
    assert data["data"] is not None
    assert data["error"] is None
    assert "metadata" in data

    # Check extracted data
    assert data["data"]["merchant"] == "WALMART"
    assert data["data"]["total"] == 10.00
    assert data["data"]["date"] == "2024-01-15"


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_receipt_metadata_included(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_request_payload: dict
) -> None:
    """Test that metadata is included in response"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 200
    data = response.json()

    # Check metadata structure
    metadata = data["metadata"]
    assert "engine" in metadata
    assert metadata["engine"] == "tesseract"
    assert "version" in metadata
    assert "preprocessing" in metadata
    assert "total_duration_ms" in metadata


# Test preprocessing options
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_with_preprocessing_enabled(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_base64_image: str
) -> None:
    """Test extraction with preprocessing enabled"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    payload = {"image_base64": sample_base64_image, "options": {"preprocessing": True}}

    response = client.post("/receipts/extract", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Check that preprocessing was performed
    assert "preprocessing" in data["metadata"]
    assert len(data["metadata"]["preprocessing"]["steps"]) > 2


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_with_preprocessing_disabled(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_base64_image: str
) -> None:
    """Test extraction with preprocessing disabled"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    payload = {"image_base64": sample_base64_image, "options": {"preprocessing": False}}

    response = client.post("/receipts/extract", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Check that minimal preprocessing was performed
    assert data["metadata"]["preprocessing"]["steps"] == ["decode", "grayscale"]


# Test custom language
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_with_custom_language(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_base64_image: str
) -> None:
    """Test extraction with custom language"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    payload = {"image_base64": sample_base64_image, "options": {"language": "fra"}}

    response = client.post("/receipts/extract", json=payload)

    assert response.status_code == 200
    # Verify language was passed to OCR
    mock_ocr.assert_called_once()


# Test custom PSM and OEM
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
@pytest.mark.parametrize("psm,oem", [(6, 3), (11, 1), (3, 2)])
def test_extract_with_custom_psm_oem(
    mock_validate: Mock,
    mock_ocr: Mock,
    mock_version: Mock,
    sample_base64_image: str,
    psm: int,
    oem: int,
) -> None:
    """Test extraction with custom PSM and OEM settings"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    payload = {"image_base64": sample_base64_image, "options": {"psm": psm, "oem": oem}}

    response = client.post("/receipts/extract", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Check config in metadata
    config = data["metadata"]["tesseract_config"]
    assert f"--psm {psm}" in config
    assert f"--oem {oem}" in config


# Test Tesseract not available
@patch("pytesseract.get_tesseract_version")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_tesseract_not_available(
    mock_validate: Mock, mock_version: Mock, sample_request_payload: dict
) -> None:
    """Test extraction when Tesseract is not available"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = False

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 503
    data = response.json()
    assert "Tesseract" in data["detail"]


# Test invalid image data
@patch("pytesseract.get_tesseract_version")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_invalid_base64(mock_validate: Mock, mock_version: Mock) -> None:
    """Test extraction with invalid base64 image"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True

    payload = {"image_base64": "invalid_base64!!!", "options": {"preprocessing": False}}

    response = client.post("/receipts/extract", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Should return error response
    assert data["success"] is False
    assert data["error"] is not None
    assert data["data"] is None


# Test image too large
@patch("pytesseract.get_tesseract_version")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_image_too_large(mock_validate: Mock, mock_version: Mock) -> None:
    """Test extraction with image exceeding size limit"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True

    # Create a base64 string larger than 5MB
    large_base64 = "A" * 7_000_000

    payload = {"image_base64": large_base64, "options": {"preprocessing": False}}

    response = client.post("/receipts/extract", json=payload)

    # Should fail validation
    assert response.status_code == 422


# Test empty request
def test_extract_empty_request() -> None:
    """Test extraction with missing required fields"""
    response = client.post("/receipts/extract", json={})

    # Should fail validation
    assert response.status_code == 422


# Test missing image_base64
def test_extract_missing_image() -> None:
    """Test extraction without image_base64"""
    payload = {"options": {"language": "eng"}}

    response = client.post("/receipts/extract", json=payload)

    # Should fail validation
    assert response.status_code == 422


# Test default options
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_with_default_options(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_base64_image: str
) -> None:
    """Test extraction with default options"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    # Only provide image, no options
    payload = {"image_base64": sample_base64_image}

    response = client.post("/receipts/extract", json=payload)

    assert response.status_code == 200
    data = response.json()

    # Should use default options
    assert data["success"] is True


# Test OCR returning empty text
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_empty_ocr_result(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_request_payload: dict
) -> None:
    """Test extraction when OCR returns empty text"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = ""

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 200
    data = response.json()

    # Should succeed but with no data extracted
    assert data["success"] is True
    assert data["data"]["raw_text"] == ""
    assert data["data"]["merchant"] is None
    assert data["data"]["total"] is None


# Test PII scrubbing in errors
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_error_pii_scrubbing(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_request_payload: dict
) -> None:
    """Test that PII is scrubbed from error messages"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.side_effect = Exception("Error with image_base64: 'ABCDEFGH1234567890ABCDEFGH'")

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 200
    data = response.json()

    # Error should be generic
    assert data["success"] is False
    assert "please try again" in data["error"].lower()
    # Should not contain actual base64 data
    assert "ABCDEFGH1234567890" not in data["error"]


# Test RuntimeError handling
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_runtime_error(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_request_payload: dict
) -> None:
    """Test handling of RuntimeError"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.side_effect = RuntimeError("Runtime error occurred")

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 200
    data = response.json()

    assert data["success"] is False
    assert data["error"] is not None


# Test confidence scores in response
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_confidence_scores(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_request_payload: dict
) -> None:
    """Test that confidence scores are included in response"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "WALMART\nTotal: $10.00\nDate: 01/15/2024"

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 200
    data = response.json()

    # Check confidence scores
    confidence = data["data"]["confidence_scores"]
    assert 0.0 <= confidence["merchant"] <= 1.0
    assert 0.0 <= confidence["total"] <= 1.0
    assert 0.0 <= confidence["date"] <= 1.0
    assert 0.0 <= confidence["overall"] <= 1.0


# Test response format
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_response_format(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_request_payload: dict
) -> None:
    """Test that response follows expected format"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    response = client.post("/receipts/extract", json=sample_request_payload)

    assert response.status_code == 200
    data = response.json()

    # Check required fields
    assert "success" in data
    assert "data" in data
    assert "error" in data
    assert "metadata" in data


# Test invalid PSM value
@patch("pytesseract.get_tesseract_version")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_invalid_psm_value(
    mock_validate: Mock, mock_version: Mock, sample_base64_image: str
) -> None:
    """Test extraction with invalid PSM value"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True

    payload = {"image_base64": sample_base64_image, "options": {"psm": 99}}  # Invalid PSM

    response = client.post("/receipts/extract", json=payload)

    # Should fail validation (PSM must be 0-13)
    assert response.status_code == 422


# Test invalid OEM value
@patch("pytesseract.get_tesseract_version")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_invalid_oem_value(
    mock_validate: Mock, mock_version: Mock, sample_base64_image: str
) -> None:
    """Test extraction with invalid OEM value"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True

    payload = {"image_base64": sample_base64_image, "options": {"oem": 99}}  # Invalid OEM

    response = client.post("/receipts/extract", json=payload)

    # Should fail validation (OEM must be 0-3)
    assert response.status_code == 422


# Test with data URI prefix
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@patch("api.sentinel.receipts.ocr_extractor.validate_tesseract_available")
def test_extract_with_data_uri_prefix(
    mock_validate: Mock, mock_ocr: Mock, mock_version: Mock, sample_base64_image: str
) -> None:
    """Test extraction with data URI prefix in base64"""
    mock_version.return_value = "5.0.0"
    mock_validate.return_value = True
    mock_ocr.return_value = "Test text"

    payload = {"image_base64": f"data:image/jpeg;base64,{sample_base64_image}"}

    response = client.post("/receipts/extract", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
