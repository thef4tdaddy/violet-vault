# Test Schema Factories and Fixtures (Phase 3)

**Phase 3** of the Zod schema implementation provides a comprehensive set of test factories and fixtures to make testing easier and more maintainable.

## Purpose

- **Consistency**: Generate test data that always conforms to the latest Zod schemas
- **Maintainability**: When schemas change, update factories once instead of hundreds of tests
- **Convenience**: Quick creation of valid test data with sensible defaults
- **Reusability**: Predefined fixtures for common testing scenarios

## Architecture

```
src/utils/testing/factories/
├── index.ts                    # Main export barrel
├── domainFactories.ts          # Domain model factories (envelopes, bills, etc.)
├── apiResponseFactories.ts     # API response factories (Firebase, GitHub, etc.)
├── fixtures.ts                 # Predefined test data sets
├── factoryUtils.ts             # Helper utilities
├── __tests__/                  # Factory tests
└── README.md                   # This file
```

## Quick Start

```typescript
import {
  createEnvelope,
  createBill,
  createTransaction,
  standardEnvelopes,
  fullBudgetState,
} from "@/utils/testing/factories";

// Create a single entity with defaults
const envelope = createEnvelope();

// Create with custom properties
const bill = createBill({
  name: "Electric Bill",
  amount: 150,
  category: "utilities",
});

// Create multiple entities
const envelopes = createEnvelopes(10);

// Use predefined fixtures
const budget = fullBudgetState; // Complete budget with all data types
```

## Domain Model Factories

### Envelope Factories

```typescript
// Basic envelope
const envelope = createEnvelope();

// Custom envelope
const groceries = createEnvelope({
  name: "Groceries",
  category: "groceries",
  currentBalance: 250,
  targetAmount: 500,
});

// Partial envelope for updates
const updates = createEnvelopePartial({ currentBalance: 300 });

// Batch creation
const envelopes = createEnvelopes(5);
```

### Bill Factories

```typescript
// Basic bill
const bill = createBill();

// Recurring bill
const internet = createRecurringBill({
  name: "Internet",
  amount: 79.99,
  frequency: "monthly",
});

// Custom bill
const insurance = createBill({
  name: "Car Insurance",
  amount: 125,
  isPaid: true,
});

// Batch creation
const bills = createBills(10);
```

### Transaction Factories

```typescript
// Basic transaction (expense by default)
const transaction = createTransaction();

// Income transaction
const salary = createIncomeTransaction({
  description: "Monthly Salary",
  amount: 5000,
});

// Transfer transaction
const transfer = createTransferTransaction({
  amount: 200,
});

// Batch creation
const transactions = createTransactions(50);
```

### Savings Goal Factories

```typescript
// Basic savings goal
const goal = createSavingsGoal();

// Custom goal
const vacation = createSavingsGoal({
  name: "Vacation to Hawaii",
  targetAmount: 3000,
  currentAmount: 1200,
  priority: "high",
});

// Completed goal
const completedGoal = createCompletedSavingsGoal();

// Batch creation
const goals = createSavingsGoals(5);
```

## API Response Factories

### Generic API Responses

```typescript
// Success response
const success = createAPISuccessResponse({
  data: { userId: "123" },
  message: "Operation completed",
});

// Error response
const error = createAPIErrorResponse({
  error: "Something went wrong",
  code: "ERROR_CODE",
});
```

### Firebase Responses

```typescript
// Firebase document
const doc = createFirebaseDocument();

// Firebase chunk
const chunk = createFirebaseChunk({
  chunkIndex: 0,
  totalChunks: 5,
});

// Firebase manifest
const manifest = createFirebaseManifest({
  totalChunks: 10,
  totalSize: 50000,
});

// Firebase sync status
const status = createFirebaseSyncStatus({
  isOnline: true,
  queuedOperations: 0,
});

// Multiple chunks
const chunks = createFirebaseChunks(5);
```

### GitHub API Responses

```typescript
// Success response
const githubSuccess = createGitHubIssueResponse({
  issueNumber: 123,
  url: "https://github.com/repo/issues/123",
});

// Error response
const githubError = createGitHubIssueErrorResponse({
  error: "Rate limit exceeded",
});
```

### Screenshot Upload Responses

```typescript
// Success response
const uploadSuccess = createScreenshotUploadResponse({
  url: "https://cdn.example.com/screenshot.jpg",
  size: 125000,
});

// Error response
const uploadError = createScreenshotUploadErrorResponse({
  error: "Upload failed",
  reason: "File too large",
});
```

## Test Fixtures

### Standard Budget Data

```typescript
import {
  standardEnvelopes, // 5 common budget envelopes
  standardBills, // 4 common bills (recurring + one-time)
  sampleTransactions, // 5 sample transactions (mixed types)
  sampleSavingsGoals, // 4 savings goals (active + completed)
} from "@/utils/testing/factories";
```

### Budget States

```typescript
// Empty budget (new user)
const empty = emptyBudgetState;

// Full budget (active user)
const full = fullBudgetState;
```

### Budget Scenarios

```typescript
// New user scenario
const newUser = newUserScenario;
// - Minimal envelopes
// - No bills or transactions
// - Zero unassigned cash

// Active user scenario
const activeUser = activeUserScenario;
// - Full set of envelopes
// - Active bills and transactions
// - Positive unassigned cash
// - Active savings goals

// Over budget scenario
const overBudget = overBudgetScenario;
// - Negative envelope balances
// - Overdue bills
// - Negative unassigned cash
```

### Large Datasets

```typescript
// Generate large datasets for performance testing
const largeDataset = generateLargeDataset({
  envelopes: 100,
  bills: 50,
  transactions: 1000,
  savingsGoals: 20,
});
```

## Utility Functions

```typescript
import {
  generateId, // UUID v4
  generateTimestamp, // Current timestamp
  generateAmount, // Random amount in range
  generateRecentDate, // Date in past N days
  generateFutureDate, // Date in future N days
  generateColor, // Random hex color
  generateText, // Random alphanumeric text
  pickRandom, // Pick random item from array
  mergeDefaults, // Merge objects
} from "@/utils/testing/factories";

// Examples
const id = generateId();
const amount = generateAmount(100, 500);
const date = generateFutureDate(30);
const color = generateColor();
```

## Testing Best Practices

### 1. Use Factories for Valid Data

```typescript
import { createEnvelope } from "@/utils/testing/factories";

it("should validate envelope", () => {
  const envelope = createEnvelope();
  expect(() => validateEnvelope(envelope)).not.toThrow();
});
```

### 2. Use Fixtures for Scenarios

```typescript
import { fullBudgetState } from "@/utils/testing/factories";

it("should handle full budget state", () => {
  const state = fullBudgetState;
  expect(state.envelopes).toHaveLength(5);
  expect(state.bills).toHaveLength(4);
});
```

### 3. Override Defaults as Needed

```typescript
import { createBill } from "@/utils/testing/factories";

it("should handle paid bills", () => {
  const bill = createBill({ isPaid: true });
  expect(bill.isPaid).toBe(true);
});
```

### 4. Batch Creation for Lists

```typescript
import { createTransactions } from "@/utils/testing/factories";

it("should handle multiple transactions", () => {
  const transactions = createTransactions(100);
  expect(transactions).toHaveLength(100);
});
```

## Schema Validation

All factory-generated data automatically conforms to Zod schemas:

```typescript
import { createEnvelope } from "@/utils/testing/factories";
import { validateEnvelope } from "@/domain/schemas";

const envelope = createEnvelope();

// This will never throw because factories generate valid data
const validated = validateEnvelope(envelope);
```

## Integration with Tests

### Unit Tests

```typescript
import { createBill } from "@/utils/testing/factories";

describe("BillCalculations", () => {
  it("should calculate due date", () => {
    const bill = createBill({ dueDate: new Date("2024-12-25") });
    const result = calculateDueDate(bill);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

```typescript
import { fullBudgetState } from "@/utils/testing/factories";

describe("Budget Service", () => {
  it("should save budget state", async () => {
    const state = fullBudgetState;
    await budgetService.saveBudget(state);
    const loaded = await budgetService.loadBudget();
    expect(loaded).toEqual(state);
  });
});
```

### Component Tests

```typescript
import { standardEnvelopes } from '@/utils/testing/factories';

describe('EnvelopeGrid', () => {
  it('should render envelopes', () => {
    render(<EnvelopeGrid envelopes={standardEnvelopes} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });
});
```

## Adding New Factories

When adding new domain models or API responses:

1. **Add factory to appropriate file** (domainFactories.ts or apiResponseFactories.ts)
2. **Follow naming convention**: `create{EntityName}`, `create{EntityName}Partial`
3. **Use utility functions** from factoryUtils.ts
4. **Provide sensible defaults** that pass schema validation
5. **Support overrides** via Partial type parameter
6. **Add tests** in **tests** directory
7. **Export from index.ts**

Example:

```typescript
// domainFactories.ts
export const createDebt = (overrides?: Partial<Debt>): Debt => {
  const defaults: Debt = {
    id: generateId(),
    name: `Debt ${generateId().substring(0, 8)}`,
    amount: generateAmount(1000, 10000),
    // ... other required fields
  };

  return mergeDefaults(defaults, overrides);
};
```

## Related Documentation

- **[Domain Schemas README](/src/domain/schemas/README.md)** - Zod schema documentation
- **[API Response Validation Guide](/docs/API-Response-Validation-Guide.md)** - Phase 2 guide
- **[Testing Documentation](/docs/TESTING_DOCUMENTATION.md)** - General testing guide

## Phase Integration

- **Phase 1**: Domain model Zod schemas (Issue #412)
- **Phase 2**: API response validation schemas (Current PR)
- **Phase 3**: Test factories and fixtures (This module) ✅

## Commands

```bash
# Run factory tests
npm test -- src/utils/testing/factories/__tests__/

# Run specific factory test
npm test -- src/utils/testing/factories/__tests__/domainFactories.test.ts

# Run with coverage
npm run test:coverage -- src/utils/testing/factories/
```

## Summary

Test factories provide:

- ✅ **Type-safe test data** that conforms to Zod schemas
- ✅ **Reduced test maintenance** when schemas change
- ✅ **Quick test setup** with sensible defaults
- ✅ **Predefined scenarios** for common testing needs
- ✅ **Consistent patterns** across the test suite
- ✅ **Better test readability** with descriptive factories

Use factories in all new tests to ensure consistency and maintainability!
