import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/utils/core/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import logger from "@/utils/core/common/logger.ts";
import { useReceiptMutations } from "./useReceiptMutations";

// Receipt type definition
export interface Receipt {
  id: string;
  date?: string;
  merchant?: string;
  amount?: number;
  imageData?: {
    url?: string;
  };
  transactionId?: string;
  processingStatus?: string;
  lastModified: number;
  ocrData?: {
    rawText?: string;
    confidence?: number;
    items?: unknown[];
    tax?: number;
    subtotal?: number;
    processingTime?: number;
  };
}

const useReceipts = () => {
  const queryClient = useQueryClient();
  const mutations = useReceiptMutations();

  // Event listeners for data import and sync invalidation
  useEffect(() => {
    const handleImportCompleted = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.receiptsList() });
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

  const queryFunction = async (): Promise<Receipt[]> => {
    try {
      // @ts-expect-error - receipts table might not be defined in budgetDb types yet
      const receipts = await budgetDb.receipts?.orderBy("date").reverse().toArray();
      return receipts || [];
    } catch (error) {
      logger.warn("Dexie query failed", {
        error: (error as Error).message,
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

  const allReceipts = receiptsQuery.data || [];

  // Utility functions
  const getReceiptById = (id: string) => allReceipts.find((r) => r.id === id);

  const getReceiptsByMerchant = (merchant: string) =>
    allReceipts.filter(
      (r) => r.merchant && r.merchant.toLowerCase().includes(merchant.toLowerCase())
    );

  const getReceiptsByDateRange = (startDate: string, endDate: string) =>
    allReceipts.filter((r) => {
      if (!r.date) return false;
      const receiptDate = new Date(r.date);
      return receiptDate >= new Date(startDate) && receiptDate <= new Date(endDate);
    });

  const getUnlinkedReceipts = () => allReceipts.filter((r) => !r.transactionId);

  const getReceiptsForTransaction = (transactionId: string) =>
    allReceipts.filter((r) => r.transactionId === transactionId);

  // SentinelShare matching utilities
  const getPendingMatchReceipts = () =>
    allReceipts.filter((r) => !r.transactionId && r.processingStatus === "completed");

  const getReceiptMatchStats = () => {
    const linked = allReceipts.filter((r) => r.transactionId);
    const unlinked = allReceipts.filter((r) => !r.transactionId);
    const pending = unlinked.filter((r) => r.processingStatus === "completed");

    return {
      total: allReceipts.length,
      linked: linked.length,
      unlinked: unlinked.length,
      pendingMatch: pending.length,
      linkRate: allReceipts.length > 0 ? Math.round((linked.length / allReceipts.length) * 100) : 0,
    };
  };

  return {
    receipts: allReceipts,
    isLoading: receiptsQuery.isLoading,
    isFetching: receiptsQuery.isFetching,
    isError: receiptsQuery.isError,
    error: receiptsQuery.error,

    ...mutations,

    // Utility functions
    getReceiptById,
    getReceiptsByMerchant,
    getReceiptsByDateRange,
    getUnlinkedReceipts,
    getReceiptsForTransaction,

    // SentinelShare matching utilities
    getPendingMatchReceipts,
    getReceiptMatchStats,

    refetch: receiptsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: queryKeys.receipts }),
  };
};

export { useReceipts };
export default useReceipts;
