import { useMemo } from "react";
import {
  isValidTransaction,
  matchesSearchTerm,
  matchesTypeFilter,
  matchesEnvelopeFilter,
  matchesDateFilter,
  compareTransactions,
} from "@/utils/validation";
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
        // Cast to validation-compatible format
        const txn = transaction as unknown as {
          amount: number;
          description: string;
          date?: string | number;
          envelopeId?: string;
          [key: string]: unknown;
        };
        return (
          isValidTransaction(transaction) &&
          matchesSearchTerm(txn, searchTerm) &&
          matchesTypeFilter(txn, typeFilter) &&
          matchesEnvelopeFilter(txn, envelopeFilter) &&
          matchesDateFilter(txn, dateFilter)
        );
      })
      .sort((a, b) => {
        // Cast to validation-compatible format
        const txnA = a as unknown as {
          amount: number;
          description: string;
          date?: string | number;
          envelopeId?: string;
          [key: string]: unknown;
        };
        const txnB = b as unknown as {
          amount: number;
          description: string;
          date?: string | number;
          envelopeId?: string;
          [key: string]: unknown;
        };
        return compareTransactions(txnA, txnB, sortBy, sortOrder);
      });
  }, [transactions, searchTerm, dateFilter, typeFilter, envelopeFilter, sortBy, sortOrder]);

  return filteredTransactions;
};
