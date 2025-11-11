import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

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

vi.mock("@/hooks/analytics/useAnalytics", () => ({
  __esModule: true,
  default: useAnalyticsMock,
}));

vi.mock("@/hooks/analytics/useAnalyticsData", () => ({
  __esModule: true,
  useAnalyticsData: useAnalyticsDataMock,
  default: useAnalyticsDataMock,
}));

vi.mock("@/hooks/common/useTransactions", () => ({
  __esModule: true,
  useTransactions: useTransactionsMock,
}));

vi.mock("@/hooks/budgeting/useEnvelopes", () => ({
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
    expect(screen.getByText(/Budget Health/i)).toBeInTheDocument();
    expect(screen.getByText(/Financial Insights/i)).toBeInTheDocument();
  });

  it("renders analytics tabs", () => {
    render(<AnalyticsDashboard />);

    expect(screen.getByRole("button", { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /spending analysis/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /trends & forecasting/i })).toBeInTheDocument();
  });

  it("shows loading state while analytics query resolves", async () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: null,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText(/Loading analytics/i)).toBeInTheDocument();
  });

  it("shows error feedback when analytics query fails", async () => {
    useAnalyticsMock.mockReturnValueOnce({
      analytics: null,
      isLoading: false,
      isError: true,
      error: new Error("Failed to load data"),
    });

    render(<AnalyticsDashboard />);

    expect(await screen.findByText(/Failed to load data/i)).toBeInTheDocument();
  });
});
