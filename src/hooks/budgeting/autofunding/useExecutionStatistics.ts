import { useCallback } from "react";
import logger from "../../../utils/common/logger";

import type { ExecutionRecord } from "@/db/types";

/**
 * Hook for managing auto-funding execution statistics
 * Extracted from useAutoFundingHistory.js to reduce complexity
 */
export const useExecutionStatistics = () => {
  // Get execution statistics
  const getExecutionStatistics = useCallback((executionHistory: ExecutionRecord[]) => {
    try {
      const totalExecutions = executionHistory.length;
      const successfulExecutions = executionHistory.filter(
        (execution) => execution.success !== false
      );
      const totalFunded = executionHistory.reduce(
        (sum: number, execution) => sum + Math.max(0, execution.totalFunded || 0),
        0
      );
      const totalReversed = executionHistory
        .filter((execution) => execution.isUndo)
        .reduce((sum: number, execution) => sum + Math.abs(execution.totalFunded || 0), 0);

      // Group by trigger
      const byTrigger = executionHistory.reduce((acc: Record<string, number>, execution) => {
        acc[execution.trigger] = (acc[execution.trigger] || 0) + 1;
        return acc;
      }, {});

      // Group by date (last 30 days)
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentExecutions = executionHistory.filter(
        (execution) => execution.executedAt && new Date(execution.executedAt) >= last30Days
      );

      return {
        totalExecutions,
        successfulExecutions: successfulExecutions.length,
        failedExecutions: totalExecutions - successfulExecutions.length,
        totalFunded,
        totalReversed,
        netFunded: totalFunded - totalReversed,
        byTrigger,
        recentExecutions: recentExecutions.length,
        lastExecution: executionHistory[0] || null,
        averageFundingPerExecution:
          successfulExecutions.length > 0 ? totalFunded / successfulExecutions.length : 0,
      };
    } catch (error) {
      logger.error("Failed to get execution statistics", error);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalFunded: 0,
        totalReversed: 0,
        netFunded: 0,
        byTrigger: {},
        recentExecutions: 0,
        lastExecution: null,
        averageFundingPerExecution: 0,
      };
    }
  }, []);

  return {
    getExecutionStatistics,
  };
};
