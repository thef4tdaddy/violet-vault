// Development debugging tools - minimal and privacy-focused
import logger from "../common/logger";

// Only enable debug logging in development mode
if (import.meta.env.MODE === "development") {
  logger.info("🔧 Debug mode enabled - budget ID generation will be logged");
}
