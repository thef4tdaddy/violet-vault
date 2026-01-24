import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/utils/core/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import { Receipt } from "./useReceipts";

export const useReceiptMutations = () => {
  const queryClient = useQueryClient();

  const addReceiptMutation = useMutation({
    mutationKey: ["receipts", "add"],
    mutationFn: async (receiptData: Partial<Receipt>) => {
      const receipt: Receipt = {
        id: crypto.randomUUID(),
        ...receiptData,
        processingStatus: "completed",
        lastModified: Date.now(),
      };

      // @ts-expect-error - receipts table might not be defined in budgetDb types yet
      await budgetDb.receipts?.put(receipt);
      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  const updateReceiptMutation = useMutation({
    mutationKey: ["receipts", "update"],
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Receipt> }) => {
      // @ts-expect-error - receipts table might not be defined in budgetDb types yet
      await budgetDb.receipts?.update(id, {
        ...updates,
        lastModified: Date.now(),
      });
      return { id, ...updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
    },
  });

  const deleteReceiptMutation = useMutation({
    mutationKey: ["receipts", "delete"],
    mutationFn: async (id: string) => {
      // @ts-expect-error - receipts table might not be defined in budgetDb types yet
      const receipt = await budgetDb.receipts?.get(id);

      if (receipt?.imageData?.url) {
        URL.revokeObjectURL(receipt.imageData.url);
      }

      // @ts-expect-error - receipts table might not be defined in budgetDb types yet
      await budgetDb.receipts?.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
    },
  });

  const linkReceiptToTransactionMutation = useMutation({
    mutationKey: ["receipts", "linkTransaction"],
    mutationFn: async ({
      receiptId,
      transactionId,
    }: {
      receiptId: string;
      transactionId: string;
    }) => {
      // @ts-expect-error - receipts table might not be defined in budgetDb types yet
      await budgetDb.receipts?.update(receiptId, {
        transactionId,
        lastModified: Date.now(),
      });
      return { receiptId, transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  return {
    addReceipt: addReceiptMutation.mutate,
    addReceiptAsync: addReceiptMutation.mutateAsync,
    updateReceipt: updateReceiptMutation.mutate,
    updateReceiptAsync: updateReceiptMutation.mutateAsync,
    deleteReceipt: deleteReceiptMutation.mutate,
    deleteReceiptAsync: deleteReceiptMutation.mutateAsync,
    linkReceiptToTransaction: linkReceiptToTransactionMutation.mutate,
    linkReceiptToTransactionAsync: linkReceiptToTransactionMutation.mutateAsync,
  };
};
