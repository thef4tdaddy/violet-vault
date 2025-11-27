import { budgetDb } from "../db/budgetDb";
import type { BudgetRecord, Envelope, Transaction, Bill, PaycheckHistory, Debt } from "../db/types";
import type { CloudSyncConfig } from "../types/firebase";
import logger from "../utils/common/logger";
import chunkedSyncService from "./chunkedSyncService";
import { autoBackupService } from "../utils/sync/autoBackupService";
import { syncHealthMonitor } from "../utils/sync/syncHealthMonitor";
import { ENVELOPE_TYPES } from "../constants/categories";

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes (much more reasonable)
const DEBOUNCE_DELAY = 10000; // 10 seconds (longer debounce to reduce noise)

const extractNumericValue = (
  record: BudgetRecord | undefined,
  key: "unassignedCash" | "actualBalance"
): number => {
  const value = record?.[key];
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

/**
 * Configuration interface for cloud sync service
 */
export interface SyncConfig {
  budgetId?: string;
  encryptionKey?: string | CryptoKey | Uint8Array<ArrayBufferLike>;
  currentUser?: {
    readonly uid?: string;
    readonly userName?: string;
    readonly joinedVia?: string;
    readonly sharedBy?: string;
  };
  clearAllData?: () => Promise<void>;
}

// Define interface for data objects
// v2.0: Savings goals and supplemental accounts are stored as envelopes with envelopeType
export interface DataCollection {
  envelopes?: unknown[];
  transactions?: unknown[];
  bills?: unknown[];
  paycheckHistory?: unknown[];
  debts?: unknown[];
  unassignedCash?: number;
  actualBalance?: number;
  lastModified?: number;
  // v2.0 metadata
  syncVersion?: string;
  // Legacy fields (for backward compatibility during migration)
  /** @deprecated Use envelopes with envelopeType: "savings" instead */
  savingsGoals?: unknown[];
  /** @deprecated Use envelopes with envelopeType: "supplemental" instead */
  supplementalAccounts?: unknown[];
}

// v2.0: SupplementalAccountRecord is deprecated - supplemental accounts are now stored as envelopes
// This type is kept for backward compatibility during migration
/** @deprecated Use Envelope with envelopeType: "supplemental" instead */
type SupplementalAccountRecord = {
  id?: string | number;
  name?: string;
  type?: string;
  balance?: number;
  [key: string]: unknown;
};

// v2.0: Export the type for migration service compatibility
export type { SupplementalAccountRecord };

// Define interface for the specific return type of fetchDexieData
// v2.0: Savings goals and supplemental accounts are stored as envelopes with envelopeType
export interface DexieData {
  envelopes: Envelope[];
  transactions: Transaction[];
  bills: Bill[];
  debts: Debt[];
  paycheckHistory: PaycheckHistory[];
  unassignedCash: number;
  actualBalance: number;
  lastModified: number;
  // v2.0 metadata
  syncVersion: string;
}

// Define interface for sync result
interface SyncResult {
  success: boolean;
  direction?: string;
  error?: string;
  recordsProcessed?: number;
}

// Define interface for window with cloudSyncService
interface CloudSyncWindow extends Window {
  cloudSyncService?: typeof cloudSyncService;
}

class CloudSyncService {
  syncIntervalId: ReturnType<typeof setTimeout> | null;
  isSyncing: boolean;
  config: SyncConfig | null;
  debounceTimer: ReturnType<typeof setTimeout> | null;
  isRunning: boolean;
  syncQueue: Promise<unknown>;

  constructor() {
    this.syncIntervalId = null;
    this.isSyncing = false;
    this.config = null;
    this.debounceTimer = null;
    this.isRunning = false;
    this.syncQueue = Promise.resolve();
  }

  start(config: SyncConfig) {
    if (this.isRunning) {
      logger.debug("🔄 Sync service already running.");
      return;
    }

    this.config = config;
    this.isRunning = true;
    logger.production("Cloud sync service started", {
      user: config?.budgetId || "unknown",
    });

    // Initial sync only when starting
    this.scheduleSync();

    // GitHub Issue #576: Replace aggressive periodic sync with change-based sync
    // Only sync when data actually changes, not every 30 seconds
    // The sync will be triggered by data mutations via TanStack Query optimistic updates
  }

  stop() {
    if (!this.isRunning) return;

    logger.production("Cloud sync service stopped", {
      user: this.config?.budgetId || "unknown",
    });
    // No more periodic sync interval to clear
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.isRunning = false;
  }

  // Debounced sync to avoid rapid consecutive syncs
  scheduleSync(priority: "normal" | "high" = "normal") {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Use shorter delay for high-priority changes (paycheck, envelope changes, etc.)
    const delay = priority === "high" ? 2000 : DEBOUNCE_DELAY;

    this.debounceTimer = setTimeout(() => {
      this.syncQueue = this.syncQueue.then(() => this.forceSync());
    }, delay);
  }

  // Trigger sync immediately for critical changes (paycheck, imports, etc.)
  triggerSyncForCriticalChange(changeType: string) {
    logger.info(`🚨 Critical change detected: ${changeType}, triggering immediate sync`);
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.syncQueue = this.syncQueue.then(() => this.forceSync());
  }

  async forceSync() {
    if (this.isSyncing) {
      logger.warn("🔄 Sync already in progress, skipping.");
      return { success: false, reason: "Sync in progress" };
    }

    this.isSyncing = true;
    logger.info("🔄 Starting chunked data sync...");

    // GitHub Issue #576 Phase 3: Track sync with health monitoring
    const syncId = syncHealthMonitor.recordSyncStart("cloud_sync");

    // GitHub Issue #576 Phase 3: Create automatic backup before sync
    const backupId = await autoBackupService.createPreSyncBackup("cloud_sync");

    try {
      // GitHub Issue #576 Phase 2: Enhanced encryption context validation for all users
      if (!this.config?.budgetId || !this.config?.encryptionKey) {
        logger.warn("🔐 Sync aborted - missing encryption context", {
          hasBudgetId: !!this.config?.budgetId,
          hasEncryptionKey: !!this.config?.encryptionKey,
        });
        return { success: false, reason: "Missing encryption context" };
      }

      // Additional validation for encryption key readiness
      if (this.config.encryptionKey instanceof Promise) {
        logger.warn("🔐 Sync aborted - encryption key not yet resolved", {
          keyType: typeof this.config.encryptionKey,
        });
        return { success: false, reason: "Encryption key not ready" };
      }

      // Initialize chunked Firebase sync if not already done
      syncHealthMonitor.updateSyncProgress(syncId, "initializing");
      await chunkedSyncService.initialize(
        this.config.budgetId as string,
        this.config.encryptionKey as string
      );

      // Fetch data from Dexie for sync
      syncHealthMonitor.updateSyncProgress(syncId, "fetching_local_data");
      const localData = await this.fetchDexieData();

      // Check what data exists in cloud to determine sync direction
      let cloudData;
      try {
        const cloudResult = await chunkedSyncService.loadFromCloud();
        cloudData = cloudResult || null;
        // v2.0: Log cloud data structure - savings goals are now in envelopes
        logger.debug("📊 CloudSyncService received data from chunkedSyncService (v2.0)", {
          hasData: !!cloudData,
          keys: cloudData ? Object.keys(cloudData) : [],
          syncVersion: (cloudData as DataCollection)?.syncVersion || "1.x",
          arrayLengths: cloudData
            ? {
                envelopes: (cloudData as DataCollection).envelopes?.length || 0,
                transactions: (cloudData as DataCollection).transactions?.length || 0,
                bills: (cloudData as DataCollection).bills?.length || 0,
                paycheckHistory: (cloudData as DataCollection).paycheckHistory?.length || 0,
                debts: (cloudData as DataCollection).debts?.length || 0,
                // Legacy: log if old savingsGoals array exists
                legacySavingsGoals: (cloudData as DataCollection).savingsGoals?.length || 0,
              }
            : null,
        });
      } catch (error) {
        // GitHub Issue #576 Phase 2: Universal decryption error handling for all users
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorName = error instanceof Error ? error.name : String(error);

        if (
          errorMessage?.includes("The provided data is too small") ||
          errorMessage?.includes("decrypt") ||
          errorMessage?.includes("key mismatch") ||
          errorName === "OperationError"
        ) {
          logger.warn("🔑 Decryption failed during sync - treating as no cloud data", {
            errorMessage: errorMessage,
            errorName: errorName,
            budgetId: (this.config?.budgetId as string | undefined)?.substring(0, 8) + "...",
            timestamp: new Date().toISOString(),
          });

          // For any user, treat decryption failures as "no cloud data" scenario
          // This prevents crashes and allows sync to continue gracefully
          cloudData = null;
        } else {
          logger.warn(
            "Could not load cloud data, assuming no cloud data exists",
            error as Record<string, unknown>
          );
          cloudData = null;
        }
      }

      // Determine sync direction
      const syncDecision = this.determineSyncDirection(localData, cloudData as DataCollection);
      // v2.0: Updated logging - savings goals are now in envelopes
      logger.info(`🔄 Sync direction determined: ${syncDecision.direction}`, {
        localLastModified: localData?.lastModified,
        cloudLastModified: (cloudData as DataCollection)?.lastModified,
        syncVersion: (cloudData as DataCollection)?.syncVersion || "1.x",
        hasLocalData: !!(
          localData?.envelopes?.length ||
          localData?.transactions?.length ||
          localData?.bills?.length ||
          localData?.paycheckHistory?.length ||
          localData?.debts?.length
        ),
        hasCloudData: !!(
          (cloudData as DataCollection)?.envelopes?.length ||
          (cloudData as DataCollection)?.transactions?.length ||
          (cloudData as DataCollection)?.bills?.length ||
          (cloudData as DataCollection)?.paycheckHistory?.length ||
          (cloudData as DataCollection)?.debts?.length ||
          // Legacy: check for old savingsGoals array
          (cloudData as DataCollection)?.savingsGoals?.length
        ),
      });

      let result;
      if (syncDecision.direction === "fromFirestore") {
        // Download from Firebase to Dexie
        const cloudResult = await chunkedSyncService.loadFromCloud();
        if (cloudResult) {
          // Save the loaded data to Dexie
          await this.saveToDexie(cloudResult as DexieData);

          // Invalidate TanStack Query cache to refresh UI immediately
          try {
            const { queryClient } = await import("../utils/common/queryClient");
            await queryClient.invalidateQueries();
            logger.info("✅ TanStack Query cache invalidated after cloud data sync");
          } catch (error) {
            logger.warn(
              "Failed to invalidate query cache after sync",
              error as Record<string, unknown>
            );
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
        // saveToCloud returns boolean directly (true/false), not an object
        const saveSuccess = await chunkedSyncService.saveToCloud(
          localData,
          this.config.currentUser as CloudSyncConfig["currentUser"]
        );
        result = { success: saveSuccess, direction: "toFirestore" };
      }

      if (result.success) {
        logger.production("Sync completed successfully", {
          direction: syncDecision.direction,
          recordsProcessed: (result as SyncResult)?.recordsProcessed || 0,
        });
        await this.updateLastSyncTime();
        await this.updateUserActivity();

        // GitHub Issue #576: Record successful sync
        syncHealthMonitor.recordSyncSuccess(syncId, {
          direction: syncDecision.direction,
        });
      } else {
        logger.error("❌ Chunked sync failed:", result.error);

        // GitHub Issue #576 Phase 3: Enhanced error detection and categorization
        const errorCategory = this.categorizeError(result.error || "");
        syncHealthMonitor.recordSyncFailure(syncId, new Error(result.error || "Unknown error"), {
          backupId,
          stage: "sync_execution",
          errorCategory,
        });
      }
      return result;
    } catch (error) {
      logger.error("❌ An unexpected error occurred during sync:", error);

      // GitHub Issue #576 Phase 3: Enhanced error detection and categorization
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCategory = this.categorizeError(errorMessage);
      syncHealthMonitor.recordSyncFailure(
        syncId,
        error instanceof Error ? error : new Error(errorMessage),
        {
          backupId,
          stage: "unknown",
          errorCategory,
        }
      );

      return { success: false, error: errorMessage };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * GitHub Issue #576 Phase 3: Categorize error for enhanced error detection
   * @param {string} errorMessage - The error message to categorize
   * @returns {string} - Error category
   */
  categorizeError(errorMessage: string) {
    if (!errorMessage || typeof errorMessage !== "string") {
      return "unknown";
    }

    const message = errorMessage.toLowerCase();

    // Network-related errors
    if (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("connection") ||
      message.includes("fetch") ||
      message.includes("cors") ||
      message.includes("blocked")
    ) {
      return "network";
    }

    // Encryption/decryption errors
    if (
      message.includes("decrypt") ||
      message.includes("encrypt") ||
      message.includes("data is too small") ||
      message.includes("cipher") ||
      message.includes("key derivation") ||
      message.includes("invalid key")
    ) {
      return "encryption";
    }

    // Firebase-specific errors
    if (
      message.includes("firebase") ||
      message.includes("firestore") ||
      message.includes("permission") ||
      message.includes("quota") ||
      message.includes("rate limit")
    ) {
      return "firebase";
    }

    // Data validation errors
    if (
      message.includes("validation") ||
      message.includes("invalid data") ||
      message.includes("checksum") ||
      message.includes("corrupt") ||
      message.includes("malformed")
    ) {
      return "validation";
    }

    // Storage/database errors
    if (
      message.includes("storage") ||
      message.includes("database") ||
      message.includes("indexeddb") ||
      message.includes("dexie") ||
      message.includes("transaction")
    ) {
      return "storage";
    }

    // Authentication errors
    if (
      message.includes("auth") ||
      message.includes("unauthorized") ||
      message.includes("token") ||
      message.includes("login") ||
      message.includes("credential")
    ) {
      return "authentication";
    }

    return "unknown";
  }

  async updateUserActivity() {
    if (!this.config || !this.config.currentUser) return;

    try {
      const activityData = {
        lastActive: new Date().toISOString(),
        userName: this.config.currentUser?.userName,
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

  async fetchDexieData(): Promise<DexieData> {
    try {
      // v2.0: Fetch all data - savings goals and supplemental accounts are now stored as envelopes
      const [envelopes, transactions, bills, debts, paycheckHistory, metadata]: [
        Envelope[],
        Transaction[],
        Bill[],
        Debt[],
        PaycheckHistory[],
        BudgetRecord | undefined,
      ] = await Promise.all([
        budgetDb.envelopes.toArray(),
        budgetDb.transactions.toArray(),
        budgetDb.bills.toArray(),
        budgetDb.debts.toArray(),
        budgetDb.paycheckHistory.toArray(),
        budgetDb.budget.get("metadata"),
      ]);

      // v2.0: Log envelope type distribution for debugging
      const savingsEnvelopes = envelopes.filter((e) => e.envelopeType === ENVELOPE_TYPES.SAVINGS);
      const supplementalEnvelopes = envelopes.filter(
        (e) => e.envelopeType === ENVELOPE_TYPES.SUPPLEMENTAL
      );

      logger.debug("📊 Fetched Dexie data (v2.0 envelope model)", {
        totalEnvelopes: envelopes.length,
        savingsEnvelopes: savingsEnvelopes.length,
        supplementalEnvelopes: supplementalEnvelopes.length,
        transactions: transactions.length,
        bills: bills.length,
        debts: debts.length,
        paycheckHistory: paycheckHistory.length,
      });

      return {
        envelopes,
        transactions,
        bills,
        debts,
        paycheckHistory,
        unassignedCash: extractNumericValue(metadata, "unassignedCash"),
        actualBalance: extractNumericValue(metadata, "actualBalance"),
        lastModified: Date.now(),
        syncVersion: "2.0",
      };
    } catch (error) {
      logger.error("Failed to fetch data from Dexie:", error);
      throw error;
    }
  }

  async saveToDexie(data: DexieData) {
    try {
      logger.debug("💾 Saving cloud data to Dexie (v2.0 envelope model)...");

      // v2.0: Log envelope type distribution for debugging
      const savingsEnvelopes = data.envelopes.filter(
        (e) => e.envelopeType === ENVELOPE_TYPES.SAVINGS
      );
      const supplementalEnvelopes = data.envelopes.filter(
        (e) => e.envelopeType === ENVELOPE_TYPES.SUPPLEMENTAL
      );

      logger.debug("📊 Saving envelope types:", {
        totalEnvelopes: data.envelopes.length,
        savingsEnvelopes: savingsEnvelopes.length,
        supplementalEnvelopes: supplementalEnvelopes.length,
      });

      // Clear existing data and save new data in a transaction
      // v2.0: savingsGoals table is deprecated - data now stored in envelopes with envelopeType
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
          // v2.0: Clear legacy savingsGoals table (data is now in envelopes)
          // This is safe because:
          // 1. saveToDexie is only called when downloading from cloud (after migration)
          // 2. Migration service runs before sync, converting savingsGoals to envelopes
          // 3. Cloud data already contains migrated savings envelopes
          await budgetDb.savingsGoals.clear();
          await budgetDb.debts.clear();
          await budgetDb.paycheckHistory.clear();

          // Save new data
          if (data.envelopes.length) {
            await budgetDb.envelopes.bulkAdd(data.envelopes);
          }
          if (data.bills.length) {
            await budgetDb.bills.bulkAdd(data.bills);
          }
          if (data.transactions.length) {
            await budgetDb.transactions.bulkAdd(data.transactions);
          }
          if (data.debts.length) {
            await budgetDb.debts.bulkAdd(data.debts);
          }
          if (data.paycheckHistory.length) {
            await budgetDb.paycheckHistory.bulkAdd(data.paycheckHistory);
          }

          // Save metadata
          // v2.0: supplementalAccounts no longer stored separately - now in envelopes
          await budgetDb.budget.put({
            id: "metadata",
            unassignedCash: data.unassignedCash || 0,
            actualBalance: data.actualBalance || 0,
            lastUpdated: new Date().toISOString(),
            lastModified: Date.now(),
            syncVersion: data.syncVersion || "2.0",
          } as BudgetRecord);
        }
      );

      logger.info("✅ Cloud data saved to Dexie successfully (v2.0 envelope model)");
    } catch (error) {
      logger.error("Failed to save cloud data to Dexie:", error);
      throw error;
    }
  }

  determineSyncDirection(localData: DexieData, cloudData: DataCollection) {
    // v2.0: Check if cloud has meaningful data vs local
    // Savings goals and supplemental accounts are now stored as envelopes with envelopeType
    // Legacy savingsGoals and supplementalAccounts arrays are still counted for backward compatibility
    const hasCloudData = !!(
      cloudData?.envelopes?.length ||
      cloudData?.transactions?.length ||
      cloudData?.bills?.length ||
      cloudData?.paycheckHistory?.length ||
      cloudData?.debts?.length ||
      // Legacy support: count savingsGoals if present in older cloud data
      cloudData?.savingsGoals?.length
    );
    const hasLocalData = !!(
      localData?.envelopes?.length ||
      localData?.transactions?.length ||
      localData?.bills?.length ||
      localData?.paycheckHistory?.length ||
      localData?.debts?.length
    );

    // v2.0: Calculate item counts for comparison
    // Note: savingsGoals and supplementalAccounts are now counted as part of envelopes
    const cloudItemCount =
      (cloudData?.envelopes?.length || 0) +
      (cloudData?.transactions?.length || 0) +
      (cloudData?.bills?.length || 0) +
      (cloudData?.paycheckHistory?.length || 0) +
      (cloudData?.debts?.length || 0) +
      // Legacy support: count savingsGoals if present in older cloud data
      (cloudData?.savingsGoals?.length || 0);
    const localItemCount =
      (localData?.envelopes?.length || 0) +
      (localData?.transactions?.length || 0) +
      (localData?.bills?.length || 0) +
      (localData?.paycheckHistory?.length || 0) +
      (localData?.debts?.length || 0);

    logger.info("🔄 Sync direction analysis (v2.0):", {
      hasCloudData,
      hasLocalData,
      cloudItemCount,
      localItemCount,
      cloudLastModified: cloudData?.lastModified,
      localLastModified: localData?.lastModified,
      cloudSyncVersion: cloudData?.syncVersion || "1.x",
      localSyncVersion: localData?.syncVersion || "2.0",
    });

    // If cloud has data but local doesn't, download from cloud
    if (hasCloudData && !hasLocalData) {
      return { direction: "fromFirestore" };
    }

    // If local has data but cloud doesn't, upload to cloud
    if (hasLocalData && !hasCloudData) {
      return { direction: "toFirestore" };
    }

    // If neither has data, check for shared budget scenario
    if (!hasCloudData && !hasLocalData) {
      // For shared budget users, prefer download to avoid destroying shared data
      // Even if cloud appears empty, there might be a timing issue or Firebase rules blocking access
      const isSharedBudgetUser = this.isSharedBudgetUser();
      if (isSharedBudgetUser) {
        logger.info(
          "🔄 Shared budget user with empty data - preferring download to prevent data loss"
        );
        return { direction: "fromFirestore" };
      }
      return { direction: "toFirestore" }; // Default to upload empty state for new budgets
    }

    // Both have data - use timestamps to determine direction
    if (!cloudData || !cloudData.lastModified) {
      return { direction: "toFirestore" }; // No cloud timestamp, upload local
    }

    if (!localData || !localData.lastModified) {
      return { direction: "fromFirestore" }; // No local timestamp, download cloud
    }

    // Special case: Shared budget users should prefer download if cloud has significantly more data
    // This prevents overwriting shared data after re-login when local state is just the initial empty state
    const isSharedBudgetUser = this.isSharedBudgetUser();
    if (isSharedBudgetUser && cloudItemCount > localItemCount) {
      logger.info(
        "🔄 Shared budget user: Cloud has more data - preferring download to preserve shared state",
        {
          cloudItems: cloudItemCount,
          localItems: localItemCount,
        }
      );
      return { direction: "fromFirestore" };
    }

    if (localData.lastModified > cloudData.lastModified) {
      return { direction: "toFirestore" }; // Local is newer
    } else if (cloudData.lastModified > localData.lastModified) {
      return { direction: "fromFirestore" }; // Cloud is newer
    } else {
      return { direction: "bidirectional" }; // Same timestamp, need full sync
    }
  }

  /**
   * Check if current user is a shared budget user
   * @returns {boolean} True if user joined via share code
   */
  isSharedBudgetUser() {
    const currentUser = this.config?.currentUser;
    logger.debug("🔍 [SYNC] Checking if shared budget user", {
      hasConfig: !!this.config,
      hasCurrentUser: !!currentUser,
      joinedVia: currentUser?.joinedVia,
      sharedBy: currentUser?.sharedBy,
      userKeys: currentUser ? Object.keys(currentUser) : [],
    });

    // Check multiple ways a shared budget user might be identified
    const isSharedViaJoinedVia = currentUser?.joinedVia === "shareCode";
    const isSharedViaSharedBy = !!currentUser?.sharedBy;
    const isSharedUser = isSharedViaJoinedVia || isSharedViaSharedBy;

    logger.info(`🔄 Shared budget user detection: ${isSharedUser}`, {
      joinedVia: currentUser?.joinedVia,
      sharedBy: currentUser?.sharedBy,
      isSharedViaJoinedVia,
      isSharedViaSharedBy,
    });

    return isSharedUser;
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

  async forcePushToCloud(overrideConfig: SyncConfig | null = null) {
    // Force push local data to Firebase without pulling from Firebase first
    // This is used after backup imports to ensure imported data overwrites cloud data
    // overrideConfig allows passing auth data when service config is null (e.g., during import)
    if (this.isSyncing) {
      logger.warn("🟡 Sync in progress, skipping force push");
      return { success: false, error: "Sync already in progress" };
    }

    this.isSyncing = true;

    try {
      logger.info("🚀 Force pushing local data to Firebase...");

      // Use override config if provided (during import after service stop), otherwise use this.config
      const config = overrideConfig || this.config;

      // Guard against undefined config during import
      if (!config?.budgetId || !config?.encryptionKey) {
        throw new Error(
          "Cannot force push: missing budgetId or encryptionKey. Config may not be initialized."
        );
      }

      // Get local data from Dexie
      const localData = await this.fetchDexieData();

      // Initialize chunked Firebase sync if not already done
      await chunkedSyncService.initialize(
        config.budgetId as string,
        config.encryptionKey as string
      );

      // Use chunked Firebase sync to save data (one-way)
      // saveToCloud returns boolean directly (true/false), not an object
      const success = await chunkedSyncService.saveToCloud(
        localData,
        config.currentUser as { uid: string; userName: string }
      );

      if (success) {
        logger.info("✅ Force push to Firebase completed successfully");
        return { success: true };
      } else {
        throw new Error("Failed to push data to Firebase");
      }
    } catch (error) {
      logger.error("❌ Force push to Firebase failed:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, error: errorMessage };
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
        // If config has a clearAllData method, use it
        await this.config.clearAllData();
        logger.info("Cloud data cleared using config method");
      } else if (chunkedSyncService && typeof chunkedSyncService.clearAllData === "function") {
        // If chunkedSyncService has a clearAllData method, use it
        await chunkedSyncService.clearAllData();
        logger.info("Cloud data cleared using chunkedSyncService");
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
  (window as unknown as CloudSyncWindow).cloudSyncService = cloudSyncService;
}
