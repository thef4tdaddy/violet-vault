# Data Model Migration Guide (v2.0)

**Version:** 2.0.0  
**Last Updated:** November 2025  
**Related Issue:** #1344 - Testing & Documentation for Simplified Model

---

## Overview

This guide documents the migration from the v1.x data model to the simplified v2.0 envelope-based data model. The new model consolidates savings goals and supplemental accounts into the envelopes table with type-based filtering.

---

## Summary of Changes

### Before (v1.x Model)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────┐
│   envelopes     │    │  savingsGoals   │    │ supplementalAccounts│
│   (regular)     │    │  (separate)     │    │    (in metadata)    │
└─────────────────┘    └─────────────────┘    └─────────────────────┘
```

### After (v2.0 Model)

```
┌─────────────────────────────────────────────────────────────────┐
│                        envelopes                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │
│  │   bill   │  │ variable │  │ savings  │  │  supplemental   │  │
│  │ (UI)     │  │  (UI)    │  │ (goals)  │  │   (accounts)    │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Changes

### 1. Savings Goals → Envelopes

**Before:**

```typescript
// savingsGoals table
{
  id: "goal-1",
  name: "Emergency Fund",
  category: "Savings",
  priority: "high",
  targetAmount: 10000,
  currentAmount: 2500,    // Note: currentAmount
  isPaused: false,
  isCompleted: false,
  targetDate: "2025-12-31",
  lastModified: 1701234567890
}
```

**After:**

```typescript
// envelopes table (with envelopeType: "savings")
{
  id: "goal-1",
  name: "Emergency Fund",
  category: "Savings",
  archived: false,         // Maps from isCompleted
  lastModified: 1701234567890,
  envelopeType: "savings", // NEW: Type classification
  currentBalance: 2500,    // Renamed from currentAmount
  targetAmount: 10000,
  priority: "high",
  isPaused: false,
  isCompleted: false,
  targetDate: "2025-12-31"
}
```

### 2. Supplemental Accounts → Envelopes

**Before:**

```typescript
// Stored in budget metadata
budgetMetadata.supplementalAccounts = [
  {
    id: "hsa-1",
    name: "Health Savings Account",
    type: "HSA",
    balance: 5000,
    annualContribution: 3850,
    isActive: true,
    expirationDate: null,
  },
];
```

**After:**

```typescript
// envelopes table (with envelopeType: "supplemental")
{
  id: "hsa-1",
  name: "Health Savings Account",
  category: "Healthcare",
  archived: false,
  lastModified: 1701234567890,
  envelopeType: "supplemental", // NEW: Type classification
  currentBalance: 5000,         // Renamed from balance
  annualContribution: 3850,
  accountType: "HSA",           // Renamed from type
  isActive: true,
  expirationDate: null
}
```

### 3. Sinking Funds → Savings Envelopes

**Before:**

```typescript
// envelopes table with envelopeType: "sinking_fund"
{
  id: "sink-1",
  name: "New Car Fund",
  envelopeType: "sinking_fund", // Deprecated type
  targetAmount: 20000,
  currentBalance: 5000,
  targetDate: "2026-06-01"
}
```

**After:**

```typescript
// envelopes table with envelopeType: "savings"
{
  id: "sink-1",
  name: "New Car Fund",
  envelopeType: "savings",      // Use savings with targetDate
  targetAmount: 20000,
  currentBalance: 5000,
  targetDate: "2026-06-01",     // Presence of targetDate indicates sinking fund
  priority: "medium",
  isPaused: false,
  isCompleted: false
}
```

---

## Migration Service

The migration is handled automatically by `envelopeMigrationService.ts`:

```typescript
import {
  runEnvelopeMigration,
  isMigrationNeeded,
} from "@/services/migrations/envelopeMigrationService";

// Check if migration is needed
const needsMigration = await isMigrationNeeded();

if (needsMigration) {
  const result = await runEnvelopeMigration();
  console.log("Migration result:", result);
  // {
  //   success: true,
  //   migratedSavingsGoals: 5,
  //   migratedSupplementalAccounts: 2,
  //   migratedSinkingFunds: 1,
  //   errors: [],
  //   warnings: []
  // }
}
```

---

## Query Updates

### Filtering Envelopes by Type

```typescript
import { ENVELOPE_TYPES } from "@/constants/categories";
import { budgetDb } from "@/db/budgetDb";

// Regular envelopes for main envelope UI
const regularEnvelopes = await budgetDb.envelopes
  .filter(
    (env) =>
      !env.archived &&
      (!env.envelopeType ||
        env.envelopeType === ENVELOPE_TYPES.BILL ||
        env.envelopeType === ENVELOPE_TYPES.VARIABLE)
  )
  .toArray();

// Savings goals (for savings goals page)
const savingsGoals = await budgetDb.envelopes
  .where("envelopeType")
  .equals(ENVELOPE_TYPES.SAVINGS)
  .filter((env) => !env.archived)
  .toArray();

// Supplemental accounts (for supplemental accounts page)
const supplementalAccounts = await budgetDb.envelopes
  .where("envelopeType")
  .equals(ENVELOPE_TYPES.SUPPLEMENTAL)
  .filter((env) => !env.archived)
  .toArray();

// All envelopes (for admin/export)
const allEnvelopes = await budgetDb.envelopes.toArray();
```

### Using TanStack Query Hooks

```typescript
// Regular envelopes (default behavior)
const { data: envelopes } = useEnvelopesQuery();

// Include savings/supplemental (for admin views)
const { data: allEnvelopes } = useEnvelopesQuery({
  includeAllTypes: true,
});
```

---

## Zod Schema Usage

### Validating Different Envelope Types

```typescript
import {
  EnvelopeSchema,
  SavingsEnvelopeSchema,
  SupplementalAccountSchema,
  validateEnvelope,
  validateSavingsEnvelope,
  validateSupplementalAccount,
} from "@/domain/schemas/envelope";

// Validate generic envelope
const validated = validateEnvelope(data);

// Validate savings envelope (stricter)
const savingsEnvelope = validateSavingsEnvelope(data);

// Validate supplemental account (stricter)
const supplementalAccount = validateSupplementalAccount(data);

// Safe parsing (returns result instead of throwing)
const result = EnvelopeSchema.safeParse(data);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

---

## Import/Export Format Changes

### Export Format (v2.0)

```json
{
  "exportMetadata": {
    "version": "2.0.0",
    "budgetId": "budget-123",
    "exportDate": "2025-11-27T12:00:00Z"
  },
  "envelopes": [
    {
      "id": "env-1",
      "name": "Groceries",
      "category": "Food",
      "envelopeType": "variable",
      "currentBalance": 500
    },
    {
      "id": "savings-1",
      "name": "Emergency Fund",
      "category": "Savings",
      "envelopeType": "savings",
      "targetAmount": 10000,
      "currentBalance": 2500
    },
    {
      "id": "supp-1",
      "name": "HSA",
      "category": "Healthcare",
      "envelopeType": "supplemental",
      "accountType": "HSA",
      "currentBalance": 3000
    }
  ],
  "transactions": [...],
  "bills": [...],
  "debts": [...]
}
```

### Backward Compatibility

The import function handles legacy formats:

```typescript
// Legacy savingsGoals array is converted to savings envelopes
if (data.savingsGoals && Array.isArray(data.savingsGoals)) {
  const convertedGoals = data.savingsGoals.map((goal) => ({
    ...goal,
    envelopeType: "savings",
    currentBalance: goal.currentAmount,
  }));
  envelopes.push(...convertedGoals);
}

// Legacy supplementalAccounts array is converted to supplemental envelopes
if (data.supplementalAccounts && Array.isArray(data.supplementalAccounts)) {
  const convertedAccounts = data.supplementalAccounts.map((account) => ({
    ...account,
    envelopeType: "supplemental",
    currentBalance: account.balance,
    accountType: account.type,
  }));
  envelopes.push(...convertedAccounts);
}
```

---

## Transaction Model

All financial operations create transactions:

### Income (Paycheck)

```typescript
// Income goes to "unassigned" envelope
const incomeTransaction = {
  id: "txn-income-1",
  date: new Date(),
  amount: 2000, // Positive for income
  envelopeId: "unassigned",
  category: "Income",
  type: "income",
  description: "Paycheck from Employer",
  lastModified: Date.now(),
};
```

### Paycheck Distribution (Internal Transfers)

```typescript
// Transfers from unassigned to envelopes
const transferTransaction = {
  id: "txn-transfer-1",
  date: new Date(),
  amount: -500, // Negative (leaving unassigned)
  envelopeId: "rent-envelope",
  category: "Transfer",
  type: "transfer",
  description: "Paycheck allocation to Rent",
  isInternalTransfer: true,
  paycheckId: "paycheck-123",
  fromEnvelopeId: "unassigned",
  toEnvelopeId: "rent-envelope",
  lastModified: Date.now(),
};
```

### Expense

```typescript
const expenseTransaction = {
  id: "txn-expense-1",
  date: new Date(),
  amount: -50, // Negative for expense
  envelopeId: "groceries-envelope",
  category: "Food",
  type: "expense",
  description: "Weekly groceries",
  lastModified: Date.now(),
};
```

---

## Testing the Migration

### Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import {
  convertSavingsGoalToEnvelope,
  convertSupplementalAccountToEnvelope,
  runEnvelopeMigration,
} from "@/services/migrations/envelopeMigrationService";

describe("Migration Tests", () => {
  it("should convert savings goal to envelope", () => {
    const goal = {
      id: "goal-1",
      name: "Vacation",
      targetAmount: 5000,
      currentAmount: 1000,
    };

    const envelope = convertSavingsGoalToEnvelope(goal);

    expect(envelope.envelopeType).toBe("savings");
    expect(envelope.currentBalance).toBe(1000);
    expect(envelope.targetAmount).toBe(5000);
  });
});
```

### Integration Tests

Run the migration tests:

```bash
npm run test:run -- src/services/migrations/__tests__
```

---

## Troubleshooting

### Common Issues

1. **Duplicate IDs**: If a savings goal has the same ID as an existing envelope, the migration will skip it and add a warning.

2. **Missing Fields**: The migration provides defaults for missing optional fields.

3. **Invalid Data**: Invalid records are logged as errors but don't stop the migration.

### Checking Migration Status

```typescript
import { getMigrationStatus } from "@/services/migrations/envelopeMigrationService";

const status = await getMigrationStatus();
console.log(status);
// {
//   needsMigration: false,
//   savingsGoalsCount: 0,
//   supplementalAccountsCount: 0,
//   sinkingFundsCount: 0,
//   savingsEnvelopesCount: 5,
//   supplementalEnvelopesCount: 2
// }
```

---

## Version History

- **v2.0.0** (November 2025)
  - Unified envelope model for savings goals and supplemental accounts
  - Deprecated `sinking_fund` envelope type (use `savings` with `targetDate`)
  - Removed `supplementalAccounts` from budget metadata
  - Added migration service for automatic data conversion

---

**Last Updated:** November 27, 2025  
**Maintained By:** VioletVault Contributors
