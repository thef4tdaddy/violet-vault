import { render, screen, waitFor } from "../../../test/test-utils";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ViewRenderer from "../ViewRenderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock ErrorBoundary (Sentry ErrorBoundary is used, but we'll mock it as a simple wrapper)
vi.mock("../../../components/ui/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock layout hooks
vi.mock("../../../hooks/platform/ux/layout/useLayoutData", () => ({
  useLayoutData: vi.fn(() => ({
    unassignedCash: 100,
    bills: { addBill: vi.fn() },
    envelopes: [],
    transactions: [],
    processPaycheck: vi.fn(),
    paycheckHistory: [],
  })),
}));

vi.mock("../../../hooks/layout/usePaycheckOperations", () => ({
  usePaycheckOperations: vi.fn(() => ({
    handleDeletePaycheck: vi.fn(),
  })),
}));

// Mock logger
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    auth: vi.fn(),
    budgetSync: vi.fn(),
  },
}));

// Mock all child components to simplify testing
vi.mock("../../../components/pages/MainDashboard", () => ({
  default: () => <div data-testid="dashboard-view">Dashboard</div>,
}));

vi.mock("../../../components/budgeting/EnvelopeGrid", () => ({
  default: () => <div data-testid="envelope-grid">Envelopes</div>,
}));

vi.mock("../../../components/budgeting/SmartEnvelopeSuggestions", () => ({
  default: () => <div>Suggestions</div>,
}));

vi.mock("../../../components/savings/SavingsGoals", () => ({
  default: () => <div data-testid="savings-view">Savings</div>,
}));

vi.mock("../../../components/accounts/SupplementalAccounts", () => ({
  default: () => <div data-testid="supplemental-view">Supplemental Accounts</div>,
}));

vi.mock("../../../components/budgeting/PaycheckProcessor", () => ({
  default: () => <div data-testid="paycheck-view">Paycheck Processor</div>,
}));

vi.mock("../../../components/bills/BillManager", () => ({
  default: () => <div data-testid="bills-view">Bills</div>,
}));

vi.mock("../../../components/transactions/TransactionLedger", () => ({
  default: () => <div data-testid="transactions-view">Transactions</div>,
}));

vi.mock("../../../components/analytics/AnalyticsDashboard", () => ({
  default: () => <div data-testid="analytics-view">Analytics</div>,
}));

vi.mock("../../../components/debt/DebtDashboard", () => ({
  default: () => <div data-testid="debts-view">Debts</div>,
}));

vi.mock("../../../components/automation/AutoFundingView", () => ({
  default: () => <div data-testid="automation-view">Automation</div>,
}));

vi.mock("../../../components/activity/ActivityFeed", () => ({
  default: () => <div data-testid="activity-view">Activity</div>,
}));

vi.mock("@/utils/debts/debtDebugConfig", () => ({
  isDebtFeatureEnabled: vi.fn(() => true),
}));

vi.mock("../../../utils", () => ({
  getIcon: vi.fn(() => "div"),
}));

vi.mock("../ui/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe("ViewRenderer", () => {
  const mockSetActiveView = vi.fn();
  let queryClient: QueryClient;

  const defaultProps = {
    activeView: "dashboard",
    budget: {},
    currentUser: { userName: "Test User", userColor: "#000" },
    setActiveView: mockSetActiveView,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderView = (props: Partial<typeof defaultProps> = {}) => {
    return render(<ViewRenderer {...defaultProps} {...props} />);
  };

  describe("View Rendering", () => {
    it("should render dashboard view when activeView is dashboard", async () => {
      renderView({ activeView: "dashboard" });
      await waitFor(() => {
        expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
      });
    });

    it("should render savings view when activeView is savings", async () => {
      renderView({ activeView: "savings" });
      await waitFor(() => {
        expect(screen.getByTestId("savings-view")).toBeInTheDocument();
      });
    });

    it("should render supplemental accounts view when activeView is supplemental", async () => {
      renderView({ activeView: "supplemental" });
      await waitFor(() => {
        expect(screen.getByTestId("supplemental-view")).toBeInTheDocument();
      });
    });

    it("should render paycheck view when activeView is paycheck", async () => {
      renderView({ activeView: "paycheck" });
      await waitFor(() => {
        expect(screen.getByTestId("paycheck-view")).toBeInTheDocument();
      });
    });

    it("should render bills view when activeView is bills", async () => {
      renderView({ activeView: "bills" });
      await waitFor(() => {
        expect(screen.getByTestId("bills-view")).toBeInTheDocument();
      });
    });

    it("should render transactions view when activeView is transactions", async () => {
      renderView({ activeView: "transactions" });
      await waitFor(() => {
        expect(screen.getByTestId("transactions-view")).toBeInTheDocument();
      });
    });

    it("should render analytics view when activeView is analytics", async () => {
      renderView({ activeView: "analytics" });
      await waitFor(() => {
        expect(screen.getByTestId("analytics-view")).toBeInTheDocument();
      });
    });

    it("should render debts view when activeView is debts", async () => {
      renderView({ activeView: "debts" });
      await waitFor(() => {
        expect(screen.getByTestId("debts-view")).toBeInTheDocument();
      });
    });

    it("should render automation view when activeView is automation", async () => {
      renderView({ activeView: "automation" });
      await waitFor(() => {
        expect(screen.getByTestId("automation-view")).toBeInTheDocument();
      });
    });

    it("should render activity view when activeView is activity", async () => {
      renderView({ activeView: "activity" });
      await waitFor(() => {
        expect(screen.getByTestId("activity-view")).toBeInTheDocument();
      });
    });

    it("should render envelope view when activeView is envelopes", async () => {
      renderView({ activeView: "envelopes" });
      await waitFor(() => {
        expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
      });
    });
  });

  describe("Error Handling", () => {
    it("should show not found message for invalid view", () => {
      renderView({ activeView: "invalid" });
      expect(screen.getByText("View not found")).toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("should handle missing currentUser prop", async () => {
      renderView({ currentUser: undefined });
      await waitFor(() => {
        expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
      });
    });

    it("should handle missing budget prop", async () => {
      renderView({ budget: undefined });
      await waitFor(() => {
        expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
      });
    });
  });
});
