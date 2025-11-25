/**
 * Retry policies for different types of errors
 * Determines which errors should be retried vs failed immediately
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */

interface RetryableError {
  name?: string;
  message?: string;
  code?: string;
  status?: number;
}

/**
 * Determine if error should be retried
 */
export const shouldRetryError = (error: RetryableError): boolean => {
  // Network errors - always retry
  if (error.name === "NetworkError" || (error.message && error.message.includes("fetch"))) {
    return true;
  }

  // Firebase specific errors
  if (error.code) {
    return isRetryableFirebaseError(error.code);
  }

  // Encryption/decryption errors - sometimes transient
  if (isTransientEncryptionError(error)) {
    return true;
  }

  // HTTP errors - retry server errors only
  if (error.status) {
    return error.status >= 500 && error.status < 600;
  }

  // Default: retry unknown errors (conservative approach)
  return true;
};

/**
 * Check if Firebase error code is retryable
 */
export const isRetryableFirebaseError = (errorCode: string): boolean => {
  const retryableCodes = [
    "unavailable",
    "deadline-exceeded",
    "resource-exhausted",
    "aborted",
    "internal",
    "cancelled",
  ];
  return retryableCodes.includes(errorCode);
};

/**
 * Check if encryption error might be transient
 */
export const isTransientEncryptionError = (error: RetryableError): boolean => {
  const transientMessages = ["data is too small", "decrypt", "Invalid key", "Failed to decrypt"];

  return transientMessages.some((msg) => error.message && error.message.includes(msg));
};

/**
 * Classify error for metrics and logging
 */
export const classifyError = (error: RetryableError): string => {
  if (error.name === "NetworkError") return "network";
  if (error.code) return "firebase";
  if (isTransientEncryptionError(error)) return "encryption";
  if (error.status) return "http";
  return "unknown";
};

export default {
  shouldRetryError,
  isRetryableFirebaseError,
  isTransientEncryptionError,
  classifyError,
};
