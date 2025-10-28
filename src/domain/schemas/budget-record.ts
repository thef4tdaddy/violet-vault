/**
 * Budget Record Domain Schema
 * Runtime validation for main budget record entity
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

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
