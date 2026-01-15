import logger from "@/utils/core/common/logger";

/**
 * Background Sync Utility
 * Handles queuing and syncing of offline operations
 * Enhanced for Issue #1372: Verify and Enhance Offline Handling
 * - Exponential backoff retry logic
 * - Better error recovery
 * - Conflict resolution support
 */

interface SyncOperation {
  id?: string;
  type: string;
  method: string;
  url: string;
  data?: Record<string, unknown>;
  headers?: Record<string, string>;
  timestamp?: number;
  retryCount?: number;
  maxRetries?: number;
  lastError?: string;
  nextRetryTime?: number;
  conflictResolution?: "local" | "remote" | "merge";
}

class BackgroundSyncManager {
  syncQueue: string;
  isOnline: boolean;
  pendingOperations: SyncOperation[];

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
  async queueOperation(operation: SyncOperation): Promise<string> {
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
   * Calculate exponential backoff delay for retries
   * Enhanced for Issue #1372
   */
  private calculateRetryDelay(retryCount: number, baseDelay = 1000): number {
    // Exponential backoff: baseDelay * 2^retryCount, capped at 30 seconds
    const delay = baseDelay * Math.pow(2, retryCount);
    return Math.min(delay, 30000);
  }

  /**
   * Check if operation should be retried now
   * Enhanced for Issue #1372
   */
  private shouldRetryNow(operation: SyncOperation): boolean {
    if (!operation.nextRetryTime) {
      return true;
    }
    return Date.now() >= operation.nextRetryTime;
  }

  /**
   * Determine if error is retryable
   * Enhanced for Issue #1372
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      // Network errors are retryable
      if (error.message.includes("fetch") || error.message.includes("network")) {
        return true;
      }
      // HTTP 5xx errors are retryable
      if (error.message.includes("HTTP 5")) {
        return true;
      }
      // HTTP 429 (rate limit) is retryable
      if (error.message.includes("HTTP 429")) {
        return true;
      }
      // HTTP 408 (timeout) is retryable
      if (error.message.includes("HTTP 408")) {
        return true;
      }
    }
    return false;
  }

  /**
   * Sync all pending operations
   * Enhanced with exponential backoff and better error handling (Issue #1372)
   */
  // eslint-disable-next-line max-statements -- Complex sync logic with retry handling requires multiple statements
  async syncPendingOperations() {
    if (!this.isOnline || this.pendingOperations.length === 0) {
      return;
    }

    logger.info("🔄 Background Sync: Starting sync", {
      operationCount: this.pendingOperations.length,
    });

    // Filter operations that are ready to retry
    const operationsToSync = this.pendingOperations.filter((op) => this.shouldRetryNow(op));

    if (operationsToSync.length === 0) {
      logger.info("⏳ Background Sync: No operations ready to sync yet");
      return;
    }

    const successfulOperations: SyncOperation[] = [];
    const failedOperations: SyncOperation[] = [];

    for (const operation of operationsToSync) {
      try {
        await this.executeOperation(operation);
        successfulOperations.push(operation);
        logger.info("✅ Background Sync: Operation successful", {
          operationType: operation.type,
          operationId: operation.id,
        });
      } catch (error) {
        const currentRetryCount = operation.retryCount ?? 0;
        operation.retryCount = currentRetryCount + 1;
        operation.lastError = error instanceof Error ? error.message : String(error);

        const maxRetries = operation.maxRetries ?? 3;
        const isRetryable = this.isRetryableError(error);

        if (operation.retryCount >= maxRetries || !isRetryable) {
          logger.error("❌ Background Sync: Operation failed permanently", error, {
            operationType: operation.type,
            operationId: operation.id,
            retryCount: operation.retryCount,
            isRetryable,
          });
          failedOperations.push(operation);
        } else {
          // Calculate next retry time with exponential backoff
          const retryDelay = this.calculateRetryDelay(operation.retryCount);
          operation.nextRetryTime = Date.now() + retryDelay;

          logger.warn("⚠️ Background Sync: Operation failed, will retry", {
            operationType: operation.type,
            operationId: operation.id,
            retryCount: operation.retryCount,
            maxRetries: operation.maxRetries,
            nextRetryTime: new Date(operation.nextRetryTime).toISOString(),
            retryDelayMs: retryDelay,
            error: error instanceof Error ? error.message : String(error),
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
   * Enhanced with timeout and better error handling (Issue #1372)
   */
  async executeOperation(operation: SyncOperation): Promise<unknown> {
    const { method, url, data, headers } = operation;

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle conflict errors (409)
        if (response.status === 409) {
          throw new Error(
            `HTTP ${response.status}: Conflict detected. Use conflictResolution strategy.`
          );
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout after 30 seconds");
      }
      throw error;
    }
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
   * Enhanced for Issue #1372
   */
  getSyncStatus() {
    const now = Date.now();
    const readyToSync = this.pendingOperations.filter((op) => this.shouldRetryNow(op)).length;
    const waitingForRetry = this.pendingOperations.length - readyToSync;

    return {
      isOnline: this.isOnline,
      pendingCount: this.pendingOperations.length,
      readyToSync,
      waitingForRetry,
      pendingOperations: this.pendingOperations.map((op) => ({
        id: op.id,
        type: op.type,
        timestamp: op.timestamp,
        retryCount: op.retryCount,
        maxRetries: op.maxRetries,
        lastError: op.lastError,
        nextRetryTime: op.nextRetryTime,
        timeUntilRetry: op.nextRetryTime ? Math.max(0, op.nextRetryTime - now) : 0,
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
