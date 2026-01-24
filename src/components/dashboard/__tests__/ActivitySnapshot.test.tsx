/**
 * ActivitySnapshot Component Tests
 *
 * Tests for the ActivitySnapshot dashboard widget.
 * Covers rendering, loading states, empty states, navigation, and interactions.
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, Mock } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ActivitySnapshot from "../ActivitySnapshot";
import "@testing-library/jest-dom";
import type { ActivityItem } from "@/hooks/dashboard/useRecentActivity";

// Mock the useRecentActivity hook
vi.mock("@/hooks/dashboard/useRecentActivity", () => ({
  useRecentActivity: vi.fn(),
}));

// Mock the useNavigate hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Import the mocked hook for manipulation
import { useRecentActivity } from "@/hooks/dashboard/useRecentActivity";

describe("ActivitySnapshot", () => {
  const mockRefetch = vi.fn();

  // Sample data for tests
  const mockTransactions: ActivityItem[] = [
    {
      id: "txn-1",
      type: "transaction",
      date: new Date("2025-01-20"),
      title: "Coffee Shop",
      amount: -4.5,
      category: "Food & Drink",
      isIncome: false,
      originalData: { id: "txn-1" } as any,
    },
    {
      id: "txn-2",
      type: "transaction",
      date: new Date("2025-01-19"),
      title: "Salary Deposit",
      amount: 3000,
      category: "Income",
      isIncome: true,
      originalData: { id: "txn-2" } as any,
    },
  ];

  const mockBills: ActivityItem[] = [
    {
      id: "bill-1",
      type: "bill",
      date: new Date("2025-01-25"),
      title: "Electric Bill",
      amount: 150,
      category: "Utilities",
      isIncome: false,
      billStatus: "upcoming",
      isPaid: false,
      originalData: { id: "bill-1" } as any,
    },
    {
      id: "bill-2",
      type: "bill",
      date: new Date("2025-01-22"),
      title: "Internet",
      amount: 80,
      category: "Utilities",
      isIncome: false,
      billStatus: "due-soon",
      isPaid: false,
      originalData: { id: "bill-2" } as any,
    },
  ];

  const mockPaychecks: ActivityItem[] = [
    {
      id: "paycheck-1",
      type: "paycheck",
      date: new Date("2025-01-15"),
      title: "Acme Corp",
      amount: 2500,
      category: "Income",
      isIncome: true,
      allocationStatus: "allocated",
      originalData: { id: "paycheck-1" } as any,
    },
  ];

  const defaultMockReturn = {
    recentTransactions: mockTransactions,
    upcomingBills: mockBills,
    recentPaychecks: mockPaychecks,
    allActivity: [...mockTransactions, ...mockBills, ...mockPaychecks],
    isLoading: false,
    isError: false,
    error: null,
    refetch: mockRefetch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRecentActivity as Mock).mockReturnValue(defaultMockReturn);
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <ActivitySnapshot {...props} />
      </MemoryRouter>
    );
  };

  // ========================================================================
  // Basic Rendering Tests
  // ========================================================================
  describe("Basic Rendering", () => {
    it("should render the component", () => {
      renderComponent();
      expect(screen.getByTestId("activity-snapshot")).toBeInTheDocument();
    });

    it("should render the header with correct title", () => {
      renderComponent();
      expect(screen.getByText(/CTIVITY/)).toBeInTheDocument();
      expect(screen.getByText(/NAPSHOT/)).toBeInTheDocument();
    });

    it("should render refresh button", () => {
      renderComponent();
      expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    });

    it("should render all three sections", () => {
      renderComponent();
      expect(screen.getAllByText(/ECENT/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/PCOMING/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/AYCHECKS/).length).toBeGreaterThanOrEqual(1);
    });
  });

  // ========================================================================
  // Transaction Rendering Tests
  // ========================================================================
  describe("Transaction Rendering", () => {
    it("should render recent transactions", () => {
      renderComponent();
      expect(screen.getByText("Coffee Shop")).toBeInTheDocument();
      expect(screen.getByText("Salary Deposit")).toBeInTheDocument();
    });

    it("should display transaction count", () => {
      renderComponent();
      const counts = screen.getAllByText("(2)");
      expect(counts.length).toBeGreaterThanOrEqual(1);
    });

    it("should render View All button for transactions", () => {
      renderComponent();
      const viewAllButtons = screen.getAllByText("View All");
      expect(viewAllButtons.length).toBeGreaterThan(0);
    });
  });

  // ========================================================================
  // Bill Rendering Tests
  // ========================================================================
  describe("Bill Rendering", () => {
    it("should render upcoming bills", () => {
      renderComponent();
      expect(screen.getByText("Electric Bill")).toBeInTheDocument();
      expect(screen.getByText("Internet")).toBeInTheDocument();
    });

    it("should display bill amounts", () => {
      renderComponent();
      expect(screen.getByText("$150.00")).toBeInTheDocument();
      expect(screen.getByText("$80.00")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Paycheck Rendering Tests
  // ========================================================================
  describe("Paycheck Rendering", () => {
    it("should render recent paychecks", () => {
      renderComponent();
      expect(screen.getByText("Acme Corp")).toBeInTheDocument();
    });

    it("should display paycheck amount with + sign for income", () => {
      renderComponent();
      expect(screen.getByText("+$2500.00")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Loading State Tests
  // ========================================================================
  describe("Loading State", () => {
    it("should show loading skeleton when loading", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });
      const { container } = renderComponent();
      expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
    });

    it("should hide refresh button when loading", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        isLoading: true,
      });
      renderComponent();
      expect(screen.queryByRole("button", { name: /refresh/i })).not.toBeInTheDocument();
    });
  });

  // ========================================================================
  // Error State Tests
  // ========================================================================
  describe("Error State", () => {
    it("should show error message when error occurs", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        isError: true,
        error: new Error("Failed to fetch"),
      });
      renderComponent();
      expect(screen.getByText("Failed to load activity")).toBeInTheDocument();
    });

    it("should show try again button on error", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        isError: true,
        error: new Error("Failed to fetch"),
      });
      renderComponent();
      expect(screen.getByText("Try again")).toBeInTheDocument();
    });

    it("should call refetch when try again is clicked", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        isError: true,
        error: new Error("Failed to fetch"),
      });
      renderComponent();
      fireEvent.click(screen.getByText("Try again"));
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // Empty State Tests
  // ========================================================================
  describe("Empty State", () => {
    it("should show empty state when no activity", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        recentTransactions: [],
        upcomingBills: [],
        recentPaychecks: [],
        allActivity: [],
      });
      renderComponent();
      expect(screen.getByText("No recent activity to display")).toBeInTheDocument();
    });

    it("should show section-specific empty message for transactions", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        recentTransactions: [],
      });
      renderComponent();
      expect(screen.getByText("No recent transactions")).toBeInTheDocument();
    });

    it("should show section-specific empty message for bills", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        upcomingBills: [],
      });
      renderComponent();
      expect(screen.getByText("No bills due soon")).toBeInTheDocument();
    });

    it("should show section-specific empty message for paychecks", () => {
      (useRecentActivity as Mock).mockReturnValue({
        ...defaultMockReturn,
        recentPaychecks: [],
      });
      renderComponent();
      expect(screen.getByText("No recent paychecks")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Navigation Tests
  // ========================================================================
  describe("Navigation", () => {
    it("should navigate to transactions when transaction is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Coffee Shop"));
      expect(mockNavigate).toHaveBeenCalledWith("/app/transactions", {
        state: { highlightId: "txn-1" },
      });
    });

    it("should navigate to bills when bill is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Electric Bill"));
      expect(mockNavigate).toHaveBeenCalledWith("/app/bills", {
        state: { highlightId: "bill-1" },
      });
    });

    it("should navigate to paycheck when paycheck is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByText("Acme Corp"));
      expect(mockNavigate).toHaveBeenCalledWith("/app/paycheck", {
        state: { highlightId: "paycheck-1" },
      });
    });

    it("should navigate to transactions page when View All is clicked", () => {
      renderComponent();
      const viewAllButtons = screen.getAllByText("View All");
      fireEvent.click(viewAllButtons[0]);
      expect(mockNavigate).toHaveBeenCalledWith("/app/transactions");
    });

    it("should navigate to bills page when View All Bills is clicked", () => {
      renderComponent();
      const viewAllButtons = screen.getAllByText("View All");
      fireEvent.click(viewAllButtons[1]);
      expect(mockNavigate).toHaveBeenCalledWith("/app/bills");
    });

    it("should navigate to paycheck page when View All Paychecks is clicked", () => {
      renderComponent();
      const viewAllButtons = screen.getAllByText("View All");
      fireEvent.click(viewAllButtons[2]);
      expect(mockNavigate).toHaveBeenCalledWith("/app/paycheck");
    });
  });

  // ========================================================================
  // Refresh Tests
  // ========================================================================
  describe("Refresh Functionality", () => {
    it("should call refetch when refresh button is clicked", () => {
      renderComponent();
      fireEvent.click(screen.getByRole("button", { name: /refresh/i }));
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  // ========================================================================
  // Props Tests
  // ========================================================================
  describe("Props", () => {
    it("should pass transactionLimit to hook", () => {
      renderComponent({ transactionLimit: 10 });
      expect(useRecentActivity).toHaveBeenCalledWith(
        expect.objectContaining({ transactionLimit: 10 })
      );
    });

    it("should pass billDaysAhead to hook", () => {
      renderComponent({ billDaysAhead: 14 });
      expect(useRecentActivity).toHaveBeenCalledWith(
        expect.objectContaining({ billDaysAhead: 14 })
      );
    });

    it("should pass paycheckLimit to hook", () => {
      renderComponent({ paycheckLimit: 5 });
      expect(useRecentActivity).toHaveBeenCalledWith(expect.objectContaining({ paycheckLimit: 5 }));
    });

    it("should use default props when not provided", () => {
      renderComponent();
      expect(useRecentActivity).toHaveBeenCalledWith({
        transactionLimit: 5,
        billDaysAhead: 7,
        paycheckLimit: 2,
      });
    });

    it("should apply additional className", () => {
      const { container } = renderComponent({ className: "custom-class" });
      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Styling Tests
  // ========================================================================
  describe("Styling", () => {
    it("should have proper border styling", () => {
      const { container } = renderComponent();
      expect(container.querySelector(".border-2")).toBeInTheDocument();
      expect(container.querySelector(".border-black")).toBeInTheDocument();
    });

    it("should have rounded corners", () => {
      const { container } = renderComponent();
      expect(container.querySelector(".rounded-2xl")).toBeInTheDocument();
    });

    it("should have hard lines shadow", () => {
      const { container } = renderComponent();
      expect(
        container.querySelector(".shadow-\\[8px_8px_0px_0px_rgba\\(0\\,0\\,0\\,1\\)\\]")
      ).toBeInTheDocument();
    });
  });

  // ========================================================================
  // Responsive Layout Tests
  // ========================================================================
  describe("Responsive Layout", () => {
    it("should have grid layout", () => {
      const { container } = renderComponent();
      expect(container.querySelector(".grid")).toBeInTheDocument();
    });

    it("should have responsive grid columns", () => {
      const { container } = renderComponent();
      expect(container.querySelector(".lg\\:grid-cols-3")).toBeInTheDocument();
    });
  });
});
