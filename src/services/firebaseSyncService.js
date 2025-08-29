// Firebase Sync Service - Core synchronization operations
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { encryptionUtils } from "../utils/security/encryption";
import { firebaseConfig } from "../utils/common/firebaseConfig";
import logger from "../utils/common/logger";

/**
 * Core Firebase Sync Service
 * Handles basic Firebase operations, authentication, and simple data sync
 */
class FirebaseSyncService {
  constructor() {
    this.app = null;
    this.db = null;
    this.auth = null;
    this.budgetId = null;
    this.encryptionKey = null;
    this.unsubscribe = null;
    this.lastSyncTimestamp = null;

    // State management
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

    this._initializeFirebase();
    this._setupNetworkMonitoring();
  }

  /**
   * Initialize Firebase app and services
   */
  _initializeFirebase() {
    try {
      logger.info("🔥 Firebase: Starting initialization...", {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
      });

      this.app = initializeApp(firebaseConfig);
      this.db = getFirestore(this.app);
      this.auth = getAuth(this.app);

      logger.info("✅ Firebase: Initialization complete!", {
        projectId: firebaseConfig.projectId,
      });

      // Expose Firebase to window for debugging (development/staging only)
      if (this._isDevelopmentMode()) {
        window.firebaseApp = this.app;
        window.firebaseDb = this.db;
        window.firebaseAuth = this.auth;
      }
    } catch (error) {
      logger.error("❌ Firebase: Initialization failed", error);
      throw error;
    }
  }

  /**
   * Check if running in development mode
   */
  _isDevelopmentMode() {
    return (
      typeof window !== "undefined" &&
      (import.meta.env.MODE === "development" ||
        window.location.hostname.includes("f4tdaddy.com") ||
        window.location.hostname.includes("vercel.app"))
    );
  }

  /**
   * Setup network monitoring
   */
  _setupNetworkMonitoring() {
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => {
        this.isOnline = true;
        this._processQueuedOperations();
        logger.info("Network online - processing queued operations");
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        logger.info("Network offline - queueing operations");
      });
    }
  }

  /**
   * Ensure user is authenticated with Firebase
   */
  async ensureAuthenticated() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, 10000);

      const unsubscribe = onAuthStateChanged(this.auth, async (user) => {
        try {
          clearTimeout(timeout);
          
          if (user) {
            logger.debug("User already authenticated", { uid: user.uid });
            unsubscribe();
            resolve(true);
            return;
          }

          logger.debug("No user found, signing in anonymously...");
          const userCredential = await signInAnonymously(this.auth);
          logger.info("✅ Anonymous authentication successful", {
            uid: userCredential.user.uid,
          });
          unsubscribe();
          resolve(true);
        } catch (error) {
          unsubscribe();
          reject(error);
        }
      });
    });
  }

  /**
   * Initialize sync with budget ID and encryption key
   */
  initialize(budgetId, encryptionKey) {
    this.budgetId = budgetId;
    this.encryptionKey = encryptionKey;
    this.retryAttempts = 0;
    this.syncQueue = [];

    logger.info("Firebase sync initialized", {
      budgetId: budgetId.substring(0, 8) + "...",
      hasEncryptionKey: !!encryptionKey,
    });
  }

  /**
   * Save data to Firebase with encryption
   */
  async saveToCloud(data, metadata = {}) {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Sync not initialized");
    }

    try {
      // Ensure authentication
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        throw new Error("Failed to authenticate");
      }

      // Encrypt the data
      const encryptedData = await encryptionUtils.encrypt(
        JSON.stringify(data),
        this.encryptionKey
      );

      const syncData = {
        encryptedData,
        timestamp: serverTimestamp(),
        metadata: {
          version: "1.0",
          userAgent: navigator.userAgent,
          ...metadata,
        },
      };

      // Save to Firebase
      const docRef = doc(this.db, "budgets", this.budgetId);
      await setDoc(docRef, syncData);

      logger.info("✅ Data saved to cloud successfully");
      this._notifyListeners("sync_success", { operation: "save" });

      return true;
    } catch (error) {
      logger.error("❌ Failed to save data to cloud", error);
      this._notifyListeners("sync_error", { error, operation: "save" });
      throw error;
    }
  }

  /**
   * Load data from Firebase with decryption
   */
  async loadFromCloud() {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Sync not initialized");
    }

    try {
      // Ensure authentication
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        throw new Error("Failed to authenticate");
      }

      // Load from Firebase
      const docRef = doc(this.db, "budgets", this.budgetId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        logger.info("No cloud data found");
        return null;
      }

      const cloudData = docSnap.data();
      
      // Decrypt the data
      const decryptedData = await encryptionUtils.decrypt(
        cloudData.encryptedData,
        this.encryptionKey
      );

      const parsedData = JSON.parse(decryptedData);
      logger.info("✅ Data loaded from cloud successfully");
      
      this._notifyListeners("sync_success", { operation: "load" });
      return parsedData;
    } catch (error) {
      logger.error("❌ Failed to load data from cloud", error);
      this._notifyListeners("sync_error", { error, operation: "load" });
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

    const docRef = doc(this.db, "budgets", this.budgetId);
    
    this.unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    }, (error) => {
      logger.error("Real-time sync error", error);
      this._notifyListeners("sync_error", { error, operation: "realtime" });
    });

    logger.info("Real-time sync setup complete");
  }

  /**
   * Stop real-time sync
   */
  stopRealTimeSync() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      logger.info("Real-time sync stopped");
    }
  }

  /**
   * Add sync event listener
   */
  addSyncListener(callback) {
    this.syncListeners.add(callback);
  }

  /**
   * Remove sync event listener
   */
  removeSyncListener(callback) {
    this.syncListeners.delete(callback);
  }

  /**
   * Notify all listeners of sync events
   */
  _notifyListeners(event, data) {
    this.syncListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        logger.error("Error in sync listener", error);
      }
    });
  }

  /**
   * Process queued operations when back online
   */
  async _processQueuedOperations() {
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
   * Queue operation for later execution
   */
  _queueOperation(operation) {
    if (this.syncQueue.length >= 50) {
      this.syncQueue.shift(); // Remove oldest operation
    }
    this.syncQueue.push(operation);
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
    };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopRealTimeSync();
    this.syncListeners.clear();
    this.errorListeners.clear();
    this.syncQueue = [];
    
    if (typeof window !== "undefined") {
      window.removeEventListener("online", this._setupNetworkMonitoring);
      window.removeEventListener("offline", this._setupNetworkMonitoring);
    }
    
    logger.info("Firebase sync service cleaned up");
  }
}

// Export singleton instance
export default new FirebaseSyncService();