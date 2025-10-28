import { useEffect } from "react";
import { useTransactionFilters } from "./useTransactionFilters";
import { useTransactionForm } from "./useTransactionForm";
import { useTransactionImport } from "./useTransactionImport";
import { suggestEnvelope } from "../../utils/transactions/envelopeMatching";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { useTransactions } from "../common/useTransactions";
import { useEnvelopes } from "../budgeting/useEnvelopes";
import { useShallow } from "zustand/react/shallow";
import logger from "../../utils/common/logger";
import { useLedgerState } from "./helpers/useLedgerState";
import { useLedgerOperations } from "./helpers/useLedgerOperations";

/**
 * Custom hook for TransactionLedger component
 * Handles all state management, data processing, and business logic
 */
export const useTransactionLedger = (currentUser: unknown) => {
  // Enhanced TanStack Query integration with caching and optimistic updates
  const {
    transactions = [],
    addTransaction,
    deleteTransaction,
    isLoading: transactionsLoading,
  } = useTransactions();

  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();

  // Keep Zustand for legacy operations not yet migrated
  const budget = useBudgetStore(
    useShallow((state) => ({
      updateTransaction: state.updateTransaction,
      setAllTransactions: state.setAllTransactions,
      updateBill: state.updateBill,
    }))
  ) as {
    updateTransaction?: (transaction: unknown) => void;
    setAllTransactions?: (transactions: unknown[]) => void;
    updateBill?: (bill: unknown) => void;
  };
  const { updateTransaction, setAllTransactions, updateBill } = budget;

  // Use extracted state management hook
  const ledgerState = useLedgerState();

  const pageSize = 10;

  // Handle bulk import by updating both store arrays
  const handleBulkImport = (newTransactions: unknown[]) => {
    logger.debug("🔄 Bulk import called with transactions:", newTransactions.length);
    const updatedAllTransactions = [...transactions, ...newTransactions];
    setAllTransactions?.(updatedAllTransactions);
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
  } = useTransactionImport(currentUser, handleBulkImport);

  const filteredTransactions = useTransactionFilters({
    transactions,
    searchTerm: ledgerState.searchTerm,
    dateFilter: ledgerState.dateFilter,
    typeFilter: ledgerState.typeFilter,
    envelopeFilter: ledgerState.envelopeFilter,
    sortBy: ledgerState.sortBy,
    sortOrder: ledgerState.sortOrder,
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  const paginatedTransactions = filteredTransactions.slice(
    (ledgerState.currentPage - 1) * pageSize,
    ledgerState.currentPage * pageSize
  );

  // Reset pagination when filters change
  useEffect(() => {
    ledgerState.setCurrentPage(1);
  }, [filteredTransactions.length, ledgerState]);

  // Use extracted operations hook
  const operations = useLedgerOperations(
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateBill,
    envelopes
  );

  // Event handlers
  const handleSubmitTransaction = () => {
    const newTransaction = createTransaction(currentUser);

    if (ledgerState.editingTransaction) {
      const transactionWithId = {
        ...newTransaction,
        id: ledgerState.editingTransaction.id,
      };
      updateTransaction(transactionWithId);
      ledgerState.setEditingTransaction(null);
    } else {
      addTransaction(newTransaction);
    }

    ledgerState.setShowAddModal(false);
    resetForm();
  };

  const startEdit = (transaction) => {
    populateForm(transaction);
    ledgerState.setEditingTransaction(transaction);
    ledgerState.setShowAddModal(true);
  };

  const handleCloseModal = () => {
    ledgerState.setShowAddModal(false);
    ledgerState.setEditingTransaction(null);
    resetForm();
  };

  const handleCloseImportModal = () => {
    ledgerState.setShowImportModal(false);
    resetImport();
  };

  const handleSuggestEnvelope = (description) => {
    return suggestEnvelope(description, envelopes);
  };

  const handlePagination = (direction) => {
    if (direction === "prev") {
      ledgerState.setCurrentPage((p) => Math.max(1, p - 1));
    } else if (direction === "next") {
      ledgerState.setCurrentPage((p) => Math.min(totalPages, p + 1));
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

    // Modal states - from ledgerState
    ...ledgerState,

    // Form data
    transactionForm,
    setTransactionForm,

    // Pagination
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
    handlePayBill: operations.handlePayBill,
    handleSplitTransaction: operations.handleSplitTransaction,
    handlePagination,
    handleFileUpload,
    handleImport,

    // Operations
    deleteTransaction,
  };
};

export default useTransactionLedger;
