"""
Merchant Categorization API - v2.0 Polyglot Backend
Handles merchant pattern analysis and envelope suggestions
"""

import json
import os
import re

# Import shared types
import sys
from http.server import BaseHTTPRequestHandler
from typing import Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from . import ErrorResponse, MerchantSuggestion  # noqa: E402

# Merchant pattern matchers (ported from suggestionUtils.ts)
MERCHANT_PATTERNS = {
    "Online Shopping": re.compile(r"amazon|amzn|ebay|etsy|online", re.IGNORECASE),
    "Coffee & Drinks": re.compile(r"starbucks|coffee|cafe|dunkin|dutch|brew", re.IGNORECASE),
    "Gas Stations": re.compile(r"shell|exxon|chevron|bp|mobil|gas|fuel", re.IGNORECASE),
    "Subscriptions": re.compile(r"netflix|spotify|hulu|disney|prime|subscription", re.IGNORECASE),
    "Rideshare": re.compile(r"uber|lyft|taxi|ride", re.IGNORECASE),
    "Pharmacy": re.compile(r"cvs|walgreens|pharmacy|drug", re.IGNORECASE),
    "Fast Food": re.compile(r"mcdonald|burger|taco|pizza|subway|kfc|wendy", re.IGNORECASE),
    "Grocery Delivery": re.compile(r"instacart|shipt|fresh|delivery", re.IGNORECASE),
    "Streaming": re.compile(r"netflix|hulu|disney|hbo|paramount|apple.*tv", re.IGNORECASE),
    "Fitness": re.compile(r"gym|fitness|planet|la.*fitness|crossfit", re.IGNORECASE),
}


def analyze_merchant_patterns(
    transactions: list[dict[str, Any]], months_of_data: int = 1
) -> list[MerchantSuggestion]:
    """
    Analyze merchant patterns and suggest envelopes
    Ported from suggestionUtils.ts
    """
    # Validate months_of_data
    if months_of_data <= 0:
        raise ValueError("months_of_data must be a positive integer")

    MIN_AMOUNT = 50
    MIN_TRANSACTIONS = 3
    BUFFER_PERCENTAGE = 1.1

    # Filter unassigned negative transactions
    unassigned_transactions = [
        t for t in transactions if t.get("amount", 0) < 0 and not t.get("envelopeId")
    ]

    merchant_spending: dict[str, dict[str, Any]] = {}

    for transaction in unassigned_transactions:
        description = str(transaction.get("description", "")).lower()

        for category, pattern in MERCHANT_PATTERNS.items():
            if pattern.search(description):
                if category not in merchant_spending:
                    merchant_spending[category] = {"amount": 0, "count": 0, "transactions": []}
                merchant_spending[category]["amount"] += abs(transaction.get("amount", 0))
                merchant_spending[category]["count"] += 1
                merchant_spending[category]["transactions"].append(transaction)

    # Generate suggestions
    suggestions: list[MerchantSuggestion] = []
    for category, data in merchant_spending.items():
        if data["amount"] >= MIN_AMOUNT and data["count"] >= MIN_TRANSACTIONS:
            monthly_average = data["amount"] / months_of_data
            suggested_budget = int(monthly_average * BUFFER_PERCENTAGE)

            suggestions.append(
                {
                    "category": category,
                    "amount": round(data["amount"], 2),
                    "count": data["count"],
                    "suggestedBudget": suggested_budget,
                    "monthlyAverage": round(monthly_average, 2),
                }
            )

    # Sort by amount descending
    suggestions.sort(key=lambda x: x["amount"], reverse=True)
    return suggestions[:10]  # Limit to top 10


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for merchant categorization"""

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

            transactions = request_data.get("transactions", [])
            if not transactions:
                self._send_error(400, "Missing required field: transactions")
                return

            months_of_data = request_data.get("monthsOfData", 1)
            if months_of_data is None:
                months_of_data = 1

            # Validate months_of_data
            if not isinstance(months_of_data, int) or months_of_data <= 0:
                self._send_error(400, "monthsOfData must be a positive integer")
                return

            suggestions = analyze_merchant_patterns(transactions, months_of_data)
            response = {
                "success": True,
                "error": None,
                "suggestions": suggestions,
            }

            self._set_headers(200)
            self.wfile.write(json.dumps(response).encode())

        except ValueError as e:
            self._send_error(400, str(e))
        except json.JSONDecodeError as e:
            self._send_error(400, f"Invalid JSON: {str(e)}")
        except Exception as e:
            self._send_error(500, f"Internal server error: {str(e)}")

    def do_GET(self) -> None:
        """Handle GET requests (health check)"""
        self._set_headers(200)
        response = {
            "success": True,
            "message": "VioletVault Merchant Categorization API v2.0",
            "endpoint": "POST /api/analytics/categorization",
        }
        self.wfile.write(json.dumps(response).encode())

    def _send_error(self, status_code: int, message: str) -> None:
        """Send error response"""
        self._set_headers(status_code)
        error_response: ErrorResponse = {"error": message}
        self.wfile.write(json.dumps(error_response).encode())
