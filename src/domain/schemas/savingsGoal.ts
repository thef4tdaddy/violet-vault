import { z } from "zod";
import { GoalEnvelopeSchema, type GoalEnvelope, type EnvelopePartial } from "./envelope";

export const SavingsGoalSchema = GoalEnvelopeSchema;

export type SavingsGoal = GoalEnvelope;
export type SavingsGoalPartial = EnvelopePartial;

// Form and validation types
export const SavingsGoalFormSchema = GoalEnvelopeSchema.omit({
  id: true,
  lastModified: true,
  createdAt: true,
})
  .extend({
    type: z.literal("goal").default("goal"),
    name: z
      .string()
      .min(1, "Goal name is required")
      .max(100, "Goal name cannot exceed 100 characters"),
    targetAmount: z
      .string()
      .min(1, "Target amount is required")
      .refine((val) => {
        const n = parseFloat(val);
        return !isNaN(n) && n > 0;
      }, "Target amount must be a valid positive number"),
    currentAmount: z
      .string()
      .refine((val) => {
        const n = parseFloat(val);
        return !isNaN(n) && n >= 0;
      }, "Current amount cannot be negative")
      .default("0"),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format")
      .default("#3B82F6"),
    targetDate: z
      .string()
      .optional()
      .refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, "Target date cannot be in the past"),
    priority: z.enum(["low", "medium", "high"]).default("medium"),
    category: z.string().min(1, "Category is required"),
    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      const target = parseFloat(data.targetAmount);
      const current = parseFloat(data.currentAmount);
      if (isNaN(target) || isNaN(current)) return true;
      return current <= target;
    },
    {
      message: "Current amount cannot exceed target amount",
      path: ["currentAmount"],
    }
  );

export type SavingsGoalFormData = z.infer<typeof SavingsGoalFormSchema>;

export const validateSavingsGoal = (data: unknown) => GoalEnvelopeSchema.parse(data);
export const validateSavingsGoalSafe = (data: unknown) => GoalEnvelopeSchema.safeParse(data);
export const validateSavingsGoalPartial = (data: unknown) =>
  GoalEnvelopeSchema.partial().parse(data);
export const validateSavingsGoalPartialSafe = (data: unknown) =>
  GoalEnvelopeSchema.partial().safeParse(data);

export const validateSavingsGoalFormSafe = (data: unknown) => SavingsGoalFormSchema.safeParse(data);
