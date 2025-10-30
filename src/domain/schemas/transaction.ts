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
 * Zod schema for Transaction validation
 * Represents financial transactions (income, expenses, transfers)
 */
export const TransactionSchema = z.object({
  id: z.string().min(1, "Transaction ID is required"),
  date: z.union([z.date(), z.string()]),
  amount: z.number().min(0, "Amount cannot be negative"),
  envelopeId: z.string().min(1, "Envelope ID is required"),
  category: z.string().min(1, "Category is required"),
  type: TransactionTypeSchema.default("expense"),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  merchant: z.string().max(200, "Merchant must be 200 characters or less").optional(),
  receiptUrl: z.string().url("Receipt URL must be a valid URL").optional(),
});

/**
 * Type inference from schema
 */
export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Partial transaction schema for updates
 */
export const TransactionPartialSchema = TransactionSchema.partial();
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
