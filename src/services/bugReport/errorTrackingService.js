/**
 * Error Tracking Service
 * Handles error capture, console log monitoring, and error history
 * Extracted from systemInfoService.js for Issue #513
 */
import logger from "../../utils/common/logger";

export class ErrorTrackingService {
  // Static storage for captured errors and logs
  static recentErrors = [];
  static consoleLogs = [];
  static errorListeners = [];
  static isInitialized = false;

  /**
   * Initialize error capture system
   */
  static initializeErrorCapture() {
    if (this.isInitialized) return;

    try {
      // Capture uncaught errors
      const errorHandler = (event) => {
        this.addError({
          type: "uncaughtError",
          message: event.error?.message || event.message || "Unknown error",
          stack: event.error?.stack || "No stack trace",
          filename: event.filename || "Unknown",
          lineno: event.lineno || 0,
          colno: event.colno || 0,
          timestamp: new Date().toISOString(),
        });
      };

      // Capture unhandled promise rejections
      const rejectionHandler = (event) => {
        this.addError({
          type: "unhandledRejection",
          message:
            event.reason?.message ||
            String(event.reason) ||
            "Unhandled promise rejection",
          stack: event.reason?.stack || "No stack trace",
          timestamp: new Date().toISOString(),
        });
      };

      window.addEventListener("error", errorHandler);
      window.addEventListener("unhandledrejection", rejectionHandler);

      // Store listeners for cleanup
      this.errorListeners.push(
        { type: "error", handler: errorHandler },
        { type: "unhandledrejection", handler: rejectionHandler },
      );

      // Intercept console methods to capture logs
      this.interceptConsole();

      this.isInitialized = true;
      logger.debug("Error capture system initialized");
    } catch (error) {
      logger.error("Failed to initialize error capture", error);
    }
  }

  /**
   * Add an error to the tracking system
   * @param {Object} errorInfo - Error information
   */
  static addError(errorInfo) {
    const maxErrors = 50; // Keep last 50 errors

    this.recentErrors.push({
      ...errorInfo,
      id: Date.now() + Math.random(),
      captured: new Date().toISOString(),
    });

    // Keep only recent errors
    if (this.recentErrors.length > maxErrors) {
      this.recentErrors = this.recentErrors.slice(-maxErrors);
    }

    logger.debug("Error captured", errorInfo);
  }

  /**
   * Add a console log entry
   * @param {string} level - Log level (log, warn, error, etc.)
   * @param {Array} args - Console arguments
   */
  static addConsoleLog(level, args) {
    const maxLogs = 100; // Keep last 100 log entries

    try {
      const logEntry = {
        level,
        message: args
          .map((arg) =>
            typeof arg === "object"
              ? JSON.stringify(arg, null, 2)
              : String(arg),
          )
          .join(" "),
        timestamp: new Date().toISOString(),
        args: args.map((arg) =>
          typeof arg === "object" ? "[Object]" : String(arg),
        ),
      };

      this.consoleLogs.push(logEntry);

      // Keep only recent logs
      if (this.consoleLogs.length > maxLogs) {
        this.consoleLogs = this.consoleLogs.slice(-maxLogs);
      }
    } catch {
      // Fail silently for console log capture to avoid infinite loops
    }
  }

  /**
   * Intercept console methods to capture logs
   */
  static interceptConsole() {
    try {
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug,
      };

      // Override console methods
      ["log", "warn", "error", "info", "debug"].forEach((level) => {
        console[level] = (...args) => {
          // Call original method first
          originalConsole[level](...args);

          // Then capture for bug reports
          this.addConsoleLog(level, args);
        };
      });

      // Store original methods for potential restoration
      this.originalConsole = originalConsole;

      logger.debug("Console interception enabled");
    } catch (error) {
      logger.error("Failed to intercept console", error);
    }
  }

  /**
   * Get recent errors and console logs for bug reports
   * @returns {Object} Error and log information
   */
  static getRecentErrors() {
    try {
      return {
        recentErrors: [...this.recentErrors], // Create copy
        consoleLogs: [...this.consoleLogs.slice(-20)], // Last 20 console logs
        errorCount: this.recentErrors.length,
        logCount: this.consoleLogs.length,
        captureEnabled: this.isInitialized,
      };
    } catch (error) {
      logger.warn("Error collecting recent errors", error);
      return {
        recentErrors: [],
        consoleLogs: [],
        errorCount: 0,
        logCount: 0,
        captureEnabled: false,
        error: error.message,
      };
    }
  }

  /**
   * Clear captured errors and logs
   */
  static clearCapturedData() {
    this.recentErrors = [];
    this.consoleLogs = [];
    logger.debug("Captured error data cleared");
  }

  /**
   * Cleanup error capture system
   */
  static cleanup() {
    try {
      // Remove event listeners
      this.errorListeners.forEach(({ type, handler }) => {
        window.removeEventListener(type, handler);
      });
      this.errorListeners = [];

      // Restore original console methods if available
      if (this.originalConsole) {
        Object.assign(console, this.originalConsole);
        delete this.originalConsole;
      }

      this.isInitialized = false;
      logger.debug("Error capture system cleaned up");
    } catch (error) {
      logger.error("Failed to cleanup error capture", error);
    }
  }

  /**
   * Get error statistics
   * @returns {Object} Error statistics
   */
  static getErrorStats() {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentErrorsHour = this.recentErrors.filter(
      (error) => new Date(error.timestamp).getTime() > oneHourAgo,
    );
    const recentErrorsDay = this.recentErrors.filter(
      (error) => new Date(error.timestamp).getTime() > oneDayAgo,
    );

    return {
      total: this.recentErrors.length,
      lastHour: recentErrorsHour.length,
      lastDay: recentErrorsDay.length,
      types: this.recentErrors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}
