import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useReceipts } from "@/hooks/platform/data/useReceipts";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
import { useTransactionOperations } from "@/hooks/budgeting/transactions/useTransactionOperations";
import { queryKeys } from "@/utils/core/query/queryKeys";
import {
  findMatchesForReceipt,
  calculateDataDifferences,
  getConfidenceColor,
  getConfidenceLabel,
  CONFIDENCE_LEVELS,
  type Receipt,
  type MatchSuggestion,
  type DataDifference,
} from "@/utils/features/receipts/matchingAlgorithm";
import logger from "@/utils/core/common/logger";

/**
 * Selected match for confirmation modal
 */
export interface SelectedMatch extends MatchSuggestion {
  receipt: Receipt;
  differences: DataDifference[];
}

/**
 * Update options for Link & Update action
 */
export interface UpdateOptions {
  updateMerchant?: boolean;
  updateAmount?: boolean;
  updateDate?: boolean;
}

/**
 * Match statistics
 */
export interface MatchStats {
  totalUnlinked: number;
  highConfidenceMatches: number;
  mediumConfidenceMatches: number;
  lowConfidenceMatches: number;
  noMatches: number;
}

/**
 * Receipt with suggestions
 */
export interface ReceiptWithSuggestions extends Receipt {
  matchSuggestions: MatchSuggestion[];
  bestMatch: MatchSuggestion | null;
  hasHighConfidenceMatch: boolean;
  hasMediumConfidenceMatch: boolean;
}

/**
 * Hook options
 */
export interface UseReceiptMatchingOptions {
  minConfidence?: number;
  maxResults?: number;
}

/**
 * Hook for managing receipt-to-transaction matching
 */
export const useReceiptMatching = (options: UseReceiptMatchingOptions = {}) => {
  const { minConfidence = CONFIDENCE_LEVELS.MINIMUM, maxResults = 5 } = options;

  const queryClient = useQueryClient();
  const { receipts, updateReceiptAsync, linkReceiptToTransactionAsync } = useReceipts();
  const { transactions } = useTransactionQuery({ limit: 500 });
  const { updateTransaction } = useTransactionOperations();

  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);

  /**
   * Get unlinked receipts that need matching
   */
  const unlinkedReceipts = useMemo(() => {
    return (receipts as Receipt[]).filter(
      (r) => !r.transactionId && r.processingStatus === "completed"
    );
  }, [receipts]);

  /**
   * Find match suggestions for a specific receipt
   */
  const getMatchSuggestionsForReceipt = useCallback(
    (receipt: Receipt | null): MatchSuggestion[] => {
      if (!receipt || !transactions.length) {
        return [];
      }

      return findMatchesForReceipt(receipt, transactions, {
        minConfidence,
        maxResults,
      });
    },
    [transactions, minConfidence, maxResults]
  );

  /**
   * Query for match suggestions for the active receipt
   */
  const matchSuggestionsQuery = useQuery({
    queryKey: [...queryKeys.receipts, "matches", activeReceiptId],
    queryFn: () => {
      const receipt = (receipts as Receipt[]).find((r) => r.id === activeReceiptId);
      if (!receipt) return [];
      return getMatchSuggestionsForReceipt(receipt);
    },
    enabled: !!activeReceiptId && transactions.length > 0,
    staleTime: 30000,
    gcTime: 60000,
  });

  /**
   * Get all receipts with their best match suggestions
   */
  const receiptsWithSuggestions = useMemo((): ReceiptWithSuggestions[] => {
    return unlinkedReceipts.map((receipt) => {
      const suggestions = getMatchSuggestionsForReceipt(receipt);
      const bestMatch = suggestions.length > 0 ? suggestions[0] : null;

      return {
        ...receipt,
        matchSuggestions: suggestions,
        bestMatch,
        hasHighConfidenceMatch: bestMatch ? bestMatch.confidence >= CONFIDENCE_LEVELS.HIGH : false,
        hasMediumConfidenceMatch: bestMatch
          ? bestMatch.confidence >= CONFIDENCE_LEVELS.MEDIUM &&
            bestMatch.confidence < CONFIDENCE_LEVELS.HIGH
          : false,
      };
    });
  }, [unlinkedReceipts, getMatchSuggestionsForReceipt]);

  /**
   * Mutation for linking a receipt to a transaction (link only)
   */
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

      await updateReceiptAsync({
        id: receiptId,
        updates: {
          transactionId,
        },
      });

      await updateTransaction(transactionId, {
        receiptUrl: receiptId, // Store receipt reference
      });

      logger.info("✅ Receipt linked to transaction (link only)", {
        receiptId,
        transactionId,
      });

      return { receiptId, transactionId, updateType: "linkOnly" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      setShowConfirmModal(false);
      setSelectedMatch(null);
      setActiveReceiptId(null);
    },
    onError: (error) => {
      logger.error("❌ Failed to link receipt", error);
    },
  });

  /**
   * Mutation for linking and updating transaction from receipt data
   */
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

      const transactionUpdates: Record<string, unknown> = {
        receiptUrl: receiptId,
      };

      if (updates.updateMerchant && receipt.merchant) {
        transactionUpdates.description = receipt.merchant;
      }

      if (updates.updateAmount) {
        transactionUpdates.amount = receipt.amount || receipt.total;
      }

      if (updates.updateDate && receipt.date) {
        transactionUpdates.date = receipt.date;
      }

      await updateTransaction(transactionId, transactionUpdates);

      await linkReceiptToTransactionAsync({ receiptId, transactionId });

      await updateReceiptAsync({
        id: receiptId,
        updates: {
          transactionId,
        },
      });

      logger.info("✅ Receipt linked and transaction updated", {
        receiptId,
        transactionId,
        updates: transactionUpdates,
      });

      return {
        receiptId,
        transactionId,
        updateType: "linkAndUpdate",
        updates: transactionUpdates,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
      queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
      setShowConfirmModal(false);
      setSelectedMatch(null);
      setActiveReceiptId(null);
    },
    onError: (error) => {
      logger.error("❌ Failed to link and update transaction", error);
    },
  });

  /**
   * Mutation for dismissing a match suggestion
   */
  const dismissMatchMutation = useMutation({
    mutationKey: ["receipts", "dismissMatch"],
    mutationFn: async ({
      receiptId,
      transactionId,
    }: {
      receiptId: string;
      transactionId: string;
    }) => {
      const receipt = (receipts as Receipt[]).find((r) => r.id === receiptId);
      if (!receipt) throw new Error("Receipt not found");

      // Note: dismissedMatches would require extending the receipt type
      // For now, we just log the dismissal
      await updateReceiptAsync({
        id: receiptId,
        updates: {},
      });

      logger.info("Match suggestion dismissed", { receiptId, transactionId });

      return { receiptId, transactionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.receipts });
    },
  });

  /**
   * Open the match confirmation modal
   */
  const openMatchConfirmation = useCallback(
    (receipt: Receipt, matchSuggestion: MatchSuggestion) => {
      setActiveReceiptId(receipt.id);
      setSelectedMatch({
        receipt,
        ...matchSuggestion,
        differences: calculateDataDifferences(receipt, matchSuggestion.transaction),
      });
      setShowConfirmModal(true);
    },
    []
  );

  /**
   * Close the match confirmation modal
   */
  const closeMatchConfirmation = useCallback(() => {
    setShowConfirmModal(false);
    setSelectedMatch(null);
  }, []);

  /**
   * Confirm match with "Link Only" option
   */
  const confirmLinkOnly = useCallback(() => {
    if (!selectedMatch) return;

    linkOnlyMutation.mutate({
      receiptId: selectedMatch.receipt.id,
      transactionId: selectedMatch.transactionId,
    });
  }, [selectedMatch, linkOnlyMutation]);

  /**
   * Confirm match with "Link & Update" option
   */
  const confirmLinkAndUpdate = useCallback(
    (updateOptions: UpdateOptions = {}) => {
      if (!selectedMatch) return;

      linkAndUpdateMutation.mutate({
        receiptId: selectedMatch.receipt.id,
        transactionId: selectedMatch.transactionId,
        updates: updateOptions,
      });
    },
    [selectedMatch, linkAndUpdateMutation]
  );

  /**
   * Dismiss a match suggestion
   */
  const dismissMatch = useCallback(
    (receiptId: string, transactionId: string) => {
      dismissMatchMutation.mutate({ receiptId, transactionId });
    },
    [dismissMatchMutation]
  );

  /**
   * Get statistics about match suggestions
   */
  const matchStats = useMemo((): MatchStats => {
    const stats: MatchStats = {
      totalUnlinked: unlinkedReceipts.length,
      highConfidenceMatches: 0,
      mediumConfidenceMatches: 0,
      lowConfidenceMatches: 0,
      noMatches: 0,
    };

    receiptsWithSuggestions.forEach((r) => {
      if (!r.bestMatch) {
        stats.noMatches++;
      } else if (r.bestMatch.confidence >= CONFIDENCE_LEVELS.HIGH) {
        stats.highConfidenceMatches++;
      } else if (r.bestMatch.confidence >= CONFIDENCE_LEVELS.MEDIUM) {
        stats.mediumConfidenceMatches++;
      } else {
        stats.lowConfidenceMatches++;
      }
    });

    return stats;
  }, [receiptsWithSuggestions, unlinkedReceipts.length]);

  return {
    // Data
    unlinkedReceipts,
    receiptsWithSuggestions,
    matchSuggestions: matchSuggestionsQuery.data || [],
    selectedMatch,
    matchStats,

    // State
    activeReceiptId,
    showConfirmModal,
    isLoadingSuggestions: matchSuggestionsQuery.isLoading,
    isLinking: linkOnlyMutation.isPending,
    isLinkingAndUpdating: linkAndUpdateMutation.isPending,
    isDismissing: dismissMatchMutation.isPending,

    // Actions
    setActiveReceiptId,
    getMatchSuggestionsForReceipt,
    openMatchConfirmation,
    closeMatchConfirmation,
    confirmLinkOnly,
    confirmLinkAndUpdate,
    dismissMatch,

    // Utilities
    getConfidenceColor,
    getConfidenceLabel,
    CONFIDENCE_LEVELS,
  };
};

export default useReceiptMatching;
