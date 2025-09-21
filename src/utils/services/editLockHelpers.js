/**
 * Edit lock service helper functions
 * Extracted from editLockService.js for better maintainability and ESLint compliance
 */
import { serverTimestamp } from "firebase/firestore";
import logger from "../common/logger";

/**
 * Validate edit lock service prerequisites
 */
export const validateLockPrerequisites = (budgetId, currentUser, auth) => {
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
export const generateUserId = (currentUser) => {
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
  recordType,
  recordId,
  budgetId,
  currentUser,
  options = {},
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
  existingLock,
  currentUser,
  releaseLockFn,
) => {
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
export const createExtendedLock = (lockDoc, options = {}) => {
  return {
    ...lockDoc,
    expiresAt: new Date(Date.now() + (options.duration || 60000)),
    lastActivity: serverTimestamp(),
  };
};

/**
 * Handle Firebase permission errors
 */
export const handleLockError = (error, currentUser, budgetId) => {
  // Handle Firebase permission errors gracefully
  if (
    error.code === "permission-denied" ||
    error.message?.includes("Missing or insufficient permissions")
  ) {
    logger.warn(
      "❌ Edit locks unavailable - insufficient Firebase permissions",
      {
        userId: currentUser?.id,
        budgetId: budgetId?.slice(0, 8),
      },
    );
    return { success: true, reason: "locks_disabled", lockDoc: null };
  }

  logger.error("❌ Failed to acquire lock", error);
  return { success: true, reason: "locks_disabled", error: error.message };
};
