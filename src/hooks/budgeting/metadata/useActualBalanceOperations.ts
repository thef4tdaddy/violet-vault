import { useCallback } from "react";
import { useBudgetMetadataQuery } from "./useBudgetMetadataQuery";
import { useBudgetMetadataMutation } from "./useBudgetMetadataMutation";
import BudgetHistoryTracker from "../../../utils/common/budgetHistoryTracker";
import logger from "../../../utils/common/logger";

export const useActualBalanceOperations = () => {
  const { metadata, actualBalance } = useBudgetMetadataQuery();
  const { mutation: updateMetadataMutation } = useBudgetMetadataMutation();

  const updateActualBalance = useCallback(
    async (balance: number, options: { isManual?: boolean; author?: string } = {}) => {
      const { isManual = true, author = "Unknown User" } = options;

      if (typeof balance !== "number" || isNaN(balance)) {
        logger.warn("Invalid actual balance:", { balance });
        return false;
      }

      // Business logic: reasonable balance limits
      const MAX_BALANCE = 1000000; // $1M limit
      const MIN_BALANCE = -100000; // -$100k limit (for overdrafts)

      if (balance > MAX_BALANCE || balance < MIN_BALANCE) {
        logger.warn("Balance outside reasonable limits:", {
          value: balance,
          limits: { max: MAX_BALANCE, min: MIN_BALANCE },
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
