"""
Auto-Funding Rules Utilities
Port of src/utils/budgeting/autofunding/rules.ts
Pure functions for rule processing and validation
"""
from typing import List
from .models import AutoFundingRule, AutoFundingContext, EnvelopeData
from .currency import round_currency, calculate_percentage_amount


# Rule Types
RULE_TYPES = {
    "FIXED_AMOUNT": "fixed_amount",
    "PERCENTAGE": "percentage",
    "CONDITIONAL": "conditional",
    "SPLIT_REMAINDER": "split_remainder",
    "PRIORITY_FILL": "priority_fill",
}

# Trigger Types
TRIGGER_TYPES = {
    "MANUAL": "manual",
    "INCOME_DETECTED": "income_detected",
    "MONTHLY": "monthly",
    "WEEKLY": "weekly",
    "BIWEEKLY": "biweekly",
    "PAYDAY": "payday",
}


def calculate_funding_amount(
    rule: AutoFundingRule,
    context: AutoFundingContext
) -> float:
    """
    Calculates the funding amount for a rule based on context
    
    Args:
        rule: The rule to calculate funding for
        context: Execution context with envelope and cash data
        
    Returns:
        Calculated funding amount
    """
    unassigned_cash = context.data.unassignedCash
    
    rule_type = rule.type
    
    if rule_type == RULE_TYPES["FIXED_AMOUNT"]:
        return min(rule.config.amount, unassigned_cash)
    
    elif rule_type == RULE_TYPES["PERCENTAGE"]:
        base_amount = get_base_amount_for_percentage(rule, context)
        return calculate_percentage_amount(base_amount, rule.config.percentage)
    
    elif rule_type == RULE_TYPES["PRIORITY_FILL"]:
        return calculate_priority_fill_amount(rule, context)
    
    elif rule_type == RULE_TYPES["SPLIT_REMAINDER"]:
        return unassigned_cash  # Return total available cash for splitting
    
    else:
        return 0.0


def get_base_amount_for_percentage(
    rule: AutoFundingRule,
    context: AutoFundingContext
) -> float:
    """
    Gets base amount for percentage calculations
    
    Args:
        rule: The rule with source configuration
        context: Execution context
        
    Returns:
        Base amount for percentage calculation
    """
    unassigned_cash = context.data.unassignedCash
    new_income_amount = context.data.newIncomeAmount
    envelopes = context.data.envelopes
    
    source_type = rule.config.sourceType
    
    if source_type == "unassigned":
        return unassigned_cash
    
    elif source_type == "envelope":
        if rule.config.sourceId:
            envelope = next(
                (e for e in envelopes if e.id == rule.config.sourceId),
                None
            )
            return envelope.currentBalance or 0.0 if envelope else 0.0
        return 0.0
    
    elif source_type == "income":
        return new_income_amount if new_income_amount is not None else unassigned_cash
    
    else:
        return unassigned_cash


def calculate_priority_fill_amount(
    rule: AutoFundingRule,
    context: AutoFundingContext
) -> float:
    """
    Calculates priority fill amount
    
    Args:
        rule: The rule with target configuration
        context: Execution context
        
    Returns:
        Amount needed to fill the target envelope
    """
    unassigned_cash = context.data.unassignedCash
    envelopes = context.data.envelopes
    
    if not rule.config.targetId:
        return 0.0
    
    target_envelope = next(
        (e for e in envelopes if e.id == rule.config.targetId),
        None
    )
    
    if not target_envelope:
        return 0.0
    
    monthly_amount = target_envelope.monthlyAmount or 0.0
    current_balance = target_envelope.currentBalance or 0.0
    needed = monthly_amount - current_balance
    
    return max(0.0, min(needed, unassigned_cash))


def sort_rules_by_priority(rules: List[AutoFundingRule]) -> List[AutoFundingRule]:
    """
    Sorts rules by priority (lower number = higher priority)
    
    Args:
        rules: List of rules to sort
        
    Returns:
        Sorted list of rules
    """
    def sort_key(rule: AutoFundingRule):
        # First by priority (lower number = higher priority)
        priority = rule.priority if rule.priority is not None else 100
        # Then by creation date (older first)
        created_at = rule.createdAt or "1970-01-01T00:00:00.000Z"
        return (priority, created_at)
    
    return sorted(rules, key=sort_key)
