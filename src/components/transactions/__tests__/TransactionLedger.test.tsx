import { render, screen, waitFor } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import TransactionLedger from "../TransactionLedger";
import userEvent from "@testing-library/user-event";
import { QueryClient } from "@tanstack/react-query";

// ============================================================================
// Standardized Mocking Strategy: Use @/ Aliases for EVERYTHING
// ============================================================================

// 1. Hook Mock Results (Defined once for reference stability)
const MOCK_LEDGER_DATA = {
  transactions: [
    { id: "1", description: "Grocery Store", amount: -50, date: "2025-01-01", envelopeId: "1" },
    { id: "2", description: "Gas Station", amount: -30, date: "2025-01-02", envelopeId: "2" },
  ],
  envelopes: [
    { id: "1", name: "Groceries" },
    { id: "2", name: "Gas" },
  ],
  paginatedTransactions: [
    { id: "1", description: "Grocery Store", amount: -50, date: "2025-01-01" },
    { id: "2", description: "Gas Station", amount: -30, date: "2025-01-02" },
  ],
  isLoading: false,
  showAddModal: false,
  setShowAddModal: vi.fn(),
  showImportModal: false,
  setShowImportModal: vi.fn(),
  editingTransaction: null,
  splittingTransaction: null,
  setSplittingTransaction: vi.fn(),
  transactionForm: {},
  setTransactionForm: vi.fn(),
  searchTerm: "",
  dateFilter: "all",
  typeFilter: "all",
  envelopeFilter: "all",
  sortBy: "date",
  sortOrder: "desc",
  currentPage: 1,
  totalPages: 1,
  importData: null,
  importStep: 1,
  setImportStep: vi.fn(),
  fieldMapping: {},
  setFieldMapping: vi.fn(),
  importProgress: 0,
  handleSubmitTransaction: vi.fn(),
  startEdit: vi.fn(),
  handleCloseModal: vi.fn(),
  handleCloseImportModal: vi.fn(),
  handleSuggestEnvelope: vi.fn(),
  handlePayBill: vi.fn(),
  handleSplitTransaction: vi.fn(),
  handleFilterChange: vi.fn(),
  handlePagination: vi.fn(),
  handleStartImport: vi.fn(),
  handleFileUpload: vi.fn(),
  handleConfirmImport: vi.fn(),
  deleteTransaction: vi.fn(),
  handleCompleteSplit: vi.fn(),
};

vi.mock("@/hooks/budgeting/transactions/useTransactionLedger", () => ({
  useTransactionLedger: vi.fn(() => MOCK_LEDGER_DATA),
}));

// 2. Component Mocks (Use @/ aliases)
vi.mock("../TransactionSummaryCards", () => ({
  default: ({ transactions }: any) => (
    <div data-testid="transaction-summary">Transactions: {transactions.length}</div>
  ),
}));

vi.mock("../TransactionTable", () => ({
  default: ({ transactions, onEdit, onDelete, onSplit, onPayBill }: any) => (
    <div data-testid="transaction-table">
      {transactions.map((t: any) => (
        <div key={t.id} data-testid={`transaction-${t.id}`}>
          <span>{t.description}</span>
          <button onClick={() => onEdit(t)}>Edit</button>
          <button onClick={() => onDelete(t.id)}>Delete</button>
          <button onClick={() => onSplit(t)}>Split</button>
          {t.billId && <button onClick={() => onPayBill(t.billId)}>Pay Bill</button>}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../TransactionForm", () => ({
  default: ({ isOpen, onClose, onSubmit }: any) =>
    isOpen ? (
      <div data-testid="transaction-form">
        <button onClick={onClose}>Close Form</button>
        <button onClick={() => onSubmit({})}>Submit</button>
      </div>
    ) : null,
}));

vi.mock("../import/ImportModal", () => ({
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="import-modal">
        <button onClick={onClose}>Close Import</button>
      </div>
    ) : null,
}));

vi.mock("../TransactionSplitter", () => ({
  default: ({ isOpen, transaction, onClose, onComplete }: any) =>
    isOpen && transaction ? (
      <div data-testid="transaction-splitter">
        <span>Splitting: {transaction.description}</span>
        <button onClick={onClose}>Close Splitter</button>
        <button onClick={() => onComplete([])}>Complete Split</button>
      </div>
    ) : null,
}));

vi.mock("../ledger/TransactionLedgerHeader", () => ({
  default: ({ onAddTransaction, onImport, onFilterChange }: any) => (
    <div data-testid="ledger-header">
      <button onClick={onAddTransaction}>Add Transaction</button>
      <button onClick={onImport}>Import</button>
      <input
        data-testid="search-input"
        placeholder="Search"
        onChange={(e) => onFilterChange("searchTerm", e.target.value)}
      />
    </div>
  ),
}));

vi.mock("../ledger/TransactionPagination", () => ({
  default: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <span>
        Page {currentPage} of {totalPages}
      </span>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  ),
}));

vi.mock("../ledger/TransactionLedgerLoading", () => ({
  default: () => <div data-testid="loading-spinner">Loading transactions...</div>,
}));

vi.mock("@/components/ui/StandardFilters", () => ({
  default: ({ filterConfigs, onFilterChange }: any) => (
    <div data-testid="filters">
      {(filterConfigs || []).map((config: any) => (
        <select
          key={config.key}
          data-testid={`filter-${config.key}`}
          onChange={(e) => onFilterChange(config.key, e.target.value)}
        >
          <option value="all">All</option>
          <option value="option1">Option 1</option>
        </select>
      ))}
    </div>
  ),
}));

vi.mock("@/utils/transactions/ledgerHelpers", () => ({
  calculateTransactionTotals: vi.fn(() => ({
    totalIncome: 3000,
    totalExpense: -500,
    netTotal: 2500,
  })),
  getTransactionFilterConfigs: vi.fn(() => [
    { key: "type", label: "Type" },
    { key: "envelope", label: "Envelope" },
    { key: "date", label: "Date" },
  ]),
}));

// ============================================================================
// Test Suite
// ============================================================================

import { useTransactionLedger } from "@/hooks/budgeting/transactions/useTransactionLedger";

describe("TransactionLedger (Surgical Reset)", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
    // Reset individual mocks inside the results
    Object.keys(MOCK_LEDGER_DATA).forEach((key) => {
      const val = (MOCK_LEDGER_DATA as any)[key];
      if (typeof val === "function" && val.mockClear) {
        val.mockClear();
      }
    });

    // Reset base return values
    vi.mocked(useTransactionLedger).mockReturnValue(MOCK_LEDGER_DATA as any);
  });

  const renderLedger = (props = {}) => {
    const defaultProps = {
      currentUser: { userName: "Test User", userColor: "#000" },
      ...props,
    };

    return render(<TransactionLedger {...(defaultProps as any)} />, { queryClient });
  };

  describe("Rendering", () => {
    it("should render transaction ledger header", () => {
      renderLedger();
      expect(screen.getByTestId("ledger-header")).toBeInTheDocument();
    });

    it("should render transaction summary cards", () => {
      renderLedger();
      expect(screen.getByTestId("transaction-summary")).toBeInTheDocument();
      expect(screen.getByText("Transactions: 2")).toBeInTheDocument();
    });

    it("should render transaction table", () => {
      renderLedger();
      expect(screen.getByTestId("transaction-table")).toBeInTheDocument();
    });

    it("should render all transactions in table", () => {
      renderLedger();
      expect(screen.getByTestId("transaction-1")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-2")).toBeInTheDocument();
      expect(screen.getByText("Grocery Store")).toBeInTheDocument();
      expect(screen.getByText("Gas Station")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      vi.mocked(useTransactionLedger).mockReturnValue({
        ...MOCK_LEDGER_DATA,
        isLoading: true,
        transactions: [],
        paginatedTransactions: [],
      } as any);

      renderLedger();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should not show table when loading", () => {
      vi.mocked(useTransactionLedger).mockReturnValue({
        ...MOCK_LEDGER_DATA,
        isLoading: true,
        transactions: [],
        paginatedTransactions: [],
      } as any);

      renderLedger();
      expect(screen.queryByTestId("transaction-table")).not.toBeInTheDocument();
    });
  });

  describe("Transaction Actions", () => {
    it("should handle add transaction", async () => {
      renderLedger();
      const addButton = screen.getByText("Add Transaction");
      await userEvent.click(addButton);
      expect(MOCK_LEDGER_DATA.setShowAddModal).toHaveBeenCalledWith(true);
    });

    it("should handle edit transaction", async () => {
      renderLedger();
      const editButton = screen.getAllByText("Edit")[0];
      await userEvent.click(editButton);
      expect(MOCK_LEDGER_DATA.startEdit).toHaveBeenCalled();
    });

    it("should handle delete transaction", async () => {
      renderLedger();
      const deleteButton = screen.getAllByText("Delete")[0];
      await userEvent.click(deleteButton);
      expect(MOCK_LEDGER_DATA.deleteTransaction).toHaveBeenCalled();
    });

    it("should handle split transaction", async () => {
      renderLedger();
      const splitButton = screen.getAllByText("Split")[0];
      await userEvent.click(splitButton);
      expect(MOCK_LEDGER_DATA.setSplittingTransaction).toHaveBeenCalled();
    });
  });

  describe("Modal Interactions", () => {
    it("should show transaction form modal when open", () => {
      vi.mocked(useTransactionLedger).mockReturnValue({
        ...MOCK_LEDGER_DATA,
        showAddModal: true,
      } as any);

      renderLedger();
      expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
    });

    it("should close transaction form modal", async () => {
      vi.mocked(useTransactionLedger).mockReturnValue({
        ...MOCK_LEDGER_DATA,
        showAddModal: true,
      } as any);

      renderLedger();
      const closeButton = screen.getByText("Close Form");
      await userEvent.click(closeButton);
      expect(MOCK_LEDGER_DATA.handleCloseModal).toHaveBeenCalled();
    });

    it("should submit transaction form", async () => {
      vi.mocked(useTransactionLedger).mockReturnValue({
        ...MOCK_LEDGER_DATA,
        showAddModal: true,
      } as any);

      renderLedger();
      const submitButton = screen.getByText("Submit");
      await userEvent.click(submitButton);
      expect(MOCK_LEDGER_DATA.handleSubmitTransaction).toHaveBeenCalled();
    });
  });

  describe("Pagination", () => {
    it("should handle page navigation", async () => {
      vi.mocked(useTransactionLedger).mockReturnValue({
        ...MOCK_LEDGER_DATA,
        currentPage: 1,
        totalPages: 3,
      } as any);

      renderLedger();
      const nextButton = screen.getByText("Next");
      await userEvent.click(nextButton);
      expect(MOCK_LEDGER_DATA.handlePagination).toHaveBeenCalled();
    });
  });
});
