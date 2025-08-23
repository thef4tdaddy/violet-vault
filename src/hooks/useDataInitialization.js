import { useEffect, useState } from "react";
import { useBudgetStore } from "../stores/uiStore";
import logger from "../utils/logger";

/**
 * Hook to initialize background cloud sync service
 * Data is now handled directly by TanStack Query → Dexie → Firebase
 * This hook only manages cloud sync initialization
 */
const useDataInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const { cloudSyncEnabled } = useBudgetStore();

  useEffect(() => {
    const initializeServices = async () => {
      try {
        logger.debug("Initializing background services", {
          cloudSyncEnabled,
          isInitialized,
        });

        setInitError(null);

        // Note: Background sync is now started after successful login in authStore
        // This ensures auth context is available before sync attempts
        if (cloudSyncEnabled) {
          logger.debug("🌩️ Cloud sync enabled - will start after user login");
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
  }, [cloudSyncEnabled, isInitialized]);

  return {
    isInitialized,
    initError,
    dataLoaded: true, // Always true since TanStack Query handles data loading
    cloudSyncEnabled,
  };
};

export default useDataInitialization;
