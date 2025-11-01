/**
 * UI Store Actions - Helper functions to build store actions
 * Extracted from uiStore.ts to reduce function size
 */
import logger from "@/utils/common/logger";
import type {
  UIStoreSet,
  PaycheckHistory,
  PatchNotesData,
  BeforeInstallPromptEvent,
  UIStore,
} from "./uiStoreTypes";

/**
 * Create basic state management actions
 */
export const createBasicActions = (set: UIStoreSet) => ({
  setBiweeklyAllocation: (amount: number) =>
    set((state: UIStore) => {
      state.biweeklyAllocation = amount;
    }),

  openUnassignedCashModal: () =>
    set((state: UIStore) => {
      state.isUnassignedCashModalOpen = true;
    }),

  closeUnassignedCashModal: () =>
    set((state: UIStore) => {
      state.isUnassignedCashModalOpen = false;
    }),

  setPaycheckHistory: (history: PaycheckHistory[]) =>
    set((state: UIStore) => {
      state.paycheckHistory = history;
    }),

  setDataLoaded: (loaded: boolean) =>
    set((state: UIStore) => {
      state.dataLoaded = loaded;
    }),

  setOnlineStatus: (status: boolean) =>
    set((state: UIStore) => {
      state.isOnline = status;
    }),

  setCloudSyncEnabled(enabled: boolean) {
    return set((state: UIStore) => {
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
export const createPWAUpdateActions = (set: UIStoreSet) => ({
  setUpdateAvailable: (available: boolean) =>
    set((state: UIStore) => {
      state.updateAvailable = available;
      logger.info(`PWA update ${available ? "available" : "not available"}`, {
        updateAvailable: available,
      });
    }),

  setIsUpdating: (updating: boolean) =>
    set((state: UIStore) => {
      state.isUpdating = updating;
    }),

  showInstallModal: () =>
    set((state: UIStore) => {
      state.showInstallPrompt = true;
    }),

  hideInstallModal: () =>
    set((state: UIStore) => {
      state.showInstallPrompt = false;
    }),

  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) =>
    set((state: UIStore) => {
      state.installPromptEvent = event;
    }),
});

/**
 * Create PWA update action
 */
export const createUpdateAppAction = (set: UIStoreSet) => ({
  async updateApp() {
    let shouldUpdate = false;
    set((state: UIStore) => {
      shouldUpdate = state.updateAvailable;
      if (shouldUpdate) {
        state.isUpdating = true;
      }
    });

    if (!shouldUpdate) return;

    try {
      set((state: UIStore) => {
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
      set((state: UIStore) => {
        state.isUpdating = false;
        state.updateAvailable = true;
      });
    }
  },
});

/**
 * Analytics event data
 */
interface AnalyticsEvent extends Record<string, unknown> {
  action: string;
  choice?: string;
  timestamp: string;
  userAgent: string;
  platform: string;
}

/**
 * Track analytics event in local storage
 */
const trackAnalytics = (eventData: AnalyticsEvent): void => {
  try {
    const existingAnalytics: AnalyticsEvent[] = JSON.parse(
      localStorage.getItem("pwa_analytics") || "[]"
    );
    existingAnalytics.push(eventData);
    localStorage.setItem("pwa_analytics", JSON.stringify(existingAnalytics.slice(-50)));
  } catch (error) {
    logger.error("Failed to track analytics", error);
  }
};

/**
 * UI Store reference type
 */
interface UIStoreReference {
  getState: () => UIStore;
  setState: never; // Type is complex, use type assertion when passing
}

/**
 * Create PWA install action
 */
export const createInstallAppAction = (set: UIStoreSet, useUiStore: UIStoreReference) => ({
  async installApp(): Promise<boolean> {
    const state = useUiStore.getState();
    if (!state.installPromptEvent) return false;

    try {
      const promptEvent = state.installPromptEvent;
      const result = await promptEvent.prompt();

      logger.info("PWA install prompt result", { outcome: result.outcome });

      const analytics: AnalyticsEvent = {
        action: "pwa_install_prompt",
        choice: result.outcome,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      };

      trackAnalytics(analytics);
      logger.info("PWA install choice tracked", analytics);

      set((state: UIStore) => {
        state.installPromptEvent = null;
        state.showInstallPrompt = false;
      });

      return result.outcome === "accepted";
    } catch (error) {
      logger.error("Failed to install PWA", error);
      return false;
    }
  },

  async manualInstall(): Promise<{ success: boolean; reason: string }> {
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
      const promptEvent = state.installPromptEvent;
      const result = await promptEvent.prompt();

      logger.info("Manual PWA install result", { outcome: result.outcome });

      const analytics: AnalyticsEvent = {
        action: "pwa_manual_install",
        choice: result.outcome,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: navigator.platform,
      };

      trackAnalytics(analytics);

      set((state: UIStore) => {
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

  dismissInstallPrompt(): void {
    const now = Date.now();
    const analytics: AnalyticsEvent = {
      action: "pwa_install_prompt_dismissed",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
    };

    trackAnalytics(analytics);
    localStorage.setItem("pwa_install_last_dismissed", now.toString());
    logger.info("PWA install prompt dismissed", analytics);

    set((state: UIStore) => {
      state.showInstallPrompt = false;
    });
  },
});

/**
 * Create patch notes management actions
 */
export const createPatchNotesActions = (set: UIStoreSet) => ({
  showPatchNotesModal: (patchNotesData: PatchNotesData) =>
    set((state: UIStore) => {
      state.showPatchNotes = true;
      state.patchNotesData = patchNotesData;
      logger.info("Showing patch notes modal", {
        version: patchNotesData?.version,
      });
    }),

  hidePatchNotesModal: () =>
    set((state: UIStore) => {
      state.showPatchNotes = false;
      state.patchNotesData = null;
    }),
});
