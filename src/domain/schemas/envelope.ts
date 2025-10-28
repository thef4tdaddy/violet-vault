/**
 * Envelope Domain Schema
 * Runtime validation for budget envelope entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Zod schema for Envelope validation
 * Represents budget allocation containers (e.g., "Groceries", "Gas")
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
