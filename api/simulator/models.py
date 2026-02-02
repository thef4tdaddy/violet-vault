"""
Data Models for Financial Behavior Simulator
Defines simulation parameters and output structure
"""

from datetime import date
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class IncomeFrequency(str, Enum):
    """Income payment frequency"""

    WEEKLY = "weekly"
    BIWEEKLY = "biweekly"
    MONTHLY = "monthly"


class SpendingStyle(str, Enum):
    """Spending behavior patterns"""

    CONSERVATIVE = "conservative"  # Careful, stays under budget
    AGGRESSIVE = "aggressive"  # Spends most of budget, occasional overspending
    CHAOTIC = "chaotic"  # Unpredictable, frequent overspending


class LifeEventType(str, Enum):
    """Types of random life events"""

    CAR_REPAIR = "car_repair"
    MEDICAL_EMERGENCY = "medical_emergency"
    HOME_REPAIR = "home_repair"
    BONUS = "bonus"
    TAX_REFUND = "tax_refund"
    GIFT = "gift"


class SimulationConfig(BaseModel):
    """Configuration for financial simulation"""

    # Income configuration
    monthly_income: float = Field(default=4500.0, gt=0, description="Base monthly income (gross)")
    income_frequency: IncomeFrequency = Field(
        default=IncomeFrequency.BIWEEKLY, description="How often income is received"
    )

    # Spending behavior
    spending_style: SpendingStyle = Field(
        default=SpendingStyle.CONSERVATIVE, description="Spending behavior pattern"
    )

    # Simulation duration
    start_date: date = Field(..., description="Simulation start date")
    months: int = Field(default=6, ge=1, le=12, description="Number of months to simulate")

    # Life events
    enable_life_events: bool = Field(
        default=True, description="Enable random life events (emergencies, bonuses)"
    )
    life_event_probability: float = Field(
        default=0.15,
        ge=0.0,
        le=1.0,
        description="Probability of life event per month (0-1)",
    )

    # Envelope configuration
    num_envelopes: int = Field(
        default=8, ge=4, le=20, description="Number of budget envelopes to create"
    )


class GeneratedTransaction(BaseModel):
    """Generated transaction matching frontend schema"""

    id: str
    date: str  # ISO format
    amount: float  # Negative for expenses, positive for income
    envelopeId: str
    category: str
    type: Literal["income", "expense", "transfer"]
    lastModified: int
    createdAt: int
    description: str | None = None
    merchant: str | None = None
    isScheduled: bool = False


class GeneratedEnvelope(BaseModel):
    """Generated envelope matching frontend schema"""

    id: str
    name: str
    category: str
    archived: bool = False
    lastModified: int
    createdAt: int
    currentBalance: float
    description: str | None = None
    type: Literal["standard", "goal", "liability", "supplemental"] = "standard"
    monthlyBudget: float | None = None


class LifeEvent(BaseModel):
    """Record of a life event that occurred during simulation"""

    date: str  # ISO format
    type: LifeEventType
    amount: float
    description: str


class SimulationResult(BaseModel):
    """Complete simulation output"""

    envelopes: list[GeneratedEnvelope] = Field(..., description="Generated envelopes")
    transactions: list[GeneratedTransaction] = Field(..., description="Generated transactions")
    life_events: list[LifeEvent] = Field(
        default_factory=list, description="Life events that occurred"
    )
    metadata: dict = Field(
        default_factory=dict,
        description="Simulation metadata (config, stats, etc.)",
    )


class SimulationStats(BaseModel):
    """Statistics about the generated simulation"""

    total_income: float
    total_expenses: float
    net_cash_flow: float
    transaction_count: int
    envelope_count: int
    life_event_count: int
    final_balance: float
    average_daily_spending: float
