// Sync Service Initializer - Lazy loads Firebase sync services when needed

import logger from "../utils/common/logger";

interface ChunkedSyncService {
  start: (config: unknown) => Promise<void>;
  stop: () => Promise<void>;
  isRunning: boolean;
  [key: string]: unknown;
}

interface FirebaseSyncService {
  start: (config: unknown) => Promise<void>;
  stop: () => Promise<void>;
  isRunning: boolean;
  [key: string]: unknown;
}

class SyncServiceInitializer {
  private initialized: boolean;
  private initPromise: Promise<boolean> | null;
  private chunkedSyncService: ChunkedSyncService | null;
  private firebaseSyncService: FirebaseSyncService | null;

  constructor() {
    this.initialized = false;
    this.initPromise = null;
    this.chunkedSyncService = null;
    this.firebaseSyncService = null;
  }

  /**
   * Initialize sync services when first needed
   * This lazy loads Firebase and all sync-related services
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeSyncServices();
    return this.initPromise;
  }

  private async _initializeSyncServices(): Promise<boolean> {
    try {
      logger.info("🔄 Lazy loading Firebase sync services...");

      // Load Firebase sync services dynamically
      const [{ default: chunkedSyncService }, { default: firebaseSyncService }] = await Promise.all(
        [import("./chunkedSyncService.js"), import("./firebaseSyncService.js")]
      );

      // Store references for access - cast as unknown first since these are class instances
      this.chunkedSyncService = chunkedSyncService as unknown as ChunkedSyncService;
      this.firebaseSyncService = firebaseSyncService as unknown as FirebaseSyncService;

      logger.info("✅ Firebase sync services loaded successfully");
      this.initialized = true;

      return true;
    } catch (error) {
      logger.error("❌ Firebase sync services loading failed:", error);
      this.initPromise = null; // Reset to allow retry
      throw error;
    }
  }

  /**
   * Get chunked sync service (loads if needed)
   */
  async getChunkedSyncService(): Promise<ChunkedSyncService | null> {
    await this.initialize();
    return this.chunkedSyncService;
  }

  /**
   * Get Firebase sync service (loads if needed)
   */
  async getFirebaseSyncService(): Promise<FirebaseSyncService | null> {
    await this.initialize();
    return this.firebaseSyncService;
  }

  /**
   * Check if sync services are initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export default new SyncServiceInitializer();
