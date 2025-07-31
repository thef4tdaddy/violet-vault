import { useCallback, useEffect, useState } from "react";
import { useBudget } from "./useBudget";
import logger from "../utils/logger";

/**
 * Custom hook for Firebase synchronization management
 * Extracts sync logic from MainLayout component
 */
const useFirebaseSync = (firebaseSync, encryptionKey, budgetId, currentUser) => {
  const budget = useBudget();
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const handleManualSync = useCallback(async () => {
    try {
      if (!firebaseSync) return;
      firebaseSync.initialize(budgetId, encryptionKey);
      await firebaseSync.saveToCloud(
        {
          envelopes: budget.envelopes,
          bills: budget.bills,
          savingsGoals: budget.savingsGoals,
          unassignedCash: budget.unassignedCash,
          biweeklyAllocation: budget.biweeklyAllocation,
          transactions: budget.allTransactions,
          allTransactions: budget.allTransactions,
        },
        currentUser
      );
      alert("Data synced to cloud");
    } catch (err) {
      console.error("Manual sync failed", err);
      alert(`Sync failed: ${err.message}`);
    }
  }, [firebaseSync, budgetId, encryptionKey, budget, currentUser]);

  // Update activity data from Firebase sync
  useEffect(() => {
    if (!budget.getActiveUsers || !budget.getRecentActivity) return;

    const updateActivityData = () => {
      try {
        const users = budget.getActiveUsers();
        const activity = budget.getRecentActivity();
        logger.debug("🔄 Updating activity data:", {
          users: users?.length || 0,
          activity: activity?.length || 0,
        });
        setActiveUsers(users || []);
        setRecentActivity(activity || []);
      } catch (error) {
        console.error("Failed to get activity data:", error);
      }
    };

    // Update immediately
    updateActivityData();

    // Update periodically to catch changes
    const interval = setInterval(updateActivityData, 5000);
    return () => clearInterval(interval);
  }, [budget.getActiveUsers, budget.getRecentActivity, budget.isSyncing]);

  return {
    activeUsers,
    recentActivity,
    handleManualSync,
  };
};

export default useFirebaseSync;