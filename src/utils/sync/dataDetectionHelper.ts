/**
 * Enhanced data detection helper for corruption recovery
 * Provides comprehensive checks and debugging for local data detection
 */
import { budgetDb } from "../../db/budgetDb";
import logger from "../common/logger";
import type { DataDetectionResult, DataDetectionDetails } from "@/types/sync";

// Re-export types for backward compatibility
export type { DataDetectionResult, DataDetectionDetails };

/**
 * Comprehensive local data detection with detailed logging
 * Checks multiple data sources and provides debugging information
 */
export const detectLocalData = async () => {
  try {
    logger.info("🔍 Starting comprehensive local data detection...");

    // 1. Check if database is accessible
    const dbOpen = await budgetDb.isOpen();
    logger.info(`📊 Database open status: ${dbOpen}`);

    if (!dbOpen) {
      logger.warn("⚠️ Database not open, attempting to open...");
      await budgetDb.open();
    }

    // 2. Get detailed database stats
    const stats = await budgetDb.getDatabaseStats();
    logger.info("📊 Database stats:", JSON.parse(JSON.stringify(stats)));

    // 3. Calculate total data items
    const totalItems =
      stats.envelopes + stats.transactions + stats.bills + stats.savingsGoals + stats.paychecks;

    // 4. Check for any core budget data (envelopes, transactions, bills)
    const hasCoreData = stats.envelopes > 0 || stats.transactions > 0 || stats.bills > 0;

    // 5. Sample actual data to verify counts are accurate
    const sampleData = await Promise.all([
      budgetDb.envelopes.limit(1).toArray(),
      budgetDb.transactions.limit(1).toArray(),
      budgetDb.bills.limit(1).toArray(),
    ]);

    const actualEnvelopeSample = sampleData[0];
    const actualTransactionSample = sampleData[1];
    const actualBillSample = sampleData[2];

    logger.info("🔍 Sample data verification:", {
      envelopesSample: actualEnvelopeSample.length,
      transactionsSample: actualTransactionSample.length,
      billsSample: actualBillSample.length,
    });

    // 6. Comprehensive result
    const dataTypes: string[] = [];
    if (stats.envelopes > 0) dataTypes.push("envelopes");
    if (stats.transactions > 0) dataTypes.push("transactions");
    if (stats.bills > 0) dataTypes.push("bills");
    if (stats.savingsGoals > 0) dataTypes.push("savingsGoals");
    if (stats.paychecks > 0) dataTypes.push("paychecks");

    const result = {
      hasData: hasCoreData,
      totalItems,
      itemCount: totalItems,
      dataTypes,
      readyForCloudReset: !hasCoreData,
      details: {
        ...stats,
        databaseOpen: dbOpen,
        samplesFound: {
          envelopes: actualEnvelopeSample.length > 0,
          transactions: actualTransactionSample.length > 0,
          bills: actualBillSample.length > 0,
        },
      },
      recommendation: hasCoreData
        ? "✅ Local data found - safe to proceed with operations"
        : "❌ No core data found - operations should be restricted",
    };

    logger.info("🎯 Data detection result:", result);
    return result;
  } catch (error) {
    logger.error("❌ Data detection failed:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      hasData: false,
      totalItems: 0,
      itemCount: 0,
      dataTypes: [] as string[],
      readyForCloudReset: true,
      details: {
        databaseOpen: false,
        envelopes: 0,
        transactions: 0,
        bills: 0,
        savingsGoals: 0,
        paychecks: 0,
        cache: 0,
        lastOptimized: 0,
        error: errorMsg,
      },
      recommendation: "❌ Data detection failed - assume no data for safety",
      exception: errorMsg,
    };
  }
};

/**
 * Quick data check for safety operations
 * Returns boolean result with minimal logging
 */
export const hasLocalData = async (): Promise<boolean> => {
  try {
    const stats = await budgetDb.getDatabaseStats();
    return stats.envelopes > 0 || stats.transactions > 0 || stats.bills > 0;
  } catch (error) {
    logger.warn("⚠️ Quick data check failed:", {
      message: error instanceof Error ? error.message : String(error),
    });
    return false; // Assume no data for safety
  }
};

export default { detectLocalData, hasLocalData };
