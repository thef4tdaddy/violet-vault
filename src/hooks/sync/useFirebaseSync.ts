import { useCallback, useEffect, useState } from "react";
import useUiStore from "../../stores/ui/uiStore";
// import { budgetDb } from "../../db/budgetDb"; // TODO: Use for local sync operations
import logger from "../../utils/common/logger";
import { useToastHelpers } from "../../utils/common/toastHelpers";

interface FirebaseSyncService {
  start: (config: unknown) => void;
  forceSync: () => Promise<unknown>;
  isRunning: boolean;
}

interface User {
  uid: string;
  email?: string;
  displayName?: string;
  [key: string]: unknown;
}

interface ActivityItem {
  id: string;
  timestamp: number;
  action: string;
  userId: string;
  [key: string]: unknown;
}

/**
 * Firebase sync hook props
 */
interface UseFirebaseSyncProps {
  firebaseSync: FirebaseSyncService;
  encryptionKey: CryptoKey | null;
  budgetId: string | null;
  currentUser: User | null;
}

/**
 * Firebase sync hook return type
 */
interface UseFirebaseSyncReturn {
  activeUsers: User[];
  recentActivity: ActivityItem[];
  handleManualSync: () => Promise<void>;
}

/**
 * Custom hook for Firebase synchronization management
 * Extracts sync logic from MainLayout component
 */
const useFirebaseSync = ({
  firebaseSync,
  encryptionKey,
  budgetId,
  currentUser,
}: UseFirebaseSyncProps): UseFirebaseSyncReturn => {
  const budget = useUiStore((state) => state.budget);
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
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

    // GitHub Issue #576: Remove aggressive auto-sync - let change-based sync handle it
    // The cloudSyncService will handle initial sync and subsequent syncs based on data changes
    // No need for immediate sync on every component mount
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
  const _handleManualSave = async (): Promise<void> => {
    // TODO: Implement manual save functionality
    try {
      logger.production("Manual save triggered");
      const result = await firebaseSync.forceSync();
      if (result && result.success) {
        logger.production("Manual save completed successfully");
        showSuccessToast("Data saved successfully");
      } else {
        showErrorToast("Failed to save data");
      }
    } catch (error) {
      logger.warn("Manual save failed:", (error as Error).message);
      showErrorToast("Failed to save data");
    }
  };

  const handleManualSync = useCallback(async (): Promise<void> => {
    try {
      if (!firebaseSync) return;

      logger.info("🔄 Manual sync triggered...");
      const result = await firebaseSync.forceSync();

      if (result && result.success) {
        showSuccessToast("Manual sync completed successfully");
        logger.info("✅ Manual sync completed:", result);
      } else {
        showErrorToast("Manual sync failed");
        logger.warn("❌ Manual sync failed:", result);
      }
    } catch (err) {
      logger.error("Manual sync failed", err);
      showErrorToast(`Sync failed: ${(err as Error).message}`, "Sync Failed");
    }
  }, [firebaseSync, showErrorToast, showSuccessToast]);

  // Update activity data from Firebase sync
  useEffect(() => {
    if (!budget || !budget.getActiveUsers || !budget.getRecentActivity) return;

    const updateActivityData = (): void => {
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
        logger.error("Failed to get activity data:", error);
      }
    };

    // Update immediately
    updateActivityData();

    // Update periodically to catch changes
    const interval = setInterval(updateActivityData, 5000);
    return () => clearInterval(interval);
  }, [budget]);

  return {
    activeUsers,
    recentActivity,
    handleManualSync,
  };
};

export { useFirebaseSync };
