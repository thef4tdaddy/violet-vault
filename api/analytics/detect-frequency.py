"""
Paycheck Frequency Detection API - Smart Auto-Detection from Amount
Part of Epic #156: Multi-Paycheck Household Support

PRIVACY GUARANTEE:
- Operates on amounts and dates only (no identifiable data)
- No envelope names, user IDs, or transaction descriptions
- Ephemeral execution (no database writes)

Use Case:
  Multi-paycheck household with different frequencies:
  - Person A: $500 weekly
  - Person B: $1000 biweekly

  System learns to auto-detect: "$520? That's Person A's weekly paycheck!"
"""

import json
import logging
import os

# Import from paycheck_prediction module
import sys
from http.server import BaseHTTPRequestHandler

# Add parent directory to path to import shared models
sys.path.insert(0, os.path.dirname(__file__))

from api.analytics.paycheck_prediction import (
    FrequencyDetectionRequest,
    detect_frequency_from_amount,
)

# Configure logging - PRIVACY: Never log request payloads
logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)  # Only log errors, not request data


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for frequency detection"""

    def _set_headers(self, status_code: int = 200) -> None:
        """Set response headers"""
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self) -> None:
        """Handle preflight requests"""
        self._set_headers(200)

    def do_POST(self) -> None:
        """
        Detect frequency from paycheck amount using historical clustering.

        Request:
          {
            "paycheck_cents": 50000,
            "historical_sessions": [...]
          }

        Response:
          {
            "suggested_frequency": "weekly",
            "confidence": 0.85,
            "reasoning": "Matches weekly paycheck cluster (~$500)",
            "matched_cluster": 50000
          }
        """
        try:
            # Read and parse request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            request_data = json.loads(body)

            # Validate with Pydantic
            request = FrequencyDetectionRequest(**request_data)

            # Execute detection
            result = detect_frequency_from_amount(
                request.paycheck_cents, request.historical_sessions
            )

            # PRIVACY: Log only non-sensitive metadata
            logger.info(
                f"Frequency detection: {result.suggested_frequency} (confidence: {result.confidence})"
            )

            self._set_headers(200)
            self.wfile.write(result.json().encode())

        except ValueError as e:
            self._send_error(422, str(e))

        except Exception as e:
            # PRIVACY: Log error type ONLY, not request payload
            logger.error(f"Frequency detection failed: {type(e).__name__}")
            self._send_error(500, "Frequency detection service unavailable")

    def do_GET(self) -> None:
        """Health check endpoint for monitoring"""
        self._set_headers(200)
        response = {
            "status": "healthy",
            "version": "v1.0.0",
            "endpoint": "POST /api/analytics/detect-frequency",
            "description": "Smart frequency detection from paycheck amount",
        }
        self.wfile.write(json.dumps(response).encode())

    def _send_error(self, status_code: int, message: str) -> None:
        """Send error response"""
        self._set_headers(status_code)
        error_response = {"error": message}
        self.wfile.write(json.dumps(error_response).encode())
