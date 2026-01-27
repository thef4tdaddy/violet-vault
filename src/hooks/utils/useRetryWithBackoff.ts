import { useState, useCallback, useRef, useEffect } from "react";
import { captureError } from "@/utils/core/common/sentry";

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number) => void;
  onFailure?: (error: Error) => void;
}

interface UseRetryReturn<T> {
  execute: (fn: () => Promise<T>) => Promise<T>;
  reset: () => void;
  isRetrying: boolean;
  attempt: number;
  error: Error | null;
}

/**
 * Hook to manage exponential backoff retries for async operations
 */
export function useRetryWithBackoff<T = void>({
  maxRetries = 3,
  initialDelay = 1000,
  maxDelay = 10000,
  backoffFactor = 2,
  onRetry,
  onFailure,
}: RetryOptions = {}): UseRetryReturn<T> {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to track if component is mounted to avoid state updates after unmount
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setAttempt(0);
    setError(null);
    setIsRetrying(false);
  }, []);

  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const execute = useCallback(
    async (fn: () => Promise<T>): Promise<T> => {
      reset();
      setIsRetrying(true);

      let currentAttempt = 0;
      let currentDelay = initialDelay;

      while (currentAttempt <= maxRetries) {
        try {
          const result = await fn();

          if (isMounted.current) {
            setIsRetrying(false);
            setError(null);
          }
          return result;
        } catch (err) {
          const typedError = err instanceof Error ? err : new Error(String(err));

          if (isMounted.current) {
            setError(typedError);
            setAttempt(currentAttempt + 1);
          }

          // Check if we should stop
          if (currentAttempt >= maxRetries) {
            if (isMounted.current) setIsRetrying(false);

            // Log to Sentry on exhaustion
            captureError(typedError, {
              tags: { retry_exhausted: "true", attempts: String(currentAttempt) },
            });

            if (onFailure) onFailure(typedError);
            throw typedError;
          }

          // Trigger onRetry callback
          if (onRetry) onRetry(currentAttempt + 1);

          // Wait before next attempt
          await wait(currentDelay);

          currentAttempt++;
          currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
        }
      }

      // Should not perform this reach, but TypeScript needs return
      throw new Error("Retry loop failed unexpectedly");
    },
    [maxRetries, initialDelay, maxDelay, backoffFactor, onRetry, onFailure, reset]
  );

  return { execute, reset, isRetrying, attempt, error };
}
