"""
Auto-Funding Condition Evaluation Utilities
Port of src/utils/budgeting/autofunding/conditions.ts
Pure functions for evaluating rule conditions and schedules
"""
from typing import List, Optional
from datetime import datetime
from .models import AutoFundingRule, AutoFundingContext, Condition


# Condition Types
CONDITION_TYPES = {
    "BALANCE_LESS_THAN": "balance_less_than",
    "BALANCE_GREATER_THAN": "balance_greater_than",
    "DATE_RANGE": "date_range",
    "TRANSACTION_AMOUNT": "transaction_amount",
    "UNASSIGNED_ABOVE": "unassigned_above",
}


def should_rule_execute(
    rule: AutoFundingRule,
    context: AutoFundingContext
) -> bool:
    """
    Determines if a rule should execute based on all criteria
    
    Args:
        rule: Rule to evaluate
        context: Execution context
        
    Returns:
        True if rule should execute
    """
    if not rule.enabled:
        return False
    
    # Import here to avoid circular dependency
    from .rules import TRIGGER_TYPES
    
    # Check trigger compatibility
    if rule.trigger != context.trigger and rule.trigger != TRIGGER_TYPES["MANUAL"]:
        return False
    
    # Check schedule for time-based triggers
    time_based_triggers = [
        TRIGGER_TYPES["WEEKLY"],
        TRIGGER_TYPES["BIWEEKLY"],
        TRIGGER_TYPES["MONTHLY"],
        TRIGGER_TYPES["PAYDAY"],
    ]
    
    if rule.trigger in time_based_triggers:
        current_date = context.currentDate or datetime.now().isoformat()
        if not check_schedule(rule.trigger, rule.lastExecuted, current_date):
            return False
    
    # Check conditions for conditional rules
    if rule.type == "conditional":
        return evaluate_conditions(rule.config.conditions, context)
    
    return True


def evaluate_conditions(
    conditions: List[Condition],
    context: AutoFundingContext
) -> bool:
    """
    Evaluates all conditions for a conditional rule
    
    Args:
        conditions: List of conditions to evaluate
        context: Execution context
        
    Returns:
        True if all conditions are met
    """
    if not conditions or len(conditions) == 0:
        return True
    
    envelopes = context.data.envelopes
    unassigned_cash = context.data.unassignedCash
    current_date = context.currentDate or datetime.now().isoformat()
    
    for condition in conditions:
        condition_type = condition.type
        
        if condition_type == CONDITION_TYPES["BALANCE_LESS_THAN"]:
            if condition.envelopeId:
                envelope = next(
                    (e for e in envelopes if e.id == condition.envelopeId),
                    None
                )
                if not envelope or not (envelope.currentBalance or 0.0) < condition.value:
                    return False
            else:
                if not unassigned_cash < condition.value:
                    return False
        
        elif condition_type == CONDITION_TYPES["BALANCE_GREATER_THAN"]:
            if condition.envelopeId:
                envelope = next(
                    (e for e in envelopes if e.id == condition.envelopeId),
                    None
                )
                if not envelope or not (envelope.currentBalance or 0.0) > condition.value:
                    return False
            else:
                if not unassigned_cash > condition.value:
                    return False
        
        elif condition_type == CONDITION_TYPES["UNASSIGNED_ABOVE"]:
            if not unassigned_cash > condition.value:
                return False
        
        elif condition_type == CONDITION_TYPES["DATE_RANGE"]:
            if not evaluate_date_range_condition(condition, current_date):
                return False
        
        elif condition_type == CONDITION_TYPES["TRANSACTION_AMOUNT"]:
            if not evaluate_transaction_amount_condition(condition, context):
                return False
    
    return True


def evaluate_date_range_condition(
    condition: Condition,
    current_date: str
) -> bool:
    """
    Evaluates a date range condition
    
    Args:
        condition: Date range condition
        current_date: Current date in ISO string format
        
    Returns:
        True if current date is within range
    """
    if not condition.startDate or not condition.endDate:
        return True
    
    try:
        current = datetime.fromisoformat(current_date.replace('Z', '+00:00'))
        start = datetime.fromisoformat(condition.startDate.replace('Z', '+00:00'))
        end = datetime.fromisoformat(condition.endDate.replace('Z', '+00:00'))
        
        return start <= current <= end
    except (ValueError, AttributeError):
        return True


def evaluate_transaction_amount_condition(
    condition: Condition,
    context: AutoFundingContext
) -> bool:
    """
    Evaluates a transaction amount condition
    
    Args:
        condition: Transaction amount condition
        context: Execution context
        
    Returns:
        True if transaction amount meets condition
    """
    new_income_amount = context.data.newIncomeAmount
    
    if new_income_amount is None:
        return False
    
    operator = condition.operator or "greater_than"
    
    if operator == "greater_than":
        return new_income_amount > condition.value
    elif operator == "less_than":
        return new_income_amount < condition.value
    elif operator == "equals":
        return abs(new_income_amount - condition.value) < 0.01
    elif operator == "greater_than_or_equal":
        return new_income_amount >= condition.value
    elif operator == "less_than_or_equal":
        return new_income_amount <= condition.value
    else:
        return True


def check_schedule(
    trigger: str,
    last_executed: Optional[str],
    current_date: str
) -> bool:
    """
    Checks if a rule should execute based on schedule
    
    Args:
        trigger: Rule trigger type
        last_executed: Last execution date in ISO string format
        current_date: Current date in ISO string format
        
    Returns:
        True if rule should execute based on schedule
    """
    if not last_executed:
        return True
    
    try:
        last_executed_dt = datetime.fromisoformat(last_executed.replace('Z', '+00:00'))
        now = datetime.fromisoformat(current_date.replace('Z', '+00:00'))
        days_diff = (now - last_executed_dt).days
        
        # Import here to avoid circular dependency
        from .rules import TRIGGER_TYPES
        
        if trigger == TRIGGER_TYPES["WEEKLY"]:
            return days_diff >= 7
        elif trigger == TRIGGER_TYPES["BIWEEKLY"]:
            return days_diff >= 14
        elif trigger == TRIGGER_TYPES["MONTHLY"]:
            return days_diff >= 28  # Approximate monthly
        elif trigger == TRIGGER_TYPES["PAYDAY"]:
            return check_payday_schedule(last_executed_dt, now)
        else:
            return True
    except (ValueError, AttributeError):
        return True


def check_payday_schedule(
    last_executed: datetime,
    now: datetime
) -> bool:
    """
    Checks if it's time for payday-based execution
    
    Args:
        last_executed: Last execution date
        now: Current date
        
    Returns:
        True if payday condition is met
    """
    # Basic payday logic - could be enhanced with more sophisticated detection
    days_diff = (now - last_executed).days
    
    # Assume bi-weekly payday pattern is most common
    return days_diff >= 14
