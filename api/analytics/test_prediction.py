import json
import unittest
from datetime import datetime, timedelta
from io import BytesIO
from typing import Any, cast
from unittest.mock import MagicMock

from . import PaycheckEntry
from .prediction import handler, predict_next_payday


class TestPaydayPredictionLogic(unittest.TestCase):
    def test_insufficient_data(self) -> None:
        """Test with fewer than 2 paychecks"""
        result = predict_next_payday([])
        self.assertIsNone(result["nextPayday"])
        self.assertEqual(result["message"], "Need at least 2 paychecks to predict payday")

        result = predict_next_payday([{"amount": 1000, "date": "2024-01-01"}])
        self.assertIsNone(result["nextPayday"])
        self.assertEqual(result["message"], "Need at least 2 paychecks to predict payday")

    def test_invalid_dates(self) -> None:
        """Test with invalid date strings"""
        paychecks: list[PaycheckEntry] = [
            {"amount": 1000, "date": "invalid-date"},
            {"amount": 1000, "date": "2024-01-01"},
        ]
        result = predict_next_payday(paychecks)
        self.assertIsNone(result["nextPayday"])
        self.assertIn("Invalid", result["message"])

    def test_biweekly_pattern(self) -> None:
        """Test standard biweekly pattern (14 days)"""
        base_date = datetime(2024, 1, 1)
        paychecks: list[PaycheckEntry] = []
        # Generate 4 paychecks every 14 days
        for i in range(4):
            date = base_date + timedelta(days=i * 14)
            paychecks.append({"amount": 1000, "date": date.isoformat()})

        result = predict_next_payday(paychecks)

        self.assertEqual(result["intervalDays"], 14)
        self.assertEqual(result["pattern"], "biweekly")
        self.assertTrue(result["confidence"] > 90)

        # Next payday should be 14 days after the LAST paycheck (most recent)
        last_date = base_date + timedelta(days=3 * 14)  # +42
        expected_next = last_date + timedelta(days=14)
        self.assertEqual(result["nextPayday"], expected_next.replace(tzinfo=None).isoformat())

    def test_weekly_pattern(self) -> None:
        """Test weekly pattern (7 days)"""
        base_date = datetime(2024, 1, 1)
        paychecks: list[PaycheckEntry] = []
        for i in range(5):
            date = base_date + timedelta(days=i * 7)
            paychecks.append({"amount": 1000, "date": date.isoformat()})

        result = predict_next_payday(paychecks)
        self.assertEqual(result["intervalDays"], 7)
        self.assertEqual(result["pattern"], "weekly")

    def test_monthly_pattern(self) -> None:
        """Test monthly pattern (~30 days)"""
        paychecks: list[PaycheckEntry] = [
            {"amount": 1000, "date": "2024-03-01"},
            {"amount": 1000, "date": "2024-02-01"},
            {"amount": 1000, "date": "2024-01-01"},
        ]

        result = predict_next_payday(paychecks)
        self.assertEqual(result["pattern"], "monthly")

        # Mypy check: ensure intervalDays is not None before range check
        interval = result["intervalDays"]
        self.assertIsNotNone(interval)
        assert interval is not None
        self.assertTrue(27 <= interval <= 33)

    def test_mixed_dates_and_processed_at(self) -> None:
        """Test handling of processedAt vs date fields"""
        paychecks: list[PaycheckEntry] = [
            {"amount": 1000, "processedAt": "2024-01-15T10:00:00Z"},
            {"amount": 1000, "date": "2024-01-01"},
        ]
        result = predict_next_payday(paychecks)
        self.assertEqual(result["intervalDays"], 14)

    def test_irregular_pattern(self) -> None:
        """Test irregular or low confidence pattern"""
        paychecks: list[PaycheckEntry] = [
            {"amount": 1000, "date": "2024-02-01"},  # 1 day after
            {"amount": 1000, "date": "2024-01-31"},  # 30 days after
            {"amount": 1000, "date": "2024-01-01"},
        ]
        result = predict_next_payday(paychecks)
        self.assertIn("Low confidence", result["message"])


class MockPredictionHandler(handler):
    def __init__(self, rfile: BytesIO, wfile: BytesIO, *args: Any, **kwargs: Any) -> None:
        self.test_rfile = rfile
        self.test_wfile = wfile
        # BaseHTTPRequestHandler __init__ calls setup(), handle(), finish()
        super().__init__(*args, **kwargs)

    def setup(self) -> None:
        # Bypass socket setup and inject our streams
        self.rfile = self.test_rfile
        self.wfile = self.test_wfile

    def finish(self) -> None:
        # Flush but do not close, so we can read the output in tests
        self.wfile.flush()
        # self.wfile.close()  <-- Prevent closing


class TestPredictionHandler(unittest.TestCase):
    def setUp(self) -> None:
        self.mock_client_address = ("127.0.0.1", 12345)
        self.mock_server = MagicMock()

    def _run_request(self, method: str, body: bytes | None = None) -> bytes:
        """Helper to run a request by simulating the socket connection"""
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
            MockPredictionHandler(
                input_file, output_file, MagicMock(), self.mock_client_address, self.mock_server
            )
        except Exception:
            # If handler crashes, we still want to see what was written if any
            pass

        return output_file.getvalue()

    def _parse_response(self, response_bytes: bytes) -> dict[str, Any]:
        """Extract JSON body from HTTP response"""
        try:
            _, body = response_bytes.split(b"\r\n\r\n", 1)
            return cast(dict[str, Any], json.loads(body))
        except ValueError:
            return {}

    def test_do_GET_health_check(self) -> None:
        """Test GET request returns health status"""
        response_bytes = self._run_request(method="GET")

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIn("VioletVault", response["message"])

    def test_do_POST_success(self) -> None:
        """Test successful prediction request"""
        payload = {
            "paychecks": [
                {"amount": 1000, "date": "2024-01-15"},
                {"amount": 1000, "date": "2024-01-01"},
            ]
        }
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertTrue(response["success"])
        self.assertIsNotNone(response["prediction"])
        pred: dict[str, Any] = response["prediction"]
        self.assertEqual(pred["intervalDays"], 14)

    def test_do_POST_missing_paychecks(self) -> None:
        """Test POST with missing paychecks field"""
        payload = {"other": "data"}
        body = json.dumps(payload).encode("utf-8")
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("error", response)
        self.assertIn("Missing required field", response["error"])

    def test_do_POST_invalid_json(self) -> None:
        """Test POST with invalid JSON"""
        body = b"{invalid_json"
        response_bytes = self._run_request(method="POST", body=body)

        self.assertIn(b"HTTP/1.0 400 Bad Request", response_bytes)
        response = self._parse_response(response_bytes)
        self.assertIn("Invalid JSON", response["error"])

    def test_do_OPTIONS(self) -> None:
        """Test OPTIONS for CORS"""
        response_bytes = self._run_request(method="OPTIONS")
        self.assertIn(b"HTTP/1.0 200 OK", response_bytes)
        self.assertIn(b"Access-Control-Allow-Origin: *", response_bytes)


if __name__ == "__main__":
    unittest.main()
