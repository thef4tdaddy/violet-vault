import { useEffect } from "react";
import logger from "@/utils/core/common/logger";

/**
 * Lazy loader component for Sentry monitoring
 * Note: Sentry is now initialized early in main.tsx to capture module initialization errors.
 * This component ensures Sentry is fully initialized after React renders.
 */
const SentryLoader = () => {
  useEffect(() => {
    const ensureSentryInitialized = async () => {
      try {
        // Check if Sentry is already initialized (from main.tsx)
        const { getErrorReportingStatus } = await import("../../utils/common/sentry.js");
        const status = getErrorReportingStatus();

        if (status.enabled) {
          logger.debug("Sentry already initialized early, ensuring full setup");
        } else {
          // Fallback: initialize if not already done
          const { initSentry } = await import("../../utils/common/sentry.js");
          initSentry();
          logger.debug("Sentry initialized via lazy loader fallback");
        }
      } catch (error) {
        // Graceful fallback - monitoring is not critical for app functionality
        logger.warn("Failed to ensure Sentry is initialized", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    // Small delay to ensure React has rendered
    const timer = setTimeout(ensureSentryInitialized, 50);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything - it's just a side effect loader
  return null;
};

export default SentryLoader;
