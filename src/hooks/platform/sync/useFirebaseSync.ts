import { useCallback, useEffect, useState } from "react";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";
import logger from "@/utils/core/common/logger";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";

interface FirebaseSyncService {
  start: (config: unknown) => void;
  forceSync: () => Promise<unknown>;
  isRunning: boolean;
}

// Interface for budget operations available in legacy store
interface BudgetOperations {
  getActiveUsers?: () => User[];
  getRecentActivity?: () => ActivityItem[];
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
  const budget = useUiStore((state: UiStore & { budget?: BudgetOperations }) => state.budget);
  const { showSuccessToast, showErrorToast } = useToastHelpers();
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

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

  const handleManualSync = useCallback(async (): Promise<void> => {
    try {
      if (!firebaseSync) return;

      logger.info("🔄 Manual sync triggered...");
      const result = await firebaseSync.forceSync();

      if (result && typeof result === "object" && "success" in result && result.success) {
        showSuccessToast("Manual sync completed successfully");
        logger.info("✅ Manual sync completed:", result as Record<string, unknown>);
      } else {
        showErrorToast("Manual sync failed");
        logger.warn("❌ Manual sync failed:", result as Record<string, unknown>);
      }
    } catch (err) {
      const error = err as Error;
      logger.error("Manual sync failed", { message: error.message });
      showErrorToast(`Sync failed: ${error.message}`, "Sync Failed");
    }
  }, [firebaseSync, showErrorToast, showSuccessToast]);

  // Update activity data from Firebase sync
  useEffect(() => {
    if (!budget?.getActiveUsers || !budget?.getRecentActivity) return;

    const updateActivityData = (): void => {
      try {
        const users = budget.getActiveUsers?.();
        const activity = budget.getRecentActivity?.();
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
