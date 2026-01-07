import { useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetDb } from "@/db/budgetDb";
import { queryKeys } from "@/utils/common/queryClient";
import logger from "@/utils/common/logger";
import type { ExecutionRecord } from "@/db/types";

/**
 * Hook for auto-funding execution history operations
 */
export const useHistoryOperations = () => {
  const queryClient = useQueryClient();

  // Add execution record
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

  // Clear execution history
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

  // Delete specific execution record
  const deleteExecutionMutation = useMutation({
    mutationFn: async (id: string) => {
      await budgetDb.autoFundingHistory.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.autoFunding.history() });
    },
  });

  return {
    addExecution: addExecutionMutation.mutateAsync,
    clearHistory: clearHistoryMutation.mutateAsync,
    deleteExecution: deleteExecutionMutation.mutateAsync,
    isPending:
      addExecutionMutation.isPending ||
      clearHistoryMutation.isPending ||
      deleteExecutionMutation.isPending,
  };
};
