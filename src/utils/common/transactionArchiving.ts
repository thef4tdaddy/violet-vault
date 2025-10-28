/**
 * Transaction Archiving System for VioletVault
 *
 * Archives old transactions while preserving analytics data in aggregated form.
 * This helps reduce storage requirements while maintaining historical insights.
 */

import { budgetDb } from "../../db/budgetDb";
import logger from "../common/logger";

// Default archiving configuration
export const ARCHIVE_CONFIG = {
  // Archive transactions older than this (in months)
  DEFAULT_ARCHIVE_AGE_MONTHS: 6,

  // Batch size for processing transactions
  BATCH_SIZE: 100,

  // Analytics aggregation periods
  AGGREGATION_PERIODS: {
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
    YEARLY: "yearly",
  },

  // What to preserve in archives
  PRESERVE_CATEGORIES: ["income", "fixed-expenses", "variable-expenses", "savings", "transfers"],
};

/**
 * Main archiving class that handles the complete archiving workflow
 */
export class TransactionArchiver {
  config: typeof ARCHIVE_CONFIG;
  stats: {
    processed: number;
    archived: number;
    aggregated: number;
    errors: number;
  };

  constructor(config = ARCHIVE_CONFIG) {
    this.config = { ...ARCHIVE_CONFIG, ...config };
    this.stats = {
      processed: 0,
      archived: 0,
      aggregated: 0,
      errors: 0,
    };
  }

  /**
   * Execute the complete archiving process
   */
  async archiveOldTransactions(olderThanMonths = this.config.DEFAULT_ARCHIVE_AGE_MONTHS) {
    try {
      logger.info("Starting transaction archiving process", {
        olderThanMonths,
      });

      const cutoffDate = this.calculateCutoffDate(olderThanMonths);
      const oldTransactions = await this.getTransactionsForArchiving(cutoffDate);

      if (oldTransactions.length === 0) {
        logger.info("No transactions found for archiving");
        return {
          success: true,
          stats: this.stats,
          message: "No transactions to archive",
        };
      }

      logger.info(`Found ${oldTransactions.length} transactions to archive`);

      // Step 1: Create analytics aggregations
      await this.createAnalyticsAggregations(oldTransactions);

      // Step 2: Create transaction archives
      await this.createTransactionArchives(oldTransactions);

      // Step 3: Remove original transactions
      await this.removeArchivedTransactions(oldTransactions);

      // Step 4: Clean up and optimize database
      await this.optimizeDatabase();

      logger.info("Transaction archiving completed successfully", this.stats);

      return {
        success: true,
        stats: this.stats,
        message: `Successfully archived ${this.stats.archived} transactions`,
      };
    } catch (error) {
      logger.error("Transaction archiving failed", error);
      throw new Error(`Archiving failed: ${error.message}`);
    }
  }

  /**
   * Calculate the cutoff date for archiving
   */
  calculateCutoffDate(months) {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    cutoffDate.setDate(1); // Start of month for cleaner boundaries
    return cutoffDate.toISOString().split("T")[0];
  }

  /**
   * Get transactions that are eligible for archiving
   */
  async getTransactionsForArchiving(cutoffDate) {
    return budgetDb.transactions.where("date").below(cutoffDate).toArray();
  }

  /**
   * Create aggregated analytics data before archiving
   */
  async createAnalyticsAggregations(transactions) {
    logger.info("Creating analytics aggregations");

    const aggregations = {
      monthly: this.aggregateByPeriod(transactions, "month"),
      quarterly: this.aggregateByPeriod(transactions, "quarter"),
      yearly: this.aggregateByPeriod(transactions, "year"),
    };

    // Store aggregations in database
    for (const [period, data] of Object.entries(aggregations)) {
      for (const aggregation of data) {
        await budgetDb.cache.put({
          key: `analytics_${period}_${aggregation.period}_${aggregation.category}`,
          value: aggregation,
          category: "analytics_archive",
          expiresAt: null, // Never expires
        });
        this.stats.aggregated++;
      }
    }
  }

  /**
   * Get period key from date based on period type
   */
  private getPeriodKey(date: Date, periodType: string): string {
    switch (periodType) {
      case "month":
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      case "quarter": {
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        return `${date.getFullYear()}-Q${quarter}`;
      }
      case "year":
        return `${date.getFullYear()}`;
      default:
        return date.toISOString().split("T")[0];
    }
  }

  /**
   * Create initial group data structure
   */
  private createGroupData(transaction: {
    date: string;
    category?: string;
    [key: string]: unknown;
  }, periodKey: string, periodType: string) {
    return {
      period: periodKey,
      category: transaction.category || "uncategorized",
      periodType,
      totalAmount: 0,
      totalTransactions: 0,
      incomeAmount: 0,
      expenseAmount: 0,
      transferAmount: 0,
      envelopes: new Set(),
      dateRange: {
        start: transaction.date,
        end: transaction.date,
      },
    };
  }

  /**
   * Update group with transaction data
   */
  private updateGroupWithTransaction(
    group: {
      totalAmount: number;
      totalTransactions: number;
      envelopes: Set<string>;
      incomeAmount: number;
      expenseAmount: number;
      transferAmount: number;
      dateRange: { start: string; end: string };
    },
    transaction: {
      amount?: number;
      envelopeId?: string;
      type?: string;
      date: string;
      [key: string]: unknown;
    }
  ) {
    group.totalAmount += transaction.amount || 0;
    group.totalTransactions++;
    group.envelopes.add(transaction.envelopeId);

    // Categorize by transaction type
    const amount = transaction.amount || 0;
    if (amount > 0) {
      group.incomeAmount += amount;
    } else if (amount < 0) {
      group.expenseAmount += Math.abs(amount);
    }

    if (transaction.type === "transfer") {
      group.transferAmount += Math.abs(amount);
    }

    // Update date range
    if (transaction.date < group.dateRange.start) {
      group.dateRange.start = transaction.date;
    }
    if (transaction.date > group.dateRange.end) {
      group.dateRange.end = transaction.date;
    }
  }

  /**
   * Aggregate transactions by time period
   */
  aggregateByPeriod(transactions, periodType) {
    const groups = new Map();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const periodKey = this.getPeriodKey(date, periodType);
      const key = `${periodKey}_${transaction.category || "uncategorized"}`;

      if (!groups.has(key)) {
        groups.set(key, this.createGroupData(transaction, periodKey, periodType));
      }

      this.updateGroupWithTransaction(groups.get(key), transaction);
    });

    // Convert Sets to Arrays for storage
    return Array.from(groups.values()).map((group) => ({
      ...group,
      envelopes: Array.from(group.envelopes),
      uniqueEnvelopes: group.envelopes.size,
    }));
  }

  /**
   * Create archived transaction records (compressed format)
   */
  async createTransactionArchives(transactions) {
    logger.info("Creating transaction archives");

    const batchSize = this.config.BATCH_SIZE;
    const archives = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);

      const archive = {
        id: `archive_${Date.now()}_${i}`,
        createdAt: new Date().toISOString(),
        dateRange: {
          start: Math.min(...batch.map((t) => t.date)),
          end: Math.max(...batch.map((t) => t.date)),
        },
        transactionCount: batch.length,
        totalAmount: batch.reduce((sum, t) => sum + (t.amount || 0), 0),
        categories: [...new Set(batch.map((t) => t.category).filter(Boolean))],
        envelopes: [...new Set(batch.map((t) => t.envelopeId).filter(Boolean))],
        // Store compressed transaction data
        transactions: batch.map((t) => ({
          id: t.id,
          date: t.date,
          amount: t.amount,
          description: t.description,
          category: t.category,
          envelopeId: t.envelopeId,
          type: t.type,
        })),
      };

      archives.push(archive);
    }

    // Store archives
    for (const archive of archives) {
      await budgetDb.cache.put({
        key: `transaction_archive_${archive.id}`,
        value: archive,
        category: "transaction_archive",
        expiresAt: null, // Never expires
      });
      this.stats.archived += archive.transactionCount;
    }
  }

  /**
   * Remove transactions that have been archived
   */
  async removeArchivedTransactions(transactions) {
    logger.info("Removing archived transactions from active storage");

    const transactionIds = transactions.map((t) => t.id);
    const batchSize = this.config.BATCH_SIZE;

    for (let i = 0; i < transactionIds.length; i += batchSize) {
      const batch = transactionIds.slice(i, i + batchSize);
      await budgetDb.transactions.where("id").anyOf(batch).delete();
      this.stats.processed += batch.length;
    }
  }

  /**
   * Optimize database after archiving
   */
  async optimizeDatabase() {
    logger.info("Optimizing database after archiving");

    // Clean up any orphaned records and optimize indexes
    try {
      // This would typically involve database-specific optimization
      // For Dexie/IndexedDB, we can trigger garbage collection
      if (typeof budgetDb.open === "function") {
        await budgetDb.close();
        await budgetDb.open();
      }
    } catch (error) {
      logger.warn("Database optimization completed with warnings", error);
    }
  }

  /**
   * Get archiving statistics and recommendations
   */
  async getArchivingInfo(customPeriods = null) {
    const now = new Date();

    // Default periods if none specified
    const periods = customPeriods || [
      { name: "1 month", months: 1 },
      { name: "3 months", months: 3 },
      { name: "6 months", months: 6 },
      { name: "1 year", months: 12 },
      { name: "2 years", months: 24 },
    ];

    // Calculate dates for each period
    const periodDates = periods.map((period) => {
      const date = new Date(now.getFullYear(), now.getMonth() - period.months, now.getDate());
      return {
        ...period,
        cutoffDate: date.toISOString().split("T")[0],
      };
    });

    // Get counts for each period
    const totalTransactions = await budgetDb.transactions.count();
    const periodCounts = await Promise.all(
      periodDates.map(async (period) => ({
        ...period,
        count: await budgetDb.transactions.where("date").below(period.cutoffDate).count(),
      }))
    );

    const archives = await budgetDb.cache.where("category").equals("transaction_archive").count();

    const analyticsAggregations = await budgetDb.cache
      .where("category")
      .equals("analytics_archive")
      .count();

    // Find the best recommendation based on transaction volume
    const bestRecommendation =
      periodCounts.find((p) => p.count > 50) || periodCounts[periodCounts.length - 1];

    return {
      current: {
        totalTransactions,
        periodBreakdown: periodCounts,
        // Keep backward compatibility
        oldTransactions: periodCounts.find((p) => p.months === 12)?.count || 0,
        veryOldTransactions: periodCounts.find((p) => p.months === 24)?.count || 0,
      },
      archived: {
        archiveCount: archives,
        analyticsCount: analyticsAggregations,
      },
      recommendations: {
        canArchive: bestRecommendation.count > 0,
        potentialSavings: bestRecommendation.count,
        suggestedPeriod: bestRecommendation.months,
        suggestedAction:
          bestRecommendation.count > 0
            ? `Archive ${bestRecommendation.count} transactions older than ${bestRecommendation.name}`
            : "No archiving needed at this time",
      },
    };
  }

  /**
   * Retrieve archived transaction data for analytics
   */
  async getArchivedAnalytics(period = "yearly", category = null) {
    const keyPattern = category ? `analytics_${period}_*_${category}` : `analytics_${period}_*`;

    const results = await budgetDb.cache
      .where("key")
      .startsWith(keyPattern.replace("*", ""))
      .toArray();

    return results.map((r) => r.value);
  }

  /**
   * Emergency restore function (for testing/recovery)
   */
  async restoreArchivedTransactions(archiveId) {
    logger.warn(`Attempting to restore archived transactions: ${archiveId}`);

    const archive = await budgetDb.cache.get(`transaction_archive_${archiveId}`);
    if (!archive) {
      throw new Error(`Archive ${archiveId} not found`);
    }

    const archiveValue = archive.value as { transactions: Array<Record<string, unknown>> };

    // Restore transactions to active storage
    for (const transaction of archiveValue.transactions) {
      await budgetDb.transactions.put(transaction);
    }

    logger.info(
      `Restored ${archiveValue.transactions.length} transactions from archive ${archiveId}`
    );
    return archiveValue.transactions.length;
  }
}

// Utility functions for UI components
export const createArchiver = (config) => new TransactionArchiver(config);

export const getArchivingRecommendations = async () => {
  const archiver = new TransactionArchiver();
  return archiver.getArchivingInfo();
};

export const archiveTransactions = async (olderThanMonths) => {
  const archiver = new TransactionArchiver();
  return archiver.archiveOldTransactions(olderThanMonths);
};
