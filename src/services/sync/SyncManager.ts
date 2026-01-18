/**
 * SyncManager - Unified "One-Box" Sync Management Service
 * 
 * Consolidates SyncQueue, SyncMutex, and masterSyncValidator into a cohesive
 * internal API to simplify sync flow and reduce individual service calls.
 * 
 * Part of GitHub Issue #1463 - v2.0 Architecture Refactoring
 * Addresses: Service Layer: Sync Orchestration Consolidation
 * 
 * Internal Components:
 * - SyncQueue: Debouncing and batching
 * - SyncMutex: Concurrency control
 * - Health Monitor: Status tracking
 * - Validator: Diagnostics and validation
 * 
 * Public API:
 * - executeSync(): Queue and execute sync with mutex protection
 * - checkHealth(): Quick health status check
 * - validateSync(): Full validation suite
 * - getStatus(): Combined status from all components
 * - forceSync(): Immediate sync with queue flush
 */

import { SyncQueue } from "@/utils/features/sync/SyncQueue";
import { SyncMutex } from "@/utils/features/sync/SyncMutex";
import { syncHealthMonitor } from "@/utils/features/sync/syncHealthMonitor";
import { 
  getQuickSyncStatus, 
  runMasterSyncValidation 
} from "@/utils/features/sync/masterSyncValidator";
import logger from "@/utils/core/common/logger";
import type { TypedResponse } from "@/types/firebase";

/**
 * Health check result
 */
export interface HealthCheckResult {
  isHealthy: boolean;
  status: string;
  failedTests?: number;
  lastChecked: string;
  checks?: Array<{
    name: string;
    status: string;
    details?: string;
    error?: string;
  }>;
}

/**
 * Validation result
 */
export interface ValidationResult {
  summary: {
    totalTests: number;
    totalPassed: number;
    totalFailed: number;
    overallStatus: string;
    duration: number;
  };
  healthCheck: unknown;
  flowValidation?: unknown[];
  edgeCases?: unknown[];
  corruptionCheck?: unknown[];
}

/**
 * Combined status from all sync components
 */
export interface SyncManagerStatus {
  queue: {
    currentQueueSize: number;
    processingCount: number;
    stats: {
      enqueued: number;
      processed: number;
      failed: number;
      superseded: number;
    };
  };
  mutex: {
    locked: boolean;
    currentOperation: string | null;
    queueLength: number;
    metrics: {
      operationsCompleted: number;
      averageLockTime: number;
      maxLockTime: number;
    };
  };
  health: {
    status: "healthy" | "degraded" | "unhealthy" | "slow";
    issues: string[];
    metrics: {
      totalAttempts: number;
      successfulSyncs: number;
      failedSyncs: number;
      errorRate: number;
      consecutiveFailures: number;
      averageSyncTime: number;
      lastSyncTime: number | null;
    };
  };
  timestamp: number;
}

/**
 * Sync operation options
 */
export interface SyncOperationOptions {
  priority?: "normal" | "high";
  skipQueue?: boolean;
  timeout?: number;
}

/**
 * SyncManager Class
 * Unified service for all sync orchestration needs
 */
export class SyncManager {
  private static instance: SyncManager;
  private queue: SyncQueue;
  private mutex: SyncMutex;
  private initialized: boolean = false;

  private constructor() {
    // Initialize internal components
    this.queue = new SyncQueue({
      name: "SyncManagerQueue",
      debounceMs: 2000,
      maxBatchSize: 10,
      maxQueueAge: 30000,
    });

    this.mutex = new SyncMutex("SyncManagerMutex");
    this.initialized = true;

    logger.info("🎯 SyncManager: Initialized unified sync management service");
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  /**
   * Execute sync operation with queue and mutex protection
   * This is the primary method for scheduling sync operations
   */
  public async executeSync<T>(
    operation: () => Promise<T>,
    operationType: string = "sync",
    options: SyncOperationOptions = {}
  ): Promise<T> {
    const { priority = "normal", skipQueue = false, timeout = 60000 } = options;

    logger.debug(`🎯 SyncManager: Executing ${operationType}`, {
      priority,
      skipQueue,
      timeout,
    });

    // If high priority or skip queue, execute immediately with mutex
    if (skipQueue || priority === "high") {
      return await this.mutex.execute(async () => {
        return await operation();
      }, operationType);
    }

    // Otherwise, queue the operation with debouncing
    const result = await this.queue.enqueue(
      operationType,
      async () => {
        // Execute with mutex protection
        return await this.mutex.execute(async () => {
          return await operation();
        }, operationType);
      }
    );
    
    // Type assertion is safe here because we control the operation's return type
    // The queue returns unknown for flexibility, but our operation returns T
    return result as T;
  }

  /**
   * Check sync health quickly (non-blocking)
   * Returns simplified health status for UI indicators
   */
  public async checkHealth(): Promise<HealthCheckResult> {
    logger.debug("🎯 SyncManager: Checking sync health");
    
    try {
      const health = await getQuickSyncStatus();
      return health;
    } catch (error) {
      logger.error("🎯 SyncManager: Health check failed", error);
      return {
        isHealthy: false,
        status: "ERROR",
        lastChecked: new Date().toISOString(),
        checks: [
          {
            name: "Health Check",
            status: "❌ FAILED",
            error: error instanceof Error ? error.message : String(error),
          },
        ],
      };
    }
  }

  /**
   * Run full validation suite
   * Includes health checks, flow validation, edge cases, and corruption detection
   */
  public async validateSync(): Promise<ValidationResult> {
    logger.info("🎯 SyncManager: Running full sync validation");
    
    try {
      const results = await runMasterSyncValidation();
      return results;
    } catch (error) {
      logger.error("🎯 SyncManager: Validation failed", error);
      throw error;
    }
  }

  /**
   * Get combined status from all sync components
   * Useful for diagnostics and monitoring dashboards
   */
  public getStatus(): SyncManagerStatus {
    const queueStats = this.queue.getStats();
    const mutexStatus = this.mutex.getSyncStatus();
    const healthStatus = syncHealthMonitor.getHealthStatus();

    return {
      queue: {
        currentQueueSize: queueStats.currentQueueSize,
        processingCount: queueStats.processingCount,
        stats: {
          enqueued: queueStats.enqueued,
          processed: queueStats.processed,
          failed: queueStats.failed,
          superseded: queueStats.superseded,
        },
      },
      mutex: {
        locked: mutexStatus.locked,
        currentOperation: mutexStatus.currentOperation,
        queueLength: mutexStatus.queueSize,
        metrics: mutexStatus.metrics,
      },
      health: {
        status: healthStatus.status,
        issues: healthStatus.issues,
        metrics: healthStatus.metrics,
      },
      timestamp: Date.now(),
    };
  }

  /**
   * Force immediate sync by flushing queue and executing directly
   * Use for critical operations that cannot wait for debouncing
   */
  public async forceSync<T>(
    operation: () => Promise<T>,
    operationType: string = "force-sync"
  ): Promise<T> {
    logger.info(`🎯 SyncManager: Force syncing ${operationType}`);

    // Flush any pending queue operations first
    await this.queue.flush();

    // Execute immediately with mutex protection
    return await this.mutex.execute(async () => {
      return await operation();
    }, operationType);
  }

  /**
   * Clear all pending operations in queue
   * Useful for cleanup or reset scenarios
   */
  public clearQueue(): void {
    logger.info("🎯 SyncManager: Clearing sync queue");
    this.queue.clear();
  }

  /**
   * Force release mutex (use with caution)
   * Only for recovery from stuck states
   */
  public forceReleaseMutex(): void {
    logger.warn("🎯 SyncManager: Force releasing mutex");
    this.mutex.forceRelease();
  }

  /**
   * Reset all internal state
   * Useful for testing or recovery scenarios
   */
  public reset(): void {
    logger.info("🎯 SyncManager: Resetting all state");
    this.queue.clear();
    this.mutex.forceRelease();
    syncHealthMonitor.resetMetrics();
  }

  /**
   * Get recommendations based on current health
   */
  public getRecommendations(): string[] {
    return syncHealthMonitor.getRecommendations();
  }

  /**
   * Check if sync manager is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const syncManager = SyncManager.getInstance();

// Default export
export default syncManager;
