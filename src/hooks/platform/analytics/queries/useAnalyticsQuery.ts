/**
 * TanStack Query hook for Analytics API v2.0
 * Provides spending velocity, bill predictions, and budget health scores
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/utils/core/common/queryClient";
import logger from "@/utils/core/common/logger";

// ============================================================================
// Types - Mirror Python Pydantic models
// ============================================================================

export interface SpendingStats {
  totalSpent: number;
  budgetAllocated: number;
  daysElapsed: number;
  daysRemaining: number;
}

export interface HistoricalBill {
  amount: number;
  dueDate: string; // ISO date string
  category: string;
}

export interface HealthMetrics {
  spendingVelocityScore: number; // 0-100
  billCoverageRatio: number;
  savingsRate: number;
  envelopeUtilization: number;
}

export interface AnalyticsRequest {
  spendingStats?: SpendingStats;
  historicalBills?: HistoricalBill[];
  healthMetrics?: HealthMetrics;
}

export interface SpendingVelocityResult {
  velocityScore: number;
  dailyRate: number;
  projectedTotal: number;
  budgetAllocated: number;
  willExceedBudget: boolean;
  daysUntilExceeded: number | null;
  recommendation: string;
  severity: string; // "success" | "warning" | "error"
}

export interface BillFrequency {
  intervalDays: number;
  confidence: number;
  pattern: string;
}

export interface PredictedBill {
  category: string;
  predictedAmount: number;
  predictedDate: string;
  confidence: number;
  frequency: BillFrequency | null;
}

export interface BillPredictionResult {
  predictedBills: PredictedBill[];
  totalPredictedAmount: number;
  nextBillDate: string | null;
  message: string;
}

export interface HealthScoreBreakdown {
  spendingPace: number;
  billPreparedness: number;
  savingsHealth: number;
  budgetUtilization: number;
}

export interface BudgetHealthResult {
  overallScore: number;
  breakdown: HealthScoreBreakdown;
  grade: string; // "A" | "B" | "C" | "D" | "F"
  summary: string;
  recommendations: string[];
  strengths: string[];
  concerns: string[];
}

export interface AnalyticsResponse {
  success: boolean;
  spendingVelocity: SpendingVelocityResult | null;
  billPredictions: BillPredictionResult | null;
  budgetHealth: BudgetHealthResult | null;
  error: string | null;
}

// ============================================================================
// API Service
// ============================================================================

const ANALYTICS_API_URL = import.meta.env.VITE_ANALYTICS_API_URL || "/api/analytics";

/**
 * Fetch analytics predictions from Python backend
 */
async function fetchAnalytics(request: AnalyticsRequest): Promise<AnalyticsResponse> {
  try {
    const response = await fetch(ANALYTICS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data as AnalyticsResponse;
  } catch (error) {
    logger.error("Failed to fetch analytics", error);
    throw error;
  }
}

// ============================================================================
// TanStack Query Hooks
// ============================================================================

/**
 * Query hook for fetching analytics predictions
 * Use this for pre-fetching or caching analytics results
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAnalyticsQuery({
 *   spendingStats: { totalSpent: 500, budgetAllocated: 1000, ... },
 *   healthMetrics: { spendingVelocityScore: 85, ... }
 * });
 * ```
 */
export function useAnalyticsQuery(request: AnalyticsRequest) {
  return useQuery({
    queryKey: queryKeys.analyticsPredictions(request as unknown as Record<string, unknown>),
    queryFn: () => fetchAnalytics(request),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!(request.spendingStats || request.historicalBills || request.healthMetrics),
  });
}

/**
 * Mutation hook for on-demand analytics calculations
 * Use this when you want to trigger analytics manually
 *
 * @example
 * ```tsx
 * const { mutate, data, isPending } = useAnalyticsMutation();
 *
 * const handleCalculate = () => {
 *   mutate({
 *     spendingStats: { ... },
 *     billPredictions: [ ... ]
 *   });
 * };
 * ```
 */
export function useAnalyticsMutation() {
  return useMutation({
    mutationFn: fetchAnalytics,
    onSuccess: (data) => {
      logger.info("Analytics calculated successfully", {
        hasVelocity: !!data.spendingVelocity,
        hasBills: !!data.billPredictions,
        hasHealth: !!data.budgetHealth,
      });
    },
    onError: (error) => {
      logger.error("Analytics calculation failed", error);
    },
  });
}

/**
 * Convenience hook for spending velocity only
 */
export function useSpendingVelocity(stats: SpendingStats | undefined) {
  return useAnalyticsQuery({
    spendingStats: stats,
  });
}

/**
 * Convenience hook for bill predictions only
 */
export function useBillPredictions(bills: HistoricalBill[] | undefined) {
  return useAnalyticsQuery({
    historicalBills: bills,
  });
}

/**
 * Convenience hook for budget health only
 */
export function useBudgetHealth(metrics: HealthMetrics | undefined) {
  return useAnalyticsQuery({
    healthMetrics: metrics,
  });
}
