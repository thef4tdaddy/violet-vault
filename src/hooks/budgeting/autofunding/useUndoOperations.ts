import { useState, useCallback } from "react";
import useUiStore from "../../../stores/ui/uiStore";
import logger from "../../../utils/common/logger";
import type { ExecutionRecord } from "./useExecutionHistory";
import type { RuleExecutionResult } from "./types";

// Helper to create single target transfer
const createSingleTransfer = (executionRecord: ExecutionRecord, result: RuleExecutionResult) => ({
  fromEnvelopeId: executionRecord.sourceEnvelopeId || "unassigned",
  toEnvelopeId: result.targetEnvelopes[0].id,
  amount: result.amount,
  description: result.description || `Auto-funding: ${result.ruleName}`,
  executedAt: executionRecord.executedAt || "",
});

// Helper to create multiple target transfers
const createMultipleTransfers = (executionRecord: ExecutionRecord, result: RuleExecutionResult) => {
  const amountPerTarget = result.amount / result.targetEnvelopes.length;
  return result.targetEnvelopes.map((envelope) => ({
    fromEnvelopeId: executionRecord.sourceEnvelopeId || "unassigned",
    toEnvelopeId: envelope.id,
    amount: amountPerTarget,
    description: result.description || `Auto-funding: ${result.ruleName}`,
    executedAt: executionRecord.executedAt || "",
  }));
};

// Helper to extract undoable transfers from execution results
const extractUndoableTransfers = (executionRecord: ExecutionRecord, executionResults: RuleExecutionResult[]) => {
  const transfers = [] as Array<{
    fromEnvelopeId: string;
    toEnvelopeId: string;
    amount: number;
    description: string;
    executedAt: string;
  }>;

  executionResults.forEach((result) => {
    if (result.success && result.targetEnvelopes) {
      if (result.targetEnvelopes.length === 1) {
        transfers.push(createSingleTransfer(executionRecord, result));
      } else {
        transfers.push(...createMultipleTransfers(executionRecord, result));
      }
    }
  });

  return transfers;
};

// Helper to create undo record
const createUndoRecord = (executionId: string, totalAmount: number) => ({
  id: `undo_${executionId}_${Date.now()}`,
  trigger: "manual_undo",
  executedAt: new Date().toISOString(),
  rulesExecuted: 0,
  totalFunded: -totalAmount, // Negative to indicate reversal
  results: [
    {
      ruleId: "undo_operation",
      ruleName: "Undo Operation",
      success: true,
      amount: totalAmount,
      executedAt: new Date().toISOString(),
      originalExecutionId: executionId,
    },
  ],
  isUndo: true,
  originalExecutionId: executionId,
});

/**
 * Hook for managing auto-funding undo operations
 * Extracted from useAutoFundingHistory.js to reduce complexity
 */
export const useUndoOperations = (initialUndoStack: ExecutionRecord[] = [], addToHistory: (record: unknown) => void) => {
  const budget = useUiStore((state) => state.budget);
  const [undoStack, setUndoStack] = useState(initialUndoStack);

  // Add execution to undo stack if it has successful transfers
  const addToUndoStackCallback = useCallback((executionRecord: ExecutionRecord, executionResults: RuleExecutionResult[]) => {
    try {
      if (executionRecord.totalFunded && executionRecord.totalFunded <= 0) {
        return; // No transfers to undo
      }

      const undoableTransfers = extractUndoableTransfers(executionRecord, executionResults);

      if (undoableTransfers.length > 0) {
        const undoItem = {
          executionId: executionRecord.id,
          executedAt: executionRecord.executedAt || "",
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
      logger.error("Failed to add execution to undo stack", error instanceof Error ? error.message : String(error));
    }
  }, []);

  // Reverse a single transfer
  const reverseTransfer = useCallback(
    async (transfer: {
      fromEnvelopeId: string;
      toEnvelopeId: string;
      amount: number;
      description: string;
    }) => {
      try {
        // Reverse the transfer: move money back from target to source
        await budget.transferFunds(
          transfer.toEnvelopeId,
          transfer.fromEnvelopeId,
          transfer.amount,
          `Undo: ${transfer.description}`
        );

        logger.debug("Transfer reversed", {
          from: transfer.toEnvelopeId,
          to: transfer.fromEnvelopeId,
          amount: transfer.amount,
        });
      } catch (error) {
        logger.error("Failed to reverse transfer", {
          transfer,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    [budget]
  );

  // Undo a specific execution by ID
  const undoExecution = useCallback(
    async (executionId: string) => {
      const undoItem = undoStack.find((item) => item.executionId === executionId && item.canUndo);

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
              : item
          )
        );

        // Add undo record to execution history
        const undoRecord = createUndoRecord(executionId, undoItem.totalAmount);
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
          error: error instanceof Error ? error.message : String(error),
        });
        throw new Error(`Failed to undo execution: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [undoStack, addToHistory, reverseTransfer]
  );

  // Get undoable executions
  const getUndoableExecutions = useCallback(() => {
    return undoStack.filter((item) => item.canUndo);
  }, [undoStack]);

  // Get undo statistics
  const getUndoStatistics = useCallback(() => {
    const undoableItems = getUndoableExecutions();

    return {
      totalUndoable: undoableItems.length,
      totalAmount: undoableItems.reduce((sum, item) => sum + item.totalAmount, 0),
      oldestUndoable:
        undoableItems.length > 0 ? undoableItems[undoableItems.length - 1].executedAt : null,
      newestUndoable: undoableItems.length > 0 ? undoableItems[0].executedAt : null,
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

  return {
    undoStack,
    addToUndoStack: addToUndoStackCallback,
    getUndoableExecutions,
    getUndoStatistics,
    undoLastExecution,
    undoExecution,
  };
};
