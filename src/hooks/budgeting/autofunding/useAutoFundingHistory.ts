import { useCallback, useMemo } from "react";
import { useExecutionHistory } from "./useExecutionHistory";
import { useUndoOperations } from "./useUndoOperations";
import { useExecutionStatistics } from "./useExecutionStatistics";
import { useHistoryExport } from "./useHistoryExport";

/**
 * Hook for managing auto-funding execution history and undo operations
 * Synchronized with Dexie and TanStack Query
 */
export const useAutoFundingHistory = (limit = 50) => {
  const history = useExecutionHistory(limit);
  const undo = useUndoOperations();
  const statistics = useExecutionStatistics();
  const exporter = useHistoryExport();

  // Derived undoable executions
  const undoableExecutions = useMemo(() => {
    return history.executionHistory.filter((e) => !e.isUndo && e.success !== false);
  }, [history.executionHistory]);

  const undoLastExecution = useCallback(async () => {
    if (undoableExecutions.length === 0) throw new Error("No undoable executions");
    return undo.undoExecution(undoableExecutions[0]);
  }, [undoableExecutions, undo]);

  return {
    // State
    executionHistory: history.executionHistory,
    isLoading: history.isLoading,
    isError: history.isError,

    // Operations
    addToHistory: history.addToHistory,
    clearHistory: history.clearHistory,
    getHistory: history.getHistory,
    getExecutionById: history.getExecutionById,

    // Undo
    undoExecution: undo.undoExecution,
    undoLastExecution,
    getUndoableExecutions: () => undoableExecutions,

    // Stats & Export
    getExecutionStatistics: () => statistics.getExecutionStatistics(history.executionHistory),
    exportHistory: (options?: Record<string, unknown>) =>
      exporter.exportHistory(history.executionHistory, [], options),
  };
};
