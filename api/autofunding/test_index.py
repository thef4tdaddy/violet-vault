import io
import json
from typing import Any, cast
from unittest.mock import patch

from api.autofunding.index import handler


class MockHeaders:
    """Mock for HTTP headers with get logic"""

    def __init__(self, headers: dict[str, str]) -> None:
        self._headers = headers

    def get(self, key: str, default: Any = None) -> Any:
        return self._headers.get(key, default)

    def __getitem__(self, key: str) -> str:
        return self._headers[key]


class MockHandlerImpl(handler):
    """Mock for HTTP handler to avoid starting server and pytest collection issues"""

    response_code: int = 0

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        """Constructor override that does nothing to avoid socket init"""
        pass

    def send_response(self, code: int, message: str | None = None) -> None:
        self.response_code = code

    def send_header(self, keyword: str, value: str) -> None:
        pass

    def end_headers(self) -> None:
        pass

    def log_message(self, format_msg: str, *args: Any) -> None:
        pass


def create_handler(method: str = "GET", body: bytes = b"") -> tuple[MockHandlerImpl, io.BytesIO]:
    """Create a mock handler for testing"""
    output = io.BytesIO()
    h = MockHandlerImpl()
    h.rfile = io.BytesIO(body)
    h.wfile = output
    h.headers = cast(Any, MockHeaders({"Content-Length": str(len(body))}))
    h.command = method
    h.path = "/"
    h.client_address = ("127.0.0.1", 80)
    h.request_version = "HTTP/1.1"
    h.close_connection = True
    h.response_code = 0
    return h, output


def test_handler_get() -> None:
    """Test GET request returns API info"""
    h, output = create_handler("GET")
    h.do_GET()
    result = json.loads(output.getvalue().decode("utf-8"))
    assert result["name"] == "AutoFunding Simulation API"


def test_handler_options() -> None:
    """Test OPTIONS request for CORS"""
    h, _ = create_handler("OPTIONS")
    h.do_OPTIONS()
    assert h.response_code == 204


def test_handler_post_success() -> None:
    """Test successful POST simulation"""
    request_body: dict[str, Any] = {
        "rules": [],
        "context": {
            "data": {
                "unassignedCash": 1000,
                "envelopes": [],
            },
            "trigger": "manual",
        },
    }
    body_json = json.dumps(request_body).encode("utf-8")

    with patch("api.autofunding.index.simulate_rule_execution") as mock_simulate:
        mock_simulate.return_value = {
            "success": True,
            "simulation": {
                "totalPlanned": 0,
                "rulesExecuted": 0,
                "plannedTransfers": [],
                "ruleResults": [],
                "remainingCash": 1000,
                "errors": [],
            },
        }

        h, output = create_handler("POST", body_json)
        h.do_POST()

        result = json.loads(output.getvalue().decode("utf-8"))
        assert result["success"] is True
        assert "simulation" in result


def test_handler_post_invalid_json() -> None:
    """Test POST with invalid JSON"""
    body_json = b"invalid json"
    h, output = create_handler("POST", body_json)
    h.do_POST()

    result = json.loads(output.getvalue().decode("utf-8"))
    assert result["success"] is False
    assert "Invalid JSON format" in result["error"]


def test_handler_post_validation_error() -> None:
    """Test POST with validation error (missing context)"""
    request_body: dict[str, Any] = {"rules": []}  # Missing context
    body_json = json.dumps(request_body).encode("utf-8")
    h, output = create_handler("POST", body_json)
    h.do_POST()

    result = json.loads(output.getvalue().decode("utf-8"))
    assert result["success"] is False
    assert "Validation error" in result["error"]
