import { useMemo } from "react";

// Helper: Check if transaction is valid
const isValidTransaction = (transaction) => {
  return transaction && typeof transaction.amount === "number" && transaction.description;
};

// Helper: Check if transaction matches search term
const matchesSearchTerm = (transaction, searchTerm) => {
  if (!searchTerm) return true;
  return transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
};

// Helper: Check if transaction matches type filter
const matchesTypeFilter = (transaction, typeFilter) => {
  if (typeFilter === "all") return true;
  if (typeFilter === "income") return transaction.amount > 0;
  if (typeFilter === "expense") return transaction.amount < 0;
  return true;
};

// Helper: Check if transaction matches envelope filter
const matchesEnvelopeFilter = (transaction, envelopeFilter) => {
  if (envelopeFilter === "all") return true;
  return transaction.envelopeId === envelopeFilter;
};

// Helper: Check if transaction matches date filter
const matchesDateFilter = (transaction, dateFilter) => {
  if (dateFilter === "all") return true;

  const transactionDate = new Date(transaction.date);
  const now = new Date();

  if (dateFilter === "today") {
    return transactionDate.toDateString() === now.toDateString();
  }

  if (dateFilter === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return transactionDate >= weekAgo;
  }

  if (dateFilter === "month") {
    return (
      transactionDate.getMonth() === now.getMonth() &&
      transactionDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
};

// Helper: Get sort value for transaction
const getSortValue = (transaction, sortBy) => {
  switch (sortBy) {
    case "date":
      return new Date(transaction.date || 0);
    case "amount":
      return Math.abs(transaction.amount || 0);
    case "description":
      return (transaction.description || "").toLowerCase();
    default:
      return null;
  }
};

// Helper: Compare transactions for sorting
const compareTransactions = (a, b, sortBy, sortOrder) => {
  if (!a || !b) return 0;

  const aVal = getSortValue(a, sortBy);
  const bVal = getSortValue(b, sortBy);

  if (aVal === null || bVal === null) return 0;

  const comparison = aVal > bVal ? 1 : -1;
  return sortOrder === "asc" ? comparison : -comparison;
};

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
