import logger from "@/utils/core/common/logger";

/**
 * Result handler for async operations
 * Manages loading and error states for hook operations
 */
export interface AsyncOperationHandlers {
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Wrapper for async operations that handles loading/error state
 * Reduces boilerplate in hooks with consistent error handling
 *
 * @param operation - Async function to execute
 * @param handlers - State setters for loading and error
 * @param context - Context string for error logging
 * @returns Result of the operation
 */
export async function withAsyncOperation<T>(
  operation: () => Promise<T>,
  handlers: AsyncOperationHandlers,
  context: string
): Promise<T> {
  try {
    handlers.setLoading(true);
    handlers.setError(null);
    return await operation();
  } catch (err) {
    const errorMessage = `${context}: ${err instanceof Error ? err.message : String(err)}`;
    handlers.setError(errorMessage);
    logger.error(context, err);
    // Re-throw original error to preserve stack trace
    throw err;
  } finally {
    handlers.setLoading(false);
  }
}

/**
 * Validates encryption key availability and returns validated context
 * Throws error if key, salt, or budgetId is missing
 * Returns validated context to avoid non-null assertions
 */
export function validateEncryptionContext(
  encryptionKey: CryptoKey | null,
  salt: Uint8Array | null,
  budgetId: string | null
): { encryptionKey: CryptoKey; salt: Uint8Array; budgetId: string } {
  if (!encryptionKey || !salt || !budgetId) {
    throw new Error("No encryption key available - please login first");
  }
  return { encryptionKey, salt, budgetId };
}

/**
 * Validates password strength for key export
 * @param password - Password to validate
 * @param minLength - Minimum password length (default: 8)
 */
export function validateExportPassword(password: string, minLength = 8): void {
  if (!password || password.length < minLength) {
    throw new Error(`Export password must be at least ${minLength} characters long`);
  }
}
