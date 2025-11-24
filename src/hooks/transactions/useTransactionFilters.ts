import { useMemo } from "react";
import {
  isValidTransaction,
  matchesSearchTerm,
  matchesTypeFilter,
  matchesEnvelopeFilter,
  matchesDateFilter,
  compareTransactions,
} from "../../utils/validation";
import type { Transaction } from "@/types/finance";

interface UseTransactionFiltersParams {
  transactions: Transaction[];
  searchTerm: string;
  dateFilter: string;
  typeFilter: string;
  envelopeFilter: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export const useTransactionFilters = ({
  transactions,
  searchTerm,
  dateFilter,
  typeFilter,
  envelopeFilter,
  sortBy,
  sortOrder,
}: UseTransactionFiltersParams) => {
  const filteredTransactions = useMemo(() => {
    // Guard against undefined transactions
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }

    return transactions
      .filter((transaction) => {
        return (
          isValidTransaction(transaction) &&
          matchesSearchTerm(transaction as any, searchTerm) &&
          matchesTypeFilter(transaction as any, typeFilter) &&
          matchesEnvelopeFilter(transaction as any, envelopeFilter) &&
          matchesDateFilter(transaction as any, dateFilter)
        );
      })
      .sort((a, b) => compareTransactions(a as any, b as any, sortBy, sortOrder));
  }, [transactions, searchTerm, dateFilter, typeFilter, envelopeFilter, sortBy, sortOrder]);

  return filteredTransactions;
};
