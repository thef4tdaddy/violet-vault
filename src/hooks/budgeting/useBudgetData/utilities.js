/**
 * Utility functions for budget data management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers, prefetchHelpers } from "../../../utils/common/queryClient";
import { budgetDb } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger.js";

export const useBudgetUtilities = () => {
  const queryClient = useQueryClient();

  // Prefetch utilities
  const prefetchData = {
    envelopes: (filters) => prefetchHelpers.prefetchEnvelopes(filters),
    dashboard: () => prefetchHelpers.prefetchDashboard(),
    transactions: (dateRange) => prefetchHelpers.prefetchTransactions(dateRange),
  };

  // Sync utilities
  const syncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: localStorage.getItem("lastSyncTime"),
    hasPendingChanges: false,
  };

  // Force sync function
  const forceSync = async () => {
    try {
      await queryClient.refetchQueries();
      localStorage.setItem("lastSyncTime", new Date().toISOString());
      logger.info("Force sync completed", { source: "forceSync" });
    } catch (error) {
      logger.error("Force sync failed", error, { source: "forceSync" });
      throw error;
    }
  };

  // Clear cache function
  const clearCache = async () => {
    try {
      await queryClient.clear();
      await budgetDb.cache.clear();
      logger.info("Cache cleared successfully", { source: "clearCache" });
    } catch (error) {
      logger.error("Failed to clear cache", error, { source: "clearCache" });
      throw error;
    }
  };

  // Transaction reconciliation mutation
  const reconcileTransactionMutation = useMutation({
    mutationKey: ["transactions", "reconcile"],
    mutationFn: async (transactionData) => {
      await optimisticHelpers.addTransaction(transactionData);
      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
    },
  });

  return {
    prefetchData,
    syncStatus,
    forceSync,
    clearCache,
    reconcileTransaction: reconcileTransactionMutation.mutate,
    reconcileTransactionAsync: reconcileTransactionMutation.mutateAsync,
  };
};
