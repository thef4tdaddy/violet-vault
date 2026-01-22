import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AccountCards from "../AccountCards";
import { useAccountBalances } from "@/hooks/dashboard/useAccountBalances";

// Mock dependencies
vi.mock("@/hooks/dashboard/useAccountBalances");
vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn((selector) => {
    if (typeof selector === "function") {
      return selector({ openUnassignedCashModal: vi.fn() });
    }
    return { openUnassignedCashModal: vi.fn() };
  }),
}));

// Mock AccountCard component
vi.mock("../AccountCard", () => ({
  default: ({
    type,
    balance,
    subtitle,
    action,
    isLoading,
    isWarning,
  }: {
    type: string;
    balance: number;
    subtitle?: string;
    action?: { label: string; onClick: () => void };
    isLoading?: boolean;
    isWarning?: boolean;
  }) => (
    <div data-testid={`account-card-${type}`} data-loading={isLoading} data-warning={isWarning}>
      <div data-testid={`balance-${type}`}>${balance.toFixed(2)}</div>
      {subtitle && <div data-testid={`subtitle-${type}`}>{subtitle}</div>}
      {action && (
        <button onClick={action.onClick} data-testid={`action-${type}`}>
          {action.label}
        </button>
      )}
    </div>
  ),
}));

const mockUseAccountBalances = vi.mocked(useAccountBalances);

describe("AccountCards", () => {
  let queryClient: QueryClient;

  const defaultBalances = {
    checking: {
      balance: 2500,
      isManual: false,
    },
    savings: {
      balance: 1000,
    },
    unassigned: {
      amount: 300,
      isNegative: false,
      isHigh: false,
    },
  };

  const renderWithQuery = (ui: React.ReactElement) => {
    return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Default mock return value
    mockUseAccountBalances.mockReturnValue({
      accountBalances: defaultBalances,
      isLoading: false,
      error: null,
    });
  });

  describe("Basic rendering", () => {
    it("should render all three account cards", () => {
      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("account-cards-container")).toBeInTheDocument();
      expect(screen.getByTestId("account-card-checking")).toBeInTheDocument();
      expect(screen.getByTestId("account-card-savings")).toBeInTheDocument();
      expect(screen.getByTestId("account-card-unassigned")).toBeInTheDocument();
    });

    it("should display correct balances for each account", () => {
      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("balance-checking")).toHaveTextContent("$2500.00");
      expect(screen.getByTestId("balance-savings")).toHaveTextContent("$1000.00");
      expect(screen.getByTestId("balance-unassigned")).toHaveTextContent("$300.00");
    });

    it("should apply custom className to container", () => {
      renderWithQuery(<AccountCards className="custom-class" />);

      const container = screen.getByTestId("account-cards-container");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("Checking account card", () => {
    it("should show manual entry subtitle when balance is manual", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          ...defaultBalances,
          checking: {
            balance: 2500,
            isManual: true,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("subtitle-checking")).toHaveTextContent("Manual entry");
    });

    it("should show calculated balance subtitle when not manual", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          ...defaultBalances,
          checking: {
            balance: 2500,
            isManual: false,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("subtitle-checking")).toHaveTextContent("Calculated balance");
    });
  });

  describe("Savings account card", () => {
    it("should always show savings goals subtitle", () => {
      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("subtitle-savings")).toHaveTextContent("Savings goals tracked");
    });
  });

  describe("Unassigned cash card", () => {
    it("should show default subtitle for normal balance", () => {
      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("subtitle-unassigned")).toHaveTextContent(
        "Available for allocation"
      );
    });

    it("should show warning subtitle for negative balance", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          ...defaultBalances,
          unassigned: {
            amount: -100,
            isNegative: true,
            isHigh: false,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("subtitle-unassigned")).toHaveTextContent(
        "Needs attention - overspent"
      );
    });

    it("should show warning subtitle for high balance", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          ...defaultBalances,
          unassigned: {
            amount: 750,
            isNegative: false,
            isHigh: true,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("subtitle-unassigned")).toHaveTextContent(
        "High balance - consider allocating"
      );
    });

    it("should render Allocate Funds button", () => {
      renderWithQuery(<AccountCards />);

      const allocateButton = screen.getByTestId("action-unassigned");
      expect(allocateButton).toBeInTheDocument();
      expect(allocateButton).toHaveTextContent("Allocate Funds");
    });

    it("should open unassigned cash modal when Allocate button is clicked", async () => {
      const mockOpenModal = vi.fn();
      const { useBudgetStore } = await import("@/stores/ui/uiStore");
      vi.mocked(useBudgetStore).mockImplementation((selector) => {
        if (typeof selector === "function") {
          return selector({ openUnassignedCashModal: mockOpenModal });
        }
        return mockOpenModal;
      });

      renderWithQuery(<AccountCards />);

      const allocateButton = screen.getByTestId("action-unassigned");
      await userEvent.click(allocateButton);

      expect(mockOpenModal).toHaveBeenCalledTimes(1);
    });

    it("should apply warning state for high unassigned cash", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          ...defaultBalances,
          unassigned: {
            amount: 750,
            isNegative: false,
            isHigh: true,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      const unassignedCard = screen.getByTestId("account-card-unassigned");
      expect(unassignedCard).toHaveAttribute("data-warning", "true");
    });

    it("should apply warning state for negative unassigned cash", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          ...defaultBalances,
          unassigned: {
            amount: -100,
            isNegative: true,
            isHigh: false,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      const unassignedCard = screen.getByTestId("account-card-unassigned");
      expect(unassignedCard).toHaveAttribute("data-warning", "true");
    });
  });

  describe("Loading state", () => {
    it("should pass loading state to all cards", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: defaultBalances,
        isLoading: true,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("account-card-checking")).toHaveAttribute("data-loading", "true");
      expect(screen.getByTestId("account-card-savings")).toHaveAttribute("data-loading", "true");
      expect(screen.getByTestId("account-card-unassigned")).toHaveAttribute("data-loading", "true");
    });
  });

  describe("Error state", () => {
    it("should render error message when data fetch fails", () => {
      const error = new Error("Network error");
      mockUseAccountBalances.mockReturnValue({
        accountBalances: defaultBalances,
        isLoading: false,
        error,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("account-cards-error")).toBeInTheDocument();
      expect(screen.getByText("Failed to load account data")).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });

    it("should not render cards when error occurs", () => {
      const error = new Error("Test error");
      mockUseAccountBalances.mockReturnValue({
        accountBalances: defaultBalances,
        isLoading: false,
        error,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.queryByTestId("account-cards-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("account-card-checking")).not.toBeInTheDocument();
    });
  });

  describe("Grid layout", () => {
    it("should have responsive grid classes", () => {
      renderWithQuery(<AccountCards />);

      const container = screen.getByTestId("account-cards-container");
      expect(container).toHaveClass("grid");
      expect(container).toHaveClass("grid-cols-1");
      expect(container).toHaveClass("md:grid-cols-2");
      expect(container).toHaveClass("lg:grid-cols-3");
      expect(container).toHaveClass("gap-6");
    });
  });

  describe("Edge cases", () => {
    it("should handle zero balances", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          checking: { balance: 0, isManual: false },
          savings: { balance: 0 },
          unassigned: { amount: 0, isNegative: false, isHigh: false },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("balance-checking")).toHaveTextContent("$0.00");
      expect(screen.getByTestId("balance-savings")).toHaveTextContent("$0.00");
      expect(screen.getByTestId("balance-unassigned")).toHaveTextContent("$0.00");
    });

    it("should handle very large balances", () => {
      mockUseAccountBalances.mockReturnValue({
        accountBalances: {
          checking: { balance: 999999.99, isManual: false },
          savings: { balance: 500000 },
          unassigned: { amount: 10000, isNegative: false, isHigh: true },
        },
        isLoading: false,
        error: null,
      });

      renderWithQuery(<AccountCards />);

      expect(screen.getByTestId("balance-checking")).toHaveTextContent("$999999.99");
      expect(screen.getByTestId("balance-savings")).toHaveTextContent("$500000.00");
      expect(screen.getByTestId("balance-unassigned")).toHaveTextContent("$10000.00");
    });
  });
});
