// src/hooks/useActivityLogger.ts
import { useEffect } from "react";
import activityLogger, { ACTIVITY_TYPES, ENTITY_TYPES } from "../../services/activityLogger";
import { useAuth } from "../../stores/auth/authStore";
import { ActivityEvent, ActivityType, EntityType } from "../../types/events";

interface ActivityLoggerHook {
  // Core logging function
  logActivity: (
    type: ActivityType,
    entityType: EntityType,
    entityId: string,
    data?: Record<string, unknown>,
    description?: string
  ) => Promise<void>;

  // Helper methods for common activities
  logEnvelopeCreated: (envelopeId: string, data?: Record<string, unknown>) => Promise<void>;
  logEnvelopeUpdated: (envelopeId: string, data?: Record<string, unknown>) => Promise<void>;
  logEnvelopeDeleted: (envelopeId: string, data?: Record<string, unknown>) => Promise<void>;
  logEnvelopeFunded: (envelopeId: string, amount: number, data?: Record<string, unknown>) => Promise<void>;

  logTransactionAdded: (transactionId: string, data?: Record<string, unknown>) => Promise<void>;
  logTransactionUpdated: (transactionId: string, data?: Record<string, unknown>) => Promise<void>;
  logTransactionDeleted: (transactionId: string, data?: Record<string, unknown>) => Promise<void>;
  logTransactionsImported: (count: number, data?: Record<string, unknown>) => Promise<void>;

  logBillCreated: (billId: string, data?: Record<string, unknown>) => Promise<void>;
  logBillUpdated: (billId: string, data?: Record<string, unknown>) => Promise<void>;
  logBillPaid: (billId: string, amount: number, data?: Record<string, unknown>) => Promise<void>;

  logPaycheckProcessed: (paycheckId: string, amount: number, data?: Record<string, unknown>) => Promise<void>;
  logPaycheckDeleted: (paycheckId: string, data?: Record<string, unknown>) => Promise<void>;

  logDebtCreated: (debtId: string, data?: Record<string, unknown>) => Promise<void>;
  logDebtUpdated: (debtId: string, data?: Record<string, unknown>) => Promise<void>;

  logSyncCompleted: (syncType: string, data?: Record<string, unknown>) => Promise<void>;

  // Query methods
  getRecentActivity: (limit?: number) => Promise<ActivityEvent[]>;
  getActivityCount: (entityType?: EntityType, entityId?: string) => Promise<number>;
  clearOldActivities: (olderThanDays?: number) => Promise<void>;

  // Constants for external use
  ACTIVITY_TYPES: typeof ACTIVITY_TYPES;
  ENTITY_TYPES: typeof ENTITY_TYPES;
}

/**
 * Hook to provide activity logging functionality
 * Automatically sets current user and provides logging methods
 */
const useActivityLogger = (): ActivityLoggerHook => {
  const { currentUser } = useAuth();

  // Set current user when it changes
  useEffect(() => {
    if (currentUser) {
      activityLogger.setCurrentUser(currentUser);
    }
  }, [currentUser]);

  return {
    // Core logging function
    logActivity: activityLogger.logActivity.bind(activityLogger),

    // Helper methods for common activities
    logEnvelopeCreated: activityLogger.logEnvelopeCreated.bind(activityLogger),
    logEnvelopeUpdated: activityLogger.logEnvelopeUpdated.bind(activityLogger),
    logEnvelopeDeleted: activityLogger.logEnvelopeDeleted.bind(activityLogger),
    logEnvelopeFunded: activityLogger.logEnvelopeFunded.bind(activityLogger),

    logTransactionAdded: activityLogger.logTransactionAdded.bind(activityLogger),
    logTransactionUpdated: activityLogger.logTransactionUpdated.bind(activityLogger),
    logTransactionDeleted: activityLogger.logTransactionDeleted.bind(activityLogger),
    logTransactionsImported: activityLogger.logTransactionsImported.bind(activityLogger),

    logBillCreated: activityLogger.logBillCreated.bind(activityLogger),
    logBillUpdated: activityLogger.logBillUpdated.bind(activityLogger),
    logBillPaid: activityLogger.logBillPaid.bind(activityLogger),

    logPaycheckProcessed: activityLogger.logPaycheckProcessed.bind(activityLogger),
    logPaycheckDeleted: activityLogger.logPaycheckDeleted.bind(activityLogger),

    logDebtCreated: activityLogger.logDebtCreated.bind(activityLogger),
    logDebtUpdated: activityLogger.logDebtUpdated.bind(activityLogger),

    logSyncCompleted: activityLogger.logSyncCompleted.bind(activityLogger),

    // Query methods
    getRecentActivity: activityLogger.getRecentActivity.bind(activityLogger),
    getActivityCount: activityLogger.getActivityCount.bind(activityLogger),
    clearOldActivities: activityLogger.clearOldActivities.bind(activityLogger),

    // Constants for external use
    ACTIVITY_TYPES,
    ENTITY_TYPES,
  };
};

export default useActivityLogger;