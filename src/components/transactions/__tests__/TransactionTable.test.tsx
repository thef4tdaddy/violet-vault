import { render, screen, within } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TransactionTable from "../TransactionTable";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the primitives and child components
vi.mock("@/components/primitives/tables/DataTable", () => ({
  DataTable: ({ data, columns, emptyMessage, getRowId }: any) => (
    <div data-testid="data-table">
      <div className="table-header">
        {columns.map((col: any) => (
          <div key={col.key}>{col.header}</div>
        ))}
      </div>
      <div className="table-body">
        {data.length === 0 ? (
          <div>{emptyMessage}</div>
        ) : (
          data.map((row: any) => (
            <div key={getRowId(row)} data-testid={`row-${getRowId(row)}`}>
              {columns.map((col: any) => (
                <div key={col.key} data-testid={`cell-${getRowId(row)}-${col.key}`}>
                  {typeof col.accessor === "function" ? col.accessor(row) : row[col.key]}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  ),
}));

vi.mock("@/components/primitives/modals", () => ({
  ConfirmModal: ({ isOpen, onClose, onConfirm, title, message }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

vi.mock("@/components/history/ObjectHistoryViewer", () => ({
  default: ({ onClose, objectType, objectName }: any) => (
    <div data-testid="history-viewer">
      <span>
        History for {objectType}: {objectName}
      </span>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock MobileTransactionList to avoid duplicate IDs and text in JSDOM
vi.mock("../TransactionTable", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  // We want to mock only the MobileTransactionList component if it's exported,
  // but it's an internal component in TransactionTable.tsx.
  // Wait, I can't easily mock internal components.
  // But TransactionTable.tsx has:
  // const MobileTransactionList: React.FC<MobileTransactionListProps> = ...
  // It's not exported.
  return actual;
});

// Since I can't easily mock the internal component from outside without changing the file,
// I will instead use more specific selectors in the test
// OR I can mock the whole TransactionTable but that's what I'm testing.

// Mock icons utility
vi.mock("@/utils", () => ({
  getIcon: vi.fn(() => () => <span data-testid="icon" />),
}));

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

  const mockTransactions = [
    {
      id: "1",
      date: "2024-01-15",
      description: "Grocery Store",
      category: "Groceries",
      amount: -50.25,
      envelopeId: "env-1",
    },
    {
      id: "2",
      date: "2024-01-16",
      description: "Salary",
      category: "Income",
      amount: 2000.0,
      envelopeId: "env-2",
    },
  ];

  const mockEnvelopes = [
    { id: "env-1", name: "Food", category: "expenses", color: "#ff0000" },
    { id: "env-2", name: "Main", category: "income", color: "#00ff00" },
  ];

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

  describe("Desktop View (DataTable)", () => {
    it("should render headers correctly", () => {
      renderWithQuery(<TransactionTable {...defaultProps} />);
      const table = screen.getByTestId("data-table");
      expect(within(table).getByText("Date")).toBeInTheDocument();
      expect(within(table).getByText("Description")).toBeInTheDocument();
      expect(within(table).getByText("Category")).toBeInTheDocument();
      expect(within(table).getByText("Envelope")).toBeInTheDocument();
      expect(within(table).getByText("Amount")).toBeInTheDocument();
      expect(within(table).getByText("Actions")).toBeInTheDocument();
    });

    it("should render empty state when no transactions", () => {
      renderWithQuery(<TransactionTable {...defaultProps} transactions={[]} />);
      const table = screen.getByTestId("data-table");
      expect(within(table).getByText("No transactions found")).toBeInTheDocument();
    });

    it("should render transaction rows", () => {
      renderWithQuery(
        <TransactionTable
          {...defaultProps}
          transactions={mockTransactions as any}
          envelopes={mockEnvelopes as any}
        />
      );

      const table = screen.getByTestId("data-table");
      expect(within(table).getByTestId("row-1")).toBeInTheDocument();
      expect(within(table).getByTestId("row-2")).toBeInTheDocument();

      const row1 = within(table).getByTestId("row-1");
      expect(within(row1).getByText("Grocery Store")).toBeInTheDocument();
      expect(within(row1).getByText("Groceries")).toBeInTheDocument();
    });

    it("should trigger onEdit when Edit button is clicked", async () => {
      renderWithQuery(
        <TransactionTable
          {...defaultProps}
          transactions={[mockTransactions[0]] as any}
          envelopes={mockEnvelopes as any}
        />
      );

      const table = screen.getByTestId("data-table");
      const editButton = within(table).getByLabelText("Edit transaction");
      await userEvent.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockTransactions[0]);
    });

    it("should opening deleting confirmation when Delete is clicked", async () => {
      renderWithQuery(
        <TransactionTable
          {...defaultProps}
          transactions={[mockTransactions[0]] as any}
          envelopes={mockEnvelopes as any}
        />
      );

      const table = screen.getByTestId("data-table");
      const deleteButton = within(table).getByLabelText("Delete transaction");
      await userEvent.click(deleteButton);

      const modal = screen.getByTestId("confirm-modal");
      expect(modal).toBeInTheDocument();
      expect(within(modal).getByText(/Delete Transaction\?/)).toBeInTheDocument();
      expect(within(modal).getByText(/Grocery Store/)).toBeInTheDocument();
    });

    it("should call onDelete when delete is confirmed", async () => {
      renderWithQuery(
        <TransactionTable
          {...defaultProps}
          transactions={[mockTransactions[0]] as any}
          envelopes={mockEnvelopes as any}
        />
      );

      // Open modal
      const table = screen.getByTestId("data-table");
      await userEvent.click(within(table).getByLabelText("Delete transaction"));

      // Confirm
      const modal = screen.getByTestId("confirm-modal");
      const confirmButton = within(modal).getByText("Confirm");
      await userEvent.click(confirmButton);

      expect(mockOnDelete).toHaveBeenCalledWith("1");
      expect(screen.queryByTestId("confirm-modal")).not.toBeInTheDocument();
    });

    it("should open history viewer when History is clicked", async () => {
      renderWithQuery(
        <TransactionTable
          {...defaultProps}
          transactions={[mockTransactions[0]] as any}
          envelopes={mockEnvelopes as any}
        />
      );

      const historyButton = screen.getByLabelText("View history");
      await userEvent.click(historyButton);

      expect(screen.getByTestId("history-viewer")).toBeInTheDocument();
      expect(screen.getByText(/History for Transaction: Grocery Store/)).toBeInTheDocument();
    });
  });

  describe("Mobile View (MobileTransactionList)", () => {
    // Note: In real JSDOM, both md:hidden and hidden md:block might be visible if not handling media queries.
    // However, MobileTransactionList is rendered alongside DataTable.
    // We can verify its content if it's not hidden by CSS in the test environment (which it usually isn't in JSDOM).

    it("should render mobile list content", () => {
      renderWithQuery(
        <TransactionTable
          {...defaultProps}
          transactions={[mockTransactions[0]] as any}
          envelopes={mockEnvelopes as any}
        />
      );

      // Mobile list items are usually just divs with specific content
      // From TransactionTable.tsx, we see it maps transactions and shows description.
      const mobileHeaders = screen.getAllByText("Date");
      expect(mobileHeaders.length).toBeGreaterThan(1); // One in DataTable, one in Mobile list
    });
  });
});
