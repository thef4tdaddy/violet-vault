# Zod Integration Guide

This guide documents the comprehensive Zod schema integration across the Violet Vault application, including standardized validation patterns and best practices.

## Overview

The Zod integration provides:

- **Type-safe validation** using Zod schemas
- **Standardized form validation** with `useValidatedForm` hook pattern
- **Runtime prop validation** for React components
- **Consistent error handling** across the application

## Table of Contents

1. [Form Validation with useValidatedForm](#form-validation-with-usevalidatedform)
2. [Available Validated Form Hooks](#available-validated-form-hooks)
3. [Component Prop Validation](#component-prop-validation)
4. [Creating New Validated Form Hooks](#creating-new-validated-form-hooks)
5. [Best Practices](#best-practices)

---

## Form Validation with useValidatedForm

The `useValidatedForm` hook provides a standardized pattern for managing form state, validation, and submission with Zod schemas.

### Basic Usage

```tsx
import { useValidatedForm } from "@/hooks/common/validation";
import { MyFormSchema } from "@/domain/schemas/my-schema";

const MyComponent = () => {
  const form = useValidatedForm({
    schema: MyFormSchema,
    initialData: { name: "", email: "" },
    validateOnChange: false, // Optional: validate as user types
    onSubmit: async (data) => {
      // Handle submission with validated data
      await saveData(data);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input value={form.data.name} onChange={(e) => form.updateField("name", e.target.value)} />
      {form.errors.name && <span>{form.errors.name}</span>}

      <button type="submit" disabled={!form.canSubmit}>
        Submit
      </button>
    </form>
  );
};
```

### Hook API

#### State

- `data: T` - Current form data
- `errors: ValidationErrors<T>` - Field-specific error messages
- `isDirty: boolean` - Whether form has been modified
- `isSubmitting: boolean` - Whether form is currently submitting
- `isValid: boolean` - Whether form has no validation errors

#### Methods

- `updateField(field, value)` - Update a single form field
- `updateFormData(updates)` - Update multiple fields at once
- `validate()` - Manually trigger validation
- `handleSubmit(e?)` - Submit form with validation
- `resetForm()` - Reset form to initial state
- `clearErrors()` - Clear all validation errors
- `clearError(field)` - Clear error for specific field
- `setFieldError(field, error)` - Set error for specific field
- `getFieldError(field)` - Get error for specific field
- `hasError(field)` - Check if field has error

---

## Available Validated Form Hooks

### 1. useDebtFormValidated

Standardized validation for debt management forms.

```tsx
import { useDebtFormValidated } from "@/hooks/debts/useDebtFormValidated";

const DebtModal = ({ debt, isOpen, onClose }) => {
  const form = useDebtFormValidated({
    debt, // null for new debt, Debt object for editing
    isOpen,
    connectedBill: null, // Optional connected bill
    connectedEnvelope: null, // Optional connected envelope
    onSubmit: async (debtId, data) => {
      if (debtId) {
        await updateDebt(debtId, data);
      } else {
        await createDebt(data);
      }
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen}>
      <input value={form.data.name} onChange={(e) => form.updateField("name", e.target.value)} />
      {form.errors.name && <span>{form.errors.name}</span>}

      <input
        type="number"
        value={form.data.currentBalance}
        onChange={(e) => form.updateField("currentBalance", e.target.value)}
      />
      {form.errors.currentBalance && <span>{form.errors.currentBalance}</span>}

      <button onClick={form.handleSubmit} disabled={!form.canSubmit}>
        {form.isEditMode ? "Update" : "Create"} Debt
      </button>
    </Modal>
  );
};
```

**Schema:** `DebtFormSchema` from `@/domain/schemas/debt`

**Fields:**

- `name` (required): Debt name
- `creditor` (required): Creditor name
- `currentBalance` (required): Current balance
- `minimumPayment` (required): Minimum payment amount
- `interestRate` (optional): Annual interest rate
- `type`, `status`, `paymentFrequency`, etc.

### 2. useSavingsGoalFormValidated

Standardized validation for savings goal forms.

```tsx
import { useSavingsGoalFormValidated } from "@/hooks/savings/useSavingsGoalFormValidated";

const SavingsGoalModal = ({ goal, isOpen, onClose }) => {
  const form = useSavingsGoalFormValidated({
    goal, // null for new goal, SavingsGoal object for editing
    isOpen,
    onSubmit: async (goalId, data) => {
      if (goalId) {
        await updateGoal(goalId, data);
      } else {
        await createGoal(data);
      }
      onClose();
    },
  });

  return (
    <Modal isOpen={isOpen}>
      <input value={form.data.name} onChange={(e) => form.updateField("name", e.target.value)} />
      {form.errors.name && <span>{form.errors.name}</span>}

      <button onClick={form.handleSubmit} disabled={!form.canSubmit}>
        Save Goal
      </button>
    </Modal>
  );
};
```

**Schema:** `SavingsGoalFormSchema` from `@/domain/schemas/savings-goal`

**Fields:**

- `name` (required): Goal name
- `targetAmount` (required): Target amount (must be > 0)
- `currentAmount` (optional): Current saved amount
- `targetDate` (optional): Target completion date
- `category` (required): Goal category
- `color` (required): Display color (hex format)
- `priority` (optional): Priority level (low/medium/high)

### 3. useTransactionFormValidated

Standardized validation for transaction forms.

```tsx
import { useTransactionFormValidated } from "@/hooks/transactions/useTransactionFormValidated";

const TransactionModal = ({ transaction, isOpen, onClose }) => {
  const form = useTransactionFormValidated({
    transaction,
    isOpen,
    onSubmit: async (transactionId, data) => {
      if (transactionId) {
        await updateTransaction(transactionId, data);
      } else {
        await createTransaction(data);
      }
      onClose();
    },
  });

  // Form implementation...
};
```

**Schema:** `TransactionFormSchema` from `@/domain/schemas/transaction`

### 4. usePaycheckFormValidated

Standardized validation for paycheck/income forms.

```tsx
import { usePaycheckFormValidated } from "@/hooks/budgeting/usePaycheckFormValidated";

const PaycheckModal = ({ paycheck, isOpen, onClose }) => {
  const form = usePaycheckFormValidated({
    paycheck,
    isOpen,
    onSubmit: async (paycheckId, data) => {
      if (paycheckId) {
        await updatePaycheck(paycheckId, data);
      } else {
        await createPaycheck(data);
      }
      onClose();
    },
  });

  // Form implementation...
};
```

**Schema:** `PaycheckFormSchema` from `@/domain/schemas/paycheck-history`

### 5. useUserProfileFormValidated

Standardized validation for user profile forms.

```tsx
import { useUserProfileFormValidated } from "@/hooks/settings/useUserProfileFormValidated";

const ProfileSettings = ({ currentUser }) => {
  const form = useUserProfileFormValidated({
    currentUser,
    isOpen: true,
    onSubmit: async (data) => {
      await updateUserProfile(data);
    },
  });

  // Form implementation...
};
```

**Schema:** `UserProfileFormSchema` from `@/domain/schemas/auth`

---

## Component Prop Validation

Component prop validation helps catch bugs during development by ensuring components receive correct data types.

### Using validateComponentProps

```tsx
import { validateComponentProps } from "@/utils/validation/propValidator";
import { MyComponentPropsSchema } from "@/domain/schemas/component-props";

const MyComponent = ({ data, onAction }) => {
  // Validate props in development
  validateComponentProps("MyComponent", { data, onAction }, MyComponentPropsSchema);

  // Component implementation...
};
```

### Available Component Prop Schemas

All schemas are defined in `@/domain/schemas/component-props`:

**High-Priority Components:**

- `SavingsGoalsPropsSchema` - Savings goals list component
- `SavingsGoalItemPropsSchema` - Individual savings goal item
- `PaycheckHistoryPropsSchema` - Paycheck history list
- `PaycheckItemPropsSchema` - Individual paycheck item
- `DebtSummaryPropsSchema` - Debt summary dashboard
- `DebtItemPropsSchema` - Individual debt item
- `BudgetSummaryPropsSchema` - Budget summary dashboard
- `SettingsPropsSchema` - Settings component

**Modal Components:**

- `CreateEnvelopeModalPropsSchema`
- `EditEnvelopeModalPropsSchema`

**UI Components:**

- `DatePickerPropsSchema`
- `SelectPropsSchema`
- `InputFieldPropsSchema`

**Already Implemented:**

- `EnvelopeGridPropsSchema`
- `TransactionTablePropsSchema`
- `BillTablePropsSchema`
- `MainDashboardPropsSchema`

---

## Creating New Validated Form Hooks

### Step 1: Define the Zod Schema

Create or extend a schema in `src/domain/schemas/`:

```tsx
// src/domain/schemas/my-entity.ts
import { z } from "zod";

export const MyEntityFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z
    .union([z.string(), z.number()])
    .pipe(z.coerce.number().min(0, "Amount must be positive")),
  category: z.string().min(1, "Category is required"),
});

export type MyEntityFormData = z.infer<typeof MyEntityFormSchema>;
```

### Step 2: Create the Validated Form Hook

Create a hook in the appropriate directory:

```tsx
// src/hooks/my-feature/useMyEntityFormValidated.ts
import { useCallback, useEffect } from "react";
import { useValidatedForm } from "@/hooks/common/validation";
import { MyEntityFormSchema, type MyEntityFormData } from "@/domain/schemas/my-entity";
import type { MyEntity } from "@/types/my-entity";
import logger from "@/utils/common/logger";

interface UseMyEntityFormValidatedOptions {
  entity?: MyEntity | null;
  isOpen?: boolean;
  onSubmit?: (entityId: string | null, data: MyEntityFormData) => Promise<void>;
}

export function useMyEntityFormValidated({
  entity = null,
  isOpen = false,
  onSubmit,
}: UseMyEntityFormValidatedOptions = {}) {
  const isEditMode = !!entity;

  const buildInitialData = useCallback((): MyEntityFormData => {
    if (entity) {
      return {
        name: entity.name || "",
        amount: entity.amount?.toString() || "",
        category: entity.category || "",
      };
    } else {
      return {
        name: "",
        amount: "",
        category: "",
      };
    }
  }, [entity]);

  const form = useValidatedForm({
    schema: MyEntityFormSchema,
    initialData: buildInitialData(),
    validateOnChange: false,
    onSubmit: async (validatedData) => {
      if (!onSubmit) {
        logger.warn("No onSubmit handler provided");
        return;
      }

      try {
        await onSubmit(entity?.id || null, validatedData);
      } catch (error) {
        logger.error(`Error ${isEditMode ? "updating" : "creating"} entity:`, error);
        throw error;
      }
    },
  });

  useEffect(() => {
    if (isOpen) {
      const newData = buildInitialData();
      form.updateFormData(newData);
    }
  }, [entity, isOpen, buildInitialData, form]);

  return {
    ...form,
    isEditMode,
    canSubmit: form.isValid && !form.isSubmitting,
  };
}
```

### Step 3: Write Tests

Create tests in `__tests__` directory:

```tsx
// src/hooks/my-feature/__tests__/useMyEntityFormValidated.test.ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMyEntityFormValidated } from "../useMyEntityFormValidated";

describe("useMyEntityFormValidated", () => {
  it("should initialize with empty form for new entity", () => {
    const { result } = renderHook(() =>
      useMyEntityFormValidated({
        entity: null,
        isOpen: true,
      })
    );

    expect(result.current.data.name).toBe("");
    expect(result.current.isEditMode).toBe(false);
  });

  // Add more tests...
});
```

---

## Best Practices

### 1. Always Use Zod Schemas for Forms

❌ **Don't:**

```tsx
const [name, setName] = useState("");
const [errors, setErrors] = useState({});

const validateForm = () => {
  if (!name) {
    setErrors({ name: "Name is required" });
    return false;
  }
  return true;
};
```

✅ **Do:**

```tsx
const form = useValidatedForm({
  schema: MyFormSchema,
  initialData: { name: "" },
});

// Validation is automatic
```

### 2. Use Coercion for Form Inputs

Form inputs always return strings. Use `z.coerce` to convert to numbers:

```tsx
const MyFormSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .pipe(z.coerce.number().min(0, "Amount must be positive")),
});
```

### 3. Provide Clear Error Messages

```tsx
const MyFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  amount: z.coerce.number().min(1, "Amount must be at least $1"),
});
```

### 4. Use Optional Fields Appropriately

```tsx
const MyFormSchema = z.object({
  name: z.string().min(1, "Name is required"), // Required
  description: z.string().optional().default(""), // Optional with default
  notes: z.string().max(500).optional(), // Optional, can be undefined
});
```

### 5. Add Custom Refinements for Complex Validation

```tsx
const MyFormSchema = z
  .object({
    startDate: z.string(),
    endDate: z.string(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );
```

### 6. Transform Data After Validation

```tsx
const MyFormSchema = z
  .object({
    name: z.string().min(1),
    amount: z.coerce.number().min(0),
  })
  .transform((data) => ({
    ...data,
    name: data.name.trim(), // Clean up whitespace
    timestamp: Date.now(), // Add server-side fields
  }));
```

### 7. Validate Props in Development Only

The `validateComponentProps` function only runs in development mode and is stripped in production builds.

```tsx
const MyComponent = (props) => {
  validateComponentProps("MyComponent", props, MyComponentPropsSchema);
  // Component implementation
};
```

---

## Migration from Old Patterns

### Before (Manual Validation)

```tsx
const useMyForm = (initialData) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!data.name) newErrors.name = "Required";
    if (!data.amount || data.amount < 0) newErrors.amount = "Must be positive";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    await submitData(data);
  };

  return { data, setData, errors, handleSubmit };
};
```

### After (Zod + useValidatedForm)

```tsx
const useMyFormValidated = (initialData, onSubmit) => {
  return useValidatedForm({
    schema: MyFormSchema,
    initialData,
    onSubmit,
  });
};
```

---

## Resources

- [Zod Documentation](https://zod.dev/)
- [useValidatedForm Source](/src/hooks/common/validation/useValidatedForm.ts)
- [Validation Helper Functions](/src/hooks/common/validation/validationHookHelpers.ts)
- [Component Prop Schemas](/src/domain/schemas/component-props.ts)

---

## Support

For questions or issues with Zod integration:

1. Check this guide for examples and patterns
2. Review existing validated form hooks in `/src/hooks`
3. Look at test files for usage examples
4. Refer to the Zod documentation for schema syntax
