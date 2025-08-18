import LogRocket from "logrocket";
import setupLogRocketReact from "logrocket-react";
import logger from "./logger";

/**
 * Get environment-aware configuration for LogRocket
 * Implements proper environment separation to avoid quota mixing
 */
const getLogRocketConfig = () => {
  const env = import.meta.env.MODE;
  const isErrorReportingEnabled =
    import.meta.env.VITE_ERROR_REPORTING_ENABLED === "true";

  const config = {
    appId: import.meta.env.VITE_LOGROCKET_APP_ID || "your-app-id-here",
    environment: env,
    enabled: isErrorReportingEnabled,
    release: import.meta.env.VITE_APP_VERSION || "1.8.0",
  };

  // Environment-specific overrides
  switch (env) {
    case "production":
      return {
        ...config,
        enabled: config.enabled && config.appId !== "your-prod-app-id-here",
        debug: false,
        console: {
          shouldAggregateConsoleErrors: true,
        },
        network: {
          requestSanitizer: (request) => {
            // Remove sensitive headers and data for financial app
            if (request.headers && request.headers.authorization) {
              request.headers.authorization = "[REDACTED]";
            }
            return request;
          },
          responseSanitizer: (response) => {
            // Remove sensitive response data
            if (response.headers && response.headers["set-cookie"]) {
              response.headers["set-cookie"] = "[REDACTED]";
            }
            return response;
          },
        },
      };
    case "staging":
    case "development":
      // Both staging and development use the same LogRocket app for Vercel previews
      return {
        ...config,
        enabled:
          config.enabled && config.appId !== "your-dev-staging-app-id-here",
        debug: true,
        console: {
          shouldAggregateConsoleErrors: env === "staging", // Aggregate in staging, individual in dev
          isEnabled: true,
        },
        // Add environment tag to differentiate staging vs dev sessions
        tags: {
          env_type: env,
          is_vercel_preview: !!process.env.VERCEL_URL,
        },
      };
    default:
      return { ...config, enabled: false };
  }
};

/**
 * Initialize LogRocket with environment-specific configuration
 */
export const initLogRocket = () => {
  const config = getLogRocketConfig();

  // Log configuration in development/staging
  if (config.debug) {
    logger.debug("Initializing LogRocket", {
      mode: import.meta.env.MODE,
      appId: config.appId.substring(0, 8) + "...", // Partial ID for security
      enabled: config.enabled,
      release: config.release,
    });
  }

  // Skip initialization if error reporting is disabled or invalid app ID
  if (!config.enabled) {
    if (config.debug) {
      logger.debug("LogRocket initialization skipped", {
        reason: "Error reporting disabled or invalid app ID",
        environment: config.environment,
      });
    }
    return;
  }

  try {
    // Initialize LogRocket
    LogRocket.init(config.appId, {
      release: config.release,

      // Privacy settings for financial application
      dom: {
        textSanitizer: true, // Automatically sanitize text content
        inputSanitizer: true, // Sanitize input fields
      },

      // Network request/response sanitization
      network: config.network || {},

      // Console settings
      console: config.console || {},

      // Capture settings
      shouldCaptureIP: false, // Don't capture IP addresses for privacy

      // Custom error handling
      shouldDebugLog: config.debug,
    });

    // Setup React integration
    setupLogRocketReact(LogRocket);

    // Add environment tags to session
    if (config.tags) {
      Object.entries(config.tags).forEach(([key, value]) => {
        LogRocket.addTag(key, value);
      });
    }

    // Add additional environment context
    LogRocket.addTag("environment", config.environment);
    LogRocket.addTag("app_version", config.release);

    // Add Vercel deployment context if available
    if (typeof window !== "undefined") {
      const isVercel =
        window.location.hostname.includes("vercel.app") ||
        window.location.hostname.includes("vercel.com");
      if (isVercel) {
        LogRocket.addTag("deployment", "vercel");
      }
    }

    if (config.debug) {
      logger.debug("LogRocket initialized successfully", {
        environment: config.environment,
        release: config.release,
      });
    }
  } catch (error) {
    logger.error("Failed to initialize LogRocket", error, {
      environment: config.environment,
      appId: config.appId.substring(0, 8) + "...",
    });
  }
};

/**
 * Identify user for LogRocket session tracking
 * @param {string} email - User email
 * @param {object} userData - Additional user data
 */
export const identifyUser = (email, userData = {}) => {
  try {
    LogRocket.identify(email, {
      ...userData,
      app: "violet-vault",
      environment: import.meta.env.MODE,
      version: import.meta.env.VITE_APP_VERSION,
    });
  } catch (error) {
    logger.warn("Failed to identify user in LogRocket", error);
  }
};

/**
 * Capture custom error with context
 * @param {Error} error - Error object
 * @param {object} context - Additional context
 */
export const captureError = (error, context = {}) => {
  try {
    // Add error to LogRocket session
    LogRocket.captureException(error, {
      tags: {
        environment: import.meta.env.MODE,
        component: context.component || "unknown",
        action: context.action || "unknown",
      },
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
        url: window.location.href,
      },
    });
  } catch (logRocketError) {
    // Fallback to console if LogRocket fails
    logger.error(
      "LogRocket error capture failed, falling back to console",
      logRocketError,
    );
    logger.error("Original error:", error, context);
  }
};

/**
 * Track custom events in LogRocket
 * @param {string} name - Event name
 * @param {object} properties - Event properties
 */
export const trackEvent = (name, properties = {}) => {
  try {
    LogRocket.track(name, {
      ...properties,
      environment: import.meta.env.MODE,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.warn("Failed to track event in LogRocket", error, {
      name,
      properties,
    });
  }
};

/**
 * Get current session URL for debugging
 * @returns {string|null} Session URL or null if not available
 */
export const getSessionURL = () => {
  try {
    return LogRocket.sessionURL;
  } catch (error) {
    logger.warn("Failed to get LogRocket session URL", error);
    return null;
  }
};

/**
 * Add tag to current session
 * @param {string} key - Tag key
 * @param {string} value - Tag value
 */
export const addTag = (key, value) => {
  try {
    LogRocket.addTag(key, value);
  } catch (error) {
    logger.warn("Failed to add LogRocket tag", error, { key, value });
  }
};

/**
 * Get current LogRocket status and configuration
 */
export const getLogRocketStatus = () => {
  const config = getLogRocketConfig();
  return {
    enabled: config.enabled,
    environment: config.environment,
    appId: config.appId.substring(0, 8) + "...",
    release: config.release,
    sessionURL: getSessionURL(),
  };
};

// Export LogRocket instance for direct usage if needed
export { LogRocket };
export default LogRocket;
