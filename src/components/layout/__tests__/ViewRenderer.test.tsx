import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ViewRenderer from "../ViewRenderer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock ErrorBoundary (Sentry ErrorBoundary is used, but we'll mock it as a simple wrapper)
vi.mock("@/components/ui/ErrorBoundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock layout hooks
vi.mock("@/hooks/layout", () => ({
  useLayoutData: vi.fn(() => ({
    unassignedCash: 100,
    bills: { addBill: vi.fn() },
    envelopes: [],
    transactions: [],
    processPaycheck: vi.fn(),
    paycheckHistory: [],
  })),
}));

vi.mock("@/hooks/layout/usePaycheckOperations", () => ({
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
vi.mock("../pages/MainDashboard", () => ({
  default: () => <div data-testid="dashboard-view">Dashboard</div>,
}));

vi.mock("../budgeting/EnvelopeGrid", () => ({
  default: () => <div data-testid="envelope-grid">Envelopes</div>,
}));

vi.mock("../budgeting/SmartEnvelopeSuggestions", () => ({
  default: () => <div>Suggestions</div>,
}));

vi.mock("../savings/SavingsGoals", () => ({
  default: () => <div data-testid="savings-view">Savings</div>,
}));

vi.mock("../accounts/SupplementalAccounts", () => ({
  default: () => <div data-testid="supplemental-view">Supplemental Accounts</div>,
}));

vi.mock("../budgeting/PaycheckProcessor", () => ({
  default: () => <div data-testid="paycheck-view">Paycheck Processor</div>,
}));

vi.mock("../bills/BillManager", () => ({
  default: () => <div data-testid="bills-view">Bills</div>,
}));

vi.mock("../transactions/TransactionLedger", () => ({
  default: () => <div data-testid="transactions-view">Transactions</div>,
}));

vi.mock("../analytics/AnalyticsDashboard", () => ({
  default: () => <div data-testid="analytics-view">Analytics</div>,
}));

vi.mock("../debt/DebtDashboard", () => ({
  default: () => <div data-testid="debts-view">Debts</div>,
}));

vi.mock("../automation/AutoFundingView", () => ({
  default: () => <div data-testid="automation-view">Automation</div>,
}));

vi.mock("../activity/ActivityFeed", () => ({
  default: () => <div data-testid="activity-view">Activity</div>,
}));

vi.mock("@/utils/debts/debtDebugConfig", () => ({
  isDebtFeatureEnabled: vi.fn(() => true),
}));

vi.mock("@/utils", () => ({
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
    return render(
      <QueryClientProvider client={queryClient}>
        <ViewRenderer {...defaultProps} {...props} />
      </QueryClientProvider>
    );
  };

  describe("View Rendering", () => {
    it("should render dashboard view when activeView is dashboard", () => {
      renderView({ activeView: "dashboard" });
      expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
    });

    it("should render savings view when activeView is savings", () => {
      renderView({ activeView: "savings" });
      expect(screen.getByTestId("savings-view")).toBeInTheDocument();
    });

    it("should render supplemental accounts view when activeView is supplemental", () => {
      renderView({ activeView: "supplemental" });
      expect(screen.getByTestId("supplemental-view")).toBeInTheDocument();
    });

    it("should render paycheck view when activeView is paycheck", () => {
      renderView({ activeView: "paycheck" });
      expect(screen.getByTestId("paycheck-view")).toBeInTheDocument();
    });

    it("should render bills view when activeView is bills", () => {
      renderView({ activeView: "bills" });
      expect(screen.getByTestId("bills-view")).toBeInTheDocument();
    });

    it("should render transactions view when activeView is transactions", () => {
      renderView({ activeView: "transactions" });
      expect(screen.getByTestId("transactions-view")).toBeInTheDocument();
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

    it("should render envelope view when activeView is envelopes", () => {
      renderView({ activeView: "envelopes" });
      expect(screen.getByTestId("envelope-grid")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should show not found message for invalid view", () => {
      renderView({ activeView: "invalid" });
      expect(screen.getByText("View not found")).toBeInTheDocument();
    });
  });

  describe("Default Props", () => {
    it("should handle missing currentUser prop", () => {
      renderView({ currentUser: undefined });
      expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
    });

    it("should handle missing budget prop", () => {
      renderView({ budget: undefined });
      expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
    });
  });
});
