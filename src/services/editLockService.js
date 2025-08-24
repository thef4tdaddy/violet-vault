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
import { firebaseConfig } from "../utils/firebaseConfig";
import logger from "../utils/logger";

// Initialize Firebase app and firestore instance
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

/**
 * Cross-browser edit locking service
 * Prevents concurrent editing conflicts by managing distributed locks in Firebase
 */
class EditLockService {
  constructor() {
    this.locks = new Map(); // Local cache of active locks
    this.lockListeners = new Map(); // Firestore listeners
    this.currentUser = null;
    this.budgetId = null;
    this.heartbeatInterval = null;
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
    if (!this.budgetId || !this.currentUser) {
      logger.warn("EditLockService not initialized");
      return { success: false, reason: "not_initialized" };
    }

    const lockId = `${recordType}_${recordId}`;
    const lockDoc = {
      recordType,
      recordId,
      userId: this.currentUser.id || "anonymous",
      userName: this.currentUser.userName || "Unknown User",
      acquiredAt: serverTimestamp(),
      expiresAt: new Date(Date.now() + (options.duration || 60000)), // 60 seconds default
      lastActivity: serverTimestamp(),
      lockId,
    };

    try {
      // Check for existing lock
      const existingLock = await this.getLock(recordType, recordId);
      if (existingLock && existingLock.userId !== this.currentUser.id) {
        // Check if lock is expired
        if (existingLock.expiresAt.toDate() > new Date()) {
          return {
            success: false,
            reason: "locked_by_other",
            lockedBy: existingLock.userName,
            expiresAt: existingLock.expiresAt.toDate(),
          };
        } else {
          // Lock expired, clean it up
          await this.releaseLock(recordType, recordId);
        }
      }

      // Acquire the lock
      const lockPath = `budgets/${this.budgetId}/edit-locks/${lockId}`;
      await setDoc(doc(firestore, lockPath), lockDoc);

      // Cache locally
      this.locks.set(lockId, lockDoc);

      // Start heartbeat to extend lock while active
      this.startHeartbeat(lockId);

      logger.info("🔒 Lock acquired", {
        recordType,
        recordId,
        userName: this.currentUser.userName,
      });

      return { success: true, lockDoc };
    } catch (error) {
      logger.error("Failed to acquire lock", error);
      return { success: false, reason: "error", error: error.message };
    }
  }

  /**
   * Release an edit lock
   */
  async releaseLock(recordType, recordId) {
    const lockId = `${recordType}_${recordId}`;

    try {
      // Remove from Firebase
      const lockPath = `budgets/${this.budgetId}/edit-locks/${lockId}`;
      await deleteDoc(doc(firestore, lockPath));

      // Remove from local cache
      this.locks.delete(lockId);

      // Stop heartbeat
      this.stopHeartbeat(lockId);

      logger.info("🔓 Lock released", { recordType, recordId });
      return { success: true };
    } catch (error) {
      logger.error("Failed to release lock", error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current lock for a record
   */
  async getLock(recordType, recordId) {
    try {
      const lockPath = `budgets/${this.budgetId}/edit-locks`;
      const q = query(
        collection(firestore, lockPath),
        where("recordType", "==", recordType),
        where("recordId", "==", recordId)
      );

      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const lockDoc = snapshot.docs[0];
        return { id: lockDoc.id, ...lockDoc.data() };
      }
      return null;
    } catch (error) {
      logger.error("Failed to get lock", error);
      return null;
    }
  }

  /**
   * Listen for lock changes on a record
   */
  watchLock(recordType, recordId, callback) {
    const lockId = `${recordType}_${recordId}`;
    const lockPath = `budgets/${this.budgetId}/edit-locks`;
    const q = query(
      collection(firestore, lockPath),
      where("recordType", "==", recordType),
      where("recordId", "==", recordId)
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
    const heartbeatInterval = setInterval(async () => {
      try {
        const lockPath = `budgets/${this.budgetId}/edit-locks/${lockId}`;
        await setDoc(
          doc(firestore, lockPath),
          {
            lastActivity: serverTimestamp(),
            expiresAt: new Date(Date.now() + 60000), // Extend by 60 seconds
          },
          { merge: true }
        );
      } catch (error) {
        logger.error("Heartbeat failed", error);
        this.stopHeartbeat(lockId);
      }
    }, 30000); // Heartbeat every 30 seconds

    this.heartbeatInterval = heartbeatInterval;
  }

  /**
   * Stop heartbeat for a lock
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Check if current user owns a lock
   */
  ownsLock(recordType, recordId) {
    const lockId = `${recordType}_${recordId}`;
    const lock = this.locks.get(lockId);
    return lock && lock.userId === this.currentUser?.id;
  }

  /**
   * Clean up all locks and listeners
   */
  cleanup() {
    // Stop all heartbeats
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    // Release all owned locks
    for (const [, lock] of this.locks) {
      if (lock.userId === this.currentUser?.id) {
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
