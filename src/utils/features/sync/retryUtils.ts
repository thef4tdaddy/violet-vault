/**
 * Retry utility functions for delay calculation and timing
 * Handles exponential backoff, jitter, and delay logic
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */

/**
 * Calculate delay with exponential backoff and jitter
 */
export const calculateRetryDelay = (
  attempt: number,
  options: { baseDelay?: number; maxDelay?: number; jitter?: boolean } = {}
): number => {
  const { baseDelay = 1000, maxDelay = 16000, jitter = true } = options;

  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attempt - 1), maxDelay);

  if (!jitter) {
    return exponentialDelay;
  }

  return addJitter(exponentialDelay);
};

/**
 * Add jitter to prevent thundering herd
 */
export const addJitter = (delay: number): number => {
  // Add ±25% variance to prevent thundering herd
  const jitterRange = delay * 0.25;
  const jitterOffset = (Math.random() - 0.5) * 2 * jitterRange;

  return Math.max(100, Math.round(delay + jitterOffset));
};

/**
 * Promise-based delay utility
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Calculate timeout for operation attempt
 */
export const calculateTimeout = (attempt: number, baseTimeout = 30000): number => {
  // Increase timeout slightly with each attempt
  return baseTimeout + (attempt - 1) * 5000;
};

/**
 * Format delay for human-readable logging
 */
export const formatDelay = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
};

export default {
  calculateRetryDelay,
  addJitter,
  delay,
  calculateTimeout,
  formatDelay,
};
