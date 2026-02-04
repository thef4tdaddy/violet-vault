import { create, type StoreApi, type UseBoundStore } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "@/utils/core/common/logger";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

import {
  createBasicActions,
  createPWAUpdateActions,
  createPatchNotesActions,
  type BeforeInstallPromptEvent,
  type ImmerSet,
} from "./uiStoreActions.ts";

// UiStore interface - declared before use in storeInitializer
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

  // Basic actions
  setBiweeklyAllocation: (amount: number) => void;
  openUnassignedCashModal: () => void;
  closeUnassignedCashModal: () => void;
  setPaycheckHistory: (history: UiStore["paycheckHistory"]) => void;
  setDataLoaded: (loaded: boolean) => void;
  setOnlineStatus: (status: boolean) => void;
  setCloudSyncEnabled: (enabled: boolean) => void;

  // PWA Update actions
  setUpdateAvailable: (available: boolean) => void;
  setIsUpdating: (updating: boolean) => void;
  showInstallModal: () => void;
  hideInstallModal: () => void;
  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void;
  updateApp: () => Promise<void>;
  installApp: () => Promise<boolean>;
  manualInstall: () => Promise<{ success: boolean; reason: string }>;
  dismissInstallPrompt: () => void;

  // Patch notes actions
  showPatchNotesModal: (patchNotesData: { version: string; notes: string[] }) => void;
  hidePatchNotesModal: () => void;
  loadPatchNotesForUpdate: (fromVersion: string, toVersion: string) => Promise<unknown>;

  // Other actions
  startBackgroundSync: () => Promise<void>;
  resetAllData: () => void;
  setDebts: () => void;
}

// UI Store configuration - handles UI state, settings, and app preferences
// Data arrays are handled by TanStack Query → Dexie architecture
const storeInitializer = (set: ImmerSet<UiStore>, _get: () => UiStore) => ({
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

  // Placeholders for actions injected after store creation
  updateApp: async () => {},
  installApp: async () => false,
  manualInstall: async () => ({ success: false, reason: "Not initialized" }),
  dismissInstallPrompt: () => {},

  // Load and show patch notes for version update
  async loadPatchNotesForUpdate(fromVersion: string, toVersion: string) {
    set((state) => {
      state.loadingPatchNotes = true;
    });

    try {
      const { default: patchNotesManager } = await import("@/utils/platform/pwa/patchNotesManager");
      const patchNotes = await patchNotesManager.getPatchNotesForVersion(toVersion);

      set((state) => {
        state.loadingPatchNotes = false;
        state.showPatchNotes = true;
        state.patchNotesData = patchNotes as {
          version: string;
          notes: string[];
          fromVersion?: string;
          toVersion?: string;
          isUpdate?: boolean;
        };
        if (state.patchNotesData) {
          state.patchNotesData.fromVersion = fromVersion;
          state.patchNotesData.toVersion = toVersion;
          state.patchNotesData.isUpdate = true;
        }
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

  // Start background sync service
  // Note: Auth data should be passed as a parameter from components using AuthContext
  // This method is kept for backward compatibility but should receive auth data externally
  async startBackgroundSync() {
    logger.info(
      "uiStore: startBackgroundSync is deprecated, use SyncOrchestrator directly via AuthContext"
    );
  },

  // Reset UI state only - data arrays handled by TanStack Query/Dexie
  resetAllData() {
    logger.info("Resetting UI state");
    set((state: UiStore) => {
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

// Store type - declared after base for proper typing
type UiStoreType = UseBoundStore<StoreApi<UiStore>>;
let useUiStore: UiStoreType;

if (LOCAL_ONLY_MODE) {
  // No persistence when running in local-only mode
  useUiStore = create<UiStore>()(base as never);
} else {
  useUiStore = create<UiStore>()(
    devtools(
      persist(base as never, {
        name: "violet-vault-ui-store",
        partialize: (state: UiStore) => ({
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
    ) as never
  );
}

// Add PWA install and update actions after store creation (they need useUiStore reference)
import { createUpdateAppAction, createInstallAppAction } from "./uiStoreActions.ts";
Object.assign(
  useUiStore.getState(),
  createUpdateAppAction(useUiStore.setState as unknown as ImmerSet<UiStore>)
);
Object.assign(
  useUiStore.getState(),
  createInstallAppAction(useUiStore.setState as unknown as ImmerSet<UiStore>, useUiStore)
);

export default useUiStore;

// Legacy compatibility export
export { useUiStore as useBudgetStore };
