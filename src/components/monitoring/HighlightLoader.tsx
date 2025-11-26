import { useEffect } from "react";
import logger from "../../utils/common/logger";

/**
 * Lazy loader component for Highlight.io monitoring
 * This component dynamically imports and initializes highlight.run only when needed,
 * reducing the main bundle size by ~777 kB
 */
const HighlightLoader = () => {
  useEffect(() => {
    const initializeHighlight = async () => {
      try {
        // Dynamic import of the highlight utility
        const { initHighlight } = await import("../../utils/common/highlight.js");

        // Initialize highlight.run
        initHighlight();

        logger.debug("Highlight.io loaded and initialized via lazy loader");
      } catch (error) {
        // Graceful fallback - monitoring is not critical for app functionality
        logger.warn("Failed to load Highlight.io monitoring", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    };

    // Initialize after a short delay to not block initial render
    const timer = setTimeout(initializeHighlight, 100);

    return () => clearTimeout(timer);
  }, []);

  // This component doesn't render anything - it's just a side effect loader
  return null;
};

export default HighlightLoader;
