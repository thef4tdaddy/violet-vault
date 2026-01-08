import { useEffect } from "react";
import { useTransactionFilters } from "./useTransactionFilters";
import { useTransactionForm } from "./useTransactionForm";
import { suggestEnvelope } from "@/utils/transactions/envelopeMatching";
import { useBudgetStore, type UiStore } from "@/stores/ui/uiStore";
import { useTransactions } from "@/hooks/common/useTransactions";
import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { useShallow } from "zustand/react/shallow";
import { useLedgerState } from "./helpers/useLedgerState";
import { useLedgerOperations } from "./helpers/useLedgerOperations";
import { useTransactionHandlers } from "./helpers/useTransactionHandlers";
import { useLedgerImport } from "./helpers/useLedgerImport";
import { useLedgerForm } from "./helpers/useLedgerForm";
import type { TransactionInput } from "./useTransactionOperations";
import type { Transaction as FinanceTransaction } from "@/types/finance";

/**
 * Custom hook for TransactionLedger component
 * Handles all state management, data processing, and business logic
 */
// eslint-disable-next-line max-lines-per-function
export const useTransactionLedger = (currentUser: unknown) => {
  // Enhanced TanStack Query integration with caching and optimistic updates
  const {
    transactions = [],
    addTransactionAsync,
    deleteTransaction,
    updateTransactionAsync,
    isLoading: transactionsLoading,
  } = useTransactions();

  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();

  // Keep Zustand for legacy operations not yet migrated
  const budget = useBudgetStore(
    useShallow(
      (
        state: UiStore & {
          setAllTransactions?: (transactions: unknown[]) => void;
          updateBill?: (bill: unknown) => void;
        }
      ) => ({
        setAllTransactions: state.setAllTransactions,
        updateBill: state.updateBill,
      })
    )
  );
  const { setAllTransactions, updateBill } = budget;

  // Use extracted state management hook
  const ledgerState = useLedgerState();
  const { currentPage, setCurrentPage } = ledgerState;

  const pageSize = 10;

  // Handle bulk import by updating both store arrays
  // const handleBulkImport = (newTransactions: unknown[]): void => {
  //   logger.debug("🔄 Bulk import called with transactions:", { count: newTransactions.length });
  //   const updatedAllTransactions = [...transactions, ...newTransactions];
  //   setAllTransactions?.(updatedAllTransactions);
  //   logger.debug("💾 Bulk import complete. Total transactions:", {
  //     count: updatedAllTransactions.length,
  //   });
  // };

  // Custom hooks - Keep old hook for backwards compatibility with TransactionForm component
  const { transactionForm, setTransactionForm, resetForm, populateForm, createTransaction } =
    useTransactionForm();

  // Extract import logic
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
  } = useLedgerImport({
    currentUser,
    transactions,
    setAllTransactions,
  });

  const filteredTransactions = useTransactionFilters({
    transactions: transactions as unknown as FinanceTransaction[],
    searchTerm: ledgerState.searchTerm,
    dateFilter: ledgerState.dateFilter,
    typeFilter: ledgerState.typeFilter,
    envelopeFilter: ledgerState.envelopeFilter,
    sortBy: ledgerState.sortBy,
    sortOrder: ledgerState.sortOrder,
  });

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredTransactions.length]);

  // Use extracted operations hook
  const operations = useLedgerOperations(
    addTransactionAsync as (t: unknown) => Promise<unknown>,
    deleteTransaction as (id: string | number) => Promise<unknown>,
    updateBill as (bill: Record<string, unknown>) => void,
    envelopes as unknown as Array<Record<string, unknown>>
  );

  // New validated form hook extracted to helper
  const validatedForm = useLedgerForm({
    ledgerState: {
      editingTransaction: ledgerState.editingTransaction,
      setEditingTransaction: ledgerState.setEditingTransaction,
      setShowAddModal: ledgerState.setShowAddModal,
    },
    actions: {
      addTransactionAsync: addTransactionAsync as unknown as (t: TransactionInput) => Promise<void>,
      updateTransactionAsync: updateTransactionAsync as unknown as (
        id: string,
        updates: Partial<TransactionInput>
      ) => Promise<void>,
      deleteTransaction: deleteTransaction as unknown as (id: string) => Promise<void>,
      handlePayBill: operations.handlePayBill as unknown as (
        billPayment: import("./helpers/useLedgerForm").BillPayment
      ) => void,
    },
    envelopes: envelopes as import("@/types/finance").Envelope[],
  });

  // Event handlers
  // Event handlers extracted to useTransactionHandlers
  const { handleSubmitTransaction, startEdit, handleCloseModal, handleCloseImportModal } =
    useTransactionHandlers({
      currentUser,
      ledgerState: {
        editingTransaction: ledgerState.editingTransaction,
        setEditingTransaction: ledgerState.setEditingTransaction,
        setShowAddModal: ledgerState.setShowAddModal,
        setShowImportModal: ledgerState.setShowImportModal,
      },
      actions: {
        createTransaction: createTransaction as unknown as (user: {
          userName: string;
        }) => FinanceTransaction,
        addTransactionAsync: addTransactionAsync as unknown as (
          t: TransactionInput
        ) => Promise<void>,
        updateTransactionAsync: updateTransactionAsync as unknown as (
          id: string,
          updates: Partial<TransactionInput>
        ) => Promise<void>,
        resetForm,
        populateForm: populateForm as unknown as (t: unknown) => void,
        resetImport,
      },
    });

  const handleSuggestEnvelope = (description: string) => {
    return suggestEnvelope(
      description,
      envelopes as unknown as import("@/types/finance").Envelope[]
    );
  };

  const handlePagination = (direction: "prev" | "next"): void => {
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

    // Modal states - from ledgerState
    ...ledgerState,
    currentPage,

    // Form data (legacy - for backwards compatibility)
    transactionForm,
    setTransactionForm,

    // Validated form (new pattern)
    validatedForm,

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
