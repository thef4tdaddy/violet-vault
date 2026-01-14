/**
 * Transaction Archiving System for VioletVault
 *
 * Archives old transactions while preserving analytics data in aggregated form.
 * This helps reduce storage requirements while maintaining historical insights.
 */

import { budgetDb } from "../../db/budgetDb";
import logger from "../common/logger";

// Type definitions for transaction archiving
export interface ArchiveConfig {
  DEFAULT_ARCHIVE_AGE_MONTHS: number;
  BATCH_SIZE: number;
  AGGREGATION_PERIODS: {
    MONTHLY: string;
    QUARTERLY: string;
    YEARLY: string;
  };
  PRESERVE_CATEGORIES: string[];
}

export interface ArchivingStats {
  processed: number;
  archived: number;
  aggregated: number;
  errors: number;
}

export interface ArchiveResult {
  success: boolean;
  stats: ArchivingStats;
  message?: string;
  error?: string;
}

interface TransactionData {
  id: string;
  date: string;
  amount?: number;
  envelopeId?: string;
  type?: string;
  [key: string]: unknown;
}

interface GroupData {
  period: string;
  periodType: string;
  category: string;
  totalAmount: number;
  totalTransactions: number;
  envelopes: Set<string>;
  incomeAmount: number;
  expenseAmount: number;
  transferAmount: number;
  dateRange: { start: string; end: string };
}

interface TransactionWithTimestamp {
  id: string;
  date: Date;
  amount: number;
  description?: string;
  category: string;
  envelopeId: string;
  type: "income" | "expense" | "transfer";
  lastModified: number;
  createdAt: number;
  receiptUrl?: string;
  merchant?: string;
}

interface ArchiveData {
  id: string;
  createdAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  transactionCount: number;
  totalAmount: number;
  categories: string[];
  envelopes: string[];
  transactions: Array<{
    id: string;
    date: string;
    amount: number;
    description: string;
    category: string;
    envelopeId: string;
    type: string;
  }>;
}

interface PeriodInfo {
  name: string;
  months: number;
  cutoffDate: string;
  count: number;
}

export interface ArchivingInfo {
  current: {
    totalTransactions: number;
    periodBreakdown: PeriodInfo[];
    oldTransactions: number;
    veryOldTransactions: number;
  };
  archived: {
    archiveCount: number;
    analyticsCount: number;
  };
  recommendations: {
    canArchive: boolean;
    potentialSavings: number;
    suggestedPeriod: number;
    suggestedAction: string;
  };
}

// Default archiving configuration
export const ARCHIVE_CONFIG: ArchiveConfig = {
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
  config: ArchiveConfig;
  stats: ArchivingStats;

  constructor(config: ArchiveConfig = ARCHIVE_CONFIG) {
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
  async archiveOldTransactions(
    olderThanMonths: number = this.config.DEFAULT_ARCHIVE_AGE_MONTHS
  ): Promise<ArchiveResult> {
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

      logger.info("Transaction archiving completed successfully", { stats: this.stats });

      return {
        success: true,
        stats: this.stats,
        message: `Successfully archived ${this.stats.archived} transactions`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("Transaction archiving failed", { error });
      throw new Error(`Archiving failed: ${errorMessage}`);
    }
  }

  /**
   * Calculate the cutoff date for archiving
   */
  calculateCutoffDate(months: number): string {
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - months);
    cutoffDate.setDate(1); // Start of month for cleaner boundaries
    return cutoffDate.toISOString().split("T")[0];
  }

  /**
   * Get transactions that are eligible for archiving
   */
  async getTransactionsForArchiving(cutoffDate: string): Promise<TransactionData[]> {
    const results = await budgetDb.transactions.where("date").below(cutoffDate).toArray();
    return results.map((transaction) => ({
      ...transaction,
      date:
        transaction.date instanceof Date
          ? transaction.date.toISOString()
          : String(transaction.date),
    }));
  }

  /**
   * Create aggregated analytics data before archiving
   */
  async createAnalyticsAggregations(transactions: TransactionData[]): Promise<void> {
    logger.info("Creating analytics aggregations");

    const aggregations = {
      monthly: this.aggregateByPeriod(transactions, "month"),
      quarterly: this.aggregateByPeriod(transactions, "quarter"),
      yearly: this.aggregateByPeriod(transactions, "year"),
    };

    // Store aggregations in database
    for (const [period, data] of Object.entries(aggregations)) {
      for (const aggregation of data as GroupData[]) {
        const serializedAggregation = {
          ...aggregation,
          envelopes: Array.from(aggregation.envelopes),
        };
        await budgetDb.cache.put({
          key: `analytics_${period}_${aggregation.period}_${aggregation.category}`,
          value: serializedAggregation,
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
  private createGroupData(
    transaction: TransactionData,
    periodKey: string,
    periodType: string
  ): GroupData {
    const category =
      typeof transaction.category === "string" && transaction.category.trim().length > 0
        ? transaction.category
        : "uncategorized";
    const transactionDate = String(transaction.date);
    return {
      period: periodKey,
      category,
      periodType,
      totalAmount: 0,
      totalTransactions: 0,
      incomeAmount: 0,
      expenseAmount: 0,
      transferAmount: 0,
      envelopes: new Set<string>(),
      dateRange: {
        start: transactionDate,
        end: transactionDate,
      },
    };
  }

  /**
   * Update group with transaction data
   */
  private updateGroupWithTransaction(group: GroupData, transaction: TransactionData): void {
    group.totalAmount += transaction.amount || 0;
    group.totalTransactions++;
    if (transaction.envelopeId) {
      group.envelopes.add(String(transaction.envelopeId));
    }

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
    const transactionDate = String(transaction.date);
    if (transactionDate < group.dateRange.start) {
      group.dateRange.start = transactionDate;
    }
    if (transactionDate > group.dateRange.end) {
      group.dateRange.end = transactionDate;
    }
  }

  /**
   * Aggregate transactions by time period
   */
  private aggregateByPeriod(transactions: TransactionData[], periodType: string): GroupData[] {
    const groups = new Map<string, GroupData>();

    transactions.forEach((transaction) => {
      const date = new Date(String(transaction.date));
      const periodKey = this.getPeriodKey(date, periodType);
      const categoryKey =
        typeof transaction.category === "string" && transaction.category.trim().length > 0
          ? transaction.category
          : "uncategorized";
      const key = `${periodKey}_${categoryKey}`;

      if (!groups.has(key)) {
        groups.set(key, this.createGroupData(transaction, periodKey, periodType));
      }

      this.updateGroupWithTransaction(groups.get(key)!, transaction);
    });

    // Convert Sets to Arrays for storage
    return Array.from(groups.values());
  }

  /**
   * Create archived transaction records (compressed format)
   */
  async createTransactionArchives(transactions: TransactionData[]): Promise<void> {
    logger.info("Creating transaction archives");

    const batchSize = this.config.BATCH_SIZE;
    const archives: ArchiveData[] = [];

    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      const timestamps = batch.map((t) => new Date(String(t.date)).getTime());
      const startDateIso = new Date(Math.min(...timestamps)).toISOString();
      const endDateIso = new Date(Math.max(...timestamps)).toISOString();

      const archive: ArchiveData = {
        id: `archive_${Date.now()}_${i}`,
        createdAt: new Date().toISOString(),
        dateRange: {
          start: startDateIso,
          end: endDateIso,
        },
        transactionCount: batch.length,
        totalAmount: batch.reduce((sum, t) => sum + (t.amount || 0), 0),
        categories: Array.from(
          new Set(batch.map((t) => (t.category ? String(t.category) : "uncategorized")))
        ),
        envelopes: Array.from(
          new Set(
            batch
              .map((t) => (t.envelopeId ? String(t.envelopeId) : ""))
              .filter((value) => value !== "")
          )
        ),
        // Store compressed transaction data
        transactions: batch.map((t) => ({
          id: t.id,
          date: String(t.date),
          amount: Number(t.amount || 0),
          description: String(t.description || ""),
          category: String(t.category || "uncategorized"),
          envelopeId: String(t.envelopeId || ""),
          type: String(t.type || "expense"),
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
  async removeArchivedTransactions(transactions: TransactionData[]): Promise<void> {
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
  async optimizeDatabase(): Promise<void> {
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
      logger.warn("Database optimization completed with warnings", { error });
    }
  }

  /**
   * Get archiving statistics and recommendations
   */
  async getArchivingInfo(customPeriods: PeriodInfo[] | null = null): Promise<ArchivingInfo> {
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
        canArchive: (bestRecommendation?.count || 0) > 0,
        potentialSavings: bestRecommendation?.count || 0,
        suggestedPeriod: bestRecommendation?.months || 0,
        suggestedAction:
          (bestRecommendation?.count || 0) > 0
            ? `Archive ${bestRecommendation.count} transactions older than ${bestRecommendation.name}`
            : "No archiving needed at this time",
      },
    };
  }

  /**
   * Retrieve archived transaction data for analytics
   */
  async getArchivedAnalytics(
    period: string = "yearly",
    category: string | null = null
  ): Promise<Array<Record<string, unknown>>> {
    const keyPattern = category ? `analytics_${period}_*_${category}` : `analytics_${period}_*`;

    const results = await budgetDb.cache
      .where("key")
      .startsWith(keyPattern.replace("*", ""))
      .toArray();

    return results.map((r) => r.value as Record<string, unknown>);
  }

  /**
   * Emergency restore function (for testing/recovery)
   */
  async restoreArchivedTransactions(archiveId: string): Promise<number> {
    logger.warn("Attempting to restore archived transactions", { archiveId });

    const archive = await budgetDb.cache.get(`transaction_archive_${archiveId}`);
    if (!archive) {
      throw new Error(`Archive ${archiveId} not found`);
    }

    const archiveValue = archive.value as { transactions: Array<TransactionData> };

    // Restore transactions to active storage
    for (const transaction of archiveValue.transactions) {
      const transactionWithTimestamp: TransactionWithTimestamp = {
        id: String(transaction.id || Date.now()),
        date: new Date(String(transaction.date)),
        amount: Number(transaction.amount || 0),
        envelopeId: String(transaction.envelopeId || ""),
        category: String(transaction.category || "other"),
        type: (transaction.type as "income" | "expense" | "transfer") || "expense",
        lastModified: Date.now(),
        createdAt: transaction.createdAt ? Number(transaction.createdAt) : Date.now(),
        description: transaction.description as string | undefined,
        merchant: transaction.merchant as string | undefined,
      };
      await budgetDb.transactions.put(transactionWithTimestamp as never);
    }

    logger.info("Restored transactions from archive", {
      archiveId,
      restoredCount: archiveValue.transactions.length,
    });
    return archiveValue.transactions.length;
  }
}

// Utility functions for UI components
export const createArchiver = (config: ArchiveConfig = ARCHIVE_CONFIG): TransactionArchiver =>
  new TransactionArchiver(config);

export const getArchivingRecommendations = async (): Promise<ArchivingInfo> => {
  const archiver = new TransactionArchiver();
  return archiver.getArchivingInfo();
};

export const archiveTransactions = async (olderThanMonths: number): Promise<ArchiveResult> => {
  const archiver = new TransactionArchiver();
  return archiver.archiveOldTransactions(olderThanMonths);
};
