/**
 * Hook for managing Sentry session integration
 * Replaces useBugReportHighlight.ts for Sentry migration
 */

import logger from "@/utils/core/common/logger";
import { getSentryEventUrl, Sentry } from "@/utils/core/common/sentry";

/**
 * Sentry session state
 */
interface SentrySessionState {
  eventUrl: string | null;
  eventId: string | null;
  available: boolean;
}

/**
 * Sentry session actions
 */
interface SentrySessionActions {
  initializeSentrySession: () => Promise<void>;
  getSentrySessionData: () => Promise<SentrySessionState>;
}

/**
 * Hook for managing Sentry session integration
 */
export const useBugReportSentry = (): SentrySessionActions => {
  /**
   * Initialize Sentry session management
   * Note: Sentry automatically tracks sessions, no manual initialization needed
   */
  const initializeSentrySession = async (): Promise<void> => {
    try {
      // Sentry automatically tracks sessions when initialized
      // We just need to ensure it's initialized (which happens in SentryLoader)
      logger.debug("Sentry session tracking is automatic - no manual initialization needed");
    } catch (error) {
      logger.debug("Sentry session management info", {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  /**
   * Get Sentry event URL for bug reports
   * Note: Sentry doesn't provide session URLs like Highlight.io
   * Instead, we can capture a test event and link to it, or use the latest event
   */
  const getSentrySessionData = async (): Promise<SentrySessionState> => {
    try {
      // Capture a test event to get an event ID for linking
      // In practice, bug reports will link to the actual error event
      const eventId = Sentry.captureMessage("Bug report submitted", {
        level: "info",
        tags: {
          source: "bug_report",
        },
      });

      const eventUrl = getSentryEventUrl(eventId);

      return {
        eventUrl: eventUrl || "Sentry event link unavailable",
        eventId: eventId || null,
        available: !!(eventUrl || eventId),
      };
    } catch (error) {
      logger.debug("Error getting Sentry session data", {
        error: error instanceof Error ? error.message : String(error),
      });
      return {
        eventUrl: null,
        eventId: null,
        available: false,
      };
    }
  };

  return {
    initializeSentrySession,
    getSentrySessionData,
  };
};
