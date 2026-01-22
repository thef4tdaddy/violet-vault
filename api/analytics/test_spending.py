"""
Tests for Spending Velocity Analytics
"""

import unittest

from api.analytics.spending import SpendingStats, calculate_spending_velocity


class TestSpendingVelocity(unittest.TestCase):
    """Test spending velocity calculations"""

    def test_perfect_pacing(self) -> None:
        """Test perfect spending pacing (on track with budget)"""
        stats: dict = {
            "totalSpent": 500.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 15,
            "daysRemaining": 15,
        }

        result = calculate_spending_velocity(stats)

        self.assertEqual(result.velocityScore, 100)
        self.assertEqual(result.dailyRate, 33.33)
        # Due to rounding, projected total might be slightly over
        self.assertAlmostEqual(result.projectedTotal, 1000.0, delta=1.0)
        self.assertEqual(result.severity, "success")

    def test_overspending(self) -> None:
        """Test overspending scenario"""
        stats: dict = {
            "totalSpent": 800.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 15,
            "daysRemaining": 15,
        }

        result = calculate_spending_velocity(stats)

        self.assertLess(result.velocityScore, 100)
        self.assertEqual(result.dailyRate, 53.33)
        self.assertGreater(result.projectedTotal, result.budgetAllocated)
        self.assertTrue(result.willExceedBudget)
        self.assertIsNotNone(result.daysUntilExceeded)
        self.assertIn(result.severity, ["warning", "error"])

    def test_underspending(self) -> None:
        """Test underspending scenario"""
        stats: dict = {
            "totalSpent": 200.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 15,
            "daysRemaining": 15,
        }

        result = calculate_spending_velocity(stats)

        self.assertEqual(result.velocityScore, 100)
        self.assertEqual(result.dailyRate, 13.33)
        self.assertLess(result.projectedTotal, result.budgetAllocated)
        self.assertFalse(result.willExceedBudget)
        self.assertEqual(result.severity, "success")

    def test_zero_days_elapsed(self) -> None:
        """Test with zero days elapsed (beginning of period)"""
        stats: dict = {
            "totalSpent": 0.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 1,  # Using 1 instead of 0 per model constraint
            "daysRemaining": 30,
        }

        result = calculate_spending_velocity(stats)

        self.assertEqual(result.velocityScore, 100)
        self.assertEqual(result.dailyRate, 0.0)
        self.assertFalse(result.willExceedBudget)

    def test_budget_already_exceeded(self) -> None:
        """Test when budget is already exceeded"""
        stats: dict = {
            "totalSpent": 1200.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 10,
            "daysRemaining": 20,
        }

        result = calculate_spending_velocity(stats)

        self.assertTrue(result.willExceedBudget)
        self.assertEqual(result.daysUntilExceeded, 0)
        self.assertEqual(result.severity, "error")

    def test_high_velocity_warning(self) -> None:
        """Test high spending velocity triggers warning"""
        stats: dict = {
            "totalSpent": 700.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 10,
            "daysRemaining": 20,
        }

        result = calculate_spending_velocity(stats)

        self.assertTrue(result.willExceedBudget)
        self.assertGreater(result.projectedTotal, result.budgetAllocated)
        self.assertIn("spending", result.recommendation.lower())

    def test_zero_budget(self) -> None:
        """Test with zero budget allocated"""
        stats: dict = {
            "totalSpent": 100.0,
            "budgetAllocated": 0.0,
            "daysElapsed": 10,
            "daysRemaining": 20,
        }

        result = calculate_spending_velocity(stats)

        self.assertEqual(result.velocityScore, 0)
        self.assertTrue(result.willExceedBudget)

    def test_projections_accuracy(self) -> None:
        """Test projection calculations are accurate"""
        stats: dict = {
            "totalSpent": 300.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 10,
            "daysRemaining": 20,
        }

        result = calculate_spending_velocity(stats)

        expected_daily_rate = 300.0 / 10
        expected_projected = expected_daily_rate * 30

        self.assertEqual(result.dailyRate, round(expected_daily_rate, 2))
        self.assertEqual(result.projectedTotal, round(expected_projected, 2))

    def test_days_until_exceeded_calculation(self) -> None:
        """Test days until exceeded calculation"""
        stats: dict = {
            "totalSpent": 500.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 10,
            "daysRemaining": 20,
        }

        result = calculate_spending_velocity(stats)

        # Daily rate: 50
        # Remaining budget: 500
        # Days until exceeded: 500 / 50 = 10
        self.assertEqual(result.daysUntilExceeded, 10)

    def test_severity_levels(self) -> None:
        """Test different severity levels based on velocity score"""
        # Test success severity (high score)
        stats_good: dict = {
            "totalSpent": 250.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 10,
            "daysRemaining": 20,
        }
        result_good = calculate_spending_velocity(stats_good)
        self.assertEqual(result_good.severity, "success")

        # Test error severity (low score)
        stats_bad: dict = {
            "totalSpent": 900.0,
            "budgetAllocated": 1000.0,
            "daysElapsed": 10,
            "daysRemaining": 20,
        }
        result_bad = calculate_spending_velocity(stats_bad)
        self.assertEqual(result_bad.severity, "error")


if __name__ == "__main__":
    unittest.main()
