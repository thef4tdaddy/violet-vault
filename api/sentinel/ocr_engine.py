"""
OCR extraction engine using Tesseract.
Optimized for Vercel serverless deployment.
"""

import gc
import logging
import time
from typing import Any

import cv2
import pytesseract

from api.sentinel.models import ExtractedReceiptData, OCROptions
from api.sentinel.parser import ReceiptParser
from api.sentinel.preprocessing import ImagePreprocessor

logger = logging.getLogger(__name__)


class ReceiptExtractor:
    """
    Receipt OCR extraction engine using Tesseract.
    Includes preprocessing pipeline and structured data extraction.
    """

    def __init__(self) -> None:
        """Initialize OCR engine with preprocessor and parser"""
        self.preprocessor = ImagePreprocessor()
        self.parser = ReceiptParser()

    def extract(
        self, base64_image: str, options: OCROptions
    ) -> tuple[ExtractedReceiptData, dict[str, Any]]:
        """
        Extract structured receipt data from base64 image.

        Args:
            base64_image: Base64-encoded image string
            options: OCR processing options

        Returns:
            Tuple of (extracted receipt data, processing metadata)

        Raises:
            ValueError: If image is invalid or OCR fails
            RuntimeError: If Tesseract is not available
        """
        start_time = time.time()
        metadata: dict[str, Any] = {
            "engine": "tesseract",
            "version": pytesseract.get_tesseract_version(),
        }

        try:
            # Step 1: Preprocess image if enabled
            if options.preprocessing:
                processed_image, preprocess_meta = self.preprocessor.process(base64_image)
                metadata["preprocessing"] = preprocess_meta
            else:
                # Decode without preprocessing
                processed_image = self.preprocessor.decode_base64_image(base64_image)
                processed_image = cv2.cvtColor(processed_image, cv2.COLOR_BGR2GRAY)
                metadata["preprocessing"] = {"steps": ["decode", "grayscale"]}

            # Step 2: Configure Tesseract
            tesseract_config = self._build_tesseract_config(options)
            metadata["tesseract_config"] = tesseract_config

            # Step 3: Run OCR
            ocr_start = time.time()
            raw_text = pytesseract.image_to_string(
                processed_image, lang=options.language, config=tesseract_config
            )
            ocr_duration = time.time() - ocr_start
            metadata["ocr_duration_ms"] = round(ocr_duration * 1000, 2)

            # Memory cleanup
            del processed_image
            gc.collect()

            # Step 4: Parse structured data
            parse_start = time.time()
            extracted_data = self.parser.parse(raw_text)
            parse_duration = time.time() - parse_start
            metadata["parse_duration_ms"] = round(parse_duration * 1000, 2)

            # Total processing time
            total_duration = time.time() - start_time
            metadata["total_duration_ms"] = round(total_duration * 1000, 2)

            logger.info(
                f"OCR extraction completed in {total_duration * 1000:.2f}ms "
                f"(confidence: {extracted_data.confidence_scores.overall})"
            )

            return extracted_data, metadata

        except pytesseract.TesseractNotFoundError as e:
            logger.error("Tesseract not found. Ensure pytesseract is installed.")
            raise RuntimeError("Tesseract OCR engine not available") from e

        except Exception as e:
            logger.error(f"OCR extraction failed: {e}")
            raise

    def _build_tesseract_config(self, options: OCROptions) -> str:
        """
        Build Tesseract configuration string.

        Args:
            options: OCR options

        Returns:
            Tesseract config string
        """
        # PSM (Page Segmentation Mode):
        # 0 = Orientation and script detection (OSD) only
        # 1 = Automatic page segmentation with OSD
        # 3 = Fully automatic page segmentation, but no OSD (default)
        # 6 = Assume a single uniform block of text
        # 11 = Sparse text. Find as much text as possible in no particular order
        # 12 = Sparse text with OSD
        # 13 = Raw line. Treat the image as a single text line

        # OEM (OCR Engine Mode):
        # 0 = Legacy engine only
        # 1 = Neural nets LSTM engine only
        # 2 = Legacy + LSTM engines
        # 3 = Default, based on what is available (best)

        config_parts = [
            f"--psm {options.psm}",
            f"--oem {options.oem}",
            "-c tessedit_char_whitelist=0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$.,:/- ",
        ]

        return " ".join(config_parts)

    def validate_tesseract_available(self) -> bool:
        """
        Check if Tesseract is available.

        Returns:
            True if Tesseract is available, False otherwise
        """
        try:
            pytesseract.get_tesseract_version()
            return True
        except pytesseract.TesseractNotFoundError:
            return False
