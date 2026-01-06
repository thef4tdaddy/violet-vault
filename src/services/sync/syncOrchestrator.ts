import { encryptionManager } from "../security/encryptionManager";
import logger from "@/utils/common/logger";
import { syncHealthMonitor } from "@/utils/sync/syncHealthMonitor";
import { autoBackupService } from "@/utils/sync/autoBackupService";
import { websocketSignalingService } from "./websocketSignalingService";
import type { SafeUnknown, TypedResponse } from "@/types/firebase";
import type { WebSocketSignalMessage } from "@/types/sync";

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

    this.isRunning = true;
    logger.production("SyncOrchestrator: Started", {
      budgetId: this.budgetId.substring(0, 8),
      provider: this.provider.name,
    });

    // Setup WebSocket signaling for real-time sync notifications
    this.setupWebSocketSignaling();

    // Initial sync
    this.scheduleSync("high");
  }

  /**
   * Stop the sync service
   */
  public stop(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    
    // Cleanup WebSocket signaling
    if (this.wsUnsubscribe) {
      this.wsUnsubscribe();
      this.wsUnsubscribe = null;
    }
    websocketSignalingService.disconnect();

    this.isRunning = false;
    this.isSyncInProgress = false;
    this.provider = null;
    this.budgetId = null;
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
        
        // Send WebSocket signal to notify other clients (SIGNALING ONLY - NO DATA)
        websocketSignalingService.sendSignal("data_changed", {
          version: "2.0",
        });
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

  /**
   * Setup WebSocket signaling for real-time sync notifications
   * PRIVACY: Only signals are transmitted, no data
   */
  private setupWebSocketSignaling(): void {
    if (!this.budgetId) {
      return;
    }

    // Check if WebSocket is enabled
    const wsEnabled = import.meta.env.VITE_WEBSOCKET_ENABLED === "true";
    if (!wsEnabled) {
      logger.debug("WebSocket signaling is disabled");
      return;
    }

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
    if (!wsUrl) {
      logger.debug("VITE_WEBSOCKET_URL not configured");
      return;
    }

    // Connect to WebSocket signaling service
    websocketSignalingService.connect({
      url: wsUrl,
      budgetId: this.budgetId,
    });

    // Listen for sync signals from other clients
    this.wsUnsubscribe = websocketSignalingService.onSignal((signal: WebSocketSignalMessage) => {
      logger.debug("WebSocket signal received", { type: signal.type });

      // Handle sync-related signals
      if (signal.type === "data_changed" || signal.type === "sync_required") {
        // Trigger a sync when another client has made changes
        // This ensures all clients stay in sync without transmitting data via WebSocket
        logger.info("Remote data change detected, scheduling sync");
        this.scheduleSync("high");
      }
    });

    logger.info("WebSocket signaling setup complete", { budgetId: this.budgetId.substring(0, 8) });
  }
}

export const syncOrchestrator = SyncOrchestrator.getInstance();
