"""
AutoFunding API Module
"""
from .models import (
    AutoFundingRequest,
    AutoFundingResult,
    AutoFundingRule,
    AutoFundingContext,
    SimulationResult,
)
from .simulation import (
    simulate_rule_execution,
    simulate_single_rule,
    plan_rule_transfers,
    calculate_transfer_impact,
)
from .rules import (
    calculate_funding_amount,
    calculate_priority_fill_amount,
    sort_rules_by_priority,
)
from .conditions import (
    should_rule_execute,
    evaluate_conditions,
)

__all__ = [
    "AutoFundingRequest",
    "AutoFundingResult",
    "AutoFundingRule",
    "AutoFundingContext",
    "SimulationResult",
    "simulate_rule_execution",
    "simulate_single_rule",
    "plan_rule_transfers",
    "calculate_transfer_impact",
    "calculate_funding_amount",
    "calculate_priority_fill_amount",
    "sort_rules_by_priority",
    "should_rule_execute",
    "evaluate_conditions",
]
