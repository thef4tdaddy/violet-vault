import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { queryKeys } from "@/utils/core/common/queryClient";
import { sentinelShareService } from "@/services/sentinel/sentinelShareService";
import { useToastHelpers } from "@/utils/core/common/toastHelpers";
import logger from "@/utils/core/common/logger";
import type { SentinelReceipt, UpdateReceiptStatusOptions } from "@/types/sentinel";

/**
 * Mutation hook for updating SentinelShare receipt statuses.
 * Includes optimistic updates and success/error notifications.
 *
 * @returns An object containing:
 *  - updateStatus: Method to update status (mutate)
 *  - updateStatusAsync: Method to update status (mutateAsync)
 *  - isUpdating: Boolean flag for mutation progress
 *  - updateError: Error object if request failed
 */
export function useSentinelReceiptMutations() {
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToastHelpers();

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
      showErrorToast(
        `Failed to update receipt: ${error instanceof Error ? error.message : "Unknown error"}`
      );

      logger.error("Failed to update receipt status", error, {
        source: "useSentinelReceiptMutations",
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
        source: "useSentinelReceiptMutations",
      });
    },
    onSettled: () => {
      // Always refetch after mutation to ensure data consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.sentinelReceipts() });
    },
  });

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

  return {
    updateStatus,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    isUpdating: updateStatusMutation.isPending,
    updateError: updateStatusMutation.error,
  };
}
