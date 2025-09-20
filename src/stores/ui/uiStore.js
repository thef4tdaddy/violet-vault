import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { persist, devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import logger from "../../utils/common/logger.js";
import { budgetDb, setBudgetMetadata } from "../../db/budgetDb.js";

const LOCAL_ONLY_MODE = import.meta.env.VITE_LOCAL_ONLY_MODE === "true";

// Migration function to handle old localStorage format
const migrateOldData = async () => {
  try {
    const oldData = localStorage.getItem("budget-store");

    // Migrate if old data exists
    if (oldData) {
      logger.info("Migrating data from old budget-store to violet-vault-store", {
        source: "migrateOldData",
      });

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
            supplementalAccounts: parsedOldData.state.supplementalAccounts || [],
            debts: parsedOldData.state.debts || [],
            unassignedCash: parsedOldData.state.unassignedCash || 0,
            biweeklyAllocation: parsedOldData.state.biweeklyAllocation || 0,
            paycheckHistory: parsedOldData.state.paycheckHistory || [],
            actualBalance: parsedOldData.state.actualBalance || 0,
          },
          version: 0,
        };

        localStorage.setItem("violet-vault-store", JSON.stringify(transformedData));
        logger.info("Data migration completed successfully - replaced existing data", {
          source: "migrateOldData",
        });

        // Seed Dexie with migrated data so hooks can access it
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
  setCloudSyncEnabled(enabled) {
    return set((state) => {
      state.cloudSyncEnabled = enabled;
      logger.info(`Cloud sync ${enabled ? "enabled" : "disabled"}`, {
        cloudSyncEnabled: enabled,
      });
    });
  },

  // PWA Update Management
  setUpdateAvailable: (available) =>
    set((state) => {
      state.updateAvailable = available;
      logger.info(`PWA update ${available ? "available" : "not available"}`, {
        updateAvailable: available,
      });
    }),

  setIsUpdating: (updating) =>
    set((state) => {
      state.isUpdating = updating;
    }),

  showInstallModal: () =>
    set((state) => {
      state.showInstallPrompt = true;
    }),

  hideInstallModal: () =>
    set((state) => {
      state.showInstallPrompt = false;
    }),

  setInstallPromptEvent: (event) =>
    set((state) => {
      state.installPromptEvent = event;
    }),

  // PWA Update Action
  async updateApp() {
    // Safe external store access (prevents React error #185)
    const state = useBudgetStore.getState();
    if (!state.updateAvailable) return;

    set((state) => {
      state.isUpdating = true;
    });

    try {
      // Clear the modal state before updating
      set((state) => {
        state.updateAvailable = false;
        state.isUpdating = false;
      });

      // Trigger service worker update
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          // Signal the waiting service worker to skip waiting
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        } else {
          // Fallback to window reload
          window.location.reload();
        }
      } else {
        window.location.reload();
      }
    } catch (error) {
      logger.error("Failed to update app", error);
      set((state) => {
        state.isUpdating = false;
        state.updateAvailable = true; // Keep the modal available on error
      });
    }
  },

  // PWA Install Action
  async installApp() {
    // Safe external store access (prevents React error #185)
    const state = useBudgetStore.getState();
    if (!state.installPromptEvent) return false;

    try {
      const promptEvent = state.installPromptEvent;
      const result = await promptEvent.prompt();

      logger.info("PWA install prompt result", { outcome: result.outcome });

      // Track user choice for analytics
      const userChoice = result.outcome;
      const analytics = {
        action: "pwa_install_prompt",
        choice: userChoice,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      };

      // Store analytics locally (could be enhanced to send to analytics service)
      const existingAnalytics = JSON.parse(localStorage.getItem("pwa_analytics") || "[]");
      existingAnalytics.push(analytics);
      localStorage.setItem("pwa_analytics", JSON.stringify(existingAnalytics.slice(-50))); // Keep last 50 events

      logger.info("PWA install choice tracked", analytics);

      // Clear the install prompt event
      set((state) => {
        state.installPromptEvent = null;
        state.showInstallPrompt = false;
      });

      return result.outcome === "accepted";
    } catch (error) {
      logger.error("Failed to install PWA", error);
      return false;
    }
  },

  // Manual PWA Install (for settings)
  async manualInstall() {
    // Safe external store access (prevents React error #185)
    const state = useBudgetStore.getState();

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      logger.info("PWA is already installed");
      return { success: false, reason: "already_installed" };
    }

    // Check if install prompt is available
    if (!state.installPromptEvent) {
      logger.warn("No install prompt event available");
      return { success: false, reason: "not_available" };
    }

    // Use the regular install method - safe external store access
    const success = await useBudgetStore.getState().installApp();
    return { success, reason: success ? "installed" : "declined" };
  },

  // Track install prompt dismissal
  dismissInstallPrompt() {
    const now = Date.now();
    const analytics = {
      action: "pwa_install_prompt_dismissed",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };

    // Store analytics
    const existingAnalytics = JSON.parse(localStorage.getItem("pwa_analytics") || "[]");
    existingAnalytics.push(analytics);
    localStorage.setItem("pwa_analytics", JSON.stringify(existingAnalytics.slice(-50)));

    // Store dismissal timestamp for cooldown
    localStorage.setItem("pwa_install_last_dismissed", now.toString());

    logger.info("PWA install prompt dismissed", analytics);

    set((state) => {
      state.showInstallPrompt = false;
    });
  },

  // Patch Notes Management
  showPatchNotesModal: (patchNotesData) =>
    set((state) => {
      state.showPatchNotes = true;
      state.patchNotesData = patchNotesData;
      logger.info("Showing patch notes modal", {
        version: patchNotesData?.version,
      });
    }),

  hidePatchNotesModal: () =>
    set((state) => {
      state.showPatchNotes = false;
      state.patchNotesData = null;
    }),

  setLoadingPatchNotes: (loading) =>
    set((state) => {
      state.loadingPatchNotes = loading;
    }),

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
  async startBackgroundSync() {
    try {
      // Safe external store access (prevents React error #185)
      const state = useBudgetStore.getState();
      if (!state.cloudSyncEnabled) {
        logger.info("Cloud sync disabled - skipping background sync start");
        return;
      }

      // Import auth store to get current user info
      const { useAuth } = await import("../auth/authStore");
      const authState = useAuth.getState();

      if (!authState.isUnlocked || !authState.budgetId || !authState.encryptionKey) {
        logger.warn("Cannot start background sync - missing auth data", {
          isUnlocked: authState.isUnlocked,
          hasBudgetId: !!authState.budgetId,
          hasEncryptionKey: !!authState.encryptionKey,
        });
        return;
      }

      // Import and start the cloud sync service
      const { cloudSyncService } = await import("../../services/cloudSyncService");

      const syncConfig = {
        budgetId: authState.budgetId,
        encryptionKey: authState.encryptionKey,
        currentUser: authState.currentUser,
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

export default useUiStore;

// Legacy compatibility export
export { useUiStore as useBudgetStore };
