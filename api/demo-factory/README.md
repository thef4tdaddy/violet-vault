# Demo Factory API

High-performance Go service for generating realistic mock financial data for VioletVault's Demo Sandbox mode.

## Overview

The Demo Factory generates massive, realistic financial datasets in memory with realistic merchant names and balanced math. All data is synthetic and generated on-the-fly with zero database persistence.

## Performance

- **10,000+ records in <10ms** (requirement: <100ms ✅)
- **50,000+ records in ~29ms**
- Benchmark-verified performance on every build

## API Endpoint

### `GET /api/demo-factory`

Generates synthetic budget data including envelopes, transactions, and bills.

#### Query Parameters

- `count` (optional): Target number of records to generate (default: 10000, max: 100000)

#### Response

```json
{
  "envelopes": [
    {
      "id": "env-1",
      "name": "Groceries Fund",
      "type": "standard",
      "category": "Groceries",
      "currentBalance": 2543.87,
      "color": "#3B82F6",
      "autoAllocate": true,
      "archived": false,
      "lastModified": 1738501234567,
      "createdAt": 1706965234567,
      "monthlyBudget": 850.00,
      "biweeklyAllocation": 425.00
    }
  ],
  "transactions": [
    {
      "id": "txn-1",
      "date": "2025-12-15",
      "amount": -45.67,
      "envelopeId": "env-1",
      "category": "Groceries",
      "type": "expense",
      "merchant": "Whole Foods Market",
      "description": "Purchase at Whole Foods Market",
      "lastModified": 1738501234567,
      "createdAt": 1734220834567,
      "isScheduled": false
    }
  ],
  "bills": [
    {
      "id": "bill-1",
      "name": "Rent/Mortgage",
      "type": "liability",
      "category": "Bills",
      "currentBalance": 1850.00,
      "color": "#EF4444",
      "status": "active",
      "dueDate": 1,
      "interestRate": 0,
      "minimumPayment": 277.50,
      "creditor": "Rent/Mortgage",
      "isPaid": false,
      "originalBalance": 1850.00
    }
  ],
  "generatedAt": "2026-02-02T13:47:14Z",
  "recordCount": 10000,
  "generationTimeMs": 7
}
```

## Features

### ✅ Realistic Data

- **Merchant Names**: 80+ real merchant names organized by category (Groceries, Dining, Shopping, etc.)
- **Balanced Math**: Income always exceeds expenses by at least 20% buffer
- **Relationship Mapping**: All transaction `envelopeId` fields reference valid envelopes
- **Type Distribution**: Mix of standard envelopes (80%), goal envelopes (20%), and liability envelopes (bills)

### ✅ Performance Optimized

- Native Go structs for speed
- Pre-allocated slices to minimize memory allocations
- Fixed random seed for reproducible benchmarks
- Zero database I/O (all in-memory)

### ✅ Type Safety

- Matches TypeScript schemas exactly:
  - `Envelope` → `EnvelopeSchema` (standard, goal, liability, supplemental)
  - `Transaction` → `TransactionSchema` (income, expense, transfer)
  - `Bill` → `LiabilityEnvelope`
- JSON serialization with proper field tags

## Data Categories

### Merchants by Category

- **Groceries**: Whole Foods, Trader Joe's, Safeway, Kroger, Publix, etc.
- **Dining**: Chipotle, Panera, Starbucks, McDonald's, Chick-fil-A, etc.
- **Transportation**: Shell, Chevron, Uber, Lyft, AutoZone, etc.
- **Entertainment**: Netflix, Spotify, Amazon Prime, Disney+, HBO Max, etc.
- **Shopping**: Amazon, Best Buy, Home Depot, IKEA, Macy's, etc.
- **Healthcare**: CVS, Walgreens, Kaiser Permanente, etc.
- **Utilities**: PG&E, Duke Energy, Comcast, AT&T, Verizon, etc.
- **Personal**: Planet Fitness, LA Fitness, Ulta Beauty, Sephora, etc.

## Usage Examples

### Default (10k records)
```bash
curl https://violet-vault.vercel.app/api/demo-factory
```

### Custom count (5k records)
```bash
curl https://violet-vault.vercel.app/api/demo-factory?count=5000
```

### From Frontend
```typescript
import { useQuery } from '@tanstack/react-query';

const useDemoData = () => {
  return useQuery({
    queryKey: ['demo-data'],
    queryFn: async () => {
      const response = await fetch('/api/demo-factory?count=10000');
      return response.json();
    },
    staleTime: Infinity, // Demo data doesn't change
  });
};
```

## Testing

```bash
# Run all tests
cd api && go test -v ./demo-factory/...

# Run benchmarks
cd api && go test -bench=. -benchmem ./demo-factory/...

# Run specific test
cd api && go test -v ./demo-factory/... -run TestGenerateMockData_PerformanceRequirement
```

## Benchmark Results

```
BenchmarkGenerateMockData_10k-4      210    5699228 ns/op    2590244 B/op    68487 allocs/op
BenchmarkGenerateMockData_50k-4       38   28992893 ns/op   13206049 B/op   344357 allocs/op
BenchmarkHandler-4                    85   13879238 ns/op    6869968 B/op    68578 allocs/op
```

**Translation**: 
- 10k records: ~5.7ms ⚡
- 50k records: ~29ms ⚡
- Full HTTP request cycle: ~13.9ms ⚡

## Architecture

```
/api/demo-factory/
├── types.go          # Type definitions matching TypeScript schemas
├── generator.go      # Core data generation logic
├── index.go          # Vercel serverless handler
├── generator_test.go # Unit & benchmark tests
└── index_test.go     # HTTP handler tests
```

## Security & Privacy

- ✅ **Zero user data input**: Purely synthetic generation
- ✅ **Zero database persistence**: All data stays in memory
- ✅ **Zero PII**: No personally identifiable information generated
- ✅ **CORS enabled**: Allows frontend access

## Related Issues

- Epic: #172 - Go Hyperspeed Mock Data Factory
- Milestone: v2.1 - Sentinel Share, Dashboard & Marketing

## License

Part of VioletVault - See parent repository for license information.
