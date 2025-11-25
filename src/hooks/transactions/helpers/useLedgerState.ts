/**
 * State management for transaction ledger
 * Extracted from useTransactionLedger to reduce complexity
 */
import { useState } from "react";

export const useLedgerState = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [splittingTransaction, setSplittingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [envelopeFilter, setEnvelopeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);

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
