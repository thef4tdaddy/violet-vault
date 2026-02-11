from datetime import datetime, timedelta

import pytest

from api.autofunding.conditions import (
    check_payday_schedule,
    check_schedule,
    evaluate_conditions,
    evaluate_date_range_condition,
    evaluate_transaction_amount_condition,
    should_rule_execute,
)
from api.autofunding.models import (
    AutoFundingContext,
    AutoFundingContextData,
    AutoFundingRule,
    Condition,
    EnvelopeData,
    RuleConfig,
)


@pytest.fixture
def mock_context() -> AutoFundingContext:
    return AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            envelopes=[
                EnvelopeData(id="env-1", currentBalance=500.0, name="Food"),
                EnvelopeData(id="env-2", currentBalance=0.0, name="Rent"),
            ],
            newIncomeAmount=2000.0,
        ),
        trigger="manual",
        currentDate="2024-01-15T12:00:00Z",
    )


def test_should_rule_execute_disabled(mock_context: AutoFundingContext) -> None:
    rule = AutoFundingRule(
        id="rule-1",
        name="Test",
        type="fixed_amount",
        trigger="manual",
        priority=1,
        enabled=False,
        createdAt="2024-01-01T00:00:00Z",
        config=RuleConfig(
            sourceType="unassigned", targetType="envelope", targetId="env-1", amount=100
        ),
    )
    assert should_rule_execute(rule, mock_context) is False


def test_should_rule_execute_trigger_mismatch(mock_context: AutoFundingContext) -> None:
    rule = AutoFundingRule(
        id="rule-1",
        name="Test",
        type="fixed_amount",
        trigger="weekly",
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00Z",
        config=RuleConfig(
            sourceType="unassigned", targetType="envelope", targetId="env-1", amount=100
        ),
    )
    # Context trigger is 'manual', rule is 'weekly' -> Mismatch
    assert should_rule_execute(rule, mock_context) is False


def test_evaluate_conditions_balance_less_than(mock_context: AutoFundingContext) -> None:
    cond = Condition(type="balance_less_than", envelopeId="env-1", value=600.0)
    assert evaluate_conditions([cond], mock_context) is True

    cond_fail = Condition(type="balance_less_than", envelopeId="env-1", value=400.0)
    assert evaluate_conditions([cond_fail], mock_context) is False


def test_evaluate_conditions_unassigned_above(mock_context: AutoFundingContext) -> None:
    cond = Condition(type="unassigned_above", value=500.0)
    assert evaluate_conditions([cond], mock_context) is True

    cond_fail = Condition(type="unassigned_above", value=1500.0)
    assert evaluate_conditions([cond_fail], mock_context) is False


def test_evaluate_date_range_condition() -> None:
    cond = Condition(
        type="date_range",
        startDate="2024-01-01T00:00:00Z",
        endDate="2024-01-31T23:59:59Z",
        value=0,
    )
    assert evaluate_date_range_condition(cond, "2024-01-15T12:00:00Z") is True
    assert evaluate_date_range_condition(cond, "2024-02-01T00:00:00Z") is False


def test_evaluate_transaction_amount_condition(mock_context: AutoFundingContext) -> None:
    # Context has newIncomeAmount = 2000.0
    cond = Condition(type="transaction_amount", operator="greater_than", value=1500.0)
    assert evaluate_transaction_amount_condition(cond, mock_context) is True

    cond_equals = Condition(type="transaction_amount", operator="equals", value=2000.0)
    assert evaluate_transaction_amount_condition(cond_equals, mock_context) is True


def test_check_schedule() -> None:
    # Last executed 10 days ago, weekly trigger -> True
    now = datetime.now()
    last = (now - timedelta(days=10)).isoformat()
    assert check_schedule("weekly", last, now.isoformat()) is True

    # Last executed 3 days ago, weekly trigger -> False
    last_recent = (now - timedelta(days=3)).isoformat()
    assert check_schedule("weekly", last_recent, now.isoformat()) is False


def test_check_payday_schedule() -> None:
    last = datetime.now() - timedelta(days=15)
    now = datetime.now()
    assert check_payday_schedule(last, now) is True

    last_recent = datetime.now() - timedelta(days=5)
    assert check_payday_schedule(last_recent, now) is False


def test_should_rule_execute_schedule_check(mock_context: AutoFundingContext) -> None:
    rule = AutoFundingRule(
        id="rule-1",
        name="Test",
        type="fixed_amount",
        trigger="monthly",
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00Z",
        lastExecuted="2024-01-10T12:00:00Z",
        config=RuleConfig(
            sourceType="unassigned", targetType="envelope", targetId="env-1", amount=100
        ),
    )
    # mock_context date is 2024-01-15 -> Only 5 days since last executed. Monthly needs 28.
    assert should_rule_execute(rule, mock_context) is False


def test_evaluate_conditions_missing_current_date(mock_context: AutoFundingContext) -> None:
    mock_context.currentDate = None
    cond = Condition(type="balance_less_than", envelopeId="env-1", value=600.0)
    with pytest.raises(ValueError, match="currentDate is required"):
        evaluate_conditions([cond], mock_context)


def test_evaluate_conditions_empty_list(mock_context: AutoFundingContext) -> None:
    assert evaluate_conditions([], mock_context) is True


def test_evaluate_conditions_envelope_not_found(mock_context: AutoFundingContext) -> None:
    cond = Condition(type="balance_less_than", envelopeId="non-existent", value=600.0)
    assert evaluate_conditions([cond], mock_context) is False


def test_evaluate_conditions_unassigned_cash_paths(mock_context: AutoFundingContext) -> None:
    # BALANCE_LESS_THAN for unassigned
    cond_less = Condition(type="balance_less_than", value=1500.0)
    assert evaluate_conditions([cond_less], mock_context) is True

    cond_less_fail = Condition(type="balance_less_than", value=500.0)
    assert evaluate_conditions([cond_less_fail], mock_context) is False

    # BALANCE_GREATER_THAN for unassigned
    cond_greater = Condition(type="balance_greater_than", value=500.0)
    assert evaluate_conditions([cond_greater], mock_context) is True

    cond_greater_fail = Condition(type="balance_greater_than", value=1500.0)
    assert evaluate_conditions([cond_greater_fail], mock_context) is False


def test_evaluate_conditions_envelope_balance_greater(mock_context: AutoFundingContext) -> None:
    cond = Condition(type="balance_greater_than", envelopeId="env-1", value=400.0)
    assert evaluate_conditions([cond], mock_context) is True

    cond_fail = Condition(type="balance_greater_than", envelopeId="env-1", value=600.0)
    assert evaluate_conditions([cond_fail], mock_context) is False

    # Missing envelope
    cond_missing = Condition(type="balance_greater_than", envelopeId="missing", value=400.0)
    assert evaluate_conditions([cond_missing], mock_context) is False


def test_evaluate_date_range_missing_dates() -> None:
    cond = Condition(type="date_range", value=0)
    assert evaluate_date_range_condition(cond, "2024-01-15T12:00:00Z") is True


def test_evaluate_date_range_invalid_format() -> None:
    cond = Condition(type="date_range", startDate="invalid", endDate="invalid", value=0)
    assert evaluate_date_range_condition(cond, "2024-01-15T12:00:00Z") is True


def test_evaluate_transaction_amount_condition_edge_cases(
    mock_context: AutoFundingContext,
) -> None:
    # Income is None
    mock_context.data.newIncomeAmount = None
    cond = Condition(type="transaction_amount", operator="greater_than", value=100.0)
    assert evaluate_transaction_amount_condition(cond, mock_context) is False

    # Other operators
    mock_context.data.newIncomeAmount = 500.0
    assert (
        evaluate_transaction_amount_condition(
            Condition(type="transaction_amount", operator="less_than", value=600.0), mock_context
        )
        is True
    )
    assert (
        evaluate_transaction_amount_condition(
            Condition(type="transaction_amount", operator="less_than_or_equal", value=500.0),
            mock_context,
        )
        is True
    )
    assert (
        evaluate_transaction_amount_condition(
            Condition(type="transaction_amount", operator="greater_than_or_equal", value=500.0),
            mock_context,
        )
        is True
    )
    assert (
        evaluate_transaction_amount_condition(
            Condition(type="transaction_amount", operator="unknown", value=500.0), mock_context
        )
        is True
    )


def test_evaluate_conditions_date_and_transaction(mock_context: AutoFundingContext) -> None:
    # Test date_range and transaction_amount through evaluate_conditions
    cond_date = Condition(
        type="date_range",
        startDate="2024-01-01T00:00:00Z",
        endDate="2024-01-31T23:59:59Z",
        value=0,
    )
    cond_tx = Condition(type="transaction_amount", operator="greater_than", value=1500.0)

    assert evaluate_conditions([cond_date, cond_tx], mock_context) is True

    # Fail one
    cond_tx_fail = Condition(type="transaction_amount", operator="less_than", value=1500.0)
    assert evaluate_conditions([cond_date, cond_tx_fail], mock_context) is False


def test_check_schedule_types() -> None:
    now = datetime(2024, 1, 30)
    last_15_days = (now - timedelta(days=15)).isoformat()
    last_5_days = (now - timedelta(days=5)).isoformat()

    assert check_schedule("biweekly", last_15_days, now.isoformat()) is True
    assert check_schedule("biweekly", last_5_days, now.isoformat()) is False

    assert check_schedule("monthly", last_15_days, now.isoformat()) is False
    assert (
        check_schedule("monthly", (now - timedelta(days=30)).isoformat(), now.isoformat()) is True
    )

    # No last executed
    assert check_schedule("weekly", None, now.isoformat()) is True
