import unittest
import unittest.mock
from typing import Any

from api.autofunding.models import (
    AutoFundingContext,
    AutoFundingContextData,
    AutoFundingRule,
    EnvelopeData,
    PlannedTransfer,
    RuleConfig,
)
from api.autofunding.rules import RULE_TYPES, TRIGGER_TYPES
from api.autofunding.simulation import (
    calculate_transfer_impact,
    plan_rule_transfers,
    simulate_rule_execution,
    simulate_single_rule,
)


class TestAutofundingSimulation(unittest.TestCase):
    def setUp(self) -> None:
        self.envelope1 = EnvelopeData(
            id="env1", name="Rent", currentBalance=500.0, monthlyAmount=1200.0
        )
        self.envelope2 = EnvelopeData(
            id="env2", name="Savings", currentBalance=100.0, monthlyAmount=500.0
        )
        self.data = AutoFundingContextData(
            envelopes=[self.envelope1, self.envelope2], unassignedCash=1000.0, newIncomeAmount=500.0
        )
        self.context = AutoFundingContext(
            trigger=TRIGGER_TYPES["MANUAL"], data=self.data, currentDate="2026-02-04T12:00:00Z"
        )

    def create_rule(self, **kwargs: Any) -> AutoFundingRule:
        config_data = kwargs.pop("config", {})
        config = RuleConfig(
            sourceType=config_data.get("sourceType", "unassigned"),
            targetType=config_data.get("targetType", "multiple"),
            amount=config_data.get("amount", 0.0),
            percentage=config_data.get("percentage", 0.0),
            targetId=config_data.get("targetId"),
            targetIds=config_data.get("targetIds", []),
        )
        defaults = {
            "id": "r1",
            "name": "Test Rule",
            "type": RULE_TYPES["FIXED_AMOUNT"],
            "trigger": TRIGGER_TYPES["MANUAL"],
            "priority": 10,
            "enabled": True,
            "createdAt": "2026-01-01T00:00:00Z",
            "config": config,
        }
        defaults.update(kwargs)
        # Use model_construct to bypass strict type checking for dict unpacking
        return AutoFundingRule.model_construct(None, **defaults)

    def test_simulate_rule_execution_success(self) -> None:
        r1 = self.create_rule(id="r1", config={"amount": 200.0, "targetId": "env1"})
        r2 = self.create_rule(id="r2", config={"amount": 300.0, "targetId": "env2"})

        result = simulate_rule_execution([r1, r2], self.context)

        self.assertTrue(result["success"])
        simulation = result["simulation"]
        self.assertEqual(simulation.totalPlanned, 500.0)
        self.assertEqual(len(simulation.plannedTransfers), 2)
        self.assertEqual(simulation.remainingCash, 500.0)

    def test_simulate_rule_execution_insufficient_funds(self) -> None:
        r1 = self.create_rule(id="r1", config={"amount": 800.0, "targetId": "env1"})
        r2 = self.create_rule(id="r2", config={"amount": 400.0, "targetId": "env2"})

        result = simulate_rule_execution([r1, r2], self.context)

        simulation = result["simulation"]
        self.assertEqual(simulation.totalPlanned, 1000.0)
        self.assertEqual(simulation.remainingCash, 0.0)

    def test_simulate_rule_execution_with_error(self) -> None:
        r1 = self.create_rule(id="r1", config={"amount": 200.0, "targetId": "env1"})
        with unittest.mock.patch("api.autofunding.simulation.simulate_single_rule") as mock_sim:
            mock_sim.side_effect = [
                unittest.mock.MagicMock(success=True, amount=100.0, plannedTransfers=[]),
                Exception("Failure"),
            ]
            r2 = self.create_rule(id="r2")
            result = simulate_rule_execution([r1, r2], self.context)
            self.assertEqual(len(result["simulation"].errors), 1)

    def test_simulate_rule_execution_rule_failure_no_exception(self) -> None:
        r1 = self.create_rule(id="r1")
        with unittest.mock.patch("api.autofunding.simulation.simulate_single_rule") as mock_sim:
            mock_sim.return_value = unittest.mock.MagicMock(success=False, error="Soft Failure")
            result = simulate_rule_execution([r1], self.context)
            self.assertEqual(len(result["simulation"].errors), 1)
            self.assertEqual(result["simulation"].errors[0].error, "Soft Failure")

    def test_simulate_rule_execution_general_exception(self) -> None:
        with unittest.mock.patch("api.autofunding.simulation.sort_rules_by_priority") as mock_sort:
            mock_sort.side_effect = Exception("Fatal Error")
            result = simulate_rule_execution([], self.context)
            self.assertFalse(result["success"])
            self.assertEqual(result["error"], "Fatal Error")

    def test_simulate_single_rule_no_funds(self) -> None:
        self.context.data.unassignedCash = 0.0
        r1 = self.create_rule(id="r1", config={"amount": 200.0, "targetId": "env1"})
        result = simulate_single_rule(r1, self.context, 0.0)
        self.assertFalse(result.success)
        self.assertEqual(result.error, "No funds available")

    def test_simulate_single_rule_exception(self) -> None:
        r1 = self.create_rule(id="r1")
        with unittest.mock.patch(
            "api.autofunding.simulation.calculate_funding_amount"
        ) as mock_calc:
            mock_calc.side_effect = Exception("Calc Error")
            result = simulate_single_rule(r1, self.context, 1000.0)
            self.assertFalse(result.success)
            self.assertEqual(result.error, "Calc Error")

    def test_plan_rule_transfers_split(self) -> None:
        rule = self.create_rule(
            type=RULE_TYPES["SPLIT_REMAINDER"], config={"targetIds": ["env1", "env2"]}
        )
        transfers = plan_rule_transfers(rule, 100.0)
        self.assertEqual(len(transfers), 2)
        self.assertEqual(transfers[0].amount, 50.0)
        self.assertEqual(transfers[1].amount, 50.0)

    def test_calculate_transfer_impact(self) -> None:
        pt = PlannedTransfer(
            fromEnvelopeId="unassigned",
            toEnvelopeId="env1",
            amount=200.0,
            description="Test",
            ruleId="r1",
            ruleName="R1",
        )
        impact = calculate_transfer_impact([pt], self.context)
        self.assertEqual(impact["totalTransferred"], 200.0)
        self.assertEqual(impact["envelopes"]["env1"]["newBalance"], 700.0)
        self.assertAlmostEqual(impact["envelopes"]["env1"]["newFillPercentage"], 58.3333333)


if __name__ == "__main__":
    unittest.main()
