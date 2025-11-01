/**
 * Paycheck-related mutations
 * Complex paycheck processing logic extracted from useBudgetData
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../utils/common/queryClient";
import { processPaycheck } from "../../../utils/budgeting/paycheckProcessing";
import { deletePaycheck } from "../../../utils/budgeting/paycheckDeletion";
import logger from "../../../utils/common/logger.ts";

interface PaycheckData {
  amount: number;
  payerName: string;
  mode?: string;
  [key: string]: unknown;
}

export const usePaycheckMutations = (envelopesQuery: unknown, savingsGoalsQuery: unknown) => {
  const queryClient = useQueryClient();

  const processPaycheckMutation = useMutation({
    mutationKey: ["paychecks", "process"],
    mutationFn: async (paycheckData: PaycheckData) => {
      return await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);
    },
    onSuccess: (_result, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      
      // Log successful paycheck processing
      logger.info("✅ Paycheck processed", {
        amount: variables.amount,
        payerName: variables.payerName,
        allocationMode: variables.mode || "allocate",
      });
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
    onSuccess: (_result, paycheckId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      
      // Log successful paycheck deletion
      logger.info("✅ Paycheck deleted", {
        paycheckId: paycheckId,
      });
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
