/**
 * Envelope Domain Schema
 * Runtime validation for budget envelope entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 * Updated for Issue #1335: Database Schema Migration for Savings Goals and Supplemental Accounts
 */

import { z } from "zod";

/**
 * Envelope type enum for classification
 */
export const EnvelopeTypeSchema = z.enum([
  "bill",
  "variable",
  "savings",
  "sinking_fund", // @deprecated - Use "savings" with targetDate instead
  "supplemental",
]);
export type EnvelopeType = z.infer<typeof EnvelopeTypeSchema>;

/**
 * Priority enum for savings goals
 */
export const EnvelopePrioritySchema = z.enum(["low", "medium", "high"]);
export type EnvelopePriority = z.infer<typeof EnvelopePrioritySchema>;

/**
 * Zod schema for Envelope validation
 * Represents budget allocation containers (e.g., "Groceries", "Gas")
 * Now also supports savings goals and supplemental accounts as envelope types
 */
export const EnvelopeSchema = z.object({
  id: z.string().min(1, "Envelope ID is required"),
  name: z
    .string()
    .min(1, "Envelope name is required")
    .max(100, "Envelope name must be 100 characters or less"),
  category: z.string().min(1, "Category is required"),
  archived: z.boolean().default(false),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  currentBalance: z.number().min(0, "Current balance cannot be negative").optional(),
  targetAmount: z.number().min(0, "Target amount cannot be negative").optional(),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
  // Envelope type classification
  envelopeType: EnvelopeTypeSchema.optional(),
  autoAllocate: z.boolean().optional(),
  monthlyBudget: z.number().min(0).optional(),
  biweeklyAllocation: z.number().min(0).optional(),
  // Connection properties
  billId: z.string().optional(),
  debtId: z.string().optional(),
  // Savings goal properties (for envelopeType: "savings")
  priority: EnvelopePrioritySchema.optional(),
  isPaused: z.boolean().optional(),
  isCompleted: z.boolean().optional(),
  targetDate: z.union([z.date(), z.string()]).optional(),
  monthlyContribution: z.number().min(0).optional(),
  // Supplemental account properties (for envelopeType: "supplemental")
  annualContribution: z.number().min(0).optional(),
  expirationDate: z.union([z.date(), z.string(), z.null()]).optional(),
  isActive: z.boolean().optional(),
  accountType: z.string().optional(), // FSA, HSA, etc.
});

/**
 * Type inference from schema
 * Use this type for fully validated envelope data
 */
export type Envelope = z.infer<typeof EnvelopeSchema>;

/**
 * Partial envelope schema for updates (PATCH operations)
 */
export const EnvelopePartialSchema = EnvelopeSchema.partial();
export type EnvelopePartial = z.infer<typeof EnvelopePartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateEnvelope = (data: unknown): Envelope => {
  return EnvelopeSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateEnvelopeSafe = (data: unknown) => {
  return EnvelopeSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateEnvelopePartial = (data: unknown): EnvelopePartial => {
  return EnvelopePartialSchema.parse(data);
};
