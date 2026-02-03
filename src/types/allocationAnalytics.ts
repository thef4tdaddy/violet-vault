/**
 * Allocation Analytics Dashboard Types
 * Created for Issue: Allocation Analytics Dashboard - Visual Trends & Heatmaps
 *
 * Provides comprehensive types for analyzing paycheck allocation patterns,
 * trends, and financial health metrics over time.
 */

/**
 * Allocation strategy types used during paycheck processing
 */
export type AllocationStrategy = "even_split" | "last_split" | "target_first";

/**
 * Single allocation to an envelope from a paycheck
 */
export interface AllocationItem {
  envelopeId: string;
  envelopeName: string;
  amountCents: number;
  strategy: AllocationStrategy;
  timestamp: string; // ISO datetime
}

/**
 * Complete paycheck allocation record
 */
export interface PaycheckAllocationRecord {
  id: string;
  date: string; // ISO date (YYYY-MM-DD)
  paycheckAmountCents: number;
  payerName: string;
  strategy: AllocationStrategy;
  allocations: AllocationItem[];
  processedAt: string; // ISO datetime
  totalAllocatedCents: number;
  remainingCents: number;
  completionTimeMs?: number; // Time taken to complete allocation
}

/**
 * Heatmap data point for calendar visualization
 */
export interface HeatmapDataPoint {
  date: string; // ISO date (YYYY-MM-DD)
  amountCents: number;
  strategy: AllocationStrategy;
  payerName: string;
  allocationCount: number;
  intensity: number; // 0-100 for color intensity
}

/**
 * Aggregated heatmap data by week/month
 */
export interface HeatmapData {
  dataPoints: HeatmapDataPoint[];
  minAmount: number;
  maxAmount: number;
  totalAllocations: number;
  missedPaychecks: string[]; // Dates of expected but missing paychecks
  frequency: "weekly" | "biweekly" | "semi-monthly" | "monthly" | "irregular";
}

/**
 * Envelope allocation trend over time
 */
export interface EnvelopeTrendPoint {
  date: string; // ISO date (YYYY-MM-DD)
  amountCents: number;
  envelopeId: string;
  envelopeName: string;
}

/**
 * Multi-series trend data for envelopes
 */
export interface TrendData {
  envelopes: {
    id: string;
    name: string;
    color?: string;
    dataPoints: Array<{
      date: string;
      amountCents: number;
    }>;
    averageCents: number;
    minCents: number;
    maxCents: number;
    trend: "increasing" | "decreasing" | "stable";
  }[];
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Allocation distribution by category
 */
export interface DistributionCategory {
  name: string;
  totalCents: number;
  percentage: number;
  envelopeIds: string[];
  color?: string;
}

/**
 * Allocation distribution data
 */
export interface DistributionData {
  categories: DistributionCategory[];
  totalCents: number;
  averagePerPaycheckCents: number;
  budgetingRuleComparison?: {
    rule: "50/30/20" | "60/20/20" | "70/20/10";
    userActual: {
      essentials: number;
      discretionary: number;
      savings: number;
    };
    recommended: {
      essentials: number;
      discretionary: number;
      savings: number;
    };
    deviationScore: number; // 0-100, higher is closer to rule
  };
}

/**
 * Strategy usage statistics
 */
export interface StrategyUsage {
  strategy: AllocationStrategy;
  count: number;
  percentage: number;
  averageCompletionTimeMs: number;
  totalAmountCents: number;
}

/**
 * Strategy performance metrics
 */
export interface StrategyPerformanceMetrics {
  strategy: AllocationStrategy;
  usageCount: number;
  usagePercentage: number;
  averageCompletionTimeMs: number;
  billCoverageRate: number; // 0-100
  savingsRate: number; // 0-100
  userAdjustmentsCount: number; // How many manual adjustments were made
  successRate: number; // 0-100 based on completion without errors
}

/**
 * Strategy performance comparison
 */
export interface StrategyAnalysis {
  strategies: StrategyPerformanceMetrics[];
  mostUsed: AllocationStrategy;
  mostEffective: AllocationStrategy;
  insights: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

/**
 * Financial health score component
 */
export interface HealthScoreComponent {
  name: "consistency" | "billCoverage" | "savingsRate" | "emergencyFund" | "discretionary";
  score: number; // 0-100
  weight: number; // 0-1
  status: "excellent" | "good" | "fair" | "poor";
  description: string;
}

/**
 * Financial health recommendation
 */
export interface HealthRecommendation {
  id: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionable: string;
  impactScore: number; // Expected improvement to health score
}

/**
 * Complete financial health score
 */
export interface FinancialHealthScore {
  totalScore: number; // 0-100
  components: HealthScoreComponent[];
  recommendations: HealthRecommendation[];
  status: "excellent" | "good" | "fair" | "poor";
  trend: "improving" | "declining" | "stable";
  lastUpdated: string; // ISO datetime
}

/**
 * Filter options for analytics dashboard
 */
export interface AllocationAnalyticsFilters {
  dateRange: {
    start: string; // ISO date
    end: string; // ISO date
    preset?: "last30days" | "last3months" | "last6months" | "lastYear" | "custom";
  };
  frequencies?: Array<"weekly" | "biweekly" | "semi-monthly" | "monthly">;
  payers?: string[];
  strategies?: AllocationStrategy[];
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Complete allocation analytics data
 */
export interface AllocationAnalytics {
  heatmap: HeatmapData;
  trends: TrendData;
  distribution: DistributionData;
  strategyAnalysis: StrategyAnalysis;
  healthScore: FinancialHealthScore;
  filters: AllocationAnalyticsFilters;
  lastCalculated: string; // ISO datetime
  cacheKey: string;
}

/**
 * Analytics calculation params
 */
export interface AllocationAnalyticsParams {
  userId: string;
  startDate: string; // ISO date
  endDate: string; // ISO date
  includeHeatmap?: boolean;
  includeTrends?: boolean;
  includeDistribution?: boolean;
  includeStrategyAnalysis?: boolean;
  includeHealthScore?: boolean;
}

/**
 * Chart data point for Recharts compatibility
 */
export interface ChartDataPoint {
  date: string;
  [key: string]: string | number; // Dynamic keys for multiple series
}

/**
 * Export format options
 */
export type ExportFormat = "csv" | "pdf" | "png" | "json";

/**
 * Export request parameters
 */
export interface ExportRequest {
  format: ExportFormat;
  sections: Array<"heatmap" | "trends" | "distribution" | "strategy" | "health">;
  dateRange: {
    start: string;
    end: string;
  };
  filename?: string;
}
