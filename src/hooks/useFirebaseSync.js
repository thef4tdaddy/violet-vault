import { useCallback, useEffect, useState } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";

/**
 * Custom hook for Firebase synchronization management
 * Extracts sync logic from MainLayout component
 */
const useFirebaseSync = (
  firebaseSync,
  encryptionKey,
  budgetId,
  currentUser,
) => {
  const budget = useBudgetStore();
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-initialize Firebase sync when dependencies are ready
  useEffect(() => {
    if (!firebaseSync || !budgetId || !encryptionKey) return;

    console.log("🔄 Auto-initializing Firebase sync...");
    firebaseSync.initialize(budgetId, encryptionKey);

    // Auto-load data from cloud
    const loadCloudData = async () => {
      try {
        setIsLoading(true);
        const cloudData = await firebaseSync.loadFromCloud();
        if (cloudData && cloudData.data) {
          console.log(
            "📥 Loading data from cloud:",
            Object.keys(cloudData.data),
          );

          // Sync Firebase data directly to Dexie (TanStack Query will fetch from Dexie)
          if (cloudData.data.envelopes) {
            await budgetDb.bulkUpsertEnvelopes(cloudData.data.envelopes);
            console.log(
              "✅ Synced envelopes to Dexie:",
              cloudData.data.envelopes.length,
            );
          }
          if (cloudData.data.bills) {
            await budgetDb.bulkUpsertBills(cloudData.data.bills);
            console.log(
              "✅ Synced bills to Dexie:",
              cloudData.data.bills.length,
            );
          }
          if (cloudData.data.savingsGoals) {
            await budgetDb.bulkUpsertSavingsGoals(cloudData.data.savingsGoals);
            console.log(
              "✅ Synced savings goals to Dexie:",
              cloudData.data.savingsGoals.length,
            );
          }
          if (cloudData.data.transactions) {
            await budgetDb.bulkUpsertTransactions(cloudData.data.transactions);
            console.log(
              "✅ Synced transactions to Dexie:",
              cloudData.data.transactions.length,
            );
          }
          if (cloudData.data.allTransactions) {
            await budgetDb.bulkUpsertTransactions(
              cloudData.data.allTransactions,
            );
            console.log(
              "✅ Synced allTransactions to Dexie:",
              cloudData.data.allTransactions.length,
            );
          }
          if (cloudData.data.paycheckHistory) {
            await budgetDb.bulkUpsertPaychecks(cloudData.data.paycheckHistory);
            console.log(
              "✅ Synced paycheck history to Dexie:",
              cloudData.data.paycheckHistory.length,
            );
          }
          if (cloudData.data.debts) {
            await budgetDb.bulkUpsertDebts(cloudData.data.debts);
            console.log(
              "✅ Synced debts to Dexie:",
              cloudData.data.debts.length,
            );
          }

          // Non-Dexie data
          if (typeof cloudData.data.unassignedCash === "number")
            budget.setUnassignedCash(cloudData.data.unassignedCash);
          if (typeof cloudData.data.biweeklyAllocation === "number")
            budget.setBiweeklyAllocation(cloudData.data.biweeklyAllocation);
          if (typeof cloudData.data.actualBalance === "number")
            budget.setActualBalance(
              cloudData.data.actualBalance,
              cloudData.data.isActualBalanceManual,
            );

          console.log("🔄 Firebase → Dexie sync completed");
        }
      } catch (error) {
        console.warn("Failed to load cloud data:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCloudData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseSync, budgetId, encryptionKey]); // Remove budget from deps to prevent load loop

  // Auto-save data when it changes
  useEffect(() => {
    if (!firebaseSync || !currentUser || !budgetId || isLoading) return;

    // Debounce saves to avoid excessive syncing
    const timeoutId = setTimeout(async () => {
      try {
        console.log("💾 Auto-saving data to cloud...");
        // Get data from Dexie for cloud sync
        const [envelopes, bills, savingsGoals, transactions, paychecks, debts] =
          await Promise.all([
            budgetDb.envelopes.toArray(),
            budgetDb.bills.toArray(),
            budgetDb.savingsGoals.toArray(),
            budgetDb.transactions.toArray(),
            budgetDb.paycheckHistory.toArray(),
            budgetDb.debts.toArray(),
          ]);

        await firebaseSync.saveToCloud(
          {
            envelopes,
            bills,
            savingsGoals,
            unassignedCash: budget.unassignedCash,
            biweeklyAllocation: budget.biweeklyAllocation,
            transactions,
            allTransactions: transactions,
            paycheckHistory: paychecks,
            debts,
            actualBalance: budget.actualBalance,
            isActualBalanceManual: budget.isActualBalanceManual,
          },
          currentUser,
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
    isLoading, // Prevent saves during loads
    budget.unassignedCash,
    budget.biweeklyAllocation,
    budget.actualBalance,
    budget.isActualBalanceManual,
  ]);

  const handleManualSync = useCallback(async () => {
    try {
      if (!firebaseSync) return;
      // Get data from Dexie for manual sync
      const [envelopes, bills, savingsGoals, transactions, paychecks, debts] =
        await Promise.all([
          budgetDb.envelopes.toArray(),
          budgetDb.bills.toArray(),
          budgetDb.savingsGoals.toArray(),
          budgetDb.transactions.toArray(),
          budgetDb.paycheckHistory.toArray(),
          budgetDb.debts.toArray(),
        ]);

      await firebaseSync.saveToCloud(
        {
          envelopes,
          bills,
          savingsGoals,
          unassignedCash: budget.unassignedCash,
          biweeklyAllocation: budget.biweeklyAllocation,
          transactions,
          allTransactions: transactions,
          paycheckHistory: paychecks,
          debts,
          actualBalance: budget.actualBalance,
          isActualBalanceManual: budget.isActualBalanceManual,
        },
        currentUser,
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
  }, [
    budget,
    budget.getActiveUsers,
    budget.getRecentActivity,
    budget.isSyncing,
  ]);

  return {
    activeUsers,
    recentActivity,
    handleManualSync,
  };
};

export default useFirebaseSync;
