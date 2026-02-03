/**
 * Minimal Analytics Service - Optimized for Tier 1 (Phase 1.2)
 *
 * Target: <10KB service code
 * Performance: 1k txns <50ms, 5k txns <200ms, 10k txns <500ms
 *
 * Optimizations:
 * - No date-fns or lodash dependencies
 * - Native JavaScript Date/Array methods only
 * - Stripped-down calculations
 * - IndexedDB caching layer
 * - Web Worker support for heavy operations
 */

import logger from "@/utils/core/common/logger";
import { budgetDb as db } from "@/db/budgetDb";

// --- Types ---

export interface Transaction {
  id: string;
  date: string | Date;
  amount: number;
  category?: string;
  envelopeId?: string;
  description?: string;
}

export interface HeatmapData {
  date: string;
  value: number;
  transactions: number;
}

export interface TrendData {
  period: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
}

export interface AnalyticsCache {
  key: string;
  value: string;
  expiresAt: number;
  category: string;
}

// --- Cache Management ---

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const CACHE_CATEGORY = "analytics";

/**
 * Generate cache key from data hash
 */
function generateCacheKey(prefix: string, dataHash: string): string {
  return `${CACHE_CATEGORY}:${prefix}:${dataHash}`;
}

/**
 * Simple hash function for cache key generation
 */
function simpleHash(data: unknown[]): string {
  const str = JSON.stringify(
    data.map((d) => {
      const txn = d as Transaction;
      return `${txn.id}${txn.date}${txn.amount}`;
    })
  );

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

/**
 * Get cached data from IndexedDB
 */
async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await db.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      // Delete expired cache entry
      await db.cache.delete(key);
      return null;
    }

    // Value is always stored as JSON string in setCachedData
    if (typeof cached.value === "string") {
      return JSON.parse(cached.value) as T;
    }

    // Fallback for backward compatibility or unexpected types
    return cached.value as T;
  } catch (error) {
    logger.warn("Failed to get cached data", { error, key });
    return null;
  }
}

/**
 * Set cached data in IndexedDB
 */
async function setCachedData<T>(key: string, data: T): Promise<void> {
  try {
    await db.cache.put({
      key,
      value: JSON.stringify(data),
      expiresAt: Date.now() + CACHE_TTL_MS,
      category: CACHE_CATEGORY,
    });
  } catch (error) {
    logger.warn("Failed to set cached data", { error, key });
  }
}

/**
 * Invalidate all analytics cache entries
 */
export async function invalidateAnalyticsCache(): Promise<void> {
  try {
    const cacheEntries = await db.cache.where("category").equals(CACHE_CATEGORY).toArray();

    const keys = cacheEntries.map((entry) => entry.key);
    await db.cache.bulkDelete(keys);

    logger.info("Analytics cache invalidated", { count: keys.length });
  } catch (error) {
    logger.error("Failed to invalidate analytics cache", error);
  }
}

// --- Minimal Analytics Calculations ---

/**
 * Calculate daily transaction heatmap
 * Optimized for performance with minimal allocations
 */
export async function calculateHeatmap(
  transactions: Transaction[],
  useCache = true
): Promise<HeatmapData[]> {
  const dataHash = simpleHash(transactions);
  const cacheKey = generateCacheKey("heatmap", dataHash);

  // Try to get from cache first
  if (useCache) {
    const cached = await getCachedData<HeatmapData[]>(cacheKey);
    if (cached) {
      logger.debug("Heatmap cache hit", { transactions: transactions.length });
      return cached;
    }
  }

  const startTime = performance.now();

  // Group transactions by date
  const dateMap = new Map<string, { value: number; count: number }>();

  for (const txn of transactions) {
    // Skip income transactions
    if (txn.amount >= 0) continue;

    const date = new Date(txn.date);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const existing = dateMap.get(dateKey);
    if (existing) {
      existing.value += Math.abs(txn.amount);
      existing.count++;
    } else {
      dateMap.set(dateKey, {
        value: Math.abs(txn.amount),
        count: 1,
      });
    }
  }

  // Convert to array
  const result: HeatmapData[] = Array.from(dateMap.entries()).map(([date, data]) => ({
    date,
    value: data.value,
    transactions: data.count,
  }));

  const duration = performance.now() - startTime;
  logger.debug("Heatmap calculated", {
    transactions: transactions.length,
    duration: `${duration.toFixed(2)}ms`,
    points: result.length,
  });

  // Cache the result
  if (useCache) {
    await setCachedData(cacheKey, result);
  }

  return result;
}

/**
 * Calculate spending trends by period
 * Uses native Date methods only
 */
export async function calculateTrends(
  transactions: Transaction[],
  periodType: "daily" | "weekly" | "monthly" = "monthly",
  useCache = true
): Promise<TrendData[]> {
  const dataHash = simpleHash(transactions);
  const cacheKey = generateCacheKey(`trends-${periodType}`, dataHash);

  // Try to get from cache first
  if (useCache) {
    const cached = await getCachedData<TrendData[]>(cacheKey);
    if (cached) {
      logger.debug("Trends cache hit", { transactions: transactions.length });
      return cached;
    }
  }

  const startTime = performance.now();

  // Group transactions by period
  const periodMap = new Map<string, { income: number; expenses: number; count: number }>();

  for (const txn of transactions) {
    const date = new Date(txn.date);
    let periodKey: string;

    if (periodType === "daily") {
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    } else if (periodType === "weekly") {
      // Simplified week number calculation (not ISO-compliant)
      // Note: This is an approximation and doesn't handle cross-year/month boundaries correctly
      // For production use, consider implementing proper ISO 8601 week date calculation
      const weekNum = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
      periodKey = `${date.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
    } else {
      // monthly
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    }

    const existing = periodMap.get(periodKey);
    const isIncome = txn.amount > 0;
    const amount = Math.abs(txn.amount);

    if (existing) {
      if (isIncome) {
        existing.income += amount;
      } else {
        existing.expenses += amount;
      }
      existing.count++;
    } else {
      periodMap.set(periodKey, {
        income: isIncome ? amount : 0,
        expenses: isIncome ? 0 : amount,
        count: 1,
      });
    }
  }

  // Convert to array and calculate net
  const result: TrendData[] = Array.from(periodMap.entries())
    .map(([period, data]) => ({
      period,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
      count: data.count,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const duration = performance.now() - startTime;
  logger.debug("Trends calculated", {
    transactions: transactions.length,
    duration: `${duration.toFixed(2)}ms`,
    periods: result.length,
  });

  // Cache the result
  if (useCache) {
    await setCachedData(cacheKey, result);
  }

  return result;
}

/**
 * Calculate category breakdown
 * Minimal memory allocation version
 */
export function calculateCategoryBreakdown(transactions: Transaction[]): {
  category: string;
  amount: number;
  count: number;
  percentage: number;
}[] {
  const startTime = performance.now();

  const categoryMap = new Map<string, { amount: number; count: number }>();
  let totalExpenses = 0;

  for (const txn of transactions) {
    // Skip income
    if (txn.amount >= 0) continue;

    const category = txn.category || "Uncategorized";
    const amount = Math.abs(txn.amount);
    totalExpenses += amount;

    const existing = categoryMap.get(category);
    if (existing) {
      existing.amount += amount;
      existing.count++;
    } else {
      categoryMap.set(category, { amount, count: 1 });
    }
  }

  // Convert to array with percentages
  const result = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const duration = performance.now() - startTime;
  logger.debug("Category breakdown calculated", {
    transactions: transactions.length,
    duration: `${duration.toFixed(2)}ms`,
    categories: result.length,
  });

  return result;
}

/**
 * Get quick summary statistics
 * Ultra-fast single-pass calculation
 */
export function getQuickStats(transactions: Transaction[]): {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  transactionCount: number;
  avgTransaction: number;
} {
  let totalIncome = 0;
  let totalExpenses = 0;
  const count = transactions.length;

  for (const txn of transactions) {
    if (txn.amount > 0) {
      totalIncome += txn.amount;
    } else {
      totalExpenses += Math.abs(txn.amount);
    }
  }

  const netCashFlow = totalIncome - totalExpenses;
  const avgTransaction = count > 0 ? (totalIncome + totalExpenses) / count : 0;

  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    transactionCount: count,
    avgTransaction,
  };
}

// --- Web Worker Support ---

/**
 * Check if Web Workers are supported
 */
export function isWebWorkerSupported(): boolean {
  return typeof Worker !== "undefined";
}

/**
 * Export for Web Worker usage
 */
export const workerFunctions = {
  calculateHeatmap,
  calculateTrends,
  calculateCategoryBreakdown,
  getQuickStats,
};
