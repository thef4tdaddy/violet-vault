// Dynamic import to avoid circular dependency with highlight.js
let H: {
  track?: (event: string, data?: Record<string, unknown>) => void;
  consumeError?: (error: Error, message?: string, payload?: Record<string, string>) => void;
} | null = null;

// Helper function to get import.meta.env safely
function getImportMetaEnv() {
  try {
    // @ts-expect-error - TypeScript doesn't properly recognize import.meta with ESNext
    return import.meta.env;
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

    this.recordLogEntry("INFO", message, data);
  }

  // Warning-level logging
  warn(message: string, data: Record<string, unknown> = {}): void {
    console.warn(`⚠️ ${message}`, data);

    this.recordLogEntry("WARN", message, data);

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
  error(message: string, error: unknown = null, data: Record<string, unknown> = {}): void {
    console.error(`❌ ${message}`, error, data);

    this.recordLogEntry("ERROR", message, data, error);

    const h = this.initH();
    if (h && h.consumeError) {
      if (error instanceof Error) {
        h.consumeError(error, "Error occurred", {
          metadata: JSON.stringify({ message, ...data }),
          tags: JSON.stringify({ component: "app" }),
        });
      } else {
        h.consumeError(new Error(message), "Error occurred", {
          metadata: JSON.stringify(data),
          tags: JSON.stringify({ component: "app" }),
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
  budgetSync(message: string, data: Record<string, unknown> = {}): void {
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
        if (message.includes("budgetId value") || message.includes("sync issue")) {
          if (h.consumeError) {
            h.consumeError(new Error(`Budget Sync: ${message}`), "Budget sync error", {
              metadata: JSON.stringify(data),
              tags: JSON.stringify({ category: "budget-sync", critical: "true" }),
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to log to Highlight.io:", error);
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

  // Test Highlight.io connectivity
  testHighlight(): void {
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
        h.consumeError(error as Error, "Test error from logger", {
          metadata: JSON.stringify({ test: true, source: "logger" }),
          tags: JSON.stringify({ category: "test" }),
        });
      }
    }

    console.log("✅ Highlight.io test messages sent - check your Highlight.io dashboard");
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
  (window as unknown as Record<string, unknown>).testHighlight = () => logger.testHighlight();
}

export default logger;
