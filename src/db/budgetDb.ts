import { Dexie, Table } from "dexie";
import logger from "../utils/common/logger";
import type {
  BudgetRecord,
  Envelope,
  Transaction,
  Bill,
  SavingsGoal,
  PaycheckHistory,
  AuditLogEntry,
  CacheEntry,
  Debt,
  BudgetCommit,
  BudgetChange,
  BudgetBranch,
  BudgetTag,
  AutoBackup,
  DateRange,
  BulkUpdate,
  DatabaseStats,
} from "./types";

export class VioletVaultDB extends Dexie {
  // Typed table declarations
  budget!: Table<BudgetRecord, string>;
  envelopes!: Table<Envelope, string>;
  transactions!: Table<Transaction, string>;
  bills!: Table<Bill, string>;
  savingsGoals!: Table<SavingsGoal, string>;
  paycheckHistory!: Table<PaycheckHistory, string>;
  auditLog!: Table<AuditLogEntry, number>;
  cache!: Table<CacheEntry, string>;
  debts!: Table<Debt, string>;
  budgetCommits!: Table<BudgetCommit, string>;
  budgetChanges!: Table<BudgetChange, number>;
  budgetBranches!: Table<BudgetBranch, number>;
  budgetTags!: Table<BudgetTag, number>;
  autoBackups!: Table<AutoBackup, string>;

  constructor() {
    super("VioletVault");

    // Enhanced schema with comprehensive indexes for optimal query performance
    this.version(7).stores({
      // Main budget data with timestamps for versioning
      budget: "id, lastModified, version",

      // Envelopes table with compound indexes for common queries
      envelopes: "id, name, category, archived, lastModified, [category+archived], [category+name]",

      // Transactions table with comprehensive indexing for analytics and filtering
      transactions:
        "id, date, amount, envelopeId, category, type, lastModified, [date+category], [date+envelopeId], [envelopeId+date], [category+date], [type+date]",

      // Bills table with indexes for due date and payment status queries
      bills:
        "id, name, dueDate, amount, category, isPaid, isRecurring, frequency, envelopeId, lastModified, [dueDate+isPaid], [category+isPaid], [isRecurring+frequency], [isPaid+dueDate], [envelopeId]",

      // Savings Goals table for goal tracking and progress monitoring
      savingsGoals:
        "id, name, category, priority, targetAmount, currentAmount, targetDate, isPaused, isCompleted, lastModified, [category+isCompleted], [priority+targetDate], [targetDate+isCompleted], [isCompleted+isPaused]",

      // Paycheck History table for trend analysis and predictions
      paycheckHistory:
        "id, date, amount, source, allocations, lastModified, [date+amount], [source+date]",

      // Audit log for changes tracking
      auditLog:
        "++id, timestamp, action, entityType, entityId, [entityType+timestamp], [entityId+timestamp]",

      // Enhanced cache with TTL and category support
      cache: "key, value, expiresAt, category, [category+expiresAt]",

      // Debts table for debt tracking
      debts: "id, name, creditor, type, status, currentBalance, minimumPayment, lastModified",

      // Budget History Tracking tables
      budgetCommits:
        "hash, timestamp, message, author, parentHash, deviceFingerprint, [author+timestamp], [timestamp]",
      budgetChanges:
        "++id, commitHash, entityType, entityId, changeType, description, [entityType+commitHash], [commitHash]",
      budgetBranches:
        "++id, name, description, sourceCommitHash, headCommitHash, author, created, isActive, isMerged, [isActive], [name]",
      budgetTags:
        "++id, name, description, commitHash, tagType, author, created, [tagType+created], [commitHash]",

      // GitHub Issue #576: Automatic backup storage for sync safety
      autoBackups: "id, timestamp, type, syncType, [type+timestamp], [syncType+timestamp]",
    });

    // Enhanced hooks for automatic timestamping across all tables
    const addTimestampHooks = (table: Table<unknown, unknown>) => {
      table.hook("creating", (_primKey, obj, trans) => {
        // Handle frozen/sealed/readonly objects from Firebase by creating extensible copy
        try {
          (obj as { lastModified: number; createdAt?: number }).lastModified = Date.now();
          if (!(obj as { createdAt: number }).createdAt)
            (obj as { createdAt: number }).createdAt = Date.now();
        } catch (error: unknown) {
          if (
            error instanceof Error &&
            (error.message.includes("not extensible") ||
              error.message.includes("Cannot add property") ||
              error.message.includes("read only property") ||
              error.message.includes("Cannot assign to read only"))
          ) {
            logger.debug("🔧 Handling readonly/frozen object from Firebase", {
              errorType: error.message,
              objectId: (obj as { id: string }).id,
              objectKeys: Object.keys(obj as object),
            });

            // Create a completely new extensible object
            const extensibleObj: Record<string, unknown> = {};

            // Copy all properties from the readonly object
            Object.keys(obj as object).forEach((key) => {
              try {
                extensibleObj[key] = (obj as Record<string, unknown>)[key];
              } catch (copyError: unknown) {
                logger.warn(`Failed to copy property ${key}:`, {
                  error: (copyError as Error).message,
                });
              }
            });

            // Add timestamp properties
            extensibleObj.lastModified = Date.now();
            extensibleObj.createdAt = extensibleObj.createdAt || Date.now();

            // Try to replace the object properties
            try {
              Object.assign(obj, extensibleObj);
            } catch {
              // If Object.assign fails, clear the object and reassign
              try {
                // Clear existing properties (if possible)
                Object.keys(obj as object).forEach((key) => {
                  try {
                    delete (obj as Record<string, unknown>)[key];
                  } catch {
                    // Property can't be deleted, skip it
                  }
                });

                // Add all properties from extensible object
                Object.keys(extensibleObj).forEach((key) => {
                  try {
                    (obj as Record<string, unknown>)[key] = extensibleObj[key];
                  } catch (setError: unknown) {
                    logger.warn(`Failed to set property ${key}:`, {
                      error: (setError as Error).message,
                    });
                  }
                });
              } catch (finalError: unknown) {
                logger.warn("Complete object replacement failed:", {
                  error: (finalError as Error).message,
                });
                // As a last resort, try to modify the transaction
                // Note: trans.source is a Dexie internal property
                if (
                  typeof (trans as unknown as { source: unknown }).source === "object" &&
                  (trans as unknown as { source: unknown }).source !== null
                ) {
                  (trans as unknown as { source: unknown }).source = extensibleObj;
                }
              }
            }
          } else {
            throw error; // Re-throw unexpected errors
          }
        }
      });

      table.hook("updating", (modifications, _primKey, _obj, _trans) => {
        (
          modifications as Partial<
            Envelope | Transaction | Bill | SavingsGoal | PaycheckHistory | Debt
          >
        ).lastModified = Date.now();
      });
    };

    // Apply hooks to all data tables
    addTimestampHooks(this.envelopes);
    addTimestampHooks(this.transactions);
    addTimestampHooks(this.bills);
    addTimestampHooks(this.savingsGoals);
    addTimestampHooks(this.paycheckHistory);
    addTimestampHooks(this.debts);

    // Audit log hook
    this.auditLog.hook("creating", (_primKey, obj, _trans) => {
      if (!obj.timestamp) obj.timestamp = Date.now();
    });
  }

  // Enhanced bulk operations for all data types
  async bulkUpsertEnvelopes(envelopes: Envelope[]): Promise<void> {
    return this.transaction("rw", this.envelopes, async () => {
      for (const envelope of envelopes) {
        await this.envelopes.put(envelope);
      }
    });
  }

  async bulkUpsertTransactions(transactions: Transaction[]): Promise<void> {
    return this.transaction("rw", this.transactions, async () => {
      for (const transaction of transactions) {
        await this.transactions.put(transaction);
      }
    });
  }

  async bulkUpsertBills(bills: Bill[]): Promise<void> {
    return this.transaction("rw", this.bills, async () => {
      for (const bill of bills) {
        await this.bills.put(bill);
      }
    });
  }

  async bulkUpsertDebts(debts: Debt[]): Promise<void> {
    return this.transaction("rw", this.debts, async () => {
      for (const debt of debts) {
        await this.debts.put(debt);
      }
    });
  }

  // Enhanced cache management with categories
  async getCachedValue(key: string, maxAge: number = 300000): Promise<unknown> {
    // 5 minutes default
    const cached = await this.cache.get(key);
    const now = Date.now();
    if (cached && cached.expiresAt > now && now - (cached.expiresAt - maxAge) < maxAge) {
      return cached.value;
    }
    return null;
  }

  // Enhanced query optimizations with compound indexes

  // Envelope queries
  async getEnvelopesByCategory(
    category: string,
    includeArchived: boolean = false
  ): Promise<Envelope[]> {
    const cacheKey = `envelopes_${category}_${includeArchived}`;
    let result = (await this.getCachedValue(cacheKey)) as Envelope[];

    if (!result) {
      if (includeArchived) {
        result = await this.envelopes.where("category").equals(category).toArray();
      } else {
        result = await this.envelopes.where("[category+archived]").equals([category, 0]).toArray();
      }
      await this.setCachedValue(cacheKey, result, 60000); // 1 minute cache
    }

    return result;
  }

  async getActiveEnvelopes(): Promise<Envelope[]> {
    return this.envelopes.where("archived").equals(0).toArray();
  }

  // Transaction queries with compound indexes
  async getTransactionsByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    return this.transactions
      .where("date")
      .between(startDate, endDate, true, true)
      .reverse()
      .toArray();
  }

  async getTransactionsByEnvelope(
    envelopeId: string,
    dateRange?: DateRange
  ): Promise<Transaction[]> {
    if (dateRange) {
      return this.transactions
        .where("[envelopeId+date]")
        .between([envelopeId, dateRange.start], [envelopeId, dateRange.end], true, true)
        .reverse()
        .toArray();
    }
    return this.transactions.where("envelopeId").equals(envelopeId).reverse().toArray();
  }

  async getTransactionsByCategory(category: string, dateRange?: DateRange): Promise<Transaction[]> {
    if (dateRange) {
      return this.transactions
        .where("[category+date]")
        .between([category, dateRange.start], [category, dateRange.end], true, true)
        .reverse()
        .toArray();
    }
    return this.transactions.where("category").equals(category).reverse().toArray();
  }

  async getTransactionsByType(
    type: Transaction["type"],
    dateRange?: DateRange
  ): Promise<Transaction[]> {
    if (dateRange) {
      return this.transactions
        .where("[type+date]")
        .between([type, dateRange.start], [type, dateRange.end], true, true)
        .reverse()
        .toArray();
    }
    return this.transactions.where("type").equals(type).reverse().toArray();
  }

  // Bill queries with payment status and due date optimization
  async getUpcomingBills(daysAhead: number = 30): Promise<Bill[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.bills
      .where("[dueDate+isPaid]")
      .between([today, 0], [futureDate, 0], true, true)
      .toArray();
  }

  async getOverdueBills(): Promise<Bill[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.bills
      .where("[isPaid+dueDate]")
      .between([0, new Date(0)], [0, today], true, false)
      .toArray();
  }

  async getPaidBills(dateRange?: DateRange): Promise<Bill[]> {
    if (dateRange) {
      return this.bills
        .where("[isPaid+dueDate]")
        .between([1, dateRange.start], [1, dateRange.end], true, true)
        .toArray();
    }
    return this.bills.where("isPaid").equals(1).toArray();
  }

  async getBillsByCategory(category: string): Promise<Bill[]> {
    return this.bills.where("category").equals(category).toArray();
  }

  async getRecurringBills(): Promise<Bill[]> {
    return this.bills.where("isRecurring").equals(1).toArray();
  }

  // Savings Goals queries with status and priority optimization
  async getActiveSavingsGoals(): Promise<SavingsGoal[]> {
    return this.savingsGoals.where("[isCompleted+isPaused]").equals([0, 0]).toArray();
  }

  async getCompletedSavingsGoals(): Promise<SavingsGoal[]> {
    return this.savingsGoals.where("isCompleted").equals(1).toArray();
  }

  async getSavingsGoalsByCategory(category: string): Promise<SavingsGoal[]> {
    return this.savingsGoals.where("category").equals(category).toArray();
  }

  async getSavingsGoalsByPriority(priority: SavingsGoal["priority"]): Promise<SavingsGoal[]> {
    return this.savingsGoals.where("priority").equals(priority).toArray();
  }

  async getUpcomingDeadlines(daysAhead: number = 30): Promise<SavingsGoal[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.savingsGoals
      .where("[targetDate+isCompleted]")
      .between([new Date(), 0], [futureDate, 0], true, true)
      .toArray();
  }

  // Paycheck History queries for trend analysis
  async getPaycheckHistory(limit: number = 50): Promise<PaycheckHistory[]> {
    return this.paycheckHistory.orderBy("date").reverse().limit(limit).toArray();
  }

  async getPaychecksByDateRange(startDate: Date, endDate: Date): Promise<PaycheckHistory[]> {
    return this.paycheckHistory.where("date").between(startDate, endDate, true, true).toArray();
  }

  async getPaychecksBySource(source: string): Promise<PaycheckHistory[]> {
    return this.paycheckHistory.where("source").equals(source).toArray();
  }

  // Enhanced batch operations for all data types
  async batchUpdate(updates: BulkUpdate[]): Promise<unknown[]> {
    return this.transaction(
      "rw",
      [this.envelopes, this.transactions, this.bills, this.savingsGoals, this.paycheckHistory],
      async () => {
        const promises = updates.map((update) => {
          switch (update.type) {
            case "envelope":
              return this.envelopes.put(update.data as Envelope);
            case "transaction":
              return this.transactions.put(update.data as Transaction);
            case "bill":
              return this.bills.put(update.data as Bill);
            case "savingsGoal":
              return this.savingsGoals.put(update.data as SavingsGoal);
            case "paycheck":
              return this.paycheckHistory.put(update.data as PaycheckHistory);
            default:
              return Promise.resolve();
          }
        });
        return Promise.all(promises);
      }
    );
  }

  // Bulk operations for initial data loading
  async bulkUpsertSavingsGoals(goals: SavingsGoal[]): Promise<void> {
    return this.transaction("rw", this.savingsGoals, async () => {
      for (const goal of goals) {
        await this.savingsGoals.put(goal);
      }
    });
  }

  async bulkUpsertPaychecks(paychecks: PaycheckHistory[]): Promise<void> {
    return this.transaction("rw", this.paycheckHistory, async () => {
      for (const paycheck of paychecks) {
        await this.paycheckHistory.put(paycheck);
      }
    });
  }

  // Analytics helper queries
  async getAnalyticsData(
    dateRange: DateRange,
    includeTransfers: boolean = false
  ): Promise<Transaction[]> {
    const transactions = await this.getTransactionsByDateRange(dateRange.start, dateRange.end);

    return includeTransfers ? transactions : transactions.filter((t) => t.type !== "transfer");
  }

  async getCategorySpending(category: string, dateRange: DateRange): Promise<Transaction[]> {
    return this.getTransactionsByCategory(category, dateRange);
  }

  async getEnvelopeTransactions(envelopeId: string, dateRange: DateRange): Promise<Transaction[]> {
    return this.getTransactionsByEnvelope(envelopeId, dateRange);
  }

  // Enhanced cache management with categories
  async cleanupCache(category?: string): Promise<void> {
    const now = Date.now();
    if (category) {
      await this.cache.where("[category+expiresAt]").below([category, now]).delete();
    } else {
      await this.cache.where("expiresAt").below(now).delete();
    }
  }

  async setCachedValue(
    key: string,
    value: unknown,
    ttl: number = 300000,
    category: string = "general"
  ): Promise<void> {
    await this.cache.put({
      key,
      value,
      expiresAt: Date.now() + ttl,
      category,
    });
  }

  async clearCacheCategory(category: string): Promise<void> {
    await this.cache.where("category").equals(category).delete();
  }

  // Database maintenance and optimization
  async optimizeDatabase(): Promise<void> {
    // Clean up expired cache entries
    await this.cleanupCache();

    // Clean up old audit log entries (keep last 1000)
    const auditCount = await this.auditLog.count();
    if (auditCount > 1000) {
      const oldEntries = await this.auditLog
        .orderBy("timestamp")
        .limit(auditCount - 1000)
        .toArray();
      const oldIds = oldEntries.map((entry) => entry.id!);
      await this.auditLog.bulkDelete(oldIds);
    }
  }

  // Data integrity and statistics
  async getDatabaseStats(): Promise<DatabaseStats> {
    const [envelopeCount, transactionCount, billCount, goalCount, paycheckCount, cacheCount] =
      await Promise.all([
        this.envelopes.count(),
        this.transactions.count(),
        this.bills.count(),
        this.savingsGoals.count(),
        this.paycheckHistory.count(),
        this.cache.count(),
      ]);

    return {
      envelopes: envelopeCount,
      transactions: transactionCount,
      bills: billCount,
      savingsGoals: goalCount,
      paychecks: paycheckCount,
      cache: cacheCount,
      lastOptimized: Date.now(),
    };
  }

  // Budget History Tracking methods
  async createBudgetCommit(commit: BudgetCommit): Promise<string> {
    return this.budgetCommits.put(commit);
  }

  async createBudgetChanges(changes: BudgetChange[]): Promise<number> {
    return this.budgetChanges.bulkPut(changes) as Promise<number>;
  }

  async createBudgetBranch(branch: BudgetBranch): Promise<number> {
    return this.budgetBranches.put(branch);
  }

  async createBudgetTag(tag: BudgetTag): Promise<number> {
    return this.budgetTags.put(tag);
  }
}

export const budgetDb = new VioletVaultDB();

// Expose to window for debugging (development/staging only)
if (
  typeof window !== "undefined" &&
  (import.meta.env.MODE === "development" ||
    window.location.hostname.includes("f4tdaddy.com") ||
    window.location.hostname.includes("vercel.app"))
) {
  (window as { budgetDb?: VioletVaultDB }).budgetDb = budgetDb;
}

// Utility functions
export const getEncryptedData = async (): Promise<BudgetRecord | null> => {
  try {
    return await budgetDb.budget.get("budgetData");
  } catch {
    return null;
  }
};

export const setEncryptedData = async (
  data: Partial<BudgetRecord> & { version?: number }
): Promise<void> => {
  try {
    await budgetDb.budget.put({
      id: "budgetData",
      lastModified: Date.now(),
      version: data.version || 1,
      ...data,
    });
  } catch (err) {
    logger.error("Budget Dexie save error", err);
  }
};

// Budget metadata functions for unassigned cash and other summary data
export const getBudgetMetadata = async (): Promise<BudgetRecord | null> => {
  try {
    return await budgetDb.budget.get("metadata");
  } catch {
    return null;
  }
};

export const setBudgetMetadata = async (metadata: Partial<BudgetRecord>): Promise<void> => {
  try {
    await budgetDb.budget.put({
      id: "metadata",
      lastModified: Date.now(),
      ...metadata,
    });
  } catch (err) {
    logger.error("Failed to save budget metadata:", err);
    throw err;
  }
};

// Dedicated methods for unassigned cash and actual balance
export const setUnassignedCash = async (amount: number): Promise<void> => {
  const currentMetadata = (await getBudgetMetadata()) || {};
  await setBudgetMetadata({
    ...currentMetadata,
    unassignedCash: amount,
  });
};

export const setActualBalance = async (balance: number): Promise<void> => {
  const currentMetadata = (await getBudgetMetadata()) || {};
  await setBudgetMetadata({
    ...currentMetadata,
    actualBalance: balance,
  });
};

export const getUnassignedCash = async (): Promise<number> => {
  const metadata = await getBudgetMetadata();
  return (
    typeof (metadata as BudgetRecord)?.unassignedCash === "number"
      ? (metadata as BudgetRecord)?.unassignedCash
      : 0
  ) as number;
};

export const getActualBalance = async (): Promise<number> => {
  const metadata = await getBudgetMetadata();
  return (
    typeof (metadata as BudgetRecord)?.actualBalance === "number"
      ? (metadata as BudgetRecord)?.actualBalance
      : 0
  ) as number;
};

export const clearData = async (): Promise<void> => {
  await Promise.all([
    budgetDb.budget.clear(),
    budgetDb.envelopes.clear(),
    budgetDb.transactions.clear(),
    budgetDb.bills.clear(),
    budgetDb.debts.clear(),
    budgetDb.savingsGoals.clear(),
    budgetDb.paycheckHistory.clear(),
    budgetDb.auditLog.clear(),
    budgetDb.cache.clear(),
    budgetDb.budgetCommits.clear(),
    budgetDb.budgetChanges.clear(),
    budgetDb.budgetBranches.clear(),
    budgetDb.budgetTags.clear(),
  ]);
};

// Migration helper for schema updates
export const migrateData = async (): Promise<DatabaseStats> => {
  try {
    // Check if migration is needed by looking for new tables
    const stats = await budgetDb.getDatabaseStats();
    logger.info(
      "Database migration completed. Stats:",
      stats as unknown as Record<string, unknown>
    );
    return stats;
  } catch (error) {
    logger.error("Database migration failed:", error);
    throw error;
  }
};

// Export enhanced query helpers - use function expressions to avoid temporal dead zone
export const queryHelpers = {
  // Envelope helpers
  getActiveEnvelopes(): Promise<Envelope[]> {
    return budgetDb.getActiveEnvelopes();
  },
  getEnvelopesByCategory(category: string, includeArchived?: boolean): Promise<Envelope[]> {
    return budgetDb.getEnvelopesByCategory(category, includeArchived);
  },

  // Transaction helpers
  getRecentTransactions(days: number = 7): Promise<Transaction[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return budgetDb.getTransactionsByDateRange(startDate, new Date());
  },

  // Bill helpers
  getUpcomingBills(days?: number): Promise<Bill[]> {
    return budgetDb.getUpcomingBills(days);
  },
  getOverdueBills(): Promise<Bill[]> {
    return budgetDb.getOverdueBills();
  },

  // Savings goal helpers
  getActiveSavingsGoals(): Promise<SavingsGoal[]> {
    return budgetDb.getActiveSavingsGoals();
  },
  getUpcomingDeadlines(days?: number): Promise<SavingsGoal[]> {
    return budgetDb.getUpcomingDeadlines(days);
  },

  // Analytics helpers
  getAnalyticsData(dateRange: DateRange, includeTransfers?: boolean): Promise<Transaction[]> {
    return budgetDb.getAnalyticsData(dateRange, includeTransfers);
  },
};

// Re-export types for convenience
export type * from "./types";
