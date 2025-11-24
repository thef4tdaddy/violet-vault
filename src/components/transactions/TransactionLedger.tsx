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
import { useLayoutData } from "../../hooks/layout/useLayoutData";
import { TRANSACTION_CATEGORIES } from "../../constants/categories";
import {
  calculateTransactionTotals,
  getTransactionFilterConfigs,
} from "../../utils/transactions/ledgerHelpers";
import type { User, Transaction, Envelope } from "../../types/finance";
import { useSmartSuggestions } from "@/hooks/analytics/useSmartSuggestions";
import type { TransactionForStats } from "@/utils/analytics/categoryHelpers";

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
  importData: unknown[];
  setImportData: (data: unknown[]) => void;
  fieldMapping: Record<string, string>;
  setFieldMapping: (mapping: Record<string, string>) => void;
  importProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  onImport: () => void;
  onFileUpload: (data: unknown[]) => void;
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
  <div className="rounded-lg p-6 border-2 border-black bg-purple-100/40 backdrop-blur-sm space-y-6">
    <TransactionLedgerHeader
      transactionCount={transactions.length}
      netCashFlow={netCashFlow}
      onAddTransaction={onAddTransaction}
      onImportTransactions={onImportTransactions}
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
      importData={importData}
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

  const normalizeTransaction = (txn: unknown): Transaction | null => {
    if (!txn || typeof txn !== "object") {
      return null;
    }

    const record = txn as {
      id?: string | number;
      date?: string | Date;
      description?: unknown;
      amount?: unknown;
      category?: unknown;
      envelopeId?: unknown;
      notes?: unknown;
      type?: unknown;
      lastModified?: unknown;
      createdAt?: unknown;
    };

    const rawDate = record.date;
    const date =
      typeof rawDate === "string"
        ? rawDate
        : rawDate instanceof Date
          ? rawDate.toISOString().split("T")[0]
          : undefined;

    if (!date) {
      return null;
    }

    if (record.id === undefined || record.id === null) {
      return null;
    }

    const amountRaw = Number(record.amount ?? 0);
    const description = typeof record.description === "string" ? record.description : "";
    const category =
      typeof record.category === "string" && record.category.trim().length > 0
        ? record.category
        : "uncategorized";
    const envelopeId =
      typeof record.envelopeId === "string" || typeof record.envelopeId === "number"
        ? String(record.envelopeId)
        : "unassigned";
    const notes = typeof record.notes === "string" ? record.notes : undefined;
    let typeCandidate: Transaction["type"];
    if (record.type === "income" || record.type === "expense" || record.type === "transfer") {
      typeCandidate = record.type;
    } else {
      typeCandidate = amountRaw >= 0 ? "income" : "expense";
    }

    const signedAmount =
      typeCandidate === "expense"
        ? -Math.abs(amountRaw)
        : typeCandidate === "income"
          ? Math.abs(amountRaw)
          : amountRaw;

    return {
      id: record.id as string | number,
      date,
      description,
      amount: signedAmount,
      category,
      envelopeId,
      notes,
      type: typeCandidate,
    } satisfies Transaction;
  };

  const normalizeEnvelope = (env: unknown): Envelope | null => {
    if (!env || typeof env !== "object") {
      return null;
    }

    const record = env as {
      id?: string | number;
      name?: unknown;
      category?: unknown;
      currentBalance?: unknown;
      targetAmount?: unknown;
      color?: unknown;
      icon?: unknown;
      description?: unknown;
      archived?: unknown;
      lastModified?: unknown;
      createdAt?: unknown;
    };

    if (record.id === undefined || typeof record.name !== "string") {
      return null;
    }

    return {
      id: String(record.id),
      name: record.name,
      category:
        typeof record.category === "string" && record.category.trim().length > 0
          ? record.category
          : "uncategorized",
      currentBalance: Number(record.currentBalance ?? 0),
      targetAmount: Number(record.targetAmount ?? 0),
      color: typeof record.color === "string" ? record.color : undefined,
      icon: typeof record.icon === "string" ? record.icon : undefined,
      description: typeof record.description === "string" ? record.description : undefined,
      isArchived: Boolean(record.archived),
    };
  };

  const transactionsList = (ledgerTransactions as unknown[])
    .map(normalizeTransaction)
    .filter((txn): txn is Transaction => txn !== null);

  const paginatedList = (ledgerPaginatedTransactions as unknown[])
    .map(normalizeTransaction)
    .filter((txn): txn is Transaction => txn !== null);

  const envelopesList = (ledgerEnvelopes as unknown[])
    .map(normalizeEnvelope)
    .filter((env): env is Envelope => env !== null);

  const layoutTransactionsNormalized = (layoutTransactions as unknown[])
    .map(normalizeTransaction)
    .filter((txn): txn is Transaction => txn !== null);

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
      setTransactionForm={setTransactionForm}
      supplementalAccounts={supplementalAccounts}
      onSubmitTransaction={handleSubmitTransaction}
      onSuggestEnvelope={suggestEnvelopeForComponent}
      smartCategorySuggestion={suggestTransactionCategory}
      onPayBill={handlePayBillForComponent}
      showImportModal={showImportModal}
      onCloseImportModal={handleCloseImportModal}
      importStep={importStep}
      setImportStep={setImportStep}
      importData={importData as unknown as unknown[]}
      setImportData={() => {}}
      fieldMapping={fieldMapping as Record<string, string>}
      setFieldMapping={setFieldMapping as (mapping: Record<string, string>) => void}
      importProgress={
        importProgress as unknown as { current: number; total: number; percentage: number }
      }
      onImport={handleImport}
      onFileUpload={(data: unknown[]) => {
        // Convert the data array back to a File object for handleFileUpload
        if (data && data.length > 0 && typeof data[0] === "object" && data[0] instanceof File) {
          return handleFileUpload(data[0] as File);
        }
        // logger.error('Invalid file data passed to onFileUpload'); // Assuming logger is not defined, so commenting out
      }}
    />
  );
};

export default TransactionLedger;
