import { useState, useCallback } from "react";
import { useTransferFunds } from "@/hooks/budgeting/mutations/useTransferFunds";
import logger from "@/utils/common/logger";
import type {
  ExecutionHistoryEntry,
  RuleExecutionResult,
  ExecutionDetails,
} from "@/hooks/budgeting/autofunding/types";

/**
 * Transfer representation for undo operations
 */
interface UndoTransfer {
  fromEnvelopeId: string;
  toEnvelopeId: string;
  amount: number;
  description: string;
  executedAt: string;
}

/**
 * Undo stack item
 */
interface UndoStackItem {
  executionId: string;
  executedAt: string;
  canUndo: boolean;
  transfers: UndoTransfer[];
  totalAmount: number;
  createdAt: string;
  undoneAt?: string;
}

/**
 * Undo statistics
 */
interface UndoStatistics {
  totalUndoable: number;
  totalAmount: number;
  oldestUndoable: string | null;
  newestUndoable: string | null;
}

/**
 * Target envelope in execution result
 */
interface TargetEnvelope {
  id: string;
  [key: string]: unknown;
}

/**
 * Extended rule execution result with target envelopes
 */
interface ExtendedRuleExecutionResult extends RuleExecutionResult {
  targetEnvelopes?: TargetEnvelope[];
  description?: string;
  ruleName?: string;
  amount?: number;
}

// Helper to create single target transfer
const createSingleTransfer = (
  executionRecord: ExecutionDetails,
  result: ExtendedRuleExecutionResult
): UndoTransfer => {
  const sourceEnvelopeId =
    typeof executionRecord.sourceEnvelopeId === "string"
      ? executionRecord.sourceEnvelopeId
      : "unassigned";

  return {
    fromEnvelopeId: sourceEnvelopeId,
    toEnvelopeId: result.targetEnvelopes![0].id,
    amount: result.amount || 0,
    description: result.description || `Auto-funding: ${result.ruleName || "Unknown"}`,
    executedAt: executionRecord.executedAt,
  };
};

// Helper to create multiple target transfers
const createMultipleTransfers = (
  executionRecord: ExecutionDetails,
  result: ExtendedRuleExecutionResult
): UndoTransfer[] => {
  const sourceEnvelopeId =
    typeof executionRecord.sourceEnvelopeId === "string"
      ? executionRecord.sourceEnvelopeId
      : "unassigned";

  const amountPerTarget = (result.amount || 0) / (result.targetEnvelopes?.length || 1);
  return (result.targetEnvelopes || []).map((envelope) => ({
    fromEnvelopeId: sourceEnvelopeId,
    toEnvelopeId: envelope.id,
    amount: amountPerTarget,
    description: result.description || `Auto-funding: ${result.ruleName || "Unknown"}`,
    executedAt: executionRecord.executedAt,
  }));
};

// Helper to extract undoable transfers from execution results
const extractUndoableTransfers = (
  executionRecord: ExecutionDetails,
  executionResults: ExtendedRuleExecutionResult[]
): UndoTransfer[] => {
  const transfers: UndoTransfer[] = [];

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
const createUndoRecord = (
  executionId: string,
  totalAmount: number
): ExecutionHistoryEntry => ({
  id: `undo_${executionId}_${Date.now()}`,
  trigger: "manual_undo",
  timestamp: new Date().toISOString(),
  executedAt: new Date().toISOString(),
  rulesExecuted: 0,
  totalFunded: -totalAmount, // Negative to indicate reversal
  results: [
    {
      ruleId: "undo_operation",
      ruleName: "Undo Operation",
      success: true,
      amountMoved: totalAmount,
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
export const useUndoOperations = (
  initialUndoStack: UndoStackItem[] = [],
  addToHistory: (record: ExecutionHistoryEntry) => void
) => {
  const { mutateAsync: transferFundsAsync } = useTransferFunds();
  const [undoStack, setUndoStack] = useState<UndoStackItem[]>(initialUndoStack);

  // Add execution to undo stack if it has successful transfers
  const addToUndoStack = useCallback(
    (executionRecord: ExecutionDetails, executionResults: ExtendedRuleExecutionResult[]) => {
      try {
        if (executionRecord.totalFunded <= 0) {
          return; // No transfers to undo
        }

        const undoableTransfers = extractUndoableTransfers(executionRecord, executionResults);

        if (undoableTransfers.length > 0) {
          const undoItem: UndoStackItem = {
            executionId: executionRecord.id,
            executedAt: executionRecord.executedAt,
            canUndo: true,
            transfers: undoableTransfers,
            totalAmount: executionRecord.totalFunded,
            createdAt: new Date().toISOString(),
          };

          setUndoStack((prevStack: UndoStackItem[]) => [undoItem, ...prevStack.slice(0, 49)]);

          logger.debug("Execution added to undo stack", {
            executionId: executionRecord.id,
            transfersCount: undoableTransfers.length,
            totalAmount: executionRecord.totalFunded,
          });
        }
      } catch (error) {
        logger.error("Failed to add execution to undo stack", error);
      }
    },
    []
  );

  // Reverse a single transfer
  const reverseTransfer = useCallback(
    async (transfer: UndoTransfer) => {
      try {
        // Reverse the transfer: move money back from target to source
        await transferFundsAsync({
          fromEnvelopeId: transfer.toEnvelopeId,
          toEnvelopeId: transfer.fromEnvelopeId,
          amount: transfer.amount,
          description: `Undo: ${transfer.description}`,
        });

        logger.debug("Transfer reversed", {
          from: transfer.toEnvelopeId,
          to: transfer.fromEnvelopeId,
          amount: transfer.amount,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger.error("Failed to reverse transfer", {
          transfer,
          error: errorMessage,
        });
        throw error;
      }
    },
    [transferFundsAsync]
  );

  // Undo a specific execution by ID
  const undoExecution = useCallback(
    async (executionId: string) => {
      const undoItem = undoStack.find(
        (item: UndoStackItem) => item.executionId === executionId && item.canUndo
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
        setUndoStack((prevStack: UndoStackItem[]) =>
          prevStack.map((item: UndoStackItem) =>
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
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        logger.error("Undo operation failed", {
          executionId,
          error: errorMessage,
        });
        throw new Error(`Failed to undo execution: ${errorMessage}`);
      }
    },
    [undoStack, addToHistory, reverseTransfer]
  );

  // Get undoable executions
  const getUndoableExecutions = useCallback((): UndoStackItem[] => {
    return undoStack.filter((item: UndoStackItem) => item.canUndo);
  }, [undoStack]);

  // Get undo statistics
  const getUndoStatistics = useCallback((): UndoStatistics => {
    const undoableItems = getUndoableExecutions();

    return {
      totalUndoable: undoableItems.length,
      totalAmount: undoableItems.reduce(
        (sum: number, item: UndoStackItem) => sum + item.totalAmount,
        0
      ),
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
    addToUndoStack,
    getUndoableExecutions,
    getUndoStatistics,
    undoLastExecution,
    undoExecution,
  };
};
