import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../utils/common/queryClient";
import { setBudgetMetadata } from "../../../db/budgetDb";
import type { BudgetRecord } from "../../../db/types";
import logger from "../../../utils/common/logger";

export const useBudgetMetadataMutation = () => {
  const queryClient = useQueryClient();

  const updateMetadataMutation = useMutation({
    mutationFn: async (updates: Partial<BudgetRecord>) => {
      logger.debug("TanStack Query: Updating budget metadata in Dexie", updates);
      await setBudgetMetadata(updates);
      return updates;
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata as readonly unknown[] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      logger.debug("TanStack Query: Budget metadata updated successfully");
    },
    onError: (error) => {
      logger.error("Failed to update budget metadata:", error);
    },
  });

  return {
    updateMetadata: updateMetadataMutation.mutateAsync,
    isUpdating: updateMetadataMutation.isPending,
    mutation: updateMetadataMutation,
  };
};
