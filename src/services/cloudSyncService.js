import { budgetDb } from "../db/budgetDb";
import logger from "../utils/logger";
import { queryClient } from "../utils/queryClient";
import { queryKeys } from "../utils/queryClient";

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
   * Save downloaded cloud data to Dexie and invalidate TanStack Query caches
   */
  async saveToDexieAndInvalidate(data) {
    logger.debug("💾 Saving downloaded cloud data to Dexie...");

    try {
      // Save all data types to Dexie using bulk upsert methods
      const promises = [];

      if (data.transactions?.length > 0) {
        promises.push(budgetDb.bulkUpsertTransactions(data.transactions));
        logger.debug(`💾 Saving ${data.transactions.length} transactions to Dexie`);
      }

      if (data.envelopes?.length > 0) {
        promises.push(budgetDb.bulkUpsertEnvelopes(data.envelopes));
        logger.debug(`💾 Saving ${data.envelopes.length} envelopes to Dexie`);
      }

      if (data.bills?.length > 0) {
        promises.push(budgetDb.bulkUpsertBills(data.bills));
        logger.debug(`💾 Saving ${data.bills.length} bills to Dexie`);
      }

      if (data.debts?.length > 0) {
        promises.push(budgetDb.bulkUpsertDebts(data.debts));
        logger.debug(`💾 Saving ${data.debts.length} debts to Dexie`);
      }

      if (data.savingsGoals?.length > 0) {
        promises.push(budgetDb.bulkUpsertSavingsGoals(data.savingsGoals));
        logger.debug(`💾 Saving ${data.savingsGoals.length} savings goals to Dexie`);
      }

      if (data.paycheckHistory?.length > 0) {
        promises.push(budgetDb.bulkUpsertPaychecks(data.paycheckHistory));
        logger.debug(`💾 Saving ${data.paycheckHistory.length} paycheck history to Dexie`);
      }

      // Save budget metadata (unassigned cash and actual balance)
      if (typeof data.unassignedCash === "number" || typeof data.actualBalance === "number") {
        const currentMetadata = (await budgetDb.budget.get("metadata")) || {};
        const newMetadata = {
          ...currentMetadata,
          lastModified: Date.now(),
        };

        if (typeof data.unassignedCash === "number") {
          newMetadata.unassignedCash = data.unassignedCash;
          logger.debug(`💾 Saving unassigned cash: $${data.unassignedCash}`);
        }

        if (typeof data.actualBalance === "number") {
          newMetadata.actualBalance = data.actualBalance;
          logger.debug(`💾 Saving actual balance: $${data.actualBalance}`);
        }

        promises.push(
          budgetDb.budget.put({
            id: "metadata",
            ...newMetadata,
          })
        );
      }

      // Simple edit tracking - just track who last edited and when
      if (data.lastEditedBy || data.lastEditedAt) {
        const currentMetadata = (await budgetDb.budget.get("metadata")) || {};
        const editTracking = {
          ...currentMetadata,
          lastModified: Date.now(),
        };

        if (data.lastEditedBy) {
          editTracking.lastEditedBy = data.lastEditedBy;
          logger.info(`👤 Last edited by: ${data.lastEditedBy}`);
        }

        if (data.lastEditedAt) {
          editTracking.lastEditedAt = data.lastEditedAt;
          logger.info(`🕒 Last edited at: ${new Date(data.lastEditedAt).toISOString()}`);
        }

        promises.push(
          budgetDb.budget.put({
            id: "metadata",
            ...editTracking,
          })
        );
      }

      // Wait for all saves to complete
      await Promise.all(promises);

      logger.info("✅ Successfully saved all data to Dexie");

      // Invalidate all relevant TanStack Query caches to trigger UI refresh
      logger.info("🔄 Invalidating TanStack Query caches...");

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.transactions }),
        queryClient.invalidateQueries({ queryKey: queryKeys.envelopes }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bills }),
        queryClient.invalidateQueries({ queryKey: queryKeys.debts }),
        queryClient.invalidateQueries({ queryKey: queryKeys.savingsGoals }),
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard }),
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics }),
        queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata }),
      ]);

      logger.info("✅ TanStack Query caches invalidated - UI should refresh with synced data");
    } catch (error) {
      logger.error("❌ Failed to save downloaded data to Dexie:", error);
      throw error;
    }
  }

  /**
   * Start the background sync service
   */
  async start(config) {
    if (this.isRunning) {
      logger.info("🔄 Cloud sync service already running", {
        currentBudgetId: this.config?.budgetId?.slice(0, 8) || "none",
        newBudgetId: config?.budgetId?.slice(0, 8) || "none",
        sameBudget: this.config?.budgetId === config?.budgetId,
        configKeys: Object.keys(this.config || {}),
        newConfigKeys: Object.keys(config || {}),
      });
      // If same budget, just return. If different budget, restart service.
      if (this.config?.budgetId === config?.budgetId) {
        // Always reinitialize ChunkedFirebaseSync even with same budget
        // to ensure fresh Firebase auth and proper budget ID propagation
        logger.info(
          "🔄 Same budget detected, but reinitializing ChunkedFirebaseSync to clear stale state"
        );

        // Normalize the new encryption key
        let normalizedKey = config.encryptionKey;
        try {
          if (normalizedKey instanceof CryptoKey) {
            // already ok
          } else {
            let rawKey;
            if (normalizedKey instanceof Uint8Array) {
              rawKey = normalizedKey.buffer.slice(
                normalizedKey.byteOffset,
                normalizedKey.byteOffset + normalizedKey.byteLength
              );
            } else if (normalizedKey instanceof ArrayBuffer) {
              rawKey = normalizedKey;
            } else {
              logger.error("❌ Invalid encryption key type", {
                type: typeof normalizedKey,
              });
              return;
            }
            normalizedKey = await crypto.subtle.importKey(
              "raw",
              rawKey,
              { name: "AES-GCM" },
              false,
              ["encrypt", "decrypt"]
            );
          }
        } catch (error) {
          logger.error("❌ Failed to import encryption key", error);
          return;
        }

        // Update config with new values and normalized key
        this.config = { ...config, encryptionKey: normalizedKey };

        // Force ChunkedFirebaseSync reinitialization with fresh budget ID and key
        const { default: ChunkedFirebaseSync } = await import("../utils/chunkedFirebaseSync");
        await ChunkedFirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

        logger.debug("🔄 ChunkedFirebaseSync reinitialized");

        return;
      } else {
        logger.info("🔄 Different budget detected, restarting sync service");
        this.stop();
      }
    }

    if (!config?.encryptionKey) {
      logger.error("❌ Cannot start sync service without encryption key");
      return;
    }

    let normalizedKey = config.encryptionKey;
    try {
      if (normalizedKey instanceof CryptoKey) {
        // already ok
      } else {
        let rawKey;
        if (normalizedKey instanceof Uint8Array) {
          rawKey = normalizedKey.buffer.slice(
            normalizedKey.byteOffset,
            normalizedKey.byteOffset + normalizedKey.byteLength
          );
        } else if (normalizedKey instanceof ArrayBuffer) {
          rawKey = normalizedKey;
        } else {
          logger.error("❌ Invalid encryption key type", {
            type: typeof normalizedKey,
          });
          return;
        }
        normalizedKey = await crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, false, [
          "encrypt",
          "decrypt",
        ]);
      }
    } catch (error) {
      logger.error("❌ Failed to import encryption key", error);
      return;
    }

    this.config = { ...config, encryptionKey: normalizedKey };
    this.isRunning = true;

    // CRITICAL DEBUG: Track budget ID in cloud sync service config
    logger.info("🌩️ Starting cloud sync service", {
      budgetId: config?.budgetId?.slice(0, 12) + "...",
      userName: config?.currentUser?.userName,
    });

    // Do initial sync immediately
    this.performSync();

    // Set up periodic sync
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, this.syncIntervalMs);

    logger.info("✅ Cloud sync service started");
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
    logger.info("⏹️ Cloud sync service stopped");
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
      if (!this.config?.encryptionKey || !this.config?.currentUser || !this.config?.budgetId) {
        logger.warn("⚠️ Missing auth context for sync");
        return { success: false, error: "Missing authentication context" };
      }

      // Check if data has actually changed before performing expensive sync
      const hasChanged = await this.hasDataChanged();
      if (!hasChanged) {
        logger.debug("⏭️ No data changes detected, skipping sync");
        return { success: true, skipped: true, reason: "No changes detected" };
      }

      logger.info("🔄 Starting Firebase sync...");
      const startTime = Date.now();

      // Import ChunkedFirebaseSync for new implementation
      const ChunkedFirebaseSync = (await import("../utils/chunkedFirebaseSync")).default;

      // Step 1: Get data from both sources
      const [chunkedFirestoreData, dexieData] = await Promise.all([
        this.fetchChunkedFirestoreData(ChunkedFirebaseSync),
        this.fetchDexieData(),
      ]);

      // Debug data state
      const dexieItemCount =
        (dexieData.envelopes?.length || 0) +
        (dexieData.transactions?.length || 0) +
        (dexieData.bills?.length || 0) +
        (dexieData.debts?.length || 0);
      // Debug encryption key consistency for cross-browser sync troubleshooting
      let encryptionKeyDebug = "none";
      if (this.config?.encryptionKey) {
        try {
          // CryptoKey objects cannot be directly viewed as Uint8Array
          if (this.config.encryptionKey instanceof CryptoKey) {
            encryptionKeyDebug = `CryptoKey(${this.config.encryptionKey.algorithm.name})`;
          } else {
            // If it's an ArrayBuffer, get first 16 bytes as hex for debugging (safe to log)
            const keyView = new Uint8Array(this.config.encryptionKey);
            encryptionKeyDebug = Array.from(keyView.slice(0, 16))
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
          }
        } catch {
          encryptionKeyDebug = "error";
        }
      }

      logger.info("📊 Sync data analysis", {
        hasCloudData: !!chunkedFirestoreData?.data,
        cloudForceSync: !!chunkedFirestoreData?.forceSync,
        dexieItemCount,
        hasSignificantLocalData: this.hasSignificantData(dexieData),
        envelopes: dexieData.envelopes?.length || 0,
        transactions: dexieData.transactions?.length || 0,
        bills: dexieData.bills?.length || 0,
        debts: dexieData.debts?.length || 0,
        budgetId: this.config?.budgetId?.slice(0, 8) || "none",
        hasEncryptionKey: !!this.config?.encryptionKey,
        encryptionKeyPreview: encryptionKeyDebug,
        currentUser: this.config?.currentUser?.userName || "none",
      });

      // CRITICAL: If we have forceSync but no local data, wait and retry
      if (chunkedFirestoreData?.forceSync && dexieItemCount === 0) {
        logger.warn(
          "🔄 ForceSync triggered but no local data found - waiting 1s for data to load..."
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Retry fetching local data
        const retryDexieData = await this.fetchDexieData();
        const retryItemCount =
          (retryDexieData.envelopes?.length || 0) +
          (retryDexieData.transactions?.length || 0) +
          (retryDexieData.bills?.length || 0) +
          (retryDexieData.debts?.length || 0);

        logger.info("🔄 Retry fetch results", {
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
            "❌ No local data found after retry - may need to download from cloud instead"
          );
        }
      }

      // Step 2: Check for old format data if chunked data not found
      let firestoreData = chunkedFirestoreData;
      let needsMigration = false;

      if (!chunkedFirestoreData) {
        logger.info("🔍 Chunked data not found, checking for old format data...");
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
        logger.info(`🔄 Starting migration to chunked format: ${reason}...`);
        const migrationResult = await this.migrateToChunkedFormat(
          ChunkedFirebaseSync,
          firestoreData || dexieData
        );
        if (migrationResult.migrated) {
          return migrationResult;
        }
      }

      // Step 4: Determine sync direction based on data freshness
      const syncResult = await this.determineSyncDirection(firestoreData, dexieData);

      // Step 5: Perform the sync using chunked approach
      const result = await this.executeChunkedSync(syncResult, ChunkedFirebaseSync);

      const duration = Date.now() - startTime;
      this.lastSyncTime = Date.now();

      // Update sync hash after successful sync
      const currentData = await this.fetchDexieData();
      this.lastSyncedCommitHash = currentData.lastModified.toString();

      logger.info("✅ Firebase sync completed", {
        direction: result.direction,
        duration: `${duration}ms`,
        counts: result.counts,
        budgetId: this.config?.budgetId?.slice(0, 8),
      });

      return result;
    } catch (error) {
      // Check if error is related to document size limits
      if (
        error.message?.includes("exceeds the maximum allowed size") ||
        error.message?.includes("1,048,576 bytes")
      ) {
        logger.warn("📦 Document size limit exceeded, forcing chunked migration...");
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
   * Fetch data from Dexie (restored to working pre-budget-history version)
   */
  async fetchDexieData() {
    try {
      const [envelopes, transactions, bills, savingsGoals, paycheckHistory, debts, budgetMetadata] =
        await Promise.all([
          budgetDb.envelopes.toArray(),
          budgetDb.transactions.toArray(),
          budgetDb.bills.toArray(),
          budgetDb.savingsGoals.toArray(),
          budgetDb.paycheckHistory.toArray(),
          budgetDb.debts.toArray(),
          budgetDb.budget.get("metadata"),
        ]);

      // Debug what we're actually fetching from Dexie
      logger.info("🗃️ CloudSync fetchDexieData results", {
        envelopesCount: envelopes.length,
        transactionsCount: transactions.length,
        billsCount: bills.length,
        savingsGoalsCount: savingsGoals.length,
        paycheckHistoryCount: paycheckHistory.length,
        debtsCount: debts.length,
        unassignedCash: budgetMetadata?.unassignedCash || 0,
        actualBalance: budgetMetadata?.actualBalance || 0,
        firstEnvelope: envelopes[0]?.name || "none",
        firstTransaction: transactions[0]?.description || "none",
        firstBill: bills[0]?.name || "none",
        firstDebt: debts[0]?.name || "none",
      });

      return {
        envelopes,
        transactions,
        bills,
        savingsGoals,
        paycheckHistory,
        debts,
        unassignedCash: budgetMetadata?.unassignedCash || 0,
        actualBalance: budgetMetadata?.actualBalance || 0,
        lastModified: Math.max(
          ...envelopes.map((e) => this._ensureNumericTimestamp(e.lastModified || e.createdAt || 0)),
          ...transactions.map((t) =>
            this._ensureNumericTimestamp(t.lastModified || t.createdAt || 0)
          ),
          ...bills.map((b) => this._ensureNumericTimestamp(b.lastModified || b.createdAt || 0)),
          ...debts.map((d) => this._ensureNumericTimestamp(d.lastModified || d.createdAt || 0)),
          this._ensureNumericTimestamp(budgetMetadata?.lastModified || 0),
          0
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
        unassignedCash: 0,
        actualBalance: 0,
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
      Object.values(firestoreData).some((arr) => Array.isArray(arr) && arr.length > 0);
    const dexieHasData = Object.values(dexieData).some(
      (arr) => Array.isArray(arr) && arr.length > 0
    );

    logger.info("🔍 Sync analysis", {
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
        // Even if local is newer, check if cloud has significantly more data
        const firestoreItemCount = this.countDataItems(firestoreData);
        const dexieItemCount = this.countDataItems(dexieData);

        logger.info("📊 Local timestamp newer, comparing data significance", {
          firestoreItems: firestoreItemCount,
          dexieItems: dexieItemCount,
          timeDiff: dexieLastModified - firestoreLastModified,
        });

        // If cloud has significantly more data (5+ items more), prefer cloud despite newer local timestamp
        if (firestoreItemCount >= dexieItemCount + 5) {
          logger.info("☁️ Cloud has significantly more data despite older timestamp, downloading");
          return { direction: "fromFirestore", data: firestoreData };
        }

        return { direction: "toFirestore", data: dexieData };
      } else {
        // When timestamps are equal, check which dataset is larger/more complete
        const firestoreItemCount = this.countDataItems(firestoreData);
        const dexieItemCount = this.countDataItems(dexieData);

        logger.info("📊 Equal timestamps detected, comparing data size", {
          firestoreItems: firestoreItemCount,
          dexieItems: dexieItemCount,
        });

        if (firestoreItemCount > dexieItemCount) {
          logger.info("☁️ Cloud has more data, downloading from cloud");
          return { direction: "fromFirestore", data: firestoreData };
        } else if (dexieItemCount > firestoreItemCount) {
          logger.info("📱 Local has more data, uploading to cloud");
          return { direction: "toFirestore", data: dexieData };
        } else {
          // Same size and timestamp - prefer cloud to avoid unnecessary uploads
          logger.info("🔄 Same size and timestamp, keeping cloud data");
          return { direction: "fromFirestore", data: firestoreData };
        }
      }
    }

    return { direction: "none", data: dexieData };
  }

  /**
   * Count total items across all data arrays
   */
  countDataItems(data) {
    if (!data) return 0;

    let count = 0;
    const arrayFields = [
      "envelopes",
      "transactions",
      "bills",
      "debts",
      "savingsGoals",
      "paycheckHistory",
    ];

    arrayFields.forEach((field) => {
      if (Array.isArray(data[field])) {
        count += data[field].length;
      }
    });

    return count;
  }

  /**
   * Execute the sync in the determined direction
   */
  async executeSync(syncResult, FirebaseSync) {
    const { direction, data } = syncResult;

    switch (direction) {
      case "fromFirestore":
        await this.syncFromFirestoreToDexie(data);
        logger.info("📥 Synced from Firestore to Dexie");
        break;

      case "toFirestore":
        await this.syncFromDexieToFirestore(data, FirebaseSync);
        logger.info("📤 Synced from Dexie to Firestore");
        break;

      case "none":
      default:
        logger.info("✅ Data already in sync");
        break;
    }

    return {
      success: true,
      direction,
      counts: {
        envelopes: data.envelopes?.length || 0,
        transactions: data.transactions?.length || 0,
        bills: data.bills?.length || 0,
        debts: data.debts?.length || 0,
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
        budgetDb.budget,
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
          addPromises.push(budgetDb.transactions.bulkAdd(firestoreData.transactions));
        }
        if (firestoreData.bills?.length > 0) {
          addPromises.push(budgetDb.bills.bulkAdd(firestoreData.bills));
        }
        if (firestoreData.savingsGoals?.length > 0) {
          addPromises.push(budgetDb.savingsGoals.bulkAdd(firestoreData.savingsGoals));
        }
        if (firestoreData.paycheckHistory?.length > 0) {
          addPromises.push(budgetDb.paycheckHistory.bulkAdd(firestoreData.paycheckHistory));
        }
        if (firestoreData.debts?.length > 0) {
          addPromises.push(budgetDb.debts.bulkAdd(firestoreData.debts));
        }

        await Promise.all(addPromises);

        // Handle metadata (unassigned cash, actual balance)
        if (
          typeof firestoreData.unassignedCash === "number" ||
          typeof firestoreData.actualBalance === "number"
        ) {
          await budgetDb.budget.put({
            id: "metadata",
            unassignedCash: firestoreData.unassignedCash || 0,
            actualBalance: firestoreData.actualBalance || 0,
            lastModified: Date.now(),
          });
        }
      }
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
    await FirebaseSync.saveToCloud(dataToSync, this.config?.currentUser);
  }

  /**
   * Fetch data from Firestore using chunked approach
   */
  async fetchChunkedFirestoreData(ChunkedFirebaseSync) {
    try {
      // Check for required config before proceeding
      if (!this.config?.budgetId || !this.config?.encryptionKey) {
        logger.warn("⚠️ Missing config for chunked Firestore fetch");
        return null;
      }

      logger.info("🗂️ Initializing ChunkedFirebaseSync...");

      logger.debug("🔧 Initializing ChunkedFirebaseSync");

      // Initialize the ChunkedFirebaseSync instance
      await ChunkedFirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

      // Load data from cloud
      const result = await ChunkedFirebaseSync.loadFromCloud();

      // Handle auth failure gracefully
      if (result?.localOnly) {
        logger.info("📱 Running in local-only mode - Firebase auth unavailable");
        return null;
      }

      // Handle corruption recovery
      if (result?.recovered) {
        logger.info("🔧 Cloud data corruption detected and cleaned up - ready for fresh sync");
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
      logger.info("📭 No old format data found (expected for new accounts)", error.message);
      return null;
    }
  }

  /**
   * Handle migration from old single-document to new chunked format
   */
  async handleMigrationIfNeeded(ChunkedFirebaseSync, dexieData) {
    try {
      // Check if we have local data but can't load from chunked cloud
      const chunkedData = await this.fetchChunkedFirestoreData(ChunkedFirebaseSync);

      // If chunked data fails to load but we have local data, we need to migrate
      if (!chunkedData && dexieData && this.hasSignificantData(dexieData)) {
        logger.warn("📦 Chunked cloud data not found but local data exists. Starting migration...");
        return await this.migrateToChunkedFormat(ChunkedFirebaseSync, dexieData);
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
      logger.warn("🚨 Forcing migration to chunked format due to size limits...");

      const ChunkedFirebaseSync = (await import("../utils/chunkedFirebaseSync")).default;
      await ChunkedFirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

      // Get local Dexie data
      const dexieData = await this.fetchDexieData();

      if (this.hasSignificantData(dexieData)) {
        return await this.migrateToChunkedFormat(ChunkedFirebaseSync, dexieData);
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
        (dexieData?.bills?.length || 0) +
        (dexieData?.debts?.length || 0);

      logger.info("🔄 Starting migration to chunked format...", {
        hasDataToMigrate: !!dexieData,
        envelopesCount: dexieData?.envelopes?.length || 0,
        transactionsCount: dexieData?.transactions?.length || 0,
        billsCount: dexieData?.bills?.length || 0,
        debtsCount: dexieData?.debts?.length || 0,
        totalItems: dataItemCount,
      });

      // CRITICAL: If no data to migrate but we expect data, fetch fresh data
      if (dataItemCount === 0) {
        logger.warn("🔄 Migration called with empty data - fetching fresh local data...");
        const freshDexieData = await this.fetchDexieData();
        const freshItemCount =
          (freshDexieData?.envelopes?.length || 0) +
          (freshDexieData?.transactions?.length || 0) +
          (freshDexieData?.bills?.length || 0) +
          (freshDexieData?.debts?.length || 0);

        logger.info("🔄 Fresh data fetch results", {
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
        this.config?.currentUser
      );
      if (saveResult?.localOnly) {
        logger.info("📱 Migration skipped - running in local-only mode");
        return { success: true, localOnly: true };
      }

      logger.info("✅ Migration to chunked format completed");

      return {
        success: true,
        migrated: true,
        direction: "migration_to_chunked",
        counts: {
          envelopes: dexieData.envelopes?.length || 0,
          transactions: dexieData.transactions?.length || 0,
          bills: dexieData.bills?.length || 0,
          debts: dexieData.debts?.length || 0,
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
      logger.info("📤 Uploading local data to Firebase...");
      await this.syncFromDexieToChunkedFirestore(data, ChunkedFirebaseSync);
    } else if (direction === "fromFirestore") {
      logger.info("📥 Downloading data from Firebase...");
      await this.saveToDexieAndInvalidate(data);
    } else {
      logger.info("✅ Data already synchronized");
    }

    return {
      success: true,
      direction,
      counts: {
        envelopes: data.envelopes?.length || 0,
        transactions: data.transactions?.length || 0,
        bills: data.bills?.length || 0,
        debts: data.debts?.length || 0,
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
    await ChunkedFirebaseSync.initialize(this.config.budgetId, this.config.encryptionKey);

    // Save data to cloud using chunked approach
    const result = await ChunkedFirebaseSync.saveToCloud(dataToSync, this.config?.currentUser);

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

    const metadataPresent = (data.unassignedCash ?? 0) !== 0 || (data.actualBalance ?? 0) !== 0;

    // Lower threshold to be more sensitive to data
    // Even a few items or metadata changes should trigger sync
    return totalItems > 0 || metadataPresent; // Any data is significant
  }

  /**
   * Check if data has changed by comparing with last modification times
   */
  async hasDataChanged() {
    try {
      // Get current data modification times from Dexie
      const currentData = await this.fetchDexieData();
      let currentModTime = currentData.lastModified;

      // Ensure we have a valid timestamp
      if (!currentModTime || isNaN(currentModTime) || currentModTime <= 0) {
        currentModTime = Date.now();
      }

      // For first-time sync, always sync
      if (!this.lastSyncedCommitHash) {
        logger.info("🆕 First-time sync detected - forcing sync attempt", {
          currentModTime: new Date(currentModTime).toISOString(),
        });
        this.lastSyncedCommitHash = currentModTime.toString();
        return true; // Always sync on first run
      }

      const lastSyncedTime = parseInt(this.lastSyncedCommitHash) || 0;
      const hasChanged = currentModTime > lastSyncedTime;

      if (hasChanged) {
        logger.info("📊 Data change detected via modification time", {
          previousModTime: new Date(lastSyncedTime).toISOString(),
          currentModTime: new Date(currentModTime).toISOString(),
        });
        // Don't update hash here - only update after successful sync
      } else {
        logger.info("⏭️ No data changes since last sync", {
          modTime: new Date(currentModTime).toISOString(),
          lastSynced: new Date(lastSyncedTime).toISOString(),
        });
      }

      return hasChanged;
    } catch (error) {
      logger.warn("Failed to check data changes, assuming changed", error);
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

  /**
   * Ensure timestamp is numeric, convert strings to numbers
   * Fixes sync issues caused by string timestamps
   */
  _ensureNumericTimestamp(timestamp) {
    if (typeof timestamp === "string") {
      const parsed = new Date(timestamp).getTime();
      if (!isNaN(parsed)) {
        logger.warn(`Converting string timestamp to number: ${timestamp} -> ${parsed}`);
        return parsed;
      }
      logger.warn(`Invalid timestamp string: ${timestamp}, using 0`);
      return 0;
    }
    if (typeof timestamp === "number" && !isNaN(timestamp)) {
      return timestamp;
    }
    return 0;
  }
}

// Export singleton instance
const cloudSyncService = new CloudSyncService();

// Expose to window for debugging (development/staging only)
if (
  typeof window !== "undefined" &&
  (import.meta.env.MODE === "development" ||
    window.location.hostname.includes("f4tdaddy.com") ||
    window.location.hostname.includes("vercel.app"))
) {
  window.cloudSyncService = cloudSyncService;
}

export default cloudSyncService;
