/**
 * Hook for accessing sync health monitoring data
 * Wraps syncHealthMonitor utility to comply with architecture rules
 * Components should use this hook instead of importing syncHealthMonitor directly
 */

import { useState, useEffect } from "react";
import { syncHealthMonitor } from "../../utils/sync/syncHealthMonitor";

interface HealthMetrics {
  totalAttempts: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  lastSyncTime: number | null;
  errorRate: number;
  consecutiveFailures: number;
  sessionStartTime: number;
}

interface SyncRecord {
  id: string;
  type: string;
  startTime: number;
  stage: string;
  endTime?: number;
  duration?: number;
  success?: boolean;
  error?: {
    message: string;
    name: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
  progress?: unknown;
  lastUpdate?: number;
}

interface HealthData {
  status: "healthy" | "slow" | "degraded" | "unhealthy" | "unknown";
  issues: string[];
  metrics: HealthMetrics;
  recentSyncs: SyncRecord[];
}

interface UseSyncHealthMonitorReturn {
  healthData: HealthData | null;
  refreshHealthData: () => void;
}

/**
 * Hook for accessing sync health monitor data
 * Provides health status, metrics, and recent sync history
 *
 * @param autoRefresh - Whether to auto-refresh health data periodically
 * @param refreshInterval - Refresh interval in milliseconds (default: 5000)
 * @returns Health data and refresh function
 */
export const useSyncHealthMonitor = (
  autoRefresh = false,
  refreshInterval = 5000
): UseSyncHealthMonitorReturn => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);

  const refreshHealthData = () => {
    const health = syncHealthMonitor.getHealthStatus() as HealthData;
    setHealthData(health);
  };

  useEffect(() => {
    // Initial load
    refreshHealthData();

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(refreshHealthData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  return {
    healthData,
    refreshHealthData,
  };
};

export default useSyncHealthMonitor;
