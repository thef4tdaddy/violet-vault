/**
 * Retry Utility
 * Handles transient failures with exponential backoff.
 */

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  shouldRetry?: (error: unknown) => boolean;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * Retries an asynchronous function with exponential backoff.
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let attempt = 0;
  let delay = config.initialDelay;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;

      const shouldRetry = config.shouldRetry ? config.shouldRetry(error) : true;

      if (attempt >= config.maxAttempts || !shouldRetry) {
        throw error;
      }

      // Log locally or via monitoring if needed, but avoid raw console for production

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * config.backoffFactor, config.maxDelay);
    }
  }
};
