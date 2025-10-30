/**
 * Paycheck-related mutations
 * Complex paycheck processing logic extracted from useBudgetData
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../utils/common/queryClient";
import { processPaycheck } from "../../../utils/budgeting/paycheckProcessing";
import { deletePaycheck } from "../../../utils/budgeting/paycheckDeletion";
import logger from "../../../utils/common/logger.ts";

export const usePaycheckMutations = (envelopesQuery, savingsGoalsQuery) => {
  const queryClient = useQueryClient();

  const processPaycheckMutation = useMutation({
    mutationKey: ["paychecks", "process"],
    mutationFn: async (paycheckData) => {
      return await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
    },
    onError: (error) => {
      logger.error("Paycheck processing failed", error, {
        source: "processPaycheckMutation",
      });
    },
  });

  const deletePaycheckMutation = useMutation({
    mutationKey: ["paychecks", "delete"],
    mutationFn: async (paycheckId: string) => {
      return await deletePaycheck(paycheckId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
    },
  });

  return {
    processPaycheck: processPaycheckMutation.mutate,
    processPaycheckAsync: processPaycheckMutation.mutateAsync,
    deletePaycheck: deletePaycheckMutation.mutate,
    deletePaycheckAsync: deletePaycheckMutation.mutateAsync,

    isProcessingPaycheck: processPaycheckMutation.isPending,
    isDeletingPaycheck: deletePaycheckMutation.isPending,
  };
};
