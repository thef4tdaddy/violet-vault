import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { encryptionUtils } from "./encryption";
import { H } from "./highlight.js";
import { firebaseConfig } from "./firebaseConfig";
import logger from "./logger";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

class FirebaseSync {
  constructor() {
    this.budgetId = null;
    this.encryptionKey = null;
    this.unsubscribe = null;
    this.lastSyncTimestamp = null;

    // Enhanced state management
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

  initialize(budgetId, encryptionKey) {
    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;
    this.retryAttempts = 0;

    // Clear any existing queued operations for a fresh start
    this.syncQueue = [];

    // Debug logging for sync issues
    if (
      import.meta.env.MODE === "development" ||
      window.location.hostname.includes("vercel.app") ||
      window.location.hostname.includes("f4tdaddy.com")
    ) {
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
      component: "FirebaseSync",
      operation: "initialize",
      budgetId,
      hasEncryptionKey: !!encryptionKey,
      queueLength: this.syncQueue.length,
    });
  }

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

  addSyncListener(callback) {
    this.syncListeners.add(callback);
  }

  removeSyncListener(callback) {
    this.syncListeners.delete(callback);
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

  static generateBudgetId(masterPassword) {
    return encryptionUtils.generateBudgetId(masterPassword);
  }

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
      lastActivity,
      budgetCommits,
      budgetChanges,
      budgetBranches,
      budgetTags,
    } = data;

    // Encrypt everything except username
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

    // Ensure lastActivity has all required fields and no undefined values
    const validLastActivity =
      lastActivity &&
      lastActivity.userName &&
      lastActivity.userName !== undefined &&
      lastActivity.userName !== null &&
      lastActivity.userName.trim() !== ""
        ? {
            userName: String(lastActivity.userName).trim(),
            timestamp: lastActivity.timestamp || Date.now(),
          }
        : null;

    return {
      encryptedData: encryptedPayload.data,
      iv: encryptedPayload.iv,
      lastActivity: validLastActivity,
      version: 1,
      lastUpdated: serverTimestamp(),
    };
  }

  async decryptFromCloud(cloudData) {
    if (!cloudData || typeof cloudData !== "object") {
      logger.warn("Invalid cloud data format");
      return null;
    }

    if (!cloudData.encryptedData || !cloudData.iv) {
      logger.warn("No encrypted data found in cloud document");
      return null;
    }

    try {
      logger.debug("Attempting to decrypt cloud data");

      // Validate encryption key
      if (!this.encryptionKey) {
        throw new Error("No encryption key available");
      }

      // Check data format
      if (!Array.isArray(cloudData.encryptedData) || !Array.isArray(cloudData.iv)) {
        logger.error("Invalid encrypted data format", {
          encryptedDataType: typeof cloudData.encryptedData,
          ivType: typeof cloudData.iv,
          encryptedDataLength: cloudData.encryptedData?.length,
          ivLength: cloudData.iv?.length,
        });
        throw new Error("Invalid encrypted data format");
      }

      const decryptedData = await encryptionUtils.decrypt(
        cloudData.encryptedData,
        this.encryptionKey,
        cloudData.iv
      );

      logger.debug("Successfully decrypted cloud data");

      // Validate decrypted data structure
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

      // Send error to Highlight.io with context
      H.consumeError(error, {
        metadata: {
          hasEncryptionKey: !!this.encryptionKey,
          errorName: error.name,
          errorMessage: error.message,
        },
      });

      // Check for common decryption issues
      if (error.name === "OperationError") {
        logger.error("🔑 Encryption key mismatch - data may be from different password");
        // Clear the corrupted data automatically
        setTimeout(() => {
          this.clearCorruptedData().catch((clearError) => {
            logger.error("❌ Failed to auto-clear corrupted data:", clearError);
          });
        }, 1000);
      } else if (error.name === "InvalidAccessError") {
        logger.error("🚫 Invalid encryption key format");
      } else if (error.message?.includes("JSON")) {
        logger.error("📄 JSON parsing error in decrypted data");
      }

      throw error;
    }
  }

  async saveToCloud(data, currentUser, options = {}) {
    if (!this.budgetId || !this.encryptionKey) {
      H.consumeError(new Error("SaveToCloud failed - not initialized"), {
        metadata: {
          hasBudgetId: !!this.budgetId,
          hasEncryptionKey: !!this.encryptionKey,
          userName: currentUser?.userName,
        },
        tags: {
          component: "FirebaseSync",
          operation: "saveToCloud",
          issue: "not_initialized",
        },
      });
      throw new Error("Firebase sync not initialized");
    }

    // Log save attempt to Highlight.io
    H.track("save-to-cloud-started", {
      component: "FirebaseSync",
      operation: "saveToCloud",
      budgetId: this.budgetId,
      userName: currentUser?.userName,
      dataSize: JSON.stringify(data).length,
      isOnline: this.isOnline,
      ...options,
    });

    // If offline, queue the operation
    if (!this.isOnline && !options.skipQueue) {
      this.queueSyncOperation("save", { data, currentUser });
      logger.info("📴 Queued save operation for when online");
      H.track("save-to-cloud-queued", {
        component: "FirebaseSync",
        operation: "saveToCloud",
        status: "queued",
      });
      return;
    }

    try {
      this.notifySyncListeners({ type: "sync_start", operation: "save" });

      const encryptedData = await this.encryptForCloud(data);

      // Add activity tracking - ensure all required fields are present
      const activityData = {
        id: Date.now().toString(),
        type: "data_save",
        userName: currentUser?.userName || "Anonymous",
        userColor: currentUser?.userColor || "#a855f7",
        timestamp: new Date().toISOString(),
        details: {
          envelopeCount: data.envelopes?.length || 0,
          billCount: data.bills?.length || 0,
          savingsGoalCount: data.savingsGoals?.length || 0,
        },
      };

      this.addActivity(activityData);

      // Clean the data to ensure no undefined values
      const cleanedData = this.removeUndefinedValues({
        ...encryptedData,
        currentUser: {
          id: currentUser?.id || encryptionUtils.generateDeviceFingerprint(),
          userName: currentUser?.userName || "Anonymous",
          userColor: currentUser?.userColor || "#a855f7",
          deviceFingerprint: encryptionUtils.generateDeviceFingerprint(),
          lastSeen: new Date().toISOString(),
          ...(currentUser?.budgetId && { budgetId: currentUser.budgetId }), // Only include if present
        },
        activity: this.recentActivity.slice(-10), // Include recent activity
      });

      const docRef = doc(db, "budgets", this.budgetId);
      await setDoc(docRef, cleanedData, { merge: true });

      this.lastSyncTimestamp = Date.now();
      this.retryAttempts = 0; // Reset retry counter on success

      this.notifySyncListeners({ type: "sync_success", operation: "save" });
      logger.info("✅ Successfully saved to cloud");
    } catch (error) {
      logger.error("❌ Failed to save to cloud:", error);

      // Send error to Highlight.io with context
      H.consumeError(error, {
        metadata: {
          budgetId: this.budgetId,
          isNetworkBlocked: this.isNetworkBlockingError(error),
          retryAttempts: this.retryAttempts,
        },
      });

      // Handle network blocking errors
      if (this.isNetworkBlockingError(error)) {
        logger.warn("🚫 Firebase requests are being blocked by browser extension/ad blocker");
        this.notifyErrorListeners({
          type: "network_blocked",
          operation: "save",
          error: "Firebase requests blocked by browser extension or ad blocker",
          userMessage: "Please disable ad blockers for this app or allow Firebase requests",
          timestamp: new Date().toISOString(),
        });
        // Don't retry blocked requests
        return;
      }

      // Handle retry logic for other errors
      if (this.retryAttempts < this.maxRetryAttempts) {
        this.retryAttempts++;
        const delay = this.retryDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff

        logger.info(
          `🔄 Retrying save operation in ${delay}ms (attempt ${this.retryAttempts}/${this.maxRetryAttempts})`
        );

        setTimeout(() => {
          this.saveToCloud(data, currentUser, { skipQueue: true });
        }, delay);
      } else {
        this.notifyErrorListeners({
          type: "sync_error",
          operation: "save",
          error: error.message,
          timestamp: new Date().toISOString(),
        });
        this.notifySyncListeners({
          type: "sync_error",
          operation: "save",
          error: error.message,
        });
        throw error;
      }
    }
  }

  async loadFromCloud() {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Firebase sync not initialized");
    }

    if (!this.isOnline) {
      throw new Error("Cannot load from cloud while offline");
    }

    try {
      this.notifySyncListeners({ type: "sync_start", operation: "load" });

      logger.info("🔍 Loading from cloud with budgetId:", this.budgetId);
      const docRef = doc(db, "budgets", this.budgetId);

      try {
        const docSnap = await getDoc(docRef);
        logger.debug("📄 Firebase getDoc completed, exists:", docSnap.exists());

        if (docSnap.exists()) {
          const cloudData = docSnap.data();

          // Only log in development/preview
          if (
            import.meta.env.MODE === "development" ||
            window.location.hostname.includes("vercel.app") ||
            window.location.hostname.includes("f4tdaddy.com")
          ) {
            logger.debug("✅ Cloud document found for budgetId:", this.budgetId);
            logger.debug("🔧 Cloud data keys:", Object.keys(cloudData));
            logger.debug("🔧 Has encrypted data:", !!cloudData.encryptedData);
            logger.debug("🔧 Encrypted data length:", cloudData.encryptedData?.length || 0);
            logger.debug("🔧 Last updated:", cloudData.lastUpdated?.toDate?.()?.toISOString());
            logger.debug("🔧 Document size estimate:", JSON.stringify(cloudData).length, "chars");
          }

          const decryptedData = await this.decryptFromCloud(cloudData);

          // Debug decryption results
          if (
            import.meta.env.MODE === "development" ||
            window.location.hostname.includes("vercel.app") ||
            window.location.hostname.includes("f4tdaddy.com")
          ) {
            logger.debug("🔐 Decryption result:", {
              success: !!decryptedData,
              hasEnvelopes: !!decryptedData?.envelopes?.length,
              envelopeCount: decryptedData?.envelopes?.length || 0,
              hasTransactions: !!decryptedData?.transactions?.length,
              transactionCount: decryptedData?.transactions?.length || 0,
              dataKeys: decryptedData ? Object.keys(decryptedData) : [],
            });
          }

          // Update active users
          if (cloudData.currentUser) {
            this.activeUsers.set(cloudData.currentUser.id, {
              ...cloudData.currentUser,
              lastSeen: new Date(cloudData.currentUser.lastSeen || Date.now()),
            });
          }

          // Merge remote activity with local activity
          if (cloudData.activity && Array.isArray(cloudData.activity)) {
            this.mergeActivity(cloudData.activity);
          }

          this.notifySyncListeners({ type: "sync_success", operation: "load" });

          return {
            data: decryptedData,
            metadata: {
              lastUpdated: cloudData.lastUpdated,
              currentUser: cloudData.currentUser,
              lastActivity: cloudData.lastActivity,
              activeUsers: Array.from(this.activeUsers.values()),
              recentActivity: this.recentActivity,
            },
          };
        } else {
          logger.warn("❌ No cloud document found for budgetId:", this.budgetId);
          logger.info("🔍 This could mean:");
          logger.info("  - Different password was used on other device");
          logger.info("  - Data hasn't been saved to cloud yet");
          logger.info("  - Network/permissions issue");
          logger.info("  - Document path: budgets/" + this.budgetId);
        }
      } catch (docError) {
        logger.error("❌ Firebase getDoc failed:", docError);
        logger.error("🔧 Error details:", {
          code: docError.code,
          message: docError.message,
          budgetId: this.budgetId,
        });
      }

      return null;
    } catch (error) {
      logger.error("❌ Failed to load from cloud:", error);

      // Handle specific decryption errors
      if (error.name === "OperationError" && error.message.includes("decrypt")) {
        logger.info("🔄 Attempting to clear corrupted cloud data...");
        // Don't throw error, just return null to allow fresh start
        return null;
      }

      // Handle network blocking errors
      if (this.isNetworkBlockingError(error)) {
        logger.warn("🚫 Firebase requests are being blocked by browser extension/ad blocker");
        this.notifyErrorListeners({
          type: "network_blocked",
          operation: "load",
          error: "Firebase requests blocked by browser extension or ad blocker",
          userMessage: "Please disable ad blockers for this app or allow Firebase requests",
          timestamp: new Date().toISOString(),
        });
        return null; // Return null instead of throwing
      }

      this.notifyErrorListeners({
        type: "sync_error",
        operation: "load",
        error: error.message,
        timestamp: new Date().toISOString(),
      });
      this.notifySyncListeners({
        type: "sync_error",
        operation: "load",
        error: error.message,
      });
      throw error;
    }
  }

  setupRealtimeSync(onDataChanged) {
    if (!this.budgetId) {
      throw new Error("Budget ID not set");
    }

    const docRef = doc(db, "budgets", this.budgetId);

    this.unsubscribe = onSnapshot(docRef, async (doc) => {
      if (doc.exists()) {
        const cloudData = doc.data();

        const cloudTimestamp = cloudData.lastUpdated?.toMillis
          ? cloudData.lastUpdated.toMillis()
          : cloudData.lastUpdated?.getTime?.() || 0;
        if (cloudTimestamp > (this.lastSyncTimestamp || 0)) {
          try {
            logger.debug("📡 Processing real-time update from Firebase...");

            // Check if this is a cleared data marker
            if (cloudData.cleared) {
              logger.info("🧹 Cloud data was cleared - ignoring cleared marker");
              return;
            }

            const decryptedData = await this.decryptFromCloud(cloudData);
            if (decryptedData) {
              onDataChanged({
                data: decryptedData,
                metadata: {
                  lastUpdated: cloudData.lastUpdated,
                  currentUser: cloudData.currentUser,
                  lastActivity: cloudData.lastActivity,
                },
              });
              this.lastSyncTimestamp = cloudTimestamp;
            }
          } catch (error) {
            logger.error("❌ Failed to decrypt incoming data:", error);

            // Handle decryption errors gracefully
            if (error.name === "OperationError") {
              logger.warn("🔐 Real-time sync encryption key mismatch - ignoring update");
              this.notifyErrorListeners({
                type: "realtime_decrypt_error",
                error: "Encryption key mismatch in real-time sync",
                timestamp: new Date().toISOString(),
                suggestion: "Data may be from a different password or device",
              });
            } else if (error.message?.includes("JSON")) {
              logger.error("📄 JSON parsing error in real-time sync");
              this.notifyErrorListeners({
                type: "realtime_parse_error",
                error: "Failed to parse real-time sync data",
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      }
    });
  }

  stopRealtimeSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  async getActiveUsers() {
    const docRef = doc(db, "budgets", this.budgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.currentUser ? [data.currentUser] : [];
    }

    return [];
  }

  async checkForConflicts(localTimestamp) {
    const docRef = doc(db, "budgets", this.budgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const cloudData = docSnap.data();
      const cloudTimestamp = cloudData.lastUpdated?.toMillis
        ? cloudData.lastUpdated.toMillis()
        : cloudData.lastUpdated?.getTime?.() || 0;

      if (cloudTimestamp > localTimestamp) {
        return {
          hasConflict: true,
          cloudUser: cloudData.currentUser,
          cloudTimestamp: new Date(cloudTimestamp),
        };
      }
    }

    return { hasConflict: false };
  }

  // Activity management
  addActivity(activity) {
    this.recentActivity.unshift(activity);
    if (this.recentActivity.length > this.maxActivityItems) {
      this.recentActivity = this.recentActivity.slice(0, this.maxActivityItems);
    }
  }

  mergeActivity(remoteActivity) {
    // Merge remote activities with local ones, avoiding duplicates
    const existingIds = new Set(this.recentActivity.map((a) => a.id));

    const newActivities = remoteActivity.filter((activity) => !existingIds.has(activity.id));

    if (newActivities.length > 0) {
      this.recentActivity = [...newActivities, ...this.recentActivity]
        .sort(
          (activityA, activityB) => new Date(activityB.timestamp) - new Date(activityA.timestamp)
        )
        .slice(0, this.maxActivityItems);
    }
  }

  getRecentActivity() {
    return [...this.recentActivity];
  }

  // Offline sync queue management
  queueSyncOperation(type, data) {
    this.syncQueue.push({
      id: Date.now().toString(),
      type,
      data,
      timestamp: new Date().toISOString(),
      retries: 0,
    });

    // Limit queue size to prevent memory issues
    if (this.syncQueue.length > 100) {
      this.syncQueue = this.syncQueue.slice(-100);
    }
  }

  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    logger.info(`🔄 Processing ${this.syncQueue.length} queued sync operations`);

    const operations = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case "save":
            await this.saveToCloud(operation.data.data, operation.data.currentUser, {
              skipQueue: true,
            });
            break;
          default:
            logger.warn("❓ Unknown queued operation type:", operation.type);
        }
      } catch (error) {
        logger.error("❌ Failed to process queued operation:", error);

        // Re-queue if retries available
        if (operation.retries < 2) {
          operation.retries++;
          this.syncQueue.push(operation);
        }
      }
    }
  }

  getSyncQueueLength() {
    return this.syncQueue.length;
  }

  clearSyncQueue() {
    this.syncQueue = [];
  }

  // Enhanced error handling
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSyncTimestamp ? new Date(this.lastSyncTimestamp) : null,
      queuedOperations: this.syncQueue.length,
      activeUsers: this.activeUsers.size,
      retryAttempts: this.retryAttempts,
      maxRetryAttempts: this.maxRetryAttempts,
    };
  }

  // Health check method
  async performHealthCheck() {
    try {
      if (!this.isOnline) {
        return { status: "offline", message: "Device is offline" };
      }

      if (!this.budgetId || !this.encryptionKey) {
        return { status: "not_initialized", message: "Sync not initialized" };
      }

      // Try to read from Firestore to test connection
      const docRef = doc(db, "budgets", this.budgetId);
      await getDoc(docRef);

      return { status: "healthy", message: "All systems operational" };
    } catch (error) {
      return {
        status: "error",
        message: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  isNetworkBlockingError(error) {
    // Check for common network blocking patterns
    return (
      error.code === "unavailable" ||
      error.message?.includes("ERR_BLOCKED_BY_CLIENT") ||
      error.message?.includes("net::ERR_BLOCKED_BY_CLIENT") ||
      error.message?.includes("blocked") ||
      error.message?.includes("Failed to fetch") ||
      (error.name === "TypeError" && error.message?.includes("fetch"))
    );
  }

  // Helper method to recursively remove undefined values from objects
  removeUndefinedValues(obj) {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => this.removeUndefinedValues(item))
        .filter((item) => item !== undefined);
    }

    if (typeof obj === "object") {
      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          const cleanedValue = this.removeUndefinedValues(value);
          if (cleanedValue !== undefined) {
            cleaned[key] = cleanedValue;
          }
        }
      }
      return cleaned;
    }

    return obj;
  }

  async clearCorruptedData() {
    if (!this.budgetId) {
      throw new Error("Budget ID not set");
    }

    logger.info("🧹 Clearing potentially corrupted cloud data...");

    try {
      const docRef = doc(db, "budgets", this.budgetId);

      // Create a minimal valid structure to replace corrupted data
      await setDoc(
        docRef,
        {
          cleared: true,
          clearedAt: new Date().toISOString(),
          clearedReason: "Encryption key mismatch - data corruption detected",
          version: 1,
          lastUpdated: serverTimestamp(),
        },
        { merge: false }
      ); // Force complete replacement

      logger.info("✅ Successfully cleared corrupted cloud data");

      // Reset local sync state
      this.lastSyncTimestamp = null;
      this.activeUsers.clear();
      this.recentActivity = [];

      return true;
    } catch (error) {
      logger.error("❌ Failed to clear corrupted data:", error);

      if (this.isNetworkBlockingError(error)) {
        logger.warn("🚫 Cannot clear data - Firebase requests blocked");
        return "blocked";
      }

      return false;
    }
  }

  // Debug function to help users verify their sync configuration
  async debugSyncInfo() {
    const info = {
      budgetId: this.budgetId,
      hasEncryptionKey: !!this.encryptionKey,
      isOnline: this.isOnline,
      connectionStatus: this.getConnectionStatus(),
      timestamp: new Date().toISOString(),
    };

    logger.debug("🔧 Sync Debug Info:", info);

    // Try to check if document exists without decryption
    if (this.budgetId) {
      try {
        const docRef = doc(db, "budgets", this.budgetId);
        const docSnap = await getDoc(docRef);

        info.documentExists = docSnap.exists();
        if (docSnap.exists()) {
          const data = docSnap.data();
          info.documentInfo = {
            hasEncryptedData: !!data.encryptedData,
            hasLastActivity: !!data.lastActivity,
            lastUpdated: data.lastUpdated?.toDate?.()?.toISOString(),
            keysInDocument: Object.keys(data),
          };
        }
      } catch (error) {
        info.documentCheckError = error.message;
      }
    }

    return info;
  }
}

export default FirebaseSync;
