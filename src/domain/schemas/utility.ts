/**
 * Utility Domain Schemas
 * Runtime validation for query and operation utilities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Zod schema for DateRange validation
 * Used for querying data within a date range
 */
export const DateRangeSchema = z.object({
  start: z.union([z.date(), z.string()], "Start date must be valid"),
  end: z.union([z.date(), z.string()], "End date must be valid"),
});

export type DateRange = z.infer<typeof DateRangeSchema>;

/**
 * Bulk update type enum
 */
export const BulkUpdateTypeSchema = z.enum([
  "envelope",
  "transaction",
  "bill",
  "savingsGoal",
  "paycheck",
]);
export type BulkUpdateType = z.infer<typeof BulkUpdateTypeSchema>;

/**
 * Zod schema for BulkUpdate validation
 * Used for bulk operations on multiple entities
 */
export const BulkUpdateSchema = z.object({
  type: BulkUpdateTypeSchema,
  data: z.unknown(),
});

export type BulkUpdate = z.infer<typeof BulkUpdateSchema>;

/**
 * Zod schema for DatabaseStats validation
 * Represents statistics about the database
 */
export const DatabaseStatsSchema = z.object({
  envelopes: z.number().int().min(0, "Envelope count cannot be negative"),
  transactions: z.number().int().min(0, "Transaction count cannot be negative"),
  bills: z.number().int().min(0, "Bill count cannot be negative"),
  savingsGoals: z.number().int().min(0, "Savings goal count cannot be negative"),
  paychecks: z.number().int().min(0, "Paycheck count cannot be negative"),
  cache: z.number().int().min(0, "Cache count cannot be negative"),
  lastOptimized: z.number().int().positive("Last optimized must be a positive number"),
});

export type DatabaseStats = z.infer<typeof DatabaseStatsSchema>;

/**
 * Validation helpers for DateRange
 */
export const validateDateRange = (data: unknown): DateRange => {
  return DateRangeSchema.parse(data);
};

export const validateDateRangeSafe = (data: unknown) => {
  return DateRangeSchema.safeParse(data);
};

/**
 * Validation helpers for BulkUpdate
 */
export const validateBulkUpdate = (data: unknown): BulkUpdate => {
  return BulkUpdateSchema.parse(data);
};

export const validateBulkUpdateSafe = (data: unknown) => {
  return BulkUpdateSchema.safeParse(data);
};

/**
 * Validation helpers for DatabaseStats
 */
export const validateDatabaseStats = (data: unknown): DatabaseStats => {
  return DatabaseStatsSchema.parse(data);
};

export const validateDatabaseStatsSafe = (data: unknown) => {
  return DatabaseStatsSchema.safeParse(data);
};
