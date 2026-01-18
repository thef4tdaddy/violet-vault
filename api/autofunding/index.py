"""
AutoFunding Simulation API Endpoint
Vercel serverless function for autofunding simulation
"""

import json
import logging
import os
from http.server import BaseHTTPRequestHandler
from typing import Any

from pydantic import ValidationError

# Use relative imports within the package
from .models import AutoFundingRequest, AutoFundingResult
from .simulation import simulate_rule_execution

# Configure logging
logger = logging.getLogger(__name__)


class handler(BaseHTTPRequestHandler):
    """
    Vercel serverless function handler for autofunding simulation

    POST /api/autofunding

    Request Body:
        {
            "rules": [...],  // List of AutoFunding Rules
            "context": {     // Current context
                "data": {
                    "unassignedCash": 1000,
                    "envelopes": [...],
                    "newIncomeAmount": 2500  // Optional
                },
                "trigger": "manual",
                "currentDate": "2024-01-15T12:00:00.000Z"  // Optional
            }
        }

    Response:
        {
            "success": true,
            "simulation": {
                "totalPlanned": 500,
                "rulesExecuted": 2,
                "plannedTransfers": [...],
                "ruleResults": [...],
                "remainingCash": 500,
                "errors": []
            }
        }
    """

    def _get_allowed_origin(self) -> str:
        """Get allowed origin from environment or use wildcard for development"""
        # In production, should be set to specific domain(s)
        allowed_origin = os.environ.get("ALLOWED_ORIGIN", "*")
        return allowed_origin

    def _set_headers(self, status_code: int = 200, content_type: str = "application/json") -> None:
        """Set response headers"""
        self.send_response(status_code)
        self.send_header("Content-type", content_type)
        self.send_header("Access-Control-Allow-Origin", self._get_allowed_origin())
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def _send_json_response(self, data: dict[str, Any], status_code: int = 200) -> None:
        """Send JSON response"""
        self._set_headers(status_code)
        self.wfile.write(json.dumps(data).encode())

    def _send_error_response(self, message: str, status_code: int = 400) -> None:
        """Send error response"""
        self._send_json_response({"success": False, "error": message}, status_code)

    def do_OPTIONS(self) -> None:
        """Handle CORS preflight"""
        self._set_headers(204)

    def do_POST(self) -> None:
        """Handle POST request"""
        try:
            # Read request body
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self._send_error_response("Request body is required", 400)
                return

            body = self.rfile.read(content_length)

            # Parse JSON
            try:
                data = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError:
                self._send_error_response("Invalid JSON format", 400)
                return

            # Validate request with Pydantic
            try:
                request = AutoFundingRequest(**data)
            except ValidationError as e:
                # Extract user-friendly validation errors
                error_messages = []
                for error in e.errors():
                    field = ".".join(str(loc) for loc in error["loc"])
                    error_messages.append(f"{field}: {error['msg']}")
                self._send_error_response(f"Validation error: {'; '.join(error_messages)}", 400)
                return
            except Exception:
                self._send_error_response("Invalid request format", 400)
                return

            # Execute simulation
            result = simulate_rule_execution(request.rules, request.context)

            # Format response
            if result["success"]:
                response = AutoFundingResult(success=True, simulation=result["simulation"])
            else:
                response = AutoFundingResult(
                    success=False, error=result.get("error", "Unknown error")
                )

            # Send response
            self._send_json_response(response.model_dump(), 200)

        except Exception as e:
            # Log the full error for debugging but send sanitized message to client
            logger.error(f"Internal error in autofunding API: {str(e)}", exc_info=True)
            self._send_error_response("An internal error occurred. Please try again later.", 500)

    def do_GET(self) -> None:
        """Handle GET request - return API info"""
        self._send_json_response(
            {
                "name": "AutoFunding Simulation API",
                "version": "1.0.0",
                "description": "Simulates autofunding rule execution without making changes",
                "methods": ["POST"],
                "endpoint": "/api/autofunding",
            }
        )
