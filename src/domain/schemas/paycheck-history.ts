/**
 * Paycheck History Domain Schema
 * Runtime validation for paycheck/income history entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from 'zod';

/**
 * Zod schema for PaycheckHistory validation
 * Represents income deposits with allocation tracking
 */
export const PaycheckHistorySchema = z.object({
  id: z.string().min(1, 'Paycheck ID is required'),
  date: z.union([z.date(), z.string()], 'Date must be a valid date'),
  amount: z.number().min(0, 'Amount cannot be negative'),
  source: z.string().min(1, 'Source is required').max(100),
  allocations: z.record(z.string(), z.number().min(0)).optional(),
  lastModified: z.number().int().positive('Last modified must be a positive number'),
  createdAt: z.number().int().positive().optional(),
  deductions: z.record(z.string(), z.number().min(0)).optional(),
  netAmount: z.number().min(0).optional(),
});

/**
 * Type inference from schema
 */
export type PaycheckHistory = z.infer<typeof PaycheckHistorySchema>;

/**
 * Partial paycheck history schema for updates
 */
export const PaycheckHistoryPartialSchema = PaycheckHistorySchema.partial();
export type PaycheckHistoryPartial = z.infer<typeof PaycheckHistoryPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validatePaycheckHistory = (data: unknown): PaycheckHistory => {
  return PaycheckHistorySchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validatePaycheckHistorySafe = (data: unknown) => {
  return PaycheckHistorySchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validatePaycheckHistoryPartial = (data: unknown): PaycheckHistoryPartial => {
  return PaycheckHistoryPartialSchema.parse(data);
};
