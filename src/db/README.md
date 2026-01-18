# Database Layer

## Overview

The VioletVault database layer uses Dexie.js (a wrapper around IndexedDB) with Zod validation to ensure data integrity at the storage boundary.

## Validation Layer

All database writes go through Zod validation to ensure data integrity and prevent invalid data from entering storage.

### Why Validation at the Database Layer?

1. **Data Integrity**: Ensures all data in IndexedDB conforms to our schemas
2. **Single Source of Truth**: Validation happens in one place for all writes
3. **Type Safety**: Zod schemas provide runtime type checking
4. **Consistent Error Handling**: Validation errors are logged and thrown with descriptive messages
5. **Defense in Depth**: Even if client-side validation is bypassed, database validation catches issues

## Usage

### ✅ Correct - Use Validation Methods

Always use the validated methods when writing to the database:

```typescript
import { budgetDb } from "@/db/budgetDb";

// Add envelope with validation
await budgetDb.addEnvelope(envelope);

// Update envelope with validation
await budgetDb.updateEnvelope(id, updates);

// Put (upsert) envelope with validation
await budgetDb.putEnvelope(envelope);

// Bulk operations with validation
await budgetDb.bulkUpsertEnvelopesValidated(envelopes);
```

### ❌ Incorrect - Bypassing Validation

**DO NOT** directly call Dexie table methods as they bypass validation:

```typescript
// ❌ BAD - No validation
await budgetDb.envelopes.add(envelope);

// ❌ BAD - No validation
await budgetDb.envelopes.put(envelope);

// ❌ BAD - No validation
await budgetDb.transactions.update(id, updates);
```

## Validation Methods

### Envelope Operations

| Method                                    | Description              | Schema Used              |
| ----------------------------------------- | ------------------------ | ------------------------ |
| `addEnvelope(envelope)`                   | Add new envelope         | `EnvelopeSchema`         |
| `updateEnvelope(id, updates)`             | Update existing envelope | `EnvelopePartialSchema`  |
| `putEnvelope(envelope)`                   | Upsert envelope          | `EnvelopeSchema`         |
| `bulkUpsertEnvelopesValidated(envelopes)` | Bulk upsert envelopes    | `EnvelopeSchema` (array) |

### Transaction Operations

| Method                                          | Description                 | Schema Used                 |
| ----------------------------------------------- | --------------------------- | --------------------------- |
| `addTransaction(transaction)`                   | Add new transaction         | `TransactionSchema`         |
| `updateTransaction(id, updates)`                | Update existing transaction | `TransactionPartialSchema`  |
| `putTransaction(transaction)`                   | Upsert transaction          | `TransactionSchema`         |
| `bulkUpsertTransactionsValidated(transactions)` | Bulk upsert transactions    | `TransactionSchema` (array) |

### Auto-Funding Rule Operations

| Method                                       | Description          | Schema Used                     |
| -------------------------------------------- | -------------------- | ------------------------------- |
| `addAutoFundingRule(rule)`                   | Add new rule         | `AutoFundingRuleSchema`         |
| `updateAutoFundingRule(id, updates)`         | Update existing rule | `AutoFundingRulePartialSchema`  |
| `putAutoFundingRule(rule)`                   | Upsert rule          | `AutoFundingRuleSchema`         |
| `bulkUpsertAutoFundingRulesValidated(rules)` | Bulk upsert rules    | `AutoFundingRuleSchema` (array) |

### Execution Record Operations

| Method                               | Description            | Schema Used                    |
| ------------------------------------ | ---------------------- | ------------------------------ |
| `addExecutionRecord(record)`         | Add new record         | `ExecutionRecordSchema`        |
| `updateExecutionRecord(id, updates)` | Update existing record | `ExecutionRecordPartialSchema` |
| `putExecutionRecord(record)`         | Upsert record          | `ExecutionRecordSchema`        |

## Error Handling

Validation errors throw with descriptive messages:

```typescript
try {
  await budgetDb.addEnvelope(envelope);
} catch (error) {
  // Handle validation error
  if (error.message.includes("Invalid Envelope")) {
    console.error("Validation failed:", error.message);
    // Show user-friendly error to user
  } else {
    // Handle other errors (database, network, etc.)
    throw error;
  }
}
```

### Error Message Format

Validation errors follow this format:

```
Invalid <EntityType>: <field1> <error message>, <field2> <error message>, ...
```

Example:

```
Invalid Envelope: name is required, currentBalance cannot be negative
```

## Validation Utilities

The validation layer provides reusable utilities in `src/db/validation.ts`:

### `validateWithSchema<T>`

Validates data with a Zod schema and throws on error:

```typescript
import { validateWithSchema } from "@/db/validation";
import { EnvelopeSchema } from "@/domain/schemas";

const validated = validateWithSchema(EnvelopeSchema, data, "Envelope");
```

### `safeValidateWithSchema<T>`

Safe validation that returns a result object instead of throwing:

```typescript
import { safeValidateWithSchema } from "@/db/validation";
import { EnvelopeSchema } from "@/domain/schemas";

const result = safeValidateWithSchema(EnvelopeSchema, data, "Envelope");

if (result.success) {
  console.log("Valid:", result.data);
} else {
  console.error("Invalid:", result.error);
}
```

### `validateArrayWithSchema<T>`

Validates an array of items:

```typescript
import { validateArrayWithSchema } from "@/db/validation";
import { EnvelopeSchema } from "@/domain/schemas";

const validated = validateArrayWithSchema(EnvelopeSchema, envelopes, "Envelope");
```

### `safeValidateArrayWithSchema<T>`

Safe array validation with detailed error information:

```typescript
import { safeValidateArrayWithSchema } from "@/db/validation";
import { EnvelopeSchema } from "@/domain/schemas";

const result = safeValidateArrayWithSchema(EnvelopeSchema, envelopes, "Envelope");

if (result.success) {
  console.log("All valid:", result.data);
} else {
  console.error("Invalid items at indices:", result.failedIndices);
  console.error("Errors:", result.error);
}
```

## Schemas

All validation schemas are defined in `src/domain/schemas/`:

- **Envelope**: `envelope.ts` - Standard, Goal, Liability, and Supplemental envelopes
- **Transaction**: `transaction.ts` - Income, Expense, and Transfer transactions
- **Auto-Funding**: `auto-funding.ts` - Auto-funding rules and execution records
- **Utility**: `utility.ts` - Date ranges, bulk updates, database stats

## Testing

Validation tests are in `src/db/__tests__/validation.test.ts`:

```bash
# Run validation tests
npm run test -- validation.test.ts

# Run all database tests
npm run test -- src/db
```

## Migration Guide

If you have existing code that directly calls Dexie table methods, follow this migration pattern:

### Before

```typescript
await budgetDb.envelopes.add(envelope);
await budgetDb.envelopes.update(id, updates);
await budgetDb.envelopes.put(envelope);
await budgetDb.bulkUpsertEnvelopes(envelopes);
```

### After

```typescript
await budgetDb.addEnvelope(envelope);
await budgetDb.updateEnvelope(id, updates);
await budgetDb.putEnvelope(envelope);
await budgetDb.bulkUpsertEnvelopesValidated(envelopes);
```

## Performance

Validation overhead is minimal:

- **Single operations**: ~1-2ms per validation
- **Bulk operations**: Validated in parallel, negligible impact
- **Caching**: Zod schemas are compiled once and reused

## Best Practices

1. **Always use validated methods** for all database writes
2. **Handle validation errors gracefully** with try-catch blocks
3. **Log validation failures** for debugging (automatically done)
4. **Show user-friendly errors** to users, not raw Zod errors
5. **Test edge cases** with invalid data in your tests
6. **Keep schemas up to date** when database structure changes

## Related Documentation

- [Domain Schemas](../domain/schemas/README.md)
- [Database Types](./types.ts)
- [Zod Documentation](https://zod.dev/)
- [Dexie.js Documentation](https://dexie.org/)
