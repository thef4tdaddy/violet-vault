import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";
import chunkedFirebaseSync from "../utils/chunkedFirebaseSync";

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes (much more reasonable)
const DEBOUNCE_DELAY = 10000; // 10 seconds (longer debounce to reduce noise)

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
  scheduleSync(priority = "normal") {
    clearTimeout(this.debounceTimer);

    // Use shorter delay for high-priority changes (paycheck, envelope changes, etc.)
    const delay = priority === "high" ? 2000 : DEBOUNCE_DELAY;

    this.debounceTimer = setTimeout(() => {
      this.syncQueue = this.syncQueue.then(() => this.forceSync());
    }, delay);
  }

  // Trigger sync immediately for critical changes (paycheck, imports, etc.)
  triggerSyncForCriticalChange(changeType) {
    logger.info(
      `🚨 Critical change detected: ${changeType}, triggering immediate sync`,
    );
    clearTimeout(this.debounceTimer);
    this.syncQueue = this.syncQueue.then(() => this.forceSync());
  }

  async forceSync() {
    if (this.isSyncing) {
      logger.warn("🔄 Sync already in progress, skipping.");
      return { success: false, reason: "Sync in progress" };
    }

    this.isSyncing = true;
    logger.info("🔄 Starting chunked data sync...");

    try {
      // Initialize chunked Firebase sync if not already done
      await chunkedFirebaseSync.initialize(
        this.config.budgetId,
        this.config.encryptionKey,
      );

      // Fetch data from Dexie for sync
      const localData = await this.fetchDexieData();

      // Perform the sync
      const result = await chunkedFirebaseSync.saveToCloud(
        localData,
        this.config.currentUser,
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
      await budgetDb.setCachedValue(
        "lastSyncTime",
        new Date().toISOString(),
        86400000, // 24 hours TTL
        "sync",
      );
    } catch (error) {
      logger.error("Failed to update last sync time in Dexie:", error);
    }
  }

  async getLastSyncTime() {
    try {
      return await budgetDb.getCachedValue("lastSyncTime", 86400000); // 24 hours
    } catch (error) {
      logger.error("Failed to get last sync time from Dexie:", error);
      return null;
    }
  }

  async fetchDexieData() {
    try {
      const [
        envelopes,
        transactions,
        bills,
        debts,
        savingsGoals,
        paycheckHistory,
        metadata,
      ] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.transactions.toArray(),
        budgetDb.bills.toArray(),
        budgetDb.debts.toArray(),
        budgetDb.savingsGoals.toArray(),
        budgetDb.paycheckHistory.toArray(),
        budgetDb.budget.get("metadata"),
      ]);

      return {
        envelopes: envelopes || [],
        transactions: transactions || [],
        bills: bills || [],
        debts: debts || [],
        savingsGoals: savingsGoals || [],
        paycheckHistory: paycheckHistory || [],
        unassignedCash: metadata?.unassignedCash || 0,
        actualBalance: metadata?.actualBalance || 0,
        lastModified: Date.now(),
      };
    } catch (error) {
      logger.error("Failed to fetch data from Dexie:", error);
      throw error;
    }
  }

  determineSyncDirection(localData, cloudData) {
    if (!cloudData || !cloudData.lastModified) {
      return { direction: "toFirestore" }; // No cloud data, upload local
    }

    if (!localData || !localData.lastModified) {
      return { direction: "fromFirestore" }; // No local data, download cloud
    }

    if (localData.lastModified > cloudData.lastModified) {
      return { direction: "toFirestore" }; // Local is newer
    } else if (cloudData.lastModified > localData.lastModified) {
      return { direction: "fromFirestore" }; // Cloud is newer
    } else {
      return { direction: "bidirectional" }; // Same timestamp, need full sync
    }
  }

  getStatus() {
    return {
      isSyncing: this.isSyncing,
      isRunning: this.isRunning,
      lastSyncTime: Date.now(),
      syncIntervalMs: SYNC_INTERVAL,
      syncType: "chunked",
      hasConfig: !!this.config,
    };
  }

  async forcePushToCloud() {
    // Force push local data to Firebase without pulling from Firebase first
    // This is used after backup imports to ensure imported data overwrites cloud data
    if (this.isSyncing) {
      logger.warn("🟡 Sync in progress, skipping force push");
      return { success: false, error: "Sync already in progress" };
    }

    this.isSyncing = true;

    try {
      logger.info("🚀 Force pushing local data to Firebase...");

      // Get local data from Dexie
      const localData = await this.fetchDexieData();

      // Use chunked Firebase sync to save data (one-way)
      const result = await chunkedFirebaseSync.saveToCloud(
        this.config.budgetId,
        this.config.encryptionKey,
        localData,
      );

      if (result.success) {
        logger.info("✅ Force push to Firebase completed successfully");
        return { success: true };
      } else {
        throw new Error(result.error || "Failed to push data to Firebase");
      }
    } catch (error) {
      logger.error("❌ Force push to Firebase failed:", error);
      return { success: false, error: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async clearAllData() {
    // Clear all data from Firebase/cloud storage
    // This method should be called before importing backup data to prevent sync conflicts
    try {
      logger.info("Starting to clear all cloud data...");

      if (this.config && typeof this.config.clearAllData === "function") {
        // If the config has a clearAllData method, use it
        await this.config.clearAllData();
        logger.info("Cloud data cleared using config method");
      } else if (
        chunkedFirebaseSync &&
        typeof chunkedFirebaseSync.clearAllData === "function"
      ) {
        // If chunkedFirebaseSync has a clearAllData method, use it
        await chunkedFirebaseSync.clearAllData();
        logger.info("Cloud data cleared using chunkedFirebaseSync");
      } else {
        // If no specific clear method exists, we can't clear cloud data
        logger.warn(
          "No cloud data clearing method available - skipping cloud clear",
        );
      }

      // Clear local sync metadata
      await budgetDb.clearCacheCategory("sync");
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

      if (this.config && typeof this.config.forcePushToCloud === "function") {
        // If the config has a forcePushToCloud method, use it
        await this.config.forcePushToCloud();
        logger.info("Data successfully pushed to cloud using config method");
      } else if (
        chunkedFirebaseSync &&
        typeof chunkedFirebaseSync.forcePushToCloud === "function"
      ) {
        // If chunkedFirebaseSync has a forcePushToCloud method, use it
        await chunkedFirebaseSync.forcePushToCloud();
        logger.info(
          "Data successfully pushed to cloud using chunkedFirebaseSync",
        );
      } else if (
        chunkedFirebaseSync &&
        typeof chunkedFirebaseSync.uploadToFirebase === "function"
      ) {
        // Use upload method if available (one-way upload)
        await chunkedFirebaseSync.uploadToFirebase();
        logger.info("Data successfully pushed to cloud using uploadToFirebase");
      } else {
        logger.warn(
          "No force push method available, falling back to regular sync",
        );
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

// Expose to window for critical sync triggers from other modules
if (typeof window !== "undefined") {
  window.cloudSyncService = cloudSyncService;
}
