import logger from "@/utils/core/common/logger";
import { checkForVersionUpdate } from "@/utils/core/common/version";
import type { BeforeInstallPromptEvent } from "@/stores/ui/uiStoreActions";

/**
 * PWA Manager
 * Handles service worker registration, update detection, and install prompts
 */

interface UIStore {
  setUpdateAvailable: (available: boolean) => void;
  getState: () => {
    setUpdateAvailable: (available: boolean) => void;
    setInstallPromptEvent: (event: BeforeInstallPromptEvent | null) => void;
    showInstallModal: () => void;
    installPromptEvent: BeforeInstallPromptEvent | null;
    loadPatchNotesForUpdate: (fromVersion: string, toVersion: string) => Promise<void>;
  };
  hideInstallModal: () => void;
  updateAvailable?: boolean;
  installPromptEvent?: BeforeInstallPromptEvent | null;
}

class PWAManager {
  registration: ServiceWorkerRegistration | null;
  uiStore: UIStore | null;
  isInitialized: boolean;

  constructor() {
    this.registration = null;
    this.uiStore = null;
    this.isInitialized = false;
  }

  /**
   * Initialize PWA Manager with UI store
   */
  async initialize(uiStore: UIStore) {
    if (this.isInitialized) return;

    this.uiStore = uiStore;

    // Register service worker and set up event listeners
    await this.registerServiceWorker();
    this.setupInstallPrompt();
    this.setupUpdateDetection();

    // Check for version updates (patch notes)
    this.checkForVersionUpdate();

    this.isInitialized = true;
    logger.info("🔧 PWA Manager initialized successfully");
  }

  /**
   * Register the service worker
   */
  async registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
      logger.warn("Service Worker not supported in this browser");
      return;
    }

    try {
      // Let Vite PWA plugin handle the registration automatically
      // We just need to get the registration for update detection
      this.registration = (await navigator.serviceWorker.getRegistration()) ?? null;

      if (this.registration) {
        logger.info("📱 Service Worker registration found", {
          scope: this.registration.scope,
          state: this.registration.active?.state,
        });

        // Listen for service worker updates
        this.registration.addEventListener("updatefound", () => {
          logger.info("🆕 Service Worker update found");
          this.handleUpdateFound();
        });

        // Check if there's already a waiting service worker
        if (this.registration.waiting) {
          logger.info("⏳ Service Worker already waiting");
          this.uiStore?.getState().setUpdateAvailable(true);
        }
      } else {
        logger.info("⏳ Waiting for service worker registration...");
        // Wait for registration to be available
        setTimeout(() => this.registerServiceWorker(), 1000);
      }
    } catch (error) {
      logger.error("❌ Service Worker registration failed", error);
    }
  }

  /**
   * Handle service worker update found
   */
  handleUpdateFound() {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener("statechange", () => {
      logger.info("🔄 Service Worker state changed", {
        state: newWorker.state,
      });

      if (newWorker.state === "installed") {
        if (navigator.serviceWorker.controller) {
          // New service worker is ready to activate
          logger.info("✅ New service worker installed and ready");
          this.uiStore?.getState().setUpdateAvailable(true);
        } else {
          // First time install
          logger.info("🎉 Service worker installed for the first time");
        }
      }
    });
  }

  /**
   * Set up install prompt detection
   */
  setupInstallPrompt() {
    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", (event: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();

      logger.info("📱 PWA install prompt available");

      // Store the event for later use
      this.uiStore?.getState().setInstallPromptEvent(event as BeforeInstallPromptEvent);

      // Check if user has dismissed install prompt recently
      const lastDismissed = localStorage.getItem("pwa_install_last_dismissed");
      const dismissCooldown = 24 * 60 * 60 * 1000; // 24 hours

      if (lastDismissed && Date.now() - parseInt(lastDismissed) < dismissCooldown) {
        logger.info("Install prompt dismissed recently, skipping automatic prompt");
        return;
      }

      // Show install prompt after a delay to not be intrusive
      // Longer delay if user has used the app before
      const hasUsedApp = localStorage.getItem("pwa_analytics") !== null;
      const delay = hasUsedApp ? 10000 : 5000; // 10s for returning users, 5s for new users

      setTimeout(() => {
        // Double-check that the prompt is still available
        if (this.uiStore?.getState().installPromptEvent) {
          this.uiStore?.getState().showInstallModal();
        }
      }, delay);
    });

    // Listen for app installation
    window.addEventListener("appinstalled", () => {
      logger.info("🎉 PWA was installed successfully");
      this.uiStore?.getState().setInstallPromptEvent(null);
      this.uiStore?.hideInstallModal();
    });

    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      logger.info("📱 PWA is already installed and running in standalone mode");
    }
  }

  /**
   * Set up update detection and handling
   */
  setupUpdateDetection() {
    // Listen for service worker controlling the page
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      logger.info("🔄 Service worker controller changed - reloading page");
      window.location.reload();
    });

    // Handle messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      const { type, payload } = event.data as { type: string; payload?: unknown };

      switch (type) {
        case "UPDATE_AVAILABLE":
          logger.info("📡 Received update available message from service worker");
          this.uiStore?.getState().setUpdateAvailable(true);
          break;
        case "UPDATE_INSTALLED":
          logger.info("✅ Update installed, app will refresh");
          break;
        default:
          logger.debug("📡 Received message from service worker", {
            type,
            payload,
          });
      }
    });
  }

  /**
   * Check for updates manually
   */
  async checkForUpdates() {
    if (!this.registration) {
      logger.warn("No service worker registration found");
      return false;
    }

    try {
      logger.info("🔍 Manually checking for updates...");
      await this.registration.update();
      return true;
    } catch (error) {
      logger.error("❌ Manual update check failed", error);
      return false;
    }
  }

  /**
   * Get PWA installation status
   */
  getInstallationStatus() {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isInstallable = !!this.uiStore?.getState().installPromptEvent;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    return {
      isInstalled: isStandalone,
      isInstallable: isInstallable && !isStandalone,
      isIOS,
      canPromptInstall: isInstallable && !isStandalone && !isIOS,
    };
  }

  /**
   * Check for version updates and show patch notes if needed
   */
  checkForVersionUpdate() {
    try {
      const versionCheck = checkForVersionUpdate();

      if (versionCheck.hasUpdate) {
        logger.info("🎉 Version update detected, showing patch notes", {
          fromVersion: versionCheck.lastSeenVersion,
          toVersion: versionCheck.currentVersion,
        });

        // Show patch notes after a short delay to allow app to fully load
        setTimeout(() => {
          if (versionCheck.lastSeenVersion) {
            this.uiStore
              ?.getState()
              .loadPatchNotesForUpdate(versionCheck.lastSeenVersion, versionCheck.currentVersion);
          }
        }, 2000); // 2 second delay
      } else if (versionCheck.isFirstTime) {
        logger.info("👋 First time user detected, not showing patch notes");
      } else {
        logger.debug("✅ No version update, current version already seen");
      }
    } catch (error) {
      logger.error("❌ Failed to check for version update:", error);
    }
  }

  /**
   * Get current PWA status for debugging
   */
  getStatus() {
    const installStatus = this.getInstallationStatus();

    return {
      isInitialized: this.isInitialized,
      hasRegistration: !!this.registration,
      registrationScope: this.registration?.scope,
      serviceWorkerState: this.registration?.active?.state,
      hasWaitingWorker: !!this.registration?.waiting,
      updateAvailable: this.uiStore?.getState().setUpdateAvailable ? false : false,
      ...installStatus,
    };
  }
}

// Create singleton instance
const pwaManager = new PWAManager();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).pwaManager = pwaManager;
}

export type { UIStore as PWAManagerUiStore };
export default pwaManager;
