import { z } from "zod";
import { LiabilityEnvelopeSchema, type LiabilityEnvelope, type EnvelopePartial } from "./envelope";

export type Debt = LiabilityEnvelope;
export type DebtPartial = EnvelopePartial;

// Re-export type and status schemas for compatibility
export const DebtTypeSchema = z.enum([
  "liability",
  "personal",
  "credit_card",
  "mortgage",
  "auto",
  "student",
  "business",
  "chapter13",
  "other",
  "bill",
]);

export const DebtStatusSchema = z.enum(["active", "paid", "closed", "defaulted"]);

export const DebtSchema = LiabilityEnvelopeSchema.extend({
  category: z.string().default("Debt"),
  type: DebtTypeSchema.default("other"),
  status: DebtStatusSchema.default("active"),
  creditor: z.string().min(1, "Creditor is required").max(100),
});

export const DebtPartialSchema = DebtSchema.partial();

export const validateDebt = (data: unknown) => DebtSchema.parse(data);
export const validateDebtSafe = (data: unknown) => DebtSchema.safeParse(data);
export const validateDebtPartial = (data: unknown) => DebtPartialSchema.parse(data);
export const validateDebtPartialSafe = (data: unknown) => DebtPartialSchema.safeParse(data);

// Form and validation types
export const DebtFormSchema = LiabilityEnvelopeSchema.omit({
  id: true,
  lastModified: true,
  createdAt: true,
})
  .extend({
    type: z
      .enum([
        "liability",
        "personal",
        "credit_card",
        "mortgage",
        "auto",
        "student",
        "business",
        "chapter13",
        "other",
        "bill",
      ])
      .default("personal"),
    name: z
      .string({ message: "Debt name is required" })
      .trim()
      .min(1, "Debt name is required")
      .max(100, "Debt name cannot exceed 100 characters"),
    creditor: z
      .string({ message: "Creditor name is required" })
      .trim()
      .min(1, "Creditor name is required")
      .max(100, "Creditor name cannot exceed 100 characters"),
    category: z.string().default("Debt"),
    balance: z.string().optional(), // alias for currentBalance sometimes used
    currentBalance: z
      .string({ message: "Valid current balance is required" })
      .min(1, "Valid current balance is required")
      .regex(/^\d+(\.\d+)?$/, "Valid current balance is required"),
    originalBalance: z
      .string()
      .optional()
      .refine((val) => !val || /^\d+(\.\d+)?$/.test(val), "Original balance must be positive"),
    interestRate: z
      .string()
      .refine((val) => {
        if (!val) return true;
        const n = parseFloat(val);
        return !isNaN(n) && n >= 0 && n <= 100;
      }, "Interest rate must be between 0 and 100")
      .default("0"),
    minimumPayment: z
      .string({ message: "Valid minimum payment is required" })
      .min(1, "Valid minimum payment is required")
      .regex(/^\d+(\.\d+)?$/, "Valid minimum payment is required"),
    paymentFrequency: z
      .enum(["monthly", "quarterly", "annually", "weekly", "biweekly"])
      .default("monthly"),
    compoundFrequency: z.enum(["monthly", "annually", "daily"]).optional(),
    notes: z.string().optional(),
    // Additional form-only fields
    paymentMethod: z.string().optional(),
    createBill: z.boolean().optional(),
    envelopeId: z.string().optional(),
    existingBillId: z.string().optional(),
    newEnvelopeName: z.string().optional(),
    paymentDueDate: z.string().optional(),
  })
  .refine(
    (data) => {
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
      if (data.paymentMethod === "create_new" && data.createBill && !data.envelopeId) {
        return false;
      }
      return true;
    },
    {
      message: "Envelope is required when creating a bill",
      path: ["envelopeId"],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "create_new" && data.createBill && !data.paymentDueDate) {
        return false;
      }
      return true;
    },
    {
      message: "Due date is required when creating a bill",
      path: ["paymentDueDate"],
    }
  );

const parseNumericInternal = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = parseFloat(value.replace(/,/g, ""));
    return isNaN(n) ? fallback : n;
  }
  return fallback;
};

export const validateDebtFormDataSafe = (formData: unknown) => {
  const result = DebtFormSchema.safeParse(formData);
  const errors: Record<string, string> = {};
  const warnings: string[] = [];

  if (!result.success) {
    result.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors[issue.path[0].toString()] = issue.message;
      }
    });
    return {
      success: false,
      errors,
      warnings,
      error: result.error,
    };
  }

  const data = result.data;
  const currentBalance = parseNumericInternal(data.currentBalance);
  const minimumPayment = parseNumericInternal(data.minimumPayment);
  const interestRate = parseNumericInternal(data.interestRate);
  const originalBalance = data.originalBalance
    ? parseNumericInternal(data.originalBalance)
    : currentBalance;

  // Business logic warnings
  if (currentBalance > 0 && minimumPayment > 0) {
    const paymentRatio = minimumPayment / currentBalance;
    if (paymentRatio < 0.01) {
      warnings.push(
        "Minimum payment is less than 1% of balance - this will take very long to pay off"
      );
    } else if (paymentRatio > 0.5) {
      warnings.push("Minimum payment is more than 50% of balance - verify this is correct");
    }
  }

  if (interestRate > 25) {
    warnings.push("Interest rate is very high - consider debt consolidation options");
  }

  if (originalBalance > 0 && currentBalance > originalBalance) {
    warnings.push(
      "Current balance is higher than original balance - interest and fees may have accrued"
    );
  }

  return {
    success: true,
    data,
    errors: {},
    warnings,
  };
};

export type DebtFormData = z.infer<typeof DebtFormSchema>;
