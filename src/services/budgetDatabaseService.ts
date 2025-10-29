// Budget Database Service - Centralized database operations with optimized queries
import { budgetDb } from "../db/budgetDb";
import logger from "../utils/common/logger";
import { type z } from "zod";
import { EnvelopeSchema, type Envelope as ZodEnvelope } from "@/domain/schemas/envelope";
import {
  TransactionSchema,
  type Transaction as ZodTransaction,
} from "@/domain/schemas/transaction";
import { BillSchema, type Bill as ZodBill } from "@/domain/schemas/bill";
import {
  SavingsGoalSchema,
  type SavingsGoal as ZodSavingsGoal,
} from "@/domain/schemas/savings-goal";
import {
  PaycheckHistorySchema,
  type PaycheckHistory as ZodPaycheckHistory,
} from "@/domain/schemas/paycheck-history";
import { DebtSchema, type Debt as ZodDebt } from "@/domain/schemas/debt";

interface DateRange {
  start: Date;
  end: Date;
}

interface GetEnvelopesOptions {
  category?: string;
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

interface GetBillsOptions {
  category?: string;
  isPaid?: boolean;
  daysAhead?: number;
  includeOverdue?: boolean;
}

interface GetSavingsGoalsOptions {
  category?: string;
  isCompleted?: boolean;
  priority?: string;
}

interface GetPaycheckHistoryOptions {
  limit?: number;
  dateRange?: DateRange;
  source?: string;
}

interface GetAnalyticsDataOptions {
  includeTransfers?: boolean;
  useCache?: boolean;
}

interface BatchUpdateItem {
  collection: string;
  type: "envelope" | "transaction" | "bill" | "savingsGoal" | "paycheck";
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
      logger.error(`Failed to validate ${entityName} from database`, result.error);
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
    const { category, includeArchived = false, useCache = true } = options;
    try {
      let rawData: unknown[];
      if (category) {
        rawData = await this.db.getEnvelopesByCategory(category, includeArchived);
      } else if (useCache) {
        const cacheKey = `${this.cachePrefix}envelopes_active`;
        let envelopes = await this.db.getCachedValue(cacheKey, this.defaultCacheTtl);
        if (!envelopes) {
          envelopes = await this.db.getActiveEnvelopes();
          await this.db.setCachedValue(cacheKey, envelopes, this.defaultCacheTtl);
        }
        rawData = (envelopes as unknown as unknown[]) || [];
      } else {
        rawData = await this.db.getActiveEnvelopes();
      }
      return this._validateOutput(rawData, EnvelopeSchema.array(), "envelopes");
    } catch (error) {
      logger.error("Failed to get envelopes", error);
      throw error;
    }
  }

  async saveEnvelopes(envelopes: ZodEnvelope[]): Promise<void> {
    try {
      const validated = this._validateInput(envelopes, EnvelopeSchema.array(), "envelope");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.db.bulkUpsertEnvelopes(validated as any);
      await this._invalidateEnvelopeCache();
      logger.debug(`Saved ${envelopes.length} envelopes`);
    } catch (error) {
      logger.error("Failed to save envelopes", error);
      throw error;
    }
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
        rawData = [];
      }
      return this._validateOutput(rawData, TransactionSchema.array(), "transactions");
    } catch (error) {
      logger.error("Failed to get transactions", error);
      throw error;
    }
  }

  async saveTransactions(transactions: ZodTransaction[]): Promise<void> {
    try {
      const validated = this._validateInput(transactions, TransactionSchema.array(), "transaction");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.db.bulkUpsertTransactions(validated as any);
      await this._invalidateTransactionCache();
      logger.debug(`Saved ${transactions.length} transactions`);
    } catch (error) {
      logger.error("Failed to save transactions", error);
      throw error;
    }
  }

  // Bill operations with due date optimization
  async getBills(options: GetBillsOptions = {}): Promise<ZodBill[]> {
    const { category, isPaid, daysAhead = 30, includeOverdue = true } = options;
    try {
      let rawData: unknown[];
      if (category) {
        rawData = await this.db.getBillsByCategory(category);
      } else if (isPaid === true) {
        rawData = await this.db.getPaidBills();
      } else if (isPaid === false) {
        const [upcoming, overdue] = await Promise.all([
          this.db.getUpcomingBills(daysAhead),
          includeOverdue ? this.db.getOverdueBills() : [],
        ]);
        rawData = [...overdue, ...upcoming];
      } else {
        rawData = await this.db.bills.toArray();
      }
      return this._validateOutput(rawData, BillSchema.array(), "bills");
    } catch (error) {
      logger.error("Failed to get bills", error);
      throw error;
    }
  }

  async saveBills(bills: ZodBill[]): Promise<void> {
    try {
      const validated = this._validateInput(bills, BillSchema.array(), "bill");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.db.bulkUpsertBills(validated as any);
      logger.debug(`Saved ${bills.length} bills`);
    } catch (error) {
      logger.error("Failed to save bills", error);
      throw error;
    }
  }

  // Savings Goals operations with status optimization
  async getSavingsGoals(options: GetSavingsGoalsOptions = {}): Promise<ZodSavingsGoal[]> {
    const { category, isCompleted, priority } = options;
    try {
      let rawData: unknown[];
      if (category) {
        rawData = await this.db.getSavingsGoalsByCategory(category);
      } else if (priority) {
        rawData = await this.db.getSavingsGoalsByPriority(priority as "low" | "medium" | "high");
      } else if (isCompleted === true) {
        rawData = await this.db.getCompletedSavingsGoals();
      } else if (isCompleted === false) {
        rawData = await this.db.getActiveSavingsGoals();
      } else {
        rawData = await this.db.savingsGoals.toArray();
      }
      return this._validateOutput(rawData, SavingsGoalSchema.array(), "savings goals");
    } catch (error) {
      logger.error("Failed to get savings goals", error);
      throw error;
    }
  }

  async saveSavingsGoals(goals: ZodSavingsGoal[]): Promise<void> {
    try {
      const validated = this._validateInput(goals, SavingsGoalSchema.array(), "savings goal");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.db.bulkUpsertSavingsGoals(validated as any);
      logger.debug(`Saved ${goals.length} savings goals`);
    } catch (error) {
      logger.error("Failed to save savings goals", error);
      throw error;
    }
  }

  // Paycheck operations
  async getPaycheckHistory(options: GetPaycheckHistoryOptions = {}): Promise<ZodPaycheckHistory[]> {
    const { limit = 50, dateRange, source } = options;
    try {
      let rawData: unknown[];
      if (source) {
        rawData = await this.db.getPaychecksBySource(source);
      } else if (dateRange) {
        rawData = await this.db.getPaychecksByDateRange(dateRange.start, dateRange.end);
      } else {
        rawData = await this.db.getPaycheckHistory(limit);
      }
      return this._validateOutput(rawData, PaycheckHistorySchema.array(), "paycheck history");
    } catch (error) {
      logger.error("Failed to get paycheck history", error);
      throw error;
    }
  }

  async savePaychecks(paychecks: ZodPaycheckHistory[]): Promise<void> {
    try {
      const validated = this._validateInput(paychecks, PaycheckHistorySchema.array(), "paycheck");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.db.bulkUpsertPaychecks(validated as any);
      logger.debug(`Saved ${paychecks.length} paychecks`);
    } catch (error) {
      logger.error("Failed to save paychecks", error);
      throw error;
    }
  }

  // Debt operations
  async getDebts(): Promise<ZodDebt[]> {
    try {
      const rawData = await this.db.debts.toArray();
      return this._validateOutput(rawData, DebtSchema.array(), "debts");
    } catch (error) {
      logger.error("Failed to get debts", error);
      throw error;
    }
  }

  async saveDebts(debts: ZodDebt[]): Promise<void> {
    try {
      const validated = this._validateInput(debts, DebtSchema.array(), "debt");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await this.db.bulkUpsertDebts(validated as any);
      logger.debug(`Saved ${debts.length} debts`);
    } catch (error) {
      logger.error("Failed to save debts", error);
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
      const tables = [
        this.db.budget,
        this.db.envelopes,
        this.db.transactions,
        this.db.bills,
        this.db.savingsGoals,
        this.db.paycheckHistory,
        this.db.debts,
        this.db.cache,
        this.db.auditLog,
      ];
      await this.db.transaction("rw", tables, async () => {
        await Promise.all(tables.map((t) => t.clear()));
      });
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
