import { get, set, del } from "idb-keyval";
import { budgetDb } from "../db/budgetDb";
import { encrypt, decrypt } from "../utils/encryption";
import logger from "../utils/logger";
import { chunkedFirebaseSync } from "../utils/chunkedFirebaseSync";

const SYNC_INTERVAL = 30000; // 30 seconds
const DEBOUNCE_DELAY = 5000; // 5 seconds
const ACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes

class CloudSyncService {
  constructor() {
    this.syncIntervalId = null;
    this.isSyncing = false;
    this.config = null;
    this.debounceTimer = null;
    this.isRunning = false;
    this.syncQueue = Promise.resolve();
  }

  start(config) {
    if (this.isRunning) {
      logger.debug("🔄 Sync service already running.");
      return;
    }

    this.config = config;
    this.isRunning = true;
    logger.info("🚀 Starting cloud sync service...");

    // Initial sync
    this.scheduleSync();

    // Periodic sync
    this.syncIntervalId = setInterval(() => {
      this.scheduleSync();
    }, SYNC_INTERVAL);
  }

  stop() {
    if (!this.isRunning) return;

    logger.info("🛑 Stopping cloud sync service...");
    clearInterval(this.syncIntervalId);
    clearTimeout(this.debounceTimer);
    this.isRunning = false;
  }

  // Debounced sync to avoid rapid consecutive syncs
  scheduleSync() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.syncQueue = this.syncQueue.then(() => this.forceSync());
    }, DEBOUNCE_DELAY);
  }

  async forceSync() {
    if (this.isSyncing) {
      logger.warn("🔄 Sync already in progress, skipping.");
      return { success: false, reason: "Sync in progress" };
    }

    this.isSyncing = true;
    logger.info("🔄 Starting chunked data sync...");

    try {
      const result = await chunkedFirebaseSync(
        this.config.budgetId,
        this.config.encryptionKey,
        this.config.currentUser
      );

      if (result.success) {
        logger.info("✅ Chunked sync completed successfully.");
        await this.updateLastSyncTime();
        await this.updateUserActivity();
      } else {
        logger.error("❌ Chunked sync failed:", result.error);
      }
      return result;
    } catch (error) {
      logger.error("❌ An unexpected error occurred during sync:", error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async updateUserActivity() {
    if (!this.config || !this.config.currentUser) return;

    try {
      const activityData = {
        lastActive: new Date().toISOString(),
        userName: this.config.currentUser.userName,
        // Add more metadata if needed
      };
      // This would be a call to a Firebase function or Firestore directly
      // to update the user's activity status.
      // For now, we'll just log it.
      logger.debug("Updating user activity:", activityData);
    } catch (error) {
      logger.error("Failed to update user activity:", error);
    }
  }

  async getActiveUsers() {
    // This would fetch the list of active users from Firebase
    // and filter out users who haven't been active recently.
    return [];
  }

  async updateLastSyncTime() {
    try {
      await set("lastSyncTime", new Date().toISOString());
    } catch (error) {
      logger.error("Failed to update last sync time in idb-keyval:", error);
    }
  }

  async getLastSyncTime() {
    return await get("lastSyncTime");
  }

  async clearAllData() {
    // Clear all data from Firebase/cloud storage
    // This method should be called before importing backup data to prevent sync conflicts
    try {
      logger.info("Starting to clear all cloud data...");
      
      if (this.config && typeof this.config.clearAllData === 'function') {
        // If the config has a clearAllData method, use it
        await this.config.clearAllData();
        logger.info("Cloud data cleared using config method");
      } else if (chunkedFirebaseSync && typeof chunkedFirebaseSync.clearAllData === 'function') {
        // If chunkedFirebaseSync has a clearAllData method, use it
        await chunkedFirebaseSync.clearAllData();
        logger.info("Cloud data cleared using chunkedFirebaseSync");
      } else {
        // If no specific clear method exists, we can't clear cloud data
        logger.warn("No cloud data clearing method available - skipping cloud clear");
      }
      
      // Clear local sync metadata
      await del("lastSyncTime");
      logger.info("Local sync metadata cleared");
      
    } catch (error) {
      logger.error("Failed to clear cloud data:", error);
      throw error;
    }
  }

  async forcePushToCloud() {
    // Force push local data to Firebase without pulling from Firebase first
    // This is used after backup imports to ensure imported data replaces cloud data
    try {
      logger.info("🚀 Starting force push to cloud...");
      
      if (this.config && typeof this.config.forcePushToCloud === 'function') {
        // If the config has a forcePushToCloud method, use it
        await this.config.forcePushToCloud();
        logger.info("Data successfully pushed to cloud using config method");
      } else if (chunkedFirebaseSync && typeof chunkedFirebaseSync.forcePushToCloud === 'function') {
        // If chunkedFirebaseSync has a forcePushToCloud method, use it
        await chunkedFirebaseSync.forcePushToCloud();
        logger.info("Data successfully pushed to cloud using chunkedFirebaseSync");
      } else if (chunkedFirebaseSync && typeof chunkedFirebaseSync.uploadToFirebase === 'function') {
        // Use upload method if available (one-way upload)
        await chunkedFirebaseSync.uploadToFirebase();
        logger.info("Data successfully pushed to cloud using uploadToFirebase");
      } else {
        logger.warn("No force push method available, falling back to regular sync");
        await this.forceSync();
      }
      
      // Update sync time after successful push
      await this.updateLastSyncTime();
      
    } catch (error) {
      logger.error("Failed to force push data to cloud:", error);
      throw error;
    }
  }
}

export const cloudSyncService = new CloudSyncService();
