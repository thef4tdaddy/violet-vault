/**
 * Edit lock service helper functions
 * Extracted from editLockService.js for better maintainability and ESLint compliance
 */
import { serverTimestamp } from "firebase/firestore";
import logger from "../common/logger";

interface User {
  id?: string;
  budgetId?: string;
  userName?: string;
}

interface Auth {
  currentUser: unknown;
}

interface LockResult {
  valid: boolean;
  reason?: string;
  degraded?: boolean;
}

interface ExistingLock {
  userId: string;
  userName: string;
  expiresAt: {
    toDate(): Date;
  };
}

interface HandleLockResult {
  action: string;
  existingLock?: ExistingLock;
  result?: {
    success: boolean;
    reason: string;
    lockedBy: string;
    expiresAt: Date;
  };
}

/**
 * Validate edit lock service prerequisites
 */
export const validateLockPrerequisites = (
  budgetId: string | null | undefined,
  currentUser: User | null | undefined,
  auth: Auth
): LockResult => {
  if (!budgetId || !currentUser) {
    logger.warn("EditLockService not initialized");
    return { valid: false, reason: "not_initialized" };
  }

  // Check Firebase authentication
  if (!auth.currentUser) {
    logger.warn("❌ Edit locks unavailable - Firebase not authenticated");
    return { valid: false, reason: "locks_disabled", degraded: true };
  }

  return { valid: true };
};

/**
 * Generate consistent user ID for lock documents
 */
export const generateUserId = (currentUser: User): string => {
  return (
    currentUser.id ||
    currentUser.budgetId ||
    `user_${currentUser.userName?.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}` ||
    "anonymous"
  );
};

/**
 * Create lock document structure
 */
export const createLockDocument = (
  recordType: string,
  recordId: string,
  budgetId: string,
  currentUser: { userName?: string },
  options: { duration?: number } = {}
) => {
  const lockId = `${recordType}_${recordId}`;
  const userId = generateUserId(currentUser);

  return {
    recordType,
    recordId,
    budgetId,
    userId,
    userName: currentUser.userName || "Unknown User",
    acquiredAt: serverTimestamp(),
    expiresAt: new Date(Date.now() + (options.duration || 60000)), // 60 seconds default
    lastActivity: serverTimestamp(),
    lockId,
  };
};

/**
 * Handle existing lock scenarios
 */
export const handleExistingLock = async (
  existingLock: ExistingLock | null | undefined,
  currentUser: User,
  releaseLockFn: () => Promise<void>
): Promise<HandleLockResult> => {
  if (!existingLock) {
    return { action: "acquire_new" };
  }

  const userId = generateUserId(currentUser);

  // Check if lock is owned by someone else
  if (existingLock.userId !== userId) {
    // Check if lock is expired
    if (existingLock.expiresAt.toDate() > new Date()) {
      return {
        action: "blocked",
        result: {
          success: false,
          reason: "locked_by_other",
          lockedBy: existingLock.userName,
          expiresAt: existingLock.expiresAt.toDate(),
        },
      };
    } else {
      // Lock expired, clean it up
      await releaseLockFn();
      return { action: "acquire_new" };
    }
  }

  // User already owns this lock
  return { action: "extend_existing", existingLock };
};

/**
 * Create extended lock document for existing user locks
 */
export const createExtendedLock = (
  lockDoc: Record<string, unknown>,
  options: { duration?: number } = {}
) => {
  return {
    ...lockDoc,
    expiresAt: new Date(Date.now() + (options.duration || 60000)),
    lastActivity: serverTimestamp(),
  };
};

/**
 * Handle Firebase permission errors
 */
export const handleLockError = (
  error: unknown,
  currentUser: User | null | undefined,
  budgetId: string | null | undefined
): { success: boolean; reason: string; lockDoc?: null; error?: string } => {
  const errorCode = error && typeof error === "object" && "code" in error ? error.code : null;
  const errorMessage =
    error && typeof error === "object" && "message" in error
      ? String(error.message)
      : String(error);

  // Handle Firebase permission errors gracefully
  if (
    errorCode === "permission-denied" ||
    errorMessage?.includes("Missing or insufficient permissions")
  ) {
    logger.warn("❌ Edit locks unavailable - insufficient Firebase permissions", {
      userId: currentUser?.id,
      budgetId: budgetId?.slice(0, 8),
    });
    return { success: true, reason: "locks_disabled", lockDoc: null };
  }

  logger.error("❌ Failed to acquire lock", error);
  return { success: true, reason: "locks_disabled", error: errorMessage };
};
