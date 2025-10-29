/**
 * Bill Domain Schema
 * Runtime validation for bill entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Bill frequency enum
 */
export const BillFrequencySchema = z.enum(["monthly", "quarterly", "annually"]).optional();
export type BillFrequency = z.infer<typeof BillFrequencySchema>;

/**
 * Zod schema for Bill validation
 * Represents recurring and one-time bills
 */
export const BillSchema = z.object({
  id: z.string().min(1, "Bill ID is required"),
  name: z.string().min(1, "Bill name is required").max(100),
  dueDate: z.union([z.date(), z.string()], { message: "Due date must be a valid date" }),
  amount: z.number().min(0, "Amount cannot be negative"),
  category: z.string().min(1, "Category is required"),
  isPaid: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  frequency: BillFrequencySchema,
  envelopeId: z.string().optional(),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  paymentMethod: z.string().max(100).optional(),
});

/**
 * Type inference from schema
 */
export type Bill = z.infer<typeof BillSchema>;

/**
 * Partial bill schema for updates
 */
export const BillPartialSchema = BillSchema.partial();
export type BillPartial = z.infer<typeof BillPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateBill = (data: unknown): Bill => {
  return BillSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateBillSafe = (data: unknown) => {
  return BillSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateBillPartial = (data: unknown): BillPartial => {
  return BillPartialSchema.parse(data);
};
