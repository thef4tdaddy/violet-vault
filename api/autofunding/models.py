"""
Pydantic models for AutoFunding API
Mirrors the TypeScript interfaces from src/utils/budgeting/autofunding/
"""

from typing import Any, Literal

from pydantic import BaseModel, Field

# Condition Types
CONDITION_TYPES = {
    "BALANCE_LESS_THAN": "balance_less_than",
    "BALANCE_GREATER_THAN": "balance_greater_than",
    "DATE_RANGE": "date_range",
    "TRANSACTION_AMOUNT": "transaction_amount",
    "UNASSIGNED_ABOVE": "unassigned_above",
}

# Condition type literal
ConditionType = Literal[
    "balance_less_than",
    "balance_greater_than",
    "date_range",
    "transaction_amount",
    "unassigned_above",
]

# Rule Types - must be defined before AutoFundingRule
RuleType = Literal["fixed_amount", "percentage", "conditional", "split_remainder", "priority_fill"]

# Trigger Types - must be defined before AutoFundingRule
TriggerType = Literal["manual", "income_detected", "monthly", "weekly", "biweekly", "payday"]


class Condition(BaseModel):
    """Condition for conditional rules"""

    id: str | None = None
    type: ConditionType
    envelopeId: str | None = None
    value: float
    operator: str | None = None
    startDate: str | None = None
    endDate: str | None = None


# Rule Configuration
class RuleConfig(BaseModel):
    """Rule configuration matching TypeScript RuleConfig interface"""

    sourceType: Literal["unassigned", "envelope", "income"]
    sourceId: str | None = None
    targetType: Literal["envelope", "multiple"]
    targetId: str | None = None
    targetIds: list[str] = Field(default_factory=list)
    amount: float = 0.0
    percentage: float = 0.0
    conditions: list[Condition] = Field(default_factory=list)
    scheduleConfig: dict[str, Any] = Field(default_factory=dict)


# AutoFunding Rule
class AutoFundingRule(BaseModel):
    """AutoFunding rule matching TypeScript AutoFundingRule interface"""

    id: str
    name: str
    description: str = ""
    type: RuleType
    trigger: TriggerType
    priority: int
    enabled: bool
    createdAt: str
    lastExecuted: str | None = None
    executionCount: int = 0
    config: RuleConfig


# Envelope Data
class EnvelopeData(BaseModel):
    """Envelope data matching TypeScript EnvelopeData interface"""

    id: str
    currentBalance: float | None = 0.0
    monthlyAmount: float | None = None
    name: str | None = None


# AutoFunding Context
class AutoFundingContextData(BaseModel):
    """Context data for autofunding execution"""

    unassignedCash: float
    newIncomeAmount: float | None = None
    envelopes: list[EnvelopeData]


class AutoFundingContext(BaseModel):
    """AutoFunding context matching TypeScript AutoFundingContext interface"""

    data: AutoFundingContextData
    trigger: str
    currentDate: str | None = None


# Planned Transfer
class PlannedTransfer(BaseModel):
    """Planned transfer from simulation"""

    fromEnvelopeId: str
    toEnvelopeId: str
    amount: float
    description: str
    ruleId: str
    ruleName: str


# Rule Result
class RuleResult(BaseModel):
    """Result from simulating a single rule"""

    ruleId: str
    ruleName: str
    success: bool
    error: str | None = None
    amount: float
    plannedTransfers: list[PlannedTransfer]
    targetEnvelopes: list[str] | None = None


# Error Result
class ErrorResult(BaseModel):
    """Error from rule execution"""

    ruleId: str
    ruleName: str
    error: str


# Simulation Result
class SimulationResult(BaseModel):
    """Complete simulation result"""

    totalPlanned: float
    rulesExecuted: int
    plannedTransfers: list[PlannedTransfer]
    ruleResults: list[RuleResult]
    remainingCash: float
    errors: list[ErrorResult]


# Warning
class Warning(BaseModel):
    """Warning about execution plan"""

    type: str
    message: str
    severity: str


# AutoFunding Result (API Response)
class AutoFundingResult(BaseModel):
    """Complete autofunding simulation result - API Response"""

    success: bool
    simulation: SimulationResult | None = None
    error: str | None = None


# Request Model
class AutoFundingRequest(BaseModel):
    """Request payload for autofunding simulation endpoint"""

    rules: list[AutoFundingRule]
    context: AutoFundingContext
