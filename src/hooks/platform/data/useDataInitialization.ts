import { useEffect, useState } from "react";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import logger from "@/utils/common/logger";
import { budgetDb } from "@/db/budgetDb";

/**
 * Auto-fix undefined autoAllocate values - set all to true by default
 */
async function fixAutoAllocateUndefinedValues() {
  try {
    const allEnvelopes = await budgetDb.envelopes.toArray();
    const undefinedEnvelopes = allEnvelopes.filter((env) => env.autoAllocate === undefined);

    if (undefinedEnvelopes.length > 0) {
      logger.info(
        `🔧 Auto-fixing ${undefinedEnvelopes.length} envelopes with undefined autoAllocate (setting to true)`
      );

      for (const envelope of undefinedEnvelopes) {
        await budgetDb.envelopes.update(envelope.id, {
          autoAllocate: true, // Set to true by default as user requested
        });
      }

      logger.info(`✅ Fixed ${undefinedEnvelopes.length} envelope autoAllocate values`);
    }
  } catch (error) {
    logger.error("Failed to fix autoAllocate undefined values:", error);
  }
}

/**
 * Hook to initialize background cloud sync service
 * Data is now handled directly by TanStack Query → Dexie → Firebase
 * This hook only manages cloud sync initialization
 */
const useDataInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const cloudSyncEnabled = useBudgetStore((state: UiStore) => state.cloudSyncEnabled);

  useEffect(() => {
    const initializeServices = async () => {
      try {
        logger.debug("Initializing background services", {
          cloudSyncEnabled,
          isInitialized,
        });

        setInitError(null);

        // Auto-fix undefined autoAllocate values on startup
        await fixAutoAllocateUndefinedValues();

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
        setInitError((error as Error)?.message ?? "Unknown error");
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
