import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryKeys } from "@/utils/core/common/queryClient";
import { budgetDb } from "@/db/budgetDb";
import type { Receipt } from "@/db/types";
import logger from "@/utils/core/common/logger.ts";
import { useReceiptMutations } from "./useReceiptMutations";

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
      const receipts = await budgetDb.receipts?.orderBy("date").reverse().toArray();
      return receipts || [];
    } catch (error) {
      logger.error("Failed to fetch receipts from Dexie", { error });
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

  const allReceipts: Receipt[] = receiptsQuery.data || [];

  // Utility functions
  const getReceiptById = (id: string) => allReceipts.find((r: Receipt) => r.id === id);

  const getReceiptsByMerchant = (merchant: string) =>
    allReceipts.filter(
      (r: Receipt) => r.merchant && r.merchant.toLowerCase().includes(merchant.toLowerCase())
    );

  const getReceiptsByDateRange = (startDate: Date, endDate: Date) =>
    allReceipts.filter((r: Receipt) => {
      const receiptDate = new Date(r.date);
      return receiptDate >= startDate && receiptDate <= endDate;
    });

  const getReceiptsByEnvelope = (envelopeId: string) =>
    allReceipts.filter((r: Receipt) => r.envelopeId === envelopeId);

  const getPendingReceipts = () => allReceipts.filter((r: Receipt) => !r.isProcessed);

  const getMatchedReceipts = () => allReceipts.filter((r: Receipt) => r.isProcessed);

  const getHighConfidenceReceipts = (threshold = 0.8) =>
    allReceipts.filter((r: Receipt) => ((r.confidence as number) || 0) >= threshold);

  const getLowConfidenceReceipts = (threshold = 0.5) =>
    allReceipts.filter((r: Receipt) => ((r.confidence as number) || 0) < threshold);

  const getCategorizedReceipts = () => allReceipts.filter((r: Receipt) => !!r.category);

  const getUncategorizedReceipts = () => allReceipts.filter((r: Receipt) => !r.category);

  const getReceiptsWithTotal = (minTotal: number) =>
    allReceipts.filter((r: Receipt) => ((r.total as number) || 0) >= minTotal);

  const getUnlinkedReceipts = () => allReceipts.filter((r: Receipt) => !r.transactionId);

  const getReceiptsForTransaction = (transactionId: string) =>
    allReceipts.filter((r: Receipt) => r.transactionId === transactionId);

  const getPendingMatchReceipts = () =>
    allReceipts.filter((r: Receipt) => !r.transactionId && r.processingStatus === "completed");

  // SentinelShare matching utilities
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
    getReceiptsByEnvelope,
    getPendingReceipts,
    getMatchedReceipts,
    getHighConfidenceReceipts,
    getLowConfidenceReceipts,
    getCategorizedReceipts,
    getUncategorizedReceipts,
    getReceiptsWithTotal,
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
