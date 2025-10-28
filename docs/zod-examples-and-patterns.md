# Zod Schema Usage Examples & Code Patterns

## Table of Contents
1. Current Schema Definitions
2. How Schemas Are Currently Used
3. Gap Examples (Manual Validation)
4. Recommended Integration Patterns

---

## 1. Current Schema Definitions

### Example: Bill Schema (bill.ts)
```typescript
import { z } from 'zod';

export const BillFrequencySchema = z.enum(['monthly', 'quarterly', 'annually']).optional();
export type BillFrequency = z.infer<typeof BillFrequencySchema>;

export const BillSchema = z.object({
  id: z.string().min(1, 'Bill ID is required'),
  name: z.string().min(1, 'Bill name is required').max(100),
  dueDate: z.union([z.date(), z.string()], { errorMap: () => ({ message: 'Due date must be a valid date' }) }),
  amount: z.number().min(0, 'Amount cannot be negative'),
  category: z.string().min(1, 'Category is required'),
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  frequency: BillFrequencySchema,
  envelopeId: z.string().optional(),
  lastModified: z.number().int().positive('Last modified must be a positive number'),
  createdAt: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  paymentMethod: z.string().max(100).optional(),
});

export type Bill = z.infer<typeof BillSchema>;
export const BillPartialSchema = BillSchema.partial();
export type BillPartial = z.infer<typeof BillPartialSchema>;

export const validateBill = (data: unknown): Bill => {
  return BillSchema.parse(data);
};

export const validateBillSafe = (data: unknown) => {
  return BillSchema.safeParse(data);
};

export const validateBillPartial = (data: unknown): BillPartial => {
  return BillPartialSchema.parse(data);
};
```

### Example: Envelope Schema (envelope.ts)
```typescript
export const EnvelopeSchema = z.object({
  id: z.string().min(1, 'Envelope ID is required'),
  name: z.string().min(1, 'Envelope name is required').max(100, 'Envelope name must be 100 characters or less'),
  category: z.string().min(1, 'Category is required'),
  archived: z.boolean().default(false),
  lastModified: z.number().int().positive('Last modified must be a positive number'),
  createdAt: z.number().int().positive().optional(),
  currentBalance: z.number().min(0, 'Current balance cannot be negative').optional(),
  targetAmount: z.number().min(0, 'Target amount cannot be negative').optional(),
  description: z.string().max(500, 'Description must be 500 characters or less').optional(),
});

export type Envelope = z.infer<typeof EnvelopeSchema>;
export const EnvelopePartialSchema = EnvelopeSchema.partial();
export type EnvelopePartial = z.infer<typeof EnvelopePartialSchema>;

export const validateEnvelope = (data: unknown): Envelope => {
  return EnvelopeSchema.parse(data);
};

export const validateEnvelopeSafe = (data: unknown) => {
  return EnvelopeSchema.safeParse(data);
};

export const validateEnvelopePartial = (data: unknown): EnvelopePartial => {
  return EnvelopePartialSchema.parse(data);
};
```

---

## 2. How Schemas Are Currently Used (Good Examples)

### Pattern 1: Envelope Form Validation (BEST PRACTICE)
**File:** src/utils/budgeting/envelopeFormUtils.ts

```typescript
import { validateEnvelopeSafe } from "../../domain/schemas/envelope.ts";

// Convert Zod errors to form error object
const convertZodErrors = (zodResult: ZodResult): Record<string, string> => {
  const errors = {};
  if (!zodResult.success) {
    zodResult.error.errors.forEach((err) => {
      const fieldName = err.path[0];
      if (fieldName) {
        errors[fieldName] = err.message;
      }
    });
  }
  return errors;
};

// Main validation function combining Zod + form logic
export const validateEnvelopeForm = (
  formData: EnvelopeFormData,
  existingEnvelopes: Envelope[] = [],
  editingEnvelopeId: string | number | null = null
): ValidationResult => {
  // Step 1: Use Zod schema for base validation
  const zodResult = validateEnvelopeSafe(formData);
  const errors = convertZodErrors(zodResult);

  // Step 2: Add form-specific validations beyond Zod schema
  validateUniqueName(formData, existingEnvelopes, editingEnvelopeId, errors);
  validateMonthlyAmount(formData, errors);
  validateTargetAmount(formData, errors);
  validateAdditionalFields(formData, errors);

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
```

### Pattern 2: Transaction Operations Validation
**File:** src/utils/transactions/operations.ts

```typescript
import { validateTransactionSafe } from "../../domain/schemas/transaction.ts";

export const validateTransactionData = (transactionData: unknown): ValidationResult => {
  try {
    if (!transactionData) {
      return { isValid: false, errors: ["Transaction data is required"] };
    }

    // Use Zod schema
    const result = validateTransactionSafe(transactionData);

    if (!result.success) {
      // Convert Zod errors to legacy format for backward compatibility
      const errors = result.error.issues.map((err) => {
        const path = err.path.join(".");
        return `${path}: ${err.message}`;
      });
      return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
  } catch (error) {
    logger.error("Error validating transaction data", error);
    return {
      isValid: false,
      errors: ["Validation error: " + error.message],
    };
  }
};
```

### Pattern 3: Hook-Level Validation
**File:** src/hooks/bills/useBillValidation.ts

```typescript
import { validateBillSafe } from "../../domain/schemas/bill.ts";

export const useBillValidation = (envelopes = []) => {
  const validateBillData = useCallback(
    (bill) => {
      // First validate with Zod schema
      const zodResult = validateBillSafe(bill);

      if (!zodResult.success) {
        const errors = zodResult.error.errors.map((err) => {
          const path = err.path.join(".");
          return `${path}: ${err.message}`;
        });
        return { isValid: false, errors };
      }

      // Then add domain-specific validation
      const errors = [];
      if (bill.envelopeId && !envelopes.find((env) => env.id === bill.envelopeId)) {
        errors.push("Assigned envelope does not exist");
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    },
    [envelopes]
  );

  return { validateBillData };
};
```

---

## 3. Gap Examples (Manual Validation WITHOUT Zod)

### Gap 1: Bug Report Validation (SHOULD USE ZOD)
**File:** src/services/bugReport/apiService.ts

```typescript
// CURRENT (MANUAL - NO ZOD)
static validateReportData(reportData: BugReportData): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validations
  if (!reportData || typeof reportData !== "object") {
    errors.push("Report data must be an object");
    return { isValid: false, errors, warnings };
  }

  // Required fields - MANUAL CHECKS
  if (
    !reportData.title ||
    typeof reportData.title !== "string" ||
    reportData.title.trim().length === 0
  ) {
    errors.push("Title is required and must be a non-empty string");
  }

  // Manual length validation
  if (reportData.title && reportData.title.length > 500) {
    warnings.push("Title is very long and may be truncated");
  }

  // Manual enum validation
  if (
    reportData.severity &&
    !["low", "medium", "high", "critical"].includes(reportData.severity)
  ) {
    warnings.push("Severity should be one of: low, medium, high, critical");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// RECOMMENDED (WITH ZOD)
import { z } from 'zod';

export const BugReportSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be 500 characters or less'),
  description: z.string().min(1, 'Description is required').max(10000, 'Description must be 10000 characters or less').optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  labels: z.array(z.string()).optional(),
  systemInfo: z.record(z.unknown()).optional(),
  screenshot: z.string().url().optional(),
  steps: z.array(z.string()).optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
});

export type BugReport = z.infer<typeof BugReportSchema>;
export const validateBugReportSafe = (data: unknown) => {
  return BugReportSchema.safeParse(data);
};
```

### Gap 2: Savings Form Validation (SHOULD USE ZOD)
**File:** src/utils/savings/savingsFormUtils.ts

```typescript
// CURRENT (MANUAL - 80+ LINES)
const validateRequiredFieldsSavings = (formData, errors) => {
  if (!formData.name?.trim()) {
    errors.push("Goal name is required");
  }

  if (
    !formData.targetAmount ||
    isNaN(parseFloat(formData.targetAmount)) ||
    parseFloat(formData.targetAmount) <= 0
  ) {
    errors.push("Target amount must be a positive number");
  }
  // ... many more manual checks
};

// RECOMMENDED (WITH ZOD)
import { SavingsGoalSchema } from "../../domain/schemas";

export const validateSavingsGoalForm = (formData: Record<string, unknown>) => {
  const zodResult = validateSavingsGoalSafe(formData);
  const errors = convertZodErrors(zodResult);
  
  // Add form-specific validations
  validateUniqueGoalName(formData, existingGoals, errors);
  validateTargetDate(formData, errors);
  
  return { isValid: Object.keys(errors).length === 0, errors };
};
```

### Gap 3: Debt Form Validation (SHOULD USE ZOD + REFINEMENTS)
**File:** src/utils/debts/debtFormValidation.ts

```typescript
// CURRENT (200+ LINES OF MANUAL VALIDATION)
export function validateDebtFormFields(formData: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  checkRequiredTextField(formData.name, "name", errors);
  checkRequiredTextField(formData.creditor, "creditor", errors);
  checkBalanceField(formData.currentBalance, "currentBalance", true, errors);
  checkBalanceField(formData.originalBalance, "originalBalance", false, errors);
  checkInterestRate(formData.interestRate, errors);
  checkBalanceField(formData.minimumPayment, "minimumPayment", true, errors);
  checkPaymentMethodFields(formData, errors);

  return errors;
}

// RECOMMENDED (WITH ZOD)
import { DebtSchema } from "../../domain/schemas";

const DebtFormSchema = DebtSchema.extend({
  // Add form-specific validations
  paymentMethodFields: z.object({
    paymentMethod: z.enum(['connect_existing', 'create_new']),
    existingBillId: z.string().optional(),
    envelopeId: z.string().optional(),
  }).refine(
    (data) => {
      if (data.paymentMethod === 'connect_existing') {
        return !!data.existingBillId;
      }
      if (data.paymentMethod === 'create_new') {
        return !!data.envelopeId;
      }
      return true;
    },
    { message: "Payment method fields are invalid" }
  ),
}).refine(
  (data) => {
    if (data.minimumPayment && data.currentBalance) {
      const paymentPercent = (data.minimumPayment / data.currentBalance) * 100;
      if (paymentPercent < 1) {
        // Warning, not error
        console.warn("Payment is less than 1% of balance");
      }
    }
    return true;
  }
);

export const validateDebtForm = (formData: unknown) => {
  return DebtFormSchema.safeParse(formData);
};
```

### Gap 4: API Response Validation (MISSING ENTIRELY)
**File:** src/services/bugReport/reportSubmissionService.ts

```typescript
// CURRENT (NO VALIDATION OF RESPONSES)
const response = await fetch(webhookUrl, {
  method: 'POST',
  body: JSON.stringify(reportData),
});

const responseData = await response.json().catch(() => ({}));
// ^^ No validation of what's in responseData!

// RECOMMENDED
export const WebhookResponseSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  timestamp: z.string().datetime().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
});

export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;

// In submission function:
const responseData = await response.json().catch(() => ({}));
const validatedResponse = WebhookResponseSchema.safeParse(responseData);

if (!validatedResponse.success) {
  logger.error("Invalid webhook response", validatedResponse.error);
  // Handle error appropriately
}
```

### Gap 5: Database Service Validation (MISSING)
**File:** src/services/budgetDatabaseService.ts

```typescript
// CURRENT (NO VALIDATION)
async addEnvelopes(envelopes: unknown): Promise<void> {
  try {
    await this.db.envelopes.bulkAdd(envelopes as any);
    // ^^ Cast to 'any' - no validation!
  } catch (error) {
    logger.error("Failed to add envelopes", error);
    throw error;
  }
}

// RECOMMENDED
async addEnvelopes(envelopes: unknown): Promise<void> {
  try {
    // Validate each envelope
    const envelopeArray = Array.isArray(envelopes) ? envelopes : [envelopes];
    
    for (const envelope of envelopeArray) {
      const result = validateEnvelopeSafe(envelope);
      if (!result.success) {
        throw new Error(`Invalid envelope: ${result.error.issues[0].message}`);
      }
    }
    
    await this.db.envelopes.bulkAdd(envelopeArray as Envelope[]);
  } catch (error) {
    logger.error("Failed to add envelopes", error);
    throw error;
  }
}
```

---

## 4. Recommended Integration Patterns

### Pattern A: Form Validation with Business Rules
```typescript
// 1. Create extended schema for form
const EnvelopeFormSchema = EnvelopeSchema.extend({
  // Add form-specific fields
  monthlyAmount: z.number().min(0, 'Monthly amount must be positive'),
  biweeklyAmount: z.number().min(0).optional(),
}).refine(
  (data) => {
    // Add cross-field validations
    if (data.targetAmount && data.currentBalance > data.targetAmount) {
      return false;
    }
    return true;
  },
  { message: "Current balance cannot exceed target amount" }
);

// 2. Create validation function
export const validateEnvelopeForm = (formData: unknown) => {
  const result = EnvelopeFormSchema.safeParse(formData);
  
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.flatten().fieldErrors
    };
  }
  
  // Add async validations if needed
  return { isValid: true, data: result.data };
};

// 3. Use in hook or component
const { errors } = validateEnvelopeForm(formData);
setFormErrors(errors);
```

### Pattern B: API Response Validation
```typescript
// 1. Define response schema
const SubmissionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    id: z.string(),
    timestamp: z.string().datetime(),
  }).optional(),
  errors: z.array(z.string()).optional(),
});

// 2. Validate in service
async submitBugReport(data: BugReportData) {
  const response = await fetch(endpoint, { method: 'POST', body });
  const rawData = await response.json();
  
  const validated = SubmissionResponseSchema.safeParse(rawData);
  
  if (!validated.success) {
    throw new Error(`Invalid response: ${validated.error.message}`);
  }
  
  return validated.data;
}
```

### Pattern C: Database Operations
```typescript
// Wrap all database writes with validation
async upsertEnvelope(envelope: unknown): Promise<string> {
  // Validate
  const result = validateEnvelopeSafe(envelope);
  if (!result.success) {
    throw new ValidationError(result.error.issues);
  }
  
  // Use validated data
  const validated = result.data;
  return this.db.envelopes.put(validated);
}
```

---

## Summary of Gaps & Solutions

| Gap | Location | Current | Recommended | Effort |
|-----|----------|---------|-------------|--------|
| Bug Report | apiService.ts | Manual | BugReportSchema | 1h |
| Savings Form | savingsFormUtils.ts | Manual | SavingsGoalSchema | 1h |
| Debt Form | debtFormValidation.ts | Manual 200L | DebtSchema + refine | 1.5h |
| Auth | authService.ts | Manual | AuthSchema | 1h |
| API Responses | bugReport/reportSubmissionService.ts | None | ResponseSchemas | 1.5h |
| Database Ops | budgetDatabaseService.ts | None | Validation wrapper | 2h |
| Paycheck Form | paycheckValidation.ts | Manual | PaycheckHistorySchema | 1h |
| Validation Utils | src/utils/validation/* | Manual | Zod versions | 4h |

**Total effort to reach 50% coverage: ~4 hours**
**Total effort to reach 75% coverage: ~12 hours**

