/**
 * Error Tracking Service
 * Handles error capture, console log monitoring, and error history
 * Extracted from systemInfoService.js for Issue #513
 */
import logger from "../../utils/common/logger";

/**
 * Error information structure
 */
export interface ErrorInfo {
  type: string;
  message: string;
  stack: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: string;
  id?: number;
  captured?: string;
}

/**
 * Console log entry structure
 */
export interface ConsoleLogEntry {
  level: string;
  message: string;
  timestamp: string;
  args: string[];
}

/**
 * Error listener structure
 */
interface ErrorListener {
  type: string;
  handler: ((event: Event) => void) | { handleEvent: (event: Event) => void };
}

/**
 * Recent errors response structure
 */
export interface RecentErrorsResponse {
  recentErrors: ErrorInfo[];
  consoleLogs: ConsoleLogEntry[];
  errorCount: number;
  logCount: number;
  captureEnabled: boolean;
  error?: string;
}

/**
 * Error statistics structure
 */
export interface ErrorStats {
  total: number;
  lastHour: number;
  lastDay: number;
  types: Record<string, number>;
}

export class ErrorTrackingService {
  // Static storage for captured errors and logs
  static recentErrors: ErrorInfo[] = [];
  static consoleLogs: ConsoleLogEntry[] = [];
  static errorListeners: ErrorListener[] = [];
  static isInitialized = false;
  static originalConsole?: Record<string, (...args: unknown[]) => void>;

  /**
   * Initialize error capture system
   */
  static initializeErrorCapture(): void {
    if (this.isInitialized) return;

    try {
      // Capture uncaught errors
      const errorHandler = (event: ErrorEvent): void => {
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
      const rejectionHandler = (event: PromiseRejectionEvent): void => {
        this.addError({
          type: "unhandledRejection",
          message: event.reason?.message || String(event.reason) || "Unhandled promise rejection",
          stack: event.reason?.stack || "No stack trace",
          timestamp: new Date().toISOString(),
        });
      };

      window.addEventListener("error", errorHandler);
      window.addEventListener("unhandledrejection", rejectionHandler);

      // Store listeners for cleanup
      this.errorListeners.push(
        { type: "error", handler: errorHandler },
        { type: "unhandledrejection", handler: rejectionHandler }
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
   */
  static addError(errorInfo: Omit<ErrorInfo, "id" | "captured">): void {
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
   */
  static addConsoleLog(level: string, args: unknown[]): void {
    const maxLogs = 100; // Keep last 100 log entries

    try {
      const logEntry = {
        level,
        message: args
          .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
          .join(" "),
        timestamp: new Date().toISOString(),
        args: args.map((arg) => (typeof arg === "object" ? "[Object]" : String(arg))),
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
  static interceptConsole(): void {
    try {
      /* eslint-disable no-console -- Need to store and override console for error tracking */
      const originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug,
      };

      // Override console methods
      (["log", "warn", "error", "info", "debug"] as const).forEach((level) => {
        (console as unknown as Record<string, (...args: unknown[]) => void>)[level] = (
          ...args: unknown[]
        ) => {
          // Call original method first
          originalConsole[level](...args);

          // Then capture for bug reports
          this.addConsoleLog(level, args);
        };
      });
      /* eslint-enable no-console */

      // Store original methods for potential restoration
      this.originalConsole = originalConsole as Record<string, (...args: unknown[]) => void>;

      logger.debug("Console interception enabled");
    } catch (error) {
      logger.error("Failed to intercept console", error);
    }
  }

  /**
   * Get recent errors and console logs for bug reports
   */
  static getRecentErrors(): RecentErrorsResponse {
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
        error: (error as Error).message,
      };
    }
  }

  /**
   * Clear captured errors and logs
   */
  static clearCapturedData(): void {
    this.recentErrors = [];
    this.consoleLogs = [];
    logger.debug("Captured error data cleared");
  }

  /**
   * Cleanup error capture system
   */
  static cleanup(): void {
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
   */
  static getErrorStats(): ErrorStats {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentErrorsHour = this.recentErrors.filter(
      (error) => new Date(error.timestamp).getTime() > oneHourAgo
    );
    const recentErrorsDay = this.recentErrors.filter(
      (error) => new Date(error.timestamp).getTime() > oneDayAgo
    );

    return {
      total: this.recentErrors.length,
      lastHour: recentErrorsHour.length,
      lastDay: recentErrorsDay.length,
      types: this.recentErrors.reduce((acc: Record<string, number>, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}
