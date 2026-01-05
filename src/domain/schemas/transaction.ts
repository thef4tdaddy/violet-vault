/**
 * Transaction Domain Schema
 * Runtime validation for financial transaction entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Transaction type enum
 */
export const TransactionTypeSchema = z.enum(["income", "expense", "transfer"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

/**
 * Base transaction object schema (without refinements)
 * Used as the base for both full and partial schemas
 */
const TransactionBaseSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  date: z.union([z.date(), z.string()]),
  amount: z.number(), // Can be positive (income) or negative (expense)
  envelopeId: z.string().min(1, "Envelope ID is required"),
  category: z.string().min(1, "Category is required"),
  type: TransactionTypeSchema.default("expense"),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  merchant: z.string().max(200, "Merchant must be 200 characters or less").nullable().optional(),
  receiptUrl: z.string().url("Receipt URL must be a valid URL").nullable().optional(),
  // Paycheck-related metadata for internal transfers
  isInternalTransfer: z.boolean().nullable().optional(),
  paycheckId: z.string().nullable().optional(),
  // Transfer-specific fields
  fromEnvelopeId: z.string().nullable().optional(),
  toEnvelopeId: z.string().nullable().optional(),
});

/**
 * Zod schema for Transaction validation
 * Represents financial transactions (income, expenses, transfers)
 *
 * CRITICAL CONVENTION:
 * - Positive amounts = Income/deposits
 * - Negative amounts = Expenses/withdrawals
 * This allows analytics calculations to work without checking the 'type' field
 *
 * The schema enforces this convention with refinement rules:
 * - type='expense' MUST have negative amount
 * - type='income' MUST have positive amount
 * - type='transfer' can be either (depending on direction)
 */
export const TransactionSchema = TransactionBaseSchema.refine(
  (data) => {
    // Enforce sign convention based on transaction type
    if (data.type === "expense" && data.amount > 0) {
      return false; // Expenses MUST be negative
    }
    if (data.type === "income" && data.amount < 0) {
      return false; // Income MUST be positive
    }
    return true;
  },
  {
    message:
      "Transaction amount sign must match type: expenses must be negative, income must be positive",
    path: ["amount"],
  }
);

/**
 * Type inference from schema
 */
export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Partial transaction schema for updates
 * Note: Cannot use .partial() on schemas with .refine() in Zod v4
 * Created manually by making all fields optional
 */
export const TransactionPartialSchema = z
  .object({
    id: z.string().min(1, "Transaction ID is required").optional(),
    date: z.union([z.date(), z.string()]).optional(),
    amount: z.number().optional(),
    envelopeId: z.string().min(1, "Envelope ID is required").optional(),
    category: z.string().min(1, "Category is required").optional(),
    type: TransactionTypeSchema.optional(),
    lastModified: z.number().int().positive("Last modified must be a positive number").optional(),
    createdAt: z.number().int().positive().optional(),
    description: z
      .string()
      .max(500, "Description must be 500 characters or less")
      .nullable()
      .optional(),
    merchant: z.string().max(200, "Merchant must be 200 characters or less").nullable().optional(),
    receiptUrl: z.string().url("Receipt URL must be a valid URL").nullable().optional(),
    isInternalTransfer: z.boolean().nullable().optional(),
    paycheckId: z.string().nullable().optional(),
    fromEnvelopeId: z.string().nullable().optional(),
    toEnvelopeId: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      // Only enforce sign convention when both type and amount are provided
      if (data.type === undefined || data.amount === undefined) {
        return true;
      }
      if (data.type === "expense" && data.amount > 0) {
        return false; // Expenses MUST be negative
      }
      if (data.type === "income" && data.amount < 0) {
        return false; // Income MUST be positive
      }
      return true;
    },
    {
      message:
        "Transaction amount sign must match type: expenses must be negative, income must be positive",
      path: ["amount"],
    }
  );
export type TransactionPartial = z.infer<typeof TransactionPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateTransaction = (data: unknown): Transaction => {
  return TransactionSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateTransactionSafe = (data: unknown) => {
  return TransactionSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateTransactionPartial = (data: unknown): TransactionPartial => {
  return TransactionPartialSchema.parse(data);
};

/**
 * Safe validation helper for partial updates - returns result with error details
 */
export const validateTransactionPartialSafe = (data: unknown) => {
  return TransactionPartialSchema.safeParse(data);
};

/**
 * Normalize transaction amount based on type
 * Ensures expenses are negative and income is positive
 * Use this before saving transactions to enforce the sign convention
 *
 * @param transaction - Transaction data (can have wrong sign)
 * @returns Transaction with correct amount sign
 *
 * @example
 * const txn = { amount: 100, type: 'expense' }; // Wrong sign
 * const normalized = normalizeTransactionAmount(txn);
 * // Result: { amount: -100, type: 'expense' } ✅
 */
export const normalizeTransactionAmount = <T extends { amount: number; type: string }>(
  transaction: T
): T => {
  const absAmount = Math.abs(transaction.amount);

  if (transaction.type === "expense") {
    return { ...transaction, amount: -absAmount };
  }
  if (transaction.type === "income") {
    return { ...transaction, amount: absAmount };
  }
  // Transfers keep their original sign
  return transaction;
};

/**
 * Validate and normalize a transaction in one step
 * Ensures correct sign convention before validation
 *
 * @param data - Raw transaction data
 * @returns Validated transaction with correct amount sign
 * @throws ZodError if validation fails
 *
 * @example
 * const raw = { id: 'txn-1', amount: 50, type: 'expense', ... };
 * const validated = validateAndNormalizeTransaction(raw);
 * // Result: { id: 'txn-1', amount: -50, type: 'expense', ... } ✅
 */
export const validateAndNormalizeTransaction = (data: unknown): Transaction => {
  // First normalize the amount
  const normalized = normalizeTransactionAmount(data as { amount: number; type: string });
  // Then validate
  return TransactionSchema.parse(normalized);
};

/**
 * Transaction Form Data Schema
 * Used for form inputs where amounts and dates are strings
 * Part of standardized form validation pattern with useValidatedForm
 */
export const TransactionFormDataSchema = z.object({
  date: z.string().min(1, "Date is required"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be 500 characters or less"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
      },
      { message: "Amount must be a valid positive number" }
    ),
  type: TransactionTypeSchema.default("expense"),
  envelopeId: z.string().min(1, "Envelope is required"),
  category: z.string().min(1, "Category is required"),
  notes: z.string().max(1000, "Notes must be 1000 characters or less").optional().default(""),
  merchant: z.string().max(200, "Merchant must be 200 characters or less").optional(),
  receiptUrl: z.string().url("Receipt URL must be a valid URL").optional().or(z.literal("")),
  reconciled: z.boolean().default(false),
});

export type TransactionFormData = z.infer<typeof TransactionFormDataSchema>;
