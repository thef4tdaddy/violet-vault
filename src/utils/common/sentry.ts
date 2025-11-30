import * as Sentry from "@sentry/react";
import logger from "../common/logger.ts";
import { APP_VERSION, APP_NAME } from "../common/version.ts";

interface SentryConfig {
  dsn: string;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
  debug?: boolean;
}

/**
 * Detect if we're on staging domain (even if MODE is production)
 */
const isStagingDomain = (): boolean => {
  if (typeof window === "undefined") return false;
  return (
    window.location.hostname === "staging.violetvault.app" ||
    window.location.hostname.includes("staging.violetvault.app")
  );
};

/**
 * Get environment-aware configuration for Sentry
 * Implements proper environment separation to avoid quota mixing
 */

const getSentryConfig = (): SentryConfig => {
  const env = import.meta.env.MODE;
  // Trim whitespace/newlines from environment variables (Vercel can add them)
  const errorReportingEnabledRaw = String(
    import.meta.env.VITE_ERROR_REPORTING_ENABLED || ""
  ).trim();
  const isErrorReportingEnabled = errorReportingEnabledRaw === "true";
  const dsn = String(import.meta.env.VITE_SENTRY_DSN || "").trim();

  // Override environment detection for staging domain
  const isStaging = isStagingDomain();
  const effectiveEnv = isStaging ? "staging" : env;
  const sentryEnvironmentRaw = import.meta.env.VITE_SENTRY_ENVIRONMENT || "";
  const sentryEnvironment = sentryEnvironmentRaw
    ? String(sentryEnvironmentRaw).trim()
    : effectiveEnv;

  const config = {
    dsn,
    environment: sentryEnvironment,
    enabled: isErrorReportingEnabled && !!dsn,
    tracesSampleRate: parseFloat(import.meta.env.VITE_TRACES_SAMPLE_RATE) || 1.0,
    replaysSessionSampleRate: parseFloat(import.meta.env.VITE_REPLAYS_SESSION_SAMPLE_RATE) || 0.1,
    replaysOnErrorSampleRate: parseFloat(import.meta.env.VITE_REPLAYS_ON_ERROR_SAMPLE_RATE) || 1.0,
  };

  // Environment-specific overrides
  // Check staging domain first, then MODE
  if (isStaging) {
    return {
      ...config,
      enabled: config.enabled && config.dsn !== "",
      replaysSessionSampleRate: config.replaysSessionSampleRate || 1.0, // Full sampling for testing
      tracesSampleRate: config.tracesSampleRate || 1.0, // Full trace sampling for testing
      debug: true,
    };
  }

  switch (env) {
    case "production":
      return {
        ...config,
        enabled: config.enabled && config.dsn !== "",
        replaysSessionSampleRate: config.replaysSessionSampleRate || 0.1, // Conservative sampling in prod
        tracesSampleRate: config.tracesSampleRate || 0.1, // Lower trace sampling in prod
        debug: false,
      };
    case "staging":
      return {
        ...config,
        enabled: config.enabled && config.dsn !== "",
        replaysSessionSampleRate: config.replaysSessionSampleRate || 1.0, // Full sampling for testing
        tracesSampleRate: config.tracesSampleRate || 1.0, // Full trace sampling for testing
        debug: true,
      };
    case "development":
      return {
        ...config,
        enabled: config.enabled && config.dsn !== "",
        replaysSessionSampleRate: config.replaysSessionSampleRate || 1.0, // Full sampling for debugging
        tracesSampleRate: config.tracesSampleRate || 1.0, // Full trace sampling for debugging
        debug: true,
      };
    default:
      return { ...config, enabled: false };
  }
};

/**
 * Filter Sentry events to reduce noise
 * - Filters out INFO/DEBUG level messages
 * - Filters out CORS errors from cross-origin iframes
 * - Removes sensitive data from requests
 */
const filterSentryEvent = (
  event: Sentry.ErrorEvent,
  _hint: Sentry.EventHint
): Sentry.ErrorEvent | null => {
  // Filter out non-error messages (INFO, DEBUG level)
  if (event.level === "info" || event.level === "debug") {
    return null; // Don't send INFO/DEBUG messages to Sentry
  }

  // Filter out CORS errors from cross-origin iframes (Firebase, etc.)
  if (event.message) {
    const message = event.message.toLowerCase();
    if (
      message.includes("blocked a frame") ||
      message.includes("access control checks") ||
      message.includes("protocols, domains, and ports must match") ||
      message.includes("cross-origin") ||
      (message.includes("firebase") && message.includes("cors"))
    ) {
      return null; // Don't send CORS iframe errors to Sentry
    }
  }

  // Filter out CORS errors from exception messages
  if (event.exception) {
    const exceptionMessage = event.exception.values?.[0]?.value?.toLowerCase() || "";
    if (
      exceptionMessage.includes("blocked a frame") ||
      exceptionMessage.includes("access control checks") ||
      exceptionMessage.includes("protocols, domains, and ports must match") ||
      exceptionMessage.includes("cross-origin")
    ) {
      return null; // Don't send CORS iframe errors to Sentry
    }
  }

  // Remove sensitive data from requests
  if (event.request) {
    // Remove cookies and headers that might contain sensitive data
    if (event.request.cookies) {
      delete event.request.cookies;
    }
    if (event.request.headers) {
      // Keep only safe headers
      const safeHeaders = ["user-agent", "accept", "accept-language"];
      const filteredHeaders: Record<string, string> = {};
      for (const [key, value] of Object.entries(event.request.headers)) {
        if (safeHeaders.includes(key.toLowerCase())) {
          filteredHeaders[key] = value as string;
        }
      }
      event.request.headers = filteredHeaders;
    }
  }
  return event;
};

export const initSentry = () => {
  const config = getSentryConfig();

  // Always log configuration in staging/development for debugging
  const shouldLog = config.debug || isStagingDomain();
  if (shouldLog) {
    logger.debug("Initializing Sentry", {
      mode: import.meta.env.MODE,
      hostname: typeof window !== "undefined" ? window.location.hostname : "unknown",
      isStagingDomain: isStagingDomain(),
      environment: config.environment,
      enabled: config.enabled,
      hasDSN: !!config.dsn,
      errorReportingEnabled: import.meta.env.VITE_ERROR_REPORTING_ENABLED === "true",
      tracesSampleRate: config.tracesSampleRate,
      replaysSessionSampleRate: config.replaysSessionSampleRate,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
    });
  }

  // Skip initialization if error reporting is disabled or no DSN
  if (!config.enabled) {
    if (shouldLog) {
      const errorReportingEnabledRaw = String(
        import.meta.env.VITE_ERROR_REPORTING_ENABLED || ""
      ).trim();
      logger.warn("Sentry initialization skipped", {
        reason: !errorReportingEnabledRaw
          ? "VITE_ERROR_REPORTING_ENABLED is missing"
          : errorReportingEnabledRaw !== "true"
            ? `VITE_ERROR_REPORTING_ENABLED is '${errorReportingEnabledRaw}' (expected 'true')`
            : !config.dsn
              ? "VITE_SENTRY_DSN is missing or empty"
              : "Unknown reason",
        environment: config.environment,
        hostname: typeof window !== "undefined" ? window.location.hostname : "unknown",
        errorReportingEnabled: errorReportingEnabledRaw,
        errorReportingEnabledRaw: import.meta.env.VITE_ERROR_REPORTING_ENABLED,
        hasDSN: !!config.dsn,
        dsnLength: config.dsn.length,
      });
    }
    return;
  }

  try {
    // Build release name based on environment
    // Matches workflow format: violetvault@2.0.0 (production) or violetvault@2.0.1-dev.1 (develop)
    // The workflow creates releases, so we use the same format for consistency
    const getReleaseName = (): string => {
      const baseRelease = `${APP_NAME}@${APP_VERSION}`;

      // In production, use clean version (matches workflow)
      if (config.environment === "production") {
        return baseRelease;
      }

      // For staging/develop, try to match workflow pre-release format
      // Workflow creates: violetvault@2.0.1-dev.1 (where number is commit count)
      // If we have a pre-release version from env, use it; otherwise fallback to SHA
      const preReleaseVersion = import.meta.env.VITE_SENTRY_RELEASE;
      if (preReleaseVersion) {
        return preReleaseVersion;
      }

      // Fallback: include commit SHA if available
      const commitSha = import.meta.env.VITE_COMMIT_SHA || import.meta.env.VERCEL_GIT_COMMIT_SHA;
      if (commitSha) {
        const shortSha = commitSha.substring(0, 7);
        return `${baseRelease}-${config.environment}-${shortSha}`;
      }

      return `${baseRelease}-${config.environment}`;
    };

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: getReleaseName(),
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: true, // Privacy: mask all text in session replay
          blockAllMedia: true, // Privacy: block all media in session replay
          // blocklist: [
          //   // Block Firebase iframes to prevent CORS errors
          //   /firebaseapp\.com/i,
          //   /firebase/i,
          //   // Block other cross-origin iframes that might cause CORS issues
          //   /googleapis\.com/i,
          // ],
        }),
      ],
      tracePropagationTargets: [
        "localhost",
        /^https:\/\/.*\.vercel\.app$/,
        /^https:\/\/.*\.budget-app.*\.vercel\.app$/,
        /^https:\/\/staging\.violetvault\.app$/,
        /^https:\/\/.*\.violetvault\.app$/,
      ],
      tracesSampleRate: config.tracesSampleRate,
      replaysSessionSampleRate: config.replaysSessionSampleRate,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate,
      beforeSend: filterSentryEvent,
      beforeSendTransaction(event) {
        // Remove sensitive data from transactions
        if (event.request) {
          if (event.request.cookies) {
            delete event.request.cookies;
          }
        }
        return event;
      },
    });

    if (shouldLog) {
      logger.info("✅ Sentry initialized successfully", {
        environment: config.environment,
        hostname: typeof window !== "undefined" ? window.location.hostname : "unknown",
        tracesSampleRate: config.tracesSampleRate,
        replaysSessionSampleRate: config.replaysSessionSampleRate,
        dsnPrefix: config.dsn.substring(0, 30) + "...",
      });
    }
  } catch (error) {
    logger.error("Failed to initialize Sentry", error, {
      environment: config.environment,
    });
  }
};

/**
 * Enhanced error capture with Sentry
 * Use this for consistent error reporting
 */
export const captureError = (error: Error, context: Record<string, unknown> = {}) => {
  try {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
    });
  } catch (sentryError) {
    logger.warn("Sentry error capture failed", {
      error: sentryError instanceof Error ? sentryError.message : String(sentryError),
      originalError: error.message,
    });
  }
};

/**
 * Get current error reporting status
 */
export const getErrorReportingStatus = () => {
  const config = getSentryConfig();
  return {
    enabled: config.enabled,
    environment: config.environment,
    dsn: config.dsn ? `${config.dsn.substring(0, 20)}...` : "Not configured",
  };
};

/**
 * User identification for session tracking
 */
export const identifyUser = (userId: string, userData: Record<string, unknown> = {}): void => {
  try {
    Sentry.setUser({
      id: userId,
      email: userData.email as string | undefined,
      username: userData.username as string | undefined,
      ...userData,
    });
    logger.debug("User identified in Sentry", {
      userId,
      hasEmail: !!userData.email,
    });
  } catch (error) {
    logger.warn("Failed to identify user in Sentry", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Clear user identification (on logout)
 */
export const clearUser = (): void => {
  try {
    Sentry.setUser(null);
    logger.debug("User cleared from Sentry");
  } catch (error) {
    logger.warn("Failed to clear user from Sentry", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * Get current Sentry session URL (for bug reports)
 * Note: Sentry doesn't provide session URLs like Highlight.io
 * Instead, we can link to the event in Sentry's UI
 */
export const getSentryEventUrl = (eventId?: string): string | null => {
  try {
    const config = getSentryConfig();
    if (!config.enabled || !config.dsn) {
      return null;
    }

    // Extract organization and project from DSN
    // DSN format: https://<key>@<org>.ingest.sentry.io/<project>
    const dsnMatch = config.dsn.match(/https:\/\/([^@]+)@([^.]+)\.ingest\.sentry\.io\/(\d+)/);
    if (!dsnMatch || !eventId) {
      return null;
    }

    const [, , orgSlug, projectId] = dsnMatch;
    return `https://${orgSlug}.sentry.io/issues/?project=${projectId}&query=event.id%3A${eventId}`;
  } catch {
    return null;
  }
};

// Export Sentry instance for direct usage if needed
export { Sentry };
