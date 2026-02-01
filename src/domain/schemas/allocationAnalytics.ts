/**
 * Allocation Analytics Zod Schemas
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 * 
 * Runtime validation schemas for allocation analytics data structures.
 * Provides type safety for API responses, cache data, and user inputs.
 */

import { z } from 'zod';

/**
 * Allocation strategy schema
 */
export const AllocationStrategySchema = z.enum(['even_split', 'last_split', 'target_first']);

/**
 * Single allocation item schema
 */
export const AllocationItemSchema = z.object({
  envelopeId: z.string().min(1),
  envelopeName: z.string(),
  amountCents: z.number().int().nonnegative(),
  strategy: AllocationStrategySchema,
  timestamp: z.string().datetime(),
});

/**
 * Paycheck allocation record schema
 */
export const PaycheckAllocationRecordSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  paycheckAmountCents: z.number().int().positive(),
  payerName: z.string(),
  strategy: AllocationStrategySchema,
  allocations: z.array(AllocationItemSchema),
  processedAt: z.string().datetime(),
  totalAllocatedCents: z.number().int().nonnegative(),
  remainingCents: z.number().int(),
  completionTimeMs: z.number().optional(),
});

/**
 * Heatmap data point schema
 */
export const HeatmapDataPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amountCents: z.number().int().nonnegative(),
  strategy: AllocationStrategySchema,
  payerName: z.string(),
  allocationCount: z.number().int().nonnegative(),
  intensity: z.number().min(0).max(100),
});

/**
 * Heatmap data schema
 */
export const HeatmapDataSchema = z.object({
  dataPoints: z.array(HeatmapDataPointSchema),
  minAmount: z.number(),
  maxAmount: z.number(),
  totalAllocations: z.number().int().nonnegative(),
  missedPaychecks: z.array(z.string()),
  frequency: z.enum(['weekly', 'biweekly', 'semi-monthly', 'monthly', 'irregular']),
});

/**
 * Envelope trend point schema
 */
export const EnvelopeTrendPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amountCents: z.number().int().nonnegative(),
  envelopeId: z.string(),
  envelopeName: z.string(),
});

/**
 * Trend data schema
 */
export const TrendDataSchema = z.object({
  envelopes: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      color: z.string().optional(),
      dataPoints: z.array(
        z.object({
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          amountCents: z.number().int().nonnegative(),
        })
      ),
      averageCents: z.number(),
      minCents: z.number(),
      maxCents: z.number(),
      trend: z.enum(['increasing', 'decreasing', 'stable']),
    })
  ),
  dateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

/**
 * Distribution category schema
 */
export const DistributionCategorySchema = z.object({
  name: z.string(),
  totalCents: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
  envelopeIds: z.array(z.string()),
  color: z.string().optional(),
});

/**
 * Distribution data schema
 */
export const DistributionDataSchema = z.object({
  categories: z.array(DistributionCategorySchema),
  totalCents: z.number().int().nonnegative(),
  averagePerPaycheckCents: z.number(),
  budgetingRuleComparison: z
    .object({
      rule: z.enum(['50/30/20', '60/20/20', '70/20/10']),
      userActual: z.object({
        essentials: z.number().min(0).max(100),
        discretionary: z.number().min(0).max(100),
        savings: z.number().min(0).max(100),
      }),
      recommended: z.object({
        essentials: z.number().min(0).max(100),
        discretionary: z.number().min(0).max(100),
        savings: z.number().min(0).max(100),
      }),
      deviationScore: z.number().min(0).max(100),
    })
    .optional(),
});

/**
 * Strategy performance metrics schema
 */
export const StrategyPerformanceMetricsSchema = z.object({
  strategy: AllocationStrategySchema,
  usageCount: z.number().int().nonnegative(),
  usagePercentage: z.number().min(0).max(100),
  averageCompletionTimeMs: z.number().nonnegative(),
  billCoverageRate: z.number().min(0).max(100),
  savingsRate: z.number().min(0).max(100),
  userAdjustmentsCount: z.number().int().nonnegative(),
  successRate: z.number().min(0).max(100),
});

/**
 * Strategy analysis schema
 */
export const StrategyAnalysisSchema = z.object({
  strategies: z.array(StrategyPerformanceMetricsSchema),
  mostUsed: AllocationStrategySchema,
  mostEffective: AllocationStrategySchema,
  insights: z.array(z.string()),
  dateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

/**
 * Health score component schema
 */
export const HealthScoreComponentSchema = z.object({
  name: z.enum(['consistency', 'billCoverage', 'savingsRate', 'emergencyFund', 'discretionary']),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(1),
  status: z.enum(['excellent', 'good', 'fair', 'poor']),
  description: z.string(),
});

/**
 * Health recommendation schema
 */
export const HealthRecommendationSchema = z.object({
  id: z.string(),
  priority: z.enum(['high', 'medium', 'low']),
  title: z.string(),
  description: z.string(),
  actionable: z.string(),
  impactScore: z.number().min(0).max(100),
});

/**
 * Financial health score schema
 */
export const FinancialHealthScoreSchema = z.object({
  totalScore: z.number().min(0).max(100),
  components: z.array(HealthScoreComponentSchema),
  recommendations: z.array(HealthRecommendationSchema),
  status: z.enum(['excellent', 'good', 'fair', 'poor']),
  trend: z.enum(['improving', 'declining', 'stable']),
  lastUpdated: z.string().datetime(),
});

/**
 * Analytics filters schema
 */
export const AllocationAnalyticsFiltersSchema = z.object({
  dateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    preset: z.enum(['last30days', 'last3months', 'last6months', 'lastYear', 'custom']).optional(),
  }),
  frequencies: z
    .array(z.enum(['weekly', 'biweekly', 'semi-monthly', 'monthly']))
    .optional(),
  payers: z.array(z.string()).optional(),
  strategies: z.array(AllocationStrategySchema).optional(),
  minAmount: z.number().optional(),
  maxAmount: z.number().optional(),
});

/**
 * Complete allocation analytics schema
 */
export const AllocationAnalyticsSchema = z.object({
  heatmap: HeatmapDataSchema,
  trends: TrendDataSchema,
  distribution: DistributionDataSchema,
  strategyAnalysis: StrategyAnalysisSchema,
  healthScore: FinancialHealthScoreSchema,
  filters: AllocationAnalyticsFiltersSchema,
  lastCalculated: z.string().datetime(),
  cacheKey: z.string(),
});

/**
 * Analytics calculation params schema
 */
export const AllocationAnalyticsParamsSchema = z.object({
  userId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  includeHeatmap: z.boolean().optional(),
  includeTrends: z.boolean().optional(),
  includeDistribution: z.boolean().optional(),
  includeStrategyAnalysis: z.boolean().optional(),
  includeHealthScore: z.boolean().optional(),
});

/**
 * Export request schema
 */
export const ExportRequestSchema = z.object({
  format: z.enum(['csv', 'pdf', 'png', 'json']),
  sections: z.array(z.enum(['heatmap', 'trends', 'distribution', 'strategy', 'health'])),
  dateRange: z.object({
    start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
  filename: z.string().optional(),
});

/**
 * Type inference helpers
 */
export type AllocationStrategyType = z.infer<typeof AllocationStrategySchema>;
export type AllocationItemType = z.infer<typeof AllocationItemSchema>;
export type PaycheckAllocationRecordType = z.infer<typeof PaycheckAllocationRecordSchema>;
export type HeatmapDataType = z.infer<typeof HeatmapDataSchema>;
export type TrendDataType = z.infer<typeof TrendDataSchema>;
export type DistributionDataType = z.infer<typeof DistributionDataSchema>;
export type StrategyAnalysisType = z.infer<typeof StrategyAnalysisSchema>;
export type FinancialHealthScoreType = z.infer<typeof FinancialHealthScoreSchema>;
export type AllocationAnalyticsType = z.infer<typeof AllocationAnalyticsSchema>;
export type AllocationAnalyticsParamsType = z.infer<typeof AllocationAnalyticsParamsSchema>;
export type ExportRequestType = z.infer<typeof ExportRequestSchema>;

/**
 * Validation helper functions
 */

export function validateAllocationAnalytics(data: unknown): AllocationAnalyticsType {
  return AllocationAnalyticsSchema.parse(data);
}

export function validateAllocationAnalyticsSafe(data: unknown) {
  return AllocationAnalyticsSchema.safeParse(data);
}

export function validateAllocationAnalyticsParams(data: unknown): AllocationAnalyticsParamsType {
  return AllocationAnalyticsParamsSchema.parse(data);
}

export function validateExportRequest(data: unknown): ExportRequestType {
  return ExportRequestSchema.parse(data);
}
