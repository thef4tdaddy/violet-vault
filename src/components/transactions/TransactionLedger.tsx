import React from "react";

import TransactionSummaryCards from "./TransactionSummaryCards";
import StandardFilters, { type FilterConfig } from "../ui/StandardFilters";
import TransactionTable from "./TransactionTable";
import TransactionForm from "./TransactionForm";
import ImportModal from "./import/ImportModal";
import TransactionSplitter from "./TransactionSplitter";

import TransactionLedgerHeader from "./ledger/TransactionLedgerHeader";
import TransactionPagination from "./ledger/TransactionPagination";
import TransactionLedgerLoading from "./ledger/TransactionLedgerLoading";

import { useTransactionLedger } from "../../hooks/transactions/useTransactionLedger";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import {
  calculateTransactionTotals,
  getTransactionFilterConfigs,
} from "../../utils/transactions/ledgerHelpers";
import type { User } from "../../types/finance";

interface TransactionLedgerProps {
  currentUser?: User;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  const {
    // Data
    transactions,
    envelopes,
    paginatedTransactions,

    // Loading states
    isLoading,

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
  } = useTransactionLedger(currentUser);

  const { netCashFlow } = calculateTransactionTotals(transactions);
  const filterConfigs = getTransactionFilterConfigs(envelopes) as FilterConfig[];

  // Show loading state while data is fetching
  if (isLoading) {
    return <TransactionLedgerLoading />;
  }

  return (
    <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
      {/* Header */}
      <TransactionLedgerHeader
        transactionCount={transactions.length}
        netCashFlow={netCashFlow}
        onAddTransaction={() => setShowAddModal(true)}
        onImportTransactions={() => setShowImportModal(true)}
      />

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
        onFilterChange={handleFilterChange}
        filterConfigs={filterConfigs}
        searchPlaceholder="Search transactions..."
      />

      {/* Transactions Table */}
      <TransactionTable
        transactions={paginatedTransactions}
        envelopes={envelopes}
        onEdit={startEdit}
        onDelete={(id) => deleteTransaction(id as string | number)}
        onSplit={(transaction) => setSplittingTransaction(transaction)}
      />

      {/* Pagination */}
      <TransactionPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePagination}
      />

      {/* Transaction Form Modal */}
      <TransactionForm
        isOpen={showAddModal}
        onClose={handleCloseModal}
        editingTransaction={editingTransaction}
        transactionForm={transactionForm}
        setTransactionForm={setTransactionForm}
        envelopes={envelopes}
        categories={[...TRANSACTION_CATEGORIES]}
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
        setImportData={() => {}} // TODO: Import hook should provide this
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
        availableCategories={[...TRANSACTION_CATEGORIES]}
        onSave={handleSplitTransaction}
      />
    </div>
  );
};

export default TransactionLedger;
