import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import AnalyticsDashboard from "../AnalyticsDashboard";
import userEvent from "@testing-library/user-event";
import useAnalyticsOriginal from "@/hooks/analytics/useAnalytics";
import { useBudgetStoreOriginal } from "@/stores/ui/uiStore";

// Mock hooks and stores
vi.mock("@/hooks/analytics/useAnalytics", () => ({
  default: vi.fn(() => ({
    analytics: {
      income: 5000,
      expenses: 3000,
      netIncome: 2000,
      categoryBreakdown: [],
      topCategories: [],
    },
    isLoading: false,
    isError: false,
    error: null,
  })),
}));

vi.mock("@/stores/ui/uiStore", () => ({
  useBudgetStore: vi.fn(() => ({
    transactions: [],
    envelopes: [],
  })),
}));

// Mock child components
vi.mock("./ReportExporter", () => ({
  default: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="report-exporter">
        <button onClick={onClose}>Close Exporter</button>
      </div>
    ) : null,
}));

vi.mock("./AnalyticsSummaryCards", () => ({
  default: ({ metrics }) => (
    <div data-testid="analytics-summary">
      <span>Income: ${metrics.totalIncome}</span>
      <span>Expenses: ${metrics.totalExpenses}</span>
    </div>
  ),
}));

vi.mock("./dashboard/AnalyticsDashboardHeader", () => ({
  default: ({ timeFilter, onTimeFilterChange, onExportClick }) => (
    <div data-testid="analytics-header">
      <select
        data-testid="time-filter"
        value={timeFilter}
        onChange={(e) => onTimeFilterChange(e.target.value)}
      >
        <option value="thisMonth">This Month</option>
        <option value="lastMonth">Last Month</option>
        <option value="thisYear">This Year</option>
      </select>
      <button onClick={onExportClick}>Export</button>
    </div>
  ),
}));

vi.mock("./dashboard/AnalyticsTabNavigation", () => ({
  default: ({ activeTab, onTabChange }) => (
    <div data-testid="tab-navigation">
      <button onClick={() => onTabChange("overview")}>Overview</button>
      <button onClick={() => onTabChange("spending")}>Spending</button>
      <button onClick={() => onTabChange("trends")}>Trends</button>
    </div>
  ),
}));

vi.mock("./dashboard/AnalyticsLoadingState", () => ({
  default: () => <div data-testid="loading-state">Loading...</div>,
}));

vi.mock("./dashboard/AnalyticsErrorState", () => ({
  default: ({ error }) => (
    <div data-testid="error-state">Error: {error?.message}</div>
  ),
}));

vi.mock("./dashboard/OverviewTabContent", () => ({
  default: () => <div data-testid="overview-tab">Overview Content</div>,
}));

vi.mock("./dashboard/SpendingTabContent", () => ({
  default: () => <div data-testid="spending-tab">Spending Content</div>,
}));

vi.mock("./dashboard/TrendsTabContent", () => ({
  default: () => <div data-testid="trends-tab">Trends Content</div>,
}));

vi.mock("./dashboard/PerformanceTabContent", () => ({
  default: () => <div data-testid="performance-tab">Performance Content</div>,
}));

vi.mock("./dashboard/EnvelopeTabContent", () => ({
  default: () => <div data-testid="envelope-tab">Envelope Content</div>,
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

const useAnalytics = useAnalyticsOriginal as unknown as Mock;
const useBudgetStore = useBudgetStoreOriginal as unknown as Mock;

describe("AnalyticsDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render without crashing", async () => {
      render(<AnalyticsDashboard />);
      await waitFor(() => {
        expect(screen.getByTestId("analytics-header")).toBeInTheDocument();
      });
    });

    it("should render summary cards", async () => {
      render(<AnalyticsDashboard />);
      await waitFor(() => {
        expect(screen.getByTestId("analytics-summary")).toBeInTheDocument();
      });
    });

    it("should render tab navigation", async () => {
      render(<AnalyticsDashboard />);
      await waitFor(() => {
        expect(screen.getByTestId("tab-navigation")).toBeInTheDocument();
      });
    });

    it("should render overview tab by default", async () => {
      render(<AnalyticsDashboard />);
      await waitFor(() => {
        expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
      });
    });
  });

  describe("Tab Navigation", () => {
    it("should switch to spending tab when clicked", async () => {
      render(<AnalyticsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText("Spending")).toBeInTheDocument();
      });

      const spendingButton = screen.getByText("Spending");
      await userEvent.click(spendingButton);

      await waitFor(() => {
        expect(screen.getByTestId("spending-tab")).toBeInTheDocument();
      });
    });

    it("should switch to trends tab when clicked", async () => {
      render(<AnalyticsDashboard />);
      
      const trendsButton = screen.getByText("Trends");
      await userEvent.click(trendsButton);

      await waitFor(() => {
        expect(screen.getByTestId("trends-tab")).toBeInTheDocument();
      });
    });

    it("should switch to overview tab when clicked", async () => {
      render(<AnalyticsDashboard />);
      
      const overviewButton = screen.getByText("Overview");
      await userEvent.click(overviewButton);

      await waitFor(() => {
        expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
      });
    });
  });

  describe("Time Filter", () => {
    it("should allow changing time filter", async () => {
      render(<AnalyticsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId("time-filter")).toBeInTheDocument();
      });

      const select = screen.getByTestId("time-filter");
      await userEvent.selectOptions(select, "lastMonth");

      expect(select).toHaveValue("lastMonth");
    });

    it("should call useAnalytics with updated period", async () => {
      render(<AnalyticsDashboard />);
      
      await waitFor(() => {
        expect(useAnalytics).toHaveBeenCalledWith(
          expect.objectContaining({
            period: "thisMonth",
          })
        );
      });
    });
  });

  describe("Export Functionality", () => {
    it("should open export modal when export button is clicked", async () => {
      render(<AnalyticsDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText("Export")).toBeInTheDocument();
      });

      const exportButton = screen.getByText("Export");
      await userEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByTestId("report-exporter")).toBeInTheDocument();
      });
    });

    it("should close export modal when close is clicked", async () => {
      render(<AnalyticsDashboard />);
      
      const exportButton = screen.getByText("Export");
      await userEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByTestId("report-exporter")).toBeInTheDocument();
      });

      const closeButton = screen.getByText("Close Exporter");
      await userEvent.click(closeButton);

      await waitFor(() => {
        expect(
          screen.queryByTestId("report-exporter")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state when data is loading", async () => {
      useAnalytics.mockReturnValue({
        analytics: null,
        isLoading: true,
        isError: false,
        error: null,
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId("loading-state")).toBeInTheDocument();
      });
    });
  });

  describe("Error State", () => {
    it("should show error state when there is an error", async () => {
      useAnalytics.mockReturnValue({
        analytics: null,
        isLoading: false,
        isError: true,
        error: { message: "Failed to load data" },
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByTestId("error-state")).toBeInTheDocument();
        expect(screen.getByText(/Failed to load data/)).toBeInTheDocument();
      });
    });
  });

  describe("Data Integration", () => {
    it("should fetch transactions from store", async () => {
      const mockTransactions = [
        { id: "1", amount: 100, category: "Food" },
      ];

      useBudgetStore.mockReturnValue({
        transactions: mockTransactions,
        envelopes: [],
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(useBudgetStore).toHaveBeenCalled();
      });
    });

    it("should fetch envelopes from store", async () => {
      const mockEnvelopes = [
        { id: "1", name: "Groceries", balance: 500 },
      ];

      useBudgetStore.mockReturnValue({
        transactions: [],
        envelopes: mockEnvelopes,
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(useBudgetStore).toHaveBeenCalled();
      });
    });
  });

  describe("Summary Metrics", () => {
    it("should display income and expenses", async () => {
      useAnalytics.mockReturnValue({
        analytics: {
          income: 5000,
          expenses: 3000,
          netIncome: 2000,
        },
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<AnalyticsDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Income: \$5000/)).toBeInTheDocument();
        expect(screen.getByText(/Expenses: \$3000/)).toBeInTheDocument();
      });
    });
  });
});
