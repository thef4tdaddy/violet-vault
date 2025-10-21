// Firebase Lazy Loader Service
// Ensures Firebase is only loaded when actually needed

import logger from "../utils/common/logger";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

class FirebaseLazyLoader {
  private initialized: boolean;
  private initPromise: Promise<boolean> | null;
  private app: FirebaseApp | null;
  private auth: Auth | null;
  private firestore: Firestore | null;

  constructor() {
    this.initialized = false;
    this.initPromise = null;
    this.app = null;
    this.auth = null;
    this.firestore = null;
  }

  /**
   * Initialize Firebase services when first needed
   * Returns a promise that resolves when Firebase is ready
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._initializeFirebase();
    return this.initPromise;
  }

  private async _initializeFirebase(): Promise<boolean> {
    try {
      logger.info("🔥 Lazy loading Firebase services...");

      // Import Firebase services dynamically
      const [{ initializeApp }, { getAuth }, { getFirestore }] = await Promise.all([
        import("firebase/app"),
        import("firebase/auth"),
        import("firebase/firestore"),
      ]);

      // Import config and services
      const { firebaseConfig } = await import("../utils/common/firebaseConfig");

      // Initialize Firebase app
      const app = initializeApp(firebaseConfig);

      // Initialize Firebase services
      const auth = getAuth(app);
      const firestore = getFirestore(app);

      // Store references for other services
      this.app = app;
      this.auth = auth;
      this.firestore = firestore;

      logger.info("✅ Firebase services initialized successfully");
      this.initialized = true;

      return true;
    } catch (error) {
      logger.error("❌ Firebase lazy loading failed:", error);
      this.initPromise = null; // Reset to allow retry
      throw error;
    }
  }

  /**
   * Get Firebase Auth (initializes if needed)
   */
  async getAuth(): Promise<Auth> {
    await this.initialize();
    if (!this.auth) {
      throw new Error("Firebase Auth not initialized");
    }
    return this.auth;
  }

  /**
   * Get Firebase Firestore (initializes if needed)
   */
  async getFirestore(): Promise<Firestore> {
    await this.initialize();
    if (!this.firestore) {
      throw new Error("Firebase Firestore not initialized");
    }
    return this.firestore;
  }

  /**
   * Get Firebase App (initializes if needed)
   */
  async getApp(): Promise<FirebaseApp> {
    await this.initialize();
    if (!this.app) {
      throw new Error("Firebase App not initialized");
    }
    return this.app;
  }

  /**
   * Check if Firebase is initialized without triggering initialization
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export default new FirebaseLazyLoader();
