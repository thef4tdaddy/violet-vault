import { budgetDb } from "../../db/budgetDb";
import logger from "../common/logger";

/**
 * Offline Data Validator
 * Ensures critical budget data is available offline via Dexie
 */

interface TableDataInfo {
  count: number;
  available: boolean;
}

interface ValidationResults {
  isReady: boolean;
  hasData: boolean;
  criticalDataAvailable: Record<string, TableDataInfo>;
  recommendations: Array<{
    type: string;
    message: string;
    action: string;
  }>;
  lastValidated: string;
  totalRecords: number;
  error?: string;
}

class OfflineDataValidator {
  criticalTables: string[];

  constructor() {
    this.criticalTables = [
      "envelopes",
      "transactions",
      "bills",
      "savingsGoals",
      "debts",
      "paycheckHistory",
    ];
  }

  /**
   * Validate that all critical data is available offline
   */
  async validateOfflineReadiness(): Promise<ValidationResults> {
    const results: ValidationResults = {
      isReady: false,
      hasData: false,
      criticalDataAvailable: {},
      recommendations: [],
      lastValidated: new Date().toISOString(),
      totalRecords: 0,
    };

    try {
      // Check each critical table
      for (const table of this.criticalTables) {
        const count = await this.getTableCount(table);
        results.criticalDataAvailable[table] = {
          count,
          available: count > 0,
        };
        results.totalRecords += count;
      }

      // Check if we have any meaningful data
      results.hasData = results.totalRecords > 0;

      // Specific validations
      const envelopeCount = results.criticalDataAvailable.envelopes?.count || 0;
      const transactionCount = results.criticalDataAvailable.transactions?.count || 0;

      // Generate recommendations
      if (envelopeCount === 0) {
        results.recommendations.push({
          type: "warning",
          message: "No envelopes found in offline storage",
          action: "Create budget envelopes while online to enable full offline functionality",
        });
      }

      if (transactionCount === 0) {
        results.recommendations.push({
          type: "info",
          message: "No transactions in offline storage",
          action: "Add transactions while online to view transaction history offline",
        });
      }

      if (transactionCount > 0 && envelopeCount > 0) {
        results.recommendations.push({
          type: "success",
          message: "Budget data is ready for offline use",
          action: "You can view budgets, add transactions, and manage finances offline",
        });
      }

      // Determine overall readiness
      results.isReady = envelopeCount > 0; // At minimum, need envelopes for offline budgeting

      logger.info("📊 Offline data validation completed", {
        isReady: results.isReady,
        totalRecords: results.totalRecords,
        hasEnvelopes: envelopeCount > 0,
        hasTransactions: transactionCount > 0,
      });

      return results;
    } catch (error) {
      logger.error("❌ Offline data validation failed", error);
      results.error = (error as Error).message;
      return results;
    }
  }

  /**
   * Get count of records in a table
   */
  async getTableCount(tableName: string): Promise<number> {
    try {
      const dbAny = budgetDb as unknown as Record<string, { count?: () => Promise<number> }>;
      const table = dbAny[tableName];
      if (!table || typeof table.count !== "function") {
        logger.warn(`Table ${tableName} not found in Dexie schema`);
        return 0;
      }

      const count = await table.count();
      logger.debug(`📋 Table ${tableName}: ${count} records`);
      return count;
    } catch (error) {
      logger.warn(`Failed to count records in ${tableName}:`, error as Record<string, unknown>);
      return 0;
    }
  }

  /**
   * Get recent transactions for offline capability testing
   */
  async getRecentTransactionsPreview() {
    try {
      const recentTransactions = await budgetDb.transactions
        .orderBy("date")
        .reverse()
        .limit(5)
        .toArray();

      return recentTransactions.map((tx) => ({
        id: tx.id,
        description: tx.description,
        amount: tx.amount,
        date: tx.date,
        envelope: tx.envelopeId,
      }));
    } catch (error) {
      logger.warn("Failed to get recent transactions preview:", error as Record<string, unknown>);
      return [];
    }
  }

  /**
   * Get envelope summary for offline capability testing
   */
  async getEnvelopeSummary() {
    try {
      const envelopes = await budgetDb.envelopes.toArray();

      return {
        totalEnvelopes: envelopes.length,
        totalAllocated: envelopes.reduce(
          (sum, env) => sum + ((env as { allocated?: number }).allocated || 0),
          0
        ),
        totalSpent: envelopes.reduce(
          (sum, env) => sum + ((env as { spent?: number }).spent || 0),
          0
        ),
        envelopeNames: envelopes.slice(0, 5).map((env) => env.name),
      };
    } catch (error) {
      logger.warn("Failed to get envelope summary:", error as Record<string, unknown>);
      return {
        totalEnvelopes: 0,
        totalAllocated: 0,
        totalSpent: 0,
        envelopeNames: [],
      };
    }
  }

  /**
   * Test offline data access performance
   */
  async testOfflinePerformance() {
    const results: {
      envelopeLoadTime: number;
      transactionLoadTime: number;
      totalTime: number;
      success: boolean;
      error?: string;
    } = {
      envelopeLoadTime: 0,
      transactionLoadTime: 0,
      totalTime: 0,
      success: false,
    };

    try {
      // Test envelope loading
      const envelopeStart = performance.now();
      await budgetDb.envelopes.limit(10).toArray();
      results.envelopeLoadTime = performance.now() - envelopeStart;

      // Test transaction loading
      const transactionStart = performance.now();
      await budgetDb.transactions.limit(20).toArray();
      results.transactionLoadTime = performance.now() - transactionStart;

      results.totalTime = results.envelopeLoadTime + results.transactionLoadTime;
      results.success = true;

      logger.info("⚡ Offline data performance test completed", {
        envelopeMs: Math.round(results.envelopeLoadTime * 100) / 100,
        transactionMs: Math.round(results.transactionLoadTime * 100) / 100,
        totalMs: Math.round(results.totalTime * 100) / 100,
      });
    } catch (error) {
      logger.error("❌ Offline performance test failed", error);
      results.error = (error as Error).message;
    }

    return results;
  }

  /**
   * Get comprehensive offline readiness report
   */
  async getOfflineReadinessReport() {
    const [validation, envelopeSummary, recentTransactions, performance] = await Promise.allSettled(
      [
        this.validateOfflineReadiness(),
        this.getEnvelopeSummary(),
        this.getRecentTransactionsPreview(),
        this.testOfflinePerformance(),
      ]
    );

    return {
      timestamp: new Date().toISOString(),
      validation:
        validation.status === "fulfilled"
          ? validation.value
          : { error: validation.reason?.message },
      envelopeSummary:
        envelopeSummary.status === "fulfilled"
          ? envelopeSummary.value
          : { error: envelopeSummary.reason?.message },
      recentTransactions: recentTransactions.status === "fulfilled" ? recentTransactions.value : [],
      performance:
        performance.status === "fulfilled"
          ? performance.value
          : { error: performance.reason?.message },
      userAgent: navigator.userAgent,
      online: navigator.onLine,
    };
  }

  /**
   * Pre-cache critical data for offline use
   */
  async preCacheCriticalData() {
    const results: {
      envelopesCached: boolean;
      transactionsCached: boolean;
      billsCached: boolean;
      success: boolean;
      cacheTime: number;
      error?: string;
    } = {
      envelopesCached: false,
      transactionsCached: false,
      billsCached: false,
      success: false,
      cacheTime: 0,
    };

    try {
      const startTime = performance.now();

      // Trigger loading of critical data to ensure it's in Dexie
      const [envelopes, transactions, bills] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.transactions.orderBy("date").reverse().limit(100).toArray(),
        budgetDb.bills.toArray(),
      ]);

      results.envelopesCached = envelopes.length > 0;
      results.transactionsCached = transactions.length > 0;
      results.billsCached = bills.length > 0;
      results.cacheTime = performance.now() - startTime;
      results.success = true;

      logger.info("📦 Critical data pre-cached for offline use", {
        envelopes: envelopes.length,
        transactions: transactions.length,
        bills: bills.length,
        cacheTimeMs: Math.round(results.cacheTime * 100) / 100,
      });
    } catch (error) {
      logger.error("❌ Failed to pre-cache critical data", error);
      results.error = (error as Error).message;
    }

    return results;
  }
}

// Create singleton instance
const offlineDataValidator = new OfflineDataValidator();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).offlineDataValidator = offlineDataValidator;
}

export default offlineDataValidator;
