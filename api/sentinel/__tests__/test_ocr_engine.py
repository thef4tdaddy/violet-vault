"""
Tests for OCR extraction engine.
Target: 85%+ code coverage
"""

import base64
import sys
from io import BytesIO
from pathlib import Path
from unittest.mock import Mock, patch

import numpy as np
import pytesseract
import pytest
from PIL import Image

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from api.sentinel.models import OCROptions  # noqa: E402
from api.sentinel.ocr_engine import ReceiptExtractor  # noqa: E402


@pytest.fixture
def sample_base64_image() -> str:
    """Create a simple test image as base64"""
    # Create a simple white image
    image = np.ones((100, 100, 3), dtype=np.uint8) * 255
    pil_image = Image.fromarray(image)

    buffer = BytesIO()
    pil_image.save(buffer, format="JPEG")
    buffer.seek(0)

    base64_bytes = base64.b64encode(buffer.read())
    return base64_bytes.decode("utf-8")


@pytest.fixture
def extractor() -> ReceiptExtractor:
    """Create ReceiptExtractor instance"""
    return ReceiptExtractor()


@pytest.fixture
def sample_ocr_options() -> OCROptions:
    """Create sample OCR options"""
    return OCROptions(language="eng", preprocessing=True, psm=6, oem=3)


@pytest.fixture
def sample_ocr_text() -> str:
    """Sample OCR text output"""
    return """
    WALMART
    Date: 01/15/2024

    Banana $3.99
    Milk $4.50

    Subtotal: $8.49
    Tax: $0.68
    Total: $9.17
    """


# Test initialization
def test_extractor_initialization(extractor: ReceiptExtractor) -> None:
    """Test ReceiptExtractor initialization"""
    assert extractor.preprocessor is not None
    assert extractor.parser is not None


# Test Tesseract config building
def test_build_tesseract_config_default(
    extractor: ReceiptExtractor, sample_ocr_options: OCROptions
) -> None:
    """Test building Tesseract config string with default options"""
    config = extractor._build_tesseract_config(sample_ocr_options)

    assert "--psm 6" in config
    assert "--oem 3" in config
    assert "tessedit_char_whitelist" in config


def test_build_tesseract_config_custom_psm(extractor: ReceiptExtractor) -> None:
    """Test building Tesseract config with custom PSM"""
    options = OCROptions(psm=11)
    config = extractor._build_tesseract_config(options)

    assert "--psm 11" in config


def test_build_tesseract_config_custom_oem(extractor: ReceiptExtractor) -> None:
    """Test building Tesseract config with custom OEM"""
    options = OCROptions(oem=1)
    config = extractor._build_tesseract_config(options)

    assert "--oem 1" in config


# Test Tesseract availability check
@patch("pytesseract.get_tesseract_version")
def test_validate_tesseract_available_success(
    mock_version: Mock, extractor: ReceiptExtractor
) -> None:
    """Test Tesseract availability check when installed"""
    mock_version.return_value = "5.0.0"

    result = extractor.validate_tesseract_available()

    assert result is True
    mock_version.assert_called_once()


@patch("pytesseract.get_tesseract_version")
def test_validate_tesseract_available_not_found(
    mock_version: Mock, extractor: ReceiptExtractor
) -> None:
    """Test Tesseract availability check when not installed"""
    mock_version.side_effect = pytesseract.TesseractNotFoundError()

    result = extractor.validate_tesseract_available()

    assert result is False


# Test extract method
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_with_preprocessing(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
    sample_ocr_text: str,
) -> None:
    """Test extraction with preprocessing enabled"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = sample_ocr_text
    options = OCROptions(preprocessing=True)

    extracted_data, metadata = extractor.extract(sample_base64_image, options)

    # Check that OCR was called
    assert mock_ocr.called

    # Check extracted data
    assert extracted_data is not None
    assert extracted_data.merchant == "WALMART"
    assert extracted_data.total == 9.17
    assert extracted_data.raw_text == sample_ocr_text

    # Check metadata
    assert metadata["engine"] == "tesseract"
    assert metadata["version"] == "5.0.0"
    assert "preprocessing" in metadata
    assert metadata["preprocessing"]["steps"] is not None
    assert "ocr_duration_ms" in metadata
    assert "parse_duration_ms" in metadata
    assert "total_duration_ms" in metadata


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_without_preprocessing(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
    sample_ocr_text: str,
) -> None:
    """Test extraction with preprocessing disabled"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = sample_ocr_text
    options = OCROptions(preprocessing=False)

    _, metadata = extractor.extract(sample_base64_image, options)

    # Check that preprocessing was minimal
    assert metadata["preprocessing"]["steps"] == ["decode", "grayscale"]


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_with_custom_language(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
    sample_ocr_text: str,
) -> None:
    """Test extraction with custom language"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = sample_ocr_text
    options = OCROptions(language="fra", preprocessing=True)

    extractor.extract(sample_base64_image, options)

    # Verify language was passed to pytesseract
    mock_ocr.assert_called_once()
    call_kwargs = mock_ocr.call_args[1]
    assert call_kwargs["lang"] == "fra"


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_tesseract_config_passed(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
    sample_ocr_text: str,
) -> None:
    """Test that Tesseract config is properly passed"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = sample_ocr_text
    options = OCROptions(psm=11, oem=1)

    _, metadata = extractor.extract(sample_base64_image, options)

    # Verify config was passed
    call_kwargs = mock_ocr.call_args[1]
    config = call_kwargs["config"]
    assert "--psm 11" in config
    assert "--oem 1" in config
    assert "--psm 11" in metadata["tesseract_config"]


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_timing_metadata(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
    sample_ocr_text: str,
) -> None:
    """Test that timing metadata is captured"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = sample_ocr_text
    options = OCROptions(preprocessing=True)

    _, metadata = extractor.extract(sample_base64_image, options)

    # Check timing fields exist and are reasonable
    assert "ocr_duration_ms" in metadata
    assert metadata["ocr_duration_ms"] >= 0
    assert "parse_duration_ms" in metadata
    assert metadata["parse_duration_ms"] >= 0
    assert "total_duration_ms" in metadata


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_tesseract_not_found(
    mock_ocr: Mock, mock_version: Mock, extractor: ReceiptExtractor, sample_base64_image: str
) -> None:
    """Test extraction when Tesseract is not available"""
    mock_version.return_value = "5.0.0"
    mock_ocr.side_effect = pytesseract.TesseractNotFoundError()
    options = OCROptions(preprocessing=False)

    with pytest.raises(RuntimeError, match="Tesseract OCR engine not available"):
        extractor.extract(sample_base64_image, options)


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_invalid_image(
    mock_ocr: Mock, mock_version: Mock, extractor: ReceiptExtractor
) -> None:
    """Test extraction with invalid base64 image"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = "Some text"
    options = OCROptions(preprocessing=True)

    with pytest.raises(ValueError):
        extractor.extract("invalid_base64!!!", options)


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_empty_ocr_result(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
) -> None:
    """Test extraction when OCR returns empty text"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = ""
    options = OCROptions(preprocessing=True)

    extracted_data, metadata = extractor.extract(sample_base64_image, options)

    # Should handle empty OCR result gracefully
    assert extracted_data.raw_text == ""
    assert extracted_data.merchant is None
    assert extracted_data.total is None
    assert metadata["engine"] == "tesseract"


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_minimal_text(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
) -> None:
    """Test extraction with minimal OCR text"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = "Total: $5.00"
    options = OCROptions(preprocessing=False)

    extracted_data, _ = extractor.extract(sample_base64_image, options)

    assert extracted_data.total == 5.00


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_confidence_scores_populated(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
    sample_ocr_text: str,
) -> None:
    """Test that confidence scores are properly populated"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = sample_ocr_text
    options = OCROptions(preprocessing=True)

    extracted_data, _ = extractor.extract(sample_base64_image, options)

    # Check confidence scores
    assert extracted_data.confidence_scores is not None
    assert 0.0 <= extracted_data.confidence_scores.merchant <= 1.0
    assert 0.0 <= extracted_data.confidence_scores.total <= 1.0
    assert 0.0 <= extracted_data.confidence_scores.date <= 1.0
    assert 0.0 <= extracted_data.confidence_scores.overall <= 1.0


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_memory_cleanup(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
) -> None:
    """Test that memory cleanup is performed"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = "Test text"
    options = OCROptions(preprocessing=True)

    with patch("gc.collect") as mock_gc:
        extractor.extract(sample_base64_image, options)
        # gc.collect should be called for memory cleanup
        assert mock_gc.called


@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_generic_exception(
    mock_ocr: Mock, mock_version: Mock, extractor: ReceiptExtractor, sample_base64_image: str
) -> None:
    """Test extraction with generic exception"""
    mock_version.return_value = "5.0.0"
    mock_ocr.side_effect = Exception("Generic error")
    options = OCROptions(preprocessing=False)

    with pytest.raises(Exception, match="Generic error"):
        extractor.extract(sample_base64_image, options)


# Test PSM modes
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@pytest.mark.parametrize("psm_mode", [0, 3, 6, 11, 12, 13])
def test_extract_different_psm_modes(
    mock_ocr: Mock,
    mock_version: Mock,
    psm_mode: int,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
) -> None:
    """Test extraction with different PSM modes"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = "Test text"
    options = OCROptions(psm=psm_mode, preprocessing=False)

    _, metadata = extractor.extract(sample_base64_image, options)

    # Verify PSM was set correctly
    assert f"--psm {psm_mode}" in metadata["tesseract_config"]


# Test OEM modes
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
@pytest.mark.parametrize("oem_mode", [0, 1, 2, 3])
def test_extract_different_oem_modes(
    mock_ocr: Mock,
    mock_version: Mock,
    oem_mode: int,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
) -> None:
    """Test extraction with different OEM modes"""
    mock_version.return_value = "5.0.0"
    mock_ocr.return_value = "Test text"
    options = OCROptions(oem=oem_mode, preprocessing=False)

    _, metadata = extractor.extract(sample_base64_image, options)

    # Verify OEM was set correctly
    assert f"--oem {oem_mode}" in metadata["tesseract_config"]


# Test whitelist in config
def test_build_tesseract_config_whitelist(extractor: ReceiptExtractor) -> None:
    """Test that character whitelist is included in config"""
    options = OCROptions()
    config = extractor._build_tesseract_config(options)

    assert "tessedit_char_whitelist" in config
    assert "0123456789" in config
    assert "ABCDEFGHIJKLMNOPQRSTUVWXYZ" in config
    assert "abcdefghijklmnopqrstuvwxyz" in config
    assert "$" in config


# Test version metadata
@patch("pytesseract.get_tesseract_version")
@patch("pytesseract.image_to_string")
def test_extract_version_metadata(
    mock_ocr: Mock,
    mock_version: Mock,
    extractor: ReceiptExtractor,
    sample_base64_image: str,
) -> None:
    """Test that Tesseract version is included in metadata"""
    mock_version.return_value = "5.3.0"
    mock_ocr.return_value = "Test text"
    options = OCROptions(preprocessing=False)

    _, metadata = extractor.extract(sample_base64_image, options)

    assert metadata["version"] == "5.3.0"
    mock_version.assert_called_once()
