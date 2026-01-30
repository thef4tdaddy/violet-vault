/**
 * Paycheck Wizard Validation Schemas
 * Comprehensive Zod validation for paycheck wizard data
 * Part of Issue #1843: Zod Schema Validation for Paycheck Wizard
 */

import { z } from "zod";
import { TransactionSchema } from "@/domain/schemas/transaction";

/**
 * Allocation Strategy Enum
 * Defines the available allocation strategies in the wizard
 */
export const AllocationStrategySchema = z.enum(["last", "even", "smart", "manual"]);
export type AllocationStrategy = z.infer<typeof AllocationStrategySchema>;

/**
 * Paycheck Amount Validation
 * Validates paycheck amounts in cents with precision and range checks
 */
export const PaycheckAmountSchema = z.object({
  amountCents: z
    .number({
      message: "Paycheck amount must be a number",
    })
    .int("Amount must be in whole cents (no fractions)")
    .positive("Amount must be positive")
    .min(100, "Minimum paycheck is $1.00")
    .max(100_000_000, "Maximum paycheck is $1,000,000.00"),
});

export type PaycheckAmountData = z.infer<typeof PaycheckAmountSchema>;

/**
 * Single Allocation Validation
 * Validates individual envelope allocations
 */
export const AllocationItemSchema = z.object({
  envelopeId: z.string().min(1, "Envelope ID is required"),
  amountCents: z
    .number({
      message: "Allocation amount must be a number",
    })
    .int("Amount must be in whole cents (no fractions)")
    .nonnegative("Amount cannot be negative"),
});

export type AllocationItem = z.infer<typeof AllocationItemSchema>;

/**
 * Allocations Array Validation
 * Validates the complete allocations array with sum validation
 *
 * CRITICAL: Allocations MUST sum to exactly the paycheck amount (cents-perfect)
 */
export const AllocationsArraySchema = z
  .array(AllocationItemSchema)
  .min(1, "At least one allocation is required");

/**
 * Complete Allocations Validation with Sum Check
 * Validates that allocations sum to the exact paycheck amount
 */
export const AllocationsWithSumSchema = z
  .object({
    paycheckAmountCents: z.number().int().positive(),
    allocations: AllocationsArraySchema,
  })
  .refine(
    (data) => {
      const sum = data.allocations.reduce((total, allocation) => total + allocation.amountCents, 0);
      return sum === data.paycheckAmountCents;
    },
    {
      message: "Allocations must sum to exact paycheck amount (no rounding errors)",
      path: ["allocations"],
    }
  );

export type AllocationsWithSum = z.infer<typeof AllocationsWithSumSchema>;

/**
 * Complete Wizard Data Validation
 * Validates all data from the paycheck wizard
 */
export const PaycheckWizardDataSchema = z.object({
  paycheckAmountCents: PaycheckAmountSchema.shape.amountCents,
  payerName: z.string().nullable().optional(), // Employer/payer name (optional)
  selectedStrategy: AllocationStrategySchema,
  allocations: AllocationsArraySchema,
});

export type PaycheckWizardData = z.infer<typeof PaycheckWizardDataSchema>;

/**
 * Paycheck Transaction Data
 * Schema for creating a Transaction record from wizard data
 * Extends existing TransactionSchema with paycheck-specific requirements
 */
export const PaycheckTransactionDataSchema = z.object({
  // Transaction base fields
  date: z.union([z.date(), z.string()]),
  envelopeId: z.string().min(1, "Primary envelope ID is required"),
  category: z.string().min(1, "Category is required").default("Paycheck"),

  // Paycheck-specific fields
  amount: z.number().int().positive(), // Total paycheck in cents
  allocations: z.record(z.string(), z.number().int().nonnegative()), // envelopeId -> amountCents

  // Optional paycheck metadata
  recurrenceRule: z.string().nullable().optional(), // iCal RRule format
  paycheckId: z.string().nullable().optional(),
  payerName: z.string().nullable().optional(),

  // Balance tracking
  unassignedCashBefore: z.number().nullable().optional(),
  unassignedCashAfter: z.number().nullable().optional(),
  actualBalanceBefore: z.number().nullable().optional(),
  actualBalanceAfter: z.number().nullable().optional(),

  // Transaction audit fields
  description: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export type PaycheckTransactionData = z.infer<typeof PaycheckTransactionDataSchema>;

/**
 * Validation Helper: Safe Parse Paycheck Amount
 * Returns validation result without throwing
 */
export const validatePaycheckAmountSafe = (amountCents: number) => {
  return PaycheckAmountSchema.safeParse({ amountCents });
};

/**
 * Validation Helper: Safe Parse Allocations
 * Returns validation result without throwing
 */
export const validateAllocationsSafe = (allocations: AllocationItem[]) => {
  return AllocationsArraySchema.safeParse(allocations);
};

/**
 * Validation Helper: Safe Parse Allocations with Sum Check
 * Validates allocations and ensures they sum to paycheck amount
 */
export const validateAllocationsWithSumSafe = (
  paycheckAmountCents: number,
  allocations: AllocationItem[]
) => {
  return AllocationsWithSumSchema.safeParse({ paycheckAmountCents, allocations });
};

/**
 * Validation Helper: Safe Parse Complete Wizard Data
 * Returns validation result without throwing
 */
export const validateWizardDataSafe = (data: unknown) => {
  return PaycheckWizardDataSchema.safeParse(data);
};

/**
 * Validation Helper: Parse Paycheck Amount (throws on error)
 * Use this when you want to validate and throw on invalid data
 */
export const validatePaycheckAmount = (amountCents: number): PaycheckAmountData => {
  return PaycheckAmountSchema.parse({ amountCents });
};

/**
 * Validation Helper: Parse Allocations (throws on error)
 * Use this when you want to validate and throw on invalid data
 */
export const validateAllocations = (allocations: AllocationItem[]): AllocationItem[] => {
  return AllocationsArraySchema.parse(allocations);
};

/**
 * Validation Helper: Parse Complete Wizard Data (throws on error)
 * Use this when you want to validate and throw on invalid data
 */
export const validateWizardData = (data: unknown): PaycheckWizardData => {
  return PaycheckWizardDataSchema.parse(data);
};

/**
 * Create Paycheck Transaction from Wizard Data
 * Converts wizard data into a valid Transaction object
 *
 * @param wizardData - Validated paycheck wizard data
 * @param userId - User ID for the transaction
 * @param primaryEnvelopeId - Primary envelope (e.g., "Paycheck" envelope)
 * @returns Validated Transaction object ready for database persistence
 *
 * @throws ZodError if transaction validation fails
 *
 * @example
 * const transaction = createPaycheckTransaction(wizardData, "user_123", "env_paycheck");
 * // transaction is now a valid Transaction object
 */
export const createPaycheckTransaction = (
  wizardData: PaycheckWizardData,
  userId: string,
  primaryEnvelopeId: string,
  options?: {
    date?: Date | string;
    recurrenceRule?: string | null;
    payerName?: string | null;
    description?: string | null;
    unassignedCashBefore?: number | null;
    unassignedCashAfter?: number | null;
    actualBalanceBefore?: number | null;
    actualBalanceAfter?: number | null;
  }
) => {
  // Convert allocations array to Record<string, number> format
  const allocationsMap = wizardData.allocations.reduce(
    (acc, allocation) => ({
      ...acc,
      [allocation.envelopeId]: allocation.amountCents,
    }),
    {} as Record<string, number>
  );

  // Build transaction object
  const transaction = {
    id: `txn_paycheck_${Date.now()}_${userId.substring(0, 8)}`,
    type: "income" as const,
    date: options?.date || new Date(),
    amount: wizardData.paycheckAmountCents, // Positive for income
    envelopeId: primaryEnvelopeId,
    category: "Paycheck",
    lastModified: Date.now(),
    createdAt: Date.now(),

    // Paycheck-specific fields
    allocations: allocationsMap,
    recurrenceRule: options?.recurrenceRule || null,
    paycheckId: `paycheck_${Date.now()}`,
    payerName: wizardData.payerName || options?.payerName || null,

    // Balance tracking
    unassignedCashBefore: options?.unassignedCashBefore || null,
    unassignedCashAfter: options?.unassignedCashAfter || null,
    actualBalanceBefore: options?.actualBalanceBefore || null,
    actualBalanceAfter: options?.actualBalanceAfter || null,

    // Description
    description:
      options?.description || `Paycheck allocation (${wizardData.selectedStrategy} strategy)`,
    notes: null,

    // Transaction metadata
    isScheduled: false,
    isInternalTransfer: null,
    mode: "allocate" as const,
    merchant: null,
    receiptUrl: null,

    // Transfer fields (not used for paychecks)
    fromEnvelopeId: null,
    toEnvelopeId: null,
    incomeTransactionId: null,
    transferTransactionIds: null,
  };

  // Validate against TransactionSchema before returning
  return TransactionSchema.parse(transaction);
};

/**
 * Validation Error Formatter
 * Converts Zod errors to user-friendly messages
 *
 * PRIVACY: Never include sensitive data (amounts, allocations) in error messages
 */
export const formatValidationError = (error: z.ZodError): string => {
  const firstError = error.issues[0];

  if (!firstError) {
    return "Validation failed";
  }

  // Return user-friendly message
  return firstError.message;
};

/**
 * Check if allocations sum to paycheck amount
 * Helper for real-time validation in UI
 */
export const doAllocationsSumToPaycheck = (
  paycheckAmountCents: number,
  allocations: AllocationItem[]
): boolean => {
  const sum = allocations.reduce((total, allocation) => total + allocation.amountCents, 0);
  return sum === paycheckAmountCents;
};

/**
 * Calculate remaining amount to allocate
 * Helper for real-time UI feedback
 */
export const calculateRemainingAmount = (
  paycheckAmountCents: number,
  allocations: AllocationItem[]
): number => {
  const sum = allocations.reduce((total, allocation) => total + allocation.amountCents, 0);
  return paycheckAmountCents - sum;
};
