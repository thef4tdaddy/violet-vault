/**
 * UI Store Actions - Helper functions to build store actions
 * Extracted from uiStore.ts to reduce function size
 */
import logger from "../../utils/common/logger.ts";

// Type for Immer set function used by Zustand
type ImmerSet<T> = (fn: (state: T) => void) => void;

// UI Store state interface (minimal - only what actions need)
interface UIStoreState {
  biweeklyAllocation: number;
  isUnassignedCashModalOpen: boolean;
  paycheckHistory: unknown[];
  dataLoaded: boolean;
  isOnline: boolean;
  cloudSyncEnabled: boolean;
  updateAvailable: boolean;
  isUpdating: boolean;
  showInstallPrompt: boolean;
  installPromptEvent: Event | null;
  showPatchNotes: boolean;
  patchNotesData: unknown;
}

/**
 * Create basic state management actions
 */
export const createBasicActions = (set: ImmerSet<UIStoreState>) => ({
  setBiweeklyAllocation: (amount: number) =>
    set((state: UIStoreState) => {
      state.biweeklyAllocation = amount;
    }),

  openUnassignedCashModal: () =>
    set((state: UIStoreState) => {
      state.isUnassignedCashModalOpen = true;
    }),

  closeUnassignedCashModal: () =>
    set((state: UIStoreState) => {
      state.isUnassignedCashModalOpen = false;
    }),

  setPaycheckHistory: (history: unknown[]) =>
    set((state: UIStoreState) => {
      state.paycheckHistory = history;
    }),

  setDataLoaded: (loaded: boolean) =>
    set((state: UIStoreState) => {
      state.dataLoaded = loaded;
    }),

  setOnlineStatus: (status: boolean) =>
    set((state: UIStoreState) => {
      state.isOnline = status;
    }),

  setCloudSyncEnabled(enabled: boolean) {
    return set((state: UIStoreState) => {
      state.cloudSyncEnabled = enabled;
      logger.info(`Cloud sync ${enabled ? "enabled" : "disabled"}`, {
        cloudSyncEnabled: enabled,
      });
    });
  },
});

/**
 * Create PWA update management actions
 */
export const createPWAUpdateActions = (set: ImmerSet<UIStoreState>) => ({
  setUpdateAvailable: (available: boolean) =>
    set((state: UIStoreState) => {
      state.updateAvailable = available;
      logger.info(`PWA update ${available ? "available" : "not available"}`, {
        updateAvailable: available,
      });
    }),

  setIsUpdating: (updating: boolean) =>
    set((state: UIStoreState) => {
      state.isUpdating = updating;
    }),

  showInstallModal: () =>
    set((state: UIStoreState) => {
      state.showInstallPrompt = true;
    }),

  hideInstallModal: () =>
    set((state: UIStoreState) => {
      state.showInstallPrompt = false;
    }),

  setInstallPromptEvent: (event: Event | null) =>
    set((state: UIStoreState) => {
      state.installPromptEvent = event;
    }),
});

/**
 * Create PWA update action
 */
export const createUpdateAppAction = (set: ImmerSet<UIStoreState>) => ({
  async updateApp() {
    let shouldUpdate = false;
    set((state: UIStoreState) => {
      shouldUpdate = state.updateAvailable;
      if (shouldUpdate) {
        state.isUpdating = true;
      }
    });

    if (!shouldUpdate) return;

    try {
      set((state: UIStoreState) => {
        state.updateAvailable = false;
        state.isUpdating = false;
      });

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        } else {
          window.location.reload();
        }
      } else {
        window.location.reload();
      }
    } catch (error) {
      logger.error("Failed to update app", error);
      set((state: UIStoreState) => {
        state.isUpdating = false;
        state.updateAvailable = true;
      });
    }
  },
});

/**
 * Track analytics event in local storage
 */
const trackAnalytics = (eventData: unknown) => {
  try {
    const existingAnalytics = JSON.parse(localStorage.getItem("pwa_analytics") || "[]");
    existingAnalytics.push(eventData);
    localStorage.setItem("pwa_analytics", JSON.stringify(existingAnalytics.slice(-50)));
  } catch (error) {
    logger.error("Failed to track analytics", error);
  }
};

// Type for install prompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<{ outcome: string }>;
}

// Type for store with getState method
interface StoreWithGetState<T> {
  getState: () => T;
}

/**
 * Create PWA install action
 */
export const createInstallAppAction = (
  set: ImmerSet<UIStoreState>,
  useUiStore: StoreWithGetState<UIStoreState>
) => ({
  async installApp() {
    const state = useUiStore.getState();
    if (!state.installPromptEvent) return false;

    try {
      const promptEvent = state.installPromptEvent as BeforeInstallPromptEvent;
      const result = await promptEvent.prompt();

      logger.info("PWA install prompt result", { outcome: result.outcome });

      const analytics = {
        action: "pwa_install_prompt",
        choice: result.outcome,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      };

      trackAnalytics(analytics);
      logger.info("PWA install choice tracked", analytics);

      set((state: UIStoreState) => {
        state.installPromptEvent = null;
        state.showInstallPrompt = false;
      });

      return result.outcome === "accepted";
    } catch (error) {
      logger.error("Failed to install PWA", error);
      return false;
    }
  },

  async manualInstall() {
    const state = useUiStore.getState();

    if (window.matchMedia("(display-mode: standalone)").matches) {
      logger.info("PWA is already installed");
      return { success: false, reason: "already_installed" };
    }

    if (!state.installPromptEvent) {
      logger.warn("No install prompt event available");
      return { success: false, reason: "not_available" };
    }

    try {
      const promptEvent = state.installPromptEvent as BeforeInstallPromptEvent;
      const result = await promptEvent.prompt();

      logger.info("Manual PWA install result", { outcome: result.outcome });

      const analytics = {
        action: "pwa_manual_install",
        choice: result.outcome,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      };

      trackAnalytics(analytics);

      set((state: UIStoreState) => {
        state.installPromptEvent = null;
        state.showInstallPrompt = false;
      });

      const success = result.outcome === "accepted";
      return { success, reason: success ? "installed" : "declined" };
    } catch (error) {
      logger.error("Failed to manually install PWA", error);
      return { success: false, reason: "error" };
    }
  },

  dismissInstallPrompt() {
    const now = Date.now();
    const analytics = {
      action: "pwa_install_prompt_dismissed",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };

    trackAnalytics(analytics);
    localStorage.setItem("pwa_install_last_dismissed", now.toString());
    logger.info("PWA install prompt dismissed", analytics);

    set((state: UIStoreState) => {
      state.showInstallPrompt = false;
    });
  },
});

/**
 * Create patch notes management actions
 */
export const createPatchNotesActions = (set: ImmerSet<UIStoreState>) => ({
  showPatchNotesModal: (patchNotesData: unknown) =>
    set((state: UIStoreState) => {
      state.showPatchNotes = true;
      state.patchNotesData = patchNotesData;
      logger.info("Showing patch notes modal", {
        version: (patchNotesData as { version?: string })?.version,
      });
    }),

  hidePatchNotesModal: () =>
    set((state: UIStoreState) => {
      state.showPatchNotes = false;
      state.patchNotesData = null;
    }),
});
