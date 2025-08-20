import { useCallback, useEffect, useState } from "react";
import { useBudgetStore } from "../stores/budgetStore";
// import { budgetDb } from "../db/budgetDb"; // TODO: Use for local sync operations
import logger from "../utils/logger";
import { useToastHelpers } from "../utils/toastHelpers";

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
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const [activeUsers, setActiveUsers] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [_isLoading, _setIsLoading] = useState(false); // TODO: Use for loading states

  // Auto-initialize Firebase sync when dependencies are ready
  useEffect(() => {
    if (!firebaseSync || !budgetId || !encryptionKey || !currentUser) return;

    logger.info("🔄 Auto-initializing chunked Firebase sync...");

    // Start the cloud sync service with config
    const config = {
      budgetId,
      encryptionKey,
      currentUser,
    };
    firebaseSync.start(config);

    // Auto-load data from cloud using force sync
    const loadCloudData = async () => {
      try {
        _setIsLoading(true);
        const syncResult = await firebaseSync.forceSync();
        if (syncResult && syncResult.success) {
          logger.info("✅ Chunked sync completed:", syncResult);
          showSuccessToast("Data synced from cloud successfully");

          // The cloudSyncService handles syncing data to Dexie automatically
          // TanStack Query will pick up the changes from Dexie

          // Update non-Dexie Zustand state if needed
          // These would need to be handled separately since they're not in Dexie

          logger.info("🔄 Chunked Firebase → Dexie sync completed");
        }
      } catch (error) {
        console.warn("Failed to load cloud data:", error.message);
      } finally {
        _setIsLoading(false);
      }
    };

    loadCloudData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseSync, budgetId, encryptionKey]); // Remove budget from deps to prevent load loop

  // The cloudSyncService automatically handles syncing - no manual auto-save needed
  // It runs periodic sync every 30 seconds and handles bidirectional sync
  useEffect(() => {
    if (!firebaseSync || !currentUser || !budgetId) return;

    // Ensure the sync service is running with current config
    const config = {
      budgetId,
      encryptionKey,
      currentUser,
    };

    // Make sure service is started (idempotent)
    if (!firebaseSync.isRunning) {
      firebaseSync.start(config);
    }

    // Cleanup function to stop sync service when component unmounts
    return () => {
      // Don't stop the service here since other components might need it
      // firebaseSync.stop();
    };
  }, [firebaseSync, currentUser, budgetId, encryptionKey]);

  // Legacy code for manual save operations (if needed)
  const _handleManualSave = async () => {
    // TODO: Implement manual save functionality
    try {
      logger.info("💾 Manual save triggered - using forceSync...");
      const result = await firebaseSync.forceSync();
      if (result && result.success) {
        showSuccessToast("Data saved successfully");
      } else {
        showErrorToast("Failed to save data");
      }
    } catch (error) {
      console.warn("Manual save failed:", error.message);
      showErrorToast("Failed to save data");
    }
  };

  const handleManualSync = useCallback(async () => {
    try {
      if (!firebaseSync) return;

      logger.info("🔄 Manual sync triggered...");
      const result = await firebaseSync.forceSync();

      if (result && result.success) {
        showSuccessToast("Manual sync completed successfully");
        logger.info("✅ Manual sync completed:", result);
      } else {
        showErrorToast("Manual sync failed");
        console.warn("❌ Manual sync failed:", result);
      }
    } catch (err) {
      console.error("Manual sync failed", err);
      showErrorToast(`Sync failed: ${err.message}`, "Sync Failed");
    }
  }, [firebaseSync, showErrorToast, showSuccessToast]);

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
