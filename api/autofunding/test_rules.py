"""
Unit tests for rules.py
Tests rule processing, validation, and funding calculations
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
from api.autofunding.rules import (
    RULE_TYPES,
    TRIGGER_TYPES,
    calculate_funding_amount,
    calculate_priority_fill_amount,
    get_base_amount_for_percentage,
    sort_rules_by_priority,
)


def test_calculate_funding_amount_fixed_amount() -> None:
    """Test fixed amount calculation"""
    rule = AutoFundingRule(
        id="rule1",
        name="Fixed Amount Rule",
        description="Test fixed amount",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
            amount=200.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=2500.0,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_funding_amount(rule, context)
    assert amount == 200.0
    print("✓ test_calculate_funding_amount_fixed_amount passed")


def test_calculate_funding_amount_fixed_amount_limited_by_cash() -> None:
    """Test fixed amount limited by available cash"""
    rule = AutoFundingRule(
        id="rule1",
        name="Fixed Amount Rule",
        description="Test fixed amount",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
            amount=500.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=100.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_funding_amount(rule, context)
    assert amount == 100.0  # Limited by available cash
    print("✓ test_calculate_funding_amount_fixed_amount_limited_by_cash passed")


def test_calculate_funding_amount_percentage() -> None:
    """Test percentage calculation"""
    rule = AutoFundingRule(
        id="rule2",
        name="Percentage Rule",
        description="Test percentage",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
            percentage=30.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_funding_amount(rule, context)
    assert amount == 300.0  # 30% of 1000
    print("✓ test_calculate_funding_amount_percentage passed")


def test_calculate_funding_amount_priority_fill() -> None:
    """Test priority fill calculation"""
    envelope = EnvelopeData(
        id="env1",
        name="Rent",
        currentBalance=800.0,
        monthlyAmount=1200.0,
    )

    rule = AutoFundingRule(
        id="rule3",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_funding_amount(rule, context)
    assert amount == 400.0  # 1200 - 800 = 400 needed
    print("✓ test_calculate_funding_amount_priority_fill passed")


def test_calculate_funding_amount_split_remainder() -> None:
    """Test split remainder calculation"""
    rule = AutoFundingRule(
        id="rule4",
        name="Split Remainder Rule",
        description="Test split remainder",
        type=RULE_TYPES["SPLIT_REMAINDER"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="multiple",
            targetIds=["env1", "env2"],
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=500.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_funding_amount(rule, context)
    assert amount == 500.0  # Returns all unassigned cash
    print("✓ test_calculate_funding_amount_split_remainder passed")


def test_calculate_funding_amount_conditional_type() -> None:
    """Test conditional type (not yet implemented, returns 0)"""
    rule = AutoFundingRule(
        id="rule5",
        name="Conditional Rule",
        description="Test conditional type",
        type=RULE_TYPES["CONDITIONAL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_funding_amount(rule, context)
    assert amount == 0.0  # Conditional type not yet implemented in calculate_funding_amount
    print("✓ test_calculate_funding_amount_conditional_type passed")


def test_get_base_amount_for_percentage_unassigned() -> None:
    """Test base amount from unassigned cash"""
    rule = AutoFundingRule(
        id="rule1",
        name="Test Rule",
        description="Test",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
            percentage=50.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=2500.0,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    base_amount = get_base_amount_for_percentage(rule, context)
    assert base_amount == 1000.0
    print("✓ test_get_base_amount_for_percentage_unassigned passed")


def test_get_base_amount_for_percentage_envelope() -> None:
    """Test base amount from envelope balance"""
    envelope = EnvelopeData(
        id="env1",
        name="Savings",
        currentBalance=500.0,
        monthlyAmount=1000.0,
    )

    rule = AutoFundingRule(
        id="rule1",
        name="Test Rule",
        description="Test",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="envelope",
            sourceId="env1",
            targetType="envelope",
            targetId="env2",
            percentage=20.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    base_amount = get_base_amount_for_percentage(rule, context)
    assert base_amount == 500.0
    print("✓ test_get_base_amount_for_percentage_envelope passed")


def test_get_base_amount_for_percentage_envelope_not_found() -> None:
    """Test base amount when envelope is not found"""
    rule = AutoFundingRule(
        id="rule1",
        name="Test Rule",
        description="Test",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="envelope",
            sourceId="nonexistent",
            targetType="envelope",
            targetId="env2",
            percentage=20.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    base_amount = get_base_amount_for_percentage(rule, context)
    assert base_amount == 0.0
    print("✓ test_get_base_amount_for_percentage_envelope_not_found passed")


def test_get_base_amount_for_percentage_envelope_no_source_id() -> None:
    """Test base amount when envelope sourceType but no sourceId"""
    rule = AutoFundingRule(
        id="rule1",
        name="Test Rule",
        description="Test",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="envelope",
            sourceId=None,  # No source ID
            targetType="envelope",
            targetId="env2",
            percentage=20.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    base_amount = get_base_amount_for_percentage(rule, context)
    assert base_amount == 0.0
    print("✓ test_get_base_amount_for_percentage_envelope_no_source_id passed")


def test_get_base_amount_for_percentage_envelope_none_balance() -> None:
    """Test base amount when envelope has None balance"""
    envelope = EnvelopeData(
        id="env1",
        name="Savings",
        currentBalance=None,
        monthlyAmount=1000.0,
    )

    rule = AutoFundingRule(
        id="rule1",
        name="Test Rule",
        description="Test",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="envelope",
            sourceId="env1",
            targetType="envelope",
            targetId="env2",
            percentage=20.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    base_amount = get_base_amount_for_percentage(rule, context)
    assert base_amount == 0.0
    print("✓ test_get_base_amount_for_percentage_envelope_none_balance passed")


def test_get_base_amount_for_percentage_income() -> None:
    """Test base amount from income"""
    rule = AutoFundingRule(
        id="rule1",
        name="Test Rule",
        description="Test",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="income",
            targetType="envelope",
            targetId="env1",
            percentage=30.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=2500.0,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    base_amount = get_base_amount_for_percentage(rule, context)
    assert base_amount == 2500.0
    print("✓ test_get_base_amount_for_percentage_income passed")


def test_get_base_amount_for_percentage_income_none() -> None:
    """Test base amount from income when None, falls back to unassigned"""
    rule = AutoFundingRule(
        id="rule1",
        name="Test Rule",
        description="Test",
        type=RULE_TYPES["PERCENTAGE"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="income",
            targetType="envelope",
            targetId="env1",
            percentage=30.0,
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    base_amount = get_base_amount_for_percentage(rule, context)
    assert base_amount == 1000.0  # Falls back to unassigned cash
    print("✓ test_get_base_amount_for_percentage_income_none passed")





def test_calculate_priority_fill_amount_success() -> None:
    """Test priority fill with valid target envelope"""
    envelope = EnvelopeData(
        id="env1",
        name="Rent",
        currentBalance=800.0,
        monthlyAmount=1200.0,
    )

    rule = AutoFundingRule(
        id="rule1",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_priority_fill_amount(rule, context)
    assert amount == 400.0  # 1200 - 800 = 400
    print("✓ test_calculate_priority_fill_amount_success passed")


def test_calculate_priority_fill_amount_no_target_id() -> None:
    """Test priority fill with no target ID returns 0"""
    rule = AutoFundingRule(
        id="rule1",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId=None,  # No target ID
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_priority_fill_amount(rule, context)
    assert amount == 0.0
    print("✓ test_calculate_priority_fill_amount_no_target_id passed")


def test_calculate_priority_fill_amount_envelope_not_found() -> None:
    """Test priority fill with nonexistent envelope returns 0"""
    rule = AutoFundingRule(
        id="rule1",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="nonexistent",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_priority_fill_amount(rule, context)
    assert amount == 0.0
    print("✓ test_calculate_priority_fill_amount_envelope_not_found passed")


def test_calculate_priority_fill_amount_limited_by_cash() -> None:
    """Test priority fill limited by available cash"""
    envelope = EnvelopeData(
        id="env1",
        name="Rent",
        currentBalance=100.0,
        monthlyAmount=1200.0,
    )

    rule = AutoFundingRule(
        id="rule1",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=500.0,  # Less than needed (1100)
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_priority_fill_amount(rule, context)
    assert amount == 500.0  # Limited by available cash
    print("✓ test_calculate_priority_fill_amount_limited_by_cash passed")


def test_calculate_priority_fill_amount_already_full() -> None:
    """Test priority fill when envelope is already full"""
    envelope = EnvelopeData(
        id="env1",
        name="Rent",
        currentBalance=1200.0,
        monthlyAmount=1200.0,
    )

    rule = AutoFundingRule(
        id="rule1",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_priority_fill_amount(rule, context)
    assert amount == 0.0  # Already full
    print("✓ test_calculate_priority_fill_amount_already_full passed")


def test_calculate_priority_fill_amount_overfunded() -> None:
    """Test priority fill when envelope is overfunded (balance > monthly)"""
    envelope = EnvelopeData(
        id="env1",
        name="Rent",
        currentBalance=1500.0,
        monthlyAmount=1200.0,
    )

    rule = AutoFundingRule(
        id="rule1",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_priority_fill_amount(rule, context)
    assert amount == 0.0  # No funding needed when overfunded
    print("✓ test_calculate_priority_fill_amount_overfunded passed")


def test_calculate_priority_fill_amount_none_monthly_amount() -> None:
    """Test priority fill when monthlyAmount is None"""
    envelope = EnvelopeData(
        id="env1",
        name="Savings",
        currentBalance=500.0,
        monthlyAmount=None,
    )

    rule = AutoFundingRule(
        id="rule1",
        name="Priority Fill Rule",
        description="Test priority fill",
        type=RULE_TYPES["PRIORITY_FILL"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(
            sourceType="unassigned",
            targetType="envelope",
            targetId="env1",
        ),
    )

    context = AutoFundingContext(
        data=AutoFundingContextData(
            unassignedCash=1000.0,
            newIncomeAmount=None,
            envelopes=[envelope],
        ),
        trigger=TRIGGER_TYPES["MANUAL"],
    )

    amount = calculate_priority_fill_amount(rule, context)
    assert amount == 0.0  # Needs 0 - 500 = -500, which becomes 0
    print("✓ test_calculate_priority_fill_amount_none_monthly_amount passed")


def test_sort_rules_by_priority_basic() -> None:
    """Test basic sorting by priority"""
    rule1 = AutoFundingRule(
        id="rule1",
        name="Low Priority",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=3,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env1"),
    )

    rule2 = AutoFundingRule(
        id="rule2",
        name="High Priority",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-02T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env2"),
    )

    rule3 = AutoFundingRule(
        id="rule3",
        name="Medium Priority",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=2,
        enabled=True,
        createdAt="2024-01-03T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env3"),
    )

    sorted_rules = sort_rules_by_priority([rule1, rule2, rule3])
    assert sorted_rules[0].id == "rule2"  # priority 1
    assert sorted_rules[1].id == "rule3"  # priority 2
    assert sorted_rules[2].id == "rule1"  # priority 3
    print("✓ test_sort_rules_by_priority_basic passed")


def test_sort_rules_by_priority_with_high_priority() -> None:
    """Test sorting with high priority numbers (lower priority)"""
    rule1 = AutoFundingRule(
        id="rule1",
        name="Very Low Priority",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=100,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env1"),
    )

    rule2 = AutoFundingRule(
        id="rule2",
        name="High Priority",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-02T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env2"),
    )

    sorted_rules = sort_rules_by_priority([rule1, rule2])
    assert sorted_rules[0].id == "rule2"  # priority 1
    assert sorted_rules[1].id == "rule1"  # priority 100
    print("✓ test_sort_rules_by_priority_with_high_priority passed")


def test_sort_rules_by_priority_same_priority_uses_created_at() -> None:
    """Test sorting by createdAt when priorities are equal"""
    rule1 = AutoFundingRule(
        id="rule1",
        name="Newer Rule",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-03T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env1"),
    )

    rule2 = AutoFundingRule(
        id="rule2",
        name="Older Rule",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env2"),
    )

    sorted_rules = sort_rules_by_priority([rule1, rule2])
    assert sorted_rules[0].id == "rule2"  # Older (2024-01-01) comes first
    assert sorted_rules[1].id == "rule1"  # Newer (2024-01-03) comes second
    print("✓ test_sort_rules_by_priority_same_priority_uses_created_at passed")


def test_sort_rules_by_priority_empty_list() -> None:
    """Test sorting empty list"""
    sorted_rules = sort_rules_by_priority([])
    assert sorted_rules == []
    print("✓ test_sort_rules_by_priority_empty_list passed")


def test_sort_rules_by_priority_single_rule() -> None:
    """Test sorting single rule"""
    rule = AutoFundingRule(
        id="rule1",
        name="Only Rule",
        description="Test",
        type=RULE_TYPES["FIXED_AMOUNT"],  # type: ignore
        trigger=TRIGGER_TYPES["MANUAL"],  # type: ignore
        priority=1,
        enabled=True,
        createdAt="2024-01-01T00:00:00.000Z",
        config=RuleConfig(sourceType="unassigned", targetType="envelope", targetId="env1"),
    )

    sorted_rules = sort_rules_by_priority([rule])
    assert len(sorted_rules) == 1
    assert sorted_rules[0].id == "rule1"
    print("✓ test_sort_rules_by_priority_single_rule passed")


if __name__ == "__main__":
    print("\nRunning Rules Utility Tests...\n")
    
    # calculate_funding_amount tests
    test_calculate_funding_amount_fixed_amount()
    test_calculate_funding_amount_fixed_amount_limited_by_cash()
    test_calculate_funding_amount_percentage()
    test_calculate_funding_amount_priority_fill()
    test_calculate_funding_amount_split_remainder()
    test_calculate_funding_amount_conditional_type()
    
    # get_base_amount_for_percentage tests
    test_get_base_amount_for_percentage_unassigned()
    test_get_base_amount_for_percentage_envelope()
    test_get_base_amount_for_percentage_envelope_not_found()
    test_get_base_amount_for_percentage_envelope_no_source_id()
    test_get_base_amount_for_percentage_envelope_none_balance()
    test_get_base_amount_for_percentage_income()
    test_get_base_amount_for_percentage_income_none()
    
    # calculate_priority_fill_amount tests
    test_calculate_priority_fill_amount_success()
    test_calculate_priority_fill_amount_no_target_id()
    test_calculate_priority_fill_amount_envelope_not_found()
    test_calculate_priority_fill_amount_limited_by_cash()
    test_calculate_priority_fill_amount_already_full()
    test_calculate_priority_fill_amount_overfunded()
    test_calculate_priority_fill_amount_none_monthly_amount()
    
    # sort_rules_by_priority tests
    test_sort_rules_by_priority_basic()
    test_sort_rules_by_priority_with_high_priority()
    test_sort_rules_by_priority_same_priority_uses_created_at()
    test_sort_rules_by_priority_empty_list()
    test_sort_rules_by_priority_single_rule()
    
    print("\n✅ All rules utility tests passed!\n")
