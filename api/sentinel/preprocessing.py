"""
Image preprocessing pipeline for OCR.
Uses OpenCV to enhance image quality for better OCR accuracy.
"""

import base64
import gc
import logging
from io import BytesIO
from typing import Any

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """
    Preprocessing pipeline for receipt images.
    Optimized for Tesseract OCR on Vercel serverless.
    """

    def __init__(
        self,
        target_width: int = 1200,
        denoise_strength: int = 10,
        contrast_clip_limit: float = 2.0,
        adaptive_block_size: int = 11,
        adaptive_c: int = 2,
    ):
        """
        Initialize preprocessor with configurable parameters.

        Args:
            target_width: Target width for resizing (maintains aspect ratio)
            denoise_strength: Denoising strength (higher = more smoothing)
            contrast_clip_limit: CLAHE contrast enhancement limit
            adaptive_block_size: Block size for adaptive threshold (must be odd)
            adaptive_c: Constant subtracted from mean in adaptive threshold
        """
        self.target_width = target_width
        self.denoise_strength = denoise_strength
        self.contrast_clip_limit = contrast_clip_limit
        self.adaptive_block_size = adaptive_block_size
        self.adaptive_c = adaptive_c

    def decode_base64_image(self, base64_str: str) -> np.ndarray:
        """
        Decode base64 string to OpenCV image array.

        Args:
            base64_str: Base64-encoded image string

        Returns:
            NumPy array representing the image

        Raises:
            ValueError: If base64 string is invalid or image cannot be decoded
        """
        try:
            # Remove data URI prefix if present
            if "," in base64_str:
                base64_str = base64_str.split(",", 1)[1]

            # Decode base64 to bytes
            image_bytes = base64.b64decode(base64_str)

            # Convert bytes to PIL Image
            pil_image: Image.Image = Image.open(BytesIO(image_bytes))

            # Convert to RGB if necessary (handles RGBA, grayscale, etc.)
            if pil_image.mode != "RGB":
                pil_image = pil_image.convert("RGB")

            # Convert PIL to OpenCV format (BGR)
            image_array = np.array(pil_image)
            image_bgr = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)

            return image_bgr

        except Exception as e:
            logger.error(f"Failed to decode base64 image: {e}")
            raise ValueError(f"Invalid image data: {e}") from e

    def grayscale(self, image: np.ndarray) -> np.ndarray:
        """
        Convert image to grayscale.

        Args:
            image: Input BGR image

        Returns:
            Grayscale image
        """
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    def resize(self, image: np.ndarray) -> np.ndarray:
        """
        Resize image to target width while maintaining aspect ratio.

        Args:
            image: Input image

        Returns:
            Resized image
        """
        height, width = image.shape[:2]

        # Only resize if image is larger than target
        if width > self.target_width:
            aspect_ratio = height / width
            new_height = int(self.target_width * aspect_ratio)
            return cv2.resize(image, (self.target_width, new_height), interpolation=cv2.INTER_AREA)

        return image

    def denoise(self, image: np.ndarray) -> np.ndarray:
        """
        Apply denoising to reduce noise while preserving text edges.

        Args:
            image: Input grayscale image

        Returns:
            Denoised image
        """
        return cv2.fastNlMeansDenoising(image, None, self.denoise_strength, 7, 21)

    def enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization).

        Args:
            image: Input grayscale image

        Returns:
            Contrast-enhanced image
        """
        clahe = cv2.createCLAHE(clipLimit=self.contrast_clip_limit, tileGridSize=(8, 8))
        return clahe.apply(image)

    def adaptive_threshold(self, image: np.ndarray) -> np.ndarray:
        """
        Apply adaptive thresholding to binarize the image.

        Args:
            image: Input grayscale image

        Returns:
            Binary image (black text on white background)
        """
        return cv2.adaptiveThreshold(
            image,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            self.adaptive_block_size,
            self.adaptive_c,
        )

    def deskew(self, image: np.ndarray) -> np.ndarray:
        """
        Correct image skew/rotation for better OCR accuracy.

        Args:
            image: Input binary image

        Returns:
            Deskewed image
        """
        try:
            # Find coordinates of all white pixels
            coords = np.column_stack(np.where(image > 0))

            # Calculate rotation angle using minimum area rectangle
            angle = cv2.minAreaRect(coords)[-1]

            # Adjust angle to be between -45 and 45 degrees
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle

            # Only deskew if angle is significant (> 0.5 degrees)
            if abs(angle) < 0.5:
                return image

            # Calculate rotation matrix and apply
            height, width = image.shape[:2]
            center = (width // 2, height // 2)
            rotation_matrix = cv2.getRotationMatrix2D(center, angle, 1.0)
            rotated = cv2.warpAffine(
                image,
                rotation_matrix,
                (width, height),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE,
            )

            return rotated

        except Exception as e:
            logger.warning(f"Deskew failed, returning original image: {e}")
            return image

    def process(self, base64_image: str) -> tuple[np.ndarray, dict[str, Any]]:
        """
        Run full preprocessing pipeline on base64 image.

        Args:
            base64_image: Base64-encoded image string

        Returns:
            Tuple of (processed image array, metadata dict)
        """
        metadata: dict[str, Any] = {"steps": []}

        try:
            # Step 1: Decode
            image = self.decode_base64_image(base64_image)
            metadata["original_shape"] = image.shape
            metadata["steps"].append("decode")

            # Step 2: Grayscale
            gray = self.grayscale(image)
            metadata["steps"].append("grayscale")

            # Step 3: Resize
            resized = self.resize(gray)
            metadata["resized_shape"] = resized.shape
            metadata["steps"].append("resize")

            # Step 4: Denoise
            denoised = self.denoise(resized)
            metadata["steps"].append("denoise")

            # Step 5: Enhance contrast
            enhanced = self.enhance_contrast(denoised)
            metadata["steps"].append("enhance_contrast")

            # Step 6: Adaptive threshold
            binary = self.adaptive_threshold(enhanced)
            metadata["steps"].append("adaptive_threshold")

            # Step 7: Deskew
            deskewed = self.deskew(binary)
            metadata["steps"].append("deskew")

            # Memory cleanup
            del image, gray, resized, denoised, enhanced, binary
            gc.collect()

            return deskewed, metadata

        except Exception as e:
            logger.error(f"Preprocessing failed: {e}")
            raise
