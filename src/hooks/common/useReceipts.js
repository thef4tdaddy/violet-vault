import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "../../utils/common/queryClient";
import { budgetDb } from "../../db/budgetDb";
import logger from "../../utils/common/logger.js";

const useReceipts = () => {
  const queryClient = useQueryClient();

  // Event listeners for data import and sync invalidation
  useEffect(() => {
    const handleImportCompleted = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.receiptsList });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    const handleInvalidateAll = () => {
      queryClient.invalidateQueries();
    };

    window.addEventListener("importCompleted", handleImportCompleted);
    window.addEventListener("invalidateAllQueries", handleInvalidateAll);

    return () => {
      window.removeEventListener("importCompleted", handleImportCompleted);
      window.removeEventListener("invalidateAllQueries", handleInvalidateAll);
    };
  }, [queryClient]);

  const queryFunction = async () => {
    try {
      const receipts = await budgetDb.receipts
        .orderBy("date")
        .reverse()
        .toArray();
      return receipts || [];
    } catch (error) {
      logger.warn("Dexie query failed", {
        error: error.message,
        source: "useReceipts",
      });
      return [];
    }
  };

  const receiptsQuery = useQuery({
    queryKey: queryKeys.receiptsList(),
    queryFn: queryFunction,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
    enabled: true,
  });

  const addReceiptMutation = useMutation({
    mutationKey: ["receipts", "add"],
    mutationFn: async (receiptData) => {
      const receipt = {
        id: crypto.randomUUID(),
        ...receiptData,
        processingStatus: "completed",
        lastModified: Date.now(),
      };

      await budgetDb.receipts.put(receipt);
      return receipt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });

  const updateReceiptMutation = useMutation({
    mutationKey: ["receipts", "update"],
    mutationFn: async ({ id, updates }) => {
      await budgetDb.receipts.update(id, {
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
    mutationFn: async (id) => {
      // Get receipt data before deletion for cleanup
      const receipt = await budgetDb.receipts.get(id);

      if (receipt?.imageData?.url) {
        // Clean up object URL
        URL.revokeObjectURL(receipt.imageData.url);
      }

      await budgetDb.receipts.delete(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
    },
  });

  const linkReceiptToTransactionMutation = useMutation({
    mutationKey: ["receipts", "linkTransaction"],
    mutationFn: async ({ receiptId, transactionId }) => {
      await budgetDb.receipts.update(receiptId, {
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

  // Utility functions
  const getReceiptById = (id) =>
    (receiptsQuery.data || []).find((r) => r.id === id);

  const getReceiptsByMerchant = (merchant) =>
    (receiptsQuery.data || []).filter(
      (r) =>
        r.merchant && r.merchant.toLowerCase().includes(merchant.toLowerCase()),
    );

  const getReceiptsByDateRange = (startDate, endDate) =>
    (receiptsQuery.data || []).filter((r) => {
      if (!r.date) return false;
      const receiptDate = new Date(r.date);
      return (
        receiptDate >= new Date(startDate) && receiptDate <= new Date(endDate)
      );
    });

  const getUnlinkedReceipts = () =>
    (receiptsQuery.data || []).filter((r) => !r.transactionId);

  const getReceiptsForTransaction = (transactionId) =>
    (receiptsQuery.data || []).filter((r) => r.transactionId === transactionId);

  return {
    receipts: receiptsQuery.data || [],
    isLoading: receiptsQuery.isLoading,
    isFetching: receiptsQuery.isFetching,
    isError: receiptsQuery.isError,
    error: receiptsQuery.error,

    addReceipt: addReceiptMutation.mutate,
    addReceiptAsync: addReceiptMutation.mutateAsync,
    updateReceipt: updateReceiptMutation.mutate,
    updateReceiptAsync: updateReceiptMutation.mutateAsync,
    deleteReceipt: deleteReceiptMutation.mutate,
    deleteReceiptAsync: deleteReceiptMutation.mutateAsync,
    linkReceiptToTransaction: linkReceiptToTransactionMutation.mutate,
    linkReceiptToTransactionAsync: linkReceiptToTransactionMutation.mutateAsync,

    // Utility functions
    getReceiptById,
    getReceiptsByMerchant,
    getReceiptsByDateRange,
    getUnlinkedReceipts,
    getReceiptsForTransaction,

    refetch: receiptsQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts }),
  };
};

export { useReceipts };
export default useReceipts;
