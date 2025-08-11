import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";

/**
 * CloudSyncService - Background bidirectional sync between Firestore and Dexie
 * Handles the data layer synchronization while TanStack Query manages caching
 */
class CloudSyncService {
  constructor() {
    this.isRunning = false;
    this.syncInterval = null;
    this.config = null;
    this.lastSyncTime = 0;
    this.syncIntervalMs = 30000; // 30 seconds
  }

  /**
   * Start the background sync service
   */
  start(config) {
    if (this.isRunning) {
      logger.debug("🔄 Cloud sync service already running");
      return;
    }

    this.config = config;
    this.isRunning = true;

    logger.debug("🌩️ Starting cloud sync service", {
      hasEncryptionKey: !!config?.encryptionKey,
      hasUser: !!config?.currentUser,
      hasBudgetId: !!config?.budgetId,
    });

    // Do initial sync immediately
    this.performSync();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.syncIntervalMs);

    logger.debug("✅ Cloud sync service started");
  }

  /**
   * Stop the background sync service
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    this.isRunning = false;
    this.config = null;
    logger.debug("⏹️ Cloud sync service stopped");
  }

  /**
   * Force a manual sync
   */
  async forceSync() {
    if (!this.isRunning) {
      logger.warn("⚠️ Cannot force sync - service not running");
      return { success: false, error: "Service not running" };
    }

    return await this.performSync();
  }

  /**
   * Perform bidirectional sync between Firestore and Dexie
   */
  async performSync() {
    try {
      if (
        !this.config?.encryptionKey ||
        !this.config?.currentUser ||
        !this.config?.budgetId
      ) {
        logger.warn("⚠️ Missing auth context for sync");
        return { success: false, error: "Missing authentication context" };
      }

      logger.debug("🔄 Starting bidirectional sync...");
      const startTime = Date.now();

      // Import FirebaseSync dynamically to avoid circular imports
      const FirebaseSync = (await import("../utils/firebaseSync")).default;

      // Step 1: Get data from both sources
      const [firestoreData, dexieData] = await Promise.all([
        this.fetchFirestoreData(FirebaseSync),
        this.fetchDexieData(),
      ]);

      // Step 2: Determine sync direction based on data freshness
      const syncResult = await this.determineSyncDirection(
        firestoreData,
        dexieData,
      );

      // Step 3: Perform the sync
      const result = await this.executSync(syncResult, FirebaseSync);

      const duration = Date.now() - startTime;
      this.lastSyncTime = Date.now();

      logger.debug("✅ Sync completed", {
        direction: result.direction,
        duration: `${duration}ms`,
        counts: result.counts,
      });

      return result;
    } catch (error) {
      logger.error("❌ Sync failed", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch data from Firestore
   */
  async fetchFirestoreData(FirebaseSync) {
    try {
      const data = await FirebaseSync.fetchBudgetData(
        this.config.budgetId,
        this.config.encryptionKey,
      );
      return data;
    } catch (error) {
      logger.warn("⚠️ Failed to fetch Firestore data", error.message);
      return null;
    }
  }

  /**
   * Fetch data from Dexie
   */
  async fetchDexieData() {
    try {
      const [envelopes, transactions, bills, savingsGoals, paycheckHistory] =
        await Promise.all([
          budgetDb.envelopes.toArray(),
          budgetDb.transactions.toArray(),
          budgetDb.bills.toArray(),
          budgetDb.savingsGoals.toArray(),
          budgetDb.paycheckHistory.toArray(),
        ]);

      return {
        envelopes,
        transactions,
        bills,
        savingsGoals,
        paycheckHistory,
        lastModified: Math.max(
          ...envelopes.map((e) => e.lastModified || e.createdAt || 0),
          ...transactions.map((t) => t.lastModified || t.createdAt || 0),
          ...bills.map((b) => b.lastModified || b.createdAt || 0),
          0,
        ),
      };
    } catch (error) {
      logger.error("Failed to fetch Dexie data", error);
      return {
        envelopes: [],
        transactions: [],
        bills: [],
        savingsGoals: [],
        paycheckHistory: [],
        lastModified: 0,
      };
    }
  }

  /**
   * Determine which direction to sync based on data freshness
   */
  async determineSyncDirection(firestoreData, dexieData) {
    const firestoreLastModified = firestoreData?.lastModified || 0;
    const dexieLastModified = dexieData.lastModified;
    const firestoreHasData =
      firestoreData &&
      Object.values(firestoreData).some(
        (arr) => Array.isArray(arr) && arr.length > 0,
      );
    const dexieHasData = Object.values(dexieData).some(
      (arr) => Array.isArray(arr) && arr.length > 0,
    );

    logger.debug("🔍 Sync analysis", {
      firestoreLastModified: new Date(firestoreLastModified),
      dexieLastModified: new Date(dexieLastModified),
      firestoreHasData,
      dexieHasData,
    });

    if (!firestoreHasData && dexieHasData) {
      return { direction: "toFirestore", data: dexieData };
    } else if (firestoreHasData && !dexieHasData) {
      return { direction: "fromFirestore", data: firestoreData };
    } else if (firestoreHasData && dexieHasData) {
      if (firestoreLastModified > dexieLastModified) {
        return { direction: "fromFirestore", data: firestoreData };
      } else if (dexieLastModified > firestoreLastModified) {
        return { direction: "toFirestore", data: dexieData };
      } else {
        return { direction: "none", data: dexieData };
      }
    }

    return { direction: "none", data: dexieData };
  }

  /**
   * Execute the sync in the determined direction
   */
  async executSync(syncResult, FirebaseSync) {
    const { direction, data } = syncResult;

    switch (direction) {
      case "fromFirestore":
        await this.syncFromFirestoreToDexie(data);
        logger.debug("📥 Synced from Firestore to Dexie");
        break;

      case "toFirestore":
        await this.syncFromDexieToFirestore(data, FirebaseSync);
        logger.debug("📤 Synced from Dexie to Firestore");
        break;

      case "none":
      default:
        logger.debug("✅ Data already in sync");
        break;
    }

    return {
      success: true,
      direction,
      counts: {
        envelopes: data.envelopes?.length || 0,
        transactions: data.transactions?.length || 0,
        bills: data.bills?.length || 0,
      },
    };
  }

  /**
   * Sync data from Firestore to Dexie
   */
  async syncFromFirestoreToDexie(firestoreData) {
    await budgetDb.transaction(
      "rw",
      [
        budgetDb.envelopes,
        budgetDb.transactions,
        budgetDb.bills,
        budgetDb.savingsGoals,
        budgetDb.paycheckHistory,
      ],
      async () => {
        // Clear existing data
        await Promise.all([
          budgetDb.envelopes.clear(),
          budgetDb.transactions.clear(),
          budgetDb.bills.clear(),
          budgetDb.savingsGoals.clear(),
          budgetDb.paycheckHistory.clear(),
        ]);

        // Add Firestore data to Dexie
        const addPromises = [];
        if (firestoreData.envelopes?.length > 0) {
          addPromises.push(budgetDb.envelopes.bulkAdd(firestoreData.envelopes));
        }
        if (firestoreData.transactions?.length > 0) {
          addPromises.push(
            budgetDb.transactions.bulkAdd(firestoreData.transactions),
          );
        }
        if (firestoreData.bills?.length > 0) {
          addPromises.push(budgetDb.bills.bulkAdd(firestoreData.bills));
        }
        if (firestoreData.savingsGoals?.length > 0) {
          addPromises.push(
            budgetDb.savingsGoals.bulkAdd(firestoreData.savingsGoals),
          );
        }
        if (firestoreData.paycheckHistory?.length > 0) {
          addPromises.push(
            budgetDb.paycheckHistory.bulkAdd(firestoreData.paycheckHistory),
          );
        }

        await Promise.all(addPromises);
      },
    );
  }

  /**
   * Sync data from Dexie to Firestore
   */
  async syncFromDexieToFirestore(dexieData, FirebaseSync) {
    const dataToSync = {
      ...dexieData,
      lastModified: Date.now(),
    };

    await FirebaseSync.saveBudgetData(
      this.config.budgetId,
      dataToSync,
      this.config.encryptionKey,
    );
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      syncIntervalMs: this.syncIntervalMs,
      hasConfig: !!this.config,
    };
  }
}

// Export singleton instance
const cloudSyncService = new CloudSyncService();
export default cloudSyncService;
