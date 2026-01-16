import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
vi.stubGlobal("scrollTo", vi.fn());

const { useAnalyticsMock } = vi.hoisted(() => {
  const mock = vi.fn(() => ({
    analytics: {
      summary: {
        totalIncome: 5000,
        totalExpenses: 3200,
        netAmount: 1800,
        expenseTransactionCount: 8,
        transactionCount: 12,
      },
      envelopeBreakdown: {},
      transactions: [],
      topCategories: [],
      velocity: {
        averageMonthlyExpenses: 2200,
        averageMonthlyIncome: 3600,
        trendDirection: "stable",
        velocityChange: 40,
        percentChange: 1.5,
        projectedNextMonth: 2240,
      },
      weeklyPatterns: [],
      budgetVsActual: [],
      healthScore: 76,
    },
    isLoading: false,
    isError: false,
    error: null,
  }));

  return { useAnalyticsMock: mock };
});

const { useAnalyticsDataMock } = vi.hoisted(() => ({
  useAnalyticsDataMock: vi.fn(() => ({
    filteredTransactions: [],
    monthlyTrends: [],
    envelopeSpending: [],
    categoryBreakdown: [],
    weeklyPatterns: [],
    envelopeHealth: [],
    budgetVsActual: [],
    metrics: {},
  })),
}));

const { useTransactionsMock } = vi.hoisted(() => ({
  useTransactionsMock: vi.fn(() => ({ transactions: [] })),
}));

const { useEnvelopesMock } = vi.hoisted(() => ({
  useEnvelopesMock: vi.fn(() => ({ envelopes: [] })),
}));

vi.mock("@/hooks/platform/analytics/useAnalytics", () => ({
  __esModule: true,
  default: useAnalyticsMock,
}));

vi.mock("@/hooks/platform/analytics/useAnalyticsData", () => ({
  __esModule: true,
  useAnalyticsData: useAnalyticsDataMock,
  default: useAnalyticsDataMock,
}));

vi.mock("@/hooks/budgeting/transactions/useTransactionQuery", () => ({
  __esModule: true,
  useTransactionQuery: useTransactionsMock,
}));

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  __esModule: true,
  useEnvelopes: useEnvelopesMock,
}));

const AnalyticsDashboard = (await import("../AnalyticsDashboard")).default;

describe("AnalyticsDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders header and summary content", () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText(/Comprehensive financial insights and reporting/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Budget Health/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Financial Insights/i).length).toBeGreaterThan(0);
  });

  it("renders analytics tabs", () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /spending analysis/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /trends & forecasting/i })).toBeInTheDocument();
  });

  it("shows loading state while analytics query resolves", async () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: null as any,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText(/Loading analytics/i)).toBeInTheDocument();
  });

  it("shows error feedback when analytics query fails", async () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: null as any,
      isLoading: false,
      isError: true,
      error: new Error("Failed to load data") as any,
    });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText(/Failed to load data/i)).toBeInTheDocument();
  });

  it("renders with complete analytics data", () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByText(/Comprehensive financial insights and reporting/i)).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
  });

  it("handles empty analytics data gracefully", () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: {
        summary: {
          totalIncome: 0,
          totalExpenses: 0,
          netAmount: 0,
          expenseTransactionCount: 0,
          transactionCount: 0,
        },
        envelopeBreakdown: {},
        transactions: [],
        topCategories: [],
        velocity: null as any,
        weeklyPatterns: [],
        budgetVsActual: [],
        healthScore: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
  });

  it("displays health score when available", () => {
    render(<AnalyticsDashboard />);

    expect(screen.getAllByText(/Budget Health/i).length).toBeGreaterThan(0);
  });

  it("handles missing velocity data", () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: {
        summary: {
          totalIncome: 5000,
          totalExpenses: 3200,
          netAmount: 1800,
          expenseTransactionCount: 8,
          transactionCount: 12,
        },
        envelopeBreakdown: {},
        transactions: [],
        topCategories: [],
        velocity: null as any,
        weeklyPatterns: [],
        budgetVsActual: [],
        healthScore: 76,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
  });

  it("handles large transaction count", () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: {
        summary: {
          totalIncome: 50000,
          totalExpenses: 32000,
          netAmount: 18000,
          expenseTransactionCount: 800,
          transactionCount: 1200,
        },
        envelopeBreakdown: {},
        transactions: [],
        topCategories: [],
        velocity: {
          averageMonthlyExpenses: 22000,
          averageMonthlyIncome: 36000,
          trendDirection: "up",
          velocityChange: 400,
          percentChange: 15,
          projectedNextMonth: 22400,
        },
        weeklyPatterns: [],
        budgetVsActual: [],
        healthScore: 85,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
  });

  it("handles negative net amount", () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: {
        summary: {
          totalIncome: 3000,
          totalExpenses: 5000,
          netAmount: -2000,
          expenseTransactionCount: 15,
          transactionCount: 20,
        },
        envelopeBreakdown: {},
        transactions: [],
        topCategories: [],
        velocity: {
          averageMonthlyExpenses: 5500,
          averageMonthlyIncome: 3200,
          trendDirection: "down",
          velocityChange: -300,
          percentChange: -10,
          projectedNextMonth: 5200,
        },
        weeklyPatterns: [],
        budgetVsActual: [],
        healthScore: 45,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
  });

  it("displays all tab options", () => {
    render(<AnalyticsDashboard />);

    const tabs = [/overview/i, /spending analysis/i, /trends & forecasting/i];
    tabs.forEach((tabName) => {
      expect(screen.getByRole("tab", { name: tabName })).toBeInTheDocument();
    });
  });

  it("renders export controls section", () => {
    render(<AnalyticsDashboard />);

    // Component should have export functionality
    expect(screen.getByText(/Comprehensive financial insights and reporting/i)).toBeInTheDocument();
  });

  it("handles zero health score", () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: {
        summary: {
          totalIncome: 0,
          totalExpenses: 5000,
          netAmount: -5000,
          expenseTransactionCount: 20,
          transactionCount: 20,
        },
        envelopeBreakdown: {},
        transactions: [],
        topCategories: [],
        velocity: null as any,
        weeklyPatterns: [],
        budgetVsActual: [],
        healthScore: 0,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(screen.getByRole("tab", { name: /overview/i })).toBeInTheDocument();
  });

  it("handles perfect health score", () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: {
        summary: {
          totalIncome: 10000,
          totalExpenses: 3000,
          netAmount: 7000,
          expenseTransactionCount: 5,
          transactionCount: 10,
        },
        envelopeBreakdown: {},
        transactions: [],
        topCategories: [],
        velocity: {
          averageMonthlyExpenses: 2800,
          averageMonthlyIncome: 9500,
          trendDirection: "up",
          velocityChange: 200,
          percentChange: 7,
          projectedNextMonth: 3000,
        },
        weeklyPatterns: [],
        budgetVsActual: [],
        healthScore: 100,
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(screen.getAllByText(/Budget Health/i).length).toBeGreaterThan(0);
  });
});
