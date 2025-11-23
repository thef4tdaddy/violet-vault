import { useState, useCallback } from "react";
import useUiStore from "../../../stores/ui/uiStore";
import logger from "../../../utils/common/logger";
import type { ExecutionRecord } from "./useExecutionHistory";
import type { RuleExecutionResult, UndoStackEntry as AutofundingUndoStackEntry } from "./types";

// Type for the store state
type UiStoreState = {
  budget: unknown;
};

type UndoTransfer = {
  fromEnvelopeId: string;
  toEnvelopeId: string;
  amount: number;
  description: string;
  executedAt: string;
};

interface UndoStackItem extends AutofundingUndoStackEntry {
  executionId: string;
  executedAt: string;
  transfers: UndoTransfer[];
  totalAmount: number;
  createdAt: string;
  undoneAt?: string;
}

export type UndoOperationEntry = UndoStackItem;

const toNumeric = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const getResultAmount = (result: RuleExecutionResult): number => {
  const amountCandidates = [result.amount, result.amountMoved];
  for (const candidate of amountCandidates) {
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return candidate;
    }
  }
  return 0;
};

const getTargetEnvelopeIds = (
  targetEnvelopes: RuleExecutionResult["targetEnvelopes"]
): string[] => {
  if (!targetEnvelopes) {
    return [];
  }

  return targetEnvelopes
    .map((target) => {
      if (typeof target === "string") {
        return target;
      }
      if (target && typeof target === "object" && "id" in target && typeof target.id === "string") {
        return target.id;
      }
      return null;
    })
    .filter((id): id is string => Boolean(id && id.trim().length > 0));
};

const resolveDescription = (result: RuleExecutionResult): string => {
  if (typeof result.description === "string" && result.description.trim().length > 0) {
    return result.description;
  }
  if (typeof result.ruleName === "string" && result.ruleName.trim().length > 0) {
    return `Auto-funding: ${result.ruleName}`;
  }
  return "Auto-funding undo";
};

const resolveSourceEnvelopeId = (executionRecord: ExecutionRecord): string => {
  const candidate = executionRecord.sourceEnvelopeId;
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }
  return "unassigned";
};

const createSingleTransfer = (
  executionRecord: ExecutionRecord,
  result: RuleExecutionResult,
  targetEnvelopeId: string,
  amount: number
): UndoTransfer => ({
  fromEnvelopeId: resolveSourceEnvelopeId(executionRecord),
  toEnvelopeId: targetEnvelopeId,
  amount,
  description: resolveDescription(result),
  executedAt: executionRecord.executedAt ?? new Date().toISOString(),
});

const createMultipleTransfers = (
  executionRecord: ExecutionRecord,
  result: RuleExecutionResult,
  targetEnvelopeIds: string[],
  amount: number
): UndoTransfer[] => {
  if (targetEnvelopeIds.length === 0 || amount <= 0) {
    return [];
  }

  const baseAmount = Math.floor((amount / targetEnvelopeIds.length) * 100) / 100;
  const transfers: UndoTransfer[] = [];
  let distributed = 0;

  targetEnvelopeIds.forEach((targetId, index) => {
    const isLast = index === targetEnvelopeIds.length - 1;
    const transferAmount = isLast ? amount - distributed : baseAmount;
    distributed += transferAmount;

    transfers.push(
      createSingleTransfer(executionRecord, result, targetId, Math.max(0, transferAmount))
    );
  });

  return transfers;
};

const extractUndoableTransfers = (
  executionRecord: ExecutionRecord,
  executionResults: RuleExecutionResult[]
): UndoTransfer[] => {
  const transfers: UndoTransfer[] = [];

  executionResults.forEach((result) => {
    if (!result.success) {
      return;
    }

    const amount = getResultAmount(result);
    if (amount <= 0) {
      return;
    }

    const targetEnvelopeIds = getTargetEnvelopeIds(result.targetEnvelopes);
    if (targetEnvelopeIds.length === 0) {
      return;
    }

    if (targetEnvelopeIds.length === 1) {
      transfers.push(createSingleTransfer(executionRecord, result, targetEnvelopeIds[0], amount));
    } else {
      transfers.push(
        ...createMultipleTransfers(executionRecord, result, targetEnvelopeIds, amount)
      );
    }
  });

  return transfers;
};

const createUndoRecord = (executionId: string, totalAmount: number): ExecutionRecord => {
  const timestamp = new Date().toISOString();

  return {
    id: `undo_${executionId}_${Date.now()}`,
    trigger: "manual_undo",
    executedAt: timestamp,
    rulesExecuted: 0,
    totalFunded: -totalAmount,
    results: [
      {
        ruleId: "undo_operation",
        ruleName: "Undo Operation",
        success: true,
        amount: totalAmount,
        executedAt: timestamp,
        originalExecutionId: executionId,
      },
    ],
    isUndo: true,
    originalExecutionId: executionId,
  };
};

/**
 * Hook for managing auto-funding undo operations
 * Extracted from useAutoFundingHistory.js to reduce complexity
 */
export const useUndoOperations = (
  initialUndoStack: UndoStackItem[] = [],
  addToHistory: (record: ExecutionRecord) => void
) => {
  const budget = useUiStore((state: UiStoreState) => state.budget);
  const [undoStack, setUndoStack] = useState<UndoStackItem[]>(initialUndoStack);

  // Add execution to undo stack if it has successful transfers
  const addToUndoStackCallback = useCallback(
    (executionRecord: ExecutionRecord, executionResults: RuleExecutionResult[]) => {
      try {
        const totalFunded = toNumeric(executionRecord.totalFunded);
        if (totalFunded <= 0) {
          return; // No transfers to undo
        }

        const undoableTransfers = extractUndoableTransfers(executionRecord, executionResults);

        if (undoableTransfers.length > 0) {
          const timestamp = executionRecord.executedAt || new Date().toISOString();

          const undoItem: UndoStackItem = {
            executionId: executionRecord.id,
            executedAt: timestamp,
            canUndo: true,
            transfers: undoableTransfers,
            totalAmount: totalFunded,
            createdAt: new Date().toISOString(),
            action: "auto_funding_execution",
            timestamp,
          };

          setUndoStack((prevStack) => [undoItem, ...prevStack.slice(0, 49)]);

          logger.debug("Execution added to undo stack", {
            executionId: executionRecord.id,
            transfersCount: undoableTransfers.length,
            totalAmount: totalFunded,
          });
        }
      } catch (error) {
        logger.error(
          "Failed to add execution to undo stack",
          error instanceof Error ? error.message : String(error)
        );
      }
    },
    []
  );

  // Reverse a single transfer
  const reverseTransfer = useCallback(
    async (transfer: UndoTransfer) => {
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
        throw new Error(
          `Failed to undo execution: ${error instanceof Error ? error.message : String(error)}`
        );
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
