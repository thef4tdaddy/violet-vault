import { useCallback } from "react";
import { useExecutionHistoryQuery } from "./queries/useRuleQueries";
import { useHistoryOperations } from "./operations/useHistoryOperations";
import type { ExecutionRecord } from "@/db/types";
export type { ExecutionRecord };

export interface ExecutionFilters {
  trigger?: string;
  successful?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Hook for managing auto-funding execution history
 * Refactored to use TanStack Query and Dexie
 */
export const useExecutionHistory = (limit = 50) => {
  const { data: executionHistory = [], isLoading, isError } = useExecutionHistoryQuery(limit);
  const operations = useHistoryOperations();

  // Add execution to history
  const addToHistory = useCallback(
    async (record: Omit<ExecutionRecord, "id">) => {
      return operations.addExecution(record);
    },
    [operations]
  );

  // Get filtered and limited history (client-side for simplicity, or extend query)
  const getHistory = useCallback(
    (customLimit = 10, filters: ExecutionFilters = {}) => {
      let filtered = [...executionHistory];

      if (filters.trigger) {
        filtered = filtered.filter((e) => e.trigger === filters.trigger);
      }

      if (filters.successful !== undefined) {
        filtered = filtered.filter((e) => (e.success !== false) === filters.successful);
      }

      // ... other filters if needed

      return filtered.slice(0, customLimit);
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

  return {
    executionHistory,
    isLoading,
    isError,
    addToHistory,
    getHistory,
    getExecutionById,
    clearHistory: operations.clearHistory,
    deleteExecution: operations.deleteExecution,
  };
};
