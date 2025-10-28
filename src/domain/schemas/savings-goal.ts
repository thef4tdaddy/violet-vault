/**
 * Savings Goal Domain Schema
 * Runtime validation for savings goal entities
 * Part of Issue #412: Domain Types & Zod Schemas for Finance Models
 */

import { z } from "zod";

/**
 * Priority enum for savings goals
 */
export const PrioritySchema = z.enum(["low", "medium", "high"]);
export type Priority = z.infer<typeof PrioritySchema>;

/**
 * Zod schema for SavingsGoal validation
 * Represents savings targets with deadlines and contribution tracking
 */
export const SavingsGoalSchema = z.object({
  id: z.string().min(1, "Savings goal ID is required"),
  name: z.string().min(1, "Goal name is required").max(100),
  category: z.string().min(1, "Category is required"),
  priority: PrioritySchema.default("medium"),
  targetAmount: z.number().min(0, "Target amount cannot be negative"),
  currentAmount: z.number().min(0, "Current amount cannot be negative"),
  targetDate: z.union([z.date(), z.string()]).optional(),
  isPaused: z.boolean().default(false),
  isCompleted: z.boolean().default(false),
  lastModified: z.number().int().positive("Last modified must be a positive number"),
  createdAt: z.number().int().positive().optional(),
  description: z.string().max(500).optional(),
  monthlyContribution: z.number().min(0).optional(),
});

/**
 * Type inference from schema
 */
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;

/**
 * Partial savings goal schema for updates
 */
export const SavingsGoalPartialSchema = SavingsGoalSchema.partial();
export type SavingsGoalPartial = z.infer<typeof SavingsGoalPartialSchema>;

/**
 * Validation helper - throws on invalid data
 */
export const validateSavingsGoal = (data: unknown): SavingsGoal => {
  return SavingsGoalSchema.parse(data);
};

/**
 * Safe validation helper - returns result with error details
 */
export const validateSavingsGoalSafe = (data: unknown) => {
  return SavingsGoalSchema.safeParse(data);
};

/**
 * Validation helper for partial updates
 */
export const validateSavingsGoalPartial = (data: unknown): SavingsGoalPartial => {
  return SavingsGoalPartialSchema.parse(data);
};

/**
 * Zod schema for SavingsGoal form data validation
 * Validates form input before converting to entity
 */
export const SavingsGoalFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Goal name is required")
      .max(100, "Goal name cannot exceed 100 characters"),
    targetAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) : val))
      .refine((val) => !isNaN(val) && val > 0, "Valid target amount is required"),
    currentAmount: z
      .union([z.string(), z.number()])
      .transform((val) => (typeof val === "string" ? parseFloat(val) || 0 : val))
      .refine((val) => !isNaN(val) && val >= 0, "Current amount cannot be negative"),
    targetDate: z
      .string()
      .optional()
      .refine(
        (val) => {
          if (!val) return true;
          const date = new Date(val);
          if (isNaN(date.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date >= today;
        },
        { message: "Target date cannot be in the past" }
      ),
    category: z.string().min(1, "Category is required"),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .default(""),
    priority: PrioritySchema.default("medium"),
  })
  .refine((data) => data.currentAmount <= data.targetAmount, {
    message: "Current amount cannot exceed target amount",
    path: ["currentAmount"],
  });

/**
 * Type inference from form schema
 */
export type SavingsGoalFormData = z.infer<typeof SavingsGoalFormSchema>;

/**
 * Safe validation helper for form data - returns result with error details
 */
export const validateSavingsGoalFormSafe = (data: unknown) => {
  return SavingsGoalFormSchema.safeParse(data);
};
