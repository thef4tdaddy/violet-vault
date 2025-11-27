/**
 * Debt Domain Schema
 * Runtime validation for debt tracking entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Debt type enum - expanded to match DEBT_TYPES constants
 */
export const DebtTypeSchema = z.enum([
  "mortgage",
  "auto",
  "credit_card",
  "chapter13",
  "student",
  "personal",
  "business",
  "other",
]);
export type DebtType = z.infer<typeof DebtTypeSchema>;

/**
 * Debt status enum - expanded to match DEBT_STATUS constants
 */
export const DebtStatusSchema = z.enum(["active", "paid_off", "deferred", "default"]);
export type DebtStatus = z.infer<typeof DebtStatusSchema>;

/**
 * Payment frequency enum
 */
export const PaymentFrequencySchema = z.enum([
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "annually",
]);
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>;

/**
 * Compound frequency enum
 */
export const CompoundFrequencySchema = z.enum(["daily", "monthly", "annually"]);
export type CompoundFrequency = z.infer<typeof CompoundFrequencySchema>;

/**
 * Zod schema for Debt validation
 * Represents tracked debts (credit cards, loans, mortgages)
 */
export const DebtSchema = z.object({
  id: z.string().min(1, "Debt ID is required"),
  name: z.string().min(1, "Debt name is required").max(100),
  creditor: z.string().min(1, "Creditor name is required").max(100),
  type: DebtTypeSchema.default("other"),
  status: DebtStatusSchema.default("active"),
  currentBalance: z.number().min(0, "Current balance cannot be negative"),
  minimumPayment: z.number().min(0, "Minimum payment cannot be negative"),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  interestRate: z.number().min(0).max(100, "Interest rate must be between 0-100%").optional(),
  dueDate: z.union([z.date(), z.string()]).optional(),
  originalBalance: z.number().min(0).optional(),
});

/**
 * Type inference from schema
 */
export type Debt = z.infer<typeof DebtSchema>;

/**
 * Partial debt schema for updates
 */
export const DebtPartialSchema = DebtSchema.partial();
export type DebtPartial = z.infer<typeof DebtPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateDebt = (data: unknown): Debt => {
  return DebtSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateDebtSafe = (data: unknown) => {
  return DebtSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateDebtPartial = (data: unknown): DebtPartial => {
  return DebtPartialSchema.parse(data);
};

/**
 * Safe validation helper for partial updates - returns result with error details
 */
export const validateDebtPartialSafe = (data: unknown) => {
  return DebtPartialSchema.safeParse(data);
};

/**
 * Debt form validation schema
 * Used for validating form input before creating/updating debts
 * Supports both string and number inputs for numeric fields
 */
export const DebtFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "Debt name is required")
      .max(100, "Name must be 100 characters or less"),
    creditor: z
      .string()
      .min(1, "Creditor name is required")
      .max(100, "Creditor must be 100 characters or less"),
    type: DebtTypeSchema.optional().default("personal"),
    status: DebtStatusSchema.optional().default("active"),
    paymentFrequency: PaymentFrequencySchema.optional().default("monthly"),
    compoundFrequency: CompoundFrequencySchema.optional().default("monthly"),
    // Support string inputs for numeric fields (from form inputs)
    currentBalance: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0;
        },
        { message: "Valid current balance is required" }
      )
      .optional(),
    balance: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0;
        },
        { message: "Valid balance is required" }
      )
      .optional(),
    minimumPayment: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0;
        },
        { message: "Valid minimum payment is required" }
      )
      .optional(),
    interestRate: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0 && num <= 100;
        },
        { message: "Interest rate must be between 0 and 100" }
      )
      .optional()
      .default("0"),
    originalBalance: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          const num = parseFloat(val);
          return !isNaN(num) && num >= 0;
        },
        { message: "Original balance must be positive" }
      )
      .optional()
      .nullable(),
    notes: z.string().max(500, "Notes must be 500 characters or less").optional().default(""),
    specialTerms: z.record(z.string(), z.unknown()).optional(),
    // Connection fields
    paymentMethod: z.string().optional(),
    createBill: z.boolean().optional(),
    envelopeId: z.string().optional(),
    existingBillId: z.string().optional(),
    newEnvelopeName: z.string().optional(),
    paymentDueDate: z
      .string()
      .refine(
        (val) => {
          if (!val) return true;
          return !Number.isNaN(Date.parse(val));
        },
        { message: "Valid payment due date is required" }
      )
      .optional(),
  })
  .refine(
    (data) => {
      // At least one balance field is required
      if (!data.currentBalance && !data.balance) {
        return false;
      }
      return true;
    },
    {
      message: "Valid current balance is required",
      path: ["currentBalance"],
    }
  )
  .refine(
    (data) => {
      // Minimum payment is required
      if (!data.minimumPayment) {
        return false;
      }
      return true;
    },
    {
      message: "Valid minimum payment is required",
      path: ["minimumPayment"],
    }
  )
  .refine(
    (data) => {
      // If paymentMethod is connect_existing, existingBillId is required
      if (data.paymentMethod === "connect_existing_bill" && !data.existingBillId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a bill to connect",
      path: ["existingBillId"],
    }
  )
  .refine(
    (data) => {
      // If paymentMethod is create_new and createBill is true, envelopeId is required
      if (data.paymentMethod === "create_new" && data.createBill && !data.envelopeId) {
        return false;
      }
      return true;
    },
    {
      message: "Please select an envelope for payment funding",
      path: ["envelopeId"],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "create_new" && data.createBill) {
        return Boolean(data.paymentDueDate && !Number.isNaN(Date.parse(data.paymentDueDate)));
      }
      return true;
    },
    {
      message: "Payment due date is required when creating a new bill",
      path: ["paymentDueDate"],
    }
  )
  .transform((data) => {
    // Keep balance as fallback for currentBalance
    const currentBalance = data.currentBalance || data.balance || "";

    return {
      ...data,
      name: data.name.trim(),
      creditor: data.creditor.trim(),
      notes: data.notes?.trim() || "",
      balance: currentBalance,
      currentBalance,
    };
  });

export type DebtFormData = z.infer<typeof DebtFormSchema>;

/**
 * Validation helper for debt form data
 * Returns structured validation result with errors and warnings
 */
export const validateDebtFormDataSafe = (
  formData: unknown
): {
  success: boolean;
  data?: DebtFormData;
  errors: Record<string, string>;
  warnings: string[];
  // Complexity justified: Comprehensive validation with error/warning generation
  // eslint-disable-next-line complexity
} => {
  // Preprocess form data to provide defaults for undefined/null values
  const processedData =
    typeof formData === "object" && formData !== null
      ? {
          name: (formData as Record<string, unknown>).name ?? "",
          creditor: (formData as Record<string, unknown>).creditor ?? "",
          ...(formData as Record<string, unknown>),
        }
      : formData;

  const result = DebtFormSchema.safeParse(processedData);

  if (!result.success) {
    // Convert Zod errors to field-specific error messages
    const errors: Record<string, string> = {};
    result.error.issues.forEach((err) => {
      const path = err.path.length > 0 ? err.path.join(".") : "form";
      errors[path] = err.message;
    });

    return {
      success: false,
      errors,
      warnings: [],
    };
  }

  // Generate warnings based on business rules
  const warnings: string[] = [];
  const data = result.data;

  // Parse numeric string values for comparison
  const currentBalance = parseFloat(data.currentBalance || "0");
  const minimumPayment = parseFloat(data.minimumPayment || "0");
  const interestRate = parseFloat(data.interestRate || "0");

  // Warning: Very low minimum payment (less than 1% of balance)
  if (currentBalance > 0 && minimumPayment > 0) {
    const paymentPercent = (minimumPayment / currentBalance) * 100;
    if (paymentPercent < 1) {
      warnings.push(
        "Minimum payment is less than 1% of balance - this will take very long to pay off"
      );
    } else if (paymentPercent > 50) {
      warnings.push("Minimum payment is more than 50% of balance - verify this is correct");
    }
  }

  // Warning: High interest rate
  if (interestRate > 25) {
    warnings.push("Interest rate is very high - consider debt consolidation options");
  }

  // Warning: Current balance higher than original
  const originalBalance = parseFloat(data.originalBalance || "0");
  if (originalBalance > 0 && currentBalance > originalBalance) {
    warnings.push(
      "Current balance is higher than original balance - interest and fees may have accrued"
    );
  }

  return {
    success: true,
    data: result.data,
    errors: {},
    warnings,
  };
};
