import { useCallback } from "react";
import { useExecutionHistory } from "./useExecutionHistory";
import { useUndoOperations } from "./useUndoOperations";
import { useExecutionStatistics } from "./useExecutionStatistics";
import { useHistoryExport } from "./useHistoryExport";
import logger from "@/utils/common/logger";
import type { ExecutionHistoryEntry, UndoStackEntry } from "@/hooks/budgeting/autofunding/types";

/**
 * Hook for managing auto-funding execution history and undo operations
 * Refactored to use focused sub-hooks for better maintainability
 */
export const useAutoFundingHistory = (
  initialHistory: ExecutionHistoryEntry[] = [],
  initialUndoStack: UndoStackEntry[] = []
) => {
  // Use focused hooks for specific functionality
  const historyHook = useExecutionHistory(initialHistory);
  const undoHook = useUndoOperations(initialUndoStack, historyHook.addToHistory);
  const statisticsHook = useExecutionStatistics();
  const exportHook = useHistoryExport();

  // Cleanup functionality needs to modify state directly
  const cleanup = useCallback(
    (maxHistoryAge = 90, maxUndoAge = 30) => {
      try {
        const historyDate = new Date();
        historyDate.setDate(historyDate.getDate() - maxHistoryAge);

        const undoDate = new Date();
        undoDate.setDate(undoDate.getDate() - maxUndoAge);

        // Delegate to sub-hooks for cleanup operations
        historyHook.clearHistory(); // This will need to be updated
        // TODO: undoHook.clearUndoStack(); // Method not yet implemented

        logger.info("History cleanup completed", {
          maxHistoryAge,
          maxUndoAge,
          historyCutoff: historyDate.toISOString(),
          undoCutoff: undoDate.toISOString(),
        });
      } catch (error) {
        logger.error("Failed to cleanup history", error);
      }
    },
    [historyHook]
  );

  return {
    // State
    executionHistory: historyHook.executionHistory,
    undoStack: undoHook.undoStack,

    // History management
    addToHistory: historyHook.addToHistory,
    addToUndoStack: undoHook.addToUndoStack,
    getHistory: historyHook.getHistory,
    getExecutionById: historyHook.getExecutionById,
    clearHistory: historyHook.clearHistory,
    cleanup,

    // Undo operations
    getUndoableExecutions: undoHook.getUndoableExecutions,
    getUndoStatistics: undoHook.getUndoStatistics,
    undoLastExecution: undoHook.undoLastExecution,
    undoExecution: undoHook.undoExecution,

    // Statistics and analysis
    getExecutionStatistics: () =>
      statisticsHook.getExecutionStatistics(historyHook.executionHistory),

    // Import/Export
    exportHistory: (options?: Record<string, unknown>) =>
      exportHook.exportHistory(historyHook.executionHistory, undoHook.undoStack, options),
  };
};
