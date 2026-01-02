"""
Analytics Intelligence Engine - v2.0 Polyglot Backend
Handles financial prediction logic: payday prediction and merchant categorization
"""

import json
import re
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from typing import Any, TypedDict


class PaycheckEntry(TypedDict, total=False):
    """Paycheck entry structure"""

    date: str
    processedAt: str
    amount: float


class PaydayPrediction(TypedDict):
    """Payday prediction result"""

    nextPayday: str | None
    confidence: int
    pattern: str | None
    intervalDays: int | None
    message: str


class MerchantSuggestion(TypedDict):
    """Merchant pattern suggestion"""

    category: str
    amount: float
    count: int
    suggestedBudget: float
    monthlyAverage: float


class AnalyticsRequest(TypedDict):
    """Analytics API request structure"""

    operation: str
    transactions: list[dict[str, Any]]
    paychecks: list[PaycheckEntry]
    monthsOfData: int | None


class AnalyticsResponse(TypedDict):
    """Analytics API response structure"""

    success: bool
    error: str | None
    prediction: PaydayPrediction | None
    suggestions: list[MerchantSuggestion] | None


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
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
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


def analyze_merchant_patterns(
    transactions: list[dict[str, Any]], months_of_data: int = 1
) -> list[MerchantSuggestion]:
    """
    Analyze merchant patterns and suggest envelopes
    Ported from suggestionUtils.ts
    """
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
            monthly_average = data["amount"] / max(months_of_data, 1)
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
    """Vercel serverless function handler"""

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
            request_data: AnalyticsRequest = json.loads(body)

            operation = request_data.get("operation", "")

            if operation == "predictPayday":
                paychecks = request_data.get("paychecks", [])
                prediction = predict_next_payday(paychecks)
                response: AnalyticsResponse = {
                    "success": True,
                    "error": None,
                    "prediction": prediction,
                    "suggestions": None,
                }
            elif operation == "analyzeMerchants":
                transactions = request_data.get("transactions", [])
                months_of_data_nullable = request_data.get("monthsOfData", 1)
                months_of_data = (
                    months_of_data_nullable if months_of_data_nullable is not None else 1
                )
                suggestions = analyze_merchant_patterns(transactions, months_of_data)
                response = {
                    "success": True,
                    "error": None,
                    "prediction": None,
                    "suggestions": suggestions,
                }
            else:
                self._set_headers(400)
                error_response: AnalyticsResponse = {
                    "success": False,
                    "error": f"Unknown operation: {operation}",
                    "prediction": None,
                    "suggestions": None,
                }
                self.wfile.write(json.dumps(error_response).encode())
                return

            self._set_headers(200)
            self.wfile.write(json.dumps(response).encode())

        except json.JSONDecodeError as e:
            self._set_headers(400)
            error_response = {
                "success": False,
                "error": f"Invalid JSON: {str(e)}",
                "prediction": None,
                "suggestions": None,
            }
            self.wfile.write(json.dumps(error_response).encode())
        except Exception as e:
            self._set_headers(500)
            error_response = {
                "success": False,
                "error": f"Internal server error: {str(e)}",
                "prediction": None,
                "suggestions": None,
            }
            self.wfile.write(json.dumps(error_response).encode())

    def do_GET(self) -> None:
        """Handle GET requests (health check)"""
        self._set_headers(200)
        response = {
            "success": True,
            "message": "VioletVault Analytics API v2.0",
            "endpoints": {
                "POST /api/analytics": {"operations": ["predictPayday", "analyzeMerchants"]}
            },
        }
        self.wfile.write(json.dumps(response).encode())
