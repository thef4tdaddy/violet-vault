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
import { useAuth } from "@/hooks/auth/useAuth";
import { queryKeys } from "@/utils/core/common/queryClient";
import { sentinelShareService } from "@/services/sentinel/sentinelShareService";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import logger from "@/utils/core/common/logger";
import type { SentinelReceipt, UpdateReceiptStatusOptions } from "@/types/sentinel";

/**
 * Hook for managing SentinelShare receipts with automatic polling
 *
 * @returns {Object} Hook result containing receipts data, loading states, and methods
 * @returns {SentinelReceipt[]} receipts - Array of all receipts
 * @returns {boolean} isLoading - Initial loading state
 * @returns {boolean} isFetching - Background fetching state
 * @returns {Error | null} error - Error object if request failed
 * @returns {Function} refetch - Manually trigger a refetch
 * @returns {Function} updateStatus - Update receipt status with optimistic updates
 */
export interface UseSentinelReceiptsOptions {
  retry?: boolean | number;
}

/**
 * Provides polling, caching, and mutation helpers for managing SentinelShare receipts.
 *
 * @param options - Optional settings; `retry` controls the query retry behaviour (boolean or number).
 * @returns An object exposing:
 *  - Data: `receipts` (array of receipts), `pendingReceipts`, `matchedReceipts`, `ignoredReceipts`.
 *  - Status flags: `isLoading`, `isFetching`, `isError`, `error`, `isPolling`.
 *  - Mutation state: `isUpdating`, `updateError`.
 *  - Methods: `refetch`, `updateStatus(receiptId, status, matchedTransactionId?)`, `getReceiptById(id)`, `getReceiptsByMerchant(merchant)`, `getReceiptsByDateRange(startDate, endDate)`.
 */
export function useSentinelReceipts(options: UseSentinelReceiptsOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { showSuccessToast, showErrorToast } = useToastHelpers();

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
    mutationFn: async (options: UpdateReceiptStatusOptions) => {
      await sentinelShareService.updateStatus(options);
      return options;
    },
    onMutate: async (options: UpdateReceiptStatusOptions) => {
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
            if (receipt.id === options.receiptId) {
              return {
                ...receipt,
                status: options.status,
                matchedTransactionId: options.matchedTransactionId,
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

      // Show error toast notification
      showErrorToast(`Failed to update receipt: ${error instanceof Error ? error.message : "Unknown error"}`);

      logger.error("Failed to update receipt status", error, {
        source: "useSentinelReceipts",
      });
    },
    onSuccess: (options) => {
      // Show success toast notification
      const statusMessage =
        options.status === "matched"
          ? "Receipt matched to transaction successfully"
          : "Receipt marked as ignored";
      showSuccessToast(statusMessage);

      logger.debug("Successfully updated receipt status", {
        receiptId: options.receiptId,
        status: options.status,
        source: "useSentinelReceipts",
      });
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.sentinelReceipts() });
    },
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