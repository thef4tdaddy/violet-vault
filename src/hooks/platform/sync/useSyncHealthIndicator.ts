import { useState, useEffect, useRef, type RefObject } from "react";
import { getQuickSyncStatus } from "@/utils/sync/masterSyncValidator";
import { syncOrchestrator } from "@/services/sync/syncOrchestrator";
import logger from "@/utils/common/logger";

/**
 * Validation summary structure
 */
interface ValidationSummary {
  overallStatus: string;
  totalFailed: number;
}

/**
 * Full validation results structure
 */
interface ValidationResults {
  summary: ValidationSummary;
}

/**
 * Sync status structure
 */
interface SyncStatus {
  isHealthy: boolean | null;
  status: string;
  lastChecked: string | null;
  isLoading: boolean;
  error?: string;
  failedTests?: number;
  fullResults?: ValidationResults;
}

/**
 * Recovery result structure
 */
interface RecoveryResult {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

/**
 * Sync health indicator hook return type
 */
interface UseSyncHealthIndicatorReturn {
  syncStatus: SyncStatus;
  showDetails: boolean;
  isBackgroundSyncing: boolean;
  isRecovering: boolean;
  recoveryResult: RecoveryResult | null;
  dropdownRef: RefObject<HTMLDivElement | null>;
  setShowDetails: (show: boolean) => void;
  checkSyncHealth: () => Promise<void>;
  runFullValidation: () => Promise<void>;
  resetCloudData: () => Promise<void>;
}

/**
 * Hook for managing sync health indicator state and operations
 * Handles health checking, background sync monitoring, and recovery operations
 */
export const useSyncHealthIndicator = (): UseSyncHealthIndicatorReturn => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isHealthy: null,
    status: "CHECKING",
    lastChecked: null,
    isLoading: true,
  });

  const [showDetails, setShowDetails] = useState(false);
  const [isBackgroundSyncing, setIsBackgroundSyncing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryResult, setRecoveryResult] = useState<RecoveryResult | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check sync health on component mount and periodically
  useEffect(() => {
    checkSyncHealth();

    // Check health every 2 minutes
    const interval = setInterval(checkSyncHealth, 120000);
    return () => clearInterval(interval);
  }, []);

  // Monitor background sync activity
  useEffect(() => {
    // Check if sync is running by monitoring the service state
    const checkSyncActivity = (): void => {
      setIsBackgroundSyncing(syncOrchestrator.isSyncInProgress);
    };

    // Check immediately
    checkSyncActivity();

    // Check every 5 seconds when potentially syncing
    const activityInterval = setInterval(checkSyncActivity, 5000);

    return () => clearInterval(activityInterval);
  }, []);

  // Click-outside handling is now managed in SyncHealthDetails component since it's portaled

  const checkSyncHealth = async (): Promise<void> => {
    logger.info("🔄 Sync Health: Checking sync health...");
    try {
      setSyncStatus((prev) => ({ ...prev, isLoading: true }));
      const health = await getQuickSyncStatus();
      logger.info("✅ Sync Health: Health check completed", health);
      setSyncStatus({
        ...health,
        isLoading: false,
      });
    } catch (error) {
      logger.error("❌ Sync Health: Failed to check sync health:", error);
      setSyncStatus({
        isHealthy: false,
        status: "ERROR",
        error: (error as Error).message,
        lastChecked: new Date().toISOString(),
        isLoading: false,
      });
    }
  };

  const runFullValidation = async (): Promise<void> => {
    logger.info("🚀 Sync Health UI: Full validation button clicked");
    if (
      typeof window !== "undefined" &&
      (window as { runMasterSyncValidation?: () => Promise<ValidationResults> })
        .runMasterSyncValidation
    ) {
      logger.info("🚀 Running full sync validation from UI...");
      try {
        const results = await (
          window as { runMasterSyncValidation: () => Promise<ValidationResults> }
        ).runMasterSyncValidation();
        logger.info("✅ Sync Health: Full validation completed", { ...results.summary });
        // Update status based on results
        setSyncStatus({
          isHealthy: results.summary.overallStatus === "ALL_SYSTEMS_GO",
          status:
            results.summary.overallStatus === "ALL_SYSTEMS_GO" ? "HEALTHY" : "ISSUES_DETECTED",
          failedTests: results.summary.totalFailed,
          lastChecked: new Date().toISOString(),
          isLoading: false,
          fullResults: results,
        });
      } catch (error) {
        logger.error("Full validation failed:", error);
      }
    } else {
      logger.warn("🚨 Sync Health: runMasterSyncValidation not available on window");
    }
  };

  const resetCloudData = async (): Promise<void> => {
    logger.info("🧹 Sync Health UI: Reset cloud data button clicked");
    if (
      typeof window !== "undefined" &&
      (window as { forceCloudDataReset?: () => Promise<RecoveryResult> }).forceCloudDataReset
    ) {
      setIsRecovering(true);
      setRecoveryResult(null);

      try {
        logger.info("🧹 Resetting cloud data from UI...");
        const result = await (
          window as { forceCloudDataReset: () => Promise<RecoveryResult> }
        ).forceCloudDataReset();
        logger.info("✅ Sync Health: Cloud data reset completed", result);

        setRecoveryResult(result);

        // Refresh health status after reset
        setTimeout(checkSyncHealth, 2000);
      } catch (error) {
        logger.error("Cloud data reset failed:", error);
        setRecoveryResult({
          success: false,
          error: (error as Error).message,
        });
      } finally {
        setIsRecovering(false);
      }
    } else {
      logger.warn("🚨 Sync Health: forceCloudDataReset not available on window");
    }
  };

  return {
    syncStatus,
    showDetails,
    isBackgroundSyncing,
    isRecovering,
    recoveryResult,
    dropdownRef,
    setShowDetails,
    checkSyncHealth,
    runFullValidation,
    resetCloudData,
  };
};

export default useSyncHealthIndicator;
