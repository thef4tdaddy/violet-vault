import { useState, useEffect, useCallback } from "react";
import { editLockService } from "@/services/sync/editLockService";
import type { LockDocument as ServiceLockDocument } from "@/types/editLock";
import useToast from "@/hooks/platform/ux/useToast";
import logger from "@/utils/common/logger";
import {
  getCurrentUserId,
  isOwnLock as checkIsOwnLock,
  isLockExpired,
  getLockExpiresDate,
  calculateTimeRemaining,
  logLockStateChange,
} from "./useEditLockHelpers";

interface UseEditLockOptions {
  autoAcquire?: boolean;
  autoRelease?: boolean;
  showToasts?: boolean;
}

type LockDocument = ServiceLockDocument;

interface EditLockServiceUser {
  id?: string;
  budgetId?: string;
  userName?: string;
}

/**
 * Hook for managing edit locks on budget items
 */
function useEditLock(
  recordType: string | null,
  recordId: string | null,
  options: UseEditLockOptions = {}
) {
  const [lock, setLock] = useState<LockDocument | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isOwnLock, setIsOwnLock] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const { autoAcquire = false, autoRelease = true, showToasts = true } = options;

  // Watch for lock changes
  useEffect(() => {
    if (!recordType || !recordId) return;

    const unwatch = editLockService.watchLock(recordType, recordId, (lockDoc) => {
      setLock(lockDoc);
      setIsLocked(!!lockDoc);

      const editLockServiceTyped = editLockService as unknown as {
        currentUser?: EditLockServiceUser;
      };
      const currentUserId = getCurrentUserId(editLockServiceTyped.currentUser);
      setIsOwnLock(checkIsOwnLock(lockDoc, currentUserId));
      logLockStateChange(!!lockDoc, recordType, recordId, lockDoc, currentUserId);
    });

    return () => unwatch();
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
        const timeLeft = expiresAt
          ? Math.ceil((new Date(expiresAt).getTime() - new Date().getTime()) / 1000)
          : 0;
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
      acquireLock();
    }
  }, [autoAcquire, recordType, recordId, isLocked, isOwnLock, lock, acquireLock]);

  // Auto-release lock on unmount
  useEffect(() => {
    return () => {
      if (autoRelease && isOwnLock && recordType && recordId) {
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
    if (!lock || isOwnLock || !recordType || !recordId) return { success: false };
    if (!isLockExpired(lock)) {
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
    lock,
    isLocked,
    isOwnLock,
    isLoading,
    canEdit: !isLocked || isOwnLock,
    lockedBy: lock?.userName,
    expiresAt: getLockExpiresDate(lock?.expiresAt),
    acquireLock,
    releaseLock,
    breakLock,
    timeRemaining: calculateTimeRemaining(lock?.expiresAt),
    isExpired: isLockExpired(lock),
  };
}

export default useEditLock;
