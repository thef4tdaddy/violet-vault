// Firebase Sync Adapter - Backwards compatible wrapper using service layer
import firebaseSyncService from "../../services/firebaseSyncService";
import chunkedSyncService from "../../services/chunkedSyncService";
import { encryptionUtils } from "../security/encryption";
import { H } from "../common/highlight.js";
import logger from "../common/logger";

/**
 * Firebase Sync Adapter
 * Provides backwards compatibility while delegating to the new service layer
 * This maintains the same API as the original FirebaseSync class
 */
class FirebaseSyncAdapter {
  constructor() {
    this.budgetId = null;
    this.encryptionKey = null;
    this.unsubscribe = null;
    this.lastSyncTimestamp = null;

    // Enhanced state management delegated to services
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.retryAttempts = 0;
    this.maxRetryAttempts = 3;
    this.retryDelay = 1000;
    this.activeUsers = new Map();
    this.syncListeners = new Set();
    this.errorListeners = new Set();

    // Activity tracking
    this.recentActivity = [];
    this.maxActivityItems = 50;

    // Setup network monitoring
    this.setupNetworkMonitoring();
  }

  /**
   * Initialize sync with budget ID and encryption key
   */
  async initialize(budgetId, encryptionKey) {
    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;
    this.retryAttempts = 0;
    this.syncQueue = [];

    // Initialize underlying services
    await firebaseSyncService.initialize(budgetId, encryptionKey);
    await chunkedSyncService.initialize(budgetId, encryptionKey);

    // Debug logging for sync issues
    if (this._isDevelopmentMode()) {
      logger.debug("FirebaseSync Debug Info", {
        budgetId,
        budgetIdLength: budgetId?.length,
        hasEncryptionKey: !!encryptionKey,
        timestamp: new Date().toISOString(),
        hostname: window.location.hostname,
      });
    }

    // Log initialization to Highlight.io
    H.track("firebase-sync-initialized", {
      component: "FirebaseSyncAdapter",
      operation: "initialize",
      budgetId,
      hasEncryptionKey: !!encryptionKey,
      queueLength: this.syncQueue.length,
    });
  }

  /**
   * Check if running in development mode
   */
  _isDevelopmentMode() {
    return (
      import.meta.env.MODE === "development" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("f4tdaddy.com")
    );
  }

  /**
   * Setup network monitoring
   */
  setupNetworkMonitoring() {
    window.addEventListener("online", () => {
      logger.info("Network connection restored");
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      logger.info("Network connection lost");
      this.isOnline = false;
    });
  }

  /**
   * Listener management
   */
  addSyncListener(callback) {
    this.syncListeners.add(callback);
    firebaseSyncService.addSyncListener(callback);
  }

  removeSyncListener(callback) {
    this.syncListeners.delete(callback);
    firebaseSyncService.removeSyncListener(callback);
  }

  addErrorListener(callback) {
    this.errorListeners.add(callback);
  }

  removeErrorListener(callback) {
    this.errorListeners.delete(callback);
  }

  notifySyncListeners(event) {
    this.syncListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        logger.error("Error in sync listener:", error);
      }
    });
  }

  notifyErrorListeners(error) {
    this.errorListeners.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        logger.error("Error in error listener:", err);
      }
    });
  }

  /**
   * Static methods for budget ID generation
   */
  static generateBudgetId(masterPassword) {
    return encryptionUtils.generateBudgetId(masterPassword);
  }

  /**
   * Encrypt data for cloud storage
   */
  async encryptForCloud(data) {
    const {
      envelopes,
      bills,
      savingsGoals,
      debts,
      unassignedCash,
      paycheckHistory,
      actualBalance,
      transactions,
      auditLog,
      lastActivity,
      budgetCommits,
      budgetChanges,
      budgetBranches,
      budgetTags,
    } = data;

    // Determine if we should use chunked sync for large datasets
    const totalSize = this._calculateDataSize(data);
    const useChunkedSync = totalSize > 500 * 1024; // 500KB threshold

    if (useChunkedSync) {
      logger.info("Using chunked sync for large dataset", { totalSize });
      return await this._prepareChunkedData(data);
    }

    // Use standard encryption for smaller datasets
    const encryptedPayload = await encryptionUtils.encrypt(
      {
        envelopes,
        bills,
        savingsGoals,
        debts,
        unassignedCash,
        paycheckHistory,
        actualBalance,
        transactions,
        auditLog,
        budgetCommits,
        budgetChanges,
        budgetBranches,
        budgetTags,
        activityData: lastActivity
          ? {
              userColor: lastActivity.userColor,
              timestamp: lastActivity.timestamp,
              deviceFingerprint: lastActivity.deviceFingerprint,
              deviceInfo: lastActivity.deviceInfo,
            }
          : null,
      },
      this.encryptionKey
    );

    // Ensure lastActivity has all required fields
    const validLastActivity = this._validateLastActivity(lastActivity);

    return {
      encryptedData: encryptedPayload.data,
      iv: encryptedPayload.iv,
      lastActivity: validLastActivity,
      version: 1,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Decrypt data from cloud storage
   */
  async decryptFromCloud(cloudData) {
    if (!cloudData || typeof cloudData !== "object") {
      logger.warn("Invalid cloud data format");
      return null;
    }

    // Check if this is chunked data
    if (cloudData._manifest) {
      logger.info("Detected chunked data format");
      return await chunkedSyncService.loadFromCloud();
    }

    if (!cloudData.encryptedData || !cloudData.iv) {
      logger.warn("No encrypted data found in cloud document");
      return null;
    }

    try {
      logger.debug("Attempting to decrypt cloud data");

      if (!this.encryptionKey) {
        throw new Error("No encryption key available");
      }

      // Validate data format
      if (!Array.isArray(cloudData.encryptedData) || !Array.isArray(cloudData.iv)) {
        logger.error("Invalid encrypted data format");
        throw new Error("Invalid encrypted data format");
      }

      const decryptedData = await encryptionUtils.decrypt(
        cloudData.encryptedData,
        this.encryptionKey,
        cloudData.iv
      );

      logger.debug("Successfully decrypted cloud data");

      if (!decryptedData || typeof decryptedData !== "object") {
        throw new Error("Decrypted data is invalid");
      }

      // Reconstruct full lastActivity
      if (cloudData.lastActivity && decryptedData.activityData) {
        decryptedData.lastActivity = {
          userName: cloudData.lastActivity.userName,
          ...decryptedData.activityData,
        };
        delete decryptedData.activityData;
      }

      return decryptedData;
    } catch (error) {
      logger.error("❌ Failed to decrypt cloud data:", error);

      H.consumeError(error, {
        metadata: {
          hasEncryptionKey: !!this.encryptionKey,
          errorName: error.name,
          errorMessage: error.message,
        },
      });

      if (error.name === "OperationError") {
        logger.error("🔑 Encryption key mismatch - data may be from different password");
        setTimeout(() => {
          this.clearCorruptedData().catch((clearError) => {
            logger.error("❌ Failed to auto-clear corrupted data:", clearError);
          });
        }, 1000);
      }

      throw error;
    }
  }

  /**
   * Save data to cloud using appropriate service
   */
  async saveToCloud(data, currentUser, options = {}) {
    if (!this.budgetId || !this.encryptionKey) {
      const error = new Error("SaveToCloud failed - not initialized");
      H.consumeError(error, {
        metadata: {
          hasBudgetId: !!this.budgetId,
          hasEncryptionKey: !!this.encryptionKey,
          userName: currentUser?.userName,
        },
        tags: {
          component: "FirebaseSyncAdapter",
          operation: "saveToCloud",
          issue: "not_initialized",
        },
      });
      throw error;
    }

    try {
      const totalSize = this._calculateDataSize(data);
      const useChunkedSync = totalSize > 500 * 1024; // 500KB threshold

      if (useChunkedSync) {
        logger.info("Using chunked sync service for save", { totalSize });
        return await chunkedSyncService.saveToCloud(data, currentUser);
      } else {
        logger.info("Using standard sync service for save", { totalSize });
        const encryptedData = await this.encryptForCloud(data);
        return await firebaseSyncService.saveToCloud(encryptedData, {
          userId: currentUser?.uid,
          userName: currentUser?.userName,
        });
      }
    } catch (error) {
      logger.error("❌ Failed to save to cloud:", error);
      this.notifyErrorListeners(error);
      throw error;
    }
  }

  /**
   * Load data from cloud using appropriate service
   */
  async loadFromCloud() {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("LoadFromCloud failed - not initialized");
    }

    try {
      // Try chunked sync first (it can detect if data is chunked)
      const chunkedData = await chunkedSyncService.loadFromCloud();
      if (chunkedData) {
        logger.info("Successfully loaded chunked data from cloud");
        return chunkedData;
      }

      // Fall back to standard sync
      const standardData = await firebaseSyncService.loadFromCloud();
      if (standardData) {
        const decryptedData = await this.decryptFromCloud(standardData);
        logger.info("Successfully loaded standard data from cloud");
        return decryptedData;
      }

      logger.info("No cloud data found");
      return null;
    } catch (error) {
      logger.error("❌ Failed to load from cloud:", error);
      this.notifyErrorListeners(error);
      throw error;
    }
  }

  /**
   * Setup real-time sync listener
   */
  setupRealTimeSync(callback) {
    if (!this.budgetId) {
      throw new Error("Sync not initialized");
    }

    firebaseSyncService.setupRealTimeSync(callback);
    logger.info("Real-time sync setup complete");
  }

  /**
   * Stop real-time sync
   */
  stopRealTimeSync() {
    firebaseSyncService.stopRealTimeSync();
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    logger.info("Real-time sync stopped");
  }

  /**
   * Process sync queue for offline operations
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    logger.info(`Processing ${this.syncQueue.length} queued operations`);

    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      try {
        await operation();
      } catch (error) {
        logger.error("Failed to process queued operation", error);
      }
    }
  }

  /**
   * Get sync status
   */
  getStatus() {
    return {
      isOnline: this.isOnline,
      isInitialized: !!(this.budgetId && this.encryptionKey),
      queuedOperations: this.syncQueue.length,
      lastSyncTimestamp: this.lastSyncTimestamp,
      activeUsers: this.activeUsers.size,
      firebaseService: firebaseSyncService.getStatus(),
      chunkedService: chunkedSyncService.getStats(),
    };
  }

  /**
   * Utility methods
   */
  _calculateDataSize(data) {
    try {
      return new Blob([JSON.stringify(data)]).size;
    } catch (error) {
      logger.warn("Failed to calculate data size", error);
      return 0;
    }
  }

  _validateLastActivity(lastActivity) {
    return lastActivity &&
      lastActivity.userName &&
      lastActivity.userName !== undefined &&
      lastActivity.userName !== null &&
      lastActivity.userName.trim() !== ""
      ? {
          userName: String(lastActivity.userName).trim(),
          timestamp: lastActivity.timestamp || Date.now(),
        }
      : null;
  }

  async _prepareChunkedData(data) {
    // This is handled internally by chunkedSyncService.saveToCloud
    // Just return a marker that indicates chunked format will be used
    return {
      _chunked: true,
      _dataSize: this._calculateDataSize(data),
      _timestamp: Date.now(),
    };
  }

  /**
   * Clear corrupted data
   */
  async clearCorruptedData() {
    try {
      await chunkedSyncService.resetCloudData();
      logger.info("Cleared corrupted cloud data");
    } catch (error) {
      logger.error("Failed to clear corrupted data", error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopRealTimeSync();
    firebaseSyncService.cleanup();
    this.syncListeners.clear();
    this.errorListeners.clear();
    this.syncQueue = [];
    logger.info("Firebase sync adapter cleaned up");
  }
}

// Export single instance for backward compatibility
const firebaseSync = new FirebaseSyncAdapter();
export default firebaseSync;
