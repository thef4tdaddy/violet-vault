# Financial Behavior Simulator

> **Issue**: #172 - Python Financial Behavior Simulator for Demo Sandbox

## Overview

The Financial Behavior Simulator is a Python service that generates realistic, interactive financial data for the Violet Vault Demo Sandbox. It creates a "living" financial story by simulating spending habits and budget responses over a 6-month period.

## Features

### Spending Patterns

- **Conservative**: Careful spender who stays under budget (75% utilization)
- **Aggressive**: Spends most of budget with occasional overspending (95% utilization)
- **Chaotic**: Unpredictable spending with high variance (110% utilization)

### Income Frequencies

- **Weekly**: Paycheck every Friday
- **Biweekly**: Paycheck every other Friday  
- **Monthly**: Paycheck on the 1st of each month

### Life Events

Random events that add realism to the simulation:

**Emergencies**:
- Car repair ($300-$1,500)
- Medical emergency ($200-$2,000)
- Home repair ($400-$2,500)

**Windfalls**:
- Work bonus ($500-$3,000)
- Tax refund ($800-$2,500)
- Gift ($100-$500)

## API Endpoints

### POST `/api/simulator/generate`

Generate a complete financial simulation.

**Request Body**:
```json
{
  "monthly_income": 4500.0,
  "income_frequency": "biweekly",
  "spending_style": "conservative",
  "months": 6,
  "enable_life_events": true,
  "num_envelopes": 8
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "envelopes": [...],
    "transactions": [...],
    "life_events": [...],
    "metadata": {
      "config": {...},
      "stats": {
        "total_income": 26958.53,
        "total_expenses": -2627.67,
        "net_cash_flow": 24330.85,
        "transaction_count": 126,
        "envelope_count": 8,
        "life_event_count": 1,
        "final_balance": 24330.85,
        "average_daily_spending": 20.45
      }
    }
  },
  "error": null,
  "performance_ms": 18.63
}
```

### GET `/api/simulator/presets`

Get preset simulation configurations for common scenarios.

**Response**:
```json
{
  "conservative_budgeter": {
    "monthly_income": 4500,
    "income_frequency": "biweekly",
    "spending_style": "conservative",
    "description": "Careful spender who stays under budget"
  },
  "aggressive_spender": {
    "monthly_income": 5500,
    "income_frequency": "monthly",
    "spending_style": "aggressive",
    "description": "Spends most of budget with occasional overspending"
  },
  "chaotic_finances": {
    "monthly_income": 4000,
    "income_frequency": "weekly",
    "spending_style": "chaotic",
    "description": "Unpredictable spending patterns with frequent overspending"
  },
  "recent_graduate": {
    "monthly_income": 3500,
    "income_frequency": "biweekly",
    "spending_style": "aggressive",
    "description": "Entry-level income with learning spending habits"
  },
  "established_professional": {
    "monthly_income": 7500,
    "income_frequency": "monthly",
    "spending_style": "conservative",
    "description": "Higher income with mature financial habits"
  }
}
```

## Technical Details

### Performance

- **Target**: <200ms for <5,000 records
- **Actual**: ~18ms for 6-month simulation with ~126 transactions
- **Well under target**: 91% faster than requirement

### Category Distribution

Budget envelopes are allocated across 9 categories:

| Category | Budget % | Variance | Frequency |
|----------|----------|----------|-----------|
| Groceries | 15% | 30% | High (15-25/month) |
| Dining | 10% | 50% | High |
| Transportation | 10% | 20% | Medium (8-12/month) |
| Utilities | 12% | 10% | Low (1-2/month) |
| Entertainment | 8% | 60% | Medium |
| Shopping | 12% | 70% | Medium |
| Healthcare | 8% | 40% | Low |
| Savings | 15% | 0% | Low |
| Miscellaneous | 10% | 80% | Medium |

### Data Model Compatibility

Generated data is fully compatible with the frontend `useFinancialInsights` hook:

- Envelopes match `GeneratedEnvelope` schema
- Transactions match `GeneratedTransaction` schema
- All fields use frontend naming conventions (camelCase)
- Timestamps in milliseconds (JavaScript compatible)
- ISO date strings for date fields

### Balance Math Validation

The simulator ensures:
- All transactions reference valid envelopes
- Income amounts are positive
- Expense amounts are negative
- Envelope balances are non-negative
- Balance math is consistent throughout simulation

## Usage Examples

### Python (Direct)

```python
from datetime import date
from api.simulator.generator import generate_financial_simulation
from api.simulator.models import (
    SimulationConfig,
    IncomeFrequency,
    SpendingStyle
)

config = SimulationConfig(
    monthly_income=4500.0,
    income_frequency=IncomeFrequency.BIWEEKLY,
    spending_style=SpendingStyle.CONSERVATIVE,
    start_date=date(2024, 1, 1),
    months=6,
    enable_life_events=True,
    num_envelopes=8
)

result = generate_financial_simulation(config)

print(f"Generated {len(result.transactions)} transactions")
print(f"Generated {len(result.envelopes)} envelopes")
print(f"Life events: {len(result.life_events)}")
```

### HTTP API (cURL)

```bash
curl -X POST http://localhost:8000/api/simulator/generate \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_income": 4500,
    "income_frequency": "biweekly",
    "spending_style": "conservative",
    "months": 6,
    "enable_life_events": true,
    "num_envelopes": 8
  }'
```

### TypeScript/Frontend

```typescript
import { useQuery } from '@tanstack/react-query';

interface SimulationRequest {
  monthly_income: number;
  income_frequency: 'weekly' | 'biweekly' | 'monthly';
  spending_style: 'conservative' | 'aggressive' | 'chaotic';
  months: number;
  enable_life_events: boolean;
  num_envelopes: number;
}

const generateSimulation = async (config: SimulationRequest) => {
  const response = await fetch('/api/simulator/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return response.json();
};

export const useDemoSimulation = (config: SimulationRequest) => {
  return useQuery({
    queryKey: ['simulation', config],
    queryFn: () => generateSimulation(config),
  });
};
```

## Testing

Comprehensive test suite with 18 tests covering:

- Envelope generation and budget allocation
- Income generation (weekly, biweekly, monthly)
- Spending pattern behaviors
- Life event generation
- Balance math validation
- Transaction structure validation
- Date range validation
- Performance benchmarks
- Unique ID validation

Run tests:
```bash
pytest api/simulator/test_simulator.py -v
```

## Dependencies

- **fastapi**: API framework
- **pydantic**: Data validation
- **Faker**: Realistic merchant name generation

Install:
```bash
pip install -r api/requirements.txt
```

## Architecture

```
api/simulator/
├── __init__.py          # Package exports
├── models.py            # Pydantic models for config and results
├── generator.py         # Core simulation logic
├── index.py             # FastAPI endpoints
└── test_simulator.py    # Test suite
```

## Future Enhancements

- [ ] Recurring bill generation
- [ ] Savings goal tracking
- [ ] Multi-user simulation
- [ ] Custom category creation
- [ ] Export to CSV/JSON
- [ ] Integration with useFinancialInsights hook (#1741)

## Related Issues

- #172 - Financial Behavior Simulator (This implementation)
- #1741 - Financial Insights Hook (Integration target)
- #1463 - v2.1 Epic (Parent epic)
