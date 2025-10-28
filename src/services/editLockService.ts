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

// Initialize Firebase app and firestore instance
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);

/**
 * Cross-browser edit locking service
 * Prevents concurrent editing conflicts by managing distributed locks in Firebase
 */
class EditLockService {
  locks: Map<string, Record<string, unknown>>;
  lockListeners: Map<string, () => void>;
  heartbeatIntervals: Map<string, ReturnType<typeof setInterval>>;
  currentUser: { userName: string; userColor: string; userId?: string } | null;
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
  initialize(budgetId, currentUser) {
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
  async acquireLock(recordType, recordId, options = {}) {
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
      this.budgetId,
      this.currentUser,
      options
    );

    try {
      // Check for existing lock and determine action
      const existingLock = await this.getLock(recordType, recordId);
      const lockAction = await handleExistingLock(existingLock, this.currentUser, () =>
        this.releaseLock(recordType, recordId)
      );

      if (lockAction.action === "blocked") {
        return lockAction.result;
      }

      if (lockAction.action === "extend_existing") {
        // User already owns this lock - extend it
        logger.debug("🔓 Extending existing lock owned by current user", {
          recordType,
          recordId,
        });
        const extendedLock = createExtendedLock(lockDoc, options);
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
      this.locks.set(lockId, lockDoc);
      this.startHeartbeat(lockId);

      logger.info("🔒 Lock acquired", {
        recordType,
        recordId,
        userName: this.currentUser.userName,
      });

      return { success: true, lockDoc };
    } catch (error) {
      return handleLockError(error, this.currentUser, this.budgetId);
    }
  }

  /**
   * Release an edit lock
   */
  async releaseLock(recordType, recordId) {
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
    } catch (error) {
      // Handle Firebase permission errors gracefully
      if (
        error.code === "permission-denied" ||
        error.message?.includes("Missing or insufficient permissions")
      ) {
        logger.warn("❌ Failed to release lock - insufficient permissions (continuing anyway)", {
          recordType,
          recordId,
        });
        // Remove from local cache even if Firebase failed
        this.locks.delete(lockId);
        this.stopHeartbeat(lockId);
        return { success: true };
      }

      logger.error("❌ Failed to release lock", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current lock for a record
   */
  async getLock(recordType, recordId) {
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
        return { id: lockDoc.id, ...lockDoc.data() };
      }
      return null;
    } catch (error) {
      // Handle Firebase permission errors gracefully
      if (
        error.code === "permission-denied" ||
        error.message?.includes("Missing or insufficient permissions")
      ) {
        logger.warn("❌ Failed to get lock - insufficient permissions", {
          recordType,
          recordId,
        });
        return null; // No lock found (graceful degradation)
      }

      logger.error("❌ Failed to get lock", error);
      return null;
    }
  }

  /**
   * Listen for lock changes on a record
   */
  watchLock(recordType, recordId, callback) {
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
        }));
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
  unwatchLock(recordType, recordId) {
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
  startHeartbeat(lockId) {
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
        const localLock = this.locks.get(lockId);
        if (localLock) {
          localLock.expiresAt = new Date(Date.now() + 60000);
          localLock.lastActivity = new Date();
        }

        logger.debug("💓 Lock heartbeat updated", {
          lockId,
          expiresAt: new Date(Date.now() + 60000),
        });
      } catch (error) {
        logger.error("💓 Heartbeat failed for lock:", lockId, error);
        this.stopHeartbeat(lockId);
      }
    }, 5000); // Heartbeat every 5 seconds for better timer responsiveness

    this.heartbeatIntervals.set(lockId, heartbeatInterval);
    logger.debug("💓 Heartbeat started for lock:", lockId);
  }

  /**
   * Stop heartbeat for a lock
   */
  stopHeartbeat(lockId) {
    const heartbeatInterval = this.heartbeatIntervals.get(lockId);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      this.heartbeatIntervals.delete(lockId);
      logger.debug("💓 Heartbeat stopped for lock:", lockId);
    }
  }

  /**
   * Check if current user owns a lock
   */
  ownsLock(recordType, recordId) {
    const lockId = `${recordType}_${recordId}`;
    const lock = this.locks.get(lockId);
    return lock && lock.userId === this.currentUser?.userId;
  }

  /**
   * Clean up all locks and listeners
   */
  cleanup() {
    // Stop all heartbeats
    for (const [_lockId, heartbeatInterval] of this.heartbeatIntervals) {
      clearInterval(heartbeatInterval);
    }
    this.heartbeatIntervals.clear();

    // Release all owned locks
    for (const [, lock] of this.locks) {
      if (lock.userId === this.currentUser?.userId) {
        this.releaseLock(lock.recordType, lock.recordId);
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
export const initializeEditLocks = (budgetId, currentUser) => {
  editLockService.initialize(budgetId, currentUser);
};
