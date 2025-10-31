import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "@/utils/common/logger";
import { budgetDb, setBudgetMetadata } from "@/db/budgetDb";
import type {
  UIStore,
  UIStoreState,
  UIStoreStaticActions,
  UIStoreSet,
  UIStoreGet,
  PatchNotesData,
  AuthData,
  PaycheckHistory,
} from "./uiStoreTypes";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

/**
 * Old data format type
 */
interface OldDataFormat {
  state: {
    envelopes: unknown[];
    bills: unknown[];
    transactions: unknown[];
    allTransactions: unknown[];
    savingsGoals: unknown[];
    supplementalAccounts: unknown[];
    debts: unknown[];
    unassignedCash: number;
    biweeklyAllocation: number;
    paycheckHistory: PaycheckHistory[];
    actualBalance: number;
  };
}

/**
 * Transformed data format
 */
interface TransformedData {
  state: {
    envelopes: unknown[];
    bills: unknown[];
    transactions: unknown[];
    allTransactions: unknown[];
    savingsGoals: unknown[];
    supplementalAccounts: unknown[];
    debts: unknown[];
    unassignedCash: number;
    biweeklyAllocation: number;
    paycheckHistory: PaycheckHistory[];
    actualBalance: number;
  };
  version: number;
}

/**
 * Transform old data format to new format
 */
const transformOldData = (parsedOldData: OldDataFormat): TransformedData => ({
  state: {
    envelopes: parsedOldData.state.envelopes || [],
    bills: parsedOldData.state.bills || [],
    transactions: parsedOldData.state.transactions || [],
    allTransactions: parsedOldData.state.allTransactions || [],
    savingsGoals: parsedOldData.state.savingsGoals || [],
    supplementalAccounts: parsedOldData.state.supplementalAccounts || [],
    debts: parsedOldData.state.debts || [],
    unassignedCash: parsedOldData.state.unassignedCash || 0,
    biweeklyAllocation: parsedOldData.state.biweeklyAllocation || 0,
    paycheckHistory: parsedOldData.state.paycheckHistory || [],
    actualBalance: parsedOldData.state.actualBalance || 0,
  },
  version: 0,
});

/**
 * Seed Dexie database with migrated data
 */
const seedDexieWithMigratedData = async (transformedData: TransformedData): Promise<void> => {
  await budgetDb.bulkUpsertEnvelopes(transformedData.state.envelopes as never[]);
  await budgetDb.bulkUpsertBills(transformedData.state.bills as never[]);
  await budgetDb.bulkUpsertTransactions(
    (transformedData.state.allTransactions.length > 0
      ? transformedData.state.allTransactions
      : transformedData.state.transactions) as never[]
  );
  await budgetDb.bulkUpsertSavingsGoals(transformedData.state.savingsGoals as never[]);
  await budgetDb.bulkUpsertDebts(transformedData.state.debts as never[]);
  await budgetDb.bulkUpsertPaychecks(transformedData.state.paycheckHistory as never[]);

  await setBudgetMetadata({
    unassignedCash: transformedData.state.unassignedCash || 0,
    actualBalance: transformedData.state.actualBalance || 0,
  });
};

/**
 * Migration function to handle old localStorage format
 */
const migrateOldData = async (): Promise<void> => {
  try {
    const oldData = localStorage.getItem("budget-store");
    if (!oldData) return;

    logger.info("Migrating data from old budget-store to violet-vault-store", {
      source: "migrateOldData",
    });

    const parsedOldData = JSON.parse(oldData) as OldDataFormat;
    if (!parsedOldData?.state) return;

    const transformedData = transformOldData(parsedOldData);
    localStorage.setItem("violet-vault-store", JSON.stringify(transformedData));

    logger.info("Data migration completed successfully - replaced existing data", {
      source: "migrateOldData",
    });

    await seedDexieWithMigratedData(transformedData);

    localStorage.removeItem("budget-store");
    logger.info("Cleaned up old budget-store data", {
      source: "migrateOldData",
    });
  } catch (error) {
    const err = error as Error;
    logger.warn("Failed to migrate old data", {
      error: err.message,
      source: "migrateOldData",
    });
  }
};

import {
  createBasicActions,
  createPWAUpdateActions,
  createPatchNotesActions,
} from "./uiStoreActions";

// UI Store configuration - handles UI state, settings, and app preferences
// Data arrays are handled by TanStack Query → Dexie architecture
const storeInitializer = (
  set: UIStoreSet,
  _get: UIStoreGet
): UIStoreState & UIStoreStaticActions => ({
  // UI State and Settings
  biweeklyAllocation: 0,
  // Unassigned cash modal state
  isUnassignedCashModalOpen: false,
  paycheckHistory: [], // Paycheck history for payday predictions
  isActualBalanceManual: false, // Track if balance was manually set
  isOnline: true, // Add isOnline state, default to true
  dataLoaded: false,
  cloudSyncEnabled: true, // Toggle for Firestore cloud sync (default enabled)

  // PWA Update Management
  updateAvailable: false,
  isUpdating: false,
  showInstallPrompt: false,
  installPromptEvent: null, // Store the beforeinstallprompt event

  // Patch Notes Management
  showPatchNotes: false,
  patchNotesData: null,
  loadingPatchNotes: false,

  // NOTE: Data arrays (envelopes, transactions, etc.) are now handled by TanStack Query → Dexie
  // Zustand only contains UI state and app settings

  // Basic state management actions
  ...createBasicActions(set),

  // PWA Update Management actions
  ...createPWAUpdateActions(set),

  // Patch Notes Management actions
  ...createPatchNotesActions(set),

  // Load and show patch notes for version update
  async loadPatchNotesForUpdate(
    fromVersion: string,
    toVersion: string
  ): Promise<PatchNotesData | null> {
    set((state: UIStore) => {
      state.loadingPatchNotes = true;
    });

    try {
      const { default: patchNotesManager } = await import("@/utils/pwa/patchNotesManager");
      const patchNotes = await patchNotesManager.getPatchNotesForVersion(toVersion);

      set((state: UIStore) => {
        state.loadingPatchNotes = false;
        state.showPatchNotes = true;
        state.patchNotesData = {
          ...patchNotes,
          fromVersion,
          toVersion,
          isUpdate: true,
        };
      });

      logger.info("Loaded patch notes for update", { fromVersion, toVersion });
      return patchNotes;
    } catch (error) {
      logger.error("Failed to load patch notes", error);
      set((state: UIStore) => {
        state.loadingPatchNotes = false;
      });
      return null;
    }
  },

  // Run migration on first use
  async runMigrationIfNeeded(): Promise<void> {
    try {
      await migrateOldData();
    } catch (error) {
      const err = error as Error;
      logger.warn("Migration failed in store", { error: err.message });
    }
  },

  // Start background sync service
  // Note: Auth data should be passed as a parameter from components using AuthContext
  // This method is kept for backward compatibility but should receive auth data externally
  async startBackgroundSync(authData?: AuthData): Promise<void> {
    try {
      // Safe external store access (prevents React error #185)
      const state = useUiStore.getState();
      if (!state.cloudSyncEnabled) {
        logger.info("Cloud sync disabled - skipping background sync start");
        return;
      }

      if (!authData || !authData.isUnlocked || !authData.budgetId || !authData.encryptionKey) {
        logger.warn("Cannot start background sync - missing auth data", {
          isUnlocked: authData?.isUnlocked,
          hasBudgetId: !!authData?.budgetId,
          hasEncryptionKey: !!authData?.encryptionKey,
        });
        return;
      }

      // Import and start the cloud sync service
      const { cloudSyncService } = await import("@/services/cloudSyncService");

      const syncConfig = {
        budgetId: authData.budgetId,
        encryptionKey: authData.encryptionKey,
        currentUser: authData.currentUser,
      };

      cloudSyncService.start(syncConfig);
      logger.info("Background sync service started successfully");
    } catch (error) {
      logger.error("Failed to start background sync service", error);
    }
  },

  // Reset UI state only - data arrays handled by TanStack Query/Dexie
  resetAllData(): void {
    logger.info("Resetting UI state");
    set((state: UIStore) => {
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
  setDebts(): void {
    logger.warn("setDebts called - debts are now managed by TanStack Query/useDebts hook", {
      source: "budgetStore.setDebts",
      migration: "Use useDebts() hook instead",
    });
  },
});

const base = subscribeWithSelector(immer(storeInitializer)) as never;

const useUiStore = LOCAL_ONLY_MODE
  ? create<UIStore>()(base)
  : create<UIStore>()(
      devtools(
        persist(base, {
          name: "violet-vault-ui-store",
          partialize: (state: UIStore) => ({
            // UI and app state only (data arrays handled by TanStack Query → Dexie)
            biweeklyAllocation: state.biweeklyAllocation,
            paycheckHistory: state.paycheckHistory,
            isActualBalanceManual: state.isActualBalanceManual,
            cloudSyncEnabled: state.cloudSyncEnabled,
            isOnline: state.isOnline,
            isUnassignedCashModalOpen: state.isUnassignedCashModalOpen,
            dataLoaded: state.dataLoaded,
            // PWA state (excluding non-serializable installPromptEvent)
            updateAvailable: state.updateAvailable,
            showInstallPrompt: state.showInstallPrompt,
            // Patch notes state (excluding runtime data)
            showPatchNotes: state.showPatchNotes,
          }),
        }),
        { name: "violet-vault-ui-devtools" }
      )
    );

// Add PWA install and update actions after store creation (they need useUiStore reference)
import { createUpdateAppAction, createInstallAppAction } from "./uiStoreActions";
Object.assign(useUiStore.getState(), createUpdateAppAction(useUiStore.setState as UIStoreSet));
Object.assign(
  useUiStore.getState(),
  createInstallAppAction(useUiStore.setState as UIStoreSet, useUiStore as never)
);

export default useUiStore;

// Legacy compatibility export
export { useUiStore as useBudgetStore };
