import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { encryptionUtils } from "./encryption";
import { Sentry } from "./sentry.js";
import { firebaseConfig } from "./firebaseConfig";

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
    console.log("🔧 FirebaseSync Debug Info:", {
      budgetId,
      budgetIdLength: budgetId?.length,
      hasEncryptionKey: !!encryptionKey,
      timestamp: new Date().toISOString(),
    });

    // Log initialization to Sentry
    Sentry.captureMessage("FirebaseSync initialized", {
      level: "info",
      tags: { component: "FirebaseSync", operation: "initialize" },
      extra: {
        budgetId,
        hasEncryptionKey: !!encryptionKey,
        queueLength: this.syncQueue.length,
      },
    });
  }

  setupNetworkMonitoring() {
    window.addEventListener("online", () => {
      console.log("📶 Network connection restored");
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener("offline", () => {
      console.log("📵 Network connection lost");
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
        console.error("❌ Error in sync listener:", error);
      }
    });
  }

  notifyErrorListeners(error) {
    this.errorListeners.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        console.error("❌ Error in error listener:", err);
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
      unassignedCash,
      paycheckHistory,
      actualBalance,
      transactions,
      lastActivity,
    } = data;

    // Encrypt everything except username
    const encryptedPayload = await encryptionUtils.encrypt(
      {
        envelopes,
        bills,
        savingsGoals,
        unassignedCash,
        paycheckHistory,
        actualBalance,
        transactions,
        activityData: lastActivity
          ? {
              userColor: lastActivity.userColor,
              timestamp: lastActivity.timestamp,
              deviceFingerprint: lastActivity.deviceFingerprint,
              deviceInfo: lastActivity.deviceInfo,
            }
          : null,
      },
      this.encryptionKey,
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
      console.log("⚠️ Invalid cloud data format");
      return null;
    }

    if (!cloudData.encryptedData || !cloudData.iv) {
      console.log("⚠️ No encrypted data found in cloud document");
      return null;
    }

    try {
      console.log("🔓 Attempting to decrypt cloud data...");

      // Validate encryption key
      if (!this.encryptionKey) {
        throw new Error("No encryption key available");
      }

      // Check data format
      if (
        !Array.isArray(cloudData.encryptedData) ||
        !Array.isArray(cloudData.iv)
      ) {
        console.error("❌ Invalid encrypted data format:", {
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
        cloudData.iv,
      );

      console.log("✅ Successfully decrypted cloud data");

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
      console.error("❌ Failed to decrypt cloud data:", error);

      // Send error to Sentry with context
      Sentry.captureException(error, {
        tags: {
          component: "firebaseSync",
          operation: "decryptData",
        },
        extra: {
          hasEncryptionKey: !!this.encryptionKey,
          errorName: error.name,
          errorMessage: error.message,
        },
      });

      // Check for common decryption issues
      if (error.name === "OperationError") {
        console.error(
          "🔑 Encryption key mismatch - data may be from different password",
        );
        // Clear the corrupted data automatically
        setTimeout(() => {
          this.clearCorruptedData().catch((clearError) => {
            console.error(
              "❌ Failed to auto-clear corrupted data:",
              clearError,
            );
          });
        }, 1000);
      } else if (error.name === "InvalidAccessError") {
        console.error("🚫 Invalid encryption key format");
      } else if (error.message?.includes("JSON")) {
        console.error("📄 JSON parsing error in decrypted data");
      }

      throw error;
    }
  }

  async saveToCloud(data, currentUser, options = {}) {
    if (!this.budgetId || !this.encryptionKey) {
      Sentry.captureMessage("SaveToCloud failed - not initialized", {
        level: "error",
        tags: {
          component: "FirebaseSync",
          operation: "saveToCloud",
          issue: "not_initialized",
        },
        extra: {
          hasBudgetId: !!this.budgetId,
          hasEncryptionKey: !!this.encryptionKey,
          userName: currentUser?.userName,
        },
      });
      throw new Error("Firebase sync not initialized");
    }

    // Log save attempt to Sentry
    Sentry.captureMessage("SaveToCloud attempt started", {
      level: "info",
      tags: { component: "FirebaseSync", operation: "saveToCloud" },
      extra: {
        budgetId: this.budgetId,
        userName: currentUser?.userName,
        dataSize: JSON.stringify(data).length,
        isOnline: this.isOnline,
        options,
      },
    });

    // If offline, queue the operation
    if (!this.isOnline && !options.skipQueue) {
      this.queueSyncOperation("save", { data, currentUser });
      console.log("📴 Queued save operation for when online");
      Sentry.captureMessage("SaveToCloud queued - offline", {
        level: "info",
        tags: {
          component: "FirebaseSync",
          operation: "saveToCloud",
          status: "queued",
        },
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
      console.log("✅ Successfully saved to cloud");
    } catch (error) {
      console.error("❌ Failed to save to cloud:", error);

      // Send error to Sentry with context
      Sentry.captureException(error, {
        tags: {
          component: "firebaseSync",
          operation: "saveToCloud",
        },
        extra: {
          budgetId: this.budgetId,
          isNetworkBlocked: this.isNetworkBlockingError(error),
          retryAttempts: this.retryAttempts,
        },
      });

      // Handle network blocking errors
      if (this.isNetworkBlockingError(error)) {
        console.warn(
          "🚫 Firebase requests are being blocked by browser extension/ad blocker",
        );
        this.notifyErrorListeners({
          type: "network_blocked",
          operation: "save",
          error: "Firebase requests blocked by browser extension or ad blocker",
          userMessage:
            "Please disable ad blockers for this app or allow Firebase requests",
          timestamp: new Date().toISOString(),
        });
        // Don't retry blocked requests
        return;
      }

      // Handle retry logic for other errors
      if (this.retryAttempts < this.maxRetryAttempts) {
        this.retryAttempts++;
        const delay = this.retryDelay * Math.pow(2, this.retryAttempts - 1); // Exponential backoff

        console.log(
          `🔄 Retrying save operation in ${delay}ms (attempt ${this.retryAttempts}/${this.maxRetryAttempts})`,
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

      console.log("🔍 Loading from cloud with budgetId:", this.budgetId);
      const docRef = doc(db, "budgets", this.budgetId);

      try {
        const docSnap = await getDoc(docRef);
        console.log("📄 Firebase getDoc completed, exists:", docSnap.exists());

        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          console.log("✅ Cloud document found for budgetId:", this.budgetId);
          console.log("🔧 Cloud data keys:", Object.keys(cloudData));
          console.log("🔧 Has encrypted data:", !!cloudData.encryptedData);
          console.log(
            "🔧 Encrypted data length:",
            cloudData.encryptedData?.length || 0,
          );
          console.log(
            "🔧 Last updated:",
            cloudData.lastUpdated?.toDate?.()?.toISOString(),
          );
          console.log(
            "🔧 Document size estimate:",
            JSON.stringify(cloudData).length,
            "chars",
          );

          const decryptedData = await this.decryptFromCloud(cloudData);

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
          console.log(
            "❌ No cloud document found for budgetId:",
            this.budgetId,
          );
          console.log("🔍 This could mean:");
          console.log("  - Different password was used on other device");
          console.log("  - Data hasn't been saved to cloud yet");
          console.log("  - Network/permissions issue");
          console.log("  - Document path: budgets/" + this.budgetId);
        }
      } catch (docError) {
        console.error("❌ Firebase getDoc failed:", docError);
        console.error("🔧 Error details:", {
          code: docError.code,
          message: docError.message,
          budgetId: this.budgetId,
        });
      }

      return null;
    } catch (error) {
      console.error("❌ Failed to load from cloud:", error);

      // Handle specific decryption errors
      if (
        error.name === "OperationError" &&
        error.message.includes("decrypt")
      ) {
        console.log("🔄 Attempting to clear corrupted cloud data...");
        // Don't throw error, just return null to allow fresh start
        return null;
      }

      // Handle network blocking errors
      if (this.isNetworkBlockingError(error)) {
        console.warn(
          "🚫 Firebase requests are being blocked by browser extension/ad blocker",
        );
        this.notifyErrorListeners({
          type: "network_blocked",
          operation: "load",
          error: "Firebase requests blocked by browser extension or ad blocker",
          userMessage:
            "Please disable ad blockers for this app or allow Firebase requests",
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

        const cloudTimestamp = cloudData.lastUpdated?.toMillis() || 0;
        if (cloudTimestamp > (this.lastSyncTimestamp || 0)) {
          try {
            console.log("📡 Processing real-time update from Firebase...");

            // Check if this is a cleared data marker
            if (cloudData.cleared) {
              console.log(
                "🧹 Cloud data was cleared - ignoring cleared marker",
              );
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
            console.error("❌ Failed to decrypt incoming data:", error);

            // Handle decryption errors gracefully
            if (error.name === "OperationError") {
              console.log(
                "🔐 Real-time sync encryption key mismatch - ignoring update",
              );
              this.notifyErrorListeners({
                type: "realtime_decrypt_error",
                error: "Encryption key mismatch in real-time sync",
                timestamp: new Date().toISOString(),
                suggestion: "Data may be from a different password or device",
              });
            } else if (error.message?.includes("JSON")) {
              console.error("📄 JSON parsing error in real-time sync");
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
      const cloudTimestamp = cloudData.lastUpdated?.toMillis() || 0;

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

    const newActivities = remoteActivity.filter(
      (activity) => !existingIds.has(activity.id),
    );

    if (newActivities.length > 0) {
      this.recentActivity = [...newActivities, ...this.recentActivity]
        .sort(
          (activityA, activityB) =>
            new Date(activityB.timestamp) - new Date(activityA.timestamp),
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

    console.log(
      `🔄 Processing ${this.syncQueue.length} queued sync operations`,
    );

    const operations = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of operations) {
      try {
        switch (operation.type) {
          case "save":
            await this.saveToCloud(
              operation.data.data,
              operation.data.currentUser,
              {
                skipQueue: true,
              },
            );
            break;
          default:
            console.warn("❓ Unknown queued operation type:", operation.type);
        }
      } catch (error) {
        console.error("❌ Failed to process queued operation:", error);

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
      lastSync: this.lastSyncTimestamp
        ? new Date(this.lastSyncTimestamp)
        : null,
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

    console.log("🧹 Clearing potentially corrupted cloud data...");

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
          lastUpdated: new Date(),
        },
        { merge: false },
      ); // Force complete replacement

      console.log("✅ Successfully cleared corrupted cloud data");

      // Reset local sync state
      this.lastSyncTimestamp = null;
      this.activeUsers.clear();
      this.recentActivity = [];

      return true;
    } catch (error) {
      console.error("❌ Failed to clear corrupted data:", error);

      if (this.isNetworkBlockingError(error)) {
        console.warn("🚫 Cannot clear data - Firebase requests blocked");
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

    console.log("🔧 Sync Debug Info:", info);

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
