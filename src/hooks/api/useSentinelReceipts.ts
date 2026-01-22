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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useCallback } from "react";
import { useAuthenticationManager } from "@/hooks/auth";
import { queryKeys } from "@/utils/query/queryKeys";
import { sentinelShareService } from "@/services/sentinel/sentinelShareService";
import logger from "@/utils/common/logger";
import type { SentinelReceipt, UpdateReceiptStatusOptions } from "@/types/sentinel";

/**
 * Hook options for useSentinelReceipts
 */
export interface UseSentinelReceiptsOptions {
  /** Number of retry attempts on failure (default: 3) */
  retry?: boolean | number;
  /** Enable/disable the hook (default: auto based on auth) */
  enabled?: boolean;
}

/**
 * Hook for managing SentinelShare receipts with automatic polling
 *
 * @param options - Configuration options
 * @returns Hook result containing receipts data, loading states, and methods
 *
 * @example
 * ```tsx
 * const {
 *   receipts,
 *   pendingReceipts,
 *   isLoading,
 *   updateStatus
 * } = useSentinelReceipts();
 *
 * // Mark a receipt as matched
 * await updateStatus('receipt-id', 'matched', 'transaction-id');
 * ```
 */
export function useSentinelReceipts(options: UseSentinelReceiptsOptions = {}) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthenticationManager();

  // Only enable polling when user is authenticated (or explicitly enabled)
  const isEnabled = options.enabled ?? isAuthenticated;

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
    staleTime: 25000, // 25 seconds - slightly less than polling interval
    refetchInterval: 30000, // 30 seconds - poll every 30 seconds
    refetchIntervalInBackground: false, // Pause polling when tab is inactive
    refetchOnWindowFocus: true, // Resume polling when tab becomes active
    refetchOnMount: true,
    retry: options.retry ?? 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    placeholderData: (previousData) => previousData, // Keep previous data while refetching
  });

  /**
   * Mutation for updating receipt status with optimistic updates
   */
  const updateStatusMutation = useMutation({
    mutationFn: async (mutationOptions: UpdateReceiptStatusOptions) => {
      await sentinelShareService.updateStatus(mutationOptions);
      return mutationOptions;
    },
    onMutate: async (mutationOptions: UpdateReceiptStatusOptions) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.sentinelReceipts() });

      // Snapshot the previous value
      const previousReceipts = queryClient.getQueryData<SentinelReceipt[]>(
        queryKeys.sentinelReceipts()
      );

      // Optimistically update the cache
      if (previousReceipts) {
        queryClient.setQueryData<SentinelReceipt[]>(queryKeys.sentinelReceipts(), (old) => {
          if (!old) return [];

          return old.map((receipt) => {
            if (receipt.id === mutationOptions.receiptId) {
              return {
                ...receipt,
                status: mutationOptions.status,
                matchedTransactionId: mutationOptions.matchedTransactionId,
                updatedAt: new Date().toISOString(),
              };
            }
            return receipt;
          });
        });
      }

      // Return context for rollback
      return { previousReceipts };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousReceipts) {
        queryClient.setQueryData(queryKeys.sentinelReceipts(), context.previousReceipts);
      }

      logger.error("Failed to update receipt status", error, {
        source: "useSentinelReceipts",
      });
    },
    onSuccess: (mutationOptions) => {
      logger.debug("Successfully updated receipt status", {
        receiptId: mutationOptions.receiptId,
        status: mutationOptions.status,
        source: "useSentinelReceipts",
      });
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.sentinelReceipts() });
    },
  });

  /**
   * Clear cache when user becomes unauthenticated
   */
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear the cache when user logs out
      queryClient.removeQueries({ queryKey: queryKeys.sentinelShare });
    }
  }, [isAuthenticated, queryClient]);

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
   * Helper method to update receipt status
   */
  const updateStatus = useCallback(
    async (receiptId: string, status: "matched" | "ignored", matchedTransactionId?: string) => {
      await updateStatusMutation.mutateAsync({
        receiptId,
        status,
        matchedTransactionId,
      });
    },
    [updateStatusMutation]
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
    receipts: receiptsQuery.data || [],
    pendingReceipts,
    matchedReceipts,
    ignoredReceipts,

    // Status
    isLoading: receiptsQuery.isLoading,
    isFetching: receiptsQuery.isFetching,
    isError: receiptsQuery.isError,
    error: receiptsQuery.error,
    isPolling: receiptsQuery.isFetching && !receiptsQuery.isLoading,

    // Mutation status
    isUpdating: updateStatusMutation.isPending,
    updateError: updateStatusMutation.error,

    // Methods
    refetch: receiptsQuery.refetch,
    updateStatus,
    getReceiptById,
    getReceiptsByMerchant,
    getReceiptsByDateRange,
  };
}

export default useSentinelReceipts;
