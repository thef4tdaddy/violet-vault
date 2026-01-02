import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Sentry now loaded lazily via SentryLoader component
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./utils/common/queryClient";
import BugReportingService from "./services/logging/bugReportingService.ts";
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
    import("./services/sync/chunkedSyncService.js").catch((error) => {
      logger.warn("Firebase sync services failed to load:", error);
    });
  };

  const setupEventListeners = (loadOnce: () => void) => {
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

// Initialize Sentry early to capture module initialization errors
// This must happen before any other imports that might throw errors
const initializeSentryEarly = () => {
  try {
    // Check if Sentry should be enabled
    // Trim whitespace/newlines from environment variables (Vercel can add them)
    const errorReportingEnabledRaw = String(
      import.meta.env.VITE_ERROR_REPORTING_ENABLED || ""
    ).trim();
    const isErrorReportingEnabled = errorReportingEnabledRaw === "true";
    const dsn = String(import.meta.env.VITE_SENTRY_DSN || "").trim();

    if (isErrorReportingEnabled && dsn) {
      // Queue for errors that happen before Sentry is ready
      const errorQueue: Array<{ error: Error; context?: Record<string, unknown> }> = [];

      // Flush queued errors to Sentry once it's ready
      const flushErrorQueue = () => {
        if (errorQueue.length === 0) return;
        import("./utils/common/sentry.js")
          .then(({ captureError, initSentry }) => {
            // Ensure Sentry is initialized before capturing
            try {
              initSentry();
            } catch {
              // Already initialized or failed, continue anyway
            }
            errorQueue.forEach(({ error, context }) => {
              captureError(error, context);
            });
            errorQueue.length = 0;
          })
          .catch(() => {
            // Sentry not ready yet, errors remain queued
          });
      };

      // Set up global error handlers IMMEDIATELY (before Sentry init)
      // This ensures we capture errors during module loading
      const errorHandler = (event: ErrorEvent) => {
        if (event.error) {
          const errorContext = {
            type: "uncaught",
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
          };
          errorQueue.push({ error: event.error, context: errorContext });
          // Try to flush immediately if Sentry is ready
          flushErrorQueue();
        }
      };

      const rejectionHandler = (event: PromiseRejectionEvent) => {
        const error =
          event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        const errorContext = {
          type: "unhandledRejection",
          reason: String(event.reason),
        };
        errorQueue.push({ error, context: errorContext });
        // Try to flush immediately if Sentry is ready
        flushErrorQueue();
      };

      // Register handlers BEFORE importing Sentry
      window.addEventListener("error", errorHandler);
      window.addEventListener("unhandledrejection", rejectionHandler);

      // Now initialize Sentry and flush any queued errors
      import("./utils/common/sentry.js")
        .then(({ initSentry }) => {
          initSentry();
          // Flush any errors that occurred during module loading
          flushErrorQueue();

          // Periodic flush to catch any errors that occurred before Sentry was ready
          // Retry every 2 seconds for up to 10 seconds
          let retryCount = 0;
          const maxRetries = 5;
          const retryInterval = setInterval(() => {
            if (errorQueue.length > 0) {
              flushErrorQueue();
              retryCount++;
              if (retryCount >= maxRetries) {
                clearInterval(retryInterval);
              }
            } else {
              clearInterval(retryInterval);
            }
          }, 2000);
        })
        .catch(() => {
          // Silently fail - monitoring shouldn't break the app
          // But still try to flush errors periodically
          let retryCount = 0;
          const maxRetries = 10;
          const retryInterval = setInterval(() => {
            if (errorQueue.length > 0) {
              flushErrorQueue();
              retryCount++;
              if (retryCount >= maxRetries || errorQueue.length === 0) {
                clearInterval(retryInterval);
              }
            } else {
              clearInterval(retryInterval);
            }
          }, 2000);
        });
    }
  } catch (error) {
    // Silently fail - monitoring shouldn't break the app
    // Use logger if available, otherwise fail silently
    try {
      logger.warn("Failed to initialize Sentry early", {
        errorMessage: error instanceof Error ? error.message : String(error),
        error: error instanceof Error ? error.stack : String(error),
      });
    } catch {
      // Logger not available yet, fail silently
    }
  }
};

// Initialize Sentry as early as possible
initializeSentryEarly();

// Initialize crypto compatibility layer
initializeCrypto();

// Initialize app after DOM is ready
const initializeApp = () => {
  // Initialize console log and error capture for bug reports
  BugReportingService.initialize();

  // Initialize debugging tools after DOM is ready to avoid store operations in module scope
  if (
    typeof window !== "undefined" &&
    (import.meta.env.MODE === "development" ||
      window.location.hostname.includes("staging.violetvault.app") ||
      window.location.hostname.includes("violetvault.app") ||
      window.location.hostname.endsWith(".vercel.app"))
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
        const { default: offlineDataValidator } =
          await import("./utils/pwa/offlineDataValidator.js");
        return await offlineDataValidator.getOfflineReadinessReport();
      };

      // Helper functions for cloud data reset
      const validateLocalDataExists = (localData: Record<string, unknown>) => {
        if (!localData) return false;

        const envelopes = localData.envelopes as unknown[] | undefined;
        const transactions = localData.transactions as unknown[] | undefined;
        const bills = localData.bills as unknown[] | undefined;
        const debts = localData.debts as unknown[] | undefined;
        return (
          (envelopes && envelopes.length > 0) ||
          (transactions && transactions.length > 0) ||
          (bills && bills.length > 0) ||
          (debts && debts.length > 0)
        );
      };

      const logLocalDataStats = (localData: Record<string, unknown>) => {
        const envelopes = (localData.envelopes as unknown[] | undefined)?.length || 0;
        const transactions = (localData.transactions as unknown[] | undefined)?.length || 0;
        const bills = (localData.bills as unknown[] | undefined)?.length || 0;
        const debts = (localData.debts as unknown[] | undefined)?.length || 0;
        logger.info(
          `📊 Found: ${envelopes} envelopes, ${transactions} transactions, ${bills} bills, ${debts} debts`
        );
      };

      const performCloudReset = async (cloudSyncService: {
        stop: () => void;
        clearAllData: () => Promise<void>;
        forcePushData: () => Promise<{ success: boolean; error?: string }>;
      }) => {
        // Stop sync, clear cloud data, and force push local data
        cloudSyncService.stop();
        logger.info("⏸️ Stopped background sync");

        await new Promise((resolve) => setTimeout(resolve, 2000));
        await cloudSyncService.clearAllData();
        logger.info("🧹 Cleared all cloud data");

        await new Promise((resolve) => setTimeout(resolve, 1000));
        const result = await cloudSyncService.forcePushData();
        logger.info("🚀 Force pushed local data to cloud:", result);

        return result;
      };

      // Emergency corruption recovery tool
      window.forceCloudDataReset = async () => {
        logger.warn(
          "🚨 CORRUPTION FIX: Attempting to clear cloud data and re-upload from local..."
        );

        try {
          const { cloudSyncService } = await import("./services/sync/cloudSyncService.js");

          // CRITICAL SAFETY CHECK: Verify local data exists before clearing cloud
          logger.info("🔍 Checking local data before clearing cloud...");
          const dexieData = await cloudSyncService.fetchDexieData();
          const localData = dexieData as unknown as Record<string, unknown>;

          if (!validateLocalDataExists(localData)) {
            const errorMsg =
              "🚨 SAFETY ABORT: No local data found! Cannot clear cloud data as this would result in total data loss. Please restore from backup first.";
            logger.error(errorMsg);
            return { success: false, error: errorMsg, safetyAbort: true };
          }

          logger.info("✅ Local data verified - safe to proceed with cloud reset");
          logLocalDataStats(localData);

          const result = await performCloudReset(
            cloudSyncService as unknown as {
              stop: () => void;
              clearAllData: () => Promise<void>;
              forcePushData: () => Promise<{ success: boolean; error?: string }>;
            }
          );

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
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      };

      // Manual cloud clear only (for testing)
      window.clearCloudDataOnly = async () => {
        logger.info("🧹 Clearing cloud data only (no restart)...");
        try {
          const { cloudSyncService } = await import("./services/sync/cloudSyncService.js");
          cloudSyncService.stop();
          logger.info("⏸️ Stopped sync service");

          await cloudSyncService.clearAllData();
          logger.info("✅ Cloud data cleared - sync service remains stopped");

          return { success: true, message: "Cloud data cleared, sync stopped" };
        } catch (error) {
          logger.error("❌ Clear failed:", error);
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
      };

      // Bug report testing tools
      window.testBugReportCapture = async () => {
        logger.info("🐛 Testing bug report capture...");

        // Test diagnostics
        const diagnostics = BugReportingService.runDiagnostics();
        logger.info("📝 Diagnostics collected:", diagnostics);

        // Test screenshot capture
        try {
          const screenshot = await BugReportingService.captureScreenshot();
          logger.info("📸 Screenshot capture:", {
            status: screenshot ? `Success (${(screenshot.length / 1024).toFixed(1)}KB)` : "Failed",
          });
          return {
            success: true,
            diagnostics,
            screenshot: !!screenshot,
          };
        } catch (error) {
          logger.info("📸 Screenshot capture failed:", { error: (error as Error).message });
          return {
            success: false,
            diagnostics,
            screenshot: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      };
    };

    initDebugTools();
  }

  const rootElement = document.getElementById("root");
  if (!rootElement) throw new Error("Root element not found");
  ReactDOM.createRoot(rootElement).render(
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
