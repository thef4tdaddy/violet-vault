/**
 * Auto-Funding Domain Schemas
 * Runtime validation for auto-funding rule and execution record entities
 */

import { z } from "zod";

/**
 * Condition schema for auto-funding rules
 */
export const ConditionSchema = z.object({
  id: z.string().optional(),
  type: z.string().min(1, "Condition type is required"),
  envelopeId: z.string().nullable().optional(),
  value: z.number(),
  operator: z.string().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
});

export type Condition = z.infer<typeof ConditionSchema>;

/**
 * Auto-funding rule configuration schema
 */
export const AutoFundingConfigSchema = z.object({
  sourceType: z.enum(["unassigned", "envelope", "income"]),
  sourceId: z.string().nullable(),
  targetType: z.enum(["envelope", "multiple"]),
  targetId: z.string().nullable(),
  targetIds: z.array(z.string()),
  amount: z.number().min(0, "Amount cannot be negative"),
  percentage: z.number().min(0).max(100, "Percentage must be between 0 and 100"),
  conditions: z.array(ConditionSchema),
  scheduleConfig: z.record(z.string(), z.unknown()),
});

export type AutoFundingConfig = z.infer<typeof AutoFundingConfigSchema>;

/**
 * Auto-funding rule schema
 */
export const AutoFundingRuleSchema = z.object({
  id: z.string().min(1, "Rule ID is required"),
  name: z
    .string()
    .min(1, "Rule name is required")
    .max(100, "Rule name must be 100 characters or less"),
  description: z.string().max(500, "Description must be 500 characters or less"),
  type: z.string().min(1, "Rule type is required"),
  trigger: z.string().min(1, "Trigger is required"),
  priority: z.number().int().min(0, "Priority must be non-negative"),
  enabled: z.boolean(),
  createdAt: z.string(),
  lastExecuted: z.string().nullable(),
  executionCount: z.number().int().min(0, "Execution count cannot be negative"),
  config: AutoFundingConfigSchema,
  lastModified: z.number().int().positive("Last modified must be a positive number"),
});

export type AutoFundingRule = z.infer<typeof AutoFundingRuleSchema>;

/**
 * Partial auto-funding rule schema for updates
 */
export const AutoFundingRulePartialSchema = AutoFundingRuleSchema.partial();
export type AutoFundingRulePartial = z.infer<typeof AutoFundingRulePartialSchema>;

/**
 * Execution record schema
 */
export const ExecutionRecordSchema = z.object({
  id: z.string().min(1, "Execution record ID is required"),
  trigger: z.string().min(1, "Trigger is required"),
  totalFunded: z.number().optional(),
  success: z.boolean().optional(),
  executedAt: z.string().optional(),
  rulesExecuted: z.number().int().min(0).optional(),
  timestamp: z.string().optional(), // Legacy/Alias support
  lastModified: z.number().int().positive("Last modified must be a positive number"),
});

export type ExecutionRecord = z.infer<typeof ExecutionRecordSchema>;

/**
 * Partial execution record schema for updates
 */
export const ExecutionRecordPartialSchema = ExecutionRecordSchema.partial();
export type ExecutionRecordPartial = z.infer<typeof ExecutionRecordPartialSchema>;

/**
 * Validation helpers
 */
export const validateAutoFundingRule = (data: unknown): AutoFundingRule =>
  AutoFundingRuleSchema.parse(data);

export const validateAutoFundingRuleSafe = (data: unknown) => AutoFundingRuleSchema.safeParse(data);

export const validateAutoFundingRulePartial = (data: unknown): AutoFundingRulePartial =>
  AutoFundingRulePartialSchema.parse(data);

export const validateAutoFundingRulePartialSafe = (data: unknown) =>
  AutoFundingRulePartialSchema.safeParse(data);

export const validateExecutionRecord = (data: unknown): ExecutionRecord =>
  ExecutionRecordSchema.parse(data);

export const validateExecutionRecordSafe = (data: unknown) => ExecutionRecordSchema.safeParse(data);

export const validateExecutionRecordPartial = (data: unknown): ExecutionRecordPartial =>
  ExecutionRecordPartialSchema.parse(data);

export const validateExecutionRecordPartialSafe = (data: unknown) =>
  ExecutionRecordPartialSchema.safeParse(data);
