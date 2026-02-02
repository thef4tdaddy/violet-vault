#!/usr/bin/env python3
"""Quick test of the simulator endpoint"""

import asyncio

from api.simulator.index import SimulationRequest, generate_simulation
from api.simulator.models import IncomeFrequency, SpendingStyle


async def test_endpoint() -> None:
    """Test the simulation endpoint"""
    request = SimulationRequest(
        monthly_income=4500.0,
        income_frequency=IncomeFrequency.BIWEEKLY,
        spending_style=SpendingStyle.CONSERVATIVE,
        months=6,
        enable_life_events=True,
        num_envelopes=8,
    )

    print("Generating simulation...")
    response = await generate_simulation(request)

    print("✓ Simulation generated successfully")
    print(f"✓ Performance: {response.performance_ms:.2f}ms")
    print(f"✓ Envelopes: {len(response.data.envelopes) if response.data else 0}")
    print(f"✓ Transactions: {len(response.data.transactions) if response.data else 0}")
    print(f"✓ Life Events: {len(response.data.life_events) if response.data else 0}")

    if response.data:
        stats = response.data.metadata.get("stats", {})
        print(f'✓ Total Income: ${stats.get("total_income", 0):.2f}')
        print(f'✓ Total Expenses: ${abs(stats.get("total_expenses", 0)):.2f}')
        print(f'✓ Net Cash Flow: ${stats.get("net_cash_flow", 0):.2f}')


if __name__ == "__main__":
    asyncio.run(test_endpoint())
