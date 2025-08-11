import { useEffect, useState } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import logger from "../utils/logger";

/**
 * Hook to initialize background cloud sync service
 * This ensures the proper data flow: Firestore ↔ Dexie ↔ TanStack Query ↔ UI
 */
const useDataInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const { cloudSyncEnabled, startBackgroundSync } = useBudgetStore();

  useEffect(() => {
    const initializeServices = async () => {
      try {
        logger.debug("Initializing background services", {
          cloudSyncEnabled,
          isInitialized,
        });

        setInitError(null);

        if (cloudSyncEnabled) {
          logger.debug(
            "🌩️ Starting background cloud sync service (default enabled)",
          );
          startBackgroundSync();
        } else {
          logger.debug("💾 Local-only mode enabled - cloud sync disabled");
        }

        setIsInitialized(true);
        logger.debug("✅ Background services initialized");
      } catch (error) {
        logger.error("❌ Failed to initialize background services", error);
        setInitError(error.message);
      }
    };

    if (!isInitialized) {
      initializeServices();
    }
  }, [cloudSyncEnabled, startBackgroundSync, isInitialized]);

  return {
    isInitialized,
    initError,
    cloudSyncEnabled,
  };
};

export default useDataInitialization;
