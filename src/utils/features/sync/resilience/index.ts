/**
 * Phase 2 Sync Resilience Components
 * Export all resilience improvements for cloud sync reliability
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements (Phase 2)
 */

// Core resilience components
import { RetryManager } from "../RetryManager";
import { CircuitBreaker } from "../CircuitBreaker";
import { SyncQueue } from "../SyncQueue";

export { RetryManager, CircuitBreaker, SyncQueue };

// Utility modules
export { shouldRetryError, classifyError } from "../retryPolicies";
export { calculateRetryDelay, formatDelay } from "../retryUtils";
export { createRetryMetrics, formatMetrics } from "../retryMetrics";

/**
 * Create configured resilience system for sync operations
 */
export const createSyncResilience = (
  options: {
    retryManager?: { name?: string };
    circuitBreaker?: { name?: string; failureThreshold?: number; timeout?: number };
    syncQueue?: { name?: string; debounceMs?: number; maxQueueAge?: number };
  } = {}
) => {
  const retryManager = new RetryManager(options.retryManager?.name || "SyncRetry");
  const circuitBreaker = new CircuitBreaker({
    name: "SyncCircuit",
    failureThreshold: 3, // Lower threshold for sync operations
    timeout: 30000, // 30 seconds
    ...options.circuitBreaker,
  });
  const syncQueue = new SyncQueue({
    name: "SyncQueue",
    debounceMs: 1500, // Shorter debounce for sync
    maxQueueAge: 15000, // 15 seconds max age
    ...options.syncQueue,
  });

  return {
    retryManager,
    circuitBreaker,
    syncQueue,

    /**
     * Execute sync operation with full resilience stack
     */
    async execute(
      operation: () => Promise<unknown>,
      operationType = "sync",
      operationName = "unknown"
    ) {
      // Queue the operation for debouncing
      return await syncQueue.enqueue(operationType, async (_data) => {
        // Execute through circuit breaker
        return await circuitBreaker.execute(async () => {
          // Execute with retry logic
          return await retryManager.execute(operation, {
            operationName,
            maxRetries: 3, // Conservative for sync operations
            baseDelay: 1000,
            maxDelay: 8000,
          });
        }, operationName);
      });
    },

    /**
     * Get combined status of all resilience components
     */
    getStatus() {
      return {
        retry: retryManager.getMetrics(),
        circuit: circuitBreaker.getStatus(),
        queue: syncQueue.getStats(),
        timestamp: Date.now(),
      };
    },

    /**
     * Reset all components to initial state
     */
    reset() {
      retryManager.resetMetrics();
      circuitBreaker.reset();
      syncQueue.clear();
    },
  };
};

export default {
  RetryManager,
  CircuitBreaker,
  SyncQueue,
  createSyncResilience,
};
