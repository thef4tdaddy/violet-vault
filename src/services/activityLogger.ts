// src/services/activityLogger.ts
import { budgetDb } from "../db/budgetDb.js";
import logger from "../utils/common/logger";
import type {
  AuditLogEntry,
  Envelope,
  Transaction,
  Bill,
  PaycheckHistory,
  Debt,
} from "../db/types";

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
} as const;

// Entity types for organization
export const ENTITY_TYPES = {
  ENVELOPE: "envelope",
  TRANSACTION: "transaction",
  BILL: "bill",
  PAYCHECK: "paycheck",
  DEBT: "debt",
  SAVINGS_GOAL: "savings_goal",
  SYSTEM: "system",
} as const;

/**
 * User info for activity attribution
 */
interface ActivityUser {
  id: string;
  userName: string;
  userColor?: string;
}

/**
 * Activity details for logging
 */
interface ActivityDetails {
  [key: string]: unknown;
}

class ActivityLogger {
  private currentUser: ActivityUser | null;

  constructor() {
    this.currentUser = null;
  }

  /**
   * Set the current user for activity attribution
   */
  setCurrentUser(user: ActivityUser | null): void {
    this.currentUser = user;
  }

  /**
   * Get current user with fallback to localStorage
   */
  getCurrentUser(): ActivityUser | null {
    // If we have a current user set, use it
    if (this.currentUser) {
      return this.currentUser;
    }

    // Fallback: try to get from localStorage profile
    try {
      const profileData = localStorage.getItem("userProfile");
      if (profileData) {
        const parsedProfile = JSON.parse(profileData) as ActivityUser & { id?: string };
        if (parsedProfile.userName) {
          return {
            id: parsedProfile.id || "local-user",
            userName: parsedProfile.userName,
            userColor: parsedProfile.userColor,
          };
        }
      }
    } catch (error) {
      logger.warn("Failed to get user profile from localStorage:", {
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return null;
  }

  /**
   * Log a user activity
   */
  async logActivity(
    action: string,
    entityType: string,
    entityId: string,
    details: ActivityDetails = {}
  ): Promise<AuditLogEntry | null> {
    try {
      const activity = {
        timestamp: Date.now(),
        action,
        entityType,
        entityId,
        userId: this.getCurrentUser()?.id || "anonymous",
        userName: this.getCurrentUser()?.userName || "Anonymous User",
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
  async logEnvelopeCreated(envelope: Envelope): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.ENVELOPE_CREATED, ENTITY_TYPES.ENVELOPE, envelope.id, {
      name: envelope.name,
      category: envelope.category,
      monthlyBudget: (envelope as Envelope & { monthlyBudget?: number }).monthlyBudget,
    });
  }

  async logEnvelopeUpdated(
    envelope: Envelope,
    changes: Record<string, unknown> = {}
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.ENVELOPE_UPDATED, ENTITY_TYPES.ENVELOPE, envelope.id, {
      name: envelope.name,
      changes: Object.keys(changes),
      ...changes,
    });
  }

  async logEnvelopeDeleted(envelope: Envelope): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.ENVELOPE_DELETED, ENTITY_TYPES.ENVELOPE, envelope.id, {
      name: envelope.name,
      category: envelope.category,
    });
  }

  async logEnvelopeFunded(
    envelopeId: string,
    amount: number,
    source: string = "manual"
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.ENVELOPE_FUNDED, ENTITY_TYPES.ENVELOPE, envelopeId, {
      amount,
      source,
    });
  }

  // Transaction activities
  async logTransactionAdded(transaction: Transaction): Promise<AuditLogEntry | null> {
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
      }
    );
  }

  async logTransactionUpdated(
    transaction: Transaction,
    changes: Record<string, unknown> = {}
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(
      ACTIVITY_TYPES.TRANSACTION_UPDATED,
      ENTITY_TYPES.TRANSACTION,
      transaction.id,
      {
        description: transaction.description,
        amount: transaction.amount,
        changes: Object.keys(changes),
        ...changes,
      }
    );
  }

  async logTransactionDeleted(transaction: Transaction): Promise<AuditLogEntry | null> {
    return this.logActivity(
      ACTIVITY_TYPES.TRANSACTION_DELETED,
      ENTITY_TYPES.TRANSACTION,
      transaction.id,
      {
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
      }
    );
  }

  async logTransactionsImported(
    count: number,
    source: string = "file"
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(
      ACTIVITY_TYPES.TRANSACTIONS_IMPORTED,
      ENTITY_TYPES.SYSTEM,
      `import_${Date.now()}`,
      {
        count,
        source,
      }
    );
  }

  // Bill activities
  async logBillCreated(bill: Bill): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.BILL_CREATED, ENTITY_TYPES.BILL, bill.id, {
      name: bill.name,
      amount: bill.amount,
      category: bill.category,
      dueDate: bill.dueDate,
    });
  }

  async logBillUpdated(
    bill: Bill,
    changes: Record<string, unknown> = {}
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.BILL_UPDATED, ENTITY_TYPES.BILL, bill.id, {
      name: bill.name,
      amount: bill.amount,
      changes: Object.keys(changes),
      ...changes,
    });
  }

  async logBillPaid(bill: Bill, paymentAmount: number): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.BILL_PAID, ENTITY_TYPES.BILL, bill.id, {
      name: bill.name,
      amount: paymentAmount,
      dueDate: bill.dueDate,
      paidDate: new Date().toISOString(),
    });
  }

  // Paycheck activities
  async logPaycheckProcessed(
    paycheck: PaycheckHistory & { payerName?: string; mode?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(
      ACTIVITY_TYPES.PAYCHECK_PROCESSED,
      ENTITY_TYPES.PAYCHECK,
      paycheck.id || `paycheck_${Date.now()}`,
      {
        amount: paycheck.amount,
        payerName: paycheck.payerName,
        mode: paycheck.mode,
        date: paycheck.date,
      }
    );
  }

  async logPaycheckDeleted(
    paycheck: PaycheckHistory & { payerName?: string; mode?: string }
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.PAYCHECK_DELETED, ENTITY_TYPES.PAYCHECK, paycheck.id, {
      amount: paycheck.amount,
      payerName: paycheck.payerName,
      mode: paycheck.mode,
    });
  }

  // Debt activities
  async logDebtCreated(debt: Debt): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.DEBT_CREATED, ENTITY_TYPES.DEBT, debt.id, {
      name: debt.name,
      creditor: debt.creditor,
      currentBalance: debt.currentBalance,
      minimumPayment: debt.minimumPayment,
    });
  }

  async logDebtUpdated(
    debt: Debt,
    changes: Record<string, unknown> = {}
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(ACTIVITY_TYPES.DEBT_UPDATED, ENTITY_TYPES.DEBT, debt.id, {
      name: debt.name,
      creditor: debt.creditor,
      changes: Object.keys(changes),
      ...changes,
    });
  }

  // System activities
  async logSyncCompleted(
    syncType: string = "full",
    itemsChanged: number = 0
  ): Promise<AuditLogEntry | null> {
    return this.logActivity(
      ACTIVITY_TYPES.SYNC_COMPLETED,
      ENTITY_TYPES.SYSTEM,
      `sync_${Date.now()}`,
      {
        syncType,
        itemsChanged,
      }
    );
  }

  /**
   * Retrieve activity history
   */
  async getRecentActivity(
    limit: number = 50,
    entityType: string | null = null,
    entityId: string | null = null
  ): Promise<AuditLogEntry[]> {
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
        query = budgetDb.auditLog.where("entityType").equals(entityType).reverse().limit(limit);
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
  async getActivityCount(
    entityType: string | null = null,
    entityId: string | null = null
  ): Promise<number> {
    try {
      if (entityType && entityId) {
        return await budgetDb.auditLog
          .where("[entityType+entityId]")
          .equals([entityType, entityId])
          .count();
      } else if (entityType) {
        return await budgetDb.auditLog.where("entityType").equals(entityType).count();
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
  async clearOldActivities(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
      const deletedCount = await budgetDb.auditLog.where("timestamp").below(cutoffTime).delete();

      logger.info(`Cleared ${deletedCount} old activities older than ${daysToKeep} days`);
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
