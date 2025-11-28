// Dynamic import to avoid circular dependency with sentry.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SentryInstance: any | null = null;

// Helper function to get import.meta.env safely
function getImportMetaEnv() {
  try {
    // TypeScript doesn't properly recognize import.meta with ESNext
    const meta = import.meta as { env?: { MODE?: string } };
    return meta.env || {};
  } catch {
    return {};
  }
}

class Logger {
  isDevelopment: boolean;
  isDevSite: boolean;
  debugThrottles: Map<string, number>;
  logBuffer: Array<{
    timestamp: string;
    level: string;
    message: string;
    data?: Record<string, unknown>;
    errorStack?: string;
  }>;

  constructor() {
    const env = getImportMetaEnv();
    this.isDevelopment = env?.MODE === "development";
    this.isDevSite = this.getIsDevSite();
    this.debugThrottles = new Map(); // For throttling frequent debug messages
    this.logBuffer = [];
  }

  // Initialize Sentry when needed
  initSentry() {
    if (!SentryInstance) {
      try {
        // Use dynamic import to avoid circular dependency
        import("../common/sentry.js")
          .then((module) => {
            SentryInstance = module.Sentry;
          })
          .catch(() => {
            SentryInstance = { captureException: () => {}, captureMessage: () => {} }; // Fallback mock
          });
      } catch {
        SentryInstance = { captureException: () => {}, captureMessage: () => {} }; // Fallback mock
      }
    }
    return SentryInstance || { captureException: () => {}, captureMessage: () => {} };
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

  private recordLogEntry(
    level: string,
    message: string,
    data: Record<string, unknown> = {},
    error: unknown = null
  ) {
    if (!(this.isDevelopment || this.isDevSite)) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: Object.keys(data || {}).length > 0 ? data : undefined,
      errorStack:
        error instanceof Error
          ? `${error.name}: ${error.message}\n${error.stack ?? ""}`
          : undefined,
    };

    this.logBuffer.push(entry);
    const MAX_BUFFER = 500;
    if (this.logBuffer.length > MAX_BUFFER) {
      this.logBuffer.splice(0, this.logBuffer.length - MAX_BUFFER);
    }
  }

  private formatLogEntry(entry: {
    timestamp: string;
    level: string;
    message: string;
    data?: Record<string, unknown>;
    errorStack?: string;
  }) {
    const lines = [
      `[${entry.timestamp}] [${entry.level}] ${entry.message}`,
      entry.data ? `DATA: ${safeStringify(entry.data)}` : null,
      entry.errorStack ? `ERROR: ${entry.errorStack}` : null,
    ].filter(Boolean);

    return lines.join("\n");
  }

  getBufferedLogCount() {
    return this.logBuffer.length;
  }

  downloadBufferedLogs(filename = "violet-vault-logs.txt") {
    if (typeof window === "undefined" || this.logBuffer.length === 0) {
      console.warn("⚠️ No buffered logs available to download.");
      return;
    }

    const formatted = this.logBuffer.map((entry) => this.formatLogEntry(entry)).join("\n\n");
    const blob = new Blob([formatted], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  // Debug-level logging for development and sync issues
  debug(message: string, data: Record<string, unknown> = {}) {
    // Show debug logs only in development or on dev.* sites
    if (this.isDevelopment || this.isDevSite) {
      // Use window.originalConsoleLog if available, otherwise regular console.log
      const consoleLog =
        ((window as unknown as Record<string, unknown>).originalConsoleLog as typeof console.log) ||
        console.log;
      consoleLog(
        `🔍 [${this.isDevelopment ? "DEV" : this.isDevSite ? "DEV-SITE" : "PROD"}] ${message}`,
        data
      );
    }

    this.recordLogEntry("DEBUG", message, data);

    // Sentry tracking for all debug logs
    try {
      const sentry = this.initSentry();
      if (sentry && sentry.captureMessage) {
        sentry.captureMessage(`DEBUG: ${message}`, "debug", {
          tags: { category: "debug" },
          extra: data,
        });
      }
    } catch {
      // Silently fail if Sentry isn't available
    }
  }

  // Throttled debug logging for frequently called functions (like React renders)
  debugThrottled(message: string, data: Record<string, unknown> = {}, throttleMs = 1000) {
    const key = message;
    const now = Date.now();
    const lastCall = this.debugThrottles.get(key);

    if (!lastCall || now - lastCall > throttleMs) {
      this.debug(message, data);
      this.debugThrottles.set(key, now);
    }
  }

  // Info-level logging for important events
  info(message: string, data: Record<string, unknown> = {}) {
    // Show info logs only in development or on dev.* sites
    if (this.isDevelopment || this.isDevSite) {
      const consoleLog =
        ((window as unknown as Record<string, unknown>).originalConsoleLog as typeof console.log) ||
        console.log;
      consoleLog(`ℹ️ ${message}`, data);
    }

    try {
      const sentry = this.initSentry();
      if (sentry && sentry.captureMessage) {
        sentry.captureMessage(`INFO: ${message}`, "info", {
          tags: { category: "app" },
          extra: data,
        });
      }
    } catch (error) {
      console.error("Sentry logging failed:", error);
    }

    this.recordLogEntry("INFO", message, data);
  }

  // Warning-level logging
  warn(message: string, data: Record<string, unknown> = {}): void {
    console.warn(`⚠️ ${message}`, data);

    this.recordLogEntry("WARN", message, data);

    const sentry = this.initSentry();
    if (sentry && sentry.captureMessage) {
      sentry.captureMessage(`WARN: ${message}`, "warning", {
        tags: { category: "app" },
        extra: data,
      });
    }
  }

  // Error-level logging
  error(message: string, error: unknown = null, data: Record<string, unknown> = {}): void {
    console.error(`❌ ${message}`, error, data);

    this.recordLogEntry("ERROR", message, data, error);

    const sentry = this.initSentry();
    if (sentry && sentry.captureException) {
      if (error instanceof Error) {
        sentry.captureException(error, {
          tags: { component: "app" },
          extra: { message, ...data },
        });
      } else {
        sentry.captureException(new Error(message), {
          tags: { component: "app" },
          extra: data,
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
  production(message: string, data: Record<string, unknown> = {}) {
    // Always show production logs in console with distinctive styling
    const consoleLog =
      ((window as unknown as Record<string, unknown>).originalConsoleLog as typeof console.log) ||
      console.log;
    consoleLog(`🟢 [PROD] ${message}`, data);

    this.recordLogEntry("PRODUCTION", message, data);

    try {
      const sentry = this.initSentry();
      if (sentry && sentry.captureMessage) {
        sentry.captureMessage(`PRODUCTION: ${message}`, "info", {
          tags: { category: "production" },
          extra: data,
        });
      }
    } catch (error) {
      console.error("Sentry production logging failed:", error);
    }
  }

  // Specific methods for common debugging scenarios
  budgetSync(message: string, data: Record<string, unknown> = {}): void {
    // Only log budget sync in development mode to reduce production noise
    if (this.isDevelopment) {
      console.log(`💰 [BUDGET-SYNC] ${message}`, data);
    }

    // Also send to Sentry
    try {
      const sentry = this.initSentry();
      if (sentry && sentry.captureMessage) {
        sentry.captureMessage(`BUDGET-SYNC: ${message}`, "info", {
          tags: { category: "budget-sync" },
          extra: data,
        });

        // For critical budget sync issues, also send as error to ensure visibility
        if (message.includes("budgetId value") || message.includes("sync issue")) {
          if (sentry.captureException) {
            sentry.captureException(new Error(`Budget Sync: ${message}`), {
              tags: { category: "budget-sync", critical: "true" },
              extra: data,
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to log to Sentry:", error);
    }

    this.recordLogEntry("BUDGET-SYNC", message, data);
  }

  auth(message: string, data: Record<string, unknown> = {}) {
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

  firebase(message: string, data: Record<string, unknown> = {}): void {
    this.debug(`[FIREBASE] ${message}`, {
      ...data,
      category: "firebase",
    });
  }

  // Performance logging
  performance(operation: string, duration: number, data: Record<string, unknown> = {}): void {
    this.info(`[PERFORMANCE] ${operation} completed in ${duration}ms`, {
      duration,
      operation,
      ...data,
    });
  }

  // User action logging
  userAction(action: string, data: Record<string, unknown> = {}): void {
    this.info(`[USER-ACTION] ${action}`, {
      action,
      ...data,
    });
  }

  // Test Sentry connectivity
  testSentry(): void {
    console.log("🧪 Testing Sentry connectivity...");

    // Send a test message
    const sentry = this.initSentry();
    if (sentry && sentry.captureMessage) {
      sentry.captureMessage("Test event from logger", "info", {
        tags: { category: "test", source: "logger" },
        extra: { timestamp: new Date().toISOString() },
      });
    }

    // Send a test error
    try {
      throw new Error("Test error from logger - this is intentional");
    } catch (error) {
      if (sentry && sentry.captureException) {
        sentry.captureException(error as Error, {
          tags: { category: "test", source: "logger" },
          extra: { test: true },
        });
      }
    }

    console.log("✅ Sentry test messages sent - check your Sentry dashboard");
  }
}

export const logger = new Logger();

function safeStringify(value: Record<string, unknown>) {
  try {
    return JSON.stringify(
      value,
      (_key, v) => {
        if (typeof v === "bigint") {
          return v.toString();
        }
        if (v instanceof Error) {
          return {
            name: v.name,
            message: v.message,
            stack: v.stack,
          };
        }
        return v;
      },
      2
    );
  } catch (error) {
    return `"[Unserializable data: ${(error as Error)?.message ?? "unknown"}]"`;
  }
}

// Make logger available globally for testing
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).logger = logger;
  (window as unknown as Record<string, unknown>).testSentry = () => logger.testSentry();
}

export default logger;
