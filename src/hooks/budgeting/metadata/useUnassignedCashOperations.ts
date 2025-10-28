import { useCallback } from "react";
import { useBudgetMetadataQuery } from "./useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "./useBudgetMetadataMutation";
import BudgetHistoryTracker from "../../../utils/common/budgetHistoryTracker";
import logger from "../../../utils/common/logger";

export const useUnassignedCashOperations = () => {
  const { metadata, unassignedCash } = useBudgetMetadataQuery();
  const { mutation: updateMetadataMutation } = useBudgetMetadataMutation();

  const updateUnassignedCash = useCallback(
    async (
      amount: number,
      options: {
        author?: string;
        source?: string;
        actualBalance?: number;
        isActualBalanceManual?: boolean;
        biweeklyAllocation?: number;
      } = {}
    ) => {
      if (typeof amount !== "number" || isNaN(amount)) {
        logger.warn("Invalid unassigned cash amount:", amount);
        return false;
      }

      const { author = "Unknown User", source = "manual" } = options;
      const previousAmount = unassignedCash;

      try {
        await updateMetadataMutation.mutateAsync({
          ...metadata,
          unassignedCash: amount,
        });

        // Track the change in budget history
        await BudgetHistoryTracker.trackUnassignedCashChange({
          previousAmount,
          newAmount: amount,
          author,
          source,
        });

        return true;
      } catch (error) {
        logger.error("Failed to update unassigned cash:", error);
        return false;
      }
    },
    [metadata, updateMetadataMutation, unassignedCash]
  );

  return {
    updateUnassignedCash,
  };
};
