import { useEffect } from "react";
import { useTransactionFilters } from "./useTransactionFilters";
import { useTransactionForm } from "./useTransactionForm";
import { useTransactionFormValidated } from "./useTransactionFormValidated";
import { useTransactionImport } from "./useTransactionImport";
import { suggestEnvelope } from "@/utils/transactions/envelopeMatching";
import { useBudgetStore } from "@/stores/ui/uiStore";
import { useTransactions } from "@/hooks/common/useTransactions";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import { useShallow } from "zustand/react/shallow";
import logger from "@/utils/common/logger";
import { useLedgerState } from "./helpers/useLedgerState";
import { useLedgerOperations } from "./helpers/useLedgerOperations";
import type { TransactionInput } from "./useTransactionMutations";

/**
 * Custom hook for TransactionLedger component
 * Handles all state management, data processing, and business logic
 */
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
      (state: {
        setAllTransactions?: (transactions: unknown[]) => void;
        updateBill?: (bill: unknown) => void;
      }) => ({
        setAllTransactions: state.setAllTransactions,
        updateBill: state.updateBill,
      })
    )
  );
  const { setAllTransactions, updateBill } = budget;

  // Use extracted state management hook
  const ledgerState = useLedgerState();

  const pageSize = 10;

  // Handle bulk import by updating both store arrays
  const handleBulkImport = (newTransactions: unknown[]) => {
    logger.debug("🔄 Bulk import called with transactions:", { count: newTransactions.length });
    const updatedAllTransactions = [...transactions, ...newTransactions];
    setAllTransactions?.(updatedAllTransactions);
    logger.debug("💾 Bulk import complete. Total transactions:", {
      count: updatedAllTransactions.length,
    });
  };

  // Custom hooks - Keep old hook for backwards compatibility with TransactionForm component
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
    addTransactionAsync,
    deleteTransaction,
    updateBill,
    envelopes as unknown as Array<Record<string, unknown>>
  );

  // New validated form hook
  const validatedForm = useTransactionFormValidated({
    editingTransaction: ledgerState.editingTransaction,
    onAddTransaction: (transaction) =>
      addTransactionAsync({
        date: transaction.date,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        envelopeId: transaction.envelopeId,
        type: transaction.type,
        notes: transaction.notes,
      } as TransactionInput),
    onUpdateTransaction: (transaction) =>
      updateTransactionAsync({
        id: String(transaction.id),
        updates: {
          date: new Date(transaction.date),
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          envelopeId: transaction.envelopeId,
          notes: transaction.notes,
          type: transaction.type,
        },
      }),
    onDeleteTransaction: async (id) => {
      await deleteTransaction(id as never);
    },
    onPayBill: operations.handlePayBill,
    onClose: () => {
      ledgerState.setShowAddModal(false);
      ledgerState.setEditingTransaction(null);
    },
    onError: (error) => logger.error("Transaction form error", { error }),
    envelopes,
  });

  // Event handlers
  const handleSubmitTransaction = async () => {
    const newTransaction = createTransaction(currentUser);

    if (ledgerState.editingTransaction) {
      const transactionWithId = {
        ...newTransaction,
        id: ledgerState.editingTransaction.id,
      };
      try {
        await updateTransactionAsync({
          id: String(transactionWithId.id),
          updates: {
            date: new Date(transactionWithId.date),
            amount: transactionWithId.amount,
            category: transactionWithId.category,
            description: transactionWithId.description,
            envelopeId: transactionWithId.envelopeId ?? "",
            notes: transactionWithId.notes,
            type: transactionWithId.type,
          },
        });
        logger.info("✅ Transaction updated", {
          id: transactionWithId.id,
          amount: transactionWithId.amount,
        });
        ledgerState.setEditingTransaction(null);
      } catch (error) {
        logger.error("Failed to update transaction", { error });
        return;
      }
    } else {
      try {
        await addTransactionAsync(newTransaction as TransactionInput);
        logger.info("✅ Transaction added", {
          amount: newTransaction.amount,
          type: newTransaction.type,
        });
      } catch (error) {
        logger.error("Failed to add transaction", { error });
        return;
      }
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

  const handleSuggestEnvelope = (description: string) => {
    return suggestEnvelope(
      description,
      envelopes as unknown as import("@/types/finance").Envelope[]
    );
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
