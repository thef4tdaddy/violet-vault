"""
Pydantic models for AutoFunding API
Mirrors the TypeScript interfaces from src/utils/budgeting/autofunding/
"""
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from enum import Enum
from .conditions import CONDITION_TYPES


# Condition Types
ConditionType = Enum(
    "ConditionType",
    {key.upper(): key for key in CONDITION_TYPES.keys()},
    type=str,
)


class Condition(BaseModel):
    """Condition for conditional rules"""
    id: Optional[str] = None
    type: ConditionType
    envelopeId: Optional[str] = None
    value: float
    operator: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None


# Rule Configuration
class RuleConfig(BaseModel):
    """Rule configuration matching TypeScript RuleConfig interface"""
    sourceType: Literal["unassigned", "envelope", "income"]
    sourceId: Optional[str] = None
    targetType: Literal["envelope", "multiple"]
    targetId: Optional[str] = None
    targetIds: List[str] = Field(default_factory=list)
    amount: float = 0.0
    percentage: float = 0.0
    conditions: List[Condition] = Field(default_factory=list)
    scheduleConfig: Dict[str, Any] = Field(default_factory=dict)


# AutoFunding Rule
class AutoFundingRule(BaseModel):
    """AutoFunding rule matching TypeScript AutoFundingRule interface"""
    id: str
    name: str
    description: str = ""
    type: str
    trigger: str
    priority: int
    enabled: bool
    createdAt: str
    lastExecuted: Optional[str] = None
    executionCount: int = 0
    config: RuleConfig


# Envelope Data
class EnvelopeData(BaseModel):
    """Envelope data matching TypeScript EnvelopeData interface"""
    id: str
    currentBalance: Optional[float] = 0.0
    monthlyAmount: Optional[float] = None
    name: Optional[str] = None


# AutoFunding Context
class AutoFundingContextData(BaseModel):
    """Context data for autofunding execution"""
    unassignedCash: float
    newIncomeAmount: Optional[float] = None
    envelopes: List[EnvelopeData]


class AutoFundingContext(BaseModel):
    """AutoFunding context matching TypeScript AutoFundingContext interface"""
    data: AutoFundingContextData
    trigger: str
    currentDate: Optional[str] = None


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
    error: Optional[str] = None
    amount: float
    plannedTransfers: List[PlannedTransfer]
    targetEnvelopes: Optional[List[str]] = None


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
    plannedTransfers: List[PlannedTransfer]
    ruleResults: List[RuleResult]
    remainingCash: float
    errors: List[ErrorResult]


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
    simulation: Optional[SimulationResult] = None
    error: Optional[str] = None


# Request Model
class AutoFundingRequest(BaseModel):
    """Request payload for autofunding simulation endpoint"""
    rules: List[AutoFundingRule]
    context: AutoFundingContext
