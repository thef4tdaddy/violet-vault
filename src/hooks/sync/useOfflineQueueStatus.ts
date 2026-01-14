import { useState, useEffect, useCallback } from "react";
import { offlineRequestQueueService } from "@/services/sync/offlineRequestQueueService";
import logger from "@/utils/core/common/logger";

export interface QueueStatus {
  isOnline: boolean;
  processingQueue: boolean;
  pendingCount: number;
  failedCount: number;
  processingCount: number;
  requests: Array<{
    id?: number;
    requestId: string;
    method: string;
    url: string;
    status: string;
    priority: string;
    retryCount: number;
    maxRetries: number;
    timestamp: number;
    nextRetryAt?: number;
    errorMessage?: string;
  }>;
}

/**
 * Hook to interact with the offline request queue service
 */
export const useOfflineQueueStatus = () => {
  const [status, setStatus] = useState<QueueStatus | null>(null);

  const loadStatus = useCallback(async () => {
    try {
      const currentStatus = await offlineRequestQueueService.getStatus();
      setStatus(currentStatus);
    } catch (error) {
      logger.error("Failed to load queue status", error);
    }
  }, []);

  useEffect(() => {
    // Initial load - defer to avoid cascading renders warning
    const timeout = setTimeout(() => {
      loadStatus();
    }, 0);

    // Refresh status every 10 seconds
    const interval = setInterval(() => {
      loadStatus();
    }, 10000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [loadStatus]);

  const retryRequest = async (requestId: string) => {
    try {
      await offlineRequestQueueService.retryRequest(requestId);
      await loadStatus();
    } catch (error) {
      logger.error("Failed to retry request", error);
      throw error;
    }
  };

  const clearFailedRequests = async () => {
    try {
      await offlineRequestQueueService.clearFailedRequests();
      await loadStatus();
    } catch (error) {
      logger.error("Failed to clear failed requests", error);
      throw error;
    }
  };

  const processQueue = async () => {
    try {
      await offlineRequestQueueService.processQueue();
      await loadStatus();
    } catch (error) {
      logger.error("Failed to process queue", error);
      throw error;
    }
  };

  return {
    status,
    loadStatus,
    retryRequest,
    clearFailedRequests,
    processQueue,
  };
};
