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

interface ValidationTransaction {
  amount: number;
  description: string;
  date?: string | number;
  envelopeId?: string;
  [key: string]: unknown;
}

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
          matchesSearchTerm(transaction as ValidationTransaction, searchTerm) &&
          matchesTypeFilter(transaction as ValidationTransaction, typeFilter) &&
          matchesEnvelopeFilter(transaction as ValidationTransaction, envelopeFilter) &&
          matchesDateFilter(transaction as ValidationTransaction, dateFilter)
        );
      })
      .sort((a, b) =>
        compareTransactions(
          a as ValidationTransaction,
          b as ValidationTransaction,
          sortBy,
          sortOrder
        )
      );
  }, [transactions, searchTerm, dateFilter, typeFilter, envelopeFilter, sortBy, sortOrder]);

  return filteredTransactions;
};
