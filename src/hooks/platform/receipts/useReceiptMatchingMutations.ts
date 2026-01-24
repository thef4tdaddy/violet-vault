import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useReceipts } from "@/hooks/platform/data/useReceipts";
import { useTransactionOperations } from "@/hooks/budgeting/transactions/useTransactionOperations";
import { queryKeys } from "@/utils/core/query/queryKeys";
import logger from "@/utils/core/common/logger";
import { Receipt } from "@/utils/features/receipts/matchingAlgorithm";

export interface UpdateOptions {
  updateMerchant?: boolean;
  updateAmount?: boolean;
  updateDate?: boolean;
}

export const useReceiptMatchingMutations = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  const { receipts, updateReceiptAsync, linkReceiptToTransactionAsync } = useReceipts();
  const { updateTransaction } = useTransactionOperations();

  const linkOnlyMutation = useMutation({
    mutationKey: ["receipts", "linkOnly"],
    mutationFn: async ({
      receiptId,
      transactionId,
    }: {
      receiptId: string;
      transactionId: string;
    }) => {
      await linkReceiptToTransactionAsync({ receiptId, transactionId });
      await updateReceiptAsync({ id: receiptId, updates: { transactionId } });
      await updateTransaction(transactionId, { receiptUrl: receiptId });
      logger.info("✅ Receipt linked to transaction (link only)", { receiptId, transactionId });
      return { receiptId, transactionId, updateType: "linkOnly" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      onSuccess();
    },
    onError: (error) => logger.error("❌ Failed to link receipt", error),
  });

  const linkAndUpdateMutation = useMutation({
    mutationKey: ["receipts", "linkAndUpdate"],
    mutationFn: async ({
      receiptId,
      transactionId,
      updates,
    }: {
      receiptId: string;
      transactionId: string;
      updates: UpdateOptions;
    }) => {
      const receipt = (receipts as Receipt[]).find((r) => r.id === receiptId);
      if (!receipt) throw new Error("Receipt not found");

      const transactionUpdates: Record<string, unknown> = { receiptUrl: receiptId };
      if (updates.updateMerchant && receipt.merchant)
        transactionUpdates.description = receipt.merchant;
      if (updates.updateAmount) transactionUpdates.amount = receipt.amount || receipt.total;
      if (updates.updateDate && receipt.date) transactionUpdates.date = receipt.date;

      await updateTransaction(transactionId, transactionUpdates);
      await linkReceiptToTransactionAsync({ receiptId, transactionId });
      await updateReceiptAsync({ id: receiptId, updates: { transactionId } });

      logger.info("✅ Receipt linked and transaction updated", {
        receiptId,
        transactionId,
        updates: transactionUpdates,
      });
      return { receiptId, transactionId, updateType: "linkAndUpdate", updates: transactionUpdates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      onSuccess();
    },
    onError: (error) => logger.error("❌ Failed to link and update transaction", error),
  });

  const dismissMatchMutation = useMutation({
    mutationKey: ["receipts", "dismissMatch"],
    mutationFn: async ({
      receiptId,
      transactionId,
    }: {
      receiptId: string;
      transactionId: string;
    }) => {
      await updateReceiptAsync({ id: receiptId, updates: {} });
      logger.info("Match suggestion dismissed", { receiptId, transactionId });
      return { receiptId, transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
    },
  });

  return {
    linkOnlyMutation,
    linkAndUpdateMutation,
    dismissMatchMutation,
  };
};
