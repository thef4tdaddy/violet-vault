"""
Analytics API Endpoint - Vercel Serverless Function
Provides spending velocity, bill predictions, and health scores
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from typing import Any

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.analytics.bills import predict_bills  # noqa: E402
from api.analytics.health import calculate_budget_health  # noqa: E402
from api.analytics.spending import calculate_spending_velocity  # noqa: E402
from api.models import AnalyticsRequest, AnalyticsResponse  # noqa: E402


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for analytics endpoint"""

    def _set_headers(self, status_code: int = 200) -> None:
        """Set response headers with CORS support"""
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self) -> None:
        """Handle CORS preflight requests"""
        self._set_headers(200)

    def do_GET(self) -> None:
        """Handle GET requests - health check"""
        self._set_headers(200)
        response = {
            "success": True,
            "message": "VioletVault Analytics API v2.0",
            "endpoint": "POST /api/analytics",
            "capabilities": [
                "spending_velocity",
                "bill_predictions",
                "budget_health_score",
            ],
        }
        self.wfile.write(json.dumps(response).encode())

    def do_POST(self) -> None:
        """Handle POST requests - analytics calculations"""
        try:
            # Read and parse request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            request_data: dict[str, Any] = json.loads(body)

            # Validate request with Pydantic
            try:
                analytics_request = AnalyticsRequest(**request_data)
            except Exception as e:
                self._send_error(400, f"Invalid request data: {str(e)}")
                return

            # Process analytics requests
            spending_velocity_result = None
            bill_prediction_result = None
            budget_health_result = None

            # Calculate spending velocity if data provided
            if analytics_request.spendingStats:
                spending_velocity_result = calculate_spending_velocity(
                    {
                        "totalSpent": analytics_request.spendingStats.totalSpent,
                        "budgetAllocated": analytics_request.spendingStats.budgetAllocated,
                        "daysElapsed": analytics_request.spendingStats.daysElapsed,
                        "daysRemaining": analytics_request.spendingStats.daysRemaining,
                    }
                )

            # Predict bills if historical data provided
            if analytics_request.historicalBills:
                from api.analytics.bills import HistoricalBill as HistBillType

                historical_bills_data: list[HistBillType] = [
                    {
                        "amount": bill.amount,
                        "dueDate": bill.dueDate,
                        "category": bill.category,
                    }
                    for bill in analytics_request.historicalBills
                ]
                bill_prediction_result = predict_bills(historical_bills_data)

            # Calculate budget health if metrics provided
            if analytics_request.healthMetrics:
                budget_health_result = calculate_budget_health(
                    {
                        "spendingVelocityScore": analytics_request.healthMetrics.spendingVelocityScore,
                        "billCoverageRatio": analytics_request.healthMetrics.billCoverageRatio,
                        "savingsRate": analytics_request.healthMetrics.savingsRate,
                        "envelopeUtilization": analytics_request.healthMetrics.envelopeUtilization,
                    }
                )

            # Build response
            response_data = AnalyticsResponse(
                success=True,
                spendingVelocity=spending_velocity_result,
                billPredictions=bill_prediction_result,
                budgetHealth=budget_health_result,
                error=None,
            )

            # Send successful response
            self._set_headers(200)
            self.wfile.write(response_data.model_dump_json().encode())

        except json.JSONDecodeError as e:
            self._send_error(400, f"Invalid JSON: {str(e)}")
        except Exception as e:
            self._send_error(500, f"Internal server error: {str(e)}")

    def _send_error(self, status_code: int, message: str) -> None:
        """Send error response"""
        self._set_headers(status_code)
        error_response = AnalyticsResponse(
            success=False,
            spendingVelocity=None,
            billPredictions=None,
            budgetHealth=None,
            error=message,
        )
        self.wfile.write(error_response.model_dump_json().encode())
