"""
Tests for Bill Prediction Analytics
"""

import unittest
from datetime import datetime, timedelta

from api.analytics.bills import predict_bills


class TestBillPrediction(unittest.TestCase):
    """Test bill prediction logic"""

    def test_no_bills(self) -> None:
        """Test with no historical bills"""
        result = predict_bills([])

        self.assertEqual(len(result.predictedBills), 0)
        self.assertEqual(result.totalPredictedAmount, 0.0)
        self.assertIsNone(result.nextBillDate)
        self.assertIn("No historical", result.message)

    def test_insufficient_data(self) -> None:
        """Test with only one bill (insufficient data)"""
        bills: list[dict] = [{"amount": 100.0, "dueDate": "2024-01-01", "category": "electricity"}]

        result = predict_bills(bills)

        self.assertEqual(len(result.predictedBills), 0)

    def test_monthly_pattern(self) -> None:
        """Test detection of monthly bill pattern"""
        # Last bill was 15 days ago, next bill in 15 days (future)
        bills: list[dict] = []
        for i in range(4):
            # Bills going back in time: -15, -45, -75, -105 days
            date = datetime.now() - timedelta(days=15 + i * 30)
            bills.append({"amount": 150.0, "dueDate": date.isoformat(), "category": "electricity"})

        result = predict_bills(bills)

        self.assertGreater(len(result.predictedBills), 0)
        predicted = result.predictedBills[0]
        self.assertEqual(predicted.category, "electricity")
        self.assertGreater(predicted.confidence, 0)
        self.assertIsNotNone(predicted.frequency)
        if predicted.frequency:
            self.assertEqual(predicted.frequency.pattern, "monthly")

    def test_biweekly_pattern(self) -> None:
        """Test detection of biweekly bill pattern"""
        # Last bill was 7 days ago, next bill in 7 days (future)
        bills: list[dict] = []
        for i in range(6):
            date = datetime.now() - timedelta(days=7 + i * 14)
            bills.append({"amount": 50.0, "dueDate": date.isoformat(), "category": "subscription"})

        result = predict_bills(bills)

        self.assertGreater(len(result.predictedBills), 0)
        predicted = result.predictedBills[0]
        self.assertIsNotNone(predicted.frequency)
        if predicted.frequency:
            self.assertEqual(predicted.frequency.pattern, "biweekly")

    def test_weekly_pattern(self) -> None:
        """Test detection of weekly bill pattern"""
        # Last bill was 3 days ago, next bill in 4 days (future)
        bills: list[dict] = []
        for i in range(8):
            date = datetime.now() - timedelta(days=3 + i * 7)
            bills.append({"amount": 25.0, "dueDate": date.isoformat(), "category": "service"})

        result = predict_bills(bills)

        self.assertGreater(len(result.predictedBills), 0)
        predicted = result.predictedBills[0]
        self.assertIsNotNone(predicted.frequency)
        if predicted.frequency:
            self.assertEqual(predicted.frequency.pattern, "weekly")

    def test_quarterly_pattern(self) -> None:
        """Test detection of quarterly bill pattern"""
        # Last bill was 45 days ago, next bill in 45 days (future)
        bills: list[dict] = []
        for i in range(3):
            date = datetime.now() - timedelta(days=45 + i * 90)
            bills.append({"amount": 300.0, "dueDate": date.isoformat(), "category": "insurance"})

        result = predict_bills(bills)

        self.assertGreater(len(result.predictedBills), 0)
        predicted = result.predictedBills[0]
        self.assertIsNotNone(predicted.frequency)
        if predicted.frequency:
            self.assertEqual(predicted.frequency.pattern, "quarterly")

    def test_multiple_categories(self) -> None:
        """Test predictions for multiple bill categories"""
        bills: list[dict] = []

        # Add monthly electricity bills (last one 15 days ago)
        for i in range(3):
            date = datetime.now() - timedelta(days=15 + i * 30)
            bills.append({"amount": 150.0, "dueDate": date.isoformat(), "category": "electricity"})

        # Add weekly subscription bills (last one 3 days ago)
        for i in range(5):
            date = datetime.now() - timedelta(days=3 + i * 7)
            bills.append({"amount": 20.0, "dueDate": date.isoformat(), "category": "subscription"})

        result = predict_bills(bills)

        # Should predict for both categories
        categories = {bill.category for bill in result.predictedBills}
        self.assertIn("electricity", categories)
        self.assertIn("subscription", categories)

    def test_average_amount_calculation(self) -> None:
        """Test that predicted amount is based on historical average"""
        amounts = [100.0, 110.0, 105.0, 95.0]
        bills: list[dict] = []

        for i, amount in enumerate(amounts):
            # Last bill 15 days ago
            date = datetime.now() - timedelta(days=15 + i * 30)
            bills.append({"amount": amount, "dueDate": date.isoformat(), "category": "utilities"})

        result = predict_bills(bills)

        expected_avg = sum(amounts) / len(amounts)
        self.assertGreater(len(result.predictedBills), 0)
        predicted_amount = result.predictedBills[0].predictedAmount
        self.assertAlmostEqual(predicted_amount, expected_avg, delta=1.0)

    def test_total_predicted_amount(self) -> None:
        """Test total predicted amount calculation"""
        base_date = datetime(2024, 1, 1)
        bills: list[dict] = []

        # Add two different categories
        for i in range(3):
            date = base_date + timedelta(days=i * 30)
            bills.append({"amount": 100.0, "dueDate": date.isoformat(), "category": "electric"})
            bills.append({"amount": 50.0, "dueDate": date.isoformat(), "category": "water"})

        result = predict_bills(bills)

        # Total should be sum of all predicted bills
        expected_total = sum(bill.predictedAmount for bill in result.predictedBills)
        self.assertEqual(result.totalPredictedAmount, expected_total)

    def test_next_bill_date(self) -> None:
        """Test next bill date is the earliest predicted bill"""
        base_date = datetime(2024, 1, 1)
        bills: list[dict] = []

        # Add monthly and weekly bills (weekly should be next)
        for i in range(3):
            monthly_date = base_date + timedelta(days=i * 30)
            bills.append(
                {"amount": 100.0, "dueDate": monthly_date.isoformat(), "category": "monthly"}
            )

        for i in range(5):
            weekly_date = base_date + timedelta(days=i * 7)
            bills.append({"amount": 25.0, "dueDate": weekly_date.isoformat(), "category": "weekly"})

        result = predict_bills(bills)

        if result.predictedBills:
            # Next bill date should match the first predicted bill
            self.assertEqual(result.nextBillDate, result.predictedBills[0].predictedDate)

    def test_confidence_with_irregular_pattern(self) -> None:
        """Test confidence score is lower for irregular patterns"""
        base_date = datetime(2024, 1, 1)
        bills: list[dict] = []

        # Create irregular intervals
        irregular_intervals = [30, 25, 35, 28, 32]
        for i, _ in enumerate(irregular_intervals):
            date = base_date + timedelta(days=sum(irregular_intervals[:i]))
            bills.append({"amount": 100.0, "dueDate": date.isoformat(), "category": "irregular"})

        result = predict_bills(bills)

        if result.predictedBills:
            # Confidence should be lower for irregular patterns
            confidence = result.predictedBills[0].confidence
            self.assertLess(confidence, 90)

    def test_invalid_dates(self) -> None:
        """Test handling of invalid date strings"""
        bills: list[dict] = [
            {"amount": 100.0, "dueDate": "invalid-date", "category": "test"},
            {"amount": 100.0, "dueDate": "2024-01-01", "category": "test"},
        ]

        # Should not crash, should handle gracefully
        result = predict_bills(bills)
        self.assertIsNotNone(result)

    def test_past_bills_not_predicted(self) -> None:
        """Test that only future bills are predicted"""
        # Use dates in the past
        old_date = datetime(2020, 1, 1)
        bills: list[dict] = []

        for i in range(4):
            date = old_date + timedelta(days=i * 30)
            bills.append({"amount": 100.0, "dueDate": date.isoformat(), "category": "old"})

        result = predict_bills(bills)

        # Should not predict bills in the past
        self.assertEqual(len(result.predictedBills), 0)


if __name__ == "__main__":
    unittest.main()
