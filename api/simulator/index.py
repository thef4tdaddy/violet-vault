"""
Financial Behavior Simulator API Endpoint
FastAPI endpoint for generating demo financial data
"""

from datetime import date, datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel, Field

from ..simulator.generator import generate_financial_simulation
from ..simulator.models import (
    IncomeFrequency,
    SimulationConfig,
    SimulationResult,
    SpendingStyle,
)

router = APIRouter(prefix="/simulator", tags=["simulator"])


class SimulationRequest(BaseModel):
    """Request for financial simulation"""

    monthly_income: float = Field(
        default=4500.0, gt=0, description="Monthly income amount"
    )
    income_frequency: IncomeFrequency = Field(
        default=IncomeFrequency.BIWEEKLY, description="Income payment frequency"
    )
    spending_style: SpendingStyle = Field(
        default=SpendingStyle.CONSERVATIVE, description="Spending behavior pattern"
    )
    months: int = Field(
        default=6, ge=1, le=12, description="Number of months to simulate"
    )
    enable_life_events: bool = Field(
        default=True, description="Include random life events"
    )
    num_envelopes: int = Field(
        default=8, ge=4, le=20, description="Number of budget envelopes"
    )


class SimulationResponse(BaseModel):
    """Response containing simulation results"""

    success: bool
    data: SimulationResult | None = None
    error: str | None = None
    performance_ms: float


@router.post("/generate", response_model=SimulationResponse)
async def generate_simulation(request: SimulationRequest) -> SimulationResponse:
    """
    Generate a financial behavior simulation

    Generates realistic financial data for a 6-month period including:
    - Budget envelopes
    - Income transactions (based on frequency)
    - Expense transactions (based on spending style)
    - Random life events (emergencies, bonuses)

    Performance target: <200ms for <5,000 records

    Args:
        request: Simulation configuration

    Returns:
        SimulationResponse with generated data
    """
    start_time = datetime.now()

    try:
        # Create simulation config
        config = SimulationConfig(
            monthly_income=request.monthly_income,
            income_frequency=request.income_frequency,
            spending_style=request.spending_style,
            start_date=date.today() - timedelta(days=request.months * 30),
            months=request.months,
            enable_life_events=request.enable_life_events,
            num_envelopes=request.num_envelopes,
        )

        # Generate simulation
        result = generate_financial_simulation(config)

        # Calculate performance
        end_time = datetime.now()
        performance_ms = (end_time - start_time).total_seconds() * 1000

        return SimulationResponse(
            success=True,
            data=result,
            error=None,
            performance_ms=performance_ms,
        )

    except Exception as e:
        end_time = datetime.now()
        performance_ms = (end_time - start_time).total_seconds() * 1000

        return SimulationResponse(
            success=False,
            data=None,
            error=str(e),
            performance_ms=performance_ms,
        )


@router.get("/presets")
async def get_presets() -> dict:
    """
    Get preset simulation configurations

    Returns:
        Dictionary of preset configurations for common scenarios
    """
    return {
        "conservative_budgeter": {
            "monthly_income": 4500,
            "income_frequency": "biweekly",
            "spending_style": "conservative",
            "description": "Careful spender who stays under budget",
        },
        "aggressive_spender": {
            "monthly_income": 5500,
            "income_frequency": "monthly",
            "spending_style": "aggressive",
            "description": "Spends most of budget with occasional overspending",
        },
        "chaotic_finances": {
            "monthly_income": 4000,
            "income_frequency": "weekly",
            "spending_style": "chaotic",
            "description": "Unpredictable spending patterns with frequent overspending",
        },
        "recent_graduate": {
            "monthly_income": 3500,
            "income_frequency": "biweekly",
            "spending_style": "aggressive",
            "description": "Entry-level income with learning spending habits",
        },
        "established_professional": {
            "monthly_income": 7500,
            "income_frequency": "monthly",
            "spending_style": "conservative",
            "description": "Higher income with mature financial habits",
        },
    }
