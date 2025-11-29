// Firebase Sync Service - Core synchronization operations
import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { encryptionUtils } from "../utils/security/encryption";
import { firebaseConfig } from "../utils/common/firebaseConfig";
import logger from "../utils/common/logger";

// Type definitions for sync operations
type SyncListenerCallback = (event: string, data: unknown) => void;
type ErrorListenerCallback = (error: Error) => void;

interface SyncMetadata {
  version?: string;
  userAgent?: string;
  [key: string]: unknown;
}

interface SyncStatus {
  isOnline: boolean;
  isInitialized: boolean;
  queuedOperations: number;
  lastSyncTimestamp: number | null;
  activeUsers: number;
}

// Augment Window interface for development debugging
declare global {
  interface Window {
    firebaseApp?: FirebaseApp;
    firebaseDb?: Firestore;
    firebaseAuth?: Auth;
  }
}

/**
 * Core Firebase Sync Service
 * Handles basic Firebase operations, authentication, and simple data sync
 */
class FirebaseSyncService {
  // Firebase instances
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;

  // Sync configuration
  budgetId: string | null;
  encryptionKey: CryptoKey | null;
  unsubscribe: (() => void) | null;
  lastSyncTimestamp: number | null;

  // State management
  isOnline: boolean;
  syncQueue: Array<() => Promise<void>>;
  retryAttempts: number;
  maxRetryAttempts: number;
  retryDelay: number;
  activeUsers: Map<string, unknown>;
  syncListeners: Set<SyncListenerCallback>;
  errorListeners: Set<ErrorListenerCallback>;

  // Activity tracking
  recentActivity: unknown[];
  maxActivityItems: number;

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
  private _initializeFirebase(): void {
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
  private _isDevelopmentMode(): boolean {
    return (
      typeof window !== "undefined" &&
      (import.meta.env.MODE === "development" ||
        window.location.hostname.includes("staging.violetvault.app") ||
        window.location.hostname.includes("violetvault.app") ||
        window.location.hostname.includes("vercel.app"))
    );
  }

  /**
   * Setup network monitoring
   */
  private _setupNetworkMonitoring(): void {
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
  async ensureAuthenticated(): Promise<boolean> {
    if (!this.auth) {
      throw new Error("Firebase auth not initialized");
    }

    const auth = this.auth; // Store in local variable for type narrowing

    return new Promise<boolean>((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, 10000);

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          clearTimeout(timeout);

          if (user) {
            logger.debug("User already authenticated", { uid: user.uid });
            unsubscribe();
            resolve(true);
            return;
          }

          logger.debug("No user found, signing in anonymously...");
          if (!this.auth) {
            throw new Error("Firebase auth not initialized");
          }
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
  initialize(budgetId: string, encryptionKey: CryptoKey): void {
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
  async saveToCloud(data: unknown, metadata: SyncMetadata = {}): Promise<boolean> {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Sync not initialized");
    }

    try {
      // Ensure authentication
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        logger.error("Failed to authenticate");
        return false;
      }

      // Encrypt the data
      const encryptedData = await encryptionUtils.encrypt(JSON.stringify(data), this.encryptionKey);

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
      if (!this.db) {
        throw new Error("Firebase database not initialized");
      }
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
  async loadFromCloud(): Promise<unknown> {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Sync not initialized");
    }

    try {
      // Ensure authentication
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        logger.error("Failed to authenticate");
        return null;
      }

      // Load from Firebase
      if (!this.db) {
        throw new Error("Firebase database not initialized");
      }
      const docRef = doc(this.db, "budgets", this.budgetId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        logger.info("No cloud data found");
        return null;
      }

      const cloudData = docSnap.data();

      // Decrypt the data
      const decryptedData = await encryptionUtils.decrypt(
        cloudData.encryptedData.data,
        this.encryptionKey,
        cloudData.encryptedData.iv
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
  setupRealTimeSync(callback: (data: unknown) => void): void {
    if (!this.budgetId) {
      throw new Error("Sync not initialized");
    }

    if (!this.db) {
      throw new Error("Firebase database not initialized");
    }

    const docRef = doc(this.db, "budgets", this.budgetId);

    this.unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data());
        }
      },
      (error) => {
        logger.error("Real-time sync error", error);
        this._notifyListeners("sync_error", { error, operation: "realtime" });
      }
    );

    logger.info("Real-time sync setup complete");
  }

  /**
   * Stop real-time sync
   */
  stopRealTimeSync(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
      logger.info("Real-time sync stopped");
    }
  }

  /**
   * Add sync event listener
   */
  addSyncListener(callback: SyncListenerCallback): void {
    this.syncListeners.add(callback);
  }

  /**
   * Notify all listeners of sync events
   */
  private _notifyListeners(event: string, data: unknown): void {
    this.syncListeners.forEach((callback) => {
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
  private async _processQueuedOperations(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    logger.info(`Processing ${this.syncQueue.length} queued operations`);

    while (this.syncQueue.length > 0) {
      const operation = this.syncQueue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          logger.error("Failed to process queued operation", error);
        }
      }
    }
  }

  /**
   * Get sync status
   */
  getStatus(): SyncStatus {
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
  cleanup(): void {
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
