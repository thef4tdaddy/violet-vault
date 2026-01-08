import { render, screen, waitFor } from "@/test/test-utils";
import { vi, describe, it, expect, beforeEach } from "vitest";
import React from "react";
import MainDashboard from "../MainDashboard";
import { QueryClient } from "@tanstack/react-query";

// ============================================================================
// Standardized Mocking Strategy: Use @/ Aliases for EVERYTHING
// Vitest's resolver handles these most reliably across directories.
// ============================================================================

// 1. Hook Mocks
vi.mock("@/hooks/budgeting/metadata/useBudgetMetadata", () => ({
  useActualBalance: vi.fn(() => ({
    actualBalance: 1000,
    updateActualBalance: vi.fn(),
    isLoading: false,
  })),
  useUnassignedCash: vi.fn(() => ({ unassignedCash: 200, isLoading: false })),
}));

vi.mock("@/hooks/budgeting/envelopes/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [{ id: "1", name: "Groceries", currentBalance: 500 }],
    isLoading: false,
  })),
}));

vi.mock("@/hooks/common/useSavingsGoals", () => ({
  useSavingsGoals: vi.fn(() => ({
    savingsGoals: [{ id: "1", name: "Emergency Fund", currentAmount: 1000, targetAmount: 5000 }],
    isLoading: false,
  })),
}));

vi.mock("@/hooks/common/useTransactions", () => ({
  useTransactions: vi.fn(() => ({
    transactions: [{ id: "1", description: "Food", amount: -50, date: "2025-01-01" }],
    isLoading: false,
  })),
}));

vi.mock("@/hooks/budgeting/core/useBudgetData", () => ({
  default: vi.fn(() => ({
    reconcileTransaction: vi.fn(),
    paycheckHistory: [],
    isLoading: false,
    envelopesLoading: false,
    transactionsLoading: false,
    savingsGoalsLoading: false,
    dashboardLoading: false,
  })),
}));

vi.mock("@/hooks/dashboard/useMainDashboard", () => ({
  useMainDashboardUI: vi.fn(() => ({
    showReconcileModal: false,
    newTransaction: {},
    openReconcileModal: vi.fn(),
    closeReconcileModal: vi.fn(),
    updateNewTransaction: vi.fn(),
    resetNewTransaction: vi.fn(),
  })),
  useDashboardCalculations: vi.fn(() => ({
    totalEnvelopeBalance: 600,
    totalSavingsBalance: 1000,
    totalVirtualBalance: 1800,
    difference: 0,
    isBalanced: true,
  })),
  useTransactionReconciliation: vi.fn(() => ({
    handleReconcileTransaction: vi.fn(),
    handleAutoReconcileDifference: vi.fn(),
    getEnvelopeOptions: vi.fn(() => []),
  })),
  usePaydayManager: vi.fn(() => ({
    paydayPrediction: null,
    handleProcessPaycheck: vi.fn(),
    handlePrepareEnvelopes: vi.fn(),
  })),
  useDashboardHelpers: vi.fn(() => ({
    getRecentTransactions: vi.fn((transactions) => transactions || []),
    formatCurrency: (val: number) => `$${val.toFixed(2)}`,
    getTransactionIcon: () => "TrendingDown",
    getTransactionColor: () => "text-red-500",
  })),
}));

vi.mock("@/hooks/mobile/usePullToRefresh", () => ({
  default: vi.fn(() => ({
    isPulling: false,
    isRefreshing: false,
    pullProgress: 0,
    pullRotation: 0,
    isReady: false,
    touchHandlers: {},
    containerRef: { current: null },
    pullStyles: {},
  })),
}));

// 2. Component Mocks (Using @/ aliases for ALL)
// This matches the project's alias configuration which should resolve reliably.
vi.mock("@/components/budgeting/PaydayPrediction", () => ({
  default: ({ prediction }: any) =>
    prediction ? <div data-testid="payday-prediction">Prediction</div> : null,
}));

vi.mock("@/components/dashboard/AccountBalanceOverview", () => ({
  default: () => <div data-testid="account-balance-overview">Overview</div>,
}));

vi.mock("@/components/dashboard/RecentTransactionsWidget", () => ({
  default: () => <div data-testid="recent-transactions">Recent</div>,
}));

vi.mock("@/components/dashboard/ReconcileTransactionModal", () => ({
  default: ({ isOpen }: any) => (isOpen ? <div data-testid="reconcile-modal">Modal</div> : null),
}));

vi.mock("@/components/debt/ui/DebtSummaryWidget", () => ({
  default: () => <div data-testid="debt-summary-widget">Debt</div>,
}));

vi.mock("@/components/mobile/PullToRefreshIndicator", () => ({
  default: () => null,
}));

// 3. Utility Mocks
vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    dashboard: vi.fn(),
    auth: vi.fn(),
    budgetSync: vi.fn(),
  },
}));

vi.mock("@/utils/common/validation", () => ({
  validateComponentProps: vi.fn(),
}));

// ============================================================================
// Test Suite
// ============================================================================

import { useEnvelopes } from "@/hooks/budgeting/envelopes/useEnvelopes";
import { usePaydayManager } from "@/hooks/dashboard/useMainDashboard";

describe("MainDashboard (Full Alias Standardization)", () => {
  let queryClient: QueryClient;
  const mockSetActiveView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient();
  });

  const renderDashboard = () => {
    return render(<MainDashboard setActiveView={mockSetActiveView} />, {
      queryClient,
    });
  };

  it("should render main content components successfully via aliased mocks", async () => {
    renderDashboard();

    // findBy handles potential micro-ticks in React reconciliation.
    expect(await screen.findByTestId("account-balance-overview")).toBeInTheDocument();
    expect(await screen.findByTestId("recent-transactions")).toBeInTheDocument();
    expect(await screen.findByTestId("debt-summary-widget")).toBeInTheDocument();
  });

  it("should render payday prediction when manager provides it", async () => {
    vi.mocked(usePaydayManager).mockReturnValue({
      paydayPrediction: { date: "2025-01-15", amount: 3000 },
      handleProcessPaycheck: vi.fn(),
      handlePrepareEnvelopes: vi.fn(),
    } as any);

    renderDashboard();
    expect(await screen.findByTestId("payday-prediction")).toBeInTheDocument();
  });

  it("should show loading skeletons when envelopes are loading", () => {
    vi.mocked(useEnvelopes).mockReturnValue({
      envelopes: [],
      isLoading: true,
    } as any);

    const { container } = renderDashboard();
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
