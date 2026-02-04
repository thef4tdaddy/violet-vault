import unittest
from typing import Any

from api.autofunding.models import (
    AutoFundingContext,
    AutoFundingContextData,
    AutoFundingRule,
    EnvelopeData,
    RuleConfig,
)
from api.autofunding.rules import (
    RULE_TYPES,
    TRIGGER_TYPES,
    calculate_funding_amount,
    calculate_priority_fill_amount,
    get_base_amount_for_percentage,
    sort_rules_by_priority,
)


class TestAutofundingRules(unittest.TestCase):
    def setUp(self) -> None:
        self.envelope1 = EnvelopeData(
            id="env1", name="Rent", currentBalance=500.0, monthlyAmount=1200.0
        )
        self.envelope2 = EnvelopeData(
            id="env2", name="Savings", currentBalance=100.0, monthlyAmount=500.0
        )
        self.data = AutoFundingContextData(
            envelopes=[self.envelope1, self.envelope2],
            unassignedCash=1000.0,
            newIncomeAmount=2000.0,
        )
        self.context = AutoFundingContext(
            trigger=TRIGGER_TYPES["MANUAL"], data=self.data, currentDate="2026-02-04T12:00:00Z"
        )

    def create_rule(self, **kwargs: Any) -> AutoFundingRule:
        config_data = kwargs.pop("config", {})
        # Use model_construct to bypass literal validation if sourceType/targetType are "unknown"
        config = RuleConfig.model_construct(None, **config_data)
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
        # Use model_construct to bypass literal validation for rule.type
        return AutoFundingRule.model_construct(None, **defaults)

    def test_calculate_funding_amount_fixed(self) -> None:
        rule = self.create_rule(config={"amount": 400.0})
        self.assertEqual(calculate_funding_amount(rule, self.context), 400.0)

        # Cap by unassigned cash
        self.context.data.unassignedCash = 300.0
        self.assertEqual(calculate_funding_amount(rule, self.context), 300.0)

    def test_calculate_funding_amount_percentage(self) -> None:
        rule = self.create_rule(
            type=RULE_TYPES["PERCENTAGE"], config={"percentage": 50.0, "sourceType": "income"}
        )
        # 50% of 2000 = 1000
        self.assertEqual(calculate_funding_amount(rule, self.context), 1000.0)

    def test_calculate_funding_amount_priority_fill(self) -> None:
        rule = self.create_rule(type=RULE_TYPES["PRIORITY_FILL"], config={"targetId": "env1"})
        # Needed: 1200 - 500 = 700. Available: 1000. Result: 700
        self.assertEqual(calculate_funding_amount(rule, self.context), 700.0)

    def test_calculate_funding_amount_split_remainder(self) -> None:
        rule = self.create_rule(type=RULE_TYPES["SPLIT_REMAINDER"])
        self.assertEqual(calculate_funding_amount(rule, self.context), 1000.0)

    def test_calculate_funding_amount_unknown(self) -> None:
        rule = self.create_rule(type="unknown")  # type: ignore
        self.assertEqual(calculate_funding_amount(rule, self.context), 0.0)

    def test_get_base_amount_unassigned(self) -> None:
        rule = self.create_rule(config={"sourceType": "unassigned"})
        self.assertEqual(get_base_amount_for_percentage(rule, self.context), 1000.0)

    def test_get_base_amount_envelope(self) -> None:
        rule = self.create_rule(config={"sourceType": "envelope", "sourceId": "env1"})
        self.assertEqual(get_base_amount_for_percentage(rule, self.context), 500.0)

        rule.config.sourceId = "missing"
        self.assertEqual(get_base_amount_for_percentage(rule, self.context), 0.0)

        rule.config.sourceId = None
        self.assertEqual(get_base_amount_for_percentage(rule, self.context), 0.0)

    def test_get_base_amount_income(self) -> None:
        rule = self.create_rule(config={"sourceType": "income"})
        self.assertEqual(get_base_amount_for_percentage(rule, self.context), 2000.0)

        self.context.data.newIncomeAmount = None
        self.assertEqual(get_base_amount_for_percentage(rule, self.context), 1000.0)

    def test_get_base_amount_unknown(self) -> None:
        rule = self.create_rule(config={"sourceType": "weird"})  # type: ignore
        self.assertEqual(get_base_amount_for_percentage(rule, self.context), 1000.0)

    def test_calculate_priority_fill_no_target(self) -> None:
        rule = self.create_rule(type=RULE_TYPES["PRIORITY_FILL"], config={})
        self.assertEqual(calculate_priority_fill_amount(rule, self.context), 0.0)

    def test_calculate_priority_fill_missing_envelope(self) -> None:
        rule = self.create_rule(type=RULE_TYPES["PRIORITY_FILL"], config={"targetId": "missing"})
        self.assertEqual(calculate_priority_fill_amount(rule, self.context), 0.0)

    def test_sort_rules_by_priority(self) -> None:
        r1 = self.create_rule(id="r1", priority=20, createdAt="2026-01-02T00:00:00Z")
        r2 = self.create_rule(id="r2", priority=10, createdAt="2026-01-01T00:00:00Z")
        r3 = self.create_rule(id="r3", priority=10, createdAt="2026-01-03T00:00:00Z")

        sorted_rules = sort_rules_by_priority([r1, r2, r3])
        self.assertEqual(sorted_rules[0].id, "r2")  # Priority 10, earliest
        self.assertEqual(sorted_rules[1].id, "r3")  # Priority 10, later
        self.assertEqual(sorted_rules[2].id, "r1")  # Priority 20


if __name__ == "__main__":
    unittest.main()
