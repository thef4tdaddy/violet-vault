import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../../utils/common/logger.ts";
import { budgetDb, setBudgetMetadata } from "../../db/budgetDb.ts";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

/**
 * Transform old data format to new format
 */
const transformOldData = (parsedOldData) => ({
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
const seedDexieWithMigratedData = async (transformedData) => {
  await budgetDb.bulkUpsertEnvelopes(transformedData.state.envelopes);
  await budgetDb.bulkUpsertBills(transformedData.state.bills);
  await budgetDb.bulkUpsertTransactions(
    transformedData.state.allTransactions.length > 0
      ? transformedData.state.allTransactions
      : transformedData.state.transactions
  );
  await budgetDb.bulkUpsertSavingsGoals(transformedData.state.savingsGoals);
  await budgetDb.bulkUpsertDebts(transformedData.state.debts);
  await budgetDb.bulkUpsertPaychecks(transformedData.state.paycheckHistory);

  await setBudgetMetadata({
    unassignedCash: transformedData.state.unassignedCash || 0,
    actualBalance: transformedData.state.actualBalance || 0,
  });
};

/**
 * Migration function to handle old localStorage format
 */
const migrateOldData = async () => {
  try {
    const oldData = localStorage.getItem("budget-store");
    if (!oldData) return;

    logger.info("Migrating data from old budget-store to violet-vault-store", {
      source: "migrateOldData",
    });

    const parsedOldData = JSON.parse(oldData);
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
    logger.warn("Failed to migrate old data", {
      error: error.message,
      source: "migrateOldData",
    });
  }
};

import {
  createBasicActions,
  createPWAUpdateActions,
  createPatchNotesActions,
  type BeforeInstallPromptEvent,
} from "./uiStoreActions.ts";

// UI Store configuration - handles UI state, settings, and app preferences
// Data arrays are handled by TanStack Query → Dexie architecture
const storeInitializer = (set, _get) => ({
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
  async loadPatchNotesForUpdate(fromVersion, toVersion) {
    set((state) => {
      state.loadingPatchNotes = true;
    });

    try {
      const { default: patchNotesManager } = await import("../../utils/pwa/patchNotesManager");
      const patchNotes = await patchNotesManager.getPatchNotesForVersion(toVersion);

      set((state) => {
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
      set((state) => {
        state.loadingPatchNotes = false;
      });
      return null;
    }
  },

  // Run migration on first use
  async runMigrationIfNeeded() {
    try {
      await migrateOldData();
    } catch (error) {
      logger.warn("Migration failed in store", { error: error.message });
    }
  },

  // Start background sync service
  // Note: Auth data should be passed as a parameter from components using AuthContext
  // This method is kept for backward compatibility but should receive auth data externally
  async startBackgroundSync(authData?: {
    isUnlocked: boolean;
    budgetId: string;
    encryptionKey: CryptoKey | Uint8Array<ArrayBufferLike>;
    currentUser?:
      | {
          uid?: string;
          userName?: string;
          userColor?: string;
        }
      | string;
  }) {
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
      const { cloudSyncService } = await import("../../services/cloudSyncService");

      const normalizedUser =
        typeof authData.currentUser === "string"
          ? { userName: authData.currentUser }
          : authData.currentUser;

      const syncConfig = {
        budgetId: authData.budgetId,
        encryptionKey: authData.encryptionKey,
        currentUser: normalizedUser,
      };

      cloudSyncService.start(syncConfig);
      logger.info("Background sync service started successfully");
    } catch (error) {
      logger.error("Failed to start background sync service", error);
    }
  },

  // Reset UI state only - data arrays handled by TanStack Query/Dexie
  resetAllData() {
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
  setDebts() {
    logger.warn("setDebts called - debts are now managed by TanStack Query/useDebts hook", {
      source: "budgetStore.setDebts",
      migration: "Use useDebts() hook instead",
    });
  },
});

const base = subscribeWithSelector(immer(storeInitializer));

let useUiStore: typeof create<typeof base>;

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
}

// Add PWA install and update actions after store creation (they need useUiStore reference)
import { createUpdateAppAction, createInstallAppAction } from "./uiStoreActions.ts";
Object.assign(useUiStore.getState(), createUpdateAppAction(useUiStore.setState));
Object.assign(useUiStore.getState(), createInstallAppAction(useUiStore.setState, useUiStore));

// Create and export the store type
export interface UiStore {
  biweeklyAllocation: number;
  paycheckHistory: Array<{
    id: string;
    amount: number;
    date: string;
    payerName?: string;
    notes?: string;
  }>;
  isActualBalanceManual: boolean;
  cloudSyncEnabled: boolean;
  isOnline: boolean;
  isUnassignedCashModalOpen: boolean;
  dataLoaded: boolean;
  updateAvailable: boolean;
  isUpdating: boolean;
  showInstallPrompt: boolean;
  installPromptEvent: BeforeInstallPromptEvent | null;
  showPatchNotes: boolean;
  patchNotesData: {
    version: string;
    notes: string[];
    fromVersion?: string;
    toVersion?: string;
    isUpdate?: boolean;
  } | null;
  loadingPatchNotes: boolean;
}

export default useUiStore;

// Legacy compatibility export
export { useUiStore as useBudgetStore };
