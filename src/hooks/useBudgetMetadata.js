import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "../utils/queryClient";
import {
  budgetDb,
  getBudgetMetadata,
  setBudgetMetadata,
  setUnassignedCash as setUnassignedCashDb,
  setActualBalance as setActualBalanceDb,
  getUnassignedCash,
  getActualBalance,
} from "../db/budgetDb";
import BudgetHistoryTracker from "../utils/budgetHistoryTracker";
import logger from "../utils/logger";

/**
 * TanStack Query hook for budget metadata (unassigned cash, actual balance, etc.)
 * Follows the proper data flow: TanStack Query ↔ Dexie ↔ Cloud Sync
 * Zustand is no longer involved in data management for these fields
 */
export const useBudgetMetadata = () => {
  const queryClient = useQueryClient();

  // Query for all budget metadata
  const {
    data: metadata = {},
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.budgetMetadata,
    queryFn: async () => {
      logger.debug("TanStack Query: Fetching budget metadata from Dexie");
      const result = await getBudgetMetadata();
      logger.debug("TanStack Query: Budget metadata loaded", {
        unassignedCash: result?.unassignedCash || 0,
        actualBalance: result?.actualBalance || 0,
        hasData: !!result,
      });
      return result || {};
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  // Extract specific values with defaults
  const unassignedCash = metadata.unassignedCash || 0;
  const actualBalance = metadata.actualBalance || 0;
  const isActualBalanceManual = metadata.isActualBalanceManual || false;

  // Mutation for updating budget metadata
  const updateMetadataMutation = useMutation({
    mutationFn: async (updates) => {
      logger.debug(
        "TanStack Query: Updating budget metadata in Dexie",
        updates,
      );
      await setBudgetMetadata(updates);
      return updates;
    },
    onSuccess: () => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      logger.debug("TanStack Query: Budget metadata updated successfully");
    },
    onError: (error) => {
      logger.error("Failed to update budget metadata:", error);
    },
  });

  // Helper functions for specific operations
  const updateUnassignedCash = useCallback(
    async (amount, options = {}) => {
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
    [metadata, updateMetadataMutation, unassignedCash],
  );

  const updateActualBalance = useCallback(
    async (balance, options = {}) => {
      const { isManual = true, author = "Unknown User" } = options;

      if (typeof balance !== "number" || isNaN(balance)) {
        logger.warn("Invalid actual balance:", balance);
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
    [metadata, updateMetadataMutation, actualBalance],
  );

  const setBiweeklyAllocation = useCallback(
    async (amount) => {
      if (typeof amount !== "number" || isNaN(amount)) {
        logger.warn("Invalid biweekly allocation:", amount);
        return false;
      }

      try {
        await updateMetadataMutation.mutateAsync({
          ...metadata,
          biweeklyAllocation: amount,
        });
        return true;
      } catch (error) {
        logger.error("Failed to update biweekly allocation:", error);
        return false;
      }
    },
    [metadata, updateMetadataMutation],
  );

  // Utility functions
  const getBalanceDifference = useCallback(
    (calculatedBalance) => {
      if (!isActualBalanceManual || !calculatedBalance) return 0;
      return actualBalance - calculatedBalance;
    },
    [actualBalance, isActualBalanceManual],
  );

  const shouldConfirmChange = useCallback(
    (newBalance, threshold = 500) => {
      const changeAmount = Math.abs(newBalance - actualBalance);
      return changeAmount >= threshold;
    },
    [actualBalance],
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
    metadata,
    unassignedCash,
    actualBalance,
    isActualBalanceManual,
    biweeklyAllocation: metadata.biweeklyAllocation || 0,

    // Loading states
    isLoading,
    error,
    isUpdating: updateMetadataMutation.isPending,

    // Actions
    updateUnassignedCash,
    updateActualBalance,
    setBiweeklyAllocation,
    updateMetadata: updateMetadataMutation.mutateAsync,
    refetch,

    // Utility functions
    getBalanceDifference,
    shouldConfirmChange,
    formatBalance,
    validateBalanceInput,
  };
};

/**
 * Specialized hook for unassigned cash operations
 */
export const useUnassignedCash = () => {
  const queryClient = useQueryClient();

  const {
    data: unassignedCash = 0,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.budgetMetadata, "unassignedCash"],
    queryFn: async () => {
      logger.debug("TanStack Query: Fetching unassigned cash from Dexie");
      const result = await getUnassignedCash();
      logger.debug("TanStack Query: Unassigned cash loaded", {
        amount: result,
      });
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  const updateUnassignedCashMutation = useMutation({
    mutationFn: async (amount) => {
      logger.debug("TanStack Query: Updating unassigned cash in Dexie", {
        amount,
      });
      await setUnassignedCashDb(amount);
      return amount;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.budgetMetadata });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary });
      logger.debug("TanStack Query: Unassigned cash updated successfully");
    },
    onError: (error) => {
      logger.error("Failed to update unassigned cash:", error);
    },
  });

  const setUnassignedCash = useCallback(
    async (amount, options = {}) => {
      if (typeof amount !== "number" || isNaN(amount)) {
        logger.warn("Invalid unassigned cash amount:", amount);
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
    [updateUnassignedCashMutation, unassignedCash],
  );

  return {
    unassignedCash,
    isLoading,
    error,
    isUpdating: updateUnassignedCashMutation.isPending,
    setUnassignedCash,
    refetch,
  };
};

/**
 * Specialized hook for actual balance operations
 */
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
      const metadata = await getBudgetMetadata();
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
    [updateActualBalanceMutation, balanceData.actualBalance],
  );

  // Utility functions (same as original useActualBalance hook)
  const getBalanceDifference = useCallback(
    (calculatedBalance) => {
      if (!balanceData.isActualBalanceManual || !calculatedBalance) return 0;
      return (balanceData.actualBalance || 0) - calculatedBalance;
    },
    [balanceData.actualBalance, balanceData.isActualBalanceManual],
  );

  const shouldConfirmChange = useCallback(
    (newBalance, threshold = 500) => {
      const changeAmount = Math.abs(
        newBalance - (balanceData.actualBalance || 0),
      );
      return changeAmount >= threshold;
    },
    [balanceData.actualBalance],
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
