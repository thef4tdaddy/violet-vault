"""
Analytics Intelligence Engine
Provides financial prediction and pattern analysis endpoints
"""

import json
import re
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from typing import Any, Dict, List, Optional, TypedDict


class Transaction(TypedDict):
    """Transaction type definition"""
    date: str
    amount: float
    description: str
    category: Optional[str]
    envelopeId: Optional[str]


class PaydayPrediction(TypedDict):
    """Payday prediction result"""
    nextPayday: Optional[str]
    confidence: int
    pattern: Optional[str]
    intervalDays: Optional[int]
    message: str


class MerchantSuggestion(TypedDict):
    """Merchant pattern suggestion"""
    id: str
    type: str
    priority: str
    title: str
    description: str
    suggestedAmount: int
    reasoning: str
    action: str
    impact: str
    data: Dict[str, Any]


class AnalyticsRequest(TypedDict):
    """Analytics request payload"""
    type: str
    transactions: List[Transaction]
    envelopes: Optional[List[Dict[str, Any]]]
    monthsOfData: Optional[int]


class AnalyticsResponse(TypedDict):
    """Analytics response payload"""
    success: bool
    data: Optional[Dict[str, Any]]
    error: Optional[str]


# Merchant patterns for categorization
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

# Suggestion colors
SUGGESTION_COLORS = [
    "#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
    "#8b5cf6", "#14b8a6", "#f97316", "#84cc16", "#6366f1",
]

# Default settings
DEFAULT_MIN_AMOUNT = 50
DEFAULT_MIN_TRANSACTIONS = 3
DEFAULT_BUFFER_PERCENTAGE = 1.1


def predict_next_payday(transactions: List[Transaction]) -> PaydayPrediction:
    """
    Predict next payday based on paycheck history
    
    Args:
        transactions: List of transaction objects with date and amount fields
        
    Returns:
        PaydayPrediction with next payday, confidence, and pattern
    """
    # Filter for income transactions (positive amounts)
    paychecks = [t for t in transactions if t.get("amount", 0) > 0]
    
    if len(paychecks) < 2:
        return PaydayPrediction(
            nextPayday=None,
            confidence=0,
            pattern=None,
            intervalDays=None,
            message="Need at least 2 paychecks to predict payday"
        )
    
    # Sort paychecks by date (most recent first)
    sorted_paychecks = sorted(
        paychecks,
        key=lambda x: datetime.fromisoformat(x["date"].replace("Z", "+00:00")),
        reverse=True
    )
    
    # Calculate intervals between consecutive paychecks
    intervals: List[int] = []
    for i in range(len(sorted_paychecks) - 1):
        current = datetime.fromisoformat(sorted_paychecks[i]["date"].replace("Z", "+00:00"))
        previous = datetime.fromisoformat(sorted_paychecks[i + 1]["date"].replace("Z", "+00:00"))
        diff_days = (current - previous).days
        intervals.append(diff_days)
    
    # Find the most common interval (rounded to nearest week)
    interval_counts: Dict[int, int] = {}
    for interval in intervals:
        key = round(interval / 7) * 7  # Round to nearest week
        interval_counts[key] = interval_counts.get(key, 0) + 1
    
    # Get the most frequent interval
    most_common_interval = max(interval_counts, key=lambda k: interval_counts[k])
    interval_frequency = interval_counts[most_common_interval]
    confidence = min(int((interval_frequency / len(intervals)) * 100), 95)
    
    # Predict next payday
    last_paycheck = datetime.fromisoformat(sorted_paychecks[0]["date"].replace("Z", "+00:00"))
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
    
    return PaydayPrediction(
        nextPayday=next_payday.isoformat(),
        confidence=confidence,
        pattern=pattern,
        intervalDays=most_common_interval,
        message=message
    )


def analyze_merchant_patterns(
    transactions: List[Transaction],
    envelopes: List[Dict[str, Any]],
    months_of_data: int = 1,
    min_amount: float = DEFAULT_MIN_AMOUNT,
    min_transactions: int = DEFAULT_MIN_TRANSACTIONS,
    buffer_percentage: float = DEFAULT_BUFFER_PERCENTAGE
) -> List[MerchantSuggestion]:
    """
    Analyze merchant patterns in unassigned transactions
    
    Args:
        transactions: List of all transactions
        envelopes: List of existing envelopes
        months_of_data: Number of months of data for calculations
        min_amount: Minimum spending amount to suggest
        min_transactions: Minimum number of transactions to suggest
        buffer_percentage: Buffer percentage for suggestions
        
    Returns:
        List of merchant pattern suggestions
    """
    suggestions: List[MerchantSuggestion] = []
    
    # Get unassigned outgoing transactions
    unassigned = [
        t for t in transactions
        if t.get("amount", 0) < 0 and not t.get("envelopeId")
    ]
    
    # Track merchant spending
    merchant_spending: Dict[str, Dict[str, Any]] = {}
    
    for transaction in unassigned:
        description = transaction.get("description", "").lower()
        
        # Check against merchant patterns
        for category, pattern in MERCHANT_PATTERNS.items():
            if pattern.search(description):
                if category not in merchant_spending:
                    merchant_spending[category] = {
                        "amount": 0,
                        "count": 0,
                        "transactions": []
                    }
                merchant_spending[category]["amount"] += abs(transaction.get("amount", 0))
                merchant_spending[category]["count"] += 1
                merchant_spending[category]["transactions"].append(transaction)
    
    # Generate suggestions for significant merchant patterns
    color_index = 0
    for category, data in merchant_spending.items():
        if data["amount"] >= min_amount and data["count"] >= min_transactions:
            monthly_average = data["amount"] / months_of_data
            suggested_amount = int(monthly_average * buffer_percentage)
            
            # Check if similar envelope already exists
            existing_envelope = None
            for envelope in envelopes:
                env_name = envelope.get("name", "").lower()
                env_category = envelope.get("category", "").lower()
                if category.lower() in env_name or category.lower() in env_category:
                    existing_envelope = envelope
                    break
            
            if not existing_envelope:
                priority = "high" if data["amount"] > 200 else "medium"
                
                suggestions.append(MerchantSuggestion(
                    id=f"merchant_{category}",
                    type="merchant_pattern",
                    priority=priority,
                    title=f'Create "{category}" Envelope',
                    description=f'${data["amount"]:.2f} spent across {data["count"]} {category.lower()} transactions',
                    suggestedAmount=suggested_amount,
                    reasoning=f'Detected spending pattern averaging ${monthly_average:.2f}/month',
                    action="create_envelope",
                    impact="tracking",
                    data={
                        "name": category,
                        "monthlyAmount": suggested_amount,
                        "category": category,
                        "color": SUGGESTION_COLORS[color_index % len(SUGGESTION_COLORS)]
                    }
                ))
                color_index += 1
    
    return suggestions


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""
    
    def _set_cors_headers(self) -> None:
        """Set CORS headers for response"""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Type", "application/json")
    
    def do_OPTIONS(self) -> None:
        """Handle preflight requests"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_POST(self) -> None:
        """Handle POST requests"""
        try:
            # Read request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            
            # Parse JSON
            try:
                request_data: AnalyticsRequest = json.loads(body.decode("utf-8"))
            except json.JSONDecodeError as e:
                self._send_error(400, f"Invalid JSON payload: {str(e)}")
                return
            
            # Get request type
            request_type = request_data.get("type")
            if not request_type:
                self._send_error(400, "Request type is required")
                return
            
            # Get transactions
            transactions = request_data.get("transactions", [])
            if not transactions:
                self._send_error(400, "Transactions are required")
                return
            
            # Route to appropriate handler
            if request_type == "payday_prediction":
                result = predict_next_payday(transactions)
                self._send_success(result)
            
            elif request_type == "merchant_patterns":
                envelopes = request_data.get("envelopes", [])
                months_of_data = request_data.get("monthsOfData", 1)
                result = analyze_merchant_patterns(transactions, envelopes, months_of_data)
                self._send_success({"suggestions": result})
            
            else:
                self._send_error(400, f"Unknown request type: {request_type}")
        
        except Exception as e:
            self._send_error(500, f"Internal server error: {str(e)}")
    
    def _send_success(self, data: Any) -> None:
        """Send success response"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
        
        response: AnalyticsResponse = {
            "success": True,
            "data": data,
            "error": None
        }
        self.wfile.write(json.dumps(response).encode("utf-8"))
    
    def _send_error(self, status_code: int, message: str) -> None:
        """Send error response"""
        self.send_response(status_code)
        self._set_cors_headers()
        self.end_headers()
        
        response: AnalyticsResponse = {
            "success": False,
            "data": None,
            "error": message
        }
        self.wfile.write(json.dumps(response).encode("utf-8"))
