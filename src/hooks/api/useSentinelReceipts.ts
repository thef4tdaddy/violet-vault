/**
 * SentinelShare Receipts Hook
 * Provides TanStack Query-based state management for polling and caching SentinelShare receipts
 *
 * Features:
 * - Automatic polling every 30 seconds
 * - Pause polling when tab is inactive
 * - Resume polling when tab becomes active
 * - Optimistic updates for status changes
 * - Proper error handling and loading states
 */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { queryKeys } from "@/utils/core/common/queryClient";
import { sentinelShareService } from "@/services/sentinel/sentinelShareService";
import { useSentinelReceiptMutations } from "./useSentinelReceiptMutations";
import logger from "@/utils/core/common/logger";
import type { SentinelReceipt } from "@/types/sentinel";

/**
 * Hook for managing SentinelShare receipts with automatic polling
 *
 * @returns {Object} Hook result containing receipts data, loading states, and methods
 */
export interface UseSentinelReceiptsOptions {
  retry?: boolean | number;
}

/**
 * Provides polling, caching, and management helpers for SentinelShare receipts.
 *
 * @param options - Optional settings; `retry` controls the query retry behaviour (boolean or number).
 * @returns An object exposing:
 *  - Data: `receipts`, `pendingReceipts`, `matchedReceipts`, `ignoredReceipts`.
 *  - Status flags: `isLoading`, `isFetching`, `isError`, `error`, `isPolling`.
 *  - Mutation state: `isUpdating`, `updateError`.
 *  - Methods: `refetch`, `updateStatus`, `getReceiptById`, `getReceiptsByMerchant`, `getReceiptsByDateRange`.
 */
export function useSentinelReceipts(options: UseSentinelReceiptsOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { updateStatus, isUpdating, updateError } = useSentinelReceiptMutations();

  // Only enable polling when user is authenticated
  const isEnabled = Boolean(user);

  /**
   * Main query for fetching receipts with polling
   */
  const receiptsQuery = useQuery({
    queryKey: queryKeys.sentinelReceipts(),
    queryFn: async () => {
      logger.debug("Fetching SentinelShare receipts", {
        source: "useSentinelReceipts",
      });

      const response = await sentinelShareService.fetchReceipts();
      return response.receipts;
    },
    enabled: isEnabled,
    staleTime: 25000,
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: options.retry ?? 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    placeholderData: (previousData) => previousData,
  });

  /**
   * Stop polling when user logs out
   */
  useEffect(() => {
    if (!user) {
      // Clear the cache when user logs out
      queryClient.removeQueries({ queryKey: queryKeys.sentinelShare });
    }
  }, [user, queryClient]);

  /**
   * Derived data: Filter receipts by status
   */
  const pendingReceipts = useMemo(
    () => (receiptsQuery.data || []).filter((r) => r.status === "pending"),
    [receiptsQuery.data]
  );

  const matchedReceipts = useMemo(
    () => (receiptsQuery.data || []).filter((r) => r.status === "matched"),
    [receiptsQuery.data]
  );

  const ignoredReceipts = useMemo(
    () => (receiptsQuery.data || []).filter((r) => r.status === "ignored"),
    [receiptsQuery.data]
  );

  /**
   * Utility methods
   */
  const getReceiptById = useCallback(
    (id: string) => (receiptsQuery.data || []).find((r) => r.id === id),
    [receiptsQuery.data]
  );

  const getReceiptsByMerchant = useCallback(
    (merchant: string) =>
      (receiptsQuery.data || []).filter((r) =>
        r.merchant.toLowerCase().includes(merchant.toLowerCase())
      ),
    [receiptsQuery.data]
  );

  const getReceiptsByDateRange = useCallback(
    (startDate: string, endDate: string) =>
      (receiptsQuery.data || []).filter((r) => {
        const receiptDate = new Date(r.date);
        return receiptDate >= new Date(startDate) && receiptDate <= new Date(endDate);
      }),
    [receiptsQuery.data]
  );

  return {
    // Data
    receipts: (receiptsQuery.data || []) as SentinelReceipt[],
    pendingReceipts,
    matchedReceipts,
    ignoredReceipts,

    // Status
    isLoading: receiptsQuery.isLoading,
    isFetching: receiptsQuery.isFetching,
    isError: receiptsQuery.isError,
    error: receiptsQuery.error,
    isPolling: receiptsQuery.isFetching && !receiptsQuery.isLoading,

    // Mutation status (from useSentinelReceiptMutations)
    isUpdating,
    updateError,

    // Methods
    refetch: receiptsQuery.refetch,
    updateStatus,
    getReceiptById,
    getReceiptsByMerchant,
    getReceiptsByDateRange,
  };
}

export default useSentinelReceipts;
