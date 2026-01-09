/**
 * Paycheck-related mutations
 * Complex paycheck processing logic extracted from useBudgetData
 * Updated for Issue #1340: Creates proper transaction records and invalidates transaction queries
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/common/queryClient";
import { processPaycheck } from "@/utils/budgeting/paycheckProcessing";
import { deletePaycheck } from "@/utils/budgeting/paycheckDeletion";
import logger from "@/utils/common/logger.ts";

interface PaycheckData {
  amount: number;
  payerName: string;
  mode: string;
  [key: string]: unknown;
}

interface BalanceCollection {
  data: Array<{ currentBalance?: string | number }>;
}

export const usePaycheckMutations = (
  envelopesQuery: BalanceCollection,
  savingsGoalsQuery: BalanceCollection
) => {
  const queryClient = useQueryClient();

  const processPaycheckMutation = useMutation({
    mutationKey: ["paychecks", "process"],
    mutationFn: async (paycheckData: PaycheckData & { mode: string }) => {
      return await processPaycheck(paycheckData, envelopesQuery, savingsGoalsQuery);
    },
    onSuccess: (_result, variables) => {
      // Invalidate all related queries including transactions (Issue #1340)
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });

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
      // Invalidate all related queries including transactions (Issue #1340)
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.paychecks });
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });

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
