/**
 * Hook for managing Highlight.io session integration
 * Extracted from useBugReportSubmissionV2.ts to reduce complexity
 */

/// <reference types="../../../vite-env.d.ts" />

import logger from "../../../utils/common/logger";

// Declare H global for Highlight.io
declare var H: {
  start: () => void;
  isRecording: () => boolean;
  getSessionURL: () => string;
  getSessionMetadata: () => { sessionId?: string } | null;
};

/**
 * Highlight.io session state
 */
interface HighlightSessionState {
  sessionUrl: string;
  sessionId: string | null;
  available: boolean;
}

/**
 * Highlight.io session actions
 */
interface HighlightSessionActions {
  initializeHighlightSession: () => Promise<void>;
  getHighlightSessionData: () => Promise<HighlightSessionState>;
}

/**
 * Hook for managing Highlight.io session integration
 */
export const useBugReportHighlight = (): HighlightSessionActions => {
  /**
   * Check if Highlight.io session is recording
   */
  const isHighlightRecording = (): boolean => {
    return typeof H.isRecording === "function" && H.isRecording();
  };

  /**
   * Start Highlight.io session
   */
  const startHighlightSession = (): void => {
    try {
      H.start();
      logger.debug("Started new Highlight.io session for bug report");
    } catch (error) {
      logger.debug("Highlight.io start failed", { error: (error as Error).message });
    }
  };

  /**
   * Check if Highlight.io session detection is available
   */
  const hasHighlightSessionDetection = (): boolean => {
    return typeof H.getSessionMetadata === "function" || typeof H.getSessionURL === "function";
  };

  /**
   * Initialize Highlight.io session management
   */
  const initializeHighlightSession = async (): Promise<void> => {
    try {
      if (isHighlightRecording()) {
        logger.debug("Highlight.io session already active - using existing session");
      } else if (typeof H.start === "function") {
        if (hasHighlightSessionDetection()) {
          logger.debug("Using existing Highlight.io session (session detection available)");
        } else {
          startHighlightSession();
        }
      }
    } catch (error) {
      logger.debug("Highlight.io session management info", { error: (error as Error).message });
    }
  };

  /**
   * Get Highlight.io session URL
   */
  const getHighlightSessionUrl = (): string | null => {
    try {
      return typeof H.getSessionURL === "function" ? H.getSessionURL() : null;
    } catch (error) {
      logger.debug("Error getting Highlight.io session URL", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  };

  /**
   * Get Highlight.io session metadata
   */
  const getHighlightSessionMetadata = (): { sessionId?: string } | null => {
    try {
      return typeof H.getSessionMetadata === "function" ? H.getSessionMetadata() : null;
    } catch (error) {
      logger.debug("Error getting Highlight.io session metadata", {
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  };

  /**
   * Get Highlight.io session data
   */
  const getHighlightSessionData = async (): Promise<HighlightSessionState> => {
    const sessionUrl = getHighlightSessionUrl();
    const metadata = getHighlightSessionMetadata();
    const sessionId = metadata?.sessionId ?? null;

    return {
      sessionUrl: sessionUrl || "Session replay unavailable",
      sessionId,
      available: !!(sessionUrl || sessionId),
    };
  };

  return {
    initializeHighlightSession,
    getHighlightSessionData,
  };
};
