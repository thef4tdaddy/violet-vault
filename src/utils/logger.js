import { captureError, trackEvent } from "./logrocket.js";

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
    this.isDevSite = this.getIsDevSite();
  }

  getIsDevSite() {
    if (typeof window === "undefined") return false;
    return (
      window.location.hostname === "localhost" ||
      window.location.hostname.startsWith("dev.") ||
      window.location.hostname.includes("preview") ||
      window.location.hostname.includes("vercel") ||
      window.location.hostname.includes("127.0.0.1") ||
      window.location.hostname.includes("192.168.") ||
      // Include Vercel preview deployments
      window.location.hostname.includes("-git-") ||
      window.location.hostname.includes(".vercel.app")
    );
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

    // Show logs in development or on dev/preview sites, and bill-related logs only on dev sites
    if (this.isDevelopment || (this.isDevSite && isBillRelated)) {
      // Use window.originalConsoleLog if available, otherwise regular console.log
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(
        `🔍 [${this.isDevelopment ? "DEV" : this.isDevSite ? "DEV-SITE" : "PROD"}] ${message}`,
        data,
      );
    }

    // LogRocket automatically captures console logs, so just ensure it's tracked
    try {
      trackEvent("debug", {
        message: `DEBUG: ${message}`,
        category: "debug",
        ...data,
      });
    } catch (error) {
      // Fallback if LogRocket fails
      console.error("LogRocket logging failed:", error);
    }
  }

  // Info-level logging for important events
  info(message, data = {}) {
    if (this.isDevelopment) {
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(`ℹ️ ${message}`, data);
    }

    try {
      trackEvent("info", {
        message: `INFO: ${message}`,
        category: "app",
        ...data,
      });
    } catch (error) {
      console.error("LogRocket logging failed:", error);
    }
  }

  // Warning-level logging
  warn(message, data = {}) {
    console.warn(`⚠️ ${message}`, data);

    trackEvent("warning", {
      message: `WARN: ${message}`,
      category: "app",
      ...data,
    });
  }

  // Error-level logging
  error(message, error = null, data = {}) {
    console.error(`❌ ${message}`, error, data);

    if (error instanceof Error) {
      captureError(error, {
        message,
        component: "app",
        ...data,
      });
    } else {
      captureError(new Error(message), {
        component: "app",
        ...data,
      });
    }
  }

  // Specific methods for common debugging scenarios
  budgetSync(message, data = {}) {
    // Only log budget sync in development mode to reduce production noise
    if (this.isDevelopment) {
      console.log(`💰 [BUDGET-SYNC] ${message}`, data);
    }

    // Also send to LogRocket
    try {
      trackEvent("budget-sync", {
        message: `BUDGET-SYNC: ${message}`,
        category: "budget-sync",
        ...data,
      });

      // For critical budget sync issues, also send as error to ensure visibility
      if (
        message.includes("budgetId value") ||
        message.includes("sync issue")
      ) {
        captureError(new Error(`Budget Sync: ${message}`), {
          category: "budget-sync",
          critical: "true",
          ...data,
        });
      }
    } catch (error) {
      console.error("Failed to log to LogRocket:", error);
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

  // Test LogRocket connectivity
  testLogRocket() {
    console.log("🧪 Testing LogRocket connectivity...");

    // Send a test event
    trackEvent("test-event", {
      message: "Test event from logger",
      category: "test",
      timestamp: new Date().toISOString(),
    });

    // Send a test error
    try {
      throw new Error("Test error from logger - this is intentional");
    } catch (error) {
      captureError(error, {
        test: true,
        source: "logger",
        category: "test",
      });
    }

    console.log(
      "✅ LogRocket test messages sent - check your LogRocket dashboard",
    );
  }
}

export const logger = new Logger();

// Make logger available globally for testing
if (typeof window !== "undefined") {
  window.logger = logger;
  window.testLogRocket = () => logger.testLogRocket();
}

export default logger;
