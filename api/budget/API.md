# Budget Calculation API

## Overview

The Budget Calculation API is a **stateless, privacy-first** Go-based serverless function that handles high-performance envelope budget calculations. It's designed to support multi-user scenarios while ensuring complete data isolation and privacy.

## Key Features

- ✅ **Stateless**: No data persisted on server
- ✅ **Privacy-First**: All calculations in-memory, immediately discarded
- ✅ **Multi-User Ready**: Isolated request processing for concurrent users
- ✅ **High Performance**: Optimized for large datasets (1000+ envelopes, 10000+ transactions)
- ✅ **Zero Logging**: User data never logged or stored

## Endpoint

```
POST /api/budget
```

## Request Format

### Content-Type
```
application/json
```

### Request Body

```typescript
{
  envelopes: Envelope[];
  transactions: Transaction[];
  bills: Bill[];
}
```

### Envelope Schema

```typescript
interface Envelope {
  id: string;                    // Required: Unique identifier
  name?: string;                 // Envelope name
  budget?: number;               // Budget amount
  allocated?: number;            // Allocated amount
  currentBalance?: number;       // Current balance
  envelopeType?: string;         // bill | variable | savings | sinking_fund | supplemental
  category?: string;             // Category for auto-classification
  biweeklyAllocation?: number;   // Biweekly allocation amount
  targetAmount?: number;         // Target amount for savings
  monthlyBudget?: number;        // Monthly budget
  monthlyAmount?: number;        // Monthly amount
}
```

### Transaction Schema

```typescript
interface Transaction {
  id: string;                    // Required: Unique identifier
  envelopeId: string;            // Required: Associated envelope
  type: string;                  // Required: expense | income | transfer | bill | recurring_bill
  amount: number;                // Required: Transaction amount (negative for expenses)
  isPaid?: boolean;              // Whether paid
  date?: string;                 // ISO 8601 date
  dueDate?: string;              // ISO 8601 date for bills
  provider?: string;             // Merchant or provider
  description?: string;          // Description
}
```

### Bill Schema

```typescript
interface Bill {
  id: string;                    // Required: Unique identifier
  envelopeId?: string;           // Associated envelope
  isPaid?: boolean;              // Whether paid
  amount: number;                // Required: Bill amount (negative by convention)
  dueDate?: string;              // ISO 8601 date
  name?: string;                 // Bill name
  type?: string;                 // Bill type
  frequency?: string;            // monthly | biweekly | weekly | quarterly | yearly
  provider?: string;             // Bill provider
  description?: string;          // Description
  date?: string;                 // ISO 8601 date
}
```

## Response Format

### Success Response (200)

```typescript
{
  success: true;
  data: EnvelopeData[];
  totals: GlobalTotals;
}
```

### EnvelopeData Schema

Extends `Envelope` with calculated fields:

```typescript
interface EnvelopeData extends Envelope {
  totalSpent: number;            // Total spent from envelope
  totalUpcoming: number;         // Total upcoming bills
  totalOverdue: number;          // Total overdue bills
  allocated: number;             // Total allocated
  available: number;             // Available after commitments
  committed: number;             // Amount committed to bills
  utilizationRate: number;       // 0.0 to 1.0+ (can exceed 1.0 if overspent)
  status: string;                // healthy | underfunded | overspent | overdue
  upcomingBills: Bill[];         // Bills due in future
  overdueBills: Bill[];          // Bills past due date
  transactions: Transaction[];   // All transactions for envelope
  bills: Bill[];                 // All bills for envelope
  biweeklyNeed: number;          // Calculated biweekly funding need
}
```

### GlobalTotals Schema

```typescript
interface GlobalTotals {
  totalAllocated: number;        // Sum of all envelope balances
  totalSpent: number;            // Sum of all spending
  totalBalance: number;          // Sum of all balances
  totalUpcoming: number;         // Sum of all upcoming bills
  totalBiweeklyNeed: number;     // Sum of all biweekly needs
  billsDueCount: number;         // Count of bills due in next 30 days
  envelopeCount: number;         // Number of envelopes processed
}
```

### Error Response (400, 405, 500)

```typescript
{
  success: false;
  error: string;                 // Error message
}
```

## Calculation Logic

### 1. Envelope Status Determination

The status is calculated based on the following hierarchy:

1. **overdue**: Has overdue bills (past due date)
2. **overspent**: Available balance is negative
3. **underfunded**: (Bill envelopes only) Balance < upcoming bill total
4. **healthy**: None of the above conditions

### 2. Utilization Rate

Calculated differently based on envelope type:

- **Bill Envelopes**: `currentBalance / nextBillAmount`
- **Savings Envelopes**: `currentBalance / targetAmount`
- **Variable Envelopes**: `(totalSpent + committed) / budget`

### 3. Biweekly Need

Calculated based on envelope type and configuration:

- **Bill with biweeklyAllocation**: Use configured allocation
- **With monthlyBudget**: `monthlyBudget / 2.166` (26 paychecks/year)
- **With monthlyAmount**: `monthlyAmount / 2.166`
- **Savings with target**: `min(remaining, biweeklyAllocation)`
- **Default**: 0

### 4. Bill Partitioning

Bills are partitioned into:
- **Upcoming**: `dueDate > currentDate`
- **Overdue**: `dueDate < currentDate`
- Bills with `dueDate == currentDate` are excluded from both (edge case)

### 5. Bill Due Count

Counts bills with due dates within the next 30 days from current date.

## Usage Examples

### Example 1: Single Envelope Calculation

**Request:**
```json
POST /api/budget
Content-Type: application/json

{
  "envelopes": [
    {
      "id": "env1",
      "name": "Groceries",
      "currentBalance": 500,
      "monthlyBudget": 600,
      "envelopeType": "variable"
    }
  ],
  "transactions": [
    {
      "id": "tx1",
      "envelopeId": "env1",
      "type": "expense",
      "amount": -50,
      "date": "2026-01-01"
    }
  ],
  "bills": []
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "env1",
      "name": "Groceries",
      "currentBalance": 500,
      "monthlyBudget": 600,
      "envelopeType": "variable",
      "totalSpent": 50,
      "totalUpcoming": 0,
      "totalOverdue": 0,
      "allocated": 500,
      "available": 500,
      "committed": 0,
      "utilizationRate": 0.083,
      "status": "healthy",
      "upcomingBills": [],
      "overdueBills": [],
      "transactions": [
        {
          "id": "tx1",
          "envelopeId": "env1",
          "type": "expense",
          "amount": -50,
          "date": "2026-01-01"
        }
      ],
      "bills": [],
      "biweeklyNeed": 277.15
    }
  ],
  "totals": {
    "totalAllocated": 500,
    "totalSpent": 50,
    "totalBalance": 500,
    "totalUpcoming": 0,
    "totalBiweeklyNeed": 277.15,
    "billsDueCount": 0,
    "envelopeCount": 1
  }
}
```

### Example 2: Multi-Envelope with Bills

**Request:**
```json
POST /api/budget

{
  "envelopes": [
    {
      "id": "env1",
      "name": "Rent",
      "currentBalance": 1200,
      "biweeklyAllocation": 600,
      "envelopeType": "bill"
    },
    {
      "id": "env2",
      "name": "Emergency Fund",
      "currentBalance": 500,
      "targetAmount": 2000,
      "biweeklyAllocation": 100,
      "envelopeType": "savings"
    }
  ],
  "transactions": [],
  "bills": [
    {
      "id": "bill1",
      "envelopeId": "env1",
      "amount": -1200,
      "dueDate": "2026-01-15",
      "isPaid": false,
      "name": "Rent Payment"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "env1",
      "name": "Rent",
      "currentBalance": 1200,
      "biweeklyAllocation": 600,
      "envelopeType": "bill",
      "totalSpent": 0,
      "totalUpcoming": 1200,
      "totalOverdue": 0,
      "allocated": 1200,
      "available": 0,
      "committed": 1200,
      "utilizationRate": 1.0,
      "status": "healthy",
      "upcomingBills": [
        {
          "id": "bill1",
          "envelopeId": "env1",
          "amount": -1200,
          "dueDate": "2026-01-15",
          "isPaid": false,
          "name": "Rent Payment"
        }
      ],
      "overdueBills": [],
      "transactions": [],
      "bills": [
        {
          "id": "bill1",
          "envelopeId": "env1",
          "amount": -1200,
          "dueDate": "2026-01-15",
          "isPaid": false,
          "name": "Rent Payment"
        }
      ],
      "biweeklyNeed": 600
    },
    {
      "id": "env2",
      "name": "Emergency Fund",
      "currentBalance": 500,
      "targetAmount": 2000,
      "biweeklyAllocation": 100,
      "envelopeType": "savings",
      "totalSpent": 0,
      "totalUpcoming": 0,
      "totalOverdue": 0,
      "allocated": 500,
      "available": 500,
      "committed": 0,
      "utilizationRate": 0.25,
      "status": "healthy",
      "upcomingBills": [],
      "overdueBills": [],
      "transactions": [],
      "bills": [],
      "biweeklyNeed": 100
    }
  ],
  "totals": {
    "totalAllocated": 1700,
    "totalSpent": 0,
    "totalBalance": 1700,
    "totalUpcoming": 1200,
    "totalBiweeklyNeed": 700,
    "billsDueCount": 1,
    "envelopeCount": 2
  }
}
```

## Multi-User Scenarios

The API is designed to handle multiple concurrent users efficiently:

### Scenario 1: Concurrent Single-User Requests

Multiple users can make requests simultaneously. Each request is:
- Processed independently
- Isolated in memory
- Discarded after response

**No cross-user contamination is possible.**

### Scenario 2: Batch Processing

For scenarios where a single client needs to calculate budgets for multiple users:

```typescript
POST /api/budget/batch

{
  requests: [
    {
      userId: "user1",
      envelopes: [...],
      transactions: [...],
      bills: [...]
    },
    {
      userId: "user2",
      envelopes: [...],
      transactions: [...],
      bills: [...]
    }
  ]
}

// Response
{
  success: true,
  results: [
    {
      userId: "user1",
      success: true,
      data: [...],
      totals: {...}
    },
    {
      userId: "user2",
      success: true,
      data: [...],
      totals: {...}
    }
  ],
  summary: {
    totalRequests: 2,
    successfulCount: 2,
    failedCount: 0,
    totalEnvelopes: 150,
    totalTransactions: 1500,
    totalBills: 50
  }
}
```

## Performance Characteristics

### Benchmarks

Based on Go benchmark tests:

| Dataset Size | Processing Time | Memory Usage |
|-------------|-----------------|--------------|
| 10 envelopes, 100 transactions | ~1ms | ~50KB |
| 100 envelopes, 1000 transactions | ~5ms | ~500KB |
| 1000 envelopes, 10000 transactions | ~50ms | ~5MB |

### Optimization Tips

1. **Filter data client-side**: Only send relevant envelopes/transactions
2. **Batch requests**: Group calculations when possible
3. **Use caching**: Cache results client-side for repeated calculations
4. **Pagination**: For large result sets, paginate client-side

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Invalid JSON | 400 | Malformed request body | Validate JSON before sending |
| Method not allowed | 405 | Wrong HTTP method | Use POST |
| Internal server error | 500 | Server error | Retry with exponential backoff |

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error description"
}
```

## Privacy & Security

### Privacy Guarantees

1. **No Data Storage**: All data is processed in-memory only
2. **No Logging**: User data is never logged (only metadata like request counts)
3. **No Analytics**: No tracking or analytics on user data
4. **Immediate Disposal**: Data is garbage-collected after response

### Security Headers

The API returns the following security headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
Content-Type: application/json
```

### HTTPS Required

In production, all requests must use HTTPS.

## Testing

### Unit Tests

Run unit tests:
```bash
cd api/budget
go test -v
```

### Integration Tests

Test against live endpoint:
```bash
curl -X POST https://violet-vault.vercel.app/api/budget \
  -H "Content-Type: application/json" \
  -d @test-data/sample-request.json
```

### Load Testing

Benchmark concurrent requests:
```bash
go test -bench=. -benchmem
```

## Client Integration

### TypeScript/JavaScript

```typescript
import { BudgetEngineService } from '@/services/api/budgetEngineService';

const response = await BudgetEngineService.calculateBudget(
  envelopes,
  transactions,
  bills
);

if (response.success) {
  const { data, totals } = response.data;
  console.log(`Calculated ${totals.envelopeCount} envelopes`);
}
```

### Python

```python
import requests

response = requests.post(
    'https://violet-vault.vercel.app/api/budget',
    json={
        'envelopes': [...],
        'transactions': [...],
        'bills': [...]
    }
)

data = response.json()
if data['success']:
    print(f"Calculated {data['totals']['envelopeCount']} envelopes")
```

### cURL

```bash
curl -X POST https://violet-vault.vercel.app/api/budget \
  -H "Content-Type: application/json" \
  -d '{
    "envelopes": [...],
    "transactions": [...],
    "bills": [...]
  }'
```

## Versioning

Current version: **2.0.0**

API versioning follows Semantic Versioning:
- **Major**: Breaking changes
- **Minor**: New features (backwards compatible)
- **Patch**: Bug fixes

## Rate Limiting

Currently, no rate limiting is enforced. For production use:
- Recommended: Max 100 requests/minute per IP
- Timeout: 60 seconds per request

## Support

- **Issues**: https://github.com/thef4tdaddy/violet-vault/issues
- **Discussions**: https://github.com/thef4tdaddy/violet-vault/discussions
- **Documentation**: https://github.com/thef4tdaddy/violet-vault/tree/main/api

## License

CC-BY-NC-SA-4.0 - See [LICENSE](../../LICENSE) for details.
