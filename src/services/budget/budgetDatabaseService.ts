// Budget Database Service - Centralized database operations with optimized queries
import { budgetDb } from "@/db/budgetDb";
import { type Table, type Collection } from "dexie";
import logger from "@/utils/common/logger";
import { type z } from "zod";
import {
  EnvelopeSchema,
  type Envelope as ZodEnvelope,
  type EnvelopeType,
} from "@/domain/schemas/envelope";
import {
  TransactionSchema,
  type Transaction as ZodTransaction,
} from "@/domain/schemas/transaction";

interface DateRange {
  start: Date;
  end: Date;
}

interface GetEnvelopesOptions {
  category?: string;
  type?: EnvelopeType;
  isPaid?: boolean;
  isCompleted?: boolean;
  daysAhead?: number;
  includeArchived?: boolean;
  useCache?: boolean;
}

// Budget metadata structure stored in the database
interface BudgetMetadata {
  id: string;
  lastModified: number;
  unassignedCash?: number;
  actualBalance?: number;
  [key: string]: unknown;
}

// Encrypted budget data structure
interface EncryptedBudgetData {
  id: string;
  lastModified: number;
  version: number;
  [key: string]: unknown;
}

interface GetTransactionsOptions {
  dateRange?: DateRange;
  envelopeId?: string;
  category?: string;
  type?: string;
  limit?: number;
  useCache?: boolean;
}

interface GetAnalyticsDataOptions {
  includeTransfers?: boolean;
  useCache?: boolean;
}

interface BatchUpdateItem {
  collection: string;
  type: "envelope" | "transaction";
  operation: "upsert" | "delete";
  data: unknown;
}

interface ServiceStatus {
  isInitialized: boolean;
  cachePrefix: string;
  defaultCacheTtl: number;
}

class BudgetDatabaseService {
  db: typeof budgetDb;
  cachePrefix: string;
  defaultCacheTtl: number;

  constructor() {
    this.db = budgetDb;
    this.cachePrefix = "budget_db_";
    this.defaultCacheTtl = 300000; // 5 minutes
  }

  // Validate output data from database, returning empty array on validation failure
  private _validateOutput<T>(
    rawData: unknown[],
    schema: z.ZodArray<z.ZodType<T>>,
    entityName: string
  ): T[] {
    const result = schema.safeParse(rawData);
    if (!result.success) {
      logger.error(`Failed to validate ${entityName} from database`, {
        error: result.error,
        rawData: rawData.length > 5 ? rawData.slice(0, 5) : rawData,
      });
      return [];
    }
    return result.data;
  }

  // Validate input data before saving, throwing error on validation failure
  private _validateInput<T>(data: T[], schema: z.ZodArray<z.ZodType<T>>, entityName: string): T[] {
    const result = schema.safeParse(data);
    if (!result.success) {
      logger.error(`Failed to validate ${entityName} for save`, result.error);
      throw new Error(`Invalid ${entityName} data: ${result.error.message}`);
    }
    return result.data;
  }

  async initialize(): Promise<boolean> {
    try {
      await this.db.open();
      logger.info("Budget database service initialized");
      return true;
    } catch (error) {
      logger.error("Failed to initialize database service", error);
      throw error;
    }
  }

  async getStats(): Promise<unknown> {
    try {
      return await this.db.getDatabaseStats();
    } catch (error) {
      logger.error("Failed to get database stats", error);
      throw error;
    }
  }

  // Envelope operations with optimized queries
  async getEnvelopes(options: GetEnvelopesOptions = {}): Promise<ZodEnvelope[]> {
    try {
      const rawData = await this._fetchEnvelopesRaw(options);
      let result = this._validateOutput(rawData, EnvelopeSchema.array(), "envelopes");
      result = this._filterEnvelopesByOptions(result, options);
      return result;
    } catch (error) {
      logger.error("Failed to get envelopes", error);
      throw error;
    }
  }

  private async _fetchEnvelopesRaw(options: GetEnvelopesOptions): Promise<unknown[]> {
    const { category, includeArchived = false, useCache = true, type } = options;

    if (category) {
      return await this.db.getEnvelopesByCategory(category, includeArchived);
    }

    if (useCache && !type) {
      const cacheKey = `${this.cachePrefix}envelopes_active`;
      let envelopes = await this.db.getCachedValue(cacheKey, this.defaultCacheTtl);
      if (!envelopes) {
        envelopes = await this.db.getActiveEnvelopes();
        await this.db.setCachedValue(cacheKey, envelopes, this.defaultCacheTtl);
      }
      return (envelopes as unknown as unknown[]) || [];
    }

    let collection: Table<ZodEnvelope, string> | Collection<ZodEnvelope, string> =
      this.db.envelopes;

    if (type && !includeArchived) {
      collection = this.db.envelopes.where("[type+archived]").equals([type, 0]);
    } else if (type) {
      collection = this.db.envelopes.where("type").equals(type);
    } else if (!includeArchived) {
      collection = this.db.envelopes.where("archived").equals(0);
    }

    return await collection.toArray();
  }

  private _filterEnvelopesByOptions(
    envelopes: ZodEnvelope[],
    options: GetEnvelopesOptions
  ): ZodEnvelope[] {
    let result = envelopes;
    if (options.isPaid !== undefined) {
      result = result.filter(
        (e) => (e as unknown as Record<string, boolean>).isPaid === options.isPaid
      );
    }
    if (options.isCompleted !== undefined) {
      result = result.filter(
        (e) => (e as unknown as Record<string, boolean>).isCompleted === options.isCompleted
      );
    }
    return result;
  }

  async saveEnvelopes(envelopes: ZodEnvelope[]): Promise<void> {
    const validated = this._validateInput(envelopes, EnvelopeSchema.array(), "envelopes");
    await this.db.bulkUpsertEnvelopes(validated);
    await this._invalidateEnvelopeCache();
  }

  // Convenience methods for specific envelope types
  // Convenience methods for specific envelope types
  async getBills(options: Omit<GetEnvelopesOptions, "type"> = {}): Promise<ZodEnvelope[]> {
    return this.getEnvelopes({ ...options, type: "bill" });
  }

  async getSavingsGoals(options: Omit<GetEnvelopesOptions, "type"> = {}): Promise<ZodEnvelope[]> {
    return this.getEnvelopes({ ...options, type: "goal" });
  }

  async saveBills(bills: ZodEnvelope[]): Promise<void> {
    const validated = this._validateInput(bills, EnvelopeSchema.array(), "bills");
    await this.db.bulkUpsertEnvelopes(validated);
    await this._invalidateEnvelopeCache();
  }

  async saveSavingsGoals(goals: ZodEnvelope[]): Promise<void> {
    const validated = this._validateInput(goals, EnvelopeSchema.array(), "savings goals");
    await this.db.bulkUpsertEnvelopes(validated).catch((err) => {
      logger.error("Failed to bulkUpsert savings goals", err);
      throw err;
    });
    await this._invalidateEnvelopeCache();
  }

  // Transaction operations with date range optimization
  async getTransactions(options: GetTransactionsOptions = {}): Promise<ZodTransaction[]> {
    const { dateRange, envelopeId, category, type, limit = 100, useCache = false } = options;
    try {
      let rawData: unknown[];
      if (envelopeId) {
        rawData = await this.db.getTransactionsByEnvelope(envelopeId, dateRange);
      } else if (category) {
        rawData = await this.db.getTransactionsByCategory(category, dateRange);
      } else if (type) {
        rawData = await this.db.getTransactionsByType(
          type as "income" | "expense" | "transfer",
          dateRange
        );
      } else if (dateRange) {
        const transactions = await this.db.getTransactionsByDateRange(
          dateRange.start,
          dateRange.end
        );
        rawData = limit ? transactions.slice(0, limit) : transactions;
      } else if (useCache) {
        const cacheKey = `${this.cachePrefix}recent_transactions_${limit}`;
        let transactions = await this.db.getCachedValue(cacheKey, 60000);
        if (!transactions) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30);
          transactions = await this.db.getTransactionsByDateRange(startDate, new Date());
          transactions = (transactions as unknown[]).slice(0, limit);
          await this.db.setCachedValue(cacheKey, transactions, 60000);
        }
        rawData = (transactions as unknown as unknown[]) || [];
      } else {
        // Default: Get all transactions ordered by date descending
        const transactions = await this.db.transactions
          .orderBy("date")
          .reverse()
          .limit(limit)
          .toArray();
        rawData = transactions;
      }
      return this._validateOutput(rawData, TransactionSchema.array(), "transactions");
    } catch (error) {
      logger.error("Failed to get transactions", error);
      throw error;
    }
  }

  async saveTransactions(transactions: ZodTransaction[]): Promise<void> {
    try {
      const validated = this._validateInput(
        transactions,
        TransactionSchema.array(),
        "transactions"
      );
      const normalized = validated.map((tx) => ({
        ...tx,
        date: new Date(tx.date),
      }));
      await this.db.bulkUpsertTransactions(normalized as ZodTransaction[]);
      await this._invalidateTransactionCache();
      logger.debug(`Saved ${transactions.length} transactions`);
    } catch (error) {
      logger.error("Failed to save transactions", error);
      throw error;
    }
  }

  // Budget metadata operations
  async getBudgetMetadata(): Promise<BudgetMetadata | null> {
    try {
      const metadata = await this.db.budget.get("metadata");
      return metadata ? (metadata as BudgetMetadata) : null;
    } catch (error) {
      logger.error("Failed to get budget metadata", error);
      throw error;
    }
  }

  async saveBudgetMetadata(metadata: Partial<BudgetMetadata>): Promise<void> {
    try {
      await this.db.budget.put({
        id: "metadata",
        lastModified: Date.now(),
        ...metadata,
      });
      logger.debug("Saved budget metadata");
    } catch (error) {
      logger.error("Failed to save budget metadata", error);
      throw error;
    }
  }

  // Encrypted data operations
  async getEncryptedBudgetData(): Promise<EncryptedBudgetData | null> {
    try {
      const data = await this.db.budget.get("budgetData");
      return data ? (data as EncryptedBudgetData) : null;
    } catch (error) {
      logger.error("Failed to get encrypted budget data", error);
      return null;
    }
  }

  async saveEncryptedBudgetData(data: Partial<EncryptedBudgetData>): Promise<void> {
    try {
      await this.db.budget.put({
        id: "budgetData",
        lastModified: Date.now(),
        version: data.version || 1,
        ...data,
      });
      logger.debug("Saved encrypted budget data");
    } catch (error) {
      logger.error("Failed to save encrypted budget data", error);
      throw error;
    }
  }

  // Analytics and reporting
  async getAnalyticsData(
    dateRange: DateRange,
    options: GetAnalyticsDataOptions = {}
  ): Promise<unknown> {
    const { includeTransfers = false, useCache = true } = options;
    try {
      const cacheKey = `${this.cachePrefix}analytics_${dateRange.start}_${dateRange.end}_${includeTransfers}`;
      if (useCache) {
        let data = await this.db.getCachedValue(cacheKey, this.defaultCacheTtl);
        if (data) return data;
      }
      const transactions = await this.db.getAnalyticsData(dateRange, includeTransfers);
      if (useCache) {
        await this.db.setCachedValue(cacheKey, transactions, this.defaultCacheTtl);
      }
      return transactions;
    } catch (error) {
      logger.error("Failed to get analytics data", error);
      throw error;
    }
  }

  // Batch operations
  async batchUpdate(updates: BatchUpdateItem[]): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.db.batchUpdate(updates as any);
      await this._invalidateAllCaches();
      logger.debug(`Completed batch update with ${updates.length} operations`);
    } catch (error) {
      logger.error("Failed to perform batch update", error);
      throw error;
    }
  }

  // Database maintenance
  async optimize(): Promise<void> {
    try {
      await this.db.optimizeDatabase();
      logger.info("Database optimization completed");
    } catch (error) {
      logger.error("Failed to optimize database", error);
      throw error;
    }
  }

  async clearData(): Promise<void> {
    try {
      await Promise.all([
        this.db.envelopes.clear(),
        this.db.transactions.clear(),
        this.db.budget.clear(),
        this.db.cache.clear(),
        this.db.auditLog.clear(),
        this.db.autoFundingRules.clear(),
        this.db.autoFundingHistory.clear(),
        this.db.offlineRequestQueue.clear(),
      ]);
      await this._invalidateAllCaches();
      logger.info("All budget data cleared");
    } catch (error) {
      logger.error("Failed to clear data", error);
      throw error;
    }
  }

  private async _invalidateEnvelopeCache(): Promise<void> {
    await this.db.clearCacheCategory("envelopes");
  }

  private async _invalidateTransactionCache(): Promise<void> {
    await this.db.clearCacheCategory("transactions");
  }

  private async _invalidateAllCaches(): Promise<void> {
    await this.db.cache.clear();
  }

  getStatus(): ServiceStatus {
    return {
      isInitialized: this.db.isOpen(),
      cachePrefix: this.cachePrefix,
      defaultCacheTtl: this.defaultCacheTtl,
    };
  }

  async cleanup(): Promise<void> {
    try {
      await this.db.close();
      logger.info("Budget database service cleaned up");
    } catch (error) {
      logger.error("Failed to cleanup database service", error);
    }
  }
}

// Export singleton instance
export const budgetDatabaseService = new BudgetDatabaseService();
