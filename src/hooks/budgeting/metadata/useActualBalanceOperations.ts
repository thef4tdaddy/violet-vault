import { useCallback } from "react";
import { useBudgetMetadataQuery } from "./useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "./useBudgetMetadataMutation";
import BudgetHistoryTracker from "@/utils/common/budgetHistoryTracker";
import logger from "@/utils/common/logger";
import { validateBalanceValue } from "@/domain/schemas/budget-record";

export const useActualBalanceOperations = () => {
  const { metadata, actualBalance } = useBudgetMetadataQuery();
  const { mutation: updateMetadataMutation } = useBudgetMetadataMutation();

  const updateActualBalance = useCallback(
    async (balance: number, options: { isManual?: boolean; author?: string } = {}) => {
      const { isManual = true, author = "Unknown User" } = options;

      // Validate balance using Zod schema
      const validationResult = validateBalanceValue(balance);
      if (!validationResult.success) {
        logger.warn("Invalid actual balance:", {
          balance,
          errors: validationResult.error.issues,
        });
        return false;
      }

      const previousBalance = actualBalance;

      try {
        await updateMetadataMutation.mutateAsync({
          ...metadata,
          actualBalance: balance,
          isActualBalanceManual: isManual,
        });

        // Track the change in budget history
        await BudgetHistoryTracker.trackActualBalanceChange({
          previousBalance,
          newBalance: balance,
          isManual,
          author,
        });

        // Audit logging
        logger.info("Actual balance updated", {
          previousValue: previousBalance,
          newValue: balance,
          isManual,
          timestamp: new Date().toISOString(),
          change: balance - previousBalance,
        });

        return true;
      } catch (error) {
        logger.error("Failed to update actual balance:", error);
        return false;
      }
    },
    [metadata, updateMetadataMutation, actualBalance]
  );

  return {
    updateActualBalance,
  };
};
