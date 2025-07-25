import { Sentry } from "./sentry.js";

class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
  }

  // Debug-level logging for development and sync issues
  debug(message, data = {}) {
    const logData = {
      level: "debug",
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.log(`🔍 ${message}`, data);
    }

    Sentry.addBreadcrumb({
      message: `DEBUG: ${message}`,
      level: "info",
      category: "debug",
      data,
    });
  }

  // Info-level logging for important events
  info(message, data = {}) {
    const logData = {
      level: "info",
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    if (this.isDevelopment) {
      console.log(`ℹ️ ${message}`, data);
    }

    Sentry.addBreadcrumb({
      message: `INFO: ${message}`,
      level: "info",
      category: "app",
      data,
    });
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
    this.debug(`[BUDGET-SYNC] ${message}`, {
      ...data,
      category: "budget-sync",
    });
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
}

export const logger = new Logger();
export default logger;
