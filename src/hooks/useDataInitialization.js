import { useEffect, useState } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import logger from "../utils/logger";

/**
 * Hook to initialize data from Dexie into Zustand on app startup
 * This ensures the proper data flow: Dexie → Zustand → TanStack Query → UI
 */
const useDataInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState(null);
  const { initializeFromDexie, dataLoaded } = useBudgetStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        logger.debug("Starting data initialization from Dexie");
        setInitError(null);
        
        const result = await initializeFromDexie();
        
        if (result.success) {
          logger.debug("Data initialization completed successfully", result.counts);
          setIsInitialized(true);
        } else {
          logger.error("Data initialization failed", result.error);
          setInitError(result.error);
        }
      } catch (error) {
        logger.error("Unexpected error during data initialization", error);
        setInitError(error.message);
      }
    };

    // Only initialize once and if data hasn't been loaded yet
    if (!isInitialized && !dataLoaded) {
      initializeData();
    }
  }, [initializeFromDexie, isInitialized, dataLoaded]);

  return {
    isInitialized,
    initError,
    dataLoaded
  };
};

export default useDataInitialization;