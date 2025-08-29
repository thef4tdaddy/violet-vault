import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../../utils/common/logger.js";
import { budgetDb, setBudgetMetadata } from "../../db/budgetDb";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Migration function to handle old localStorage format
const migrateOldData = async () => {
  try {
    const oldData = localStorage.getItem("budget-store");

    // Migrate if old data exists
    if (oldData) {
      logger.info(
        "Migrating data from old budget-store to violet-vault-store",
        {
          source: "migrateOldData",
        },
      );

      const parsedOldData = JSON.parse(oldData);

      // Transform old reducer-based format to new direct format
      if (parsedOldData?.state) {
        const transformedData = {
          state: {
            envelopes: parsedOldData.state.envelopes || [],
            bills: parsedOldData.state.bills || [],
            transactions: parsedOldData.state.transactions || [],
            allTransactions: parsedOldData.state.allTransactions || [],
            savingsGoals: parsedOldData.state.savingsGoals || [],
            supplementalAccounts:
              parsedOldData.state.supplementalAccounts || [],
            debts: parsedOldData.state.debts || [],
            unassignedCash: parsedOldData.state.unassignedCash || 0,
            biweeklyAllocation: parsedOldData.state.biweeklyAllocation || 0,
            paycheckHistory: parsedOldData.state.paycheckHistory || [],
            actualBalance: parsedOldData.state.actualBalance || 0,
          },
          version: 0,
        };

        localStorage.setItem(
          "violet-vault-store",
          JSON.stringify(transformedData),
        );
        logger.info(
          "Data migration completed successfully - replaced existing data",
          {
            source: "migrateOldData",
          },
        );

        // Seed Dexie with migrated data so hooks can access it
        await budgetDb.bulkUpsertEnvelopes(transformedData.state.envelopes);
        await budgetDb.bulkUpsertBills(transformedData.state.bills);
        await budgetDb.bulkUpsertTransactions(
          transformedData.state.allTransactions.length > 0
            ? transformedData.state.allTransactions
            : transformedData.state.transactions,
        );
        await budgetDb.bulkUpsertSavingsGoals(
          transformedData.state.savingsGoals,
        );
        await budgetDb.bulkUpsertDebts(transformedData.state.debts);
        await budgetDb.bulkUpsertPaychecks(
          transformedData.state.paycheckHistory,
        );

        // Save unassignedCash and actualBalance to Dexie metadata
        await setBudgetMetadata({
          unassignedCash: transformedData.state.unassignedCash || 0,
          actualBalance: transformedData.state.actualBalance || 0,
        });

        // Remove old data after successful migration
        localStorage.removeItem("budget-store");
        logger.info("Cleaned up old budget-store data", {
          source: "migrateOldData",
        });
      }
    }
  } catch (error) {
    logger.warn("Failed to migrate old data", {
      error: error.message,
      source: "migrateOldData",
    });
  }
};

// UI Store configuration - handles UI state, settings, and app preferences
// Data arrays are handled by TanStack Query → Dexie architecture
const storeInitializer = (set, get) => ({
  // UI State and Settings
  biweeklyAllocation: 0,
  // Unassigned cash modal state
  isUnassignedCashModalOpen: false,
  paycheckHistory: [], // Paycheck history for payday predictions
  isActualBalanceManual: false, // Track if balance was manually set
  isOnline: true, // Add isOnline state, default to true
  dataLoaded: false,
  cloudSyncEnabled: true, // Toggle for Firestore cloud sync (default enabled)

  // NOTE: Data arrays (envelopes, transactions, etc.) are now handled by TanStack Query → Dexie
  // Zustand only contains UI state and app settings

  // Transfer funds logic moved to TanStack Query hooks

  // Data selectors moved to TanStack Query hooks

  // Transaction operations moved to TanStack Query hooks

  // Bills operations moved to TanStack Query hooks

  // Debt operations moved to TanStack Query hooks

  // Savings goals operations moved to TanStack Query hooks

  // Supplemental accounts operations moved to TanStack Query hooks

  // NOTE: unassignedCash now handled by TanStack Query → Dexie, not Zustand

  setBiweeklyAllocation: (amount) =>
    set((state) => {
      state.biweeklyAllocation = amount;
    }),

  // Unassigned cash modal management
  openUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = true;
    }),

  closeUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = false;
    }),

  // Actual balance management
  // NOTE: actualBalance now handled by TanStack Query → Dexie, not Zustand

  // Reconcile transaction moved to TanStack Query hooks

  // Paycheck history management
  setPaycheckHistory: (history) =>
    set((state) => {
      state.paycheckHistory = history;
    }),

  // Data loading state
  setDataLoaded: (loaded) =>
    set((state) => {
      state.dataLoaded = loaded;
    }),

  // Background sync management moved to auth store

  // Add an action to set the online status
  setOnlineStatus: (status) =>
    set((state) => {
      state.isOnline = status;
    }),

  // Toggle cloud sync (Firestore)
  setCloudSyncEnabled: (enabled) =>
    set((state) => {
      state.cloudSyncEnabled = enabled;
      logger.info(`Cloud sync ${enabled ? "enabled" : "disabled"}`, {
        cloudSyncEnabled: enabled,
      });
    }),

  // Run migration on first use
  async runMigrationIfNeeded() {
    try {
      await migrateOldData();
    } catch (error) {
      logger.warn("Migration failed in store", { error: error.message });
    }
  },

  // Start background sync service
  async startBackgroundSync() {
    try {
      const state = get();
      if (!state.cloudSyncEnabled) {
        logger.info("Cloud sync disabled - skipping background sync start");
        return;
      }

      // Import auth store to get current user info
      const { useAuth } = await import("../auth/authStore");
      const authState = useAuth.getState();

      if (
        !authState.isUnlocked ||
        !authState.budgetId ||
        !authState.encryptionKey
      ) {
        logger.warn("Cannot start background sync - missing auth data", {
          isUnlocked: authState.isUnlocked,
          hasBudgetId: !!authState.budgetId,
          hasEncryptionKey: !!authState.encryptionKey,
        });
        return;
      }

      // Import and start the cloud sync service
      const { cloudSyncService } = await import(
        "../../services/cloudSyncService"
      );

      const syncConfig = {
        budgetId: authState.budgetId,
        encryptionKey: authState.encryptionKey,
      };

      cloudSyncService.start(syncConfig);
      logger.info("Background sync service started successfully");
    } catch (error) {
      logger.error("Failed to start background sync service", error);
    }
  },

  // Reset UI state only - data arrays handled by TanStack Query/Dexie
  resetAllData: () => {
    logger.info("Resetting UI state");
    set((state) => {
      // Reset UI state
      state.biweeklyAllocation = 0;
      state.isActualBalanceManual = false;
      state.dataLoaded = false;
      state.isUnassignedCashModalOpen = false;
      state.paycheckHistory = [];
    });
  },

  // Transaction cleanup moved to TanStack Query hooks

  // Data loading moved to useDataManagement hook

  // Data reset moved to useDataManagement hook

  // Password validation moved to auth store

  // Legacy compatibility: Debt management moved to TanStack Query hooks
  setDebts: () => {
    logger.warn(
      "setDebts called - debts are now managed by TanStack Query/useDebts hook",
      {
        source: "budgetStore.setDebts",
        migration: "Use useDebts() hook instead",
      },
    );
  },
});

const base = subscribeWithSelector(immer(storeInitializer));

let useUiStore;

if (LOCAL_ONLY_MODE) {
  // No persistence when running in local-only mode
  useUiStore = create(base);
} else {
  useUiStore = create(
    devtools(
      persist(base, {
        name: "violet-vault-ui-store",
        partialize: (state) => ({
          // UI and app state only (data arrays handled by TanStack Query → Dexie)
          biweeklyAllocation: state.biweeklyAllocation,
          paycheckHistory: state.paycheckHistory,
          isActualBalanceManual: state.isActualBalanceManual,
          cloudSyncEnabled: state.cloudSyncEnabled,
          isOnline: state.isOnline,
          isUnassignedCashModalOpen: state.isUnassignedCashModalOpen,
          dataLoaded: state.dataLoaded,
        }),
      }),
      { name: "violet-vault-ui-devtools" },
    ),
  );
}

export default useUiStore;

// Legacy compatibility export
export { useUiStore as useBudgetStore };
