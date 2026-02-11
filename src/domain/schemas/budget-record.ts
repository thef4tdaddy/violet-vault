/**
 * Budget Record Domain Schema
 * Runtime validation for main budget record entity
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Balance value validation constants
 * Part of Issue #1367: Actual Balance Validation with Zod
 */
const MAX_BALANCE = 1000000; // $1M limit
const MIN_BALANCE = -100000; // -$100k limit (for overdrafts)

/**
 * Zod schema for balance value validation
 * Validates actual balance, unassigned cash, and other balance fields
 * Part of Issue #1367: Actual Balance Validation with Zod
 */
export const BalanceValueSchema = z
  .number("Balance must be a number")
  .finite("Balance must be a finite number")
  .min(MIN_BALANCE, `Balance cannot be less than ${MIN_BALANCE.toLocaleString()}`)
  .max(MAX_BALANCE, `Balance cannot exceed ${MAX_BALANCE.toLocaleString()}`);

/**
 * Optional balance value schema for calculated balances
 * Allows undefined/null for calculated values that may not be set yet
 */
export const OptionalBalanceValueSchema = BalanceValueSchema.optional();

/**
 * Zod schema for BudgetRecord validation
 * Main record for budget data with flexible additional properties
 */
export const BudgetRecordSchema = z
  .object({
    id: z.string().min(1, "Budget record ID is required"),
    lastModified: z.number().int().positive("Last modified must be a positive number"),
    version: z.number().int().positive().optional(),
  })
  .passthrough(); // Allow additional properties for encrypted budget data

/**
 * Type inference from schema
 */
export type BudgetRecord = z.infer<typeof BudgetRecordSchema>;

/**
 * Partial budget record schema for updates
 */
export const BudgetRecordPartialSchema = BudgetRecordSchema.partial();
export type BudgetRecordPartial = z.infer<typeof BudgetRecordPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateBudgetRecord = (data: unknown): BudgetRecord => {
  return BudgetRecordSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateBudgetRecordSafe = (data: unknown) => {
  return BudgetRecordSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateBudgetRecordPartial = (data: unknown): BudgetRecordPartial => {
  return BudgetRecordPartialSchema.parse(data);
};

/**
 * Safe validation helper for partial updates - returns result with error details
 */
export const validateBudgetRecordPartialSafe = (data: unknown) => {
  return BudgetRecordPartialSchema.safeParse(data);
};

/**
 * Validate balance value using Zod schema
 * Part of Issue #1367: Actual Balance Validation with Zod
 */
export const validateBalanceValue = (balance: unknown) => {
  return BalanceValueSchema.safeParse(balance);
};

/**
 * Validate balance value (throws on invalid)
 * Part of Issue #1367: Actual Balance Validation with Zod
 */
export const validateBalanceValueStrict = (balance: unknown): number => {
  return BalanceValueSchema.parse(balance);
};
