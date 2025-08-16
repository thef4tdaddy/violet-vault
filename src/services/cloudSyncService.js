import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";
import { queryClient, queryKeys } from "../utils/queryClient";

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
    this.lastSyncedCommitHash = null; // Track using existing git-like history
    this.activeSyncPromise = null; // Prevent concurrent syncs
  }

  /**
   * Start the background sync service
   */
  start(config) {
    if (this.isRunning) {
      logger.debug("🔄 Cloud sync service already running", {
        currentBudgetId: this.config?.budgetId?.slice(0, 8) || "none",
        newBudgetId: config?.budgetId?.slice(0, 8) || "none",
        sameBudget: this.config?.budgetId === config?.budgetId,
      });
      // If same budget, just return. If different budget, restart service.
      if (this.config?.budgetId === config?.budgetId) {
        return;
      } else {
        logger.debug("🔄 Different budget detected, restarting sync service");
        this.stop();
      }
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
    // Prevent concurrent syncs that can cause corruption
    if (this.activeSyncPromise) {
      logger.debug("🔄 Sync already in progress, waiting for completion...");
      return await this.activeSyncPromise;
    }

    this.activeSyncPromise = this._performSyncInternal();
    try {
      const result = await this.activeSyncPromise;
      return result;
    } finally {
      this.activeSyncPromise = null;
    }
  }

  async _performSyncInternal() {
    try {
      if (
        !this.config?.encryptionKey ||
        !this.config?.currentUser ||
        !this.config?.budgetId
      ) {
        logger.warn("⚠️ Missing auth context for sync");
        return { success: false, error: "Missing authentication context" };
      }

      // Check if data has actually changed before performing expensive sync
      const hasChanged = await this.hasDataChanged();
      if (!hasChanged) {
        logger.debug("⏭️ No data changes detected, skipping sync");
        return { success: true, skipped: true, reason: "No changes detected" };
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

      // Debug data state
      const dexieItemCount =
        (dexieData.envelopes?.length || 0) +
        (dexieData.transactions?.length || 0) +
        (dexieData.bills?.length || 0);
      // Debug encryption key consistency for cross-browser sync troubleshooting
      let encryptionKeyDebug = "none";
      if (this.config?.encryptionKey) {
        try {
          // Get first 16 bytes of encryption key as hex for debugging (safe to log)
          const keyView = new Uint8Array(this.config.encryptionKey);
          encryptionKeyDebug = Array.from(keyView.slice(0, 16))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
        } catch (error) {
          encryptionKeyDebug = "error";
        }
      }

      logger.debug("📊 Sync data analysis", {
        hasCloudData: !!chunkedFirestoreData?.data,
        cloudForceSync: !!chunkedFirestoreData?.forceSync,
        dexieItemCount,
        hasSignificantLocalData: this.hasSignificantData(dexieData),
        envelopes: dexieData.envelopes?.length || 0,
        transactions: dexieData.transactions?.length || 0,
        bills: dexieData.bills?.length || 0,
        budgetId: this.config?.budgetId?.slice(0, 8) || "none",
        hasEncryptionKey: !!this.config?.encryptionKey,
        encryptionKeyPreview: encryptionKeyDebug,
        currentUser: this.config?.currentUser?.userName || "none",
      });

      // CRITICAL: If we have forceSync but no local data, wait and retry
      if (chunkedFirestoreData?.forceSync && dexieItemCount === 0) {
        logger.warn(
          "🔄 ForceSync triggered but no local data found - waiting 1s for data to load...",
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Retry fetching local data
        const retryDexieData = await this.fetchDexieData();
        const retryItemCount =
          (retryDexieData.envelopes?.length || 0) +
          (retryDexieData.transactions?.length || 0) +
          (retryDexieData.bills?.length || 0);

        logger.debug("🔄 Retry fetch results", {
          originalItemCount: dexieItemCount,
          retryItemCount,
          foundData: retryItemCount > 0,
        });

        if (retryItemCount > 0) {
          // Use the retry data instead
          Object.assign(dexieData, retryDexieData);
          logger.info("✅ Local data found on retry - proceeding with sync");
        } else {
          logger.warn(
            "❌ No local data found after retry - may need to download from cloud instead",
          );
        }
      }

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

      // Step 3: Handle migration if needed or forced sync after recovery
      const shouldForceSync = chunkedFirestoreData?.forceSync;
      if (
        needsMigration ||
        (!firestoreData && this.hasSignificantData(dexieData)) ||
        (shouldForceSync && this.hasSignificantData(dexieData))
      ) {
        const reason = needsMigration
          ? "migration needed"
          : shouldForceSync
            ? "forced sync after corruption recovery"
            : "no cloud data but local data exists";
        logger.debug(`🔄 Starting migration to chunked format: ${reason}...`);
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
      const [
        envelopes,
        transactions,
        bills,
        savingsGoals,
        paycheckHistory,
        debts,
      ] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.transactions.toArray(),
        budgetDb.bills.toArray(),
        budgetDb.savingsGoals.toArray(),
        budgetDb.paycheckHistory.toArray(),
        budgetDb.debts.toArray(),
      ]);

      // Debug what we're actually fetching from Dexie
      logger.debug("🗃️ CloudSync fetchDexieData results", {
        envelopesCount: envelopes.length,
        transactionsCount: transactions.length,
        billsCount: bills.length,
        savingsGoalsCount: savingsGoals.length,
        paycheckHistoryCount: paycheckHistory.length,
        firstEnvelope: envelopes[0]?.name || "none",
        firstTransaction: transactions[0]?.description || "none",
        firstBill: bills[0]?.name || "none",
        debtsCount: debts.length,
      });

      return {
        envelopes,
        transactions,
        bills,
        savingsGoals,
        paycheckHistory,
        debts,
        lastModified: Math.max(
          ...envelopes.map((e) => e.lastModified || e.createdAt || 0),
          ...transactions.map((t) => t.lastModified || t.createdAt || 0),
          ...bills.map((b) => b.lastModified || b.createdAt || 0),
          ...debts.map((d) => d.lastModified || d.createdAt || 0),
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
        debts: [],
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
  async executeSync(syncResult, FirebaseSync) {
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
        budgetDb.debts,
      ],
      async () => {
        // Clear existing data
        await Promise.all([
          budgetDb.envelopes.clear(),
          budgetDb.transactions.clear(),
          budgetDb.bills.clear(),
          budgetDb.savingsGoals.clear(),
          budgetDb.paycheckHistory.clear(),
          budgetDb.debts.clear(),
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
        if (firestoreData.debts?.length > 0) {
          addPromises.push(budgetDb.debts.bulkAdd(firestoreData.debts));
        }

        await Promise.all(addPromises);

        // Invalidate and refetch queries so React Query hydrates from Dexie
        const keysToRefresh = [
          queryKeys.envelopes,
          queryKeys.transactions,
          queryKeys.bills,
          queryKeys.savingsGoals,
          queryKeys.paychecks,
          queryKeys.debts,
          queryKeys.dashboard,
          queryKeys.analytics,
        ];

        await Promise.all(
          keysToRefresh.map((key) =>
            queryClient.invalidateQueries({ queryKey: key })
          )
        );

        await Promise.all(
          keysToRefresh.map((key) =>
            queryClient.refetchQueries({ queryKey: key, type: "active" })
          )
        );
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
      const result = await ChunkedFirebaseSync.loadFromCloud();

      // Handle auth failure gracefully
      if (result?.localOnly) {
        logger.info(
          "📱 Running in local-only mode - Firebase auth unavailable",
        );
        return null;
      }

      // Handle corruption recovery
      if (result?.recovered) {
        logger.info(
          "🔧 Cloud data corruption detected and cleaned up - ready for fresh sync",
        );
        // Return special flag to force sync attempt even with empty cloud data
        return { data: null, forceSync: true };
      }

      return result?.data || null;
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
      // Debug what data we're actually migrating
      const dataItemCount =
        (dexieData?.envelopes?.length || 0) +
        (dexieData?.transactions?.length || 0) +
        (dexieData?.bills?.length || 0);

      logger.debug("🔄 Starting migration to chunked format...", {
        hasDataToMigrate: !!dexieData,
        envelopesCount: dexieData?.envelopes?.length || 0,
        transactionsCount: dexieData?.transactions?.length || 0,
        billsCount: dexieData?.bills?.length || 0,
        totalItems: dataItemCount,
      });

      // CRITICAL: If no data to migrate but we expect data, fetch fresh data
      if (dataItemCount === 0) {
        logger.warn(
          "🔄 Migration called with empty data - fetching fresh local data...",
        );
        const freshDexieData = await this.fetchDexieData();
        const freshItemCount =
          (freshDexieData?.envelopes?.length || 0) +
          (freshDexieData?.transactions?.length || 0) +
          (freshDexieData?.bills?.length || 0);

        logger.debug("🔄 Fresh data fetch results", {
          originalItemCount: dataItemCount,
          freshItemCount,
          foundFreshData: freshItemCount > 0,
        });

        if (freshItemCount > 0) {
          dexieData = freshDexieData;
          logger.info("✅ Fresh local data found - using for migration");
        }
      }

      // Step 1: Clean up old cloud data
      const resetResult = await ChunkedFirebaseSync.resetCloudData();
      if (resetResult?.localOnly) {
        logger.info("📱 Migration skipped - running in local-only mode");
        return { success: true, localOnly: true };
      }

      // Step 2: Upload local data using chunked format
      const dataToSync = {
        ...dexieData,
        lastModified: Date.now(),
      };

      const saveResult = await ChunkedFirebaseSync.saveToCloud(
        dataToSync,
        this.config.currentUser,
      );
      if (saveResult?.localOnly) {
        logger.info("📱 Migration skipped - running in local-only mode");
        return { success: true, localOnly: true };
      }

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
    const result = await ChunkedFirebaseSync.saveToCloud(
      dataToSync,
      this.config.currentUser,
    );

    if (result?.localOnly) {
      logger.info("📱 Sync skipped - running in local-only mode");
      return { success: true, localOnly: true };
    }

    return { success: true };
  }

  /**
   * Check if data is significant enough to warrant migration
   */
  hasSignificantData(data) {
    const totalItems =
      (data.envelopes?.length || 0) +
      (data.transactions?.length || 0) +
      (data.bills?.length || 0) +
      (data.savingsGoals?.length || 0) +
      (data.debts?.length || 0);

    // Lower threshold to be more sensitive to data
    // Even a few envelopes or transactions should trigger sync
    return totalItems > 0; // Any data is significant
  }

  /**
   * Check if data has changed using the existing budget history system
   */
  async hasDataChanged() {
    try {
      const { budgetHistory } = await import("../utils/budgetHistory.js");
      const currentCommitHash = budgetHistory.currentCommitHash;

      // For first-time sync (no previous commit hash), always sync
      if (!this.lastSyncedCommitHash) {
        logger.debug("🆕 First-time sync detected - forcing sync attempt", {
          currentCommit: currentCommitHash?.slice(0, 8) || "none",
          hasCurrentCommit: !!currentCommitHash,
        });
        this.lastSyncedCommitHash = currentCommitHash;
        return true; // Always sync on first run
      }

      const hasChanged = currentCommitHash !== this.lastSyncedCommitHash;
      if (hasChanged) {
        logger.debug("📊 Data change detected via budget history", {
          previousCommit: this.lastSyncedCommitHash?.slice(0, 8) || "none",
          currentCommit: currentCommitHash?.slice(0, 8) || "none",
        });
        this.lastSyncedCommitHash = currentCommitHash;
      } else {
        logger.debug("⏭️ No data changes since last sync", {
          commitHash: currentCommitHash?.slice(0, 8) || "none",
          lastSynced: this.lastSyncedCommitHash?.slice(0, 8) || "none",
        });
      }

      return hasChanged;
    } catch (error) {
      logger.warn(
        "Failed to check budget history changes, assuming changed",
        error,
      );
      return true; // Fail safe - sync if we can't determine changes
    }
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
      lastSyncedCommit: this.lastSyncedCommitHash?.slice(0, 8) || null,
    };
  }

  /**
   * Check if service is running (getter to avoid this.isRunning conflict)
   */
  get serviceIsRunning() {
    return this.isRunning;
  }
}

// Export singleton instance
const cloudSyncService = new CloudSyncService();
export default cloudSyncService;
