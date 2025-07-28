import { Sentry } from "./sentry.js";

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
  }

  // Debug-level logging for development and sync issues
  debug(message, data = {}) {
    // Always log to console in development, but also use original console.log to bypass capture
    if (this.isDevelopment) {
      // Use window.originalConsoleLog if available, otherwise regular console.log
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(`🔍 ${message}`, data);
    }

    try {
      Sentry.addBreadcrumb({
        message: `DEBUG: ${message}`,
        level: "info",
        category: "debug",
        data,
      });
    } catch (error) {
      // Fallback if Sentry fails
      console.error("Sentry logging failed:", error);
    }
  }

  // Info-level logging for important events
  info(message, data = {}) {
    if (this.isDevelopment) {
      const consoleLog = window.originalConsoleLog || console.log;
      consoleLog(`ℹ️ ${message}`, data);
    }

    try {
      Sentry.addBreadcrumb({
        message: `INFO: ${message}`,
        level: "info",
        category: "app",
        data,
      });
    } catch (error) {
      console.error("Sentry logging failed:", error);
    }
  }

  // Warning-level logging
  warn(message, data = {}) {
    console.warn(`⚠️ ${message}`, data);

    Sentry.addBreadcrumb({
      message: `WARN: ${message}`,
      level: "warning",
      category: "app",
      data,
    });
  }

  // Error-level logging
  error(message, error = null, data = {}) {
    console.error(`❌ ${message}`, error, data);

    if (error instanceof Error) {
      Sentry.captureException(error, {
        tags: { component: "app" },
        extra: { message, data },
      });
    } else {
      Sentry.captureMessage(message, "error");
    }
  }

  // Specific methods for common debugging scenarios
  budgetSync(message, data = {}) {
    // Always log budget sync issues to console for immediate visibility
    console.log(`💰 [BUDGET-SYNC] ${message}`, data);

    // Also send to Sentry
    try {
      Sentry.addBreadcrumb({
        message: `BUDGET-SYNC: ${message}`,
        level: "info",
        category: "budget-sync",
        data,
      });

      // For critical budget sync issues, also send as message to ensure visibility
      if (message.includes("budgetId value") || message.includes("sync issue")) {
        Sentry.captureMessage(`Budget Sync: ${message}`, "info");
      }
    } catch (error) {
      console.error("Failed to log to Sentry:", error);
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

  // Test Sentry connectivity
  testSentry() {
    console.log("🧪 Testing Sentry connectivity...");

    // Send a test breadcrumb
    Sentry.addBreadcrumb({
      message: "Test breadcrumb from logger",
      level: "info",
      category: "test",
    });

    // Send a test message
    Sentry.captureMessage("Test message from logger", "info");

    // Send a test error
    try {
      throw new Error("Test error from logger - this is intentional");
    } catch (error) {
      Sentry.captureException(error);
    }

    console.log("✅ Sentry test messages sent - check your Sentry dashboard");
  }
}

export const logger = new Logger();

// Make logger available globally for testing
if (typeof window !== "undefined") {
  window.logger = logger;
  window.testSentry = () => logger.testSentry();
}

export default logger;
