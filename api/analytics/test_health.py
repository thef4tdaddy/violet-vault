"""
Tests for Budget Health Score Analytics
"""

import unittest

from api.analytics.health import calculate_budget_health


class TestBudgetHealth(unittest.TestCase):
    """Test budget health score calculations"""

    def test_excellent_health(self) -> None:
        """Test excellent financial health (Grade A)"""
        metrics: dict = {
            "spendingVelocityScore": 95,
            "billCoverageRatio": 1.5,
            "savingsRate": 0.25,
            "envelopeUtilization": 0.80,
        }

        result = calculate_budget_health(metrics)

        self.assertGreaterEqual(result.overallScore, 90)
        self.assertEqual(result.grade, "A")
        self.assertGreater(len(result.strengths), 0)
        self.assertEqual(len(result.concerns), 0)

    def test_good_health(self) -> None:
        """Test good financial health (Grade B)"""
        metrics: dict = {
            "spendingVelocityScore": 75,
            "billCoverageRatio": 1.2,
            "savingsRate": 0.15,
            "envelopeUtilization": 0.75,
        }

        result = calculate_budget_health(metrics)

        self.assertGreaterEqual(result.overallScore, 80)
        self.assertLess(result.overallScore, 90)
        self.assertEqual(result.grade, "B")

    def test_fair_health(self) -> None:
        """Test fair financial health (Grade C)"""
        metrics: dict = {
            "spendingVelocityScore": 65,
            "billCoverageRatio": 0.9,
            "savingsRate": 0.08,
            "envelopeUtilization": 0.85,
        }

        result = calculate_budget_health(metrics)

        self.assertGreaterEqual(result.overallScore, 70)
        self.assertLess(result.overallScore, 80)
        self.assertEqual(result.grade, "C")

    def test_poor_health(self) -> None:
        """Test poor financial health (Grade D)"""
        metrics: dict = {
            "spendingVelocityScore": 60,
            "billCoverageRatio": 0.75,
            "savingsRate": 0.04,
            "envelopeUtilization": 0.92,
        }

        result = calculate_budget_health(metrics)

        self.assertGreaterEqual(result.overallScore, 60)
        self.assertLess(result.overallScore, 70)
        self.assertEqual(result.grade, "D")

    def test_failing_health(self) -> None:
        """Test failing financial health (Grade F)"""
        metrics: dict = {
            "spendingVelocityScore": 30,
            "billCoverageRatio": 0.5,
            "savingsRate": -0.05,
            "envelopeUtilization": 1.2,
        }

        result = calculate_budget_health(metrics)

        self.assertLess(result.overallScore, 60)
        self.assertEqual(result.grade, "F")
        self.assertGreater(len(result.concerns), 0)
        self.assertGreater(len(result.recommendations), 0)

    def test_breakdown_components(self) -> None:
        """Test that breakdown contains all components"""
        metrics: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.10,
            "envelopeUtilization": 0.75,
        }

        result = calculate_budget_health(metrics)

        breakdown = result.breakdown
        self.assertIsNotNone(breakdown.spendingPace)
        self.assertIsNotNone(breakdown.billPreparedness)
        self.assertIsNotNone(breakdown.savingsHealth)
        self.assertIsNotNone(breakdown.budgetUtilization)

        # All scores should be 0-100
        self.assertGreaterEqual(breakdown.spendingPace, 0)
        self.assertLessEqual(breakdown.spendingPace, 100)
        self.assertGreaterEqual(breakdown.billPreparedness, 0)
        self.assertLessEqual(breakdown.billPreparedness, 100)
        self.assertGreaterEqual(breakdown.savingsHealth, 0)
        self.assertLessEqual(breakdown.savingsHealth, 100)
        self.assertGreaterEqual(breakdown.budgetUtilization, 0)
        self.assertLessEqual(breakdown.budgetUtilization, 100)

    def test_spending_pace_component(self) -> None:
        """Test spending pace component calculation"""
        metrics_good: dict = {
            "spendingVelocityScore": 90,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.10,
            "envelopeUtilization": 0.80,
        }

        result_good = calculate_budget_health(metrics_good)
        self.assertEqual(result_good.breakdown.spendingPace, 90)

        metrics_poor: dict = {
            "spendingVelocityScore": 40,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.10,
            "envelopeUtilization": 0.80,
        }

        result_poor = calculate_budget_health(metrics_poor)
        self.assertEqual(result_poor.breakdown.spendingPace, 40)

    def test_bill_preparedness_component(self) -> None:
        """Test bill preparedness component calculation"""
        # Excellent coverage
        metrics_excellent: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.5,
            "savingsRate": 0.10,
            "envelopeUtilization": 0.80,
        }
        result_excellent = calculate_budget_health(metrics_excellent)
        self.assertEqual(result_excellent.breakdown.billPreparedness, 100)

        # Poor coverage
        metrics_poor: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 0.6,
            "savingsRate": 0.10,
            "envelopeUtilization": 0.80,
        }
        result_poor = calculate_budget_health(metrics_poor)
        self.assertLess(result_poor.breakdown.billPreparedness, 60)

    def test_savings_health_component(self) -> None:
        """Test savings health component calculation"""
        # Excellent savings (20%+)
        metrics_excellent: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.25,
            "envelopeUtilization": 0.80,
        }
        result_excellent = calculate_budget_health(metrics_excellent)
        self.assertEqual(result_excellent.breakdown.savingsHealth, 100)

        # No savings
        metrics_none: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.0,
            "envelopeUtilization": 0.80,
        }
        result_none = calculate_budget_health(metrics_none)
        self.assertEqual(result_none.breakdown.savingsHealth, 0)

        # Negative savings (debt)
        metrics_negative: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.0,
            "savingsRate": -0.10,
            "envelopeUtilization": 0.80,
        }
        result_negative = calculate_budget_health(metrics_negative)
        self.assertEqual(result_negative.breakdown.savingsHealth, 0)

    def test_utilization_component(self) -> None:
        """Test budget utilization component calculation"""
        # Optimal utilization (70-90%)
        metrics_optimal: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.10,
            "envelopeUtilization": 0.80,
        }
        result_optimal = calculate_budget_health(metrics_optimal)
        self.assertEqual(result_optimal.breakdown.budgetUtilization, 100)

        # Under-utilization
        metrics_under: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.10,
            "envelopeUtilization": 0.50,
        }
        result_under = calculate_budget_health(metrics_under)
        self.assertLess(result_under.breakdown.budgetUtilization, 100)

        # Over-utilization
        metrics_over: dict = {
            "spendingVelocityScore": 80,
            "billCoverageRatio": 1.0,
            "savingsRate": 0.10,
            "envelopeUtilization": 1.2,
        }
        result_over = calculate_budget_health(metrics_over)
        self.assertLess(result_over.breakdown.budgetUtilization, 100)

    def test_recommendations_generated(self) -> None:
        """Test that recommendations are generated for poor scores"""
        metrics_poor: dict = {
            "spendingVelocityScore": 30,
            "billCoverageRatio": 0.6,
            "savingsRate": 0.02,
            "envelopeUtilization": 1.1,
        }

        result = calculate_budget_health(metrics_poor)

        # Should have multiple recommendations
        self.assertGreater(len(result.recommendations), 2)
        self.assertGreater(len(result.concerns), 2)

    def test_strengths_identified(self) -> None:
        """Test that strengths are identified for good scores"""
        metrics_good: dict = {
            "spendingVelocityScore": 90,
            "billCoverageRatio": 1.5,
            "savingsRate": 0.20,
            "envelopeUtilization": 0.80,
        }

        result = calculate_budget_health(metrics_good)

        # Should have multiple strengths
        self.assertGreater(len(result.strengths), 2)
        self.assertEqual(len(result.concerns), 0)

    def test_summary_message(self) -> None:
        """Test that summary message is appropriate for grade"""
        for grade in ["A", "B", "C", "D", "F"]:
            if grade == "A":
                metrics: dict = {
                    "spendingVelocityScore": 95,
                    "billCoverageRatio": 1.5,
                    "savingsRate": 0.25,
                    "envelopeUtilization": 0.80,
                }
            elif grade == "B":
                metrics = {
                    "spendingVelocityScore": 75,
                    "billCoverageRatio": 1.2,
                    "savingsRate": 0.15,
                    "envelopeUtilization": 0.75,
                }
            elif grade == "C":
                metrics = {
                    "spendingVelocityScore": 65,
                    "billCoverageRatio": 0.9,
                    "savingsRate": 0.08,
                    "envelopeUtilization": 0.85,
                }
            elif grade == "D":
                metrics = {
                    "spendingVelocityScore": 60,
                    "billCoverageRatio": 0.75,
                    "savingsRate": 0.04,
                    "envelopeUtilization": 0.92,
                }
            else:  # F
                metrics = {
                    "spendingVelocityScore": 30,
                    "billCoverageRatio": 0.5,
                    "savingsRate": -0.05,
                    "envelopeUtilization": 1.2,
                }

            result = calculate_budget_health(metrics)
            self.assertEqual(result.grade, grade)
            self.assertIsNotNone(result.summary)
            self.assertIn(str(result.overallScore), result.summary)


if __name__ == "__main__":
    unittest.main()
