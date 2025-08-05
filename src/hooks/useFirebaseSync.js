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

  // Auto-initialize Firebase sync when dependencies are ready
  useEffect(() => {
    if (!firebaseSync || !budgetId || !encryptionKey) return;

    console.log("🔄 Auto-initializing Firebase sync...");
    firebaseSync.initialize(budgetId, encryptionKey);

    // Auto-load data from cloud
    const loadCloudData = async () => {
      try {
        const cloudData = await firebaseSync.loadFromCloud();
        if (cloudData && cloudData.data) {
          console.log("📥 Loading data from cloud:", Object.keys(cloudData.data));
          // Update budget store with cloud data
          if (cloudData.data.envelopes) budget.setEnvelopes(cloudData.data.envelopes);
          if (cloudData.data.bills) budget.setBills(cloudData.data.bills);
          if (cloudData.data.savingsGoals) budget.setSavingsGoals(cloudData.data.savingsGoals);
          if (cloudData.data.transactions) budget.setTransactions(cloudData.data.transactions);
          if (cloudData.data.allTransactions)
            budget.setAllTransactions(cloudData.data.allTransactions);
          if (typeof cloudData.data.unassignedCash === "number")
            budget.setUnassignedCash(cloudData.data.unassignedCash);
          if (typeof cloudData.data.biweeklyAllocation === "number")
            budget.setBiweeklyAllocation(cloudData.data.biweeklyAllocation);
          if (cloudData.data.paycheckHistory)
            budget.setPaycheckHistory(cloudData.data.paycheckHistory);
          if (typeof cloudData.data.actualBalance === "number")
            budget.setActualBalance(cloudData.data.actualBalance, cloudData.data.isActualBalanceManual);
        }
      } catch (error) {
        console.warn("Failed to load cloud data:", error.message);
      }
    };

    loadCloudData();
  }, [firebaseSync, budgetId, encryptionKey, budget]);

  // Auto-save data when it changes
  useEffect(() => {
    if (!firebaseSync || !currentUser || !budgetId) return;

    // Debounce saves to avoid excessive syncing
    const timeoutId = setTimeout(async () => {
      try {
        console.log("💾 Auto-saving data to cloud...");
        await firebaseSync.saveToCloud(
          {
            envelopes: budget.envelopes,
            bills: budget.bills,
            savingsGoals: budget.savingsGoals,
            unassignedCash: budget.unassignedCash,
            biweeklyAllocation: budget.biweeklyAllocation,
            transactions: budget.allTransactions,
            allTransactions: budget.allTransactions,
            paycheckHistory: budget.paycheckHistory,
            actualBalance: budget.actualBalance,
            isActualBalanceManual: budget.isActualBalanceManual,
          },
          currentUser
        );
        console.log("✅ Data auto-saved to cloud");
      } catch (error) {
        console.warn("Auto-save failed:", error.message);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [
    firebaseSync,
    currentUser,
    budgetId,
    budget.envelopes,
    budget.bills,
    budget.savingsGoals,
    budget.unassignedCash,
    budget.biweeklyAllocation,
    budget.allTransactions,
    budget.paycheckHistory,
    budget.actualBalance,
    budget.isActualBalanceManual,
  ]);

  const handleManualSync = useCallback(async () => {
    try {
      if (!firebaseSync) return;
      await firebaseSync.saveToCloud(
        {
          envelopes: budget.envelopes,
          bills: budget.bills,
          savingsGoals: budget.savingsGoals,
          unassignedCash: budget.unassignedCash,
          biweeklyAllocation: budget.biweeklyAllocation,
          transactions: budget.allTransactions,
          allTransactions: budget.allTransactions,
          paycheckHistory: budget.paycheckHistory,
          actualBalance: budget.actualBalance,
          isActualBalanceManual: budget.isActualBalanceManual,
        },
        currentUser
      );
      alert("Data synced to cloud");
    } catch (err) {
      console.error("Manual sync failed", err);
      alert(`Sync failed: ${err.message}`);
    }
  }, [firebaseSync, budget, currentUser]);

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
  }, [budget, budget.getActiveUsers, budget.getRecentActivity, budget.isSyncing]);

  return {
    activeUsers,
    recentActivity,
    handleManualSync,
  };
};

export default useFirebaseSync;
