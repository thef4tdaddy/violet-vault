import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import BillTable from "../BillTable";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock child components
vi.mock("../BillTableHeader", () => ({
  default: ({ selectionState, clearSelection, selectAllBills }) => (
    <thead data-testid="bill-table-header">
      <tr>
        <th>
          <button onClick={selectAllBills}>Select All</button>
          {selectionState.isAllSelected && <button onClick={clearSelection}>Clear</button>}
        </th>
      </tr>
    </thead>
  ),
}));

vi.mock("../BillTableEmptyState", () => ({
  default: ({ viewMode }) => (
    <div data-testid="bill-table-empty-state">No bills in {viewMode} mode</div>
  ),
}));

vi.mock("../BillTableBulkActions", () => ({
  default: ({ selectionState, setShowBulkUpdateModal, clearSelection }) =>
    selectionState.selectedIds.length > 0 ? (
      <div data-testid="bill-table-bulk-actions">
        <span>Selected: {selectionState.selectedIds.length}</span>
        <button onClick={() => setShowBulkUpdateModal(true)}>Bulk Update</button>
        <button onClick={clearSelection}>Clear Selection</button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className }) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../../utils", () => ({
  getIcon: vi.fn(() => {
    return function MockIcon({ className }) {
      return <div className={className}>Icon</div>;
    };
  }),
}));

describe("BillTable", () => {
  const mockClearSelection = vi.fn();
  const mockSelectAllBills = vi.fn();
  const mockToggleBillSelection = vi.fn();
  const mockSetShowBulkUpdateModal = vi.fn();
  const mockSetShowBillDetail = vi.fn();
  const mockHandlePayBill = vi.fn();
  let queryClient: QueryClient;

  const mockGetBillDisplayData = vi.fn((bill) => ({
    Icon: () => <div>Icon</div>,
    isSelected: false,
    amount: bill.amount,
    dueDateDisplay: bill.dueDate,
    daysDisplay: "",
    urgencyColors: "bg-yellow-100 text-yellow-800",
    statusText: "Due Soon",
  }));

  const defaultProps = {
    filteredBills: [],
    selectionState: {
      selectedIds: [],
      isAllSelected: false,
    },
    clearSelection: mockClearSelection,
    selectAllBills: mockSelectAllBills,
    toggleBillSelection: mockToggleBillSelection,
    setShowBulkUpdateModal: mockSetShowBulkUpdateModal,
    setShowBillDetail: mockSetShowBillDetail,
    getBillDisplayData: mockGetBillDisplayData,
    billOperations: {
      handlePayBill: mockHandlePayBill,
    },
    categorizedBills: {
      overdue: [],
      dueSoon: [],
      upcoming: [],
      paid: [],
    },
    viewMode: "all",
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
      renderWithQuery(<BillTable {...defaultProps} />);
      expect(screen.getByTestId("bill-table-header")).toBeInTheDocument();
    });

    it("should render table structure", () => {
      renderWithQuery(<BillTable {...defaultProps} />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should display empty state when no bills", () => {
      renderWithQuery(<BillTable {...defaultProps} />);
      expect(screen.getByTestId("bill-table-empty-state")).toBeInTheDocument();
      expect(screen.getByText(/No bills in all mode/i)).toBeInTheDocument();
    });

    it("should render bills when they exist", () => {
      const bills = [
        {
          id: "1",
          name: "Electric Bill",
          category: "Utilities",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
        {
          id: "2",
          name: "Internet Bill",
          category: "Utilities",
          amount: 50,
          dueDate: "2024-01-20",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      expect(screen.getByText("Electric Bill")).toBeInTheDocument();
      expect(screen.getByText("Internet Bill")).toBeInTheDocument();
      expect(screen.getAllByText("Utilities").length).toBe(2);
    });

    it("should not show empty state when bills exist", () => {
      const bills = [
        {
          id: "1",
          name: "Bill",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      expect(screen.queryByTestId("bill-table-empty-state")).not.toBeInTheDocument();
    });

    it("should display pay button for unpaid bills", () => {
      const bills = [
        {
          id: "1",
          name: "Bill",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      expect(screen.getByText("Pay")).toBeInTheDocument();
    });

    it("should not display pay button for paid bills", () => {
      const bills = [
        {
          id: "1",
          name: "Bill",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: true,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      expect(screen.queryByText("Pay")).not.toBeInTheDocument();
    });
  });

  describe("Bill Selection", () => {
    it("should render checkboxes for each bill", () => {
      const bills = [
        {
          id: "1",
          name: "Bill 1",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
        {
          id: "2",
          name: "Bill 2",
          category: "Test",
          amount: 50,
          dueDate: "2024-01-20",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes).toHaveLength(2);
    });

    it("should call toggleBillSelection when checkbox is clicked", async () => {
      const bills = [
        {
          id: "1",
          name: "Bill",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      const checkbox = screen.getByRole("checkbox");
      await userEvent.click(checkbox);

      expect(mockToggleBillSelection).toHaveBeenCalledWith("1");
    });

    it("should show bulk actions when bills are selected", () => {
      const selectionState = {
        selectedIds: ["1", "2"],
        isAllSelected: false,
      };

      renderWithQuery(<BillTable {...defaultProps} selectionState={selectionState} />);

      expect(screen.getByTestId("bill-table-bulk-actions")).toBeInTheDocument();
      expect(screen.getByText("Selected: 2")).toBeInTheDocument();
    });

    it("should not show bulk actions when no bills selected", () => {
      renderWithQuery(<BillTable {...defaultProps} />);

      expect(screen.queryByTestId("bill-table-bulk-actions")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call setShowBillDetail when row is clicked", async () => {
      const bills = [
        {
          id: "1",
          name: "Bill",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      const row = screen.getByText("Bill").closest("tr");
      await userEvent.click(row);

      expect(mockSetShowBillDetail).toHaveBeenCalledWith(bills[0]);
    });

    it("should call handlePayBill when pay button is clicked", async () => {
      const bills = [
        {
          id: "1",
          name: "Bill",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      const payButton = screen.getByText("Pay");
      await userEvent.click(payButton);

      expect(mockHandlePayBill).toHaveBeenCalledWith("1");
    });
  });

  describe("Display Data", () => {
    it("should call getBillDisplayData for each bill", () => {
      const bills = [
        {
          id: "1",
          name: "Bill 1",
          category: "Test",
          amount: 100,
          dueDate: "2024-01-15",
          isPaid: false,
        },
        {
          id: "2",
          name: "Bill 2",
          category: "Test",
          amount: 50,
          dueDate: "2024-01-20",
          isPaid: false,
        },
      ];

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      expect(mockGetBillDisplayData).toHaveBeenCalledTimes(2);
      expect(mockGetBillDisplayData).toHaveBeenCalledWith(bills[0]);
      expect(mockGetBillDisplayData).toHaveBeenCalledWith(bills[1]);
    });

    it("should display bill amounts from display data", () => {
      const bills = [
        {
          id: "1",
          name: "Bill",
          category: "Test",
          amount: 123.45,
          dueDate: "2024-01-15",
          isPaid: false,
        },
      ];

      mockGetBillDisplayData.mockReturnValue({
        Icon: () => <div>Icon</div>,
        isSelected: false,
        amount: "123.45",
        dueDateDisplay: "Jan 15, 2024",
        daysDisplay: "in 5 days",
        urgencyColors: "bg-yellow-100 text-yellow-800",
        statusText: "Due Soon",
      });

      renderWithQuery(<BillTable {...defaultProps} filteredBills={bills} />);

      expect(screen.getByText("$123.45")).toBeInTheDocument();
      expect(screen.getByText("Jan 15, 2024")).toBeInTheDocument();
      expect(screen.getByText("in 5 days")).toBeInTheDocument();
      expect(screen.getByText("Due Soon")).toBeInTheDocument();
    });
  });
});
