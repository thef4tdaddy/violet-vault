import json
import unittest
from io import BytesIO
from typing import Any, cast
from unittest.mock import MagicMock

import pytest

from api.analytics.categorization import analyze_merchant_patterns, handler


def test_analyze_merchant_patterns_basic() -> None:
    """Test basic pattern matching"""
    transactions = [
        {"description": "Starbucks Coffee", "amount": -15.50},
        {"description": "Netflix Subscription", "amount": -14.99},
        {"description": "Uber Ride", "amount": -25.00},
        {"description": "Unknown Vendor", "amount": -100.00},  # Should be ignored
    ]

    # We need multiple transactions to meet threshold (3)
    # Let's boost the count
    transactions.extend(
        [
            {"description": "Dunkin Donuts", "amount": -10.00},
            {"description": "Local Cafe", "amount": -5.00},  # "Cafe" matches
            {"description": "Coffee Shop", "amount": -20.00},  # "Coffee" matches
        ]
    )
    # Coffee total: 15.5 + 10 + 5 + 20 = 50.5. Count: 4. Min Amount: 50. Min Count: 3.
    # Should qualify.

    suggestions = analyze_merchant_patterns(transactions, months_of_data=1)

    assert len(suggestions) >= 1
    coffee = next((s for s in suggestions if s["category"] == "Coffee & Drinks"), None)
    assert coffee is not None
    assert coffee["count"] == 4
    assert coffee["amount"] == 50.5


def test_analyze_merchant_patterns_thresholds() -> None:
    """Test that thresholds are respected"""
    transactions = [
        {"description": "Starbucks", "amount": -5.00},
        {"description": "Starbucks", "amount": -5.00},
        # Count 2, Amount 10. Below thresholds (3, 50).
    ]
    suggestions = analyze_merchant_patterns(transactions, months_of_data=1)
    assert len(suggestions) == 0


def test_analyze_merchant_patterns_months() -> None:
    """Test monthly average calculation"""
    transactions = [
        {"description": "Starbucks", "amount": -10.00},
        {"description": "Starbucks", "amount": -10.00},
        {"description": "Starbucks", "amount": -10.00},
        {"description": "Starbucks", "amount": -20.00},
        {"description": "Starbucks", "amount": -10.00},
    ]  # Total 60. Count 5.

    months = 2
    suggestions = analyze_merchant_patterns(transactions, months_of_data=months)

    assert len(suggestions) == 1
    coffee = suggestions[0]
    # expected_avg = 60 / 2 # 30
    assert coffee["monthlyAverage"] == 30.0
    # Suggested budget = avg * buffer (1.1) = 33
    assert coffee["suggestedBudget"] == 33


def test_invalid_input() -> None:
    with pytest.raises(ValueError):
        analyze_merchant_patterns([], months_of_data=0)


def test_ignore_positive_and_assigned() -> None:
    transactions = [
        {"description": "Refund Starbucks", "amount": 10.00},  # Positive income ignored
        {"description": "Starbucks", "amount": -10.00, "envelopeId": "env1"},  # Assigned ignored
    ]
    suggestions = analyze_merchant_patterns(transactions)
    assert len(suggestions) == 0


class MockCategorizationHandler(handler):
    """Mock handler for testing HTTP endpoints"""

    def __init__(self, rfile: BytesIO, wfile: BytesIO, *args: Any, **kwargs: Any) -> None:
        """
        Initialize mock handler with custom IO streams for testing.

        Args:
            rfile: Input stream for reading request data
            wfile: Output stream for writing response data
            *args: Additional positional arguments for BaseHTTPRequestHandler
            **kwargs: Additional keyword arguments for BaseHTTPRequestHandler
        """
        self.test_rfile = rfile
        self.test_wfile = wfile
        # BaseHTTPRequestHandler __init__ calls setup(), handle(), finish()
        super().__init__(*args, **kwargs)

    def setup(self) -> None:
        """Override setup to bypass socket initialization and inject test streams."""
        # Bypass socket setup and inject our streams
        self.rfile = self.test_rfile
        self.wfile = self.test_wfile

    def finish(self) -> None:
        """Override finish to flush without closing streams for test inspection."""
        # Flush but do not close, so we can read the output in tests
        self.wfile.flush()


class TestCategorizationHandler(unittest.TestCase):
    """Test the HTTP handler class"""

    def setUp(self) -> None:
        self.mock_client_address = ("127.0.0.1", 12345)
        self.mock_server = MagicMock()

    def _run_request(self, method: str, body: bytes | None = None) -> bytes:
        """
        Helper to run an HTTP request by simulating the socket connection.

        Args:
            method: HTTP method (e.g., "GET", "POST", "OPTIONS")
            body: Optional request body bytes for POST requests

        Returns:
            Raw HTTP response bytes including status line, headers, and body
            in the format: "HTTP/1.0 STATUS\\r\\nHeader: value\\r\\n\\r\\nbody"
        """
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

        # We pass MagicMock as request/socket because our setup() override ignores it
        try:
            MockCategorizationHandler(
                input_file, output_file, MagicMock(), self.mock_client_address, self.mock_server
            )
        except Exception:
            # If handler crashes during processing, we still want to see partial output
            # This allows tests to verify error responses were sent before the crash
            pass

        return output_file.getvalue()

    def _parse_response(self, response_bytes: bytes) -> dict[str, Any]:
        """
        Extract JSON body from HTTP response.

        Args:
            response_bytes: Raw HTTP response bytes

        Returns:
            Parsed JSON response as a dictionary, or empty dict if parsing fails
        """
        try:
            _, body = response_bytes.split(b"\r\n\r\n", 1)
            return cast(dict[str, Any], json.loads(body))
        except (ValueError, json.JSONDecodeError):
            # Return empty dict for malformed responses - tests will fail on assertions
            return {}

    def test_do_GET_health_check(self) -> None:
        """Test GET request returns health status"""
        response_bytes = self._run_request(method="GET")

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIn("VioletVault", response["message"])
        self.assertEqual(response["endpoint"], "POST /api/analytics/categorization")

    def test_do_OPTIONS(self) -> None:
        """Test OPTIONS for CORS preflight"""
        response_bytes = self._run_request(method="OPTIONS")
        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        self.assertIn(b"Access-Control-Allow-Origin: *", response_bytes)
        self.assertIn(b"Access-Control-Allow-Methods: POST, OPTIONS", response_bytes)
        self.assertIn(b"Access-Control-Allow-Headers: Content-Type", response_bytes)

    def test_do_POST_success(self) -> None:
        """Test successful categorization request"""
        payload = {
            "transactions": [
                {"description": "Starbucks Coffee", "amount": -15.50},
                {"description": "Dunkin Donuts", "amount": -10.00},
                {"description": "Local Cafe", "amount": -5.00},
                {"description": "Coffee Shop", "amount": -20.00},
            ],
            "monthsOfData": 1,
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIsNone(response["error"])
        self.assertIsInstance(response["suggestions"], list)

    def test_do_POST_missing_transactions(self) -> None:
        """Test POST with missing transactions field"""
        payload = {"monthsOfData": 1}
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        self.assertEqual(response["error"], "Missing required field: transactions")

    def test_do_POST_empty_transactions(self) -> None:
        """Test POST with empty transactions array"""
        payload: dict[str, Any] = {"transactions": []}
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        self.assertEqual(response["error"], "Missing required field: transactions")

    def test_do_POST_invalid_months_of_data_type(self) -> None:
        """Test POST with invalid monthsOfData type"""
        payload = {
            "transactions": [{"description": "Test", "amount": -10.00}],
            "monthsOfData": "invalid",
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        self.assertEqual(response["error"], "monthsOfData must be a positive integer")

    def test_do_POST_invalid_months_of_data_zero(self) -> None:
        """Test POST with monthsOfData = 0"""
        payload = {
            "transactions": [{"description": "Test", "amount": -10.00}],
            "monthsOfData": 0,
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        self.assertEqual(response["error"], "monthsOfData must be a positive integer")

    def test_do_POST_invalid_months_of_data_negative(self) -> None:
        """Test POST with negative monthsOfData"""
        payload = {
            "transactions": [{"description": "Test", "amount": -10.00}],
            "monthsOfData": -1,
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        self.assertEqual(response["error"], "monthsOfData must be a positive integer")

    def test_do_POST_default_months_of_data(self) -> None:
        """Test POST with default monthsOfData (should use 1)"""
        payload = {
            "transactions": [
                {"description": "Starbucks", "amount": -15.00},
                {"description": "Starbucks", "amount": -15.00},
                {"description": "Starbucks", "amount": -20.00},
            ]
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])

    def test_do_POST_null_months_of_data(self) -> None:
        """Test POST with explicit null monthsOfData (should default to 1)"""
        payload = {
            "transactions": [
                {"description": "Starbucks", "amount": -15.00},
                {"description": "Starbucks", "amount": -15.00},
                {"description": "Starbucks", "amount": -20.00},
            ],
            "monthsOfData": None,
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])

    def test_do_POST_invalid_json(self) -> None:
        """Test POST with invalid JSON"""
        body = b"{invalid_json"
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        # The error message should contain information about JSON parsing error
        self.assertIsInstance(response["error"], str)
        self.assertTrue(len(response["error"]) > 0)

    def test_set_headers(self) -> None:
        """Test _set_headers method sets correct headers"""
        response_bytes = self._run_request(method="GET")

        # Check standard headers
        self.assertIn(b"Content-Type: application/json", response_bytes)
        self.assertIn(b"Access-Control-Allow-Origin: *", response_bytes)
        self.assertIn(b"Access-Control-Allow-Methods: POST, OPTIONS", response_bytes)
        self.assertIn(b"Access-Control-Allow-Headers: Content-Type", response_bytes)

    def test_send_error(self) -> None:
        """Test _send_error method sends proper error response"""
        # Trigger an error by sending empty transactions
        payload: dict[str, Any] = {"transactions": []}
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        self.assertIsInstance(response["error"], str)


if __name__ == "__main__":
    unittest.main()
