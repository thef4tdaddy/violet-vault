/**
 * State management for transaction ledger
 * Extracted from useTransactionLedger to reduce complexity
 */
import { useState } from "react";
import type { Transaction as FinanceTransaction } from "@/types/finance";

export const useLedgerState = () => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<FinanceTransaction | null>(null);
  const [splittingTransaction, setSplittingTransaction] = useState<FinanceTransaction | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [envelopeFilter, setEnvelopeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const handleFilterChange = (key: string, value: string) => {
    switch (key) {
      case "search":
        setSearchTerm(value);
        break;
      case "dateFilter":
        setDateFilter(value);
        break;
      case "typeFilter":
        setTypeFilter(value);
        break;
      case "envelopeFilter":
        setEnvelopeFilter(value);
        break;
      case "sortBy":
        setSortBy(value);
        break;
      case "sortOrder":
        setSortOrder(value as "asc" | "desc");
        break;
    }
  };

  return {
    // Modal states
    showAddModal,
    setShowAddModal,
    showImportModal,
    setShowImportModal,
    editingTransaction,
    setEditingTransaction,
    splittingTransaction,
    setSplittingTransaction,

    // Filter states
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    typeFilter,
    setTypeFilter,
    envelopeFilter,
    setEnvelopeFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Pagination
    currentPage,
    setCurrentPage,

    // Handlers
    handleFilterChange,
  };
};
