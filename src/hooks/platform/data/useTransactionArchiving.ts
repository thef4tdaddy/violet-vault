import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getArchivingRecommendations,
  createArchiver,
  type ArchivingInfo,
  type ArchiveResult,
} from "@/utils/core/common/transactionArchiving";
import { queryKeys } from "@/utils/core/common/queryClient";
import logger from "@/utils/core/common/logger";

/**
 * Hook for managing transaction archiving functionality
 * Provides archiving operations, status monitoring, and recommendations
 */
const useTransactionArchiving = () => {
  const [isArchiving, setIsArchiving] = useState(false);
  const [archivingProgress, setArchivingProgress] = useState<{
    stage: string;
    progress: number;
  } | null>(null);
  const [lastArchiveResult, setLastArchiveResult] = useState<ArchiveResult | null>(null);

  // Get archiving information and recommendations
  const {
    data: archivingInfo,
    isLoading: infoLoading,
    refetch: refreshInfo,
    error: infoError,
  } = useQuery<ArchivingInfo>({
    queryKey: queryKeys.analyticsBalance(),
    queryFn: getArchivingRecommendations,
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
  });

  /**
   * Execute transaction archiving process
   */
  const executeArchiving = useCallback(
    async (olderThanMonths = 6) => {
      if (isArchiving) {
        logger.warn("Archiving process already in progress");
        return;
      }

      try {
        setIsArchiving(true);
        setArchivingProgress({ stage: "starting", progress: 0 });

        logger.info("Starting transaction archiving", { olderThanMonths });

        // Create progress tracking
        const archiver = createArchiver();

        setArchivingProgress({ stage: "analyzing", progress: 10 });

        // Execute archiving with progress updates
        const result = await archiver.archiveOldTransactions(olderThanMonths);

        setArchivingProgress({ stage: "complete", progress: 100 });
        setLastArchiveResult(result);

        // Refresh archiving info after completion
        await refreshInfo();

        logger.info("Transaction archiving completed", { result });

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error("Transaction archiving failed", { error });
        setLastArchiveResult({
          success: false,
          error: errorMessage,
          stats: { processed: 0, archived: 0, aggregated: 0, errors: 1 },
        });
        throw error;
      } finally {
        setIsArchiving(false);
        setArchivingProgress(null);
      }
    },
    [isArchiving, refreshInfo]
  );

  /**
   * Get archived analytics data
   */
  const getArchivedAnalytics = useCallback(
    async (period: string = "yearly", category: string | null = null) => {
      try {
        const archiver = createArchiver();
        return await archiver.getArchivedAnalytics(period, category);
      } catch (error) {
        logger.error("Failed to retrieve archived analytics", { error });
        throw error;
      }
    },
    []
  );

  /**
   * Restore archived transactions (emergency function)
   */
  const restoreArchive = useCallback(
    async (archiveId: string) => {
      try {
        logger.warn("Restoring archived transactions", { archiveId });
        const archiver = createArchiver();
        const restored = await archiver.restoreArchivedTransactions(archiveId);

        // Refresh data after restore
        await refreshInfo();

        return restored;
      } catch (error) {
        logger.error("Failed to restore archived transactions", { error });
        throw error;
      }
    },
    [refreshInfo]
  );

  /**
   * Calculate potential storage savings
   */
  const calculateSavings = useCallback((transactionCount: number) => {
    // Rough estimate: each transaction ~0.5KB, archives compress to ~30% of original
    const originalSize = transactionCount * 0.5; // KB
    const archivedSize = originalSize * 0.3; // KB
    const savings = originalSize - archivedSize; // KB
    const savingsPercent = originalSize > 0 ? Math.round((savings / originalSize) * 100) : 0;

    return {
      originalSizeKB: Math.round(originalSize),
      archivedSizeKB: Math.round(archivedSize),
      savingsKB: Math.round(savings),
      savingsPercent,
      savingsMB: Math.round((savings / 1024) * 100) / 100,
    };
  }, []);

  /**
   * Get archiving status and recommendations
   */
  const getArchivingStatus = useCallback(() => {
    if (!archivingInfo) return null;

    const { current, recommendations } = archivingInfo;
    const savings = calculateSavings(current.veryOldTransactions);

    return {
      ...recommendations,
      currentStats: current,
      potentialSavings: savings,
      isRecommended: current.veryOldTransactions > 50,
      urgency:
        current.veryOldTransactions > 1000
          ? "high"
          : current.veryOldTransactions > 200
            ? "medium"
            : "low",
    };
  }, [archivingInfo, calculateSavings]);

  /**
   * Check if archiving is currently needed
   */
  const needsArchiving = useCallback(() => {
    if (!archivingInfo) return false;
    return archivingInfo.current.veryOldTransactions > 0;
  }, [archivingInfo]);

  return {
    // Data
    archivingInfo,
    archivingStatus: getArchivingStatus(),
    lastResult: lastArchiveResult,

    // State
    isArchiving,
    archivingProgress,
    isLoading: infoLoading,
    error: infoError,

    // Actions
    executeArchiving,
    getArchivedAnalytics,
    restoreArchive,
    refreshInfo,

    // Utilities
    needsArchiving: needsArchiving(),
    calculateSavings,
  };
};

export default useTransactionArchiving;
