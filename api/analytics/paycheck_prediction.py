"""
Paycheck Allocation Prediction API - Issue #1787
Privacy-first AI-powered paycheck allocation suggestions
Part of Epic #156: Polyglot Human-Centered Paycheck Flow v2.1

PRIVACY GUARANTEE:
- Operates on ratios only (no identifiable data)
- No envelope names, user IDs, or transaction descriptions
- Ephemeral execution (no database writes)
"""

import json
import logging
from datetime import datetime
from http.server import BaseHTTPRequestHandler

from pydantic import BaseModel, Field, validator

# Configure logging - PRIVACY: Never log request payloads
logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)  # Only log errors, not request data


# Request/Response Models (Pydantic for validation)
class HistoricalSession(BaseModel):
    """Anonymized historical paycheck session - NO ENVELOPE NAMES"""

    date: str = Field(..., description="ISO 8601 date string")
    amount_cents: int = Field(..., gt=0, description="Paycheck amount in cents")
    ratios: list[float] = Field(..., description="Allocation ratios (must sum to ~1.0)")

    @validator("ratios")
    def validate_ratios(cls, v: list[float]) -> list[float]:
        if not v:
            raise ValueError("Ratios cannot be empty")
        if abs(sum(v) - 1.0) > 0.01:
            raise ValueError(f"Ratios must sum to 1.0, got {sum(v)}")
        return v


class PredictionRequest(BaseModel):
    """PRIVACY-FIRST: Only ratios and amounts, NO identifiable data"""

    paycheck_cents: int = Field(..., gt=0, le=10_000_000, description="Current paycheck amount")
    historical_sessions: list[HistoricalSession] = Field(..., min_length=3, max_length=50)
    current_month: int = Field(..., ge=1, le=12, description="1-12 for seasonal detection")
    num_envelopes: int = Field(..., gt=0, le=200)

    @validator("historical_sessions")
    def validate_history(cls, v: list[HistoricalSession]) -> list[HistoricalSession]:
        if len(v) < 3:
            raise ValueError("Need at least 3 historical paychecks for prediction")
        return v


class ReasoningInfo(BaseModel):
    based_on: str
    data_points: int
    pattern_type: str
    seasonal_adjustment: bool


class PredictionResponse(BaseModel):
    suggested_allocations_cents: list[int]
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: ReasoningInfo
    model_version: str
    last_trained_date: str


# Custom Exceptions
class InsufficientDataError(Exception):
    """Raised when < 3 historical paychecks available"""

    pass


class InvalidPayloadError(Exception):
    """Raised when request payload is malformed"""

    pass


def predict_allocations(
    paycheck_cents: int,
    historical_sessions: list[HistoricalSession],
    current_month: int,
    num_envelopes: int,
) -> PredictionResponse:
    """
    Predict optimal allocation based on historical patterns.

    PRIVACY GUARANTEE:
    - Operates on ratios only (no identifiable data)
    - No envelope names, user IDs, or transaction descriptions
    - Ephemeral execution (no database writes)
    """

    if len(historical_sessions) < 3:
        raise InsufficientDataError("Need at least 3 historical paychecks")

    # Sort by date (most recent first)
    sessions = sorted(
        historical_sessions, key=lambda s: datetime.fromisoformat(s.date), reverse=True
    )

    # Calculate weighted average of historical ratios
    # Recent sessions weighted higher (exponential decay)
    weights = [1.0 / (i + 1) for i in range(len(sessions))]
    weight_sum = sum(weights)

    avg_ratios = []
    for envelope_idx in range(num_envelopes):
        weighted_ratio = (
            sum(session.ratios[envelope_idx] * weights[i] for i, session in enumerate(sessions))
            / weight_sum
        )
        avg_ratios.append(weighted_ratio)

    # Apply seasonal adjustments (heuristic-based, not user-specific)
    seasonal_ratios = apply_seasonal_adjustments(avg_ratios, current_month, num_envelopes)

    # Convert ratios to absolute amounts with cents-perfect math
    allocations_cents = []
    allocated = 0

    for ratio in seasonal_ratios:
        amount = int(paycheck_cents * ratio)
        allocations_cents.append(amount)
        allocated += amount

    # Distribute dust using largest remainder method
    dust = paycheck_cents - allocated
    if dust != 0:
        remainders = [
            (paycheck_cents * ratio) - int(paycheck_cents * ratio) for ratio in seasonal_ratios
        ]
        sorted_indices = sorted(range(len(remainders)), key=lambda i: remainders[i], reverse=True)

        # Add 1 cent to top N envelopes (or subtract if negative dust)
        for i in range(abs(dust)):
            if dust > 0:
                allocations_cents[sorted_indices[i]] += 1
            else:
                allocations_cents[sorted_indices[i]] -= 1

    # Calculate confidence based on pattern consistency
    confidence = calculate_consistency_score(sessions, num_envelopes)

    return PredictionResponse(
        suggested_allocations_cents=allocations_cents,
        confidence=confidence,
        reasoning=ReasoningInfo(
            based_on="historical_patterns",
            data_points=len(sessions),
            pattern_type=detect_pattern_type(sessions),
            seasonal_adjustment=current_month in [11, 12, 1, 2],
        ),
        model_version="v1.0.0",
        last_trained_date="2026-01-30",
    )


def apply_seasonal_adjustments(
    ratios: list[float], current_month: int, num_envelopes: int
) -> list[float]:
    """
    Adjust ratios based on seasonal patterns.

    PRIVACY NOTE: Seasonal adjustments are generic heuristics,
    not personalized to individual user behavior.

    Examples:
    - Winter (Nov-Feb): +5% to first envelope (utilities/bills)
    - Summer (Jun-Aug): +5% to last envelope (discretionary/travel)
    """

    adjusted = ratios.copy()

    # Winter months: typically higher utility costs
    if current_month in [11, 12, 1, 2]:
        if num_envelopes > 0:
            adjusted[0] *= 1.05
            # Normalize to sum to 1.0
            total = sum(adjusted)
            adjusted = [r / total for r in adjusted]

    # Summer months: typically higher travel/vacation
    elif current_month in [6, 7, 8]:
        if num_envelopes > 0:
            adjusted[-1] *= 1.05
            total = sum(adjusted)
            adjusted = [r / total for r in adjusted]

    return adjusted


def calculate_consistency_score(sessions: list[HistoricalSession], num_envelopes: int) -> float:
    """
    Calculate confidence score based on pattern consistency.
    Higher score = more consistent historical allocations.
    """
    if len(sessions) < 2:
        return 0.5

    # Calculate variance in ratios across sessions
    variances = []
    for env_idx in range(num_envelopes):
        ratios = [s.ratios[env_idx] for s in sessions]
        mean = sum(ratios) / len(ratios)
        variance = sum((r - mean) ** 2 for r in ratios) / len(ratios)
        variances.append(variance)

    # Average variance (lower = more consistent)
    avg_variance = sum(variances) / len(variances)

    # Convert to confidence score (0.0 to 1.0)
    # Using exponential decay: confidence = e^(-10 * variance)
    confidence = min(1.0, max(0.3, 2.718 ** (-10 * avg_variance)))
    confidence_val: float = float(round(confidence, 2))
    return confidence_val


def detect_pattern_type(sessions: list[HistoricalSession]) -> str:
    """
    Detect paycheck frequency pattern.
    Returns: 'biweekly_consistent', 'monthly_consistent', 'irregular'
    """
    if len(sessions) < 2:
        return "insufficient_data"

    # Calculate intervals between paychecks
    intervals = []
    for i in range(1, len(sessions)):
        date1 = datetime.fromisoformat(sessions[i - 1].date)
        date2 = datetime.fromisoformat(sessions[i].date)
        days = abs((date1 - date2).days)
        intervals.append(days)

    avg_interval = sum(intervals) / len(intervals)

    # Classify based on average interval
    if 12 <= avg_interval <= 16:
        return "biweekly_consistent"
    elif 28 <= avg_interval <= 32:
        return "monthly_consistent"
    else:
        return "irregular"


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler for paycheck prediction"""

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
        """
        PRIVACY-FIRST ENDPOINT:
        - No user IDs logged
        - No envelope names in payload
        - No persistent storage
        - Ephemeral session only
        """
        try:
            # Read and parse request body
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length)
            request_data = json.loads(body)

            # Validate with Pydantic
            request = PredictionRequest(**request_data)

            # Execute prediction
            result = predict_allocations(
                request.paycheck_cents,
                request.historical_sessions,
                request.current_month,
                request.num_envelopes,
            )

            # PRIVACY: Log only non-sensitive metadata
            logger.info(f"Prediction success: {len(request.historical_sessions)} data points")

            self._set_headers(200)
            self.wfile.write(result.json().encode())

        except InsufficientDataError:
            self._send_error(400, "Insufficient historical data. Need at least 3 paychecks.")

        except ValueError as e:
            self._send_error(422, str(e))

        except Exception as e:
            # PRIVACY: Log error type ONLY, not request payload
            logger.error(f"Prediction failed: {type(e).__name__}")
            self._send_error(500, "Prediction service unavailable")

    def do_GET(self) -> None:
        """Health check endpoint for monitoring"""
        self._set_headers(200)
        response = {
            "status": "healthy",
            "version": "v1.0.0",
            "endpoint": "POST /api/analytics/paycheck-prediction",
        }
        self.wfile.write(json.dumps(response).encode())

    def _send_error(self, status_code: int, message: str) -> None:
        """Send error response"""
        self._set_headers(status_code)
        error_response = {"error": message}
        self.wfile.write(json.dumps(error_response).encode())
