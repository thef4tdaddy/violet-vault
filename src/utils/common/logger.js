// Dynamic import to avoid circular dependency with highlight.js
let H = null;

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
    this.isDevSite = this.getIsDevSite();
    this.debugThrottles = new Map(); // For throttling frequent debug messages
  }

  // Initialize H when needed
  initH() {
    if (!H) {
      try {
        // Use dynamic import to avoid circular dependency
        import("../common/highlight.js")
          .then((module) => {
            H = module.H;
          })
          .catch(() => {
            H = { track: () => {}, consumeError: () => {} }; // Fallback mock
          });
      } catch {
        H = { track: () => {}, consumeError: () => {} }; // Fallback mock
      }
    }
    return H || { track: () => {}, consumeError: () => {} };
  }

  getIsDevSite() {
    if (typeof window === "undefined") return false;
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname.startsWith("dev") ||
      /^dev\./.test(window.location.hostname) ||
      window.location.hostname.includes("preview") ||
      window.location.hostname.includes("127.0.0.1") ||
      window.location.hostname.includes("192.168.") ||
      // Include Vercel preview deployments but NOT production vercel.app
      window.location.hostname.includes("-git-") ||
      (window.location.hostname.includes(".vercel.app") &&
        !window.location.hostname.startsWith("violet-vault.vercel.app"))
    );
  }

  // Debug-level logging for development and sync issues
  debug(message, data = {}) {
    // Show debug logs only in development or on dev.* sites
    if (this.isDevelopment || this.isDevSite) {
      // Use window.originalConsoleLog if available, otherwise regular console.log
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(
        `🔍 [${this.isDevelopment ? "DEV" : this.isDevSite ? "DEV-SITE" : "PROD"}] ${message}`,
        data,
      );
    }

    // Highlight.io tracking for all debug logs
    try {
      const h = this.initH();
      if (h && h.track) {
        h.track("debug", {
          message: `DEBUG: ${message}`,
          category: "debug",
          ...data,
        });
      }
    } catch {
      // Silently fail if highlight.io isn't available
    }
  }

  // Throttled debug logging for frequently called functions (like React renders)
  debugThrottled(message, data = {}, throttleMs = 1000) {
    const key = message;
    const now = Date.now();
    const lastCall = this.debugThrottles.get(key);

    if (!lastCall || now - lastCall > throttleMs) {
      this.debug(message, data);
      this.debugThrottles.set(key, now);
    }
  }

  // Info-level logging for important events
  info(message, data = {}) {
    // Show info logs only in development or on dev.* sites
    if (this.isDevelopment || this.isDevSite) {
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(`ℹ️ ${message}`, data);
    }

    try {
      const h = this.initH();
      if (h && h.track) {
        h.track("info", {
          message: `INFO: ${message}`,
          category: "app",
          ...data,
        });
      }
    } catch (error) {
      console.error("Highlight.io logging failed:", error);
    }
  }

  // Warning-level logging
  warn(message, data = {}) {
    console.warn(`⚠️ ${message}`, data);

    const h = this.initH();
    if (h && h.track) {
      h.track("warning", {
        message: `WARN: ${message}`,
        category: "app",
        ...data,
      });
    }
  }

  // Error-level logging
  error(message, error = null, data = {}) {
    console.error(`❌ ${message}`, error, data);

    const h = this.initH();
    if (h && h.consumeError) {
      if (error instanceof Error) {
        h.consumeError(error, {
          metadata: { message, ...data },
          tags: { component: "app" },
        });
      } else {
        h.consumeError(new Error(message), {
          metadata: data,
          tags: { component: "app" },
        });
      }
    }
  }

  // Production-level logging for important user-visible events
  // Always shows in console AND sends to Highlight.io regardless of environment
  //
  // USE FOR:
  // - User login/logout events
  // - Data sync completion (upload/download)
  // - Bug report submissions
  // - Manual save operations
  // - Critical user actions (delete debt, envelope, etc.)
  // - Service start/stop events
  //
  // DO NOT USE FOR:
  // - Debug/development info
  // - Frequent operations (renders, calculations)
  // - Internal state changes
  production(message, data = {}) {
    // Always show production logs in console with distinctive styling
    const consoleLog = window.originalConsoleLog || console.log;
    consoleLog(`🟢 [PROD] ${message}`, data);

    try {
      const h = this.initH();
      if (h && h.track) {
        h.track("production", {
          message: `PRODUCTION: ${message}`,
          category: "production",
          ...data,
        });
      }
    } catch (error) {
      console.error("Highlight.io production logging failed:", error);
    }
  }

  // Specific methods for common debugging scenarios
  budgetSync(message, data = {}) {
    // Only log budget sync in development mode to reduce production noise
    if (this.isDevelopment) {
      console.log(`💰 [BUDGET-SYNC] ${message}`, data);
    }

    // Also send to Highlight.io
    try {
      const h = this.initH();
      if (h && h.track) {
        h.track("budget-sync", {
          message: `BUDGET-SYNC: ${message}`,
          category: "budget-sync",
          ...data,
        });

        // For critical budget sync issues, also send as error to ensure visibility
        if (
          message.includes("budgetId value") ||
          message.includes("sync issue")
        ) {
          if (h.consumeError) {
            h.consumeError(new Error(`Budget Sync: ${message}`), {
              metadata: data,
              tags: { category: "budget-sync", critical: "true" },
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to log to Highlight.io:", error);
    }
  }

  auth(message, data = {}) {
    // Filter sensitive data
    const sanitizedData = { ...data };
    delete sanitizedData.password;
    delete sanitizedData.encryptionKey;
    delete sanitizedData.token;

    this.debug(`[AUTH] ${message}`, {
      ...sanitizedData,
      category: "auth",
    });
  }

  firebase(message, data = {}) {
    this.debug(`[FIREBASE] ${message}`, {
      ...data,
      category: "firebase",
    });
  }

  // Performance logging
  performance(operation, duration, data = {}) {
    this.info(`[PERFORMANCE] ${operation} completed in ${duration}ms`, {
      duration,
      operation,
      ...data,
    });
  }

  // User action logging
  userAction(action, data = {}) {
    this.info(`[USER-ACTION] ${action}`, {
      action,
      ...data,
    });
  }

  // Test Highlight.io connectivity
  testHighlight() {
    console.log("🧪 Testing Highlight.io connectivity...");

    // Send a test event
    const h = this.initH();
    if (h && h.track) {
      h.track("test-event", {
        message: "Test event from logger",
        category: "test",
        timestamp: new Date().toISOString(),
      });
    }

    // Send a test error
    try {
      throw new Error("Test error from logger - this is intentional");
    } catch (error) {
      if (h && h.consumeError) {
        h.consumeError(error, {
          metadata: { test: true, source: "logger" },
          tags: { category: "test" },
        });
      }
    }

    console.log(
      "✅ Highlight.io test messages sent - check your Highlight.io dashboard",
    );
  }
}

export const logger = new Logger();

// Make logger available globally for testing
if (typeof window !== "undefined") {
  window.logger = logger;
  window.testHighlight = () => logger.testHighlight();
}

export default logger;
