// Budget Database Service - Centralized database operations with optimized queries
import { budgetDb } from "../db/budgetDb";
import logger from "../utils/common/logger";

/**
 * Budget Database Service
 * Provides centralized database operations with caching and optimized queries
 */
class BudgetDatabaseService {
  constructor() {
    this.db = budgetDb;
    this.cachePrefix = "budget_db_";
    this.defaultCacheTtl = 300000; // 5 minutes
  }

  /**
   * Initialize database service
   */
  async initialize() {
    try {
      await this.db.open();
      logger.info("Budget database service initialized");
      return true;
    } catch (error) {
      logger.error("Failed to initialize database service", error);
      throw error;
    }
  }

  /**
   * Get database statistics
   */
  async getStats() {
    try {
      return await this.db.getDatabaseStats();
    } catch (error) {
      logger.error("Failed to get database stats", error);
      throw error;
    }
  }

  /**
   * Envelope operations with optimized queries
   */
  async getEnvelopes(options = {}) {
    const { category, includeArchived = false, useCache = true } = options;

    try {
      if (category) {
        return await this.db.getEnvelopesByCategory(category, includeArchived);
      }

      if (useCache) {
        const cacheKey = `${this.cachePrefix}envelopes_active`;
        let envelopes = await this.db.getCachedValue(
          cacheKey,
          this.defaultCacheTtl,
        );

        if (!envelopes) {
          envelopes = await this.db.getActiveEnvelopes();
          await this.db.setCachedValue(
            cacheKey,
            envelopes,
            this.defaultCacheTtl,
          );
        }

        return envelopes;
      }

      return await this.db.getActiveEnvelopes();
    } catch (error) {
      logger.error("Failed to get envelopes", error);
      throw error;
    }
  }

  async saveEnvelopes(envelopes) {
    try {
      await this.db.bulkUpsertEnvelopes(envelopes);
      await this._invalidateEnvelopeCache();
      logger.debug(`Saved ${envelopes.length} envelopes`);
    } catch (error) {
      logger.error("Failed to save envelopes", error);
      throw error;
    }
  }

  /**
   * Transaction operations with date range optimization
   */
  async getTransactions(options = {}) {
    const {
      dateRange,
      envelopeId,
      category,
      type,
      limit = 100,
      useCache = false,
    } = options;

    try {
      if (envelopeId) {
        return await this.db.getTransactionsByEnvelope(envelopeId, dateRange);
      }

      if (category) {
        return await this.db.getTransactionsByCategory(category, dateRange);
      }

      if (type) {
        return await this.db.getTransactionsByType(type, dateRange);
      }

      if (dateRange) {
        const transactions = await this.db.getTransactionsByDateRange(
          dateRange.start,
          dateRange.end,
        );
        return limit ? transactions.slice(0, limit) : transactions;
      }

      // Recent transactions with cache
      if (useCache && !dateRange) {
        const cacheKey = `${this.cachePrefix}recent_transactions_${limit}`;
        let transactions = await this.db.getCachedValue(cacheKey, 60000); // 1 minute cache

        if (!transactions) {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 30); // Last 30 days
          transactions = await this.db.getTransactionsByDateRange(
            startDate,
            new Date(),
          );
          transactions = transactions.slice(0, limit);
          await this.db.setCachedValue(cacheKey, transactions, 60000);
        }

        return transactions;
      }

      return [];
    } catch (error) {
      logger.error("Failed to get transactions", error);
      throw error;
    }
  }

  async saveTransactions(transactions) {
    try {
      await this.db.bulkUpsertTransactions(transactions);
      await this._invalidateTransactionCache();
      logger.debug(`Saved ${transactions.length} transactions`);
    } catch (error) {
      logger.error("Failed to save transactions", error);
      throw error;
    }
  }

  /**
   * Bill operations with due date optimization
   */
  async getBills(options = {}) {
    const { category, isPaid, daysAhead = 30, includeOverdue = true } = options;

    try {
      if (category) {
        return await this.db.getBillsByCategory(category);
      }

      if (isPaid === true) {
        return await this.db.getPaidBills();
      }

      if (isPaid === false) {
        const [upcoming, overdue] = await Promise.all([
          this.db.getUpcomingBills(daysAhead),
          includeOverdue ? this.db.getOverdueBills() : [],
        ]);

        return [...overdue, ...upcoming];
      }

      // All bills
      return await this.db.bills.toArray();
    } catch (error) {
      logger.error("Failed to get bills", error);
      throw error;
    }
  }

  async saveBills(bills) {
    try {
      await this.db.bulkUpsertBills(bills);
      logger.debug(`Saved ${bills.length} bills`);
    } catch (error) {
      logger.error("Failed to save bills", error);
      throw error;
    }
  }

  /**
   * Savings Goals operations with status optimization
   */
  async getSavingsGoals(options = {}) {
    const { category, isCompleted, isPaused, priority } = options;

    try {
      if (category) {
        return await this.db.getSavingsGoalsByCategory(category);
      }

      if (priority) {
        return await this.db.getSavingsGoalsByPriority(priority);
      }

      if (isCompleted === true) {
        return await this.db.getCompletedSavingsGoals();
      }

      if (isCompleted === false) {
        return await this.db.getActiveSavingsGoals();
      }

      // All savings goals
      return await this.db.savingsGoals.toArray();
    } catch (error) {
      logger.error("Failed to get savings goals", error);
      throw error;
    }
  }

  async saveSavingsGoals(goals) {
    try {
      await this.db.bulkUpsertSavingsGoals(goals);
      logger.debug(`Saved ${goals.length} savings goals`);
    } catch (error) {
      logger.error("Failed to save savings goals", error);
      throw error;
    }
  }

  /**
   * Paycheck operations
   */
  async getPaycheckHistory(options = {}) {
    const { limit = 50, dateRange, source } = options;

    try {
      if (source) {
        return await this.db.getPaychecksBySource(source);
      }

      if (dateRange) {
        return await this.db.getPaychecksByDateRange(
          dateRange.start,
          dateRange.end,
        );
      }

      return await this.db.getPaycheckHistory(limit);
    } catch (error) {
      logger.error("Failed to get paycheck history", error);
      throw error;
    }
  }

  async savePaychecks(paychecks) {
    try {
      await this.db.bulkUpsertPaychecks(paychecks);
      logger.debug(`Saved ${paychecks.length} paychecks`);
    } catch (error) {
      logger.error("Failed to save paychecks", error);
      throw error;
    }
  }

  /**
   * Debt operations
   */
  async getDebts() {
    try {
      return await this.db.debts.toArray();
    } catch (error) {
      logger.error("Failed to get debts", error);
      throw error;
    }
  }

  async saveDebts(debts) {
    try {
      await this.db.bulkUpsertDebts(debts);
      logger.debug(`Saved ${debts.length} debts`);
    } catch (error) {
      logger.error("Failed to save debts", error);
      throw error;
    }
  }

  /**
   * Budget metadata operations
   */
  async getBudgetMetadata() {
    try {
      const metadata = await this.db.budget.get("metadata");
      return metadata || null;
    } catch (error) {
      logger.error("Failed to get budget metadata", error);
      throw error;
    }
  }

  async saveBudgetMetadata(metadata) {
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

  /**
   * Encrypted data operations
   */
  async getEncryptedBudgetData() {
    try {
      return await this.db.budget.get("budgetData");
    } catch (error) {
      logger.error("Failed to get encrypted budget data", error);
      return null;
    }
  }

  async saveEncryptedBudgetData(data) {
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

  /**
   * Analytics and reporting
   */
  async getAnalyticsData(dateRange, options = {}) {
    const { includeTransfers = false, useCache = true } = options;

    try {
      const cacheKey = `${this.cachePrefix}analytics_${dateRange.start}_${dateRange.end}_${includeTransfers}`;

      if (useCache) {
        let data = await this.db.getCachedValue(cacheKey, this.defaultCacheTtl);
        if (data) {
          return data;
        }
      }

      const transactions = await this.db.getAnalyticsData(
        dateRange,
        includeTransfers,
      );

      if (useCache) {
        await this.db.setCachedValue(
          cacheKey,
          transactions,
          this.defaultCacheTtl,
        );
      }

      return transactions;
    } catch (error) {
      logger.error("Failed to get analytics data", error);
      throw error;
    }
  }

  /**
   * Batch operations
   */
  async batchUpdate(updates) {
    try {
      await this.db.batchUpdate(updates);
      await this._invalidateAllCaches();
      logger.debug(`Completed batch update with ${updates.length} operations`);
    } catch (error) {
      logger.error("Failed to perform batch update", error);
      throw error;
    }
  }

  /**
   * Database maintenance
   */
  async optimize() {
    try {
      await this.db.optimizeDatabase();
      logger.info("Database optimization completed");
    } catch (error) {
      logger.error("Failed to optimize database", error);
      throw error;
    }
  }

  async clearData() {
    try {
      await this.db.transaction(
        "rw",
        [
          this.db.budget,
          this.db.envelopes,
          this.db.transactions,
          this.db.bills,
          this.db.savingsGoals,
          this.db.paycheckHistory,
          this.db.debts,
          this.db.cache,
          this.db.auditLog,
        ],
        async () => {
          await Promise.all([
            this.db.budget.clear(),
            this.db.envelopes.clear(),
            this.db.transactions.clear(),
            this.db.bills.clear(),
            this.db.savingsGoals.clear(),
            this.db.paycheckHistory.clear(),
            this.db.debts.clear(),
            this.db.cache.clear(),
            this.db.auditLog.clear(),
          ]);
        },
      );

      logger.info("All budget data cleared");
    } catch (error) {
      logger.error("Failed to clear data", error);
      throw error;
    }
  }

  /**
   * Cache management
   */
  async _invalidateEnvelopeCache() {
    await this.db.clearCacheCategory("envelopes");
  }

  async _invalidateTransactionCache() {
    await this.db.clearCacheCategory("transactions");
  }

  async _invalidateAllCaches() {
    await this.db.cache.clear();
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isInitialized: this.db.isOpen(),
      cachePrefix: this.cachePrefix,
      defaultCacheTtl: this.defaultCacheTtl,
    };
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      await this.db.close();
      logger.info("Budget database service cleaned up");
    } catch (error) {
      logger.error("Failed to cleanup database service", error);
    }
  }
}

// Export singleton instance
export default new BudgetDatabaseService();
