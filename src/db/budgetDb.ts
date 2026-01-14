import { Dexie, Table } from "dexie";
import logger from "../utils/common/logger";
import {
  BudgetRecord,
  Envelope,
  Transaction,
  AuditLogEntry,
  CacheEntry,
  BudgetCommit,
  BudgetChange,
  BudgetBranch,
  BudgetTag,
  AutoBackup,
  DateRange,
  BulkUpdate,
  DatabaseStats,
  OfflineRequestQueueEntry,
  AutoFundingRule,
  ExecutionRecord,
} from "./types";
import {
  EnvelopeSchema,
  EnvelopePartialSchema,
  TransactionSchema,
  TransactionPartialSchema,
  AutoFundingRuleSchema,
  AutoFundingRulePartialSchema,
  ExecutionRecordSchema,
  ExecutionRecordPartialSchema,
} from "@/domain/schemas";
import { validateWithSchema, validateArrayWithSchema } from "./validation";

export class VioletVaultDB extends Dexie {
  // Typed table declarations
  budget!: Table<BudgetRecord, string>;
  envelopes!: Table<Envelope, string>;
  transactions!: Table<Transaction, string>;
  auditLog!: Table<AuditLogEntry, number>;
  cache!: Table<CacheEntry, string>;
  budgetCommits!: Table<BudgetCommit, string>;
  budgetChanges!: Table<BudgetChange, number>;
  budgetBranches!: Table<BudgetBranch, number>;
  budgetTags!: Table<BudgetTag, number>;
  autoBackups!: Table<AutoBackup, string>;
  offlineRequestQueue!: Table<OfflineRequestQueueEntry, number>;
  autoFundingRules!: Table<AutoFundingRule, string>;
  autoFundingHistory!: Table<ExecutionRecord, string>;

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

    // Version 8: Issue #1335 - Add envelopeType index for savings/supplemental envelope migration
    // savingsGoals table is now deprecated - data should be migrated to envelopes with envelopeType: "savings"
    this.version(8).stores({
      // Add envelopeType index to envelopes table for filtering by type
      envelopes:
        "id, name, category, archived, lastModified, envelopeType, [category+archived], [category+name], [envelopeType+archived]",
    });

    // Version 9: Issue #1340 - Add paycheckId and isInternalTransfer indexes for paycheck transaction tracking
    this.version(9).stores({
      // Add paycheckId and isInternalTransfer indexes to transactions table for paycheck queries
      transactions:
        "id, date, amount, envelopeId, category, type, lastModified, paycheckId, isInternalTransfer, [date+category], [date+envelopeId], [envelopeId+date], [category+date], [type+date], [paycheckId], [isInternalTransfer]",
    });

    // Version 10: Combined Offline Request Queue & Auto-Funding Hooks
    this.version(10).stores({
      offlineRequestQueue:
        "++id, requestId, timestamp, priority, status, nextRetryAt, entityType, entityId, [status+priority], [status+nextRetryAt], [entityType+entityId]",
      autoFundingRules: "id, name, type, trigger, priority, enabled, lastModified",
      autoFundingHistory: "id, trigger, executedAt, [trigger+executedAt]",
    });

    // Version 11: Data Unification - Unified Envelopes & Transactions
    // v2.0 Baseline Schema - Fresh Start
    // No migration from previous versions - users start with clean slate
    // Dropping legacy tables: bills, debts, savingsGoals, paycheckHistory
    this.version(11).stores({
      envelopes:
        "id, name, category, archived, lastModified, type, [category+archived], [category+name], [type+archived]",
      transactions:
        "id, date, amount, envelopeId, category, type, lastModified, paycheckId, isInternalTransfer, isScheduled, [date+category], [date+envelopeId], [envelopeId+date], [category+date], [type+date], [paycheckId], [isInternalTransfer], [isScheduled+date]",
      // Dropping legacy tables
      bills: null,
      debts: null,
      savingsGoals: null,
      paycheckHistory: null,
    });

    // Enhanced hooks for automatic timestamping across all tables

    const addTimestampHooks = <T, TKey>(table: Table<T, TKey>) => {
      table.hook("creating", function (_primKey, obj, trans) {
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
              Object.assign(obj as object, extensibleObj);
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
                // IMPORTANT: Last resort fallback for frozen Firebase objects
                // This modifies Dexie's internal transaction.source as a final attempt
                // to handle frozen objects from Firebase. This is needed because
                // Firebase returns frozen objects that cannot be modified normally.
                // If Dexie API changes, this fallback may need to be updated.
                const transWithSource = trans as unknown as { source: unknown };
                if (typeof transWithSource.source === "object" && transWithSource.source !== null) {
                  transWithSource.source = extensibleObj;
                }
              }
            }
          } else {
            throw error; // Re-throw unexpected errors
          }
        }
      });

      table.hook("updating", function (modifications) {
        (modifications as Partial<Envelope | Transaction>).lastModified = Date.now();
      });
    };

    // Apply hooks to all data tables
    addTimestampHooks(this.envelopes);
    addTimestampHooks(this.transactions);
    addTimestampHooks(this.autoFundingRules);
    addTimestampHooks(this.autoFundingHistory);

    // Audit log hook
    this.auditLog.hook("creating", (_primKey: number, obj: AuditLogEntry, _trans: unknown) => {
      if (!obj.timestamp) obj.timestamp = Date.now();
    });
  }

  // ==================== VALIDATION METHODS ====================
  // All database writes should go through these validated methods
  // to ensure data integrity with Zod validation

  /**
   * Add envelope with Zod validation
   * @param envelope - Envelope data to add
   * @returns Promise with the envelope ID
   * @throws Error if validation fails
   */
  async addEnvelope(envelope: unknown): Promise<string> {
    const validated = validateWithSchema(EnvelopeSchema, envelope, "Envelope");
    return this.envelopes.add(validated);
  }

  /**
   * Update envelope with Zod validation
   * @param id - Envelope ID to update
   * @param updates - Partial envelope data
   * @returns Promise with number of updated records
   * @throws Error if validation fails
   */
  async updateEnvelope(id: string, updates: unknown): Promise<number> {
    const validated = validateWithSchema(EnvelopePartialSchema, updates, "Envelope");
    return this.envelopes.update(id, validated);
  }

  /**
   * Put envelope with Zod validation (upsert)
   * @param envelope - Envelope data to put
   * @returns Promise with the envelope ID
   * @throws Error if validation fails
   */
  async putEnvelope(envelope: unknown): Promise<string> {
    const validated = validateWithSchema(EnvelopeSchema, envelope, "Envelope");
    return this.envelopes.put(validated);
  }

  /**
   * Bulk upsert envelopes with Zod validation
   * @param envelopes - Array of envelope data
   * @returns Promise that resolves when complete
   * @throws Error if any validation fails
   */
  async bulkUpsertEnvelopesValidated(envelopes: unknown[]): Promise<void> {
    const validated = validateArrayWithSchema(EnvelopeSchema, envelopes, "Envelope");
    return this.bulkUpsertEnvelopes(validated);
  }

  /**
   * Add transaction with Zod validation
   * @param transaction - Transaction data to add
   * @returns Promise with the transaction ID
   * @throws Error if validation fails
   */
  async addTransaction(transaction: unknown): Promise<string> {
    const validated = validateWithSchema(TransactionSchema, transaction, "Transaction");
    return this.transactions.add(validated);
  }

  /**
   * Update transaction with Zod validation
   * @param id - Transaction ID to update
   * @param updates - Partial transaction data
   * @returns Promise with number of updated records
   * @throws Error if validation fails
   */
  async updateTransaction(id: string, updates: unknown): Promise<number> {
    const validated = validateWithSchema(TransactionPartialSchema, updates, "Transaction");
    return this.transactions.update(id, validated);
  }

  /**
   * Put transaction with Zod validation (upsert)
   * @param transaction - Transaction data to put
   * @returns Promise with the transaction ID
   * @throws Error if validation fails
   */
  async putTransaction(transaction: unknown): Promise<string> {
    const validated = validateWithSchema(TransactionSchema, transaction, "Transaction");
    return this.transactions.put(validated);
  }

  /**
   * Bulk upsert transactions with Zod validation
   * @param transactions - Array of transaction data
   * @returns Promise that resolves when complete
   * @throws Error if any validation fails
   */
  async bulkUpsertTransactionsValidated(transactions: unknown[]): Promise<void> {
    const validated = validateArrayWithSchema(TransactionSchema, transactions, "Transaction");
    return this.bulkUpsertTransactions(validated);
  }

  /**
   * Add auto-funding rule with Zod validation
   * @param rule - Auto-funding rule data to add
   * @returns Promise with the rule ID
   * @throws Error if validation fails
   */
  async addAutoFundingRule(rule: unknown): Promise<string> {
    const validated = validateWithSchema(AutoFundingRuleSchema, rule, "AutoFundingRule");
    return this.autoFundingRules.add(validated);
  }

  /**
   * Update auto-funding rule with Zod validation
   * @param id - Rule ID to update
   * @param updates - Partial rule data
   * @returns Promise with number of updated records
   * @throws Error if validation fails
   */
  async updateAutoFundingRule(id: string, updates: unknown): Promise<number> {
    const validated = validateWithSchema(AutoFundingRulePartialSchema, updates, "AutoFundingRule");
    return this.autoFundingRules.update(id, validated);
  }

  /**
   * Put auto-funding rule with Zod validation (upsert)
   * @param rule - Auto-funding rule data to put
   * @returns Promise with the rule ID
   * @throws Error if validation fails
   */
  async putAutoFundingRule(rule: unknown): Promise<string> {
    const validated = validateWithSchema(AutoFundingRuleSchema, rule, "AutoFundingRule");
    return this.autoFundingRules.put(validated);
  }

  /**
   * Bulk upsert auto-funding rules with Zod validation
   * @param rules - Array of auto-funding rule data
   * @returns Promise that resolves when complete
   * @throws Error if any validation fails
   */
  async bulkUpsertAutoFundingRulesValidated(rules: unknown[]): Promise<void> {
    const validated = validateArrayWithSchema(AutoFundingRuleSchema, rules, "AutoFundingRule");
    return this.bulkUpsertAutoFundingRules(validated);
  }

  /**
   * Add execution record with Zod validation
   * @param record - Execution record data to add
   * @returns Promise with the record ID
   * @throws Error if validation fails
   */
  async addExecutionRecord(record: unknown): Promise<string> {
    const validated = validateWithSchema(ExecutionRecordSchema, record, "ExecutionRecord");
    return this.autoFundingHistory.add(validated);
  }

  /**
   * Update execution record with Zod validation
   * @param id - Record ID to update
   * @param updates - Partial record data
   * @returns Promise with number of updated records
   * @throws Error if validation fails
   */
  async updateExecutionRecord(id: string, updates: unknown): Promise<number> {
    const validated = validateWithSchema(ExecutionRecordPartialSchema, updates, "ExecutionRecord");
    return this.autoFundingHistory.update(id, validated);
  }

  /**
   * Put execution record with Zod validation (upsert)
   * @param record - Execution record data to put
   * @returns Promise with the record ID
   * @throws Error if validation fails
   */
  async putExecutionRecord(record: unknown): Promise<string> {
    const validated = validateWithSchema(ExecutionRecordSchema, record, "ExecutionRecord");
    return this.autoFundingHistory.put(validated);
  }

  // ==================== END VALIDATION METHODS ====================

  // Enhanced bulk operations for all data types
  async bulkUpsertEnvelopes(envelopes: Envelope[]): Promise<void> {
    await this.envelopes.bulkPut(envelopes);
  }

  async bulkUpsertTransactions(transactions: Transaction[]): Promise<void> {
    await this.transactions.bulkPut(transactions);
  }

  // Enhanced cache management with categories
  async getCachedValue(key: string, maxAge: number = 300000): Promise<unknown> {
    // 5 minutes default
    const cached = await this.cache.get(key);
    const now = Date.now();
    if (
      cached &&
      cached.expiresAt !== null &&
      cached.expiresAt > now &&
      now - (cached.expiresAt - maxAge) < maxAge
    ) {
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
        result = await this.envelopes
          .filter((e) => e.category === category && e.archived === false)
          .toArray();
      }
      await this.setCachedValue(cacheKey, result, 60000); // 1 minute cache
    }

    return result;
  }

  async getActiveEnvelopes(): Promise<Envelope[]> {
    return this.envelopes.filter((e) => e.archived === false).toArray();
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

  // Paycheck History queries (derived from Transactions)
  async getPaycheckHistory(limit: number = 50): Promise<Transaction[]> {
    return await this.transactions
      .filter((t) => t.type === "income" && !!t.allocations)
      .reverse()
      .limit(limit)
      .toArray();
  }

  async batchUpdate(updates: BulkUpdate[]): Promise<unknown[]> {
    return this.transaction("rw", [this.envelopes, this.transactions], async () => {
      const promises = updates.map((update) => {
        switch (update.type) {
          case "envelope":
            return this.envelopes.put(update.data as Envelope);
          case "transaction":
            return this.transactions.put(update.data as Transaction);
          case "autoFundingRule":
            return this.autoFundingRules.put(update.data as AutoFundingRule);
          default:
            return Promise.resolve();
        }
      });
      return Promise.all(promises);
    });
  }

  async bulkUpsertAutoFundingRules(rules: AutoFundingRule[]): Promise<void> {
    await this.autoFundingRules.bulkPut(rules);
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
    const [
      envelopeCount,
      transactionCount,
      cacheCount,
      offlineQueueCount,
      autoFundingRuleCount,
      autoFundingHistoryCount,
    ] = await Promise.all([
      this.envelopes.count(),
      this.transactions.count(),
      this.cache.count(),
      this.offlineRequestQueue.count(),
      this.autoFundingRules.count(),
      this.autoFundingHistory.count(),
    ]);

    return {
      envelopes: envelopeCount,
      transactions: transactionCount,
      cache: cacheCount,
      offlineQueue: offlineQueueCount,
      autoFundingRules: autoFundingRuleCount,
      autoFundingHistory: autoFundingHistoryCount,
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
    window.location.hostname.includes("staging.violetvault.app") ||
    window.location.hostname.includes("violetvault.app") ||
    window.location.hostname.includes("vercel.app"))
) {
  (window as { budgetDb?: VioletVaultDB }).budgetDb = budgetDb;
}

// Utility functions
export const getEncryptedData = async (): Promise<BudgetRecord | null> => {
  try {
    const result = await budgetDb.budget.get("budgetData");
    return result ?? null;
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
    const result = await budgetDb.budget.get("metadata");
    return result ?? null;
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
    budgetDb.auditLog.clear(),
    budgetDb.cache.clear(),
    budgetDb.budgetCommits.clear(),
    budgetDb.budgetChanges.clear(),
    budgetDb.budgetBranches.clear(),
    budgetDb.budgetTags.clear(),
    budgetDb.offlineRequestQueue.clear(),
    budgetDb.autoFundingRules.clear(),
    budgetDb.autoFundingHistory.clear(),
  ]);
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

  // Analytics helpers
  getAnalyticsData(dateRange: DateRange, includeTransfers?: boolean): Promise<Transaction[]> {
    return budgetDb.getAnalyticsData(dateRange, includeTransfers);
  },
};

// Re-export types for convenience
export type * from "./types";
