import { useState, useEffect } from "react";
import { useTransactionFilters } from "./useTransactionFilters";
import { useTransactionForm } from "./useTransactionForm";
import { useTransactionImport } from "./useTransactionImport";
import { suggestEnvelope } from "../../utils/transactions/envelopeMatching";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { useTransactions } from "../common/useTransactions";
import { useEnvelopes } from "../budgeting/useEnvelopes";
import logger from "../../utils/common/logger";

/**
 * Custom hook for TransactionLedger component
 * Handles all state management, data processing, and business logic
 */
export const useTransactionLedger = (currentUser) => {
  // Enhanced TanStack Query integration with caching and optimistic updates
  const {
    transactions = [],
    addTransaction,
    deleteTransaction,
    isLoading: transactionsLoading,
  } = useTransactions();

  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();

  // Keep Zustand for legacy operations not yet migrated
  const budget = useBudgetStore();
  const { updateTransaction, setAllTransactions, updateBill } = budget;

  // State management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [splittingTransaction, setSplittingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [envelopeFilter, setEnvelopeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);

  const pageSize = 10;

  // Handle bulk import by updating both store arrays
  const handleBulkImport = (newTransactions) => {
    logger.debug("🔄 Bulk import called with transactions:", newTransactions.length);
    const updatedAllTransactions = [...transactions, ...newTransactions];
    setAllTransactions(updatedAllTransactions);
    logger.debug("💾 Bulk import complete. Total transactions:", updatedAllTransactions.length);
  };

  // Custom hooks
  const { transactionForm, setTransactionForm, resetForm, populateForm, createTransaction } =
    useTransactionForm();

  const {
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,
    handleFileUpload,
    handleImport,
    resetImport,
  } = useTransactionImport(currentUser, handleBulkImport, budget);

  const filteredTransactions = useTransactionFilters(
    transactions,
    searchTerm,
    dateFilter,
    typeFilter,
    envelopeFilter,
    sortBy,
    sortOrder
  );

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTransactions.length]);

  // Event handlers
  const handleSubmitTransaction = () => {
    const newTransaction = createTransaction(currentUser);

    if (editingTransaction) {
      // Budget store updateTransaction expects the full transaction object with id
      const transactionWithId = {
        ...newTransaction,
        id: editingTransaction.id,
      };
      updateTransaction(transactionWithId);
      setEditingTransaction(null);
    } else {
      addTransaction(newTransaction);
    }

    setShowAddModal(false);
    resetForm();
  };

  const startEdit = (transaction) => {
    populateForm(transaction);
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingTransaction(null);
    resetForm();
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    resetImport();
  };

  const handleSuggestEnvelope = (description) => {
    return suggestEnvelope(description, envelopes);
  };

  const handlePayBill = (billPayment) => {
    // Update the bill to mark it as paid
    const billEnvelope = envelopes.find((env) => env.id === billPayment.billId);
    if (billEnvelope) {
      const updatedBill = {
        ...billEnvelope,
        lastPaidDate: billPayment.paidDate,
        lastPaidAmount: billPayment.amount,
        currentBalance: Math.max(0, (billEnvelope.currentBalance || 0) - billPayment.amount),
        isPaid: true,
        paidThisPeriod: true,
      };
      updateBill(updatedBill);
    }
  };

  const handleSplitTransaction = async (originalTransaction, splitTransactions) => {
    try {
      // Delete the original transaction
      deleteTransaction(originalTransaction.id);

      // Add each split transaction
      for (const splitTransaction of splitTransactions) {
        addTransaction(splitTransaction);
      }

      // Close the modal
      setSplittingTransaction(null);
    } catch (error) {
      logger.error("Error splitting transaction:", error);
    }
  };

  const handleFilterChange = (key, value) => {
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
        setSortOrder(value);
        break;
    }
  };

  const handlePagination = (direction) => {
    if (direction === "prev") {
      setCurrentPage((p) => Math.max(1, p - 1));
    } else if (direction === "next") {
      setCurrentPage((p) => Math.min(totalPages, p + 1));
    }
  };

  return {
    // Data
    transactions,
    envelopes,
    paginatedTransactions,
    filteredTransactions,

    // Loading states
    isLoading: transactionsLoading || envelopesLoading,

    // Modal states
    showAddModal,
    setShowAddModal,
    showImportModal,
    setShowImportModal,
    editingTransaction,
    splittingTransaction,
    setSplittingTransaction,

    // Form data
    transactionForm,
    setTransactionForm,

    // Filter states
    searchTerm,
    dateFilter,
    typeFilter,
    envelopeFilter,
    sortBy,
    sortOrder,

    // Pagination
    currentPage,
    totalPages,

    // Import states
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,

    // Event handlers
    handleSubmitTransaction,
    startEdit,
    handleCloseModal,
    handleCloseImportModal,
    handleSuggestEnvelope,
    handlePayBill,
    handleSplitTransaction,
    handleFilterChange,
    handlePagination,
    handleFileUpload,
    handleImport,

    // Operations
    deleteTransaction,
  };
};

export default useTransactionLedger;
