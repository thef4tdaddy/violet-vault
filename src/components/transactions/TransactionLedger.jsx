import React, { useState, useEffect } from "react";
import { BookOpen, Plus, Upload } from "lucide-react";

import TransactionSummary from "./TransactionSummary";
import TransactionFilters from "./TransactionFilters";
import TransactionTable from "./TransactionTable";
import TransactionForm from "./TransactionForm";
import ImportModal from "./import/ImportModal";
import TransactionSplitter from "./TransactionSplitter";

import { useTransactionFilters } from "./hooks/useTransactionFilters";
import { useTransactionForm } from "./hooks/useTransactionForm";
import { useTransactionImport } from "./hooks/useTransactionImport";
import { suggestEnvelope } from "./utils/envelopeMatching";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import { useBudgetStore } from "../../stores/budgetStore";

const TransactionLedger = ({ currentUser = { userName: "User", userColor: "#a855f7" } }) => {
  // Get live data from budget store instead of props
  const budget = useBudgetStore();
  const {
    allTransactions: transactions = [],
    envelopes = [],
    addTransaction,
    updateTransaction,
    deleteTransaction,
    setAllTransactions,
  } = budget;

  // Handle bulk import by updating both store arrays
  const handleBulkImport = (newTransactions) => {
    console.log("🔄 Bulk import called with transactions:", newTransactions.length);
    const updatedAllTransactions = [...transactions, ...newTransactions];
    setAllTransactions(updatedAllTransactions);
    console.log("💾 Bulk import complete. Total transactions:", updatedAllTransactions.length);
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
      console.error("Error splitting transaction:", error);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center text-gray-900">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-emerald-500 p-3 rounded-2xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            Transaction Ledger
          </h2>
          <p className="text-gray-600 mt-1">
            {transactions.length} transactions • Net: ${netCashFlow.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-row gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import File
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <TransactionSummary transactions={transactions} />

      {/* Filters */}
      <TransactionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        envelopeFilter={envelopeFilter}
        setEnvelopeFilter={setEnvelopeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        envelopes={envelopes}
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
          className="btn btn-secondary"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="btn btn-secondary"
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
