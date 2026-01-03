"""
Basic tests for AutoFunding simulation logic
Run with: python -m pytest api/autofunding/test_simulation.py
"""

import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.autofunding.models import (
    AutoFundingContext,
    AutoFundingContextData,
    AutoFundingRule,
    EnvelopeData,
    RuleConfig,
)
from api.autofunding.rules import RULE_TYPES, TRIGGER_TYPES
from api.autofunding.simulation import (
    calculate_transfer_impact,
    plan_rule_transfers,
    simulate_rule_execution,
    simulate_single_rule,
)


def test_simulate_fixed_amount_rule() -> None:
    """Test simulation of a fixed amount rule"""
    envelope = EnvelopeData(id="env1", name="Groceries", currentBalance=150.0, monthlyAmount=400.0)

    rule = AutoFundingRule(
        id="rule1",
        name="Groceries Top-up",
        description="Fill groceries envelope",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        lastExecuted=None,
        executionCount=0,
        config=RuleConfig(
            sourceType="unassigned",
            sourceId=None,
            targetType="envelope",
            targetId="env1",
            targetIds=[],
            amount=200.0,
            percentage=0.0,
            conditions=[],
            scheduleConfig={},
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0, newIncomeAmount=2500.0, envelopes=[envelope]
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
        currentDate="2024-01-15T12:00:00.000Z",
    )

    result = simulate_single_rule(rule, context, 1000.0)

    assert result.success is True
    assert result.amount == 200.0
    assert len(result.plannedTransfers) == 1
    assert result.plannedTransfers[0].toEnvelopeId == "env1"
    assert result.plannedTransfers[0].amount == 200.0
    print("✓ test_simulate_fixed_amount_rule passed")


def test_simulate_priority_fill_rule() -> None:
    """Test simulation of a priority fill rule"""
    envelope = EnvelopeData(id="env2", name="Rent", currentBalance=800.0, monthlyAmount=1200.0)

    rule = AutoFundingRule(
        id="rule2",
        name="Rent Priority Fill",
        description="Fill rent to monthly amount",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=2,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        lastExecuted=None,
        executionCount=0,
        config=RuleConfig(
            sourceType="unassigned",
            sourceId=None,
            targetType="envelope",
            targetId="env2",
            targetIds=[],
            amount=0.0,
            percentage=0.0,
            conditions=[],
            scheduleConfig={},
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(unassignedCash=1000.0, envelopes=[envelope]),
        trigger=TRIGGER_TYPES["MANUAL"],
        currentDate="2024-01-15T12:00:00.000Z",
    )

    result = simulate_single_rule(rule, context, 1000.0)

    assert result.success is True
    assert result.amount == 400.0  # 1200 - 800 = 400 needed
    assert len(result.plannedTransfers) == 1
    assert result.plannedTransfers[0].toEnvelopeId == "env2"
    print("✓ test_simulate_priority_fill_rule passed")


def test_simulate_split_remainder_rule() -> None:
    """Test simulation of a split remainder rule"""
    envelopes = [
        EnvelopeData(id="env1", name="Envelope 1", currentBalance=100.0),
        EnvelopeData(id="env2", name="Envelope 2", currentBalance=200.0),
    ]

    rule = AutoFundingRule(
        id="rule3",
        name="Split Remaining",
        description="Split remaining funds",
        type=RULE_TYPES["SPLIT_REMAINDER"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=3,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        lastExecuted=None,
        executionCount=0,
        config=RuleConfig(
            sourceType="unassigned",
            sourceId=None,
            targetType="multiple",
            targetId=None,
            targetIds=["env1", "env2"],
            amount=0.0,
            percentage=0.0,
            conditions=[],
            scheduleConfig={},
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(unassignedCash=300.0, envelopes=envelopes),
        trigger=TRIGGER_TYPES["MANUAL"],
        currentDate="2024-01-15T12:00:00.000Z",
    )

    result = simulate_single_rule(rule, context, 300.0)

    assert result.success is True
    assert result.amount == 300.0
    assert len(result.plannedTransfers) == 2
    assert result.plannedTransfers[0].amount == 150.0
    assert result.plannedTransfers[1].amount == 150.0
    print("✓ test_simulate_split_remainder_rule passed")


def test_simulate_multiple_rules() -> None:
    """Test simulation of multiple rules in priority order"""
    envelopes = [
        EnvelopeData(id="env1", name="Groceries", currentBalance=150.0, monthlyAmount=400.0),
        EnvelopeData(id="env2", name="Rent", currentBalance=800.0, monthlyAmount=1200.0),
    ]

    rules = [
        AutoFundingRule(
            id="rule1",
            name="Groceries Top-up",
            description="",
            type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
            trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
            priority=1,
            enabled=True,
            createdAt="2024-01-01T00:00:00.000Z",
            lastExecuted=None,
            executionCount=0,
            config=RuleConfig(
                sourceType="unassigned",
                targetType="envelope",
                targetId="env1",
                targetIds=[],
                amount=200.0,
                percentage=0.0,
                conditions=[],
                scheduleConfig={},
            ),
        ),
        AutoFundingRule(
            id="rule2",
            name="Rent Priority Fill",
            description="",
            type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore  # type: ignore
            trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore  # type: ignore
            priority=2,
            enabled=True,
            createdAt="2024-01-01T00:00:00.000Z",
            lastExecuted=None,
            executionCount=0,
            config=RuleConfig(
                sourceType="unassigned",
                targetType="envelope",
                targetId="env2",
                targetIds=[],
                amount=0.0,
                percentage=0.0,
                conditions=[],
                scheduleConfig={},
            ),
        ),
    ]

    context = AutoFundingContext(
        data=AutoFundingContextData(unassignedCash=1000.0, envelopes=envelopes),
        trigger=TRIGGER_TYPES["MANUAL"],
        currentDate="2024-01-15T12:00:00.000Z",
    )

    result = simulate_rule_execution(rules, context)

    assert result["success"] is True
    assert result["simulation"].rulesExecuted == 2
    assert result["simulation"].totalPlanned == 600.0  # 200 + 400
    assert result["simulation"].remainingCash == 400.0  # 1000 - 600
    assert len(result["simulation"].plannedTransfers) == 2
    print("✓ test_simulate_multiple_rules passed")


def test_calculate_transfer_impact() -> None:
    """Test calculation of transfer impact"""
    envelopes = [
        EnvelopeData(id="env1", name="Groceries", currentBalance=150.0, monthlyAmount=400.0),
    ]

    context = AutoFundingContext(
        data=AutoFundingContextData(unassignedCash=1000.0, envelopes=envelopes),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    transfers = [
        plan_rule_transfers(
            AutoFundingRule(
                id="rule1",
                name="Test",
                description="",
                type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore  # type: ignore
                trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore  # type: ignore
                priority=1,
                enabled=True,
                createdAt="2024-01-01T00:00:00.000Z",
                config=RuleConfig(
                    sourceType="unassigned",
                    targetType="envelope",
                    targetId="env1",
                    targetIds=[],
                    amount=200.0,
                    percentage=0.0,
                    conditions=[],
                    scheduleConfig={},
                ),
            ),
            200.0,
        )[0]
    ]

    impact = calculate_transfer_impact(transfers, context)

    assert impact["totalTransferred"] == 200.0
    assert impact["unassignedChange"] == -200.0
    assert "env1" in impact["envelopes"]

    env1_impact = impact["envelopes"]["env1"]
    assert env1_impact["change"] == 200.0
    assert env1_impact["newBalance"] == 350.0
    assert env1_impact["currentBalance"] == 150.0
    print("✓ test_calculate_transfer_impact passed")


if __name__ == "__main__":
    print("\nRunning AutoFunding Simulation Tests...\n")
    test_simulate_fixed_amount_rule()
    test_simulate_priority_fill_rule()
    test_simulate_split_remainder_rule()
    test_simulate_multiple_rules()
    test_calculate_transfer_impact()
    print("\n✅ All tests passed!\n")
