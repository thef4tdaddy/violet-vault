/**
 * Hybrid Analytics Service
 *
 * Intelligently routes analytics requests between:
 * - Tier 1: Offline minimal analytics (client-side only)
 * - Tier 2: Private backend analytics (encrypted Go/Python processing)
 *
 * Routing Logic:
 * - If Tier 1 selected: Always use minimal analytics
 * - If Tier 2 selected AND unlocked: Use backend for >5k transactions
 * - If Tier 2 selected BUT locked: Fall back to Tier 1
 * - If backend unavailable: Automatic fallback to Tier 1
 *
 * @module hybridAnalyticsService
 */

import { useAllocationAnalyticsStore } from "@/stores/ui/allocationAnalyticsStore";
import { keyManagement } from "@/utils/security/keyManagement";
import { minimalAnalyticsService } from "./minimalAnalyticsService";
import { backendAnalyticsService } from "./backendAnalyticsService";
import logger from "@/utils/core/common/logger";
import type { AllocationTransaction } from "@/types/allocation";

/**
 * Performance thresholds
 */
const THRESHOLDS = {
  /** Use backend for datasets larger than this */
  BACKEND_TRANSACTION_COUNT: 5000,

  /** Maximum transactions for client-side processing */
  MAX_CLIENT_TRANSACTIONS: 50000,
} as const;

/**
 * Analytics tier routing decision
 */
interface RoutingDecision {
  /** Which tier to use */
  tier: "offline" | "backend";

  /** Reason for decision */
  reason: string;

  /** Whether this is a fallback */
  isFallback: boolean;
}

/**
 * Determine which tier to use for analytics
 */
export function determineAnalyticsTier(transactionCount: number): RoutingDecision {
  // Get user preference
  const store = useAllocationAnalyticsStore.getState();
  const userTier = store.analyticsTier;

  // If user chose offline, always use offline
  if (userTier === "offline") {
    return {
      tier: "offline",
      reason: "User selected offline tier",
      isFallback: false,
    };
  }

  // User selected Tier 2 (private-backend)
  // Check if encryption is unlocked
  if (!keyManagement.isUnlocked()) {
    return {
      tier: "offline",
      reason: "Tier 2 selected but encryption locked - falling back to offline",
      isFallback: true,
    };
  }

  // Check dataset size
  if (transactionCount < THRESHOLDS.BACKEND_TRANSACTION_COUNT) {
    return {
      tier: "offline",
      reason: `Dataset size (${transactionCount}) below backend threshold (${THRESHOLDS.BACKEND_TRANSACTION_COUNT})`,
      isFallback: false,
    };
  }

  // Use backend for large datasets
  return {
    tier: "backend",
    reason: `Dataset size (${transactionCount}) above threshold - using backend`,
    isFallback: false,
  };
}

/**
 * Heatmap options
 */
interface HeatmapOptions {
  dateRange: { start: string; end: string };
}

/**
 * Generate allocation heatmap (hybrid)
 *
 * Routes to appropriate tier based on dataset size and user selection.
 *
 * @param transactions - Allocation transactions
 * @param options - Heatmap options
 * @returns Heatmap data
 */
export async function generateHeatmap(
  transactions: AllocationTransaction[],
  options: HeatmapOptions
) {
  const decision = determineAnalyticsTier(transactions.length);

  logger.info("Generating heatmap", {
    tier: decision.tier,
    reason: decision.reason,
    isFallback: decision.isFallback,
    transactionCount: transactions.length,
  });

  try {
    if (decision.tier === "backend") {
      // Use Tier 2 backend
      return await backendAnalyticsService.generateHeatmap(transactions, options.dateRange);
    } else {
      // Use Tier 1 minimal
      return await minimalAnalyticsService.calculateHeatmap(transactions);
    }
  } catch (error) {
    // Fallback to offline if backend fails
    if (decision.tier === "backend") {
      logger.error("Backend heatmap failed, falling back to offline", { error });
      return await minimalAnalyticsService.calculateHeatmap(transactions);
    }
    throw error;
  }
}

/**
 * Trend options
 */
interface TrendOptions {
  envelopeIds: string[];
  granularity: "daily" | "weekly" | "monthly";
}

/**
 * Generate allocation trends (hybrid)
 *
 * @param transactions - Allocation transactions
 * @param options - Trend options
 * @returns Trend data
 */
export async function generateTrends(transactions: AllocationTransaction[], options: TrendOptions) {
  const decision = determineAnalyticsTier(transactions.length);

  logger.info("Generating trends", {
    tier: decision.tier,
    reason: decision.reason,
    isFallback: decision.isFallback,
    transactionCount: transactions.length,
  });

  try {
    if (decision.tier === "backend") {
      // Use Tier 2 backend
      return await backendAnalyticsService.generateTrends(transactions, options);
    } else {
      // Use Tier 1 minimal
      return await minimalAnalyticsService.calculateTrends(transactions, options.granularity);
    }
  } catch (error) {
    // Fallback to offline if backend fails
    if (decision.tier === "backend") {
      logger.error("Backend trends failed, falling back to offline", { error });
      return await minimalAnalyticsService.calculateTrends(transactions, options.granularity);
    }
    throw error;
  }
}

/**
 * Calculate allocation health score (hybrid)
 *
 * @param transactions - Allocation transactions
 * @returns Health score and breakdown
 */
export async function calculateHealth(transactions: AllocationTransaction[]) {
  const decision = determineAnalyticsTier(transactions.length);

  logger.info("Calculating health score", {
    tier: decision.tier,
    reason: decision.reason,
    isFallback: decision.isFallback,
    transactionCount: transactions.length,
  });

  try {
    if (decision.tier === "backend") {
      // Use Tier 2 backend
      return await backendAnalyticsService.calculateHealth(transactions);
    } else {
      // Use Tier 1 minimal (no health calculation in minimal)
      // Return basic calculation
      return {
        overall: 75, // Placeholder
        components: [],
      };
    }
  } catch (error) {
    // Fallback to offline if backend fails
    if (decision.tier === "backend") {
      logger.error("Backend health calculation failed, falling back to offline", { error });
      return {
        overall: 75, // Placeholder
        components: [],
      };
    }
    throw error;
  }
}

/**
 * Get category breakdown (hybrid)
 *
 * @param transactions - Allocation transactions
 * @returns Category breakdown
 */
export async function getCategoryBreakdown(transactions: AllocationTransaction[]) {
  const decision = determineAnalyticsTier(transactions.length);

  logger.info("Generating category breakdown", {
    tier: decision.tier,
    reason: decision.reason,
    isFallback: decision.isFallback,
    transactionCount: transactions.length,
  });

  // Category breakdown is always fast on client side
  return await minimalAnalyticsService.calculateCategoryBreakdown(transactions);
}

/**
 * Get quick stats (hybrid)
 *
 * @param transactions - Allocation transactions
 * @returns Quick statistics
 */
export async function getQuickStats(transactions: AllocationTransaction[]) {
  const decision = determineAnalyticsTier(transactions.length);

  logger.info("Getting quick stats", {
    tier: decision.tier,
    reason: decision.reason,
    isFallback: decision.isFallback,
    transactionCount: transactions.length,
  });

  // Quick stats are always fast on client side
  return await minimalAnalyticsService.getQuickStats(transactions);
}

/**
 * ML Features (Tier 2 only)
 */

/**
 * Predict allocations using ML
 *
 * Only available in Tier 2. Falls back to empty array if unavailable.
 *
 * @param history - Historical transactions
 * @param paycheckAmount - Upcoming paycheck amount
 * @returns Predicted allocations
 */
export async function predictAllocations(history: AllocationTransaction[], paycheckAmount: number) {
  const decision = determineAnalyticsTier(history.length);

  if (decision.tier !== "backend") {
    logger.info("ML predictions not available in offline mode");
    return [];
  }

  try {
    return await backendAnalyticsService.predictAllocations(history, paycheckAmount);
  } catch (error) {
    logger.error("ML predictions failed", { error });
    return [];
  }
}

/**
 * Detect anomalies in allocations
 *
 * Only available in Tier 2. Falls back to empty array if unavailable.
 *
 * @param transactions - Allocation transactions
 * @returns Detected anomalies
 */
export async function detectAnomalies(transactions: AllocationTransaction[]) {
  const decision = determineAnalyticsTier(transactions.length);

  if (decision.tier !== "backend") {
    logger.info("Anomaly detection not available in offline mode");
    return [];
  }

  try {
    return await backendAnalyticsService.detectAnomalies(transactions);
  } catch (error) {
    logger.error("Anomaly detection failed", { error });
    return [];
  }
}

/**
 * Generate ML insights
 *
 * Only available in Tier 2. Falls back to empty array if unavailable.
 *
 * @param transactions - Allocation transactions
 * @returns ML insights
 */
export async function generateInsights(transactions: AllocationTransaction[]) {
  const decision = determineAnalyticsTier(transactions.length);

  if (decision.tier !== "backend") {
    logger.info("ML insights not available in offline mode");
    return [];
  }

  try {
    return await backendAnalyticsService.generateInsights(transactions);
  } catch (error) {
    logger.error("ML insights failed", { error });
    return [];
  }
}

/**
 * Test backend connection
 *
 * @returns Connection test result
 */
export async function testConnection() {
  return await backendAnalyticsService.testConnection();
}

/**
 * Hybrid Analytics Service (singleton)
 */
export const hybridAnalyticsService = {
  // Core analytics (with fallback)
  generateHeatmap,
  generateTrends,
  calculateHealth,
  getCategoryBreakdown,
  getQuickStats,

  // ML features (Tier 2 only)
  predictAllocations,
  detectAnomalies,
  generateInsights,

  // Utilities
  testConnection,
  determineAnalyticsTier,
};
