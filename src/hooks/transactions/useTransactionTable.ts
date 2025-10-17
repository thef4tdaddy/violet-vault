import { useState, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

/**
 * Hook for managing transaction table state and virtualization
 */
export const useTransactionTable = (transactions = []) => {
  const [historyTransaction, setHistoryTransaction] = useState(null);
  const [deletingTransaction, setDeletingTransaction] = useState(null);
  const parentRef = useRef(null);

  // Virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: transactions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  // Delete confirmation state management
  const handleDeleteClick = (transaction) => {
    setDeletingTransaction(transaction);
  };

  const cancelDelete = () => {
    setDeletingTransaction(null);
  };

  const handleHistoryClick = (transaction) => {
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
