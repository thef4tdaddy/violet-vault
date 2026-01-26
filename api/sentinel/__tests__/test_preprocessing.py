"""
Tests for image preprocessing pipeline.
Target: 85%+ code coverage
"""

import base64
import sys
from io import BytesIO
from pathlib import Path
from unittest.mock import patch

import cv2
import numpy as np
import pytest
from PIL import Image

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from api.sentinel.preprocessing import ImagePreprocessor  # noqa: E402


# Test fixtures
@pytest.fixture
def sample_image() -> np.ndarray:
    """Create a simple test image"""
    # Create a 100x100 white image with some black text-like shapes
    image = np.ones((100, 100, 3), dtype=np.uint8) * 255
    cv2.rectangle(image, (10, 10), (90, 30), (0, 0, 0), -1)  # Text-like rectangle
    cv2.rectangle(image, (10, 40), (70, 60), (0, 0, 0), -1)
    return image


@pytest.fixture
def sample_base64_image(sample_image: np.ndarray) -> str:
    """Convert sample image to base64 string"""
    # Convert BGR to RGB
    rgb_image = cv2.cvtColor(sample_image, cv2.COLOR_BGR2RGB)
    pil_image = Image.fromarray(rgb_image)

    # Save to BytesIO
    buffer = BytesIO()
    pil_image.save(buffer, format="JPEG")
    buffer.seek(0)

    # Encode to base64
    base64_bytes = base64.b64encode(buffer.read())
    return base64_bytes.decode("utf-8")


@pytest.fixture
def sample_base64_with_data_uri(sample_base64_image: str) -> str:
    """Create base64 with data URI prefix"""
    return f"data:image/jpeg;base64,{sample_base64_image}"


@pytest.fixture
def preprocessor() -> ImagePreprocessor:
    """Create ImagePreprocessor instance"""
    return ImagePreprocessor()


# Test class initialization
def test_preprocessor_initialization() -> None:
    """Test ImagePreprocessor initialization with default parameters"""
    preprocessor = ImagePreprocessor()
    assert preprocessor.target_width == 1200
    assert preprocessor.denoise_strength == 10
    assert preprocessor.contrast_clip_limit == 2.0
    assert preprocessor.adaptive_block_size == 11
    assert preprocessor.adaptive_c == 2


def test_preprocessor_custom_parameters() -> None:
    """Test ImagePreprocessor initialization with custom parameters"""
    preprocessor = ImagePreprocessor(
        target_width=800,
        denoise_strength=15,
        contrast_clip_limit=3.0,
        adaptive_block_size=15,
        adaptive_c=3,
    )
    assert preprocessor.target_width == 800
    assert preprocessor.denoise_strength == 15
    assert preprocessor.contrast_clip_limit == 3.0
    assert preprocessor.adaptive_block_size == 15
    assert preprocessor.adaptive_c == 3


# Test base64 decoding
def test_decode_base64_image_success(
    preprocessor: ImagePreprocessor, sample_base64_image: str
) -> None:
    """Test successful base64 image decoding"""
    image = preprocessor.decode_base64_image(sample_base64_image)
    assert isinstance(image, np.ndarray)
    assert len(image.shape) == 3  # Height, width, channels
    assert image.shape[2] == 3  # BGR channels


def test_decode_base64_with_data_uri(
    preprocessor: ImagePreprocessor, sample_base64_with_data_uri: str
) -> None:
    """Test base64 decoding with data URI prefix"""
    image = preprocessor.decode_base64_image(sample_base64_with_data_uri)
    assert isinstance(image, np.ndarray)
    assert len(image.shape) == 3


def test_decode_base64_invalid_string(preprocessor: ImagePreprocessor) -> None:
    """Test base64 decoding with invalid base64 string"""
    with pytest.raises(ValueError, match="Invalid image data"):
        preprocessor.decode_base64_image("invalid_base64_string!!!")


def test_decode_base64_empty_string(preprocessor: ImagePreprocessor) -> None:
    """Test base64 decoding with empty string"""
    with pytest.raises(ValueError, match="Invalid image data"):
        preprocessor.decode_base64_image("")


# Test grayscale conversion
def test_grayscale_conversion(preprocessor: ImagePreprocessor, sample_image: np.ndarray) -> None:
    """Test grayscale conversion"""
    gray = preprocessor.grayscale(sample_image)
    assert isinstance(gray, np.ndarray)
    assert len(gray.shape) == 2  # Grayscale has no channel dimension
    assert gray.shape[0] == sample_image.shape[0]
    assert gray.shape[1] == sample_image.shape[1]


# Test resize
def test_resize_large_image(preprocessor: ImagePreprocessor) -> None:
    """Test resize on image larger than target width"""
    large_image = np.ones((2000, 2000), dtype=np.uint8) * 255
    resized = preprocessor.resize(large_image)

    assert resized.shape[1] == preprocessor.target_width  # Width should match target
    assert resized.shape[0] == preprocessor.target_width  # Height should maintain aspect ratio


def test_resize_small_image(preprocessor: ImagePreprocessor, sample_image: np.ndarray) -> None:
    """Test resize on image smaller than target width (should not resize)"""
    gray = preprocessor.grayscale(sample_image)
    resized = preprocessor.resize(gray)

    assert resized.shape == gray.shape  # Should not resize


# Test denoise
def test_denoise(preprocessor: ImagePreprocessor, sample_image: np.ndarray) -> None:
    """Test denoising"""
    gray = preprocessor.grayscale(sample_image)
    denoised = preprocessor.denoise(gray)

    assert isinstance(denoised, np.ndarray)
    assert denoised.shape == gray.shape
    assert denoised.dtype == np.uint8


# Test contrast enhancement
def test_enhance_contrast(preprocessor: ImagePreprocessor, sample_image: np.ndarray) -> None:
    """Test contrast enhancement using CLAHE"""
    gray = preprocessor.grayscale(sample_image)
    enhanced = preprocessor.enhance_contrast(gray)

    assert isinstance(enhanced, np.ndarray)
    assert enhanced.shape == gray.shape
    assert enhanced.dtype == np.uint8


# Test adaptive threshold
def test_adaptive_threshold(preprocessor: ImagePreprocessor, sample_image: np.ndarray) -> None:
    """Test adaptive thresholding"""
    gray = preprocessor.grayscale(sample_image)
    binary = preprocessor.adaptive_threshold(gray)

    assert isinstance(binary, np.ndarray)
    assert binary.shape == gray.shape
    assert binary.dtype == np.uint8
    # Binary image should only have values 0 or 255
    assert set(np.unique(binary)).issubset({0, 255})


# Test deskew
def test_deskew_skewed_image(preprocessor: ImagePreprocessor) -> None:
    """Test deskew on a skewed image"""
    # Create a simple binary image with text-like content
    image = np.zeros((100, 100), dtype=np.uint8)
    image[40:60, 20:80] = 255

    deskewed = preprocessor.deskew(image)

    assert isinstance(deskewed, np.ndarray)
    assert deskewed.shape == image.shape


def test_deskew_no_rotation_needed(
    preprocessor: ImagePreprocessor, sample_image: np.ndarray
) -> None:
    """Test deskew when rotation is minimal (<0.5 degrees)"""
    gray = preprocessor.grayscale(sample_image)
    binary = preprocessor.adaptive_threshold(gray)

    # Mock minAreaRect to return small angle
    with patch("cv2.minAreaRect", return_value=(None, None, 0.2)):
        deskewed = preprocessor.deskew(binary)
        # Should return original image when angle < 0.5
        np.testing.assert_array_equal(deskewed, binary)


def test_deskew_exception_handling(preprocessor: ImagePreprocessor) -> None:
    """Test deskew error handling"""
    # Create image with no white pixels (will fail coordinate finding)
    black_image = np.zeros((100, 100), dtype=np.uint8)

    # Should return original image on error
    deskewed = preprocessor.deskew(black_image)
    np.testing.assert_array_equal(deskewed, black_image)


# Test full preprocessing pipeline
def test_process_full_pipeline(preprocessor: ImagePreprocessor, sample_base64_image: str) -> None:
    """Test complete preprocessing pipeline"""
    processed_image, metadata = preprocessor.process(sample_base64_image)

    # Check processed image
    assert isinstance(processed_image, np.ndarray)
    assert len(processed_image.shape) == 2  # Should be grayscale/binary

    # Check metadata
    assert "original_shape" in metadata
    assert "resized_shape" in metadata
    assert "steps" in metadata

    # Verify all steps were executed
    expected_steps = [
        "decode",
        "grayscale",
        "resize",
        "denoise",
        "enhance_contrast",
        "adaptive_threshold",
        "deskew",
    ]
    assert metadata["steps"] == expected_steps


def test_process_with_data_uri(
    preprocessor: ImagePreprocessor, sample_base64_with_data_uri: str
) -> None:
    """Test preprocessing with data URI prefix"""
    processed_image, metadata = preprocessor.process(sample_base64_with_data_uri)

    assert isinstance(processed_image, np.ndarray)
    assert "steps" in metadata


def test_process_invalid_image(preprocessor: ImagePreprocessor) -> None:
    """Test preprocessing with invalid image data"""
    with pytest.raises(ValueError, match="Invalid image data"):
        preprocessor.process("invalid_base64!!!")


def test_process_metadata_shape_info(
    preprocessor: ImagePreprocessor, sample_base64_image: str
) -> None:
    """Test that metadata contains correct shape information"""
    _, metadata = preprocessor.process(sample_base64_image)

    assert isinstance(metadata["original_shape"], tuple)
    assert len(metadata["original_shape"]) == 3  # Height, width, channels
    assert isinstance(metadata["resized_shape"], tuple)
    assert len(metadata["resized_shape"]) == 2  # Height, width (grayscale)


# Test edge cases
def test_process_rgba_image(preprocessor: ImagePreprocessor) -> None:
    """Test preprocessing with RGBA image"""
    # Create RGBA image
    rgba_image = np.ones((100, 100, 4), dtype=np.uint8) * 255
    rgba_image[:, :, 3] = 128  # Set alpha channel

    # Convert to PIL and encode
    pil_image = Image.fromarray(rgba_image, "RGBA")
    buffer = BytesIO()
    pil_image.save(buffer, format="PNG")
    buffer.seek(0)
    base64_str = base64.b64encode(buffer.read()).decode("utf-8")

    # Should handle RGBA conversion
    processed_image, metadata = preprocessor.process(base64_str)
    assert isinstance(processed_image, np.ndarray)


def test_process_grayscale_input(preprocessor: ImagePreprocessor) -> None:
    """Test preprocessing with grayscale input image"""
    # Create grayscale image
    gray_image = np.ones((100, 100), dtype=np.uint8) * 128

    # Convert to PIL and encode
    pil_image = Image.fromarray(gray_image, "L")
    buffer = BytesIO()
    pil_image.save(buffer, format="JPEG")
    buffer.seek(0)
    base64_str = base64.b64encode(buffer.read()).decode("utf-8")

    # Should handle grayscale input
    processed_image, metadata = preprocessor.process(base64_str)
    assert isinstance(processed_image, np.ndarray)
