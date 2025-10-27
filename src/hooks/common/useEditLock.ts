import { useState, useEffect, useCallback } from "react";
import { editLockService } from "../../services/editLockService";
import useToast from "./useToast";
import logger from "../../utils/common/logger";

interface UseEditLockOptions {
  autoAcquire?: boolean;
  autoRelease?: boolean;
  showToasts?: boolean;
}

interface LockDocument {
  userId?: string;
  userName?: string;
  expiresAt?: number;
  [key: string]: unknown;
}

interface EditLockServiceUser {
  id?: string;
  budgetId?: string;
  userName?: string;
}

/**
 * Hook for managing edit locks on budget items
 * Provides cross-browser edit conflict prevention
 */
const useEditLock = (recordType: string, recordId: string, options: UseEditLockOptions = {}) => {
  const [lock, setLock] = useState<LockDocument | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isOwnLock, setIsOwnLock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const {
    autoAcquire = false, // Automatically acquire lock when hook mounts
    autoRelease = true, // Automatically release lock on unmount
    showToasts = true, // Show toast notifications for lock events
  } = options;

  // Watch for lock changes
  useEffect(() => {
    if (!recordType || !recordId) return;

    const unwatch = editLockService.watchLock(recordType, recordId, (lockDoc) => {
      setLock(lockDoc);
      setIsLocked(!!lockDoc);
      // Check ownership directly from the lock document using same ID logic as service
      const editLockServiceTyped = editLockService as unknown as { currentUser?: EditLockServiceUser };
      const currentUserId =
        editLockServiceTyped.currentUser?.id ||
        editLockServiceTyped.currentUser?.budgetId ||
        `user_${editLockServiceTyped.currentUser?.userName?.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}` ||
        "anonymous";
      setIsOwnLock(lockDoc && currentUserId && lockDoc.userId === currentUserId);

      logger.debug("🔐 Lock state updated", {
        recordType,
        recordId,
        hasLock: !!lockDoc,
        lockUserId: lockDoc?.userId,
        currentUserId,
        lockUserName: lockDoc?.userName,
        lockExpiresAt: lockDoc?.expiresAt,
        isOwnLock: lockDoc && currentUserId && lockDoc.userId === currentUserId,
      });
    });

    return () => {
      unwatch();
    };
  }, [recordType, recordId]);

  /**
   * Acquire edit lock
   */
  const acquireLock = useCallback(async () => {
    if (!recordType || !recordId) return { success: false };

    setIsLoading(true);
    const result = await editLockService.acquireLock(recordType, recordId);
    setIsLoading(false);

    if (result.success) {
      if (showToasts) {
        addToast({
          type: "success",
          title: "Edit Lock Acquired",
          message: `You now have exclusive editing access to this ${recordType}.`,
          duration: 3000,
        });
      }
      logger.debug("🔒 Edit lock acquired via hook", { recordType, recordId });
    } else {
      if (result.reason === "locked_by_other" && showToasts) {
        const resultWithDetails = result as { expiresAt?: string | number; lockedBy?: string };
        const expiresAt = resultWithDetails.expiresAt;
        const timeLeft = expiresAt ? Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / 1000) : 0;
        const lockedBy = resultWithDetails.lockedBy || "Another user";
        addToast({
          type: "warning",
          title: "Currently Being Edited",
          message: `${lockedBy} is editing this ${recordType}. Lock expires in ${timeLeft}s.`,
          duration: 5000,
        });
      }
      logger.debug("🔒 Failed to acquire edit lock", {
        recordType,
        recordId,
        reason: result.reason,
      });
    }

    return result;
  }, [recordType, recordId, showToasts, addToast]);

  // Auto-acquire lock if requested
  useEffect(() => {
    if (autoAcquire && recordType && recordId && (!isLocked || (!isOwnLock && lock))) {
      acquireLock();
    }
  }, [autoAcquire, recordType, recordId, isLocked, isOwnLock, lock, acquireLock]);

  // Auto-release lock on unmount
  useEffect(() => {
    return () => {
      if (autoRelease && isOwnLock) {
        editLockService.releaseLock(recordType, recordId);
      }
    };
  }, [autoRelease, recordType, recordId, isOwnLock]);

  /**
   * Release edit lock
   */
  const releaseLock = useCallback(async () => {
    if (!recordType || !recordId) return { success: false };

    const result = await editLockService.releaseLock(recordType, recordId);

    if (result.success && showToasts) {
      addToast({
        type: "info",
        title: "Edit Lock Released",
        message: `Other users can now edit this ${recordType}.`,
        duration: 2000,
      });
    }

    return result;
  }, [recordType, recordId, showToasts, addToast]);

  /**
   * Attempt to break an expired lock
   */
  const breakLock = useCallback(async () => {
    if (!lock || isOwnLock) return { success: false };

    // Check if lock is expired - handle both number and Timestamp types
    const expiresAt = lock.expiresAt;
    const expiresDate = typeof expiresAt === "number" ? new Date(expiresAt) : expiresAt;
    if (expiresDate && expiresDate > new Date()) {
      if (showToasts) {
        addToast({
          type: "warning",
          title: "Lock Still Active",
          message: "Cannot break lock - it hasn't expired yet.",
          duration: 3000,
        });
      }
      return { success: false, reason: "not_expired" };
    }

    // Force release the expired lock
    const result = await editLockService.releaseLock(recordType, recordId);

    if (result.success && showToasts) {
      addToast({
        type: "info",
        title: "Lock Broken",
        message: "Expired lock removed. You can now acquire the lock.",
        duration: 3000,
      });
    }

    return result;
  }, [lock, isOwnLock, recordType, recordId, showToasts, addToast]);

  return {
    // State
    lock,
    isLocked,
    isOwnLock,
    isLoading,
    canEdit: !isLocked || isOwnLock,
    lockedBy: lock?.userName,
    expiresAt: lock?.expiresAt
      ? typeof lock.expiresAt === "number"
        ? new Date(lock.expiresAt)
        : new Date(lock.expiresAt)
      : undefined,

    // Actions
    acquireLock,
    releaseLock,
    breakLock,

    // Computed values
    timeRemaining: lock?.expiresAt
      ? Math.max(
          0,
          (typeof lock.expiresAt === "number"
            ? lock.expiresAt
            : new Date(lock.expiresAt).getTime()) - new Date().getTime()
        )
      : 0,
    isExpired: lock?.expiresAt
      ? (typeof lock.expiresAt === "number"
          ? new Date(lock.expiresAt)
          : new Date(lock.expiresAt)) <= new Date()
      : false,
  };
};

export default useEditLock;
