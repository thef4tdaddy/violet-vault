import { H } from "highlight.run";
import logger from "../common/logger.ts";

interface ErrorMonitoringConfig {
  projectId: string;
  environment: string;
  enabled: boolean;
  errorSampleRate: number;
  sessionSampleRate: number;
  debug?: boolean;
}

/**
 * Get environment-aware configuration for Highlight.io
 * Implements proper environment separation to avoid quota mixing
 */
const getErrorMonitoringConfig = (): ErrorMonitoringConfig => {
  const env = import.meta.env.MODE;
  const isErrorReportingEnabled = import.meta.env.VITE_ERROR_REPORTING_ENABLED === "true";

  const config = {
    projectId: import.meta.env.VITE_HIGHLIGHT_PROJECT_ID || "your-project-id-here",
    environment: env,
    enabled: isErrorReportingEnabled,
    errorSampleRate: parseFloat(import.meta.env.VITE_ERROR_SAMPLE_RATE) || 1.0,
    sessionSampleRate: parseFloat(import.meta.env.VITE_SESSION_SAMPLE_RATE) || 0.1,
  };

  // Environment-specific overrides
  switch (env) {
    case "production":
      return {
        ...config,
        enabled: config.enabled && config.projectId !== "your-project-id-here",
        sessionSampleRate: config.sessionSampleRate || 0.1, // Conservative sampling in prod
        debug: false,
      };
    case "staging":
      return {
        ...config,
        enabled: config.enabled && config.projectId !== "your-staging-project-id-here",
        sessionSampleRate: config.sessionSampleRate || 1.0, // Full sampling for testing
        debug: true,
      };
    case "development":
      return {
        ...config,
        enabled: config.enabled && config.projectId !== "your-dev-project-id-here",
        sessionSampleRate: config.sessionSampleRate || 1.0, // Full sampling for debugging
        debug: true,
      };
    default:
      return { ...config, enabled: false };
  }
};

export const initHighlight = () => {
  const config = getErrorMonitoringConfig();

  // Log configuration in development/staging
  if (config.debug) {
    logger.debug("Initializing Highlight.io", {
      mode: import.meta.env.MODE,
      projectId: config.projectId.substring(0, 8) + "...", // Partial ID for security
      enabled: config.enabled,
      errorSampleRate: config.errorSampleRate,
      sessionSampleRate: config.sessionSampleRate,
    });
  }

  // Skip initialization if error reporting is disabled or invalid project ID
  if (!config.enabled) {
    if (config.debug) {
      logger.debug("Highlight.io initialization skipped", {
        reason: "Error reporting disabled or invalid project ID",
        environment: config.environment,
      });
    }
    return;
  }

  try {
    H.init(config.projectId, {
      serviceName: "violet-vault",
      environment: config.environment,
      tracingOrigins: true,

      // Session replay configuration
      sessionShortcut: false, // Don't show session replay shortcut in UI
      inlineImages: false, // Don't inline images for privacy
      samplingStrategy: {
        sessionSamplingRate: config.sessionSampleRate,
        errorSamplingRate: config.errorSampleRate,
      } as Record<string, unknown>,

      networkRecording: {
        enabled: true,
        recordHeadersAndBody: false, // Don't record sensitive data for privacy
        urlBlocklist: [
          // Default blocked URLs for security
          "https://www.googleapis.com/identitytoolkit",
          "https://securetoken.googleapis.com",
          // Firebase URLs that might contain sensitive data
          "https://firestore.googleapis.com",
          "https://firebase.googleapis.com",
        ],
      },

      // Environment-specific settings
      debug: config.debug,
    } as Record<string, unknown>);

    if (config.debug) {
      logger.debug("Highlight.io initialized successfully", {
        environment: config.environment,
        sessionSamplingRate: config.sessionSampleRate,
      });
    }
  } catch (error) {
    logger.error("Failed to initialize Highlight.io", error, {
      environment: config.environment,
      projectId: config.projectId.substring(0, 8) + "...",
    });
  }

  // Setup console capture for enhanced error tracking (commented out to avoid conflicts)
  // _setupConsoleCapture();
};

// Disabled function to avoid unused declaration error
// @ts-expect-error - Intentionally unused function kept for future use
function _setupConsoleCapture(): void {
  // Disabled function - console capture commented out
  // to avoid conflicts with other error tracking
  return;
  // const originalConsoleError = console.error;
  // const originalConsoleWarn = console.warn;

  // Capture console errors and send to Highlight.io
  // console.error = (...args) => {
  //   originalConsoleError(...args);
  //   const message = args
  //     .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
  //     .join(" ");

  //   // Skip frequent or expected errors that create noise
  //   if (
  //     message.includes("Failed to fetch dynamically imported module") ||
  //     message.includes("ResizeObserver loop limit exceeded") ||
  //     message.includes("Non-Error promise rejection captured") ||
  //     message.includes("🔧") ||
  //     message.includes("✅") ||
  //     message.includes("Layout component is running") ||
  //     message.includes("Network status:")
  //   ) {
  //     return;
  //   }
  //   H.consumeError(new Error(message));
  // };

  // console.warn = (...args) => {
  //   originalConsoleWarn(...args);
  //   const message = args
  //     .map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)))
  //     .join(" ");
  //   if (
  //     message.includes("React does not recognize") ||
  //     message.includes("validateDOMNesting") ||
  //     message.includes("componentWillReceiveProps") ||
  //     message.includes("Legacy context API")
  //   ) {
  //     return;
  //   }
  //   if (import.meta.env.MODE === "development") {
  //     logger.debug("⚠️ Warning captured", { message });
  //   }
  // };
}

/**
 * Fallback error reporting when Highlight.io is blocked
 * Stores errors locally and retries periodically
 */
class ErrorReportingFallback {
  queue: Array<Record<string, unknown>>;
  retryInterval: ReturnType<typeof setInterval> | null;
  maxQueueSize: number;
  retryIntervalMs: number;

  constructor() {
    this.queue = [];
    this.retryInterval = null;
    this.maxQueueSize = 50;
    this.retryIntervalMs = 30000; // 30 seconds
  }

  addError(error: Error, context: Record<string, unknown> = {}): void {
    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift(); // Remove oldest error
    }

    this.queue.push({
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
      environment: import.meta.env.MODE,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Start retry mechanism if not already running
    if (!this.retryInterval) {
      this.startRetryMechanism();
    }

    // Also log to console as fallback
    logger.error("Error captured (Highlight.io fallback)", error, context);
  }

  startRetryMechanism(): void {
    this.retryInterval = setInterval(() => {
      this.attemptFlush();
    }, this.retryIntervalMs);
  }

  async attemptFlush(): Promise<void> {
    if (this.queue.length === 0) {
      if (this.retryInterval) {
        clearInterval(this.retryInterval);
      }
      this.retryInterval = null;
      return;
    }

    try {
      // Try to reinitialize Highlight.io
      const config = getErrorMonitoringConfig();
      if (config.enabled) {
        H.init(config.projectId, { environment: config.environment } as Record<string, unknown>);

        // Send queued errors
        for (const errorData of this.queue) {
          const errorMessage =
            (errorData.error as { message?: string })?.message ?? "Unknown error";
          H.consumeError(new Error(errorMessage), JSON.stringify(errorData.context));
        }

        this.queue = [];
        logger.debug("Successfully flushed error queue to Highlight.io");
      }
    } catch {
      logger.debug("Retry failed, keeping errors in queue", {
        queueSize: this.queue.length,
      });
    }
  }

  getQueuedErrors(): Array<Record<string, unknown>> {
    return [...this.queue];
  }

  clearQueue(): void {
    this.queue = [];
  }
}

// Global fallback instance
const errorFallback = new ErrorReportingFallback();

/**
 * Enhanced error capture with fallback support
 * Use this instead of H.consumeError for better reliability
 */
export const captureError = (error: Error, context: Record<string, unknown> = {}) => {
  try {
    // Try Highlight.io first
    H.consumeError(error, JSON.stringify(context));
  } catch (highlightError) {
    // Fallback to local storage and retry mechanism
    errorFallback.addError(error, context);
    logger.warn("Highlight.io blocked, using fallback error reporting", {
      error: highlightError instanceof Error ? highlightError.message : String(highlightError),
    });
  }
};

/**
 * Get current error reporting status and queue information
 */
export const getErrorReportingStatus = () => {
  const config = getErrorMonitoringConfig();
  return {
    enabled: config.enabled,
    environment: config.environment,
    projectId: config.projectId.substring(0, 8) + "...",
    queuedErrors: errorFallback.getQueuedErrors().length,
    isRetrying: !!errorFallback.retryInterval,
  };
};

// User identification for session tracking
export const identifyUser = (email: string, userData: Record<string, unknown> = {}): void => {
  H.identify(email, {
    ...userData,
    app: "violet-vault",
    environment: import.meta.env.MODE,
  });
};

// Export Highlight instance for direct usage if needed
export { H };
