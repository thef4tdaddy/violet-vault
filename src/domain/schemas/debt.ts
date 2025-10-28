/**
 * Debt Domain Schema
 * Runtime validation for debt tracking entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Debt type enum - expanded to match DEBT_TYPES constants
 */
export const DebtTypeSchema = z.enum([
  "mortgage",
  "auto",
  "credit_card",
  "chapter13",
  "student",
  "personal",
  "business",
  "other",
]);
export type DebtType = z.infer<typeof DebtTypeSchema>;

/**
 * Debt status enum - expanded to match DEBT_STATUS constants
 */
export const DebtStatusSchema = z.enum(["active", "paid_off", "deferred", "default"]);
export type DebtStatus = z.infer<typeof DebtStatusSchema>;

/**
 * Payment frequency enum
 */
export const PaymentFrequencySchema = z.enum([
  "weekly",
  "biweekly",
  "monthly",
  "quarterly",
  "annually",
]);
export type PaymentFrequency = z.infer<typeof PaymentFrequencySchema>;

/**
 * Compound frequency enum
 */
export const CompoundFrequencySchema = z.enum(["daily", "monthly", "annually"]);
export type CompoundFrequency = z.infer<typeof CompoundFrequencySchema>;

/**
 * Zod schema for Debt validation
 * Represents tracked debts (credit cards, loans, mortgages)
 */
export const DebtSchema = z.object({
  id: z.string().min(1, "Debt ID is required"),
  name: z.string().min(1, "Debt name is required").max(100),
  creditor: z.string().min(1, "Creditor name is required").max(100),
  type: DebtTypeSchema.default("other"),
  status: DebtStatusSchema.default("active"),
  currentBalance: z.number().min(0, "Current balance cannot be negative"),
  minimumPayment: z.number().min(0, "Minimum payment cannot be negative"),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  interestRate: z.number().min(0).max(100, "Interest rate must be between 0-100%").optional(),
  dueDate: z.union([z.date(), z.string()]).optional(),
  originalBalance: z.number().min(0).optional(),
});

/**
 * Type inference from schema
 */
export type Debt = z.infer<typeof DebtSchema>;

/**
 * Partial debt schema for updates
 */
export const DebtPartialSchema = DebtSchema.partial();
export type DebtPartial = z.infer<typeof DebtPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateDebt = (data: unknown): Debt => {
  return DebtSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateDebtSafe = (data: unknown) => {
  return DebtSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateDebtPartial = (data: unknown): DebtPartial => {
  return DebtPartialSchema.parse(data);
};
