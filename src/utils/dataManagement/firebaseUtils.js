import { cloudSyncService } from "../../services/cloudSyncService.js";
import { budgetDb } from "../../db/budgetDb.js";
import logger from "../common/logger";

export const clearFirebaseData = async () => {
  try {
    logger.info("Clearing Firebase data before import...");
    await cloudSyncService.clearAllData();
    logger.info("Firebase data cleared successfully");

    logger.info("Clearing sync metadata to prevent corruption detection...");
    if (budgetDb.syncMetadata) {
      await budgetDb.syncMetadata.clear();
      logger.info("Sync metadata cleared");
    } else {
      logger.info("No sync metadata table found, skipping clear");
    }
  } catch (error) {
    logger.warn("Failed to clear Firebase data, proceeding with import", error);
  }
};

export const forcePushToCloud = async () => {
  try {
    logger.info("🛑 Stopping sync service before clean restart...");
    cloudSyncService.stop();

    await new Promise((resolve) => setTimeout(resolve, 2000));

    logger.info(
      "🧹 Clearing any corruption detection state to prevent false positives...",
    );
    const { chunkedSyncService } = await import(
      "../../services/chunkedSyncService"
    );
    if (chunkedSyncService && chunkedSyncService.decryptionFailures) {
      chunkedSyncService.decryptionFailures.clear();
      logger.info("✅ Cleared decryption failure tracking");
    }

    logger.info(
      "🚀 Force pushing imported data to Firebase with clean slate...",
    );
    const result = await cloudSyncService.forcePushToCloud();

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
