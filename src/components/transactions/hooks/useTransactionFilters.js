import { useMemo } from "react";

export const useTransactionFilters = (
  transactions,
  searchTerm,
  dateFilter,
  typeFilter,
  envelopeFilter,
  sortBy,
  sortOrder
) => {
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => {
        if (
          searchTerm &&
          !transaction.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        if (typeFilter !== "all") {
          if (typeFilter === "income" && transaction.amount <= 0) return false;
          if (typeFilter === "expense" && transaction.amount >= 0) return false;
        }

        if (
          envelopeFilter !== "all" &&
          transaction.envelopeId !== envelopeFilter
        ) {
          return false;
        }

        if (dateFilter !== "all") {
          const transactionDate = new Date(transaction.date);
          const now = new Date();

          switch (dateFilter) {
            case "today":
              return transactionDate.toDateString() === now.toDateString();
            case "week":
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              return transactionDate >= weekAgo;
            case "month":
              return (
                transactionDate.getMonth() === now.getMonth() &&
                transactionDate.getFullYear() === now.getFullYear()
              );
          }
        }

        return true;
      })
      .sort((a, b) => {
        let aVal, bVal;

        switch (sortBy) {
          case "date":
            aVal = new Date(a.date);
            bVal = new Date(b.date);
            break;
          case "amount":
            aVal = Math.abs(a.amount);
            bVal = Math.abs(b.amount);
            break;
          case "description":
            aVal = a.description.toLowerCase();
            bVal = b.description.toLowerCase();
            break;
          default:
            return 0;
        }

        if (sortOrder === "asc") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
  }, [transactions, searchTerm, dateFilter, typeFilter, envelopeFilter, sortBy, sortOrder]);

  return filteredTransactions;
};