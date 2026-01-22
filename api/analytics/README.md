# Analytics API Documentation

## Overview

The VioletVault Analytics API provides intelligent financial predictions and insights for the dashboard while maintaining E2EE privacy by working only with anonymized, client-side statistics.

**Endpoint**: `POST /api/analytics`

**Language**: Python 3.12+ (Vercel Serverless)

**Status**: v2.0 - Production Ready

## Features

### 1. Spending Velocity Analysis

Calculates daily/weekly spending rate and predicts if user will exceed budget before next payday.

**Inputs**: Anonymized spending statistics

- Total spent in period
- Budget allocated for period
- Days elapsed and remaining

**Outputs**:

- Velocity score (0-100)
- Daily spending rate
- Projected total spending
- Budget overrun prediction
- Days until budget exceeded
- Recommendations and severity level

### 2. Bill Prediction

Analyzes historical bill patterns and predicts upcoming bills based on trends.

**Inputs**: Anonymized historical bill data

- Bill amounts
- Due dates (ISO format)
- Categories (no merchant names)

**Outputs**:

- Predicted upcoming bills
- Predicted amounts and dates
- Confidence scores
- Detected frequency patterns (weekly, monthly, quarterly, etc.)

### 3. Budget Health Score

Overall financial health indicator based on multiple factors.

**Inputs**: Anonymized budget metrics

- Spending velocity score
- Bill coverage ratio
- Savings rate
- Envelope utilization

**Outputs**:

- Overall health score (0-100)
- Letter grade (A-F)
- Detailed breakdown (spending pace, bill preparedness, savings health, budget utilization)
- Personalized recommendations
- Identified strengths and concerns

## Privacy & Security

**CRITICAL**: This service does NOT access E2EE encrypted data directly.

- **Input**: Anonymized statistics sent from client
  - Aggregated spending totals (no transaction details)
  - Bill due dates and amounts (no merchant names)
  - Envelope allocations (no personal identifiers)
- **Output**: Predictions and scores only
- **No Storage**: Stateless service, no data persistence
- **Validation**: Pydantic models for all inputs/outputs

## API Usage

### Request Format

```json
POST /api/analytics
Content-Type: application/json

{
  "spendingStats": {
    "totalSpent": 500.0,
    "budgetAllocated": 1000.0,
    "daysElapsed": 15,
    "daysRemaining": 15
  },
  "historicalBills": [
    {
      "amount": 150.0,
      "dueDate": "2024-01-15T00:00:00Z",
      "category": "utilities"
    }
  ],
  "healthMetrics": {
    "spendingVelocityScore": 85,
    "billCoverageRatio": 1.2,
    "savingsRate": 0.15,
    "envelopeUtilization": 0.80
  }
}
```

### Response Format

```json
{
  "success": true,
  "spendingVelocity": {
    "velocityScore": 100,
    "dailyRate": 33.33,
    "projectedTotal": 1000.0,
    "budgetAllocated": 1000.0,
    "willExceedBudget": false,
    "daysUntilExceeded": null,
    "recommendation": "Excellent pacing! You're on track with your budget.",
    "severity": "success"
  },
  "billPredictions": {
    "predictedBills": [
      {
        "category": "utilities",
        "predictedAmount": 150.0,
        "predictedDate": "2024-02-15T00:00:00Z",
        "confidence": 95,
        "frequency": {
          "intervalDays": 30,
          "confidence": 95,
          "pattern": "monthly"
        }
      }
    ],
    "totalPredictedAmount": 150.0,
    "nextBillDate": "2024-02-15T00:00:00Z",
    "message": "Predicted 1 upcoming bills"
  },
  "budgetHealth": {
    "overallScore": 88,
    "breakdown": {
      "spendingPace": 85,
      "billPreparedness": 92,
      "savingsHealth": 90,
      "budgetUtilization": 100
    },
    "grade": "B",
    "summary": "Good financial health. Your budget is solid with a score of 88/100, with room for minor improvements.",
    "recommendations": [],
    "strengths": [
      "Excellent spending control and pacing",
      "Strong bill coverage and preparedness",
      "Healthy savings rate maintained",
      "Optimal budget utilization"
    ],
    "concerns": []
  },
  "error": null
}
```

### Error Response

```json
{
  "success": false,
  "spendingVelocity": null,
  "billPredictions": null,
  "budgetHealth": null,
  "error": "Invalid request data: Field 'daysElapsed' must be greater than 0"
}
```

## Frontend Integration

### Using TanStack Query

```typescript
import { useAnalyticsQuery } from '@/hooks/platform/analytics/queries/useAnalyticsQuery';

// Full analytics
const { data, isLoading, error } = useAnalyticsQuery({
  spendingStats: { totalSpent: 500, budgetAllocated: 1000, ... },
  historicalBills: [ ... ],
  healthMetrics: { ... }
});

// Or use convenience hooks
import {
  useSpendingVelocity,
  useBillPredictions,
  useBudgetHealth
} from '@/hooks/platform/analytics/queries/useAnalyticsQuery';

const { data: velocity } = useSpendingVelocity(spendingStats);
const { data: bills } = useBillPredictions(historicalBills);
const { data: health } = useBudgetHealth(healthMetrics);
```

### Using Mutation (On-Demand)

```typescript
import { useAnalyticsMutation } from '@/hooks/platform/analytics/queries/useAnalyticsQuery';

const { mutate, data, isPending } = useAnalyticsMutation();

const handleCalculate = () => {
  mutate({
    spendingStats: { ... },
    historicalBills: [ ... ]
  });
};
```

## Testing

### Running Tests

```bash
# Run all analytics tests
python -m pytest api/analytics/test_spending.py api/analytics/test_bills.py api/analytics/test_health.py api/test_analytics.py -v

# Run with coverage
python -m pytest api/analytics/ api/test_analytics.py --cov=api/analytics --cov-report=term-missing
```

### Test Coverage

- `spending.py`: 92% coverage (10 tests)
- `bills.py`: 89% coverage (13 tests)
- `health.py`: 97% coverage (13 tests)
- Integration tests: 11 tests

**Total**: 47 tests, all passing

### Example Test

```python
def test_perfect_pacing() -> None:
    """Test perfect spending pacing (on track with budget)"""
    stats: SpendingStats = {
        "totalSpent": 500.0,
        "budgetAllocated": 1000.0,
        "daysElapsed": 15,
        "daysRemaining": 15,
    }

    result = calculate_spending_velocity(stats)

    assert result["velocityScore"] == 100
    assert result["severity"] == "success"
    assert not result["willExceedBudget"]
```

## Linting & Type Checking

### Python

```bash
# Ruff linting
python -m ruff check api/analytics/

# Mypy type checking
python -m mypy api/analytics/spending.py api/analytics/bills.py api/analytics/health.py
```

### TypeScript

```bash
# Type checking
npm run typecheck

# Formatting
npm run format
```

## Architecture

```
api/
├── analytics.py              # Vercel serverless handler (POST /api/analytics)
├── analytics/
│   ├── __init__.py          # Exports for analytics functions
│   ├── spending.py          # Spending velocity calculations
│   ├── bills.py             # Bill prediction logic
│   ├── health.py            # Budget health scoring
│   ├── test_spending.py     # Unit tests for spending
│   ├── test_bills.py        # Unit tests for bills
│   └── test_health.py       # Unit tests for health
├── models.py                # Pydantic models for validation
└── test_analytics.py        # Integration tests for endpoint
```

## Related Issues

- Issue #656: Backend Analytics Service for Dashboard Predictions
- Epic #656: v2.1 Sentinel Share, Dashboard & Marketing
- Related: #1690 PaydayBanner uses spending velocity

## Future Enhancements

- [ ] Add caching layer for repeated calculations
- [ ] Implement trend analysis over time
- [ ] Add anomaly detection for unusual spending patterns
- [ ] Support custom prediction timeframes
- [ ] Add envelope-specific insights

## Dependencies

```python
# api/requirements.txt
fastapi==0.115.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
python-multipart==0.0.18

# Dev Dependencies
ruff==0.1.0
mypy==1.0.0
pytest==8.0.0
pytest-cov==4.1.0
```

## Deployment

The analytics API is automatically deployed to Vercel as a serverless function:

- **Runtime**: Python 3.12
- **Region**: Auto (closest to user)
- **Cold Start**: ~500ms
- **Warm Request**: <100ms
- **Memory**: 1024 MB

### Environment Variables

None required - service is stateless and uses no external APIs.

## Support

For issues or questions:

- GitHub Issues: https://github.com/thef4tdaddy/violet-vault/issues
- Label: `backend`, `analytics`
