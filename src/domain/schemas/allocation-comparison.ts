/**
 * Allocation Comparison Schemas
 * Zod validation schemas for Historical Comparison View
 * Part of Issue #[NUMBER]: Historical Comparison View
 */

import { z } from "zod";

/**
 * Allocation Snapshot Schema
 */
export const AllocationSnapshotSchema = z.object({
  date: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  envelopeAllocations: z.map(z.string(), z.number().int().nonnegative()),
  frequency: z.enum(["weekly", "biweekly", "semi-monthly", "monthly"]).optional(),
  payerName: z.string().optional(),
});

export type AllocationSnapshotSchemaType = z.infer<typeof AllocationSnapshotSchema>;

/**
 * Envelope Change Schema
 */
export const EnvelopeChangeSchema = z.object({
  envelopeId: z.string().min(1),
  envelopeName: z.string().min(1),
  currentAmount: z.number().int().nonnegative(),
  previousAmount: z.number().int().nonnegative(),
  changeCents: z.number().int(),
  changePercent: z.number(),
  trend: z.enum(["increase", "decrease", "stable"]),
  sentiment: z.enum(["positive", "negative", "neutral", "warning"]),
});

export type EnvelopeChangeSchemaType = z.infer<typeof EnvelopeChangeSchema>;

/**
 * Insight Schema
 */
export const InsightSchema = z.object({
  type: z.enum(["trend", "goal_progress", "anomaly", "suggestion"]),
  severity: z.enum(["info", "warning", "success"]),
  message: z.string().min(1),
  envelopeIds: z.array(z.string()).optional(),
});

export type InsightSchemaType = z.infer<typeof InsightSchema>;

/**
 * Allocation Comparison Schema
 */
export const AllocationComparisonSchema = z.object({
  current: AllocationSnapshotSchema,
  previous: AllocationSnapshotSchema,
  changes: z.array(EnvelopeChangeSchema),
  insights: z.array(InsightSchema),
});

export type AllocationComparisonSchemaType = z.infer<typeof AllocationComparisonSchema>;

/**
 * Trend Analysis Schema
 */
export const TrendAnalysisSchema = z.object({
  average: z.number().nonnegative(),
  direction: z.enum(["increasing", "decreasing", "stable"]),
  volatility: z.number().nonnegative(),
  isStable: z.boolean(),
});

export type TrendAnalysisSchemaType = z.infer<typeof TrendAnalysisSchema>;

/**
 * Allocation History Entry Schema
 */
export const AllocationHistoryEntrySchema = z.object({
  id: z.string().min(1),
  date: z.string().datetime(),
  paycheckAmountCents: z.number().int().positive(),
  payerName: z.string().optional(),
  allocations: z.array(
    z.object({
      envelopeId: z.string().min(1),
      amountCents: z.number().int().nonnegative(),
    })
  ),
  strategy: z.enum(["even_split", "last_split", "target_first", "manual"]).optional(),
});

export type AllocationHistoryEntrySchemaType = z.infer<typeof AllocationHistoryEntrySchema>;
