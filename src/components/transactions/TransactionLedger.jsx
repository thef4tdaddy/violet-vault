import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Upload } from "lucide-react";

import TransactionSummaryCards from "./TransactionSummaryCards";
import StandardFilters from "../ui/StandardFilters";
import TransactionTable from "./TransactionTable";
import TransactionForm from "./TransactionForm";
import ImportModal from "./import/ImportModal";
import TransactionSplitter from "./TransactionSplitter";

import { useTransactionFilters } from "../../hooks/transactions/useTransactionFilters";
import { useTransactionForm } from "../../hooks/transactions/useTransactionForm";
import { useTransactionImport } from "../../hooks/transactions/useTransactionImport";
import { suggestEnvelope } from "../../utils/transactions/envelopeMatching";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { useBudgetStore } from "../../stores/ui/uiStore";
import { useTransactions } from "../../hooks/common/useTransactions";
import { useEnvelopes } from "../../hooks/budgeting/useEnvelopes";
import logger from "../../utils/common/logger";

const TransactionLedger = ({
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  // Enhanced TanStack Query integration with caching and optimistic updates
  const {
    transactions = [],
    addTransaction,
    deleteTransaction,
    isLoading: transactionsLoading,
  } = useTransactions();

  const { envelopes = [], isLoading: envelopesLoading } = useEnvelopes();

  // Removed excessive debug logging that was spamming console (issue #463)

  // Keep Zustand for legacy operations not yet migrated
  const budget = useBudgetStore();
  const { updateTransaction, setAllTransactions, updateBill } = budget;

  // Handle bulk import by updating both store arrays
  const handleBulkImport = (newTransactions) => {
    logger.debug(
      "🔄 Bulk import called with transactions:",
      newTransactions.length,
    );
    const updatedAllTransactions = [...transactions, ...newTransactions];
    setAllTransactions(updatedAllTransactions);
    logger.debug(
      "💾 Bulk import complete. Total transactions:",
      updatedAllTransactions.length,
    );
  };
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

  // Custom hooks
  const {
    transactionForm,
    setTransactionForm,
    resetForm,
    populateForm,
    createTransaction,
  } = useTransactionForm();

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
    sortOrder,
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / pageSize),
  );
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTransactions.length]);

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
        currentBalance: Math.max(
          0,
          (billEnvelope.currentBalance || 0) - billPayment.amount,
        ),
        isPaid: true,
        paidThisPeriod: true,
      };
      updateBill(updatedBill);
    }
  };

  const handleSplitTransaction = async (
    originalTransaction,
    splitTransactions,
  ) => {
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
      // You could add error handling here if needed
    }
  };

  const totalIncome = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t && typeof t.amount === "number" && t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;

  // Show loading state while data is fetching
  if (transactionsLoading || envelopesLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="font-black text-black text-base flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-emerald-500 p-3 rounded-2xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="text-lg">T</span>RANSACTION{" "}
            <span className="text-lg">L</span>EDGER
          </h2>
          <p className="text-purple-900 mt-1">
            {transactions.length} transactions • Net: ${netCashFlow.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-row gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-primary border-2 border-black flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import File
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary border-2 border-black flex items-center"
            data-tour="add-transaction"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <TransactionSummaryCards transactions={transactions} />

      {/* Filters */}
      <StandardFilters
        filters={{
          search: searchTerm,
          dateFilter,
          typeFilter,
          envelopeFilter,
          sortBy,
          sortOrder,
        }}
        onFilterChange={(key, value) => {
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
        }}
        filterConfigs={[
          {
            key: "dateFilter",
            type: "select",
            defaultValue: "all",
            options: [
              { value: "all", label: "All Time" },
              { value: "today", label: "Today" },
              { value: "week", label: "This Week" },
              { value: "month", label: "This Month" },
            ],
          },
          {
            key: "typeFilter",
            type: "select",
            defaultValue: "all",
            options: [
              { value: "all", label: "All Types" },
              { value: "income", label: "Income" },
              { value: "expense", label: "Expenses" },
            ],
          },
          {
            key: "envelopeFilter",
            type: "select",
            defaultValue: "all",
            options: [
              { value: "all", label: "All Envelopes" },
              { value: "", label: "Unassigned" },
              ...envelopes.map((env) => ({ value: env.id, label: env.name })),
            ],
          },
          {
            key: "sortBy",
            type: "select",
            defaultValue: "date",
            options: [
              { value: "date", label: "Date" },
              { value: "amount", label: "Amount" },
              { value: "description", label: "Description" },
            ],
          },
        ]}
        searchPlaceholder="Search transactions..."
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={paginatedTransactions}
        envelopes={envelopes}
        onEdit={startEdit}
        onDelete={deleteTransaction}
        onSplit={(transaction) => setSplittingTransaction(transaction)}
      />

      <div className="flex items-center justify-between mt-4">
        <button
          className="btn btn-secondary border-2 border-black"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-secondary border-2 border-black"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          Next
        </button>
      </div>

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showAddModal}
        onClose={handleCloseModal}
        editingTransaction={editingTransaction}
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        envelopes={envelopes}
        categories={TRANSACTION_CATEGORIES}
        onSubmit={handleSubmitTransaction}
        suggestEnvelope={handleSuggestEnvelope}
        onPayBill={handlePayBill}
      />

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={handleCloseImportModal}
        importStep={importStep}
        setImportStep={setImportStep}
        importData={importData}
        fieldMapping={fieldMapping}
        setFieldMapping={setFieldMapping}
        importProgress={importProgress}
        onImport={handleImport}
        onFileUpload={handleFileUpload}
      />

      {/* Transaction Splitter Modal */}
      <TransactionSplitter
        isOpen={!!splittingTransaction}
        onClose={() => setSplittingTransaction(null)}
        transaction={splittingTransaction}
        envelopes={envelopes}
        availableCategories={TRANSACTION_CATEGORIES}
        onSplitTransaction={handleSplitTransaction}
      />
    </div>
  );
};

export default TransactionLedger;
