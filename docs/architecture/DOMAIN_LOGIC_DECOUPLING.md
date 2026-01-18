# Domain Logic Decoupling - Architecture Documentation

## Overview

This refactoring addresses Issue #1463 by decoupling domain logic from side effects in bill discovery and paycheck processing modules. The goal is to create pure, testable functions that return execution plans rather than directly performing operations.

## Architectural Pattern: Execution Plan

### Core Principle

**Domain logic should describe WHAT to do, not HOW to do it.**

The execution plan pattern separates concerns:

1. **Pure Domain Logic** - Creates plans (no side effects)
2. **Service Layer** - Executes plans (all side effects)
3. **API/Hook Layer** - Orchestrates the flow

### Benefits

- ✅ **Testability**: Pure functions are easy to test without mocks
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Reusability**: Domain logic can be used in different contexts
- ✅ **Predictability**: No hidden side effects in business logic
- ✅ **Debuggability**: Plans can be logged and inspected before execution

## Module Structure

### Paycheck Processing

#### Before Refactoring

```
paycheckProcessing.ts
├── processPaycheck() - Mixed domain logic and database operations
├── getCurrentBalances() - Database reads
├── processEnvelopeAllocations() - Database writes
└── createPaycheckRecord() - Database writes
```

#### After Refactoring

```
paycheckProcessingTypes.ts
├── PaycheckExecutionPlan
├── EnvelopeAllocation
├── BalanceUpdate
└── TransactionCreationPlan

paycheckProcessingCore.ts (PURE DOMAIN LOGIC)
├── createPaycheckExecutionPlan() - Returns execution plan
├── calculateTotalAllocated() - Pure calculation
└── validatePaycheckInput() - Pure validation

services/budgeting/paycheckService.ts (SIDE EFFECTS)
├── getCurrentBalances() - Database reads
├── executeEnvelopeAllocations() - Database writes
├── enrichAllocationsWithNames() - Database reads
└── executePaycheckPlan() - Orchestrates all side effects

paycheckProcessing.ts (BACKWARD COMPATIBILITY)
└── processPaycheck() - Wrapper using new architecture
```

### Bill Discovery

`billDiscovery.ts` was already pure and stateless:

```
billDiscovery.ts (ALREADY PURE ✅)
├── analyzeTransactionsForBills() - Pure analysis
├── generateBillSuggestions() - Pure suggestions
└── BILL_PATTERNS - Static configuration
```

## Usage Examples

### Creating an Execution Plan (Pure)

```typescript
import { createPaycheckExecutionPlan } from "@/utils/domain/budgeting/paycheckProcessingCore";

// This is pure - no side effects
const plan = createPaycheckExecutionPlan(
  {
    amount: 2000,
    mode: "allocate",
    envelopeAllocations: [{ envelopeId: "env-1", amount: 500 }],
  },
  currentBalances
);

// Plan can be inspected, logged, modified before execution
console.log("Plan created:", plan.paycheckId);
console.log("Balance updates:", plan.balanceUpdates);
console.log("Validation:", plan.validation);
```

### Executing a Plan (Side Effects)

```typescript
import { executePaycheckPlan } from "@/services/budgeting/paycheckService";

// This performs all side effects
const result = await executePaycheckPlan(plan);
```

### Using the Backward-Compatible API

```typescript
import { processPaycheck } from "@/utils/domain/budgeting/paycheckProcessing";

// Works exactly like before, but uses new architecture internally
const result = await processPaycheck(paycheckData, envelopesQuery, savingsQuery);
```

## Testing Strategy

### Pure Domain Logic Tests

Test pure functions without mocks:

```typescript
describe("createPaycheckExecutionPlan", () => {
  it("should create valid execution plan", () => {
    const plan = createPaycheckExecutionPlan(input, balances);

    expect(plan.paycheckId).toBeDefined();
    expect(plan.balanceUpdates).toEqual(expectedBalances);
    // No database mocks needed!
  });
});
```

### Service Layer Tests

Test side effects with mocks:

```typescript
describe("executePaycheckPlan", () => {
  it("should update database correctly", async () => {
    vi.mock("@/db/budgetDb");

    await executePaycheckPlan(plan);

    expect(budgetDb.envelopes.update).toHaveBeenCalled();
  });
});
```

## Migration Guide

### For Existing Code

No changes required! The `processPaycheck` function maintains backward compatibility.

### For New Code

Prefer using the new architecture:

```typescript
// 1. Get current state (side effect)
const balances = await getCurrentBalances(envelopes, savings);

// 2. Create plan (pure)
const plan = createPaycheckExecutionPlan(data, balances);

// 3. Validate plan (pure)
if (!plan.validation.isValid) {
  throw new Error(plan.validation.errors.map(error => error.message).join(", "));
}

// 4. Execute plan (side effect)
const result = await executePaycheckPlan(plan);
```

## Guidelines for Future Development

### When Adding New Domain Logic

1. **Create types** in `*Types.ts` files
2. **Write pure functions** in `*Core.ts` files
3. **Create service layer** in `services/` directory
4. **Test pure logic** without mocks
5. **Test service layer** with mocks

### Characteristics of Pure Domain Logic

- ✅ Takes inputs, returns outputs
- ✅ No database calls
- ✅ No API calls
- ✅ No logging (except in service layer)
- ✅ No side effects
- ✅ Deterministic (same input → same output)
- ✅ Easy to test

### Characteristics of Service Layer

- ✅ Executes plans from domain logic
- ✅ Performs database operations
- ✅ Handles API calls
- ✅ Logs operations
- ✅ Manages side effects
- ✅ Orchestrates execution flow

## Related Issues

- Issue #1463 - Domain Logic Decoupling
- Issue #1340 - Transaction Record Creation

## Files Changed

- `src/utils/domain/budgeting/paycheckProcessingTypes.ts` - New
- `src/utils/domain/budgeting/paycheckProcessingCore.ts` - New
- `src/services/budgeting/paycheckService.ts` - New
- `src/utils/domain/budgeting/paycheckProcessing.ts` - Refactored
- `src/utils/domain/budgeting/__tests__/paycheckProcessingCore.test.ts` - New
- `src/utils/domain/budgeting/__tests__/paycheckProcessing.test.ts` - Updated
