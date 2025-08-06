import { H } from "./highlight.js";

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
    this.isDevSite =
      window.location.hostname === "dev.f4tdaddy.com" ||
      window.location.hostname === "localhost" ||
      window.location.hostname.includes("preview") ||
      window.location.hostname.includes("vercel");
  }

  // Debug-level logging for development and sync issues
  debug(message, data = {}) {
    // Always log to console in development or on dev sites
    // Also log bill-related debug messages on dev site for debugging
    const isBillRelated =
      message.includes("Bill") ||
      message.includes("Envelope") ||
      message.includes("Form") ||
      message.includes("Modal") ||
      data.billId ||
      data.envelopeId ||
      data.selectedEnvelope;

    if (this.isDevelopment || (this.isDevSite && isBillRelated)) {
      // Use window.originalConsoleLog if available, otherwise regular console.log
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(`🔍 ${message}`, data);
    }

    // Highlight.io automatically captures console logs, so just ensure it's tracked
    try {
      H.track("debug", {
        message: `DEBUG: ${message}`,
        category: "debug",
        ...data,
      });
    } catch (error) {
      // Fallback if Highlight.io fails
      console.error("Highlight.io logging failed:", error);
    }
  }

  // Info-level logging for important events
  info(message, data = {}) {
    if (this.isDevelopment) {
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(`ℹ️ ${message}`, data);
    }

    try {
      H.track("info", {
        message: `INFO: ${message}`,
        category: "app",
        ...data,
      });
    } catch (error) {
      console.error("Highlight.io logging failed:", error);
    }
  }

  // Warning-level logging
  warn(message, data = {}) {
    console.warn(`⚠️ ${message}`, data);

    H.track("warning", {
      message: `WARN: ${message}`,
      category: "app",
      ...data,
    });
  }

  // Error-level logging
  error(message, error = null, data = {}) {
    console.error(`❌ ${message}`, error, data);

    if (error instanceof Error) {
      H.consumeError(error, {
        metadata: { message, ...data },
        tags: { component: "app" },
      });
    } else {
      H.consumeError(new Error(message), {
        metadata: data,
        tags: { component: "app" },
      });
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
      H.track("budget-sync", {
        message: `BUDGET-SYNC: ${message}`,
        category: "budget-sync",
        ...data,
      });

      // For critical budget sync issues, also send as error to ensure visibility
      if (
        message.includes("budgetId value") ||
        message.includes("sync issue")
      ) {
        H.consumeError(new Error(`Budget Sync: ${message}`), {
          metadata: data,
          tags: { category: "budget-sync", critical: "true" },
        });
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
    H.track("test-event", {
      message: "Test event from logger",
      category: "test",
      timestamp: new Date().toISOString(),
    });

    // Send a test error
    try {
      throw new Error("Test error from logger - this is intentional");
    } catch (error) {
      H.consumeError(error, {
        metadata: { test: true, source: "logger" },
        tags: { category: "test" },
      });
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
