import { useCallback } from "react";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";
import logger from "@/utils/common/logger";
import { useHistoryOperations } from "./operations/useHistoryOperations";
import type { ExecutionRecord } from "@/db/types";

// Types for undo logic
type UndoTransfer = {
  fromEnvelopeId: string;
  toEnvelopeId: string;
  amount: number;
  description: string;
  executedAt: string;
};

interface RuleExecutionResult {
  ruleId: string;
  ruleName?: string;
  success: boolean;
  amount?: number;
  amountMoved?: number;
  description?: string;
  targetEnvelopes?: (string | { id: string })[];
  [key: string]: unknown;
}

/**
 * Hook for managing auto-funding undo operations
 */
// Re-defining interface locally to avoid circular deps or move to shared types
interface BudgetData {
  transferFunds: (from: string, to: string, amount: number, description?: string) => Promise<void>;
  [key: string]: unknown;
}

export const useUndoOperations = () => {
  const budget = useUiStore((state: UiStore & { budget?: BudgetData }) => state.budget);
  const { addExecution } = useHistoryOperations();

  // Logic to extract transfers from record (adapted from legacy version)
  const extractUndoableTransfers = useCallback(
    (executionRecord: ExecutionRecord): UndoTransfer[] => {
      const results = (executionRecord.results as RuleExecutionResult[]) || [];
      const transfers: UndoTransfer[] = [];

      results.forEach((result) => {
        if (!result.success) return;

        const amount = result.amount || result.amountMoved || 0;
        if (amount <= 0) return;

        const targetIds = (result.targetEnvelopes || [])
          .map((t) => (typeof t === "string" ? t : t?.id))
          .filter(Boolean) as string[];

        if (targetIds.length === 0) return;

        const sourceId = (executionRecord.sourceEnvelopeId as string) || "unassigned";

        targetIds.forEach((targetId) => {
          transfers.push({
            fromEnvelopeId: sourceId,
            toEnvelopeId: targetId,
            amount: amount / targetIds.length,
            description: result.description || `Auto-funding: ${result.ruleName || "Rule"}`,
            executedAt: executionRecord.executedAt || new Date().toISOString(),
          });
        });
      });

      return transfers;
    },
    []
  );

  const undoExecution = useCallback(
    async (executionRecord: ExecutionRecord) => {
      if (!budget) throw new Error("Budget operations not available");

      try {
        const transfers = extractUndoableTransfers(executionRecord);

        // Reverse all transfers
        for (const transfer of transfers) {
          await budget.transferFunds(
            transfer.toEnvelopeId,
            transfer.fromEnvelopeId,
            transfer.amount,
            `Undo: ${transfer.description}`
          );
        }

        // Add undo record to history
        await addExecution({
          trigger: "manual_undo",
          executedAt: new Date().toISOString(),
          totalFunded: -(executionRecord.totalFunded || 0),
          isUndo: true,
          originalExecutionId: executionRecord.id,
          results: [
            {
              ruleId: "undo_operation",
              ruleName: "Undo Operation",
              success: true,
              amount: executionRecord.totalFunded,
              originalExecutionId: executionRecord.id,
            },
          ],
        });

        return { success: true };
      } catch (error) {
        logger.error("Undo operation failed", error);
        throw error;
      }
    },
    [budget, extractUndoableTransfers, addExecution]
  );

  return {
    undoExecution,
  };
};
