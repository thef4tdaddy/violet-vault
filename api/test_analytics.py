"""
Integration Tests for Analytics API Endpoint
"""

import json
import os
import sys
import unittest
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from io import BytesIO
from typing import TYPE_CHECKING, Any, cast
from unittest.mock import MagicMock

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import from the analytics.py file (not the analytics/ directory)
import importlib.util

spec = importlib.util.spec_from_file_location(
    "analytics_handler", os.path.join(os.path.dirname(__file__), "analytics.py")
)
if spec and spec.loader:
    analytics_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(analytics_module)
    handler = analytics_module.handler
else:
    raise ImportError("Could not load analytics.py module")


if TYPE_CHECKING:
    BaseHandler = BaseHTTPRequestHandler
else:
    BaseHandler = handler


class MockAnalyticsHandler(BaseHandler):
    """Mock handler for testing analytics endpoint"""

    def __init__(self, rfile: BytesIO, wfile: BytesIO, *args: Any, **kwargs: Any) -> None:
        self.test_rfile = rfile
        self.test_wfile = wfile
        super().__init__(*args, **kwargs)

    def setup(self) -> None:
        self.rfile = self.test_rfile
        self.wfile = self.test_wfile

    def finish(self) -> None:
        self.wfile.flush()


PayloadType = dict[str, Any]


class TestAnalyticsEndpoint(unittest.TestCase):
    """Test analytics API endpoint"""

    def setUp(self) -> None:
        self.mock_client_address = ("127.0.0.1", 12345)
        self.mock_server = MagicMock()

    def _run_request(self, method: str, body: bytes | None = None) -> bytes:
        """Helper to run a request"""
        request_line = f"{method} / HTTP/1.1\r\n".encode("iso-8859-1")
        headers = b""
        if body is not None:
            headers += f"Content-Length: {len(body)}\r\n".encode("iso-8859-1")
        headers += b"\r\n"

        input_content = request_line + headers
        if body is not None:
            input_content += body

        input_file = BytesIO(input_content)
        output_file = BytesIO()

        MockAnalyticsHandler(
            input_file, output_file, MagicMock(), self.mock_client_address, self.mock_server
        )

        return output_file.getvalue()

    def _parse_response(self, response_bytes: bytes) -> dict[str, Any]:
        """Extract JSON body from HTTP response"""
        try:
            _, body = response_bytes.split(b"\r\n\r\n", 1)
            return cast(dict[str, Any], json.loads(body))
        except ValueError:
            return {}

    def test_get_health_check(self) -> None:
        """Test GET request returns health status"""
        response_bytes = self._run_request(method="GET")

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIn("VioletVault", response["message"])
        self.assertIn("capabilities", response)

    def test_options_cors(self) -> None:
        """Test OPTIONS for CORS preflight"""
        response_bytes = self._run_request(method="OPTIONS")

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        self.assertIn(b"Access-Control-Allow-Origin: *", response_bytes)
        self.assertIn(b"Access-Control-Allow-Methods", response_bytes)

    def test_spending_velocity_only(self) -> None:
        """Test analytics with only spending velocity data"""
        payload: PayloadType = {
            "spendingStats": {
                "totalSpent": 500.0,
                "budgetAllocated": 1000.0,
                "daysElapsed": 15,
                "daysRemaining": 15,
            }
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIsNotNone(response["spendingVelocity"])
        self.assertIsNone(response["billPredictions"])
        self.assertIsNone(response["budgetHealth"])

        # Verify spending velocity structure
        velocity = response["spendingVelocity"]
        self.assertIn("velocityScore", velocity)
        self.assertIn("dailyRate", velocity)
        self.assertIn("willExceedBudget", velocity)

    def test_bill_predictions_only(self) -> None:
        """Test analytics with only bill prediction data"""
        base_date = datetime(2024, 1, 1)
        bills = []
        for i in range(4):
            date = base_date + timedelta(days=i * 30)
            bills.append({"amount": 150.0, "dueDate": date.isoformat(), "category": "utilities"})

        payload: PayloadType = {"historicalBills": bills}
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIsNone(response["spendingVelocity"])
        self.assertIsNotNone(response["billPredictions"])
        self.assertIsNone(response["budgetHealth"])

        # Verify bill predictions structure
        predictions = response["billPredictions"]
        self.assertIn("predictedBills", predictions)
        self.assertIn("totalPredictedAmount", predictions)

    def test_budget_health_only(self) -> None:
        """Test analytics with only health metrics"""
        payload: PayloadType = {
            "healthMetrics": {
                "spendingVelocityScore": 85,
                "billCoverageRatio": 1.2,
                "savingsRate": 0.15,
                "envelopeUtilization": 0.80,
            }
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIsNone(response["spendingVelocity"])
        self.assertIsNone(response["billPredictions"])
        self.assertIsNotNone(response["budgetHealth"])

        # Verify health score structure
        health = response["budgetHealth"]
        self.assertIn("overallScore", health)
        self.assertIn("grade", health)
        self.assertIn("breakdown", health)

    def test_all_analytics_combined(self) -> None:
        """Test analytics with all data types"""
        base_date = datetime(2024, 1, 1)
        bills = []
        for i in range(3):
            date = base_date + timedelta(days=i * 30)
            bills.append({"amount": 100.0, "dueDate": date.isoformat(), "category": "utilities"})

        payload: PayloadType = {
            "spendingStats": {
                "totalSpent": 600.0,
                "budgetAllocated": 1000.0,
                "daysElapsed": 15,
                "daysRemaining": 15,
            },
            "historicalBills": bills,
            "healthMetrics": {
                "spendingVelocityScore": 75,
                "billCoverageRatio": 1.1,
                "savingsRate": 0.12,
                "envelopeUtilization": 0.85,
            },
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIsNotNone(response["spendingVelocity"])
        self.assertIsNotNone(response["billPredictions"])
        self.assertIsNotNone(response["budgetHealth"])

    def test_empty_request(self) -> None:
        """Test with empty request body (valid but no data)"""
        payload: PayloadType = {}
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIsNone(response["spendingVelocity"])
        self.assertIsNone(response["billPredictions"])
        self.assertIsNone(response["budgetHealth"])

    def test_invalid_json(self) -> None:
        """Test with invalid JSON"""
        body = b"{invalid_json"
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertFalse(response["success"])
        self.assertIn("error", response)
        self.assertIn("Invalid JSON", response["error"])

    def test_invalid_data_structure(self) -> None:
        """Test with invalid data structure"""
        payload: PayloadType = {
            "spendingStats": {
                "totalSpent": "not-a-number",  # Invalid type
                "budgetAllocated": 1000.0,
                "daysElapsed": 15,
                "daysRemaining": 15,
            }
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertFalse(response["success"])
        self.assertIn("error", response)

    def test_negative_days_elapsed(self) -> None:
        """Test validation rejects negative days elapsed"""
        payload: PayloadType = {
            "spendingStats": {
                "totalSpent": 500.0,
                "budgetAllocated": 1000.0,
                "daysElapsed": -5,  # Invalid
                "daysRemaining": 15,
            }
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertFalse(response["success"])

    def test_response_headers(self) -> None:
        """Test response includes proper headers"""
        payload: PayloadType = {}
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        # Check for CORS headers
        self.assertIn(b"Access-Control-Allow-Origin: *", response_bytes)
        self.assertIn(b"Content-Type: application/json", response_bytes)


if __name__ == "__main__":
    unittest.main()
