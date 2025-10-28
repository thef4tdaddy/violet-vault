import logger from "../common/logger";

/**
 * Background Sync Utility
 * Handles queuing and syncing of offline operations
 */

class BackgroundSyncManager {
  syncQueue: string;
  isOnline: boolean;
  pendingOperations: Array<Record<string, unknown>>;

  constructor() {
    this.syncQueue = "violet-vault-sync-queue";
    this.isOnline = navigator.onLine;
    this.pendingOperations = [];

    // Listen for online/offline events
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));

    // Initialize from stored operations
    this.loadPendingOperations();
  }

  /**
   * Queue an operation for background sync
   * @param {Object} operation - The operation to queue
   * @param {string} operation.type - Operation type (transaction, budget, etc.)
   * @param {string} operation.method - HTTP method (POST, PUT, DELETE)
   * @param {string} operation.url - API endpoint
   * @param {Object} operation.data - Request payload
   * @param {Object} operation.headers - Request headers
   */
  async queueOperation(operation) {
    const queuedOperation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      ...operation,
    };

    this.pendingOperations.push(queuedOperation);
    await this.savePendingOperations();

    logger.info("📤 Background Sync: Operation queued", {
      operationType: operation.type,
      operationId: queuedOperation.id,
      isOnline: this.isOnline,
    });

    // If online, try to sync immediately
    if (this.isOnline) {
      await this.syncPendingOperations();
    }

    return queuedOperation.id;
  }

  /**
   * Sync all pending operations
   */
  async syncPendingOperations() {
    if (!this.isOnline || this.pendingOperations.length === 0) {
      return;
    }

    logger.info("🔄 Background Sync: Starting sync", {
      operationCount: this.pendingOperations.length,
    });

    const operationsToSync = [...this.pendingOperations];
    const successfulOperations = [];
    const failedOperations = [];

    for (const operation of operationsToSync) {
      try {
        await this.executeOperation(operation);
        successfulOperations.push(operation);
        logger.info("✅ Background Sync: Operation successful", {
          operationType: operation.type,
          operationId: operation.id,
        });
      } catch (error) {
        operation.retryCount = ((operation.retryCount as number | undefined) || 0) + 1;
        operation.lastError = (error as Error).message;

        if (operation.retryCount >= operation.maxRetries) {
          logger.error("❌ Background Sync: Operation failed permanently", error, {
            operationType: operation.type,
            operationId: operation.id,
            retryCount: operation.retryCount,
          });
          failedOperations.push(operation);
        } else {
          logger.warn("⚠️ Background Sync: Operation failed, will retry", {
            operationType: operation.type,
            operationId: operation.id,
            retryCount: operation.retryCount,
            maxRetries: operation.maxRetries,
            error: error.message,
          });
        }
      }
    }

    // Remove successful operations from queue
    this.pendingOperations = this.pendingOperations.filter(
      (op) => !successfulOperations.some((success) => success.id === op.id)
    );

    // Remove permanently failed operations
    this.pendingOperations = this.pendingOperations.filter(
      (op) => !failedOperations.some((failed) => failed.id === op.id)
    );

    await this.savePendingOperations();

    logger.info("🔄 Background Sync: Sync completed", {
      successful: successfulOperations.length,
      failed: failedOperations.length,
      remaining: this.pendingOperations.length,
    });
  }

  /**
   * Execute a queued operation
   */
  async executeOperation(operation) {
    const { method, url, data, headers } = operation;

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Handle online event
   */
  async handleOnline() {
    this.isOnline = true;
    logger.info("🌐 Background Sync: Device came online", {
      pendingOperations: this.pendingOperations.length,
    });

    // Wait a moment for connections to stabilize
    setTimeout(() => {
      this.syncPendingOperations();
    }, 1000);
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    logger.info("📱 Background Sync: Device went offline", {
      pendingOperations: this.pendingOperations.length,
    });
  }

  /**
   * Save pending operations to localStorage
   */
  async savePendingOperations() {
    try {
      localStorage.setItem(this.syncQueue, JSON.stringify(this.pendingOperations));
    } catch (error) {
      logger.error("❌ Background Sync: Failed to save pending operations", error);
    }
  }

  /**
   * Load pending operations from localStorage
   */
  loadPendingOperations() {
    try {
      const stored = localStorage.getItem(this.syncQueue);
      if (stored) {
        this.pendingOperations = JSON.parse(stored);
        logger.info("📥 Background Sync: Loaded pending operations", {
          operationCount: this.pendingOperations.length,
        });
      }
    } catch (error) {
      logger.error("❌ Background Sync: Failed to load pending operations", error);
      this.pendingOperations = [];
    }
  }

  /**
   * Get sync status for debugging/UI
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingCount: this.pendingOperations.length,
      pendingOperations: this.pendingOperations.map((op) => ({
        id: op.id,
        type: op.type,
        timestamp: op.timestamp,
        retryCount: op.retryCount,
        lastError: op.lastError,
      })),
    };
  }

  /**
   * Clear all pending operations (for debugging)
   */
  clearPendingOperations() {
    this.pendingOperations = [];
    this.savePendingOperations();
    logger.info("🧹 Background Sync: Cleared all pending operations");
  }
}

// Create singleton instance
const backgroundSyncManager = new BackgroundSyncManager();

// Expose to window for debugging
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).backgroundSyncManager = backgroundSyncManager;
}

export default backgroundSyncManager;
