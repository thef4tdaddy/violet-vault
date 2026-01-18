import React from "react";

import TransactionSummaryCards from "./TransactionSummaryCards";
import StandardFilters, { type FilterConfig } from "../ui/StandardFilters";
import TransactionTable from "./TransactionTable";
import TransactionForm from "./TransactionForm";
import ImportModal from "./import/ImportModal";
import TransactionSplitter from "./TransactionSplitter";
import { Button } from "@/components/ui";
import { PageHeader } from "@/components/primitives/headers";

import TransactionPagination from "./ledger/TransactionPagination";
import TransactionLedgerLoading from "./ledger/TransactionLedgerLoading";

import { useTransactionLedger } from "../../hooks/budgeting/transactions/useTransactionLedger";
import { useLayoutData } from "@/hooks/platform/ux/layout/useLayoutData";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import {
  calculateTransactionTotals,
  getTransactionFilterConfigs,
  formatLedgerSummary,
} from "@/utils/domain/transactions/ledgerHelpers";
import {
  normalizeTransactions,
  normalizeEnvelopes,
} from "@/utils/domain/transactions/normalizationHelpers";
import type { User, Transaction, Envelope } from "../../types/finance";
import { useSmartSuggestions } from "@/hooks/platform/analytics/useSmartSuggestions";
import type { TransactionForStats } from "@/utils/features/analytics/categoryHelpers";
import { getIcon } from "@/utils";

// Types used in interface definitions

type SupplementalAccount = Array<{ id: string | number; name: string; type?: string }>;

type FilterState = Record<string, string | boolean>;

interface TransactionLedgerViewProps {
  transactions: Transaction[];
  netCashFlow: number;
  onAddTransaction: () => void;
  onImportTransactions: () => void;
  filters: FilterState;
  filterConfigs: FilterConfig[];
  defaultFilters: FilterState;
  searchTerm: string;
  onFilterChange: (key: string, value: string | boolean) => void;
  onSearchChange: (value: string) => void;
  paginatedTransactions: Transaction[];
  envelopes: Envelope[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string | number) => void;
  onSplitTransaction: (transaction: Transaction | null) => void;
  splittingTransaction: Transaction | null;
  handleSplitTransaction: (
    splitTransactions: Transaction[],
    originalTransaction: Transaction
  ) => Promise<void>;
  currentPage: number;
  totalPages: number;
  onPageChange: (direction: "prev" | "next") => void;
  showAddModal: boolean;
  onCloseModal: () => void;
  editingTransaction: Transaction | null;
  transactionForm: unknown;
  setTransactionForm: (form: unknown) => void;
  supplementalAccounts: SupplementalAccount;
  onSubmitTransaction: () => void;
  onSuggestEnvelope: (description: string) => { id: string; name: string } | undefined;
  smartCategorySuggestion: ReturnType<typeof useSmartSuggestions>["suggestTransactionCategory"];
  onPayBill: (billPayment: {
    billId: string | number;
    amount: number;
    paidDate: string;
    transactionId: string | number;
    notes: string;
  }) => void;
  showImportModal: boolean;
  onCloseImportModal: () => void;
  importStep: number;
  setImportStep: (step: number) => void;
  importData: unknown;
  setImportData: (data: unknown[]) => void;
  fieldMapping: Record<string, string | undefined>;
  setFieldMapping: (mapping: Record<string, string | undefined>) => void;
  importProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  onImport: () => void;
  onFileUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    options: { clearExisting: boolean }
  ) => void;
}

const TransactionLedgerContent: React.FC<TransactionLedgerViewProps> = ({
  transactions,
  netCashFlow,
  onAddTransaction,
  onImportTransactions,
  filters,
  filterConfigs,
  defaultFilters,
  searchTerm,
  onFilterChange,
  onSearchChange,
  paginatedTransactions,
  envelopes,
  onEditTransaction,
  onDeleteTransaction,
  onSplitTransaction,
  splittingTransaction,
  handleSplitTransaction,
  currentPage,
  totalPages,
  onPageChange,
  showAddModal,
  onCloseModal,
  editingTransaction,
  transactionForm,
  setTransactionForm,
  supplementalAccounts,
  onSubmitTransaction,
  onSuggestEnvelope,
  smartCategorySuggestion,
  onPayBill,
  showImportModal,
  onCloseImportModal,
  importStep,
  setImportStep,
  importData,
  fieldMapping,
  setFieldMapping,
  importProgress,
  onImport,
  onFileUpload,
}) => (
  <div
    data-testid="ledger-header"
    className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6"
  >
    {/* Page Header with Actions */}
    <PageHeader
      title="Transaction Ledger"
      subtitle={formatLedgerSummary(transactions.length, netCashFlow)}
      icon="BookOpen"
      actions={
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:justify-end">
          <Button
            onClick={onImportTransactions}
            className="flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg border-2 border-black shadow-lg transition-colors"
          >
            {React.createElement(getIcon("Upload"), {
              className: "h-4 w-4 mr-2",
            })}
            Import File
          </Button>
          <Button
            onClick={onAddTransaction}
            className="btn btn-primary border-2 border-black flex items-center justify-center shadow-lg"
            data-tour="add-transaction"
          >
            {React.createElement(getIcon("Plus"), { className: "h-4 w-4 mr-2" })}
            Add Transaction
          </Button>
        </div>
      }
    />

    <TransactionSummaryCards transactions={transactions.map((txn) => ({ amount: txn.amount }))} />

    <StandardFilters
      filters={filters}
      filterConfigs={filterConfigs}
      defaultFilters={defaultFilters}
      searchPlaceholder="Search transactions..."
      searchValue={searchTerm}
      onFilterChange={onFilterChange}
      onSearchChange={onSearchChange}
      mode="collapsible"
    />

    <TransactionTable
      transactions={paginatedTransactions}
      envelopes={envelopes}
      onEdit={onEditTransaction}
      onDelete={onDeleteTransaction}
      onSplit={onSplitTransaction}
    />

    <TransactionPagination
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
    />

    <TransactionForm
      isOpen={showAddModal}
      onClose={onCloseModal}
      editingTransaction={editingTransaction}
      transactionForm={transactionForm as never}
      setTransactionForm={setTransactionForm}
      envelopes={envelopes}
      supplementalAccounts={supplementalAccounts}
      categories={[...TRANSACTION_CATEGORIES]}
      onSubmit={onSubmitTransaction}
      suggestEnvelope={onSuggestEnvelope as (description: string) => { id: string; name: string }}
      onPayBill={onPayBill}
      smartCategorySuggestion={smartCategorySuggestion}
    />

    <ImportModal
      isOpen={showImportModal}
      onClose={onCloseImportModal}
      importStep={importStep}
      setImportStep={setImportStep}
      importData={importData as { data: Record<string, unknown>[] }}
      setImportData={() => {}}
      fieldMapping={fieldMapping}
      setFieldMapping={setFieldMapping}
      importProgress={importProgress}
      onImport={onImport}
      onFileUpload={onFileUpload}
    />

    <TransactionSplitter
      isOpen={!!splittingTransaction}
      onClose={() => onSplitTransaction(null)}
      transaction={splittingTransaction || null}
      onSave={handleSplitTransaction}
    />
  </div>
);

interface TransactionLedgerProps {
  currentUser?: User;
}

const TransactionLedger: React.FC<TransactionLedgerProps> = ({
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  const { budget, bills: billsQuery, transactions: layoutTransactions = [] } = useLayoutData();
  const ledger = useTransactionLedger(currentUser);

  const {
    transactions: ledgerTransactions,
    envelopes: ledgerEnvelopes,
    paginatedTransactions: ledgerPaginatedTransactions,
    isLoading,
    showAddModal,
    setShowAddModal,
    showImportModal,
    setShowImportModal,
    editingTransaction,
    splittingTransaction,
    setSplittingTransaction,
    transactionForm,
    setTransactionForm,
    searchTerm,
    dateFilter,
    typeFilter,
    envelopeFilter,
    sortBy,
    sortOrder,
    currentPage,
    totalPages,
    importData,
    importStep,
    setImportStep,
    fieldMapping,
    setFieldMapping,
    importProgress,
    handleSubmitTransaction,
    startEdit,
    handleCloseModal,
    handleCloseImportModal,
    handleSuggestEnvelope,
    handlePayBill,
    handlePagination,
    handleFileUpload,
    handleImport,
    deleteTransaction,
    handleSplitTransaction,
    setShowAddModal: _overrideSetShowAddModal,
    setShowImportModal: _overrideSetShowImportModal,
    handleFilterChange,
  } = ledger;

  // Normalize data using utility functions
  const transactionsList = normalizeTransactions(ledgerTransactions as unknown[]);
  const paginatedList = normalizeTransactions(ledgerPaginatedTransactions as unknown[]);
  const envelopesList = normalizeEnvelopes(ledgerEnvelopes as unknown[]);
  const layoutTransactionsNormalized = normalizeTransactions(layoutTransactions as unknown[]);

  const transactionsForSuggestionsSource =
    layoutTransactionsNormalized.length > 0 ? layoutTransactionsNormalized : transactionsList;

  const transactionsForSuggestions: TransactionForStats[] = transactionsForSuggestionsSource.map(
    (item) => ({
      category: item.category,
      amount: item.amount,
      date: item.date,
    })
  );

  const billsForSuggestions =
    billsQuery && Array.isArray(billsQuery.bills)
      ? (billsQuery.bills as unknown[]).map((bill) => ({
          ...(bill as Record<string, unknown>),
        }))
      : [];

  const supplementalAccounts: SupplementalAccount = Array.isArray(budget?.supplementalAccounts)
    ? (budget.supplementalAccounts as SupplementalAccount)
    : [];

  const { netCashFlow } = calculateTransactionTotals(transactionsList);

  const filterConfigs = getTransactionFilterConfigs(envelopesList);

  const defaultTransactionFilters = filterConfigs.reduce<FilterState>((acc, config) => {
    if (typeof config.defaultValue !== "undefined") {
      acc[config.key] = config.defaultValue;
    }
    return acc;
  }, {});
  defaultTransactionFilters.search = "";

  const filters: FilterState = {
    dateFilter,
    typeFilter,
    envelopeFilter: String(envelopeFilter ?? "all"),
    sortBy,
    sortOrder,
  };

  const { suggestTransactionCategory } = useSmartSuggestions({
    transactions: transactionsForSuggestions,
    bills: billsForSuggestions,
  });

  const handleDeleteTransactionById = (id: string | number) => {
    deleteTransaction(id.toString());
  };

  const handleSplitForComponent = async (
    splitTransactions: Transaction[],
    originalTransaction: Transaction
  ) => {
    await handleSplitTransaction(splitTransactions, originalTransaction);
  };

  const handlePayBillForComponent = (billPayment: {
    billId: string | number;
    amount: number;
    paidDate: string;
    transactionId: string | number;
    notes: string;
  }) => {
    handlePayBill(billPayment);
  };

  const suggestEnvelopeForComponent = (description: string) => {
    const result = handleSuggestEnvelope(description);
    if (!result) {
      return undefined;
    }

    return {
      id: String(result.id),
      name: result.name,
    };
  };

  if (isLoading) {
    return <TransactionLedgerLoading />;
  }

  return (
    <TransactionLedgerContent
      transactions={transactionsList}
      netCashFlow={netCashFlow}
      onAddTransaction={() => setShowAddModal(true)}
      onImportTransactions={() => setShowImportModal(true)}
      filters={filters}
      filterConfigs={filterConfigs}
      defaultFilters={defaultTransactionFilters}
      searchTerm={searchTerm}
      onFilterChange={(key, value) => handleFilterChange(key, String(value))}
      onSearchChange={(value) => handleFilterChange("search", value)}
      paginatedTransactions={paginatedList}
      envelopes={envelopesList}
      onEditTransaction={startEdit}
      onDeleteTransaction={handleDeleteTransactionById}
      onSplitTransaction={setSplittingTransaction}
      splittingTransaction={splittingTransaction as Transaction | null}
      handleSplitTransaction={handleSplitForComponent}
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={(direction) => handlePagination(direction)}
      showAddModal={showAddModal}
      onCloseModal={handleCloseModal}
      editingTransaction={editingTransaction as Transaction | null}
      transactionForm={transactionForm}
      setTransactionForm={setTransactionForm as (form: unknown) => void}
      supplementalAccounts={supplementalAccounts}
      onSubmitTransaction={handleSubmitTransaction}
      onSuggestEnvelope={suggestEnvelopeForComponent}
      smartCategorySuggestion={suggestTransactionCategory}
      onPayBill={handlePayBillForComponent}
      showImportModal={showImportModal}
      onCloseImportModal={handleCloseImportModal}
      importStep={importStep}
      setImportStep={setImportStep}
      importData={importData as { data: Record<string, unknown>[] }}
      setImportData={() => {}}
      fieldMapping={fieldMapping}
      setFieldMapping={setFieldMapping}
      importProgress={
        importProgress as unknown as { current: number; total: number; percentage: number }
      }
      onImport={handleImport}
      onFileUpload={handleFileUpload}
    />
  );
};

export default TransactionLedger;
