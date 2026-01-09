/**
 * Offline Request Queue Initialization
 *
 * Initialize the offline request queue service when the app starts.
 * This ensures the queue is ready to capture and replay requests.
 */

import { offlineRequestQueueService } from "@/services/sync/offlineRequestQueueService";
import logger from "@/utils/common/logger";

/**
 * Initialize the offline request queue system
 */
export async function initializeOfflineQueue(): Promise<void> {
  try {
    await offlineRequestQueueService.initialize();
    logger.info("✅ Offline request queue initialized successfully");
  } catch (error) {
    logger.error("❌ Failed to initialize offline request queue", error);
  }
}

/**
 * Shutdown the offline request queue system
 */
export function shutdownOfflineQueue(): void {
  try {
    offlineRequestQueueService.stopProcessingInterval();
    logger.info("🛑 Offline request queue shutdown successfully");
  } catch (error) {
    logger.error("❌ Failed to shutdown offline request queue", error);
  }
}
