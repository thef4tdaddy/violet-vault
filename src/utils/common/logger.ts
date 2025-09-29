// Dynamic import to avoid circular dependency with highlight.js
// Type definitions for the logger utility

/**
 * Data payload for logging methods
 */
export interface LogData {
  [key: string]: any;
}

/**
 * Highlight.io client interface - matches actual highlight.run package
 */
interface HighlightClient {
  track: (event: string, data: LogData) => void;
  consumeError: (error: Error, message?: string, payload?: {
    [key: string]: string;
  }) => void;
}

/**
 * Highlight.io module interface
 */
interface HighlightModule {
  H: HighlightClient;
}

// Initialize H with proper typing
let H: HighlightClient | null = null;

class Logger {
  private readonly isDevelopment: boolean;
  private readonly isDevSite: boolean;
  private readonly debugThrottles: Map<string, number>;

  constructor() {
    this.isDevelopment = import.meta.env.MODE === "development";
    this.isDevSite = this.getIsDevSite();
    this.debugThrottles = new Map<string, number>(); // For throttling frequent debug messages
  }

  // Initialize H when needed
  private initH(): HighlightClient {
    if (!H) {
      try {
        // Use dynamic import to avoid circular dependency
        import("../common/highlight.js")
          .then((module: HighlightModule) => {
            H = module.H;
          })
          .catch(() => {
            H = { track: () => {}, consumeError: () => {} } as HighlightClient; // Fallback mock
          });
      } catch {
        H = { track: () => {}, consumeError: () => {} } as HighlightClient; // Fallback mock
      }
    }
    return H || { track: () => {}, consumeError: () => {} } as HighlightClient;
  }

  private getIsDevSite(): boolean {
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
  public debug(message: string, data: LogData = {}): void {
    // Show debug logs only in development or on dev.* sites
    if (this.isDevelopment || this.isDevSite) {
      // Use window.originalConsoleLog if available, otherwise regular console.log
      const consoleLog = (typeof window !== "undefined" && (window as any).originalConsoleLog) || console.log;
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
  public debugThrottled(message: string, data: LogData = {}, throttleMs: number = 1000): void {
    const key = message;
    const now = Date.now();
    const lastCall = this.debugThrottles.get(key);

    if (!lastCall || now - lastCall > throttleMs) {
      this.debug(message, data);
      this.debugThrottles.set(key, now);
    }
  }

  // Info-level logging for important events
  public info(message: string, data: LogData = {}): void {
    // Show info logs only in development or on dev.* sites
    if (this.isDevelopment || this.isDevSite) {
      const consoleLog = (typeof window !== "undefined" && (window as any).originalConsoleLog) || console.log;
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
  public warn(message: string, data: LogData = {}): void {
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
  public error(message: string, error: Error | null = null, data: LogData = {}): void {
    console.error(`❌ ${message}`, error, data);

    const h = this.initH();
    if (h && h.consumeError) {
      if (error instanceof Error) {
        h.consumeError(error, message, this.convertToStringPayload({ ...data, component: "app" }));
      } else {
        h.consumeError(new Error(message), undefined, this.convertToStringPayload({ ...data, component: "app" }));
      }
    }
  }

  /**
   * Convert LogData to string payload for Highlight.io compatibility
   */
  private convertToStringPayload(data: LogData): { [key: string]: string } {
    const payload: { [key: string]: string } = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        try {
          payload[key] = typeof value === 'string' ? value : JSON.stringify(value);
        } catch (error) {
          payload[key] = String(value);
        }
      }
    }
    
    return payload;
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
  public production(message: string, data: LogData = {}): void {
    // Always show production logs in console with distinctive styling
    const consoleLog = (typeof window !== "undefined" && (window as any).originalConsoleLog) || console.log;
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
  public budgetSync(message: string, data: LogData = {}): void {
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
            h.consumeError(
              new Error(`Budget Sync: ${message}`), 
              `Critical budget sync: ${message}`,
              this.convertToStringPayload({ ...data, category: "budget-sync", critical: "true" })
            );
          }
        }
      }
    } catch (error) {
      console.error("Failed to log to Highlight.io:", error);
    }
  }

  public auth(message: string, data: LogData = {}): void {
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

  public firebase(message: string, data: LogData = {}): void {
    this.debug(`[FIREBASE] ${message}`, {
      ...data,
      category: "firebase",
    });
  }

  // Performance logging
  public performance(operation: string, duration: number, data: LogData = {}): void {
    this.info(`[PERFORMANCE] ${operation} completed in ${duration}ms`, {
      duration,
      operation,
      ...data,
    });
  }

  // User action logging
  public userAction(action: string, data: LogData = {}): void {
    this.info(`[USER-ACTION] ${action}`, {
      action,
      ...data,
    });
  }

  // Test Highlight.io connectivity
  public testHighlight(): void {
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
      if (h && h.consumeError && error instanceof Error) {
        h.consumeError(
          error, 
          "Test error message",
          this.convertToStringPayload({ test: "true", source: "logger", category: "test" })
        );
      }
    }

    console.log(
      "✅ Highlight.io test messages sent - check your Highlight.io dashboard",
    );
  }
}

export const logger = new Logger();

// Make logger available globally for testing
declare global {
  interface Window {
    logger: Logger;
    testHighlight: () => void;
    originalConsoleLog?: typeof console.log;
  }
}

if (typeof window !== "undefined") {
  window.logger = logger;
  window.testHighlight = () => logger.testHighlight();
}

export default logger;
