import { useState, useCallback } from "react";
import logger from "../../../utils/common/logger";

export interface ExecutionRecord {
  id: string;
  trigger: string;
  totalFunded?: number;
  success?: boolean;
  executedAt?: string;
  [key: string]: unknown;
}

export interface ExecutionFilters {
  trigger?: string;
  successful?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Hook for managing auto-funding execution history
 * Extracted from useAutoFundingHistory.js to reduce complexity
 */
export const useExecutionHistory = (initialHistory: ExecutionRecord[] = []) => {
  const [executionHistory, setExecutionHistory] = useState<ExecutionRecord[]>(initialHistory);

  // Add execution to history
  const addToHistory = useCallback((executionRecord: ExecutionRecord) => {
    try {
      setExecutionHistory((prevHistory) => {
        const newHistory = [executionRecord, ...prevHistory];
        // Keep only last 50 executions by default
        return newHistory.slice(0, 50);
      });

      logger.debug("Execution added to history", {
        executionId: executionRecord.id,
        trigger: executionRecord.trigger,
        totalFunded: executionRecord.totalFunded,
      });
    } catch (error) {
      logger.error("Failed to add execution to history", error);
    }
  }, []);

  // Get filtered and limited history
  const getHistory = useCallback(
    (limit = 10, filters: ExecutionFilters = {}) => {
      try {
        let filteredHistory = [...executionHistory];

        // Apply filters
        if (filters.trigger) {
          filteredHistory = filteredHistory.filter(
            (execution) => execution.trigger === filters.trigger
          );
        }

        if (filters.successful !== undefined) {
          filteredHistory = filteredHistory.filter(
            (execution) => (execution.success !== false) === filters.successful
          );
        }

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          filteredHistory = filteredHistory.filter(
            (execution) => execution.executedAt && new Date(execution.executedAt) >= fromDate
          );
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          filteredHistory = filteredHistory.filter(
            (execution) => execution.executedAt && new Date(execution.executedAt) <= toDate
          );
        }

        // Apply limit
        return filteredHistory.slice(0, limit);
      } catch (error) {
        logger.error("Failed to get execution history", error);
        return [];
      }
    },
    [executionHistory]
  );

  // Get execution by ID
  const getExecutionById = useCallback(
    (executionId: string) => {
      return executionHistory.find((execution) => execution.id === executionId);
    },
    [executionHistory]
  );

  // Clear execution history
  const clearHistory = useCallback(() => {
    try {
      setExecutionHistory([]);
      logger.info("Auto-funding execution history cleared");
    } catch (error) {
      logger.error("Failed to clear execution history", error);
      throw error;
    }
  }, []);

  return {
    executionHistory,
    addToHistory,
    getHistory,
    getExecutionById,
    clearHistory,
  };
};
