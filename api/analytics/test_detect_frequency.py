import io
import json
import os
import sys
import unittest
from typing import Any, cast
from unittest.mock import MagicMock, patch

# Ensure the root directory is in the path for imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

# Add the local directory to path for paycheck_prediction submodule
sys.path.insert(0, os.path.dirname(__file__))

from api.analytics import detect_frequency


class TestFrequencyDetectionHandler(unittest.TestCase):
    def setUp(self) -> None:
        # Patch __init__ correctly to bypass socket setup
        with patch("http.server.BaseHTTPRequestHandler.__init__", return_value=None):
            # Pass mock arguments that handler expects
            self.handler = detect_frequency.handler(MagicMock(), ("127.0.0.1", 80), MagicMock())

        self.handler.wfile = io.BytesIO()
        h_any = cast(Any, self.handler)
        h_any.send_response = MagicMock()
        h_any.send_header = MagicMock()
        h_any.end_headers = MagicMock()

    def set_request_body(self, body: str) -> None:
        self.handler.rfile = io.BytesIO(body.encode())

    def get_response_body(self) -> Any:
        return json.loads(cast(io.BytesIO, self.handler.wfile).getvalue().decode())

    def test_do_GET(self) -> None:
        self.handler.do_GET()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_once_with(200)
        response_body = self.get_response_body()
        self.assertEqual(response_body["status"], "healthy")

    def test_do_OPTIONS(self) -> None:
        self.handler.do_OPTIONS()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_once_with(200)
        h_any.send_header.assert_any_call("Access-Control-Allow-Methods", "POST, OPTIONS")

    @patch("api.analytics.detect_frequency.detect_frequency_from_amount")
    def test_do_POST_success(self, mock_detect: MagicMock) -> None:
        # Mock the result from the prediction module
        mock_result = MagicMock()
        mock_result.json.return_value = json.dumps(
            {
                "suggested_frequency": "weekly",
                "confidence": 0.9,
                "reasoning": "Test",
                "matched_cluster": 50000,
            }
        )
        mock_detect.return_value = mock_result

        request_body = json.dumps(
            {
                "paycheck_cents": 50000,
                "historical_sessions": [
                    {"date": "2026-01-01", "amount_cents": 50000, "ratios": [1.0]}
                ],
            }
        )
        self.set_request_body(request_body)

        # Mock headers.get correctly
        self.handler.headers = MagicMock()
        self.handler.headers.get.return_value = str(len(request_body))

        self.handler.do_POST()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_once_with(200)
        response_body = self.get_response_body()
        self.assertEqual(response_body["suggested_frequency"], "weekly")

    def test_do_POST_invalid_json(self) -> None:
        request_body = "not json"
        self.set_request_body(request_body)
        self.handler.headers = MagicMock()
        self.handler.headers.get.return_value = str(len(request_body))

        self.handler.do_POST()
        # Should result in 422 because JSONDecodeError inherits from ValueError
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(422)

    @patch("api.analytics.detect_frequency.FrequencyDetectionRequest")
    def test_do_POST_validation_error(self, mock_request_class: MagicMock) -> None:
        # Trigger a ValueError during Pydantic validation
        mock_request_class.side_effect = ValueError("Invalid data")

        request_body = json.dumps({"garbage": "data"})
        self.set_request_body(request_body)
        self.handler.headers = MagicMock()
        self.handler.headers.get.return_value = str(len(request_body))

        self.handler.do_POST()
        # ValueError is caught and sends 422
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_any_call(422)

    def test_do_POST_general_exception(self) -> None:
        # Trigger an unexpected exception
        self.handler.headers = MagicMock()
        self.handler.headers.get.side_effect = Exception("Surprise!")

        self.handler.do_POST()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_any_call(500)


if __name__ == "__main__":
    unittest.main()
