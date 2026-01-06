import { encryptionManager } from "../security/encryptionManager";
import logger from "@/utils/common/logger";
import { syncHealthMonitor } from "@/utils/sync/syncHealthMonitor";
import { autoBackupService } from "@/utils/sync/autoBackupService";
import { offlineRequestQueueService } from "./offlineRequestQueueService";
import type { SafeUnknown, TypedResponse } from "@/types/firebase";

/**
 * Snapshot of local Dexie data for sync.
 */
export interface DexieData extends Record<string, unknown> {
  envelopes: unknown[];
  transactions: unknown[];
  bills: unknown[];
  debts: unknown[];
  paycheckHistory: unknown[];
  unassignedCash: number;
  actualBalance: number;
  lastModified: number;
  syncVersion: string;
}

/**
 * Sync Provider Interface
 * Defines the protocol for backend synchronization.
 */
export interface SyncProvider {
  name: string;
  initialize(budgetId: string, key: CryptoKey): Promise<void>;
  save<T extends SafeUnknown>(
    data: T,
    metadata?: Record<string, unknown>
  ): Promise<TypedResponse<boolean>>;
  load<T extends SafeUnknown>(): Promise<TypedResponse<T | null>>;
  ensureAuthenticated?(): Promise<boolean>;
}

/**
 * SyncOrchestrator Service
 * Handles high-level sync orchestration, scheduling, and health monitoring.
 * Delegates actual transport to a SyncProvider.
 */
export class SyncOrchestrator {
  private static instance: SyncOrchestrator;
  private provider: SyncProvider | null = null;
  private budgetId: string | null = null;
  public isRunning: boolean = false;
  public isSyncInProgress: boolean = false;
  private syncQueue: Promise<void> = Promise.resolve();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  private constructor() {}

  public static getInstance(): SyncOrchestrator {
    if (!SyncOrchestrator.instance) {
      SyncOrchestrator.instance = new SyncOrchestrator();
    }
    return SyncOrchestrator.instance;
  }

  /**
   * Initialize and start the sync service
   */
  public async start(config: {
    budgetId: string;
    encryptionKey: string | CryptoKey;
    provider: SyncProvider;
  }): Promise<void> {
    if (this.isRunning) return;

    this.budgetId = config.budgetId;
    this.provider = config.provider;

    // Resolve key if it's a password string
    let key: CryptoKey;
    if (typeof config.encryptionKey === "string") {
      const derived = await encryptionManager.deriveKey(config.encryptionKey);
      key = derived.key;
    } else {
      key = config.encryptionKey;
    }

    // Initialize EncryptionManager
    encryptionManager.setKey(key);

    // Initialize Provider
    await this.provider.initialize(this.budgetId, key);

    // Initialize offline request queue
    await offlineRequestQueueService.initialize();

    this.isRunning = true;
    logger.production("SyncOrchestrator: Started", {
      budgetId: this.budgetId.substring(0, 8),
      provider: this.provider.name,
    });

    // Initial sync
    this.scheduleSync("high");
  }

  /**
   * Stop the sync service
   */
  public stop(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.isRunning = false;
    this.isSyncInProgress = false;
    this.provider = null;
    this.budgetId = null;

    // Stop offline queue processing
    offlineRequestQueueService.stopProcessingInterval();

    logger.production("SyncOrchestrator: Stopped");
  }

  /**
   * Schedule a sync operation with debouncing
   */
  public scheduleSync(priority: "normal" | "high" = "normal"): void {
    if (!this.isRunning) return;

    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    const delay = priority === "high" ? 1000 : 10000;
    this.debounceTimer = setTimeout(() => {
      this.syncQueue = this.syncQueue.then(async () => {
        await this.forceSync();
      });
    }, delay);
  }

  /**
   * Force an immediate sync
   */
  public async forceSync(): Promise<TypedResponse<boolean>> {
    if (!this.isRunning || !this.provider) {
      return {
        success: false,
        timestamp: Date.now(),
        error: {
          code: "NOT_RUNNING",
          message: "Sync not running",
          category: "unknown",
          timestamp: Date.now(),
        },
      };
    }

    if (this.isSyncInProgress) {
      logger.debug("SyncOrchestrator: Sync already in progress, skipping");
      return { success: false, timestamp: Date.now() };
    }

    this.isSyncInProgress = true;
    const syncId = syncHealthMonitor.recordSyncStart(this.provider.name);

    try {
      // 1. Pre-sync backup
      await autoBackupService.createPreSyncBackup("sync_orchestrator");

      // 2. Fetch local data from Dexie (via bridge or direct import - choosing bridge for now)
      const { budgetDb } = await import("@/db/budgetDb");
      const localData = await this.fetchLocalData(budgetDb);

      // 3. Perform Sync (Provider handles directionality/chunking logic internally for now)
      // v2.0 Improvement: Orchestrator should probably decide direction, but provider knows transport limits.
      // For now, we delegate the "how" to the provider.
      const result = await this.provider.save(localData);

      if (result.success) {
        syncHealthMonitor.recordSyncSuccess(syncId);
        logger.info("SyncOrchestrator: Sync successful");
      } else {
        syncHealthMonitor.recordSyncFailure(
          syncId,
          new Error(result.error?.message || "Sync failed")
        );
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      syncHealthMonitor.recordSyncFailure(
        syncId,
        error instanceof Error ? error : new Error(errorMessage)
      );
      logger.error("SyncOrchestrator: Unexpected error", { error: errorMessage });
      return {
        success: false,
        timestamp: Date.now(),
        error: {
          code: "UNEXPECTED",
          message: errorMessage,
          category: "unknown",
          timestamp: Date.now(),
        },
      };
    } finally {
      this.isSyncInProgress = false;
    }
  }

  /**
   * Fetch all relevant data from local Dexie database.
   * Publicly accessible for diagnostics and testing.
   */
  public async fetchLocalData(db: {
    envelopes: { toArray: () => Promise<unknown[]> };
    transactions: { toArray: () => Promise<unknown[]> };
    bills: { toArray: () => Promise<unknown[]> };
    debts: { toArray: () => Promise<unknown[]> };
    paycheckHistory: { toArray: () => Promise<unknown[]> };
    budget: { get: (key: string) => Promise<unknown> };
  }): Promise<DexieData> {
    const [envelopes, transactions, bills, debts, paycheckHistory, metadata] = await Promise.all([
      db.envelopes.toArray(),
      db.transactions.toArray(),
      db.bills.toArray(),
      db.debts.toArray(),
      db.paycheckHistory.toArray(),
      db.budget.get("metadata") as Promise<Record<string, unknown>>,
    ]);

    const meta = metadata as Record<string, unknown>;

    return {
      envelopes,
      transactions,
      bills,
      debts,
      paycheckHistory,
      unassignedCash: Number(meta?.unassignedCash || 0),
      actualBalance: Number(meta?.actualBalance || 0),
      lastModified: Date.now(),
      syncVersion: "2.0",
    };
  }
}

export const syncOrchestrator = SyncOrchestrator.getInstance();
