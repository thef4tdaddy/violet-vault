import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Highlight.run now loaded lazily via HighlightLoader component
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/common/queryClient";
import { SystemInfoService } from "./services/bugReport/systemInfoService.ts";
import logger from "./utils/common/logger.ts";
import { initializeCrypto } from "./utils/security/cryptoCompat.ts";

// Extend Window interface for debug tools
declare global {
  interface Window {
    dataDiagnostic?: () => void;
    syncDiagnostic?: () => void;
    runSyncHealthCheck?: () => void;
    runSyncEdgeCaseTests?: () => Promise<unknown>;
    validateAllSyncFlows?: () => void;
    fixAutoAllocateUndefined?: () => void;
    swDiagnostics?: () => Promise<unknown>;
    offlineReadiness?: () => Promise<unknown>;
    testBugReportCapture?: () => Promise<unknown>;
    clearCloudDataOnly?: () => Promise<unknown>;
  }
}

// Firebase sync services loaded conditionally to reduce initial bundle size
// This prevents Firebase from being in the initial JS bundle for bots/crawlers
if (typeof window !== "undefined") {
  const loadSyncServices = () => {
    import("./services/chunkedSyncService.js").catch((error) => {
      logger.warn("Firebase sync services failed to load:", error);
    });
  };

  const setupEventListeners = (loadOnce) => {
    const events = ["click", "keydown", "touchstart", "mousemove"];
    const cleanup = () => {
      events.forEach((event) => document.removeEventListener(event, loadOnce));
    };

    events.forEach((event) => document.addEventListener(event, loadOnce, { once: true }));

    // Fallback: load after 3 seconds if no user interaction
    setTimeout(() => {
      cleanup();
      loadOnce();
    }, 3000);
  };

  const initSyncServicesLazy = () => {
    const isBot = /bot|crawler|spider|scraper/i.test(navigator.userAgent);

    if (!isBot) {
      let loaded = false;
      const loadOnce = () => {
        if (!loaded) {
          loaded = true;
          loadSyncServices();
        }
      };

      setupEventListeners(loadOnce);
    }
  };

  initSyncServicesLazy();
}

// Initialize PWA background sync for offline operations
import "./utils/pwa/backgroundSync.js";

// Initialize touch feedback for mobile interactions
import { initializeTouchFeedback } from "./utils/ui/touchFeedback.ts";

// Initialize touch feedback after DOM is ready
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    initializeTouchFeedback();
  });

  // Fallback if DOM is already loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeTouchFeedback);
  } else {
    initializeTouchFeedback();
  }
}

// Expose diagnostic tools for debugging
import { runDataDiagnostic } from "./utils/debug/dataDiagnostic.ts";
import { runSyncDiagnostic } from "./utils/debug/syncDiagnostic.ts";
import { runImmediateSyncHealthCheck } from "./utils/sync/syncHealthChecker.ts";
import syncEdgeCaseTester from "./utils/sync/syncEdgeCaseTester.ts";
import { validateAllSyncFlows } from "./utils/sync/syncFlowValidator.ts";
import { runMasterSyncValidation, getQuickSyncStatus } from "./utils/sync/masterSyncValidator.ts";
import { fixAutoAllocateUndefined } from "./utils/common/fixAutoAllocateUndefined.ts";

// Debug tools are now initialized in the initializeApp function to avoid module scope store operations

// Highlight.run initialization moved to lazy loader in App.jsx

// Initialize crypto compatibility layer
initializeCrypto();

// Initialize app after DOM is ready
const initializeApp = () => {
  // Initialize console log and error capture for bug reports
  SystemInfoService.initializeErrorCapture();

  // Initialize debugging tools after DOM is ready to avoid store operations in module scope
  if (
    typeof window !== "undefined" &&
    (import.meta.env.MODE === "development" ||
      window.location.hostname.includes("f4tdaddy.com") ||
      window.location.hostname.includes("vercel.app"))
  ) {
    // Move window assignments to initialization to avoid module scope store operations
    const initDebugTools = async () => {
      window.dataDiagnostic = runDataDiagnostic;
      window.syncDiagnostic = runSyncDiagnostic;
      window.runSyncHealthCheck = runImmediateSyncHealthCheck;
      window.runSyncEdgeCaseTests = () => syncEdgeCaseTester.runAllTests();
      window.validateAllSyncFlows = validateAllSyncFlows;
      window.runMasterSyncValidation = runMasterSyncValidation;
      window.getQuickSyncStatus = getQuickSyncStatus;
      window.fixAutoAllocateUndefined = fixAutoAllocateUndefined;

      // PWA Background Sync debugging (imported via module side effects)
      // Access via window.backgroundSyncManager (exposed in backgroundSync.js)

      // Service Worker Diagnostics
      window.swDiagnostics = async () => {
        const { default: swDiagnostics } = await import("./utils/pwa/serviceWorkerDiagnostics.js");
        return await swDiagnostics.getFullDiagnostics();
      };

      // Offline Data Validation
      window.offlineReadiness = async () => {
        const { default: offlineDataValidator } = await import(
          "./utils/pwa/offlineDataValidator.js"
        );
        return await offlineDataValidator.getOfflineReadinessReport();
      };

      // Helper functions for cloud data reset
      const validateLocalDataExists = (localData) => {
        if (!localData) return false;

        return (
          (localData.envelopes && localData.envelopes.length > 0) ||
          (localData.transactions && localData.transactions.length > 0) ||
          (localData.bills && localData.bills.length > 0) ||
          (localData.debts && localData.debts.length > 0)
        );
      };

      const logLocalDataStats = (localData) => {
        logger.info(
          `📊 Found: ${localData.envelopes?.length || 0} envelopes, ${localData.transactions?.length || 0} transactions, ${localData.bills?.length || 0} bills, ${localData.debts?.length || 0} debts`
        );
      };

      const performCloudReset = async (cloudSyncService) => {
        // Stop sync, clear cloud data, and force push local data
        cloudSyncService.stop();
        logger.info("⏸️ Stopped background sync");

        await new Promise((resolve) => setTimeout(resolve, 2000));
        await cloudSyncService.clearAllData();
        logger.info("🧹 Cleared all cloud data");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await cloudSyncService.forcePushToCloud();
        logger.info("🚀 Force pushed local data to cloud:", result);

        return result;
      };

      // Emergency corruption recovery tool
      window.forceCloudDataReset = async () => {
        logger.warn(
          "🚨 CORRUPTION FIX: Attempting to clear cloud data and re-upload from local..."
        );

        try {
          const { cloudSyncService } = await import("./services/cloudSyncService.js");

          // CRITICAL SAFETY CHECK: Verify local data exists before clearing cloud
          logger.info("🔍 Checking local data before clearing cloud...");
          const localData = await cloudSyncService.fetchDexieData();

          if (!validateLocalDataExists(localData)) {
            const errorMsg =
              "🚨 SAFETY ABORT: No local data found! Cannot clear cloud data as this would result in total data loss. Please restore from backup first.";
            logger.error(errorMsg);
            return { success: false, error: errorMsg, safetyAbort: true };
          }

          logger.info("✅ Local data verified - safe to proceed with cloud reset");
          logLocalDataStats(localData);

          const result = await performCloudReset(cloudSyncService);

          if (result.success) {
            logger.info(
              "✅ Cloud data reset completed successfully - sync will resume automatically"
            );
            return {
              success: true,
              message: "Cloud data reset completed successfully",
            };
          } else {
            throw new Error(result.error || "Force push failed");
          }
        } catch (error) {
          logger.error("❌ Force reset failed:", error);
          return { success: false, error: error.message };
        }
      };

      // Manual cloud clear only (for testing)
      window.clearCloudDataOnly = async () => {
        logger.info("🧹 Clearing cloud data only (no restart)...");
        try {
          const { cloudSyncService } = await import("./services/cloudSyncService.js");
          cloudSyncService.stop();
          logger.info("⏸️ Stopped sync service");

          await cloudSyncService.clearAllData();
          logger.info("✅ Cloud data cleared - sync service remains stopped");

          return { success: true, message: "Cloud data cleared, sync stopped" };
        } catch (error) {
          logger.error("❌ Clear failed:", error);
          return { success: false, error: error.message };
        }
      };

      // Bug report testing tools
      window.testBugReportCapture = async () => {
        const { SystemInfoService } = await import("./services/bugReport/systemInfoService.js");
        const { ScreenshotService } = await import("./services/bugReport/screenshotService.js");

        logger.info("🐛 Testing bug report capture...");

        // Test console log capture
        const errors = SystemInfoService.getRecentErrors();
        logger.info("📝 Console logs captured:", { count: errors.consoleLogs?.length || 0 });
        logger.info("❌ Errors captured:", { count: errors.recentErrors?.length || 0 });

        // Test screenshot capture
        try {
          const screenshot = await ScreenshotService.captureScreenshot();
          const info = screenshot ? ScreenshotService.getScreenshotInfo(screenshot) : null;
          logger.info("📸 Screenshot capture:", {
            status: info ? `Success (${info.sizeKB}KB)` : "Failed",
          });
          return {
            success: true,
            errors,
            screenshot: !!screenshot,
            screenshotInfo: info,
          };
        } catch (error) {
          logger.info("📸 Screenshot capture failed:", { error: (error as Error).message });
          return {
            success: false,
            errors,
            screenshot: false,
            error: error.message,
          };
        }
      };
    };

    initDebugTools();
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

// Initialize app when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  initializeApp();
}
