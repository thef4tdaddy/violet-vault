import unittest
from datetime import datetime, timedelta
from typing import Any, cast

from api.autofunding.conditions import check_schedule, evaluate_conditions, should_rule_execute
from api.autofunding.models import (
    CONDITION_TYPES,
    AutoFundingContext,
    AutoFundingContextData,
    AutoFundingRule,
    Condition,
    ConditionType,
    EnvelopeData,
    RuleConfig,
)
from api.autofunding.rules import RULE_TYPES, TRIGGER_TYPES


class TestAutofundingConditions(unittest.TestCase):
    def setUp(self) -> None:
        self.envelope = EnvelopeData(id="env1", name="Rent", currentBalance=500.0)
        self.data = AutoFundingContextData(
            envelopes=[self.envelope], unassignedCash=1000.0, newIncomeAmount=200.0
        )
        self.context = AutoFundingContext(
            trigger=TRIGGER_TYPES["MANUAL"], data=self.data, currentDate="2026-02-04T12:00:00Z"
        )

    def create_dummy_rule(self, **kwargs: Any) -> AutoFundingRule:
        config = RuleConfig(sourceType="unassigned", targetType="multiple", amount=100.0)
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
        # Use cast(Any, defaults) to satisfy Mypy with model_construct
        return AutoFundingRule.model_construct(**cast(Any, defaults))

    def test_should_rule_execute_conditional(self) -> None:
        cond = Condition(
            type=cast(ConditionType, CONDITION_TYPES["BALANCE_LESS_THAN"]),
            envelopeId="env1",
            value=600.0,
        )
        config = RuleConfig(sourceType="unassigned", targetType="multiple", conditions=[cond])
        rule = self.create_dummy_rule(type="conditional", config=config)
        self.assertTrue(should_rule_execute(rule, self.context))

    def test_should_rule_execute_disabled(self) -> None:
        rule = self.create_dummy_rule(enabled=False)
        self.assertFalse(should_rule_execute(rule, self.context))

    def test_should_rule_execute_trigger_mismatch(self) -> None:
        rule = self.create_dummy_rule(trigger=TRIGGER_TYPES["PAYDAY"])
        # Context is MANUAL, rule is PAYDAY
        self.assertFalse(should_rule_execute(rule, self.context))

    def test_should_rule_execute_manual_always_ok(self) -> None:
        rule = self.create_dummy_rule(trigger=TRIGGER_TYPES["MANUAL"])
        self.context.trigger = TRIGGER_TYPES["PAYDAY"]
        self.assertTrue(should_rule_execute(rule, self.context))

    def test_should_rule_execute_time_based_schedule(self) -> None:
        now = datetime(2026, 2, 4)
        last = (now - timedelta(days=5)).isoformat()
        rule = self.create_dummy_rule(trigger=TRIGGER_TYPES["WEEKLY"], lastExecuted=last)
        self.context.trigger = TRIGGER_TYPES["WEEKLY"]
        self.context.currentDate = now.isoformat()

        # Only 5 days since last execution, WEEKLY needs 7
        self.assertFalse(should_rule_execute(rule, self.context))

        # 8 days since last execution
        rule.lastExecuted = (now - timedelta(days=8)).isoformat()
        self.assertTrue(should_rule_execute(rule, self.context))

    def test_evaluate_conditions_missing_date(self) -> None:
        self.context.currentDate = None
        conditions = [
            Condition.model_construct(
                type=cast(Any, CONDITION_TYPES["BALANCE_LESS_THAN"]), value=1000
            )
        ]
        with self.assertRaises(ValueError):
            evaluate_conditions(conditions, self.context)

    def test_evaluate_conditions_none(self) -> None:
        self.assertTrue(evaluate_conditions([], self.context))

    def test_balance_less_than(self) -> None:
        cond = Condition.model_construct(
            type=cast(ConditionType, CONDITION_TYPES["BALANCE_LESS_THAN"]),
            envelopeId="env1",
            value=600.0,
        )
        # Envelope balance is 500
        self.assertTrue(evaluate_conditions([cond], self.context))

        cond.value = 400.0
        self.assertFalse(evaluate_conditions([cond], self.context))

        # Missing envelope
        cond.envelopeId = "missing"
        self.assertFalse(evaluate_conditions([cond], self.context))

        # Unassigned cash (1000)
        cond.envelopeId = None
        cond.value = 1100.0
        self.assertTrue(evaluate_conditions([cond], self.context))
        cond.value = 900.0
        self.assertFalse(evaluate_conditions([cond], self.context))

    def test_balance_greater_than(self) -> None:
        cond = Condition(
            type=cast(ConditionType, CONDITION_TYPES["BALANCE_GREATER_THAN"]),
            envelopeId="env1",
            value=400.0,
        )
        # Envelope balance is 500
        self.assertTrue(evaluate_conditions([cond], self.context))

        cond.value = 600.0
        self.assertFalse(evaluate_conditions([cond], self.context))

        # Missing envelope
        cond.envelopeId = "missing"
        self.assertFalse(evaluate_conditions([cond], self.context))

        # Unassigned cash (1000)
        cond.envelopeId = None
        cond.value = 900.0
        self.assertTrue(evaluate_conditions([cond], self.context))
        cond.value = 1100.0
        self.assertFalse(evaluate_conditions([cond], self.context))

    def test_unassigned_above(self) -> None:
        cond = Condition(type=cast(ConditionType, CONDITION_TYPES["UNASSIGNED_ABOVE"]), value=900.0)
        self.assertTrue(evaluate_conditions([cond], self.context))
        cond.value = 1100.0
        self.assertFalse(evaluate_conditions([cond], self.context))

    def test_date_range(self) -> None:
        now = "2026-02-04T12:00:00Z"
        cond = Condition(
            type=cast(ConditionType, CONDITION_TYPES["DATE_RANGE"]),
            startDate="2026-02-01T00:00:00Z",
            endDate="2026-02-10T00:00:00Z",
            value=0.0,
        )
        self.context.currentDate = now
        self.assertTrue(evaluate_conditions([cond], self.context))

        cond.startDate = "2026-02-05T00:00:00Z"
        self.assertFalse(evaluate_conditions([cond], self.context))

    def test_date_range_missing_dates(self) -> None:
        cond = Condition(type=cast(ConditionType, CONDITION_TYPES["DATE_RANGE"]), value=0.0)
        self.assertTrue(evaluate_conditions([cond], self.context))

    def test_date_range_invalid_format(self) -> None:
        cond = Condition(
            type=cast(ConditionType, CONDITION_TYPES["DATE_RANGE"]),
            startDate="invalid",
            endDate="invalid",
            value=0.0,
        )
        self.assertTrue(evaluate_conditions([cond], self.context))

    def test_transaction_amount(self) -> None:
        cond = Condition(
            type=cast(ConditionType, CONDITION_TYPES["TRANSACTION_AMOUNT"]),
            operator="greater_than",
            value=150.0,
        )
        # newIncomeAmount = 200
        self.assertTrue(evaluate_conditions([cond], self.context))

        cond.operator = "less_than"
        self.assertFalse(evaluate_conditions([cond], self.context))

        cond.operator = "equals"
        cond.value = 200.001
        self.assertTrue(evaluate_conditions([cond], self.context))

        cond.operator = "greater_than_or_equal"
        cond.value = 200.0
        self.assertTrue(evaluate_conditions([cond], self.context))

        cond.operator = "less_than_or_equal"
        self.assertTrue(evaluate_conditions([cond], self.context))

    def test_transaction_amount_unknown_operator(self) -> None:
        cond = Condition(
            type=cast(ConditionType, CONDITION_TYPES["TRANSACTION_AMOUNT"]),
            operator="weird",
            value=150.0,
        )
        self.assertTrue(evaluate_conditions([cond], self.context))

    def test_check_schedule_missing_last_executed(self) -> None:
        # Cast to Any to allow None for testing correctly
        self.assertTrue(
            check_schedule(
                TRIGGER_TYPES["WEEKLY"], cast(Any, None), cast(Any, self.context.currentDate)
            )
        )

    def test_check_schedule_biweekly(self) -> None:
        now = datetime(2026, 2, 4)
        last = (now - timedelta(days=13)).isoformat()
        self.assertFalse(check_schedule(TRIGGER_TYPES["BIWEEKLY"], last, now.isoformat()))
        last = (now - timedelta(days=15)).isoformat()
        self.assertTrue(check_schedule(TRIGGER_TYPES["BIWEEKLY"], last, now.isoformat()))

    def test_check_schedule_monthly(self) -> None:
        now = datetime(2026, 2, 1)
        last = (now - timedelta(days=27)).isoformat()
        self.assertFalse(check_schedule(TRIGGER_TYPES["MONTHLY"], last, now.isoformat()))
        last = (now - timedelta(days=29)).isoformat()
        self.assertTrue(check_schedule(TRIGGER_TYPES["MONTHLY"], last, now.isoformat()))

    def test_check_schedule_payday(self) -> None:
        now = datetime(2026, 2, 15)
        now_str = now.isoformat()
        # Payday bi-weekly check assumes >= 14 days
        last = (now - timedelta(days=13)).isoformat()
        self.assertFalse(check_schedule(TRIGGER_TYPES["PAYDAY"], last, now_str))
        last = (now - timedelta(days=14)).isoformat()
        self.assertTrue(check_schedule(TRIGGER_TYPES["PAYDAY"], last, now_str))

    def test_check_schedule_invalid_date(self) -> None:
        # Cast to Any to allow potentially None currentDate for testing
        self.assertTrue(
            check_schedule(TRIGGER_TYPES["WEEKLY"], "invalid", cast(Any, self.context.currentDate))
        )
        self.context.data.newIncomeAmount = None
        cond = Condition(
            type=cast(ConditionType, CONDITION_TYPES["TRANSACTION_AMOUNT"]),
            operator="greater_than",
            value=150.0,
        )
        self.assertFalse(evaluate_conditions([cond], self.context))


if __name__ == "__main__":
    unittest.main()
