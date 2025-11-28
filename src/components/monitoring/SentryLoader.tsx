import { useEffect } from "react";
import logger from "../../utils/common/logger";

/**
 * Lazy loader component for Sentry monitoring
 * This component dynamically imports and initializes Sentry only when needed,
 * reducing the main bundle size
 */
const SentryLoader = () => {
  useEffect(() => {
    const initializeSentry = async () => {
      try {
        // Dynamic import of the sentry utility
        const { initSentry } = await import("../../utils/common/sentry.js");

        // Initialize Sentry
        initSentry();

        logger.debug("Sentry loaded and initialized via lazy loader");
      } catch (error) {
        // Graceful fallback - monitoring is not critical for app functionality
        logger.warn("Failed to load Sentry monitoring", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    // Initialize after a short delay to not block initial render
    const timer = setTimeout(initializeSentry, 100);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything - it's just a side effect loader
  return null;
};

export default SentryLoader;
