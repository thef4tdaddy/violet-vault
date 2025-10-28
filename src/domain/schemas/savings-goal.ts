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
