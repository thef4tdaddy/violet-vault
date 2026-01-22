import { z } from "zod";

// ============================================================================
// Analytics Schemas - Mirrors api/models.py
// ============================================================================

export const spendingStatsSchema = z.object({
  totalSpent: z.number(),
  budgetAllocated: z.number(),
  daysElapsed: z.number().int().positive(),
  daysRemaining: z.number().int().nonnegative(),
});

export const historicalBillSchema = z.object({
  amount: z.number().positive(),
  dueDate: z.string(), // ISO date string
  category: z.string().min(1),
});

export const healthMetricsSchema = z.object({
  spendingVelocityScore: z.number().int().min(0).max(100),
  billCoverageRatio: z.number().nonnegative(),
  savingsRate: z.number(),
  envelopeUtilization: z.number().nonnegative(),
});

export const analyticsRequestSchema = z.object({
  spendingStats: spendingStatsSchema.optional(),
  historicalBills: z.array(historicalBillSchema).optional(),
  healthMetrics: healthMetricsSchema.optional(),
});

export const spendingVelocityResultSchema = z.object({
  velocityScore: z.number().int().min(0).max(100),
  dailyRate: z.number(),
  projectedTotal: z.number(),
  budgetAllocated: z.number(),
  willExceedBudget: z.boolean(),
  daysUntilExceeded: z.number().int().nullable(),
  recommendation: z.string(),
  severity: z.string(), // "success" | "warning" | "error"
});

export const billFrequencySchema = z.object({
  intervalDays: z.number(),
  confidence: z.number().int().min(0).max(100),
  pattern: z.string(),
});

export const predictedBillSchema = z.object({
  category: z.string(),
  predictedAmount: z.number(),
  predictedDate: z.string(),
  confidence: z.number().int().min(0).max(100),
  frequency: billFrequencySchema.nullable(),
});

export const billPredictionResultSchema = z.object({
  predictedBills: z.array(predictedBillSchema),
  totalPredictedAmount: z.number(),
  nextBillDate: z.string().nullable(),
  message: z.string(),
});

export const healthScoreBreakdownSchema = z.object({
  spendingPace: z.number().int().min(0).max(100),
  billPreparedness: z.number().int().min(0).max(100),
  savingsHealth: z.number().int().min(0).max(100),
  budgetUtilization: z.number().int().min(0).max(100),
});

export const budgetHealthResultSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  breakdown: healthScoreBreakdownSchema,
  grade: z.string(), // A-F
  summary: z.string(),
  recommendations: z.array(z.string()),
  strengths: z.array(z.string()),
  concerns: z.array(z.string()),
});

export const analyticsResponseSchema = z.object({
  success: z.boolean(),
  spendingVelocity: spendingVelocityResultSchema.nullable(),
  billPredictions: billPredictionResultSchema.nullable(),
  budgetHealth: budgetHealthResultSchema.nullable(),
  error: z.string().nullable(),
});

export type SpendingStats = z.infer<typeof spendingStatsSchema>;
export type HistoricalBill = z.infer<typeof historicalBillSchema>;
export type HealthMetrics = z.infer<typeof healthMetricsSchema>;
export type AnalyticsRequest = z.infer<typeof analyticsRequestSchema>;
export type SpendingVelocityResult = z.infer<typeof spendingVelocityResultSchema>;
export type BillPredictionResult = z.infer<typeof billPredictionResultSchema>;
export type BudgetHealthResult = z.infer<typeof budgetHealthResultSchema>;
export type AnalyticsResponse = z.infer<typeof analyticsResponseSchema>;
