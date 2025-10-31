// src/hooks/useActivityLogger.js
import { useEffect } from "react";
import activityLogger, { ACTIVITY_TYPES, ENTITY_TYPES } from "../../services/activityLogger";
import { useAuthManager } from "../auth/useAuthManager";

/**
 * Hook to provide activity logging functionality
 * Automatically sets current user and provides logging methods
 */
const useActivityLogger = () => {
  const { user: currentUser } = useAuthManager();

  // Set current user when it changes
  useEffect(() => {
    if (currentUser) {
      activityLogger.setCurrentUser({
        id: currentUser.budgetId || 'default',
        userName: currentUser.userName,
        userColor: currentUser.userColor,
      });
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
