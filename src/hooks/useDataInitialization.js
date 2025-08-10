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
  const { 
    initializeFromDexie, 
    dataLoaded, 
    envelopes, 
    transactions, 
    bills 
  } = useBudgetStore();

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if Zustand already has data (from localStorage persistence)
        const hasExistingData = envelopes.length > 0 || transactions.length > 0 || bills.length > 0;
        
        logger.debug("Checking data initialization state", {
          hasExistingData,
          envelopesCount: envelopes.length,
          transactionsCount: transactions.length,
          billsCount: bills.length,
          dataLoaded,
          isInitialized
        });

        if (hasExistingData) {
          logger.debug("Zustand already has data from persistence, skipping Dexie initialization");
          setIsInitialized(true);
          return;
        }

        logger.debug("No data in Zustand, initializing from Dexie");
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

    // Run initialization after a short delay to let Zustand persistence load first
    const timeoutId = setTimeout(() => {
      if (!isInitialized) {
        initializeData();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [initializeFromDexie, isInitialized, dataLoaded, envelopes.length, transactions.length, bills.length]);

  return {
    isInitialized,
    initError,
    dataLoaded,
  };
};

export default useDataInitialization;
