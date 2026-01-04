import { render, screen, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, type Mock } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEnvelopes } from "@/hooks/budgeting/useEnvelopes";
import { useUnassignedCash, useActualBalance } from "@/hooks/budgeting/useBudgetMetadata";

// Mock all custom hooks
vi.mock("@/hooks/budgeting/useBudgetMetadata", () => ({
  useActualBalance: vi.fn(() => ({
    actualBalance: 1000,
    updateActualBalance: vi.fn(),
    isLoading: false,
  })),
  useUnassignedCash: vi.fn(() => ({
    unassignedCash: 200,
    isLoading: false,
  })),
}));

vi.mock("@/hooks/budgeting/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [
      { id: "1", name: "Groceries", balance: 500 },
      { id: "2", name: "Gas", balance: 100 },
    ],
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
    transactions: [
      { id: "1", description: "Grocery Store", amount: -50, date: "2025-01-01" },
      { id: "2", description: "Gas Station", amount: -30, date: "2025-01-02" },
    ],
    isLoading: false,
  })),
}));

vi.mock("@/hooks/budgeting/useBudgetData", () => ({
  default: vi.fn(() => ({
    reconcileTransaction: vi.fn(),
    paycheckHistory: [{ id: "1", amount: 3000, date: "2025-01-01" }],
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
    getRecentTransactions: vi.fn((transactions) => transactions.slice(0, 10)),
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

// Mock child components
vi.mock("../budgeting/PaydayPrediction", () => ({
  default: ({ prediction, onProcessPaycheck, onPrepareEnvelopes }) =>
    prediction ? (
      <div data-testid="payday-prediction">
        <span>Next Payday Prediction</span>
        <button onClick={onProcessPaycheck}>Process Paycheck</button>
        <button onClick={onPrepareEnvelopes}>Prepare Envelopes</button>
      </div>
    ) : null,
}));

vi.mock("../dashboard/AccountBalanceOverview", () => ({
  default: ({
    actualBalance,
    totalVirtualBalance,
    onUpdateBalance,
    onOpenReconcileModal,
    onAutoReconcileDifference,
  }) => (
    <div data-testid="account-balance-overview">
      <span>Actual: ${actualBalance}</span>
      <span>Virtual: ${totalVirtualBalance}</span>
      <button onClick={() => onUpdateBalance(1500)}>Update Balance</button>
      <button onClick={onOpenReconcileModal}>Reconcile</button>
      <button onClick={onAutoReconcileDifference}>Auto Reconcile</button>
    </div>
  ),
}));

vi.mock("../dashboard/RecentTransactionsWidget", () => ({
  default: ({ transactions }) => (
    <div data-testid="recent-transactions">
      <span>Recent Transactions: {transactions.length}</span>
    </div>
  ),
}));

vi.mock("../dashboard/ReconcileTransactionModal", () => ({
  default: ({ isOpen, onClose, onReconcile }) =>
    isOpen ? (
      <div data-testid="reconcile-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onReconcile}>Confirm Reconcile</button>
      </div>
    ) : null,
}));

vi.mock("../debt/ui/DebtSummaryWidget", () => ({
  default: ({ onNavigateToDebts }) => (
    <div data-testid="debt-summary-widget">
      <button onClick={onNavigateToDebts}>View Debts</button>
    </div>
  ),
}));

vi.mock("../mobile/PullToRefreshIndicator", () => ({
  default: ({ isVisible }) =>
    isVisible ? <div data-testid="pull-to-refresh">Refreshing...</div> : null,
}));

vi.mock("@/utils/common/logger", () => ({
  default: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    auth: vi.fn(),
    budgetSync: vi.fn(),
  },
}));

describe("MainDashboard", () => {
  let queryClient: QueryClient;
  const mockSetActiveView = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
  });

  const renderDashboard = (props = {}) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MainDashboard setActiveView={mockSetActiveView} {...props} />
      </QueryClientProvider>
    );
  };

  describe("Loading State", () => {
    it("should show loading skeleton when data is loading", () => {
      const useEnvelopes = require("@/hooks/budgeting/useEnvelopes").useEnvelopes as Mock;
      useEnvelopes.mockReturnValue({
        envelopes: [],
        isLoading: true,
      });

      renderDashboard();

      expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    });

    it("should show loading when unassignedCash is loading", () => {
      const useUnassignedCash = require("@/hooks/budgeting/useBudgetMetadata")
        .useUnassignedCash as Mock;
      useUnassignedCash.mockReturnValue({
        unassignedCash: 0,
        isLoading: true,
      });

      renderDashboard();

      expect(screen.queryByTestId("account-balance-overview")).not.toBeInTheDocument();
    });
  });

  describe("Data Display", () => {
    it("should render account balance overview with correct data", () => {
      renderDashboard();

      expect(screen.getByTestId("account-balance-overview")).toBeInTheDocument();
      expect(screen.getByText(/Actual: \$1000/)).toBeInTheDocument();
      expect(screen.getByText(/Virtual: \$1800/)).toBeInTheDocument();
    });

    it("should render recent transactions widget", () => {
      renderDashboard();

      expect(screen.getByTestId("recent-transactions")).toBeInTheDocument();
      expect(screen.getByText(/Recent Transactions: 2/)).toBeInTheDocument();
    });

    it("should render debt summary widget", () => {
      renderDashboard();

      expect(screen.getByTestId("debt-summary-widget")).toBeInTheDocument();
    });

    it("should not render payday prediction when none exists", () => {
      renderDashboard();

      expect(screen.queryByTestId("payday-prediction")).not.toBeInTheDocument();
    });

    it("should render payday prediction when available", () => {
      const usePaydayManager = require("@/hooks/dashboard/useMainDashboard")
        .usePaydayManager as Mock;
      usePaydayManager.mockReturnValue({
        paydayPrediction: { date: "2025-01-15", amount: 3000 },
        handleProcessPaycheck: vi.fn(),
        handlePrepareEnvelopes: vi.fn(),
      });

      renderDashboard();

      expect(screen.getByTestId("payday-prediction")).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should handle balance update", async () => {
      const mockUpdateBalance = vi.fn();
      const useActualBalance = require("@/hooks/budgeting/useBudgetMetadata")
        .useActualBalance as Mock;
      useActualBalance.mockReturnValue({
        actualBalance: 1000,
        updateActualBalance: mockUpdateBalance,
        isLoading: false,
      });

      renderDashboard();

      const updateButton = screen.getByText("Update Balance");
      await userEvent.click(updateButton);

      await waitFor(() => {
        expect(mockUpdateBalance).toHaveBeenCalledWith(1500, {
          isManual: true,
          author: "Family Member",
        });
      });
    });

    it("should open reconcile modal", async () => {
      const mockOpenReconcileModal = vi.fn();
      const useMainDashboardUI = require("@/hooks/dashboard/useMainDashboard")
        .useMainDashboardUI as Mock;
      useMainDashboardUI.mockReturnValue({
        showReconcileModal: false,
        newTransaction: {},
        openReconcileModal: mockOpenReconcileModal,
        closeReconcileModal: vi.fn(),
        updateNewTransaction: vi.fn(),
        resetNewTransaction: vi.fn(),
      });

      renderDashboard();

      const reconcileButton = screen.getByText("Reconcile");
      await userEvent.click(reconcileButton);

      expect(mockOpenReconcileModal).toHaveBeenCalled();
    });

    it("should handle auto reconcile difference", async () => {
      const mockAutoReconcile = vi.fn();
      const useTransactionReconciliation = require("@/hooks/dashboard/useMainDashboard")
        .useTransactionReconciliation as Mock;
      useTransactionReconciliation.mockReturnValue({
        handleReconcileTransaction: vi.fn(),
        handleAutoReconcileDifference: mockAutoReconcile,
        getEnvelopeOptions: vi.fn(() => []),
      });

      renderDashboard();

      const autoReconcileButton = screen.getByText("Auto Reconcile");
      await userEvent.click(autoReconcileButton);

      expect(mockAutoReconcile).toHaveBeenCalled();
    });

    it("should navigate to debts view", async () => {
      renderDashboard();

      const viewDebtsButton = screen.getByText("View Debts");
      await userEvent.click(viewDebtsButton);

      expect(mockSetActiveView).toHaveBeenCalledWith("debts");
    });
  });

  describe("Modal Interactions", () => {
    it("should show reconcile modal when open", () => {
      const useMainDashboardUI = require("@/hooks/dashboard/useMainDashboard")
        .useMainDashboardUI as Mock;
      useMainDashboardUI.mockReturnValue({
        showReconcileModal: true,
        newTransaction: {},
        openReconcileModal: vi.fn(),
        closeReconcileModal: vi.fn(),
        updateNewTransaction: vi.fn(),
        resetNewTransaction: vi.fn(),
      });

      renderDashboard();

      expect(screen.getByTestId("reconcile-modal")).toBeInTheDocument();
    });

    it("should close reconcile modal", async () => {
      const mockCloseModal = vi.fn();
      const useMainDashboardUI = require("@/hooks/dashboard/useMainDashboard")
        .useMainDashboardUI as Mock;
      useMainDashboardUI.mockReturnValue({
        showReconcileModal: true,
        newTransaction: {},
        openReconcileModal: vi.fn(),
        closeReconcileModal: mockCloseModal,
        updateNewTransaction: vi.fn(),
        resetNewTransaction: vi.fn(),
      });

      renderDashboard();

      const closeButton = screen.getByText("Close");
      await userEvent.click(closeButton);

      expect(mockCloseModal).toHaveBeenCalled();
    });

    it("should handle reconcile transaction submission", async () => {
      const mockReconcile = vi.fn();
      const mockReset = vi.fn();
      const mockClose = vi.fn();

      const useMainDashboardUI = require("@/hooks/dashboard/useMainDashboard")
        .useMainDashboardUI as Mock;
      useMainDashboardUI.mockReturnValue({
        showReconcileModal: true,
        newTransaction: { description: "Test", amount: 50 },
        openReconcileModal: vi.fn(),
        closeReconcileModal: mockClose,
        updateNewTransaction: vi.fn(),
        resetNewTransaction: mockReset,
      });

      const useTransactionReconciliation = require("@/hooks/dashboard/useMainDashboard")
        .useTransactionReconciliation as Mock;
      useTransactionReconciliation.mockReturnValue({
        handleReconcileTransaction: mockReconcile,
        handleAutoReconcileDifference: vi.fn(),
        getEnvelopeOptions: vi.fn(() => []),
      });

      renderDashboard();

      const confirmButton = screen.getByText("Confirm Reconcile");
      await userEvent.click(confirmButton);

      expect(mockReconcile).toHaveBeenCalled();
    });
  });

  describe("Payday Management", () => {
    it("should handle process paycheck", async () => {
      const mockProcessPaycheck = vi.fn();
      const usePaydayManager = require("@/hooks/dashboard/useMainDashboard")
        .usePaydayManager as Mock;
      usePaydayManager.mockReturnValue({
        paydayPrediction: { date: "2025-01-15", amount: 3000 },
        handleProcessPaycheck: mockProcessPaycheck,
        handlePrepareEnvelopes: vi.fn(),
      });

      renderDashboard();

      const processButton = screen.getByText("Process Paycheck");
      await userEvent.click(processButton);

      expect(mockProcessPaycheck).toHaveBeenCalled();
    });

    it("should handle prepare envelopes", async () => {
      const mockPrepareEnvelopes = vi.fn();
      const usePaydayManager = require("@/hooks/dashboard/useMainDashboard")
        .usePaydayManager as Mock;
      usePaydayManager.mockReturnValue({
        paydayPrediction: { date: "2025-01-15", amount: 3000 },
        handleProcessPaycheck: vi.fn(),
        handlePrepareEnvelopes: mockPrepareEnvelopes,
      });

      renderDashboard();

      const prepareButton = screen.getByText("Prepare Envelopes");
      await userEvent.click(prepareButton);

      expect(mockPrepareEnvelopes).toHaveBeenCalled();
    });
  });

  describe("Empty States", () => {
    it("should handle empty envelopes array", () => {
      const useEnvelopes = require("@/hooks/budgeting/useEnvelopes").useEnvelopes as Mock;
      useEnvelopes.mockReturnValue({
        envelopes: [],
        isLoading: false,
      });

      renderDashboard();

      expect(screen.getByTestId("account-balance-overview")).toBeInTheDocument();
    });

    it("should handle empty transactions array", () => {
      const useTransactions = require("@/hooks/common/useTransactions").useTransactions as Mock;
      useTransactions.mockReturnValue({
        transactions: [],
        isLoading: false,
      });

      renderDashboard();

      expect(screen.getByText(/Recent Transactions: 0/)).toBeInTheDocument();
    });

    it("should handle empty savings goals", () => {
      const useSavingsGoals = require("@/hooks/common/useSavingsGoals").useSavingsGoals as Mock;
      useSavingsGoals.mockReturnValue({
        savingsGoals: [],
        isLoading: false,
      });

      renderDashboard();

      // Component should still render without errors
      expect(screen.getByTestId("account-balance-overview")).toBeInTheDocument();
    });
  });

  describe("Pull-to-Refresh", () => {
    it("should not show refresh indicator by default", () => {
      renderDashboard();

      expect(screen.queryByTestId("pull-to-refresh")).not.toBeInTheDocument();
    });

    it("should show refresh indicator when pulling", () => {
      const usePullToRefresh = require("@/hooks/mobile/usePullToRefresh").default as Mock;
      usePullToRefresh.mockReturnValue({
        isPulling: true,
        isRefreshing: false,
        pullProgress: 50,
        pullRotation: 180,
        isReady: false,
        touchHandlers: {},
        containerRef: { current: null },
        pullStyles: {},
      });

      renderDashboard();

      expect(screen.getByTestId("pull-to-refresh")).toBeInTheDocument();
    });

    it("should show refresh indicator when refreshing", () => {
      const usePullToRefresh = require("@/hooks/mobile/usePullToRefresh").default as Mock;
      usePullToRefresh.mockReturnValue({
        isPulling: false,
        isRefreshing: true,
        pullProgress: 100,
        pullRotation: 360,
        isReady: true,
        touchHandlers: {},
        containerRef: { current: null },
        pullStyles: {},
      });

      renderDashboard();

      expect(screen.getByTestId("pull-to-refresh")).toBeInTheDocument();
    });
  });
});
