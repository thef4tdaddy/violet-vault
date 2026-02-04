import io
import json
import unittest
import unittest.mock
from typing import Any, cast

from api.autofunding import index


class TestAutofundingHandler(unittest.TestCase):
    def setUp(self) -> None:
        with unittest.mock.patch("http.server.BaseHTTPRequestHandler.__init__", return_value=None):
            self.handler = index.handler(
                unittest.mock.MagicMock(), ("127.0.0.1", 80), unittest.mock.MagicMock()
            )

        self.handler.wfile = io.BytesIO()
        self.handler.rfile = unittest.mock.MagicMock()
        h_any = cast(Any, self.handler)
        h_any.send_response = unittest.mock.MagicMock()
        h_any.send_header = unittest.mock.MagicMock()
        h_any.end_headers = unittest.mock.MagicMock()
        self.handler.headers = unittest.mock.MagicMock()

    def set_request_body(self, body: str) -> None:
        r_any = cast(Any, self.handler.rfile)
        r_any.read.return_value = body.encode()
        h_any = cast(Any, self.handler.headers)
        h_any.get.return_value = str(len(body))

    def get_response_body(self) -> Any:
        return json.loads(cast(io.BytesIO, self.handler.wfile).getvalue().decode())

    def test_do_GET(self) -> None:
        self.handler.do_GET()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(200)
        body = self.get_response_body()
        self.assertEqual(body["name"], "AutoFunding Simulation API")

    def test_do_OPTIONS(self) -> None:
        self.handler.do_OPTIONS()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(204)

    def test_do_POST_success(self) -> None:
        request_data = {
            "rules": [
                {
                    "id": "r1",
                    "name": "Test",
                    "type": "fixed_amount",
                    "trigger": "manual",
                    "priority": 1,
                    "enabled": True,
                    "createdAt": "2026-01-01T00:00:00Z",
                    "config": {
                        "sourceType": "unassigned",
                        "targetType": "multiple",
                        "amount": 100.0,
                    },
                }
            ],
            "context": {"data": {"unassignedCash": 1000.0, "envelopes": []}, "trigger": "manual"},
        }
        self.set_request_body(json.dumps(request_data))
        self.handler.do_POST()

        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(200)
        body = self.get_response_body()
        self.assertTrue(body["success"])
        self.assertEqual(body["simulation"]["totalPlanned"], 100.0)

    def test_do_POST_no_body(self) -> None:
        h_any = cast(Any, self.handler.headers)
        h_any.get.return_value = "0"
        self.handler.do_POST()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(400)
        body = self.get_response_body()
        self.assertEqual(body["error"], "Request body is required")

    def test_do_POST_invalid_json(self) -> None:
        self.set_request_body("{invalid")
        self.handler.do_POST()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(400)
        body = self.get_response_body()
        self.assertEqual(body["error"], "Invalid JSON format")

    def test_do_POST_validation_error(self) -> None:
        self.set_request_body(json.dumps({"rules": [], "context": {}}))
        self.handler.do_POST()
        # Pydantic validation error returns 400 with details
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(400)
        body = self.get_response_body()
        self.assertIn("Validation error", body["error"])

    def test_do_POST_request_general_exception(self) -> None:
        self.set_request_body(json.dumps({"rules": [], "context": {}}))
        # Patch AutoFundingRequest to raise a non-ValidationError Exception
        with unittest.mock.patch("api.autofunding.index.AutoFundingRequest") as mock_req:
            mock_req.side_effect = Exception("Format error")
            self.handler.do_POST()
            h_any = cast(Any, self.handler)
            h_any.send_response.assert_called_with(400)
            body = self.get_response_body()
            self.assertEqual(body["error"], "Invalid request format")

    def test_do_POST_general_exception(self) -> None:
        h_any = cast(Any, self.handler.headers)
        h_any.get.side_effect = Exception("Internal")
        self.handler.do_POST()
        h_any = cast(Any, self.handler)
        h_any.send_response.assert_called_with(500)

    def test_do_POST_simulation_failure(self) -> None:
        request_data = {
            "rules": [],
            "context": {"data": {"unassignedCash": 1000.0, "envelopes": []}, "trigger": "manual"},
        }
        self.set_request_body(json.dumps(request_data))
        with unittest.mock.patch("api.autofunding.index.simulate_rule_execution") as mock_sim:
            m_any = cast(Any, mock_sim)
            m_any.return_value = {"success": False, "error": "Sim error"}
            self.handler.do_POST()
            h_any = cast(Any, self.handler)
            h_any.send_response.assert_called_with(
                200
            )  # Handler sends 200 even if simulation fail status
            body = self.get_response_body()
            self.assertFalse(body["success"])
            self.assertEqual(body["error"], "Sim error")


if __name__ == "__main__":
    unittest.main()
