// Firebase Sync Service - Core synchronization operations
import { initializeApp } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import type { Auth } from "firebase/auth";
import { encryptionUtils } from "@/utils/security/encryption";
import { firebaseConfig } from "@/utils/common/firebaseConfig";
import logger from "@/utils/common/logger";

import type {
  FirebaseServiceStatus,
  SyncMetadata,
  TypedResponse,
  SafeUnknown,
  FirebaseError,
} from "@/types/firebase";
import { syncOperationWrapper } from "@/services/types/firebaseServiceTypes";

type SyncEventData = {
  operation: "save" | "load" | "realtime";
  data?: unknown;
  error?: Error | FirebaseError;
};

type SyncListenerCallback = (event: string, data: SyncEventData) => void;
type ErrorListenerCallback = (error: Error) => void;

type SyncStatus = FirebaseServiceStatus;

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
          // No need for `if (!this.auth)` here, as `auth` is already checked and narrowed.
          const userCredential = await signInAnonymously(auth);
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
  async initialize(budgetId: string, encryptionKey: string | CryptoKey): Promise<void> {
    this.budgetId = budgetId;

    if (typeof encryptionKey === "string") {
      const { key } = await encryptionUtils.generateKey(encryptionKey);
      this.encryptionKey = key;
    } else {
      this.encryptionKey = encryptionKey;
    }

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
  async saveToCloud<T extends SafeUnknown>(
    data: T,
    metadata: Partial<SyncMetadata> = {}
  ): Promise<TypedResponse<boolean>> {
    return syncOperationWrapper.execute(async () => {
      if (!this.budgetId || !this.encryptionKey) {
        throw new Error("Sync not initialized");
      }

      // Ensure authentication
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        throw new Error("Failed to authenticate with Firebase");
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
      this._notifyListeners("sync_success", { operation: "save", data: true });

      return true;
    });
  }

  /**
   * Load data from Firebase with decryption
   */
  async loadFromCloud<T extends SafeUnknown>(): Promise<TypedResponse<T | null>> {
    return syncOperationWrapper.execute(async () => {
      if (!this.budgetId || !this.encryptionKey) {
        throw new Error("Sync not initialized");
      }

      // Ensure authentication
      const isAuthenticated = await this.ensureAuthenticated();
      if (!isAuthenticated) {
        throw new Error("Failed to authenticate with Firebase");
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

      const parsedData = JSON.parse(decryptedData) as T;
      logger.info("✅ Data loaded from cloud successfully");

      this._notifyListeners("sync_success", { operation: "load", data: parsedData });
      return parsedData;
    });
  }

  /**
   * Setup real-time sync listener
   */
  setupRealTimeSync<T extends SafeUnknown>(
    callback: (data: TypedResponse<T | null>) => void
  ): void {
    if (!this.budgetId || !this.encryptionKey) {
      throw new Error("Sync not initialized");
    }

    const db = this.db;
    if (!db) {
      throw new Error("Firebase database not initialized");
    }

    const docRef = doc(db, "budgets", this.budgetId);

    this.unsubscribe = onSnapshot(
      docRef,
      async (snapshot) => {
        try {
          if (!snapshot.exists()) {
            callback({
              success: true,
              data: null,
              timestamp: Date.now(),
            });
            return;
          }

          const cloudData = snapshot.data();
          if (!cloudData?.encryptedData?.data || !cloudData?.encryptedData?.iv) {
            throw new Error("Invalid or missing encrypted data in real-time snapshot");
          }

          const decryptedData = await encryptionUtils.decrypt(
            cloudData.encryptedData.data,
            this.encryptionKey!,
            cloudData.encryptedData.iv
          );

          const parsedData = JSON.parse(decryptedData) as T;
          callback({
            success: true,
            data: parsedData,
            timestamp: Date.now(),
          });
        } catch (error) {
          logger.error("Error processing real-time sync snapshot", error);
          callback({
            success: false,
            error: syncOperationWrapper.execute(async () => {
              throw error;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            }) as any, // Not ideal but works for now
            timestamp: Date.now(),
          });
        }
      },
      (error) => {
        logger.error("Real-time sync onSnapshot error", error);
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
  private _notifyListeners(event: string, data: SyncEventData): void {
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
