import logger from "../../utils/common/logger";

interface EditLockServiceUser {
  id?: string;
  budgetId?: string;
  userName?: string;
}

interface LockDocument {
  userId?: string;
  userName?: string;
  expiresAt?: number;
  [key: string]: unknown;
}

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
  const expiireDate =
    typeof lock.expiresAt === "number" ? new Date(lock.expiresAt) : new Date(lock.expiresAt);
  return expiireDate <= new Date();
}

/**
 * Convert lock expiration to Date object
 */
export function getLockExpiresDate(expiresAt?: number | string | Date): Date | undefined {
  if (!expiresAt) return undefined;
  if (typeof expiresAt === "number") return new Date(expiresAt);
  return new Date(expiresAt);
}

/**
 * Calculate time remaining in milliseconds
 */
export function calculateTimeRemaining(expiresAt?: number | string | Date): number {
  if (!expiresAt) return 0;
  const expiireTime = typeof expiresAt === "number" ? expiresAt : new Date(expiresAt).getTime();
  return Math.max(0, expiireTime - new Date().getTime());
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
