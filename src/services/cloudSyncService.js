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
   * Perform bidirectional sync between Firestore and Dexie using chunked approach
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

      logger.debug("🔄 Starting chunked bidirectional sync...");
      const startTime = Date.now();

      // Import ChunkedFirebaseSync for new implementation
      const ChunkedFirebaseSync = (await import("../utils/chunkedFirebaseSync"))
        .default;

      // Step 1: Get data from both sources
      const [chunkedFirestoreData, dexieData] = await Promise.all([
        this.fetchChunkedFirestoreData(ChunkedFirebaseSync),
        this.fetchDexieData(),
      ]);

      // Step 2: Check for old format data if chunked data not found
      let firestoreData = chunkedFirestoreData;
      let needsMigration = false;

      if (!chunkedFirestoreData) {
        logger.debug(
          "🔍 Chunked data not found, checking for old format data...",
        );
        // Try to load from old single-document format
        const oldFormatData = await this.fetchOldFormatFirestoreData();
        if (oldFormatData) {
          logger.warn("📦 Found old format data - migration needed!");
          firestoreData = oldFormatData;
          needsMigration = true;
        }
      }

      // Step 3: Handle migration if needed
      if (
        needsMigration ||
        (!firestoreData && this.hasSignificantData(dexieData))
      ) {
        logger.debug("🔄 Starting migration to chunked format...");
        const migrationResult = await this.migrateToChunkedFormat(
          ChunkedFirebaseSync,
          firestoreData || dexieData,
        );
        if (migrationResult.migrated) {
          return migrationResult;
        }
      }

      // Step 4: Determine sync direction based on data freshness
      const syncResult = await this.determineSyncDirection(
        firestoreData,
        dexieData,
      );

      // Step 5: Perform the sync using chunked approach
      const result = await this.executeChunkedSync(
        syncResult,
        ChunkedFirebaseSync,
      );

      const duration = Date.now() - startTime;
      this.lastSyncTime = Date.now();

      logger.debug("✅ Chunked sync completed", {
        direction: result.direction,
        duration: `${duration}ms`,
        counts: result.counts,
      });

      return result;
    } catch (error) {
      // Check if error is related to document size limits
      if (
        error.message?.includes("exceeds the maximum allowed size") ||
        error.message?.includes("1,048,576 bytes")
      ) {
        logger.warn(
          "📦 Document size limit exceeded, forcing chunked migration...",
        );
        return await this.forceMigrationToChunked();
      }

      logger.error("❌ Chunked sync failed", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fetch data from Firestore
   */
  async fetchFirestoreData(FirebaseSync) {
    try {
      // Initialize the FirebaseSync instance
      FirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

      // Load data from cloud
      const data = await FirebaseSync.loadFromCloud();
      return data?.data || null;
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

    // Initialize the FirebaseSync instance
    FirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

    // Save data to cloud
    await FirebaseSync.saveToCloud(dataToSync, this.config.currentUser);
  }

  /**
   * Fetch data from Firestore using chunked approach
   */
  async fetchChunkedFirestoreData(ChunkedFirebaseSync) {
    try {
      // Initialize the ChunkedFirebaseSync instance
      ChunkedFirebaseSync.initialize(
        this.config.budgetId,
        this.config.encryptionKey,
      );

      // Load data from cloud
      const data = await ChunkedFirebaseSync.loadFromCloud();
      return data?.data || null;
    } catch (error) {
      logger.warn("⚠️ Failed to fetch chunked Firestore data", error.message);
      return null;
    }
  }

  /**
   * Fetch data from old single-document Firestore format
   */
  async fetchOldFormatFirestoreData() {
    try {
      // Import the old FirebaseSync for legacy data
      const { default: FirebaseSync } = await import("../utils/firebaseSync");

      // Initialize the old FirebaseSync instance
      FirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

      // Load data from cloud using old format
      const data = await FirebaseSync.loadFromCloud();
      return data?.data || null;
    } catch (error) {
      logger.debug(
        "📭 No old format data found (expected for new accounts)",
        error.message,
      );
      return null;
    }
  }

  /**
   * Handle migration from old single-document to new chunked format
   */
  async handleMigrationIfNeeded(ChunkedFirebaseSync, dexieData) {
    try {
      // Check if we have local data but can't load from chunked cloud
      const chunkedData =
        await this.fetchChunkedFirestoreData(ChunkedFirebaseSync);

      // If chunked data fails to load but we have local data, we need to migrate
      if (!chunkedData && dexieData && this.hasSignificantData(dexieData)) {
        logger.warn(
          "📦 Chunked cloud data not found but local data exists. Starting migration...",
        );
        return await this.migrateToChunkedFormat(
          ChunkedFirebaseSync,
          dexieData,
        );
      }

      return { migrated: false };
    } catch (error) {
      logger.error("❌ Migration check failed", error);
      return { migrated: false };
    }
  }

  /**
   * Force migration to chunked format (for size limit errors)
   */
  async forceMigrationToChunked() {
    try {
      logger.warn(
        "🚨 Forcing migration to chunked format due to size limits...",
      );

      const ChunkedFirebaseSync = (await import("../utils/chunkedFirebaseSync"))
        .default;
      ChunkedFirebaseSync.initialize(
        this.config.budgetId,
        this.config.encryptionKey,
      );

      // Get local Dexie data
      const dexieData = await this.fetchDexieData();

      if (this.hasSignificantData(dexieData)) {
        return await this.migrateToChunkedFormat(
          ChunkedFirebaseSync,
          dexieData,
        );
      } else {
        logger.warn("⚠️ No significant local data to migrate");
        return { success: false, error: "No data to migrate" };
      }
    } catch (error) {
      logger.error("❌ Forced migration failed", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Migrate from old format to chunked format
   */
  async migrateToChunkedFormat(ChunkedFirebaseSync, dexieData) {
    try {
      logger.debug("🔄 Starting migration to chunked format...");

      // Step 1: Clean up old cloud data
      await ChunkedFirebaseSync.resetCloudData();

      // Step 2: Upload local data using chunked format
      const dataToSync = {
        ...dexieData,
        lastModified: Date.now(),
      };

      await ChunkedFirebaseSync.saveToCloud(
        dataToSync,
        this.config.currentUser,
      );

      logger.debug("✅ Migration to chunked format completed");

      return {
        success: true,
        migrated: true,
        direction: "migration_to_chunked",
        counts: {
          envelopes: dexieData.envelopes?.length || 0,
          transactions: dexieData.transactions?.length || 0,
          bills: dexieData.bills?.length || 0,
        },
      };
    } catch (error) {
      logger.error("❌ Migration to chunked format failed", error);
      throw error;
    }
  }

  /**
   * Execute sync using chunked approach
   */
  async executeChunkedSync(syncResult, ChunkedFirebaseSync) {
    const { direction, data } = syncResult;

    if (direction === "toFirestore") {
      await this.syncFromDexieToChunkedFirestore(data, ChunkedFirebaseSync);
    } else if (direction === "fromFirestore") {
      await this.syncFromFirestoreToDexie(data);
    } else {
      logger.debug("🔄 No sync needed - data is up to date");
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
   * Sync data from Dexie to Firestore using chunked approach
   */
  async syncFromDexieToChunkedFirestore(dexieData, ChunkedFirebaseSync) {
    const dataToSync = {
      ...dexieData,
      lastModified: Date.now(),
    };

    // Initialize the ChunkedFirebaseSync instance
    ChunkedFirebaseSync.initialize(
      this.config.budgetId,
      this.config.encryptionKey,
    );

    // Save data to cloud using chunked approach
    await ChunkedFirebaseSync.saveToCloud(dataToSync, this.config.currentUser);
  }

  /**
   * Check if data is significant enough to warrant migration
   */
  hasSignificantData(data) {
    const totalItems =
      (data.envelopes?.length || 0) +
      (data.transactions?.length || 0) +
      (data.bills?.length || 0) +
      (data.savingsGoals?.length || 0);
    return totalItems > 5; // Arbitrary threshold
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
      syncType: "chunked", // Indicate we're using chunked sync
    };
  }
}

// Export singleton instance
const cloudSyncService = new CloudSyncService();
export default cloudSyncService;
