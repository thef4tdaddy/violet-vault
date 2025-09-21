// Sync Service Initializer - Lazy loads Firebase sync services when needed

import logger from "../utils/common/logger";

class SyncServiceInitializer {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize sync services when first needed
   * This lazy loads Firebase and all sync-related services
   */
  async initialize() {
    if (this.initialized) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeSyncServices();
    return this.initPromise;
  }

  async _initializeSyncServices() {
    try {
      logger.info("🔄 Lazy loading Firebase sync services...");

      // Load Firebase sync services dynamically
      const [
        { default: chunkedSyncService },
        { default: firebaseSyncService },
      ] = await Promise.all([
        import("./chunkedSyncService.js"),
        import("./firebaseSyncService.js"),
      ]);

      // Store references for access
      this.chunkedSyncService = chunkedSyncService;
      this.firebaseSyncService = firebaseSyncService;

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
  async getChunkedSyncService() {
    await this.initialize();
    return this.chunkedSyncService;
  }

  /**
   * Get Firebase sync service (loads if needed)
   */
  async getFirebaseSyncService() {
    await this.initialize();
    return this.firebaseSyncService;
  }

  /**
   * Check if sync services are initialized
   */
  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
export default new SyncServiceInitializer();
