import { useState, useCallback } from "react";
import { useBudgetStore } from "../../../stores/ui/uiStore";
import logger from "../../../utils/common/logger";

/**
 * Hook for managing auto-funding undo operations
 * Extracted from useAutoFundingHistory.js to reduce complexity
 */
export const useUndoOperations = (initialUndoStack = [], addToHistory) => {
  const budget = useBudgetStore();
  const [undoStack, setUndoStack] = useState(initialUndoStack);

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
              fromEnvelopeId: executionRecord.sourceEnvelopeId || "unassigned",
              toEnvelopeId: result.targetEnvelopes[0].id,
              amount: result.amount,
              description:
                result.description || `Auto-funding: ${result.ruleName}`,
              executedAt: executionRecord.executedAt,
            });
          } else {
            // Multiple target transfers - split amount
            const amountPerTarget =
              result.amount / result.targetEnvelopes.length;
            result.targetEnvelopes.forEach((envelope) => {
              undoableTransfers.push({
                fromEnvelopeId:
                  executionRecord.sourceEnvelopeId || "unassigned",
                toEnvelopeId: envelope.id,
                amount: amountPerTarget,
                description:
                  result.description || `Auto-funding: ${result.ruleName}`,
                executedAt: executionRecord.executedAt,
              });
            });
          }
        }
      });

      if (undoableTransfers.length > 0) {
        const undoItem = {
          executionId: executionRecord.id,
          executedAt: executionRecord.executedAt,
          canUndo: true,
          transfers: undoableTransfers,
          totalAmount: executionRecord.totalFunded,
          createdAt: new Date().toISOString(),
        };

        setUndoStack((prevStack) => [undoItem, ...prevStack.slice(0, 49)]);

        logger.debug("Execution added to undo stack", {
          executionId: executionRecord.id,
          transfersCount: undoableTransfers.length,
          totalAmount: executionRecord.totalFunded,
        });
      }
    } catch (error) {
      logger.error("Failed to add execution to undo stack", error);
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
  }, [getUndoableExecutions, undoExecution]);

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
    [undoStack, addToHistory, reverseTransfer],
  );

  return {
    undoStack,
    addToUndoStack,
    getUndoableExecutions,
    getUndoStatistics,
    undoLastExecution,
    undoExecution,
  };
};
