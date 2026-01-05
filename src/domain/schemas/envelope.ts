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
 * Account type enum for supplemental accounts
 */
export const SupplementalAccountTypeSchema = z.enum(["FSA", "HSA", "529", "IRA", "401K", "other"]);
export type SupplementalAccountType = z.infer<typeof SupplementalAccountTypeSchema>;

/**
 * Zod schema for Envelope validation
 * Represents budget allocation containers (e.g., "Groceries", "Gas")
 * Now also supports savings goals and supplemental accounts as envelope types
 * Uses passthrough() to allow additional metadata fields
 */
export const EnvelopeSchema = z
  .object({
    id: z.string().min(1, "Envelope ID is required"),
    name: z
      .string()
      .min(1, "Envelope name is required")
      .max(100, "Envelope name must be 100 characters or less"),
    category: z.string().min(1, "Category is required"),
    archived: z.boolean().default(false),
    lastModified: z.number().int().positive("Last modified must be a positive number"),
    createdAt: z.number().int().positive().optional(),
    currentBalance: z.number().min(0, "Current balance cannot be negative").nullable().optional(),
    targetAmount: z.number().min(0, "Target amount cannot be negative").nullable().optional(),
    description: z
      .string()
      .max(500, "Description must be 500 characters or less")
      .nullable()
      .optional(),
    // Envelope type classification
    envelopeType: EnvelopeTypeSchema.nullable().optional(),
    autoAllocate: z.boolean().nullable().optional(),
    monthlyBudget: z.number().min(0).nullable().optional(),
    biweeklyAllocation: z.number().min(0).nullable().optional(),
    // Connection properties
    billId: z.string().nullable().optional(),
    debtId: z.string().nullable().optional(),
    // Savings goal properties (for envelopeType: "savings")
    priority: EnvelopePrioritySchema.nullable().optional(),
    isPaused: z.boolean().nullable().optional(),
    isCompleted: z.boolean().nullable().optional(),
    targetDate: z.union([z.date(), z.string()]).nullable().optional(),
    monthlyContribution: z.number().min(0).nullable().optional(),
    // Supplemental account properties (for envelopeType: "supplemental")
    annualContribution: z.number().min(0).nullable().optional(),
    expirationDate: z.union([z.date(), z.string(), z.null()]).nullable().optional(),
    isActive: z.boolean().nullable().optional(),
    accountType: z.string().nullable().optional(), // FSA, HSA, etc.
  })
  .passthrough(); // Allow additional metadata fields

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

/**
 * Safe validation helper for partial updates - returns result with error details
 */
export const validateEnvelopePartialSafe = (data: unknown) => {
  return EnvelopePartialSchema.safeParse(data);
};

/**
 * Supplemental Account Schema
 * Extends EnvelopeSchema with supplemental-specific fields
 * Used for FSA, HSA, 529, IRA, 401K accounts, etc.
 */
export const SupplementalAccountSchema = EnvelopeSchema.extend({
  envelopeType: z.literal("supplemental"),
  annualContribution: z.number().min(0, "Annual contribution cannot be negative").optional(),
  expirationDate: z.union([z.date(), z.string(), z.null()]).optional(),
  isActive: z.boolean().default(true),
  accountType: SupplementalAccountTypeSchema.optional(),
});

/**
 * Type inference for SupplementalAccount
 */
export type SupplementalAccount = z.infer<typeof SupplementalAccountSchema>;

/**
 * Partial supplemental account schema for updates
 */
export const SupplementalAccountPartialSchema = SupplementalAccountSchema.partial();
export type SupplementalAccountPartial = z.infer<typeof SupplementalAccountPartialSchema>;

/**
 * Validation helper for supplemental accounts - throws on invalid data
 */
export const validateSupplementalAccount = (data: unknown): SupplementalAccount => {
  return SupplementalAccountSchema.parse(data);
};

/**
 * Safe validation helper for supplemental accounts - returns result with error details
 */
export const validateSupplementalAccountSafe = (data: unknown) => {
  return SupplementalAccountSchema.safeParse(data);
};

/**
 * Savings Envelope Schema
 * Extends EnvelopeSchema with savings-specific fields
 * Used for savings goals and sinking funds
 */
export const SavingsEnvelopeSchema = EnvelopeSchema.extend({
  envelopeType: z.literal("savings"),
  targetAmount: z.number().min(0, "Target amount cannot be negative"),
  currentBalance: z.number().min(0, "Current balance cannot be negative").default(0),
  priority: EnvelopePrioritySchema.default("medium"),
  isPaused: z.boolean().default(false),
  isCompleted: z.boolean().default(false),
  targetDate: z.union([z.date(), z.string()]).optional(),
  monthlyContribution: z.number().min(0).optional(),
});

/**
 * Type inference for SavingsEnvelope
 */
export type SavingsEnvelope = z.infer<typeof SavingsEnvelopeSchema>;

/**
 * Partial savings envelope schema for updates
 */
export const SavingsEnvelopePartialSchema = SavingsEnvelopeSchema.partial();
export type SavingsEnvelopePartial = z.infer<typeof SavingsEnvelopePartialSchema>;

/**
 * Validation helper for savings envelopes - throws on invalid data
 */
export const validateSavingsEnvelope = (data: unknown): SavingsEnvelope => {
  return SavingsEnvelopeSchema.parse(data);
};

/**
 * Safe validation helper for savings envelopes - returns result with error details
 */
export const validateSavingsEnvelopeSafe = (data: unknown) => {
  return SavingsEnvelopeSchema.safeParse(data);
};
