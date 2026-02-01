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
    paycheck_frequency: str | None = Field(None, description="Optional: weekly, biweekly, monthly")

    @validator("historical_sessions")
    def validate_history(cls, v: list[HistoricalSession]) -> list[HistoricalSession]:
        if len(v) < 3:
            raise ValueError("Need at least 3 historical paychecks for prediction")
        return v

    @validator("paycheck_frequency")
    def validate_frequency(cls, v: str | None) -> str | None:
        if v is not None and v not in ["weekly", "biweekly", "monthly"]:
            raise ValueError("Frequency must be one of: weekly, biweekly, monthly")
        return v


class FrequencyDetectionRequest(BaseModel):
    """Request for smart frequency detection from amount"""

    paycheck_cents: int = Field(..., gt=0, le=10_000_000, description="Current paycheck amount")
    historical_sessions: list[HistoricalSession] = Field(..., min_length=1, max_length=50)


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
    paycheck_frequency: str | None = None,
) -> PredictionResponse:
    """
    Predict optimal allocation based on historical patterns.

    PRIVACY GUARANTEE:
    - Operates on ratios only (no identifiable data)
    - No envelope names, user IDs, or transaction descriptions
    - Ephemeral execution (no database writes)

    Args:
        paycheck_frequency: Optional hint for better predictions (weekly, biweekly, monthly)
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

    # Detect pattern (using frequency hint if provided)
    pattern_type = detect_pattern_type(sessions, paycheck_frequency)

    # Calculate confidence (boosted if frequency hint matches pattern)
    confidence = calculate_consistency_score(
        sessions, num_envelopes, pattern_type, paycheck_frequency
    )

    return PredictionResponse(
        suggested_allocations_cents=allocations_cents,
        confidence=confidence,
        reasoning=ReasoningInfo(
            based_on="historical_patterns",
            data_points=len(sessions),
            pattern_type=pattern_type,
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


def calculate_consistency_score(
    sessions: list[HistoricalSession],
    num_envelopes: int,
    pattern_type: str,
    paycheck_frequency: str | None = None,
) -> float:
    """
    Calculate confidence score based on pattern consistency.
    Higher score = more consistent historical allocations.

    Boosts confidence by 10% if paycheck_frequency hint matches detected pattern.
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
    base_confidence = min(1.0, max(0.3, 2.718 ** (-10 * avg_variance)))

    # Boost confidence if frequency hint matches detected pattern
    hint_boost = 0.0
    if paycheck_frequency and "_consistent" in pattern_type:
        hint_boost = 0.1  # 10% boost for matching hint

    # Penalty if hint conflicts with detected pattern
    hint_penalty = 0.0
    if paycheck_frequency and "_inconsistent" in pattern_type:
        hint_penalty = 0.05  # 5% penalty for conflicting hint

    confidence = base_confidence + hint_boost - hint_penalty
    confidence = min(1.0, max(0.0, confidence))  # Clamp to [0.0, 1.0]
    confidence_val: float = float(round(confidence, 2))
    return confidence_val


def detect_pattern_type(
    sessions: list[HistoricalSession], frequency_hint: str | None = None
) -> str:
    """
    Detect paycheck frequency pattern.
    Returns: 'biweekly_consistent', 'monthly_consistent', 'irregular'

    If frequency_hint is provided, uses it to validate/override detected pattern.
    Appends '_consistent' if hint matches data, '_inconsistent' if conflicting.
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

    # Auto-detect pattern from intervals
    detected = ""
    if 5 <= avg_interval <= 9:
        detected = "weekly"
    elif 12 <= avg_interval <= 16:
        detected = "biweekly"
    elif 28 <= avg_interval <= 32:
        detected = "monthly"
    else:
        detected = "irregular"

    # If user provided hint, use it with consistency flag
    if frequency_hint:
        # Check if hint matches detected pattern
        if frequency_hint == detected:
            return f"{frequency_hint}_consistent"
        elif detected == "irregular":
            # If data is irregular, trust the user's hint
            return f"{frequency_hint}_consistent"
        else:
            # Hint conflicts with data, still use hint but flag inconsistency
            return f"{frequency_hint}_inconsistent"

    # No hint provided, use auto-detection
    if detected == "irregular":
        return "irregular"
    else:
        return f"{detected}_consistent"


class AmountCluster(BaseModel):
    """Represents a cluster of paychecks with similar amounts"""

    average_amount: int = Field(..., description="Average amount in cents for this cluster")
    sessions: list[HistoricalSession] = Field(..., description="Sessions in this cluster")
    frequency: str = Field(..., description="Detected frequency (weekly, biweekly, monthly)")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in detection")


def cluster_sessions_by_amount(
    sessions: list[HistoricalSession], tolerance: float = 0.10
) -> list[AmountCluster]:
    """
    Group historical sessions by similar paycheck amounts.

    Args:
        sessions: Historical paycheck sessions
        tolerance: ±% tolerance for clustering (default 10%)

    Returns:
        List of AmountCluster objects, sorted by cluster size (largest first)

    Example:
        History: [$500, $500, $1000, $500, $1000, $1000]
        Tolerance: 10%
        Result: 2 clusters
          - Cluster 1: avg=$500, sessions=[3 items]
          - Cluster 2: avg=$1000, sessions=[3 items]
    """
    if len(sessions) < 2:
        return []

    clusters: list[AmountCluster] = []

    for session in sessions:
        # Try to find an existing cluster that matches this amount
        matched_cluster = None
        for cluster in clusters:
            # Check if amount is within tolerance of cluster average
            diff_pct = abs(session.amount_cents - cluster.average_amount) / cluster.average_amount
            if diff_pct <= tolerance:
                matched_cluster = cluster
                break

        if matched_cluster:
            # Add to existing cluster
            matched_cluster.sessions.append(session)
            # Recalculate average
            total = sum(s.amount_cents for s in matched_cluster.sessions)
            matched_cluster.average_amount = int(total / len(matched_cluster.sessions))
        else:
            # Create new cluster
            # Detect frequency pattern for this session (if possible)
            frequency = "unknown"
            confidence = 0.5

            clusters.append(
                AmountCluster(
                    average_amount=session.amount_cents,
                    sessions=[session],
                    frequency=frequency,
                    confidence=confidence,
                )
            )

    # For each cluster with 2+ sessions, detect frequency pattern
    for cluster in clusters:
        if len(cluster.sessions) >= 2:
            pattern = detect_pattern_type(cluster.sessions, None)

            # Extract frequency from pattern (e.g., "weekly_consistent" -> "weekly")
            if "_" in pattern:
                freq, consistency = pattern.split("_", 1)
                cluster.frequency = freq
                cluster.confidence = 0.85 if consistency == "consistent" else 0.6
            else:
                cluster.frequency = pattern
                cluster.confidence = 0.5
        else:
            cluster.frequency = "unknown"
            cluster.confidence = 0.3

    # Sort by cluster size (most sessions first) for better matching
    clusters.sort(key=lambda c: len(c.sessions), reverse=True)

    return clusters


class FrequencySuggestion(BaseModel):
    """Response for frequency detection from amount"""

    suggested_frequency: str = Field(
        ..., description="Suggested frequency (weekly, biweekly, monthly)"
    )
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in suggestion")
    reasoning: str = Field(..., description="Human-readable explanation")
    matched_cluster: int | None = Field(
        None, description="Average amount of matched cluster (cents)"
    )


def detect_frequency_from_amount(
    paycheck_cents: int, historical_sessions: list[HistoricalSession]
) -> FrequencySuggestion:
    """
    Smart frequency detection based on paycheck amount clustering.

    Perfect for multi-paycheck households with different frequencies:
      - $500 weekly paychecks (person A)
      - $1000 biweekly paychecks (person B)

    Args:
        paycheck_cents: Amount to match against clusters
        historical_sessions: Historical paycheck data

    Returns:
        FrequencySuggestion with frequency, confidence, and reasoning

    Example:
        Input: $520 (slightly varies from $500)
        History: [$500, $500, $1000, $500, $1000] with weekly/biweekly patterns
        Output: FrequencySuggestion(
            suggested_frequency="weekly",
            confidence=0.85,
            reasoning="Matches weekly paycheck cluster (~$500)",
            matched_cluster=500
        )
    """
    if len(historical_sessions) < 3:
        # Not enough data, return default guess
        return FrequencySuggestion(
            suggested_frequency="biweekly",
            confidence=0.3,
            reasoning="Insufficient history (need 3+ paychecks)",
            matched_cluster=None,
        )

    # Cluster sessions by amount
    clusters = cluster_sessions_by_amount(historical_sessions, tolerance=0.15)  # 15% tolerance

    if not clusters:
        return FrequencySuggestion(
            suggested_frequency="biweekly",
            confidence=0.3,
            reasoning="No patterns detected in history",
            matched_cluster=None,
        )

    # Find cluster that matches input amount
    best_match = None
    best_diff_pct = float("inf")

    for cluster in clusters:
        diff_pct = abs(paycheck_cents - cluster.average_amount) / cluster.average_amount
        if diff_pct < best_diff_pct:
            best_diff_pct = diff_pct
            best_match = cluster

    # If best match is within 15% tolerance, use it
    if best_match and best_diff_pct <= 0.15:
        # Boost confidence if cluster has many sessions
        cluster_size_boost = min(0.1, len(best_match.sessions) * 0.02)
        final_confidence = min(1.0, best_match.confidence + cluster_size_boost)

        return FrequencySuggestion(
            suggested_frequency=best_match.frequency,
            confidence=float(round(final_confidence, 2)),
            reasoning=f"Matches {best_match.frequency} paycheck cluster (~${best_match.average_amount // 100})",
            matched_cluster=best_match.average_amount,
        )

    # No close match found, return default
    return FrequencySuggestion(
        suggested_frequency="biweekly",
        confidence=0.4,
        reasoning=f"Amount doesn't match known patterns (closest: ${best_match.average_amount // 100 if best_match else 0})",
        matched_cluster=None,
    )


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
                request.paycheck_frequency,
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
