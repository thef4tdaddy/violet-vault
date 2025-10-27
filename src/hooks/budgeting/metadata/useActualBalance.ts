import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "../../../utils/common/queryClient";
import { getBudgetMetadata, setBudgetMetadata, getActualBalance } from "../../../db/budgetDb";
import type { BudgetRecord } from "../../../db/types";
import BudgetHistoryTracker from "../../../utils/common/budgetHistoryTracker";
import logger from "../../../utils/common/logger";
import { validateBalance } from "../../../utils/validation";

// Helper to initialize default metadata
const initializeDefaultMetadata = async (): Promise<BudgetRecord> => {
  const defaultMetadata: Partial<BudgetRecord> = {
    id: "metadata",
    lastModified: Date.now(),
    unassignedCash: 0,
    actualBalance: 0,
    isActualBalanceManual: false,
    biweeklyAllocation: 0,
  };

  await setBudgetMetadata(defaultMetadata);
  logger.debug("TanStack Query: Budget metadata initialized in useActualBalance", defaultMetadata);

  return defaultMetadata as BudgetRecord;
};

// Helper to fetch balance data
const fetchBalanceData = async () => {
  let metadata = await getBudgetMetadata();

  if (!metadata) {
    logger.debug(
      "TanStack Query: No metadata found in useActualBalance, initializing with defaults"
    );
    metadata = await initializeDefaultMetadata();
  }

  return {
    actualBalance: await getActualBalance(),
    isActualBalanceManual: metadata?.isActualBalanceManual || false,
  };
};

// Helper to track balance change
const trackBalanceChange = async (
  previousBalance: number,
  newBalance: number,
  isManual: boolean,
  author: string
) => {
  await BudgetHistoryTracker.trackActualBalanceChange({
    previousBalance,
    newBalance,
    isManual,
    author,
  });

  logger.info("Balance updated", {
    previousValue: previousBalance,
    newValue: newBalance,
    isManual,
    timestamp: new Date().toISOString(),
    change: newBalance - previousBalance,
  });
};

interface BalanceData {
  actualBalance: number;
  isActualBalanceManual: boolean;
}

export const useActualBalance = () => {
  const queryClient = useQueryClient();

  const {
    data: balanceData,
    isLoading,
    error,
    refetch,
  } = useQuery<BalanceData, Error, BalanceData>({
    queryKey: [...queryKeys.budgetMetadata, "actualBalance"],
    queryFn: fetchBalanceData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    initialData: { actualBalance: 0, isActualBalanceManual: false },
  });

  const updateActualBalanceMutation = useMutation({
    mutationFn: async ({ balance, isManual = true }: { balance: number; isManual?: boolean }) => {
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
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      logger.debug("TanStack Query: Actual balance updated successfully");
    },
    onError: (error) => {
      logger.error("Failed to update actual balance:", error);
    },
  });

  const updateActualBalance = useCallback(
    async (newBalance: number, options: { isManual?: boolean; author?: string } = {}) => {
      const { isManual = true, author = "Unknown User" } = options;

      if (!validateBalance(newBalance)) {
        return false;
      }

      const previousBalance = balanceData?.actualBalance || 0;

      try {
        await updateActualBalanceMutation.mutateAsync({
          balance: newBalance,
          isManual,
        });

        await trackBalanceChange(previousBalance, newBalance, isManual, author);
        return true;
      } catch (error) {
        logger.error("Failed to update actual balance:", error);
        return false;
      }
    },
    [updateActualBalanceMutation, balanceData?.actualBalance]
  );

  // Utility functions (same as original useActualBalance hook)
  const getBalanceDifference = useCallback(
    (calculatedBalance: number) => {
      if (!balanceData?.isActualBalanceManual || !calculatedBalance) return 0;
      return (balanceData?.actualBalance || 0) - calculatedBalance;
    },
    [balanceData?.actualBalance, balanceData?.isActualBalanceManual]
  );

  const shouldConfirmChange = useCallback(
    (newBalance: number, threshold = 500) => {
      const changeAmount = Math.abs(newBalance - (balanceData?.actualBalance || 0));
      return changeAmount >= threshold;
    },
    [balanceData?.actualBalance]
  );

  const formatBalance = useCallback(
    (
      balance: number,
      options: {
        showCurrency?: boolean;
        showSign?: boolean;
        minimumFractionDigits?: number;
        maximumFractionDigits?: number;
      } = {}
    ) => {
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
    },
    []
  );

  const validateBalanceInput = useCallback((inputValue: string) => {
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
    actualBalance: balanceData?.actualBalance || 0,
    isActualBalanceManual: balanceData?.isActualBalanceManual || false,

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
