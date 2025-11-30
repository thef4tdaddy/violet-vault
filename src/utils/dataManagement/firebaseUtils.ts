import { cloudSyncService, type SyncConfig } from "../../services/cloudSyncService.ts";
import logger from "../common/logger";

/**
 * Recursively remove undefined values from objects/arrays
 * Firebase doesn't allow undefined values - they must be omitted or null
 * This function removes undefined values to prevent Firebase errors
 */
export function removeUndefinedValues<T>(value: T): T {
  if (value === undefined) {
    // Return null for undefined (Firebase accepts null)
    return null as T;
  }

  if (value === null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => removeUndefinedValues(item))
      .filter((item) => item !== undefined) as T;
  }

  if (typeof value === "object") {
    const cleaned: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      if (val !== undefined) {
        cleaned[key] = removeUndefinedValues(val);
      }
      // Skip undefined keys entirely
    }
    return cleaned as T;
  }

  return value;
}

export const clearFirebaseData = async () => {
  try {
    logger.info("Clearing Firebase data before import...");
    await cloudSyncService.clearAllData();
    logger.info("Firebase data cleared successfully");

    logger.info("Clearing sync metadata to prevent corruption detection...");
    // Note: syncMetadata table doesn't exist in current schema
    // Metadata is stored in the budget table instead
    logger.info("No separate sync metadata table to clear");
  } catch (error) {
    const errorInfo = error instanceof Error ? { message: error.message } : { error };
    logger.warn("Failed to clear Firebase data, proceeding with import", errorInfo);
  }
};

/**
 * Force push imported data to Firebase
 * @param {Object} authConfig - Auth configuration containing budgetId, encryptionKey, and currentUser
 * authConfig is needed because sync service is stopped before import
 */
export const forcePushToCloud = async (authConfig: SyncConfig | null = null) => {
  try {
    logger.info("🛑 Stopping sync service before clean restart...");
    cloudSyncService.stop();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    logger.info("🧹 Clearing any corruption detection state to prevent false positives...");
    const chunkedSyncService = await import("../../services/chunkedSyncService");
    if (chunkedSyncService.default && chunkedSyncService.default.decryptionFailures) {
      chunkedSyncService.default.decryptionFailures.clear();
      logger.info("✅ Cleared decryption failure tracking");
    }

    logger.info("🚀 Force pushing imported data to Firebase with clean slate...");
    // Pass auth config to force push in case service was stopped
    const result = await cloudSyncService.forcePushToCloud(authConfig);

    if (result.success) {
      logger.info("✅ Imported data successfully pushed to Firebase.");
      return { success: true };
    } else {
      throw new Error(result.error || "Failed to push to cloud");
    }
  } catch (error) {
    logger.error("Failed to push imported data to Firebase", error);
    throw error;
  }
};
