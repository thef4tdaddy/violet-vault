import { useMemo } from "react";
import {
  isValidTransaction,
  matchesSearchTerm,
  matchesTypeFilter,
  matchesEnvelopeFilter,
  matchesDateFilter,
  compareTransactions,
} from "../../utils/validation";

export const useTransactionFilters = ({
  transactions,
  searchTerm,
  dateFilter,
  typeFilter,
  envelopeFilter,
  sortBy,
  sortOrder,
}) => {
  const filteredTransactions = useMemo(() => {
    // Guard against undefined transactions
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }

    return transactions
      .filter((transaction) => {
        return (
          isValidTransaction(transaction) &&
          matchesSearchTerm(transaction, searchTerm) &&
          matchesTypeFilter(transaction, typeFilter) &&
          matchesEnvelopeFilter(transaction, envelopeFilter) &&
          matchesDateFilter(transaction, dateFilter)
        );
      })
      .sort((a, b) => compareTransactions(a, b, sortBy, sortOrder));
  }, [transactions, searchTerm, dateFilter, typeFilter, envelopeFilter, sortBy, sortOrder]);

  return filteredTransactions;
};
