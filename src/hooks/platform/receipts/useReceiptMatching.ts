import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useReceipts } from "@/hooks/platform/data/useReceipts";
import { useTransactionQuery } from "@/hooks/budgeting/transactions/useTransactionQuery";
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
import { useReceiptMatchingMutations, type UpdateOptions } from "./useReceiptMatchingMutations";

export interface SelectedMatch extends MatchSuggestion {
  receipt: Receipt;
  differences: DataDifference[];
}

export interface MatchStats {
  totalUnlinked: number;
  highConfidenceMatches: number;
  mediumConfidenceMatches: number;
  lowConfidenceMatches: number;
  noMatches: number;
}

export interface ReceiptWithSuggestions extends Receipt {
  matchSuggestions: MatchSuggestion[];
  bestMatch: MatchSuggestion | null;
  hasHighConfidenceMatch: boolean;
  hasMediumConfidenceMatch: boolean;
}

export interface UseReceiptMatchingOptions {
  minConfidence?: number;
  maxResults?: number;
  onMatchSuccess?: () => void;
}

export const useReceiptMatching = (options: UseReceiptMatchingOptions = {}) => {
  const { minConfidence = CONFIDENCE_LEVELS.MINIMUM, maxResults = 5, onMatchSuccess } = options;

  const { receipts } = useReceipts();
  const { transactions } = useTransactionQuery({ limit: 500 });

  const [activeReceiptId, setActiveReceiptId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<SelectedMatch | null>(null);

  const resetSelection = useCallback(() => {
    setShowConfirmModal(false);
    setSelectedMatch(null);
    setActiveReceiptId(null);
  }, []);

  const { linkOnlyMutation, linkAndUpdateMutation, dismissMatchMutation } =
    useReceiptMatchingMutations(() => {
      resetSelection();
      if (onMatchSuccess) onMatchSuccess();
    });

  const unlinkedReceipts = useMemo(() => {
    return (receipts as Receipt[]).filter(
      (r) => !r.transactionId && r.processingStatus === "completed"
    );
  }, [receipts]);

  const getMatchSuggestionsForReceipt = useCallback(
    (receipt: Receipt | null): MatchSuggestion[] => {
      if (!receipt || !transactions.length) return [];
      return findMatchesForReceipt(receipt, transactions, { minConfidence, maxResults });
    },
    [transactions, minConfidence, maxResults]
  );

  const matchSuggestionsQuery = useQuery({
    queryKey: [...queryKeys.receipts, "matches", activeReceiptId],
    queryFn: () => {
      const receipt = (receipts as Receipt[]).find((r) => r.id === activeReceiptId);
      return receipt ? getMatchSuggestionsForReceipt(receipt) : [];
    },
    enabled: !!activeReceiptId && transactions.length > 0,
    staleTime: 30000,
    gcTime: 60000,
  });

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

  const closeMatchConfirmation = useCallback(() => {
    setShowConfirmModal(false);
    setSelectedMatch(null);
  }, []);

  const confirmLinkOnly = useCallback(() => {
    if (selectedMatch) {
      linkOnlyMutation.mutate({
        receiptId: selectedMatch.receipt.id,
        transactionId: selectedMatch.transactionId,
      });
    }
  }, [selectedMatch, linkOnlyMutation]);

  const confirmLinkAndUpdate = useCallback(
    (updateOpts: UpdateOptions = {}) => {
      if (selectedMatch) {
        linkAndUpdateMutation.mutate({
          receiptId: selectedMatch.receipt.id,
          transactionId: selectedMatch.transactionId,
          updates: updateOpts,
        });
      }
    },
    [selectedMatch, linkAndUpdateMutation]
  );

  const matchStats = useMemo((): MatchStats => {
    const stats: MatchStats = {
      totalUnlinked: unlinkedReceipts.length,
      highConfidenceMatches: 0,
      mediumConfidenceMatches: 0,
      lowConfidenceMatches: 0,
      noMatches: 0,
    };

    receiptsWithSuggestions.forEach((r) => {
      if (!r.bestMatch) stats.noMatches++;
      else if (r.bestMatch.confidence >= CONFIDENCE_LEVELS.HIGH) stats.highConfidenceMatches++;
      else if (r.bestMatch.confidence >= CONFIDENCE_LEVELS.MEDIUM) stats.mediumConfidenceMatches++;
      else stats.lowConfidenceMatches++;
    });

    return stats;
  }, [receiptsWithSuggestions, unlinkedReceipts.length]);

  return {
    unlinkedReceipts,
    receiptsWithSuggestions,
    matchSuggestions: matchSuggestionsQuery.data || [],
    selectedMatch,
    matchStats,
    activeReceiptId,
    showConfirmModal,
    isLoadingSuggestions: matchSuggestionsQuery.isLoading,
    isLinking: linkOnlyMutation.isPending,
    isLinkingAndUpdating: linkAndUpdateMutation.isPending,
    isDismissing: dismissMatchMutation.isPending,
    setActiveReceiptId,
    getMatchSuggestionsForReceipt,
    openMatchConfirmation,
    closeMatchConfirmation,
    confirmLinkOnly,
    confirmLinkAndUpdate,
    dismissMatch: (rId: string, tId: string) =>
      dismissMatchMutation.mutate({ receiptId: rId, transactionId: tId }),
    getConfidenceColor,
    getConfidenceLabel,
    CONFIDENCE_LEVELS,
  };
};

export default useReceiptMatching;
