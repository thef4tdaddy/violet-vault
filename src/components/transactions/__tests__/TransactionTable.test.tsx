import { render, screen, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import TransactionTable from "../TransactionTable";
import userEvent from "@testing-library/user-event";
import useTransactionTableOriginal from "@/hooks/transactions/useTransactionTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the custom hook
vi.mock("@/hooks/transactions/useTransactionTable", () => ({
  default: vi.fn(() => ({
    parentRef: { current: null },
    rowVirtualizer: {
      getVirtualItems: () => [],
      getTotalSize: () => 0,
    },
    historyTransaction: null,
    deletingTransaction: null,
    handleDeleteClick: vi.fn(),
    cancelDelete: vi.fn(),
    handleHistoryClick: vi.fn(),
    closeHistory: vi.fn(),
  })),
}));

// Mock child components
vi.mock("@/components/transactions/components/TransactionRow", () => ({
  default: ({ transaction, onEdit, onDeleteClick, onSplit, onHistoryClick }: any) => (
    <div data-testid={`transaction-row-${transaction.id}`} className="transaction-row">
      <div>{transaction.date}</div>
      <div>{transaction.description}</div>
      <div>{transaction.category}</div>
      <div>${transaction.amount}</div>
      <div>
        <button onClick={() => onEdit(transaction)}>Edit</button>
        <button onClick={() => onDeleteClick(transaction)}>Delete</button>
        <button onClick={() => onSplit(transaction)}>Split</button>
        <button onClick={() => onHistoryClick(transaction)}>History</button>
      </div>
    </div>
  ),
}));

vi.mock("@/components/transactions/components/DeleteConfirmation", () => ({
  default: ({ isOpen, onConfirm, onCancel, transaction }: any) => (
    // Note: The actual component might not use 'isOpen' prop if it's conditionally rendered by parent
    // checking usage in Table: checks isDeleting ? <DeleteConfirmation ... /> : ...
    // So distinct existence is enough.
    <div data-testid="delete-confirmation">
      <span>Delete {transaction?.description}?</span>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
}));

vi.mock("@/components/history/ObjectHistoryViewer", () => ({
  default: ({ onClose, objectType }: any) => (
    <div data-testid="history-viewer">
      <span>History for {objectType}</span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock("@/utils/transactions/tableHelpers", () => ({
  MIN_TABLE_WIDTH: "80rem",
  findEnvelopeForTransaction: vi.fn(() => ({ id: "1", name: "Test Envelope", color: "#000000" })),
  formatTransactionAmount: vi.fn((amount) => ({
    formatted: `$${amount}`,
    className: "text-gray-900",
  })),
  formatTransactionDate: vi.fn(() => "Jan 15, 2024"),
  getEnvelopeDisplay: vi.fn(() => ({
    name: "Test Envelope",
    color: "#000000",
    className: "bg-gray-100 text-gray-800",
  })),
  COLUMN_WIDTHS: {
    date: "8rem",
    description: "16rem",
    category: "9rem",
    envelope: "12rem",
    amount: "8rem",
    actions: "9rem",
  },
  COLUMN_STYLES: {
    date: { width: "8rem", minWidth: "8rem", maxWidth: "8rem" },
    description: { width: "16rem", minWidth: "16rem", maxWidth: "16rem" },
    category: { width: "9rem", minWidth: "9rem", maxWidth: "9rem" },
    envelope: { width: "12rem", minWidth: "12rem", maxWidth: "12rem" },
    amount: { width: "8rem", minWidth: "8rem", maxWidth: "8rem" },
    actions: { width: "9rem", minWidth: "9rem", maxWidth: "9rem" },
  },
}));

const useTransactionTable = useTransactionTableOriginal as unknown as Mock;

describe("TransactionTable", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSplit = vi.fn();
  let queryClient: QueryClient;

  const defaultProps = {
    transactions: [],
    envelopes: [],
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onSplit: mockOnSplit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderWithQuery = (component: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{component}</QueryClientProvider>);
  };

  describe("Rendering", () => {
    it("should render without crashing", () => {
      renderWithQuery(<TransactionTable {...defaultProps} />);
      expect(screen.getAllByText("No transactions found")[0]).toBeInTheDocument();
    });

    it("should render table headers", () => {
      renderWithQuery(<TransactionTable {...defaultProps} />);

      expect(screen.getByText("Date")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Category")).toBeInTheDocument();
      expect(screen.getByText("Envelope")).toBeInTheDocument();
      expect(screen.getByText("Amount")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });

    it("should render transactions when they exist", () => {
      const mockVirtualItems = [
        { index: 0, start: 0, size: 50 },
        { index: 1, start: 50, size: 50 },
      ];

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => mockVirtualItems,
          getTotalSize: () => 100,
        },
        historyTransaction: null,
        deletingTransaction: null,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      const transactions = [
        {
          id: "1",
          date: "2024-01-15",
          description: "Grocery Store",
          category: "Groceries",
          amount: 50.0,
        },
        {
          id: "2",
          date: "2024-01-16",
          description: "Gas Station",
          category: "Transportation",
          amount: 40.0,
        },
      ];

      renderWithQuery(<TransactionTable {...defaultProps} transactions={transactions} />);

      expect(screen.getByTestId("transaction-row-1")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-row-2")).toBeInTheDocument();
    });

    it("should handle empty transactions array", () => {
      renderWithQuery(<TransactionTable {...defaultProps} transactions={[]} />);
      expect(screen.getAllByText("No transactions found")[0]).toBeInTheDocument();
    });

    it("should handle undefined transactions", () => {
      renderWithQuery(<TransactionTable {...defaultProps} transactions={undefined} />);
      expect(screen.getAllByText("No transactions found")[0]).toBeInTheDocument();
    });
  });

  describe("Transaction Actions", () => {
    it("should call onEdit when edit button is clicked", async () => {
      const mockVirtualItems = [{ index: 0, start: 0, size: 50 }];

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => mockVirtualItems,
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: null,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      const transaction = {
        id: "1",
        date: "2024-01-15",
        description: "Test",
        category: "Test",
        amount: 50,
      };

      renderWithQuery(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const row = screen.getByTestId(`transaction-row-${transaction.id}`);
      const editButton = within(row).getByText("Edit");
      await userEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(transaction);
    });

    it("should call handleDeleteClick when delete button is clicked", async () => {
      const mockHandleDeleteClick = vi.fn();
      const mockVirtualItems = [{ index: 0, start: 0, size: 50 }];

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => mockVirtualItems,
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: null,
        handleDeleteClick: mockHandleDeleteClick,
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      const transaction = {
        id: "1",
        date: "2024-01-15",
        description: "Test",
        category: "Test",
        amount: 50,
      };

      renderWithQuery(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const row = screen.getByTestId(`transaction-row-${transaction.id}`);
      const deleteButton = within(row).getByText("Delete");
      await userEvent.click(deleteButton);

      expect(mockHandleDeleteClick).toHaveBeenCalledWith(transaction);
    });

    it("should call onSplit when split button is clicked", async () => {
      const mockVirtualItems = [{ index: 0, start: 0, size: 50 }];

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => mockVirtualItems,
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: null,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      const transaction = {
        id: "1",
        date: "2024-01-15",
        description: "Test",
        category: "Test",
        amount: 50,
      };

      renderWithQuery(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const row = screen.getByTestId(`transaction-row-${transaction.id}`);
      const splitButton = within(row).getByText("Split");
      await userEvent.click(splitButton);

      expect(mockOnSplit).toHaveBeenCalledWith(transaction);
    });

    it("should call handleHistoryClick when history button is clicked", async () => {
      const mockHandleHistoryClick = vi.fn();
      const mockVirtualItems = [{ index: 0, start: 0, size: 50 }];

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => mockVirtualItems,
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: null,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: mockHandleHistoryClick,
        closeHistory: vi.fn(),
      });

      const transaction = {
        id: "1",
        date: "2024-01-15",
        description: "Test",
        category: "Test",
        amount: 50,
      };

      renderWithQuery(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const row = screen.getByTestId(`transaction-row-${transaction.id}`);
      const historyButton = within(row).getByText("History");
      await userEvent.click(historyButton);

      expect(mockHandleHistoryClick).toHaveBeenCalledWith(transaction);
    });
  });

  describe("Delete Confirmation", () => {
    it("should show delete confirmation when deletingTransaction is set", () => {
      const transaction = {
        id: "1",
        description: "Test Transaction",
        amount: 50,
      };

      const mockVirtualItems = [{ index: 0, start: 0, size: 50 }];

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => mockVirtualItems,
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: transaction,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      renderWithQuery(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      expect(screen.getByTestId("delete-confirmation")).toBeInTheDocument();
      expect(screen.getByText("Delete Test Transaction?")).toBeInTheDocument();
    });

    it("should call onDelete when delete is confirmed", async () => {
      const transaction = {
        id: "1",
        description: "Test Transaction",
        amount: 50,
      };

      const mockCancelDelete = vi.fn();

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => [{ index: 0, start: 0, size: 50 }],
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: transaction,
        handleDeleteClick: vi.fn(),
        cancelDelete: mockCancelDelete,
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      renderWithQuery(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const confirmation = screen.getByTestId("delete-confirmation");
      const confirmButton = within(confirmation).getByText("Confirm");
      await userEvent.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith("1");
      expect(mockCancelDelete).toHaveBeenCalled();
    });

    it("should call cancelDelete when delete is cancelled", async () => {
      const transaction = {
        id: "1",
        description: "Test Transaction",
        amount: 50,
      };

      const mockCancelDelete = vi.fn();

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => [{ index: 0, start: 0, size: 50 }],
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: transaction,
        handleDeleteClick: vi.fn(),
        cancelDelete: mockCancelDelete,
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      renderWithQuery(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const confirmation = screen.getByTestId("delete-confirmation");
      const cancelButton = within(confirmation).getByText("Cancel");
      await userEvent.click(cancelButton);

      expect(mockCancelDelete).toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });
  });

  describe("History Viewer", () => {
    it("should show history viewer when historyTransaction is set", () => {
      const transaction = {
        id: "1",
        description: "Test Transaction",
      };

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => [],
          getTotalSize: () => 0,
        },
        historyTransaction: transaction,
        deletingTransaction: null,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      renderWithQuery(<TransactionTable {...defaultProps} />);

      expect(screen.getByTestId("history-viewer")).toBeInTheDocument();
    });

    it("should call closeHistory when history viewer is closed", async () => {
      const transaction = {
        id: "1",
        description: "Test Transaction",
      };

      const mockCloseHistory = vi.fn();

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => [],
          getTotalSize: () => 0,
        },
        historyTransaction: transaction,
        deletingTransaction: null,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: mockCloseHistory,
      });

      renderWithQuery(<TransactionTable {...defaultProps} />);

      const closeButton = screen.getByText("Close");
      await userEvent.click(closeButton);

      expect(mockCloseHistory).toHaveBeenCalled();
    });
  });

  describe("Props Handling", () => {
    it("should pass envelopes to TransactionRow", () => {
      const mockVirtualItems = [{ index: 0, start: 0, size: 50 }];

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => mockVirtualItems,
          getTotalSize: () => 50,
        },
        historyTransaction: null,
        deletingTransaction: null,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      const transactions = [{ id: "1", description: "Test", amount: 50 }];

      const envelopes = [
        { id: "env1", name: "Groceries" },
        { id: "env2", name: "Gas" },
      ];

      render(
        <TransactionTable
          {...defaultProps}
          transactions={transactions as never[]}
          envelopes={envelopes as never[]}
        />
      );

      expect(screen.getByTestId("transaction-row-1")).toBeInTheDocument();
    });
  });
});
