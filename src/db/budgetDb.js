import Dexie from "dexie";

export class VioletVaultDB extends Dexie {
  constructor() {
    super("VioletVault");

    // Enhanced schema with comprehensive indexes for optimal query performance
    this.version(4).stores({
      // Main budget data with timestamps for versioning
      budget: "id, lastModified, version",

      // Envelopes table with compound indexes for common queries
      envelopes: "id, name, category, archived, lastModified, [category+archived], [category+name]",

      // Transactions table with comprehensive indexing for analytics and filtering
      transactions:
        "id, date, amount, envelopeId, category, type, lastModified, [date+category], [date+envelopeId], [envelopeId+date], [category+date], [type+date]",

      // Bills table with indexes for due date and payment status queries
      bills:
        "id, name, dueDate, amount, category, isPaid, isRecurring, frequency, lastModified, [dueDate+isPaid], [category+isPaid], [isRecurring+frequency], [isPaid+dueDate]",

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

      // Budget History tables for version control
      budgetCommits:
        "hash, timestamp, message, author, parentHash, encryptedSnapshot, deviceFingerprint, [timestamp+author], [author+timestamp]",
      budgetChanges:
        "++id, commitHash, entityType, entityId, changeType, description, beforeData, afterData, [commitHash+entityType], [entityType+changeType]",
    });

    // Enhanced hooks for automatic timestamping across all tables
    const addTimestampHooks = (table) => {
      table.hook("creating", (primKey, obj, trans) => {
        // Handle frozen/sealed/readonly objects from Firebase by creating extensible copy
        try {
          obj.lastModified = Date.now();
          if (!obj.createdAt) obj.createdAt = Date.now();
        } catch (error) {
          if (
            error.message.includes("not extensible") ||
            error.message.includes("Cannot add property") ||
            error.message.includes("read only property") ||
            error.message.includes("Cannot assign to read only")
          ) {
            console.log("🔧 Handling readonly/frozen object from Firebase", {
              errorType: error.message,
              objectId: obj.id,
              objectKeys: Object.keys(obj),
            });

            // Create a completely new extensible object
            const extensibleObj = {};

            // Copy all properties from the readonly object
            Object.keys(obj).forEach((key) => {
              try {
                extensibleObj[key] = obj[key];
              } catch (copyError) {
                console.warn(`Failed to copy property ${key}:`, copyError.message);
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
                Object.keys(obj).forEach((key) => {
                  try {
                    delete obj[key];
                  } catch {
                    // Property can't be deleted, skip it
                  }
                });

                // Add all properties from extensible object
                Object.keys(extensibleObj).forEach((key) => {
                  try {
                    obj[key] = extensibleObj[key];
                  } catch (setError) {
                    console.warn(`Failed to set property ${key}:`, setError.message);
                  }
                });
              } catch (finalError) {
                console.warn("Complete object replacement failed:", finalError.message);
                // As a last resort, try to modify the transaction
                if (typeof trans.source === "object" && trans.source !== null) {
                  trans.source = extensibleObj;
                }
              }
            }
          } else {
            throw error; // Re-throw unexpected errors
          }
        }
      });

      // eslint-disable-next-line no-unused-vars
      table.hook("updating", (modifications, _primKey, _obj, _trans) => {
        modifications.lastModified = Date.now();
      });
    };

    // Apply hooks to all data tables
    addTimestampHooks(this.envelopes);
    addTimestampHooks(this.transactions);
    addTimestampHooks(this.bills);
    addTimestampHooks(this.savingsGoals);
    addTimestampHooks(this.paycheckHistory);
    addTimestampHooks(this.debts);

    // Budget history tables don't need lastModified since they're immutable
    // but we'll add timestamp on creation
    this.budgetCommits.hook("creating", (primKey, obj) => {
      if (!obj.timestamp) {
        obj.timestamp = Date.now();
      }
    });

    // Audit log hook
    // eslint-disable-next-line no-unused-vars
    this.auditLog.hook("creating", (_primKey, obj, _trans) => {
      if (!obj.timestamp) obj.timestamp = Date.now();
    });
  }

  // Enhanced bulk operations for all data types
  async bulkUpsertEnvelopes(envelopes) {
    return this.transaction("rw", this.envelopes, async () => {
      for (const envelope of envelopes) {
        await this.envelopes.put(envelope);
      }
    });
  }

  async bulkUpsertTransactions(transactions) {
    return this.transaction("rw", this.transactions, async () => {
      for (const transaction of transactions) {
        await this.transactions.put(transaction);
      }
    });
  }

  async bulkUpsertBills(bills) {
    return this.transaction("rw", this.bills, async () => {
      for (const bill of bills) {
        await this.bills.put(bill);
      }
    });
  }

  async bulkUpsertDebts(debts) {
    return this.transaction("rw", this.debts, async () => {
      for (const debt of debts) {
        await this.debts.put(debt);
      }
    });
  }

  // Enhanced cache management with categories
  async getCachedValue(key, maxAge = 300000) {
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
  async getEnvelopesByCategory(category, includeArchived = false) {
    const cacheKey = `envelopes_${category}_${includeArchived}`;
    let result = await this.getCachedValue(cacheKey);

    if (!result) {
      if (includeArchived) {
        result = await this.envelopes.where("category").equals(category).toArray();
      } else {
        result = await this.envelopes
          .where("[category+archived]")
          .equals([category, false])
          .toArray();
      }
      await this.setCachedValue(cacheKey, result, 60000); // 1 minute cache
    }

    return result;
  }

  async getActiveEnvelopes() {
    return this.envelopes.where("archived").equals(false).toArray();
  }

  // Transaction queries with compound indexes
  async getTransactionsByDateRange(startDate, endDate) {
    return this.transactions
      .where("date")
      .between(startDate, endDate, true, true)
      .reverse()
      .toArray();
  }

  async getTransactionsByEnvelope(envelopeId, dateRange = null) {
    if (dateRange) {
      return this.transactions
        .where("[envelopeId+date]")
        .between([envelopeId, dateRange.start], [envelopeId, dateRange.end], true, true)
        .reverse()
        .toArray();
    }
    return this.transactions.where("envelopeId").equals(envelopeId).reverse().toArray();
  }

  async getTransactionsByCategory(category, dateRange = null) {
    if (dateRange) {
      return this.transactions
        .where("[category+date]")
        .between([category, dateRange.start], [category, dateRange.end], true, true)
        .reverse()
        .toArray();
    }
    return this.transactions.where("category").equals(category).reverse().toArray();
  }

  async getTransactionsByType(type, dateRange = null) {
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
  async getUpcomingBills(daysAhead = 30) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.bills
      .where("[dueDate+isPaid]")
      .between([today, false], [futureDate, false], true, true)
      .toArray();
  }

  async getOverdueBills() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.bills
      .where("[isPaid+dueDate]")
      .between([false, new Date(0)], [false, today], true, false)
      .toArray();
  }

  async getPaidBills(dateRange = null) {
    if (dateRange) {
      return this.bills
        .where("[isPaid+dueDate]")
        .between([true, dateRange.start], [true, dateRange.end], true, true)
        .toArray();
    }
    return this.bills.where("isPaid").equals(true).toArray();
  }

  async getBillsByCategory(category) {
    return this.bills.where("category").equals(category).toArray();
  }

  async getRecurringBills() {
    return this.bills.where("isRecurring").equals(true).toArray();
  }

  // Savings Goals queries with status and priority optimization
  async getActiveSavingsGoals() {
    return this.savingsGoals.where("[isCompleted+isPaused]").equals([false, false]).toArray();
  }

  async getCompletedSavingsGoals() {
    return this.savingsGoals.where("isCompleted").equals(true).toArray();
  }

  async getSavingsGoalsByCategory(category) {
    return this.savingsGoals.where("category").equals(category).toArray();
  }

  async getSavingsGoalsByPriority(priority) {
    return this.savingsGoals.where("priority").equals(priority).toArray();
  }

  async getUpcomingDeadlines(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.savingsGoals
      .where("[targetDate+isCompleted]")
      .between([new Date(), false], [futureDate, false], true, true)
      .toArray();
  }

  // Paycheck History queries for trend analysis
  async getPaycheckHistory(limit = 50) {
    return this.paycheckHistory.orderBy("date").reverse().limit(limit).toArray();
  }

  async getPaychecksByDateRange(startDate, endDate) {
    return this.paycheckHistory.where("date").between(startDate, endDate, true, true).toArray();
  }

  async getPaychecksBySource(source) {
    return this.paycheckHistory.where("source").equals(source).toArray();
  }

  // Enhanced batch operations for all data types
  async batchUpdate(updates) {
    return this.transaction(
      "rw",
      [this.envelopes, this.transactions, this.bills, this.savingsGoals, this.paycheckHistory],
      async () => {
        const promises = updates.map((update) => {
          switch (update.type) {
            case "envelope":
              return this.envelopes.put(update.data);
            case "transaction":
              return this.transactions.put(update.data);
            case "bill":
              return this.bills.put(update.data);
            case "savingsGoal":
              return this.savingsGoals.put(update.data);
            case "paycheck":
              return this.paycheckHistory.put(update.data);
            default:
              return Promise.resolve();
          }
        });
        return Promise.all(promises);
      }
    );
  }

  // Bulk operations for initial data loading
  async bulkUpsertSavingsGoals(goals) {
    return this.transaction("rw", this.savingsGoals, async () => {
      for (const goal of goals) {
        await this.savingsGoals.put(goal);
      }
    });
  }

  async bulkUpsertPaychecks(paychecks) {
    return this.transaction("rw", this.paycheckHistory, async () => {
      for (const paycheck of paychecks) {
        await this.paycheckHistory.put(paycheck);
      }
    });
  }

  // Analytics helper queries
  async getAnalyticsData(dateRange, includeTransfers = false) {
    const transactions = await this.getTransactionsByDateRange(dateRange.start, dateRange.end);

    return includeTransfers ? transactions : transactions.filter((t) => t.type !== "transfer");
  }

  async getCategorySpending(category, dateRange) {
    return this.getTransactionsByCategory(category, dateRange);
  }

  async getEnvelopeTransactions(envelopeId, dateRange) {
    return this.getTransactionsByEnvelope(envelopeId, dateRange);
  }

  // Enhanced cache management with categories
  async cleanupCache(category = null) {
    const now = Date.now();
    if (category) {
      await this.cache.where("[category+expiresAt]").below([category, now]).delete();
    } else {
      await this.cache.where("expiresAt").below(now).delete();
    }
  }

  async setCachedValue(key, value, ttl = 300000, category = "general") {
    await this.cache.put({
      key,
      value,
      expiresAt: Date.now() + ttl,
      category,
    });
  }

  async clearCacheCategory(category) {
    await this.cache.where("category").equals(category).delete();
  }

  // Database maintenance and optimization
  async optimizeDatabase() {
    // Clean up expired cache entries
    await this.cleanupCache();

    // Clean up old audit log entries (keep last 1000)
    const auditCount = await this.auditLog.count();
    if (auditCount > 1000) {
      const oldEntries = await this.auditLog
        .orderBy("timestamp")
        .limit(auditCount - 1000)
        .toArray();
      const oldIds = oldEntries.map((entry) => entry.id);
      await this.auditLog.bulkDelete(oldIds);
    }
  }

  // Data integrity and statistics
  async getDatabaseStats() {
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

  // Budget History Methods
  async createBudgetCommit(commitData) {
    return this.budgetCommits.add({
      hash: commitData.hash,
      timestamp: commitData.timestamp || Date.now(),
      message: commitData.message,
      author: commitData.author,
      parentHash: commitData.parentHash,
      encryptedSnapshot: commitData.encryptedSnapshot,
      deviceFingerprint: commitData.deviceFingerprint,
    });
  }

  async getBudgetCommits(options = {}) {
    const { limit = 50, offset = 0, author, since } = options;
    let query = this.budgetCommits.orderBy("timestamp").reverse();

    if (author) {
      query = query.where("author").equals(author);
    }

    if (since) {
      query = query.where("timestamp").above(since);
    }

    return query.offset(offset).limit(limit).toArray();
  }

  async getBudgetCommit(hash) {
    return this.budgetCommits.where("hash").equals(hash).first();
  }

  async createBudgetChanges(changes) {
    return this.budgetChanges.bulkAdd(changes);
  }

  async getBudgetChanges(commitHash) {
    return this.budgetChanges.where("commitHash").equals(commitHash).toArray();
  }

  async getBudgetCommitCount() {
    return this.budgetCommits.count();
  }

  async clearBudgetHistory() {
    return this.transaction("rw", [this.budgetCommits, this.budgetChanges], async () => {
      await this.budgetCommits.clear();
      await this.budgetChanges.clear();
    });
  }
}

export const budgetDb = new VioletVaultDB();

// Utility functions
export const getEncryptedData = async () => {
  try {
    return await budgetDb.budget.get("budgetData");
  } catch {
    return null;
  }
};

export const setEncryptedData = async (data) => {
  try {
    await budgetDb.budget.put({
      id: "budgetData",
      lastModified: Date.now(),
      version: data.version || 1,
      ...data,
    });
  } catch (err) {
    console.error("Budget Dexie save error", err);
  }
};

// Budget metadata functions for unassigned cash and other summary data
export const getBudgetMetadata = async () => {
  try {
    return await budgetDb.budget.get("metadata");
  } catch {
    return null;
  }
};

export const setBudgetMetadata = async (metadata) => {
  try {
    await budgetDb.budget.put({
      id: "metadata",
      lastModified: Date.now(),
      ...metadata,
    });
  } catch (err) {
    console.error("Failed to save budget metadata:", err);
    throw err;
  }
};

export const clearData = async () => {
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
  ]);
};

// Migration helper for schema updates
export const migrateData = async () => {
  try {
    // Check if migration is needed by looking for new tables
    const stats = await budgetDb.getDatabaseStats();
    console.log("Database migration completed. Stats:", stats);
    return stats;
  } catch (error) {
    console.error("Database migration failed:", error);
    throw error;
  }
};

// Export enhanced query helpers
export const queryHelpers = {
  // Envelope helpers
  getActiveEnvelopes: () => budgetDb.getActiveEnvelopes(),
  getEnvelopesByCategory: (category, includeArchived) =>
    budgetDb.getEnvelopesByCategory(category, includeArchived),

  // Transaction helpers
  getRecentTransactions: (days = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return budgetDb.getTransactionsByDateRange(startDate, new Date());
  },

  // Bill helpers
  getUpcomingBills: (days) => budgetDb.getUpcomingBills(days),
  getOverdueBills: () => budgetDb.getOverdueBills(),

  // Savings goal helpers
  getActiveSavingsGoals: () => budgetDb.getActiveSavingsGoals(),
  getUpcomingDeadlines: (days) => budgetDb.getUpcomingDeadlines(days),

  // Analytics helpers
  getAnalyticsData: (dateRange, includeTransfers) =>
    budgetDb.getAnalyticsData(dateRange, includeTransfers),
};
