/**
 * Enhanced data detection helper for corruption recovery
 * Provides comprehensive checks and debugging for local data detection
 */
import { budgetDb } from "../../db/budgetDb";
import logger from "../common/logger";

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
    logger.info("📊 Database stats:", stats);

    // 3. Calculate total data items
    const totalItems =
      stats.envelopes + stats.transactions + stats.bills + stats.goals + stats.paychecks;

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
    const result = {
      hasData: hasCoreData,
      totalItems,
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
    return {
      hasData: false,
      totalItems: 0,
      details: { error: error.message },
      recommendation: "❌ Data detection failed - assume no data for safety",
    };
  }
};

/**
 * Quick data check for safety operations
 * Returns boolean result with minimal logging
 */
export const hasLocalData = async () => {
  try {
    const stats = await budgetDb.getDatabaseStats();
    return stats.envelopes > 0 || stats.transactions > 0 || stats.bills > 0;
  } catch (error) {
    logger.warn("⚠️ Quick data check failed:", error.message);
    return false; // Assume no data for safety
  }
};

export default { detectLocalData, hasLocalData };
