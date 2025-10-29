# Domain Schemas

This directory contains Zod validation schemas for runtime type checking and validation in VioletVault.

## Structure

```
src/domain/schemas/
├── __tests__/               # Schema test files
│   ├── api-responses.test.ts
│   ├── bug-report.test.ts
│   └── component-props.test.ts
├── api-responses.ts         # Phase 2: API response validation schemas
├── audit-log.ts            # Audit log entry schemas
├── auth.ts                 # Authentication schemas
├── backup.ts               # Backup and sync type schemas
├── bill.ts                 # Bill entity schemas
├── budget-record.ts        # Budget record schemas
├── bug-report.ts           # Bug report schemas
├── cache.ts                # Cache entry schemas
├── component-props.ts      # Phase 3: Component prop validation schemas
├── debt.ts                 # Debt entity schemas
├── envelope.ts             # Envelope entity schemas
├── index.ts                # Barrel export for all schemas
├── paycheck-history.ts     # Paycheck history schemas
├── savings-goal.ts         # Savings goal schemas
├── transaction.ts          # Transaction schemas
├── utility.ts              # Utility schemas
└── version-control.ts      # Version control schemas
```

## Phases

### Phase 1: Domain Models (Issue #412)

Core data model validation schemas for VioletVault entities:

- Finance models (envelopes, bills, transactions, savings goals, debts)
- Infrastructure (budget records, audit logs, cache)
- Authentication and user data
- Version control and backups

### Phase 2: API Response Validation

External API response validation schemas:

- Firebase API responses (documents, chunks, manifests, auth)
- Bug report service responses (GitHub, webhooks, screenshots)
- Sync operation results
- Generic API response patterns

### Phase 3: Component Prop Validation (Issue #987 - Current)

React component prop validation schemas for runtime type checking:

- High priority components (EnvelopeGrid, TransactionTable, BillTable, MainDashboard)
- Medium priority components (EnvelopeItem, TransactionRow, BillItem, AnalyticsDashboard)
- Development-only validation (no performance impact in production)
- Comprehensive error reporting with logger integration

## Usage

### Importing Schemas

All schemas are exported from the barrel export `index.ts`:

```typescript
import {
  // Phase 1: Domain Models
  EnvelopeSchema,
  BillSchema,
  TransactionSchema,

  // Phase 2: API Responses
  FirebaseDocumentSchema,
  GitHubIssueResponseSchema,
  SyncOperationResultSchema,

  // Phase 3: Component Props
  EnvelopeGridPropsSchema,
  TransactionTablePropsSchema,
  BillTablePropsSchema,

  // Types
  type Envelope,
  type FirebaseDocument,
  type SyncOperationResult,
  type EnvelopeGridProps,
} from "@/domain/schemas";
```

### Validation Patterns

Each schema provides two validation methods:

1. **Unsafe Validation** (throws on error)

```typescript
import { validateEnvelope } from "@/domain/schemas";

const envelope = validateEnvelope(data); // Throws on invalid data
```

2. **Safe Validation** (returns result object)

```typescript
import { validateEnvelopeSafe } from "@/domain/schemas";

const result = validateEnvelopeSafe(data);
if (result.success) {
  const envelope = result.data;
  // Use validated envelope
} else {
  console.error("Validation failed:", result.error);
}
```

### Type Inference

All schemas provide TypeScript type inference:

```typescript
import { EnvelopeSchema, type Envelope } from "@/domain/schemas";

// Infer type from schema
type InferredEnvelope = z.infer<typeof EnvelopeSchema>;

// Or use exported type
const envelope: Envelope = {
  id: "123",
  name: "Groceries",
  category: "food",
  archived: false,
  lastModified: Date.now(),
};
```

## Best Practices

### 1. Validate at Boundaries

Validate data when it crosses system boundaries (API responses, user input, external storage):

```typescript
// ✅ Good - validate at API boundary
const docSnap = await getDoc(docRef);
const validation = validateFirebaseDocumentSafe(docSnap.data());

// ❌ Bad - no validation before use
const docSnap = await getDoc(docRef);
const data = docSnap.data(); // Could be malformed
```

### 2. Use Safe Validation in Services

Prefer `safeParse` in service layer to avoid crashes:

```typescript
// ✅ Good - graceful error handling
const result = validateEnvelopeSafe(data);
if (!result.success) {
  logger.error("Validation failed", result.error);
  return null;
}

// ❌ Bad - can crash the app
const envelope = validateEnvelope(data); // Throws on invalid data
```

### 3. Log Validation Failures

Always log validation failures for debugging:

```typescript
const validation = validateFirebaseDocumentSafe(cloudData);
if (!validation.success) {
  logger.error("Invalid Firebase document", {
    errors: validation.error,
    budgetId: budgetId.substring(0, 8) + "...",
  });
  return null;
}
```

### 4. Combine with Domain Validation

Use both API response validation and domain model validation:

```typescript
// 1. Validate API response structure
const apiValidation = validateFirebaseDocumentSafe(docSnap.data());
if (!apiValidation.success) return null;

// 2. Decrypt data
const decryptedData = await decrypt(apiValidation.data.encryptedData);

// 3. Validate domain model
const domainValidation = validateEnvelopeSafe(decryptedData);
if (!domainValidation.success) return null;

return domainValidation.data;
```

### 5. Use Partial Schemas for Updates

Most domain schemas provide partial versions for PATCH operations:

```typescript
import { EnvelopePartialSchema, validateEnvelopePartial } from "@/domain/schemas";

// Only validate provided fields
const updates = validateEnvelopePartial({
  name: "New Name",
  // Other fields are optional
});
```

### 6. Validate Component Props (Phase 3)

Use prop validation for runtime type checking in components (development only):

```typescript
import { validateComponentProps } from "@/utils/validation/propValidator";
import { EnvelopeGridPropsSchema } from "@/domain/schemas/component-props";

function EnvelopeGrid(props: EnvelopeGridProps) {
  // Validates props in development mode only (no performance impact in production)
  validateComponentProps("EnvelopeGrid", props, EnvelopeGridPropsSchema);

  return <div>...</div>;
}
```

**Benefits:**

- ✅ Catch prop type errors at runtime during development
- ✅ Better error messages for component users
- ✅ Development-only validation (zero performance impact in production)
- ✅ Component contract documentation through schemas
- ✅ Improved refactoring safety

## Documentation

- **[API Response Validation Guide](/docs/API-Response-Validation-Guide.md)** - Comprehensive guide for Phase 2 schemas
- **[Integration Example](/docs/examples/api-response-validation-example.ts)** - Practical code examples
- **[TypeScript Patterns Guide](/docs/TypeScript-Patterns-Guide.md)** - General TypeScript patterns

## Testing

All schemas have comprehensive test coverage:

```bash
# Run all schema tests
npm run test -- src/domain/schemas/__tests__/

# Run specific test file
npm run test -- src/domain/schemas/__tests__/api-responses.test.ts
```

## Schema Naming Conventions

- **Schema Name**: PascalCase with `Schema` suffix (e.g., `EnvelopeSchema`)
- **Type Name**: PascalCase without suffix (e.g., `Envelope`)
- **Validation Function**: camelCase with `validate` prefix (e.g., `validateEnvelope`)
- **Safe Validation**: camelCase with `Safe` suffix (e.g., `validateEnvelopeSafe`)
- **Partial Schema**: Original name + `Partial` (e.g., `EnvelopePartialSchema`)

## Adding New Schemas

When adding new schemas, follow this pattern:

1. **Create the schema file** (`new-schema.ts`)
2. **Define the Zod schema** with proper validation rules
3. **Export inferred type** using `z.infer<>`
4. **Add validation helpers** (both safe and unsafe)
5. **Export from index.ts** in the appropriate section
6. **Add comprehensive tests** in `__tests__/`
7. **Document usage** in relevant guides

Example template:

```typescript
/**
 * Schema Description
 * Part of Phase X
 */

import { z } from "zod";

export const MySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  // ... other fields
});

export type MyType = z.infer<typeof MySchema>;

export const MyPartialSchema = MySchema.partial();
export type MyPartial = z.infer<typeof MyPartialSchema>;

export const validateMyType = (data: unknown): MyType => {
  return MySchema.parse(data);
};

export const validateMyTypeSafe = (data: unknown) => {
  return MySchema.safeParse(data);
};
```

## Related Issues

- **[#412](https://github.com/thef4tdaddy/violet-vault/issues/412)** - Phase 1: Domain Types & Zod Schemas
- **Phase 2** - API Response Validation Schemas
- **[#987](https://github.com/thef4tdaddy/violet-vault/issues/987)** - Phase 3: Component Prop Validation (Current)

## Architecture Compliance

All schemas follow VioletVault's architecture guidelines:

- ✅ Zero `any` types - strict TypeScript
- ✅ Use `@` import paths
- ✅ Comprehensive validation helpers
- ✅ Full test coverage
- ✅ Proper error handling
- ✅ JSDoc documentation
