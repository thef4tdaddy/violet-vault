// src/services/activityLogger.js
import { budgetDb } from "../db/budgetDb.js";
import logger from "../utils/logger";

/**
 * Activity Logger Service - Level 1 Budget History Implementation
 *
 * Simple audit logging system that tracks user actions with timestamps.
 * Focuses on basic "who did what when" without complex change tracking.
 */

// Activity types for categorization
export const ACTIVITY_TYPES = {
  // Envelope activities
  ENVELOPE_CREATED: "envelope_created",
  ENVELOPE_UPDATED: "envelope_updated",
  ENVELOPE_DELETED: "envelope_deleted",
  ENVELOPE_FUNDED: "envelope_funded",

  // Transaction activities
  TRANSACTION_ADDED: "transaction_added",
  TRANSACTION_UPDATED: "transaction_updated",
  TRANSACTION_DELETED: "transaction_deleted",
  TRANSACTIONS_IMPORTED: "transactions_imported",

  // Bill activities
  BILL_CREATED: "bill_created",
  BILL_UPDATED: "bill_updated",
  BILL_DELETED: "bill_deleted",
  BILL_PAID: "bill_paid",

  // Paycheck activities
  PAYCHECK_PROCESSED: "paycheck_processed",
  PAYCHECK_DELETED: "paycheck_deleted",

  // Debt activities
  DEBT_CREATED: "debt_created",
  DEBT_UPDATED: "debt_updated",
  DEBT_DELETED: "debt_deleted",
  DEBT_PAYMENT_MADE: "debt_payment_made",

  // Savings activities
  SAVINGS_GOAL_CREATED: "savings_goal_created",
  SAVINGS_GOAL_UPDATED: "savings_goal_updated",
  SAVINGS_GOAL_DELETED: "savings_goal_deleted",
  SAVINGS_CONTRIBUTION_MADE: "savings_contribution_made",

  // System activities
  DATA_IMPORTED: "data_imported",
  DATA_EXPORTED: "data_exported",
  SYNC_COMPLETED: "sync_completed",
};

// Entity types for organization
export const ENTITY_TYPES = {
  ENVELOPE: "envelope",
  TRANSACTION: "transaction",
  BILL: "bill",
  PAYCHECK: "paycheck",
  DEBT: "debt",
  SAVINGS_GOAL: "savings_goal",
  SYSTEM: "system",
};

class ActivityLogger {
  constructor() {
    this.currentUser = null;
  }

  /**
   * Set the current user for activity attribution
   */
  setCurrentUser(user) {
    this.currentUser = user;
  }

  /**
   * Log a user activity
   * @param {string} action - Activity type from ACTIVITY_TYPES
   * @param {string} entityType - Entity type from ENTITY_TYPES
   * @param {string} entityId - ID of the affected entity
   * @param {Object} details - Additional activity details
   */
  async logActivity(action, entityType, entityId, details = {}) {
    try {
      const activity = {
        timestamp: Date.now(),
        action,
        entityType,
        entityId,
        userId: this.currentUser?.id || "anonymous",
        userName: this.currentUser?.userName || "Anonymous User",
        details: {
          ...details,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      };

      await budgetDb.auditLog.add(activity);

      logger.debug("Activity logged:", {
        action,
        entityType,
        entityId,
        user: activity.userName,
      });

      return activity;
    } catch (error) {
      logger.error("Failed to log activity:", error, {
        action,
        entityType,
        entityId,
      });
      // Don't throw - logging failure shouldn't break app functionality
      return null;
    }
  }

  /**
   * Helper methods for common activities
   */

  // Envelope activities
  async logEnvelopeCreated(envelope) {
    return this.logActivity(
      ACTIVITY_TYPES.ENVELOPE_CREATED,
      ENTITY_TYPES.ENVELOPE,
      envelope.id,
      {
        name: envelope.name,
        category: envelope.category,
        monthlyBudget: envelope.monthlyBudget,
      },
    );
  }

  async logEnvelopeUpdated(envelope, changes = {}) {
    return this.logActivity(
      ACTIVITY_TYPES.ENVELOPE_UPDATED,
      ENTITY_TYPES.ENVELOPE,
      envelope.id,
      {
        name: envelope.name,
        changes: Object.keys(changes),
        ...changes,
      },
    );
  }

  async logEnvelopeDeleted(envelope) {
    return this.logActivity(
      ACTIVITY_TYPES.ENVELOPE_DELETED,
      ENTITY_TYPES.ENVELOPE,
      envelope.id,
      {
        name: envelope.name,
        category: envelope.category,
      },
    );
  }

  async logEnvelopeFunded(envelopeId, amount, source = "manual") {
    return this.logActivity(
      ACTIVITY_TYPES.ENVELOPE_FUNDED,
      ENTITY_TYPES.ENVELOPE,
      envelopeId,
      {
        amount,
        source,
      },
    );
  }

  // Transaction activities
  async logTransactionAdded(transaction) {
    return this.logActivity(
      ACTIVITY_TYPES.TRANSACTION_ADDED,
      ENTITY_TYPES.TRANSACTION,
      transaction.id,
      {
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        envelopeId: transaction.envelopeId,
        date: transaction.date,
      },
    );
  }

  async logTransactionUpdated(transaction, changes = {}) {
    return this.logActivity(
      ACTIVITY_TYPES.TRANSACTION_UPDATED,
      ENTITY_TYPES.TRANSACTION,
      transaction.id,
      {
        description: transaction.description,
        amount: transaction.amount,
        changes: Object.keys(changes),
        ...changes,
      },
    );
  }

  async logTransactionDeleted(transaction) {
    return this.logActivity(
      ACTIVITY_TYPES.TRANSACTION_DELETED,
      ENTITY_TYPES.TRANSACTION,
      transaction.id,
      {
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
      },
    );
  }

  async logTransactionsImported(count, source = "file") {
    return this.logActivity(
      ACTIVITY_TYPES.TRANSACTIONS_IMPORTED,
      ENTITY_TYPES.SYSTEM,
      `import_${Date.now()}`,
      {
        count,
        source,
      },
    );
  }

  // Bill activities
  async logBillCreated(bill) {
    return this.logActivity(
      ACTIVITY_TYPES.BILL_CREATED,
      ENTITY_TYPES.BILL,
      bill.id,
      {
        name: bill.name,
        amount: bill.amount,
        category: bill.category,
        dueDate: bill.dueDate,
      },
    );
  }

  async logBillUpdated(bill, changes = {}) {
    return this.logActivity(
      ACTIVITY_TYPES.BILL_UPDATED,
      ENTITY_TYPES.BILL,
      bill.id,
      {
        name: bill.name,
        amount: bill.amount,
        changes: Object.keys(changes),
        ...changes,
      },
    );
  }

  async logBillPaid(bill, paymentAmount) {
    return this.logActivity(
      ACTIVITY_TYPES.BILL_PAID,
      ENTITY_TYPES.BILL,
      bill.id,
      {
        name: bill.name,
        amount: paymentAmount,
        dueDate: bill.dueDate,
        paidDate: new Date().toISOString(),
      },
    );
  }

  // Paycheck activities
  async logPaycheckProcessed(paycheck) {
    return this.logActivity(
      ACTIVITY_TYPES.PAYCHECK_PROCESSED,
      ENTITY_TYPES.PAYCHECK,
      paycheck.id || `paycheck_${Date.now()}`,
      {
        amount: paycheck.amount,
        payerName: paycheck.payerName,
        mode: paycheck.mode,
        date: paycheck.date,
      },
    );
  }

  async logPaycheckDeleted(paycheck) {
    return this.logActivity(
      ACTIVITY_TYPES.PAYCHECK_DELETED,
      ENTITY_TYPES.PAYCHECK,
      paycheck.id,
      {
        amount: paycheck.amount,
        payerName: paycheck.payerName,
        mode: paycheck.mode,
      },
    );
  }

  // Debt activities
  async logDebtCreated(debt) {
    return this.logActivity(
      ACTIVITY_TYPES.DEBT_CREATED,
      ENTITY_TYPES.DEBT,
      debt.id,
      {
        name: debt.name,
        creditor: debt.creditor,
        currentBalance: debt.currentBalance,
        minimumPayment: debt.minimumPayment,
      },
    );
  }

  async logDebtUpdated(debt, changes = {}) {
    return this.logActivity(
      ACTIVITY_TYPES.DEBT_UPDATED,
      ENTITY_TYPES.DEBT,
      debt.id,
      {
        name: debt.name,
        creditor: debt.creditor,
        changes: Object.keys(changes),
        ...changes,
      },
    );
  }

  // System activities
  async logSyncCompleted(syncType = "full", itemsChanged = 0) {
    return this.logActivity(
      ACTIVITY_TYPES.SYNC_COMPLETED,
      ENTITY_TYPES.SYSTEM,
      `sync_${Date.now()}`,
      {
        syncType,
        itemsChanged,
      },
    );
  }

  /**
   * Retrieve activity history
   */
  async getRecentActivity(limit = 50, entityType = null, entityId = null) {
    try {
      let query = budgetDb.auditLog.orderBy("timestamp").reverse().limit(limit);

      // Filter by entity type if provided
      if (entityType && entityId) {
        query = budgetDb.auditLog
          .where("[entityType+entityId]")
          .equals([entityType, entityId])
          .reverse()
          .limit(limit);
      } else if (entityType) {
        query = budgetDb.auditLog
          .where("entityType")
          .equals(entityType)
          .reverse()
          .limit(limit);
      }

      const activities = await query.toArray();
      return activities;
    } catch (error) {
      logger.error("Failed to retrieve activity history:", error);
      return [];
    }
  }

  /**
   * Get activity count for entity
   */
  async getActivityCount(entityType = null, entityId = null) {
    try {
      if (entityType && entityId) {
        return await budgetDb.auditLog
          .where("[entityType+entityId]")
          .equals([entityType, entityId])
          .count();
      } else if (entityType) {
        return await budgetDb.auditLog
          .where("entityType")
          .equals(entityType)
          .count();
      } else {
        return await budgetDb.auditLog.count();
      }
    } catch (error) {
      logger.error("Failed to get activity count:", error);
      return 0;
    }
  }

  /**
   * Clear old activities (cleanup)
   */
  async clearOldActivities(daysToKeep = 90) {
    try {
      const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
      const deletedCount = await budgetDb.auditLog
        .where("timestamp")
        .below(cutoffTime)
        .delete();

      logger.info(
        `Cleared ${deletedCount} old activities older than ${daysToKeep} days`,
      );
      return deletedCount;
    } catch (error) {
      logger.error("Failed to clear old activities:", error);
      return 0;
    }
  }
}

// Create singleton instance
const activityLogger = new ActivityLogger();

export default activityLogger;
