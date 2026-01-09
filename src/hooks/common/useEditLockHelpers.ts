import logger from "@/utils/common/logger";
import type { LockDocument as ServiceLockDocument } from "@/types/editLock";

interface EditLockServiceUser {
  id?: string;
  budgetId?: string;
  userName?: string;
}

type LockDocument = ServiceLockDocument;

type ExpirationInput = number | string | Date | { toDate: () => Date };

const resolveExpirationDate = (expiresAt?: ExpirationInput): Date | undefined => {
  if (!expiresAt) return undefined;
  if (expiresAt instanceof Date) return expiresAt;
  if (typeof expiresAt === "number") return new Date(expiresAt);
  if (typeof expiresAt === "string") return new Date(expiresAt);
  if (
    typeof expiresAt === "object" &&
    "toDate" in expiresAt &&
    typeof expiresAt.toDate === "function"
  ) {
    return expiresAt.toDate();
  }
  return undefined;
};

/**
 * Get current user ID with fallback logic
 */
export function getCurrentUserId(currentUser?: EditLockServiceUser): string {
  if (currentUser?.id) return currentUser.id;
  if (currentUser?.budgetId) return currentUser.budgetId;
  if (currentUser?.userName) {
    return `user_${currentUser.userName.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}`;
  }
  return "anonymous";
}

/**
 * Check if a lock belongs to the current user
 */
export function isOwnLock(lockDoc: LockDocument | null, currentUserId: string): boolean {
  return !!(lockDoc && currentUserId && lockDoc.userId === currentUserId);
}

/**
 * Check if a lock is expired
 */
export function isLockExpired(lock: LockDocument | null): boolean {
  if (!lock?.expiresAt) return false;
  const expiryDate = resolveExpirationDate(lock.expiresAt);
  return expiryDate ? expiryDate <= new Date() : false;
}

/**
 * Convert lock expiration to Date object
 */
export function getLockExpiresDate(expiresAt?: ExpirationInput): Date | undefined {
  return resolveExpirationDate(expiresAt);
}

/**
 * Calculate time remaining in milliseconds
 */
export function calculateTimeRemaining(expiresAt?: ExpirationInput): number {
  const expiryDate = resolveExpirationDate(expiresAt);
  if (!expiryDate) return 0;
  return Math.max(0, expiryDate.getTime() - Date.now());
}

/**
 * Log lock state change
 */
export function logLockStateChange(
  hasLock: boolean,
  recordType: string,
  recordId: string,
  lockDoc: LockDocument | null,
  currentUserId: string
) {
  logger.debug("🔐 Lock state updated", {
    recordType,
    recordId,
    hasLock,
    lockUserId: lockDoc?.userId,
    currentUserId,
    lockUserName: lockDoc?.userName,
    lockExpiresAt: lockDoc?.expiresAt,
    isOwnLock: isOwnLock(lockDoc, currentUserId),
  });
}
