import { useState, useCallback } from "react";
import { useBudgetStore } from "../../../stores/ui/uiStore";
import logger from "../../../utils/common/logger";

/**
 * Hook for managing auto-funding execution history and undo operations
 * Extracted from useAutoFunding.js for Issue #506
 */
export const useAutoFundingHistory = (
  initialHistory = [],
  initialUndoStack = [],
) => {
  const budget = useBudgetStore();
  const [executionHistory, setExecutionHistory] = useState(initialHistory);
  const [undoStack, setUndoStack] = useState(initialUndoStack);

  // Add execution to history
  const addToHistory = useCallback((executionRecord) => {
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

  // Add execution to undo stack if it has successful transfers
  const addToUndoStack = useCallback((executionRecord, executionResults) => {
    try {
      if (executionRecord.totalFunded <= 0) {
        return; // No transfers to undo
      }

      const undoableTransfers = [];

      // Extract transfer information for undo
      executionResults.forEach((result) => {
        if (result.success && result.targetEnvelopes) {
          if (result.targetEnvelopes.length === 1) {
            // Single target transfer
            undoableTransfers.push({
              fromEnvelopeId: "unassigned",
              toEnvelopeId: result.targetEnvelopes[0],
              amount: result.amount,
              description: `Auto-funding: ${result.ruleName}`,
            });
          } else {
            // Multiple target transfers (split remainder)
            const amountPerEnvelope =
              result.amount / result.targetEnvelopes.length;
            result.targetEnvelopes.forEach((envelopeId) => {
              undoableTransfers.push({
                fromEnvelopeId: "unassigned",
                toEnvelopeId: envelopeId,
                amount: amountPerEnvelope,
                description: `Auto-funding (split): ${result.ruleName}`,
              });
            });
          }
        }
      });

      if (undoableTransfers.length > 0) {
        const undoItem = {
          executionId: executionRecord.id,
          executedAt: executionRecord.executedAt,
          transfers: undoableTransfers,
          totalAmount: executionRecord.totalFunded,
          trigger: executionRecord.trigger,
          canUndo: true,
        };

        setUndoStack((prevStack) => {
          const newStack = [undoItem, ...prevStack];
          // Keep only last 10 undoable executions
          return newStack.slice(0, 10);
        });

        logger.debug("Added execution to undo stack", {
          executionId: executionRecord.id,
          transfersCount: undoableTransfers.length,
          totalAmount: executionRecord.totalFunded,
        });
      }
    } catch (error) {
      logger.error("Failed to add execution to undo stack", error);
    }
  }, []);

  // Get execution history with optional filtering
  const getHistory = useCallback(
    (limit = 10, filters = {}) => {
      try {
        let filteredHistory = [...executionHistory];

        // Apply filters
        if (filters.trigger) {
          filteredHistory = filteredHistory.filter(
            (execution) => execution.trigger === filters.trigger,
          );
        }

        if (filters.successful !== undefined) {
          filteredHistory = filteredHistory.filter(
            (execution) => (execution.success !== false) === filters.successful,
          );
        }

        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          filteredHistory = filteredHistory.filter(
            (execution) => new Date(execution.executedAt) >= fromDate,
          );
        }

        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          filteredHistory = filteredHistory.filter(
            (execution) => new Date(execution.executedAt) <= toDate,
          );
        }

        // Apply limit
        return filteredHistory.slice(0, limit);
      } catch (error) {
        logger.error("Failed to get execution history", error);
        return [];
      }
    },
    [executionHistory],
  );

  // Get execution by ID
  const getExecutionById = useCallback(
    (executionId) => {
      return executionHistory.find((execution) => execution.id === executionId);
    },
    [executionHistory],
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

  // Get undoable executions
  const getUndoableExecutions = useCallback(() => {
    return undoStack.filter((item) => item.canUndo);
  }, [undoStack]);

  // Get undo statistics
  const getUndoStatistics = useCallback(() => {
    const undoableItems = getUndoableExecutions();

    return {
      totalUndoable: undoableItems.length,
      totalAmount: undoableItems.reduce(
        (sum, item) => sum + item.totalAmount,
        0,
      ),
      oldestUndoable:
        undoableItems.length > 0
          ? undoableItems[undoableItems.length - 1].executedAt
          : null,
      newestUndoable:
        undoableItems.length > 0 ? undoableItems[0].executedAt : null,
    };
  }, [getUndoableExecutions]);

  // Undo the most recent execution
  const undoLastExecution = useCallback(async () => {
    const undoableExecutions = getUndoableExecutions();
    if (undoableExecutions.length === 0) {
      throw new Error("No undoable executions available");
    }

    return await undoExecution(undoableExecutions[0].executionId);
  }, [getUndoableExecutions]);

  // Undo a specific execution by ID
  const undoExecution = useCallback(
    async (executionId) => {
      const undoItem = undoStack.find(
        (item) => item.executionId === executionId && item.canUndo,
      );

      if (!undoItem) {
        throw new Error(`Execution ${executionId} is not undoable`);
      }

      try {
        logger.info("Starting undo operation", {
          executionId,
          transfersToReverse: undoItem.transfers.length,
          totalAmount: undoItem.totalAmount,
        });

        // Reverse all transfers
        for (const transfer of undoItem.transfers) {
          await reverseTransfer(transfer);
        }

        // Mark as undone
        setUndoStack((prevStack) =>
          prevStack.map((item) =>
            item.executionId === executionId
              ? { ...item, canUndo: false, undoneAt: new Date().toISOString() }
              : item,
          ),
        );

        // Add undo record to execution history
        const undoRecord = {
          id: `undo_${executionId}_${Date.now()}`,
          trigger: "manual_undo",
          executedAt: new Date().toISOString(),
          rulesExecuted: 0,
          totalFunded: -undoItem.totalAmount, // Negative to indicate reversal
          results: [
            {
              ruleId: "undo_operation",
              ruleName: "Undo Operation",
              success: true,
              amount: undoItem.totalAmount,
              executedAt: new Date().toISOString(),
              originalExecutionId: executionId,
            },
          ],
          isUndo: true,
          originalExecutionId: executionId,
        };

        addToHistory(undoRecord);

        logger.info("Undo operation completed successfully", {
          executionId,
          amountReversed: undoItem.totalAmount,
        });

        return {
          success: true,
          executionId,
          amountReversed: undoItem.totalAmount,
          transfersReversed: undoItem.transfers.length,
          undoRecord,
        };
      } catch (error) {
        logger.error("Undo operation failed", {
          executionId,
          error: error.message,
        });
        throw new Error(`Failed to undo execution: ${error.message}`);
      }
    },
    [undoStack, addToHistory],
  );

  // Reverse a single transfer
  const reverseTransfer = useCallback(
    async (transfer) => {
      try {
        // Reverse the transfer: move money back from target to source
        await budget.transferFunds(
          transfer.toEnvelopeId,
          transfer.fromEnvelopeId,
          transfer.amount,
          `Undo: ${transfer.description}`,
        );

        logger.debug("Transfer reversed", {
          from: transfer.toEnvelopeId,
          to: transfer.fromEnvelopeId,
          amount: transfer.amount,
        });
      } catch (error) {
        logger.error("Failed to reverse transfer", {
          transfer,
          error: error.message,
        });
        throw error;
      }
    },
    [budget],
  );

  // Get execution statistics
  const getExecutionStatistics = useCallback(() => {
    try {
      const totalExecutions = executionHistory.length;
      const successfulExecutions = executionHistory.filter(
        (execution) => execution.success !== false,
      );
      const totalFunded = executionHistory.reduce(
        (sum, execution) => sum + Math.max(0, execution.totalFunded || 0),
        0,
      );
      const totalReversed = executionHistory
        .filter((execution) => execution.isUndo)
        .reduce(
          (sum, execution) => sum + Math.abs(execution.totalFunded || 0),
          0,
        );

      // Group by trigger
      const byTrigger = executionHistory.reduce((acc, execution) => {
        acc[execution.trigger] = (acc[execution.trigger] || 0) + 1;
        return acc;
      }, {});

      // Group by date (last 30 days)
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      const recentExecutions = executionHistory.filter(
        (execution) => new Date(execution.executedAt) >= last30Days,
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
          successfulExecutions.length > 0
            ? totalFunded / successfulExecutions.length
            : 0,
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
  }, [executionHistory]);

  // Remove old entries from history and undo stack
  const cleanup = useCallback((maxHistoryAge = 90, maxUndoAge = 30) => {
    try {
      const historyDate = new Date();
      historyDate.setDate(historyDate.getDate() - maxHistoryAge);

      const undoDate = new Date();
      undoDate.setDate(undoDate.getDate() - maxUndoAge);

      setExecutionHistory((prevHistory) =>
        prevHistory.filter(
          (execution) => new Date(execution.executedAt) > historyDate,
        ),
      );

      setUndoStack((prevStack) =>
        prevStack.filter((item) => new Date(item.executedAt) > undoDate),
      );

      logger.info("History cleanup completed", {
        maxHistoryAge,
        maxUndoAge,
        historyCutoff: historyDate.toISOString(),
        undoCutoff: undoDate.toISOString(),
      });
    } catch (error) {
      logger.error("Failed to cleanup history", error);
    }
  }, []);

  // Export history data
  const exportHistory = useCallback(
    (options = {}) => {
      try {
        const {
          includeUndoStack = true,
          dateFrom,
          dateTo,
          format = "json",
        } = options;

        let historyToExport = [...executionHistory];

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          historyToExport = historyToExport.filter(
            (execution) => new Date(execution.executedAt) >= fromDate,
          );
        }

        if (dateTo) {
          const toDate = new Date(dateTo);
          historyToExport = historyToExport.filter(
            (execution) => new Date(execution.executedAt) <= toDate,
          );
        }

        const exportData = {
          executionHistory: historyToExport,
          undoStack: includeUndoStack ? undoStack : [],
          exportedAt: new Date().toISOString(),
          totalExecutions: historyToExport.length,
          dateRange: {
            from: dateFrom,
            to: dateTo,
          },
        };

        if (format === "csv") {
          // Convert to CSV format for basic data
          const csvHeaders = [
            "Execution ID",
            "Trigger",
            "Executed At",
            "Rules Executed",
            "Total Funded",
            "Success",
          ].join(",");

          const csvRows = historyToExport.map((execution) =>
            [
              execution.id,
              execution.trigger,
              execution.executedAt,
              execution.rulesExecuted || 0,
              execution.totalFunded || 0,
              execution.success !== false ? "true" : "false",
            ].join(","),
          );

          return {
            format: "csv",
            content: [csvHeaders, ...csvRows].join("\n"),
            filename: `auto-funding-history-${new Date().toISOString().split("T")[0]}.csv`,
          };
        }

        return {
          format: "json",
          content: JSON.stringify(exportData, null, 2),
          data: exportData,
          filename: `auto-funding-history-${new Date().toISOString().split("T")[0]}.json`,
        };
      } catch (error) {
        logger.error("Failed to export history", error);
        throw error;
      }
    },
    [executionHistory, undoStack],
  );

  return {
    // State
    executionHistory,
    undoStack,

    // History management
    addToHistory,
    addToUndoStack,
    getHistory,
    getExecutionById,
    clearHistory,
    cleanup,

    // Undo operations
    getUndoableExecutions,
    getUndoStatistics,
    undoLastExecution,
    undoExecution,

    // Statistics and analysis
    getExecutionStatistics,

    // Import/Export
    exportHistory,
  };
};
