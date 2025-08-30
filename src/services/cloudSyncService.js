import { budgetDb } from "../db/budgetDb";
import logger from "../utils/common/logger";
import chunkedFirebaseSync from "../utils/sync/chunkedFirebaseSync";

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
    logger.production("Cloud sync service started", {
      user: config?.budgetId || "unknown",
    });

    // Initial sync
    this.scheduleSync();

    // Periodic sync
    this.syncIntervalId = setInterval(() => {
      this.scheduleSync();
    }, SYNC_INTERVAL);
  }

  stop() {
    if (!this.isRunning) return;

    logger.production("Cloud sync service stopped", {
      user: this.config?.budgetId || "unknown",
    });
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
    logger.info(`🚨 Critical change detected: ${changeType}, triggering immediate sync`);
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
      await chunkedFirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

      // Fetch data from Dexie for sync
      const localData = await this.fetchDexieData();

      // Check what data exists in cloud to determine sync direction
      let cloudData;
      try {
        const cloudResult = await chunkedFirebaseSync.loadFromCloud();
        cloudData = cloudResult?.data || null;
      } catch {
        logger.warn("Could not load cloud data, assuming no cloud data exists");
        cloudData = null;
      }

      // Determine sync direction
      const syncDecision = this.determineSyncDirection(localData, cloudData);
      logger.info(`🔄 Sync direction determined: ${syncDecision.direction}`, {
        localLastModified: localData?.lastModified,
        cloudLastModified: cloudData?.lastModified,
        hasLocalData: !!(
          localData?.envelopes?.length ||
          localData?.transactions?.length ||
          localData?.bills?.length ||
          localData?.paycheckHistory?.length ||
          localData?.savingsGoals?.length ||
          localData?.debts?.length
        ),
        hasCloudData: !!(
          cloudData?.envelopes?.length ||
          cloudData?.transactions?.length ||
          cloudData?.bills?.length ||
          cloudData?.paycheckHistory?.length ||
          cloudData?.savingsGoals?.length ||
          cloudData?.debts?.length
        ),
      });

      let result;
      if (syncDecision.direction === "fromFirestore") {
        // Download from Firebase to Dexie
        const cloudResult = await chunkedFirebaseSync.loadFromCloud();
        if (cloudResult.data) {
          // Save the loaded data to Dexie
          await this.saveToDexie(cloudResult.data);

          // Invalidate TanStack Query cache to refresh UI immediately
          try {
            const { queryClient } = await import("../utils/common/queryClient");
            await queryClient.invalidateQueries();
            logger.info("✅ TanStack Query cache invalidated after cloud data sync");
          } catch (error) {
            logger.warn("Failed to invalidate query cache after sync", error);
          }

          result = { success: true, direction: "fromFirestore" };
          logger.production("Data synced from cloud", {
            direction: "download",
          });
        } else {
          result = { success: false, error: "No cloud data found" };
        }
      } else {
        // Upload from Dexie to Firebase (default behavior)
        result = await chunkedFirebaseSync.saveToCloud(localData, this.config.currentUser);
      }

      if (result.success) {
        logger.production("Sync completed successfully", {
          direction: syncDecision.direction,
          recordsProcessed: result?.recordsProcessed || 0,
        });
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
        "sync"
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
      const [envelopes, transactions, bills, debts, savingsGoals, paycheckHistory, metadata] =
        await Promise.all([
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

  async saveToDexie(data) {
    try {
      logger.debug("💾 Saving cloud data to Dexie...");

      // Clear existing data and save new data in a transaction
      await budgetDb.transaction(
        "rw",
        [
          budgetDb.envelopes,
          budgetDb.bills,
          budgetDb.transactions,
          budgetDb.savingsGoals,
          budgetDb.debts,
          budgetDb.paycheckHistory,
          budgetDb.budget,
        ],
        async () => {
          // Clear existing data
          await budgetDb.envelopes.clear();
          await budgetDb.bills.clear();
          await budgetDb.transactions.clear();
          await budgetDb.savingsGoals.clear();
          await budgetDb.debts.clear();
          await budgetDb.paycheckHistory.clear();

          // Save new data
          if (data.envelopes?.length) {
            await budgetDb.envelopes.bulkAdd(data.envelopes);
          }
          if (data.bills?.length) {
            await budgetDb.bills.bulkAdd(data.bills);
          }
          if (data.transactions?.length) {
            await budgetDb.transactions.bulkAdd(data.transactions);
          }
          if (data.savingsGoals?.length) {
            await budgetDb.savingsGoals.bulkAdd(data.savingsGoals);
          }
          if (data.debts?.length) {
            await budgetDb.debts.bulkAdd(data.debts);
          }
          if (data.paycheckHistory?.length) {
            await budgetDb.paycheckHistory.bulkAdd(data.paycheckHistory);
          }

          // Save metadata
          await budgetDb.budget.put({
            id: "metadata",
            unassignedCash: data.unassignedCash || 0,
            actualBalance: data.actualBalance || 0,
            supplementalAccounts: data.supplementalAccounts || [],
            lastUpdated: new Date().toISOString(),
          });
        }
      );

      logger.info("✅ Cloud data saved to Dexie successfully");
    } catch (error) {
      logger.error("Failed to save cloud data to Dexie:", error);
      throw error;
    }
  }

  determineSyncDirection(localData, cloudData) {
    // Check if cloud has meaningful data vs local (include all data types)
    const hasCloudData = !!(
      cloudData?.envelopes?.length ||
      cloudData?.transactions?.length ||
      cloudData?.bills?.length ||
      cloudData?.paycheckHistory?.length ||
      cloudData?.savingsGoals?.length ||
      cloudData?.debts?.length
    );
    const hasLocalData = !!(
      localData?.envelopes?.length ||
      localData?.transactions?.length ||
      localData?.bills?.length ||
      localData?.paycheckHistory?.length ||
      localData?.savingsGoals?.length ||
      localData?.debts?.length
    );

    logger.info("🔄 Sync direction analysis:", {
      hasCloudData,
      hasLocalData,
      cloudItemCount:
        (cloudData?.envelopes?.length || 0) +
        (cloudData?.transactions?.length || 0) +
        (cloudData?.bills?.length || 0) +
        (cloudData?.paycheckHistory?.length || 0) +
        (cloudData?.savingsGoals?.length || 0) +
        (cloudData?.debts?.length || 0),
      localItemCount:
        (localData?.envelopes?.length || 0) +
        (localData?.transactions?.length || 0) +
        (localData?.bills?.length || 0) +
        (localData?.paycheckHistory?.length || 0) +
        (localData?.savingsGoals?.length || 0) +
        (localData?.debts?.length || 0),
      cloudLastModified: cloudData?.lastModified,
      localLastModified: localData?.lastModified,
    });

    // If cloud has data but local doesn't, download from cloud
    if (hasCloudData && !hasLocalData) {
      return { direction: "fromFirestore" };
    }

    // If local has data but cloud doesn't, upload to cloud
    if (hasLocalData && !hasCloudData) {
      return { direction: "toFirestore" };
    }

    // If neither has data, nothing to sync
    if (!hasCloudData && !hasLocalData) {
      return { direction: "toFirestore" }; // Default to upload empty state
    }

    // Both have data - use timestamps to determine direction
    if (!cloudData || !cloudData.lastModified) {
      return { direction: "toFirestore" }; // No cloud timestamp, upload local
    }

    if (!localData || !localData.lastModified) {
      return { direction: "fromFirestore" }; // No local timestamp, download cloud
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
        localData
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
      } else if (chunkedFirebaseSync && typeof chunkedFirebaseSync.clearAllData === "function") {
        // If chunkedFirebaseSync has a clearAllData method, use it
        await chunkedFirebaseSync.clearAllData();
        logger.info("Cloud data cleared using chunkedFirebaseSync");
      } else {
        // If no specific clear method exists, we can't clear cloud data
        logger.warn("No cloud data clearing method available - skipping cloud clear");
      }

      // Clear local sync metadata
      await budgetDb.clearCacheCategory("sync");
      logger.info("Local sync metadata cleared");
    } catch (error) {
      logger.error("Failed to clear cloud data:", error);
      throw error;
    }
  }
}

export const cloudSyncService = new CloudSyncService();

// Expose to window for critical sync triggers from other modules
if (typeof window !== "undefined") {
  window.cloudSyncService = cloudSyncService;
}
