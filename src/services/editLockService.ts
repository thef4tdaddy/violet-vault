import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getFirestore,
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "../utils/common/firebaseConfig";
import logger from "../utils/common/logger";
import {
  validateLockPrerequisites,
  createLockDocument,
  handleExistingLock,
  createExtendedLock,
  handleLockError,
} from "../utils/services/editLockHelpers";
import type { Auth } from "firebase/auth";

// Type definitions for lock service
export interface LockDocument {
  id?: string;
  recordType?: string;
  recordId?: string;
  budgetId?: string;
  userId?: string;
  userName?: string;
  acquiredAt?: unknown;
  expiresAt?: Date | number | { toDate: () => Date };
  lastActivity?: unknown;
  lockId?: string;
}

interface LockResult {
  success: boolean;
  lockDoc?: LockDocument;
  reason?: string;
}

interface ReleaseResult {
  success: boolean;
  error?: string;
}

interface LockCallback {
  (lock: LockDocument | null): void;
}

interface CurrentUser {
  userName: string;
  userColor: string;
  userId?: string;
}

interface LockOptions {
  duration?: number;
}

// Initialize Firebase app and firestore instance
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth: Auth = getAuth(app);

/**
 * Cross-browser edit locking service
 * Prevents concurrent editing conflicts by managing distributed locks in Firebase
 */
class EditLockService {
  locks: Map<string, LockDocument>;
  lockListeners: Map<string, () => void>;
  heartbeatIntervals: Map<string, ReturnType<typeof setInterval>>;
  currentUser: CurrentUser | null;
  budgetId: string | null;

  constructor() {
    this.locks = new Map(); // Local cache of active locks
    this.lockListeners = new Map(); // Firestore listeners
    this.heartbeatIntervals = new Map(); // Map of lockId -> interval
    this.currentUser = null;
    this.budgetId = null;
  }

  /**
   * Initialize the service with user and budget context
   */
  initialize(budgetId: string | null, currentUser: CurrentUser | null): void {
    this.budgetId = budgetId;
    this.currentUser = currentUser;
    logger.debug("🔐 EditLockService initialized", {
      budgetId: budgetId?.slice(0, 8),
      userName: currentUser?.userName,
    });
  }

  /**
   * Attempt to acquire an edit lock
   */
  async acquireLock(
    recordType: string,
    recordId: string,
    options: LockOptions = {}
  ): Promise<LockResult> {
    // Validate prerequisites
    const validation = validateLockPrerequisites(this.budgetId, this.currentUser, auth);
    if (!validation.valid) {
      return validation.degraded
        ? { success: true, reason: validation.reason }
        : { success: false, reason: validation.reason };
    }

    const lockId = `${recordType}_${recordId}`;
    const lockDoc = createLockDocument(
      recordType,
      recordId,
      this.budgetId || "",
      this.currentUser || { userName: "Unknown", userColor: "#000000" },
      options
    );

    try {
      // Check for existing lock and determine action
      const existingLock = await this.getLock(recordType, recordId);
      const lockAction = await handleExistingLock(
        existingLock as { userId: string; userName: string; expiresAt: { toDate(): Date } } | null,
        this.currentUser,
        async () => {
          await this.releaseLock(recordType, recordId);
        }
      );

      if (lockAction.action === "blocked") {
        return lockAction.result as LockResult;
      }

      if (lockAction.action === "extend_existing") {
        // User already owns this lock - extend it
        logger.debug("🔓 Extending existing lock owned by current user", {
          recordType,
          recordId,
        });
        const extendedLock = createExtendedLock(lockDoc, options) as LockDocument;
        await setDoc(doc(firestore, "locks", lockId), extendedLock);
        this.locks.set(lockId, extendedLock);
        this.startHeartbeat(lockId);
        return {
          success: true,
          lockDoc: extendedLock,
          reason: "extended_existing",
        };
      }

      // Acquire new lock
      await setDoc(doc(firestore, "locks", lockId), lockDoc);
      this.locks.set(lockId, lockDoc as LockDocument);
      this.startHeartbeat(lockId);

      logger.info("🔒 Lock acquired", {
        recordType,
        recordId,
        userName: this.currentUser?.userName,
      });

      return { success: true, lockDoc };
    } catch (error: unknown) {
      return handleLockError(error, this.currentUser, this.budgetId) as LockResult;
    }
  }

  /**
   * Release an edit lock
   */
  async releaseLock(recordType: string, recordId: string): Promise<ReleaseResult> {
    const lockId = `${recordType}_${recordId}`;

    try {
      // Remove from Firebase - using correct path per security rules
      await deleteDoc(doc(firestore, "locks", lockId));

      // Remove from local cache
      this.locks.delete(lockId);

      // Stop heartbeat
      this.stopHeartbeat(lockId);

      logger.info("🔓 Lock released", { recordType, recordId });
      return { success: true };
    } catch (error: unknown) {
      // Handle Firebase permission errors gracefully
      const firebaseError = error as { code?: string; message?: string };
      if (
        firebaseError?.code === "permission-denied" ||
        firebaseError?.message?.includes("Missing or insufficient permissions")
      ) {
        logger.warn("❌ Failed to release lock - insufficient permissions (continuing anyway)", {
          recordType,
          recordId,
          error,
        });
        // Remove from local cache even if Firebase failed
        this.locks.delete(lockId);
        this.stopHeartbeat(lockId);
        return { success: true };
      }

      const errorMessage =
        error instanceof Error ? error.message : String(firebaseError?.message || error);
      logger.error("❌ Failed to release lock", { error });
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get current lock for a record
   */
  async getLock(recordType: string, recordId: string): Promise<LockDocument | null> {
    try {
      // Query locks collection - using correct path per security rules
      const q = query(
        collection(firestore, "locks"),
        where("recordType", "==", recordType),
        where("recordId", "==", recordId),
        where("budgetId", "==", this.budgetId) // Filter by current budget
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lockDoc = snapshot.docs[0];
        return { id: lockDoc.id, ...lockDoc.data() } as LockDocument;
      }
      return null;
    } catch (error: unknown) {
      // Handle Firebase permission errors gracefully
      const firebaseError = error as { code?: string; message?: string };
      if (
        firebaseError?.code === "permission-denied" ||
        firebaseError?.message?.includes("Missing or insufficient permissions")
      ) {
        logger.warn("❌ Failed to get lock - insufficient permissions", {
          recordType,
          recordId,
          error,
        });
        return null; // No lock found (graceful degradation)
      }

      logger.error("❌ Failed to get lock", { error });
      return null;
    }
  }

  /**
   * Listen for lock changes on a record
   */
  watchLock(recordType: string, recordId: string, callback: LockCallback): () => void {
    const lockId = `${recordType}_${recordId}`;
    // Query locks collection - using correct path per security rules
    const q = query(
      collection(firestore, "locks"),
      where("recordType", "==", recordType),
      where("recordId", "==", recordId),
      where("budgetId", "==", this.budgetId) // Filter by current budget
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const locks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LockDocument[];
        callback(locks[0] || null); // Only one lock per record
      },
      (error) => {
        logger.error("Lock listener error", error);
        callback(null);
      }
    );

    this.lockListeners.set(lockId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Stop watching lock changes
   */
  unwatchLock(recordType: string, recordId: string): void {
    const lockId = `${recordType}_${recordId}`;
    const unsubscribe = this.lockListeners.get(lockId);
    if (unsubscribe) {
      unsubscribe();
      this.lockListeners.delete(lockId);
    }
  }

  /**
   * Start heartbeat to keep lock alive
   */
  startHeartbeat(lockId: string): void {
    // Stop existing heartbeat for this lock if any
    this.stopHeartbeat(lockId);

    const heartbeatInterval = setInterval(async () => {
      try {
        // Update heartbeat in Firebase - using correct path per security rules
        await setDoc(
          doc(firestore, "locks", lockId),
          {
            lastActivity: serverTimestamp(),
            expiresAt: new Date(Date.now() + 60000), // Extend by 60 seconds
          },
          { merge: true }
        );

        // Update local cache
        const localLock = this.locks.get(lockId) as LockDocument;
        if (localLock) {
          localLock.expiresAt = new Date(Date.now() + 60000);
          localLock.lastActivity = new Date();
        }

        logger.debug("💓 Lock heartbeat updated", {
          lockId,
          expiresAt: new Date(Date.now() + 60000),
        });
      } catch (error) {
        logger.error("💓 Heartbeat failed for lock", { lockId, error });
        this.stopHeartbeat(lockId);
      }
    }, 5000); // Heartbeat every 5 seconds for better timer responsiveness

    this.heartbeatIntervals.set(lockId, heartbeatInterval);
    logger.debug("💓 Heartbeat started for lock", { lockId });
  }

  /**
   * Stop heartbeat for a lock
   */
  stopHeartbeat(lockId: string): void {
    const heartbeatInterval = this.heartbeatIntervals.get(lockId);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      this.heartbeatIntervals.delete(lockId);
      logger.debug("💓 Heartbeat stopped for lock", { lockId });
    }
  }

  /**
   * Check if current user owns a lock
   */
  ownsLock(recordType: string, recordId: string): boolean {
    const lockId = `${recordType}_${recordId}`;
    const lock = this.locks.get(lockId) as LockDocument;
    return lock && lock.userId === this.currentUser?.userId;
  }

  /**
   * Clean up all locks and listeners
   */
  cleanup(): void {
    // Stop all heartbeats
    for (const [_lockId, heartbeatInterval] of this.heartbeatIntervals) {
      clearInterval(heartbeatInterval);
    }
    this.heartbeatIntervals.clear();

    // Release all owned locks
    for (const [, lock] of this.locks) {
      const lockDoc = lock as LockDocument;
      if (lockDoc.userId === this.currentUser?.userId) {
        this.releaseLock(lockDoc.recordType, lockDoc.recordId);
      }
    }

    // Clean up listeners
    for (const unsubscribe of this.lockListeners.values()) {
      unsubscribe();
    }

    this.lockListeners.clear();
    this.locks.clear();

    logger.debug("🔐 EditLockService cleaned up");
  }
}

// Export singleton instance
export const editLockService = new EditLockService();

// Initialize when auth context is available
export const initializeEditLocks = (
  budgetId: string | null,
  currentUser: CurrentUser | null
): void => {
  editLockService.initialize(budgetId, currentUser);
};
