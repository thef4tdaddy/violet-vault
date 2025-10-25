/**
 * Sync Health Monitor - Track sync reliability and performance
 * GitHub Issue #576 Phase 3: Advanced Monitoring
 */

import logger from "../common/logger";

interface SyncMetrics {
  totalAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncTime: number | null;
  errorRate: number;
  consecutiveFailures: number;
  sessionStartTime: number;
}

interface SyncAttempt {
  id: string;
  type: string;
  startTime: number;
  stage: string;
  progress?: unknown;
  lastUpdate?: number;
}

interface SyncError {
  message: string;
  name: string;
  code?: string;
}

interface CompletedSync extends SyncAttempt {
  endTime: number;
  duration: number;
  success: true;
  metadata: unknown;
}

interface FailedSync extends SyncAttempt {
  endTime: number;
  duration: number;
  success: false;
  error: SyncError;
  metadata: unknown;
}

interface HealthThresholds {
  errorRate: number;
  consecutiveFailures: number;
  avgSyncTime: number;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy" | "slow";
  issues: string[];
  metrics: SyncMetrics;
  recentSyncs: (CompletedSync | FailedSync)[];
}

class SyncHealthMonitor {
  metrics: SyncMetrics;
  recentSyncs: (CompletedSync | FailedSync)[];
  maxRecentSyncs: number;
  healthThresholds: HealthThresholds;
  currentSync: SyncAttempt | null;

  constructor() {
    this.metrics = {
      totalAttempts: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      lastSyncTime: null,
      errorRate: 0,
      consecutiveFailures: 0,
      sessionStartTime: Date.now(),
    };

    this.recentSyncs = []; // Keep last 50 sync attempts
    this.maxRecentSyncs = 50;

    this.healthThresholds = {
      errorRate: 0.05, // 5% error rate threshold
      consecutiveFailures: 3,
      avgSyncTime: 10000, // 10 seconds
    };

    this.currentSync = null;
  }

  /**
   * Record start of sync operation
   */
  recordSyncStart(syncType: string = "unknown"): string {
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const attempt: SyncAttempt = {
      id: syncId,
      type: syncType,
      startTime: Date.now(),
      stage: "started",
    };

    this.currentSync = attempt;
    this.metrics.totalAttempts++;

    logger.debug("📊 Sync health: Started tracking", {
      syncId,
      type: syncType,
      totalAttempts: this.metrics.totalAttempts,
    });

    return syncId;
  }

  /**
   * Update sync progress
   */
  updateSyncProgress(syncId: string, stage: string, progress: unknown = null): void {
    if (!this.currentSync || this.currentSync.id !== syncId) {
      return;
    }

    this.currentSync.stage = stage;
    this.currentSync.progress = progress;
    this.currentSync.lastUpdate = Date.now();

    logger.debug("📊 Sync health: Progress update", {
      syncId,
      stage,
      progress,
    });
  }

  /**
   * Record successful sync completion
   */
  recordSyncSuccess(syncId: string, metadata: unknown = {}): void {
    if (!this.currentSync || this.currentSync.id !== syncId) {
      return;
    }

    const endTime = Date.now();
    const duration = endTime - this.currentSync.startTime;

    const completedSync: CompletedSync = {
      ...this.currentSync,
      endTime,
      duration,
      success: true,
      metadata,
    };

    this.addToRecentSyncs(completedSync);
    this.updateMetrics(completedSync);

    logger.production("📊 Sync health: Successful completion", {
      syncId,
      duration,
      successRate: this.getSuccessRate(),
    });

    this.currentSync = null;
  }

  /**
   * Record sync failure
   */
  recordSyncFailure(syncId: string, error: Error, metadata: unknown = {}): void {
    if (!this.currentSync || this.currentSync.id !== syncId) {
      // Handle orphaned failures
      this.metrics.failedSyncs++;
      this.metrics.consecutiveFailures++;
      return;
    }

    const endTime = Date.now();
    const duration = endTime - this.currentSync.startTime;

    const failedSync: FailedSync = {
      ...this.currentSync,
      endTime,
      duration,
      success: false,
      error: {
        message: error.message,
        name: error.name,
        code: (error as unknown as Record<string, unknown>).code as string | undefined,
      },
      metadata,
    };

    this.addToRecentSyncs(failedSync);
    this.updateMetrics(failedSync);

    logger.error("📊 Sync health: Failed completion", {
      syncId,
      error: error.message,
      duration,
      consecutiveFailures: this.metrics.consecutiveFailures,
      errorRate: this.getErrorRate(),
    });

    this.currentSync = null;
  }

  /**
   * Add sync to recent history
   */
  private addToRecentSyncs(syncRecord: CompletedSync | FailedSync): void {
    this.recentSyncs.unshift(syncRecord);
    if (this.recentSyncs.length > this.maxRecentSyncs) {
      this.recentSyncs = this.recentSyncs.slice(0, this.maxRecentSyncs);
    }
  }

  /**
   * Update overall metrics
   */
  private updateMetrics(syncRecord: CompletedSync | FailedSync): void {
    if (syncRecord.success) {
      this.metrics.successfulSyncs++;
      this.metrics.consecutiveFailures = 0;
      this.metrics.lastSyncTime = syncRecord.endTime;
    } else {
      this.metrics.failedSyncs++;
      this.metrics.consecutiveFailures++;
    }

    // Update average sync time
    const totalSyncs = this.metrics.successfulSyncs + this.metrics.failedSyncs;
    if (totalSyncs > 0) {
      const totalTime = this.recentSyncs
        .filter((s) => s.duration)
        .reduce((sum, s) => sum + s.duration, 0);
      this.metrics.averageSyncTime = totalTime / Math.min(totalSyncs, this.recentSyncs.length);
    }

    this.metrics.errorRate = this.getErrorRate();
  }

  /**
   * Get current success rate
   */
  private getSuccessRate(): number {
    const total = this.metrics.successfulSyncs + this.metrics.failedSyncs;
    return total > 0 ? this.metrics.successfulSyncs / total : 1;
  }

  /**
   * Get current error rate
   */
  private getErrorRate(): number {
    const total = this.metrics.successfulSyncs + this.metrics.failedSyncs;
    return total > 0 ? this.metrics.failedSyncs / total : 0;
  }

  /**
   * Get sync health status
   */
  getHealthStatus(): HealthStatus {
    const errorRate = this.getErrorRate();
    const avgTime = this.metrics.averageSyncTime;
    const consecutiveFailures = this.metrics.consecutiveFailures;

    let status: "healthy" | "degraded" | "unhealthy" | "slow" = "healthy";
    const issues: string[] = [];

    if (errorRate > this.healthThresholds.errorRate) {
      status = "degraded";
      issues.push(`High error rate: ${(errorRate * 100).toFixed(1)}%`);
    }

    if (consecutiveFailures >= this.healthThresholds.consecutiveFailures) {
      status = "unhealthy";
      issues.push(`${consecutiveFailures} consecutive failures`);
    }

    if (avgTime > this.healthThresholds.avgSyncTime) {
      if (status === "healthy") status = "slow";
      issues.push(`Slow sync: ${Math.round(avgTime / 1000)}s average`);
    }

    return {
      status,
      issues,
      metrics: { ...this.metrics },
      recentSyncs: this.recentSyncs.slice(0, 10), // Last 10 syncs
    };
  }

  /**
   * Get sync performance recommendations
   */
  getRecommendations(): string[] {
    const health = this.getHealthStatus();
    const recommendations: string[] = [];

    if (health.status === "unhealthy") {
      recommendations.push("Consider clearing local data and re-syncing");
      recommendations.push("Check network connection stability");
    }

    if (this.metrics.averageSyncTime > 15000) {
      recommendations.push("Large dataset detected - consider data archiving");
    }

    if (this.getErrorRate() > 0.1) {
      recommendations.push("High error rate - check Firebase connectivity");
    }

    return recommendations;
  }

  /**
   * Reset metrics (for testing or fresh start)
   */
  resetMetrics(): void {
    this.metrics = {
      totalAttempts: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      averageSyncTime: 0,
      lastSyncTime: null,
      errorRate: 0,
      consecutiveFailures: 0,
      sessionStartTime: Date.now(),
    };
    this.recentSyncs = [];
    this.currentSync = null;

    logger.debug("📊 Sync health metrics reset");
  }
}

// Global instance
export const syncHealthMonitor = new SyncHealthMonitor();
