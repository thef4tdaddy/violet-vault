# Data Model Simplification

## Architecture Overview

The VioletVault data model has been simplified to a **two-entity system** with **one metadata record**:

1. **Envelopes** - Where all money is kept (source of truth)
2. **Transactions** - All financial operations (income, expenses, transfers)
3. **Budget Metadata** - High-level balance metadata (actual balance, unassigned cash, etc.)

## Core Principles

### 1. Envelopes Are the Source of Truth

- **All money lives in envelopes**
- Envelopes track `currentBalance` - the actual money available
- Every financial operation routes through an envelope

### 2. Everything Is an Envelope (Behind the Scenes)

- **Regular envelopes**: Standard budgeting envelopes (shown in envelope UI)
  - Types: `bill`, `variable`, `savings`
  - Savings envelopes = savings goals (same entity, different UI presentation)
- **Supplemental accounts**: Special envelope type (FSA, HSA, gift cards, etc.)
  - Stored as envelopes in database with `envelopeType: "supplemental"`
  - Filtered from envelope UI (shown on separate supplemental accounts page)

### 3. Bills Are Just Planned Transactions

- Bills are **not** money holders - they're just recurring transaction plans
- Paying a bill = creating a transaction to an envelope
- Bills track:
  - `amount`: Planned payment amount
  - `dueDate`: When payment is due
  - `envelopeId`: Which envelope the payment will come from
  - `isPaid`: Whether the planned transaction has been executed

### 4. Debts Are Bills with Finite Amount/Time

- Debts are bills with additional tracking:
  - `currentBalance`: Remaining debt amount
  - `minimumPayment`: Required payment amount
  - `interestRate`: Interest calculation
- Paying a debt = creating a transaction to an envelope
- Same as bills: not money holders, just planned transactions

### 5. Transactions Are the Only Way Money Moves

- **All** financial operations create transactions:
  - Income → transaction to `unassigned` (one transaction per paycheck)
  - Paycheck distribution → internal transfer transactions from `unassigned` to envelopes (can be hidden from main transaction view)
  - Expense → transaction from envelope
  - Transfer → transaction between envelopes
  - Bill payment → transaction from envelope
  - Debt payment → transaction from envelope
- Transactions **always** require an envelope (income uses `"unassigned"`)
- Transactions update envelope balances automatically
- Unassigned cash is a special envelope that holds money before it's allocated
- **Paycheck processing** = 1 income transaction + N internal transfer transactions (transfers can be filtered/hidden as "internal operations")

## Data Flow

```text
User Action → Transaction → Envelope Balance Update
```

### Example: Paying a Bill

1. User clicks "Pay Bill" for $100 rent bill
2. System creates transaction:
   - `amount: -100` (expense)
   - `envelopeId: "rent-envelope"`
   - `description: "Rent Payment"`
   - `type: "expense"`
3. Transaction validates with Zod schema
4. Transaction saved to database
5. Envelope balance updated: `rent-envelope.currentBalance -= 100`
6. Bill marked as `isPaid: true`

### Example: Recording Income (Paycheck Processing)

**Simplest Case:**

1. User adds $2000 paycheck
2. System creates one transaction:
   - `amount: 2000` (income)
   - `envelopeId: "unassigned"`
   - `description: "Paycheck"`
   - `type: "income"`
3. Transaction validates with Zod schema
4. Transaction saved to database
5. Unassigned cash balance updated: `unassignedCash += 2000`
6. Done! (User can manually distribute later if needed)

**With Automatic Distribution:**

1. User adds $2000 paycheck and sets allocations (e.g., $500 to rent, $300 to groceries)
2. System creates one income transaction:
   - `amount: 2000` (income)
   - `envelopeId: "unassigned"`
   - `description: "Paycheck"`
   - `type: "income"`
3. System creates internal transfer transactions (from `unassigned` to envelopes):
   - Transfer 1: `amount: -500`, `envelopeId: "rent-envelope"`, `type: "transfer"`
   - Transfer 2: `amount: -300`, `envelopeId: "groceries-envelope"`, `type: "transfer"`
   - (These transfers don't need to be shown individually in transaction list - they're internal)
4. All transactions validate with Zod schema
5. Envelope balances updated accordingly
6. Unassigned cash balance: `unassignedCash = 2000 - 500 - 300 = 1200`

**Key Point**: Paycheck processing = 1 income transaction + N internal transfer transactions. The transfers are just moving money from unassigned to envelopes - they're transactions, but can be hidden from the main transaction view as "internal operations".

## Benefits of This Simplification

### 1. Consistent Data Model

- Only 2 main entities: Envelopes and Transactions
- All financial operations follow the same pattern
- Easier to understand and maintain

### 2. Single Source of Truth

- Envelopes hold all money
- No confusion about where money is stored
- Balance calculations are straightforward

### 3. Unified Validation

- All transactions use the same Zod schema
- Consistent validation rules across all operations
- Type safety throughout the application

### 4. Simplified Relationships

- Bills → Envelopes (via `envelopeId`)
- Debts → Envelopes (via `envelopeId` or through bills)
- Transactions → Envelopes (via `envelopeId`)
- No complex many-to-many relationships

### 5. Easier Testing

- Test envelope operations
- Test transaction operations
- Test relationships between them
- Fewer edge cases to handle

## Implementation Details

### Envelope Types (Filtered from UI)

- Regular envelopes: `envelopeType: "bill" | "variable" | "savings"`
  - **`bill`**: Fixed recurring amounts (rent, insurance, phone bills)
  - **`variable`**: Regular but flexible spending (gas, groceries, medical, pet expenses)
  - **`savings`**: Savings goals (same as savings goals entity)
    - Can be open-ended (no deadline) - e.g., emergency fund, general savings
    - Can be time-bound (sinking fund) - has `targetDate` metadata - e.g., "Save $5,000 for car by Dec 2025"
- Supplemental accounts: `envelopeType: "supplemental"` (or similar)
  - Stored as envelopes with additional metadata fields:
    - `currentBalance`: Account balance (standard envelope field)
    - `annualContribution`: Annual contribution limit (supplemental account metadata)
    - `expirationDate`: Account expiration date (supplemental account metadata)
    - `description`: Account description (standard envelope field)
    - `color`: UI color (standard envelope field)
    - `isActive`: Whether account is active (supplemental account metadata)
    - `type`: Account type (FSA, HSA, etc.) - stored in envelope `category` or custom field

**Note**: Sinking funds are not a separate envelope type. They are savings goals with a `targetDate` field. The distinction between open-ended savings and sinking funds is handled via metadata (presence/absence of `targetDate`), not separate types.

**Account Metadata Validation**:

- All account metadata is stored as envelope properties
- Validated with `EnvelopeSchema` (standard envelope fields)
- Additional supplemental account metadata (like `annualContribution`, `expirationDate`, `isActive`) are optional fields on the envelope
- These can be validated via `EnvelopeSchema` with `.passthrough()` or a separate `SupplementalAccountSchema` that extends `EnvelopeSchema`

**Account Balance (Individual Envelope)**:

- Account balance = `envelope.currentBalance` (standard envelope field)
- Validated by `EnvelopeSchema.currentBalance` (must be >= 0)
- All account operations (transfers, deposits, withdrawals) update `currentBalance` through transactions

**High-Level Balance Metadata (Above Everything)**:

- Stored in `budgetMetadata` record (single record in database, `id: "metadata"`)
- Contains:
  - `actualBalance`: Total account balance (sum of all income/expense transactions, or manually set)
  - `unassignedCash`: Money not yet allocated to envelopes (calculated: `actualBalance - virtualBalance`)
  - `isActualBalanceManual`: Whether actual balance is manually overridden
  - `biweeklyAllocation`: Budget allocation amount per paycheck
  - `supplementalAccounts`: Array of supplemental account data (if stored separately)
- **Virtual Balance**: Calculated (not stored) = `totalEnvelopeBalance + totalSavingsBalance`
- **Unassigned Cash**: Calculated (stored) = `actualBalance - virtualBalance`
- Validated via `BudgetRecordSchema` or `BudgetMetadataSchema` (if exists)
- Updated automatically when transactions are created/deleted
- Single source of truth for high-level financial state

### Transaction Validation

All transactions are validated with `TransactionSchema`:

- Requires `envelopeId` (envelopes are source of truth)
- Validates amount sign matches type (expense=negative, income=positive)
- Validates required fields (date, category, etc.)

### Bill Payment Flow

```typescript
// 1. Validate envelope exists
const envelope = await budgetDb.envelopes.get(envelopeId);

// 2. Create transaction
const transaction = {
  amount: -paidAmount, // Negative for expense
  envelopeId: envelopeId,
  description: bill.name,
  type: "expense",
  // ... other fields
};

// 3. Validate with Zod
const validatedTransaction = validateAndNormalizeTransaction(transaction);

// 4. Save transaction
await budgetDb.transactions.put(validatedTransaction);

// 5. Update envelope balance
envelope.currentBalance += validatedTransaction.amount;
```

### Debt Payment Flow

Same as bill payment, but with additional debt tracking:

- Update debt `currentBalance`
- Track interest vs principal
- Link transaction to debt via `debtId`

## Migration Notes

If migrating from a more complex model:

1. Convert supplemental accounts to envelopes with special type
2. Convert savings goals to envelopes with special type
3. Ensure all transactions have `envelopeId`
4. Update balance calculations to use envelope balances only
5. Filter special envelope types from envelope UI

## Future Considerations

- All financial operations should route through envelopes
- New features should follow the envelope → transaction pattern
- Avoid creating new money-holding entities
- Use envelope types for different UI presentations
