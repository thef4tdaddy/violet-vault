import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import BillTable from "../BillTable";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@testing-library/jest-dom";

// Mock child components
vi.mock("../BillTableHeader", () => ({
  default: ({ selectionState, clearSelection, selectAllBills }: any) => (
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
  default: ({ viewMode }: any) => (
    <div data-testid="bill-table-empty-state">No bills in {viewMode} mode</div>
  ),
}));

vi.mock("../BillTableBulkActions", () => ({
  default: ({ selectionState, setShowBulkUpdateModal, clearSelection }: any) =>
    selectionState.selectedIds.length > 0 ? (
      <div data-testid="bill-table-bulk-actions">
        <span>Selected: {selectionState.selectedIds.length}</span>
        <button onClick={() => setShowBulkUpdateModal(true)}>Bulk Update</button>
        <button onClick={clearSelection}>Clear Selection</button>
      </div>
    ) : null,
}));

vi.mock("@/components/ui", () => ({
  Button: ({ children, onClick, className }: any) => (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("../../utils", () => ({
  getIcon: vi.fn(() => {
    return function MockIcon({ className }: any) {
      return <div className={className}>Icon</div>;
    };
  }),
  getBillDisplayData: vi.fn((bill) => ({
    displayAmount: `$${bill.amount.toFixed(2)}`,
    isUpcoming: true,
    dueText: "in 5 days",
    formattedDate: "Jan 15, 2024",
    statusColor: "text-blue-500",
  })),
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
      selectedIds: [] as string[],
      isAllSelected: false,
      hasSelection: false,
      selectedCount: 0,
      selectedBillIds: [] as string[],
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
      expect(screen.getAllByTestId("bill-table-header")[0]).toBeInTheDocument();
    });

    it("should render table structure when bills exist", () => {
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
      const table = screen.getAllByRole("table")[0];
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

      expect(screen.getAllByText("Electric Bill").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Internet Bill").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Utilities").length).toBeGreaterThan(0);
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

      expect(screen.getAllByText("Pay").length).toBeGreaterThan(0);
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
      expect(checkboxes.length).toBeGreaterThanOrEqual(2);
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

      const checkbox = screen.getAllByRole("checkbox")[0];
      await userEvent.click(checkbox);

      expect(mockToggleBillSelection).toHaveBeenCalledWith("1");
    });

    it("should show bulk actions when bills are selected", () => {
      const selectionState = {
        selectedIds: ["1", "2"],
        isAllSelected: false,
        hasSelection: true,
        selectedCount: 2,
        selectedBillIds: ["1", "2"],
      };

      renderWithQuery(<BillTable {...defaultProps} selectionState={selectionState} />);

      expect(screen.getAllByTestId("bill-table-bulk-actions")[0]).toBeInTheDocument();
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

      const row = screen.getAllByText("Bill")[0].closest("tr, [role='button']");
      await userEvent.click(row!);

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

      const payButtons = screen.getAllByText("Pay");
      await userEvent.click(payButtons[0]);

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

      expect(mockGetBillDisplayData).toHaveBeenCalledTimes(4); // 2 bills * 2 views (Desktop/Mobile)
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

      expect(screen.getAllByText("$123.45").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Jan 15, 2024").length).toBeGreaterThan(0);
      expect(screen.getAllByText("in 5 days").length).toBeGreaterThan(0);
    });
  });
});
