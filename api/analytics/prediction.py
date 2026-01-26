"""
Payday Prediction API - v2.0 Polyglot Backend
Handles payday prediction logic based on paycheck history
"""

import json
import os

# Import shared types
import sys
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from typing import Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from . import ErrorResponse, PaycheckEntry, PaydayPrediction  # noqa: E402


def predict_next_payday(paychecks: list[PaycheckEntry]) -> PaydayPrediction:
    """
    Predict next payday based on paycheck history
    Ported from paydayPredictor.ts
    """
    if not paychecks or len(paychecks) < 2:
        return {
            "nextPayday": None,
            "confidence": 0,
            "pattern": None,
            "intervalDays": None,
            "message": "Need at least 2 paychecks to predict payday",
        }

    # Parse dates
    def get_paycheck_date(paycheck: PaycheckEntry) -> datetime:
        date_str = paycheck.get("processedAt") or paycheck.get("date", "")
        try:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            # Normalize to offset-naive UTC if aware
            if dt.tzinfo is not None:
                dt = dt.astimezone(None).replace(tzinfo=None)
            return dt
        except (ValueError, AttributeError):
            return datetime.min

    # Sort by date (most recent first)
    sorted_paychecks = sorted(paychecks, key=get_paycheck_date, reverse=True)

    # Calculate intervals between consecutive paychecks
    intervals: list[int] = []
    for i in range(len(sorted_paychecks) - 1):
        current = get_paycheck_date(sorted_paychecks[i])
        previous = get_paycheck_date(sorted_paychecks[i + 1])
        if current == datetime.min or previous == datetime.min:
            continue
        diff_days = (current - previous).days
        intervals.append(diff_days)

    if not intervals:
        return {
            "nextPayday": None,
            "confidence": 0,
            "pattern": None,
            "intervalDays": None,
            "message": "Invalid paycheck dates encountered",
        }

    # Find most common interval (rounded to nearest week)
    interval_counts: dict[int, int] = {}
    for interval in intervals:
        key = round(interval / 7) * 7  # Round to nearest week
        interval_counts[key] = interval_counts.get(key, 0) + 1

    most_common_interval = max(interval_counts, key=lambda k: interval_counts[k])
    interval_frequency = interval_counts[most_common_interval]
    confidence = min(int((interval_frequency / len(intervals)) * 100), 95)

    # Predict next payday
    last_paycheck = get_paycheck_date(sorted_paychecks[0])
    if last_paycheck == datetime.min:
        return {
            "nextPayday": None,
            "confidence": 0,
            "pattern": None,
            "intervalDays": most_common_interval,
            "message": "Invalid paycheck date encountered",
        }

    next_payday = last_paycheck + timedelta(days=most_common_interval)

    # Determine pattern type
    if 13 <= most_common_interval <= 15:
        pattern = "biweekly"
    elif 6 <= most_common_interval <= 8:
        pattern = "weekly"
    elif 27 <= most_common_interval <= 33:
        pattern = "monthly"
    else:
        pattern = f"{most_common_interval}-day cycle"

    # Generate message
    if confidence > 70:
        message = f"High confidence {pattern} pattern detected"
    elif confidence > 50:
        message = f"Moderate confidence {pattern} pattern detected"
    else:
        message = "Low confidence prediction - irregular paycheck schedule"

    return {
        "nextPayday": next_payday.isoformat(),
        "confidence": confidence,
        "pattern": pattern,
        "intervalDays": most_common_interval,
        "message": message,
    }


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for payday prediction"""

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
        """Handle POST requests"""
        try:
            # Read and parse request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            request_data: dict[str, Any] = json.loads(body)

            paychecks = request_data.get("paychecks", [])
            if not paychecks:
                self._send_error(400, "Missing required field: paychecks")
                return

            prediction = predict_next_payday(paychecks)
            response = {
                "success": True,
                "error": None,
                "prediction": prediction,
            }

            self._set_headers(200)
            self.wfile.write(json.dumps(response).encode())

        except json.JSONDecodeError as e:
            self._send_error(400, f"Invalid JSON: {str(e)}")
        except Exception as e:
            self._send_error(500, f"Internal server error: {str(e)}")

    def do_GET(self) -> None:
        """Handle GET requests (health check)"""
        self._set_headers(200)
        response = {
            "success": True,
            "message": "VioletVault Payday Prediction API v2.0",
            "endpoint": "POST /api/analytics/prediction",
        }
        self.wfile.write(json.dumps(response).encode())

    def _send_error(self, status_code: int, message: str) -> None:
        """Send error response"""
        self._set_headers(status_code)
        error_response: ErrorResponse = {"error": message}
        self.wfile.write(json.dumps(error_response).encode())
