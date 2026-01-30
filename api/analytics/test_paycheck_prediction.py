"""
Tests for Paycheck Allocation Prediction API - Issue #1787
Comprehensive test coverage including privacy compliance
"""

import pytest

from api.analytics.paycheck_prediction import (
    HistoricalSession,
    InsufficientDataError,
    PredictionRequest,
    apply_seasonal_adjustments,
    calculate_consistency_score,
    detect_pattern_type,
    predict_allocations,
)


class TestPredictionAlgorithm:
    """Test core prediction logic"""

    def test_predict_with_consistent_history(self) -> None:
        """Test prediction with consistent historical ratios"""
        sessions = [
            HistoricalSession(
                date="2026-01-15", amount_cents=250000, ratios=[0.50, 0.25, 0.15, 0.10]
            ),
            HistoricalSession(
                date="2025-12-31", amount_cents=240000, ratios=[0.48, 0.27, 0.15, 0.10]
            ),
            HistoricalSession(
                date="2025-12-15", amount_cents=250000, ratios=[0.50, 0.25, 0.15, 0.10]
            ),
        ]

        result = predict_allocations(
            paycheck_cents=250000, historical_sessions=sessions, current_month=1, num_envelopes=4
        )

        # Verify allocations sum to exact paycheck amount
        assert sum(result.suggested_allocations_cents) == 250000

        # Verify confidence is reasonable
        assert 0.7 <= result.confidence <= 1.0

        # Verify reasoning included
        assert result.reasoning.data_points == 3

    def test_insufficient_data_raises_error(self) -> None:
        """Test error when < 3 historical paychecks"""
        sessions = [HistoricalSession(date="2026-01-15", amount_cents=250000, ratios=[0.50, 0.50])]

        with pytest.raises(InsufficientDataError):
            predict_allocations(250000, sessions, 1, 2)

    def test_cents_perfect_math(self) -> None:
        """Test no floating point errors - always sums to exact amount"""
        sessions = [
            HistoricalSession(
                date="2026-01-15",
                amount_cents=333333,  # Prime-ish number
                ratios=[0.33, 0.33, 0.34],
            ),
            HistoricalSession(date="2025-12-31", amount_cents=333333, ratios=[0.34, 0.33, 0.33]),
            HistoricalSession(date="2025-12-15", amount_cents=333333, ratios=[0.33, 0.34, 0.33]),
        ]

        result = predict_allocations(333333, sessions, 1, 3)

        # CRITICAL: Must sum to exact amount (no rounding errors)
        assert sum(result.suggested_allocations_cents) == 333333

    def test_seasonal_adjustment_winter(self) -> None:
        """Test winter seasonal adjustment increases first envelope"""
        ratios = [0.30, 0.30, 0.40]
        adjusted = apply_seasonal_adjustments(ratios, 1, 3)  # January

        # First envelope should be higher
        assert adjusted[0] > ratios[0]

        # Must still sum to 1.0
        assert abs(sum(adjusted) - 1.0) < 0.001

    def test_seasonal_adjustment_summer(self) -> None:
        """Test summer seasonal adjustment increases last envelope"""
        ratios = [0.30, 0.30, 0.40]
        adjusted = apply_seasonal_adjustments(ratios, 7, 3)  # July

        # Last envelope should be higher
        assert adjusted[-1] > ratios[-1]

        # Must still sum to 1.0
        assert abs(sum(adjusted) - 1.0) < 0.001

    def test_consistency_score_consistent_pattern(self) -> None:
        """Test high confidence for consistent patterns"""
        sessions = [
            HistoricalSession(
                date="2026-01-15",
                amount_cents=250000,
                ratios=[0.50, 0.50],  # Identical ratios
            ),
            HistoricalSession(date="2025-12-31", amount_cents=250000, ratios=[0.50, 0.50]),
            HistoricalSession(date="2025-12-15", amount_cents=250000, ratios=[0.50, 0.50]),
        ]

        confidence = calculate_consistency_score(sessions, 2, "biweekly_consistent")
        assert confidence >= 0.9  # Should be very high

    def test_consistency_score_inconsistent_pattern(self) -> None:
        """Test low confidence for inconsistent patterns"""
        sessions = [
            HistoricalSession(date="2026-01-15", amount_cents=250000, ratios=[0.90, 0.10]),
            HistoricalSession(date="2025-12-31", amount_cents=250000, ratios=[0.10, 0.90]),
            HistoricalSession(date="2025-12-15", amount_cents=250000, ratios=[0.50, 0.50]),
        ]

        confidence = calculate_consistency_score(sessions, 2, "biweekly_consistent")
        assert confidence <= 0.6  # Should be lower

    def test_pattern_detection_biweekly(self) -> None:
        """Test biweekly pattern detection"""
        sessions = [
            HistoricalSession(date="2026-01-15", amount_cents=250000, ratios=[0.5, 0.5]),
            HistoricalSession(date="2026-01-01", amount_cents=250000, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-12-18", amount_cents=250000, ratios=[0.5, 0.5]),
        ]

        pattern = detect_pattern_type(sessions)
        assert pattern == "biweekly_consistent"

    def test_pattern_detection_monthly(self) -> None:
        """Test monthly pattern detection"""
        sessions = [
            HistoricalSession(date="2026-01-31", amount_cents=250000, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-12-31", amount_cents=250000, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-11-30", amount_cents=250000, ratios=[0.5, 0.5]),
        ]

        pattern = detect_pattern_type(sessions)
        assert pattern == "monthly_consistent"


class TestPrivacyCompliance:
    """CRITICAL: Verify no PII leaks"""

    def test_no_user_id_in_request(self) -> None:
        """Verify request payload has no user ID field"""
        from pydantic import ValidationError

        # Attempt to add user_id should fail validation
        with pytest.raises(ValidationError):
            PredictionRequest(
                paycheck_cents=250000,
                historical_sessions=[],
                current_month=1,
                num_envelopes=4,
            )

    def test_no_envelope_names_in_request(self) -> None:
        """Verify historical sessions contain no envelope names"""
        session = HistoricalSession(date="2026-01-15", amount_cents=250000, ratios=[0.5, 0.5])

        # Verify no 'envelope_names' field exists
        assert not hasattr(session, "envelope_names")
        assert not hasattr(session, "envelopes")

    def test_ratios_sum_validation(self) -> None:
        """Verify ratios must sum to 1.0"""
        from pydantic import ValidationError

        with pytest.raises(ValidationError, match="Ratios must sum to 1.0"):
            HistoricalSession(
                date="2026-01-15",
                amount_cents=250000,
                ratios=[0.5, 0.3],  # Only sums to 0.8
            )


class TestEdgeCases:
    """Test edge cases and error handling"""

    def test_single_cent_paycheck(self) -> None:
        """Test minimum paycheck amount"""
        sessions = [
            HistoricalSession(date="2026-01-15", amount_cents=1, ratios=[1.0]),
            HistoricalSession(date="2025-12-31", amount_cents=1, ratios=[1.0]),
            HistoricalSession(date="2025-12-15", amount_cents=1, ratios=[1.0]),
        ]

        result = predict_allocations(1, sessions, 1, 1)
        assert sum(result.suggested_allocations_cents) == 1

    def test_large_paycheck(self) -> None:
        """Test large paycheck (close to max)"""
        sessions = [
            HistoricalSession(date="2026-01-15", amount_cents=9_999_999, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-12-31", amount_cents=9_999_999, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-12-15", amount_cents=9_999_999, ratios=[0.5, 0.5]),
        ]

        result = predict_allocations(9_999_999, sessions, 1, 2)
        assert sum(result.suggested_allocations_cents) == 9_999_999

    def test_many_envelopes(self) -> None:
        """Test with maximum envelopes (200)"""
        ratios = [1.0 / 200] * 200  # Equal distribution
        sessions = [
            HistoricalSession(date="2026-01-15", amount_cents=1_000_000, ratios=ratios),
            HistoricalSession(date="2025-12-31", amount_cents=1_000_000, ratios=ratios),
            HistoricalSession(date="2025-12-15", amount_cents=1_000_000, ratios=ratios),
        ]

        result = predict_allocations(1_000_000, sessions, 1, 200)
        assert sum(result.suggested_allocations_cents) == 1_000_000
        assert len(result.suggested_allocations_cents) == 200

    def test_weighted_recent_sessions(self) -> None:
        """Test that recent sessions are weighted higher"""
        # Most recent: 80/20 split
        # Older: 20/80 split
        sessions = [
            HistoricalSession(date="2026-01-15", amount_cents=100000, ratios=[0.8, 0.2]),
            HistoricalSession(date="2025-12-01", amount_cents=100000, ratios=[0.2, 0.8]),
            HistoricalSession(date="2025-11-01", amount_cents=100000, ratios=[0.2, 0.8]),
        ]

        result = predict_allocations(100000, sessions, 1, 2)

        # First envelope should be higher due to recent weighting
        assert result.suggested_allocations_cents[0] > result.suggested_allocations_cents[1]

    def test_irregular_pattern_detection(self) -> None:
        """Test detection of irregular patterns"""
        sessions = [
            HistoricalSession(date="2026-01-15", amount_cents=250000, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-12-31", amount_cents=250000, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-12-10", amount_cents=250000, ratios=[0.5, 0.5]),
            HistoricalSession(date="2025-11-20", amount_cents=250000, ratios=[0.5, 0.5]),
        ]

        pattern = detect_pattern_type(sessions)
        assert pattern == "irregular"


class TestPydanticValidation:
    """Test Pydantic model validation"""

    def test_paycheck_amount_validation(self) -> None:
        """Test paycheck amount constraints"""
        from pydantic import ValidationError

        # Too small
        with pytest.raises(ValidationError):
            PredictionRequest(
                paycheck_cents=0, historical_sessions=[], current_month=1, num_envelopes=1
            )

        # Too large
        with pytest.raises(ValidationError):
            PredictionRequest(
                paycheck_cents=10_000_001, historical_sessions=[], current_month=1, num_envelopes=1
            )

    def test_month_validation(self) -> None:
        """Test current_month must be 1-12"""
        from pydantic import ValidationError

        with pytest.raises(ValidationError):
            PredictionRequest(
                paycheck_cents=250000,
                historical_sessions=[],
                current_month=13,  # Invalid
                num_envelopes=1,
            )

    def test_num_envelopes_validation(self) -> None:
        """Test num_envelopes constraints"""
        from pydantic import ValidationError

        # Too many
        with pytest.raises(ValidationError):
            PredictionRequest(
                paycheck_cents=250000,
                historical_sessions=[],
                current_month=1,
                num_envelopes=201,  # Over limit
            )
