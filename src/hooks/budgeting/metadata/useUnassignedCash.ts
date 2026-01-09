import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "@/utils/common/queryClient";
import {
  getBudgetMetadata,
  setBudgetMetadata,
  setUnassignedCash as setUnassignedCashDb,
  getUnassignedCash,
} from "@/db/budgetDb";
import BudgetHistoryTracker from "@/utils/common/budgetHistoryTracker";
import logger from "@/utils/common/logger";

interface SetUnassignedCashOptions {
  author?: string;
  source?: string;
}

interface UseUnassignedCashReturn {
  unassignedCash: number;
  isLoading: boolean;
  error: Error | null;
  isUpdating: boolean;
  updateUnassignedCash: (amount: number, options?: SetUnassignedCashOptions) => Promise<boolean>;
  refetch: () => Promise<unknown>;
}

export const useUnassignedCash = (): UseUnassignedCashReturn => {
  const queryClient = useQueryClient();

  const {
    data: unassignedCash = 0,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.unassignedCash(),
    queryFn: async () => {
      // Removed noisy debug log - query runs constantly
      let metadata = await getBudgetMetadata();

      // Initialize metadata record if it doesn't exist (same as main hook)
      if (!metadata) {
        logger.debug(
          "TanStack Query: No metadata found in useUnassignedCash, initializing with defaults"
        );
        const defaultMetadata = {
          id: "metadata",
          unassignedCash: 0,
          actualBalance: 0,
          isActualBalanceManual: false,
          biweeklyAllocation: 0,
          lastModified: Date.now(),
        };

        await setBudgetMetadata(defaultMetadata);
        metadata = defaultMetadata;
        logger.debug(
          "TanStack Query: Budget metadata initialized in useUnassignedCash",
          defaultMetadata
        );
      }

      const result = await getUnassignedCash();
      // Removed noisy debug log - fires constantly
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const updateUnassignedCashMutation = useMutation({
    mutationFn: async (amount: number) => {
      logger.debug("TanStack Query: Updating unassigned cash in Dexie", {
        amount,
      });
      await setUnassignedCashDb(amount);
      return amount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      logger.debug("TanStack Query: Unassigned cash updated successfully");
    },
    onError: (error) => {
      logger.error("Failed to update unassigned cash:", error);
    },
  });

  const updateUnassignedCash = useCallback(
    async (amount: number, options: SetUnassignedCashOptions = {}) => {
      if (typeof amount !== "number" || isNaN(amount)) {
        logger.warn("Invalid unassigned cash amount:", { amount });
        return false;
      }

      const { author = "Unknown User", source = "manual" } = options;
      const previousAmount = unassignedCash;

      try {
        await updateUnassignedCashMutation.mutateAsync(amount);

        // Track the change in budget history
        await BudgetHistoryTracker.trackUnassignedCashChange({
          previousAmount,
          newAmount: amount,
          author,
          source,
        });

        return true;
      } catch (error) {
        logger.error("Failed to set unassigned cash:", error);
        return false;
      }
    },
    [updateUnassignedCashMutation, unassignedCash]
  );

  return {
    unassignedCash,
    isLoading,
    error,
    isUpdating: updateUnassignedCashMutation.isPending,
    updateUnassignedCash,
    refetch,
  };
};
