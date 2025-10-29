import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import TransactionLedger from "../TransactionLedger";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the hook
vi.mock("@/hooks/transactions/useTransactionLedger", () => ({
  useTransactionLedger: vi.fn(() => ({
    // Data
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

    // Loading states
    isLoading: false,

    // Modal states
    showAddModal: false,
    setShowAddModal: vi.fn(),
    showImportModal: false,
    setShowImportModal: vi.fn(),
    editingTransaction: null,
    splittingTransaction: null,
    setSplittingTransaction: vi.fn(),

    // Form data
    transactionForm: {},
    setTransactionForm: vi.fn(),

    // Filter states
    searchTerm: "",
    dateFilter: "all",
    typeFilter: "all",
    envelopeFilter: "all",
    sortBy: "date",
    sortOrder: "desc",

    // Pagination
    currentPage: 1,
    totalPages: 1,

    // Import states
    importData: null,
    importStep: 1,
    setImportStep: vi.fn(),
    fieldMapping: {},
    setFieldMapping: vi.fn(),
    importProgress: 0,

    // Event handlers
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
    handleDelete: vi.fn(),
    handleCompleteSplit: vi.fn(),
  })),
}));

// Mock child components
vi.mock("../TransactionSummaryCards", () => ({
  default: ({ transactions }) => (
    <div data-testid="transaction-summary">Transactions: {transactions.length}</div>
  ),
}));

vi.mock("../TransactionTable", () => ({
  default: ({ transactions, onEdit, onDelete, onSplit, onPayBill }) => (
    <div data-testid="transaction-table">
      {transactions.map((t) => (
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
  default: ({ isOpen, onClose, onSubmit }) =>
    isOpen ? (
      <div data-testid="transaction-form">
        <button onClick={onClose}>Close Form</button>
        <button onClick={() => onSubmit({})}>Submit</button>
      </div>
    ) : null,
}));

vi.mock("../import/ImportModal", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="import-modal">
        <button onClick={onClose}>Close Import</button>
      </div>
    ) : null,
}));

vi.mock("../TransactionSplitter", () => ({
  default: ({ isOpen, transaction, onClose, onComplete }) =>
    isOpen && transaction ? (
      <div data-testid="transaction-splitter">
        <span>Splitting: {transaction.description}</span>
        <button onClick={onClose}>Close Splitter</button>
        <button onClick={() => onComplete([])}>Complete Split</button>
      </div>
    ) : null,
}));

vi.mock("../ledger/TransactionLedgerHeader", () => ({
  default: ({ onAddTransaction, onImport, onFilterChange }) => (
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
  default: ({ currentPage, totalPages, onPageChange }) => (
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
  default: ({ filters, onChange }) => (
    <div data-testid="filters">
      {filters.map((filter) => (
        <select
          key={filter.id}
          data-testid={`filter-${filter.id}`}
          onChange={(e) => onChange(filter.id, e.target.value)}
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
    { id: "type", label: "Type" },
    { id: "envelope", label: "Envelope" },
    { id: "date", label: "Date" },
  ]),
}));

describe("TransactionLedger", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderLedger = (props = {}) => {
    const defaultProps = {
      currentUser: { userName: "Test User", userColor: "#000" },
      ...props,
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <TransactionLedger {...defaultProps} />
      </QueryClientProvider>
    );
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

    it("should render filters", () => {
      renderLedger();

      expect(screen.getByTestId("filters")).toBeInTheDocument();
    });

    it("should render pagination", () => {
      renderLedger();

      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading spinner when loading", () => {
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        isLoading: true,
        transactions: [],
        paginatedTransactions: [],
      });

      renderLedger();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should not show table when loading", () => {
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        isLoading: true,
        transactions: [],
        paginatedTransactions: [],
      });

      renderLedger();

      expect(screen.queryByTestId("transaction-table")).not.toBeInTheDocument();
    });
  });

  describe("Transaction Actions", () => {
    it("should handle add transaction", async () => {
      const mockSetShowAddModal = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        setShowAddModal: mockSetShowAddModal,
      });

      renderLedger();

      const addButton = screen.getByText("Add Transaction");
      await userEvent.click(addButton);

      expect(mockSetShowAddModal).toHaveBeenCalledWith(true);
    });

    it("should handle edit transaction", async () => {
      const mockStartEdit = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        startEdit: mockStartEdit,
      });

      renderLedger();

      const editButton = screen.getAllByText("Edit")[0];
      await userEvent.click(editButton);

      expect(mockStartEdit).toHaveBeenCalled();
    });

    it("should handle delete transaction", async () => {
      const mockDelete = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        handleDelete: mockDelete,
      });

      renderLedger();

      const deleteButton = screen.getAllByText("Delete")[0];
      await userEvent.click(deleteButton);

      expect(mockDelete).toHaveBeenCalled();
    });

    it("should handle split transaction", async () => {
      const mockSplit = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        handleSplitTransaction: mockSplit,
      });

      renderLedger();

      const splitButton = screen.getAllByText("Split")[0];
      await userEvent.click(splitButton);

      expect(mockSplit).toHaveBeenCalled();
    });
  });

  describe("Modal Interactions", () => {
    it("should show transaction form modal when open", () => {
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        showAddModal: true,
      });

      renderLedger();

      expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
    });

    it("should close transaction form modal", async () => {
      const mockClose = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        showAddModal: true,
        handleCloseModal: mockClose,
      });

      renderLedger();

      const closeButton = screen.getByText("Close Form");
      await userEvent.click(closeButton);

      expect(mockClose).toHaveBeenCalled();
    });

    it("should submit transaction form", async () => {
      const mockSubmit = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        showAddModal: true,
        handleSubmitTransaction: mockSubmit,
      });

      renderLedger();

      const submitButton = screen.getByText("Submit");
      await userEvent.click(submitButton);

      expect(mockSubmit).toHaveBeenCalled();
    });

    it("should show import modal when open", () => {
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        showImportModal: true,
      });

      renderLedger();

      expect(screen.getByTestId("import-modal")).toBeInTheDocument();
    });

    it("should close import modal", async () => {
      const mockClose = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        showImportModal: true,
        handleCloseImportModal: mockClose,
      });

      renderLedger();

      const closeButton = screen.getByText("Close Import");
      await userEvent.click(closeButton);

      expect(mockClose).toHaveBeenCalled();
    });

    it("should show transaction splitter when splitting", () => {
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        splittingTransaction: { id: "1", description: "Test Split", amount: 100 },
      });

      renderLedger();

      expect(screen.getByTestId("transaction-splitter")).toBeInTheDocument();
      expect(screen.getByText("Splitting: Test Split")).toBeInTheDocument();
    });
  });

  describe("Filtering and Search", () => {
    it("should handle search input", async () => {
      const mockFilterChange = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        handleFilterChange: mockFilterChange,
      });

      renderLedger();

      const searchInput = screen.getByTestId("search-input");
      await userEvent.type(searchInput, "grocery");

      expect(mockFilterChange).toHaveBeenCalledWith("searchTerm", "grocery");
    });

    it("should apply filters", () => {
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        searchTerm: "grocery",
        typeFilter: "expense",
        envelopeFilter: "1",
      });

      renderLedger();

      expect(screen.getByTestId("filters")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("should display current page", () => {
      renderLedger();

      expect(screen.getByText("Page 1 of 1")).toBeInTheDocument();
    });

    it("should handle page navigation", async () => {
      const mockPagination = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        currentPage: 1,
        totalPages: 3,
        handlePagination: mockPagination,
      });

      renderLedger();

      const nextButton = screen.getByText("Next");
      await userEvent.click(nextButton);

      expect(mockPagination).toHaveBeenCalled();
    });

    it("should disable previous button on first page", () => {
      renderLedger();

      const prevButton = screen.getByText("Previous");
      expect(prevButton).toBeDisabled();
    });

    it("should disable next button on last page", () => {
      renderLedger();

      const nextButton = screen.getByText("Next");
      expect(nextButton).toBeDisabled();
    });
  });

  describe("Empty State", () => {
    it("should handle empty transactions array", () => {
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        transactions: [],
        paginatedTransactions: [],
      });

      renderLedger();

      expect(screen.getByTestId("transaction-summary")).toBeInTheDocument();
      expect(screen.getByText("Transactions: 0")).toBeInTheDocument();
    });
  });

  describe("Import Functionality", () => {
    it("should open import modal", async () => {
      const mockSetShowImportModal = vi.fn();
      const useTransactionLedger = require("@/hooks/transactions/useTransactionLedger")
        .useTransactionLedger as Mock;
      useTransactionLedger.mockReturnValue({
        ...useTransactionLedger(),
        setShowImportModal: mockSetShowImportModal,
      });

      renderLedger();

      const importButton = screen.getByText("Import");
      await userEvent.click(importButton);

      expect(mockSetShowImportModal).toHaveBeenCalledWith(true);
    });
  });

  describe("Transaction Summary", () => {
    it("should calculate transaction totals", () => {
      const calculateTransactionTotals = require("@/utils/transactions/ledgerHelpers")
        .calculateTransactionTotals as Mock;

      renderLedger();

      expect(calculateTransactionTotals).toHaveBeenCalled();
    });
  });
});
