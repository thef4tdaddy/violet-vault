/**
 * UI Store Actions - Helper functions to build store actions
 * Extracted from uiStore.ts to reduce function size
 */
import logger from "../../utils/common/logger";
import type { UiStore } from "./uiStore";
import type { Draft } from "immer";

// Define BeforeInstallPromptEvent interface since it's not in standard TypeScript types
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

// Type for the set function when using immer middleware
type ImmerSet<T> = (updater: (draft: Draft<T>) => void) => void;

/**
 * Create basic state management actions
 */
export const createBasicActions = (set: ImmerSet<UiStore>) => ({
  setBiweeklyAllocation: (amount: number) =>
    set((state) => {
      state.biweeklyAllocation = amount;
    }),

  openUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = true;
    }),

  closeUnassignedCashModal: () =>
    set((state) => {
      state.isUnassignedCashModalOpen = false;
    }),

  setPaycheckHistory: (history: UiStore["paycheckHistory"]) =>
    set((state) => {
      state.paycheckHistory = history;
    }),

  setDataLoaded: (loaded: boolean) =>
    set((state) => {
      state.dataLoaded = loaded;
    }),

  setOnlineStatus: (status: boolean) =>
    set((state) => {
      state.isOnline = status;
    }),

  setCloudSyncEnabled(enabled: boolean) {
    return set((state) => {
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
export const createPWAUpdateActions = (set: ImmerSet<UiStore>) => ({
  setUpdateAvailable: (available: boolean) =>
    set((state) => {
      state.updateAvailable = available;
      logger.info(`PWA update ${available ? "available" : "not available"}`, {
        updateAvailable: available,
      });
    }),

  setIsUpdating: (updating: boolean) =>
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

  setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) =>
    set((state) => {
      state.installPromptEvent = event;
    }),
});

/**
 * Create PWA update action
 */
export const createUpdateAppAction = (set: ImmerSet<UiStore>) => ({
  async updateApp() {
    let shouldUpdate = false;
    set((state) => {
      shouldUpdate = state.updateAvailable;
      if (shouldUpdate) {
        state.isUpdating = true;
      }
    });

    if (!shouldUpdate) return;

    try {
      set((state) => {
        state.updateAvailable = false;
        state.isUpdating = false;
      });

      logger.info("PWA update initiated - activating new service worker");

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.waiting) {
          // Tell the waiting service worker to activate
          registration.waiting.postMessage({ type: "SKIP_WAITING" });

          // The controllerchange event will fire when new SW takes over
          // We don't force a reload - let the user continue using the app
          // The new version will be active on next natural page load
          navigator.serviceWorker.addEventListener(
            "controllerchange",
            () => {
              logger.info("✅ Service worker activated! New version ready on next navigation.");
              // Show a subtle toast notification instead of forcing reload
              set((state) => {
                state.updateAvailable = false;
                state.isUpdating = false;
              });
            },
            { once: true }
          );
        }
      }
    } catch (error) {
      logger.error("Failed to update app", error);
      set((state) => {
        state.isUpdating = false;
        state.updateAvailable = true;
      });
    }
  },
});

/**
 * Track analytics event in local storage
 */
const trackAnalytics = (eventData: Record<string, unknown>) => {
  try {
    const existingAnalytics = JSON.parse(localStorage.getItem("pwa_analytics") || "[]");
    existingAnalytics.push(eventData);
    localStorage.setItem("pwa_analytics", JSON.stringify(existingAnalytics.slice(-50)));
  } catch (error) {
    logger.error("Failed to track analytics", error);
  }
};

/**
 * Create PWA install action
 */
export const createInstallAppAction = (
  set: ImmerSet<UiStore>,
  useUiStore: { getState: () => UiStore }
) => ({
  async installApp() {
    const state = useUiStore.getState();
    if (!state.installPromptEvent) return false;

    try {
      const promptEvent = state.installPromptEvent;
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
      const promptEvent = state.installPromptEvent;
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

      set((state) => {
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

    set((state) => {
      state.showInstallPrompt = false;
    });
  },
});

/**
 * Create patch notes management actions
 */
export const createPatchNotesActions = (set: ImmerSet<UiStore>) => ({
  showPatchNotesModal: (patchNotesData: { version: string; notes: string[] }) =>
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
});
