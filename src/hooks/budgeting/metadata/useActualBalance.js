import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "../../../utils/common/queryClient";
import { getBudgetMetadata, setBudgetMetadata, getActualBalance } from "../../../db/budgetDb";
import BudgetHistoryTracker from "../../../utils/common/budgetHistoryTracker";
import logger from "../../../utils/common/logger";

export const useActualBalance = () => {
  const queryClient = useQueryClient();

  const {
    data: balanceData = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.budgetMetadata, "actualBalance"],
    queryFn: async () => {
      logger.debug("TanStack Query: Fetching actual balance from Dexie");
      let metadata = await getBudgetMetadata();

      // Initialize metadata record if it doesn't exist (same as main hook)
      if (!metadata) {
        logger.debug(
          "TanStack Query: No metadata found in useActualBalance, initializing with defaults"
        );
        const defaultMetadata = {
          unassignedCash: 0,
          actualBalance: 0,
          isActualBalanceManual: false,
          biweeklyAllocation: 0,
        };

        await setBudgetMetadata(defaultMetadata);
        metadata = defaultMetadata;
        logger.debug(
          "TanStack Query: Budget metadata initialized in useActualBalance",
          defaultMetadata
        );
      }

      const result = {
        actualBalance: await getActualBalance(),
        isActualBalanceManual: metadata?.isActualBalanceManual || false,
      };
      logger.debug("TanStack Query: Actual balance loaded", result);
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const updateActualBalanceMutation = useMutation({
    mutationFn: async ({ balance, isManual = true }) => {
      logger.debug("TanStack Query: Updating actual balance in Dexie", {
        balance,
        isManual,
      });

      const currentMetadata = await getBudgetMetadata();
      await setBudgetMetadata({
        ...currentMetadata,
        actualBalance: balance,
        isActualBalanceManual: isManual,
      });

      return { balance, isManual };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      logger.debug("TanStack Query: Actual balance updated successfully");
    },
    onError: (error) => {
      logger.error("Failed to update actual balance:", error);
    },
  });

  const updateActualBalance = useCallback(
    async (newBalance, options = {}) => {
      const { isManual = true, author = "Unknown User" } = options;

      if (typeof newBalance !== "number" || isNaN(newBalance)) {
        logger.warn("Invalid balance value provided:", { value: newBalance });
        return false;
      }

      // Business logic: reasonable balance limits
      const MAX_BALANCE = 1000000; // $1M limit
      const MIN_BALANCE = -100000; // -$100k limit (for overdrafts)

      if (newBalance > MAX_BALANCE || newBalance < MIN_BALANCE) {
        logger.warn("Balance outside reasonable limits:", {
          value: newBalance,
          limits: { max: MAX_BALANCE, min: MIN_BALANCE },
        });
        return false;
      }

      const previousBalance = balanceData.actualBalance || 0;

      try {
        await updateActualBalanceMutation.mutateAsync({
          balance: newBalance,
          isManual,
        });

        // Track the change in budget history
        await BudgetHistoryTracker.trackActualBalanceChange({
          previousBalance,
          newBalance,
          isManual,
          author,
        });

        // Audit logging
        logger.info("Balance updated", {
          previousValue: previousBalance,
          newValue: newBalance,
          isManual,
          timestamp: new Date().toISOString(),
          change: newBalance - previousBalance,
        });

        return true;
      } catch (error) {
        logger.error("Failed to update actual balance:", error);
        return false;
      }
    },
    [updateActualBalanceMutation, balanceData.actualBalance]
  );

  // Utility functions (same as original useActualBalance hook)
  const getBalanceDifference = useCallback(
    (calculatedBalance) => {
      if (!balanceData.isActualBalanceManual || !calculatedBalance) return 0;
      return (balanceData.actualBalance || 0) - calculatedBalance;
    },
    [balanceData.actualBalance, balanceData.isActualBalanceManual]
  );

  const shouldConfirmChange = useCallback(
    (newBalance, threshold = 500) => {
      const changeAmount = Math.abs(newBalance - (balanceData.actualBalance || 0));
      return changeAmount >= threshold;
    },
    [balanceData.actualBalance]
  );

  const formatBalance = useCallback((balance, options = {}) => {
    const {
      showCurrency = true,
      showSign = false,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2,
    } = options;

    const formatter = new Intl.NumberFormat("en-US", {
      style: showCurrency ? "currency" : "decimal",
      currency: "USD",
      minimumFractionDigits,
      maximumFractionDigits,
      signDisplay: showSign ? "always" : "auto",
    });

    return formatter.format(balance || 0);
  }, []);

  const validateBalanceInput = useCallback((inputValue) => {
    // Allow empty string, numbers, decimal point, and negative sign
    const isValidFormat = inputValue === "" || /^-?\d*\.?\d*$/.test(inputValue);

    if (!isValidFormat) {
      return { isValid: false, error: "Invalid number format" };
    }

    if (inputValue === "" || inputValue === "-" || inputValue === ".") {
      return { isValid: true, parsedValue: 0 };
    }

    const parsedValue = parseFloat(inputValue);

    if (isNaN(parsedValue)) {
      return { isValid: false, error: "Not a valid number" };
    }

    return { isValid: true, parsedValue };
  }, []);

  return {
    // State
    actualBalance: balanceData.actualBalance || 0,
    isActualBalanceManual: balanceData.isActualBalanceManual || false,

    // Loading states
    isLoading,
    error,
    isUpdating: updateActualBalanceMutation.isPending,

    // Actions
    updateActualBalance,
    refetch,

    // Computed values
    getBalanceDifference,
    shouldConfirmChange,

    // Utils
    formatBalance,
    validateBalanceInput,
  };
};
