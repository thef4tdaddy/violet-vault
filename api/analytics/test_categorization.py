import pytest

from api.analytics.categorization import analyze_merchant_patterns


def test_analyze_merchant_patterns_basic() -> None:
    """Test basic pattern matching"""
    transactions = [
        {"description": "Starbucks Coffee", "amount": -15.50},
        {"description": "Netflix Subscription", "amount": -14.99},
        {"description": "Uber Ride", "amount": -25.00},
        {"description": "Unknown Vendor", "amount": -100.00},  # Should be ignored
    ]

    # We need multiple transactions to meet threshold (3)
    # Let's boost the count
    transactions.extend(
        [
            {"description": "Dunkin Donuts", "amount": -10.00},
            {"description": "Local Cafe", "amount": -5.00},  # "Cafe" matches
            {"description": "Coffee Shop", "amount": -20.00},  # "Coffee" matches
        ]
    )
    # Coffee total: 15.5 + 10 + 5 + 20 = 50.5. Count: 4. Min Amount: 50. Min Count: 3.
    # Should qualify.

    suggestions = analyze_merchant_patterns(transactions, months_of_data=1)

    assert len(suggestions) >= 1
    coffee = next((s for s in suggestions if s["category"] == "Coffee & Drinks"), None)
    assert coffee is not None
    assert coffee["count"] == 4
    assert coffee["amount"] == 50.5


def test_analyze_merchant_patterns_thresholds() -> None:
    """Test that thresholds are respected"""
    transactions = [
        {"description": "Starbucks", "amount": -5.00},
        {"description": "Starbucks", "amount": -5.00},
        # Count 2, Amount 10. Below thresholds (3, 50).
    ]
    suggestions = analyze_merchant_patterns(transactions, months_of_data=1)
    assert len(suggestions) == 0


def test_analyze_merchant_patterns_months() -> None:
    """Test monthly average calculation"""
    transactions = [
        {"description": "Starbucks", "amount": -10.00},
        {"description": "Starbucks", "amount": -10.00},
        {"description": "Starbucks", "amount": -10.00},
        {"description": "Starbucks", "amount": -20.00},
        {"description": "Starbucks", "amount": -10.00},
    ]  # Total 60. Count 5.

    months = 2
    suggestions = analyze_merchant_patterns(transactions, months_of_data=months)

    assert len(suggestions) == 1
    coffee = suggestions[0]
    # expected_avg = 60 / 2 # 30
    assert coffee["monthlyAverage"] == 30.0
    # Suggested budget = avg * buffer (1.1) = 33
    assert coffee["suggestedBudget"] == 33


def test_invalid_input() -> None:
    with pytest.raises(ValueError):
        analyze_merchant_patterns([], months_of_data=0)


def test_ignore_positive_and_assigned() -> None:
    transactions = [
        {"description": "Refund Starbucks", "amount": 10.00},  # Positive income ignored
        {"description": "Starbucks", "amount": -10.00, "envelopeId": "env1"},  # Assigned ignored
    ]
    suggestions = analyze_merchant_patterns(transactions)
    assert len(suggestions) == 0
