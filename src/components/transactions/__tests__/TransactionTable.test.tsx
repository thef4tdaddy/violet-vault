import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import TransactionTable from "../TransactionTable";
import userEvent from "@testing-library/user-event";
import useTransactionTableOriginal from "@/hooks/transactions/useTransactionTable";

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
vi.mock("./components/TransactionRow", () => ({
  default: ({ transaction, onEdit, onDelete, onSplit, onViewHistory }) => (
    <tr data-testid={`transaction-row-${transaction.id}`}>
      <td>{transaction.date}</td>
      <td>{transaction.description}</td>
      <td>{transaction.category}</td>
      <td>${transaction.amount}</td>
      <td>
        <button onClick={() => onEdit(transaction)}>Edit</button>
        <button onClick={() => onDelete(transaction)}>Delete</button>
        <button onClick={() => onSplit(transaction)}>Split</button>
        <button onClick={() => onViewHistory(transaction)}>History</button>
      </td>
    </tr>
  ),
}));

vi.mock("./components/DeleteConfirmation", () => ({
  default: ({ isOpen, onConfirm, onCancel, transaction }) =>
    isOpen ? (
      <div data-testid="delete-confirmation">
        <span>Delete {transaction?.description}?</span>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock("../history/ObjectHistoryViewer", () => ({
  default: ({ isOpen, onClose, objectType }) =>
    isOpen ? (
      <div data-testid="history-viewer">
        <span>History for {objectType}</span>
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

vi.mock("../../utils/transactions/tableHelpers", () => ({
  COLUMN_WIDTHS: {
    date: "w-32",
    description: "w-64",
    category: "w-40",
    envelope: "w-40",
    amount: "w-32",
    actions: "w-48",
  },
}));

const useTransactionTable = useTransactionTableOriginal as unknown as Mock;

describe("TransactionTable", () => {
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnSplit = vi.fn();

  const defaultProps = {
    transactions: [],
    envelopes: [],
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onSplit: mockOnSplit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<TransactionTable {...defaultProps} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should render table headers", () => {
      render(<TransactionTable {...defaultProps} />);
      
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

      render(<TransactionTable {...defaultProps} transactions={transactions} />);

      expect(screen.getByTestId("transaction-row-1")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-row-2")).toBeInTheDocument();
    });

    it("should handle empty transactions array", () => {
      render(<TransactionTable {...defaultProps} transactions={[]} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should handle undefined transactions", () => {
      render(<TransactionTable {...defaultProps} transactions={undefined} />);
      expect(screen.getByRole("table")).toBeInTheDocument();
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

      render(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const editButton = screen.getByText("Edit");
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

      render(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const deleteButton = screen.getByText("Delete");
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

      render(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const splitButton = screen.getByText("Split");
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

      render(<TransactionTable {...defaultProps} transactions={[transaction]} />);

      const historyButton = screen.getByText("History");
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

      useTransactionTable.mockReturnValue({
        parentRef: { current: null },
        rowVirtualizer: {
          getVirtualItems: () => [],
          getTotalSize: () => 0,
        },
        historyTransaction: null,
        deletingTransaction: transaction,
        handleDeleteClick: vi.fn(),
        cancelDelete: vi.fn(),
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      render(<TransactionTable {...defaultProps} />);

      expect(screen.getByTestId("delete-confirmation")).toBeInTheDocument();
      expect(
        screen.getByText("Delete Test Transaction?")
      ).toBeInTheDocument();
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
          getVirtualItems: () => [],
          getTotalSize: () => 0,
        },
        historyTransaction: null,
        deletingTransaction: transaction,
        handleDeleteClick: vi.fn(),
        cancelDelete: mockCancelDelete,
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      render(<TransactionTable {...defaultProps} />);

      const confirmButton = screen.getByText("Confirm");
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
          getVirtualItems: () => [],
          getTotalSize: () => 0,
        },
        historyTransaction: null,
        deletingTransaction: transaction,
        handleDeleteClick: vi.fn(),
        cancelDelete: mockCancelDelete,
        handleHistoryClick: vi.fn(),
        closeHistory: vi.fn(),
      });

      render(<TransactionTable {...defaultProps} />);

      const cancelButton = screen.getByText("Cancel");
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

      render(<TransactionTable {...defaultProps} />);

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

      render(<TransactionTable {...defaultProps} />);

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

      const transactions = [
        { id: "1", description: "Test", amount: 50 },
      ];

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
