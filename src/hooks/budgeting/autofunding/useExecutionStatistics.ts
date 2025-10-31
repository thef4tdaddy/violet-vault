import { useCallback } from "react";
import logger from "@/utils/common/logger";
import type { ExecutionHistoryEntry } from "@/hooks/budgeting/autofunding/types";

/**
 * Hook for managing auto-funding execution statistics
 * Extracted from useAutoFundingHistory.js to reduce complexity
 */
export const useExecutionStatistics = () => {
  // Get execution statistics
  const getExecutionStatistics = useCallback((executionHistory: ExecutionHistoryEntry[]) => {
    try {
      const totalExecutions = executionHistory.length;
      const successfulExecutions = executionHistory.filter(
        (execution: ExecutionHistoryEntry) =>
          typeof execution.success !== "boolean" || execution.success !== false
      );
      const totalFunded = executionHistory.reduce(
        (sum: number, execution: ExecutionHistoryEntry) =>
          sum + Math.max(0, execution.totalFunded || 0),
        0
      );
      const totalReversed = executionHistory
        .filter(
          (execution: ExecutionHistoryEntry) =>
            typeof execution.isUndo === "boolean" && execution.isUndo
        )
        .reduce(
          (sum: number, execution: ExecutionHistoryEntry) =>
            sum + Math.abs(execution.totalFunded || 0),
          0
        );

      // Group by trigger
      const byTrigger = executionHistory.reduce(
        (acc: Record<string, number>, execution: ExecutionHistoryEntry) => {
          acc[execution.trigger] = (acc[execution.trigger] || 0) + 1;
          return acc;
        },
        {}
      );

      // Group by date (last 30 days)
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentExecutions = executionHistory.filter((execution: ExecutionHistoryEntry) => {
        const executionDate =
          execution.executedAt || execution.timestamp || new Date().toISOString();
        return new Date(executionDate) >= last30Days;
      });

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
