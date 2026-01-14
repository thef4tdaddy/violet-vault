import { BaseMutex } from "../common/BaseMutex";
import logger from "@/utils/core/common/logger";

interface SyncMetrics {
  operationsCompleted: number;
  totalLockTime: number;
  averageLockTime: number;
  maxLockTime: number;
  lastOperationTime: string | null;
}

/**
 * Sync-specific mutex for preventing concurrent sync operations
 * Prevents race conditions and data corruption during cloud sync
 *
 * Addresses GitHub Issue #576 - Cloud Sync Reliability Improvements
 */
export class SyncMutex extends BaseMutex {
  syncMetrics: SyncMetrics;

  constructor(name = "SyncMutex") {
    super(name);
    this.syncMetrics = {
      operationsCompleted: 0,
      totalLockTime: 0,
      averageLockTime: 0,
      maxLockTime: 0,
      lastOperationTime: null,
    };
  }

  /**
   * Release with sync-specific metrics tracking
   */
  release() {
    if (this.locked && this.lockStartTime) {
      const duration = Date.now() - this.lockStartTime;
      this._updateMetrics(duration);
    }
    super.release();
  }

  /**
   * Get sync-specific status including metrics
   */
  getSyncStatus() {
    const baseStatus = this.getStatus();
    return {
      ...baseStatus,
      queueSize: baseStatus.queueLength,
      metrics: { ...this.syncMetrics },
    };
  }

  /**
   * Force release with sync-specific cleanup
   */
  forceRelease() {
    logger.warn(`⚠️ ${this.name}: Force releasing sync mutex`, {
      currentOperation: this.currentOperation,
      metrics: this.syncMetrics,
    });

    // Manually unlock and clear state
    this.locked = false;
    this.currentOperation = null;
    this.lockStartTime = null;

    // Clear queue and resolve all pending operations
    while (this.queue.length > 0) {
      const item = this.queue.shift();
      if (item) {
        item.resolve();
      }
    }
  }

  /**
   * Update sync operation metrics
   * @private
   */
  _updateMetrics(duration: number): void {
    this.syncMetrics.operationsCompleted++;
    this.syncMetrics.totalLockTime += duration;
    this.syncMetrics.averageLockTime = Math.round(
      this.syncMetrics.totalLockTime / this.syncMetrics.operationsCompleted
    );
    this.syncMetrics.maxLockTime = Math.max(this.syncMetrics.maxLockTime, duration);
    this.syncMetrics.lastOperationTime = new Date().toISOString();

    // Log performance warnings for slow operations
    if (duration > 30000) {
      // 30 seconds
      logger.warn(`⚠️ Slow sync operation detected: ${duration}ms`, {
        operation: this.currentOperation,
        metrics: this.syncMetrics,
      });
    }
  }
}

// Global sync mutex instance
export const globalSyncMutex = new SyncMutex("GlobalSync");

export default SyncMutex;
