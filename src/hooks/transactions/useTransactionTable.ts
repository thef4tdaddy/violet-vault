import { useState, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

/**
 * Hook for managing transaction table state and virtualization
 */
interface Transaction {
  id: string;
  [key: string]: unknown;
}

export const useTransactionTable = (transactions: Transaction[] = []) => {
  const [historyTransaction, setHistoryTransaction] = useState<Transaction | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<Transaction | null>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  // Memoize estimateSize for virtualizer compatibility
  const estimateSize = useCallback(() => 80, []);

  // Virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan: 10,
  });

  // Delete confirmation state management
  const handleDeleteClick = (transaction: Transaction) => {
    setDeletingTransaction(transaction);
  };

  const cancelDelete = () => {
    setDeletingTransaction(null);
  };

  const handleHistoryClick = (transaction: Transaction) => {
    setHistoryTransaction(transaction);
  };

  const closeHistory = () => {
    setHistoryTransaction(null);
  };

  return {
    // Refs
    parentRef,

    // Virtualization
    rowVirtualizer,

    // State
    historyTransaction,
    deletingTransaction,

    // Actions
    handleDeleteClick,
    cancelDelete,
    handleHistoryClick,
    closeHistory,
  };
};

export default useTransactionTable;
