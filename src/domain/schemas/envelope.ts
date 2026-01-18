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
/**
 * Envelope type enum for classification
 */
export const EnvelopeTypeSchema = z.enum([
  "standard",
  "goal",
  "liability",
  "supplemental",
  "personal",
  "credit_card",
  "mortgage",
  "auto",
  "student",
  "business",
  "other",
  "bill",
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
 * Base properties shared by all envelope types
 */
const EnvelopeBaseSchema = z.object({
  id: z.string().min(1, "Envelope ID is required"),
  name: z
    .string()
    .min(1, "Envelope name is required")
    .max(100, "Envelope name must be 100 characters or less"),
  category: z.string().min(1, "Category is required"),
  archived: z.boolean().default(false),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  currentBalance: z.number().min(0, "Balance cannot be negative").default(0),
  color: z.string().default("#3B82F6"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  autoAllocate: z.boolean().default(true),
  targetAmount: z.number().optional(),
});

/**
 * Standard Budget Envelope
 */
export const StandardEnvelopeSchema = EnvelopeBaseSchema.extend({
  type: z.literal("standard"),
  targetAmount: z.number().min(0).optional(),
  monthlyBudget: z.number().min(0).optional(),
  biweeklyAllocation: z.number().min(0).optional(),
});

/**
 * Savings Goal Envelope
 */
export const GoalEnvelopeSchema = EnvelopeBaseSchema.extend({
  type: z.literal("goal"),
  targetAmount: z.number().positive("Target amount must be positive"),
  currentAmount: z.number().optional(), // Alias for currentBalance in legacy code
  targetDate: z.union([z.date(), z.string()]).optional(),
  priority: EnvelopePrioritySchema.default("medium"),
  isPaused: z.boolean().default(false),
  isCompleted: z.boolean().default(false),
  monthlyContribution: z.number().min(0).optional(),
});

/**
 * Liability Envelope (Bills & Debts)
 */
export const LiabilityEnvelopeSchema = EnvelopeBaseSchema.extend({
  type: z.enum([
    "liability",
    "personal",
    "credit_card",
    "mortgage",
    "auto",
    "student",
    "business",
    "other",
    "bill",
    "chapter13",
  ]),
  status: z.enum(["active", "paid", "closed", "defaulted"]).default("active"),
  interestRate: z.number().min(0).max(100).nullable().default(0),
  minimumPayment: z.number().nonnegative().default(0),
  dueDate: z.union([z.number().int().min(1).max(31), z.string(), z.date()]).optional(),
  paymentDueDate: z.string().optional(), // Alias frequently used in debt management
  originalBalance: z.number().nonnegative().nullable().optional(),
  creditor: z.string().min(1, "Creditor is required").max(100).optional(),
  isPaid: z.boolean().default(false),
  // Backward compatibility & Extended properties
  envelopeId: z.string().optional(),
  isRecurring: z.boolean().optional(),
  frequency: z.string().optional(), // e.g., "monthly", "biweekly"
  paidAmount: z.number().optional(),
  paidDate: z.string().optional(),
  amount: z.number().nonnegative().optional(), // Alias for bill amount
});

/**
 * Supplemental Account Envelope (FSA, HSA, etc.)
 */
export const SupplementalAccountSchema = EnvelopeBaseSchema.extend({
  type: z.literal("supplemental"),
  accountType: SupplementalAccountTypeSchema.default("other"),
  annualContribution: z.number().min(0).optional(),
  expirationDate: z.union([z.date(), z.string(), z.null()]).optional(),
  isActive: z.boolean().default(true),
});

/**
 * Unified Envelope Schema
 * Using z.union instead of z.discriminatedUnion to support multiple types mapping to the same schema
 */
export const EnvelopeSchema = z.union([
  StandardEnvelopeSchema,
  GoalEnvelopeSchema,
  LiabilityEnvelopeSchema,
  SupplementalAccountSchema,
]);

/**
 * Type inference from schema
 */
export type Envelope = z.infer<typeof EnvelopeSchema>;
export type StandardEnvelope = z.infer<typeof StandardEnvelopeSchema>;
export type GoalEnvelope = z.infer<typeof GoalEnvelopeSchema>;
export type LiabilityEnvelope = z.infer<typeof LiabilityEnvelopeSchema>;
export type SupplementalAccount = z.infer<typeof SupplementalAccountSchema>;

/**
 * Partial envelope schema for updates (PATCH operations)
 */
export const EnvelopePartialSchema = z.union([
  StandardEnvelopeSchema.partial(),
  GoalEnvelopeSchema.partial(),
  LiabilityEnvelopeSchema.partial(),
  SupplementalAccountSchema.partial(),
]);
export type EnvelopePartial = z.infer<typeof EnvelopePartialSchema>;

/**
 * Validation helpers
 */
export const validateEnvelope = (data: unknown): Envelope => EnvelopeSchema.parse(data);
export const validateEnvelopeSafe = (data: unknown) => EnvelopeSchema.safeParse(data);

export const validateEnvelopePartial = (data: unknown): EnvelopePartial =>
  EnvelopePartialSchema.parse(data);
export const validateEnvelopePartialSafe = (data: unknown) => EnvelopePartialSchema.safeParse(data);
