"""
AutoFunding API Module
"""

from .conditions import (
    evaluate_conditions,
    should_rule_execute,
)
from .models import (
    AutoFundingContext,
    AutoFundingRequest,
    AutoFundingResult,
    AutoFundingRule,
    SimulationResult,
)
from .rules import (
    calculate_funding_amount,
    calculate_priority_fill_amount,
    sort_rules_by_priority,
)
from .simulation import (
    calculate_transfer_impact,
    plan_rule_transfers,
    simulate_rule_execution,
    simulate_single_rule,
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
