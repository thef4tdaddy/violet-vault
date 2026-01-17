import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import pwaManager from "../pwaManager";
import logger from "@/utils/core/common/logger";
import * as versionModule from "@/utils/core/common/version";
import type { BeforeInstallPromptEvent } from "@/stores/ui/uiStoreActions";

// Mock dependencies
vi.mock("@/utils/core/common/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("@/utils/core/common/version", () => ({
  checkForVersionUpdate: vi.fn(() => ({
    hasUpdate: false,
    isFirstTime: false,
    currentVersion: "2.0.0",
    lastSeenVersion: "2.0.0",
  })),
}));

// Mock service worker
const mockServiceWorkerRegistration = {
  scope: "/",
  active: { state: "activated" },
  installing: null,
  waiting: null,
  update: vi.fn(),
  addEventListener: vi.fn(),
};

// Store original navigator.serviceWorker for restoration
const originalServiceWorker = global.navigator?.serviceWorker;

// Create mock service worker container
const createMockServiceWorker = () => ({
  getRegistration: vi.fn(),
  addEventListener: vi.fn(),
  controller: null,
});

global.navigator = {
  ...global.navigator,
  serviceWorker: createMockServiceWorker() as unknown as ServiceWorkerContainer,
  onLine: true,
  userAgent: "Mozilla/5.0",
};

// Mock window methods
global.window = {
  ...global.window,
  addEventListener: vi.fn(),
  location: {
    ...global.window.location,
    reload: vi.fn(),
  },
  matchMedia: vi.fn(() => ({
    matches: false,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })) as unknown as (query: string) => MediaQueryList,
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("PWAManager", () => {
  let mockUiStore: {
    setUpdateAvailable: ReturnType<typeof vi.fn>;
    getState: () => {
      setUpdateAvailable: ReturnType<typeof vi.fn>;
      setInstallPromptEvent: ReturnType<typeof vi.fn>;
      showInstallModal: ReturnType<typeof vi.fn>;
      installPromptEvent: null;
      loadPatchNotesForUpdate: ReturnType<typeof vi.fn>;
    };
    hideInstallModal: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();

    // Restore service worker mock if it was deleted
    if (!navigator.serviceWorker) {
      Object.defineProperty(navigator, "serviceWorker", {
        value: createMockServiceWorker(),
        configurable: true,
        writable: true,
      });
    } else {
      // Reset the mock functions
      (navigator.serviceWorker as unknown as ReturnType<typeof createMockServiceWorker>) =
        createMockServiceWorker() as unknown as ServiceWorkerContainer;
    }

    mockUiStore = {
      setUpdateAvailable: vi.fn(),
      getState: () => ({
        setUpdateAvailable: vi.fn(),
        setInstallPromptEvent: vi.fn(),
        showInstallModal: vi.fn(),
        installPromptEvent: null,
        loadPatchNotesForUpdate: vi.fn(),
      }),
      hideInstallModal: vi.fn(),
    };

    // Reset PWA manager state
    pwaManager.isInitialized = false;
    pwaManager.registration = null;
    pwaManager.uiStore = null;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialize", () => {
    it("should initialize PWA manager successfully", async () => {
      vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValue(
        mockServiceWorkerRegistration as ServiceWorkerRegistration
      );

      await pwaManager.initialize(mockUiStore);

      expect(pwaManager.isInitialized).toBe(true);
      expect(pwaManager.uiStore).toBe(mockUiStore);
      expect(logger.info).toHaveBeenCalledWith("🔧 PWA Manager initialized successfully");
    });

    it("should not reinitialize if already initialized", async () => {
      vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValue(
        mockServiceWorkerRegistration as ServiceWorkerRegistration
      );

      await pwaManager.initialize(mockUiStore);
      const firstCallCount = vi.mocked(logger.info).mock.calls.length;

      await pwaManager.initialize(mockUiStore);

      // Should not log initialization again
      expect(vi.mocked(logger.info).mock.calls.length).toBe(firstCallCount);
    });

    it("should handle service worker not supported", async () => {
      const originalServiceWorker = navigator.serviceWorker;
      // @ts-expect-error - Testing unsupported scenario
      delete navigator.serviceWorker;

      await pwaManager.initialize(mockUiStore);

      expect(logger.warn).toHaveBeenCalledWith("Service Worker not supported in this browser");

      // Restore
      Object.defineProperty(navigator, "serviceWorker", {
        value: originalServiceWorker,
        configurable: true,
        writable: true,
      });
    });
  });

  describe("registerServiceWorker", () => {
    it("should register service worker successfully", async () => {
      vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValue(
        mockServiceWorkerRegistration as ServiceWorkerRegistration
      );

      await pwaManager.registerServiceWorker();

      expect(pwaManager.registration).toBeDefined();
      expect(logger.info).toHaveBeenCalledWith(
        "📱 Service Worker registration found",
        expect.objectContaining({
          scope: "/",
          state: "activated",
        })
      );
    });

    it("should handle service worker registration errors", async () => {
      const error = new Error("Registration failed");
      vi.mocked(navigator.serviceWorker.getRegistration).mockRejectedValue(error);

      await pwaManager.registerServiceWorker();

      expect(logger.error).toHaveBeenCalledWith("❌ Service Worker registration failed", error);
    });

    it("should detect waiting service worker", async () => {
      const registrationWithWaiting = {
        ...mockServiceWorkerRegistration,
        waiting: { state: "installed" },
      };

      vi.mocked(navigator.serviceWorker.getRegistration).mockResolvedValue(
        registrationWithWaiting as ServiceWorkerRegistration
      );

      await pwaManager.initialize(mockUiStore);

      expect(logger.info).toHaveBeenCalledWith("⏳ Service Worker already waiting");
    });

    it("should wait for registration if not immediately available", async () => {
      vi.mocked(navigator.serviceWorker.getRegistration)
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(mockServiceWorkerRegistration as ServiceWorkerRegistration);

      vi.useFakeTimers();
      try {
        const registerPromise = pwaManager.registerServiceWorker();

        await vi.advanceTimersByTimeAsync(1000);
        await registerPromise;

        expect(logger.info).toHaveBeenCalledWith("⏳ Waiting for service worker registration...");
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("handleUpdateFound", () => {
    it("should handle service worker update found", async () => {
      const mockInstalling = {
        state: "installing",
        addEventListener: vi.fn((event, handler) => {
          if (event === "statechange") {
            // Simulate state change to installed
            mockInstalling.state = "installed";
            handler();
          }
        }),
      };

      const registration = {
        ...mockServiceWorkerRegistration,
        installing: mockInstalling,
      };

      pwaManager.registration = registration as unknown as ServiceWorkerRegistration;

      // Ensure navigator.serviceWorker exists and has controller property
      if (navigator.serviceWorker) {
        Object.defineProperty(navigator.serviceWorker, "controller", {
          value: { state: "activated" },
          configurable: true,
          writable: true,
        });
      }

      pwaManager.handleUpdateFound();

      expect(mockInstalling.addEventListener).toHaveBeenCalledWith(
        "statechange",
        expect.any(Function)
      );
    });

    it("should handle first time install", async () => {
      const mockInstalling = {
        state: "installing",
        addEventListener: vi.fn((event, handler) => {
          if (event === "statechange") {
            mockInstalling.state = "installed";
            handler();
          }
        }),
      };

      const registration = {
        ...mockServiceWorkerRegistration,
        installing: mockInstalling,
      };

      pwaManager.registration = registration as unknown as ServiceWorkerRegistration;

      // Ensure navigator.serviceWorker exists and has controller property
      if (navigator.serviceWorker) {
        Object.defineProperty(navigator.serviceWorker, "controller", {
          value: null,
          configurable: true,
          writable: true,
        });
      }

      pwaManager.handleUpdateFound();

      expect(logger.info).toHaveBeenCalledWith("🎉 Service worker installed for the first time");
    });
  });

  describe("setupInstallPrompt", () => {
    it("should capture beforeinstallprompt event", () => {
      pwaManager.uiStore = mockUiStore;
      pwaManager.setupInstallPrompt();

      const beforeinstallpromptHandler = vi
        .mocked(window.addEventListener)
        .mock.calls.find(([event]) => event === "beforeinstallprompt")?.[1];

      expect(beforeinstallpromptHandler).toBeDefined();
    });

    it("should prevent default on beforeinstallprompt", () => {
      vi.useFakeTimers();
      try {
        pwaManager.uiStore = mockUiStore;
        pwaManager.setupInstallPrompt();

        const mockEvent = {
          preventDefault: vi.fn(),
        };

        const handler = vi
          .mocked(window.addEventListener)
          .mock.calls.find(([event]) => event === "beforeinstallprompt")?.[1] as EventListener;

        handler(mockEvent as Event);
        vi.runAllTimers();

        expect(mockEvent.preventDefault).toHaveBeenCalled();
        expect(logger.info).toHaveBeenCalledWith("📱 PWA install prompt available");
      } finally {
        vi.useRealTimers();
      }
    });

    it("should respect install prompt cooldown", () => {
      vi.useFakeTimers();
      try {
        const yesterday = Date.now() - 23 * 60 * 60 * 1000; // 23 hours ago
        localStorage.setItem("pwa_install_last_dismissed", yesterday.toString());

        pwaManager.uiStore = mockUiStore;
        pwaManager.setupInstallPrompt();

        const mockEvent = {
          preventDefault: vi.fn(),
        };

        const handler = vi
          .mocked(window.addEventListener)
          .mock.calls.find(([event]) => event === "beforeinstallprompt")?.[1] as EventListener;

        handler(mockEvent as Event);
        vi.runAllTimers();

        expect(logger.info).toHaveBeenCalledWith(
          "Install prompt dismissed recently, skipping automatic prompt"
        );
      } finally {
        vi.useRealTimers();
      }
    });

    it("should handle appinstalled event", () => {
      pwaManager.uiStore = mockUiStore;
      pwaManager.setupInstallPrompt();

      const handler = vi
        .mocked(window.addEventListener)
        .mock.calls.find(([event]) => event === "appinstalled")?.[1] as EventListener;

      expect(handler).toBeDefined();

      handler({} as Event);

      expect(logger.info).toHaveBeenCalledWith("🎉 PWA was installed successfully");
    });
  });

  describe("setupUpdateDetection", () => {
    it("should reload page on controller change", () => {
      pwaManager.setupUpdateDetection();

      const handler = vi
        .mocked(navigator.serviceWorker.addEventListener)
        .mock.calls.find(([event]) => event === "controllerchange")?.[1] as EventListener;

      expect(handler).toBeDefined();

      handler({} as Event);

      expect(logger.info).toHaveBeenCalledWith(
        "🔄 Service worker controller changed - reloading page"
      );
      expect(window.location.reload).toHaveBeenCalled();
    });

    it("should handle UPDATE_AVAILABLE message", () => {
      pwaManager.uiStore = mockUiStore;
      pwaManager.setupUpdateDetection();

      const handler = vi
        .mocked(navigator.serviceWorker.addEventListener)
        .mock.calls.find(([event]) => event === "message")?.[1] as (event: MessageEvent) => void;

      expect(handler).toBeDefined();

      handler({
        data: { type: "UPDATE_AVAILABLE" },
      } as MessageEvent);

      expect(logger.info).toHaveBeenCalledWith(
        "📡 Received update available message from service worker"
      );
    });

    it("should handle UPDATE_INSTALLED message", () => {
      pwaManager.setupUpdateDetection();

      const handler = vi
        .mocked(navigator.serviceWorker.addEventListener)
        .mock.calls.find(([event]) => event === "message")?.[1] as (event: MessageEvent) => void;

      handler({
        data: { type: "UPDATE_INSTALLED" },
      } as MessageEvent);

      expect(logger.info).toHaveBeenCalledWith("✅ Update installed, app will refresh");
    });
  });

  describe("checkForUpdates", () => {
    it("should check for updates manually", async () => {
      pwaManager.registration = mockServiceWorkerRegistration as ServiceWorkerRegistration;
      vi.mocked(mockServiceWorkerRegistration.update).mockResolvedValue(undefined);

      const result = await pwaManager.checkForUpdates();

      expect(result).toBe(true);
      expect(mockServiceWorkerRegistration.update).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("🔍 Manually checking for updates...");
    });

    it("should handle update check failure", async () => {
      pwaManager.registration = mockServiceWorkerRegistration as ServiceWorkerRegistration;
      const error = new Error("Update check failed");
      vi.mocked(mockServiceWorkerRegistration.update).mockRejectedValue(error);

      const result = await pwaManager.checkForUpdates();

      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith("❌ Manual update check failed", error);
    });

    it("should warn when no registration exists", async () => {
      pwaManager.registration = null;

      const result = await pwaManager.checkForUpdates();

      expect(result).toBe(false);
      expect(logger.warn).toHaveBeenCalledWith("No service worker registration found");
    });
  });

  describe("getInstallationStatus", () => {
    it("should detect standalone mode", () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as MediaQueryList);

      const status = pwaManager.getInstallationStatus();

      expect(status.isInstalled).toBe(true);
      expect(status.isInstallable).toBe(false);
    });

    it("should detect iOS devices", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
        configurable: true,
      });

      const status = pwaManager.getInstallationStatus();

      expect(status.isIOS).toBe(true);
      expect(status.canPromptInstall).toBe(false);
    });

    it("should detect installable state", () => {
      // Ensure navigator.userAgent is not iOS
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        configurable: true,
        writable: true,
      });

      // Mock matchMedia to return false for standalone mode
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: false,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as MediaQueryList);

      const mockEvent = {} as BeforeInstallPromptEvent;
      pwaManager.uiStore = {
        ...mockUiStore,
        getState: () => ({
          ...mockUiStore.getState(),
          installPromptEvent: mockEvent,
        }),
      };

      const status = pwaManager.getInstallationStatus();

      expect(status.isInstallable).toBe(true);
      expect(status.canPromptInstall).toBe(true);
    });
  });

  describe("checkForVersionUpdate", () => {
    it("should not show patch notes when no update", () => {
      vi.mocked(versionModule.checkForVersionUpdate).mockReturnValue({
        hasUpdate: false,
        isFirstTime: false,
        currentVersion: "2.0.0",
        lastSeenVersion: "2.0.0",
      });

      pwaManager.checkForVersionUpdate();

      expect(logger.debug).toHaveBeenCalledWith(
        "✅ No version update, current version already seen"
      );
    });

    it("should show patch notes on version update", async () => {
      vi.mocked(versionModule.checkForVersionUpdate).mockReturnValue({
        hasUpdate: true,
        isFirstTime: false,
        currentVersion: "2.1.0",
        lastSeenVersion: "2.0.0",
      });

      pwaManager.uiStore = mockUiStore;
      pwaManager.checkForVersionUpdate();

      expect(logger.info).toHaveBeenCalledWith(
        "🎉 Version update detected, showing patch notes",
        expect.objectContaining({
          fromVersion: "2.0.0",
          toVersion: "2.1.0",
        })
      );
    });

    it("should not show patch notes for first-time users", () => {
      vi.mocked(versionModule.checkForVersionUpdate).mockReturnValue({
        hasUpdate: false,
        isFirstTime: true,
        currentVersion: "2.0.0",
        lastSeenVersion: null,
      });

      pwaManager.checkForVersionUpdate();

      expect(logger.info).toHaveBeenCalledWith(
        "👋 First time user detected, not showing patch notes"
      );
    });

    it("should handle version check errors", () => {
      vi.mocked(versionModule.checkForVersionUpdate).mockImplementation(() => {
        throw new Error("Version check failed");
      });

      pwaManager.checkForVersionUpdate();

      expect(logger.error).toHaveBeenCalledWith(
        "❌ Failed to check for version update:",
        expect.any(Error)
      );
    });
  });

  describe("getStatus", () => {
    it("should return comprehensive PWA status", () => {
      pwaManager.registration = mockServiceWorkerRegistration as ServiceWorkerRegistration;
      pwaManager.isInitialized = true;

      const status = pwaManager.getStatus();

      expect(status).toEqual(
        expect.objectContaining({
          isInitialized: true,
          hasRegistration: true,
          registrationScope: "/",
          serviceWorkerState: "activated",
          hasWaitingWorker: false,
        })
      );
    });

    it("should include installation status", () => {
      vi.mocked(window.matchMedia).mockReturnValue({
        matches: true,
        addListener: vi.fn(),
        removeListener: vi.fn(),
      } as MediaQueryList);

      const status = pwaManager.getStatus();

      expect(status.isInstalled).toBe(true);
    });
  });
});
