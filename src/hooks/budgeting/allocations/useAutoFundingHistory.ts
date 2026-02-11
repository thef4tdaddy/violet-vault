import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/core/common/queryClient";
import logger from "@/utils/core/common/logger";
import useUiStore, { type UiStore } from "@/stores/ui/uiStore";
import type { ExecutionRecord } from "@/db/types";

// Types for history and undo
export interface ExecutionFilters {
  trigger?: string;
  successful?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

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

interface BudgetData {
  transferFunds: (from: string, to: string, amount: number, description?: string) => Promise<void>;
  [key: string]: unknown;
}

export interface ExportOptions {
  includeUndoStack?: boolean;
  dateFrom?: string;
  dateTo?: string;
  format?: "json" | "csv";
}

interface ExportResult {
  format: string;
  content: string;
  data?: unknown;
  filename: string;
}

/**
 * Unified hook for managing auto-funding execution history and undo operations
 */
// --- Sub-hooks ---

const useHistoryQueries = (limit: number) => {
  return useQuery({
    queryKey: queryKeys.autoFunding.history(limit),
    queryFn: async () => {
      return budgetDb.autoFundingHistory.orderBy("executedAt").reverse().limit(limit).toArray();
    },
  });
};

const useHistoryMutations = () => {
  const queryClient = useQueryClient();

  const addExecutionMutation = useMutation({
    mutationFn: async (record: Omit<ExecutionRecord, "id">) => {
      const id = crypto.randomUUID();
      const newRecord = { ...record, id };
      await budgetDb.autoFundingHistory.add(newRecord as ExecutionRecord);
      return newRecord as ExecutionRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.history() });
    },
    onError: (error) => {
      logger.error("Failed to add execution history record", error);
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      await budgetDb.autoFundingHistory.clear();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.history() });
    },
    onError: (error) => {
      logger.error("Failed to clear execution history", error);
    },
  });

  const deleteExecutionMutation = useMutation({
    mutationFn: async (id: string) => {
      await budgetDb.autoFundingHistory.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.history() });
    },
  });

  return {
    addExecutionMutation,
    clearHistoryMutation,
    deleteExecutionMutation,
  };
};

const useUndoLogic = (
  executionHistory: ExecutionRecord[],
  budget: BudgetData | undefined,
  addExecutionMutation: ReturnType<typeof useHistoryMutations>["addExecutionMutation"]
) => {
  const undoableExecutions = useMemo(() => {
    return executionHistory.filter((e) => !e.isUndo && e.success !== false);
  }, [executionHistory]);

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
        for (const transfer of transfers) {
          await budget.transferFunds(
            transfer.toEnvelopeId,
            transfer.fromEnvelopeId,
            transfer.amount,
            `Undo: ${transfer.description}`
          );
        }

        await addExecutionMutation.mutateAsync({
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
    [budget, extractUndoableTransfers, addExecutionMutation]
  );

  const undoLastExecution = useCallback(async () => {
    if (undoableExecutions.length === 0) throw new Error("No undoable executions");
    return undoExecution(undoableExecutions[0]);
  }, [undoableExecutions, undoExecution]);

  return {
    undoableExecutions,
    undoExecution,
    undoLastExecution,
  };
};

const useHistoryStats = (executionHistory: ExecutionRecord[]) => {
  return useCallback(() => {
    try {
      const totalExecutions = executionHistory.length;
      const successfulExecutions = executionHistory.filter((e) => e.success !== false);
      const totalFunded = executionHistory.reduce(
        (sum, e) => sum + Math.max(0, e.totalFunded || 0),
        0
      );
      const totalReversed = executionHistory
        .filter((e) => e.isUndo)
        .reduce((sum, e) => sum + Math.abs(e.totalFunded || 0), 0);

      const byTrigger = executionHistory.reduce((acc: Record<string, number>, e) => {
        acc[e.trigger] = (acc[e.trigger] || 0) + 1;
        return acc;
      }, {});

      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);
      const recentExecutions = executionHistory.filter(
        (e) => e.executedAt && new Date(e.executedAt) >= last30Days
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
          successfulExecutions.length > 0 ? totalFunded / successfulExecutions.length : 0,
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
};

const useHistoryExport = (executionHistory: ExecutionRecord[]) => {
  const generateFilename = useCallback((format: string): string => {
    const dateStr = new Date().toISOString().split("T")[0];
    return `auto-funding-history-${dateStr}.${format}`;
  }, []);

  return useCallback(
    (options: ExportOptions = {}): ExportResult => {
      try {
        const { includeUndoStack = true, dateFrom, dateTo, format = "json" } = options;
        let historyToExport = [...executionHistory];

        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          historyToExport = historyToExport.filter(
            (e) => e.executedAt && new Date(e.executedAt) >= fromDate
          );
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          historyToExport = historyToExport.filter(
            (e) => e.executedAt && new Date(e.executedAt) <= toDate
          );
        }

        const exportData = {
          executionHistory: historyToExport,
          undoStack: includeUndoStack ? [] : [], // Undo stack logic might need more investigation if it's a separate store
          exportedAt: new Date().toISOString(),
          totalExecutions: historyToExport.length,
          dateRange: { from: dateFrom, to: dateTo },
        };

        if (format === "csv") {
          const csvHeaders = [
            "Execution ID",
            "Trigger",
            "Executed At",
            "Rules Executed",
            "Total Funded",
            "Success",
          ].join(",");
          const csvRows = historyToExport.map((e) =>
            [
              e.id,
              e.trigger,
              e.executedAt || "",
              e.rulesExecuted || 0,
              e.totalFunded || 0,
              e.success !== false ? "true" : "false",
            ].join(",")
          );
          return {
            format: "csv",
            content: [csvHeaders, ...csvRows].join("\n"),
            filename: generateFilename("csv"),
          };
        }

        return {
          format: "json",
          content: JSON.stringify(exportData, null, 2),
          data: exportData,
          filename: generateFilename("json"),
        };
      } catch (error) {
        logger.error("Failed to export history", error);
        throw error;
      }
    },
    [executionHistory, generateFilename]
  );
};

/**
 * Unified hook for managing auto-funding execution history and undo operations
 */
export const useAutoFundingHistory = (limit = 50) => {
  const budget = useUiStore((state: UiStore & { budget?: BudgetData }) => state.budget);

  // Queries
  const { data: executionHistory = [], isLoading, isError } = useHistoryQueries(limit);

  // Mutations
  const { addExecutionMutation, clearHistoryMutation, deleteExecutionMutation } =
    useHistoryMutations();

  // Logic Hooks
  const { undoableExecutions, undoExecution, undoLastExecution } = useUndoLogic(
    executionHistory as ExecutionRecord[],
    budget,
    addExecutionMutation
  );

  const getExecutionStatistics = useHistoryStats(executionHistory as ExecutionRecord[]);
  const exportHistory = useHistoryExport(executionHistory as ExecutionRecord[]);

  return {
    // State
    executionHistory,
    isLoading,
    isError,

    // Operations
    addToHistory: addExecutionMutation.mutateAsync,
    clearHistory: clearHistoryMutation.mutateAsync,
    deleteExecution: deleteExecutionMutation.mutateAsync,
    getExecutionById: (id: string) => executionHistory.find((e) => e.id === id),

    // Undo
    undoExecution,
    undoLastExecution,
    getUndoableExecutions: () => undoableExecutions,

    // Stats & Export
    getExecutionStatistics,
    exportHistory,

    // Compatibility helper
    getHistory: useCallback(
      (limit?: number) => {
        return limit ? executionHistory.slice(0, limit) : executionHistory;
      },
      [executionHistory]
    ),
  };
};
