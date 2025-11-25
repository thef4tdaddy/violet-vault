/**
 * Utility functions for budget data management
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys, optimisticHelpers, prefetchHelpers } from "../../../utils/common/queryClient";
import { budgetDb } from "../../../db/budgetDb";
import logger from "../../../utils/common/logger.ts";
import localStorageService from "../../../services/storage/localStorageService";
import type { Transaction } from "@/db/types";

interface EnvelopeFilters {
  [key: string]: unknown;
}

interface DateRange {
  start: Date;
  end: Date;
}

export const useBudgetUtilities = () => {
  const queryClient = useQueryClient();

  // Prefetch utilities
  const prefetchData = {
    envelopes: (filters: EnvelopeFilters) => prefetchHelpers.prefetchEnvelopes(queryClient, filters),
    dashboard: () => prefetchHelpers.prefetchDashboard(queryClient),
    transactions: (dateRange: DateRange) => prefetchHelpers.prefetchTransactions(queryClient, dateRange),
  };

  // Sync utilities
  const syncStatus = {
    isOnline: navigator.onLine,
    lastSyncTime: localStorageService.getLastSyncTime(),
    hasPendingChanges: false,
  };

  // Force sync function
  const forceSync = async () => {
    try {
      await queryClient.refetchQueries();
      localStorageService.setLastSyncTime(new Date().toISOString());
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
    mutationFn: async (transactionData: Omit<Transaction, "lastModified" | "createdAt">) => {
      await optimisticHelpers.addTransaction(queryClient, transactionData);
      return transactionData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSummary() });
      queryClient.invalidateQueries({ queryKey: queryKeys.envelopes });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: ["actualBalance"] });
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
