import { useEffect, useState } from "react";
import { useBudgetStore } from "../stores/budgetStore";
import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";

/**
 * Hook to initialize data and background cloud sync service
 * This ensures the proper data flow: Dexie → Zustand → TanStack Query → UI
 * And cloud sync flow: Firestore ↔ Dexie ↔ Zustand ↔ UI
 */
const useDataInitialization = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [initError, setInitError] = useState(null);
  const {
    cloudSyncEnabled,
    startBackgroundSync,
    setEnvelopes,
    setBills,
    setTransactions,
    setAllTransactions,
    setSavingsGoals,
    setDebts,
    setPaycheckHistory,
    envelopes,
    bills,
    transactions,
    allTransactions,
  } = useBudgetStore();

  useEffect(() => {
    const loadDataFromDexie = async () => {
      try {
        logger.debug("🔄 Loading data from Dexie into Zustand store");

        // Check if budgetDb is properly initialized
        if (!budgetDb || !budgetDb.envelopes) {
          logger.warn(
            "⚠️ BudgetDb not properly initialized, skipping data load",
          );
          return;
        }

        // Ensure database is open before accessing tables
        if (!budgetDb.isOpen()) {
          logger.debug("📂 Opening Dexie database");
          await budgetDb.open();
        }

        // Load all data from Dexie into Zustand arrays with individual error handling
        const loadTable = async (tableName, tableObject) => {
          try {
            if (tableObject && typeof tableObject.toArray === "function") {
              return await tableObject.toArray();
            } else {
              logger.warn(
                `⚠️ Table ${tableName} not available or not properly initialized`,
              );
              return [];
            }
          } catch (error) {
            logger.warn(`⚠️ Failed to load ${tableName}:`, error.message);
            return [];
          }
        };

        const [
          dexieEnvelopes,
          dexieBills,
          dexieTransactions,
          dexieSavingsGoals,
          dexieDebts,
          dexiePaychecks,
        ] = await Promise.all([
          loadTable("envelopes", budgetDb.envelopes),
          loadTable("bills", budgetDb.bills),
          loadTable("transactions", budgetDb.transactions),
          loadTable("savingsGoals", budgetDb.savingsGoals),
          loadTable("debts", budgetDb.debts),
          loadTable("paychecks", budgetDb.paycheckHistory),
        ]);

        logger.debug("📊 Dexie data loaded", {
          envelopes: dexieEnvelopes.length,
          bills: dexieBills.length,
          transactions: dexieTransactions.length,
          savingsGoals: dexieSavingsGoals.length,
          debts: dexieDebts.length,
          paychecks: dexiePaychecks.length,
        });

        // Only update Zustand if arrays are currently empty (avoid overwriting cloud sync data)
        if (envelopes.length === 0 && dexieEnvelopes.length > 0) {
          logger.debug(
            "📦 Loading envelopes into Zustand:",
            dexieEnvelopes.length,
          );
          setEnvelopes(dexieEnvelopes);
        }

        if (bills.length === 0 && dexieBills.length > 0) {
          logger.debug("📋 Loading bills into Zustand:", dexieBills.length);
          setBills(dexieBills);
        }

        if (
          transactions.length === 0 &&
          allTransactions.length === 0 &&
          dexieTransactions.length > 0
        ) {
          logger.debug(
            "💳 Loading transactions into Zustand:",
            dexieTransactions.length,
          );
          setTransactions(dexieTransactions);
          setAllTransactions(dexieTransactions);
        }

        if (dexieSavingsGoals.length > 0) {
          logger.debug(
            "💰 Loading savings goals into Zustand:",
            dexieSavingsGoals.length,
          );
          setSavingsGoals(dexieSavingsGoals);
        }

        if (dexieDebts.length > 0) {
          logger.debug("💳 Loading debts into Zustand:", dexieDebts.length);
          setDebts(dexieDebts);
        }

        if (dexiePaychecks.length > 0) {
          logger.debug(
            "💰 Loading paychecks into Zustand:",
            dexiePaychecks.length,
          );
          setPaycheckHistory(dexiePaychecks);
        }

        setDataLoaded(true);
        logger.debug("✅ Data loading completed");
      } catch (error) {
        logger.error("❌ Failed to load data from Dexie", error);
        setInitError(error.message);
      }
    };

    const initializeServices = async () => {
      try {
        logger.debug("Initializing data and background services", {
          cloudSyncEnabled,
          isInitialized,
          dataLoaded,
        });

        setInitError(null);

        // First, load data from Dexie
        if (!dataLoaded) {
          await loadDataFromDexie();
        }

        // Then initialize cloud sync if enabled
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
  }, [
    cloudSyncEnabled,
    startBackgroundSync,
    isInitialized,
    dataLoaded,
    setEnvelopes,
    setBills,
    setTransactions,
    setAllTransactions,
    setSavingsGoals,
    setDebts,
    setPaycheckHistory,
    envelopes.length,
    bills.length,
    transactions.length,
    allTransactions.length,
  ]);

  return {
    isInitialized,
    initError,
    dataLoaded,
    cloudSyncEnabled,
  };
};

export default useDataInitialization;
